// ============================================================
// Vista de Presupuesto (Tope de Gastos) con Semáforo Automático (Brief 6.6)
// Incluye popups intuitivos para edición y confirmación de eliminación.
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Plus,
  Copy,
  Trash2,
  Pencil,
  X
} from 'lucide-react';
import { api } from '../api';
import {
  formatSoles,
  getMetaCategoria,
  etiquetaCategoria,
  etiquetaSubcategoria,
  nombreCategoria
} from '../utils/format';

function SemaforoBadge({ estado, pct }) {
  if (estado === 'ROJO') {
    return (
      <span className="semaforo-pill rojo" title={`Excedido (${pct}%)`}>
        <AlertCircle size={14} />
        <span>Excedido ({pct}%)</span>
      </span>
    );
  }
  if (estado === 'AMARILLO') {
    return (
      <span className="semaforo-pill amarillo" title={`Casi excedido (${pct}%)`}>
        <AlertTriangle size={14} />
        <span>Casi al límite ({pct}%)</span>
      </span>
    );
  }
  return (
    <span className="semaforo-pill verde" title={`Dentro del presupuesto (${pct}%)`}>
      <CheckCircle2 size={14} />
      <span>En rango ({pct}%)</span>
    </span>
  );
}

export default function VistaPresupuestos({
  taxonomia = [],
  periodoTipo,
  periodoClave,
  refreshKey
}) {
  const [data, setData] = useState({
    items: [],
    totales: { presupuesto: 0, real: 0, disponible: 0, pct: 0, estado: 'VERDE' }
  });
  const [catId, setCatId] = useState('');
  const [subId, setSubId] = useState('');
  const [monto, setMonto] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Popup de edición rápida de fila y confirmación de eliminación
  const [modalEditItem, setModalEditItem] = useState(null);
  const [modalDeleteItem, setModalDeleteItem] = useState(null);

  const categoriasGasto = taxonomia.filter((c) => c.tipo === 'GASTO');

  const cargar = useCallback(async () => {
    try {
      const res = await api.getPresupuestos(periodoTipo, periodoClave);
      setData(res);
    } catch (err) {
      console.error('Error cargando presupuestos:', err);
    }
  }, [periodoTipo, periodoClave, refreshKey]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  useEffect(() => {
    if (!catId && categoriasGasto.length > 0) {
      setCatId(String(categoriasGasto[0].id));
    }
  }, [categoriasGasto, catId]);

  const catSeleccionada = categoriasGasto.find((c) => String(c.id) === String(catId));
  const subcategoriasDisp = catSeleccionada?.subcategorias || [];

  const handleGuardar = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const valor = parseFloat(String(monto).replace(',', '.'));
    if (!catId || !Number.isFinite(valor) || valor < 0) {
      setErrorMsg('Ingresa un monto presupuestado válido.');
      return;
    }
    setLoading(true);
    try {
      await api.guardarPresupuesto({
        periodoTipo,
        periodo: periodoClave,
        categoriaId: Number(catId),
        subcategoriaId: subId ? Number(subId) : null,
        monto: valor
      });
      setMonto('');
      setSubId('');
      setMensaje('¡Tope de presupuesto guardado correctamente!');
      setTimeout(() => setMensaje(''), 3500);
      await cargar();
    } catch (err) {
      setErrorMsg(err.message || 'Error al guardar presupuesto');
    } finally {
      setLoading(false);
    }
  };

  const handleGuardarEdicionPopup = async (e) => {
    e.preventDefault();
    if (!modalEditItem) return;
    const valor = parseFloat(String(modalEditItem.montoNuevo).replace(',', '.'));
    if (!Number.isFinite(valor) || valor < 0) return;
    setLoading(true);
    try {
      await api.guardarPresupuesto({
        periodoTipo,
        periodo: periodoClave,
        categoriaId: modalEditItem.categoriaId,
        subcategoriaId: modalEditItem.subcategoriaId || null,
        monto: valor
      });
      setModalEditItem(null);
      setMensaje('¡Tope actualizado con éxito!');
      setTimeout(() => setMensaje(''), 3500);
      await cargar();
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo actualizar');
    } finally {
      setLoading(false);
    }
  };

  const handleCopiarAnterior = async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const r = await api.copiarPresupuestoAnterior(periodoTipo, periodoClave);
      setMensaje(`Se copiaron ${r.copiados} presupuestos desde ${r.desde}`);
      setTimeout(() => setMensaje(''), 3500);
      await cargar();
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo copiar del periodo anterior');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarEliminar = async () => {
    if (!modalDeleteItem) return;
    setLoading(true);
    try {
      await api.eliminarPresupuesto(modalDeleteItem.id);
      setModalDeleteItem(null);
      setMensaje('Tope de presupuesto eliminado.');
      setTimeout(() => setMensaje(''), 3000);
      await cargar();
    } catch (err) {
      setErrorMsg(err.message || 'No se pudo eliminar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="budgets-view-container">
      <div className="panel-card">
        <div className="panel-card-header wrap-header">
          <div>
            <h3>Control de Presupuesto ({data.periodo?.etiqueta || periodoClave})</h3>
            <p>Define cuánto planean gastar en cada área y el semáforo te avisará si se acercan al límite</p>
          </div>
          <button
            type="button"
            className="btn-secondary-action"
            onClick={handleCopiarAnterior}
            disabled={loading}
          >
            <Copy size={15} />
            <span>Copiar del mes anterior</span>
          </button>
        </div>

        {mensaje && (
          <div className="toast-success-inline">
            <CheckCircle2 size={16} />
            <span>{mensaje}</span>
          </div>
        )}
        {errorMsg && (
          <div className="alert-error-box inline-feedback">
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleGuardar} className="budget-form-inline">
          <div className="field-group">
            <label>Área Familiar</label>
            <select
              value={catId}
              onChange={(e) => {
                setCatId(e.target.value);
                setSubId('');
              }}
            >
              {categoriasGasto.map((c) => (
                <option key={c.id} value={c.id}>
                  {etiquetaCategoria(c.codigo)}
                </option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label>Rubro específico (opcional)</label>
            <select value={subId} onChange={(e) => setSubId(e.target.value)}>
              <option value="">— Toda el área completa —</option>
              {subcategoriasDisp.map((s) => (
                <option key={s.id} value={s.id}>{etiquetaSubcategoria(s.codigo)}</option>
              ))}
            </select>
          </div>

          <div className="field-group">
            <label>Tope Máximo Planeado (S/)</label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              placeholder="Ej. 2500.00"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary-inline" disabled={loading}>
            <Plus size={16} />
            <span>Guardar Tope</span>
          </button>
        </form>
      </div>

      {/* Tabla de Presupuesto vs Gasto Real vs Disponible con Semáforo */}
      <div className="panel-card">
        <div className="semaforo-legend-bar">
          <span className="sem-dot-item"><i className="dot verde" /> En rango (&lt;80%)</span>
          <span className="sem-dot-item"><i className="dot amarillo" /> Casi al límite (≥80%)</span>
          <span className="sem-dot-item"><i className="dot rojo" /> Excedido (&gt;100%)</span>
        </div>

        <div className="table-responsive-wrap">
          <table className="famicash-table">
            <thead>
              <tr>
                <th>Área / Rubro</th>
                <th className="text-right">Tope Planeado</th>
                <th className="text-right">Gastado Real</th>
                <th className="text-right">Queda por gastar</th>
                <th className="text-center">Semáforo</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-table-cell">
                    Aún no has definido topes de presupuesto para este periodo. Usa el formulario de arriba.
                  </td>
                </tr>
              ) : (
                data.items.map((item) => {
                  const meta = getMetaCategoria(item.categoria);
                  return (
                    <tr key={item.id} className={!item.cuentaEnTotal ? 'sub-budget-row' : ''}>
                      <td>
                        <div className="budget-cat-cell">
                          <span className="cat-dot-color" style={{ background: meta.color }} />
                          <div>
                            <strong>
                              {item.subcategoria
                                ? `${etiquetaSubcategoria(item.subcategoria)}`
                                : `${etiquetaCategoria(item.categoria)}`}
                            </strong>
                            <small>
                              {item.subcategoria
                                ? `Dentro de ${nombreCategoria(item.categoria)}`
                                : meta.descripcion}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td className="text-right font-mono">{formatSoles(item.presupuesto)}</td>
                      <td className={`text-right font-mono ${item.estado === 'ROJO' ? 'text-danger-bold' : ''}`}>
                        {formatSoles(item.real)}
                      </td>
                      <td className={`text-right font-mono ${item.disponible < 0 ? 'text-danger-bold' : 'text-success-bold'}`}>
                        {formatSoles(item.disponible)}
                      </td>
                      <td className="text-center">
                        <SemaforoBadge estado={item.estado} pct={item.pct} />
                      </td>
                      <td className="text-right">
                        <div className="table-actions-inline">
                          <button
                            type="button"
                            className="tx-icon-btn"
                            onClick={() =>
                              setModalEditItem({
                                ...item,
                                montoNuevo: String(item.presupuesto)
                              })
                            }
                            title="Editar tope"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            className="tx-icon-btn danger"
                            onClick={() => setModalDeleteItem(item)}
                            title="Eliminar tope"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {data.items.length > 0 && (
              <tfoot>
                <tr className="table-totals-row">
                  <td><strong>Total General</strong></td>
                  <td className="text-right font-mono"><strong>{formatSoles(data.totales.presupuesto)}</strong></td>
                  <td className="text-right font-mono"><strong>{formatSoles(data.totales.real)}</strong></td>
                  <td className={`text-right font-mono ${data.totales.disponible < 0 ? 'text-danger-bold' : 'text-success-bold'}`}>
                    <strong>{formatSoles(data.totales.disponible)}</strong>
                  </td>
                  <td className="text-center">
                    <SemaforoBadge estado={data.totales.estado} pct={data.totales.pct} />
                  </td>
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Popup para editar monto de Tope de Presupuesto */}
      {modalEditItem && (
        <div className="modal-backdrop" onClick={() => setModalEditItem(null)}>
          <div className="modal-dialog-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog-header">
              <div>
                <h3>Editar Tope de Presupuesto</h3>
                <p className="text-muted-sm">
                  {modalEditItem.subcategoria
                    ? etiquetaSubcategoria(modalEditItem.subcategoria)
                    : etiquetaCategoria(modalEditItem.categoria)}
                </p>
              </div>
              <button type="button" className="tx-icon-btn" onClick={() => setModalEditItem(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleGuardarEdicionPopup} className="modal-form-grid">
              <div className="field-group">
                <label>Nuevo Tope Planeado (S/)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  autoFocus
                  value={modalEditItem.montoNuevo}
                  onChange={(e) =>
                    setModalEditItem({ ...modalEditItem, montoNuevo: e.target.value })
                  }
                />
              </div>
              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="btn-secondary-action"
                  onClick={() => setModalEditItem(null)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary-inline" disabled={loading}>
                  <CheckCircle2 size={16} />
                  <span>Guardar Tope</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Popup de confirmación para eliminar Tope */}
      {modalDeleteItem && (
        <div className="modal-backdrop" onClick={() => setModalDeleteItem(null)}>
          <div className="modal-dialog-card confirm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-icon">
              <AlertTriangle size={28} />
            </div>
            <h3>
              ¿Eliminar tope de{' '}
              {modalDeleteItem.subcategoria
                ? etiquetaSubcategoria(modalDeleteItem.subcategoria)
                : etiquetaCategoria(modalDeleteItem.categoria)}
              ?
            </h3>
            <p className="confirm-modal-desc">
              Se quitará este límite del periodo {data.periodo?.etiqueta || periodoClave}. Tus movimientos no se borrarán.
            </p>
            <div className="modal-dialog-footer">
              <button
                type="button"
                className="btn-secondary-action"
                onClick={() => setModalDeleteItem(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-danger-confirm"
                onClick={handleConfirmarEliminar}
                disabled={loading}
              >
                <Trash2 size={16} />
                <span>Sí, eliminar tope</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
