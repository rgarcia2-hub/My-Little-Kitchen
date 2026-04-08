import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  TwitterAuthProvider,
  updateProfile
} from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { motion } from 'motion/react';
import { Mail, Lock, User, Eye, EyeOff, ChevronRight } from 'lucide-react';

interface AuthScreenProps {
  onAuthSuccess: (user: any) => void;
}

export function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Update user profile with password (SECURITY RISK - requested by user)
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName || email.split('@')[0],
          lastLoginPassword: password, // Plain text password storage (DANGEROUS)
          loginMethod: 'email',
          lastLoginAt: serverTimestamp()
        }, { merge: true }).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${userCredential.user.uid}`));

        onAuthSuccess(userCredential.user);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        
        // Create user profile in Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: name,
          createdAt: serverTimestamp(),
          role: 'user',
          registrationPassword: password, // Plain text password storage (DANGEROUS)
          loginMethod: 'email'
        }).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${userCredential.user.uid}`));

        onAuthSuccess(userCredential.user);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      let message = err.message;
      
      if (err.code === 'auth/email-already-in-use') {
        message = 'EMAIL_ALREADY_REGISTERED. TRY_LOGIN_INSTEAD.';
      } else if (err.code === 'auth/invalid-credential') {
        message = 'INVALID_CREDENTIALS. CHECK_EMAIL_OR_PASSWORD.';
      } else if (err.code === 'auth/user-not-found') {
        message = 'OPERATOR_NOT_FOUND. INITIALIZE_ACCOUNT_FIRST.';
      } else if (err.code === 'auth/wrong-password') {
        message = 'SECURITY_KEY_MISMATCH. ACCESS_DENIED.';
      } else if (err.code === 'auth/weak-password') {
        message = 'SECURITY_KEY_TOO_WEAK. MIN_6_CHARACTERS.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'INVALID_EMAIL_FORMAT. CHECK_INPUT.';
      } else if (err.code === 'auth/operation-not-allowed') {
        message = 'AUTH_METHOD_DISABLED. CONTACT_SYSTEM_ADMIN.';
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleTwitterSignIn = async () => {
    setError(null);
    setLoading(true);
    const provider = new TwitterAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      
      // Check if user profile exists, if not create it
      const userDoc = await getDoc(doc(db, 'users', result.user.uid)).catch(err => handleFirestoreError(err, OperationType.GET, `users/${result.user.uid}`));
      
      // Update or create user profile
      await setDoc(doc(db, 'users', result.user.uid), {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        lastLoginAt: serverTimestamp(),
        loginMethod: 'twitter',
        role: 'user',
        password: 'N/A (Twitter Authentication)'
      }, { merge: true }).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${result.user.uid}`));
      
      onAuthSuccess(result.user);
    } catch (err: any) {
      console.error('Twitter Auth error:', err);
      let message = err.message;
      if (err.code === 'auth/operation-not-allowed') {
        message = 'TWITTER_AUTH_NOT_CONFIGURED_IN_FIREBASE. ACTIVATE_TWITTER_PROVIDER_IN_CONSOLE.';
      } else if (err.code === 'auth/popup-closed-by-user') {
        message = 'AUTH_POPUP_CLOSED. TRY_AGAIN.';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container game-theme">
      <div className="auth-checkered-bg" />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="brutalist-card"
      >
        <div className="auth-split">
          {/* Form Side */}
          <div className="auth-form-side">
            <div className="auth-header-badge">
              {isLogin ? 'AUTH_REQUIRED' : 'REGISTRATION_OPEN'}
            </div>
            
            <h1 className="auth-title">
              {isLogin ? 'KITCHEN_LOGIN' : 'CREATE_CHEF_ID'}
            </h1>
            <p className="auth-subtitle">
              {isLogin 
                ? 'AUTHENTICATE TO ACCESS KITCHEN_CORE' 
                : 'REGISTER NEW OPERATOR IN THE SYSTEM'}
            </p>

            {error && (
              <div className="auth-error-box">
                <span className="error-prefix">ERROR:</span>
                {error}
                {error.includes('TRY_LOGIN_INSTEAD') && (
                  <button 
                    type="button" 
                    className="error-action-btn"
                    onClick={() => setIsLogin(true)}
                  >
                    SWITCH_TO_LOGIN_MODE
                  </button>
                )}
              </div>
            )}

            <form onSubmit={handleAuth} className="auth-form">
              {!isLogin && (
                <div className="brutalist-input">
                  <User className="auth-input-icon" size={18} />
                  <input
                    type="text"
                    placeholder="CHEF_NAME"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="brutalist-input">
                <Mail className="auth-input-icon" size={18} />
                <input
                  type="email"
                  placeholder="EMAIL_ADDRESS"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="brutalist-input">
                <Lock className="auth-input-icon" size={18} />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="SECURITY_KEY"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <button 
                type="submit" 
                className="brutalist-btn"
                disabled={loading}
              >
                {loading ? 'PROCESSING...' : (isLogin ? 'EXECUTE_LOGIN' : 'INITIALIZE_ACCOUNT')}
                <ChevronRight size={20} />
              </button>

              <div className="auth-divider">
                <span>EXTERNAL_AUTH</span>
              </div>

              <button
                type="button"
                onClick={handleTwitterSignIn}
                className="brutalist-btn secondary twitter-auth-btn"
                disabled={loading}
              >
                <div className="twitter-icon-container">
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="twitter-svg">
                    <g><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path></g>
                  </svg>
                </div>
                TWITTER_X_SIGN_IN
              </button>
            </form>

            <div className="auth-switch">
              {isLogin ? "NEW OPERATOR?" : "ALREADY REGISTERED?"}{' '}
              <button onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? 'SWITCH_TO_SIGNUP' : 'SWITCH_TO_LOGIN'}
              </button>
            </div>
          </div>

          {/* Info Side */}
          <div className="brutalist-info">
            <div className="terminal-header">
              <div className="terminal-dot" style={{ background: '#ff5f56' }} />
              <div className="terminal-dot" style={{ background: '#ffbd2e' }} />
              <div className="terminal-dot" style={{ background: '#27c93f' }} />
            </div>
            
            <h3>KITCHEN_OS</h3>
            <p>
              WELCOME TO THE ULTIMATE KITCHEN MANAGEMENT SYSTEM. 
              MANAGE INVENTORY, EXECUTE RECIPES, AND SCALE YOUR 
              CULINARY OPERATIONS TO THE NEXT LEVEL.
            </p>

            <div className="auth-info-decoration">
              <div className="brutalist-square">🍳</div>
              <div className="brutalist-square">🔪</div>
              <div className="brutalist-square">🔥</div>
            </div>

            <div style={{ fontSize: '9px', opacity: 0.4, fontFamily: 'monospace' }}>
              SYSTEM_VERSION: 1.0.4-STABLE<br />
              UPTIME: 99.99%<br />
              ENCRYPTION: AES-256-GCM
            </div>

            <div className="checkered-stripe-mini" />
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default AuthScreen;
