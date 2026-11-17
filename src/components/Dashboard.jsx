import React, { useState, useEffect } from 'react';
import CashAuditModal from './CashAuditModal';
import ElectronicReceiptModal from './ElectronicReceiptModal';
import ClientFileModal from './ClientFileModal';
import AppointmentModal from './AppointmentModal';
import { PersonalManager, CatalogoManager, AperturasCaja } from './UseCaseModules';
import { 
  CalendarIcon, UsersIcon, UserIcon, CreditCardIcon, SlashIcon, LockIcon, 
  BoxIcon, TagIcon, ShieldIcon, ChartIcon, TargetIcon, SearchIcon, 
  DollarIcon
} from './Icons';

// Matriz de Control de Acceso Basada en Roles (RBAC) para Salon Spa Aleida
const ROLE_PERMISSIONS = {
  Administrador: {
    nombre: 'Administrador',
    badgeText: 'Administrador',
    badgeFull: 'Administrador · Control Total',
    badgeClass: 'rol-admin',
    descripcion: 'Control total del sistema de gestión, personal, finanzas y configuración.',
    defaultTab: 'agenda',
    sections: [
      {
        label: 'Clientes & Citas',
        tabs: [
          { id: 'clientes', label: 'Registrar Cliente', code: 'DS_CU03', icon: UsersIcon },
          { id: 'agenda', label: 'Agendar Cita', code: 'DS_CU04', icon: CalendarIcon },
          { id: 'reprogramar', label: 'Reprogramar Cita', code: 'DS_CU05', icon: CalendarIcon }
        ]
      },
      {
        label: 'Caja & Ventas',
        tabs: [
          { id: 'apertura', label: 'Aperturar Caja', code: 'DS_CU07', icon: LockIcon },
          { id: 'caja', label: 'Procesar Venta', code: 'DS_CU08', icon: CreditCardIcon },
          { id: 'anulaciones', label: 'Anular Venta', code: 'DS_CU09', icon: SlashIcon },
          { id: 'operaciones-caja', label: 'Arqueo & Cierre', code: 'DS_CU10', icon: ChartIcon }
        ]
      },
      {
        label: 'Administración & Estrategia',
        tabs: [
          { id: 'personal', label: 'Registrar Personal', code: 'DS_CU02', icon: UserIcon },
          { id: 'catalogo', label: 'Catálogo Servicios', code: 'DS_CU06', icon: TagIcon },
          { id: 'compras', label: 'Compras & Insumos', code: '+', icon: BoxIcon },
          { id: 'reportes', label: 'Reportes & Metas', code: '+', icon: ShieldIcon }
        ]
      }
    ]
  },

  Recepcionista: {
    nombre: 'Recepcionista',
    badgeText: 'Recepcionista',
    badgeFull: 'Recepción & Atención al Cliente',
    badgeClass: 'rol-recepcion',
    descripcion: 'Gestión de pacientes, agendamiento en mostrador, reprogramaciones y consulta de catálogo.',
    defaultTab: 'agenda',
    sections: [
      {
        label: 'Clientes & Citas (Recepción)',
        tabs: [
          { id: 'agenda', label: 'Agenda & Citas del Día', code: 'DS_CU04', icon: CalendarIcon },
          { id: 'clientes', label: 'Registrar & Ver Clientes', code: 'DS_CU03', icon: UsersIcon },
          { id: 'reprogramar', label: 'Reprogramar Citas', code: 'DS_CU05', icon: CalendarIcon }
        ]
      },
      {
        label: 'Consultas de Servicios',
        tabs: [
          { id: 'catalogo', label: 'Catálogo & Tarifario', code: 'DS_CU06', icon: TagIcon }
        ]
      }
    ]
  },

  Cajero: {
    nombre: 'Cajero',
    badgeText: 'Cajero',
    badgeFull: 'Caja & Facturación Oficial',
    badgeClass: 'rol-cajero',
    descripcion: 'Cobranzas en mostrador, emisión de boletas, notas de crédito autorizadas y arqueo de caja.',
    defaultTab: 'caja',
    sections: [
      {
        label: 'Operaciones de Caja (Cajero)',
        tabs: [
          { id: 'caja', label: 'Terminal POS & Cobros', code: 'DS_CU08', icon: CreditCardIcon },
          { id: 'apertura', label: 'Aperturar Turno', code: 'DS_CU07', icon: LockIcon },
          { id: 'anulaciones', label: 'Notas de Crédito', code: 'DS_CU09', icon: SlashIcon },
          { id: 'operaciones-caja', label: 'Arqueo & Cierre', code: 'DS_CU10', icon: ChartIcon }
        ]
      },
      {
        label: 'Apoyo a Cobranzas',
        tabs: [
          { id: 'agenda', label: 'Citas por Cobrar', code: 'DS_CU04', icon: CalendarIcon },
          { id: 'clientes', label: 'Buscar Cliente / DNI', code: 'DS_CU03', icon: UsersIcon }
        ]
      }
    ]
  }
};

