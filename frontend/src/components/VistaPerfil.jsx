import React from 'react';
import {
  Bell,
  Lock,
  Users,
  HelpCircle,
  ChevronRight,
  LogOut,
  Pencil
} from 'lucide-react';

export default function VistaPerfil({ usuario, onLogout }) {
  return (
    <div className="profile-view-wrapper">
      {/* Header FamiCash */}
      <header className="mobile-app-header">
        <div className="header-avatar-btn-placeholder"></div>
        <h1 className="header-brand-title">FamiCash</h1>
        <button
          type="button"
          className="header-icon-btn"
          onClick={() => alert('No hay nuevas notificaciones')}
        >
          <Bell size={22} className="header-bell-icon" />
        </button>
      </header>

      {/* Contenido Perfil */}
      <div className="profile-scroll-area">
        {/* Avatar grande y datos */}
        <div className="profile-hero-card">
          <div className="profile-avatar-container">
            <img
              src={usuario?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256'}
              alt={usuario?.nombre || 'Sandro De la Cruz'}
              className="profile-large-avatar"
            />
            <div className="avatar-edit-badge" title="Editar foto">
              <Pencil size={14} />
            </div>
          </div>

          <h2 className="profile-user-name">{usuario?.nombre || 'Sandro De la Cruz'}</h2>
          <p className="profile-user-email">{usuario?.email || 'sandro@gmail.com'}</p>

          <div className="profile-role-pill">
            <span className="role-green-dot"></span>
            <span>Cuenta Principal</span>
          </div>
        </div>

        {/* Grupo de opciones de configuración (Mockup 3) */}
        <div className="profile-menu-card">
          {/* 1. Notificaciones */}
          <div className="profile-menu-item" onClick={() => alert('Configuración de alertas de gastos y límites.')}>
            <div className="menu-icon-box bell-box">
              <Bell size={20} />
            </div>
            <div className="menu-text-col">
              <span className="menu-item-title">Notificaciones</span>
            </div>
            <ChevronRight size={18} className="menu-chevron" />
          </div>

          {/* 2. Seguridad y Privacidad */}
          <div className="profile-menu-item" onClick={() => alert('Contraseña, autenticación biométrica y PIN.')}>
            <div className="menu-icon-box security-box">
              <Lock size={20} />
            </div>
            <div className="menu-text-col">
              <span className="menu-item-title">Seguridad y Privacidad</span>
            </div>
            <ChevronRight size={18} className="menu-chevron" />
          </div>

          {/* 3. Familiares vinculados */}
          <div className="profile-menu-item" onClick={() => alert('3 familiares vinculados:\n• Mariana (Esposa) - Acceso completo\n• Mateo (Hijo) - Vista de gastos\n• Lucía (Hija) - Vista de gastos')}>
            <div className="menu-icon-box family-box">
              <Users size={20} />
              <span className="family-count-badge">3</span>
            </div>
            <div className="menu-text-col">
              <span className="menu-item-title">Familiares vinculados</span>
              <span className="menu-item-subtitle">Gestionar accesos</span>
            </div>
            <ChevronRight size={18} className="menu-chevron" />
          </div>

          {/* 4. Centro de Soporte */}
          <div className="profile-menu-item" onClick={() => alert('Centro de ayuda FamiCash 24/7.')}>
            <div className="menu-icon-box support-box">
              <HelpCircle size={20} />
            </div>
            <div className="menu-text-col">
              <span className="menu-item-title">Centro de Soporte</span>
            </div>
            <ChevronRight size={18} className="menu-chevron" />
          </div>
        </div>

        {/* Botón Cerrar Sesión (Mockup 3) */}
        <div className="logout-btn-container">
          <button
            type="button"
            className="logout-action-btn"
            onClick={onLogout}
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
}
