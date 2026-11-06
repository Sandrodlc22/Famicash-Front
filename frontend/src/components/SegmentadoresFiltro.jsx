// ============================================================
// Segmentadores de Filtro en Cascada con Secciones Colapsables a Voluntad:
//  - Cada bloque (1. Área Familiar, 2. Rubro, 3. Concepto, 4. Medio de pago)
//    se puede contraer o desplegar haciendo clic en su encabezado.
//  - Incluye botón global "Contraer secciones / Desplegar secciones" para
//    ahorrar espacio de pantalla en celular y PC.
// ============================================================
import React, { useState } from 'react';
import {
  FilterX,
  CheckSquare,
  Square,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  X
} from 'lucide-react';
import {
  etiquetaCategoria,
  etiquetaSubcategoria,
  nombreSubcategoria,
  nombreMedioPago
} from '../utils/format';

export default function SegmentadoresFiltro({
  taxonomia = [],
  mediosPago = [],
  filtros,
  setFiltros,
  onClear,
  onClose
}) {
  // En celular iniciamos Rubros y Conceptos contraídos para no tapar la pantalla,
  // pero el usuario puede abrir o cerrar cualquiera a voluntad con un toque.
  const esMovil = typeof window !== 'undefined' && window.innerWidth < 960;

  const [secAbiertas, setSecAbiertas] = useState({
    areas: true,
    rubros: !esMovil,
    conceptos: !esMovil,
    medios: !esMovil
  });

  const [busquedaRubro, setBusquedaRubro] = useState('');
  const [busquedaConcepto, setBusquedaConcepto] = useState('');

  const toggleSeccion = (clave) => {
    setSecAbiertas((prev) => ({ ...prev, [clave]: !prev[clave] }));
  };

  const todasAbiertas =
    secAbiertas.areas && secAbiertas.rubros && secAbiertas.conceptos && secAbiertas.medios;

  const toggleTodasLasSecciones = () => {
    const nuevoEstado = !todasAbiertas;
    setSecAbiertas({
      areas: nuevoEstado,
      rubros: nuevoEstado,
      conceptos: nuevoEstado,
      medios: nuevoEstado
    });
  };

  const toggleEnArray = (campo, id) => {
    const actual = filtros[campo] || [];
    const existe = actual.includes(id);
    const nuevo = existe ? actual.filter((x) => x !== id) : [...actual, id];
    const next = { ...filtros, [campo]: nuevo };

    if (campo === 'categoriaIds' && nuevo.length > 0) {
      const subsValidas = new Set(
        taxonomia
          .filter((c) => nuevo.includes(c.id))
          .flatMap((c) => c.subcategorias.map((s) => s.id))
      );
      next.subcategoriaIds = (next.subcategoriaIds || []).filter((idSub) => subsValidas.has(idSub));
    }
    if (
      (campo === 'categoriaIds' || campo === 'subcategoriaIds') &&
      (next.subcategoriaIds || []).length > 0
    ) {
      const detsValidos = new Set(
        taxonomia
          .flatMap((c) => c.subcategorias)
          .filter((s) => next.subcategoriaIds.includes(s.id))
          .flatMap((s) => s.detalles.map((d) => d.id))
      );
      next.detalleIds = (next.detalleIds || []).filter((idDet) => detsValidos.has(idDet));
    }
    setFiltros(next);
  };

  const subcategoriasVisibles = taxonomia
    .filter((c) => !filtros.categoriaIds?.length || filtros.categoriaIds.includes(c.id))
    .flatMap((c) => c.subcategorias.map((s) => ({ ...s, categoriaCodigo: c.codigo })))
    .filter((s) =>
      !busquedaRubro.trim()
        ? true
        : nombreSubcategoria(s.codigo).toLowerCase().includes(busquedaRubro.trim().toLowerCase()) ||
          s.codigo.toLowerCase().includes(busquedaRubro.trim().toLowerCase())
    );

  const detallesVisibles = taxonomia
    .filter((c) => !filtros.categoriaIds?.length || filtros.categoriaIds.includes(c.id))
    .flatMap((c) => c.subcategorias)
    .filter((s) => !filtros.subcategoriaIds?.length || filtros.subcategoriaIds.includes(s.id))
    .flatMap((s) => s.detalles.map((d) => ({ ...d, subcategoriaCodigo: s.codigo })))
    .filter((d) =>
      !busquedaConcepto.trim()
        ? true
        : d.nombre.toLowerCase().includes(busquedaConcepto.trim().toLowerCase())
    );

  const hayFiltros =
    (filtros.categoriaIds?.length || 0) +
      (filtros.subcategoriaIds?.length || 0) +
      (filtros.detalleIds?.length || 0) +
      (filtros.medioPagoIds?.length || 0) +
      (filtros.persona?.length || 0) +
      (filtros.tipo?.length || 0) +
      (filtros.q ? 1 : 0) >
    0;

  const ETIQUETA_PERSONA = {
    ANTHONY: '👨 Anthony',
    VANESSA: '👩 Vanessa',
    LARA: '👧 Lara',
    FAMILIA: '🏠 Hogar'
  };

  const ETIQUETA_TIPO = {
    INGRESO: '💰 Ingresos',
    GASTO: '💸 Gastos',
    AHORRO: '🐷 Ahorros'
  };

  return (
    <div className="slicers-wrapper">
      {/* Barra superior rápida: Persona, Tipo, Buscador y Botón Colapsar/Expandir */}
      <div className="slicers-top-bar">
        <div className="slicers-quick-row">
          {/* Filtro por Persona */}
          <div className="slicer-inline-group">
            <span className="slicer-inline-label">¿De quién?:</span>
            {['FAMILIA', 'ANTHONY', 'VANESSA', 'LARA'].map((p) => {
              const active = (filtros.persona || []).includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  className={`slicer-chip ${active ? 'active' : ''}`}
                  onClick={() => toggleEnArray('persona', p)}
                >
                  {ETIQUETA_PERSONA[p] || p}
                </button>
              );
            })}
          </div>

          {/* Filtro por Tipo */}
          <div className="slicer-inline-group">
            <span className="slicer-inline-label">Tipo:</span>
            {['GASTO', 'INGRESO', 'AHORRO'].map((t) => {
              const active = (filtros.tipo || []).includes(t);
              return (
                <button
                  key={t}
                  type="button"
                  className={`slicer-chip ${active ? 'active' : ''}`}
                  onClick={() => toggleEnArray('tipo', t)}
                >
                  {ETIQUETA_TIPO[t] || t}
                </button>
              );
            })}
          </div>

          {/* Buscador rápido */}
          <div className="slicer-search-box">
            <Search size={14} />
            <input
              type="text"
              placeholder="Buscar concepto o nota..."
              value={filtros.q || ''}
              onChange={(e) => setFiltros({ ...filtros, q: e.target.value })}
            />
            {filtros.q && (
              <button
                type="button"
                className="btn-clear-search"
                onClick={() => setFiltros({ ...filtros, q: '' })}
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>

        <div className="slicers-actions-right">
          <button
            type="button"
            className="btn-toggle-all-slicers"
            onClick={toggleTodasLasSecciones}
            title="Contraer o desplegar todas las cajas de filtros"
          >
            <ChevronsUpDown size={14} />
            <span>{todasAbiertas ? 'Contraer secciones' : 'Desplegar secciones'}</span>
          </button>

          {hayFiltros && (
            <button type="button" className="btn-clear-slicers" onClick={onClear}>
              <FilterX size={15} />
              <span>Quitar filtros</span>
            </button>
          )}

          {onClose && (
            <button type="button" className="btn-close-slicers" onClick={onClose}>
              <span>Listo · Ver gráficos</span>
            </button>
          )}
        </div>
      </div>

      {/* Tres Segmentadores en Cascada COLAPSABLES A VOLUNTAD */}
      <div className="slicers-grid-3">
        {/* ==========================================
            1. ÁREA FAMILIAR (COLAPSABLE)
            ========================================== */}
        <div className={`slicer-box ${secAbiertas.areas ? 'is-open' : 'is-collapsed'}`}>
          <div
            className="slicer-box-header clickable"
            onClick={() => toggleSeccion('areas')}
          >
            <div className="slicer-header-title">
              {secAbiertas.areas ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <span>1. Área Familiar</span>
              <span
                className={`slicer-count-pill ${
                  filtros.categoriaIds?.length > 0 ? 'active' : ''
                }`}
              >
                {filtros.categoriaIds?.length > 0
                  ? `${filtros.categoriaIds.length} selec.`
                  : 'Todas'}
              </span>
            </div>

            {filtros.categoriaIds?.length > 0 && (
              <button
                type="button"
                className="slicer-mini-clear"
                onClick={(e) => {
                  e.stopPropagation();
                  setFiltros({ ...filtros, categoriaIds: [] });
                }}
              >
                Limpiar
              </button>
            )}
          </div>

          {secAbiertas.areas && (
            <div className="slicer-box-list">
              {taxonomia.map((cat) => {
                const selected = (filtros.categoriaIds || []).includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`slicer-item-btn ${selected ? 'selected' : ''}`}
                    onClick={() => toggleEnArray('categoriaIds', cat.id)}
                  >
                    {selected ? <CheckSquare size={14} /> : <Square size={14} />}
                    <span>{etiquetaCategoria(cat.codigo)}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ==========================================
            2. RUBRO / SUBCATEGORÍA (COLAPSABLE)
            ========================================== */}
        <div className={`slicer-box ${secAbiertas.rubros ? 'is-open' : 'is-collapsed'}`}>
          <div
            className="slicer-box-header clickable"
            onClick={() => toggleSeccion('rubros')}
          >
            <div className="slicer-header-title">
              {secAbiertas.rubros ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <span>2. Rubro</span>
              <span
                className={`slicer-count-pill ${
                  filtros.subcategoriaIds?.length > 0 ? 'active' : ''
                }`}
              >
                {filtros.subcategoriaIds?.length > 0
                  ? `${filtros.subcategoriaIds.length} selec.`
                  : 'Todos'}
              </span>
            </div>

            {filtros.subcategoriaIds?.length > 0 && (
              <button
                type="button"
                className="slicer-mini-clear"
                onClick={(e) => {
                  e.stopPropagation();
                  setFiltros({ ...filtros, subcategoriaIds: [] });
                }}
              >
                Limpiar
              </button>
            )}
          </div>

          {secAbiertas.rubros && (
            <>
              <div className="slicer-internal-search">
                <Search size={13} />
                <input
                  type="text"
                  placeholder="Filtrar rubros..."
                  value={busquedaRubro}
                  onChange={(e) => setBusquedaRubro(e.target.value)}
                />
                {busquedaRubro && (
                  <button type="button" onClick={() => setBusquedaRubro('')}>
                    <X size={12} />
                  </button>
                )}
              </div>
              <div className="slicer-box-list">
                {subcategoriasVisibles.map((sub) => {
                  const selected = (filtros.subcategoriaIds || []).includes(sub.id);
                  return (
                    <button
                      key={sub.id}
                      type="button"
                      className={`slicer-item-btn ${selected ? 'selected' : ''}`}
                      onClick={() => toggleEnArray('subcategoriaIds', sub.id)}
                    >
                      {selected ? <CheckSquare size={14} /> : <Square size={14} />}
                      <span>{etiquetaSubcategoria(sub.codigo)}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* ==========================================
            3. CONCEPTO ESPECÍFICO (COLAPSABLE)
            ========================================== */}
        <div className={`slicer-box ${secAbiertas.conceptos ? 'is-open' : 'is-collapsed'}`}>
          <div
            className="slicer-box-header clickable"
            onClick={() => toggleSeccion('conceptos')}
          >
            <div className="slicer-header-title">
              {secAbiertas.conceptos ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <span>3. Concepto específico</span>
              <span
                className={`slicer-count-pill ${
                  filtros.detalleIds?.length > 0 ? 'active' : ''
                }`}
              >
                {filtros.detalleIds?.length > 0
                  ? `${filtros.detalleIds.length} selec.`
                  : 'Todos'}
              </span>
            </div>

            {filtros.detalleIds?.length > 0 && (
              <button
                type="button"
                className="slicer-mini-clear"
                onClick={(e) => {
                  e.stopPropagation();
                  setFiltros({ ...filtros, detalleIds: [] });
                }}
              >
                Limpiar
              </button>
            )}
          </div>

          {secAbiertas.conceptos && (
            <>
              <div className="slicer-internal-search">
                <Search size={13} />
                <input
                  type="text"
                  placeholder="Filtrar conceptos..."
                  value={busquedaConcepto}
                  onChange={(e) => setBusquedaConcepto(e.target.value)}
                />
                {busquedaConcepto && (
                  <button type="button" onClick={() => setBusquedaConcepto('')}>
                    <X size={12} />
                  </button>
                )}
              </div>
              <div className="slicer-box-list slicer-details-grid">
                {detallesVisibles.map((det) => {
                  const selected = (filtros.detalleIds || []).includes(det.id);
                  return (
                    <button
                      key={det.id}
                      type="button"
                      className={`slicer-item-btn ${selected ? 'selected' : ''}`}
                      onClick={() => toggleEnArray('detalleIds', det.id)}
                      title={det.nombre}
                    >
                      {selected ? <CheckSquare size={14} /> : <Square size={14} />}
                      <span className="truncate-text">{det.nombre}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ==========================================
          4. MEDIOS DE PAGO (COLAPSABLE)
          ========================================== */}
      {mediosPago.length > 0 && (
        <div className={`slicer-box ${secAbiertas.medios ? 'is-open' : 'is-collapsed'}`}>
          <div
            className="slicer-box-header clickable"
            onClick={() => toggleSeccion('medios')}
          >
            <div className="slicer-header-title">
              {secAbiertas.medios ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              <span>4. Medio de pago</span>
              <span
                className={`slicer-count-pill ${
                  filtros.medioPagoIds?.length > 0 ? 'active' : ''
                }`}
              >
                {filtros.medioPagoIds?.length > 0
                  ? `${filtros.medioPagoIds.length} selec.`
                  : 'Todos'}
              </span>
            </div>

            {filtros.medioPagoIds?.length > 0 && (
              <button
                type="button"
                className="slicer-mini-clear"
                onClick={(e) => {
                  e.stopPropagation();
                  setFiltros({ ...filtros, medioPagoIds: [] });
                }}
              >
                Limpiar
              </button>
            )}
          </div>

          {secAbiertas.medios && (
            <div className="slicer-medios-body">
              <div className="slicer-medios-chips">
                {mediosPago.map((m) => {
                  const active = (filtros.medioPagoIds || []).includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      className={`slicer-chip ${active ? 'active' : ''}`}
                      onClick={() => toggleEnArray('medioPagoIds', m.id)}
                    >
                      {nombreMedioPago(m.nombre)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
