import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, AlertTriangle, Key } from 'lucide-react';
import { AntigravityBackground } from './AntigravityBackground';

export const SecurityBreachOverlay: React.FC = () => {
  return (
    <div className="auth-container game-theme overflow-hidden">
      <div className="auth-checkered-bg" />
      <AntigravityBackground count={20} />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="brutalist-card z-[99999]"
        style={{ maxWidth: '850px' }}
      >
        <div className="auth-split">
          {/* Main Error Side */}
          <div className="auth-form-side">
            <div className="auth-header-badge" style={{ background: '#ef4444', color: 'white', borderColor: '#7f1d1d' }}>
              SYSTEM_ERROR // CRITICAL_ALERT
            </div>
            
            <h1 className="auth-title" style={{ fontSize: '2.5rem', lineHeight: '1.1', marginTop: '1rem', color: '#ef4444' }}>
              ACCESS_BLOCKED
            </h1>
            <p className="auth-subtitle" style={{ fontSize: '0.8rem', color: '#f87171' }}>
              CREDENTIALS_COMPROMISED // UNAUTHORIZED_ACCESS_DETECTED
            </p>

            <div className="auth-error-box" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
              <span className="error-prefix" style={{ color: '#ef4444' }}>INCIDENT_REPORT:</span>
              <p style={{ color: '#fca5a5', marginTop: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem' }}>
                El sistema Kitchen OS se ha bloqueado preventivamente. Se ha detectado una fuga de claves secretas de API y credenciales.
              </p>
              
              <ul style={{ listStyleType: 'square', paddingLeft: '1.5rem', color: '#fca5a5', fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li><strong>Privacidad Garantizada:</strong> Todos los datos de usuario y contraseñas han sido encriptados mediante AES-256 y movidos a almacenamiento frío. <strong>Tus datos están a salvo.</strong></li>
                <li><strong>Respuesta Activa:</strong> El administrador está trabajando actualmente en identificar la brecha, revocar las claves comprometidas y rastrear a los responsables.</li>
                <li><strong>Estado Actual:</strong> Purgando tokens antiguos y aprovisionando nueva infraestructura de base de datos segura.</li>
              </ul>
            </div>

            <div className="brutalist-input" style={{ borderColor: '#ef4444', opacity: 0.7, pointerEvents: 'none' }}>
              <Key className="auth-input-icon" size={18} color="#ef4444" />
              <input
                type="text"
                placeholder="SYSTEM_LOCKED"
                disabled
                style={{ color: '#ef4444' }}
              />
            </div>
            
            <button 
              type="button" 
              className="brutalist-btn"
              disabled
              style={{ background: '#ef4444', color: 'black', opacity: 0.5, cursor: 'not-allowed', marginTop: '1rem' }}
            >
              WAITING_FOR_ADMIN_RESET...
            </button>
          </div>

          {/* Info Side */}
          <div className="brutalist-info" style={{ background: '#111' }}>
            <div className="terminal-header">
              <div className="terminal-dot" style={{ background: '#ff5f56' }} />
              <div className="terminal-dot" style={{ background: '#ffbd2e' }} />
              <div className="terminal-dot" style={{ background: '#27c93f' }} />
            </div>
            
            <h3>KITCHEN_OS</h3>
            <p style={{ color: '#ef4444', fontWeight: 'bold' }}>
              SECURITY INCIDENT IN PROGRESS.
            </p>
            <p style={{ fontSize: '0.8rem', opacity: 0.8 }}>
              TODA LA ACTIVIDAD DEL SISTEMA ESTÁ SUSPENDIDA HASTA QUE EL ADMINISTRADOR ROTEE LAS CLAVES Y RESTAURE EL SERVICIO.
            </p>

            <div className="auth-info-decoration" style={{ marginTop: '2rem', opacity: 0.5 }}>
              <div className="brutalist-square" style={{ borderColor: '#ef4444', color: '#ef4444' }}>⚠️</div>
              <div className="brutalist-square" style={{ borderColor: '#ef4444', color: '#ef4444' }}>🔒</div>
              <div className="brutalist-square" style={{ borderColor: '#ef4444', color: '#ef4444' }}>🛑</div>
            </div>

            <div style={{ fontSize: '9px', opacity: 0.4, fontFamily: 'monospace', marginTop: 'auto' }}>
              SYSTEM_VERSION: 1.0.4-LOCKED<br />
              UPTIME: 0.00%<br />
              ENCRYPTION: COMPROMISED
            </div>

            <div className="checkered-stripe-mini" style={{ opacity: 0.2 }} />
          </div>
        </div>
      </motion.div>
    </div>
  );
};


