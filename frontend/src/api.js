// Cliente de API para FamiCash con sincronización backend y fallback local
const API_BASE = 'http://localhost:5000/api';

// Datos de fallback en caso de que el backend esté desconectado
const fallbackState = {
  usuario: {
    id: 1,
    nombre: 'Sandro De la Cruz',
    email: 'sandro@gmail.com',
    rol: 'Administrador Familiar',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256'
  },
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
    try {
      const res = await fetchWithTimeout(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Credenciales inválidas');
      }
      return data;
    } catch (e) {
      if (e.message && !e.message.includes('Failed to fetch') && !e.message.includes('abort')) {
        throw e;
      }
      console.warn('Backend offline, usando autenticación local:', e.message);
    }
    // Fallback login
    return {
      message: 'Inicio de sesión exitoso',
      token: 'auth-token-famicash',
      usuario: fallbackState.usuario
    };
  },

  async register(userData) {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Error al registrar usuario');
      }
      return data;
    } catch (e) {
      if (e.message && !e.message.includes('Failed to fetch') && !e.message.includes('abort')) {
        throw e;
      }
      console.warn('Backend offline, usando registro local:', e.message);
    }
    // Fallback register
    const nuevoUsuario = {
      id: Date.now(),
      nombre: userData.nombre || 'Nuevo Usuario',
      email: userData.email,
      rol: userData.rol || 'Administrador Familiar',
      vistasPermitidas: userData.rol === 'Hijo / Hija' ? ['expense', 'summary', 'profile'] : ['summary', 'expense', 'accounts', 'profile'],
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=256'
    };
    fallbackState.usuario = nuevoUsuario;
    return {
      message: 'Usuario registrado con éxito',
      token: 'auth-token-famicash-' + Date.now(),
      usuario: nuevoUsuario
    };
  },

  async getMe() {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/auth/me`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      // Sesión no activa o backend offline
    }
    return null;
  },

  async logout() {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/auth/logout`, {
        method: 'POST'
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Error en logout:', e.message);
    }
    return { message: 'Sesión cerrada' };
  },

  async getCuentas() {
    try {
      const res = await fetchWithTimeout(`${API_BASE}/cuentas`);
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline, usando cuentas locales');
    }
    return fallbackState.cuentas;
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
