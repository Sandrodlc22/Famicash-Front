// ============================================================
// Vista de Registro Simple y Ordenado en Cascada:
//  🔍 Buscador instantáneo de cualquier Rubro o Concepto (incluyendo nuevos)
//  1️⃣ Paso 1: Escoge el Área Familiar (con botón + Nueva Área)
//  2️⃣ Paso 2: Escoge el Rubro de esa Área (con botón + Nuevo Rubro)
//  3️⃣ Paso 3: Escoge el Concepto de ese Rubro (con botón + Nuevo Concepto)
//  4️⃣ Paso 4: ¿Con qué pagaste y cuándo?
//  5️⃣ Paso 5: Monto en Soles (S/) + Confirmar
// Cada sección se puede colapsar o desplegar a voluntad.
// ============================================================
import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Check,
  Delete,
  Calendar,
  Plus,
  Sparkles,
  X,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Search,
  Folder,
  FolderOpen,
  FileText,
  ArrowRight
} from 'lucide-react';
import { api } from '../api';
import {
  hoyISO,
  getMetaCategoria,
  formatSoles,
  nombreCategoria,
  nombreSubcategoria,
  emojiSubcategoria,
  nombreMedioPago
} from '../utils/format';

export default function VistaRegistro({
  taxonomia = [],
  mediosPago = [],
  preset = null,
  editandoTx = null,
  onClearEdit,
  onSaveTransaccion,
  onQuickCreateDetalle,
  onRefreshCatalogos
}) {
  const [categoriaId, setCategoriaId] = useState(null);
  const [subcategoriaId, setSubcategoriaId] = useState(null);
  const [detalleId, setDetalleId] = useState(null);
  const [medioPagoId, setMedioPagoId] = useState(mediosPago[0]?.id || null);
  const [montoStr, setMontoStr] = useState('');
  const [clase, setClase] = useState('Cotidiano');
  const [observaciones, setObservaciones] = useState('');
  const [fecha, setFecha] = useState(hoyISO());
  const [mostrarSelectorFecha, setMostrarSelectorFecha] = useState(false);

  // Buscador global de rubros y conceptos
  const [busquedaGlobal, setBusquedaGlobal] = useState('');
  // Filtro interno dentro de la lista de rubros o conceptos si hay muchos
  const [filtroRubro, setFiltroRubro] = useState('');

  // Secciones colapsables a voluntad del usuario
  const [paso1Abierto, setPaso1Abierto] = useState(true);
  const [paso2Abierto, setPaso2Abierto] = useState(true);
  const [paso3Abierto, setPaso3Abierto] = useState(true);

  // Creación rápida sin salir de la pantalla (Área, Rubro, Concepto)
  const [creandoArea, setCreandoArea] = useState(false);
  const [nuevaAreaNombre, setNuevaAreaNombre] = useState('');
  const [nuevaAreaTipo, setNuevaAreaTipo] = useState('GASTO');

  const [creandoRubro, setCreandoRubro] = useState(false);
  const [nuevoRubroTexto, setNuevoRubroTexto] = useState('');

  const [creandoDetalle, setCreandoDetalle] = useState(false);
  const [nuevoDetalleTexto, setNuevoDetalleTexto] = useState('');

  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [mostrarTeclado, setMostrarTeclado] = useState(false);

  const montoInputRef = useRef(null);

  // Inicializar selección cuando se edita o viene un atajo
  useEffect(() => {
    if (editandoTx) {
      setCategoriaId(editandoTx.categoriaId);
      setSubcategoriaId(editandoTx.subcategoriaId);
      setDetalleId(editandoTx.detalleId || null);
      setMedioPagoId(editandoTx.medioPagoId || mediosPago[0]?.id || null);
      setMontoStr(String(editandoTx.monto || ''));
      setClase(editandoTx.clase || 'Cotidiano');
      setObservaciones(editandoTx.observaciones || '');
      setFecha(editandoTx.fecha || hoyISO());
      return;
    }

    if (preset) {
      if (preset.categoriaCodigo) {
        const cat = taxonomia.find((c) => c.codigo === preset.categoriaCodigo);
        if (cat) {
          setCategoriaId(cat.id);
          const sub = cat.subcategorias?.[0];
          setSubcategoriaId(sub?.id || null);
          setDetalleId(sub?.detalles?.[0]?.id || null);
          return;
        }
      }
      if (preset.subcategoriaId) {
        const cat =
          taxonomia.find((c) => c.id === preset.categoriaId) ||
          taxonomia.find((c) => c.subcategorias.some((s) => s.id === preset.subcategoriaId));
        const sub = cat?.subcategorias.find((s) => s.id === preset.subcategoriaId);
        if (cat && sub) {
          setCategoriaId(cat.id);
          setSubcategoriaId(sub.id);
          setDetalleId(sub.detalles?.[0]?.id || null);
          return;
        }
      }
    }

    if (!categoriaId && taxonomia.length > 0) {
      const defCat = taxonomia.find((c) => c.codigo === 'II_GENERALES') || taxonomia[0];
      setCategoriaId(defCat.id);
      const defSub =
        defCat.subcategorias?.find((s) => s.codigo === '_6_ALIMENTACION') ||
        defCat.subcategorias?.[0];
      if (defSub) {
        setSubcategoriaId(defSub.id);
        setDetalleId(defSub.detalles?.[0]?.id || null);
      }
    }
  }, [preset, editandoTx, taxonomia]);

  useEffect(() => {
    if (!medioPagoId && mediosPago.length > 0) {
      setMedioPagoId(mediosPago[0].id);
    }
  }, [mediosPago, medioPagoId]);

  const categoriaActual = taxonomia.find((c) => c.id === categoriaId) || taxonomia[0];
  const subcategorias = categoriaActual?.subcategorias || [];
  const subcategoriaActual =
    subcategorias.find((s) => s.id === subcategoriaId) || subcategorias[0] || null;
  const detalles = subcategoriaActual?.detalles || [];
  const detalleActual = detalles.find((d) => d.id === detalleId) || null;

  // Índice plano para el Buscador Instantáneo (encuentra cualquier área, rubro o concepto, incluso los recién creados)
  const resultadosBusqueda = useMemo(() => {
    const q = busquedaGlobal.trim().toLowerCase();
    if (!q) return [];
    const resultados = [];

    for (const cat of taxonomia) {
      const meta = getMetaCategoria(cat.codigo);
      const catNombre = meta.nombre;
      for (const sub of cat.subcategorias || []) {
        const subNombre = nombreSubcategoria(sub.codigo);
        const subEmoji = emojiSubcategoria(sub.codigo);
        const matchSub =
          subNombre.toLowerCase().includes(q) ||
          sub.codigo.toLowerCase().includes(q) ||
          catNombre.toLowerCase().includes(q);

        if (matchSub) {
          resultados.push({
            key: `sub-${sub.id}`,
            tipoItem: 'rubro',
            cat,
            sub,
            det: sub.detalles?.[0] || null,
            meta,
            subEmoji,
            titulo: subNombre,
            ruta: `${meta.emoji} ${catNombre} ➔ ${subEmoji} ${subNombre}`
          });
        }

        for (const det of sub.detalles || []) {
          if (det.nombre.toLowerCase().includes(q)) {
            resultados.push({
              key: `det-${det.id}`,
              tipoItem: 'concepto',
              cat,
              sub,
              det,
              meta,
              subEmoji,
              titulo: det.nombre,
              ruta: `${meta.emoji} ${catNombre} ➔ ${subEmoji} ${subNombre} ➔ 📄 ${det.nombre}`
            });
          }
        }
      }
    }
    return resultados.slice(0, 12);
  }, [busquedaGlobal, taxonomia]);

  const seleccionarCategoria = (cat) => {
    setCategoriaId(cat.id);
    const primeraSub = cat.subcategorias?.[0] || null;
    setSubcategoriaId(primeraSub?.id || null);
    setDetalleId(primeraSub?.detalles?.[0]?.id || null);
    setFiltroRubro('');
    setPaso2Abierto(true);
    setPaso3Abierto(true);
  };

  const seleccionarSubcategoria = (sub) => {
    setSubcategoriaId(sub.id);
    setDetalleId(sub.detalles?.[0]?.id || null);
    setPaso3Abierto(true);
  };

  const aplicarResultadoBusqueda = (r) => {
    setCategoriaId(r.cat.id);
    setSubcategoriaId(r.sub.id);
    setDetalleId(r.det?.id || null);
    setBusquedaGlobal('');
    if (montoInputRef.current) {
      montoInputRef.current.focus();
    }
  };

  // Crear nueva Área Familiar desde el Paso 1
  const handleCrearAreaRapida = async () => {
    if (!nuevaAreaNombre.trim()) return;
    try {
      const creada = await api.crearCategoria({
        codigo: nuevaAreaNombre.trim(),
        tipo: nuevaAreaTipo,
        persona: 'FAMILIA'
      });
      if (onRefreshCatalogos) await onRefreshCatalogos();
      if (creada?.id) {
        setCategoriaId(creada.id);
        setSubcategoriaId(null);
        setDetalleId(null);
      }
      setNuevaAreaNombre('');
      setCreandoArea(false);
      setCreandoRubro(true);
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo crear el área');
    }
  };

  // Crear nuevo Rubro desde el Paso 2
  const handleCrearRubroRapido = async () => {
    if (!nuevoRubroTexto.trim() || !categoriaActual) return;
    try {
      const creado = await api.crearSubcategoria({
        categoriaId: categoriaActual.id,
        codigo: nuevoRubroTexto.trim(),
        persona: categoriaActual.persona || 'FAMILIA'
      });
      if (onRefreshCatalogos) await onRefreshCatalogos();
      if (creado?.id) {
        setSubcategoriaId(creado.id);
        setDetalleId(null);
      }
      setNuevoRubroTexto('');
      setCreandoRubro(false);
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo crear el rubro');
    }
  };

  // Crear nuevo Concepto desde el Paso 3
  const handleAgregarDetalle = async () => {
    if (!nuevoDetalleTexto.trim() || !subcategoriaActual) return;
    try {
      const creado = await onQuickCreateDetalle(subcategoriaActual.id, nuevoDetalleTexto.trim());
      if (creado?.id) setDetalleId(creado.id);
      setNuevoDetalleTexto('');
      setCreandoDetalle(false);
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo agregar el concepto');
    }
  };

  const sumarMontoRapido = (valor) => {
    setErrorMsg('');
    const limpio = String(montoStr).replace(',', '.');
    const actual = parseFloat(limpio) || 0;
    setMontoStr(String(Math.round((actual + valor) * 100) / 100));
  };

  const pulsarTecla = (tecla) => {
    setErrorMsg('');
    if (tecla === 'C') {
      setMontoStr('');
      return;
    }
    if (tecla === 'DEL') {
      setMontoStr((prev) => prev.slice(0, -1));
      return;
    }
    if (tecla === '.') {
      if (montoStr.includes('.')) return;
      setMontoStr((prev) => (prev === '' ? '0.' : prev + '.'));
      return;
    }
    setMontoStr((prev) => {
      if (prev.includes('.')) {
        const [, dec] = prev.split('.');
        if (dec && dec.length >= 2) return prev;
      }
      if (prev === '0') return String(tecla);
      if (prev.length >= 9) return prev;
      return prev + String(tecla);
    });
  };

  const handleConfirmar = async (e) => {
    e?.preventDefault();
    setErrorMsg('');
    setMensajeExito('');

    const limpio = String(montoStr).trim().replace(',', '.');
    const montoNum = parseFloat(limpio);

    if (!subcategoriaActual) {
      setErrorMsg('Este área aún no tiene un rubro seleccionado. Elige o crea un rubro en el Paso 2.');
      return;
    }

    if (!Number.isFinite(montoNum) || montoNum <= 0) {
      setErrorMsg('Falta escribir cuánto fue el monto en Soles (S/).');
      if (montoInputRef.current) {
        montoInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        montoInputRef.current.focus();
      }
      return;
    }

    setGuardando(true);
    try {
      await onSaveTransaccion(
        {
          subcategoriaId: subcategoriaActual.id,
          detalleId: detalleId || null,
          medioPagoId: medioPagoId || null,
          monto: montoNum,
          clase,
          observaciones: observaciones.trim() || null,
          fecha
        },
        editandoTx?.id
      );
      setMontoStr('');
      setObservaciones('');
      setMensajeExito(
        editandoTx
          ? '¡Movimiento actualizado correctamente!'
          : `¡Guardado! Se anotó ${formatSoles(montoNum)} en ${nombreCategoria(categoriaActual?.codigo)} ➔ ${nombreSubcategoria(subcategoriaActual.codigo)}`
      );
      setTimeout(() => setMensajeExito(''), 4500);
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar el movimiento');
    } finally {
      setGuardando(false);
    }
  };

  const metaCat = getMetaCategoria(categoriaActual?.codigo);
  const verboAccion =
    categoriaActual?.tipo === 'INGRESO'
      ? 'Anotar Ingreso'
      : categoriaActual?.tipo === 'AHORRO'
        ? 'Guardar Ahorro'
        : 'Anotar Gasto';

  const subcategoriasFiltradas = !filtroRubro.trim()
    ? subcategorias
    : subcategorias.filter((s) =>
        nombreSubcategoria(s.codigo).toLowerCase().includes(filtroRubro.trim().toLowerCase())
      );

  return (
    <div className="pocket-register-shell">
      {editandoTx && (
        <div className="editing-banner">
          <div>
            <strong>Editando movimiento:</strong>{' '}
            <span>{nombreSubcategoria(editandoTx.subcategoria)}</span>
          </div>
          <button type="button" className="btn-cancel-edit" onClick={onClearEdit}>
            <X size={15} /> Cancelar edición
          </button>
        </div>
      )}

      {/* ============================================================
          BUSCADOR INSTANTÁNEO GLOBAL (ENCUENTRA CUALQUIER RUBRO O CONCEPTO)
          ============================================================ */}
      <div className="register-instant-search-card">
        <div className="register-search-input-wrap">
          <Search size={18} className="search-icon-emerald" />
          <input
            type="text"
            placeholder="¿Buscas rápido un rubro o concepto? Escribe aquí (ej. Luz, Sueldo, Gasolina o cualquier rubro nuevo)..."
            value={busquedaGlobal}
            onChange={(e) => setBusquedaGlobal(e.target.value)}
          />
          {busquedaGlobal && (
            <button
              type="button"
              className="btn-clear-search"
              onClick={() => setBusquedaGlobal('')}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {busquedaGlobal.trim() && (
          <div className="register-search-results">
            {resultadosBusqueda.length === 0 ? (
              <div className="search-empty-msg">
                No se encontró "{busquedaGlobal}". Puedes crearlo abajo en el Paso 2 (Rubro) o Paso 3 (Concepto).
              </div>
            ) : (
              resultadosBusqueda.map((r) => (
                <button
                  key={r.key}
                  type="button"
                  className="search-result-item"
                  onClick={() => aplicarResultadoBusqueda(r)}
                >
                  <span className="sr-badge" style={{ background: r.meta.bg, color: r.meta.color }}>
                    {r.tipoItem === 'concepto' ? 'Concepto' : 'Rubro'}
                  </span>
                  <div className="sr-texts">
                    <strong>{r.titulo}</strong>
                    <small>{r.ruta}</small>
                  </div>
                  <span className="sr-select-label">Elegir ➔</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* ============================================================
          DISPOSICIÓN CLARA EN 2 PANELES (PC) / CASCADA VERTICAL (MÓVIL):
          Izquierda: Pasos 1, 2 y 3 (Área Familiar ➔ Rubro ➔ Concepto)
          Derecha: Resumen seleccionado + Paso 4 (Medio de pago) + Paso 5 (Monto S/)
          ============================================================ */}
      <div className="register-two-columns">
        {/* COLUMNA IZQUIERDA: SELECCIÓN ORDENADA 1 ➔ 2 ➔ 3 */}
        <div className="register-col-steps">
          {/* ==========================================
              PASO 1: ÁREA FAMILIAR (CATEGORÍA)
              ========================================== */}
          <section className="pocket-card collapsible-step-card">
            <div
              className="step-collapsible-header"
              onClick={() => setPaso1Abierto(!paso1Abierto)}
            >
              <div className="step-header-left">
                <span className="step-num" style={{ background: metaCat.color }}>1</span>
                <div>
                  <h3>Escoge el Área Familiar</h3>
                  <small className="step-selected-preview">
                    Seleccionado: <strong>{metaCat.emoji} {metaCat.nombre}</strong> ({taxonomia.length} áreas disponibles)
                  </small>
                </div>
              </div>

              <div className="step-header-right" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="btn-mini-add"
                  onClick={() => {
                    setPaso1Abierto(true);
                    setCreandoArea(!creandoArea);
                  }}
                >
                  <Plus size={13} /> Nueva Área
                </button>
                <button
                  type="button"
                  className="btn-collapse-toggle"
                  onClick={() => setPaso1Abierto(!paso1Abierto)}
                  title={paso1Abierto ? 'Contraer sección' : 'Desplegar sección'}
                >
                  {paso1Abierto ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>
            </div>

            {paso1Abierto && (
              <div className="step-collapsible-body">
                {creandoArea && (
                  <div className="inline-add-detalle">
                    <input
                      type="text"
                      placeholder="Nombre de la nueva área (ej. Mascotas, Negocio)..."
                      value={nuevaAreaNombre}
                      onChange={(e) => setNuevaAreaNombre(e.target.value)}
                    />
                    <select
                      value={nuevaAreaTipo}
                      onChange={(e) => setNuevaAreaTipo(e.target.value)}
                      className="inline-select-mini"
                    >
                      <option value="GASTO">💸 Gasto</option>
                      <option value="INGRESO">💰 Ingreso</option>
                      <option value="AHORRO">🐷 Ahorro</option>
                    </select>
                    <button type="button" className="btn-save-mini" onClick={handleCrearAreaRapida}>
                      Crear Área
                    </button>
                  </div>
                )}

                <div className="friendly-cats-grid">
                  {taxonomia.map((cat) => {
                    const isSelected = cat.id === categoriaActual?.id;
                    const m = getMetaCategoria(cat.codigo);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        className={`friendly-cat-card ${isSelected ? 'selected' : ''}`}
                        style={
                          isSelected
                            ? { borderColor: m.color, background: m.bg, boxShadow: `0 0 0 2px ${m.color}` }
                            : {}
                        }
                        onClick={() => seleccionarCategoria(cat)}
                      >
                        <span className="friendly-cat-emoji">{m.emoji}</span>
                        <div className="friendly-cat-info">
                          <strong>{m.nombre}</strong>
                          <small>
                            {cat.subcategorias?.length || 0} rubros · {cat.tipo === 'INGRESO' ? 'Ingreso' : cat.tipo === 'AHORRO' ? 'Ahorro' : 'Gasto'}
                          </small>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </section>

          {/* ==========================================
              PASO 2: RUBRO DENTRO DEL ÁREA ELEGIDA
              ========================================== */}
          <section className="pocket-card collapsible-step-card">
            <div
              className="step-collapsible-header"
              onClick={() => setPaso2Abierto(!paso2Abierto)}
            >
              <div className="step-header-left">
                <span className="step-num" style={{ background: metaCat.color }}>2</span>
                <div>
                  <h3>
                    Escoge el Rubro de {metaCat.emoji} {metaCat.nombre}
                  </h3>
                  <small className="step-selected-preview">
                    {subcategoriaActual ? (
                      <>
                        Seleccionado:{' '}
                        <strong>
                          {emojiSubcategoria(subcategoriaActual.codigo)}{' '}
                          {nombreSubcategoria(subcategoriaActual.codigo)}
                        </strong>
                      </>
                    ) : (
                      'Sin rubro seleccionado aún'
                    )}
                  </small>
                </div>
              </div>

              <div className="step-header-right" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  className="btn-mini-add"
                  onClick={() => {
                    setPaso2Abierto(true);
                    setCreandoRubro(!creandoRubro);
                  }}
                >
                  <Plus size={13} /> Nuevo Rubro
                </button>
                <button
                  type="button"
                  className="btn-collapse-toggle"
                  onClick={() => setPaso2Abierto(!paso2Abierto)}
                  title={paso2Abierto ? 'Contraer sección' : 'Desplegar sección'}
                >
                  {paso2Abierto ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>
            </div>

            {paso2Abierto && (
              <div className="step-collapsible-body">
                {creandoRubro && (
                  <div className="inline-add-detalle">
                    <input
                      type="text"
                      placeholder={`Nuevo rubro dentro de ${metaCat.nombre}...`}
                      value={nuevoRubroTexto}
                      onChange={(e) => setNuevoRubroTexto(e.target.value)}
                    />
                    <button type="button" className="btn-save-mini" onClick={handleCrearRubroRapido}>
                      Guardar Rubro
                    </button>
                  </div>
                )}

                {subcategorias.length > 5 && (
                  <div className="mini-filter-input">
                    <Search size={14} />
                    <input
                      type="text"
                      placeholder={`Filtrar rubros de ${metaCat.nombre}...`}
                      value={filtroRubro}
                      onChange={(e) => setFiltroRubro(e.target.value)}
                    />
                    {filtroRubro && (
                      <button type="button" onClick={() => setFiltroRubro('')}>
                        <X size={13} />
                      </button>
                    )}
                  </div>
                )}

                {subcategoriasFiltradas.length === 0 ? (
                  <div className="empty-state-box">
                    No hay rubros en esta área todavía. Pulsa <strong>+ Nuevo Rubro</strong> arriba para crear el primero.
                  </div>
                ) : (
                  <div className="friendly-subcats-grid">
                    {subcategoriasFiltradas.map((sub) => {
                      const isSelected = sub.id === subcategoriaActual?.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          className={`friendly-subcat-item-btn ${isSelected ? 'selected' : ''}`}
                          style={
                            isSelected
                              ? {
                                  borderColor: metaCat.color,
                                  background: metaCat.bg,
                                  boxShadow: `0 0 0 2px ${metaCat.color}`
                                }
                              : {}
                          }
                          onClick={() => seleccionarSubcategoria(sub)}
                        >
                          <span className="friendly-sub-emoji">{emojiSubcategoria(sub.codigo)}</span>
                          <div className="friendly-sub-text">
                            <strong>{nombreSubcategoria(sub.codigo)}</strong>
                            <small>{sub.detalles?.length || 0} conceptos</small>
                          </div>
                          {isSelected && <Check size={16} style={{ color: metaCat.color, marginLeft: 'auto' }} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ==========================================
              PASO 3: CONCEPTO ESPECÍFICO DENTRO DEL RUBRO
              ========================================== */}
          <section className="pocket-card collapsible-step-card">
            <div
              className="step-collapsible-header"
              onClick={() => setPaso3Abierto(!paso3Abierto)}
            >
              <div className="step-header-left">
                <span className="step-num" style={{ background: metaCat.color }}>3</span>
                <div>
                  <h3>
                    Escoge el Concepto de{' '}
                    {subcategoriaActual ? nombreSubcategoria(subcategoriaActual.codigo) : '—'}
                  </h3>
                  <small className="step-selected-preview">
                    {detalleActual ? (
                      <>
                        Seleccionado: <strong>📄 {detalleActual.nombre}</strong>
                      </>
                    ) : (
                      'Opcional: toca un concepto o crea uno nuevo'
                    )}
                  </small>
                </div>
              </div>

              <div className="step-header-right" onClick={(e) => e.stopPropagation()}>
                {subcategoriaActual && (
                  <button
                    type="button"
                    className="btn-mini-add"
                    onClick={() => {
                      setPaso3Abierto(true);
                      setCreandoDetalle(!creandoDetalle);
                    }}
                  >
                    <Plus size={13} /> Nuevo Concepto
                  </button>
                )}
                <button
                  type="button"
                  className="btn-collapse-toggle"
                  onClick={() => setPaso3Abierto(!paso3Abierto)}
                  title={paso3Abierto ? 'Contraer sección' : 'Desplegar sección'}
                >
                  {paso3Abierto ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              </div>
            </div>

            {paso3Abierto && (
              <div className="step-collapsible-body">
                {creandoDetalle && (
                  <div className="inline-add-detalle">
                    <input
                      type="text"
                      placeholder="Escribe el nuevo concepto (ej. Frutería, Movilidad)..."
                      value={nuevoDetalleTexto}
                      onChange={(e) => setNuevoDetalleTexto(e.target.value)}
                    />
                    <button type="button" className="btn-save-mini" onClick={handleAgregarDetalle}>
                      Guardar Concepto
                    </button>
                  </div>
                )}

                {!subcategoriaActual ? (
                  <div className="empty-state-box">
                    Primero selecciona o crea un Rubro en el Paso 2.
                  </div>
                ) : detalles.length === 0 ? (
                  <div className="empty-state-box">
                    Este rubro aún no tiene conceptos específicos. Puedes registrar así o pulsar{' '}
                    <strong>+ Nuevo Concepto</strong> arriba.
                  </div>
                ) : (
                  <div className="detalles-chips-wrap">
                    {detalles.map((det) => {
                      const active = det.id === detalleId;
                      return (
                        <button
                          key={det.id}
                          type="button"
                          className={`detalle-chip-btn ${active ? 'active' : ''}`}
                          style={active ? { background: metaCat.color, borderColor: metaCat.color } : {}}
                          onClick={() => setDetalleId(det.id)}
                        >
                          {active && <Check size={14} />}
                          <span>{det.nombre}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* ============================================================
            COLUMNA DERECHA: RESUMEN DE RUTA + PASO 4 (PAGO) + PASO 5 (MONTO S/)
            ============================================================ */}
        <div className="register-col-form">
          <form onSubmit={handleConfirmar} noValidate className="pocket-card register-form-card">
            {/* RUTA DE CARPETAS SELECCIONADA (1 ➔ 2 ➔ 3) */}
            <div
              className="selected-hierarchy-banner"
              style={{ background: metaCat.bg, borderColor: metaCat.border }}
            >
              <div className="sh-breadcrumb-title">
                <FolderOpen size={15} style={{ color: metaCat.color }} />
                <span>Resumen de lo que vas a anotar:</span>
              </div>

              <div className="sh-breadcrumb-steps">
                <span className="sh-pill">
                  {metaCat.emoji} {metaCat.nombre}
                </span>
                <ArrowRight size={13} className="sh-arrow" />
                <span className="sh-pill">
                  {subcategoriaActual
                    ? `${emojiSubcategoria(subcategoriaActual.codigo)} ${nombreSubcategoria(subcategoriaActual.codigo)}`
                    : 'Sin rubro'}
                </span>
                {detalleActual && (
                  <>
                    <ArrowRight size={13} className="sh-arrow" />
                    <span className="sh-pill strong" style={{ borderColor: metaCat.color, color: metaCat.color }}>
                      📄 {detalleActual.nombre}
                    </span>
                  </>
                )}
              </div>

              <div className="sh-meta-controls">
                <div className="discreet-date-wrap">
                  {!mostrarSelectorFecha ? (
                    <button
                      type="button"
                      className="btn-discreet-date"
                      onClick={() => setMostrarSelectorFecha(true)}
                    >
                      <Calendar size={13} />
                      <span>Fecha: {fecha === hoyISO() ? 'Hoy' : fecha}</span>
                    </button>
                  ) : (
                    <input
                      type="date"
                      className="input-discreet-date"
                      value={fecha}
                      onChange={(e) => setFecha(e.target.value || hoyISO())}
                      onBlur={() => setMostrarSelectorFecha(false)}
                    />
                  )}
                </div>
              </div>
            </div>

            {/* PASO 4: ¿CON QUÉ PAGASTE? */}
            <div className="form-block">
              <label className="step-title-inline">
                <span className="step-num" style={{ background: metaCat.color }}>4</span>
                <span>¿Con qué medio de pago fue?</span>
              </label>
              <div className="medios-chips-grid">
                {mediosPago.map((mp) => {
                  const active = mp.id === medioPagoId;
                  return (
                    <button
                      key={mp.id}
                      type="button"
                      className={`medio-chip-btn ${active ? 'active' : ''}`}
                      onClick={() => setMedioPagoId(mp.id)}
                    >
                      {nombreMedioPago(mp.nombre)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* PASO 5: MONTO EN SOLES (S/) */}
            <div className="form-block amount-highlight-block">
              <div className="form-block-header">
                <label className="step-title-inline">
                  <span className="step-num" style={{ background: metaCat.color }}>5</span>
                  <span>¿Cuánto dinero fue? (Soles)</span>
                </label>
              </div>

              <div
                className={`amount-input-box ${errorMsg ? 'amount-error-border' : ''}`}
                style={{ borderColor: errorMsg ? '#e11d48' : metaCat.color }}
              >
                <span className="currency-prefix" style={{ color: metaCat.color }}>S/</span>
                <input
                  ref={montoInputRef}
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={montoStr}
                  onChange={(e) => {
                    setErrorMsg('');
                    const val = e.target.value.replace(/[^0-9.,]/g, '');
                    setMontoStr(val);
                  }}
                  className="amount-direct-input"
                />
                {montoStr && (
                  <button
                    type="button"
                    className="btn-clear-amount"
                    onClick={() => setMontoStr('')}
                    title="Borrar monto"
                  >
                    <X size={20} />
                  </button>
                )}
              </div>

              {/* Botones de billetes rápidos */}
              <div className="quick-add-amounts">
                {[10, 20, 50, 100, 200].map((val) => (
                  <button
                    key={val}
                    type="button"
                    className="quick-amt-chip"
                    onClick={() => sumarMontoRapido(val)}
                  >
                    +S/ {val}
                  </button>
                ))}
                <button
                  type="button"
                  className="quick-amt-chip toggle-pad"
                  onClick={() => setMostrarTeclado(!mostrarTeclado)}
                >
                  {mostrarTeclado ? 'Ocultar teclado' : '🔢 Teclado'}
                </button>
              </div>

              {mostrarTeclado && (
                <div className="numeric-keypad-grid">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0, 'DEL'].map((k) => (
                    <button
                      key={k}
                      type="button"
                      className={`keypad-key ${k === 'DEL' ? 'key-del' : ''}`}
                      onClick={() => pulsarTecla(k)}
                    >
                      {k === 'DEL' ? <Delete size={18} /> : k}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* NOTA OPCIONAL */}
            <div className="form-block">
              <label>Nota adicional (opcional)</label>
              <input
                type="text"
                className="obs-text-input"
                placeholder="Ej. Compras de la semana en Wong, almuerzo familiar..."
                value={observaciones}
                onChange={(e) => setObservaciones(e.target.value)}
              />
            </div>

            {/* Mensajes de error o éxito visibles JUSTO ENCIMA DEL BOTÓN */}
            {errorMsg && (
              <div className="alert-error-box inline-feedback">
                <AlertCircle size={18} />
                <span>{errorMsg}</span>
              </div>
            )}

            {mensajeExito && (
              <div className="toast-success-inline inline-feedback">
                <Check size={18} />
                <span>{mensajeExito}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleConfirmar}
              className="btn-confirm-transaction"
              style={{ background: metaCat.color }}
              disabled={guardando}
            >
              <Sparkles size={19} />
              <span>
                {guardando
                  ? 'Guardando...'
                  : editandoTx
                    ? 'Guardar Cambios'
                    : `${verboAccion}${montoStr ? ` por ${formatSoles(String(montoStr).replace(',', '.'))}` : ''}`}
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
