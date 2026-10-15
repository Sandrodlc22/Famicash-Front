import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  Delete,
  ChevronDown,
  Check,
  Pencil,
  FileText,
  ArrowUp,
  ArrowDown,
  ArrowRightLeft,
  X,
  Wallet
} from 'lucide-react';
import { getCategoryIcon } from '../utils/iconosCategorias';
import logoFamicash from '../assets/logo-famicash.png';

export default function VistaIngresoMonto({
  usuario,
  cuentas,
  categorias,
  onSaveMovimiento,
  onOpenProfile
}) {
  const [tipo, setTipo] = useState('GASTO'); // 'GASTO' o 'INGRESO'
  const [subtipo, setSubtipo] = useState('Cotidiano'); // 'Cotidiano', 'Fijo' (GASTO) o 'Sueldo', 'Transferencia' (INGRESO)
  const [cuentaId, setCuentaId] = useState(cuentas[0]?.id || 1);
  const [cuentaDestinoId, setCuentaDestinoId] = useState(cuentas[1]?.id || (cuentas[0]?.id === 1 ? 2 : 1));
  const [accountPickerTarget, setAccountPickerTarget] = useState('origen'); // 'origen' | 'destino'
  const [categoriaId, setCategoriaId] = useState(categorias[0]?.id || 1);
  const [montoStr, setMontoStr] = useState('0');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showKeypadModal, setShowKeypadModal] = useState(false);
  const [showTextKeyboard, setShowTextKeyboard] = useState(false);
  const [showAccountPicker, setShowAccountPicker] = useState(false);
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [isSymbolsMode, setIsSymbolsMode] = useState(false);

  // Cuenta seleccionada actualmente (origen)
  const selectedCuenta = cuentas.find((c) => c.id === parseInt(cuentaId, 10)) || cuentas[0];
  // Cuenta de destino (para transferencias entre cuentas)
  const selectedCuentaDestino = cuentas.find((c) => c.id === parseInt(cuentaDestinoId, 10)) || cuentas.find(c => c.id !== cuentaId) || cuentas[0];

  // Invertir cuentas origen y destino en transferencias
  const handleSwapAccounts = () => {
    const temp = cuentaId;
    setCuentaId(cuentaDestinoId);
    setCuentaDestinoId(temp);
  };

  // Sugerencias rápidas de notas según el contexto
  const sugerenciasNotas = tipo === 'GASTO'
    ? ['Almuerzo', 'Supermercado', 'Gasolina', 'Farmacia', 'Cena', 'Servicios', 'Taxi', 'Salida']
    : subtipo === 'Sueldo'
      ? ['Quincena', 'Sueldo mensual', 'Bono productividad', 'Gratificación', 'Adelanto', 'Trabajo extra']
      : ['Ahorro mensual', 'Para gastos del hogar', 'Pago de tarjeta', 'Fondo de emergencia', 'Reserva', 'Inversión'];

  // Manejador del Teclado Virtual de Texto (Móvil)
  const handleVirtualKeyPress = (char) => {
    if (char === 'backspace') {
      setDescripcion((prev) => prev.slice(0, -1));
      return;
    }
    if (char === 'space') {
      setDescripcion((prev) => prev + ' ');
      return;
    }
    if (char === 'clear') {
      setDescripcion('');
      return;
    }
    setDescripcion((prev) => prev + (isShiftActive ? char.toUpperCase() : char.toLowerCase()));
  };

  // Manejador del Teclado Numérico en pantalla
  const handleKeypadPress = (key) => {
    if (key === 'backspace') {
      if (montoStr.length <= 1) {
        setMontoStr('0');
      } else {
        setMontoStr(montoStr.slice(0, -1));
      }
      return;
    }

    if (key === '.') {
      if (montoStr.includes('.')) return; // Evitar doble punto
      setMontoStr(montoStr + '.');
      return;
    }

    // Limitar decimales a 2 dígitos
    if (montoStr.includes('.')) {
      const parts = montoStr.split('.');
      if (parts[1]?.length >= 2) return;
    }

    // Limitar longitud total
    if (montoStr.length > 9) return;

    if (montoStr === '0') {
      setMontoStr(key);
    } else {
      setMontoStr(montoStr + key);
    }
  };

  // Filtrar categorías según tipo (GASTO o INGRESO)
  const currentCategories = categorias.filter(
    (c) => c.tipo?.toUpperCase() === tipo.toUpperCase()
  );

  const handleConfirm = async () => {
    const numericMonto = parseFloat(montoStr);
    if (isNaN(numericMonto) || numericMonto <= 0) {
      alert('Por favor ingrese un monto mayor a 0 usando el teclado numérico');
      return;
    }

    const isTransfer = tipo === 'INGRESO' && subtipo === 'Transferencia';
    if (isTransfer) {
      if (parseInt(cuentaId, 10) === parseInt(cuentaDestinoId, 10)) {
        alert('Para transferir dinero, la cuenta de origen y de destino deben ser diferentes.');
        return;
      }
      if (numericMonto > (selectedCuenta?.saldo_actual || 0)) {
        const proceed = window.confirm(
          `El monto (S/ ${numericMonto.toFixed(2)}) supera el saldo disponible de ${selectedCuenta?.nombre} (S/ ${selectedCuenta?.saldo_actual?.toFixed(2)}). ¿Deseas transferir de todas formas?`
        );
        if (!proceed) return;
      }
    }

    setLoading(true);
    try {
      const catTransferencia = categorias.find(c => c.nombre === 'Transferencia') || { id: 10, nombre: 'Transferencia' };
      const catSueldo = categorias.find(c => c.nombre === 'Sueldo') || { id: 9, nombre: 'Sueldo' };

      const finalCategoriaId = isTransfer
        ? catTransferencia.id
        : (tipo === 'INGRESO' && subtipo === 'Sueldo')
          ? catSueldo.id
          : categoriaId;

      await onSaveMovimiento({
        cuenta_id: cuentaId,
        cuenta_destino_id: isTransfer ? cuentaDestinoId : null,
        categoria_id: finalCategoriaId,
        tipo: isTransfer ? 'TRANSFERENCIA' : tipo,
        subtipo,
        monto: numericMonto,
        descripcion: descripcion.trim() || (
          isTransfer
            ? `Transferencia de ${selectedCuenta?.nombre} a ${selectedCuentaDestino?.nombre}`
            : subtipo === 'Sueldo'
              ? `Ingreso de Sueldo a ${selectedCuenta?.nombre}`
              : `${subtipo} - ${currentCategories.find(c => c.id === categoriaId)?.nombre || 'General'}`
        )
      });

      // Reiniciar monto y nota tras guardar exitosamente
      setMontoStr('0');
      setDescripcion('');

      setShowSuccessToast(true);
      setTimeout(() => {
        setShowSuccessToast(false);
      }, 1500);
    } catch (err) {
      alert('Error al registrar: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="expense-view-container">
      {/* 1. Header con avatar, logo FamiCash y campana */}
      <header className="mobile-app-header">
        <button
          type="button"
          className="header-avatar-btn"
          onClick={onOpenProfile}
          title="Ver Perfil"
        >
          <img
            src={usuario?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150'}
            alt={usuario?.nombre || 'Sandro De la Cruz'}
            className="header-avatar-img"
          />
        </button>

        <div className="header-logo-container">
          <img src={logoFamicash} alt="FamiCash" className="header-famicash-logo" />
        </div>

        <button
          type="button"
          className="header-icon-btn"
          onClick={() => alert('Tienes 1 alerta: Presupuesto familiar en buen estado.')}
        >
          <Bell size={22} className="header-bell-icon" />
          <span className="bell-badge-dot"></span>
        </button>
      </header>

      {/* Contenido scrolleable de ingreso */}
      <div className="expense-content-scroll">
        {/* Título de pantalla */}
        <div className="expense-title-section">
          <h2 className="expense-main-title">
            {tipo === 'GASTO'
              ? 'Nuevo Gasto'
              : (subtipo === 'Transferencia' ? 'Nueva Transferencia' : 'Nuevo Ingreso')}
          </h2>
          <p className="expense-subtitle">
            {tipo === 'GASTO'
              ? '¿Qué registramos hoy?'
              : (subtipo === 'Transferencia' ? 'Movimiento entre tus cuentas propias' : 'Registro de sueldo y abonos')}
          </p>
        </div>

        {/* Toggle Principal Gasto / Ingreso - Reinicia monto a 0 al cambiar */}
        <div className="flow-type-switcher">
          <button
            type="button"
            className={`type-pill-btn ${tipo === 'GASTO' ? 'active-gasto' : ''}`}
            onClick={() => {
              if (tipo !== 'GASTO') {
                setMontoStr('0');
                setDescripcion('');
              }
              setTipo('GASTO');
              setSubtipo('Cotidiano');
              const firstGastoCat = categorias.find(c => c.tipo === 'GASTO');
              if (firstGastoCat) setCategoriaId(firstGastoCat.id);
            }}
          >
            Gasto
          </button>
          <button
            type="button"
            className={`type-pill-btn ${tipo === 'INGRESO' ? 'active-ingreso' : ''}`}
            onClick={() => {
              if (tipo !== 'INGRESO') {
                setMontoStr('0');
                setDescripcion('');
              }
              setTipo('INGRESO');
              setSubtipo('Sueldo');
              const catSueldo = categorias.find(c => c.nombre === 'Sueldo') || categorias.find(c => c.tipo === 'INGRESO');
              if (catSueldo) setCategoriaId(catSueldo.id);
            }}
          >
            Ingreso
          </button>
        </div>

        {/* Subpíldoras de subtipo: Cotidiano y Fijo para Gasto; Sueldo y Transferencia para Ingreso - Reinicia monto a 0 al cambiar */}
        <div className="subtype-pills-row">
          {(tipo === 'GASTO' ? ['Cotidiano', 'Fijo'] : ['Sueldo', 'Transferencia']).map((sub) => (
            <button
              key={sub}
              type="button"
              className={`subtype-pill ${subtipo === sub ? 'active' : ''}`}
              onClick={() => {
                if (subtipo !== sub) {
                  setMontoStr('0');
                  setDescripcion('');
                }
                setSubtipo(sub);
                if (tipo === 'INGRESO') {
                  if (sub === 'Sueldo') {
                    const catS = categorias.find(c => c.nombre === 'Sueldo');
                    if (catS) setCategoriaId(catS.id);
                  } else if (sub === 'Transferencia') {
                    const catT = categorias.find(c => c.nombre === 'Transferencia');
                    if (catT) setCategoriaId(catT.id);
                  }
                }
              }}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Paso 1: Selector de Cuenta */}
        {!(tipo === 'INGRESO' && subtipo === 'Transferencia') ? (
          /* Modo normal: Gasto o Sueldo (solo 1 cuenta a la vez con opción de cambiar) */
          <div className="form-section-block">
            <div className="section-label-row">
              <span className="section-step-badge">1</span>
              <span className="section-block-title">
                {tipo === 'GASTO' ? 'Cuenta de donde sacar plata' : '¿A qué cuenta va el sueldo?'}
              </span>
            </div>

            <div
              className="selected-single-account-card"
              onClick={() => {
                setAccountPickerTarget('origen');
                setShowAccountPicker(true);
              }}
              role="button"
              tabIndex={0}
              title="Toca para cambiar de cuenta"
            >
              <div className="single-account-left">
                <div className="single-account-icon-wrap">
                  <Wallet size={20} />
                </div>
                <div className="single-account-text">
                  <div className="single-account-title-row">
                    <span className="single-account-name">{selectedCuenta?.nombre || 'Cuenta Principal'}</span>
                    <span className="single-account-type-badge">{selectedCuenta?.tipo || 'Cuenta'}</span>
                  </div>
                  <div className="single-account-balance-txt">
                    {tipo === 'GASTO' ? 'Saldo disponible: ' : 'Saldo actual en cuenta: '}
                    <strong>S/ {parseFloat(selectedCuenta?.saldo_actual || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</strong>
                  </div>
                </div>
              </div>

              <div className="single-account-change-action">
                <span>Cambiar</span>
                <ChevronDown size={15} />
              </div>
            </div>
          </div>
        ) : (
          /* Modo Transferencia: De cuál cuenta a qué cuenta le quiere transferir entre ellas mismas */
          <div className="form-section-block">
            <div className="section-label-row">
              <span className="section-step-badge">1</span>
              <span className="section-block-title">CUENTAS DE LA TRANSFERENCIA</span>
            </div>

            <div className="transfer-accounts-wrapper">
              {/* Cuenta de Origen (De cuál cuenta) */}
              <div className="transfer-account-card-box">
                <div className="account-role-label">
                  <span className="account-role-dot dot-origin"></span>
                  <span>DE (CUENTA DE ORIGEN)</span>
                </div>
                <div
                  className="selected-single-account-card"
                  onClick={() => {
                    setAccountPickerTarget('origen');
                    setShowAccountPicker(true);
                  }}
                  role="button"
                  tabIndex={0}
                  title="Toca para cambiar cuenta de origen"
                >
                  <div className="single-account-left">
                    <div className="single-account-icon-wrap origin-icon-wrap">
                      <Wallet size={20} />
                    </div>
                    <div className="single-account-text">
                      <div className="single-account-title-row">
                        <span className="single-account-name">{selectedCuenta?.nombre || 'Cuenta Origen'}</span>
                        <span className="single-account-type-badge">{selectedCuenta?.tipo || 'Cuenta'}</span>
                      </div>
                      <div className="single-account-balance-txt">
                        Disponible: <strong>S/ {parseFloat(selectedCuenta?.saldo_actual || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="single-account-change-action">
                    <span>Cambiar</span>
                    <ChevronDown size={15} />
                  </div>
                </div>
              </div>

              {/* Conector Visual de Transferencia con botón de inversión rápida */}
              <div className="transfer-connector-row">
                <div className="connector-line"></div>
                <button
                  type="button"
                  className="connector-badge-btn"
                  onClick={handleSwapAccounts}
                  title="Invertir dirección de la transferencia"
                >
                  <ArrowDown size={14} className="connector-arrow-icon" />
                  <span>Transferir a</span>
                </button>
                <div className="connector-line"></div>
              </div>

              {/* Cuenta de Destino (A qué cuenta) */}
              <div className="transfer-account-card-box">
                <div className="account-role-label">
                  <span className="account-role-dot dot-destination"></span>
                  <span>A (CUENTA DE DESTINO)</span>
                </div>
                <div
                  className="selected-single-account-card"
                  onClick={() => {
                    setAccountPickerTarget('destino');
                    setShowAccountPicker(true);
                  }}
                  role="button"
                  tabIndex={0}
                  title="Toca para cambiar cuenta de destino"
                >
                  <div className="single-account-left">
                    <div className="single-account-icon-wrap destination-icon-wrap">
                      <Wallet size={20} />
                    </div>
                    <div className="single-account-text">
                      <div className="single-account-title-row">
                        <span className="single-account-name">{selectedCuentaDestino?.nombre || 'Cuenta Destino'}</span>
                        <span className="single-account-type-badge">{selectedCuentaDestino?.tipo || 'Cuenta'}</span>
                      </div>
                      <div className="single-account-balance-txt">
                        Saldo actual: <strong>S/ {parseFloat(selectedCuentaDestino?.saldo_actual || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="single-account-change-action">
                    <span>Cambiar</span>
                    <ChevronDown size={15} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Paso 2: Display del Monto Interactivo */}
        <div className="form-section-block">
          <div className="section-label-row">
            <span className="section-step-badge">2</span>
            <span className="section-block-title">
              {tipo === 'GASTO'
                ? 'MONTO A GASTAR'
                : (subtipo === 'Transferencia' ? 'MONTO A TRANSFERIR' : 'MONTO DEL SUELDO')}
            </span>
          </div>

          <div
            className="amount-display-card clickable-amount-card"
            onClick={() => setShowKeypadModal(true)}
            role="button"
            tabIndex={0}
            title="Toca para ingresar la cantidad"
          >
            <div className="amount-card-top-row">
              <span className="amount-card-label">
                {tipo === 'GASTO'
                  ? 'Monto a gastar'
                  : (subtipo === 'Transferencia' ? 'Cantidad a transferir' : 'Monto que se está ingresando')}
              </span>
              <span className="tap-hint-pill">
                <Pencil size={11} /> Toca para editar
              </span>
            </div>
            <div className="amount-value-row">
              <span className="currency-symbol">S/</span>
              <span className="amount-digits">{montoStr}</span>
            </div>

            {/* Proyecciones de saldo en tiempo real */}
            {tipo === 'GASTO' && selectedCuenta && (
              <div className="amount-preview-balance">
                Quedará en cuenta: <strong>
                  S/ {(parseFloat(selectedCuenta.saldo_actual || 0) - parseFloat(montoStr || 0)).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </strong>
              </div>
            )}

            {tipo === 'INGRESO' && subtipo === 'Sueldo' && selectedCuenta && (
              <div className="amount-preview-balance">
                Saldo final en cuenta: <strong>
                  S/ {(parseFloat(selectedCuenta.saldo_actual || 0) + parseFloat(montoStr || 0)).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </strong>
              </div>
            )}

            {tipo === 'INGRESO' && subtipo === 'Transferencia' && selectedCuenta && selectedCuentaDestino && (
              <div className="transfer-dual-balance-row">
                <div className="dual-balance-col">
                  <span className="dual-col-title">Quedará en {selectedCuenta.nombre.split(' ')[0]}:</span>
                  <strong className="dual-col-val text-red">
                    S/ {(parseFloat(selectedCuenta.saldo_actual || 0) - parseFloat(montoStr || 0)).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
                <div className="dual-balance-sep">➔</div>
                <div className="dual-balance-col">
                  <span className="dual-col-title">Subirá en {selectedCuentaDestino.nombre.split(' ')[0]}:</span>
                  <strong className="dual-col-val text-green">
                    S/ {(parseFloat(selectedCuentaDestino.saldo_actual || 0) + parseFloat(montoStr || 0)).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Paso 3: Selector de Categoría (Para Gasto) o Tarjeta Informativa (Para Sueldo) */}
        {tipo === 'GASTO' && (
          <div className="form-section-block">
            <div className="section-label-row">
              <span className="section-step-badge">3</span>
              <span className="section-block-title">CATEGORÍA</span>
            </div>

            <div className="categories-grid-4">
              {currentCategories.slice(0, 8).map((cat) => {
                const isSelected = categoriaId === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    className={`category-item-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setCategoriaId(cat.id)}
                  >
                    <div className={`category-icon-box ${isSelected ? 'active-icon' : ''}`}>
                      {getCategoryIcon(cat.icono, 22)}
                    </div>
                    <span className="category-item-label">{cat.nombre}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {tipo === 'INGRESO' && subtipo === 'Sueldo' && (
          <div className="form-section-block">
            <div className="section-label-row">
              <span className="section-step-badge">3</span>
              <span className="section-block-title">CATEGORÍA DE INGRESO</span>
            </div>

            <div className="sueldo-category-badge-card">
              <div className="sueldo-badge-icon-wrap">
                <Wallet size={22} />
              </div>
              <div className="sueldo-badge-text-col">
                <span className="sueldo-badge-name">Sueldo / Nómina</span>
                <span className="sueldo-badge-desc">Ingreso por trabajo o remuneración asignado a tu cuenta</span>
              </div>
              <div className="sueldo-badge-check">
                <Check size={14} />
              </div>
            </div>
          </div>
        )}

        {/* Detalle o nota opcional (interactivo para móvil) */}
        <div
          className="optional-note-field clickable-note-field"
          onClick={() => setShowTextKeyboard(true)}
        >
          <div className="note-field-inner">
            <span className="note-icon-wrap">
              <FileText size={16} />
            </span>
            <input
              type="text"
              placeholder={
                tipo === 'GASTO'
                  ? 'Nota opcional (ej: Almuerzo dominguero, supermercado...)'
                  : subtipo === 'Transferencia'
                    ? 'Nota opcional (ej: Ahorro mensual, Fondo de emergencia...)'
                    : 'Nota opcional (ej: Quincena, Sueldo mensual...)'
              }
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              onFocus={() => setShowTextKeyboard(true)}
              className="note-input"
            />
            {descripcion ? (
              <button
                type="button"
                className="note-clear-mini"
                onClick={(e) => {
                  e.stopPropagation();
                  setDescripcion('');
                }}
                title="Borrar nota"
              >
                ✕
              </button>
            ) : (
              <span className="note-edit-hint">
                <Pencil size={12} />
              </span>
            )}
          </div>
        </div>

        {/* Botón Confirmar */}
        <div className="confirm-btn-wrapper">
          <button
            type="button"
            className="confirm-expense-btn"
            onClick={handleConfirm}
            disabled={loading || parseFloat(montoStr) <= 0}
          >
            <span>
              {loading
                ? 'Registrando...'
                : (tipo === 'GASTO'
                    ? 'Confirmar Gasto'
                    : (subtipo === 'Transferencia' ? 'Confirmar Transferencia' : 'Confirmar Ingreso de Sueldo'))}
            </span>
            <CheckCircle2 size={22} className="confirm-btn-check-icon" />
          </button>
        </div>
      </div>

      {/* Modal / Bottom Sheet Selector de Cuentas */}
      {showAccountPicker && (
        <div
          className="keypad-modal-overlay"
          onClick={() => setShowAccountPicker(false)}
        >
          <div
            className="account-picker-drawer-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-handle-bar" />

            <div className="account-picker-drawer-header">
              <div>
                <h3 className="account-picker-title">
                  {tipo === 'GASTO'
                    ? '¿De qué cuenta sacar plata?'
                    : subtipo === 'Sueldo'
                      ? '¿A qué cuenta ingresar el sueldo?'
                      : (accountPickerTarget === 'origen' ? '¿De qué cuenta transferir? (Origen)' : '¿A qué cuenta transferir? (Destino)')}
                </h3>
                <p className="account-picker-sub">
                  {subtipo === 'Transferencia'
                    ? (accountPickerTarget === 'origen' ? 'Selecciona la cuenta de donde saldrá el dinero' : 'Selecciona la cuenta que recibirá el dinero')
                    : 'Selecciona una de tus cuentas disponibles'}
                </p>
              </div>
              <button
                type="button"
                className="keyboard-input-clear-btn"
                onClick={() => setShowAccountPicker(false)}
                title="Cerrar"
              >
                <X size={15} />
              </button>
            </div>

            <div className="account-picker-items-list">
              {cuentas.map((cta) => {
                const isSelected = accountPickerTarget === 'origen'
                  ? parseInt(cuentaId, 10) === cta.id
                  : parseInt(cuentaDestinoId, 10) === cta.id;

                const isOtherRole = subtipo === 'Transferencia' && (
                  accountPickerTarget === 'origen'
                    ? parseInt(cuentaDestinoId, 10) === cta.id
                    : parseInt(cuentaId, 10) === cta.id
                );

                return (
                  <button
                    key={cta.id}
                    type="button"
                    className={`account-picker-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      if (accountPickerTarget === 'origen') {
                        if (subtipo === 'Transferencia' && cta.id === parseInt(cuentaDestinoId, 10)) {
                          // Intercambiar si se elige la misma
                          setCuentaDestinoId(cuentaId);
                        }
                        setCuentaId(cta.id);
                      } else {
                        if (cta.id === parseInt(cuentaId, 10)) {
                          // Intercambiar si se elige la misma
                          setCuentaId(cuentaDestinoId);
                        }
                        setCuentaDestinoId(cta.id);
                      }
                      setShowAccountPicker(false);
                    }}
                  >
                    <div className="picker-item-left">
                      <div className={`picker-item-icon-box ${isSelected ? 'active-icon' : ''}`}>
                        <Wallet size={19} />
                      </div>
                      <div className="picker-item-text-col">
                        <div className="picker-name-row">
                          <span className="picker-item-name">{cta.nombre}</span>
                          {isOtherRole && (
                            <span className="other-transfer-pill">
                              {accountPickerTarget === 'origen' ? 'Destino actual' : 'Origen actual'}
                            </span>
                          )}
                        </div>
                        <span className="picker-item-type">{cta.tipo}</span>
                      </div>
                    </div>

                    <div className="picker-item-right">
                      <span className="picker-item-balance">
                        S/ {parseFloat(cta.saldo_actual || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                      </span>
                      {isSelected ? (
                        <div className="picker-check-badge">
                          <Check size={13} />
                        </div>
                      ) : (
                        <div className="picker-circle-empty" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modal / Drawer Teclado Numérico Emergente (se abre al aplastar el monto) */}
      {showKeypadModal && (
        <div
          className="keypad-modal-overlay"
          onClick={() => setShowKeypadModal(false)}
        >
          <div
            className="keypad-drawer-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-handle-bar" />

            <div className="keypad-drawer-header">
              <div className="drawer-title-col">
                <span className="drawer-sub">Ingresa la cantidad</span>
                <div className="drawer-amount-row">
                  <span className="drawer-currency">S/</span>
                  <span className="drawer-digits">{montoStr}</span>
                </div>
              </div>
              <button
                type="button"
                className="drawer-done-btn"
                onClick={() => setShowKeypadModal(false)}
              >
                <Check size={16} />
                <span>Listo</span>
              </button>
            </div>

            {/* Teclado Numérico */}
            <div className="keypad-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  type="button"
                  className="keypad-key"
                  onClick={() => handleKeypadPress(num.toString())}
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                className="keypad-key dot-key"
                onClick={() => handleKeypadPress('.')}
              >
                .
              </button>
              <button
                type="button"
                className="keypad-key zero-key"
                onClick={() => handleKeypadPress('0')}
              >
                0
              </button>
              <button
                type="button"
                className="keypad-key backspace-key"
                onClick={() => handleKeypadPress('backspace')}
                aria-label="Borrar último dígito"
              >
                <Delete size={22} />
              </button>
            </div>

            {/* Acciones Rápidas del Teclado */}
            <div className="keypad-drawer-footer">
              <button
                type="button"
                className="keypad-clear-btn"
                onClick={() => setMontoStr('0')}
              >
                Limpiar
              </button>
              <button
                type="button"
                className="keypad-confirm-btn"
                onClick={() => setShowKeypadModal(false)}
              >
                Aceptar Monto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal / Drawer Teclado Virtual de Texto (se abre al aplastar nota opcional) */}
      {showTextKeyboard && (
        <div
          className="keypad-modal-overlay"
          onClick={() => setShowTextKeyboard(false)}
        >
          <div
            className="text-keyboard-drawer-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer-handle-bar" />

            {/* Input activo con botón Listo */}
            <div className="text-keyboard-header">
              <FileText size={16} className="text-header-icon" />
              <input
                type="text"
                className="keyboard-active-input"
                placeholder="Escribe una nota para este movimiento..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                autoFocus
              />
              {descripcion && (
                <button
                  type="button"
                  className="keyboard-input-clear-btn"
                  onClick={() => setDescripcion('')}
                  title="Limpiar"
                >
                  <X size={14} />
                </button>
              )}
              <button
                type="button"
                className="keyboard-done-action-btn"
                onClick={() => setShowTextKeyboard(false)}
              >
                <Check size={16} />
                <span>Listo</span>
              </button>
            </div>

            {/* Sugerencias rápidas estilo móvil */}
            <div className="keyboard-quick-chips-row">
              {sugerenciasNotas.map((sug) => (
                <button
                  key={sug}
                  type="button"
                  className="quick-suggestion-chip"
                  onClick={() => {
                    setDescripcion((prev) => (prev ? `${prev} ${sug}` : sug));
                  }}
                >
                  {sug}
                </button>
              ))}
            </div>

            {/* Filas de Teclas Móviles QWERTY */}
            <div className="keyboard-rows-container">
              {!isSymbolsMode ? (
                <>
                  {/* Fila 1 */}
                  <div className="keyboard-key-row">
                    {['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'].map((k) => (
                      <button
                        key={k}
                        type="button"
                        className="qwerty-key"
                        onClick={() => handleVirtualKeyPress(k)}
                      >
                        {isShiftActive ? k : k.toLowerCase()}
                      </button>
                    ))}
                  </div>

                  {/* Fila 2 */}
                  <div className="keyboard-key-row">
                    {['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'].map((k) => (
                      <button
                        key={k}
                        type="button"
                        className="qwerty-key"
                        onClick={() => handleVirtualKeyPress(k)}
                      >
                        {isShiftActive ? k : k.toLowerCase()}
                      </button>
                    ))}
                  </div>

                  {/* Fila 3 con Shift y Borrar */}
                  <div className="keyboard-key-row">
                    <button
                      type="button"
                      className={`qwerty-key qwerty-special-key ${isShiftActive ? 'active-shift' : ''}`}
                      onClick={() => setIsShiftActive(!isShiftActive)}
                      title="Mayúsculas"
                    >
                      <ArrowUp size={16} />
                    </button>
                    {['Z', 'X', 'C', 'V', 'B', 'N', 'M'].map((k) => (
                      <button
                        key={k}
                        type="button"
                        className="qwerty-key"
                        onClick={() => handleVirtualKeyPress(k)}
                      >
                        {isShiftActive ? k : k.toLowerCase()}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="qwerty-key qwerty-special-key"
                      onClick={() => handleVirtualKeyPress('backspace')}
                      title="Borrar"
                    >
                      <Delete size={18} />
                    </button>
                  </div>

                  {/* Fila 4 con 123, Coma, Espacio, Punto y Listo */}
                  <div className="keyboard-key-row">
                    <button
                      type="button"
                      className="qwerty-key qwerty-special-key"
                      onClick={() => setIsSymbolsMode(true)}
                    >
                      123
                    </button>
                    <button
                      type="button"
                      className="qwerty-key"
                      onClick={() => handleVirtualKeyPress(',')}
                    >
                      ,
                    </button>
                    <button
                      type="button"
                      className="qwerty-key qwerty-space-key"
                      onClick={() => handleVirtualKeyPress('space')}
                    >
                      espacio
                    </button>
                    <button
                      type="button"
                      className="qwerty-key"
                      onClick={() => handleVirtualKeyPress('.')}
                    >
                      .
                    </button>
                    <button
                      type="button"
                      className="qwerty-key qwerty-enter-key"
                      onClick={() => setShowTextKeyboard(false)}
                    >
                      Listo
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Modo Números y Símbolos */}
                  {/* Fila 1 Números */}
                  <div className="keyboard-key-row">
                    {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((num) => (
                      <button
                        key={num}
                        type="button"
                        className="qwerty-key"
                        onClick={() => handleVirtualKeyPress(num)}
                      >
                        {num}
                      </button>
                    ))}
                  </div>

                  {/* Fila 2 Símbolos comunes */}
                  <div className="keyboard-key-row">
                    {['@', '#', '$', '%', '&', '*', '-', '+', '(', ')'].map((sym) => (
                      <button
                        key={sym}
                        type="button"
                        className="qwerty-key"
                        onClick={() => handleVirtualKeyPress(sym)}
                      >
                        {sym}
                      </button>
                    ))}
                  </div>

                  {/* Fila 3 Símbolos */}
                  <div className="keyboard-key-row">
                    <button
                      type="button"
                      className="qwerty-key qwerty-special-key"
                      onClick={() => setIsSymbolsMode(false)}
                    >
                      ABC
                    </button>
                    {['!', '"', "'", ':', ';', '/', '?'].map((sym) => (
                      <button
                        key={sym}
                        type="button"
                        className="qwerty-key"
                        onClick={() => handleVirtualKeyPress(sym)}
                      >
                        {sym}
                      </button>
                    ))}
                    <button
                      type="button"
                      className="qwerty-key qwerty-special-key"
                      onClick={() => handleVirtualKeyPress('backspace')}
                      title="Borrar"
                    >
                      <Delete size={18} />
                    </button>
                  </div>

                  {/* Fila 4 */}
                  <div className="keyboard-key-row">
                    <button
                      type="button"
                      className="qwerty-key qwerty-special-key"
                      onClick={() => setIsSymbolsMode(false)}
                    >
                      ABC
                    </button>
                    <button
                      type="button"
                      className="qwerty-key"
                      onClick={() => handleVirtualKeyPress(',')}
                    >
                      ,
                    </button>
                    <button
                      type="button"
                      className="qwerty-key qwerty-space-key"
                      onClick={() => handleVirtualKeyPress('space')}
                    >
                      espacio
                    </button>
                    <button
                      type="button"
                      className="qwerty-key"
                      onClick={() => handleVirtualKeyPress('.')}
                    >
                      .
                    </button>
                    <button
                      type="button"
                      className="qwerty-key qwerty-enter-key"
                      onClick={() => setShowTextKeyboard(false)}
                    >
                      Listo
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast de Éxito Flotante */}
      {showSuccessToast && (
        <div className="success-toast-float">
          <CheckCircle2 size={20} />
          <span>¡Movimiento registrado con éxito!</span>
        </div>
      )}
    </div>
  );
}
