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
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Backend offline, usando fallback local:', e.message);
    }
    // Fallback login
    return {
      message: 'Inicio de sesión simulado',
      token: 'demo-token',
      usuario: fallbackState.usuario
    };
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

    // Local fallback creation
    const cat = fallbackState.categorias.find(c => c.id === parseInt(data.categoria_id, 10));
    const cuenta = fallbackState.cuentas.find(c => c.id === parseInt(data.cuenta_id, 10));
    const montoNum = parseFloat(data.monto);

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

    // Ajustar saldo
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
    try {
      const res = await fetchWithTimeout(`${API_BASE}/movimientos/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('Backend offline, borrando localmente');
    }

    const idx = fallbackState.movimientos.findIndex(m => m.id === parseInt(id, 10));
    if (idx !== -1) {
      const mov = fallbackState.movimientos[idx];
      const cuenta = fallbackState.cuentas.find(c => c.id === mov.cuenta_id);
      if (cuenta) {
        if (mov.tipo === 'GASTO') cuenta.saldo_actual += mov.monto;
        else cuenta.saldo_actual -= mov.monto;
      }
      fallbackState.movimientos.splice(idx, 1);
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
