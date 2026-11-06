// ============================================================
// Vista de Excel (Exportar / Plantilla / Importar .xlsx) y Administración
// Completa de los 3 Niveles en formato ESCALONADO DE CARPETAS:
//  📁 Nivel 1: Áreas Familiares (Categorías) — Crear, Editar y Eliminar con Popups
//    └─ 📂 Nivel 2: Rubros (Subcategorías) — Crear, Editar y Eliminar con Popups
//         └─ 📄 Nivel 3: Conceptos (Detalles) — Crear, Editar y Eliminar con Popups
//  💳 Medios de Pago — Crear, Editar y Eliminar con Popups
// ============================================================
import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  Upload,
  Plus,
  Pencil,
  Trash2,
  FolderTree,
  Folder,
  FolderOpen,
  FileText,
  ChevronRight,
  ChevronDown,
  ChevronsUpDown,
  Search,
  CreditCard,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  FileDown,
  X,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { api } from '../api';
import {
  formatSoles,
  getMetaCategoria,
  etiquetaCategoria,
  etiquetaSubcategoria,
  nombreSubcategoria,
  emojiSubcategoria,
  nombreMedioPago
} from '../utils/format';

export default function VistaAdminTaxonomia({
  taxonomia = [],
  mediosPago = [],
  onRefreshCatalogos
}) {
  const [subTab, setSubTab] = useState('taxonomia'); // 'excel' | 'taxonomia' | 'medios'

  // Exportación Excel con filtros
  const [expDesde, setExpDesde] = useState('');
  const [expHasta, setExpHasta] = useState('');
  const [expCatId, setExpCatId] = useState('');
  const [expPersona, setExpPersona] = useState('');
  const [exportando, setExportando] = useState(false);
  const [descargandoPlantilla, setDescargandoPlantilla] = useState(false);

  // Importación Excel
  const [archivoImport, setArchivoImport] = useState(null);
  const [previewImport, setPreviewImport] = useState(null);
  const [importando, setImportando] = useState(false);
  const fileInputRef = useRef(null);

  // Notificaciones visuales (sin alert nativo)
  const [msgAdmin, setMsgAdmin] = useState('');
  const [errorAdmin, setErrorAdmin] = useState('');

  // ============================================================
  // ESTADO DEL ESCALONADO DE CARPETAS (ÁRBOL DESPLEGABLE)
  // ============================================================
  const [busquedaArbol, setBusquedaArbol] = useState('');
  // Por defecto abrimos las primeras carpetas para que se vea el escalonado de inmediato
  const [areasAbiertas, setAreasAbiertas] = useState({});
  const [rubrosAbiertos, setRubrosAbiertos] = useState({});
  // Inputs rápidos opcionales por cada rubro (subcategoriaId -> texto)
  const [inputsConceptoRapido, setInputsConceptoRapido] = useState({});

  // Inicializar la primera área y su primer rubro abiertos automáticamente
  useEffect(() => {
    if (taxonomia.length > 0 && Object.keys(areasAbiertas).length === 0) {
      const initAreas = {};
      const initRubros = {};
      taxonomia.slice(0, 2).forEach((cat) => {
        initAreas[cat.id] = true;
        if (cat.subcategorias?.[0]) {
          initRubros[cat.subcategorias[0].id] = true;
        }
      });
      setAreasAbiertas(initAreas);
      setRubrosAbiertos(initRubros);
    }
  }, [taxonomia]);

  // Formulario rápido de Medios de Pago
  const [nuevoMedioNombre, setNuevoMedioNombre] = useState('');
  const [nuevoMedioPersona, setNuevoMedioPersona] = useState('FAMILIA');

  // ============================================================
  // ESTADO DE POPUPS / MODALES BONITOS E INTUITIVOS
  // ============================================================
  // modalEditor: { tipo: 'categoria'|'subcategoria'|'detalle'|'medio', modo: 'crear'|'editar', item, form }
  const [modalEditor, setModalEditor] = useState(null);
  // modalConfirm: { titulo, descripcion, textoBoton, onConfirm }
  const [modalConfirm, setModalConfirm] = useState(null);
  const [procesandoModal, setProcesandoModal] = useState(false);

  const mostrarExito = (txt) => {
    setErrorAdmin('');
    setMsgAdmin(txt);
    setTimeout(() => setMsgAdmin(''), 4500);
  };

  const mostrarError = (txt) => {
    setMsgAdmin('');
    setErrorAdmin(txt);
    setTimeout(() => setErrorAdmin(''), 5500);
  };

  // ============================================================
  // CONTROLES DE CARPETAS (EXPANDIR / CONTRAER)
  // ============================================================
  const toggleArea = (catId) => {
    setAreasAbiertas((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const toggleRubro = (subId) => {
    setRubrosAbiertos((prev) => ({ ...prev, [subId]: !prev[subId] }));
  };

  const expandirTodo = () => {
    const todasAreas = {};
    const todosRubros = {};
    taxonomia.forEach((cat) => {
      todasAreas[cat.id] = true;
      (cat.subcategorias || []).forEach((sub) => {
        todosRubros[sub.id] = true;
      });
    });
    setAreasAbiertas(todasAreas);
    setRubrosAbiertos(todosRubros);
  };

  const contraerTodo = () => {
    setAreasAbiertas({});
    setRubrosAbiertos({});
  };

  // ============================================================
  // FUNCIONES DE EXCEL (PLANTILLA, EXPORTAR, IMPORTAR)
  // ============================================================
  const handleDescargarPlantilla = async () => {
    setDescargandoPlantilla(true);
    try {
      await api.descargarPlantillaExcel();
      mostrarExito('¡Plantilla oficial descargada! Llénala y súbela aquí mismo.');
    } catch (err) {
      mostrarError(err.message || 'No se pudo descargar la plantilla');
    } finally {
      setDescargandoPlantilla(false);
    }
  };

  const handleExportarExcel = async () => {
    setExportando(true);
    try {
      await api.exportarExcel({
        desde: expDesde || undefined,
        hasta: expHasta || undefined,
        categoriaIds: expCatId ? [expCatId] : undefined,
        persona: expPersona || undefined
      });
      mostrarExito('Archivo Excel (.xlsx) generado y descargado correctamente.');
    } catch (err) {
      mostrarError(err.message || 'Error al exportar Excel');
    } finally {
      setExportando(false);
    }
  };

  const handleAnalizarExcel = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setArchivoImport(file);
    setImportando(true);
    setErrorAdmin('');
    try {
      const res = await api.importarExcel(file, false);
      setPreviewImport(res);
    } catch (err) {
      mostrarError(err.message || 'El archivo Excel no tiene el formato esperado');
      setPreviewImport(null);
    } finally {
      setImportando(false);
    }
  };

  const handleConfirmarImportacion = async () => {
    if (!archivoImport) return;
    setImportando(true);
    setErrorAdmin('');
    try {
      const res = await api.importarExcel(archivoImport, true);
      setPreviewImport(res);
      mostrarExito(
        `¡Importación exitosa! Se cargaron ${res.resumen?.aImportar || 0} movimientos a la base de datos.`
      );
      await onRefreshCatalogos();
    } catch (err) {
      mostrarError(err.message || 'Error al confirmar la importación');
    } finally {
      setImportando(false);
    }
  };

  const handleLimpiarImport = () => {
    setArchivoImport(null);
    setPreviewImport(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ============================================================
  // APERTURA DE POPUPS MODALES (CREAR / EDITAR / ELIMINAR)
  // ============================================================

  // --- NIVEL 1: ÁREA FAMILIAR (CATEGORÍA) ---
  const abrirCrearArea = () => {
    setModalEditor({
      tipo: 'categoria',
      modo: 'crear',
      titulo: '📁 Nueva Área Familiar (Nivel 1)',
      subtitulo: 'Crea una carpeta principal para agrupar rubros y gastos del hogar',
      form: {
        codigo: '',
        tipo: 'GASTO',
        persona: 'FAMILIA'
      }
    });
  };

  const abrirEditarArea = (cat) => {
    setModalEditor({
      tipo: 'categoria',
      modo: 'editar',
      item: cat,
      titulo: '✏️ Editar Área Familiar',
      subtitulo: `Modificando carpeta principal ${etiquetaCategoria(cat.codigo)}`,
      form: {
        codigo: cat.codigo,
        tipo: cat.tipo || 'GASTO',
        persona: cat.persona || 'FAMILIA'
      }
    });
  };

  const abrirEliminarArea = (cat) => {
    setModalConfirm({
      titulo: `¿Eliminar carpeta "${etiquetaCategoria(cat.codigo)}"?`,
      descripcion:
        'Si esta área ya tiene movimientos registrados, se archivará automáticamente para no perder tu historial.',
      textoBoton: 'Sí, eliminar / archivar',
      onConfirm: async () => {
        const r = await api.eliminarCategoria(cat.id);
        await onRefreshCatalogos();
        mostrarExito(r?.mensaje || 'Área familiar actualizada.');
      }
    });
  };

  // --- NIVEL 2: RUBRO (SUBCATEGORÍA) ---
  const abrirCrearRubro = (cat) => {
    const catObjetivo = cat || taxonomia[0];
    if (!catObjetivo) return;
    setModalEditor({
      tipo: 'subcategoria',
      modo: 'crear',
      titulo: '📂 Nuevo Rubro (Nivel 2)',
      subtitulo: `Se creará como subcarpeta dentro de ${etiquetaCategoria(catObjetivo.codigo)}`,
      form: {
        categoriaId: catObjetivo.id,
        codigo: '',
        persona: catObjetivo.persona || 'FAMILIA'
      }
    });
  };

  const abrirEditarRubro = (cat, sub) => {
    setModalEditor({
      tipo: 'subcategoria',
      modo: 'editar',
      item: sub,
      titulo: '✏️ Editar Rubro',
      subtitulo: `Subcarpeta dentro de ${etiquetaCategoria(cat?.codigo)}`,
      form: {
        categoriaId: cat?.id || sub.categoriaId,
        codigo: sub.codigo,
        persona: sub.persona || cat?.persona || 'FAMILIA'
      }
    });
  };

  const abrirEliminarRubro = (sub) => {
    setModalConfirm({
      titulo: `¿Eliminar rubro "${etiquetaSubcategoria(sub.codigo)}"?`,
      descripcion:
        'Si ya tiene gastos o ingresos anotados, se archivará de forma segura sin borrar tus reportes.',
      textoBoton: 'Sí, eliminar rubro',
      onConfirm: async () => {
        const r = await api.eliminarSubcategoria(sub.id);
        await onRefreshCatalogos();
        mostrarExito(r?.mensaje || 'Rubro eliminado.');
      }
    });
  };

  // --- NIVEL 3: CONCEPTO ESPECÍFICO (DETALLE) ---
  const abrirCrearConcepto = (cat, sub) => {
    if (!sub) return;
    setModalEditor({
      tipo: 'detalle',
      modo: 'crear',
      titulo: '📄 Nuevo Concepto Específico (Nivel 3)',
      subtitulo: `Dentro de ${etiquetaCategoria(cat?.codigo)} ➔ ${etiquetaSubcategoria(sub.codigo)}`,
      form: {
        categoriaId: cat?.id || sub.categoriaId,
        subcategoriaId: sub.id,
        nombre: ''
      }
    });
  };

  const abrirEditarConcepto = (sub, det) => {
    setModalEditor({
      tipo: 'detalle',
      modo: 'editar',
      item: det,
      titulo: '✏️ Editar Concepto Específico',
      subtitulo: `Dentro del rubro ${etiquetaSubcategoria(sub?.codigo)}`,
      form: {
        subcategoriaId: sub?.id || det.subcategoriaId,
        nombre: det.nombre
      }
    });
  };

  const abrirEliminarConcepto = (det) => {
    setModalConfirm({
      titulo: `¿Eliminar concepto "${det.nombre}"?`,
      descripcion: 'Dejará de aparecer en las opciones rápidas de este rubro.',
      textoBoton: 'Sí, eliminar concepto',
      onConfirm: async () => {
        const r = await api.eliminarDetalle(det.id);
        await onRefreshCatalogos();
        mostrarExito(r?.mensaje || 'Concepto eliminado.');
      }
    });
  };

  // --- MEDIOS DE PAGO ---
  const abrirCrearMedio = () => {
    setModalEditor({
      tipo: 'medio',
      modo: 'crear',
      titulo: '💳 Nuevo Medio de Pago',
      subtitulo: 'Agrega una tarjeta, cuenta bancaria, billetera digital o efectivo',
      form: {
        nombre: '',
        persona: 'FAMILIA'
      }
    });
  };

  const abrirEditarMedio = (mp) => {
    setModalEditor({
      tipo: 'medio',
      modo: 'editar',
      item: mp,
      titulo: '✏️ Editar Medio de Pago',
      subtitulo: 'Actualiza el nombre o el titular de esta cuenta/tarjeta',
      form: {
        nombre: mp.nombre,
        persona: mp.persona || 'FAMILIA'
      }
    });
  };

  const abrirEliminarMedio = (mp) => {
    setModalConfirm({
      titulo: `¿Eliminar "${nombreMedioPago(mp.nombre)}"?`,
      descripcion:
        'Si tiene movimientos asociados se archivará para mantener intacto el historial.',
      textoBoton: 'Sí, eliminar medio de pago',
      onConfirm: async () => {
        const r = await api.eliminarMedioPago(mp.id);
        await onRefreshCatalogos();
        mostrarExito(r?.mensaje || 'Medio de pago eliminado.');
      }
    });
  };

  // ============================================================
  // GUARDAR DESDE EL POPUP MODAL (CREAR Y EDITAR TODOS LOS NIVELES)
  // ============================================================
  const handleGuardarModalEditor = async (e) => {
    e.preventDefault();
    if (!modalEditor) return;
    setProcesandoModal(true);
    try {
      const { tipo, modo, item, form } = modalEditor;

      if (tipo === 'categoria') {
        if (modo === 'crear') {
          const creada = await api.crearCategoria({
            codigo: form.codigo.trim(),
            tipo: form.tipo,
            persona: form.persona
          });
          await onRefreshCatalogos();
          if (creada?.id) {
            setAreasAbiertas((prev) => ({ ...prev, [creada.id]: true }));
          }
          mostrarExito(`¡Área familiar "${form.codigo.trim()}" creada con éxito!`);
        } else {
          await api.editarCategoria(item.id, {
            codigo: form.codigo.trim(),
            tipo: form.tipo,
            persona: form.persona
          });
          await onRefreshCatalogos();
          mostrarExito('Área familiar actualizada correctamente.');
        }
      } else if (tipo === 'subcategoria') {
        if (modo === 'crear') {
          const catId = Number(form.categoriaId);
          const nuevaSub = await api.crearSubcategoria({
            categoriaId: catId,
            codigo: form.codigo.trim(),
            persona: form.persona
          });
          await onRefreshCatalogos();
          setAreasAbiertas((prev) => ({ ...prev, [catId]: true }));
          if (nuevaSub?.id) {
            setRubrosAbiertos((prev) => ({ ...prev, [nuevaSub.id]: true }));
          }
          mostrarExito(`¡Rubro "${form.codigo.trim()}" creado con éxito!`);
        } else {
          await api.editarSubcategoria(item.id, {
            codigo: form.codigo.trim(),
            persona: form.persona
          });
          await onRefreshCatalogos();
          mostrarExito('Rubro actualizado correctamente.');
        }
      } else if (tipo === 'detalle') {
        if (modo === 'crear') {
          const subId = Number(form.subcategoriaId);
          const catId = Number(form.categoriaId);
          await api.crearDetalle({
            subcategoriaId: subId,
            nombre: form.nombre.trim()
          });
          await onRefreshCatalogos();
          if (catId) setAreasAbiertas((prev) => ({ ...prev, [catId]: true }));
          if (subId) setRubrosAbiertos((prev) => ({ ...prev, [subId]: true }));
          mostrarExito(`¡Concepto "${form.nombre.trim()}" agregado con éxito!`);
        } else {
          await api.editarDetalle(item.id, {
            nombre: form.nombre.trim()
          });
          await onRefreshCatalogos();
          mostrarExito('Concepto actualizado correctamente.');
        }
      } else if (tipo === 'medio') {
        if (modo === 'crear') {
          await api.crearMedioPago({
            nombre: form.nombre.trim().toUpperCase(),
            persona: form.persona
          });
          await onRefreshCatalogos();
          mostrarExito(`¡Medio de pago "${form.nombre.trim()}" agregado con éxito!`);
        } else {
          await api.editarMedioPago(item.id, {
            nombre: form.nombre.trim().toUpperCase(),
            persona: form.persona
          });
          await onRefreshCatalogos();
          mostrarExito('Medio de pago actualizado correctamente.');
        }
      }
      setModalEditor(null);
    } catch (err) {
      mostrarError(err.message || 'No se pudo guardar el cambio');
    } finally {
      setProcesandoModal(false);
    }
  };

  const handleEjecutarConfirm = async () => {
    if (!modalConfirm?.onConfirm) return;
    setProcesandoModal(true);
    try {
      await modalConfirm.onConfirm();
      setModalConfirm(null);
    } catch (err) {
      mostrarError(err.message || 'No se pudo completar la acción');
    } finally {
      setProcesandoModal(false);
    }
  };

  // ============================================================
  // GUARDADO RÁPIDO EN LÍNEA DE CONCEPTO O MEDIO DE PAGO
  // ============================================================
  const handleAgregarConceptoInline = async (e, cat, sub) => {
    e.preventDefault();
    const texto = (inputsConceptoRapido[sub.id] || '').trim();
    // Si el usuario hace clic en "+ Agregar" sin escribir en la cajita, abrimos el popup modal
    if (!texto) {
      abrirCrearConcepto(cat, sub);
      return;
    }
    try {
      await api.crearDetalle({
        subcategoriaId: sub.id,
        nombre: texto
      });
      setInputsConceptoRapido((prev) => ({ ...prev, [sub.id]: '' }));
      await onRefreshCatalogos();
      mostrarExito(`¡Concepto "${texto}" agregado en ${nombreSubcategoria(sub.codigo)}!`);
    } catch (err) {
      mostrarError(err.message || 'No se pudo agregar el concepto');
    }
  };

  const agregarMedioPago = async (e) => {
    e.preventDefault();
    if (!nuevoMedioNombre.trim()) {
      abrirCrearMedio();
      return;
    }
    try {
      await api.crearMedioPago({
        nombre: nuevoMedioNombre.trim().toUpperCase(),
        persona: nuevoMedioPersona
      });
      setNuevoMedioNombre('');
      await onRefreshCatalogos();
      mostrarExito('Nuevo medio de pago agregado.');
    } catch (err) {
      mostrarError(err.message);
    }
  };

  // Filtrado inteligente del árbol cuando se busca texto
  const q = busquedaArbol.trim().toLowerCase();
  const taxonomiaFiltrada = !q
    ? taxonomia
    : taxonomia
        .map((cat) => {
          const meta = getMetaCategoria(cat.codigo);
          const coincideCat =
            cat.codigo.toLowerCase().includes(q) || meta.nombre.toLowerCase().includes(q);
          const subsFiltradas = (cat.subcategorias || [])
            .map((sub) => {
              const nomSub = nombreSubcategoria(sub.codigo).toLowerCase();
              const coincideSub = sub.codigo.toLowerCase().includes(q) || nomSub.includes(q);
              const detsFiltrados = (sub.detalles || []).filter((d) =>
                d.nombre.toLowerCase().includes(q)
              );
              if (coincideCat || coincideSub) return sub;
              if (detsFiltrados.length > 0) return { ...sub, detalles: detsFiltrados };
              return null;
            })
            .filter(Boolean);

          if (coincideCat || subsFiltradas.length > 0) {
            return { ...cat, subcategorias: coincideCat ? cat.subcategorias : subsFiltradas };
          }
          return null;
        })
        .filter(Boolean);

  // Totalizadores rápidos para la cabecera del árbol
  const totalRubros = taxonomia.reduce((acc, c) => acc + (c.subcategorias?.length || 0), 0);
  const totalConceptos = taxonomia.reduce(
    (acc, c) =>
      acc +
      (c.subcategorias || []).reduce((sAcc, s) => sAcc + (s.detalles?.length || 0), 0),
    0
  );

  return (
    <div className="admin-tax-container">
      {/* Pestañas superiores */}
      <div className="level-tabs-bar">
        <button
          type="button"
          className={`level-tab-btn ${subTab === 'taxonomia' ? 'active' : ''}`}
          onClick={() => setSubTab('taxonomia')}
        >
          <FolderTree size={16} />
          <span>📁 Carpetas: Áreas, Rubros y Conceptos ({taxonomia.length})</span>
        </button>
        <button
          type="button"
          className={`level-tab-btn ${subTab === 'excel' ? 'active' : ''}`}
          onClick={() => setSubTab('excel')}
        >
          <FileSpreadsheet size={16} />
          <span>Descargar o Subir Excel (.xlsx)</span>
        </button>
        <button
          type="button"
          className={`level-tab-btn ${subTab === 'medios' ? 'active' : ''}`}
          onClick={() => setSubTab('medios')}
        >
          <CreditCard size={16} />
          <span>Medios de Pago ({mediosPago.length})</span>
        </button>
      </div>

      {/* Mensajes globales de éxito o error */}
      {msgAdmin && (
        <div className="toast-success-inline">
          <CheckCircle2 size={18} />
          <span>{msgAdmin}</span>
        </div>
      )}
      {errorAdmin && (
        <div className="alert-error-box inline-feedback">
          <AlertCircle size={18} />
          <span>{errorAdmin}</span>
        </div>
      )}

      {/* ============================================================
          PESTAÑA 1: ESCALONADO DE CARPETAS (ÁREAS ➔ RUBROS ➔ CONCEPTOS)
          ============================================================ */}
      {subTab === 'taxonomia' && (
        <div className="panel-card folder-tree-panel">
          {/* Cabecera principal del explorador de carpetas */}
          <div className="folder-explorer-header">
            <div className="folder-explorer-title">
              <h3>📁 Estructura Escalonada de Carpetas Familiares</h3>
              <p>
                <strong>{taxonomia.length} Áreas Familiares</strong> ·{' '}
                <strong>{totalRubros} Rubros</strong> ·{' '}
                <strong>{totalConceptos} Conceptos</strong> — Abre cualquier carpeta para ver o agregar sus niveles internos
              </p>
            </div>

            <div className="folder-explorer-toolbar">
              <div className="folder-search-box">
                <Search size={15} />
                <input
                  type="text"
                  placeholder="Buscar área, rubro o concepto..."
                  value={busquedaArbol}
                  onChange={(e) => setBusquedaArbol(e.target.value)}
                />
                {busquedaArbol && (
                  <button
                    type="button"
                    className="btn-clear-search"
                    onClick={() => setBusquedaArbol('')}
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <button
                type="button"
                className="btn-secondary-action btn-sm-folder"
                onClick={expandirTodo}
                title="Desplegar todas las carpetas y subcarpetas"
              >
                <ChevronsUpDown size={15} />
                <span>Expandir todo</span>
              </button>

              <button
                type="button"
                className="btn-secondary-action btn-sm-folder"
                onClick={contraerTodo}
                title="Cerrar todas las carpetas"
              >
                <span>Contraer todo</span>
              </button>

              <button
                type="button"
                className="btn-add-area-pill"
                onClick={abrirCrearArea}
              >
                <Plus size={16} />
                <span>Nueva Área Familiar</span>
              </button>
            </div>
          </div>

          {/* Leyenda visual de los 3 escalones */}
          <div className="folder-levels-legend">
            <span className="legend-step step-1">
              <Folder size={14} /> <strong>Nivel 1:</strong> Área Familiar (ej. Hogar, Ingresos, Lara)
            </span>
            <span className="legend-arrow">➔</span>
            <span className="legend-step step-2">
              <FolderOpen size={14} /> <strong>Nivel 2:</strong> Rubro (ej. Supermercado, Sueldos, Salud)
            </span>
            <span className="legend-arrow">➔</span>
            <span className="legend-step step-3">
              <FileText size={14} /> <strong>Nivel 3:</strong> Concepto Específico (ej. Luz, Gasolina, Colegio)
            </span>
          </div>

          {/* ÁRBOL ESCALONADO DE CARPETAS */}
          <div className="folder-tree-root">
            {taxonomiaFiltrada.length === 0 ? (
              <div className="empty-state-box">
                No se encontraron carpetas con "{busquedaArbol}".
              </div>
            ) : (
              taxonomiaFiltrada.map((cat) => {
                const m = getMetaCategoria(cat.codigo);
                const estaAbiertaArea = Boolean(q) || Boolean(areasAbiertas[cat.id]);
                const subcategorias = cat.subcategorias || [];

                return (
                  <div
                    key={cat.id}
                    className={`folder-area-node ${estaAbiertaArea ? 'is-open' : ''}`}
                    style={{ '--area-color': m.color, '--area-bg': m.bg, '--area-border': m.border }}
                  >
                    {/* ==========================================
                        ESCALÓN 1: CARPETA DE ÁREA FAMILIAR
                        ========================================== */}
                    <div
                      className="folder-area-bar"
                      onClick={() => toggleArea(cat.id)}
                    >
                      <div className="folder-area-left">
                        <span className="folder-chevron">
                          {estaAbiertaArea ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                        </span>
                        <span className="folder-icon-wrap" style={{ color: m.color }}>
                          {estaAbiertaArea ? <FolderOpen size={22} /> : <Folder size={22} />}
                        </span>
                        <div className="folder-area-info">
                          <div className="folder-area-title-line">
                            <span className="folder-area-name">
                              {m.emoji} {m.nombre}
                            </span>
                            <span className="folder-count-badge" style={{ background: m.bg, color: m.color, borderColor: m.border }}>
                              {subcategorias.length} {subcategorias.length === 1 ? 'rubro' : 'rubros'}
                            </span>
                            <span className="folder-type-badge">
                              {cat.tipo}
                            </span>
                          </div>
                          <small className="folder-code-meta">
                            Código Excel: <code>{cat.codigo}</code> · Responsable: <strong>{cat.persona}</strong>
                          </small>
                        </div>
                      </div>

                      <div
                        className="folder-area-actions"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          className="btn-folder-action-add"
                          style={{ borderColor: m.color, color: m.color }}
                          onClick={() => abrirCrearRubro(cat)}
                          title={`Crear un nuevo rubro dentro de ${m.nombre}`}
                        >
                          <Plus size={14} />
                          <span>Nuevo Rubro</span>
                        </button>
                        <button
                          type="button"
                          className="tx-icon-btn"
                          onClick={() => abrirEditarArea(cat)}
                          title="Editar Área Familiar"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          className="tx-icon-btn danger"
                          onClick={() => abrirEliminarArea(cat)}
                          title="Eliminar / Archivar Área Familiar"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* ==========================================
                        ESCALÓN 2: SUBCARPETAS DE RUBROS (INDENTADO)
                        ========================================== */}
                    {estaAbiertaArea && (
                      <div className="folder-level-2-children">
                        {subcategorias.length === 0 ? (
                          <div className="folder-empty-step">
                            <span>Esta carpeta aún no tiene rubros.</span>
                            <button
                              type="button"
                              className="btn-folder-action-add"
                              onClick={() => abrirCrearRubro(cat)}
                            >
                              <Plus size={14} /> Crear primer rubro en {m.nombre}
                            </button>
                          </div>
                        ) : (
                          subcategorias.map((sub) => {
                            const estaAbiertoRubro = Boolean(q) || Boolean(rubrosAbiertos[sub.id]);
                            const detalles = sub.detalles || [];
                            const textoRapido = inputsConceptoRapido[sub.id] || '';

                            return (
                              <div
                                key={sub.id}
                                className={`folder-rubro-node ${estaAbiertoRubro ? 'is-open' : ''}`}
                              >
                                <div
                                  className="folder-rubro-bar"
                                  onClick={() => toggleRubro(sub.id)}
                                >
                                  <div className="folder-rubro-left">
                                    <span className="folder-tree-branch">├─</span>
                                    <span className="folder-chevron">
                                      {estaAbiertoRubro ? (
                                        <ChevronDown size={16} />
                                      ) : (
                                        <ChevronRight size={16} />
                                      )}
                                    </span>
                                    <span className="folder-sub-icon" style={{ color: m.color }}>
                                      {estaAbiertoRubro ? (
                                        <FolderOpen size={19} />
                                      ) : (
                                        <Folder size={19} />
                                      )}
                                    </span>
                                    <div className="folder-rubro-info">
                                      <div className="folder-rubro-title-line">
                                        <strong>
                                          {emojiSubcategoria(sub.codigo)} {nombreSubcategoria(sub.codigo)}
                                        </strong>
                                        <span className="folder-sub-count">
                                          {detalles.length} {detalles.length === 1 ? 'concepto' : 'conceptos'}
                                        </span>
                                      </div>
                                      <small className="folder-code-meta">
                                        Código Excel: <code>{sub.codigo}</code>
                                      </small>
                                    </div>
                                  </div>

                                  <div
                                    className="folder-rubro-actions"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <button
                                      type="button"
                                      className="btn-folder-action-add sub"
                                      onClick={() => abrirCrearConcepto(cat, sub)}
                                      title={`Agregar concepto dentro de ${nombreSubcategoria(sub.codigo)}`}
                                    >
                                      <Plus size={13} />
                                      <span>Nuevo Concepto</span>
                                    </button>
                                    <button
                                      type="button"
                                      className="tx-icon-btn"
                                      onClick={() => abrirEditarRubro(cat, sub)}
                                      title="Editar Rubro"
                                    >
                                      <Pencil size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      className="tx-icon-btn danger"
                                      onClick={() => abrirEliminarRubro(sub)}
                                      title="Eliminar Rubro"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </div>

                                {/* ==========================================
                                    ESCALÓN 3: CONCEPTOS / DETALLES (INDENTADO)
                                    ========================================== */}
                                {estaAbiertoRubro && (
                                  <div className="folder-level-3-children">
                                    {/* Barra rápida para escribir directo o abrir popup */}
                                    <form
                                      onSubmit={(e) => handleAgregarConceptoInline(e, cat, sub)}
                                      className="folder-quick-add-concepto"
                                    >
                                      <span className="folder-tree-leaf">├─</span>
                                      <input
                                        type="text"
                                        placeholder={`Escribe un nuevo concepto para "${nombreSubcategoria(sub.codigo)}"...`}
                                        value={textoRapido}
                                        onChange={(e) =>
                                          setInputsConceptoRapido((prev) => ({
                                            ...prev,
                                            [sub.id]: e.target.value
                                          }))
                                        }
                                      />
                                      <button
                                        type="submit"
                                        className="btn-primary-inline btn-sm-inline"
                                      >
                                        <Plus size={14} />
                                        <span>Agregar</span>
                                      </button>
                                    </form>

                                    {detalles.length === 0 ? (
                                      <div className="folder-empty-leaf">
                                        Sin conceptos específicos todavía. Escribe uno arriba o pulsa{' '}
                                        <button
                                          type="button"
                                          className="btn-inline-underline"
                                          onClick={() => abrirCrearConcepto(cat, sub)}
                                        >
                                          + Nuevo Concepto
                                        </button>
                                        .
                                      </div>
                                    ) : (
                                      <div className="folder-conceptos-list">
                                        {detalles.map((det, idx) => {
                                          const esUltimo = idx === detalles.length - 1;
                                          return (
                                            <div key={det.id} className="folder-concepto-item">
                                              <div className="folder-concepto-left">
                                                <span className="folder-tree-leaf">
                                                  {esUltimo ? '└─' : '├─'}
                                                </span>
                                                <FileText size={14} className="concepto-doc-icon" />
                                                <span className="concepto-name-text">{det.nombre}</span>
                                              </div>
                                              <div className="folder-concepto-actions">
                                                <button
                                                  type="button"
                                                  className="tx-icon-btn"
                                                  onClick={() => abrirEditarConcepto(sub, det)}
                                                  title="Editar concepto"
                                                >
                                                  <Pencil size={12} />
                                                </button>
                                                <button
                                                  type="button"
                                                  className="tx-icon-btn danger"
                                                  onClick={() => abrirEliminarConcepto(det)}
                                                  title="Eliminar concepto"
                                                >
                                                  <Trash2 size={12} />
                                                </button>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}

                        {/* Fila final del Escalón 2 para agregar otro rubro fácilmente */}
                        <div className="folder-add-rubro-footer">
                          <span className="folder-tree-branch">└─</span>
                          <button
                            type="button"
                            className="btn-dashed-add-rubro"
                            onClick={() => abrirCrearRubro(cat)}
                          >
                            <Plus size={14} />
                            <span>Agregar otro rubro dentro de {m.emoji} {m.nombre}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ============================================================
          PESTAÑA 2: EXPORTAR, PLANTILLA E IMPORTAR EXCEL (.XLSX)
          ============================================================ */}
      {subTab === 'excel' && (
        <div className="dashboard-two-cols">
          {/* Tarjeta Izquierda: Descargar el cuadro Excel actual */}
          <div className="panel-card">
            <div className="panel-card-header">
              <div>
                <h3>Descargar tu cuadro en Excel (.xlsx)</h3>
                <p>
                  Se descarga listo para tus tablas dinámicas con las 10 columnas oficiales:{' '}
                  <code>Año | Mes | Día | Fecha | Categoría | Subcategoría | Detalle | Monto S/ | Medio de pago | Observaciones</code>
                </p>
              </div>
            </div>

            <div className="excel-preview-schema">
              <span>
                Incluye códigos exactos de Excel, mes 9 como <strong>"Set"</strong>, autofiltro y formato en Soles.
              </span>
            </div>

            <div className="modal-form-grid">
              <div className="field-row-2">
                <div className="field-group">
                  <label>Desde fecha (opcional)</label>
                  <input
                    type="date"
                    value={expDesde}
                    onChange={(e) => setExpDesde(e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label>Hasta fecha (opcional)</label>
                  <input
                    type="date"
                    value={expHasta}
                    onChange={(e) => setExpHasta(e.target.value)}
                  />
                </div>
              </div>

              <div className="field-row-2">
                <div className="field-group">
                  <label>Área Familiar</label>
                  <select value={expCatId} onChange={(e) => setExpCatId(e.target.value)}>
                    <option value="">Todas las áreas (Ingresos, Gastos y Ahorros)</option>
                    {taxonomia.map((c) => (
                      <option key={c.id} value={c.id}>{etiquetaCategoria(c.codigo)}</option>
                    ))}
                  </select>
                </div>

                <div className="field-group">
                  <label>Persona</label>
                  <select value={expPersona} onChange={(e) => setExpPersona(e.target.value)}>
                    <option value="">Todas las personas</option>
                    <option value="FAMILIA">🏠 Hogar / Familia</option>
                    <option value="ANTHONY">👨 Anthony</option>
                    <option value="VANESSA">👩 Vanessa</option>
                    <option value="LARA">👧 Lara</option>
                  </select>
                </div>
              </div>

              <button
                type="button"
                className="btn-primary-submit"
                onClick={handleExportarExcel}
                disabled={exportando}
              >
                <Download size={18} />
                <span>{exportando ? 'Generando archivo .xlsx...' : 'Descargar Excel (.xlsx)'}</span>
              </button>
            </div>
          </div>

          {/* Tarjeta Derecha: Subir tu Excel Histórico + Botón de Plantilla al lado */}
          <div className="panel-card">
            <div className="panel-card-header wrap-header">
              <div>
                <h3>Subir tu Excel Histórico (.xlsx)</h3>
                <p>Carga tu archivo Excel para importar tus registros anteriores sin duplicados</p>
              </div>

              {/* BOTÓN DE PLANTILLA EXCEL AL LADO */}
              <button
                type="button"
                className="btn-template-excel"
                onClick={handleDescargarPlantilla}
                disabled={descargandoPlantilla}
                title="Descarga un archivo Excel de guía con ejemplos y el catálogo válido"
              >
                <FileDown size={17} />
                <span>
                  {descargandoPlantilla ? 'Descargando...' : 'Descargar Plantilla Guía (.xlsx)'}
                </span>
              </button>
            </div>

            <div className="template-guide-banner">
              <Sparkles size={16} className="icon-forest" />
              <div>
                <strong>¿Primera vez subiendo tu Excel?</strong> Descarga arriba la{' '}
                <button type="button" className="btn-inline-underline" onClick={handleDescargarPlantilla}>
                  Plantilla Guía (.xlsx)
                </button>{' '}
                que ya viene con las 10 columnas listas, 5 filas de ejemplo y una hoja con el catálogo de códigos válidos.
              </div>
            </div>

            <label className="upload-drop-area">
              <Upload size={28} className="icon-forest" />
              <strong>Haz clic aquí para elegir tu archivo .xlsx</strong>
              <p>Se analizará primero para mostrarte una vista previa antes de guardar</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                onChange={handleAnalizarExcel}
                disabled={importando}
              />
            </label>

            {previewImport && (
              <div className="import-preview-box">
                <div className="import-preview-header">
                  <strong>Resultado del análisis: {archivoImport?.name}</strong>
                  <button type="button" className="btn-link-subtle" onClick={handleLimpiarImport}>
                    <RefreshCw size={13} /> Elegir otro archivo
                  </button>
                </div>

                <div className="import-stats-grid">
                  <div className="imp-stat-pill">
                    <small>Filas leídas</small>
                    <strong>{previewImport.resumen?.filasLeidas || 0}</strong>
                  </div>
                  <div className="imp-stat-pill good">
                    <small>Nuevas a importar</small>
                    <strong>{previewImport.resumen?.aImportar || 0}</strong>
                  </div>
                  <div className="imp-stat-pill neutral">
                    <small>Duplicadas omitidas</small>
                    <strong>{previewImport.resumen?.duplicadas || 0}</strong>
                  </div>
                  <div className="imp-stat-pill">
                    <small>Monto a sumar</small>
                    <strong>{formatSoles(previewImport.resumen?.montoTotal || 0)}</strong>
                  </div>
                </div>

                {previewImport.errores?.length > 0 && (
                  <div className="alert-error-box">
                    <strong>
                      <AlertCircle size={14} /> Filas con error ({previewImport.errores.length}):
                    </strong>
                    <ul style={{ marginLeft: 18, marginTop: 4 }}>
                      {previewImport.errores.slice(0, 5).map((e, idx) => (
                        <li key={idx}>Fila {e.fila}: {e.mensaje}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {previewImport.advertencias?.length > 0 && (
                  <div className="import-warnings-list">
                    <strong>
                      <AlertTriangle size={14} /> Avisos automáticos ({previewImport.advertencias.length}):
                    </strong>
                    <ul>
                      {previewImport.advertencias.slice(0, 5).map((a, idx) => (
                        <li key={idx}>Fila {a.fila}: {a.mensaje}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {previewImport.muestra?.length > 0 && !previewImport.confirmado && (
                  <div className="import-sample-table-wrap">
                    <small className="sample-title">Vista previa de las primeras filas listas para importar:</small>
                    <table className="famicash-table compact-sample-table">
                      <thead>
                        <tr>
                          <th>Fila</th>
                          <th>Fecha</th>
                          <th>Área</th>
                          <th>Rubro</th>
                          <th>Concepto</th>
                          <th className="text-right">Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewImport.muestra.slice(0, 5).map((m) => (
                          <tr key={m.fila}>
                            <td>#{m.fila}</td>
                            <td>{m.fecha}</td>
                            <td>{etiquetaCategoria(m.categoria)}</td>
                            <td>{etiquetaSubcategoria(m.subcategoria)}</td>
                            <td>{m.detalle || '—'}</td>
                            <td className="text-right font-mono">{formatSoles(m.monto)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {!previewImport.confirmado ? (
                  <button
                    type="button"
                    className="btn-primary-submit"
                    onClick={handleConfirmarImportacion}
                    disabled={importando || (previewImport.resumen?.aImportar || 0) === 0}
                  >
                    <CheckCircle2 size={18} />
                    <span>
                      {importando
                        ? 'Importando registros...'
                        : (previewImport.resumen?.aImportar || 0) > 0
                          ? `Confirmar e Importar ${previewImport.resumen.aImportar} filas`
                          : 'No hay filas nuevas para importar'}
                    </span>
                  </button>
                ) : (
                  <div className="toast-success-inline">
                    <CheckCircle2 size={18} />
                    <span>¡Carga completada satisfactoriamente! Tus reportes ya están actualizados.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
          PESTAÑA 3: MEDIOS DE PAGO EDITABLES CON POPUPS
          ============================================================ */}
      {subTab === 'medios' && (
        <div className="panel-card">
          <div className="panel-card-header wrap-header">
            <div>
              <h3>Medios de Pago del Hogar</h3>
              <p>Tarjetas, cuentas bancarias y billeteras digitales con las que pagan en casa</p>
            </div>
            <button
              type="button"
              className="btn-add-area-pill"
              onClick={abrirCrearMedio}
            >
              <Plus size={15} />
              <span>Nuevo Medio de Pago</span>
            </button>
          </div>

          <form onSubmit={agregarMedioPago} className="budget-form-inline">
            <div className="field-group">
              <label>Nombre del Medio de Pago</label>
              <input
                type="text"
                placeholder="Ej. Yape Anthony, Tarjeta Interbank..."
                value={nuevoMedioNombre}
                onChange={(e) => setNuevoMedioNombre(e.target.value)}
              />
            </div>

            <div className="field-group">
              <label>¿De quién es?</label>
              <select
                value={nuevoMedioPersona}
                onChange={(e) => setNuevoMedioPersona(e.target.value)}
              >
                <option value="FAMILIA">🏠 Familiar</option>
                <option value="ANTHONY">👨 Anthony</option>
                <option value="VANESSA">👩 Vanessa</option>
                <option value="LARA">👧 Lara</option>
              </select>
            </div>

            <button type="submit" className="btn-primary-inline">
              <Plus size={16} />
              <span>Agregar Medio</span>
            </button>
          </form>

          <div className="medios-admin-grid">
            {mediosPago.map((mp) => (
              <div key={mp.id} className="medio-admin-card">
                <div>
                  <strong>{nombreMedioPago(mp.nombre)}</strong>
                  <div style={{ marginTop: 4 }}>
                    <span className="tx-person-tag">{mp.persona}</span>
                  </div>
                </div>
                <div className="tree-actions">
                  <button
                    type="button"
                    className="tx-icon-btn"
                    onClick={() => abrirEditarMedio(mp)}
                    title="Editar medio de pago"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    className="tx-icon-btn danger"
                    onClick={() => abrirEliminarMedio(mp)}
                    title="Eliminar medio de pago"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================
          POPUP MODAL DE CREACIÓN / EDICIÓN (BONITO E INTUITIVO)
          ============================================================ */}
      {modalEditor && (
        <div className="modal-backdrop" onClick={() => setModalEditor(null)}>
          <div className="modal-dialog-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-dialog-header">
              <div>
                <h3>{modalEditor.titulo}</h3>
                {modalEditor.subtitulo && (
                  <p className="text-muted-sm">{modalEditor.subtitulo}</p>
                )}
              </div>
              <button
                type="button"
                className="tx-icon-btn"
                onClick={() => setModalEditor(null)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleGuardarModalEditor} className="modal-form-grid">
              {/* FORMULARIO NIVEL 1: ÁREA FAMILIAR */}
              {modalEditor.tipo === 'categoria' && (
                <>
                  <div className="field-group">
                    <label>Nombre del Área Familiar</label>
                    <input
                      type="text"
                      required
                      autoFocus
                      placeholder="Ej. Mascotas y Jardín, Negocio Familiar..."
                      value={modalEditor.form.codigo}
                      onChange={(e) =>
                        setModalEditor({
                          ...modalEditor,
                          form: { ...modalEditor.form, codigo: e.target.value }
                        })
                      }
                    />
                  </div>

                  <div className="field-row-2">
                    <div className="field-group">
                      <label>Tipo de Movimiento</label>
                      <select
                        value={modalEditor.form.tipo}
                        onChange={(e) =>
                          setModalEditor({
                            ...modalEditor,
                            form: { ...modalEditor.form, tipo: e.target.value }
                          })
                        }
                      >
                        <option value="GASTO">💸 Gasto</option>
                        <option value="INGRESO">💰 Ingreso</option>
                        <option value="AHORRO">🐷 Ahorro</option>
                      </select>
                    </div>

                    <div className="field-group">
                      <label>Integrante / Responsable</label>
                      <select
                        value={modalEditor.form.persona}
                        onChange={(e) =>
                          setModalEditor({
                            ...modalEditor,
                            form: { ...modalEditor.form, persona: e.target.value }
                          })
                        }
                      >
                        <option value="FAMILIA">🏠 Hogar / Familia</option>
                        <option value="ANTHONY">👨 Anthony</option>
                        <option value="VANESSA">👩 Vanessa</option>
                        <option value="LARA">👧 Lara</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* FORMULARIO NIVEL 2: RUBRO (SUBCATEGORÍA) */}
              {modalEditor.tipo === 'subcategoria' && (
                <>
                  {modalEditor.modo === 'crear' && (
                    <div className="field-group">
                      <label>Carpeta de Área Familiar (Nivel 1)</label>
                      <select
                        value={modalEditor.form.categoriaId}
                        onChange={(e) => {
                          const nuevaCat = taxonomia.find((c) => c.id === Number(e.target.value));
                          setModalEditor({
                            ...modalEditor,
                            form: {
                              ...modalEditor.form,
                              categoriaId: Number(e.target.value),
                              persona: nuevaCat?.persona || modalEditor.form.persona
                            }
                          });
                        }}
                      >
                        {taxonomia.map((c) => (
                          <option key={c.id} value={c.id}>
                            {etiquetaCategoria(c.codigo)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="field-group">
                    <label>Nombre del Rubro (Subcarpeta Nivel 2)</label>
                    <input
                      type="text"
                      required
                      autoFocus
                      placeholder="Ej. Veterinaria, Gimnasio, Cursos..."
                      value={modalEditor.form.codigo}
                      onChange={(e) =>
                        setModalEditor({
                          ...modalEditor,
                          form: { ...modalEditor.form, codigo: e.target.value }
                        })
                      }
                    />
                  </div>

                  <div className="field-group">
                    <label>Integrante asociado</label>
                    <select
                      value={modalEditor.form.persona}
                      onChange={(e) =>
                        setModalEditor({
                          ...modalEditor,
                          form: { ...modalEditor.form, persona: e.target.value }
                        })
                      }
                    >
                      <option value="FAMILIA">🏠 Hogar / Familia</option>
                      <option value="ANTHONY">👨 Anthony</option>
                      <option value="VANESSA">👩 Vanessa</option>
                      <option value="LARA">👧 Lara</option>
                    </select>
                  </div>
                </>
              )}

              {/* FORMULARIO NIVEL 3: CONCEPTO ESPECÍFICO (DETALLE) */}
              {modalEditor.tipo === 'detalle' && (
                <>
                  {modalEditor.modo === 'crear' && (
                    <div className="field-group">
                      <label>Dentro del Rubro (Subcarpeta Nivel 2)</label>
                      <select
                        value={modalEditor.form.subcategoriaId}
                        onChange={(e) =>
                          setModalEditor({
                            ...modalEditor,
                            form: {
                              ...modalEditor.form,
                              subcategoriaId: Number(e.target.value)
                            }
                          })
                        }
                      >
                        {taxonomia.map((cat) => (
                          <optgroup key={cat.id} label={etiquetaCategoria(cat.codigo)}>
                            {(cat.subcategorias || []).map((sub) => (
                              <option key={sub.id} value={sub.id}>
                                {etiquetaSubcategoria(sub.codigo)}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="field-group">
                    <label>Nombre del Concepto Específico (Nivel 3)</label>
                    <input
                      type="text"
                      required
                      autoFocus
                      placeholder="Ej. Vacunas mascota, Mensualidad gimnasio, Uber..."
                      value={modalEditor.form.nombre}
                      onChange={(e) =>
                        setModalEditor({
                          ...modalEditor,
                          form: { ...modalEditor.form, nombre: e.target.value }
                        })
                      }
                    />
                  </div>
                </>
              )}

              {/* FORMULARIO MEDIO DE PAGO */}
              {modalEditor.tipo === 'medio' && (
                <>
                  <div className="field-group">
                    <label>Nombre del Medio de Pago</label>
                    <input
                      type="text"
                      required
                      autoFocus
                      placeholder="Ej. TARJETA INTERBANK ANTHONY"
                      value={modalEditor.form.nombre}
                      onChange={(e) =>
                        setModalEditor({
                          ...modalEditor,
                          form: { ...modalEditor.form, nombre: e.target.value }
                        })
                      }
                    />
                  </div>
                  <div className="field-group">
                    <label>Titular</label>
                    <select
                      value={modalEditor.form.persona}
                      onChange={(e) =>
                        setModalEditor({
                          ...modalEditor,
                          form: { ...modalEditor.form, persona: e.target.value }
                        })
                      }
                    >
                      <option value="FAMILIA">🏠 Familiar</option>
                      <option value="ANTHONY">👨 Anthony</option>
                      <option value="VANESSA">👩 Vanessa</option>
                      <option value="LARA">👧 Lara</option>
                    </select>
                  </div>
                </>
              )}

              <div className="modal-dialog-footer">
                <button
                  type="button"
                  className="btn-secondary-action"
                  onClick={() => setModalEditor(null)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary-inline" disabled={procesandoModal}>
                  <CheckCircle2 size={16} />
                  <span>
                    {procesandoModal
                      ? 'Guardando...'
                      : modalEditor.modo === 'crear'
                        ? 'Crear y Guardar'
                        : 'Guardar Cambios'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          POPUP MODAL DE CONFIRMACIÓN DE ELIMINACIÓN
          ============================================================ */}
      {modalConfirm && (
        <div className="modal-backdrop" onClick={() => setModalConfirm(null)}>
          <div className="modal-dialog-card confirm-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-icon">
              <AlertTriangle size={28} />
            </div>
            <h3>{modalConfirm.titulo}</h3>
            <p className="confirm-modal-desc">{modalConfirm.descripcion}</p>
            <div className="modal-dialog-footer">
              <button
                type="button"
                className="btn-secondary-action"
                onClick={() => setModalConfirm(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-danger-confirm"
                onClick={handleEjecutarConfirm}
                disabled={procesandoModal}
              >
                <Trash2 size={16} />
                <span>{procesandoModal ? 'Procesando...' : modalConfirm.textoBoton}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
