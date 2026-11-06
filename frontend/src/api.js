// ============================================================
// FamiCash v2 - Cliente API Frontend
// Usa la variable de entorno VITE_API_URL definida en .env
// ============================================================

export const API_BASE = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

let refreshPromise = null;

function buildQuery(params = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === '') return;
    if (Array.isArray(v)) {
      if (v.length > 0) sp.set(k, v.join(','));
    } else {
      sp.set(k, String(v));
    }
  });
  const q = sp.toString();
  return q ? `?${q}` : '';
}

async function tryRefreshSession() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/auth/refresh`, {
      method: 'POST',
      credentials: 'include'
    })
      .then((r) => r.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function request(path, options = {}, isRetry = false) {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    cache: 'no-store',
    headers: {
      ...(options.rawBody ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {})
    },
    ...options
  });

  if (
    res.status === 401 &&
    !isRetry &&
    !path.startsWith('/auth/login') &&
    !path.startsWith('/auth/refresh')
  ) {
    const refreshed = await tryRefreshSession();
    if (refreshed) {
      return request(path, options, true);
    }
  }

  if (!res.ok) {
    let msg = 'Error en la solicitud';
    try {
      const data = await res.json();
      msg = data.error || data.message || msg;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  return res.json();
}

export const api = {
  // Salud del servidor
  checkHealth: () => request('/health').catch(() => ({ status: 'offline' })),

  // Autenticación
  login: (email, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  register: (payload) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => request('/auth/logout', { method: 'POST' }),
  getMe: () => request('/auth/me'),
  updateMe: (payload) =>
    request('/auth/me', { method: 'PATCH', body: JSON.stringify(payload) }),

  // Taxonomía (3 niveles: Categoría -> Subcategoría -> Detalle)
  getTaxonomia: (incluirInactivas = false) =>
    request(`/taxonomia${incluirInactivas ? '?incluirInactivas=true' : ''}`),
  crearCategoria: (payload) =>
    request('/taxonomia/categorias', { method: 'POST', body: JSON.stringify(payload) }),
  editarCategoria: (id, payload) =>
    request(`/taxonomia/categorias/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  eliminarCategoria: (id) =>
    request(`/taxonomia/categorias/${id}`, { method: 'DELETE' }),

  crearSubcategoria: (payload) =>
    request('/taxonomia/subcategorias', { method: 'POST', body: JSON.stringify(payload) }),
  editarSubcategoria: (id, payload) =>
    request(`/taxonomia/subcategorias/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  eliminarSubcategoria: (id) =>
    request(`/taxonomia/subcategorias/${id}`, { method: 'DELETE' }),

  crearDetalle: (payload) =>
    request('/taxonomia/detalles', { method: 'POST', body: JSON.stringify(payload) }),
  editarDetalle: (id, payload) =>
    request(`/taxonomia/detalles/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  eliminarDetalle: (id) =>
    request(`/taxonomia/detalles/${id}`, { method: 'DELETE' }),

  // Medios de pago
  getMediosPago: (incluirInactivos = false) =>
    request(`/medios-pago${incluirInactivos ? '?incluirInactivos=true' : ''}`),
  crearMedioPago: (payload) =>
    request('/medios-pago', { method: 'POST', body: JSON.stringify(payload) }),
  editarMedioPago: (id, payload) =>
    request(`/medios-pago/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  eliminarMedioPago: (id) =>
    request(`/medios-pago/${id}`, { method: 'DELETE' }),

  // Favoritos (al menos 6 subcategorías fijadas por usuario)
  getFavoritos: () => request('/favoritos'),
  guardarFavoritos: (subcategoriaIds) =>
    request('/favoritos', { method: 'PUT', body: JSON.stringify({ subcategoriaIds }) }),

  // Transacciones (Ingresos, Gastos y Ahorros unificados)
  getTransacciones: (filtros = {}) =>
    request(`/transacciones${buildQuery(filtros)}`),
  crearTransaccion: (payload) =>
    request('/transacciones', { method: 'POST', body: JSON.stringify(payload) }),
  editarTransaccion: (id, payload) =>
    request(`/transacciones/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  eliminarTransaccion: (id) =>
    request(`/transacciones/${id}`, { method: 'DELETE' }),

  // Dashboard y Reportes
  getResumen: (filtros = {}) =>
    request(`/dashboard/resumen${buildQuery(filtros)}`),
  getEvolutivo: (filtros = {}) =>
    request(`/dashboard/evolutivo${buildQuery(filtros)}`),
  getPorNivel: (filtros = {}) =>
    request(`/dashboard/por-nivel${buildQuery(filtros)}`),

  // Presupuestos (Mensual, Trimestral, Anual con semáforo)
  getPresupuestos: (periodoTipo = 'MENSUAL', periodo = '') =>
    request(`/presupuestos${buildQuery({ periodoTipo, periodo })}`),
  guardarPresupuesto: (payload) =>
    request('/presupuestos', { method: 'PUT', body: JSON.stringify(payload) }),
  eliminarPresupuesto: (id) =>
    request(`/presupuestos/${id}`, { method: 'DELETE' }),
  copiarPresupuestoAnterior: (periodoTipo, periodo) =>
    request('/presupuestos/copiar-anterior', {
      method: 'POST',
      body: JSON.stringify({ periodoTipo, periodo })
    }),

  // Objetivos de ahorro
  getObjetivos: (incluirInactivos = false) =>
    request(`/objetivos${incluirInactivos ? '?incluirInactivos=true' : ''}`),
  crearObjetivo: (payload) =>
    request('/objetivos', { method: 'POST', body: JSON.stringify(payload) }),
  editarObjetivo: (id, payload) =>
    request(`/objetivos/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
  registrarMovimientoObjetivo: (id, payload) =>
    request(`/objetivos/${id}/movimiento`, { method: 'POST', body: JSON.stringify(payload) }),
  eliminarObjetivo: (id) =>
    request(`/objetivos/${id}`, { method: 'DELETE' }),

  // Exportar, Plantilla e Importar Excel (.xlsx)
  descargarPlantillaExcel: async () => {
    const res = await fetch(`${API_BASE}/excel/plantilla`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('No se pudo descargar la plantilla de Excel');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Plantilla_FamiCash_Importacion.xlsx';
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  exportarExcel: async (filtros = {}) => {
    const res = await fetch(`${API_BASE}/excel/exportar${buildQuery(filtros)}`, {
      credentials: 'include'
    });
    if (!res.ok) throw new Error('No se pudo exportar el archivo Excel');
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const cd = res.headers.get('Content-Disposition') || '';
    const match = /filename="([^"]+)"/.exec(cd);
    a.download = match ? match[1] : `FamiCash_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  },

  importarExcel: async (file, confirmar = false) => {
    const buf = await file.arrayBuffer();
    return request(`/excel/importar?confirmar=${confirmar ? 'true' : 'false'}`, {
      method: 'POST',
      rawBody: true,
      headers: { 'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
      body: buf
    });
  }
};
