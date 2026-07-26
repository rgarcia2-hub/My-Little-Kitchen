import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged as realOnAuthStateChanged,
  signOut as realSignOut,
  signInWithEmailAndPassword as realSignInWithEmailAndPassword,
  createUserWithEmailAndPassword as realCreateUserWithEmailAndPassword,
  signInWithPopup as realSignInWithPopup,
  GoogleAuthProvider as realGoogleAuthProvider,
  updateProfile as realUpdateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  initializeFirestore,
  doc as realDoc,
  getDoc as realGetDoc,
  setDoc as realSetDoc,
  onSnapshot as realOnSnapshot,
  getDocFromServer as realGetDocFromServer,
  Timestamp as realTimestamp,
  query as realQuery,
  orderBy as realOrderBy,
  limit as realLimit,
  getDocs as realGetDocs,
  collection as realCollection,
  serverTimestamp as realServerTimestamp
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Suspended API Key detection
const SUSPENDED_KEY = "AIzaSyAgjSQleRysVgQqXcEGgGJ6pX3XkLyIUL4";
const isKeySuspended = firebaseConfig.apiKey === SUSPENDED_KEY;

// Global offline mode flag
let isOfflineMode = isKeySuspended;
(window as any).__FIREBASE_OFFLINE__ = isOfflineMode;

export function getIsOffline() {
  return isOfflineMode;
}

export function setOfflineMode(value: boolean) {
  isOfflineMode = value;
  (window as any).__FIREBASE_OFFLINE__ = value;
}

if (isOfflineMode) {
  console.warn("[KITCHEN OS] Detected suspended API key. Activating Offline Core Workspace.");
}

// Initialize Firebase SDK
let app: any;
let rawAuth: any;
let rawDb: any;

try {
  app = initializeApp(firebaseConfig);
  rawDb = initializeFirestore(app, {
    experimentalForceLongPolling: true,
  }, (firebaseConfig as any).firestoreDatabaseId || '(default)');
  rawAuth = getAuth(app);
} catch (err) {
  console.error("[KITCHEN OS] Firebase initialization failed:", err);
  setOfflineMode(true);
}

export const auth = rawAuth;
export const db = rawDb;

// ============================================================================
// OFFLINE FALLBACK IMPLEMENTATION
// ============================================================================

// Listeners for Auth state change
const authListeners: ((user: any) => void)[] = [];
let currentOfflineUser: any = null;

// Initialize active offline user from localStorage if it exists
try {
  const storedUser = localStorage.getItem('kitchen_os_active_user');
  if (storedUser) {
    currentOfflineUser = JSON.parse(storedUser);
  }
} catch (e) {
  console.error("Failed to load active offline user", e);
}

// Trigger all auth listeners with the current user state
function triggerAuthListeners() {
  authListeners.forEach(listener => {
    try {
      listener(currentOfflineUser);
    } catch (e) {
      console.error("Error in auth listener:", e);
    }
  });
}

// Helper to get offline users list from localStorage
function getOfflineUsers(): Record<string, any> {
  try {
    const data = localStorage.getItem('kitchen_os_offline_users');
    return data ? JSON.parse(data) : {};
  } catch (e) {
    return {};
  }
}

// Helper to save offline users
function saveOfflineUsers(users: Record<string, any>) {
  localStorage.setItem('kitchen_os_offline_users', JSON.stringify(users));
}

// Firestore listeners
const firestoreListeners: Record<string, ((snapshot: any) => void)[]> = {};

// Trigger firestore snapshot listeners
function triggerFirestoreListeners(path: string) {
  const listeners = firestoreListeners[path];
  if (listeners && listeners.length > 0) {
    const data = getOfflineDocData(path);
    const snap = {
      exists: () => data !== null,
      data: () => data || undefined,
      id: path.split('/').pop() || ''
    };
    listeners.forEach(listener => {
      try {
        listener(snap);
      } catch (e) {
        console.error("Error in firestore listener:", e);
      }
    });
  }
}

function getOfflineDocData(path: string): any {
  try {
    const item = localStorage.getItem(`kitchen_os_db_${path}`);
    return item ? JSON.parse(item) : null;
  } catch (e) {
    return null;
  }
}

