import Swal from 'sweetalert2';

/**
 * Obtiene el contenedor visual del celular para renderizar SweetAlert2
 * dentro de la pantalla del teléfono sin salirse al resto de la página.
 */
export const getMobileTarget = () => {
  return (
    document.querySelector('.mobile-device-chassis') ||
    document.querySelector('.mobile-screen-viewport') ||
    document.querySelector('.mobile-app-root') ||
    document.body
  );
};

/**
 * Instancia base de SweetAlert2 adaptada al contenedor del celular
 */
export const swalMobile = {
  fire(options = {}) {
    const target = getMobileTarget();
    return Swal.fire({
      target,
      confirmButtonColor: '#006241',
      cancelButtonColor: '#94a3b8',
      buttonsStyling: true,
      reverseButtons: true,
      ...options,
      customClass: {
        container: 'famicash-swal-container',
        popup: 'famicash-swal-popup',
        title: 'famicash-swal-title',
        htmlContainer: 'famicash-swal-html',
        confirmButton: 'famicash-swal-confirm-btn',
        cancelButton: 'famicash-swal-cancel-btn',
        ...(options.customClass || {})
      }
    });
  },

  toast(options = {}) {
    const target = getMobileTarget();
    return Swal.fire({
      target,
      toast: true,
      position: 'top',
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      iconColor: '#10b981',
      ...options,
      customClass: {
        container: 'famicash-swal-toast-container',
        popup: 'famicash-swal-toast-popup',
        title: 'famicash-swal-toast-title',
        ...(options.customClass || {})
      }
    });
  }
};

/**
 * Muestra el panel interactivo de Notificaciones Familiares de FamiCash
 */
export const mostrarCentroNotificaciones = async (extraData = {}) => {
  const notificaciones = [
    {
      id: 1,
      tipo: 'presupuesto',
      titulo: 'Presupuesto Familiar en buen estado',
      descripcion: 'Llevas el 31% gastado este mes. Te quedan 18 días de balance positivo.',
      hora: 'Hace 15 min',
      badge: 'Normal',
      badgeColor: '#10b981'
    },
    {
      id: 2,
      tipo: 'meta',
      titulo: 'Progreso de Ahorro: Auto Familiar',
      descripcion: 'Has alcanzado el 22% de tu meta. Faltan S/ 7,800 para completarla.',
      hora: 'Hace 2 horas',
      badge: 'Ahorro',
      badgeColor: '#0284c7'
    },
    {
      id: 3,
      tipo: 'cuenta',
      titulo: 'Cuentas sincronizadas',
      descripcion: 'Tus 4 cuentas (BCP, Interbank, Efectivo y BBVA) tienen saldos al día.',
      hora: 'Hoy, 09:30 AM',
      badge: 'Al día',
      badgeColor: '#006241'
    }
  ];

  const htmlNotificaciones = `
    <div class="famicash-notif-modal-content">
      <div class="notif-modal-subhead">
        <span>Tienes <strong>3 avisos recientes</strong> en tu hogar</span>
      </div>
      <div class="notif-modal-list">
        ${notificaciones.map(n => `
          <div class="notif-modal-card">
            <div class="notif-card-header">
              <span class="notif-card-badge" style="background:${n.badgeColor}20; color:${n.badgeColor}">
                ${n.badge}
              </span>
              <span class="notif-card-time">${n.hora}</span>
            </div>
            <h4 class="notif-card-title">${n.titulo}</h4>
            <p class="notif-card-desc">${n.descripcion}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  return swalMobile.fire({
    title: '🔔 Notificaciones',
    html: htmlNotificaciones,
    confirmButtonText: 'Entendido',
    showCloseButton: true,
    customClass: {
      popup: 'famicash-notif-dialog-popup',
      htmlContainer: 'famicash-notif-dialog-html'
    }
  });
};

/**
 * Muestra un Toast de éxito en la parte superior del celular
 */
export const mostrarToastExito = (titulo, subtitulo = '') => {
  return swalMobile.toast({
    icon: 'success',
    title: titulo,
    text: subtitulo
  });
};

/**
 * Diálogo de confirmación para eliminar o cancelar acciones
 */
export const confirmarAccion = async ({
  titulo = '¿Estás seguro?',
  texto = 'Esta acción no se puede deshacer.',
  confirmText = 'Sí, continuar',
  cancelText = 'Cancelar',
  icono = 'warning'
}) => {
  const result = await swalMobile.fire({
    icon: icono,
    title: titulo,
    text: texto,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: icono === 'warning' || icono === 'error' ? '#ef4444' : '#006241',
    cancelButtonColor: '#94a3b8'
  });

  return result.isConfirmed;
};

