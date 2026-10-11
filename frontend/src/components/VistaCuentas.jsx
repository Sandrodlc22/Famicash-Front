import React, { useState } from 'react';
import { CreditCard, Plus, ArrowUpRight, Shield, Wallet, Building2, Banknote } from 'lucide-react';

export default function VistaCuentas({ cuentas, onRefresh, onGoToExpense }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoTipo, setNuevoTipo] = useState('Ahorros');
  const [nuevoSaldo, setNuevoSaldo] = useState('');

  const getAccountIcon = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'efectivo':
        return <Banknote size={24} />;
      case 'tarjeta crédito':
      case 'tarjeta débito':
        return <CreditCard size={24} />;
      case 'ahorros':
      default:
        return <Building2 size={24} />;
    }
  };

  return (
    <div className="accounts-view-wrapper">
      <header className="mobile-app-header">
        <div className="header-avatar-btn-placeholder"></div>
        <h1 className="header-brand-title">Mis Cuentas</h1>
        <button
          type="button"
          className="header-icon-btn"
          onClick={() => setShowAddModal(true)}
          title="Agregar cuenta"
        >
          <Plus size={22} className="header-bell-icon" />
        </button>
      </header>

      <div className="accounts-scroll-area">
        <div className="accounts-summary-banner">
          <span className="banner-subtitle">Cuentas vinculadas activas</span>
          <h2 className="banner-total">
            {cuentas.length} Cuentas Familiares
          </h2>
        </div>

        <div className="accounts-cards-list">
          {cuentas.map((cta) => (
            <div key={cta.id} className="bank-account-card">
              <div className="account-card-left">
                <div className="account-icon-wrap">
                  {getAccountIcon(cta.tipo)}
                </div>
                <div className="account-info-col">
                  <h4 className="account-name-txt">{cta.nombre}</h4>
                  <span className="account-type-txt">{cta.tipo}</span>
                </div>
              </div>

              <div className="account-card-right">
                <span className="account-balance-label">Saldo disponible</span>
                <span className="account-balance-val">
                  S/ {parseFloat(cta.saldo_actual || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="account-quick-action-box">
          <button
            type="button"
            className="account-new-tx-btn"
            onClick={onGoToExpense}
          >
            <Wallet size={18} />
            <span>Realizar movimiento con estas cuentas</span>
          </button>
        </div>
      </div>
    </div>
  );
}
