import React, { useState } from 'react';
import { Lock, Mail, User, ArrowRight, Sparkles } from 'lucide-react';
import logoFamicash from '../assets/logo-famicash.png';

export default function VistaLogin({ onLogin, onRegister }) {
  const [modo, setModo] = useState('login'); // 'login' | 'register'
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('anthony@famicash.pe');
  const [password, setPassword] = useState('famicash123');
  const [persona, setPersona] = useState('ANTHONY');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (modo === 'login') {
        await onLogin(email, password);
      } else {
        await onRegister({ nombre, email, password, persona });
      }
    } catch (err) {
      setError(err.message || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (correo) => {
    setEmail(correo);
    setPassword('famicash123');
    setError('');
    setLoading(true);
    try {
      await onLogin(correo, 'famicash123');
    } catch (err) {
      setError(err.message || 'No se pudo iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-shell">
      <div className="auth-split-card">
        {/* Panel lateral de bienvenida (visible en PC) */}
        <div className="auth-hero-panel">
          <div className="auth-hero-badge">
            <Sparkles size={14} />
            <span>Hogar Anthony, Vanessa & Lara</span>
          </div>
          <h1>Control financiero familiar claro y al instante</h1>
          <p>
            Registra gastos en 3 toques con la taxonomía oficial del hogar, visualiza
            el evolutivo mensual en barras numeradas y exporta a Excel (.xlsx) con un clic.
          </p>
          <div className="auth-hero-features">
            <div className="hero-feat-pill">✓ Taxonomía de 3 niveles</div>
            <div className="hero-feat-pill">✓ Exportación Excel oficial</div>
            <div className="hero-feat-pill">✓ Semáforo de presupuestos</div>
            <div className="hero-feat-pill">✓ Objetivos de ahorro</div>
          </div>
        </div>

        {/* Formulario de acceso */}
        <div className="auth-form-panel">
          <div className="auth-brand-header">
            <img src={logoFamicash} alt="FamiCash" className="auth-logo-img" />
            <h2>{modo === 'login' ? 'Bienvenido a FamiCash' : 'Crear cuenta familiar'}</h2>
            <p>Finanzas del hogar en Soles (S/) · Lima, Perú</p>
          </div>

          {/* Botones de acceso rápido 1 clic para Anthony y Vanessa */}
          {modo === 'login' && (
            <div className="quick-access-box">
              <span className="quick-access-title">Acceso rápido del hogar:</span>
              <div className="quick-access-buttons">
                <button
                  type="button"
                  className="quick-user-btn"
                  onClick={() => quickLogin('anthony@famicash.pe')}
                  disabled={loading}
                >
                  <span className="quick-avatar anthony">A</span>
                  <div>
                    <strong>Entrar como Anthony</strong>
                    <small>anthony@famicash.pe</small>
                  </div>
                </button>
                <button
                  type="button"
                  className="quick-user-btn"
                  onClick={() => quickLogin('vanessa@famicash.pe')}
                  disabled={loading}
                >
                  <span className="quick-avatar vanessa">V</span>
                  <div>
                    <strong>Entrar como Vanessa</strong>
                    <small>vanessa@famicash.pe</small>
                  </div>
                </button>
              </div>
            </div>
          )}

          {error && <div className="alert-error-box">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            {modo === 'register' && (
              <>
                <div className="field-group">
                  <label>Nombre</label>
                  <div className="input-with-icon">
                    <User size={17} />
                    <input
                      type="text"
                      required
                      placeholder="Ej. Anthony"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                    />
                  </div>
                </div>
                <div className="field-group">
                  <label>Miembro del hogar</label>
                  <select value={persona} onChange={(e) => setPersona(e.target.value)}>
                    <option value="ANTHONY">Anthony</option>
                    <option value="VANESSA">Vanessa</option>
                    <option value="FAMILIA">Familia General</option>
                  </select>
                </div>
              </>
            )}

            <div className="field-group">
              <label>Correo electrónico</label>
              <div className="input-with-icon">
                <Mail size={17} />
                <input
                  type="email"
                  required
                  placeholder="correo@famicash.pe"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="field-group">
              <label>Contraseña</label>
              <div className="input-with-icon">
                <Lock size={17} />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" className="btn-primary-submit" disabled={loading}>
              <span>{loading ? 'Ingresando...' : modo === 'login' ? 'Iniciar Sesión' : 'Registrarme'}</span>
              <ArrowRight size={18} />
            </button>
          </form>

          <div className="auth-switch-footer">
            {modo === 'login' ? (
              <span>
                ¿Nuevo usuario en el hogar?{' '}
                <button type="button" onClick={() => setModo('register')}>
                  Crear cuenta
                </button>
              </span>
            ) : (
              <span>
                ¿Ya tienes cuenta?{' '}
                <button type="button" onClick={() => setModo('login')}>
                  Iniciar sesión
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