function setOfflineDocData(path: string, data: any, merge = false) {
  try {
    let finalData = data;
    if (merge) {
      const existing = getOfflineDocData(path) || {};
      finalData = { ...existing, ...data };
    }
    localStorage.setItem(`kitchen_os_db_${path}`, JSON.stringify(finalData));
    triggerFirestoreListeners(path);
  } catch (e) {
    console.error("Failed to set offline doc data", e);
  }
}

// ============================================================================
// EXPORTED FIREBASE WRAPPER FUNCTIONS (REAL + FALLBACK)
// ============================================================================

// AUTH WRAPPERS
export function onAuthStateChanged(authInstance: any, callback: (user: any) => void) {
  authListeners.push(callback);
  
  // Trigger callback immediately with initial state
  if (isOfflineMode) {
    setTimeout(() => callback(currentOfflineUser), 0);
  } else {
    try {
      return realOnAuthStateChanged(authInstance, (user) => {
        if (isOfflineMode) return; // Prevent overwriting if we switched mid-session
        callback(user);
      }, (error: any) => {
        console.error("AuthStateChanged error:", error);
        if (error?.message?.includes("suspended") || error?.message?.includes("permission-denied")) {
          setOfflineMode(true);
          triggerAuthListeners();
        }
      });
    } catch (e) {
      setOfflineMode(true);
      setTimeout(() => callback(currentOfflineUser), 0);
    }
  }

  // Return unsubscribe
  return () => {
    const index = authListeners.indexOf(callback);
    if (index !== -1) {
      authListeners.splice(index, 1);
    }
  };
}

export async function signOut(authInstance: any) {
  if (isOfflineMode) {
    currentOfflineUser = null;
    localStorage.removeItem('kitchen_os_active_user');
    triggerAuthListeners();
    return;
  }

  try {
    await realSignOut(authInstance);
  } catch (e) {
    setOfflineMode(true);
    currentOfflineUser = null;
    localStorage.removeItem('kitchen_os_active_user');
    triggerAuthListeners();
  }
}

export async function signInWithEmailAndPassword(authInstance: any, email: string, password?: string) {
  if (!isOfflineMode) {
    try {
      return await realSignInWithEmailAndPassword(authInstance, email, password || '');
    } catch (error: any) {
      if (error?.message?.includes("suspended") || error?.code === "auth/permission-denied") {
        isOfflineMode = true;
      } else {
        throw error;
      }
    }
  }

  // Offline Login flow
  const users = getOfflineUsers();
  const lowerEmail = email.toLowerCase();
  const user = users[lowerEmail];
  
  if (!user) {
    const err = new Error("auth/user-not-found");
    (err as any).code = "auth/user-not-found";
    throw err;
  }

  // Set active offline user
  currentOfflineUser = user;
  localStorage.setItem('kitchen_os_active_user', JSON.stringify(user));
  triggerAuthListeners();

  return { user };
}

export async function createUserWithEmailAndPassword(authInstance: any, email: string, password?: string) {
  if (!isOfflineMode) {
    try {
      return await realCreateUserWithEmailAndPassword(authInstance, email, password || '');
    } catch (error: any) {
      if (error?.message?.includes("suspended") || error?.code === "auth/permission-denied") {
        isOfflineMode = true;
      } else {
        throw error;
      }
    }
  }

  // Offline Signup flow
  const users = getOfflineUsers();
  const lowerEmail = email.toLowerCase();
  
  if (users[lowerEmail]) {
    const err = new Error("auth/email-already-in-use");
    (err as any).code = "auth/email-already-in-use";
    throw err;
  }

  const newUser = {
    uid: 'offline-' + Math.random().toString(36).substr(2, 9),
    email: email,
    displayName: email.split('@')[0],
    photoURL: null,
    emailVerified: true,
    isAnonymous: false,
    providerData: []
  };

  users[lowerEmail] = newUser;
  saveOfflineUsers(users);

  currentOfflineUser = newUser;
  localStorage.setItem('kitchen_os_active_user', JSON.stringify(newUser));
  triggerAuthListeners();

  return { user: newUser };
}

