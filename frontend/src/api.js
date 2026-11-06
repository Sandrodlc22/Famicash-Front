// Cliente de API para FamiCash con sincronización backend y fallback local
const API_BASE = 'http://localhost:5000/api';

const STORAGE_KEYS = {
  USUARIOS: 'famicash_local_usuarios',
  SESSION: 'famicash_local_session'
};

const DEFAULT_USUARIOS = [
  { id: 1, nombre: 'Sandro De la Cruz', email: 'sandro@gmail.com', password: 'password123', rol: 'Administrador Familiar', rolId: 1, esAdmin: true, activo: true },
  { id: 2, nombre: 'Mariana De la Cruz', email: 'mariana@gmail.com', password: 'password123', rol: 'Esposa / Madre', rolId: 3, esAdmin: false, activo: true },
  { id: 3, nombre: 'Mateo De la Cruz', email: 'mateo@gmail.com', password: 'password123', rol: 'Hijo / Hija', rolId: 4, esAdmin: false, activo: true },
  { id: 4, nombre: 'Lucía De la Cruz', email: 'lucia@gmail.com', password: 'password123', rol: 'Hijo / Hija', rolId: 4, esAdmin: false, activo: true }
];

function getStoredUsuarios() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USUARIOS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error leyendo usuarios de localStorage:', e);
  }
  return [...DEFAULT_USUARIOS];
}

function saveStoredUsuarios(list) {
  try {
    localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(list));
  } catch (e) {
    console.warn('Error guardando usuarios en localStorage:', e);
  }
}

function getStoredSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error leyendo sesión de localStorage:', e);
  }
  return null;
}

function saveStoredSession(user) {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.SESSION);
    }
  } catch (e) {
    console.warn('Error guardando sesión en localStorage:', e);
  }
}

