// ============================================================
// Vista de Reportes, Evolución Mensual en Barras Numeradas y
// Desglose por Área → Rubro → Concepto con nombres amigables
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList
} from 'recharts';
import {
  ChevronRight,
  ArrowLeft,
  Pencil,
  Trash2,
  BarChart3,
  Layers,
  ListFilter
} from 'lucide-react';
import { api } from '../api';
import {
  formatSoles,
  formatSolesEntero,
  formatFechaCorta,
  getMetaCategoria,
  nombreCategoria,
  etiquetaCategoria,
  nombreSubcategoria,
  etiquetaSubcategoria,
  emojiSubcategoria,
  nombreMedioPago
} from '../utils/format';

function formatearNombreNivel(nivel, codigoONombre) {
  if (!codigoONombre) return '';
  if (nivel === 'categoria') return etiquetaCategoria(codigoONombre);
  if (nivel === 'subcategoria') return etiquetaSubcategoria(codigoONombre);
  return codigoONombre;
}

export default function VistaReportes({
  periodoTipo,
  periodoClave,
  filtros,
  setFiltros,
  drillInicial = null,
  onClearDrillInicial,
  onEditTransaccion,
  onDeleteTransaccion,
  refreshKey
}) {
  const [rangoEvolutivo, setRangoEvolutivo] = useState('6M');
  const [anioEvolutivo, setAnioEvolutivo] = useState(new Date().getFullYear());
  const [desdeMes, setDesdeMes] = useState(`${new Date().getFullYear()}-01`);
  const [hastaMes, setHastaMes] = useState(`${new Date().getFullYear()}-12`);
  const [seriesActivas, setSeriesActivas] = useState({
    ingresos: true,
    gastos: true,
    ahorro: true
  });
  const [evolutivo, setEvolutivo] = useState({ meses: [], totales: { ingresos: 0, gastos: 0, ahorro: 0 } });

  const [nivelVista, setNivelVista] = useState('categoria');
  const [tipoMovimientoNivel, setTipoMovimientoNivel] = useState('GASTO');
  const [porNivel, setPorNivel] = useState({ total: 0, items: [] });

  const [drill, setDrill] = useState(null);
  const [drillTab, setDrillTab] = useState('subcategorias');
  const [drillSubitems, setDrillSubitems] = useState([]);
  const [drillTransacciones, setDrillTransacciones] = useState([]);
  const [verTodasTx, setVerTodasTx] = useState(false);

  const [txFiltradas, setTxFiltradas] = useState({ items: [], total: 0, totales: {} });

  useEffect(() => {
    if (drillInicial) {
      setDrill({
        nivel: 'categoria',
        id: drillInicial.categoriaId,
        nombre: drillInicial.categoria,
        monto: drillInicial.monto,
        pct: drillInicial.pct
      });
      setDrillTab('subcategorias');
      onClearDrillInicial?.();
    }
  }, [drillInicial]);

  const cargarDatosReportes = useCallback(async () => {
    try {
      const baseQuery = {
        ...filtros,
        periodoTipo,
        periodo: periodoClave
      };

      const evoParams = {
        ...filtros,
        rango: rangoEvolutivo,
        ...(rangoEvolutivo === 'ANIO' ? { anio: anioEvolutivo } : {}),
        ...(rangoEvolutivo === 'PERSONALIZADO' ? { desdeMes, hastaMes } : {})
      };

      const [resEvo, resNivel] = await Promise.all([
        api.getEvolutivo(evoParams),
        api.getPorNivel({ ...baseQuery, nivel: nivelVista, tipo: tipoMovimientoNivel })
      ]);

      setEvolutivo(resEvo);
      setPorNivel(resNivel);

      const resTx = await api.getTransacciones({
        ...filtros,
        desde: resNivel?.periodo?.desde,
        hasta: resNivel?.periodo?.hasta,
        limite: 200
      });
      setTxFiltradas(resTx);
    } catch (err) {
      console.error('Error cargando reportes:', err);
    }
  }, [periodoTipo, periodoClave, filtros, rangoEvolutivo, anioEvolutivo, desdeMes, hastaMes, nivelVista, tipoMovimientoNivel, refreshKey]);

  useEffect(() => {
    cargarDatosReportes();
  }, [cargarDatosReportes]);

  useEffect(() => {
    if (!drill) return;
    const cargarDrill = async () => {
      try {
        const filtroDrill =
          drill.nivel === 'categoria'
            ? { ...filtros, categoriaIds: [drill.id] }
            : { ...filtros, subcategoriaIds: [drill.id] };

        const subNivel = drill.nivel === 'categoria' ? 'subcategoria' : 'detalle';
        const [resSub, resTx] = await Promise.all([
          api.getPorNivel({
            ...filtroDrill,
            periodoTipo,
            periodo: periodoClave,
            nivel: subNivel,
            tipo: tipoMovimientoNivel
          }),
          api.getTransacciones({
            ...filtroDrill,
            desde: porNivel?.periodo?.desde,
            hasta: porNivel?.periodo?.hasta,
            limite: 250
          })
        ]);
        setDrillSubitems(resSub.items || []);
        setDrillTransacciones(resTx.items || []);
      } catch (err) {
        console.error('Error cargando drill-down:', err);
      }
    };
    cargarDrill();
  }, [drill, periodoTipo, periodoClave, filtros, tipoMovimientoNivel, porNivel?.periodo?.desde, porNivel?.periodo?.hasta, refreshKey]);

  const toggleSerie = (key) => {
    setSeriesActivas((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="reports-view-container">
      {/* ============================================================
          SECCIÓN 6.2: EVOLUCIÓN MENSUAL EN BARRAS NUMERADAS
          ============================================================ */}
      <div className="panel-card">
        <div className="panel-card-header wrap-header">
          <div>
            <div className="section-title-with-icon">
              <BarChart3 size={20} className="icon-forest" />
              <h3>Evolución Mes a Mes (Ingresos vs. Gastos vs. Ahorros)</h3>
            </div>
            <p>Compara cómo se movió el dinero de la familia cada mes</p>
          </div>

          <div className="evo-controls-row">
            <div className="segmented-pills">
              <button
                type="button"
                className={rangoEvolutivo === '6M' ? 'active' : ''}
                onClick={() => setRangoEvolutivo('6M')}
              >
                6 meses
              </button>
              <button
                type="button"
                className={rangoEvolutivo === 'ANIO' ? 'active' : ''}
                onClick={() => setRangoEvolutivo('ANIO')}
              >
                Año {anioEvolutivo}
              </button>
              <button
                type="button"
                className={rangoEvolutivo === '12M' ? 'active' : ''}
                onClick={() => setRangoEvolutivo('12M')}
              >
                12 meses
              </button>
              <button
                type="button"
                className={rangoEvolutivo === 'PERSONALIZADO' ? 'active' : ''}
                onClick={() => setRangoEvolutivo('PERSONALIZADO')}
              >
                Rango
              </button>
            </div>

            {rangoEvolutivo === 'ANIO' && (
              <select
                className="compact-select"
                value={anioEvolutivo}
                onChange={(e) => setAnioEvolutivo(Number(e.target.value))}
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            )}

            {rangoEvolutivo === 'PERSONALIZADO' && (
              <div className="custom-month-range">
                <input
                  type="month"
                  value={desdeMes}
                  onChange={(e) => setDesdeMes(e.target.value)}
                />
                <span>a</span>
                <input
                  type="month"
                  value={hastaMes}
                  onChange={(e) => setHastaMes(e.target.value)}
                />
              </div>
            )}
          </div>
        </div>

        <div className="evo-series-toggles">
          <button
            type="button"
            className={`serie-toggle-pill ingreso ${seriesActivas.ingresos ? 'on' : 'off'}`}
            onClick={() => toggleSerie('ingresos')}
          >
            <span className="dot" style={{ background: '#059669' }} />
            <span>Ingresos: <strong>{formatSoles(evolutivo.totales?.ingresos, 0)}</strong></span>
          </button>
          <button
            type="button"
            className={`serie-toggle-pill gasto ${seriesActivas.gastos ? 'on' : 'off'}`}
            onClick={() => toggleSerie('gastos')}
          >
            <span className="dot" style={{ background: '#e11d48' }} />
            <span>Gastos: <strong>{formatSoles(evolutivo.totales?.gastos, 0)}</strong></span>
          </button>
          <button
            type="button"
            className={`serie-toggle-pill ahorro ${seriesActivas.ahorro ? 'on' : 'off'}`}
            onClick={() => toggleSerie('ahorro')}
          >
            <span className="dot" style={{ background: '#0284c7' }} />
            <span>Ahorro: <strong>{formatSoles(evolutivo.totales?.ahorro, 0)}</strong></span>
          </button>
        </div>

        <div className="bar-chart-wrapper">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={evolutivo.meses || []}
              margin={{ top: 24, right: 8, left: 0, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="etiqueta" tick={{ fontSize: 11, fontWeight: 700 }} />
              <YAxis
                width={46}
                tickFormatter={(v) =>
                  v >= 1000 ? `S/${(Number(v) / 1000).toFixed(0)}k` : `S/${v}`
                }
                tick={{ fontSize: 10.5 }}
              />
              <Tooltip
                formatter={(value) => formatSoles(value)}
                contentStyle={{ borderRadius: '12px', border: '1px solid #cbd5e1' }}
              />
              <Legend wrapperStyle={{ paddingTop: '10px', fontWeight: 600 }} />

              {seriesActivas.ingresos && (
                <Bar dataKey="ingresos" name="Ingresos" fill="#059669" radius={[6, 6, 0, 0]}>
                  <LabelList
                    dataKey="ingresos"
                    position="top"
                    formatter={formatSolesEntero}
                    style={{ fontSize: '10.5px', fontWeight: 700, fill: '#065f46' }}
                  />
                </Bar>
              )}

              {seriesActivas.gastos && (
                <Bar dataKey="gastos" name="Gastos" fill="#e11d48" radius={[6, 6, 0, 0]}>
                  <LabelList
                    dataKey="gastos"
                    position="top"
                    formatter={formatSolesEntero}
                    style={{ fontSize: '10.5px', fontWeight: 700, fill: '#9f1239' }}
                  />
                </Bar>
              )}

              {seriesActivas.ahorro && (
                <Bar dataKey="ahorro" name="Ahorro" fill="#0284c7" radius={[6, 6, 0, 0]}>
                  <LabelList
                    dataKey="ahorro"
                    position="top"
                    formatter={formatSolesEntero}
                    style={{ fontSize: '10.5px', fontWeight: 700, fill: '#075985' }}
                  />
                </Bar>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ============================================================
          SECCIÓN 6.4 y 6.5: DESGLOSE POR ÁREA / RUBRO / CONCEPTO + DRILL-DOWN
          ============================================================ */}
      <div className="reports-two-cols">
        <div className="panel-card">
          {!drill ? (
            <>
              <div className="panel-card-header wrap-header">
                <div>
                  <div className="section-title-with-icon">
                    <Layers size={19} className="icon-forest" />
                    <h3>Ranking de Gastos por Área, Rubro y Concepto</h3>
                  </div>
                  <p>
                    Total en {porNivel?.periodo?.etiqueta}: <strong>{formatSoles(porNivel.total)}</strong>
                  </p>
                </div>

                <div className="segmented-pills">
                  {['GASTO', 'INGRESO', 'AHORRO'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      className={tipoMovimientoNivel === t ? 'active' : ''}
                      onClick={() => setTipoMovimientoNivel(t)}
                    >
                      {t === 'GASTO' ? 'Gastos' : t === 'INGRESO' ? 'Ingresos' : 'Ahorros'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="level-tabs-bar">
                {[
                  { id: 'categoria', label: '🏠 Por Área Familiar' },
                  { id: 'subcategoria', label: '🍽️ Por Rubro' },
                  { id: 'detalle', label: '🏷️ Por Concepto' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={`level-tab-btn ${nivelVista === tab.id ? 'active' : ''}`}
                    onClick={() => setNivelVista(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {porNivel.items?.length === 0 ? (
                <div className="empty-state-box">No hay registros para este filtro.</div>
              ) : (
                <div className="breakdown-rows-list">
                  {porNivel.items.map((item) => {
                    const meta = getMetaCategoria(item.padre || item.nombre);
                    const etiquetaLimpia = formatearNombreNivel(nivelVista, item.nombre);
                    const padreLimpio = item.padre
                      ? nivelVista === 'subcategoria'
                        ? nombreCategoria(item.padre)
                        : nombreSubcategoria(item.padre)
                      : '';
                    return (
                      <button
                        key={`${nivelVista}-${item.id}`}
                        type="button"
                        className="breakdown-row-btn"
                        onClick={() => {
                          if (nivelVista === 'categoria' || nivelVista === 'subcategoria') {
                            setDrill({
                              nivel: nivelVista,
                              id: item.id,
                              nombre: item.nombre,
                              padre: item.padre,
                              monto: item.monto,
                              pct: item.pct
                            });
                            setDrillTab('subcategorias');
                            setVerTodasTx(false);
                          } else if (item.id) {
                            setFiltros({ ...filtros, detalleIds: [item.id] });
                          }
                        }}
                      >
                        <div className="br-left">
                          <span className="br-color-bar" style={{ background: meta.color }} />
                          <div>
                            <strong className="br-name">{etiquetaLimpia}</strong>
                            <small className="br-meta">
                              {padreLimpio ? `${padreLimpio} · ` : ''}
                              {item.cantidad} registros
                            </small>
                          </div>
                        </div>

                        <div className="br-right">
                          <div className="br-amount-line">
                            <strong>{formatSoles(item.monto)}</strong>
                            <span className="br-pct-pill">{item.pct}%</span>
                          </div>
                          <div className="br-progress-track">
                            <div
                              className="br-progress-fill"
                              style={{ width: `${Math.min(item.pct, 100)}%`, background: meta.color }}
                            />
                          </div>
                        </div>

                        <ChevronRight size={17} className="br-chevron" />
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="drilldown-container">
              <div className="drilldown-top-bar">
                <button
                  type="button"
                  className="btn-back-drill"
                  onClick={() => setDrill(null)}
                >
                  <ArrowLeft size={16} />
                  <span>Volver atrás</span>
                </button>
              </div>

              <div className="drilldown-hero-card">
                <div>
                  <span className="drill-eyebrow">
                    {drill.padre ? `${nombreCategoria(drill.padre)} › ` : ''}
                    Detalle en {porNivel?.periodo?.etiqueta}
                  </span>
                  <h3>{formatearNombreNivel(drill.nivel, drill.nombre)}</h3>
                </div>
                <div className="drill-hero-numbers">
                  <strong>{formatSoles(drill.monto)}</strong>
                  <span>{drill.pct}% del total</span>
                </div>
              </div>

              <div className="level-tabs-bar">
                <button
                  type="button"
                  className={`level-tab-btn ${drillTab === 'subcategorias' ? 'active' : ''}`}
                  onClick={() => setDrillTab('subcategorias')}
                >
                  {drill.nivel === 'categoria' ? 'Rubros' : 'Conceptos'} ({drillSubitems.length})
                </button>
                <button
                  type="button"
                  className={`level-tab-btn ${drillTab === 'transacciones' ? 'active' : ''}`}
                  onClick={() => setDrillTab('transacciones')}
                >
                  Movimientos ({drillTransacciones.length})
                </button>
              </div>

              {drillTab === 'subcategorias' && (
                <div className="breakdown-rows-list">
                  {drillSubitems.map((sub) => {
                    const subNivel = drill.nivel === 'categoria' ? 'subcategoria' : 'detalle';
                    return (
                      <button
                        key={sub.id}
                        type="button"
                        className="breakdown-row-btn"
                        onClick={() => {
                          if (drill.nivel === 'categoria') {
                            setDrill({
                              nivel: 'subcategoria',
                              id: sub.id,
                              nombre: sub.nombre,
                              padre: drill.nombre,
                              monto: sub.monto,
                              pct: sub.pct
                            });
                          } else {
                            setDrillTab('transacciones');
                          }
                        }}
                      >
                        <div className="br-left">
                          <div>
                            <strong className="br-name">
                              {formatearNombreNivel(subNivel, sub.nombre)}
                            </strong>
                            <small className="br-meta">{sub.cantidad} movimientos</small>
                          </div>
                        </div>
                        <div className="br-right">
                          <div className="br-amount-line">
                            <strong>{formatSoles(sub.monto)}</strong>
                            <span className="br-pct-pill">{sub.pct}%</span>
                          </div>
                        </div>
                        <ChevronRight size={16} className="br-chevron" />
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="drill-tx-section">
                <div className="drill-tx-header">
                  <h4>{drillTab === 'transacciones' ? 'Todos los movimientos' : 'Últimos movimientos'}</h4>
                  {drillTransacciones.length > 5 && drillTab !== 'transacciones' && (
                    <button
                      type="button"
                      className="btn-link-subtle"
                      onClick={() => {
                        setVerTodasTx(true);
                        setDrillTab('transacciones');
                      }}
                    >
                      Ver todos ({drillTransacciones.length}) →
                    </button>
                  )}
                </div>

                <div className="tx-compact-list">
                  {(drillTab === 'transacciones' || verTodasTx
                    ? drillTransacciones
                    : drillTransacciones.slice(0, 5)
                  ).map((tx) => (
                    <div key={tx.id} className="tx-row-item">
                      <div className="tx-badge-cat">{formatFechaCorta(tx.fecha)}</div>
                      <div className="tx-main-info">
                        <div className="tx-title-line">
                          <strong>
                            {emojiSubcategoria(tx.subcategoria)}{' '}
                            {tx.detalle || nombreSubcategoria(tx.subcategoria)}
                          </strong>
                        </div>
                        <div className="tx-sub-line">
                          <span>{nombreSubcategoria(tx.subcategoria)}</span>
                          {tx.medioPago && (
                            <>
                              <span>·</span>
                              <span className="tx-medio-tag">{nombreMedioPago(tx.medioPago)}</span>
                            </>
                          )}
                        </div>
                        {tx.observaciones && <div className="tx-obs-line">“{tx.observaciones}”</div>}
                      </div>
                      <div className="tx-right-col">
                        <span className={`tx-amount-val ${tx.tipo.toLowerCase()}`}>
                          {formatSoles(tx.monto)}
                        </span>
                        <div className="tx-row-actions">
                          <button
                            type="button"
                            className="tx-icon-btn"
                            onClick={() => onEditTransaccion(tx)}
                            title="Editar"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            className="tx-icon-btn danger"
                            onClick={() => onDeleteTransaccion(tx.id)}
                            title="Eliminar"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Panel Derecho: Historial Filtrado Completo */}
        <div className="panel-card">
          <div className="panel-card-header">
            <div>
              <div className="section-title-with-icon">
                <ListFilter size={19} className="icon-forest" />
                <h3>Historial de Movimientos ({txFiltradas.total || 0})</h3>
              </div>
              <p>
                Ingresos: <strong>{formatSoles(txFiltradas.totales?.INGRESO)}</strong> · Gastos:{' '}
                <strong>{formatSoles(txFiltradas.totales?.GASTO)}</strong> · Ahorro:{' '}
                <strong>{formatSoles(txFiltradas.totales?.AHORRO)}</strong>
              </p>
            </div>
          </div>

          {txFiltradas.items?.length === 0 ? (
            <div className="empty-state-box">No hay movimientos que coincidan con los filtros.</div>
          ) : (
            <div className="tx-compact-list scrollable-tx-list">
              {txFiltradas.items.map((tx) => {
                const meta = getMetaCategoria(tx.categoria);
                return (
                  <div key={tx.id} className="tx-row-item">
                    <div
                      className="tx-badge-cat"
                      style={{ background: meta.bg, color: meta.color, borderColor: meta.border }}
                    >
                      {formatFechaCorta(tx.fecha)}
                    </div>
                    <div className="tx-main-info">
                      <div className="tx-title-line">
                        <strong>
                          {emojiSubcategoria(tx.subcategoria)}{' '}
                          {tx.detalle || nombreSubcategoria(tx.subcategoria)}
                        </strong>
                        <span className="tx-person-tag">{tx.persona}</span>
                      </div>
                      <div className="tx-sub-line">
                        <span>{meta.emoji} {nombreCategoria(tx.categoria)}</span>
                        <span>›</span>
                        <span>{nombreSubcategoria(tx.subcategoria)}</span>
                        {tx.medioPago && (
                          <>
                            <span>·</span>
                            <span className="tx-medio-tag">{nombreMedioPago(tx.medioPago)}</span>
                          </>
                        )}
                      </div>
                      {tx.observaciones && <div className="tx-obs-line">“{tx.observaciones}”</div>}
                    </div>
                    <div className="tx-right-col">
                      <span className={`tx-amount-val ${tx.tipo.toLowerCase()}`}>
                        {tx.tipo === 'GASTO' ? '-' : '+'}
                        {formatSoles(tx.monto)}
                      </span>
                      <div className="tx-row-actions">
                        <button
                          type="button"
                          className="tx-icon-btn"
                          onClick={() => onEditTransaccion(tx)}
                          title="Editar movimiento"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          className="tx-icon-btn danger"
                          onClick={() => onDeleteTransaccion(tx.id)}
                          title="Eliminar movimiento"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
