import React from 'react';
import { ChevronLeft, ChevronRight, Download, Filter } from 'lucide-react';
import { desplazarPeriodo, etiquetaPeriodo, periodoActual } from '../utils/format';

export default function BarraPeriodo({
  periodoTipo,
  setPeriodoTipo,
  periodoClave,
  setPeriodoClave,
  onExportExcel,
  exporting = false,
  showFilterToggle = false,
  filtersOpen = false,
  setFiltersOpen,
  activeFiltersCount = 0
}) {
  const cambiarTipo = (nuevoTipo) => {
    setPeriodoTipo(nuevoTipo);
    setPeriodoClave(periodoActual(nuevoTipo));
  };

  return (
    <div className="period-toolbar">
      {/* Selector Mensual / Trimestral / Anual */}
      <div className="period-type-tabs">
        {['MENSUAL', 'TRIMESTRAL', 'ANUAL'].map((t) => (
          <button
            key={t}
            type="button"
            className={`period-type-btn ${periodoTipo === t ? 'active' : ''}`}
            onClick={() => cambiarTipo(t)}
          >
            {t === 'MENSUAL' ? 'Mensual' : t === 'TRIMESTRAL' ? 'Trimestral' : 'Anual'}
          </button>
        ))}
      </div>

      {/* Navegador ‹ Octubre 2026 › */}
      <div className="period-nav-pill">
        <button
          type="button"
          className="period-arrow-btn"
          onClick={() => setPeriodoClave(desplazarPeriodo(periodoTipo, periodoClave, -1))}
          title="Periodo anterior"
        >
          <ChevronLeft size={18} />
        </button>
        <span className="period-current-label">
          {etiquetaPeriodo(periodoTipo, periodoClave)}
        </span>
        <button
          type="button"
          className="period-arrow-btn"
          onClick={() => setPeriodoClave(desplazarPeriodo(periodoTipo, periodoClave, 1))}
          title="Periodo siguiente"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Acciones rápidas: Filtros y Exportar Excel */}
      <div className="period-actions-group">
        {showFilterToggle && (
          <button
            type="button"
            className={`btn-filter-toggle ${filtersOpen || activeFiltersCount > 0 ? 'active' : ''}`}
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <Filter size={16} />
            <span>Filtros</span>
            {activeFiltersCount > 0 && (
              <span className="filter-count-badge">{activeFiltersCount}</span>
            )}
          </button>
        )}

        {onExportExcel && (
          <button
            type="button"
            className="btn-excel-export"
            onClick={onExportExcel}
            disabled={exporting}
            title="Descargar Excel (.xlsx) con el formato oficial"
          >
            <Download size={16} />
            <span>{exporting ? 'Exportando...' : 'Exportar Excel'}</span>
          </button>
        )}
      </div>
    </div>
  );
}

