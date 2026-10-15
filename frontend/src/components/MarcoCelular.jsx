import React, { useState, useEffect } from 'react';
import { Smartphone, Maximize2, Minimize2, Wifi, Battery, Server, CheckCircle2 } from 'lucide-react';

export default function MarcoCelular({ children, isBackendConnected, currentView }) {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentTime, setCurrentTime] = useState('3:05');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`app-viewport-wrapper ${isFullScreen ? 'mode-fullscreen' : 'mode-framed'}`}>
      {/* Dispositivo Móvil */}
      <div className={`mobile-device-chassis ${isFullScreen ? 'device-expanded' : ''}`}>
        {/* Barra de Estado del Celular (Status Bar) */}
        <div className="mobile-status-bar">
          <div className="status-time">{currentTime}</div>
          <div className="dynamic-island-notch">
            <span className="notch-camera"></span>
            <span className="notch-sensor"></span>
          </div>
          <div className="status-icons">
            <span className="network-5g">5G</span>
            <Wifi size={14} className="status-icon" />
            <div className="battery-indicator">
              <span className="battery-level"></span>
            </div>
          </div>
        </div>

        {/* Pantalla Interna del Celular */}
        <main className="mobile-screen-viewport">
          {children}
        </main>

        {/* Barra inferior de gestos (Home indicator) */}
        <div className="mobile-home-indicator-bar">
          <div className="indicator-pill"></div>
        </div>
      </div>
    </div>
  );
}
