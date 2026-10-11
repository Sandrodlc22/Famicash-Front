import React, { useState } from 'react';
import { Bell, CheckCircle2, Delete, ChevronDown, Check } from 'lucide-react';
import { getCategoryIcon } from '../utils/iconosCategorias';

export default function VistaIngresoMonto({
  usuario,
  cuentas,
  categorias,
  onSaveMovimiento,
  onOpenProfile
}) {
  const [tipo, setTipo] = useState('GASTO'); // 'GASTO' o 'INGRESO'
  const [subtipo, setSubtipo] = useState('Cotidiano'); // 'Cotidiano', 'Fijo', 'Extra'
  const [cuentaId, setCuentaId] = useState(cuentas[0]?.id || 1);
  const [categoriaId, setCategoriaId] = useState(categorias[0]?.id || 1);
  const [montoStr, setMontoStr] = useState('0');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

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

  // Cuenta seleccionada actualmente
  const selectedCuenta = cuentas.find((c) => c.id === parseInt(cuentaId, 10)) || cuentas[0];

  const handleConfirm = async () => {
    const numericMonto = parseFloat(montoStr);
    if (isNaN(numericMonto) || numericMonto <= 0) {
      alert('Por favor ingrese un monto mayor a 0 usando el teclado numérico');
      return;
    }

    setLoading(true);
    try {
      await onSaveMovimiento({
        cuenta_id: cuentaId,
        categoria_id: categoriaId,
        tipo,
        subtipo,
        monto: numericMonto,
        descripcion: descripcion.trim() || `${subtipo} - ${currentCategories.find(c => c.id === categoriaId)?.nombre || 'General'}`
      });

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

        <h1 className="header-brand-title">FamiCash</h1>

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
            {tipo === 'GASTO' ? 'Nuevo Gasto' : 'Nuevo Ingreso'}
          </h2>
          <p className="expense-subtitle">¿Qué registramos hoy?</p>
        </div>

        {/* Toggle Principal Gasto / Ingreso */}
        <div className="flow-type-switcher">
          <button
            type="button"
            className={`type-pill-btn ${tipo === 'GASTO' ? 'active-gasto' : ''}`}
            onClick={() => {
              setTipo('GASTO');
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
              setTipo('INGRESO');
              const firstIngresoCat = categorias.find(c => c.tipo === 'INGRESO');
              if (firstIngresoCat) setCategoriaId(firstIngresoCat.id);
            }}
          >
            Ingreso
          </button>
        </div>

        {/* Subpíldoras de subtipo: Cotidiano / Fijo / Extra (Mockup 2) */}
        <div className="subtype-pills-row">
          {['Cotidiano', 'Fijo', 'Extra'].map((sub) => (
            <button
              key={sub}
              type="button"
              className={`subtype-pill ${subtipo === sub ? 'active' : ''}`}
              onClick={() => setSubtipo(sub)}
            >
              {sub}
            </button>
          ))}
        </div>

        {/* Selector de Cuenta Bancaria existente (Paso requerido: "escoger una cuenta existente donde sacar plata") */}
        <div className="form-section-block">
          <div className="section-label-row">
            <span className="section-step-badge">1</span>
            <span className="section-block-title">
              {tipo === 'GASTO' ? 'Cuenta de donde sacar plata' : 'Cuenta de destino'}
            </span>
          </div>

          <div className="accounts-pill-selector">
            {cuentas.map((cta) => {
              const isSelected = parseInt(cuentaId, 10) === cta.id;
              return (
                <button
                  key={cta.id}
                  type="button"
                  className={`account-card-pill ${isSelected ? 'selected' : ''}`}
                  onClick={() => setCuentaId(cta.id)}
                >
                  <div className="cta-pill-top">
                    <span className="cta-pill-name">{cta.nombre}</span>
                    {isSelected && <Check size={14} className="cta-pill-check" />}
                  </div>
                  <div className="cta-pill-balance">
                    Saldo: S/ {parseFloat(cta.saldo_actual || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Display del Monto (Mockup 2) */}
        <div className="amount-display-card">
          <span className="amount-card-label">Monto</span>
          <div className="amount-value-row">
            <span className="currency-symbol">$</span>
            <span className="amount-digits">{montoStr}</span>
          </div>
          {selectedCuenta && (
            <div className="amount-preview-balance">
              {tipo === 'GASTO' ? 'Quedará en cuenta: ' : 'Saldo final proyectado: '}
              <strong>
                S/ {(
                  parseFloat(selectedCuenta.saldo_actual || 0) +
                  (tipo === 'GASTO' ? -parseFloat(montoStr || 0) : parseFloat(montoStr || 0))
                ).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </strong>
            </div>
          )}
        </div>

        {/* Selector de Categoría (Mockup 2) */}
        <div className="form-section-block">
          <div className="section-label-row">
            <span className="section-step-badge">2</span>
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

        {/* Detalle o nota opcional */}
        <div className="optional-note-field">
          <input
            type="text"
            placeholder="Nota opcional (ej: Almuerzo dominguero, supermercado...)"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="note-input"
          />
        </div>

        {/* Teclado Numérico Integrado (Mockup 2) */}
        <div className="numeric-keypad-container">
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
        </div>

        {/* Botón Confirmar Gasto (Mockup 2) */}
        <div className="confirm-btn-wrapper">
          <button
            type="button"
            className="confirm-expense-btn"
            onClick={handleConfirm}
            disabled={loading || parseFloat(montoStr) <= 0}
          >
            <span>{loading ? 'Registrando...' : (tipo === 'GASTO' ? 'Confirmar Gasto' : 'Confirmar Ingreso')}</span>
            <CheckCircle2 size={22} className="confirm-btn-check-icon" />
          </button>
        </div>
      </div>

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
