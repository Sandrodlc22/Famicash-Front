import React from 'react';
import {
  Bell,
  Lock,
  Users,
  ChevronRight,
  LogOut,
  Pencil,
  ShieldCheck
} from 'lucide-react';
import logoFamicash from '../assets/logo-famicash.png';
import {
  mostrarCentroNotificaciones,
  mostrarModalConfigAlertas,
  mostrarModalSeguridad,
  mostrarModalMiembrosFamilia,
  confirmarAccion
} from '../utils/notificaciones';

export default function VistaPerfil({ usuario, onLogout, onGoToAdmin }) {
  const handleLogoutClick = async () => {
    const confirm = await confirmarAccion({
      titulo: '¿Cerrar sesión?',
      texto: 'Tendrás que ingresar tus datos nuevamente para acceder a tu cuenta.',
      confirmText: 'Sí, cerrar sesión',
      cancelText: 'Cancelar',
      icono: 'question'
    });
    if (confirm) {
      onLogout();
    }
  };

  const roleName = (usuario?.rol || '').trim().toLowerCase();
  const isAdmin = Boolean(
    usuario && (
      usuario.esAdmin === true ||
      roleName === 'administrador familiar' ||
      roleName === 'admin' ||
      usuario.rolId === 1
    )
  );

  return (
    <div className="profile-view-wrapper">
      {/* Header FamiCash */}
      <header className="mobile-app-header">
        <div className="header-avatar-btn-placeholder"></div>
        <div className="header-logo-container">
          <img src={logoFamicash} alt="FamiCash" className="header-famicash-logo" />
        </div>
        <button
          type="button"
          className="header-icon-btn"
          onClick={() => mostrarCentroNotificaciones()}
          title="Ver Notificaciones"
        >
          <Bell size={22} className="header-bell-icon" />
          <span className="bell-badge-dot"></span>
        </button>
      </header>

      {/* Contenido Perfil */}
      <div className="profile-scroll-area">
        {/* Avatar grande y datos */}
        <div className="profile-hero-card">
          <div className="profile-avatar-container">
            <img
              src={usuario?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256'}
              alt={usuario?.nombre || 'Usuario'}
              className="profile-large-avatar"
            />
            <div className="avatar-edit-badge" title="Editar foto">
              <Pencil size={14} />
            </div>
          </div>

          <h2 className="profile-user-name">{usuario?.nombre || 'Usuario'}</h2>
          <p className="profile-user-email">{usuario?.email || ''}</p>

          <div className="profile-role-pill">
            <span className="role-green-dot"></span>
            <span>{usuario?.rol || 'Miembro Familiar'}</span>
          </div>
        </div>

        {/* Grupo de opciones de configuración (Mockup 3) */}
        <div className="profile-menu-card">
          {/* 0. Panel de Administración (Destacado para Admin) */}
          {isAdmin && (
            <div
              className="profile-menu-item admin-featured-item"
              onClick={onGoToAdmin}
              style={{ background: 'linear-gradient(135deg, rgba(0, 98, 65, 0.08), rgba(0, 168, 107, 0.04))', borderLeft: '3px solid #006241' }}
            >
              <div className="menu-icon-box admin-box" style={{ background: '#006241', color: '#ffffff' }}>
                <ShieldCheck size={20} />
              </div>
              <div className="menu-text-col">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="menu-item-title" style={{ color: '#006241', fontWeight: 800 }}>Panel de Administración</span>
                  <span style={{ fontSize: '9px', background: '#006241', color: '#fff', padding: '1.5px 6px', borderRadius: '6px', fontWeight: 800, textTransform: 'uppercase' }}>ADMIN</span>
                </div>
                <span className="menu-item-subtitle">Roles, tarjetas, límites, metas y presupuesto</span>
              </div>
              <ChevronRight size={18} className="menu-chevron" style={{ color: '#006241' }} />
            </div>
          )}
          {/* 1. Notificaciones */}
          <div className="profile-menu-item" onClick={mostrarModalConfigAlertas}>
            <div className="menu-icon-box bell-box">
              <Bell size={20} />
            </div>
            <div className="menu-text-col">
              <span className="menu-item-title">Notificaciones y Alertas</span>
              <span className="menu-item-subtitle">Límites y umbrales de gasto</span>
            </div>
            <ChevronRight size={18} className="menu-chevron" />
          </div>

          {/* 2. Seguridad y Privacidad */}
          <div className="profile-menu-item" onClick={mostrarModalSeguridad}>
            <div className="menu-icon-box security-box">
              <Lock size={20} />
            </div>
            <div className="menu-text-col">
              <span className="menu-item-title">Seguridad y Privacidad</span>
              <span className="menu-item-subtitle">Biometría y contraseña</span>
            </div>
            <ChevronRight size={18} className="menu-chevron" />
          </div>

          {/* 3. Familiares vinculados */}
          <div className="profile-menu-item" onClick={mostrarModalMiembrosFamilia}>
            <div className="menu-icon-box family-box">
              <Users size={20} />
              <span className="family-count-badge">3</span>
            </div>
            <div className="menu-text-col">
              <span className="menu-item-title">Familiares vinculados</span>
              <span className="menu-item-subtitle">Gestionar accesos y roles</span>
            </div>
            <ChevronRight size={18} className="menu-chevron" />
          </div>
        </div>

        {/* Botón Cerrar Sesión (Mockup 3) */}
        <div className="logout-btn-container">
          <button
            type="button"
            className="logout-action-btn"
            onClick={handleLogoutClick}
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
}
