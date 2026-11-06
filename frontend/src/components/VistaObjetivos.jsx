// ============================================================
// Vista de Metas / Alcancías de Ahorro Familiar con Auditoría en BD:
//  1. Permite elegir un tipo de meta o CREAR cualquier tipo de meta nuevo.
//  2. Muestra claramente los Usuarios reales de la BD (Anthony, Vanessa)
//     y si la meta es compartida del hogar o para la hija (Lara).
//  3. Cada Abono o Retiro genera un registro de AUDITORÍA real en la tabla
//     `transacciones` (con usuario, fecha, cuenta/medio de pago y nota) y se
//     puede desplegar en la tarjeta con el botón "📜 Ver Auditoría / Historial".
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Calendar,
  User,
  X,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Coins,
  History,
  ShieldCheck
} from 'lucide-react';
import { api } from '../api';
import { formatSoles, nombreMedioPago, hoyISO } from '../utils/format';

const TIPOS_BASE = [
  { label: 'Fondo de emergencia', emoji: '🛡️', desc: 'Imprevistos y salud' },
  { label: 'Vacaciones', emoji: '✈️', desc: 'Viajes y paseos' },
  { label: 'Educación', emoji: '🎓', desc: 'Colegio, universidad, cursos' },
  { label: 'Vivienda', emoji: '🏠', desc: 'Inicial depa, remodelación' },
  { label: 'Compra / Proyecto', emoji: '🚗', desc: 'Auto, artefactos, negocio' }
];

const FORM_VACIO = {
  nombre: '',
  tipo: 'Fondo de emergencia',
  montoMeta: '',
  montoActual: '0',
  fechaObjetivo: '',
  responsable: 'FAMILIA'
};