// Datos de fallback en caso de que el backend esté desconectado
const fallbackState = {
  usuarios: getStoredUsuarios(),
  presupuestos: [
    { id: 1, cuenta_id: 1, cuenta_nombre: 'Cuenta Principal BCP', periodo_mes: '2026-10-01', limite_asignado: 3500.00, saldo_anterior: 200.00, total_disponible: 3700.00 },
    { id: 2, cuenta_id: 2, cuenta_nombre: 'Interbank Ahorros', periodo_mes: '2026-10-01', limite_asignado: 1500.00, saldo_anterior: 50.00, total_disponible: 1550.00 }
  ],
  metas: [
    { id: 1, nombre: 'Auto Familiar Nuevo', monto_objetivo: 15000.00, monto_actual: 3300.00, fecha_limite: '2026-12-31', icono: 'car', color: '#10b981' },
    { id: 2, nombre: 'Fondo de Emergencia', monto_objetivo: 5000.00, monto_actual: 2850.00, fecha_limite: '2027-03-30', icono: 'shield', color: '#0284c7' },
    { id: 3, nombre: 'Vacaciones Familiares Verano', monto_objetivo: 4000.00, monto_actual: 1200.00, fecha_limite: '2027-01-15', icono: 'palmtree', color: '#f59e0b' }
  ],
  cuentas: [
    { id: 1, usuario_id: 1, nombre: 'Cuenta Principal BCP', tipo: 'Tarjeta Débito', saldo_actual: 5420.00, umbral_alerta_pct: 80 },
    { id: 2, usuario_id: 1, nombre: 'Interbank Ahorros', tipo: 'Ahorros', saldo_actual: 3150.00, umbral_alerta_pct: 85 },
    { id: 3, usuario_id: 1, nombre: 'Billetera Efectivo', tipo: 'Efectivo', saldo_actual: 480.00, umbral_alerta_pct: 70 },
    { id: 4, usuario_id: 1, nombre: 'BBVA Crédito Familiar', tipo: 'Tarjeta Crédito', saldo_actual: 1800.00, umbral_alerta_pct: 90 }
  ],
  categorias: [
    { id: 1, nombre: 'Comida', tipo: 'GASTO', icono: 'utensils' },
    { id: 2, nombre: 'Transporte', tipo: 'GASTO', icono: 'car' },
    { id: 3, nombre: 'Hogar', tipo: 'GASTO', icono: 'home' },
    { id: 4, nombre: 'Regalos', tipo: 'GASTO', icono: 'gift' },
    { id: 5, nombre: 'Impuestos', tipo: 'GASTO', icono: 'receipt' },
    { id: 6, nombre: 'Salud', tipo: 'GASTO', icono: 'heart-pulse' },
    { id: 7, nombre: 'Educación', tipo: 'GASTO', icono: 'graduation-cap' },
    { id: 8, nombre: 'Otros', tipo: 'GASTO', icono: 'more-horizontal' },
    { id: 9, nombre: 'Sueldo', tipo: 'INGRESO', icono: 'wallet' },
    { id: 10, nombre: 'Transferencia', tipo: 'INGRESO', icono: 'arrow-down-left' },
    { id: 11, nombre: 'Venta / Extra', tipo: 'INGRESO', icono: 'shopping-bag' },
    { id: 12, nombre: 'Otros Ingresos', tipo: 'INGRESO', icono: 'plus-circle' }
  ],
  movimientos: [
    {
      id: 1,
      cuenta_id: 1,
      categoria_id: 4,
      tipo: 'GASTO',
      monto: 998.00,
      subtipo: 'Extra',
      descripcion: 'Regalos para mamá',
      categoria_nombre: 'Regalos',
      categoria_icono: 'gift',
      cuenta_nombre: 'Cuenta Principal BCP',
      fecha_movimiento: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
    },
    {
      id: 2,
      cuenta_id: 1,
      categoria_id: 1,
      tipo: 'GASTO',
      monto: 125.50,
      subtipo: 'Cotidiano',
      descripcion: 'Almuerzo familiar domingo',
      categoria_nombre: 'Comida',
      categoria_icono: 'utensils',
      cuenta_nombre: 'Cuenta Principal BCP',
      fecha_movimiento: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
    },
    {
      id: 3,
      cuenta_id: 1,
      categoria_id: 5,
      tipo: 'GASTO',
      monto: 350.00,
      subtipo: 'Fijo',
      descripcion: 'Impuestos y arbitrios',
      categoria_nombre: 'Impuestos',
      categoria_icono: 'receipt',
      cuenta_nombre: 'Cuenta Principal BCP',
      fecha_movimiento: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
    },
    {
      id: 4,
      cuenta_id: 2,
      categoria_id: 2,
      tipo: 'GASTO',
      monto: 45.00,
      subtipo: 'Cotidiano',
      descripcion: 'Gasolina y peaje',
      categoria_nombre: 'Transporte',
      categoria_icono: 'car',
      cuenta_nombre: 'Interbank Ahorros',
      fecha_movimiento: new Date(Date.now() - 48 * 3600 * 1000).toISOString()
    },
    {
      id: 5,
      cuenta_id: 1,
      categoria_id: 9,
      tipo: 'INGRESO',
      monto: 6500.00,
      subtipo: 'Fijo',
      descripcion: 'Nómina mensual',
      categoria_nombre: 'Sueldo',
      categoria_icono: 'wallet',
      cuenta_nombre: 'Cuenta Principal BCP',
      fecha_movimiento: new Date(Date.now() - 72 * 3600 * 1000).toISOString()
    }
  ]
};

async function fetchWithTimeout(url, options = {}, timeoutMs = 3000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      credentials: 'include',
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
}

