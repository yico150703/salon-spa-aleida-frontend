import React, { useState, useEffect } from 'react';
import Portal from './components/Portal';
import Dashboard from './components/Dashboard';
import BookingPage from './components/BookingPage';
import LoginScreen from './components/LoginScreen';
import LandingPage from './components/landing/LandingPage';
import { api, initialMockState } from './api';

export default function App() {
  // DS_CU01: Autenticación
  const [currentUser, setCurrentUser] = useState(null); // null = no autenticado
  const [view, setView] = useState(() => {
    const requested = new URLSearchParams(window.location.search).get('vista');
    if (requested === 'reservar') return 'reservar';
    if (requested === 'admin') return 'admin';
    return 'portal';
  }); // 'portal' | 'reservar' | 'admin'
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

  // Carga inicial completa al arrancar la aplicación
  useEffect(() => {
    let isMounted = true;
    const cargarDatosIniciales = async () => {
      try {
        const [citasData, clientesData, personalData, catalogoData, cajaData, ventasData, anulacionesData] = await Promise.all([
          api.getCitas(),
          api.getClientes(),
          api.getPersonal(),
          api.getCatalogo(),
          api.getCaja(),
          api.getVentas(),
          api.getAnulaciones()
        ]);

        if (!isMounted) return;

        if (citasData && Array.isArray(citasData)) setCitas(citasData);
        if (clientesData && Array.isArray(clientesData)) setClientes(clientesData);
        if (personalData && Array.isArray(personalData)) setUsuarios(personalData);
        if (catalogoData && Array.isArray(catalogoData)) setCatalogo(catalogoData);
        if (cajaData && typeof cajaData === 'object' && (cajaData.saldo_teorico !== undefined || cajaData.apertura !== undefined)) {
          setCaja(cajaData);
          if (cajaData.estado === 'Abierta') setCajaAbierta(true);
          else if (cajaData.estado === 'Cerrada') setCajaAbierta(false);
        }
        if (ventasData && Array.isArray(ventasData)) setVentas(ventasData);
        if (anulacionesData && Array.isArray(anulacionesData)) setAnulaciones(anulacionesData);
      } catch (err) {
        console.warn('Error en carga inicial:', err);
      }
    };

    cargarDatosIniciales();

    // Sincronización continua en tiempo real de Agenda y Caja desde PostgreSQL Render
    const syncInterval = setInterval(async () => {
      if (!isMounted) return;
      try {
        const [citasActualizadas, cajaActualizada] = await Promise.all([
          api.getCitas(),
          api.getCaja()
        ]);
        if (isMounted) {
          if (citasActualizadas && Array.isArray(citasActualizadas)) {
            setCitas(citasActualizadas);
          }
          if (cajaActualizada && typeof cajaActualizada === 'object' && cajaActualizada.saldo_teorico !== undefined) {
            setCaja(cajaActualizada);
            if (cajaActualizada.estado === 'Abierta') setCajaAbierta(true);
            else if (cajaActualizada.estado === 'Cerrada') setCajaAbierta(false);
          }
        }
      } catch (_) {}
    }, 2500);

    return () => {
      isMounted = false;
      clearInterval(syncInterval);
    };
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
    if (user.permisos?.includes('agenda') || user.permisos?.includes('caja') || user.permisos?.includes('personal') || user.permisos?.includes('apertura') || user.rol === 'Administrador' || user.rol === 'Recepcionista' || user.rol === 'Cajero') {
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

  // CUS02: Registrar personal con persistencia en PostgreSQL
  const handleAddPersonal = async (personal) => {
    const res = await api.createPersonal(personal);
    if (res && res.success) {
      const personalGuardado = res.personal || personal;
      setUsuarios(prev => [personalGuardado, ...prev]);
      const usuariosActualizados = await api.getPersonal();
      if (usuariosActualizados && usuariosActualizados.length) setUsuarios(usuariosActualizados);
    }
    return res;
  };

  // CUS03: Registrar cliente con persistencia en PostgreSQL
  const handleAddClient = async (newClient) => {
    const res = await api.createCliente(newClient);
    if (res && res.success) {
      const clienteGuardado = res.cliente || newClient;
      setClientes(prev => [clienteGuardado, ...prev]);
      const clientesActualizados = await api.getClientes();
      if (clientesActualizados && clientesActualizados.length) setClientes(clientesActualizados);
    }
    return res;
  };

  const handleSaveClient = (updatedClient) => {
    setClientes(clientes.map(cl => cl.dni === updatedClient.dni ? updatedClient : cl));
  };

  // CUS04: Gestionar Citas (Antes Agendar Cita)
  const handleAddAppointment = async (newCita) => {
    const result = await api.createCita(newCita);
    if (result && result.success === false) {
      return result;
    }
    const citaWithId = result?.cita || { id: Date.now(), ...newCita };
    setCitas(prev => [citaWithId, ...prev]);
    const [citasActualizadas, clientesActualizados] = await Promise.all([
      api.getCitas(),
      api.getClientes()
    ]);
    if (citasActualizadas && citasActualizadas.length) setCitas(citasActualizadas);
    if (clientesActualizados && clientesActualizados.length) setClientes(clientesActualizados);
    return { success: true, cita: citaWithId };
  };

  // CUS05: Reprogramar cita
  const handleReprogramCita = async (citaId, nuevaFecha, nuevaHora) => {
    const result = await api.reprogramarCita(citaId, nuevaFecha, nuevaHora);
    if (result && result.success === false) {
      return result;
    }
    setCitas(citas.map(c =>
      c.id === citaId ? { ...c, fecha: nuevaFecha, hora: nuevaHora, estado: 'Reprogramada' } : c
    ));
    const citasActualizadas = await api.getCitas();
    if (citasActualizadas && citasActualizadas.length) setCitas(citasActualizadas);
    return { success: true, message: result?.message || 'Cita reprogramada exitosamente.' };
  };

  const handleCancelCita = async (citaId, motivo) => {
    setCitas(citas.map(c =>
      c.id === citaId ? { ...c, estado: 'Cancelada', motivo_cancelacion: motivo } : c
    ));
    const res = await api.updateCitaEstado(citaId, 'Cancelada', motivo);
    const citasActualizadas = await api.getCitas();
    if (citasActualizadas && citasActualizadas.length) setCitas(citasActualizadas);
    return res;
  };

  const handleUpdateCitaEstado = async (citaId, nuevoEstado) => {
    setCitas(citas.map(c =>
      c.id === citaId ? { ...c, estado: nuevoEstado } : c
    ));
    const res = await api.updateCitaEstado(citaId, nuevoEstado);
    const citasActualizadas = await api.getCitas();
    if (citasActualizadas && citasActualizadas.length) setCitas(citasActualizadas);
    return res;
  };

  // CUS06: Registrar servicio en catálogo con persistencia en PostgreSQL
  const handleAddServicio = async (servicio) => {
    const res = await api.createServicio(servicio);
    if (res && res.success) {
      const servGuardado = res.servicio || servicio;
      setCatalogo(prev => [...prev, servGuardado]);
      const catalogoActualizado = await api.getCatalogo();
      if (catalogoActualizado && catalogoActualizado.length) setCatalogo(catalogoActualizado);
    }
    return res;
  };

  // DS_CU07: Aperturar turno de caja (Persistencia total en PostgreSQL)
  const handleAperturaCaja = async (aperturaData) => {
    const saldo = parseFloat(aperturaData.saldo_inicial);
    const turno = aperturaData.turno || aperturaData.numero_turno || 'Turno Mañana';
    const responsable = aperturaData.responsable || currentUser?.nombre || 'Personal de Caja';

    try {
      const res = await api.aperturarCaja({
        saldo_inicial: saldo,
        monto: saldo,
        monto_inicial: saldo,
        responsable,
        turno,
        observaciones: aperturaData.observaciones || 'Apertura de turno'
      });

      if (res && res.success === false) {
        showToast(`⚠️ ${res.error || 'Error al aperturar caja'}`);
        return res;
      }

      setCajaAbierta(true);
      const cajaActual = await api.getCaja();
      if (cajaActual) setCaja(cajaActual);
      showToast(res?.message || `[APERTURA] Turno ${turno} aperturado en Base de Datos. Fondo: S/ ${saldo.toFixed(2)}`);
      return res;
    } catch (err) {
      console.error('Error al registrar apertura en backend:', err);
      showToast('[ERROR] No se pudo persistir la apertura en base de datos.');
      return { success: false, error: 'No se pudo persistir la apertura en base de datos.' };
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
          catalogo={catalogo}
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
          onChangeCitaEstado={handleUpdateCitaEstado}
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
          onRefreshCitas={async () => {
            const data = await api.getCitas();
            if (data && data.length) {
              setCitas(data);
              showToast(`Agenda sincronizada (${data.length} citas desde base de datos).`);
            }
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

      {/* Toast Notification */}
      {toastMessage && <div className="toast">{toastMessage}</div>}
    </div>
  );
}