export default function Dashboard({ 
  citas, 
  clientes, 
  caja, 
  insumos, 
  catalogo, 
  usuarios, 
  currentUser,
  cajaAbierta,
  onAddCita,
  onReprogramCita,
  onCancelCita,
  onChangeCitaEstado,
  onProcessPayment, 
  onAddClient, 
  onSaveClient,
  onProcessAnnulment, 
  onExpense, 
  onCloseCaja,
  onReceiveStock,
  onAddPersonal,
  onAddServicio,
  onAperturaCaja,
  onSwitchToPortal,
  onSwitchToBooking,
  onSwitchToMovil,
  onChangeRole,
  onRefreshClientes,
  onRefreshCaja,
  showToast 
}) {
  // Resolver configuración de rol
  const userRoleKey = currentUser?.rol?.toLowerCase().includes('recep')
    ? 'Recepcionista'
    : currentUser?.rol?.toLowerCase().includes('caje')
    ? 'Cajero'
    : 'Administrador';

  const roleConfig = ROLE_PERMISSIONS[userRoleKey] || ROLE_PERMISSIONS.Administrador;
  const allowedTabs = roleConfig.sections.flatMap(s => s.tabs.map(t => t.id));

  const [activeTab, setActiveTab] = useState(roleConfig.defaultTab);

  // Auto-ajustar tab si no está permitido para el rol activo
  useEffect(() => {
    if (!allowedTabs.includes(activeTab)) {
      setActiveTab(roleConfig.defaultTab);
    }
  }, [userRoleKey]);

  // Modals state
  const [isCashAuditOpen, setIsCashAuditOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [receiptType, setReceiptType] = useState('boleta'); // 'boleta' | 'nota_credito'
  const [isClientFileOpen, setIsClientFileOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isApptModalOpen, setIsApptModalOpen] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null);

  // Búsqueda y Filtros de Clientes
  const [clientSearchQuery, setClientSearchQuery] = useState('');
  const [headerSearchQuery, setHeaderSearchQuery] = useState('');
  const [salesHistory, setSalesHistory] = useState([]);

  // POS State (RF04, RF05)
  const [posClient, setPosClient] = useState('Patricia Valdivia');
  const [posService, setPosService] = useState('Facial Rejuvenecedor con Oro');
  const [posAmount, setPosAmount] = useState('450.00');
  const [posExtraProduct, setPosExtraProduct] = useState('0'); // 0, 45 (Serum), 70 (Ampolla)
  const [posDiscount, setPosDiscount] = useState('0'); // 0, 10%
  const [posPaymentMethod, setPosPaymentMethod] = useState('Yape/Plin');
  const [cashGiven, setCashGiven] = useState('500.00'); // para cálculo de vuelto

  // Annulment State (RF06)
  const [annulTicket, setAnnulTicket] = useState('B001-0004820');
  const [annulPin, setAnnulPin] = useState('1234');
  const [annulMotivo, setAnnulMotivo] = useState('Error en digitación de importe');
  const [annulHistory, setAnnulHistory] = useState([
    { fecha: '05/10/2026', boleta: 'B001-0004810', nc: 'NC-012', monto: 120.0, motivo: 'Devolución por insatisfacción' }
  ]);

  // Filtrado reactivo de clientes para el padrón
  const filteredClientes = clientes.filter(cl => {
    if (!clientSearchQuery) return true;
    const q = clientSearchQuery.toLowerCase().trim();
    return (
      (cl.dni && cl.dni.toLowerCase().includes(q)) ||
      (cl.nombre && cl.nombre.toLowerCase().includes(q)) ||
      (cl.telefono && cl.telefono.toLowerCase().includes(q)) ||
      (cl.preferencias && cl.preferencias.toLowerCase().includes(q))
    );
  });

  // Calculations for POS
  const basePrice = parseFloat(posAmount) || 0;
  const extraPrice = parseFloat(posExtraProduct) || 0;
  const subtotalBeforeDiscount = basePrice + extraPrice;
  const discountAmount = posDiscount === '10' ? subtotalBeforeDiscount * 0.10 : 0;
  const totalFacturado = Math.max(0, subtotalBeforeDiscount - discountAmount);
  const subtotalSinIGV = totalFacturado / 1.18;
  const igvAmount = totalFacturado - subtotalSinIGV;
  const vueltoCalculado = Math.max(0, (parseFloat(cashGiven) || 0) - totalFacturado);

  const handleChargeFromAgenda = (cita) => {
    setPosClient(cita.cliente);
    setPosService(cita.servicio);
    setPosAmount(cita.monto.toString());
    setActiveTab('caja');
    showToast(`Cita transferida a Terminal POS: ${cita.cliente} (S/ ${cita.monto})`);
  };

  const handleExecutePayment = (e) => {
    e.preventDefault();
    if (totalFacturado <= 0) return;

    const nuevaBoleta = {
      numero_boleta: `B001-000${citas.length + 4822}`,
      fecha: 'Hoy (Ahora)',
      cliente: posClient,
      servicio: extraPrice > 0 ? `${posService} + Insumo de Reventa` : posService,
      subtotal: subtotalSinIGV,
      igv: igvAmount,
      total: totalFacturado,
      medio_pago: posPaymentMethod
    };

    onProcessPayment({
      cliente: posClient,
      servicio: nuevaBoleta.servicio,
      monto: totalFacturado,
      medio_pago: posPaymentMethod
    });

    setSalesHistory(prev => [nuevaBoleta, ...prev]);
    setReceiptData(nuevaBoleta);
    setReceiptType('boleta');
    setIsReceiptOpen(true);

    showToast(`[VENTA] Boleta electrónica emitida con éxito a ${posClient} por S/ ${totalFacturado.toFixed(2)}.`);
  };

  const handleExecuteAnnulment = (e) => {
    e.preventDefault();
    if (annulPin !== '1234') {
      showToast('[ERROR] Acceso denegado: PIN de autorización gerencial incorrecto.');
      return;
    }

    const newNC = {
      fecha: 'Hoy (Ahora)',
      boleta: annulTicket,
      nota_credito: `NC-0${annulHistory.length + 13}`,
      nc: `NC-0${annulHistory.length + 13}`,
      monto: 280.0,
      cliente: 'Mariana Torres',
      servicio: 'Servicio revertido por auditoría',
      motivo: annulMotivo
    };

    setAnnulHistory([newNC, ...annulHistory]);
    onProcessAnnulment(280.0);

    setReceiptData(newNC);
    setReceiptType('nota_credito');
    setIsReceiptOpen(true);

    showToast(`[ANULACION] Aprobada por Gerencia. Se emitió ${newNC.nc} para ${annulTicket}.`);
  };

  const handleOpenClientFile = (cliente) => {
    setSelectedClient(cliente);
    setIsClientFileOpen(true);
  };

  return (
    <div className="admin-layout">
      {/* Sidebar — 10 Casos de Uso del Sistema */}
      {/* Sidebar — Dinámico con Control de Acceso por Roles (RBAC) */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <span className="brand-badge">SPA</span>
          <span>Salon Spa Aleida</span>
        </div>

        {/* Menú de Navegación según Rol */}
        <nav className="sidebar-menu">
          {roleConfig.sections.map((section, sIdx) => (
            <React.Fragment key={sIdx}>
              <div className="sidebar-section-label">{section.label}</div>
              {section.tabs.map(tab => {
                const TabIcon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    id={`tab-${tab.id}`}
                    className={activeTab === tab.id ? 'active' : ''}
                    onClick={() => setActiveTab(tab.id)}
                  >
                    <span><TabIcon size={16} /></span>
                    {tab.label}
                  </button>
                );
              })}
            </React.Fragment>
          ))}
        </nav>

        {/* Switcher de Roles para Evaluación / Pruebas (Restringido exclusivamente a Administrador) */}
        {onChangeRole && (currentUser?.originalRol?.toLowerCase().includes('admin') || (!currentUser?.originalRol && userRoleKey === 'Administrador')) && (
          <div className="sidebar-role-switcher">
            <span className="role-switcher-title">Vista de Evaluación (Solo Admin):</span>
            <div className="role-switcher-grid">
              <button 
                type="button"
                id="role-switch-admin"
                className={`btn-role-chip ${userRoleKey === 'Administrador' ? 'active' : ''}`}
                onClick={() => onChangeRole('Administrador')}
                title="Administrador: 11 módulos"
              >
                Admin
              </button>
              <button 
                type="button"
                id="role-switch-recepcion"
                className={`btn-role-chip ${userRoleKey === 'Recepcionista' ? 'active' : ''}`}
                onClick={() => onChangeRole('Recepcionista')}
                title="Recepcionista: 4 módulos de atención y citas"
              >
                Recepción
              </button>
              <button 
                type="button"
                id="role-switch-cajero"
                className={`btn-role-chip ${userRoleKey === 'Cajero' ? 'active' : ''}`}
                onClick={() => onChangeRole('Cajero')}
                title="Cajero: 6 módulos de caja y cobranzas"
              >
                Cajero
              </button>
            </div>
          </div>
        )}

        <div className="sidebar-user">
          <div className="user-avatar">
            {currentUser ? currentUser.nombre.split(' ').map(n=>n[0]).join('').slice(0,2) : 'US'}
          </div>
          <div className="user-info">
            <strong>{currentUser ? currentUser.nombre : 'Usuario'}</strong>
            <small>{roleConfig.badgeText}</small>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Top Header Bar */}
        <header className="admin-header">
          <div className="header-search">
            <input 
              type="text" 
              placeholder="Buscar cliente por DNI, nombre o cita..." 
              value={headerSearchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setHeaderSearchQuery(val);
                setClientSearchQuery(val);
                if (val.trim() && activeTab !== 'clientes' && activeTab !== 'agenda') {
                  setActiveTab('clientes');
                }
              }}
            />
          </div>
          <div className="header-status">
            <button className="btn-outline" onClick={onSwitchToPortal} style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}>
              Portal Web
            </button>
            <button 
              className="btn-outline" 
              onClick={onSwitchToBooking} 
              style={{ borderColor: 'var(--color-gold)', color: 'var(--color-gold)', fontWeight: 600 }}
              title="Abrir la página oficial de reservas en pantalla completa"
            >
              Página Reservar Cita
            </button>
            <button 
              className="btn-outline" 
              onClick={onSwitchToMovil} 
              style={{ borderColor: '#4A7C59', color: '#1B3D2B', fontWeight: 600, background: '#EBF5F0' }}
              title="Abrir la App Móvil de la Especialista (Simulador Smartphone)"
            >
              Móvil Especialistas
            </button>
            <span className="badge-status open">
              <span className="status-dot"></span> Caja Turno: <strong>S/ {(caja.apertura + caja.efectivo + caja.digital - caja.egresos).toFixed(2)}</strong>
            </span>
          </div>
        </header>

        {/* Guardia de Seguridad por Rol */}
        {!allowedTabs.includes(activeTab) && (
          <div className="role-restricted-pane">
            <div className="role-restricted-card">
              <span className="restricted-icon">
                <LockIcon size={32} color="#C8A26A" />
              </span>
              <h3>Acceso Restringido para el Rol {roleConfig.nombre}</h3>
              <p>
                Este módulo requiere privilegios que no corresponden a su perfil operativo (<strong>{roleConfig.nombre}</strong>).
                Conforme a la matriz de roles y seguridad del sistema, cada usuario solo puede acceder a las funciones asignadas a su cargo.
              </p>
              <div className="restricted-allowed-chips">
                <span>Módulos autorizados para su perfil:</span>
                <div className="chips-row">
                  {allowedTabs.map(tId => (
                    <button key={tId} className="chip-tab-redirect" onClick={() => setActiveTab(tId)}>
                      {tId.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <button 
                className="btn-action primary" 
                onClick={() => setActiveTab(roleConfig.defaultTab)} 
                style={{ marginTop: '16px' }}
              >
                Ir a Mi Módulo Principal ({roleConfig.defaultTab.toUpperCase()})
              </button>
            </div>
          </div>
        )}

        {/* TAB DS_CU04 + DS_CU05: AGENDA DE CITAS */}
        {activeTab === 'agenda' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <span className="badge-tag gold">Agenda &amp; Citas del Spa</span>
                <h3>Agenda de Citas &amp; Control de Sillones</h3>
                <small style={{ color: 'var(--color-text-muted)' }}>
                  Valida disponibilidad de especialistas y permite reprogramar, cancelar y registrar estados de atención.
                </small>
              </div>
              <button className="btn-action primary" onClick={() => { setEditingAppt(null); setIsApptModalOpen(true); }}>
                + Agendar Cita en Mostrador
              </button>
            </div>
            <div className="agenda-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Horario</th>
                    <th>Cliente</th>
                    <th>Servicio Solicitado</th>
                    <th>Especialista</th>
                    <th>Estado de Cita</th>
                    <th>Monto</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {citas.map(c => (
                    <tr key={c.id}>
                      <td><strong>{c.hora}</strong><br /><small>{c.fecha}</small></td>
                      <td>
                        <strong>{c.cliente}</strong><br />
                        <button 
                          className="btn-table" 
                          style={{ fontSize: '0.72rem', padding: '2px 6px', marginTop: '3px' }}
                          onClick={() => {
                            const cli = clientes.find(cl => cl.nombre.toLowerCase().includes(c.cliente.toLowerCase())) || {
                              dni: c.dni,
                              nombre: c.cliente,
                              telefono: '987654321',
                              preferencias: 'Cliente con cita agendada',
                              visitas: 1
                            };
                            handleOpenClientFile(cli);
                          }}
                        >
                          Ver Ficha Cliente
                        </button>
                      </td>
                      <td>{c.servicio}</td>
                      <td>{c.especialista}</td>
                      <td>
                        <span className={`tag ${c.estado === 'Atendida' ? 'attended' : c.estado === 'Confirmada' ? 'confirmed' : c.estado === 'Cancelada' ? 'neg' : 'in-progress'}`}>
                          {c.estado}
                        </span>
                        {c.motivo_cancelacion && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--color-danger)', marginTop: '2px' }}>
                            Motivo: {c.motivo_cancelacion}
                          </div>
                        )}
                      </td>
                      <td>S/ {c.monto.toFixed(2)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {c.cobrado ? (
                            <button 
                              className="btn-table" 
                              onClick={() => {
                                setReceiptData({
                                  numero_boleta: `B001-0004820`,
                                  fecha: 'Hoy',
                                  cliente: c.cliente,
                                  servicio: c.servicio,
                                  total: c.monto,
                                  medio_pago: 'Efectivo en Caja'
                                });
                                setReceiptType('boleta');
                                setIsReceiptOpen(true);
                              }}
                            >
                              Ver Boleta
                            </button>
                          ) : (
                            <button className="btn-table primary" onClick={() => handleChargeFromAgenda(c)}>
                              Cobrar en POS
                            </button>
                          )}
                          <button 
                            className="btn-table" 
                            onClick={() => { setEditingAppt(c); setIsApptModalOpen(true); }}
                          >
                            Editar / Reprogramar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB DS_CU03: REGISTRAR CLIENTE */}
        {activeTab === 'clientes' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <span className="badge-tag gold">Padrón de Clientes &amp; Fichas Estéticas</span>
                <h3>Padrón Centralizado de Clientes &amp; Fichas Estéticas</h3>
                <small style={{ color: 'var(--color-text-muted)' }}>
                  Almacena historial estético, visitas acumuladas, sensibilidad dérmica y preferencias personalizadas sincronizadas con la Base de Datos.
                </small>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {onRefreshClientes && (
                  <button 
                    type="button" 
                    className="btn-outline" 
                    onClick={onRefreshClientes} 
                    title="Sincronizar clientes desde backend PostgreSQL"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                  >
                    🔄 Sincronizar Padrón
                  </button>
                )}
                <button className="btn-action primary" onClick={() => {
                  const dni = prompt('DNI del cliente (8 dígitos):');
                  if (dni) { 
                    const nombre = prompt('Nombres y apellidos completos:'); 
                    if (nombre) {
                      const telefono = prompt('Teléfono móvil (WhatsApp):', '987654321');
                      const preferencias = prompt('Historial Dérmico / Preferencias:', 'Piel sensible, aromaterapia botánica');
                      onAddClient({ 
                        dni: dni.trim(), 
                        nombre: nombre.trim(), 
                        telefono: (telefono || '987654321').trim(), 
                        preferencias: preferencias || 'Registro en mostrador', 
                        visitas: 1 
                      });
                      showToast(`Cliente ${nombre} registrado y sincronizado en el Padrón.`);
                    }
                  }
                }}>
                  + Nuevo Cliente
                </button>
              </div>
            </div>

            {/* Barra de Búsqueda Rápida y Estadísticas en Vivo */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              background: '#F8FBF9', 
              border: '1px solid #D8E7DC', 
              borderRadius: '8px', 
              padding: '10px 16px', 
              marginBottom: '14px',
              gap: '12px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: '280px' }}>
                <span style={{ fontSize: '1.1rem' }}>🔍</span>
                <input 
                  type="text" 
                  value={clientSearchQuery} 
                  onChange={(e) => setClientSearchQuery(e.target.value)} 
                  placeholder="Buscar por DNI, Nombres, Teléfono o Historial dérmico..." 
                  style={{ 
                    flex: 1, 
                    padding: '8px 12px', 
                    border: '1px solid #CCD0D5', 
                    borderRadius: '6px', 
                    fontSize: '0.9rem',
                    background: '#FFF' 
                  }}
                />
                {clientSearchQuery && (
                  <button 
                    type="button" 
                    onClick={() => { setClientSearchQuery(''); setHeaderSearchQuery(''); }} 
                    style={{ background: '#E2E8F0', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', color: '#4A5568', fontWeight: 'bold' }}
                    title="Limpiar búsqueda"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', fontSize: '0.86rem', color: '#4A5568' }}>
                <span>Total Registrados: <strong style={{ color: '#1B3D2B', fontSize: '0.95rem' }}>{clientes.length}</strong></span>
                <span>Coincidencias: <strong style={{ color: '#B38B28', fontSize: '0.95rem' }}>{filteredClientes.length}</strong></span>
              </div>
            </div>

            <div className="agenda-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>DNI</th>
                    <th>Nombres y Apellidos</th>
                    <th>Teléfono</th>
                    <th>Historial Estético &amp; Dérmico</th>
                    <th>Visitas</th>
                    <th>Última Atención</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClientes.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '36px', color: '#718096' }}>
                        No se encontraron clientes que coincidan con "<strong>{clientSearchQuery}</strong>".
                      </td>
                    </tr>
                  ) : (
                    filteredClientes.map(cl => (
                      <tr key={cl.dni}>
                        <td><strong>{cl.dni}</strong></td>
                        <td><strong>{cl.nombre}</strong></td>
                        <td>{cl.telefono}</td>
                        <td style={{ maxWidth: '320px', lineHeight: 1.4 }}>{cl.preferencias}</td>
                        <td><span className="tag confirmed">{cl.visitas || 1} visitas</span></td>
                        <td>{cl.ultima_visita || 'Hoy'}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button className="btn-table primary" onClick={() => handleOpenClientFile(cl)}>
                              Expediente
                            </button>
                            <button 
                              className="btn-table" 
                              style={{ background: '#EBF5EE', color: '#1B3D2B', borderColor: '#4A7C59', fontWeight: 600 }}
                              onClick={() => {
                                setPosClient(cl.nombre);
                                setActiveTab('caja');
                                showToast(`Cliente "${cl.nombre}" seleccionado en Terminal POS.`);
                              }}
                              title="Cargar este cliente en la Terminal POS para facturación"
                            >
                              Cobrar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB DS_CU05: REPROGRAMAR CITA */}
        {activeTab === 'reprogramar' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <span className="badge-tag gold">Reprogramación y Cancelación de Citas</span>
                <h3>Reprogramar o Cancelar Citas</h3>
                <small style={{ color: 'var(--color-text-muted)' }}>
                  Permite modificar fecha/hora de citas confirmadas o cancelarlas con motivo registrado.
                </small>
              </div>
            </div>
            <div className="agenda-table-wrapper">
              <table className="data-table">
                <thead><tr><th>Horario</th><th>Cliente</th><th>Servicio</th><th>Estado</th><th>Acciones</th></tr></thead>
                <tbody>
                  {citas.filter(c => c.estado !== 'Atendida' && c.estado !== 'Cancelada').map(c => (
                    <tr key={c.id}>
                      <td><strong>{c.hora}</strong><br/><small>{c.fecha}</small></td>
                      <td>{c.cliente}</td><td>{c.servicio}</td>
                      <td><span className={`tag ${c.estado === 'Confirmada' ? 'confirmed' : 'in-progress'}`}>{c.estado}</span></td>
                      <td>
                        <div style={{display:'flex',gap:'6px'}}>
                          <button className="btn-table" onClick={() => { setEditingAppt(c); setIsApptModalOpen(true); }}>Reprogramar</button>
                          <button className="btn-table" style={{color:'var(--color-danger)'}} onClick={() => { const m=prompt('Motivo de cancelación:'); if(m){onCancelCita(c.id,m);showToast(`Cita de ${c.cliente} cancelada.`);} }}>Cancelar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB DS_CU02: REGISTRAR PERSONAL */}
        {activeTab === 'personal' && (
          <section className="admin-tab">
            <PersonalManager usuarios={usuarios} onAddPersonal={onAddPersonal} showToast={showToast} />
          </section>
        )}

        {/* TAB DS_CU06: CATALOGO DE SERVICIOS */}
        {activeTab === 'catalogo' && (
          <section className="admin-tab">
            <CatalogoManager catalogo={catalogo} onAddServicio={onAddServicio} showToast={showToast} />
          </section>
        )}

        {/* TAB DS_CU07: APERTURAR TURNO DE CAJA */}
        {activeTab === 'apertura' && (
          <section className="admin-tab">
            <AperturasCaja onApertura={onAperturaCaja} cajaAbierta={cajaAbierta} showToast={showToast} />
          </section>
        )}

        {/* TAB 3: PUNTO DE VENTA */}
        {activeTab === 'caja' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <span className="badge-tag gold">Punto de Venta &amp; Facturación</span>
                <h3>Punto de Venta (POS) &amp; Emisión de Boleta Electrónica</h3>
                <small style={{ color: 'var(--color-text-muted)' }}>
                  Soporta servicios combinados con productos de reventa, descuentos promocionales, cálculo automático del IGV (18%), cobro multicanal y sincronización automática con Caja y Base de Datos.
                </small>
              </div>
              {onRefreshCaja && (
                <button 
                  type="button" 
                  className="btn-outline" 
                  onClick={onRefreshCaja}
                  title="Sincronizar balance de caja desde backend"
                >
                  🔄 Sincronizar Caja
                </button>
              )}
            </div>

            {/* Banner de Saldo de Caja de Turno en Vivo */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
              gap: '12px', 
              background: '#F8FBF9', 
              border: '1px solid #C2E0C6', 
              borderRadius: '10px', 
              padding: '14px 18px', 
              marginBottom: '18px' 
            }}>
              <div>
                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#666', fontWeight: 600 }}>Fondo Apertura</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1B3D2B' }}>
                  S/ {(Number(caja.apertura) || 0).toFixed(2)}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#666', fontWeight: 600 }}>Efectivo en Mostrador</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#2E7D32' }}>
                  S/ {(Number(caja.efectivo) || 0).toFixed(2)}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#666', fontWeight: 600 }}>Digital (Yape / POS)</span>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0277BD' }}>
                  S/ {(Number(caja.digital) || 0).toFixed(2)}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#666', fontWeight: 600 }}>Total Teórico en Caja</span>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#B38B28' }}>
                  S/ {((Number(caja.apertura) || 0) + (Number(caja.efectivo) || 0) + (Number(caja.digital) || 0) - (Number(caja.egresos) || 0)).toFixed(2)}
                </div>
              </div>
            </div>

            {/* Selector Rápido de Citas Pendientes de Cobro del Día */}
            <div style={{ 
              background: '#FFFDE7', 
              border: '1px solid #FFE082', 
              borderRadius: '8px', 
              padding: '12px 16px', 
              marginBottom: '18px' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong style={{ fontSize: '0.88rem', color: '#795548' }}>
                  ⚡ Cobro Rápido: Citas Pendientes de Cobro ({citas.filter(c => !c.cobrado && c.estado !== 'Cancelada').length}):
                </strong>
                <span style={{ fontSize: '0.78rem', color: '#8D6E63' }}>Haga clic en una cita para cargarla automáticamente</span>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {citas.filter(c => !c.cobrado && c.estado !== 'Cancelada').map(c => (
                  <button
                    key={c.id}
                    type="button"
                    style={{ 
                      background: '#FFF', 
                      border: '1px solid #D4AF37', 
                      color: '#1B3D2B', 
                      padding: '5px 12px', 
                      fontSize: '0.82rem', 
                      cursor: 'pointer', 
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}
                    onClick={() => {
                      setPosClient(c.cliente);
                      setPosService(c.servicio);
                      setPosAmount(c.monto.toString());
                      showToast(`Cita de ${c.cliente} cargada al POS (S/ ${c.monto})`);
                    }}
                    title={`Haga clic para facturar la cita de ${c.cliente}`}
                  >
                    <strong>{c.hora}</strong> · {c.cliente} ({c.servicio} - <strong>S/ {c.monto}</strong>)
                  </button>
                ))}
                {citas.filter(c => !c.cobrado && c.estado !== 'Cancelada').length === 0 && (
                  <span style={{ fontSize: '0.82rem', color: '#666', fontStyle: 'italic' }}>
                    Todas las citas agendadas han sido liquidadas. Puede facturar un servicio directo seleccionando un cliente.
                  </span>
                )}
              </div>
            </div>

            <div className="pos-layout">
              <div className="pos-checkout">
                <h3>Terminal de Facturación Inmediata</h3>
                <form onSubmit={handleExecutePayment}>
                  <div className="form-group">
                    <label>Cliente Titular (Escriba o elija del Padrón)</label>
                    <input 
                      type="text" 
                      value={posClient} 
                      onChange={(e) => setPosClient(e.target.value)} 
                      list="pos-clientes-list"
                      placeholder="Escriba o seleccione cliente..."
                      required 
                    />
                    <datalist id="pos-clientes-list">
                      {clientes.map((cl, idx) => (
                        <option key={cl.dni || idx} value={cl.nombre}>
                          DNI: {cl.dni} · Tel: {cl.telefono} · {cl.preferencias ? cl.preferencias.slice(0, 30) : ''}
                        </option>
                      ))}
                    </datalist>
                  </div>
                  <div className="form-group">
                    <label>Tratamiento Principal</label>
                    <input 
                      type="text" 
                      value={posService} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setPosService(val);
                        const match = catalogo.find(cat => cat.nombre.toLowerCase() === val.toLowerCase());
                        if (match) setPosAmount(match.precio.toString());
                      }} 
                      list="pos-servicios-list"
                      placeholder="Escriba o seleccione tratamiento..."
                      required 
                    />
                    <datalist id="pos-servicios-list">
                      {catalogo.map(cat => (
                        <option key={cat.id} value={cat.nombre}>
                          S/ {cat.precio} ({cat.duracion} min) · {cat.categoria}
                        </option>
                      ))}
                    </datalist>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Precio del Servicio (S/)</label>
                      <input type="number" step="0.01" value={posAmount} onChange={(e) => setPosAmount(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Producto Adicional de Salón</label>
                      <select value={posExtraProduct} onChange={(e) => setPosExtraProduct(e.target.value)}>
                        <option value="0">Ninguno (Solo servicio)</option>
                        <option value="45">Serum Reparador Capilar (+S/ 45.00)</option>
                        <option value="70">Ampolla Antiedad de Colágeno (+S/ 70.00)</option>
                        <option value="60">Aceite de Argán Puro 250ml (+S/ 60.00)</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Descuento Promocional</label>
                      <select value={posDiscount} onChange={(e) => setPosDiscount(e.target.value)}>
                        <option value="0">Sin Descuento (0%)</option>
                        <option value="10">Cliente Frecuente (10% Desc.)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Medio de Pago</label>
                      <select value={posPaymentMethod} onChange={(e) => setPosPaymentMethod(e.target.value)}>
                        <option value="Yape/Plin">Billetera Digital (Yape / Plin)</option>
                        <option value="Tarjeta POS">Tarjeta Crédito / Débito POS</option>
                        <option value="Efectivo">Efectivo en Mostrador</option>
                      </select>
                    </div>
                  </div>

                  {posPaymentMethod === 'Efectivo' && (
                    <div className="form-row" style={{ background: '#FFFDE7', padding: '12px', borderRadius: '8px', marginBottom: '14px' }}>
                      <div className="form-group">
                        <label>Efectivo Recibido del Cliente (S/):</label>
                        <input type="number" step="0.01" value={cashGiven} onChange={(e) => setCashGiven(e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label>Vuelto a Entregar:</label>
                        <strong style={{ fontSize: '1.2rem', color: 'var(--color-success)', display: 'block', paddingTop: '8px' }}>
                          S/ {vueltoCalculado.toFixed(2)}
                        </strong>
                      </div>
                    </div>
                  )}

                  <button type="submit" className="btn-pos-pay">
                    Procesar Cobro & Generar Boleta Electrónica (AD03)
                  </button>
                </form>
              </div>

              <div className="pos-register">
                <h3>Liquidación Fiscal en Tiempo Real</h3>
                <div className="register-summary">
                  <div className="reg-row">
                    <span>Base Servicios:</span>
                    <strong>S/ {basePrice.toFixed(2)}</strong>
                  </div>
                  {extraPrice > 0 && (
                    <div className="reg-row">
                      <span>Producto Adicional:</span>
                      <strong>+ S/ {extraPrice.toFixed(2)}</strong>
                    </div>
                  )}
                  {discountAmount > 0 && (
                    <div className="reg-row">
                      <span>Descuento Aplicado (10%):</span>
                      <strong className="neg">- S/ {discountAmount.toFixed(2)}</strong>
                    </div>
                  )}
                  <hr />
                  <div className="reg-row">
                    <span>Subtotal Grabado (Sin IGV):</span>
                    <strong>S/ {subtotalSinIGV.toFixed(2)}</strong>
                  </div>
                  <div className="reg-row">
                    <span>I.G.V. (18% SUNAT):</span>
                    <strong>S/ {igvAmount.toFixed(2)}</strong>
                  </div>
                  <hr />
                  <div className="reg-row total">
                    <span>Total a Pagar:</span>
                    <strong className="pos">S/ {totalFacturado.toFixed(2)}</strong>
                  </div>
                </div>

                {posPaymentMethod.includes('Yape') && (
                  <div style={{ textAlign: 'center', marginTop: '16px', background: '#F3E5F5', padding: '12px', borderRadius: '8px' }}>
                    <strong>[QR DIGITAL] Código QR de Cobro Digital Generado</strong><br />
                    <small>Cliente escanea y confirma recepción instantánea en Yape/Plin.</small>
                  </div>
                )}

                {/* Historial de Comprobantes Emitidos en la Sesión */}
                {salesHistory.length > 0 && (
                  <div style={{ marginTop: '20px', borderTop: '1px solid #E2E8F0', paddingTop: '14px' }}>
                    <h4 style={{ fontSize: '0.88rem', color: '#1B3D2B', marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>🧾 Comprobantes Emitidos en Turno</span>
                      <span style={{ color: '#666' }}>{salesHistory.length} emitidos</span>
                    </h4>
                    <div style={{ maxHeight: '160px', overflowY: 'auto', fontSize: '0.8rem' }}>
                      {salesHistory.map((s, idx) => (
                        <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px dashed #EEE' }}>
                          <div>
                            <strong>{s.numero_boleta}</strong> · {s.cliente}<br />
                            <small style={{ color: '#666' }}>{s.servicio}</small>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <span style={{ fontWeight: 'bold', color: '#2E7D32' }}>S/ {s.total.toFixed(2)}</span><br />
                            <small style={{ color: '#4A5568' }}>{s.medio_pago}</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* TAB 4: ANULACIONES */}
        {activeTab === 'anulaciones' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <span className="badge-tag gold">Anulaciones &amp; Devoluciones</span>
                <h3>Gestión de Anulaciones &amp; Emisión de Notas de Crédito</h3>
                <small style={{ color: 'var(--color-text-muted)' }}>
                  Requiere motivo obligatorio de anulación, validación estricta de PIN gerencial de auditoría y genera la reversión contable en caja.
                </small>
              </div>
            </div>
            <div className="pos-layout">
              <div className="pos-checkout">
                <h3>Formulario de Anulación Controlada</h3>
                <form onSubmit={handleExecuteAnnulment}>
                  <div className="form-group">
                    <label>Número de Boleta a Anular</label>
                    <input type="text" value={annulTicket} onChange={(e) => setAnnulTicket(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Motivo Obligatorio</label>
                    <select value={annulMotivo} onChange={(e) => setAnnulMotivo(e.target.value)}>
                      <option value="Error en digitación de importe">Error en digitación de importe</option>
                      <option value="Devolución por insatisfacción con tratamiento">Devolución por insatisfacción con tratamiento</option>
                      <option value="Comprobante duplicado por error de sistema">Comprobante duplicado por error de sistema</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>PIN de Autorización Gerencial (Auditoría)</label>
                    <input type="password" value={annulPin} onChange={(e) => setAnnulPin(e.target.value)} placeholder="PIN (1234)" required />
                  </div>
                  <button type="submit" className="btn-action danger" style={{ width: '100%', padding: '12px' }}>
                    Autorizar Anulación & Emitir Nota de Crédito
                  </button>
                </form>
              </div>

              <div className="pos-register">
                <h3>Libro de Notas de Crédito Emitidas</h3>
                <table className="data-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Boleta</th>
                      <th>Nota Crédito</th>
                      <th>Monto</th>
                      <th>Comprobante</th>
                    </tr>
                  </thead>
                  <tbody>
                    {annulHistory.map((h, i) => (
                      <tr key={i}>
                        <td>{h.fecha}</td>
                        <td>{h.boleta}</td>
                        <td><span className="tag attended">{h.nc || h.nota_credito}</span></td>
                        <td>S/ {h.monto.toFixed(2)}</td>
                        <td>
                          <button 
                            className="btn-table"
                            onClick={() => {
                              setReceiptData(h);
                              setReceiptType('nota_credito');
                              setIsReceiptOpen(true);
                            }}
                          >
                            Ver NC
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* TAB 5: OPERACIONES DE CAJA */}
        {activeTab === 'operaciones-caja' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <span className="badge-tag gold">Gestión de Caja &amp; Arqueo Diario</span>
                <h3>Control Integral de Caja &amp; Arqueo Diario</h3>
                <small style={{ color: 'var(--color-text-muted)' }}>
                  Apertura con fondo de sencillo, registro de salidas justificadas y conciliación física con emisión de Reporte Z.
                </small>
              </div>
              <span className="badge-status open"><span className="status-dot"></span> Caja Turno Mañana: Abierta</span>
            </div>
            <div className="pos-layout">
              <div className="pos-register">
                <h3>Balance de Caja de Turno</h3>
                <div className="register-summary">
                  <div className="reg-row">
                    <span>Fondo de Apertura (Sencillo):</span>
                    <strong>S/ {caja.apertura.toFixed(2)}</strong>
                  </div>
                  <div className="reg-row">
                    <span>Cobros en Efectivo:</span>
                    <strong>S/ {caja.efectivo.toFixed(2)}</strong>
                  </div>
                  <div className="reg-row">
                    <span>Cobros Digitales (Yape / POS):</span>
                    <strong>S/ {caja.digital.toFixed(2)}</strong>
                  </div>
                  <div className="reg-row">
                    <span>Egresos Menores Justificados:</span>
                    <strong className="neg">- S/ {caja.egresos.toFixed(2)}</strong>
                  </div>
                  <hr />
                  <div className="reg-row total">
                    <span>Saldo Teórico en Sistema:</span>
                    <strong className="pos">S/ {(caja.apertura + caja.efectivo + caja.digital - caja.egresos).toFixed(2)}</strong>
                  </div>
                </div>

                <div className="reg-actions">
                  <button 
                    className="btn-outline" 
                    onClick={() => {
                      const monto = prompt('Monto del gasto menor (S/):', '25.00');
                      const motivo = prompt('Motivo justificado del egreso:', 'Compra de café y artículos de limpieza para salón');
                      if (monto) onExpense(parseFloat(monto) || 0, motivo);
                    }}
                  >
                    - Registrar Egreso Justificado
                  </button>
                  <button 
                    className="btn-action primary" 
                    onClick={() => setIsCashAuditOpen(true)}
                  >
                    Abrir Calculadora de Arqueo Físico
                  </button>
                </div>
              </div>

              <div className="pos-checkout">
                <h3>Auditoría de Cuadre & Meta del Negocio</h3>
                <div style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', padding: '16px', borderRadius: '8px', marginBottom: '14px' }}>
                  <strong style={{ color: 'var(--color-success)' }}>Cumplimiento de Meta SMART (OBJ-02):</strong>
                  <p style={{ fontSize: '0.85rem', color: '#2E7D32', marginTop: '4px' }}>
                    El sistema mantiene una exactitud de cuadre del <strong>98.2% (Meta ≥ 98%)</strong>. Al finalizar la jornada, la calculadora concilia billete por billete con el Reporte Z oficial.
                  </p>
                </div>
                <div style={{ fontSize: '0.84rem', color: 'var(--color-text-muted)' }}>
                  <strong>Últimos Movimientos del Turno:</strong>
                  <ul style={{ paddingLeft: '18px', marginTop: '6px', lineHeight: '1.8' }}>
                    <li>Apertura con sencillo: S/ 150.00</li>
                    <li>Cobro Boleta B001-4820: +S/ 280.00 (Efectivo)</li>
                    <li>Cobro Boleta B001-4821: +S/ 450.00 (Yape)</li>
                    <li>Salida menor por refrigerio: -S/ 45.00</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 6: COMPRAS & PROVEEDORES */}
        {activeTab === 'compras' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <span className="badge-tag gold">Compras &amp; Abastecimiento</span>
                <h3>Gestión de Compras, Proveedores & Kardex de Stock</h3>
                <small style={{ color: 'var(--color-text-muted)' }}>
                  Control de insumos críticos bajo stock mínimo, emisión de Órdenes de Compra y recepción directa al inventario.
                </small>
              </div>
              <button 
                className="btn-action primary" 
                onClick={() => {
                  const proveedor = prompt('Proveedor:', "L'Oréal Professionnel Perú");
                  const insumo = prompt('Insumo a reponer:', 'Tinte Profesional 6.1 (12 tubos)');
                  if (proveedor && insumo) showToast(`[ORDEN DE COMPRA] Generada a ${proveedor} por ${insumo}.`);
                }}
              >
                + Generar Orden de Compra
              </button>
            </div>
            <div className="agenda-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Insumo / Tratamiento</th>
                    <th>Proveedor Autorizado</th>
                    <th>Stock Actual</th>
                    <th>Stock Mínimo</th>
                    <th>Estado de Alerta</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {insumos.map(ins => (
                    <tr key={ins.id}>
                      <td><strong>{ins.nombre}</strong></td>
                      <td>{ins.proveedor}</td>
                      <td><strong>{ins.stock}</strong> unid.</td>
                      <td>{ins.stock_min} unid.</td>
                      <td>
                        {ins.alerta ? (
                          <span className="tag in-progress">Stock Crítico [ALERTA]</span>
                        ) : (
                          <span className="tag attended">Abastecido [OK]</span>
                        )}
                      </td>
                      <td>
                        <button 
                          className="btn-table primary" 
                          onClick={() => onReceiveStock(ins.id, 6)}
                        >
                          Recepcionar +6 Stock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 7: CATALOGO DE SERVICIOS */}
        {activeTab === 'catalogo' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <span className="badge-tag gold">Catálogo &amp; Tarifario</span>
                <h3>Catálogo de Tratamientos, Tarifario & Comisiones</h3>
                <small style={{ color: 'var(--color-text-muted)' }}>
                  Administración de precios al público, duración en cabina y comisiones de las estilistas (25%-35%).
                </small>
              </div>
              <button className="btn-action primary" onClick={() => showToast('Formulario de alta de nuevo servicio abierto')}>
                + Añadir Servicio
              </button>
            </div>
            <div className="agenda-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tratamiento</th>
                    <th>Categoría</th>
                    <th>Duración</th>
                    <th>Precio al Público</th>
                    <th>Comisión Estilista</th>
                    <th>Estado en Portal Web</th>
                  </tr>
                </thead>
                <tbody>
                  {catalogo.map(cat => (
                    <tr key={cat.id}>
                      <td><strong>{cat.nombre}</strong></td>
                      <td>{cat.categoria}</td>
                      <td>{cat.duracion} min</td>
                      <td>S/ {cat.precio.toFixed(2)}</td>
                      <td>{cat.comision}% (S/ {(cat.precio * cat.comision / 100).toFixed(2)})</td>
                      <td><span className="tag attended">Visible en Portal Web</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 8: USUARIOS Y ACCESOS */}
        {activeTab === 'usuarios' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <span className="badge-tag gold">Seguridad &amp; Accesos</span>
                <h3>Administración de Usuarios, Roles & Matriz de Seguridad</h3>
                <small style={{ color: 'var(--color-text-muted)' }}>
                  Control de privilegios por perfil de puesto: Recepcionista, Cajero, Estilista y Gerencia General.
                </small>
              </div>
            </div>
            <div className="agenda-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Colaborador</th>
                    <th>Rol de Puesto</th>
                    <th>Módulos Permitidos</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(u => (
                    <tr key={u.usuario}>
                      <td><strong>{u.usuario}</strong></td>
                      <td>{u.nombre}</td>
                      <td><span className="tag confirmed">{u.rol}</span></td>
                      <td>{u.permisos}</td>
                      <td><span className="tag attended">Activo</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 9: REPORTES GERENCIALES */}
        {activeTab === 'reportes' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <span className="badge-tag gold">Inteligencia de Negocio &amp; Metas</span>
                <h3>Reportes Gerenciales & Cumplimiento de Metas SMART</h3>
                <small style={{ color: 'var(--color-text-muted)' }}>
                  Monitoreo estadístico de los 4 objetivos estratégicos con porcentajes reales para la toma de decisiones gerenciales.
                </small>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button className="btn-action success" onClick={() => showToast('Exportando reporte ejecutivo en PDF...')}>
                  Descargar Reporte Ejecutivo PDF
                </button>
              </div>
            </div>
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-icon blue"><TargetIcon size={20} /></div>
                <div className="kpi-data">
                  <span className="kpi-title">OBJ-01 Puntualidad y Citas</span>
                  <strong className="kpi-val">88.5%</strong>
                  <small className="kpi-sub positive">Meta: ≥ 88% (-35% inasistencias)</small>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon green"><TargetIcon size={20} /></div>
                <div className="kpi-data">
                  <span className="kpi-title">OBJ-02 Cuadre de Caja</span>
                  <strong className="kpi-val">98.2%</strong>
                  <small className="kpi-sub positive">Meta: ≥ 98% (-90% descuadres)</small>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon purple"><TargetIcon size={20} /></div>
                <div className="kpi-data">
                  <span className="kpi-title">OBJ-03 Insumos Críticos</span>
                  <strong className="kpi-val">96.5%</strong>
                  <small className="kpi-sub positive">Meta: ≥ 95% (-80% quiebres)</small>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon red"><TargetIcon size={20} /></div>
                <div className="kpi-data">
                  <span className="kpi-title">OBJ-04 Fidelización Clientes</span>
                  <strong className="kpi-val">74.0%</strong>
                  <small className="kpi-sub positive">Meta: ≥ 70% (+25% retorno &lt;45d)</small>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* MODALES DIDÁCTICOS */}
      <CashAuditModal 
        isOpen={isCashAuditOpen}
        onClose={() => setIsCashAuditOpen(false)}
        saldoTeorico={caja.apertura + caja.efectivo + caja.digital - caja.egresos}
        onConfirmCierre={(totalFisico, dif) => {
          onCloseCaja(totalFisico);
          showToast(`[CAJA] Arqueo completado. Saldo físico S/ ${totalFisico.toFixed(2)}. Reporte Z generado.`);
        }}
      />

      <ElectronicReceiptModal 
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        ventaData={receiptData}
        tipo={receiptType}
      />

      <ClientFileModal 
        isOpen={isClientFileOpen}
        onClose={() => setIsClientFileOpen(false)}
        cliente={selectedClient}
        onSaveClient={(updated) => {
          onSaveClient(updated);
          showToast(`Ficha clínica de ${updated.nombre} actualizada con éxito.`);
        }}
      />

      <AppointmentModal 
        isOpen={isApptModalOpen}
        onClose={() => setIsApptModalOpen(false)}
        citaEditando={editingAppt}
        existingCitas={citas}
        onSaveCita={(newCita) => {
          onAddCita(newCita);
          showToast(`Cita agendada para ${newCita.cliente} con ${newCita.especialista}.`);
        }}
        onReprogramCita={(id, nFecha, nHora) => {
          onReprogramCita(id, nFecha, nHora);
          showToast(`Cita reprogramada para ${nFecha} a las ${nHora}.`);
        }}
        onCancelCita={(id, motivo) => {
          onCancelCita(id, motivo);
          showToast(`Cita cancelada con motivo: ${motivo}`);
        }}
      />
    </div>
  );
}
