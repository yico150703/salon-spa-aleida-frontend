import React, { useState } from 'react';
import { api } from '../api';

/**
 * =============================================================================
 * CUS03: REGISTRAR Y CONSULTAR CLIENTE EN PADRÓN CENTRALIZADO
 * Cumple estrictamente con el Diagrama de Secuencia y Requisitos CUS03:
 * 1. Consultar existencia del cliente por DNI en Base de Datos.
 * 2. Si el cliente ya está registrado: retorna datos de cliente existente y
 *    despliega su Ficha Estética con expediente cargado.
 * 3. Si no está registrado: habilita el formulario de nuevo cliente (nombres,
 *    teléfono, preferencias), valida los datos y registra en PostgreSQL.
 * 4. Confirma almacenamiento exitoso y muestra mensaje de cliente registrado.
 * =============================================================================
 */
export default function ClientRegisterModal({
  isOpen,
  onClose,
  onAddClient,
  onSelectForBooking,
  onSelectForPOS,
  showToast,
  existingClientes = []
}) {
  if (!isOpen) return null;

  const [dniInput, setDniInput] = useState('');
  const [status, setStatus] = useState('initial'); // 'initial' | 'searching' | 'found_existing' | 'not_found_new' | 'saved_success'
  const [clienteData, setClienteData] = useState(null);
  const [nuevoForm, setNuevoForm] = useState({
    nombre: '',
    telefono: '',
    preferencias: ''
  });
  const [errorAlerta, setErrorAlerta] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Paso 1: Consultar existencia del cliente por DNI
  const handleConsultarDni = async (e) => {
    if (e) e.preventDefault();
    const dni = dniInput.trim();
    setErrorAlerta(null);

    if (!dni || dni.length < 8) {
      setErrorAlerta('Por favor ingrese un DNI válido de 8 dígitos para consultar.');
      return;
    }

    setStatus('searching');

    try {
      // Consulta en tiempo real a la Base de Datos (PostgreSQL en Render)
      const res = await api.getClienteByDni(dni);

      if (res && res.existe && res.cliente) {
        // Caso A: Cliente ya registrado -> Retorna datos y muestra ficha
        setClienteData(res.cliente);
        setStatus('found_existing');
        showToast('Retorno de datos: Cliente existente encontrado en el padrón.');
      } else {
        // Verificar en estado local de contingencia
        const localMatch = existingClientes.find(c => c.dni === dni);
        if (localMatch) {
          setClienteData(localMatch);
          setStatus('found_existing');
          showToast('Cliente existente encontrado en el padrón local.');
        } else {
          // Caso B: Cliente NO registrado -> Habilitar formulario para nuevo cliente
          setClienteData(null);
          setNuevoForm({
            nombre: '',
            telefono: '',
            preferencias: 'Piel mixta, sin alergias cutáneas previas'
          });
          setStatus('not_found_new');
        }
      }
    } catch (err) {
      // Fallback
      const localMatch = existingClientes.find(c => c.dni === dni);
      if (localMatch) {
        setClienteData(localMatch);
        setStatus('found_existing');
      } else {
        setStatus('not_found_new');
      }
    }
  };

  // Paso 3: Guardar nuevo cliente (validar y persistir en BD)
  const handleGuardarNuevoCliente = async (e) => {
    e.preventDefault();
    setErrorAlerta(null);

    if (!nuevoForm.nombre.trim()) {
      setErrorAlerta('Los Nombres y Apellidos del cliente son obligatorios.');
      return;
    }
    if (!nuevoForm.telefono.trim()) {
      setErrorAlerta('El Teléfono de contacto es obligatorio para recordatorios de citas.');
      return;
    }

    setIsSubmitting(true);
    const clientePayload = {
      dni: dniInput.trim(),
      nombre: nuevoForm.nombre.trim(),
      telefono: nuevoForm.telefono.trim(),
      preferencias: nuevoForm.preferencias.trim() || 'Ficha estética nueva registrada en mostrador',
      visitas: 1,
      ultima_visita: new Date().toISOString().split('T')[0]
    };

    try {
      const res = await onAddClient(clientePayload);
      setIsSubmitting(false);

      if (res && res.success === false) {
        setErrorAlerta(res.error || 'Error al persistir el cliente en base de datos.');
        return;
      }

      // Paso 4: Confirmación de almacenamiento exitoso y mostrar mensaje de cliente registrado
      setClienteData(clientePayload);
      setStatus('saved_success');
      showToast('✓ Confirmación de almacenamiento exitoso: Cliente registrado con éxito.');
    } catch (err) {
      setIsSubmitting(false);
      setErrorAlerta('Error de red al guardar el cliente en el servidor.');
    }
  };

  const handleResetConsulta = () => {
    setDniInput('');
    setStatus('initial');
    setClienteData(null);
    setErrorAlerta(null);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', width: '92%' }}
      >
        <div className="modal-header">
          <div>
            <span className="badge-tag gold">Padrón de Clientes</span>
            <h2>Registrar y Consultar Cliente</h2>
            <small style={{ color: 'var(--color-text-muted)', display: 'block', marginTop: '2px' }}>
              Validación de DNI en Base de Datos y control de expedientes estéticos
            </small>
          </div>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body" style={{ padding: '20px 24px' }}>
          {/* Mensaje de error / alerta en pantalla */}
          {errorAlerta && (
            <div style={{
              background: '#FFEBEE',
              border: '1px solid #EF5350',
              borderRadius: '8px',
              padding: '10px 14px',
              marginBottom: '16px',
              color: '#C62828',
              fontSize: '0.88rem',
              fontWeight: 600
            }}>
              ⚠️ {errorAlerta}
            </div>
          )}

          {/* Bloque Superior: Consulta de Existencia por DNI */}
          <form onSubmit={handleConsultarDni} style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#1B3D2B', marginBottom: '6px' }}>
              Consultar Existencia de Cliente por DNI:
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                maxLength={8}
                value={dniInput}
                onChange={(e) => {
                  setDniInput(e.target.value.replace(/\D/g, ''));
                  if (status !== 'initial') setStatus('initial');
                }}
                placeholder="Ingrese 8 dígitos de DNI..."
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #CCD0D5',
                  fontSize: '1rem',
                  fontWeight: 600,
                  letterSpacing: '1px'
                }}
                disabled={status === 'searching' || status === 'saved_success'}
                autoFocus
              />
              <button
                type="submit"
                className="btn-gold"
                disabled={dniInput.length < 8 || status === 'searching'}
                style={{ padding: '10px 18px', whiteSpace: 'nowrap' }}
              >
                {status === 'searching' ? 'Consultando...' : 'Consultar DNI'}
              </button>
            </div>
          </form>

          {/* CASO A: CLIENTE EXISTENTE ENCONTRADO (Retorna datos y despliega ficha) */}
          {status === 'found_existing' && clienteData && (
            <div style={{
              background: '#F1F8F4',
              border: '2px solid #2E7D32',
              borderRadius: '10px',
              padding: '18px',
              marginTop: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#1B5E20' }}>
                <span style={{ fontSize: '1.4rem' }}>✓</span>
                <div>
                  <strong style={{ fontSize: '1.05rem', display: 'block' }}>
                    Cliente Existente Encontrado en el Padrón
                  </strong>
                  <span style={{ fontSize: '0.82rem', color: '#2E7D32' }}>
                    Retorno de datos de cliente existente · Ficha estética cargada desde la Base de Datos
                  </span>
                </div>
              </div>

              {/* Ficha Estética Cargada */}
              <div style={{
                background: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #C8E6C9',
                padding: '14px 16px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px'
              }}>
                <div>
                  <span style={{ fontSize: '0.74rem', color: '#718096', textTransform: 'uppercase', fontWeight: 600 }}>DNI:</span>
                  <strong style={{ display: 'block', fontSize: '1rem', color: '#1B3D2B' }}>{clienteData.dni}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.74rem', color: '#718096', textTransform: 'uppercase', fontWeight: 600 }}>Nombres y Apellidos:</span>
                  <strong style={{ display: 'block', fontSize: '1.05rem', color: '#1B3D2B' }}>{clienteData.nombre}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '0.74rem', color: '#718096', textTransform: 'uppercase', fontWeight: 600 }}>Teléfono WhatsApp:</span>
                  <span style={{ display: 'block', fontSize: '0.92rem', color: '#333' }}>{clienteData.telefono || 'No registrado'}</span>
                </div>
                <div>
                  <span style={{ fontSize: '0.74rem', color: '#718096', textTransform: 'uppercase', fontWeight: 600 }}>Visitas Acumuladas:</span>
                  <span style={{ display: 'block', fontSize: '0.92rem', fontWeight: 700, color: '#B38B28' }}>
                    {clienteData.visitas || 1} atenciones registradas
                  </span>
                </div>
                <div style={{ gridColumn: '1/-1' }}>
                  <span style={{ fontSize: '0.74rem', color: '#718096', textTransform: 'uppercase', fontWeight: 600 }}>Historial Dérmico / Preferencias:</span>
                  <p style={{ margin: '4px 0 0', fontSize: '0.88rem', color: '#2D3748', background: '#F8FBF9', padding: '8px 12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                    {clienteData.preferencias || 'Sin especificaciones especiales.'}
                  </p>
                </div>
              </div>

              {/* Acciones para el Cliente Encontrado */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                {onSelectForBooking && (
                  <button
                    type="button"
                    className="btn-gold"
                    onClick={() => {
                      onSelectForBooking(clienteData);
                      onClose();
                    }}
                  >
                    Agendar Cita
                  </button>
                )}
                {onSelectForPOS && (
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      onSelectForPOS(clienteData);
                      onClose();
                    }}
                  >
                    Cargar en POS
                  </button>
                )}
                <button
                  type="button"
                  className="btn-outline"
                  onClick={handleResetConsulta}
                  style={{ marginLeft: 'auto' }}
                >
                  Consultar Otro DNI
                </button>
              </div>
            </div>
          )}

          {/* CASO B: CLIENTE NO REGISTRADO (Habilitar formulario para nuevo cliente) */}
          {status === 'not_found_new' && (
            <div style={{
              background: '#FFFDE7',
              border: '2px solid #FBC02D',
              borderRadius: '10px',
              padding: '18px',
              marginTop: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px', color: '#F57F17' }}>
                <span style={{ fontSize: '1.3rem' }}>ℹ️</span>
                <div>
                  <strong style={{ fontSize: '0.98rem', display: 'block' }}>
                    Cliente no registrado en el padrón con DNI {dniInput}
                  </strong>
                  <span style={{ fontSize: '0.82rem', color: '#795548' }}>
                    Se ha habilitado el formulario para registrar y guardar los datos del nuevo cliente.
                  </span>
                </div>
              </div>

              <form onSubmit={handleGuardarNuevoCliente}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                  <div className="form-group">
                    <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>DNI Registrado:</label>
                    <input
                      type="text"
                      value={dniInput}
                      disabled
                      style={{ background: '#ECEFF1', fontWeight: 700 }}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Nombres y Apellidos *:</label>
                    <input
                      type="text"
                      value={nuevoForm.nombre}
                      onChange={(e) => setNuevoForm({ ...nuevoForm, nombre: e.target.value })}
                      placeholder="Ej: Valeria Carranza Quispe"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Teléfono Móvil (WhatsApp) *:</label>
                    <input
                      type="text"
                      value={nuevoForm.telefono}
                      onChange={(e) => setNuevoForm({ ...nuevoForm, telefono: e.target.value })}
                      placeholder="Ej: 987654321"
                      required
                    />
                  </div>
                  <div className="form-group" style={{ gridColumn: '1/-1' }}>
                    <label style={{ fontSize: '0.82rem', fontWeight: 600 }}>Historial Estético, Tipo de Piel y Preferencias *:</label>
                    <textarea
                      rows="3"
                      value={nuevoForm.preferencias}
                      onChange={(e) => setNuevoForm({ ...nuevoForm, preferencias: e.target.value })}
                      placeholder="Ej: Cutis mixto a seco, piel sensible, prefiere aromaterapia de lavanda, etc."
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #CCD0D5' }}
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px' }}>
                  <button type="button" className="btn-secondary" onClick={handleResetConsulta}>
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-gold"
                    id="btn-guardar-nuevo-cliente"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Validando y Guardando...' : 'Guardar Cliente'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* CASO C: CLIENTE REGISTRADO CON ÉXITO (Confirmación de almacenamiento exitoso) */}
          {status === 'saved_success' && clienteData && (
            <div style={{
              background: '#E8F5E9',
              border: '2px solid #2E7D32',
              borderRadius: '10px',
              padding: '18px',
              marginTop: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#1B5E20' }}>
                <span style={{ fontSize: '1.4rem' }}>✓</span>
                <div>
                  <strong style={{ fontSize: '1.05rem', display: 'block' }}>
                    Confirmación de Almacenamiento Exitoso · Cliente Registrado con Éxito
                  </strong>
                  <span style={{ fontSize: '0.82rem', color: '#2E7D32' }}>
                    El expediente del cliente ha sido almacenado en la Base de Datos y agregado al padrón activo.
                  </span>
                </div>
              </div>

              <div style={{
                background: '#FFFFFF',
                borderRadius: '8px',
                border: '1px solid #C8E6C9',
                padding: '12px 16px'
              }}>
                <strong style={{ display: 'block', fontSize: '1.1rem', color: '#1B3D2B' }}>{clienteData.nombre}</strong>
                <span style={{ fontSize: '0.86rem', color: '#666' }}>DNI: {clienteData.dni} · Celular: {clienteData.telefono}</span>
                <p style={{ margin: '6px 0 0', fontSize: '0.84rem', color: '#4A5568' }}>
                  Preferencias: {clienteData.preferencias}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
                {onSelectForBooking && (
                  <button
                    type="button"
                    className="btn-gold"
                    onClick={() => {
                      onSelectForBooking(clienteData);
                      onClose();
                    }}
                  >
                    Agendar Cita Inmediata
                  </button>
                )}
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={onClose}
                  style={{ marginLeft: 'auto' }}
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid #E2E8F0', padding: '12px 24px' }}>
          <button type="button" className="btn-outline" onClick={onClose}>
            Cerrar Ventana
          </button>
        </div>
      </div>
    </div>
  );
}
