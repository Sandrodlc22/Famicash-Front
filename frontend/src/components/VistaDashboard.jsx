// ============================================================
// Vista Principal: Resumen Familiar y Accesos de Bolsillo (Brief 6.1)
// Fórmulas exactas conservadas por debajo, pero explicadas en español
// sencillo y con nombres 100% estéticos sin códigos de Excel.
// ============================================================
import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  CheckCircle2,
  Plus,
  Minus,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  Pencil,
  ChevronRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import {
  formatSoles,
  formatFechaCorta,
  PALETA_DONA,
  getMetaCategoria,
  nombreCategoria,
  nombreSubcategoria,
  emojiSubcategoria,
  nombreMedioPago
} from '../utils/format';

function VariacionBadge({ pct, invertirColor = false }) {
  if (pct === null || pct === undefined) {
    return <span className="var-badge neutral">Mes actual</span>;
  }
  const sube = pct >= 0;
  const esPositivo = invertirColor ? !sube : sube;
  return (
    <span className={`var-badge ${pct === 0 ? 'neutral' : esPositivo ? 'good' : 'bad'}`}>
      {sube ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
      {sube ? '+' : ''}
      {pct}% vs ant.
    </span>
  );
}

export default function VistaDashboard({
  usuario,
  resumen,
  transacciones = [],
  favoritos = [],
  onQuickRegister,
  onOpenFavorito,
  onDrillCategoria,
  onEditTransaccion,
  onDeleteTransaccion,
  onGoToView
}) {
  const actual = resumen?.actual || {
    ingresos: 0,
    gastos: 0,
    disponible: 0,
    ahorros: 0,
    total: 0
  };
  const variacion = resumen?.variacion || {};
  const distribucion = resumen?.distribucion || [];

  return (
    <div className="dashboard-container">
      {/* Banner principal pensado para usar desde el celular al instante */}
      <div className="welcome-banner-card">
        <div className="welcome-text-block">
          <span className="welcome-eyebrow">
            Billetera Familiar · {resumen?.periodo?.etiqueta || ''}
          </span>
          <h2>¡Hola, {usuario?.nombre || 'Familia'}! 👋</h2>
          <p>
            Mira de un vistazo cuánto ingresó, cuánto se gastó y cuánto dinero libre queda en casa.
          </p>
        </div>

        <div className="quick-type-actions">
          <button
            type="button"
            className="quick-action-pill gasto-primary"
            onClick={() => onQuickRegister('II_GENERALES')}
          >
            <span className="qa-icon"><Minus size={18} /></span>
            <span>Anotar Gasto</span>
          </button>
          <button
            type="button"
            className="quick-action-pill ingreso"
            onClick={() => onQuickRegister('I_INGRESOS')}
          >
            <span className="qa-icon"><Plus size={18} /></span>
            <span>Anotar Ingreso</span>
          </button>
          <button
            type="button"
            className="quick-action-pill ahorro"
            onClick={() => onQuickRegister('VI_AHORRO')}
          >
            <span className="qa-icon"><PiggyBank size={18} /></span>
            <span>Guardar Ahorro</span>
          </button>
        </div>
      </div>

      {/* 5 Tarjetas de Resumen (Clarísimas a primera vista) */}
      <div className="kpi-cards-grid-5">
        {/* 1. Ingresos */}
        <div className="kpi-stat-card ingreso">
          <div className="kpi-card-top">
            <span className="kpi-label">1. Ingresos del mes</span>
            <div className="kpi-icon-circle ingreso"><TrendingUp size={18} /></div>
          </div>
          <div className="kpi-amount">{formatSoles(actual.ingresos)}</div>
          <div className="kpi-card-bottom">
            <VariacionBadge pct={variacion.ingresos} />
            <span className="kpi-formula-hint">Sueldos e ingresos extras</span>
          </div>
        </div>

        {/* 2. Gastos */}
        <div className="kpi-stat-card gasto">
          <div className="kpi-card-top">
            <span className="kpi-label">2. Total Gastado</span>
            <div className="kpi-icon-circle gasto"><TrendingDown size={18} /></div>
          </div>
          <div className="kpi-amount">{formatSoles(actual.gastos)}</div>
          <div className="kpi-card-bottom">
            <VariacionBadge pct={variacion.gastos} invertirColor />
            <span className="kpi-formula-hint">Hogar, Lara, Vanessa y Anthony</span>
          </div>
        </div>

        {/* 3. Disponible */}
        <div className="kpi-stat-card disponible">
          <div className="kpi-card-top">
            <span className="kpi-label">3. Queda Disponible</span>
            <div className="kpi-icon-circle disponible"><Wallet size={18} /></div>
          </div>
          <div className="kpi-amount">{formatSoles(actual.disponible)}</div>
          <div className="kpi-card-bottom">
            <VariacionBadge pct={variacion.disponible} />
            <span className="kpi-formula-hint">Ingresos menos Gastos</span>
          </div>
        </div>

        {/* 4. Ahorros */}
        <div className="kpi-stat-card ahorro">
          <div className="kpi-card-top">
            <span className="kpi-label">4. Ahorro Guardado</span>
            <div className="kpi-icon-circle ahorro"><PiggyBank size={18} /></div>
          </div>
          <div className="kpi-amount">{formatSoles(actual.ahorros)}</div>
          <div className="kpi-card-bottom">
            <VariacionBadge pct={variacion.ahorros} />
            <span className="kpi-formula-hint">Apartado para metas</span>
          </div>
        </div>

        {/* 5. Saldo Libre */}
        <div className="kpi-stat-card total">
          <div className="kpi-card-top">
            <span className="kpi-label">5. Saldo Libre Final</span>
            <div className="kpi-icon-circle total"><CheckCircle2 size={18} /></div>
          </div>
          <div className="kpi-amount">{formatSoles(actual.total)}</div>
          <div className="kpi-card-bottom">
            <VariacionBadge pct={variacion.total} />
            <span className="kpi-formula-hint">Lo que sobra tras ahorrar</span>
          </div>
        </div>
      </div>

      {/* Atajos de Bolsillo: Toca uno para ir directo a poner el monto */}
      <div className="favorites-bar-card">
        <div className="favorites-bar-header">
          <div className="fav-title-wrap">
            <Star size={16} className="star-icon-filled" />
            <span>¿Qué acabas de pagar? Toca un atajo rápido para anotarlo:</span>
          </div>
          <button
            type="button"
            className="btn-link-subtle"
            onClick={() => onGoToView('register')}
          >
            Personalizar atajos →
          </button>
        </div>

        <div className="pocket-favs-grid">
          {favoritos.map((fav) => {
            const meta = getMetaCategoria(fav.categoria);
            return (
              <button
                key={fav.subcategoriaId}
                type="button"
                className="pocket-fav-btn"
                style={{ borderColor: meta.border, background: meta.bg }}
                onClick={() => onOpenFavorito(fav)}
              >
                <span className="pocket-fav-emoji">{emojiSubcategoria(fav.subcategoria)}</span>
                <div className="pocket-fav-text">
                  <strong>{nombreSubcategoria(fav.subcategoria)}</strong>
                  <small style={{ color: meta.color }}>
                    {meta.emoji} {nombreCategoria(fav.categoria)}
                  </small>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cuerpo en 2 columnas: ¿En qué se va el dinero? + Últimos Movimientos */}
      <div className="dashboard-two-cols">
        {/* Columna 1: Gráfico de Dona con nombres amigables */}
        <div className="panel-card">
          <div className="panel-card-header">
            <div>
              <h3>¿En qué se va el dinero?</h3>
              <p>Reparto de gastos en {resumen?.periodo?.etiqueta} (toca uno para ver el detalle)</p>
            </div>
            <button
              type="button"
              className="btn-link-subtle"
              onClick={() => onGoToView('reports')}
            >
              Ver gráficos →
            </button>
          </div>

          {distribucion.length === 0 ? (
            <div className="empty-state-box">
              No hay gastos registrados en este periodo.
            </div>
          ) : (
            <div className="donut-layout-wrap">
              <div className="donut-chart-box">
                <ResponsiveContainer width="100%" height={230}>
                  <PieChart>
                    <Pie
                      data={distribucion}
                      dataKey="monto"
                      nameKey="categoria"
                      cx="50%"
                      cy="50%"
                      innerRadius={62}
                      outerRadius={92}
                      paddingAngle={3}
                    >
                      {distribucion.map((entry, index) => (
                        <Cell
                          key={entry.categoriaId}
                          fill={getMetaCategoria(entry.categoria).color || PALETA_DONA[index % PALETA_DONA.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val, name) => [formatSoles(val), nombreCategoria(name)]}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="donut-center-label">
                  <small>Total Gastado</small>
                  <strong>{formatSoles(actual.gastos, 0)}</strong>
                </div>
              </div>

              <div className="donut-legend-list">
                {distribucion.map((item, idx) => {
                  const meta = getMetaCategoria(item.categoria);
                  return (
                    <button
                      key={item.categoriaId}
                      type="button"
                      className="donut-legend-row"
                      onClick={() => onDrillCategoria(item)}
                      title="Ver en qué se gastó dentro de este grupo"
                    >
                      <span
                        className="legend-dot"
                        style={{ background: meta.color || PALETA_DONA[idx % PALETA_DONA.length] }}
                      />
                      <div className="legend-name-col">
                        <strong>{meta.emoji} {meta.nombre}</strong>
                        <small>{meta.descripcion}</small>
                      </div>
                      <div className="legend-amount-col">
                        <strong>{formatSoles(item.monto)}</strong>
                        <span>{item.pct}%</span>
                      </div>
                      <ChevronRight size={15} className="legend-chevron" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Columna 2: Últimos movimientos del periodo con nombres limpios */}
        <div className="panel-card">
          <div className="panel-card-header">
            <div>
              <h3>Últimos Movimientos</h3>
              <p>Lo último que anotaron en casa (puedes corregir o borrar)</p>
            </div>
            <button
              type="button"
              className="btn-link-subtle"
              onClick={() => onGoToView('reports')}
            >
              Ver todos ({transacciones.length}) →
            </button>
          </div>

          {transacciones.length === 0 ? (
            <div className="empty-state-box">
              Sin movimientos anotados en este periodo.
            </div>
          ) : (
            <div className="tx-compact-list">
              {transacciones.slice(0, 10).map((tx) => {
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
                        {tx.clase && <span className="tx-class-tag">{tx.clase}</span>}
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
                      {tx.observaciones && (
                        <div className="tx-obs-line">“{tx.observaciones}”</div>
                      )}
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
