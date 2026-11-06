import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  CreditCard,
  PieChart,
  Tag,
  Target,
  Plus,
  Pencil,
  Trash2,
  ChevronRight,
  Bell,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  DollarSign,
  Wallet,
  Sparkles,
  Lock,
  Building2,
  Banknote,
  Sliders,
  Calendar,
  Layers
} from 'lucide-react';
import logoFamicash from '../assets/logo-famicash.png';
import { getCategoryIcon } from '../utils/iconosCategorias';
import {
  swalMobile,
  mostrarCentroNotificaciones,
  mostrarToastExito,
  confirmarAccion
} from '../utils/notificaciones';
import Swal from 'sweetalert2';

export default function VistaAdmin({
  usuario,
  cuentas = [],
  categorias = [],
  api,
  onRefreshAll,
  onGoToExpense
}) {
  const [activeTab, setActiveTab] = useState('familia'); // 'familia' | 'tarjetas' | 'presupuesto' | 'categorias' | 'metas'
  const [usuarios, setUsuarios] = useState([]);
  const [presupuestos, setPresupuestos] = useState([]);
  const [metas, setMetas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [catFilter, setCatFilter] = useState('ALL'); // 'ALL' | 'GASTO' | 'INGRESO'

  // Roles oficiales de FamiCash
  const ROLES_DISPONIBLES = [
    'Administrador Familiar',
    'Esposo / Padre',
    'Esposa / Madre',
    'Hijo / Hija',
    'Familiar',
    'Miembro Familiar'
  ];

  const cargarDatosAdmin = async () => {
    setLoading(true);
    try {
      const [usrList, presList, metList] = await Promise.all([
        api.getUsuarios(),
        api.getPresupuestos(),
        api.getMetas()
      ]);
      setUsuarios(usrList || []);
      setPresupuestos(presList || []);
      setMetas(metList || []);
    } catch (err) {
      console.error('Error cargando datos de administración:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatosAdmin();
  }, []);

  // ========================================================
  // 1. GESTIÓN DE FAMILIARES Y ROLES
  // ========================================================
  const handleCrearUsuario = async () => {
    const { value: formValues } = await swalMobile.fire({
      title: 'Nuevo Miembro Familiar',
      html: `
        <div style="text-align:left; display:flex; flex-direction:column; gap:10px; margin-top:6px;">
          <div>
            <label style="font-size:12px; font-weight:700; color:#1e293b;">Nombre completo:</label>
            <input id="swal-user-name" class="swal2-input" placeholder="Ej: Mateo De la Cruz" style="width:100%; height:38px; margin:4px 0 0 0; font-size:13px; border-radius:10px;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:#1e293b;">Correo electrónico:</label>
            <input id="swal-user-email" type="email" class="swal2-input" placeholder="ejemplo@famicash.pe" style="width:100%; height:38px; margin:4px 0 0 0; font-size:13px; border-radius:10px;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:#1e293b;">Contraseña inicial:</label>
            <input id="swal-user-pass" type="password" class="swal2-input" placeholder="Mínimo 6 caracteres" style="width:100%; height:38px; margin:4px 0 0 0; font-size:13px; border-radius:10px;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:#1e293b;">Rol en el Hogar:</label>
            <select id="swal-user-role" class="swal2-input" style="width:100%; height:38px; margin:4px 0 0 0; font-size:13px; border-radius:10px;">
              ${ROLES_DISPONIBLES.map(r => `<option value="${r}">${r}</option>`).join('')}
            </select>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Registrar Miembro',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const nombre = document.getElementById('swal-user-name')?.value?.trim();
        const email = document.getElementById('swal-user-email')?.value?.trim();
        const password = document.getElementById('swal-user-pass')?.value;
        const rol = document.getElementById('swal-user-role')?.value;

        if (!nombre) {
          Swal.showValidationMessage('El nombre es obligatorio');
          return false;
        }
        if (!email || !email.includes('@')) {
          Swal.showValidationMessage('Ingresa un correo electrónico válido');
          return false;
        }
        if (!password || password.length < 6) {
          Swal.showValidationMessage('La contraseña debe tener al menos 6 caracteres');
          return false;
        }
        return { nombre, email, password, rol };
      }
    });

    if (formValues) {
      try {
        await api.createUsuario(formValues);
        mostrarToastExito('¡Familiar registrado con éxito!');
        cargarDatosAdmin();
      } catch (e) {
        swalMobile.fire({ icon: 'error', title: 'Error', text: e.message || 'No se pudo crear el usuario' });
      }
    }
  };

  const handleEditarUsuario = async (u) => {
    const { value: formValues } = await swalMobile.fire({
      title: `Editar a ${u.nombre}`,
      html: `
        <div style="text-align:left; display:flex; flex-direction:column; gap:10px; margin-top:6px;">
          <div>
            <label style="font-size:12px; font-weight:700; color:#1e293b;">Nombre:</label>
            <input id="swal-edit-name" class="swal2-input" value="${u.nombre}" style="width:100%; height:38px; margin:4px 0 0 0; font-size:13px; border-radius:10px;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:#1e293b;">Correo:</label>
            <input id="swal-edit-email" type="email" class="swal2-input" value="${u.email}" style="width:100%; height:38px; margin:4px 0 0 0; font-size:13px; border-radius:10px;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:#1e293b;">Rol Familiar:</label>
            <select id="swal-edit-role" class="swal2-input" style="width:100%; height:38px; margin:4px 0 0 0; font-size:13px; border-radius:10px;">
              ${ROLES_DISPONIBLES.map(r => `<option value="${r}" ${r === (u.rol || u.rol_nombre) ? 'selected' : ''}>${r}</option>`).join('')}
            </select>
          </div>
          <div style="display:flex; align-items:center; gap:8px; margin-top:4px;">
            <input id="swal-edit-active" type="checkbox" ${u.activo ? 'checked' : ''} style="width:18px; height:18px; cursor:pointer;" />
            <label for="swal-edit-active" style="font-size:13px; color:#1e293b; cursor:pointer;">Usuario Activo</label>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar Cambios',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const nombre = document.getElementById('swal-edit-name')?.value?.trim();
        const email = document.getElementById('swal-edit-email')?.value?.trim();
        const rol = document.getElementById('swal-edit-role')?.value;
        const activo = document.getElementById('swal-edit-active')?.checked;

        if (!nombre) {
          Swal.showValidationMessage('El nombre no puede estar vacío');
          return false;
        }
        if (!email || !email.includes('@')) {
          Swal.showValidationMessage('Ingresa un correo válido');
          return false;
        }
        return { nombre, email, rol, activo };
      }
    });

    if (formValues) {
      try {
        await api.updateUsuario(u.id, formValues);
        mostrarToastExito('Usuario actualizado');
        cargarDatosAdmin();
      } catch (e) {
        swalMobile.fire({ icon: 'error', title: 'Error', text: e.message || 'No se pudo actualizar' });
      }
    }
  };

  const handleEliminarUsuario = async (u) => {
    if (u.id === usuario?.id) {
      swalMobile.fire({
        icon: 'warning',
        title: 'Acción no permitida',
        text: 'No puedes eliminar tu propia cuenta de Administrador principal.'
      });
      return;
    }

    const confirmado = await confirmarAccion({
      titulo: `¿Desvincular a ${u.nombre}?`,
      texto: `Perderá acceso inmediato a la aplicación familiar.`,
      confirmText: 'Sí, desvincular',
      cancelText: 'Cancelar',
      icono: 'warning'
    });

    if (confirmado) {
      try {
        await api.deleteUsuario(u.id);
        mostrarToastExito('Familiar desvinculado');
        cargarDatosAdmin();
      } catch (e) {
        swalMobile.fire({ icon: 'error', title: 'Error', text: e.message || 'No se pudo eliminar' });
      }
    }
  };

  // ========================================================
  // 2. GESTIÓN DE TARJETAS, CUENTAS Y LÍMITES
  // ========================================================
  const handleCrearTarjeta = async () => {
    const { value: formValues } = await swalMobile.fire({
      title: 'Nueva Tarjeta / Cuenta',
      html: `
        <div style="text-align:left; display:flex; flex-direction:column; gap:10px; margin-top:6px;">
          <div>
            <label style="font-size:12px; font-weight:700; color:#1e293b;">Nombre de la tarjeta/cuenta:</label>
            <input id="swal-acc-name" class="swal2-input" placeholder="Ej: BBVA Visa Platinum" style="width:100%; height:38px; margin:4px 0 0 0; font-size:13px; border-radius:10px;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:#1e293b;">Tipo:</label>
            <select id="swal-acc-type" class="swal2-input" style="width:100%; height:38px; margin:4px 0 0 0; font-size:13px; border-radius:10px;">
              <option value="Tarjeta Débito">Tarjeta Débito</option>
              <option value="Tarjeta Crédito">Tarjeta Crédito</option>
              <option value="Ahorros">Cuenta de Ahorros</option>
              <option value="Efectivo">Billetera / Efectivo</option>
            </select>
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:#1e293b;">Saldo inicial (S/):</label>
            <input id="swal-acc-balance" type="number" step="0.01" class="swal2-input" placeholder="1000.00" style="width:100%; height:38px; margin:4px 0 0 0; font-size:13px; border-radius:10px;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:#1e293b;">Límite de Alerta de Gasto (%):</label>
            <input id="swal-acc-threshold" type="number" min="10" max="100" class="swal2-input" value="80" style="width:100%; height:38px; margin:4px 0 0 0; font-size:13px; border-radius:10px;" />
            <small style="font-size:11px; color:#64748b;">Se enviará alerta al alcanzar este % del saldo/límite.</small>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Crear Tarjeta',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const nombre = document.getElementById('swal-acc-name')?.value?.trim();
        const tipo = document.getElementById('swal-acc-type')?.value;
        const saldo = parseFloat(document.getElementById('swal-acc-balance')?.value || 0);
        const umbral = parseInt(document.getElementById('swal-acc-threshold')?.value || 80, 10);

        if (!nombre) {
          Swal.showValidationMessage('El nombre de la tarjeta es obligatorio');
          return false;
        }
        return { nombre, tipo, saldo_actual: saldo, umbral_alerta_pct: umbral };
      }
    });

    if (formValues) {
      try {
        await api.createCuenta(formValues);
        mostrarToastExito('¡Tarjeta/Cuenta vinculada!');
        if (onRefreshAll) onRefreshAll();
        cargarDatosAdmin();
      } catch (e) {
        swalMobile.fire({ icon: 'error', title: 'Error', text: e.message || 'No se pudo crear la cuenta' });
      }
    }
  };

  const handleEditarTarjeta = async (cta) => {
    const { value: formValues } = await swalMobile.fire({
      title: `Límites de ${cta.nombre}`,
      html: `
        <div style="text-align:left; display:flex; flex-direction:column; gap:10px; margin-top:6px;">
          <div>
            <label style="font-size:12px; font-weight:700; color:#1e293b;">Nombre:</label>
            <input id="swal-edit-acc-name" class="swal2-input" value="${cta.nombre}" style="width:100%; height:38px; margin:4px 0 0 0; font-size:13px; border-radius:10px;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:#1e293b;">Tipo:</label>
            <select id="swal-edit-acc-type" class="swal2-input" style="width:100%; height:38px; margin:4px 0 0 0; font-size:13px; border-radius:10px;">
              <option value="Tarjeta Débito" ${cta.tipo === 'Tarjeta Débito' ? 'selected' : ''}>Tarjeta Débito</option>
              <option value="Tarjeta Crédito" ${cta.tipo === 'Tarjeta Crédito' ? 'selected' : ''}>Tarjeta Crédito</option>
              <option value="Ahorros" ${cta.tipo === 'Ahorros' ? 'selected' : ''}>Cuenta de Ahorros</option>
              <option value="Efectivo" ${cta.tipo === 'Efectivo' ? 'selected' : ''}>Billetera / Efectivo</option>
            </select>
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:#1e293b;">Saldo disponible (S/):</label>
            <input id="swal-edit-acc-saldo" type="number" step="0.01" class="swal2-input" value="${cta.saldo_actual || 0}" style="width:100%; height:38px; margin:4px 0 0 0; font-size:13px; border-radius:10px;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:#1e293b;">Límite de Alerta de Gasto (%):</label>
            <input id="swal-edit-acc-threshold" type="number" min="10" max="100" class="swal2-input" value="${cta.umbral_alerta_pct || 80}" style="width:100%; height:38px; margin:4px 0 0 0; font-size:13px; border-radius:10px;" />
            <small style="font-size:11px; color:#64748b;">Notificar al admin cuando los gastos consuman el ${cta.umbral_alerta_pct || 80}%.</small>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Guardar Límites',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const nombre = document.getElementById('swal-edit-acc-name')?.value?.trim();
        const tipo = document.getElementById('swal-edit-acc-type')?.value;
        const saldo = parseFloat(document.getElementById('swal-edit-acc-saldo')?.value || 0);
        const umbral = parseInt(document.getElementById('swal-edit-acc-threshold')?.value || 80, 10);

        if (!nombre) {
          Swal.showValidationMessage('El nombre es obligatorio');
          return false;
        }
        return { nombre, tipo, saldo_actual: saldo, umbral_alerta_pct: umbral };
      }
    });

    if (formValues) {
      try {
        await api.updateCuenta(cta.id, formValues);
        mostrarToastExito('Límites actualizados');
        if (onRefreshAll) onRefreshAll();
        cargarDatosAdmin();
      } catch (e) {
        swalMobile.fire({ icon: 'error', title: 'Error', text: e.message || 'No se pudo actualizar la cuenta' });
      }
    }
  };

  const handleEliminarTarjeta = async (cta) => {
    const confirmado = await confirmarAccion({
      titulo: `¿Eliminar ${cta.nombre}?`,
      texto: `Se desvinculará esta tarjeta del presupuesto familiar.`,
      confirmText: 'Sí, eliminar tarjeta',
      cancelText: 'Cancelar',
      icono: 'warning'
    });

    if (confirmado) {
      try {
        await api.deleteCuenta(cta.id);
        mostrarToastExito('Tarjeta eliminada');
        if (onRefreshAll) onRefreshAll();
        cargarDatosAdmin();
      } catch (e) {
        swalMobile.fire({ icon: 'error', title: 'Error', text: e.message || 'No se pudo eliminar la tarjeta' });
      }
    }
  };

  // ========================================================
  // 3. GESTIÓN DE PRESUPUESTOS
  // ========================================================
  const handleCrearPresupuesto = async () => {
    if (cuentas.length === 0) {
      swalMobile.fire({ icon: 'warning', title: 'Sin cuentas', text: 'Primero vincula una tarjeta o cuenta bancaria.' });
      return;
    }

    const { value: formValues } = await swalMobile.fire({
      title: 'Asignar Presupuesto Mensual',
      html: `
        <div style="text-align:left; display:flex; flex-direction:column; gap:10px; margin-top:6px;">
          <div>
            <label style="font-size:12px; font-weight:700; color:#1e293b;">Cuenta asignada:</label>
            <select id="swal-pres-account" class="swal2-input" style="width:100%; height:38px; margin:4px 0 0 0; font-size:13px; border-radius:10px;">
              ${cuentas.map(c => `<option value="${c.id}">${c.nombre} (Saldo: S/ ${parseFloat(c.saldo_actual || 0).toFixed(2)})</option>`).join('')}
            </select>
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:#1e293b;">Límite asignado de gasto (S/):</label>
            <input id="swal-pres-limit" type="number" step="0.01" class="swal2-input" placeholder="2500.00" style="width:100%; height:38px; margin:4px 0 0 0; font-size:13px; border-radius:10px;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:#1e293b;">Saldo restante mes anterior (S/):</label>
            <input id="swal-pres-prev" type="number" step="0.01" class="swal2-input" placeholder="0.00" value="0.00" style="width:100%; height:38px; margin:4px 0 0 0; font-size:13px; border-radius:10px;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:#1e293b;">Periodo / Mes:</label>
            <input id="swal-pres-period" type="date" class="swal2-input" value="${new Date().toISOString().slice(0, 10)}" style="width:100%; height:38px; margin:4px 0 0 0; font-size:13px; border-radius:10px;" />
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Fijar Presupuesto',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const cuentaId = document.getElementById('swal-pres-account')?.value;
        const limite = parseFloat(document.getElementById('swal-pres-limit')?.value || 0);
        const anterior = parseFloat(document.getElementById('swal-pres-prev')?.value || 0);
        const periodo = document.getElementById('swal-pres-period')?.value;

        if (isNaN(limite) || limite <= 0) {
          Swal.showValidationMessage('Ingresa un límite positivo mayor a 0');
          return false;
        }
        return { cuenta_id: cuentaId, limite_asignado: limite, saldo_anterior: anterior, periodo_mes: periodo };
      }
    });

    if (formValues) {
      try {
        await api.createPresupuesto(formValues);
        mostrarToastExito('Presupuesto fijado');
        cargarDatosAdmin();
      } catch (e) {
        swalMobile.fire({ icon: 'error', title: 'Error', text: e.message || 'No se pudo crear el presupuesto' });
      }
    }
  };

  const handleEditarPresupuesto = async (p) => {
    const { value: formValues } = await swalMobile.fire({
      title: `Ajustar Presupuesto`,
      html: `
        <div style="text-align:left; display:flex; flex-direction:column; gap:10px; margin-top:6px;">
          <div>
            <label style="font-size:12px; font-weight:700; color:#1e293b;">Cuenta:</label>
            <input disabled class="swal2-input" value="${p.cuenta_nombre || 'Cuenta #' + p.cuenta_id}" style="width:100%; height:38px; margin:4px 0 0 0; font-size:13px; background:#f8fafc; border-radius:10px;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:#1e293b;">Nuevo Límite mensual (S/):</label>
            <input id="swal-edit-pres-limit" type="number" step="0.01" class="swal2-input" value="${p.limite_asignado}" style="width:100%; height:38px; margin:4px 0 0 0; font-size:13px; border-radius:10px;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:#1e293b;">Saldo arrastre anterior (S/):</label>
            <input id="swal-edit-pres-prev" type="number" step="0.01" class="swal2-input" value="${p.saldo_anterior || 0}" style="width:100%; height:38px; margin:4px 0 0 0; font-size:13px; border-radius:10px;" />
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Actualizar Límite',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const limite = parseFloat(document.getElementById('swal-edit-pres-limit')?.value || 0);
        const anterior = parseFloat(document.getElementById('swal-edit-pres-prev')?.value || 0);
        if (isNaN(limite) || limite <= 0) {
          Swal.showValidationMessage('Ingresa un monto positivo');
          return false;
        }
        return { limite_asignado: limite, saldo_anterior: anterior };
      }
    });

    if (formValues) {
      try {
        await api.updatePresupuesto(p.id, formValues);
        mostrarToastExito('Presupuesto actualizado');
        cargarDatosAdmin();
      } catch (e) {
        swalMobile.fire({ icon: 'error', title: 'Error', text: e.message || 'No se pudo actualizar' });
      }
    }
  };

  const handleEliminarPresupuesto = async (p) => {
    const confirmado = await confirmarAccion({
      titulo: '¿Eliminar este presupuesto?',
      texto: `Se restablecerá el límite de gasto para ${p.cuenta_nombre || 'la cuenta'}.`,
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      icono: 'warning'
    });

    if (confirmado) {
      try {
        await api.deletePresupuesto(p.id);
        mostrarToastExito('Presupuesto eliminado');
        cargarDatosAdmin();
      } catch (e) {
        swalMobile.fire({ icon: 'error', title: 'Error', text: e.message || 'No se pudo eliminar' });
      }
    }
  };

  // ========================================================
  // 4. GESTIÓN DE CATEGORÍAS
  // ========================================================
  const handleCrearCategoria = async () => {
    const { value: formValues } = await swalMobile.fire({
      title: 'Nueva Categoría',
      html: `
        <div style="text-align:left; display:flex; flex-direction:column; gap:10px; margin-top:6px;">
          <div>
            <label style="font-size:12px; font-weight:700; color:#1e293b;">Nombre de la categoría:</label>
            <input id="swal-cat-name" class="swal2-input" placeholder="Ej: Mascotas o Streaming" style="width:100%; height:38px; margin:4px 0 0 0; font-size:13px; border-radius:10px;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:#1e293b;">Tipo:</label>
            <select id="swal-cat-type" class="swal2-input" style="width:100%; height:38px; margin:4px 0 0 0; font-size:13px; border-radius:10px;">
              <option value="GASTO">Gasto</option>
              <option value="INGRESO">Ingreso</option>
            </select>
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:#1e293b;">Icono identificador:</label>
            <select id="swal-cat-icon" class="swal2-input" style="width:100%; height:38px; margin:4px 0 0 0; font-size:13px; border-radius:10px;">
              <option value="utensils">Comida / Restaurante</option>
              <option value="car">Transporte / Auto</option>
              <option value="home">Hogar / Servicios</option>
              <option value="gift">Regalos / Entretenimiento</option>
              <option value="heart-pulse">Salud / Médico</option>
              <option value="graduation-cap">Educación</option>
              <option value="wallet">Sueldo / Nómina</option>
              <option value="shopping-bag">Compras</option>
              <option value="receipt">Facturas / Impuestos</option>
              <option value="more-horizontal">Otros</option>
            </select>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Crear Categoría',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const nombre = document.getElementById('swal-cat-name')?.value?.trim();
        const tipo = document.getElementById('swal-cat-type')?.value;
        const icono = document.getElementById('swal-cat-icon')?.value;

        if (!nombre) {
          Swal.showValidationMessage('El nombre es obligatorio');
          return false;
        }
        return { nombre, tipo, icono };
      }
    });

    if (formValues) {
      try {
        await api.createCategoria(formValues);
        mostrarToastExito('¡Categoría creada!');
        if (onRefreshAll) onRefreshAll();
        cargarDatosAdmin();
      } catch (e) {
        swalMobile.fire({ icon: 'error', title: 'Error', text: e.message || 'No se pudo crear la categoría' });
      }
    }
  };

  const handleEliminarCategoria = async (cat) => {
    const confirmado = await confirmarAccion({
      titulo: `¿Eliminar categoría ${cat.nombre}?`,
      texto: 'No se podrá eliminar si ya tiene gastos o ingresos registrados.',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      icono: 'warning'
    });

    if (confirmado) {
      try {
        await api.deleteCategoria(cat.id);
        mostrarToastExito('Categoría eliminada');
        if (onRefreshAll) onRefreshAll();
        cargarDatosAdmin();
      } catch (e) {
        swalMobile.fire({
          icon: 'error',
          title: 'No se puede eliminar',
          text: e.message || 'La categoría contiene movimientos asociados en el historial.'
        });
      }
    }
  };

  // ========================================================
  // 5. GESTIÓN DE METAS DE AHORRO
  // ========================================================
  const handleCrearMeta = async () => {
    const { value: formValues } = await swalMobile.fire({
      title: 'Nueva Meta Familiar',
      html: `
        <div style="text-align:left; display:flex; flex-direction:column; gap:10px; margin-top:6px;">
          <div>
            <label style="font-size:12px; font-weight:700; color:#1e293b;">Nombre del objetivo:</label>
            <input id="swal-meta-name" class="swal2-input" placeholder="Ej: Viaje a Cusco 2027" style="width:100%; height:38px; margin:4px 0 0 0; font-size:13px; border-radius:10px;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:#1e293b;">Monto objetivo (S/):</label>
            <input id="swal-meta-target" type="number" step="0.01" class="swal2-input" placeholder="8000.00" style="width:100%; height:38px; margin:4px 0 0 0; font-size:13px; border-radius:10px;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:#1e293b;">Monto inicial ahorrado (S/):</label>
            <input id="swal-meta-curr" type="number" step="0.01" class="swal2-input" value="0.00" style="width:100%; height:38px; margin:4px 0 0 0; font-size:13px; border-radius:10px;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:700; color:#1e293b;">Fecha objetivo:</label>
            <input id="swal-meta-date" type="date" class="swal2-input" value="2027-01-30" style="width:100%; height:38px; margin:4px 0 0 0; font-size:13px; border-radius:10px;" />
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Crear Meta',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const nombre = document.getElementById('swal-meta-name')?.value?.trim();
        const objetivo = parseFloat(document.getElementById('swal-meta-target')?.value || 0);
        const actual = parseFloat(document.getElementById('swal-meta-curr')?.value || 0);
        const fecha = document.getElementById('swal-meta-date')?.value;

        if (!nombre) {
          Swal.showValidationMessage('El nombre de la meta es obligatorio');
          return false;
        }
        if (isNaN(objetivo) || objetivo <= 0) {
          Swal.showValidationMessage('El monto objetivo debe ser mayor a 0');
          return false;
        }
        return { nombre, monto_objetivo: objetivo, monto_actual: actual, fecha_limite: fecha };
      }
    });

    if (formValues) {
      await api.createMeta(formValues);
      mostrarToastExito('¡Meta de ahorro creada!');
      cargarDatosAdmin();
    }
  };

  const handleAportarMeta = async (m) => {
    const { value: aporte } = await swalMobile.fire({
      title: `Aportar a ${m.nombre}`,
      text: `Monto actual: S/ ${parseFloat(m.monto_actual || 0).toFixed(2)} de S/ ${parseFloat(m.monto_objetivo).toFixed(2)}`,
      input: 'number',
      inputPlaceholder: 'S/ 200.00',
      showCancelButton: true,
      confirmButtonText: 'Aportar Dinero',
      cancelButtonText: 'Cancelar',
      inputValidator: (val) => {
        if (!val || parseFloat(val) <= 0) {
          return 'Ingresa un monto positivo mayor a 0';
        }
      }
    });

    if (aporte) {
      await api.aportarMeta(m.id, parseFloat(aporte));
      mostrarToastExito(`¡S/ ${parseFloat(aporte).toFixed(2)} aportados a la meta!`);
      cargarDatosAdmin();
    }
  };

  const handleEliminarMeta = async (m) => {
    const confirmado = await confirmarAccion({
      titulo: `¿Eliminar meta ${m.nombre}?`,
      texto: 'Esta meta dejará de estar visible en el progreso familiar.',
      confirmText: 'Sí, eliminar meta',
      cancelText: 'Cancelar',
      icono: 'warning'
    });

    if (confirmado) {
      await api.deleteMeta(m.id);
      mostrarToastExito('Meta eliminada');
      cargarDatosAdmin();
    }
  };

  // Filtrado de categorías
  const filteredCategorias = categorias.filter(c => {
    if (catFilter === 'ALL') return true;
    return c.tipo?.toUpperCase() === catFilter;
  });

  // Cálculo de totales para el hero
  const totalPresupuestoHogar = presupuestos.reduce((acc, p) => acc + (parseFloat(p.limite_asignado) || 0), 0);
  const totalSaldosTarjetas = cuentas.reduce((acc, c) => acc + (parseFloat(c.saldo_actual) || 0), 0);

  return (
    <div className="admin-view-wrapper">
      {/* 1. Header FamiCash Admin */}
      <header className="mobile-app-header admin-custom-header">
        <div className="admin-header-title-box">
          <div className="admin-badge-pill">
            <ShieldCheck size={14} />
            <span>Admin Familiar</span>
          </div>
          <h2 className="admin-screen-heading">Panel de Control</h2>
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

      {/* 2. Métricas rápidas del Admin */}
      <div className="admin-stats-strip">
        <div className="admin-stat-chip">
          <span className="stat-chip-num">{usuarios.length}</span>
          <span className="stat-chip-lbl">Miembros</span>
        </div>
        <div className="admin-stat-chip">
          <span className="stat-chip-num">{cuentas.length}</span>
          <span className="stat-chip-lbl">Tarjetas</span>
        </div>
        <div className="admin-stat-chip highlight-chip">
          <span className="stat-chip-num">S/ {totalSaldosTarjetas.toLocaleString('es-PE', { maximumFractionDigits: 0 })}</span>
          <span className="stat-chip-lbl">En Cuentas</span>
        </div>
        <div className="admin-stat-chip">
          <span className="stat-chip-num">{metas.length}</span>
          <span className="stat-chip-lbl">Metas</span>
        </div>
      </div>

      {/* 3. Selector de Pestañas de Gestión */}
      <div className="admin-tabs-segmented-bar">
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'familia' ? 'active' : ''}`}
          onClick={() => setActiveTab('familia')}
        >
          <Users size={16} />
          <span>Familia</span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'tarjetas' ? 'active' : ''}`}
          onClick={() => setActiveTab('tarjetas')}
        >
          <CreditCard size={16} />
          <span>Tarjetas</span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'presupuesto' ? 'active' : ''}`}
          onClick={() => setActiveTab('presupuesto')}
        >
          <PieChart size={16} />
          <span>Presupuesto</span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'categorias' ? 'active' : ''}`}
          onClick={() => setActiveTab('categorias')}
        >
          <Tag size={16} />
          <span>Categorías</span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'metas' ? 'active' : ''}`}
          onClick={() => setActiveTab('metas')}
        >
          <Target size={16} />
          <span>Metas</span>
        </button>
      </div>

      {/* 4. Área de Contenido Dinámico por Pestaña */}
      <div className="admin-scroll-body">
        {/* ============================================================== */}
        {/* SECCIÓN 1: FAMILIA Y ROLES */}
        {/* ============================================================== */}
        {activeTab === 'familia' && (
          <div className="admin-section-pane">
            <div className="section-head-bar">
              <div>
                <h3 className="section-head-title">Personas del Hogar</h3>
                <span className="section-head-sub">Gestiona roles, accesos y permisos</span>
              </div>
              <button
                type="button"
                className="admin-add-btn"
                onClick={handleCrearUsuario}
                title="Agregar nuevo familiar"
              >
                <Plus size={16} />
                <span>Invitar</span>
              </button>
            </div>

            <div className="admin-cards-stack">
              {usuarios.map((u) => {
                const isAdmin = u.rol === 'Administrador Familiar' || u.rolId === 1;
                return (
                  <div key={u.id} className="admin-member-card">
                    <div className="member-avatar-box">
                      <span className="member-avatar-char">
                        {u.nombre ? u.nombre.charAt(0).toUpperCase() : 'U'}
                      </span>
                      {isAdmin && <span className="crown-badge" title="Administrador">👑</span>}
                    </div>

                    <div className="member-main-col">
                      <div className="member-name-row">
                        <strong className="member-full-name">{u.nombre}</strong>
                        {u.id === usuario?.id && <span className="you-badge">Tú</span>}
                      </div>
                      <span className="member-email-txt">{u.email}</span>
                      <div className="member-role-badge-row">
                        <span className={`role-pill-badge ${isAdmin ? 'admin-pill' : 'regular-pill'}`}>
                          {u.rol || 'Miembro Familiar'}
                        </span>
                        <span className={`status-dot-badge ${u.activo ? 'dot-active' : 'dot-inactive'}`}>
                          {u.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </div>

                    <div className="member-actions-col">
                      <button
                        type="button"
                        className="admin-edit-action-btn"
                        onClick={() => handleEditarUsuario(u)}
                        title="Editar rol y datos"
                      >
                        <Pencil size={15} />
                      </button>
                      {u.id !== usuario?.id && (
                        <button
                          type="button"
                          className="admin-delete-action-btn"
                          onClick={() => handleEliminarUsuario(u)}
                          title="Desvincular del hogar"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECCIÓN 2: TARJETAS Y LÍMITES */}
        {/* ============================================================== */}
        {activeTab === 'tarjetas' && (
          <div className="admin-section-pane">
            <div className="section-head-bar">
              <div>
                <h3 className="section-head-title">Tarjetas y Cuentas</h3>
                <span className="section-head-sub">Control de saldos y umbrales de alerta</span>
              </div>
              <button
                type="button"
                className="admin-add-btn"
                onClick={handleCrearTarjeta}
                title="Vincular nueva tarjeta"
              >
                <Plus size={16} />
                <span>Tarjeta</span>
              </button>
            </div>

            <div className="admin-cards-stack">
              {cuentas.map((cta) => {
                const umbral = cta.umbral_alerta_pct || 80;
                return (
                  <div key={cta.id} className="admin-card-item">
                    <div className="card-top-row">
                      <div className="card-chip-badge">
                        <CreditCard size={18} />
                        <span className="card-type-chip">{cta.tipo}</span>
                      </div>
                      <span className="card-threshold-tag">
                        Alerta al {umbral}%
                      </span>
                    </div>

                    <div className="card-middle-row">
                      <h4 className="card-title-text">{cta.nombre}</h4>
                      <div className="card-balance-highlight">
                        <span className="balance-currency">S/</span>
                        <span className="balance-figure">
                          {parseFloat(cta.saldo_actual || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>

                    {/* Barra de progreso de límite */}
                    <div className="threshold-meter-wrap">
                      <div className="meter-labels">
                        <span>Consumo seguro</span>
                        <span className="threshold-label-bold">Umbral máx: {umbral}%</span>
                      </div>
                      <div className="threshold-track">
                        <div
                          className="threshold-fill"
                          style={{
                            width: `${Math.min(100, umbral)}%`,
                            backgroundColor: umbral > 85 ? '#ef4444' : '#10b981'
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="card-footer-actions">
                      <button
                        type="button"
                        className="card-secondary-btn"
                        onClick={() => handleEditarTarjeta(cta)}
                      >
                        <Sliders size={14} />
                        <span>Ajustar Límites</span>
                      </button>
                      <button
                        type="button"
                        className="card-danger-btn"
                        onClick={() => handleEliminarTarjeta(cta)}
                        title="Eliminar tarjeta"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECCIÓN 3: PRESUPUESTO DEL HOGAR */}
        {/* ============================================================== */}
        {activeTab === 'presupuesto' && (
          <div className="admin-section-pane">
            <div className="section-head-bar">
              <div>
                <h3 className="section-head-title">Presupuesto Mensual</h3>
                <span className="section-head-sub">Topes de gasto por cuenta y periodo</span>
              </div>
              <button
                type="button"
                className="admin-add-btn"
                onClick={handleCrearPresupuesto}
                title="Fijar presupuesto mensual"
              >
                <Plus size={16} />
                <span>Asignar</span>
              </button>
            </div>

            {/* Tarjeta Hero de Presupuesto Global */}
            <div className="admin-budget-hero">
              <span className="budget-hero-label">Presupuesto Asignado Octubre</span>
              <h2 className="budget-hero-amount">
                S/ {totalPresupuestoHogar > 0 ? totalPresupuestoHogar.toLocaleString('es-PE', { minimumFractionDigits: 2 }) : '5,000.00'}
              </h2>
              <div className="budget-hero-sub-row">
                <span className="budget-sub-item">
                  Cuentas presupuestadas: <strong>{presupuestos.length || cuentas.length}</strong>
                </span>
                <span className="budget-sub-item">
                  Periodo: <strong>Octubre 2026</strong>
                </span>
              </div>
            </div>

            <div className="admin-cards-stack">
              {presupuestos.length === 0 ? (
                <div className="admin-empty-state-card">
                  <PieChart size={32} className="empty-state-icon" />
                  <h4>No hay presupuestos asignados aún</h4>
                  <p>Fija límites de gasto mensuales para evitar sobrecostos en tus cuentas.</p>
                  <button
                    type="button"
                    className="empty-create-btn"
                    onClick={handleCrearPresupuesto}
                  >
                    Asignar Primer Presupuesto
                  </button>
                </div>
              ) : (
                presupuestos.map((p) => (
                  <div key={p.id} className="admin-budget-card">
                    <div className="budget-card-head">
                      <div className="budget-account-info">
                        <Wallet size={18} className="budget-account-icon" />
                        <strong>{p.cuenta_nombre || 'Cuenta #' + p.cuenta_id}</strong>
                      </div>
                      <span className="budget-period-badge">
                        {p.periodo_mes ? new Date(p.periodo_mes).toLocaleDateString('es-PE', { month: 'short', year: 'numeric' }) : 'Mes actual'}
                      </span>
                    </div>

                    <div className="budget-metrics-grid">
                      <div className="budget-metric-col">
                        <span className="metric-col-label">Límite mensual</span>
                        <strong className="metric-col-val text-green">
                          S/ {parseFloat(p.limite_asignado || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </strong>
                      </div>
                      <div className="budget-metric-col">
                        <span className="metric-col-label">Saldo arrastre</span>
                        <strong className="metric-col-val text-slate">
                          S/ {parseFloat(p.saldo_anterior || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </strong>
                      </div>
                      <div className="budget-metric-col">
                        <span className="metric-col-label">Total disponible</span>
                        <strong className="metric-col-val text-forest">
                          S/ {parseFloat(p.total_disponible || (p.limite_asignado + (p.saldo_anterior || 0))).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </strong>
                      </div>
                    </div>

                    <div className="budget-card-actions">
                      <button
                        type="button"
                        className="budget-edit-btn"
                        onClick={() => handleEditarPresupuesto(p)}
                      >
                        <Pencil size={13} />
                        <span>Ajustar Límite</span>
                      </button>
                      <button
                        type="button"
                        className="budget-delete-btn"
                        onClick={() => handleEliminarPresupuesto(p)}
                        title="Eliminar presupuesto"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECCIÓN 4: CATEGORÍAS */}
        {/* ============================================================== */}
        {activeTab === 'categorias' && (
          <div className="admin-section-pane">
            <div className="section-head-bar">
              <div>
                <h3 className="section-head-title">Categorías Financieras</h3>
                <span className="section-head-sub">{categorias.length} categorías activas</span>
              </div>
              <button
                type="button"
                className="admin-add-btn"
                onClick={handleCrearCategoria}
                title="Crear nueva categoría"
              >
                <Plus size={16} />
                <span>Categoría</span>
              </button>
            </div>

            {/* Filtro Gasto / Ingreso */}
            <div className="cat-filter-pills-row">
              <button
                type="button"
                className={`cat-pill-filter ${catFilter === 'ALL' ? 'active' : ''}`}
                onClick={() => setCatFilter('ALL')}
              >
                Todas ({categorias.length})
              </button>
              <button
                type="button"
                className={`cat-pill-filter ${catFilter === 'GASTO' ? 'active' : ''}`}
                onClick={() => setCatFilter('GASTO')}
              >
                Gastos ({categorias.filter(c => c.tipo === 'GASTO').length})
              </button>
              <button
                type="button"
                className={`cat-pill-filter ${catFilter === 'INGRESO' ? 'active' : ''}`}
                onClick={() => setCatFilter('INGRESO')}
              >
                Ingresos ({categorias.filter(c => c.tipo === 'INGRESO').length})
              </button>
            </div>

            <div className="admin-categories-grid">
              {filteredCategorias.map((c) => {
                const isGasto = c.tipo === 'GASTO';
                return (
                  <div key={c.id} className="admin-cat-card">
                    <div className={`cat-icon-avatar ${isGasto ? 'icon-gasto' : 'icon-ingreso'}`}>
                      {getCategoryIcon(c.icono || c.nombre)}
                    </div>
                    <div className="cat-info-col">
                      <strong className="cat-title-name">{c.nombre}</strong>
                      <span className={`cat-type-subtag ${isGasto ? 'tag-gasto' : 'tag-ingreso'}`}>
                        {c.tipo}
                      </span>
                    </div>
                    <button
                      type="button"
                      className="cat-delete-icon-btn"
                      onClick={() => handleEliminarCategoria(c)}
                      title="Eliminar categoría"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* SECCIÓN 5: METAS DE AHORRO FAMILIAR */}
        {/* ============================================================== */}
        {activeTab === 'metas' && (
          <div className="admin-section-pane">
            <div className="section-head-bar">
              <div>
                <h3 className="section-head-title">Metas de Ahorro Familiar</h3>
                <span className="section-head-sub">Objetivos compartidos del hogar</span>
              </div>
              <button
                type="button"
                className="admin-add-btn"
                onClick={handleCrearMeta}
                title="Crear nueva meta de ahorro"
              >
                <Plus size={16} />
                <span>Nueva Meta</span>
              </button>
            </div>

            <div className="admin-cards-stack">
              {metas.map((m) => {
                const pct = Math.min(100, Math.round(((m.monto_actual || 0) / (m.monto_objetivo || 1)) * 100));
                const restante = Math.max(0, (m.monto_objetivo || 0) - (m.monto_actual || 0));
                return (
                  <div key={m.id} className="admin-goal-card">
                    <div className="goal-card-top">
                      <div className="goal-title-wrap">
                        <span className="goal-badge-icon">🎯</span>
                        <div>
                          <h4 className="goal-heading-txt">{m.nombre}</h4>
                          <span className="goal-date-hint">
                            Meta para {m.fecha_limite || '2027'}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="goal-delete-btn"
                        onClick={() => handleEliminarMeta(m)}
                        title="Eliminar meta"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="goal-progress-section">
                      <div className="goal-figures-row">
                        <span className="goal-saved-txt">
                          S/ {parseFloat(m.monto_actual || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="goal-target-txt">
                          Objetivo: S/ {parseFloat(m.monto_objetivo || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="goal-bar-track">
                        <div
                          className="goal-bar-fill"
                          style={{ width: `${pct}%`, backgroundColor: m.color || '#10b981' }}
                        ></div>
                      </div>

                      <div className="goal-bar-bottom-row">
                        <span className="goal-pct-txt">{pct}% completado</span>
                        <span className="goal-rem-txt">Faltan S/ {restante.toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>

                    <div className="goal-actions-row">
                      <button
                        type="button"
                        className="goal-contribute-btn"
                        onClick={() => handleAportarMeta(m)}
                      >
                        <DollarSign size={15} />
                        <span>Aportar Fondos</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
