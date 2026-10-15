import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck } from 'lucide-react';
import logoFamicash from '../assets/logo-famicash.png';

export default function VistaLogin({ onLoginSuccess, onGoToRegister }) {
  const [email, setEmail] = useState('sandro@gmail.com');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email.trim() || !password) {
      setError('Por favor complete todos los campos');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await onLoginSuccess(email, password);
    } catch (err) {
      setError(err.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAccess = () => {
    setEmail('sandro@gmail.com');
    setPassword('admin123');
    handleSubmit();
  };

  return (
    <div className="login-screen-wrapper">
      <div className="login-card">
        {/* Logo Oficial FamiCash */}
        <div className="login-logo-brand-wrap">
          <img
            src={logoFamicash}
            alt="FamiCash"
            className="login-official-logo-img"
          />
          <p className="login-subtitle">Bienvenido a tu espacio financiero familiar.</p>
        </div>

        {/* Mensaje de error si existe */}
        {error && <div className="login-error-alert">{error}</div>}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Correo electrónico */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Correo electrónico
            </label>
            <div className="input-wrapper">
              <Mail className="input-left-icon" size={20} />
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@familia.com"
                required
                className="form-input"
              />
            </div>
          </div>

          {/* Contraseña */}
          <div className="form-group">
            <div className="password-label-row">
              <label className="form-label" htmlFor="login-password">
                Contraseña
              </label>
              <button
                type="button"
                className="forgot-password-link"
                onClick={() => alert('Se ha enviado un enlace para restablecer tu contraseña a tu correo registrado.')}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <div className="input-wrapper">
              <Lock className="input-left-icon" size={20} />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="form-input password-input"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label="Ver u ocultar contraseña"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Botón Principal Iniciar Sesión */}
          <button
            type="submit"
            className="login-submit-btn"
            disabled={loading}
          >
            <span>{loading ? 'Accediendo...' : 'Iniciar Sesión'}</span>
            <ArrowRight size={20} className="btn-arrow-icon" />
          </button>

          {/* Acceso Rápido */}
          <div className="quick-access-box">
            <button
              type="button"
              className="quick-demo-btn"
              onClick={handleQuickAccess}
            >
              <ShieldCheck size={16} />
              <span>Acceso Rápido (Sandro De la Cruz)</span>
            </button>
          </div>
        </form>

        {/* Footer Registro */}
        <div className="login-footer">
          <span>¿No tienes una cuenta? </span>
          <button
            type="button"
            className="register-link"
            onClick={onGoToRegister}
          >
            Regístrate aquí
          </button>
        </div>
      </div>
    </div>
  );
}
