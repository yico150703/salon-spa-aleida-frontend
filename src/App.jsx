import React, { useState, useEffect } from 'react';
import Portal from './components/Portal';
import Dashboard from './components/Dashboard';
import BookingPage from './components/BookingPage';
import LoginScreen from './components/LoginScreen';
import LandingPage from './components/landing/LandingPage';
import SpecialistMobileApp from './components/SpecialistMobileApp';
import { api, initialMockState } from './api';

export default function App() {
  // DS_CU01: Autenticación
  const [currentUser, setCurrentUser] = useState(null); // null = no autenticado
  const [view, setView] = useState(() => {
    const requested = new URLSearchParams(window.location.search).get('vista');
    if (requested === 'reservar') return 'reservar';
    if (requested === 'admin') return 'admin';
    if (requested === 'movil') return 'movil';
    return 'portal';
  }); // 'portal' | 'reservar' | 'admin' | 'movil'
  const [preselectedService, setPreselectedService] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Estado global — datos del sistema
  const [citas, setCitas] = useState(initialMockState.citas);
  const [clientes, setClientes] = useState(initialMockState.clientes);
  const [caja, setCaja] = useState(initialMockState.caja);
  const [insumos, setInsumos] = useState(initialMockState.insumos);
  const [catalogo, setCatalogo] = useState(initialMockState.catalogo);
  const [usuarios, setUsuarios] = useState(initialMockState.usuarios);
  const [ventas, setVentas] = useState([]);
  const [anulaciones, setAnulaciones] = useState([]);

  // DS_CU07: Estado apertura de caja
  const [cajaAbierta, setCajaAbierta] = useState(false);

  useEffect(() => {
    api.getCitas().then(data => { if (data && data.length) setCitas(data); });
    api.getClientes().then(data => { if (data && data.length) setClientes(data); });
    api.getCaja().then(data => { 
      if (data) {
        setCaja(data);
        if (data.estado === 'Abierta') setCajaAbierta(true);
      }
    });
    api.getVentas().then(data => { if (data && data.length) setVentas(data); });
    api.getAnulaciones().then(data => { if (data && data.length) setAnulaciones(data); });
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // DS_CU01: Login handler
  const handleLogin = (user) => {
    // Guardar originalRol para control estricto de RBAC
    const userWithOriginal = { ...user, originalRol: user.rol };
    setCurrentUser(userWithOriginal);
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
  const handleAddClient = async (newClient) => {
    setClientes(prev => [newClient, ...prev]);
    await api.createCliente(newClient);
    const clientesActualizados = await api.getClientes();
    if (clientesActualizados && clientesActualizados.length) setClientes(clientesActualizados);
  };

  const handleSaveClient = (updatedClient) => {
    setClientes(clientes.map(cl => cl.dni === updatedClient.dni ? updatedClient : cl));
  };

  // DS_CU04: Agendar cita — retorna el resultado del API para que BookingPage muestre conflictos
  const handleAddAppointment = async (newCita) => {
    const result = await api.createCita(newCita);
    if (result && result.success === false) {
      // Conflicto detectado — NO agregar localmente, retornar el error
      return result;
    }
    const citaWithId = result?.cita || { id: Date.now(), ...newCita };
    setCitas(prev => [citaWithId, ...prev]);
    // Sincronizar citas y clientes actualizados desde la base de datos
    const [citasActualizadas, clientesActualizados] = await Promise.all([
      api.getCitas(),
      api.getClientes()
    ]);
    if (citasActualizadas && citasActualizadas.length) setCitas(citasActualizadas);
    if (clientesActualizados && clientesActualizados.length) setClientes(clientesActualizados);
    return { success: true };
  };

  // DS_CU05: Reprogramar cita
  const handleReprogramCita = async (citaId, nuevaFecha, nuevaHora) => {
    setCitas(citas.map(c =>
      c.id === citaId ? { ...c, fecha: nuevaFecha, hora: nuevaHora, estado: 'Confirmada' } : c
    ));
    // Persistir en PostgreSQL via API REST
    await api.reprogramarCita(citaId, nuevaFecha, nuevaHora);
  };

  const handleCancelCita = async (citaId, motivo) => {
    // Actualizar estado local inmediatamente (optimistic update)
    setCitas(citas.map(c =>
      c.id === citaId ? { ...c, estado: 'Cancelada', motivo_cancelacion: motivo } : c
    ));
    // Persistir en PostgreSQL via API REST
    await api.updateCitaEstado(citaId, 'Cancelada', motivo);
  };

  const handleUpdateCitaEstado = async (citaId, nuevoEstado) => {
    // Actualizar estado local inmediatamente (optimistic update)
    setCitas(citas.map(c =>
      c.id === citaId ? { ...c, estado: nuevoEstado } : c
    ));
    // Persistir en PostgreSQL via API REST
    await api.updateCitaEstado(citaId, nuevoEstado);
  };

  // DS_CU06: Registrar servicio en catálogo
  const handleAddServicio = (servicio) => {
    setCatalogo(prev => [...prev, servicio]);
  };

  // DS_CU07: Aperturar turno de caja (Persistencia total en PostgreSQL)
  const handleAperturaCaja = async (aperturaData) => {
    const saldo = parseFloat(aperturaData.saldo_inicial) || 0;
    const turno = aperturaData.turno || aperturaData.numero_turno || 'Turno Mañana';
    const responsable = aperturaData.responsable || currentUser?.nombre || 'Personal de Caja';

    // 1. Actualización optimista
    setCajaAbierta(true);
    setCaja(prev => ({
      ...prev,
      apertura: saldo,
      efectivo: 0,
      digital: 0,
      egresos: 0,
      saldo_teorico: saldo,
      total_teorico: saldo,
      estado: 'Abierta',
      turno,
      responsable
    }));

    try {
      const res = await api.aperturarCaja({
        saldo_inicial: saldo,
        monto: saldo,
        monto_inicial: saldo,
        responsable,
        turno,
        observaciones: aperturaData.observaciones || 'Apertura de turno'
      });
      const cajaActual = await api.getCaja();
      if (cajaActual) setCaja(cajaActual);
      showToast(`[APERTURA] Turno ${turno} aperturado en Base de Datos. Fondo: S/ ${saldo.toFixed(2)}`);
      return res;
    } catch (err) {
      console.error('Error al registrar apertura en backend:', err);
      showToast('[ERROR] No se pudo persistir la apertura en base de datos.');
    }
  };

  // DS_CU08: Procesar venta y cobro (Sincronización total de Caja y Ventas)
  const handleProcessPayment = async (ventaData) => {
    const { cliente, monto, medio_pago } = ventaData;
    const numMonto = parseFloat(monto) || 0;

    // 1. Actualización optimista de caja para reflejo visual inmediato
    setCaja(prev => {
      const nuevoEfectivo = medio_pago === 'Efectivo' ? prev.efectivo + numMonto : prev.efectivo;
      const nuevoDigital = medio_pago !== 'Efectivo' ? prev.digital + numMonto : prev.digital;
      const nuevoTotal = (prev.apertura || 0) + nuevoEfectivo + nuevoDigital - (prev.egresos || 0);
      return {
        ...prev,
        efectivo: nuevoEfectivo,
        digital: nuevoDigital,
        total_teorico: nuevoTotal,
        saldo_teorico: nuevoTotal
      };
    });

    // 2. Marcar cita como atendida y cobrada
    setCitas(prevCitas => prevCitas.map(c =>
      c.cliente.toLowerCase() === cliente.toLowerCase()
        ? { ...c, cobrado: true, estado: 'Atendida' } : c
    ));

    // 3. Enviar a PostgreSQL en backend
    try {
      await api.processVenta(ventaData);
      // 4. Traer balance consolidado de caja, ventas, citas y clientes
      const [cajaActualizada, citasActualizadas, clientesActualizados, ventasActualizadas] = await Promise.all([
        api.getCaja(),
        api.getCitas(),
        api.getClientes(),
        api.getVentas()
      ]);
      if (cajaActualizada) setCaja(cajaActualizada);
      if (citasActualizadas && citasActualizadas.length) setCitas(citasActualizadas);
      if (clientesActualizados && clientesActualizados.length) setClientes(clientesActualizados);
      if (ventasActualizadas && ventasActualizadas.length) setVentas(ventasActualizadas);
    } catch (err) {
      console.error('Error sincronizando venta con backend:', err);
    }
  };

  // DS_CU09: Anular venta con nota de crédito (Persistencia total en PostgreSQL)
  const handleProcessAnnulment = async (anulacionPayload) => {
    // Si recibe solo un número por compatibilidad anterior
    const data = typeof anulacionPayload === 'object' ? anulacionPayload : { monto: anulacionPayload };
    const numMonto = parseFloat(data.monto) || 0;
    const medio = data.medio_pago || 'Digital';

    // 1. Actualización optimista en caja
    setCaja(prev => {
      const nuevoEfectivo = medio === 'Efectivo' ? Math.max(0, prev.efectivo - numMonto) : prev.efectivo;
      const nuevoDigital = medio !== 'Efectivo' ? Math.max(0, prev.digital - numMonto) : prev.digital;
      const total = (prev.apertura || 0) + nuevoEfectivo + nuevoDigital - (prev.egresos || 0);
      return { ...prev, efectivo: nuevoEfectivo, digital: nuevoDigital, total_teorico: total, saldo_teorico: total };
    });

    try {
      const res = await api.processAnulacion({
        boleta: data.boleta || 'B001-0004820',
        pin: data.pin || '1234',
        motivo: data.motivo || 'Error en digitación de importe',
        monto: numMonto,
        cliente: data.cliente || 'Cliente General',
        medio_pago: medio,
        autorizado_por: currentUser?.nombre ? `${currentUser.nombre} (${currentUser.rol})` : 'Aleida Mendoza (Gerente General)'
      });

      if (res && res.error) {
        showToast(`[ERROR] ${res.error}`);
        return res;
      }

      // Sincronizar estado global desde base de datos
      const [cajaActual, anulacionesActuales, ventasActuales, citasActuales] = await Promise.all([
        api.getCaja(),
        api.getAnulaciones(),
        api.getVentas(),
        api.getCitas()
      ]);
      if (cajaActual) setCaja(cajaActual);
      if (anulacionesActuales) setAnulaciones(anulacionesActuales);
      if (ventasActuales) setVentas(ventasActuales);
      if (citasActuales) setCitas(citasActuales);

      showToast(`[ANULACIÓN] Reversión contable aplicada y registrada en Base de Datos.`);
      return res;
    } catch (err) {
      console.error('Error procesando anulación:', err);
      showToast('[ERROR] Ocurrió un error al comunicar la anulación con el servidor.');
    }
  };

  // DS_CU10: Registrar egreso
  const handleExpense = async (monto, motivo) => {
    const numMonto = parseFloat(monto) || 0;
    setCaja(prev => {
      const egresos = prev.egresos + numMonto;
      const total = (prev.apertura || 0) + prev.efectivo + prev.digital - egresos;
      return { ...prev, egresos, total_teorico: total, saldo_teorico: total };
    });
    try {
      await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/caja/egreso`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monto: numMonto, motivo: motivo || 'Egreso de caja' })
      });
      const cajaActual = await api.getCaja();
      if (cajaActual) setCaja(cajaActual);
    } catch (_) {}
  };

  // DS_CU10: Arqueo y cierre de caja (Persistencia total en PostgreSQL + Reporte Z)
  const handleCloseCaja = async (totalFisico, diferencia, responsable) => {
    const numFisico = parseFloat(totalFisico) || 0;
    const numDif = parseFloat(diferencia) || 0;
    const resp = responsable || currentUser?.nombre || 'Personal de Mostrador';

    // 1. Actualización optimista
    setCaja(prev => ({ ...prev, arqueo_fisico: numFisico, diferencia: numDif, estado: 'Cerrada' }));
    setCajaAbierta(false);

    try {
      const res = await api.cerrarCaja({
        conteo_fisico: numFisico,
        responsable: resp
      });
      const cajaActual = await api.getCaja();
      if (cajaActual) setCaja(cajaActual);
      showToast(`[CIERRE] Arqueo completado y cerrado en Base de Datos. Reporte Z emitido.`);
      return res;
    } catch (err) {
      console.error('Error cerrando caja en backend:', err);
      showToast('[ERROR] No se pudo guardar el cierre en base de datos.');
    }
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
        <LoginScreen onLogin={handleLogin} onBackToHome={() => setView('portal')} />
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
            <button className="user-session-bar__btn" onClick={() => setView('movil')} id="btn-ir-movil" style={{ background: '#1B3D2B', color: '#D4AF37', border: '1px solid #D4AF37' }}>
              App Móvil Especialista
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
        <LandingPage
          onAddAppointment={handleAddAppointment}
          onSwitchToAdmin={() => setView('admin')}
          onSwitchToMovil={() => setView('movil')}
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
          onSwitchToMovil={() => setView('movil')}
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
          ventas={ventas}
          anulaciones={anulaciones}
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
          onSwitchToPortal={() => setView('portal')}
          onSwitchToBooking={() => setView('reservar')}
          onSwitchToMovil={() => setView('movil')}
          onChangeRole={(newRol) => {
            // Regla estricta RBAC: Solo el Administrador puede alternar roles de prueba
            const esAdmin = currentUser?.originalRol?.toLowerCase().includes('admin') ||
                            currentUser?.rol?.toLowerCase().includes('admin');
            if (!esAdmin) {
              showToast('Acceso denegado: Solo el Administrador tiene autorización para cambiar de rol.');
              return;
            }
            setCurrentUser(prev => ({ ...prev, rol: newRol, originalRol: prev?.originalRol || prev?.rol }));
            showToast(`Vista de rol cambiada a: ${newRol}`);
          }}
          onRefreshClientes={async () => {
            const data = await api.getClientes();
            if (data && data.length) {
              setClientes(data);
              showToast(`Padrón sincronizado (${data.length} clientes en base de datos).`);
            }
          }}
          onRefreshCaja={async () => {
            const data = await api.getCaja();
            if (data) {
              setCaja(data);
              showToast(`Caja de turno sincronizada: S/ ${((data.apertura || 0) + (data.efectivo || 0) + (data.digital || 0) - (data.egresos || 0)).toFixed(2)}`);
            }
          }}
          onRefreshAnulaciones={async () => {
            const data = await api.getAnulaciones();
            if (data) {
              setAnulaciones(data);
              showToast(`Libro de Notas de Crédito sincronizado (${data.length} registros).`);
            }
          }}
          showToast={showToast}
        />
      )}

      {view === 'movil' && (
        <SpecialistMobileApp
          citas={citas}
          onUpdateCitaEstado={handleUpdateCitaEstado}
          onSwitchToPortal={() => setView('portal')}
          onSwitchToAdmin={() => setView('admin')}
          onSwitchToBooking={() => setView('reservar')}
          showToast={showToast}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && <div className="toast">{toastMessage}</div>}
    </div>
  );
}
