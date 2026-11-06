// ============================================================
// Utilidades de formato, moneda S/, fechas y nombres amigables
// En la UI mostramos nombres humanos estéticos con íconos;
// en la BD y en la exportación a Excel se conservan los códigos exactos.
// ============================================================

export const MESES_LARGO = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const MESES_ABREV = [
  'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
  'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'
];

/** Formatea monto en soles con 2 decimales: S/ 1,234.56 */
export function formatSoles(n, decimals = 2) {
  const val = Number(n || 0);
  return `S/ ${val.toLocaleString('es-PE', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
}

/** Formatea monto entero para etiquetas de gráfico de barras: S/ 21,353 */
export function formatSolesEntero(n) {
  const val = Math.round(Number(n || 0));
  if (val === 0) return '';
  return `S/ ${val.toLocaleString('es-PE', { maximumFractionDigits: 0 })}`;
}

/** Fecha actual en formato YYYY-MM-DD (zona America/Lima) */
export function hoyISO() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

/** Periodo inicial según tipo (MENSUAL: 'YYYY-MM', TRIMESTRAL: 'YYYY-Q1', ANUAL: 'YYYY') */
export function periodoActual(tipo = 'MENSUAL') {
  const hoy = hoyISO();
  const y = Number(hoy.slice(0, 4));
  const m = Number(hoy.slice(5, 7));
  if (tipo === 'MENSUAL') return `${y}-${String(m).padStart(2, '0')}`;
  if (tipo === 'TRIMESTRAL') return `${y}-Q${Math.floor((m - 1) / 3) + 1}`;
  return String(y);
}

/** Avanza o retrocede un periodo (delta = -1 o +1) */
export function desplazarPeriodo(tipo, clave, delta) {
  if (tipo === 'MENSUAL') {
    const [y, m] = clave.split('-').map(Number);
    const d = new Date(Date.UTC(y, m - 1 + delta, 1));
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  }
  if (tipo === 'TRIMESTRAL') {
    const match = /^(\d{4})-Q([1-4])$/i.exec(clave);
    const y = match ? Number(match[1]) : new Date().getFullYear();
    const q = match ? Number(match[2]) : 1;
    const totalQ = y * 4 + (q - 1) + delta;
    const ny = Math.floor(totalQ / 4);
    const nq = (((totalQ % 4) + 4) % 4) + 1;
    return `${ny}-Q${nq}`;
  }
  return String((Number(clave) || new Date().getFullYear()) + delta);
}

/** Etiqueta legible del periodo */
export function etiquetaPeriodo(tipo, clave) {
  if (!clave) return '';
  if (tipo === 'MENSUAL') {
    const [y, m] = clave.split('-').map(Number);
    return `${MESES_LARGO[(m || 1) - 1]} ${y}`;
  }
  if (tipo === 'TRIMESTRAL') {
    const match = /^(\d{4})-Q([1-4])$/i.exec(clave);
    if (!match) return clave;
    const trimestres = ['1er Trimestre', '2do Trimestre', '3er Trimestre', '4to Trimestre'];
    return `${trimestres[Number(match[2]) - 1]} ${match[1]}`;
  }
  return `Año ${clave}`;
}

/** Formatea fecha YYYY-MM-DD a d-MMM (ej: 4-Ene) */
export function formatFechaCorta(fechaStr) {
  if (!fechaStr) return '';
  const [, m, d] = String(fechaStr).slice(0, 10).split('-').map(Number);
  if (!m || !d) return fechaStr;
  return `${d}-${MESES_ABREV[m - 1]}`;
}

/**
 * Metadatos visuales y nombres amigables para las 6 Categorías Principales
 */
export const CATEGORIA_META = {
  I_INGRESOS: {
    nombre: 'Ingresos',
    descripcion: 'Sueldos y entradas de dinero',
    emoji: '💰',
    color: '#059669',
    bg: '#ecfdf5',
    border: '#a7f3d0',
    alias: 'Ingresos del Hogar',
    badge: 'Ingreso'
  },
  II_GENERALES: {
    nombre: 'Hogar y Familia',
    descripcion: 'Comida, casa, luz, transporte',
    emoji: '🏠',
    color: '#0284c7',
    bg: '#f0f9ff',
    border: '#bae6fd',
    alias: 'Gastos del Hogar',
    badge: 'Hogar'
  },
  III_LARA: {
    nombre: 'Lara',
    descripcion: 'Colegio, salud, ropa y talleres',
    emoji: '👧',
    color: '#db2777',
    bg: '#fdf2f8',
    border: '#fbcfe8',
    alias: 'Gastos de Lara',
    badge: 'Lara'
  },
  IV_VANESSA: {
    nombre: 'Vanessa',
    descripcion: 'Gastos personales, salud y deporte',
    emoji: '👩',
    color: '#7c3aed',
    bg: '#f5f3ff',
    border: '#ddd6fe',
    alias: 'Gastos de Vanessa',
    badge: 'Vanessa'
  },
  V_ANTHONY: {
    nombre: 'Anthony',
    descripcion: 'Gastos personales, salud y deporte',
    emoji: '👨',
    color: '#d97706',
    bg: '#fffbeb',
    border: '#fde68a',
    alias: 'Gastos de Anthony',
    badge: 'Anthony'
  },
  VI_AHORRO: {
    nombre: 'Ahorros',
    descripcion: 'Dinero guardado para metas',
    emoji: '🐷',
    color: '#0d9488',
    bg: '#f0fdfa',
    border: '#99f6e4',
    alias: 'Ahorro Familiar',
    badge: 'Ahorro'
  }
};

/**
 * Mapa de Subcategorías Oficiales → Nombre Estético + Emoji
 * (El código técnico como _6_ALIMENTACION se mantiene intacto por debajo para Excel)
 */
const SUBCATEGORIA_NOMBRES = {
  // I_INGRESOS
  '_1_SUELDOS': { nombre: 'Sueldos', emoji: '💵' },
  '_2_PENSION': { nombre: 'Pensión Lara', emoji: '👧' },
  '_3_INGRESO ADICIONAL 1': { nombre: 'Ingreso Extra 1', emoji: '✨' },
  '_4_INGRESO ADICIONAL 2': { nombre: 'Ingreso Extra 2', emoji: '✨' },

  // II_GENERALES
  '_1_VIVIENDA': { nombre: 'Vivienda y Alquiler', emoji: '🏢' },
  '_2_MANTENIMIENTO': { nombre: 'Agua y Mantenimiento', emoji: '🚰' },
  '_3_SERVICIOS_BASICOS': { nombre: 'Servicios (Luz, Internet, Netflix)', emoji: '💡' },
  '_4_TRANSPORTE': { nombre: 'Transporte y Auto', emoji: '🚗' },
  '_5_PERSONAL_DE_SERVICIO': { nombre: 'Nana y Limpieza del Hogar', emoji: '🧹' },
  '_6_ALIMENTACION': { nombre: 'Alimentación y Supermercado', emoji: '🍽️' },

  // III_LARA
  '_1_CUIDADO_PERSONAL_LARA': { nombre: 'Aseo y Botiquín Lara', emoji: '🧴' },
  '_2_EDUCACION_LARA': { nombre: 'Colegio y Útiles Lara', emoji: '🎓' },
  '_3_TALLERES_LARA': { nombre: 'Talleres y Natación Lara', emoji: '🏊‍♀️' },
  '_4_VESTIMENTA_LARA': { nombre: 'Ropa y Calzado Lara', emoji: '👗' },
  '_6_SALUD_LARA': { nombre: 'Médico y Salud Lara', emoji: '🩺' },
  '_7_DIVERSION_LARA': { nombre: 'Paseos y Cumpleaños Lara', emoji: '🎈' },

  // IV_VANESSA
  '_1_CUIDADO_PERSONAL_VANESSA': { nombre: 'Cuidado Personal y Peluquería', emoji: '💄' },
  '_2_DEPORTE_VANESSA': { nombre: 'Gym, Baile o Yoga', emoji: '🧘‍♀️' },
  '_3_SALUD_VANESSA': { nombre: 'Salud y Medicinas', emoji: '💊' },
  '_4_ESTUDIOS_VANESSA': { nombre: 'Estudios y Cursos', emoji: '📚' },
  '_5_VESTIMENTA_VANESSA': { nombre: 'Ropa y Calzado', emoji: '👚' },
  '_6_LEGAL_VANESSA': { nombre: 'Trámites y Legal', emoji: '⚖️' },
  '_7_DIVERSION_VANESSA': { nombre: 'Salidas y Viajes', emoji: '✈️' },

  // V_ANTHONY
  '_1_CUIDADO_PERSONAL_ANTHONY': { nombre: 'Barbería y Aseo Personal', emoji: '💈' },
  '_2_DEPORTE_ANTHONY': { nombre: 'Gym y Deporte', emoji: '🏋️‍♂️' },
  '_3_SALUD_ANTHONY': { nombre: 'Salud y Medicinas', emoji: '🩺' },
  '_4_ESTUDIOS_ANTHONY': { nombre: 'Estudios y Cursos', emoji: '📘' },
  '_5_VESTIMENTA_ANTHONY': { nombre: 'Ropa y Calzado', emoji: '👔' },
  '_6_DIVERSION_ANTHONY': { nombre: 'Salidas y Viajes', emoji: '🎉' },

  // VI_AHORRO
  '_1_AHORRO_VANESSA': { nombre: 'Ahorro de Vanessa', emoji: '🏦' },
  '_2_AHORRO_ANTHONY': { nombre: 'Ahorro de Anthony', emoji: '🏦' },
  '_3_AHORRO LARA': { nombre: 'Alcancía / Ahorro de Lara', emoji: '🐷' }
};

/** Limpia cualquier código técnico (ej: "_8_MASCOTAS_HOGAR") a texto legible ("Mascotas Hogar") */
function humanizarCodigo(raw = '') {
  const limpio = String(raw)
    .replace(/^[IVX]+_/i, '')
    .replace(/^_\d+_/i, '')
    .replace(/_/g, ' ')
    .trim()
    .toLowerCase();
  if (!limpio) return raw;
  return limpio.replace(/\b\w/g, (l) => l.toUpperCase());
}

/** Devuelve el nombre amigable de una Categoría (ej: "Hogar y Familia") */
export function nombreCategoria(codigo) {
  if (!codigo) return '';
  return CATEGORIA_META[codigo]?.nombre || humanizarCodigo(codigo);
}

/** Devuelve emoji + nombre amigable de Categoría (ej: "🏠 Hogar y Familia") */
export function etiquetaCategoria(codigo) {
  if (!codigo) return '';
  const m = CATEGORIA_META[codigo];
  return m ? `${m.emoji} ${m.nombre}` : humanizarCodigo(codigo);
}

/** Devuelve el nombre amigable de una Subcategoría (ej: "Alimentación y Supermercado") */
export function nombreSubcategoria(codigo) {
  if (!codigo) return '';
  return SUBCATEGORIA_NOMBRES[codigo]?.nombre || humanizarCodigo(codigo);
}

/** Devuelve el emoji de una Subcategoría */
export function emojiSubcategoria(codigo) {
  return SUBCATEGORIA_NOMBRES[codigo]?.emoji || '📌';
}

/** Devuelve emoji + nombre amigable de Subcategoría (ej: "🍽️ Alimentación y Supermercado") */
export function etiquetaSubcategoria(codigo) {
  if (!codigo) return '';
  const info = SUBCATEGORIA_NOMBRES[codigo];
  return info ? `${info.emoji} ${info.nombre}` : `📌 ${humanizarCodigo(codigo)}`;
}

/** Nombre amigable para medios de pago largos */
export function nombreMedioPago(nombre = '') {
  const map = {
    'TC PERSONAL VANESSA': '💳 Tarjeta Vanessa',
    'YAPE/PLIN/TRANSFERENCIA VANESSA': '📱 Yape / Plin Vanessa',
    'TC PERSONAL ANTHONY': '💳 Tarjeta Anthony',
    'YAPE/PLIN/TRANSFERENCIA ANTHONY': '📱 Yape / Plin Anthony',
    'CUENTA BCP': '🏦 Cuenta BCP',
    'EFECTIVO': '💵 Efectivo'
  };
  return map[nombre] || `💳 ${humanizarCodigo(nombre)}`;
}

export const PALETA_DONA = ['#0284c7', '#db2777', '#7c3aed', '#d97706', '#059669', '#0d9488', '#6366f1'];

export function getMetaCategoria(codigo) {
  return (
    CATEGORIA_META[codigo] || {
      nombre: humanizarCodigo(codigo),
      descripcion: '',
      emoji: '📁',
      color: '#006241',
      bg: '#ecfdf5',
      border: '#a7f3d0',
      alias: humanizarCodigo(codigo),
      badge: 'General'
    }
  );
}