export default function VistaObjetivos({
  mediosPago = [],
  refreshKey,
  onRefreshGlobal
}) {
  const [data, setData] = useState({
    items: [],
    totales: { acumulado: 0, meta: 0, pct: 0 },
    usuarios: [],
    tipos: TIPOS_BASE.map((t) => t.label)
  });
  const [mostrarGuia, setMostrarGuia] = useState(true);

  // Qué tarjetas tienen su historial de auditoría desplegado (id -> boolean)
  const [auditoriaAbierta, setAuditoriaAbierta] = useState({});

  // Modal de Crear / Editar Meta
  const [modalOpen, setModalOpen] = useState(false);
  const [editObj, setEditObj] = useState(null);
  const [form, setForm] = useState(FORM_VACIO);
  const [creandoNuevoTipo, setCreandoNuevoTipo] = useState(false);
  const [nuevoTipoTexto, setNuevoTipoTexto] = useState('');
  const [tiposPersonalizados, setTiposPersonalizados] = useState([]);
  const [saving, setSaving] = useState(false);

  // Modal de Abono / Retiro con Auditoría en BD
  // { obj, monto: '', modo: 'sumar' | 'restar', medioPagoId: ..., nota: '', fecha: ... }
  const [modalAbono, setModalAbono] = useState(null);

  // Modal de confirmación para eliminar
  const [modalDeleteObj, setModalDeleteObj] = useState(null);

  const [mensaje, setMensaje] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const cargar = useCallback(async () => {
    try {
      const res = await api.getObjetivos();
      setData(res);
    } catch (err) {
      console.error('Error cargando objetivos:', err);
    }
  }, [refreshKey]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const emojiPorTipo = (tipo = '') => {
    const t = tipo.toLowerCase();
    if (t.includes('emergencia') || t.includes('salud')) return '🛡️';
    if (t.includes('vacacion') || t.includes('viaje')) return '✈️';
    if (t.includes('educa') || t.includes('lara') || t.includes('curso')) return '🎓';
    if (t.includes('vivien') || t.includes('casa') || t.includes('depa')) return '🏠';
    if (t.includes('compra') || t.includes('auto') || t.includes('proyect')) return '🚗';
    return '✨';
  };

  // Lista combinada de tipos de meta (predefinidos + guardados en BD + recién creados en el modal)
  const listaTiposDisponibles = [
    ...TIPOS_BASE,
    ...(data.tipos || [])
      .filter((t) => !TIPOS_BASE.some((b) => b.label.toLowerCase() === t.toLowerCase()))
      .map((t) => ({ label: t, emoji: emojiPorTipo(t), desc: 'Tipo personalizado' })),
    ...tiposPersonalizados
      .filter(
        (t) =>
          !TIPOS_BASE.some((b) => b.label.toLowerCase() === t.toLowerCase()) &&
          !(data.tipos || []).some((d) => d.toLowerCase() === t.toLowerCase())
      )
      .map((t) => ({ label: t, emoji: '✨', desc: 'Tipo personalizado' }))
  ];

  // Etiqueta clara que conecta el campo `responsable` con los usuarios reales de la BD
  const etiquetaResponsable = (resp) => {
    const u = (data.usuarios || []).find((usr) => usr.persona === resp);
    if (resp === 'ANTHONY') {
      return `👨 Usuario: ${u?.nombre || 'Anthony'} (${u?.email || 'anthony@famicash.pe'})`;
    }
    if (resp === 'VANESSA') {
      return `👩 Usuaria: ${u?.nombre || 'Vanessa'} (${u?.email || 'vanessa@famicash.pe'})`;
    }
    if (resp === 'LARA') {
      return '👧 Para Lara (Hija · administrado por ambos padres)';
    }
    return '🏠 Familiar Compartida (Anthony y Vanessa)';
  };

  const etiquetaResponsableCorta = (resp) => {
    if (resp === 'ANTHONY') return '👨 Usuario: Anthony';
    if (resp === 'VANESSA') return '👩 Usuaria: Vanessa';
    if (resp === 'LARA') return '👧 Para Lara (Hija)';
    return '🏠 Familiar (Anthony y Vanessa)';
  };

  const abrirNuevo = () => {
    setEditObj(null);
    setErrorMsg('');
    setCreandoNuevoTipo(false);
    setNuevoTipoTexto('');
    setForm(FORM_VACIO);
    setModalOpen(true);
  };

  const abrirEdicion = (obj) => {
    setEditObj(obj);
    setErrorMsg('');
    setCreandoNuevoTipo(false);
    setNuevoTipoTexto('');
    setForm({
      nombre: obj.nombre,
      tipo: obj.tipo || 'Fondo de emergencia',
      montoMeta: String(obj.montoMeta),
      montoActual: String(obj.acumulado || 0),
      fechaObjetivo: obj.fechaObjetivo || '',
      responsable: obj.responsable || 'FAMILIA'
    });
    setModalOpen(true);
  };

  const handleAgregarNuevoTipo = () => {
    const limpio = nuevoTipoTexto.trim();
    if (!limpio) return;
    setTiposPersonalizados((prev) => [...new Set([...prev, limpio])]);
    setForm((prev) => ({ ...prev, tipo: limpio }));
    setNuevoTipoTexto('');
    setCreandoNuevoTipo(false);
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg('');
    try {
      // Si dejó texto escrito en la cajita de nuevo tipo, lo usamos directamente
      const tipoFinal =
        creandoNuevoTipo && nuevoTipoTexto.trim()
          ? nuevoTipoTexto.trim()
          : form.tipo.trim() || 'General';

      const metaNum = Number(form.montoMeta);
      const actualDeseado = Number(form.montoActual || 0);

      const aportesVinculados = editObj
        ? Math.max(0, Number(editObj.acumulado || 0) - Number(editObj.montoInicial || 0))
        : 0;
      const montoInicialCalculado = Math.max(0, actualDeseado - aportesVinculados);

      const payload = {
        nombre: form.nombre.trim(),
        tipo: tipoFinal,
        montoMeta: metaNum,
        montoInicial: montoInicialCalculado,
        fechaObjetivo: form.fechaObjetivo || null,
        responsable: form.responsable,
        ...(editObj ? {} : { subcategoriaAhorroId: null })
      };

      if (editObj) {
        await api.editarObjetivo(editObj.id, payload);
        setMensaje(`¡Meta "${form.nombre.trim()}" actualizada!`);
      } else {
        await api.crearObjetivo(payload);
        setMensaje(`¡Nueva meta "${form.nombre.trim()}" (${tipoFinal}) creada con éxito!`);
      }
      setTimeout(() => setMensaje(''), 4000);
      setModalOpen(false);
      await cargar();
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo guardar la meta');
    } finally {
      setSaving(false);
    }
  };

  // Guardar abono (+S/) o retiro (-S/) generando registro de AUDITORÍA en `transacciones`
  const handleGuardarAbonoAuditado = async (e) => {
    e.preventDefault();
    if (!modalAbono?.obj) return;
    const montoNum = Number(String(modalAbono.monto).replace(',', '.'));
    if (!Number.isFinite(montoNum) || montoNum <= 0) {
      setErrorMsg('Ingresa un monto mayor a S/ 0.00');
      return;
    }

    setSaving(true);
    setErrorMsg('');
    try {
      const { obj, modo, medioPagoId, nota, fecha } = modalAbono;

      await api.registrarMovimientoObjetivo(obj.id, {
        monto: montoNum,
        modo,
        medioPagoId: medioPagoId || mediosPago[0]?.id || null,
        nota: nota?.trim() || '',
        fecha: fecha || hoyISO()
      });

      const idMeta = obj.id;
      setModalAbono(null);
      // Abrir automáticamente la bitácora de auditoría de esa tarjeta para que vea el registro
      setAuditoriaAbierta((prev) => ({ ...prev, [idMeta]: true }));

      setMensaje(
        modo === 'restar'
          ? `Retiro de ${formatSoles(montoNum)} registrado en la auditoría de "${obj.nombre}".`
          : `¡Abono de ${formatSoles(montoNum)} sumado y guardado en la auditoría de "${obj.nombre}"!`
      );
      setTimeout(() => setMensaje(''), 5000);
      await cargar();
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo registrar el movimiento en la meta');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmarEliminar = async () => {
    if (!modalDeleteObj) return;
    setSaving(true);
    try {
      await api.eliminarObjetivo(modalDeleteObj.id);
      setModalDeleteObj(null);
      setMensaje('Meta de ahorro eliminada.');
      setTimeout(() => setMensaje(''), 3000);
      await cargar();
      if (onRefreshGlobal) onRefreshGlobal();
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo eliminar');
    } finally {
      setSaving(false);
    }
  };

  const faltanteGlobal = Math.max(0, (data.totales.meta || 0) - (data.totales.acumulado || 0));

  return (
    <div className="goals-view-container">
      {mensaje && (
        <div className="toast-success-inline">
          <CheckCircle2 size={18} />
          <span>{mensaje}</span>
        </div>
      )}
      {errorMsg && (
        <div className="alert-error-box inline-feedback">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* ============================================================
          GUÍA RÁPIDA COLAPSABLE: ¿CÓMO FUNCIONA Y CÓMO QUEDA LA AUDITORÍA?
          ============================================================ */}
      <div className="goals-explainer-banner">
        <div
          className="goals-explainer-header"
          onClick={() => setMostrarGuia(!mostrarGuia)}
        >
          <div className="goals-explainer-title">
            <HelpCircle size={18} className="icon-forest" />
            <strong>¿Cómo funcionan tus Metas de Ahorro y su Auditoría?</strong>
          </div>
          <button type="button" className="btn-collapse-toggle">
            {mostrarGuia ? (
              <>
                <span>Ocultar guía</span> <ChevronUp size={16} />
              </>
            ) : (
              <>
                <span>Ver guía</span> <ChevronDown size={16} />
              </>
            )}
          </button>
        </div>

        {mostrarGuia && (
          <div className="goals-explainer-steps">
            <div className="ge-step-card">
              <span className="ge-step-badge">1</span>
              <div>
                <strong>Crea tu Meta y Tipo Propio</strong>
                <p>
                  Define el objetivo (ej. <em>Viaje a Cusco</em>), elige o <strong>crea tu propio tipo de meta</strong>, y asigna si es de <strong>Anthony, Vanessa, compartida o para Lara</strong>.
                </p>
              </div>
            </div>
            <div className="ge-step-card">
              <span className="ge-step-badge">2</span>
              <div>
                <strong>Abona con Respaldo de Auditoría</strong>
                <p>
                  Al tocar <strong>"+ Abonar dinero"</strong> eliges de qué cuenta salió y queda guardado en la tabla <code>transacciones</code> con fecha, hora y usuario que hizo el abono.
                </p>
              </div>
            </div>
            <div className="ge-step-card">
              <span className="ge-step-badge">3</span>
              <div>
                <strong>Consulta el Historial en cada Tarjeta</strong>
                <p>
                  Cada tarjeta tiene el botón <strong>"Auditoría / Historial de abonos"</strong> para revisar cada depósito o retiro realizado y también se exporta al Excel.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ============================================================
          TARJETA HERO: RESUMEN TOTAL DE TODAS LAS METAS
          ============================================================ */}
      <div className="goals-hero-card">
        <div className="goals-hero-top">
          <div>
            <span className="goals-eyebrow">Resumen de todas tus metas familiares</span>
            <h2>Total ahorrado: {formatSoles(data.totales.acumulado)}</h2>
            <p>
              Meta total sumada: <strong>{formatSoles(data.totales.meta)}</strong> · Nos falta juntar:{' '}
              <strong>{formatSoles(faltanteGlobal)}</strong>
            </p>
          </div>

          <button type="button" className="btn-new-goal" onClick={abrirNuevo}>
            <Plus size={18} />
            <span>Crear Nueva Meta</span>
          </button>
        </div>

        <div className="goals-master-progress">
          <div className="goals-progress-track">
            <div
              className="goals-progress-fill"
              style={{ width: `${Math.min(data.totales.pct || 0, 100)}%` }}
            />
          </div>
          <span className="goals-master-pct">{data.totales.pct || 0}%</span>
        </div>
      </div>

      {/* ============================================================
          TARJETAS DE CADA META CON BOTÓN "+ ABONAR" Y BITÁCORA DE AUDITORÍA
          ============================================================ */}
      <div className="goals-cards-grid">
        {data.items.map((obj) => {
          const faltante = Math.max(0, Number(obj.montoMeta || 0) - Number(obj.acumulado || 0));
          const completada = faltante <= 0 && Number(obj.montoMeta) > 0;
          const historial = obj.historial || [];
          const verAuditoria = Boolean(auditoriaAbierta[obj.id]);

          return (
            <div key={obj.id} className={`goal-item-card ${completada ? 'goal-completed' : ''}`}>
              <div className="goal-card-header">
                <div className="goal-icon-badge" style={{ fontSize: 22 }}>
                  {emojiPorTipo(obj.tipo)}
                </div>
                <div className="goal-title-block">
                  <span className="goal-type-pill">{obj.tipo}</span>
                  <h3>{obj.nombre}</h3>
                </div>
                <div className="goal-actions">
                  <button
                    type="button"
                    className="tx-icon-btn"
                    onClick={() => abrirEdicion(obj)}
                    title="Editar meta de ahorro"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    className="tx-icon-btn danger"
                    onClick={() => setModalDeleteObj(obj)}
                    title="Eliminar meta"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {/* 3 Indicadores claros: Ahorrado hoy | Falta juntar | Meta final */}
              <div className="goal-three-metrics">
                <div className="gm-box saved">
                  <small>Llevamos ahorrado</small>
                  <strong>{formatSoles(obj.acumulado)}</strong>
                </div>
                <div className="gm-box remaining">
                  <small>{completada ? 'Estado' : 'Nos falta juntar'}</small>
                  <strong>{completada ? '¡Meta lograda! 🎉' : formatSoles(faltante)}</strong>
                </div>
                <div className="gm-box target">
                  <small>Meta total</small>
                  <strong>{formatSoles(obj.montoMeta)}</strong>
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="goal-bar-row">
                <div className="goal-bar-track">
                  <div
                    className="goal-bar-fill"
                    style={{ width: `${Math.min(obj.pct, 100)}%` }}
                  />
                </div>
                <span className="goal-pct-text">{obj.pct}%</span>
              </div>

              {/* Botones directos para meter o sacar plata de esta alcancía (con auditoría) */}
              <div className="goal-card-deposit-bar">
                <button
                  type="button"
                  className="btn-goal-deposit"
                  onClick={() =>
                    setModalAbono({
                      obj,
                      monto: '',
                      modo: 'sumar',
                      medioPagoId: mediosPago[0]?.id || '',
                      nota: '',
                      fecha: hoyISO()
                    })
                  }
                >
                  <Plus size={15} />
                  <span>Abonar dinero</span>
                </button>
                <button
                  type="button"
                  className="btn-goal-withdraw"
                  onClick={() =>
                    setModalAbono({
                      obj,
                      monto: '',
                      modo: 'restar',
                      medioPagoId: mediosPago[0]?.id || '',
                      nota: '',
                      fecha: hoyISO()
                    })
                  }
                  title="Descontar o retirar dinero dejando constancia en la auditoría"
                >
                  <span>Retirar / Ajustar</span>
                </button>
              </div>

              {/* Pie de tarjeta + Botón desplegable de Auditoría */}
              <div className="goal-meta-footer-row">
                <div className="goal-meta-footer">
                  <span>
                    <User size={13} /> {etiquetaResponsableCorta(obj.responsable)}
                  </span>
                  {obj.fechaObjetivo && (
                    <span>
                      <Calendar size={13} /> Meta: {obj.fechaObjetivo}
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  className={`btn-audit-toggle ${verAuditoria ? 'active' : ''}`}
                  onClick={() =>
                    setAuditoriaAbierta((prev) => ({ ...prev, [obj.id]: !prev[obj.id] }))
                  }
                >
                  <History size={13} />
                  <span>Auditoría ({historial.length})</span>
                  {verAuditoria ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>
              </div>

              {/* ==========================================
                  SECCIÓN DESPLEGABLE: AUDITORÍA DE ABONOS Y RETIROS
                  ========================================== */}
              {verAuditoria && (
                <div className="goal-audit-log-box">
                  <div className="goal-audit-header">
                    <ShieldCheck size={14} className="icon-forest" />
                    <span>Bitácora de auditoría en BD (`transacciones`)</span>
                  </div>

                  {historial.length === 0 ? (
                    <div className="goal-audit-empty">
                      Aún no hay abonos individuales registrados. Usa el botón{' '}
                      <strong>"+ Abonar dinero"</strong> para registrar el primero con auditoría.
                    </div>
                  ) : (
                    <div className="goal-audit-list">
                      {historial.map((h) => (
                        <div key={h.id} className="goal-audit-item">
                          <div className="gai-left">
                            <span
                              className={`gai-badge ${
                                h.accion === 'RETIRO' ? 'retiro' : 'abono'
                              }`}
                            >
                              {h.accion === 'RETIRO' ? '− Retiro' : '+ Abono'}
                            </span>
                            <div className="gai-info">
                              <strong>{h.nota}</strong>
                              <small>
                                📅 {h.fecha} · 👤 Por: <strong>{h.usuario}</strong> · 💳{' '}
                                {nombreMedioPago(h.medioPago)}
                              </small>
                            </div>
                          </div>
                          <strong
                            className={`gai-amount ${
                              h.accion === 'RETIRO' ? 'neg' : 'pos'
                            }`}
                          >
                            {h.accion === 'RETIRO' ? '-' : '+'}
                            {formatSoles(h.monto)}
                          </strong>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ============================================================
          POPUP DE ABONO / RETIRO CON AUDITORÍA COMPLETA EN BD
          ============================================================ */}
      {modalAbono && (
        <div className="modal-backdrop" onClick={() => setModalAbono(null)}>
          <div className="modal-dialog-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog-header">
              <div>
                <h3>
                  {modalAbono.modo === 'restar'
                    ? `➖ Retirar dinero de "${modalAbono.obj.nombre}"`
                    : `🐷 Abonar dinero a "${modalAbono.obj.nombre}"`}
                </h3>
                <p className="text-muted-sm">
                  Ahorrado actual: <strong>{formatSoles(modalAbono.obj.acumulado)}</strong> de{' '}
                  <strong>{formatSoles(modalAbono.obj.montoMeta)}</strong> · Quedará registrado en la auditoría
                </p>
              </div>
              <button type="button" className="tx-icon-btn" onClick={() => setModalAbono(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGuardarAbonoAuditado} className="modal-form-grid">
              <div className="field-group">
                <label>
                  {modalAbono.modo === 'restar'
                    ? '1. ¿Cuánto dinero vas a descontar de esta meta? (S/)'
                    : '1. ¿Cuánto dinero vas a abonar hoy a esta meta? (S/)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  autoFocus
                  placeholder="Ej. 200.00"
                  value={modalAbono.monto}
                  onChange={(e) => setModalAbono({ ...modalAbono, monto: e.target.value })}
                />
              </div>

              {/* Botones rápidos de abono */}
              <div className="quick-add-amounts">
                {[50, 100, 200, 500, 1000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    className="quick-amt-chip"
                    onClick={() =>
                      setModalAbono((prev) => ({
                        ...prev,
                        monto: String((Number(prev.monto) || 0) + v)
                      }))
                    }
                  >
                    +S/ {v}
                  </button>
                ))}
              </div>

              <div className="field-row-2">
                <div className="field-group">
                  <label>2. ¿Con qué cuenta o medio de pago?</label>
                  <select
                    value={modalAbono.medioPagoId}
                    onChange={(e) => setModalAbono({ ...modalAbono, medioPagoId: e.target.value })}
                  >
                    {mediosPago.map((mp) => (
                      <option key={mp.id} value={mp.id}>
                        {nombreMedioPago(mp.nombre)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="field-group">
                  <label>3. Fecha del movimiento</label>
                  <input
                    type="date"
                    value={modalAbono.fecha}
                    onChange={(e) => setModalAbono({ ...modalAbono, fecha: e.target.value })}
                  />
                </div>
              </div>

              <div className="field-group">
                <label>4. Nota para la auditoría (opcional)</label>
                <input
                  type="text"
                  placeholder={
                    modalAbono.modo === 'restar'
                      ? 'Ej. Uso parcial para adelanto...'
                      : 'Ej. Aporte de quincena Noviembre, ahorro extra...'
                  }
                  value={modalAbono.nota}
                  onChange={(e) => setModalAbono({ ...modalAbono, nota: e.target.value })}
                />
              </div>

              <div className="goal-modal-preview">
                <ShieldCheck size={16} className="icon-forest" />
                <span>
                  Este movimiento quedará grabado en la base de datos con tu usuario, fecha y cuenta para auditoría y exportación a Excel.
                </span>
              </div>

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="btn-secondary-action"
                  onClick={() => setModalAbono(null)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary-inline" disabled={saving}>
                  <Coins size={16} />
                  <span>
                    {saving
                      ? 'Guardando en BD...'
                      : modalAbono.modo === 'restar'
                        ? 'Confirmar Retiro Auditado'
                        : 'Abonar y Guardar Auditoría'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          POPUP CREAR O EDITAR META (CON CREACIÓN DE TIPO DE META PROPIO)
          ============================================================ */}
      {modalOpen && (
        <div className="modal-backdrop" onClick={() => setModalOpen(false)}>
          <div className="modal-dialog-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog-header">
              <div>
                <h3>{editObj ? '✏️ Editar Meta de Ahorro' : '🐷 Crear Nueva Meta de Ahorro'}</h3>
                <p className="text-muted-sm">
                  Define qué quieren lograr, crea tu propio tipo de meta si deseas y asigna el responsable
                </p>
              </div>
              <button type="button" className="tx-icon-btn" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGuardar} className="modal-form-grid">
              {/* 1. Nombre de la meta */}
              <div className="field-group">
                <label>1. ¿Para qué quieren ahorrar? (Nombre de tu meta)</label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ej. Viaje a Cusco, Fondo de Emergencia, Laptop nueva..."
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                />
              </div>

              {/* 2. Categoría / Tipo de meta (con botón para CREAR NUEVO TIPO) */}
              <div className="field-group">
                <div className="form-block-header">
                  <label>2. Elige el tipo de meta (o crea uno nuevo)</label>
                  <button
                    type="button"
                    className="btn-mini-add"
                    onClick={() => setCreandoNuevoTipo(!creandoNuevoTipo)}
                  >
                    <Plus size={13} /> {creandoNuevoTipo ? 'Cancelar nuevo tipo' : 'Crear nuevo tipo de meta'}
                  </button>
                </div>

                {creandoNuevoTipo && (
                  <div className="inline-add-detalle">
                    <input
                      type="text"
                      placeholder="Escribe tu nuevo tipo de meta (ej. Salud, Inversión, Boda, Fiesta)..."
                      value={nuevoTipoTexto}
                      onChange={(e) => setNuevoTipoTexto(e.target.value)}
                    />
                    <button
                      type="button"
                      className="btn-save-mini"
                      onClick={handleAgregarNuevoTipo}
                    >
                      Usar este tipo
                    </button>
                  </div>
                )}

                <div className="goal-type-selector-grid">
                  {listaTiposDisponibles.map((cat) => {
                    const active = form.tipo === cat.label;
                    return (
                      <button
                        key={cat.label}
                        type="button"
                        className={`goal-type-option-btn ${active ? 'active' : ''}`}
                        onClick={() => setForm({ ...form, tipo: cat.label })}
                      >
                        <span className="gto-emoji">{cat.emoji}</span>
                        <div>
                          <strong>{cat.label}</strong>
                          <small>{cat.desc}</small>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Monto Meta y Cuánto tienen hoy */}
              <div className="field-row-2">
                <div className="field-group">
                  <label>3. ¿Cuánto quieren juntar en total? (S/)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    placeholder="Ej. 5000"
                    value={form.montoMeta}
                    onChange={(e) => setForm({ ...form, montoMeta: e.target.value })}
                  />
                </div>

                <div className="field-group">
                  <label>4. ¿Cuánto tienen guardado hoy? (S/)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0"
                    value={form.montoActual}
                    onChange={(e) => setForm({ ...form, montoActual: e.target.value })}
                  />
                </div>
              </div>

              {/* Vista previa instantánea de cuánto falta */}
              {Number(form.montoMeta) > 0 && (
                <div className="goal-modal-preview">
                  <Sparkles size={16} className="icon-forest" />
                  <span>
                    Meta: <strong>{formatSoles(form.montoMeta)}</strong> · Empiezan con:{' '}
                    <strong>{formatSoles(form.montoActual || 0)}</strong> · Faltará juntar:{' '}
                    <strong>
                      {formatSoles(Math.max(0, Number(form.montoMeta) - Number(form.montoActual || 0)))}
                    </strong>
                  </span>
                </div>
              )}

              {/* 5. Usuario / Integrante responsable y Fecha opcional */}
              <div className="field-row-2">
                <div className="field-group">
                  <label>5. ¿De qué usuario o integrante es la meta?</label>
                  <select
                    value={form.responsable}
                    onChange={(e) => setForm({ ...form, responsable: e.target.value })}
                  >
                    <option value="FAMILIA">{etiquetaResponsable('FAMILIA')}</option>
                    <option value="ANTHONY">{etiquetaResponsable('ANTHONY')}</option>
                    <option value="VANESSA">{etiquetaResponsable('VANESSA')}</option>
                    <option value="LARA">{etiquetaResponsable('LARA')}</option>
                  </select>
                </div>

                <div className="field-group">
                  <label>6. ¿Para qué fecha la quieren lograr? (Opcional)</label>
                  <input
                    type="date"
                    value={form.fechaObjetivo}
                    onChange={(e) => setForm({ ...form, fechaObjetivo: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-dialog-footer">
                <button type="button" className="btn-secondary-action" onClick={() => setModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary-inline" disabled={saving}>
                  <CheckCircle2 size={16} />
                  <span>{saving ? 'Guardando...' : 'Guardar Meta de Ahorro'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup de confirmación para eliminar Meta de Ahorro */}
      {modalDeleteObj && (
        <div className="modal-backdrop" onClick={() => setModalDeleteObj(null)}>
          <div className="modal-dialog-card confirm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-icon">
              <AlertTriangle size={28} />
            </div>
            <h3>¿Eliminar meta "{modalDeleteObj.nombre}"?</h3>
            <p className="confirm-modal-desc">
              Se quitará esta tarjeta de metas de ahorro. Los registros de auditoría en `transacciones` se mantienen intactos.
            </p>
            <div className="modal-dialog-footer">
              <button
                type="button"
                className="btn-secondary-action"
                onClick={() => setModalDeleteObj(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-danger-confirm"
                onClick={handleConfirmarEliminar}
                disabled={saving}
              >
                <Trash2 size={16} />
                <span>Sí, eliminar meta</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