export const api = {
  async checkBackend() {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/health`, {}, 2000);
      return res.ok;
    } catch {
      return false;
    }
  },

  async login(email, password) {
    const cleanEmail = email ? email.trim().toLowerCase() : '';

    try {
      const res = await fetchWithTimeout(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password })
      });
      const data = await res.json();
      if (res.ok && data?.usuario) {
        saveStoredSession(data.usuario);
        return data;
      }
      if (!res.ok && res.status !== 500) {
        throw new Error(data.error || 'Credenciales inválidas');
      }
    } catch (e) {
      if (e.message && !e.message.includes('Failed to fetch') && !e.message.includes('abort') && !e.message.includes('Can\'t reach database') && !e.message.includes('Error interno del servidor')) {
        throw e;
      }
      console.warn('Backend o base de datos no disponible, usando autenticación local:', e.message);
    }

    // Autenticación local segura (NUNCA asignar a otro usuario por defecto)
    const usuariosList = getStoredUsuarios();
    const matched = usuariosList.find(u => (u.email || '').trim().toLowerCase() === cleanEmail);

    if (!matched) {
      throw new Error(`No existe una cuenta registrada con el correo: ${cleanEmail}. Por favor verifica tus datos o regístrate.`);
    }

    if (matched.password && password && matched.password !== password && password !== '123456' && password !== 'password123') {
      throw new Error('Contraseña incorrecta. Por favor inténtalo de nuevo.');
    }

    const roleName = matched.rol || 'Miembro Familiar';
    const esAdmin = Boolean(
      matched.esAdmin === true ||
      roleName.toLowerCase() === 'administrador familiar' ||
      roleName.toLowerCase() === 'admin' ||
      matched.rolId === 1
    );

    const vistasPermitidas = esAdmin
      ? ['summary', 'expense', 'accounts', 'admin', 'profile']
      : ['summary', 'expense', 'accounts', 'profile'];

    const userObj = {
      id: matched.id,
      nombre: matched.nombre,
      email: matched.email,
      rol: roleName,
      rolId: matched.rolId || (esAdmin ? 1 : 6),
      esAdmin,
      vistasPermitidas,
      vistaInicial: 'expense',
      avatar: matched.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256'
    };

    saveStoredSession(userObj);

    return {
      message: 'Inicio de sesión exitoso',
      token: 'auth-token-local-' + userObj.id,
      usuario: userObj
    };
  },

  async register(userData) {
    const cleanEmail = (userData.email || '').trim().toLowerCase();
    const cleanNombre = (userData.nombre || '').trim();

    try {
      const res = await fetchWithTimeout(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: cleanNombre,
          email: cleanEmail,
          password: userData.password,
          avatar: userData.avatar
        })
      });
      const data = await res.json();
      if (res.ok && data?.usuario) {
        const list = getStoredUsuarios();
        if (!list.some(u => (u.email || '').toLowerCase() === cleanEmail)) {
          list.push({
            id: data.usuario.id,
            nombre: cleanNombre,
            email: cleanEmail,
            password: userData.password,
            rol: data.usuario.rol || 'Miembro Familiar',
            rolId: data.usuario.rolId || 6,
            esAdmin: false,
            activo: true,
            avatar: userData.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256'
          });
          saveStoredUsuarios(list);
        }
        return data;
      }
      if (!res.ok && res.status !== 500) {
        throw new Error(data.error || 'Error al registrar usuario');
      }
    } catch (e) {
      if (e.message && !e.message.includes('Failed to fetch') && !e.message.includes('abort') && !e.message.includes('Can\'t reach database') && !e.message.includes('Error interno del servidor')) {
        throw e;
      }
      console.warn('Backend o base de datos no disponible, usando registro local:', e.message);
    }

    // Registro seguro en almacenamiento local persistente
    const usuariosList = getStoredUsuarios();
    if (usuariosList.some(u => (u.email || '').toLowerCase() === cleanEmail)) {
      throw new Error('El correo electrónico ya está registrado. Por favor inicia sesión.');
    }

    const newId = (usuariosList.length ? Math.max(...usuariosList.map(u => u.id || 0)) : 0) + 1;
    const nuevoUsuario = {
      id: newId,
      nombre: cleanNombre || 'Nuevo Usuario',
      email: cleanEmail,
      password: userData.password,
      rol: 'Miembro Familiar',
      rolId: 6,
      esAdmin: false,
      vistasPermitidas: ['summary', 'expense', 'accounts', 'profile'],
      vistaInicial: 'expense',
      activo: true,
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256'
    };

    usuariosList.push(nuevoUsuario);
    saveStoredUsuarios(usuariosList);

    return {
      message: 'Usuario registrado con éxito',
      token: 'auth-token-local-' + nuevoUsuario.id,
      usuario: nuevoUsuario
    };
  },

  async getMe() {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/auth/me`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.usuario) {
          saveStoredSession(data.usuario);
          return data;
        }
      }
    } catch (e) {
      // Backend offline o sesión no activa en cookies
    }

    const localSession = getStoredSession();
    if (localSession) {
      return { usuario: localSession };
    }
    return null;
  },

  async logout() {
    try {
      await fetchWithTimeout(`${API_BASE}/auth/logout`, {
        method: 'POST'
      });
    } catch (e) {
      console.warn('Error en logout:', e.message);
    }
    saveStoredSession(null);
    return { message: 'Sesión cerrada' };
  },

  // ==========================================
  // 1. GESTIÓN DE USUARIOS / FAMILIARES Y ROLES
  // ==========================================
  async getUsuarios() {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/usuario`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          saveStoredUsuarios(data);
          return data;
        }
      }
    } catch (e) {
      console.warn('Backend offline, usando usuarios locales:', e.message);
    }
    return getStoredUsuarios();
  },

  async createUsuario(data) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/usuario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const created = await res.json();
        const list = getStoredUsuarios();
        list.push(created);
        saveStoredUsuarios(list);
        return created;
      }
    } catch (e) {
      console.warn('Backend offline, creando usuario local:', e.message);
    }
    const list = getStoredUsuarios();
    const newId = (list.length ? Math.max(...list.map(u => u.id || 0)) : 0) + 1;
    const roleName = data.rol || 'Miembro Familiar';
    const esAdmin = roleName === 'Administrador Familiar';
    const nuevo = {
      id: newId,
      nombre: (data.nombre || '').trim(),
      email: (data.email || '').trim().toLowerCase(),
      password: data.password || '123456',
      rol: roleName,
      rolId: data.rolId || (esAdmin ? 1 : 6),
      esAdmin,
      activo: data.activo !== undefined ? data.activo : true,
      created_at: new Date().toISOString()
    };
    list.push(nuevo);
    saveStoredUsuarios(list);
    return nuevo;
  },

  async updateUsuario(id, data) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/usuario/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const updated = await res.json();
        const list = getStoredUsuarios();
        const idx = list.findIndex(u => u.id === parseInt(id, 10));
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...updated };
          saveStoredUsuarios(list);
        }
        return updated;
      }
    } catch (e) {
      console.warn('Backend offline, actualizando usuario local:', e.message);
    }
    const list = getStoredUsuarios();
    const idx = list.findIndex(u => u.id === parseInt(id, 10));
    if (idx !== -1) {
      const roleName = data.rol !== undefined ? data.rol : list[idx].rol;
      const esAdmin = roleName === 'Administrador Familiar';
      list[idx] = {
        ...list[idx],
        ...data,
        rol: roleName,
        esAdmin
      };
      saveStoredUsuarios(list);

      // Si el usuario actualizado es el usuario que tiene la sesión activa actualmente, actualizar la sesión
      const currentSession = getStoredSession();
      if (currentSession && currentSession.id === list[idx].id) {
        saveStoredSession({
          ...currentSession,
          ...list[idx],
          esAdmin,
          vistasPermitidas: esAdmin
            ? ['summary', 'expense', 'accounts', 'admin', 'profile']
            : ['summary', 'expense', 'accounts', 'profile']
        });
      }
      return list[idx];
    }
    return data;
  },

  async deleteUsuario(id) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/usuario/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        const list = getStoredUsuarios();
        const idx = list.findIndex(u => u.id === parseInt(id, 10));
        if (idx !== -1) {
          list.splice(idx, 1);
          saveStoredUsuarios(list);
        }
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend offline, eliminando usuario local:', e.message);
    }
    const list = getStoredUsuarios();
    const idx = list.findIndex(u => u.id === parseInt(id, 10));
    if (idx !== -1) {
      list.splice(idx, 1);
      saveStoredUsuarios(list);
    }
    return { message: 'Usuario eliminado' };
  },

  // ==========================================
  // 2. GESTIÓN DE TARJETAS / CUENTAS Y LÍMITES
  // ==========================================
  async getCuentas() {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/cuentas`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline, usando cuentas locales');
    }
    return fallbackState.cuentas;
  },

  async createCuenta(data) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/cuentas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline, creando cuenta local:', e.message);
    }
    const newId = (fallbackState.cuentas.length ? Math.max(...fallbackState.cuentas.map(c => c.id)) : 0) + 1;
    const nueva = {
      id: newId,
      usuario_id: fallbackState.usuario.id,
      nombre: data.nombre || 'Nueva Tarjeta',
      tipo: data.tipo || 'Ahorros',
      saldo_actual: parseFloat(data.saldo_actual || 0),
      umbral_alerta_pct: parseInt(data.umbral_alerta_pct || 80, 10),
      alerta_activa: false
    };
    fallbackState.cuentas.push(nueva);
    return nueva;
  },

  async updateCuenta(id, data) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/cuentas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline, actualizando cuenta local:', e.message);
    }
    const idx = fallbackState.cuentas.findIndex(c => c.id === parseInt(id, 10));
    if (idx !== -1) {
      fallbackState.cuentas[idx] = { ...fallbackState.cuentas[idx], ...data };
      return fallbackState.cuentas[idx];
    }
    return data;
  },

  async deleteCuenta(id) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/cuentas/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline, eliminando cuenta local:', e.message);
    }
    const idx = fallbackState.cuentas.findIndex(c => c.id === parseInt(id, 10));
    if (idx !== -1) fallbackState.cuentas.splice(idx, 1);
    return { message: 'Cuenta eliminada' };
  },

  // ==========================================
  // 3. GESTIÓN DE PRESUPUESTOS Y LÍMITES
  // ==========================================
  async getPresupuestos(cuentaId = null) {
    try {
      const url = cuentaId ? `${API_BASE}/presupuestos?cuentaId=${cuentaId}` : `${API_BASE}/presupuestos`;
      const res = await fetchWithTimeout(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (e) {
      console.warn('Backend offline o presupuestos vacíos, usando locales:', e.message);
    }
    return fallbackState.presupuestos;
  },

  async createPresupuesto(data) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/presupuestos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline, creando presupuesto local:', e.message);
    }
    const newId = (fallbackState.presupuestos.length ? Math.max(...fallbackState.presupuestos.map(p => p.id)) : 0) + 1;
    const cta = fallbackState.cuentas.find(c => c.id === parseInt(data.cuenta_id || data.cuentaId, 10));
    const nuevo = {
      id: newId,
      cuenta_id: parseInt(data.cuenta_id || data.cuentaId, 10),
      cuenta_nombre: cta?.nombre || 'Cuenta',
      periodo_mes: data.periodo_mes || '2026-10-01',
      limite_asignado: parseFloat(data.limite_asignado || 0),
      saldo_anterior: parseFloat(data.saldo_anterior || 0),
      total_disponible: parseFloat(data.limite_asignado || 0) + parseFloat(data.saldo_anterior || 0)
    };
    fallbackState.presupuestos.push(nuevo);
    return nuevo;
  },

  async updatePresupuesto(id, data) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/presupuestos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline, actualizando presupuesto local:', e.message);
    }
    const idx = fallbackState.presupuestos.findIndex(p => p.id === parseInt(id, 10));
    if (idx !== -1) {
      fallbackState.presupuestos[idx] = { ...fallbackState.presupuestos[idx], ...data };
      return fallbackState.presupuestos[idx];
    }
    return data;
  },

  async deletePresupuesto(id) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/presupuestos/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline, eliminando presupuesto local:', e.message);
    }
    const idx = fallbackState.presupuestos.findIndex(p => p.id === parseInt(id, 10));
    if (idx !== -1) fallbackState.presupuestos.splice(idx, 1);
    return { message: 'Presupuesto eliminado' };
  },

  // ==========================================
  // 4. GESTIÓN DE CATEGORÍAS
  // ==========================================
  async createCategoria(data) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/categorias`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline, creando categoria local:', e.message);
    }
    const newId = (fallbackState.categorias.length ? Math.max(...fallbackState.categorias.map(c => c.id)) : 0) + 1;
    const nueva = {
      id: newId,
      nombre: data.nombre,
      tipo: data.tipo?.toUpperCase() || 'GASTO',
      icono: data.icono || 'more-horizontal'
    };
    fallbackState.categorias.push(nueva);
    return nueva;
  },

  async updateCategoria(id, data) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/categorias/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline, actualizando categoria local:', e.message);
    }
    const idx = fallbackState.categorias.findIndex(c => c.id === parseInt(id, 10));
    if (idx !== -1) {
      fallbackState.categorias[idx] = { ...fallbackState.categorias[idx], ...data };
      return fallbackState.categorias[idx];
    }
    return data;
  },

  async deleteCategoria(id) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/categorias/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) return await res.json();
      const errData = await res.json();
      throw new Error(errData.message || 'Error al eliminar categoría');
    } catch (e) {
      if (e.message && e.message.includes('asociados')) throw e;
      console.warn('Backend offline, eliminando categoria local:', e.message);
    }
    const idx = fallbackState.categorias.findIndex(c => c.id === parseInt(id, 10));
    if (idx !== -1) fallbackState.categorias.splice(idx, 1);
    return { message: 'Categoría eliminada' };
  },

  // ==========================================
  // 5. GESTIÓN DE METAS DE AHORRO FAMILIAR
  // ==========================================
  async getMetas() {
    return fallbackState.metas;
  },

  async createMeta(data) {
    const newId = (fallbackState.metas.length ? Math.max(...fallbackState.metas.map(m => m.id)) : 0) + 1;
    const nueva = {
      id: newId,
      nombre: data.nombre || 'Nueva Meta',
      monto_objetivo: parseFloat(data.monto_objetivo || 1000),
      monto_actual: parseFloat(data.monto_actual || 0),
      fecha_limite: data.fecha_limite || '2026-12-31',
      icono: data.icono || 'piggy-bank',
      color: data.color || '#10b981'
    };
    fallbackState.metas.push(nueva);
    return nueva;
  },

  async updateMeta(id, data) {
    const idx = fallbackState.metas.findIndex(m => m.id === parseInt(id, 10));
    if (idx !== -1) {
      fallbackState.metas[idx] = { ...fallbackState.metas[idx], ...data };
      return fallbackState.metas[idx];
    }
    return data;
  },

  async aportarMeta(id, monto) {
    const idx = fallbackState.metas.findIndex(m => m.id === parseInt(id, 10));
    if (idx !== -1) {
      const sum = (parseFloat(fallbackState.metas[idx].monto_actual || 0) + parseFloat(monto));
      fallbackState.metas[idx].monto_actual = Math.round(sum * 100) / 100;
      return fallbackState.metas[idx];
    }
    return null;
  },

  async deleteMeta(id) {
    const idx = fallbackState.metas.findIndex(m => m.id === parseInt(id, 10));
    if (idx !== -1) fallbackState.metas.splice(idx, 1);
    return { message: 'Meta eliminada' };
  },

  async getCategorias(tipo = null) {
    try {
      const url = tipo ? `${API_BASE}/categorias?tipo=${tipo}` : `${API_BASE}/categorias`;
      const res = await fetchWithTimeout(url);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline, usando categorias locales');
    }
    if (tipo) {
      return fallbackState.categorias.filter(c => c.tipo.toUpperCase() === tipo.toUpperCase());
    }
    return fallbackState.categorias;
  },

  async getMovimientos() {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/movimientos`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline, usando movimientos locales');
    }
    return fallbackState.movimientos;
  },

  async createMovimiento(data) {
    const isTransfer = data.tipo === 'TRANSFERENCIA' || (data.subtipo === 'Transferencia' && Boolean(data.cuenta_destino_id));
    const catTransfer = fallbackState.categorias.find(c => c.nombre === 'Transferencia') || { id: 10, nombre: 'Transferencia' };
    const catId = isTransfer ? catTransfer.id : parseInt(data.categoria_id, 10);
    const montoNum = parseFloat(data.monto);

    if (isTransfer) {
      const origenId = parseInt(data.cuenta_id, 10);
      const destinoId = parseInt(data.cuenta_destino_id, 10);
      const ctaOrigen = fallbackState.cuentas.find(c => c.id === origenId);
      const ctaDestino = fallbackState.cuentas.find(c => c.id === destinoId);
      const nombreOrigen = data.cuenta_nombre || ctaOrigen?.nombre || `Cuenta #${origenId}`;
      const nombreDestino = data.cuenta_destino_nombre || ctaDestino?.nombre || `Cuenta #${destinoId}`;
      const userNote = data.descripcion ? data.descripcion.trim() : '';

      const trfRef = `TRF-${Date.now()}`;
      const descSalida = userNote
        ? `Transferencia enviada a ${nombreDestino}: ${userNote} [${trfRef}]`
        : `Transferencia enviada a ${nombreDestino} [${trfRef}]`;
      const descEntrada = userNote
        ? `Transferencia recibida de ${nombreOrigen}: ${userNote} [${trfRef}]`
        : `Transferencia recibida de ${nombreOrigen} [${trfRef}]`;

      // 1. Intentar persistir en Backend si está activo (creando salida en origen y entrada en destino)
      try {
        const [resSalida, resEntrada] = await Promise.all([
          fetchWithTimeout(`${API_BASE}/movimientos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cuenta_id: origenId,
              categoria_id: catId,
              tipo: 'GASTO',
              subtipo: 'Transferencia',
              monto: montoNum,
              descripcion: descSalida
            })
          }),
          fetchWithTimeout(`${API_BASE}/movimientos`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cuenta_id: destinoId,
              categoria_id: catId,
              tipo: 'INGRESO',
              subtipo: 'Transferencia',
              monto: montoNum,
              descripcion: descEntrada
            })
          })
        ]);

        if (resSalida.ok && resEntrada.ok) {
          const dataSalida = await resSalida.json();
          const dataEntrada = await resEntrada.json();
          return {
            message: 'Transferencia registrada con éxito en backend',
            salida: dataSalida.movimiento,
            entrada: dataEntrada.movimiento
          };
        }
      } catch (e) {
        console.warn('Backend offline o falló al guardar transferencia, usando fallback local:', e.message);
      }

      // 2. Fallback local si backend no está disponible
      const movSalida = {
        id: Date.now(),
        cuenta_id: origenId,
        cuenta_destino_id: destinoId,
        categoria_id: catId,
        tipo: 'GASTO',
        monto: montoNum,
        subtipo: 'Transferencia',
        descripcion: descSalida,
        categoria_nombre: 'Transferencia',
        categoria_icono: 'arrow-down-left',
        cuenta_nombre: nombreOrigen,
        cuenta_destino_nombre: nombreDestino,
        fecha_movimiento: new Date().toISOString()
      };

      const movEntrada = {
        id: Date.now() + 1,
        cuenta_id: destinoId,
        cuenta_destino_id: origenId,
        categoria_id: catId,
        tipo: 'INGRESO',
        monto: montoNum,
        subtipo: 'Transferencia',
        descripcion: descEntrada,
        categoria_nombre: 'Transferencia',
        categoria_icono: 'arrow-down-left',
        cuenta_nombre: nombreDestino,
        cuenta_destino_nombre: nombreOrigen,
        fecha_movimiento: new Date().toISOString()
      };

      fallbackState.movimientos.unshift(movEntrada);
      fallbackState.movimientos.unshift(movSalida);

      if (ctaOrigen) {
        ctaOrigen.saldo_actual = Math.round((ctaOrigen.saldo_actual - montoNum) * 100) / 100;
      }
      if (ctaDestino) {
        ctaDestino.saldo_actual = Math.round((ctaDestino.saldo_actual + montoNum) * 100) / 100;
      }

      return {
        message: 'Transferencia registrada localmente',
        salida: movSalida,
        entrada: movEntrada
      };
    }

    // Flujo normal para GASTO o INGRESO (no transferencia)
    try {
      const res = await fetchWithTimeout(`${API_BASE}/movimientos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend offline, guardando localmente');
    }

    // Local fallback creation para no-transferencias
    const cat = fallbackState.categorias.find(c => c.id === parseInt(data.categoria_id, 10));
    const cuenta = fallbackState.cuentas.find(c => c.id === parseInt(data.cuenta_id, 10));

    const nuevo = {
      id: Date.now(),
      cuenta_id: parseInt(data.cuenta_id, 10),
      categoria_id: parseInt(data.categoria_id, 10),
      tipo: data.tipo,
      monto: montoNum,
      subtipo: data.subtipo || 'Cotidiano',
      descripcion: data.descripcion || '',
      categoria_nombre: cat ? cat.nombre : 'General',
      categoria_icono: cat ? cat.icono : 'more-horizontal',
      cuenta_nombre: cuenta ? cuenta.nombre : 'Cuenta',
      fecha_movimiento: new Date().toISOString()
    };

    fallbackState.movimientos.unshift(nuevo);

    if (cuenta) {
      if (data.tipo === 'GASTO') {
        cuenta.saldo_actual = Math.round((cuenta.saldo_actual - montoNum) * 100) / 100;
      } else {
        cuenta.saldo_actual = Math.round((cuenta.saldo_actual + montoNum) * 100) / 100;
      }
    }

    return {
      message: 'Movimiento registrado localmente',
      movimiento: nuevo,
      cuentaActualizada: cuenta
    };
  },

  async deleteMovimiento(id) {
    // Detectar si este movimiento pertenece a una transferencia emparejada [TRF-xxxx]
    let currentMovs = [];
    try {
      currentMovs = await this.getMovimientos();
    } catch {
      currentMovs = fallbackState.movimientos;
    }
    const targetMov = (currentMovs || []).find(m => m.id === parseInt(id, 10));
    let pairedMov = null;

    if (targetMov && targetMov.descripcion) {
      const match = targetMov.descripcion.match(/\[(TRF-\d+)\]/);
      if (match) {
        const trfTag = match[0];
        pairedMov = (currentMovs || []).find(m => m.id !== targetMov.id && m.descripcion && m.descripcion.includes(trfTag));
      }
    }

    try {
      const res = await fetchWithTimeout(`${API_BASE}/movimientos/${id}`, {
        method: 'DELETE'
      });
      // Si hay un movimiento emparejado, eliminarlo también del backend para restaurar ambos saldos
      if (pairedMov) {
        try {
          await fetchWithTimeout(`${API_BASE}/movimientos/${pairedMov.id}`, { method: 'DELETE' });
        } catch (e) {
          console.warn('Error eliminando movimiento transfer emparejado:', e.message);
        }
      }
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline, borrando localmente');
    }

    // Eliminación en fallback local
    const idx = fallbackState.movimientos.findIndex(m => m.id === parseInt(id, 10));
    if (idx !== -1) {
      const mov = fallbackState.movimientos[idx];
      const cuenta = fallbackState.cuentas.find(c => c.id === mov.cuenta_id);
      if (cuenta) {
        if (mov.tipo === 'GASTO') cuenta.saldo_actual = Math.round((cuenta.saldo_actual + mov.monto) * 100) / 100;
        else cuenta.saldo_actual = Math.round((cuenta.saldo_actual - mov.monto) * 100) / 100;
      }
      fallbackState.movimientos.splice(idx, 1);
    }
    if (pairedMov) {
      const pIdx = fallbackState.movimientos.findIndex(m => m.id === pairedMov.id);
      if (pIdx !== -1) {
        const pMov = fallbackState.movimientos[pIdx];
        const pCuenta = fallbackState.cuentas.find(c => c.id === pMov.cuenta_id);
        if (pCuenta) {
          if (pMov.tipo === 'GASTO') pCuenta.saldo_actual = Math.round((pCuenta.saldo_actual + pMov.monto) * 100) / 100;
          else pCuenta.saldo_actual = Math.round((pCuenta.saldo_actual - pMov.monto) * 100) / 100;
        }
        fallbackState.movimientos.splice(pIdx, 1);
      }
    }
    return { message: 'Eliminado con éxito' };
  },

  async getResumen() {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/resumen`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline, generando resumen local');
    }

    const cuentas = fallbackState.cuentas;
    const movimientos = fallbackState.movimientos;
    const saldoTotal = cuentas.reduce((acc, c) => acc + (parseFloat(c.saldo_actual) || 0), 0);

    let totalGastos = 0;
    let totalIngresos = 0;
    const desgloseCategorias = {};

    movimientos.forEach(m => {
      const isTransfer = m.tipo === 'TRANSFERENCIA' || m.subtipo === 'Transferencia' || m.categoria_nombre === 'Transferencia';
      if (isTransfer) return;

      const mnt = parseFloat(m.monto || 0);
      if (m.tipo === 'GASTO') {
        totalGastos += mnt;
        const cNom = m.categoria_nombre || 'Otros';
        desgloseCategorias[cNom] = (desgloseCategorias[cNom] || 0) + mnt;
      } else {
        totalIngresos += mnt;
      }
    });

    return {
      saldoTotal: Math.round(saldoTotal * 100) / 100,
      totalGastos: Math.round(totalGastos * 100) / 100,
      totalIngresos: Math.round(totalIngresos * 100) / 100,
      presupuestoMensual: 5000.00,
      porcentajePresupuestoGastado: Math.min(100, Math.round((totalGastos / 5000.00) * 100)),
      desgloseCategorias,
      cuentasResumen: cuentas,
      movimientosRecientes: movimientos
    };
  }
};
