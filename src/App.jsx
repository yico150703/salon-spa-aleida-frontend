import React, { useState, useEffect } from 'react';
import Portal from './components/Portal';
import Dashboard from './components/Dashboard';
import LayerInspectorModal from './components/LayerInspectorModal';
import RequirementsGuideModal from './components/RequirementsGuideModal';
import { api, initialMockState } from './api';

export default function App() {
  const [view, setView] = useState('portal'); // 'portal' | 'admin'
  const [toastMessage, setToastMessage] = useState(null);

  // Didactic Modals
  const [isLayerInspectorOpen, setIsLayerInspectorOpen] = useState(false);
  const [isRequirementsGuideOpen, setIsRequirementsGuideOpen] = useState(false);

  // Global State
  const [citas, setCitas] = useState(initialMockState.citas);
  const [clientes, setClientes] = useState(initialMockState.clientes);
  const [caja, setCaja] = useState(initialMockState.caja);
  const [insumos, setInsumos] = useState(initialMockState.insumos);
  const [catalogo, setCatalogo] = useState(initialMockState.catalogo);
  const [usuarios, setUsuarios] = useState(initialMockState.usuarios);

  useEffect(() => {
    // Sincronización automática con el Backend Flask en Render o local
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

  // RF02: Agendar nueva cita
  const handleAddAppointment = async (newCita) => {
    const citaWithId = { id: citas.length + 1, ...newCita };
    setCitas([citaWithId, ...citas]);
    await api.createCita(newCita);
  };

  // RF03: Reprogramar cita
  const handleReprogramCita = (citaId, nuevaFecha, nuevaHora) => {
    setCitas(citas.map(c => {
      if (c.id === citaId) {
        return { ...c, fecha: nuevaFecha, hora: nuevaHora, estado: 'Confirmada' };
      }
      return c;
    }));
  };

  // RF03: Cancelar cita con motivo
  const handleCancelCita = (citaId, motivo) => {
    setCitas(citas.map(c => {
      if (c.id === citaId) {
        return { ...c, estado: 'Cancelada', motivo_cancelacion: motivo };
      }
      return c;
    }));
  };

  // RF01: Actualizar o guardar cliente
  const handleSaveClient = (updatedClient) => {
    setClientes(clientes.map(cl => cl.dni === updatedClient.dni ? updatedClient : cl));
  };

  const handleAddClient = (newClient) => {
    setClientes([newClient, ...clientes]);
  };

  // RF04, RF05: Procesar venta y cobro
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

    // Actualizar cita a atendida
    setCitas(citas.map(c => {
      if (c.cliente.toLowerCase() === cliente.toLowerCase()) {
        return { ...c, cobrado: true, estado: 'Atendida' };
      }
      return c;
    }));

    await api.processVenta(ventaData);
  };

  // RF06: Anulación de venta con reversión en caja
  const handleProcessAnnulment = async (monto) => {
    const newCaja = { ...caja };
    newCaja.digital = Math.max(0, newCaja.digital - monto);
    setCaja(newCaja);
    await api.processAnulacion({ monto });
  };

  // RF07: Registrar egreso
  const handleExpense = (monto) => {
    const newCaja = { ...caja, egresos: caja.egresos + monto };
    setCaja(newCaja);
  };

  // RF08: Cierre de caja
  const handleCloseCaja = (totalFisico) => {
    const newCaja = { ...caja, arqueo_fisico: totalFisico, estado: 'Cerrada' };
    setCaja(newCaja);
  };

  // RF09: Recepcionar mercadería e incrementar stock
  const handleReceiveStock = (insumoId, cantidad) => {
    setInsumos(insumos.map(ins => {
      if (ins.id === insumoId) {
        const nuevoStock = ins.stock + cantidad;
        return { ...ins, stock: nuevoStock, alerta: nuevoStock <= ins.stock_min };
      }
      return ins;
    }));
    showToast(`[RECEPCION] Ingreso de mercadería: +${cantidad} unidades registradas en inventario.`);
  };

  return (
    <div className="app-root">
      {/* Top Prototype Navigation & Didactic Controls Bar */}
      <header className="prototype-bar">
        <div className="prototype-brand">
          <span className="proto-tag">ARQUITECTURA 4 CAPAS (SEC 3.8)</span>
          <strong>Salon Spa Aleida v2.0</strong>
        </div>

        <div className="view-switcher">
          <button
            className={`switch-btn ${view === 'portal' ? 'active' : ''}`}
            onClick={() => setView('portal')}
          >
            Vista Cliente (Portal & Reservas)
          </button>
          <button
            className={`switch-btn ${view === 'admin' ? 'active' : ''}`}
            onClick={() => setView('admin')}
          >
            Vista Administración (Dashboard 9 CUs)
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn-action primary" 
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            onClick={() => setIsLayerInspectorOpen(true)}
          >
            Inspector de Capas
          </button>
          <button 
            className="btn-action" 
            style={{ background: '#37474F', color: '#ECEFF1', fontSize: '0.78rem', padding: '6px 12px' }}
            onClick={() => setIsRequirementsGuideOpen(true)}
          >
            Guía RF01 - RF12
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
          onAddCita={handleAddAppointment}
          onReprogramCita={handleReprogramCita}
          onCancelCita={handleCancelCita}
          onProcessPayment={handleProcessPayment}
          onAddClient={handleAddClient}
          onSaveClient={handleSaveClient}
          onProcessAnnulment={handleProcessAnnulment}
          onExpense={handleExpense}
          onCloseCaja={handleCloseCaja}
          onReceiveStock={handleReceiveStock}
          onOpenLayerInspector={() => setIsLayerInspectorOpen(true)}
          onOpenRequirementsGuide={() => setIsRequirementsGuideOpen(true)}
          showToast={showToast}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast">
          {toastMessage}
        </div>
      )}

      {/* Modales Didácticos Globales */}
      <LayerInspectorModal 
        isOpen={isLayerInspectorOpen}
        onClose={() => setIsLayerInspectorOpen(false)}
      />

      <RequirementsGuideModal
        isOpen={isRequirementsGuideOpen}
        onClose={() => setIsRequirementsGuideOpen(false)}
        onSelectTab={() => setView('admin')}
      />
    </div>
  );
}
