import React, { useState } from 'react';
import {
  Calendar,
  ChevronDown,
  TrendingDown,
  TrendingUp,
  Car,
  Laptop,
  GraduationCap,
  Trash2,
  Filter,
  PlusCircle,
  PiggyBank,
  RefreshCw,
  Wallet
} from 'lucide-react';
import { getCategoryIcon } from '../utils/iconosCategorias';
import logoFamicash from '../assets/logo-famicash.png';

export default function VistaResumen({
  resumen,
  movimientos,
  cuentas,
  onDeleteMovimiento,
  onGoToExpense,
  onRefresh
}) {
  const [filterTipo, setFilterTipo] = useState('ALL'); // 'ALL', 'GASTO', 'INGRESO'
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filtrar movimientos
  const filteredMovimientos = movimientos.filter((m) => {
    if (filterTipo === 'ALL') return true;
    if (filterTipo === 'INGRESO') return m.tipo?.toUpperCase() === 'INGRESO' || m.tipo?.toUpperCase() === 'TRANSFERENCIA';
    return m.tipo?.toUpperCase() === filterTipo;
  });

  // Agrupar movimientos por fecha para el feed
  const groupedMovements = filteredMovimientos.reduce((acc, mov) => {
    const dateObj = new Date(mov.fecha_movimiento || Date.now());
    const today = new Date();
    const isToday = dateObj.toDateString() === today.toDateString();
    const yesterday = new Date(Date.now() - 86400000);
    const isYesterday = dateObj.toDateString() === yesterday.toDateString();

    let dateLabel = '';
    if (isToday) dateLabel = 'Hoy, ' + dateObj.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
    else if (isYesterday) dateLabel = 'Ayer, ' + dateObj.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' });
    else dateLabel = dateObj.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' });

    if (!acc[dateLabel]) {
      acc[dateLabel] = {
        label: dateLabel,
        totalGasto: 0,
        items: []
      };
    }

    if (mov.tipo === 'GASTO') {
      acc[dateLabel].totalGasto += parseFloat(mov.monto || 0);
    }
    acc[dateLabel].items.push(mov);
    return acc;
  }, {});

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const saldoTotal = resumen?.saldoTotal ?? cuentas.reduce((acc, c) => acc + parseFloat(c.saldo_actual || 0), 0);
  const totalGastos = resumen?.totalGastos ?? 1518.50;
  const totalIngresos = resumen?.totalIngresos ?? 7300.00;
  const pctPresupuesto = resumen?.porcentajePresupuestoGastado ?? 30;

  return (
    <div className="summary-view-wrapper">
      {/* 1. Header con logo FamiCash, selector de mes y acciones */}
      <header className="summary-top-bar">
        <div className="summary-logo-wrap">
          <img src={logoFamicash} alt="FamiCash" className="summary-famicash-logo" />
        </div>

        <div className="summary-month-pill">
          <Calendar size={14} className="month-cal-icon" />
          <span className="month-text">Octubre 2026</span>
          <ChevronDown size={14} />
        </div>

        <div className="summary-header-actions">
          <button
            type="button"
            className={`summary-action-btn ${isRefreshing ? 'spin-anim' : ''}`}
            onClick={handleRefreshClick}
            title="Actualizar datos"
          >
            <RefreshCw size={17} />
          </button>
        </div>
      </header>

      {/* Contenido scrolleable de resumen */}
      <div className="summary-scroll-area">
        {/* Tarjeta Hero de Balance General */}
        <section className="summary-balance-hero">
          <div className="balance-hero-header">
            <span className="balance-hero-title">Saldo Total Disponible</span>
            <span className="balance-status-badge">Actualizado</span>
          </div>

          <div className="balance-big-amount">
            S/ {saldoTotal.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>

          <div className="balance-split-row">
            {/* Gastos */}
            <div className="balance-metric-item gasto-metric">
              <div className="metric-icon-bubble gasto-bubble">
                <TrendingDown size={16} />
              </div>
              <div className="metric-text-col">
                <span className="metric-label">Gastos</span>
                <span className="metric-value-gasto">
                  -S/ {totalGastos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div className="balance-split-divider"></div>

            {/* Ingresos */}
            <div className="balance-metric-item ingreso-metric">
              <div className="metric-icon-bubble ingreso-bubble">
                <TrendingUp size={16} />
              </div>
              <div className="metric-text-col">
                <span className="metric-label">Ingresos</span>
                <span className="metric-value-ingreso">
                  +S/ {totalIngresos.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Tarjeta de Presupuesto Mensual (Como en el mockup 4) */}
        <section className="monthly-budget-card">
          <div className="budget-card-top">
            <div className="budget-tag-group">
              <span className="budget-tag-name">Presupuesto Mensual</span>
              <span className="budget-tag-pill">Activo</span>
            </div>
            <span className="budget-days-left">18 días rest.</span>
          </div>

          <div className="budget-bar-track">
            <div
              className="budget-bar-fill"
              style={{ width: `${Math.min(100, pctPresupuesto)}%` }}
            ></div>
          </div>

          <div className="budget-limits-row">
            <span className="budget-spent-txt">
              Gastado: S/ {totalGastos.toLocaleString('es-PE', { minimumFractionDigits: 2 })} ({pctPresupuesto}%)
            </span>
            <span className="budget-total-txt">
              Meta: S/ 5,000.00
            </span>
          </div>
        </section>

        {/* Metas de Ahorro / Tarjetas de progreso (Inspirado en mockup 4) */}
        <section className="savings-goals-section">
          <div className="goals-section-header">
            <h3 className="section-title">Metas de Ahorro</h3>
            <span className="goals-view-more">3 activas</span>
          </div>

          <div className="goals-carousel-row">
            {/* Meta 1: Auto */}
            <div className="goal-card-bubble">
              <div className="goal-icon-round car-goal">
                <Car size={20} />
              </div>
              <span className="goal-name">Auto Familiar</span>
              <div className="goal-progress-bar">
                <div className="goal-bar-inner" style={{ width: '22%' }}></div>
              </div>
              <span className="goal-pct">22% completado</span>
            </div>

            {/* Meta 2: Estudio */}
            <div className="goal-card-bubble">
              <div className="goal-icon-round laptop-goal">
                <Laptop size={20} />
              </div>
              <span className="goal-name">Equipamiento</span>
              <div className="goal-progress-bar">
                <div className="goal-bar-inner" style={{ width: '50%' }}></div>
              </div>
              <span className="goal-pct">50% completado</span>
            </div>

            {/* Meta 3: Educación */}
            <div className="goal-card-bubble">
              <div className="goal-icon-round edu-goal">
                <GraduationCap size={20} />
              </div>
              <span className="goal-name">Fondo Niños</span>
              <div className="goal-progress-bar">
                <div className="goal-bar-inner" style={{ width: '94%' }}></div>
              </div>
              <span className="goal-pct">94% completado</span>
            </div>
          </div>
        </section>

        {/* Historial Visual de en qué se gastó (Feed de transacciones) */}
        <section className="transactions-history-feed">
          <div className="history-feed-header">
            <h3 className="section-title">Historial de Movimientos</h3>
            {/* Filtros rápidos: Todos, Gastos, Ingresos */}
            <div className="history-filters-row">
              <button
                type="button"
                className={`filter-chip ${filterTipo === 'ALL' ? 'active' : ''}`}
                onClick={() => setFilterTipo('ALL')}
              >
                Todos
              </button>
              <button
                type="button"
                className={`filter-chip ${filterTipo === 'GASTO' ? 'active' : ''}`}
                onClick={() => setFilterTipo('GASTO')}
              >
                Gastos
              </button>
              <button
                type="button"
                className={`filter-chip ${filterTipo === 'INGRESO' ? 'active' : ''}`}
                onClick={() => setFilterTipo('INGRESO')}
              >
                Ingresos
              </button>
            </div>
          </div>

          {/* Lista de grupos de movimientos por fecha */}
          {Object.keys(groupedMovements).length === 0 ? (
            <div className="empty-history-state">
              <PiggyBank size={48} className="empty-piggy-icon" />
              <p className="empty-history-text">No hay movimientos registrados en este filtro.</p>
              <button
                type="button"
                className="add-first-expense-btn"
                onClick={onGoToExpense}
              >
                <PlusCircle size={18} />
                <span>Registrar un Gasto o Ingreso</span>
              </button>
            </div>
          ) : (
            <div className="history-groups-list">
              {Object.values(groupedMovements).map((group) => (
                <div key={group.label} className="date-group-card">
                  {/* Encabezado del día */}
                  <div className="date-group-header">
                    <span className="date-group-day">{group.label}</span>
                    {group.totalGasto > 0 && (
                      <span className="date-group-spent">
                        Gastos: S/ {group.totalGasto.toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>

                  {/* Elementos del grupo (Tarjetas de movimiento) */}
                  <div className="group-items-list">
                    {group.items.map((mov) => {
                      const isTransfer = mov.tipo === 'TRANSFERENCIA' || mov.subtipo === 'Transferencia';
                      const isGasto = mov.tipo === 'GASTO';
                      return (
                        <div key={mov.id} className="transaction-item-row">
                          {/* Icono de Categoría */}
                          <div className={`tx-icon-wrapper ${isTransfer ? 'transfer-theme' : isGasto ? 'gasto-theme' : 'ingreso-theme'}`}>
                            {getCategoryIcon(isTransfer ? 'arrow-right-left' : (mov.categoria_icono || mov.categoria_nombre), 22)}
                          </div>

                          {/* Info central */}
                          <div className="tx-details-col">
                            <span className="tx-title">
                              {mov.descripcion || mov.categoria_nombre || 'Movimiento'}
                            </span>
                            <span className="tx-meta-info">
                              {mov.subtipo ? `${mov.subtipo} • ` : ''}
                              <strong className="tx-cat-tag">#{mov.categoria_nombre || 'general'}</strong>
                              {isTransfer && mov.cuenta_destino_nombre
                                ? ` • ${mov.cuenta_nombre} ➔ ${mov.cuenta_destino_nombre}`
                                : (mov.cuenta_nombre ? ` • ${mov.cuenta_nombre}` : '')}
                            </span>
                          </div>

                          {/* Monto y Acción */}
                          <div className="tx-amount-col">
                            <span className={`tx-amount-value ${isTransfer ? 'amount-transfer' : isGasto ? 'amount-negative' : 'amount-positive'}`}>
                              {isTransfer ? '⇄ ' : isGasto ? '-' : '+'}S/ {parseFloat(mov.monto || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                            </span>
                            <button
                              type="button"
                              className="tx-delete-btn"
                              onClick={() => {
                                if (window.confirm(`¿Eliminar este movimiento de S/ ${mov.monto} y restaurar los saldos?`)) {
                                  onDeleteMovimiento(mov.id);
                                }
                              }}
                              title="Eliminar movimiento"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