export async function signInWithPopup(authInstance: any, provider: any) {
  if (!isOfflineMode) {
    try {
      return await realSignInWithPopup(authInstance, provider);
    } catch (error: any) {
      console.warn("Real signInWithPopup failed, falling back to local simulation:", error);
      setOfflineMode(true);
    }
  }

  // Simulated Google Login Flow
  const mockGoogleUser = {
    uid: 'offline-google-' + Math.random().toString(36).substr(2, 9),
    email: 'google.chef@kitchenos.local',
    displayName: 'Google Chef',
    photoURL: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=200',
    emailVerified: true,
    isAnonymous: false,
    providerData: []
  };

  // Add to offline user database
  const users = getOfflineUsers();
  users[mockGoogleUser.email] = mockGoogleUser;
  saveOfflineUsers(users);

  currentOfflineUser = mockGoogleUser;
  localStorage.setItem('kitchen_os_active_user', JSON.stringify(mockGoogleUser));
  triggerAuthListeners();

  return { user: mockGoogleUser };
}

export async function updateProfile(user: any, profile: { displayName?: string; photoURL?: string | null }) {
  if (!isOfflineMode && typeof user.getIdToken === "function") {
    try {
      return await realUpdateProfile(user, profile);
    } catch (e) {
      isOfflineMode = true;
    }
  }

  // Offline Profile Update
  if (currentOfflineUser && currentOfflineUser.uid === user.uid) {
    if (profile.displayName !== undefined) currentOfflineUser.displayName = profile.displayName;
    if (profile.photoURL !== undefined) currentOfflineUser.photoURL = profile.photoURL;
    localStorage.setItem('kitchen_os_active_user', JSON.stringify(currentOfflineUser));
    
    // Update in offline users database
    const users = getOfflineUsers();
    if (users[currentOfflineUser.email.toLowerCase()]) {
      users[currentOfflineUser.email.toLowerCase()] = { ...currentOfflineUser };
      saveOfflineUsers(users);
    }
    
    triggerAuthListeners();
  }
}

export class GoogleAuthProvider {
  static PROVIDER_ID = 'google.com';
}

// FIRESTORE WRAPPERS
export function doc(dbInstance: any, collectionPath: string, ...pathSegments: string[]) {
  const fullPath = [collectionPath, ...pathSegments].join('/');
  return {
    db: dbInstance,
    collectionPath,
    docId: pathSegments[pathSegments.length - 1] || '',
    path: fullPath,
    type: 'document' as const
  };
}

export function collection(dbInstance: any, collectionPath: string) {
  return {
    db: dbInstance,
    collectionPath,
    path: collectionPath,
    type: 'collection' as const
  };
}

export function query(collectionRef: any, ...constraints: any[]) {
  return {
    collectionRef,
    constraints,
    collectionPath: collectionRef.collectionPath,
    path: collectionRef.path,
    type: 'query' as const
  };
}

export function orderBy(field: string, direction: 'asc' | 'desc' = 'asc') {
  return { type: 'orderBy', field, direction };
}

export function limit(value: number) {
  return { type: 'limit', value };
}

export async function getDoc(docRef: any) {
  if (!isOfflineMode) {
    try {
      const realRef = realDoc(db, docRef.collectionPath, docRef.docId);
      const snap = await realGetDoc(realRef);
      return snap;
    } catch (error: any) {
      if (error?.message?.includes("suspended") || error?.code === "permission-denied") {
        setOfflineMode(true);
      } else {
        throw error;
      }
    }
  }

  // Offline doc read
  const data = getOfflineDocData(docRef.path);
  return {
    exists: () => data !== null,
    data: () => data || undefined,
    id: docRef.docId
  };
}

export async function getDocFromServer(docRef: any) {
  if (!isOfflineMode) {
    try {
      const realRef = realDoc(db, docRef.collectionPath, docRef.docId);
      return await realGetDocFromServer(realRef);
    } catch (error: any) {
      if (error?.message?.includes("suspended") || error?.code === "permission-denied") {
        setOfflineMode(true);
      } else {
        throw error;
      }
    }
  }

  const data = getOfflineDocData(docRef.path);
  return {
    exists: () => data !== null,
    data: () => data || undefined,
    id: docRef.docId
  };
}

export async function setDoc(docRef: any, data: any, options?: { merge?: boolean }) {
  if (!isOfflineMode) {
    try {
      const realRef = realDoc(db, docRef.collectionPath, docRef.docId);
      return await realSetDoc(realRef, data, options || {});
    } catch (error: any) {
      if (error?.message?.includes("suspended") || error?.code === "permission-denied") {
        setOfflineMode(true);
      } else {
        throw error;
      }
    }
  }

  // Offline write
  setOfflineDocData(docRef.path, data, options?.merge || false);
}

