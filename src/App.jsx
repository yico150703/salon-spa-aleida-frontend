import React, { useState, useEffect } from 'react';
import Portal from './components/Portal';
import Dashboard from './components/Dashboard';
import BookingPage from './components/BookingPage';
import LoginScreen from './components/LoginScreen';
import LayerInspectorModal from './components/LayerInspectorModal';
import RequirementsGuideModal from './components/RequirementsGuideModal';
import { api, initialMockState } from './api';

export default function App() {
  // DS_CU01: Autenticación
  const [currentUser, setCurrentUser] = useState(null); // null = no autenticado
  const [view, setView] = useState('portal'); // 'portal' | 'reservar' | 'admin'
  const [preselectedService, setPreselectedService] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Modales didácticos
  const [isLayerInspectorOpen, setIsLayerInspectorOpen] = useState(false);
  const [isRequirementsGuideOpen, setIsRequirementsGuideOpen] = useState(false);

  // Estado global — datos del sistema
  const [citas, setCitas] = useState(initialMockState.citas);
  const [clientes, setClientes] = useState(initialMockState.clientes);
  const [caja, setCaja] = useState(initialMockState.caja);
  const [insumos, setInsumos] = useState(initialMockState.insumos);
  const [catalogo, setCatalogo] = useState(initialMockState.catalogo);
  const [usuarios, setUsuarios] = useState(initialMockState.usuarios);

  // DS_CU07: Estado apertura de caja
  const [cajaAbierta, setCajaAbierta] = useState(false);

  useEffect(() => {
    api.getCitas().then(data => { if (data && data.length) setCitas(data); });
    api.getCaja().then(data => { if (data && data.total_teorico) setCaja(data); });
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // DS_CU01: Login handler
  const handleLogin = (user) => {
    setCurrentUser(user);
    showToast(`Bienvenido, ${user.nombre} · ${user.rol}`);
    // Redirigir según rol
    if (user.permisos.includes('agenda') || user.permisos.includes('caja')) {
      setView('admin');
    }
  };

  // DS_CU01: Logout handler
  const handleLogout = () => {
    setCurrentUser(null);
    setView('portal');
    setCajaAbierta(false);
    showToast('Sesión cerrada correctamente.');
  };

  // DS_CU02: Agregar personal
  const handleAddPersonal = (personal) => {
    setUsuarios(prev => [personal, ...prev]);
  };

  // DS_CU03: Registrar cliente
  const handleAddClient = (newClient) => {
    setClientes(prev => [newClient, ...prev]);
  };

  const handleSaveClient = (updatedClient) => {
    setClientes(clientes.map(cl => cl.dni === updatedClient.dni ? updatedClient : cl));
  };

  // DS_CU04: Agendar cita
  const handleAddAppointment = async (newCita) => {
    const citaWithId = { id: citas.length + 1, ...newCita };
    setCitas(prev => [citaWithId, ...prev]);
    await api.createCita(newCita);
  };

  // DS_CU05: Reprogramar cita
  const handleReprogramCita = (citaId, nuevaFecha, nuevaHora) => {
    setCitas(citas.map(c =>
      c.id === citaId ? { ...c, fecha: nuevaFecha, hora: nuevaHora, estado: 'Confirmada' } : c
    ));
  };

  const handleCancelCita = (citaId, motivo) => {
    setCitas(citas.map(c =>
      c.id === citaId ? { ...c, estado: 'Cancelada', motivo_cancelacion: motivo } : c
    ));
  };

  // DS_CU06: Registrar servicio en catálogo
  const handleAddServicio = (servicio) => {
    setCatalogo(prev => [...prev, servicio]);
  };

  // DS_CU07: Aperturar turno de caja
  const handleAperturaCaja = (aperturaData) => {
    setCajaAbierta(true);
    setCaja(prev => ({ ...prev, apertura: aperturaData.saldo_inicial, estado: 'Abierta' }));
  };

  // DS_CU08: Procesar venta y cobro
  const handleProcessPayment = async (ventaData) => {
    const { cliente, monto, medio_pago } = ventaData;
    const newCaja = { ...caja };
    if (medio_pago === 'Efectivo') newCaja.efectivo += monto;
    else newCaja.digital += monto;
    setCaja(newCaja);
    setCitas(citas.map(c =>
      c.cliente.toLowerCase() === cliente.toLowerCase()
        ? { ...c, cobrado: true, estado: 'Atendida' } : c
    ));
    await api.processVenta(ventaData);
  };

  // DS_CU09: Anular venta con nota de crédito
  const handleProcessAnnulment = async (monto) => {
    const newCaja = { ...caja, digital: Math.max(0, caja.digital - monto) };
    setCaja(newCaja);
    await api.processAnulacion({ monto });
  };

  // DS_CU10: Registrar egreso
  const handleExpense = (monto) => {
    setCaja(prev => ({ ...prev, egresos: prev.egresos + monto }));
  };

  // DS_CU10: Arqueo y cierre de caja
  const handleCloseCaja = (totalFisico) => {
    setCaja(prev => ({ ...prev, arqueo_fisico: totalFisico, estado: 'Cerrada' }));
    setCajaAbierta(false);
  };

  const handleReceiveStock = (insumoId, cantidad) => {
    setInsumos(insumos.map(ins => {
      if (ins.id === insumoId) {
        const nuevoStock = ins.stock + cantidad;
        return { ...ins, stock: nuevoStock, alerta: nuevoStock <= ins.stock_min };
      }
      return ins;
    }));
    showToast(`[RECEPCION] +${cantidad} unidades registradas en inventario.`);
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────

  // DS_CU01: Mostrar login si no está autenticado y está en vista admin
  if (!currentUser && view === 'admin') {
    return (
      <div className="app-root">
        <LoginScreen onLogin={handleLogin} />
        {toastMessage && <div className="toast">{toastMessage}</div>}
      </div>
    );
  }

  return (
    <div className="app-root">
      {/* Barra de usuario autenticado */}
      {currentUser && (
        <div className="user-session-bar">
          <div className="user-session-bar__info">
            <span className="user-session-bar__name">{currentUser.nombre}</span>
            <span className={`user-session-bar__rol rol-badge rol-badge--${currentUser.rol.toLowerCase().split(' ')[0]}`}>
              {currentUser.rol}
            </span>
          </div>
          <div className="user-session-bar__actions">
            <button className="user-session-bar__btn" onClick={() => setView('portal')} id="btn-ir-portal">
              Portal Web
            </button>
            <button className="user-session-bar__btn" onClick={() => setView('reservar')} id="btn-ir-reservar">
              Página Reservar Cita
            </button>
            {view !== 'admin' && (
              <button className="user-session-bar__btn" onClick={() => setView('admin')} id="btn-ir-admin">
                Panel Administrativo
              </button>
            )}
            <button className="user-session-bar__btn user-session-bar__btn--logout"
              onClick={handleLogout} id="btn-logout">
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}

      {/* Vistas principales */}
      {view === 'portal' && (
        <Portal
          onAddAppointment={handleAddAppointment}
          onSwitchToAdmin={() => setView('admin')}
          onNavigateToBooking={(service = null) => {
            setPreselectedService(service);
            setView('reservar');
          }}
          showToast={showToast}
          existingCitas={citas}
          currentUser={currentUser}
          onLogin={handleLogin}
        />
      )}

      {view === 'reservar' && (
        <BookingPage
          onAddAppointment={handleAddAppointment}
          onBackToHome={() => setView('portal')}
          onSwitchToAdmin={() => setView('admin')}
          showToast={showToast}
          existingCitas={citas}
          preselectedService={preselectedService}
        />
      )}

      {view === 'admin' && (
        <Dashboard
          citas={citas}
          clientes={clientes}
          caja={caja}
          insumos={insumos}
          catalogo={catalogo}
          usuarios={usuarios}
          currentUser={currentUser}
          cajaAbierta={cajaAbierta}
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
          onAddPersonal={handleAddPersonal}
          onAddServicio={handleAddServicio}
          onAperturaCaja={handleAperturaCaja}
          onOpenLayerInspector={() => setIsLayerInspectorOpen(true)}
          onOpenRequirementsGuide={() => setIsRequirementsGuideOpen(true)}
          onSwitchToPortal={() => setView('portal')}
          onSwitchToBooking={() => setView('reservar')}
          onChangeRole={(newRol) => {
            setCurrentUser(prev => ({ ...prev, rol: newRol }));
            showToast(`Rol cambiado a: ${newRol}`);
          }}
          showToast={showToast}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && <div className="toast">{toastMessage}</div>}

      {/* Modales didácticos */}
      <LayerInspectorModal isOpen={isLayerInspectorOpen} onClose={() => setIsLayerInspectorOpen(false)} />
      <RequirementsGuideModal
        isOpen={isRequirementsGuideOpen}
        onClose={() => setIsRequirementsGuideOpen(false)}
        onSelectTab={() => setView('admin')}
      />
    </div>
  );
}
