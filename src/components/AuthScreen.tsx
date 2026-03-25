import React, { useState } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signInWithPopup, 
  GoogleAuthProvider,
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
          role: 'user'
        }).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${userCredential.user.uid}`));

        onAuthSuccess(userCredential.user);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      
      // Check if user profile exists, if not create it
      const userDoc = await getDoc(doc(db, 'users', result.user.uid)).catch(err => handleFirestoreError(err, OperationType.GET, `users/${result.user.uid}`));
      if (userDoc && !userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
          createdAt: serverTimestamp(),
          role: 'user'
        }).catch(err => handleFirestoreError(err, OperationType.WRITE, `users/${result.user.uid}`));
      }
      
      onAuthSuccess(result.user);
    } catch (err: any) {
      console.error('Google Auth error:', err);
      setError(err.message);
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
                onClick={handleGoogleSignIn}
                className="brutalist-btn secondary google-auth-btn"
                disabled={loading}
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" referrerPolicy="no-referrer" />
                GOOGLE_SIGN_IN
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