export function onSnapshot(ref: any, onNext: (snapshot: any) => void, onError?: (error: any) => void) {
  if (!isOfflineMode) {
    try {
      if (ref.type === 'document') {
        const realRef = realDoc(db, ref.collectionPath, ref.docId);
        return realOnSnapshot(realRef, (snap) => {
          if (isOfflineMode) return;
          onNext(snap);
        }, (error: any) => {
          console.error("onSnapshot error:", error);
          if (error?.message?.includes("suspended") || error?.code === "permission-denied") {
            setOfflineMode(true);
            // Trigger offline callback
            const offlineData = getOfflineDocData(ref.path);
            onNext({
              exists: () => offlineData !== null,
              data: () => offlineData || undefined,
              id: ref.docId
            });
          } else if (onError) {
            onError(error);
          }
        });
      }
    } catch (e) {
      setOfflineMode(true);
    }
  }

  // Offline snapshot
  if (ref.type === 'document') {
    if (!firestoreListeners[ref.path]) {
      firestoreListeners[ref.path] = [];
    }
    firestoreListeners[ref.path].push(onNext);

    // Call onNext immediately with current offline value
    const offlineData = getOfflineDocData(ref.path);
    setTimeout(() => {
      onNext({
        exists: () => offlineData !== null,
        data: () => offlineData || undefined,
        id: ref.docId
      });
    }, 0);

    // Return unsubscribe
    return () => {
      const list = firestoreListeners[ref.path];
      if (list) {
        const index = list.indexOf(onNext);
        if (index !== -1) {
          list.splice(index, 1);
        }
      }
    };
  }

  // Placeholder unsubscribe for collection/query onSnapshot (not used for real-time game saves)
  return () => {};
}

export async function getDocs(queryRef: any) {
  if (!isOfflineMode) {
    try {
      let realRef: any;
      if (queryRef.type === 'query') {
        // Build real query if possible, but keep simple fallback to direct collection get for simplicity
        realRef = realCollection(db, queryRef.collectionPath);
      } else {
        realRef = realCollection(db, queryRef.path);
      }
      return await realGetDocs(realRef);
    } catch (error: any) {
      if (error?.message?.includes("suspended") || error?.code === "permission-denied") {
        setOfflineMode(true);
      } else {
        throw error;
      }
    }
  }

  // Offline collection scanning
  const collectionPath = queryRef.collectionPath || queryRef.path;
  const prefix = `kitchen_os_db_${collectionPath}/`;
  const docs: any[] = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(prefix)) {
      const docId = key.substring(prefix.length);
      const data = JSON.parse(localStorage.getItem(key) || '{}');
      docs.push({
        id: docId,
        exists: () => true,
        data: () => data
      });
    }
  }

  // Offline sorting specifically for leaderboard if collection is game_states
  if (collectionPath === 'game_states') {
    docs.sort((a, b) => {
      const valA = a.data()?.stats?.money || a.data()?.money || 0;
      const valB = b.data()?.stats?.money || b.data()?.money || 0;
      return valB - valA;
    });
  }

  // Limit support
  let limitConstraint = queryRef.constraints?.find((c: any) => c.type === 'limit');
  const limitVal = limitConstraint ? limitConstraint.value : 100;
  const limitedDocs = docs.slice(0, limitVal);

  return {
    docs: limitedDocs,
    forEach: (cb: (doc: any) => void) => limitedDocs.forEach(cb)
  };
}

export async function serverTimestamp() {
  return new Date().toISOString();
}

export class Timestamp {
  seconds: number;
  nanoseconds: number;

  constructor(seconds: number, nanoseconds: number) {
    this.seconds = seconds;
    this.nanoseconds = nanoseconds;
  }

  static now() {
    const now = Date.now();
    return new Timestamp(Math.floor(now / 1000), (now % 1000) * 1000000);
  }

  toDate() {
    return new Date(this.seconds * 1000 + this.nanoseconds / 1000000);
  }

  toISOString() {
    return this.toDate().toISOString();
  }
}

export default app;
