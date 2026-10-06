import React, { useState } from 'react';

export default function Dashboard({ 
  citas, 
  clientes, 
  caja, 
  insumos, 
  catalogo, 
  usuarios, 
  onChargeAppointment, 
  onProcessPayment, 
  onAddClient, 
  onProcessAnnulment, 
  onExpense, 
  onCloseCaja,
  showToast 
}) {
  const [activeTab, setActiveTab] = useState('agenda');
  const [posClient, setPosClient] = useState('Patricia Valdivia');
  const [posService, setPosService] = useState('Facial Rejuvenecedor con Oro');
  const [posAmount, setPosAmount] = useState('520.00');
  const [posPaymentMethod, setPosPaymentMethod] = useState('Yape/Plin');
  const [annulTicket, setAnnulTicket] = useState('B001-0004821');
  const [annulPin, setAnnulPin] = useState('1234');
  const [annulMotivo, setAnnulMotivo] = useState('Error en digitación de importe');
  const [annulHistory, setAnnulHistory] = useState([
    { fecha: '05/10/2026', boleta: 'B001-0004810', nc: 'NC-012', monto: 120.0 }
  ]);

  const handleChargeFromAgenda = (cita) => {
    setPosClient(cita.cliente);
    setPosService(cita.servicio);
    setPosAmount(cita.monto.toString());
    setActiveTab('caja');
    showToast(`Datos cargados a Terminal POS: ${cita.cliente} (S/ ${cita.monto})`);
  };

  const handleExecutePayment = (e) => {
    e.preventDefault();
    const amountNum = parseFloat(posAmount) || 0;
    if (amountNum <= 0) return;

    onProcessPayment({
      cliente: posClient,
      servicio: posService,
      monto: amountNum,
      medio_pago: posPaymentMethod
    });

    showToast(`✅ Venta completada: Boleta emitida a ${posClient} por S/ ${amountNum.toFixed(2)} (${posPaymentMethod})`);
  };

  const handleExecuteAnnulment = (e) => {
    e.preventDefault();
    if (annulPin !== '1234') {
      showToast('❌ Error: PIN de autorización gerencial incorrecto.');
      return;
    }

    const newNC = {
      fecha: 'Hoy (Ahora)',
      boleta: annulTicket,
      nc: `NC-${annulHistory.length + 13}`,
      monto: 520.0
    };

    setAnnulHistory([newNC, ...annulHistory]);
    onProcessAnnulment(520.0);
    showToast(`✅ Anulación aprobada por Gerencia. Se emitió ${newNC.nc} para ${annulTicket}. Reversión efectuada en caja.`);
  };

  const handleNewClient = () => {
    const dni = prompt('Ingrese DNI del cliente (8 dígitos):', '75981240');
    if (!dni) return;
    const nombre = prompt('Nombre completo:', 'Lucía Benavides');
    const pref = prompt('Condiciones estéticas / preferencias:', 'Piel sensible a ácidos, prefiere atención tarde.');
    if (nombre) {
      onAddClient({ dni, nombre, telefono: '976543210', preferencias: pref, visitas: 1 });
      showToast(`✅ Cliente ${nombre} agregado al padrón con ficha estética.`);
    }
  };

  const handleNewExpense = () => {
    const monto = prompt('Monto del gasto menor de caja (S/):', '25.00');
    const motivo = prompt('Motivo del egreso:', 'Compra de café y artículos de limpieza');
    if (monto) {
      onExpense(parseFloat(monto) || 0, motivo);
      showToast(`Egreso registrado: S/ ${monto} (${motivo})`);
    }
  };

  const handleCloseShift = () => {
    if (confirm('¿Desea realizar el Arqueo y Cierre de Caja del turno actual?')) {
      onCloseCaja();
      showToast('🔒 Caja cerrada. Arqueo cuadrado al 100% con emisión de Reporte Z.');
    }
  };

  return (
    <div className="admin-layout">
      {/* Sidebar with 9 Use Cases */}
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <span className="brand-badge">SPA</span>
          <span>Salon Spa Aleida</span>
        </div>
        <nav className="sidebar-menu">
          <button className={activeTab === 'agenda' ? 'active' : ''} onClick={() => setActiveTab('agenda')}>
            <span>📅</span> Agenda de Citas <small className="cu-badge">CU01</small>
          </button>
          <button className={activeTab === 'clientes' ? 'active' : ''} onClick={() => setActiveTab('clientes')}>
            <span>👥</span> Padrón de Clientes <small className="cu-badge">CU02</small>
          </button>
          <button className={activeTab === 'caja' ? 'active' : ''} onClick={() => setActiveTab('caja')}>
            <span>💵</span> Punto de Venta <small className="cu-badge">CU03</small>
          </button>
          <button className={activeTab === 'anulaciones' ? 'active' : ''} onClick={() => setActiveTab('anulaciones')}>
            <span>🚫</span> Anulación de Venta <small className="cu-badge">CU04</small>
          </button>
          <button className={activeTab === 'operaciones-caja' ? 'active' : ''} onClick={() => setActiveTab('operaciones-caja')}>
            <span>🔒</span> Operaciones de Caja <small className="cu-badge">CU05</small>
          </button>
          <button className={activeTab === 'compras' ? 'active' : ''} onClick={() => setActiveTab('compras')}>
            <span>📦</span> Compras & Insumos <small className="cu-badge">CU06</small>
          </button>
          <button className={activeTab === 'catalogo' ? 'active' : ''} onClick={() => setActiveTab('catalogo')}>
            <span>🏷️</span> Catálogo de Servicios <small className="cu-badge">CU07</small>
          </button>
          <button className={activeTab === 'usuarios' ? 'active' : ''} onClick={() => setActiveTab('usuarios')}>
            <span>🔐</span> Usuarios y Roles <small className="cu-badge">CU08</small>
          </button>
          <button className={activeTab === 'reportes' ? 'active' : ''} onClick={() => setActiveTab('reportes')}>
            <span>📊</span> Reportes Gerenciales <small className="cu-badge">CU09</small>
          </button>
        </nav>
        <div className="sidebar-user">
          <div className="user-avatar">CR</div>
          <div className="user-info">
            <strong>Camila Ramos</strong>
            <small>Recepcionista Principal</small>
          </div>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <main className="admin-main">
        {/* Header Bar */}
        <header className="admin-header">
          <div className="header-search">
            <input type="text" placeholder="Buscar cliente por DNI, nombre o cita..." />
          </div>
          <div className="header-status">
            <span className="badge-status open">
              <span className="status-dot"></span> Caja Turno Mañana: <strong>S/ {(caja.apertura + caja.efectivo + caja.digital - caja.egresos).toFixed(2)}</strong>
            </span>
            <button className="btn-action primary" onClick={() => setActiveTab('agenda')}>+ Agenda</button>
            <button className="btn-action success" onClick={() => setActiveTab('caja')}>⚡ Cobro POS</button>
          </div>
        </header>

        {/* KPI Cards: Tracking the 4 Realistic SMART Objectives */}
        <div className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon blue">📅</div>
            <div className="kpi-data">
              <span className="kpi-title">Puntualidad en Citas</span>
              <strong className="kpi-val">88.5%</strong>
              <small className="kpi-sub positive">OBJ-01: Meta ≥ 88% (-35% inasistencias)</small>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon green">💰</div>
            <div className="kpi-data">
              <span className="kpi-title">Exactitud Arqueo Caja</span>
              <strong className="kpi-val">98.2%</strong>
              <small className="kpi-sub positive">OBJ-02: Meta ≥ 98% (-90% descuadres)</small>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon purple">📦</div>
            <div className="kpi-data">
              <span className="kpi-title">Disponibilidad Insumos</span>
              <strong className="kpi-val">96.5%</strong>
              <small className="kpi-sub positive">OBJ-03: Meta ≥ 95% (-80% quiebres)</small>
            </div>
          </div>
          <div className="kpi-card">
            <div className="kpi-icon red">💎</div>
            <div className="kpi-data">
              <span className="kpi-title">Retención de Clientes</span>
              <strong className="kpi-val">74.0%</strong>
              <small className="kpi-sub positive">OBJ-04: Meta ≥ 70% (+25% recompra)</small>
            </div>
          </div>
        </div>

        {/* TAB 1: AGENDA DE CITAS (CU01 / AD01) */}
        {activeTab === 'agenda' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <h3>Agenda de Citas del Día (CU01)</h3>
                <small style={{ color: 'var(--color-text-muted)' }}>Diagrama AD01: Solicitud de cita → Verificación de terapeuta → Confirmación → Atención</small>
              </div>
            </div>
            <div className="agenda-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Horario</th>
                    <th>Cliente</th>
                    <th>Servicio Solicitado</th>
                    <th>Terapeuta / Sillón</th>
                    <th>Estado</th>
                    <th>Monto</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {citas.map(c => (
                    <tr key={c.id}>
                      <td><strong>{c.hora}</strong></td>
                      <td>{c.cliente}<br /><small>{c.dni ? `DNI: ${c.dni}` : 'Canal Web'}</small></td>
                      <td>{c.servicio}</td>
                      <td>{c.especialista}</td>
                      <td>
                        <span className={`tag ${c.estado === 'Atendida' ? 'attended' : c.estado === 'Confirmada' ? 'confirmed' : 'in-progress'}`}>
                          {c.estado}
                        </span>
                      </td>
                      <td>S/ {c.monto.toFixed(2)}</td>
                      <td>
                        {c.cobrado ? (
                          <button className="btn-table" disabled style={{ opacity: 0.7 }}>Cobrado ✓</button>
                        ) : (
                          <button className="btn-table primary" onClick={() => handleChargeFromAgenda(c)}>
                            Cobrar en Caja
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 2: PADRON DE CLIENTES (CU02 / AD02) */}
        {activeTab === 'clientes' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <h3>Padrón de Clientes & Ficha Estética (CU02)</h3>
                <small style={{ color: 'var(--color-text-muted)' }}>Diagrama AD02: Búsqueda por DNI → Validación de recurrencia → Ficha clínica y preferencias</small>
              </div>
              <button className="btn-action primary" onClick={handleNewClient}>+ Registrar Nuevo Cliente</button>
            </div>
            <div className="agenda-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>DNI</th>
                    <th>Nombres y Apellidos</th>
                    <th>Teléfono</th>
                    <th>Preferencias / Historial Clínico</th>
                    <th>Visitas</th>
                    <th>Última Atención</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.map(cl => (
                    <tr key={cl.dni}>
                      <td><strong>{cl.dni}</strong></td>
                      <td>{cl.nombre}</td>
                      <td>{cl.telefono}</td>
                      <td>{cl.preferencias}</td>
                      <td>{cl.visitas}</td>
                      <td>{cl.ultima_visita}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 3: PUNTO DE VENTA (CU03 / AD03) */}
        {activeTab === 'caja' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <h3>Terminal de Punto de Venta & Cobranza (CU03)</h3>
                <small style={{ color: 'var(--color-text-muted)' }}>Diagrama AD03: Selección de cita → Cálculo con IGV (18%) → Medio de pago → Boleta electrónica</small>
              </div>
            </div>
            <div className="pos-layout">
              <div className="pos-checkout">
                <h3>Liquidar Venta Inmediata</h3>
                <form onSubmit={handleExecutePayment}>
                  <div className="form-group">
                    <label>Cliente</label>
                    <input type="text" value={posClient} onChange={(e) => setPosClient(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Concepto a Liquidar</label>
                    <input type="text" value={posService} onChange={(e) => setPosService(e.target.value)} required />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Total a Cobrar</label>
                      <input type="number" step="0.01" className="input-big" value={posAmount} onChange={(e) => setPosAmount(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Medio de Pago</label>
                      <select value={posPaymentMethod} onChange={(e) => setPosPaymentMethod(e.target.value)}>
                        <option value="Yape/Plin">Billetera Digital (Yape / Plin)</option>
                        <option value="Tarjeta POS">Tarjeta Crédito / Débito POS</option>
                        <option value="Efectivo">Efectivo en Caja</option>
                        <option value="Mixto">Pago Mixto</option>
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn-pos-pay">
                    Procesar Pago y Emitir Boleta (AD03)
                  </button>
                </form>
              </div>
              <div className="pos-register">
                <h3>Desglose Tributario del Comprobante</h3>
                <div className="register-summary">
                  <div className="reg-row">
                    <span>Subtotal Neto:</span>
                    <strong>S/ {(parseFloat(posAmount || 0) / 1.18).toFixed(2)}</strong>
                  </div>
                  <div className="reg-row">
                    <span>IGV Aplicable (18%):</span>
                    <strong>S/ {(parseFloat(posAmount || 0) - parseFloat(posAmount || 0) / 1.18).toFixed(2)}</strong>
                  </div>
                  <hr />
                  <div className="reg-row total">
                    <span>Total Facturado:</span>
                    <strong className="pos">S/ {parseFloat(posAmount || 0).toFixed(2)}</strong>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 4: ANULACIONES (CU04 / AD04) */}
        {activeTab === 'anulaciones' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <h3>Gestión de Anulaciones & Notas de Crédito (CU04)</h3>
                <small style={{ color: 'var(--color-text-muted)' }}>Diagrama AD04: Boleta a anular → Motivo de insatisfacción/error → Validación PIN Gerente → Reversión contable</small>
              </div>
            </div>
            <div className="pos-layout">
              <div className="pos-checkout">
                <h3>Solicitar Anulación de Boleta</h3>
                <form onSubmit={handleExecuteAnnulment}>
                  <div className="form-group">
                    <label>Número de Boleta</label>
                    <input type="text" value={annulTicket} onChange={(e) => setAnnulTicket(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Motivo de la Anulación</label>
                    <select value={annulMotivo} onChange={(e) => setAnnulMotivo(e.target.value)}>
                      <option value="Error en digitación de importe">Error en digitación de importe</option>
                      <option value="Devolución por insatisfacción">Insatisfacción con tratamiento</option>
                      <option value="Comprobante duplicado">Comprobante duplicado</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>PIN de Autorización Gerencial</label>
                    <input type="password" value={annulPin} onChange={(e) => setAnnulPin(e.target.value)} placeholder="PIN (1234)" required />
                  </div>
                  <button type="submit" className="btn-action success" style={{ width: '100%', padding: '12px' }}>
                    Aprobar Anulación & Emitir Nota de Crédito
                  </button>
                </form>
              </div>
              <div className="pos-register">
                <h3>Historial de Notas de Crédito</h3>
                <table className="data-table" style={{ fontSize: '0.8rem' }}>
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Boleta</th>
                      <th>Nota Crédito</th>
                      <th>Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {annulHistory.map((h, i) => (
                      <tr key={i}>
                        <td>{h.fecha}</td>
                        <td>{h.boleta}</td>
                        <td><span className="tag attended">{h.nc}</span></td>
                        <td>S/ {h.monto.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        )}

        {/* TAB 5: OPERACIONES DE CAJA (CU05 / AD05) */}
        {activeTab === 'operaciones-caja' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <h3>Control Integral de Caja y Arqueo de Turno (CU05)</h3>
                <small style={{ color: 'var(--color-text-muted)' }}>Diagrama AD05: Apertura con fondo inicial → Registro de salidas → Arqueo físico vs sistema → Cierre con Reporte Z</small>
              </div>
              <span className="badge-status open"><span className="status-dot"></span> Caja Turno Mañana: Abierta</span>
            </div>
            <div className="pos-layout">
              <div className="pos-register">
                <h3>Balance Teórico del Turno</h3>
                <div className="register-summary">
                  <div className="reg-row">
                    <span>Fondo de Apertura (Sencillo):</span>
                    <strong>S/ {caja.apertura.toFixed(2)}</strong>
                  </div>
                  <div className="reg-row">
                    <span>Ingresos en Efectivo:</span>
                    <strong>S/ {caja.efectivo.toFixed(2)}</strong>
                  </div>
                  <div className="reg-row">
                    <span>Ingresos Digitales (Yape / POS):</span>
                    <strong>S/ {caja.digital.toFixed(2)}</strong>
                  </div>
                  <div className="reg-row">
                    <span>Gastos / Salidas Menores:</span>
                    <strong className="neg">- S/ {caja.egresos.toFixed(2)}</strong>
                  </div>
                  <hr />
                  <div className="reg-row total">
                    <span>Saldo Teórico en Sistema:</span>
                    <strong className="pos">S/ {(caja.apertura + caja.efectivo + caja.digital - caja.egresos).toFixed(2)}</strong>
                  </div>
                </div>
                <div className="reg-actions">
                  <button className="btn-outline" onClick={handleNewExpense}>- Registrar Salida Menor Justificada</button>
                  <button className="btn-outline danger" onClick={handleCloseShift}>🔒 Realizar Arqueo Físico & Cierre (Reporte Z)</button>
                </div>
              </div>
              <div className="pos-checkout">
                <h3>Auditoría y Arqueo Cuadrado</h3>
                <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', marginBottom: '14px' }}>
                  El sistema valida en tiempo real la coincidencia entre el dinero físico contado en mostrador y los comprobantes emitidos, garantizando la meta de <strong>98% de exactitud en cuadre (OBJ-02)</strong>.
                </p>
                <div style={{ background: 'var(--color-success-bg)', border: '1px solid #A5D6A7', color: 'var(--color-success)', padding: '12px', borderRadius: '8px', fontSize: '0.85rem' }}>
                  ✓ Sin discrepancias pendientes. Auditoría conforme.
                </div>
              </div>
            </div>
          </section>
        )}

        {/* TAB 6: COMPRAS & INSUMOS (CU06 / AD06) */}
        {activeTab === 'compras' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <h3>Gestión de Compras & Proveedores (CU06)</h3>
                <small style={{ color: 'var(--color-text-muted)' }}>Diagrama AD06: Detección de insumo crítico → Emisión de Orden de Compra → Recepción de mercadería</small>
              </div>
              <button className="btn-action primary" onClick={() => showToast('📦 Orden de Compra generada a L\'Oréal Professionnel.')}>+ Generar Orden de Compra</button>
            </div>
            <div className="agenda-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Insumo / Producto</th>
                    <th>Proveedor</th>
                    <th>Stock Actual</th>
                    <th>Stock Mínimo</th>
                    <th>Alerta</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {insumos.map(ins => (
                    <tr key={ins.id}>
                      <td><strong>{ins.nombre}</strong></td>
                      <td>{ins.proveedor}</td>
                      <td>{ins.stock} unid.</td>
                      <td>{ins.stock_min} unid.</td>
                      <td>
                        {ins.alerta ? (
                          <span className="tag in-progress">Stock Crítico ⚠️</span>
                        ) : (
                          <span className="tag attended">Abastecido ✓</span>
                        )}
                      </td>
                      <td>
                        <button className="btn-table primary" onClick={() => showToast(`Reposición solicitada para ${ins.nombre}`)}>
                          Pedir Stock
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 7: CATALOGO DE SERVICIOS (CU07 / AD07) */}
        {activeTab === 'catalogo' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <h3>Catálogo de Servicios y Tarifario (CU07)</h3>
                <small style={{ color: 'var(--color-text-muted)' }}>Diagrama AD07: Alta, actualización de tarifas, tiempos de sesión y visibilidad en portal web</small>
              </div>
              <button className="btn-action primary" onClick={() => showToast('Formulario de nuevo servicio añadido')}>+ Añadir Servicio</button>
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
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {catalogo.map(cat => (
                    <tr key={cat.id}>
                      <td><strong>{cat.nombre}</strong></td>
                      <td>{cat.categoria}</td>
                      <td>{cat.duracion} min</td>
                      <td>S/ {cat.precio.toFixed(2)}</td>
                      <td>{cat.comision}%</td>
                      <td><span className="tag attended">Activo en Portal</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 8: USUARIOS Y ACCESOS (CU08 / AD08) */}
        {activeTab === 'usuarios' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <h3>Administración de Usuarios y Roles (CU08)</h3>
                <small style={{ color: 'var(--color-text-muted)' }}>Diagrama AD08: Asignación de credenciales, roles y permisos de módulo</small>
              </div>
            </div>
            <div className="agenda-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Usuario</th>
                    <th>Colaborador</th>
                    <th>Rol Asignado</th>
                    <th>Permisos</th>
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

        {/* TAB 9: REPORTES GERENCIALES (CU09 / AD09) */}
        {activeTab === 'reportes' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <h3>Reportes Gerenciales & Objetivos SMART (CU09)</h3>
                <small style={{ color: 'var(--color-text-muted)' }}>Diagrama AD09: Consolidación de ingresos, productividad y KPIs de los 4 objetivos</small>
              </div>
              <button className="btn-action success" onClick={() => showToast('Exportando reporte ejecutivo en PDF...')}>📥 Descargar Reporte Ejecutivo</button>
            </div>
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-icon blue">🎯</div>
                <div className="kpi-data">
                  <span className="kpi-title">OBJ-01 Puntualidad y Citas</span>
                  <strong className="kpi-val">88.5%</strong>
                  <small className="kpi-sub positive">Meta: ≥ 88% (-35% inasistencias)</small>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon green">🎯</div>
                <div className="kpi-data">
                  <span className="kpi-title">OBJ-02 Cuadre de Caja</span>
                  <strong className="kpi-val">98.2%</strong>
                  <small className="kpi-sub positive">Meta: ≥ 98% (-90% descuadres)</small>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon purple">🎯</div>
                <div className="kpi-data">
                  <span className="kpi-title">OBJ-03 Insumos Críticos</span>
                  <strong className="kpi-val">96.5%</strong>
                  <small className="kpi-sub positive">Meta: ≥ 95% (-80% quiebres)</small>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon red">🎯</div>
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
    </div>
  );
}
