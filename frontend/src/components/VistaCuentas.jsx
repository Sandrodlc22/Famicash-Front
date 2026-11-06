import React from 'react';
import { CreditCard, Plus, ArrowUpRight, Shield, Wallet, Building2, Banknote, Bell } from 'lucide-react';
import Swal from 'sweetalert2';
import logoFamicash from '../assets/logo-famicash.png';
import { swalMobile, mostrarCentroNotificaciones, mostrarToastExito } from '../utils/notificaciones';

export default function VistaCuentas({ cuentas, onRefresh, onGoToExpense }) {
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

  const handleVerDetallesCuenta = (cta) => {
    swalMobile.fire({
      icon: 'info',
      title: cta.nombre,
      html: `
        <div style="text-align: left; font-size: 13px; color: #475569; line-height: 1.6;">
          <p><strong>Tipo:</strong> ${cta.tipo}</p>
          <p><strong>Saldo disponible:</strong> <span style="color:#006241; font-weight:800; font-size:15px;">S/ ${parseFloat(cta.saldo_actual || 0).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span></p>
          <p><strong>Estado:</strong> <span style="color:#10b981; font-weight:600;">● Conectada y activa</span></p>
          <p style="font-size:11.5px; color:#94a3b8; margin-top:8px;">Las transferencias y gastos asociados a esta cuenta se reflejan en tiempo real en el presupuesto del hogar.</p>
        </div>
      `,
      confirmButtonText: 'Cerrar'
    });
  };

  const handleCrearNuevaCuenta = async () => {
    const { value: formValues } = await swalMobile.fire({
      title: 'Vincular Nueva Cuenta',
      html: `
        <div style="text-align:left; display:flex; flex-direction:column; gap:10px; margin-top:6px;">
          <div>
            <label style="font-size:12px; font-weight:600; color:#334155;">Nombre de la cuenta:</label>
            <input id="swal-input-acc-name" class="swal2-input" placeholder="Ej: Scotiabank Sueldo" style="width:100%; height:38px; margin:4px 0 0 0; font-size:13px; border-radius:10px;" />
          </div>
          <div>
            <label style="font-size:12px; font-weight:600; color:#334155;">Tipo:</label>
            <select id="swal-input-acc-type" class="swal2-input" style="width:100%; height:38px; margin:4px 0 0 0; font-size:13px; border-radius:10px;">
              <option value="Ahorros">Ahorros</option>
              <option value="Tarjeta Débito">Tarjeta Débito</option>
              <option value="Tarjeta Crédito">Tarjeta Crédito</option>
              <option value="Efectivo">Billetera / Efectivo</option>
            </select>
          </div>
          <div>
            <label style="font-size:12px; font-weight:600; color:#334155;">Saldo Inicial (S/):</label>
            <input id="swal-input-acc-balance" type="number" step="0.01" class="swal2-input" placeholder="0.00" style="width:100%; height:38px; margin:4px 0 0 0; font-size:13px; border-radius:10px;" />
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Vincular Cuenta',
      cancelButtonText: 'Cancelar',
      preConfirm: () => {
        const name = document.getElementById('swal-input-acc-name').value;
        const type = document.getElementById('swal-input-acc-type').value;
        const balance = document.getElementById('swal-input-acc-balance').value;
        if (!name.trim()) {
          Swal.showValidationMessage('Por favor ingresa un nombre para la cuenta');
          return false;
        }
        return { name, type, balance: parseFloat(balance || 0) };
      }
    });

    if (formValues) {
      mostrarToastExito('¡Cuenta vinculada con éxito!');
      if (onRefresh) onRefresh();
    }
  };

  return (
    <div className="accounts-view-wrapper">
      <header className="mobile-app-header">
        <button
          type="button"
          className="header-icon-btn"
          onClick={handleCrearNuevaCuenta}
          title="Agregar nueva cuenta"
        >
          <Plus size={22} className="header-bell-icon" />
        </button>
        <div className="header-logo-container">
          <img src={logoFamicash} alt="FamiCash" className="header-famicash-logo" />
        </div>
        <button
          type="button"
          className="header-icon-btn"
          onClick={() => mostrarCentroNotificaciones()}
          title="Ver Notificaciones"
        >
          <Bell size={22} className="header-bell-icon" />
          <span className="bell-badge-dot"></span>
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
            <div
              key={cta.id}
              className="bank-account-card"
              onClick={() => handleVerDetallesCuenta(cta)}
              style={{ cursor: 'pointer' }}
              title="Toca para ver detalles de la cuenta"
            >
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
