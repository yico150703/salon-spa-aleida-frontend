import React, { useState, useEffect } from 'react';
import Portal from './components/Portal';
import Dashboard from './components/Dashboard';
import { api, initialMockState } from './api';

export default function App() {
  const [view, setView] = useState('portal'); // 'portal' | 'admin'
  const [toastMessage, setToastMessage] = useState(null);

  const [citas, setCitas] = useState(initialMockState.citas);
  const [clientes, setClientes] = useState(initialMockState.clientes);
  const [caja, setCaja] = useState(initialMockState.caja);
  const [insumos, setInsumos] = useState(initialMockState.insumos);
  const [catalogo, setCatalogo] = useState(initialMockState.catalogo);
  const [usuarios, setUsuarios] = useState(initialMockState.usuarios);

  useEffect(() => {
    // Intentar sincronizar con backend Flask si está activo
    api.getCitas().then(data => {
      if (data && data.length) setCitas(data);
    });
    api.getCaja().then(data => {
      if (data && data.total_teorico) setCaja(data);
    });
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  const handleAddAppointment = async (newCita) => {
    const citaWithId = { id: citas.length + 1, ...newCita };
    setCitas([citaWithId, ...citas]);
    await api.createCita(newCita);
  };

  const handleProcessPayment = async (ventaData) => {
    const { cliente, monto, medio_pago } = ventaData;
    
    // Actualizar caja
    const newCaja = { ...caja };
    if (medio_pago === 'Efectivo') {
      newCaja.efectivo += monto;
    } else {
      newCaja.digital += monto;
    }
    setCaja(newCaja);

    // Marcar cita atendida
    setCitas(citas.map(c => {
      if (c.cliente.toLowerCase() === cliente.toLowerCase()) {
        return { ...c, cobrado: true, estado: 'Atendida' };
      }
      return c;
    }));

    await api.processVenta(ventaData);
  };

  const handleProcessAnnulment = async (monto) => {
    const newCaja = { ...caja };
    newCaja.digital = Math.max(0, newCaja.digital - monto);
    setCaja(newCaja);
    await api.processAnulacion({ monto });
  };

  const handleAddClient = (newClient) => {
    setClientes([newClient, ...clientes]);
  };

  const handleExpense = (monto) => {
    const newCaja = { ...caja, egresos: caja.egresos + monto };
    setCaja(newCaja);
  };

  const handleCloseCaja = () => {
    // Reset or balance acknowledgment
  };

  return (
    <div className="app-root">
      {/* Top Prototype Switcher Bar */}
      <header className="prototype-bar">
        <div className="prototype-brand">
          <span className="proto-tag">REACT + FLASK</span>
          <strong>Salon Spa Aleida v2.0</strong>
        </div>
        <div className="view-switcher">
          <button
            className={`switch-btn ${view === 'portal' ? 'active' : ''}`}
            onClick={() => setView('portal')}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0m3.5 7.5a.5.5 0 0 1 0 1H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5z"/>
            </svg>
            Vista Cliente (Portal & Reservas)
          </button>
          <button
            className={`switch-btn ${view === 'admin' ? 'active' : ''}`}
            onClick={() => setView('admin')}
          >
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5z"/>
            </svg>
            Vista Administración (Dashboard 9 CUs)
          </button>
        </div>
      </header>

      {/* Main Views */}
      {view === 'portal' ? (
        <Portal
          onAddAppointment={handleAddAppointment}
          onSwitchToAdmin={() => setView('admin')}
          showToast={showToast}
        />
      ) : (
        <Dashboard
          citas={citas}
          clientes={clientes}
          caja={caja}
          insumos={insumos}
          catalogo={catalogo}
          usuarios={usuarios}
          onChargeAppointment={() => setView('admin')}
          onProcessPayment={handleProcessPayment}
          onAddClient={handleAddClient}
          onProcessAnnulment={handleProcessAnnulment}
          onExpense={handleExpense}
          onCloseCaja={handleCloseCaja}
          showToast={showToast}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
