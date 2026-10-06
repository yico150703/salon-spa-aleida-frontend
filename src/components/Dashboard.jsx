import React, { useState } from 'react';
import CashAuditModal from './CashAuditModal';
import ElectronicReceiptModal from './ElectronicReceiptModal';
import ClientFileModal from './ClientFileModal';
import AppointmentModal from './AppointmentModal';

export default function Dashboard({ 
  citas, 
  clientes, 
  caja, 
  insumos, 
  catalogo, 
  usuarios, 
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
  onOpenLayerInspector,
  onOpenRequirementsGuide,
  showToast 
}) {
  const [activeTab, setActiveTab] = useState('agenda');

  // Modals state
  const [isCashAuditOpen, setIsCashAuditOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [receiptType, setReceiptType] = useState('boleta'); // 'boleta' | 'nota_credito'
  const [isClientFileOpen, setIsClientFileOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isApptModalOpen, setIsApptModalOpen] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null);

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

    setReceiptData(nuevaBoleta);
    setReceiptType('boleta');
    setIsReceiptOpen(true);

    showToast(`✅ Boleta electrónica emitida con éxito a ${posClient} por S/ ${totalFacturado.toFixed(2)}.`);
  };

  const handleExecuteAnnulment = (e) => {
    e.preventDefault();
    if (annulPin !== '1234') {
      showToast('❌ Acceso denegado: PIN de autorización gerencial incorrecto.');
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

    showToast(`✅ Anulación aprobada por Gerencia. Se emitió ${newNC.nc} para ${annulTicket}.`);
  };

  const handleOpenClientFile = (cliente) => {
    setSelectedClient(cliente);
    setIsClientFileOpen(true);
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

      {/* Main Content Area */}
      <main className="admin-main">
        {/* Top Header Bar */}
        <header className="admin-header">
          <div className="header-search">
            <input type="text" placeholder="Buscar cliente por DNI, nombre o cita..." />
          </div>
          <div className="header-status">
            <button className="btn-action primary" onClick={onOpenLayerInspector}>
              🔍 Inspector de Arquitectura
            </button>
            <button className="btn-action" style={{ background: '#E3F2FD', color: '#0288D1' }} onClick={onOpenRequirementsGuide}>
              📋 Guía de Requerimientos (RFs)
            </button>
            <span className="badge-status open">
              <span className="status-dot"></span> Caja Turno: <strong>S/ {(caja.apertura + caja.efectivo + caja.digital - caja.egresos).toFixed(2)}</strong>
            </span>
          </div>
        </header>

        {/* KPI Cards: The 4 Realistic SMART Objectives */}
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

        {/* TAB 1: AGENDA DE CITAS (CU01 / RF02, RF03) */}
        {activeTab === 'agenda' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <span className="badge-tag gold">CASO DE USO CU01 • REQUISITOS RF02, RF03</span>
                <h3>Agenda de Citas & Control de Sillones</h3>
                <small style={{ color: 'var(--color-text-muted)' }}>
                  Valida en tiempo real la disponibilidad de especialistas (RF02) y permite reprogramar, cancelar y registrar estados de atención (RF03).
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
                    <th>Acciones Didácticas</th>
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
                          👤 Ver Ficha RF01
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
                              Ver Boleta ✓
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

        {/* TAB 2: PADRON DE CLIENTES (CU02 / RF01) */}
        {activeTab === 'clientes' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <span className="badge-tag gold">CASO DE USO CU02 • REQUISITO RF01</span>
                <h3>Padrón Centralizado de Clientes & Fichas Clínicas</h3>
                <small style={{ color: 'var(--color-text-muted)' }}>
                  Almacena el historial estético, visitas acumuladas, sensibilidad dérmica y preferencias personalizadas de cada clienta.
                </small>
              </div>
              <button className="btn-action primary" onClick={() => {
                const dni = prompt('DNI del cliente:');
                if (dni) {
                  const nombre = prompt('Nombre completo:');
                  if (nombre) onAddClient({ dni, nombre, telefono: '987654321', preferencias: 'Nueva ficha estética', visitas: 1 });
                }
              }}>
                + Nuevo Cliente
              </button>
            </div>
            <div className="agenda-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>DNI</th>
                    <th>Nombres y Apellidos</th>
                    <th>Teléfono</th>
                    <th>Historial Estético & Alergias</th>
                    <th>Visitas</th>
                    <th>Última Atención</th>
                    <th>Acción</th>
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
                      <td>
                        <button className="btn-table primary" onClick={() => handleOpenClientFile(cl)}>
                          Abrir Expediente RF01
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 3: PUNTO DE VENTA (CU03 / RF04, RF05) */}
        {activeTab === 'caja' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <span className="badge-tag gold">CASO DE USO CU03 • REQUISITOS RF04, RF05</span>
                <h3>Punto de Venta (POS) & Emisión de Boleta Electrónica</h3>
                <small style={{ color: 'var(--color-text-muted)' }}>
                  Soporta servicios combinados con productos de reventa, descuentos promocionales, cálculo automático del IGV (18%) y cobro multicanal con vuelto.
                </small>
              </div>
            </div>
            <div className="pos-layout">
              <div className="pos-checkout">
                <h3>Terminal de Facturación Inmediata</h3>
                <form onSubmit={handleExecutePayment}>
                  <div className="form-group">
                    <label>Cliente Titular</label>
                    <input type="text" value={posClient} onChange={(e) => setPosClient(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Tratamiento Principal</label>
                    <input type="text" value={posService} onChange={(e) => setPosService(e.target.value)} required />
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Precio del Servicio (S/)</label>
                      <input type="number" step="0.01" value={posAmount} onChange={(e) => setPosAmount(e.target.value)} required />
                    </div>
                    <div className="form-group">
                      <label>Producto Adicional de Salón (RF04)</label>
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
                      <label>Descuento Promocional (RF04)</label>
                      <select value={posDiscount} onChange={(e) => setPosDiscount(e.target.value)}>
                        <option value="0">Sin Descuento (0%)</option>
                        <option value="10">Cliente Frecuente (10% Desc.)</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Medio de Pago (RF05)</label>
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
                    <strong>📱 Código QR de Cobro Digital Generado</strong><br />
                    <small>Cliente escanea y confirma recepción instantánea.</small>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* TAB 4: ANULACIONES (CU04 / RF06) */}
        {activeTab === 'anulaciones' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <span className="badge-tag gold">CASO DE USO CU04 • REQUISITO RF06</span>
                <h3>Gestión de Anulaciones & Emisión de Notas de Crédito</h3>
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
                    <label>Motivo Obligatorio (RF06)</label>
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

        {/* TAB 5: OPERACIONES DE CAJA (CU05 / RF07, RF08) */}
        {activeTab === 'operaciones-caja' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <span className="badge-tag gold">CASO DE USO CU05 • REQUISITOS RF07, RF08</span>
                <h3>Control Integral de Caja & Arqueo Diario</h3>
                <small style={{ color: 'var(--color-text-muted)' }}>
                  Apertura con fondo de sencillo, registro de salidas justificadas (RF07) y conciliación física con emisión de Reporte Z (RF08).
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
                    - Registrar Egreso Justificado (RF07)
                  </button>
                  <button 
                    className="btn-action primary" 
                    onClick={() => setIsCashAuditOpen(true)}
                  >
                    🧮 Abrir Calculadora de Arqueo Físico (RF08)
                  </button>
                </div>
              </div>

              <div className="pos-checkout">
                <h3>Auditoría de Cuadre & Meta del Negocio</h3>
                <div style={{ background: '#E8F5E9', border: '1px solid #A5D6A7', padding: '16px', borderRadius: '8px', marginBottom: '14px' }}>
                  <strong style={{ color: 'var(--color-success)' }}>🎯 Cumplimiento de Meta SMART (OBJ-02):</strong>
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

        {/* TAB 6: COMPRAS & PROVEEDORES (CU06 / RF09) */}
        {activeTab === 'compras' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <span className="badge-tag gold">CASO DE USO CU06 • REQUISITO RF09</span>
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
                  if (proveedor && insumo) showToast(`📦 Orden de Compra generada a ${proveedor} por ${insumo}.`);
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
                    <th>Acción Didáctica</th>
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
                          <span className="tag in-progress">Stock Crítico ⚠️</span>
                        ) : (
                          <span className="tag attended">Abastecido ✓</span>
                        )}
                      </td>
                      <td>
                        <button 
                          className="btn-table primary" 
                          onClick={() => onReceiveStock(ins.id, 6)}
                        >
                          Recepcionar +6 Stock (RF09)
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* TAB 7: CATALOGO DE SERVICIOS (CU07 / RF10) */}
        {activeTab === 'catalogo' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <span className="badge-tag gold">CASO DE USO CU07 • REQUISITO RF10</span>
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

        {/* TAB 8: USUARIOS Y ACCESOS (CU08 / RF11) */}
        {activeTab === 'usuarios' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <span className="badge-tag gold">CASO DE USO CU08 • REQUISITO RF11</span>
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

        {/* TAB 9: REPORTES GERENCIALES (CU09 / RF12) */}
        {activeTab === 'reportes' && (
          <section className="admin-tab">
            <div className="tab-header">
              <div>
                <span className="badge-tag gold">CASO DE USO CU09 • REQUISITO RF12</span>
                <h3>Reportes Gerenciales & Cumplimiento de Metas SMART</h3>
                <small style={{ color: 'var(--color-text-muted)' }}>
                  Monitoreo estadístico de los 4 objetivos estratégicos con porcentajes reales para la toma de decisiones gerenciales.
                </small>
              </div>
              <button className="btn-action success" onClick={() => showToast('Exportando reporte ejecutivo en PDF...')}>
                📥 Descargar Reporte Ejecutivo PDF
              </button>
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

      {/* MODALES DIDÁCTICOS */}
      <CashAuditModal 
        isOpen={isCashAuditOpen}
        onClose={() => setIsCashAuditOpen(false)}
        saldoTeorico={caja.apertura + caja.efectivo + caja.digital - caja.egresos}
        onConfirmCierre={(totalFisico, dif) => {
          onCloseCaja(totalFisico);
          showToast(`🔒 Arqueo completado. Saldo físico S/ ${totalFisico.toFixed(2)}. Reporte Z generado.`);
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
