import React, { useState, useEffect } from 'react';
import { api } from './api';
import MarcoCelular from './components/MarcoCelular';
import VistaLogin from './components/VistaLogin';
import VistaRegistro from './components/VistaRegistro';
import VistaIngresoMonto from './components/VistaIngresoMonto';
import VistaResumen from './components/VistaResumen';
import VistaPerfil from './components/VistaPerfil';
import VistaCuentas from './components/VistaCuentas';
import NavegacionInferior from './components/NavegacionInferior';
import './App.css';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Vistas: 'login' | 'register' | 'expense' | 'summary' | 'profile' | 'accounts'
  const [currentView, setCurrentView] = useState('login');
  const [usuario, setUsuario] = useState(null);
  const [cuentas, setCuentas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  // Cargar datos iniciales y comprobar conectividad con backend
  const loadAppData = async () => {
    try {
      const [backendOk, fetchedCuentas, fetchedCategorias, fetchedMovimientos, fetchedResumen] =
        await Promise.all([
          api.checkBackend(),
          api.getCuentas(),
          api.getCategorias(),
          api.getMovimientos(),
          api.getResumen()
        ]);

      setIsBackendConnected(backendOk);
      setCuentas(fetchedCuentas || []);
      setCategorias(fetchedCategorias || []);
      setMovimientos(fetchedMovimientos || []);
      setResumen(fetchedResumen || null);
    } catch (err) {
      console.error('Error cargando datos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppData();
  }, []);

  // Manejo de Inicio de Sesión
  const handleLogin = async (email, password) => {
    const res = await api.login(email, password);
    setUsuario(res.usuario);
    setIsAuthenticated(true);
    // Flujo indicado por el usuario: logeo >> ingresos un gastos >> escoger una cuenta >> categoría >> monto y registro >> resumen
    setCurrentView('expense');
    await loadAppData();
  };

  // Manejo de Registro de Nuevo Usuario
  const handleRegister = async (userData) => {
    const res = await api.register(userData);
    setUsuario(res.usuario);
    setIsAuthenticated(true);
    setCurrentView('expense');
    await loadAppData();
  };

  // Manejo de Registro de Movimiento
  const handleSaveMovimiento = async (movimientoData) => {
    await api.createMovimiento(movimientoData);
    await loadAppData();
    // Redirigir a la vista de Resumen para ver el nuevo gasto registrado en el historial
    setCurrentView('summary');
  };

  // Manejo de Eliminación de Movimiento (CRUD completo)
  const handleDeleteMovimiento = async (id) => {
    await api.deleteMovimiento(id);
    await loadAppData();
  };

  // Cerrar Sesión
  const handleLogout = () => {
    setIsAuthenticated(false);
    setUsuario(null);
    setCurrentView('login');
  };

  return (
    <MarcoCelular isBackendConnected={isBackendConnected} currentView={currentView}>
      <div className="mobile-app-root">
        {/* Renderizado condicional de vistas */}
        {currentView === 'login' ? (
          <VistaLogin
            onLoginSuccess={handleLogin}
            onGoToRegister={() => setCurrentView('register')}
          />
        ) : currentView === 'register' ? (
          <VistaRegistro
            onRegisterSuccess={handleRegister}
            onGoToLogin={() => setCurrentView('login')}
          />
        ) : (
          <div className="authenticated-layout">
            <div className="app-main-content">
              {currentView === 'expense' && (
                <VistaIngresoMonto
                  usuario={usuario}
                  cuentas={cuentas}
                  categorias={categorias}
                  onSaveMovimiento={handleSaveMovimiento}
                  onOpenProfile={() => setCurrentView('profile')}
                />
              )}

              {currentView === 'summary' && (
                <VistaResumen
                  resumen={resumen}
                  movimientos={movimientos}
                  cuentas={cuentas}
                  onDeleteMovimiento={handleDeleteMovimiento}
                  onGoToExpense={() => setCurrentView('expense')}
                  onRefresh={loadAppData}
                />
              )}

              {currentView === 'profile' && (
                <VistaPerfil
                  usuario={usuario}
                  onLogout={handleLogout}
                />
              )}

              {currentView === 'accounts' && (
                <VistaCuentas
                  cuentas={cuentas}
                  onRefresh={loadAppData}
                  onGoToExpense={() => setCurrentView('expense')}
                />
              )}
            </div>

            {/* Barra de Navegación Inferior (Visible en todas las vistas autenticadas) */}
            <NavegacionInferior
              currentView={currentView}
              setView={setCurrentView}
            />
          </div>
        )}
      </div>
    </MarcoCelular>
  );
}
