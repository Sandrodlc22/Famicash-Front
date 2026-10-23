import React from 'react';
import { LayoutGrid, Plus, CreditCard, User } from 'lucide-react';

export default function NavegacionInferior({ currentView, setView, vistasPermitidas = ['summary', 'expense', 'accounts', 'profile'] }) {
  const allowed = Array.isArray(vistasPermitidas) && vistasPermitidas.length > 0
    ? vistasPermitidas
    : ['summary', 'expense', 'accounts', 'profile'];

  return (
    <nav className="bottom-nav-container">
      {/* 1. Resumen */}
      {allowed.includes('summary') && (
        <button
          type="button"
          className={`nav-tab-btn ${currentView === 'summary' ? 'active' : ''}`}
          onClick={() => setView('summary')}
        >
          <LayoutGrid size={22} className="nav-icon" />
          <span className="nav-label">Resumen</span>
        </button>
      )}

      {/* 2. Gastos (FAB Central Verde Agua) */}
      {allowed.includes('expense') && (
        <button
          type="button"
          className={`nav-fab-btn ${currentView === 'expense' ? 'active' : ''}`}
          onClick={() => setView('expense')}
          title="Registrar nuevo gasto o ingreso"
        >
          <div className="fab-inner">
            <Plus size={24} strokeWidth={2.5} />
          </div>
          <span className="nav-label">Gastos</span>
        </button>
      )}

      {/* 3. Cuentas / Línea */}
      {allowed.includes('accounts') && (
        <button
          type="button"
          className={`nav-tab-btn ${currentView === 'accounts' ? 'active' : ''}`}
          onClick={() => setView('accounts')}
        >
          <CreditCard size={22} className="nav-icon" />
          <span className="nav-label">Línea</span>
        </button>
      )}

      {/* 4. Perfil */}
      {allowed.includes('profile') && (
        <button
          type="button"
          className={`nav-tab-btn ${currentView === 'profile' ? 'active' : ''}`}
          onClick={() => setView('profile')}
        >
          <User size={22} className="nav-icon" />
          <span className="nav-label">Perfil</span>
        </button>
      )}
    </nav>
  );
}