/**
 * Diálogo para restablecer contraseña desde la vista Login
 */
export const mostrarModalRecuperarPassword = async () => {
  const { value: email } = await swalMobile.fire({
    title: 'Recuperar Contraseña',
    text: 'Ingresa tu correo registrado para enviarte las instrucciones de restablecimiento:',
    input: 'email',
    inputPlaceholder: 'ejemplo@familia.com',
    showCancelButton: true,
    confirmButtonText: 'Enviar Enlace',
    cancelButtonText: 'Cancelar',
    inputValidator: (val) => {
      if (!val || !val.includes('@')) {
        return 'Por favor ingresa un correo electrónico válido';
      }
    }
  });

  if (email) {
    await swalMobile.fire({
      icon: 'success',
      title: '¡Enlace enviado!',
      text: `Hemos enviado el enlace para restablecer tu contraseña a ${email}. Revisa tu bandeja de entrada.`,
      confirmButtonText: 'Aceptar'
    });
  }
};

/**
 * Diálogo para ver miembros y accesos desde el Perfil
 */
export const mostrarModalMiembrosFamilia = () => {
  let usuariosList = [];
  try {
    const raw = localStorage.getItem('famicash_local_usuarios');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) usuariosList = parsed;
    }
  } catch (e) {
    console.warn('Error leyendo usuarios para modal:', e);
  }

  const miembros = usuariosList.length > 0
    ? usuariosList.map(u => ({
        nombre: u.nombre,
        rol: u.rol || 'Miembro Familiar',
        acceso: (u.rol === 'Administrador Familiar' || u.esAdmin) ? 'Total (Administrador del Hogar)' : 'Registro y consulta personal',
        avatar: (u.rol === 'Administrador Familiar' || u.esAdmin) ? '👑' : (u.rol === 'Esposa / Madre' ? '👩' : (u.rol === 'Esposo / Padre' ? '👨' : '👤'))
      }))
    : [
        { nombre: 'Sandro De la Cruz', rol: 'Administrador Familiar', acceso: 'Total (Cuentas, Presupuestos, Gastos)', avatar: '👑' },
        { nombre: 'Mariana', rol: 'Esposa / Madre', acceso: 'Total (Registro de gastos e ingresos)', avatar: '👩' },
        { nombre: 'Mateo', rol: 'Hijo', acceso: 'Vista y registro de gastos personales', avatar: '👦' },
        { nombre: 'Lucía', rol: 'Hija', acceso: 'Vista y registro de gastos personales', avatar: '👧' }
      ];

  const html = `
    <div class="famicash-members-list">
      ${miembros.map(m => `
        <div class="famicash-member-row">
          <span class="member-avatar-emoji">${m.avatar}</span>
          <div class="member-info-col">
            <strong class="member-name">${m.nombre}</strong>
            <span class="member-role">${m.rol}</span>
            <small class="member-access">${m.acceso}</small>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  return swalMobile.fire({
    title: '👥 Miembros Familiares',
    html,
    confirmButtonText: 'Cerrar'
  });
};

/**
 * Diálogo para configurar alertas de gastos y límites
 */
export const mostrarModalConfigAlertas = () => {
  return swalMobile.fire({
    icon: 'info',
    title: '🔔 Configuración de Alertas',
    html: `
      <div style="text-align:left; font-size:13px; color:#4b5563; line-height:1.6;">
        <p>• <strong>Umbral de presupuesto:</strong> Alerta al superar el 80% del límite mensual.</p>
        <p>• <strong>Alerta de saldo bajo:</strong> Notificar cuando una cuenta tenga menos de S/ 100.</p>
        <p>• <strong>Resumen semanal:</strong> Envío de balance familiar los domingos a las 8:00 PM.</p>
      </div>
    `,
    confirmButtonText: 'Guardar Preferencias'
  });
};

/**
 * Diálogo para opciones de seguridad
 */
export const mostrarModalSeguridad = () => {
  return swalMobile.fire({
    icon: 'success',
    title: '🔒 Seguridad y Acceso',
    html: `
      <div style="text-align:left; font-size:13px; color:#4b5563; line-height:1.6;">
        <p>✔️ <strong>Contraseña:</strong> Protegida con cifrado seguro.</p>
        <p>✔️ <strong>Acceso biométrico:</strong> Huella dactilar y FaceID habilitados en este teléfono.</p>
        <p>✔️ <strong>Sesión:</strong> Cierre de sesión automático por inactividad a los 30 días.</p>
      </div>
    `,
    confirmButtonText: 'Aceptar'
  });
};
