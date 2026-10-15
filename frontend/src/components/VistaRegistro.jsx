import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import logoFamicash from '../assets/logo-famicash.png';

export default function VistaRegistro({ onRegisterSuccess, onGoToLogin }) {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState('Administrador Familiar');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Opciones de roles familiares
  const rolesFamiliares = [
    'Administrador Familiar',
    'Esposo / Padre',
    'Esposa / Madre',
    'Hijo / Hija',
    'Familiar'
  ];

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');

    if (!nombre.trim() || !email.trim() || !password || !confirmPassword) {
      setError('Por favor completa todos los campos');
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      setSuccess(true);
      await onRegisterSuccess({
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        password,
        rol,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=256'
      });
    } catch (err) {
      setError(err.message || 'Error al crear la cuenta');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen-wrapper">
      <div className="login-card register-card-custom">
        {/* Botón Volver al Login */}
        <div className="register-header-back-row">
          <button
            type="button"
            className="register-back-btn"
            onClick={onGoToLogin}
            title="Volver al inicio de sesión"
          >
            <ArrowLeft size={18} />
            <span>Volver</span>
          </button>
        </div>

        {/* Logo Oficial FamiCash */}
        <div className="login-logo-brand-wrap register-brand-spacing">
          <img
            src={logoFamicash}
            alt="FamiCash"
            className="login-official-logo-img register-logo-img"
          />
          <h2 className="register-main-heading">Crea tu Cuenta</h2>
          <p className="login-subtitle">Comienza a organizar la economía y metas de tu hogar.</p>
        </div>

        {/* Alerta de Error */}
        {error && <div className="login-error-alert">{error}</div>}

        {/* Alerta de Éxito */}
        {success && (
          <div className="register-success-alert">
            <CheckCircle2 size={16} />
            <span>¡Cuenta creada con éxito! Entrando...</span>
          </div>
        )}

        {/* Formulario de Registro */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Nombre Completo */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-nombre">
              Nombre Completo
            </label>
            <div className="input-wrapper">
              <User className="input-left-icon" size={19} />
              <input
                id="register-nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="ej: Sandro De la Cruz"
                required
                className="form-input"
              />
            </div>
          </div>

          {/* Correo Electrónico */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-email">
              Correo Electrónico
            </label>
            <div className="input-wrapper">
              <Mail className="input-left-icon" size={19} />
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sandro@gmail.com"
                required
                className="form-input"
              />
            </div>
          </div>

          {/* Rol en la Familia */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-rol">
              Rol en el Hogar
            </label>
            <div className="register-role-select-wrap">
              <select
                id="register-rol"
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                className="register-role-dropdown"
              >
                {rolesFamiliares.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Contraseña */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-password">
              Contraseña
            </label>
            <div className="input-wrapper">
              <Lock className="input-left-icon" size={19} />
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
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

          {/* Confirmar Contraseña */}
          <div className="form-group">
            <label className="form-label" htmlFor="register-confirm-password">
              Confirmar Contraseña
            </label>
            <div className="input-wrapper">
              <Lock className="input-left-icon" size={19} />
              <input
                id="register-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                required
                className="form-input password-input"
              />
              <button
                type="button"
                className="toggle-password-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label="Ver u ocultar confirmación de contraseña"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Botón Principal Registrarse */}
          <button
            type="submit"
            className="login-submit-btn"
            disabled={loading}
          >
            <span>{loading ? 'Creando cuenta...' : 'Crear mi Cuenta'}</span>
            <ArrowRight size={20} className="btn-arrow-icon" />
          </button>
        </form>

        {/* Footer Enlace al Login */}
        <div className="login-footer">
          <span>¿Ya tienes una cuenta? </span>
          <button
            type="button"
            className="register-link"
            onClick={onGoToLogin}
          >
            Inicia sesión aquí
          </button>
        </div>
      </div>
    </div>
  );
}
