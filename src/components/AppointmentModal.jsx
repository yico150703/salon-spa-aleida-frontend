import React, { useState, useEffect } from 'react';
import { CheckIcon, CalendarIcon, LockIcon } from './Icons';

// Asignación inteligente de cabina climatizada según el tratamiento
export const getCabinByService = (serviceName) => {
  const s = (serviceName || '').toLowerCase();
  if (s.includes('facial') || s.includes('oro')) return 'Cabina 01 - Facial Oro & Luz LED';
  if (s.includes('masaje') || s.includes('relajante') || s.includes('drenaje')) return 'Cabina 02 - Masajes & Cromoterapia';
  if (s.includes('capilar') || s.includes('keratina')) return 'Cabina 03 - Capilar & Lavacabezas';
  return 'Cabina 04 - Manos & Pies Spa';
};

// Componente SVG nítido para Código QR del Voucher de Reserva
function VoucherQRCode({ code }) {
  return (
    <div className="voucher-qr-box">
      <svg width="88" height="88" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: '0 auto' }}>
        <rect width="100" height="100" fill="#FFFFFF" rx="6" />
        {/* Top-Left Finder */}
        <rect x="8" y="8" width="28" height="28" rx="4" stroke="#1B3D2B" strokeWidth="4" fill="none" />
        <rect x="16" y="16" width="12" height="12" rx="2" fill="#1B3D2B" />

        {/* Top-Right Finder */}
        <rect x="64" y="8" width="28" height="28" rx="4" stroke="#1B3D2B" strokeWidth="4" fill="none" />
        <rect x="72" y="16" width="12" height="12" rx="2" fill="#1B3D2B" />

        {/* Bottom-Left Finder */}
        <rect x="8" y="64" width="28" height="28" rx="4" stroke="#1B3D2B" strokeWidth="4" fill="none" />
        <rect x="16" y="72" width="12" height="12" rx="2" fill="#1B3D2B" />

        {/* Sync & Matrix Patterns */}
        <rect x="42" y="10" width="6" height="6" fill="#1B3D2B" />
        <rect x="52" y="10" width="6" height="6" fill="#1B3D2B" />
        <rect x="42" y="20" width="6" height="6" fill="#1B3D2B" />
        <rect x="52" y="24" width="6" height="10" fill="#1B3D2B" />

        <rect x="10" y="42" width="6" height="6" fill="#1B3D2B" />
        <rect x="20" y="42" width="10" height="6" fill="#1B3D2B" />
        <rect x="34" y="42" width="6" height="6" fill="#1B3D2B" />
        <rect x="44" y="42" width="8" height="8" fill="#D4AF37" />
        <rect x="56" y="42" width="6" height="6" fill="#1B3D2B" />
        <rect x="68" y="42" width="10" height="6" fill="#1B3D2B" />
        <rect x="82" y="42" width="8" height="6" fill="#1B3D2B" />

        <rect x="42" y="54" width="6" height="8" fill="#1B3D2B" />
        <rect x="52" y="56" width="6" height="6" fill="#1B3D2B" />
        <rect x="64" y="54" width="8" height="8" fill="#1B3D2B" />
        <rect x="76" y="56" width="6" height="6" fill="#1B3D2B" />
        <rect x="86" y="54" width="6" height="8" fill="#1B3D2B" />

        <rect x="42" y="68" width="6" height="6" fill="#1B3D2B" />
        <rect x="52" y="68" width="8" height="6" fill="#1B3D2B" />
        <rect x="64" y="68" width="6" height="8" fill="#1B3D2B" />
        <rect x="74" y="70" width="6" height="6" fill="#1B3D2B" />
        <rect x="84" y="68" width="8" height="8" fill="#1B3D2B" />

        <rect x="42" y="80" width="8" height="6" fill="#1B3D2B" />
        <rect x="54" y="82" width="6" height="8" fill="#1B3D2B" />
        <rect x="66" y="80" width="6" height="8" fill="#1B3D2B" />
        <rect x="76" y="82" width="8" height="6" fill="#1B3D2B" />
        <rect x="88" y="80" width="4" height="8" fill="#1B3D2B" />
      </svg>
      <span className="voucher-qr-caption">Escanear en Mostrador</span>
    </div>
  );
}

export default function AppointmentModal({
  isOpen,
  onClose,
  citaEditando = null,
  existingCitas = [],
  catalogo = [],
  clientes = [],
  onSaveCita,
  onReprogramCita,
  onCancelCita
}) {
  if (!isOpen) return null;

  // Determinar si es edición/reprogramación de una cita existente o creación nueva
  const isExistingCita = Boolean(citaEditando && citaEditando.id && (citaEditando.estado || citaEditando.fecha));

  const [mode, setMode] = useState(citaEditando?._preferredMode || (isExistingCita ? 'reprogramar' : 'crear'));

  // Datos del Cliente
  const [dni, setDni] = useState('');
  const [cliente, setCliente] = useState('');
  const [telefono, setTelefono] = useState('');
  const [clientFound, setClientFound] = useState(null);

  // Datos de la Cita
  const [servicio, setServicio] = useState('Masaje Relajante Aleida');
  const [cabina, setCabina] = useState('Cabina 02 - Masajes & Cromoterapia');
  const [especialista, setEspecialista] = useState('Carmen Sánchez');
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [hora, setHora] = useState('09:00 AM');

  // Preferencias y Personalización
  const [aromaterapia, setAromaterapia] = useState('Lavanda Francesa (Relajante)');
  const [notas, setNotas] = useState('');

  // Cancelación
  const [motivoCancelacion, setMotivoCancelacion] = useState('');

  // Estados de control y Voucher
  const [backendError, setBackendError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedVoucher, setConfirmedVoucher] = useState(null);

  // Inicialización / Sincronización al abrir o cambiar citaEditando
  useEffect(() => {
    if (!isOpen) {
      setConfirmedVoucher(null);
      return;
    }

    if (citaEditando) {
      if (isExistingCita) {
        // Cita existente para reprogramar o cancelar
        setMode(citaEditando._preferredMode || 'reprogramar');
        setCliente(citaEditando.cliente || '');
        setDni(citaEditando.dni || '');
        setTelefono(citaEditando.telefono || '');
        setServicio(citaEditando.servicio || 'Masaje Relajante Aleida');
        setCabina(citaEditando.cabina || getCabinByService(citaEditando.servicio));
        setEspecialista(citaEditando.especialista || 'Carmen Sánchez');
        setFecha(citaEditando.fecha || new Date().toISOString().split('T')[0]);
        setHora(citaEditando.hora || '09:00 AM');
      } else {
        // Cliente precargado desde padrón para NUEVA CITA
        setMode('crear');
        setCliente(citaEditando.cliente || citaEditando.nombre || '');
        setDni(citaEditando.dni || '');
        setTelefono(citaEditando.telefono || '');
        setNotas(citaEditando.preferencias || '');
        const match = clientes.find(c => String(c.dni).trim() === String(citaEditando.dni).trim());
        if (match) setClientFound(match);
        const primerServicio = (catalogo && catalogo.length > 0) ? catalogo[0].nombre : 'Masaje Relajante Aleida';
        setServicio(primerServicio);
        setCabina(getCabinByService(primerServicio));
      }
    } else {
      // Formulario limpio para nueva cita
      setMode('crear');
      setDni('');
      setCliente('');
      setTelefono('');
      setNotas('');
      setClientFound(null);
      const primerServicio = (catalogo && catalogo.length > 0) ? catalogo[0].nombre : 'Masaje Relajante Aleida';
      setServicio(primerServicio);
      setCabina(getCabinByService(primerServicio));
      setEspecialista('Carmen Sánchez');
      setFecha(new Date().toISOString().split('T')[0]);
      setHora('09:00 AM');
      setAromaterapia('Lavanda Francesa (Relajante)');
    }

    setConfirmedVoucher(null);
    setBackendError('');
    setMotivoCancelacion('');
    setIsSubmitting(false);
  }, [isOpen, citaEditando]);

  // Manejo de cambio de DNI con auto-búsqueda en Padrón de Clientes
  const handleDniChange = (val) => {
    const cleanDni = val.replace(/\D/g, '').slice(0, 8);
    setDni(cleanDni);

    if (cleanDni.length === 8) {
      const match = (clientes || []).find(c => String(c.dni).trim() === cleanDni);
      if (match) {
        setCliente(match.nombre || '');
        if (match.telefono) setTelefono(match.telefono);
        if (match.preferencias) setNotas(match.preferencias);
        setClientFound(match);
      } else {
        setClientFound(null);
      }
    } else {
      setClientFound(null);
    }
  };

  // Cambio de servicio y actualización automática de cabina
  const handleServiceChange = (srvNombre) => {
    setServicio(srvNombre);
    setCabina(getCabinByService(srvNombre));
  };

  // Catálogo unificado con respaldo seguro
  const serviciosDisponibles = (catalogo && catalogo.length > 0) ? catalogo : [
    { id: 1, nombre: 'Masaje Relajante Aleida', precio: 280, duracion: 90 },
    { id: 2, nombre: 'Facial Rejuvenecedor con Oro', precio: 450, duracion: 75 },
    { id: 3, nombre: 'Tratamiento Capilar Keratina', precio: 350, duracion: 120 },
    { id: 4, nombre: 'Manicura Spa Premium', precio: 150, duracion: 60 }
  ];

  const currentServiceObj = serviciosDisponibles.find(
    s => s.nombre.toLowerCase() === servicio.toLowerCase()
  ) || serviciosDisponibles[0];

  // Regla CUS04: Validación de conflicto de horario en tiempo real
  const normalizeEsp = (s = '') => s.split('(')[0].trim().toLowerCase();
  const estadosActivos = ['confirmada', 'reprogramada', 'pendiente', 'en atención'];

  const conflictoCita = existingCitas.find(c =>
    c.fecha === fecha &&
    c.hora === hora &&
    normalizeEsp(c.especialista) === normalizeEsp(especialista) &&
    (!isExistingCita || c.id !== citaEditando?.id) &&
    estadosActivos.includes((c.estado || '').toLowerCase())
  );
  const hasConflict = !!conflictoCita;

  // Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setBackendError('');

    // Flujo CUS05: Cancelar Cita
    if (mode === 'cancelar') {
      if (!motivoCancelacion.trim()) {
        alert('Debe especificar un motivo justificado para cancelar la cita.');
        return;
      }
      setIsSubmitting(true);
      if (onCancelCita) {
        await onCancelCita(citaEditando.id, motivoCancelacion.trim());
      }
      setIsSubmitting(false);
      onClose();
      return;
    }

    // Validación de conflicto previo
    if (hasConflict) {
      setBackendError(`Horario no disponible: ${especialista.split('(')[0].trim()} ya tiene una cita confirmada a las ${hora} del ${fecha}. Seleccione otro horario o especialista.`);
      return;
    }

    // Flujo CUS05: Reprogramar Cita
    if (mode === 'reprogramar' && isExistingCita) {
      setIsSubmitting(true);
      const result = await onReprogramCita(citaEditando.id, fecha, hora);
      setIsSubmitting(false);
      if (result && result.success === false) {
        setBackendError(result.error || 'El horario solicitado ya se encuentra ocupado.');
        return;
      }
      onClose();
      return;
    }

    // Flujo CUS04: Crear Cita Nueva desde Mostrador
    if (!dni.trim() || dni.trim().length !== 8) {
      alert('Por favor ingrese un número de DNI válido de 8 dígitos para el cliente.');
      return;
    }
    if (!cliente.trim()) {
      alert('Por favor ingrese el nombre y apellidos completos del cliente.');
      return;
    }
    if (!telefono.trim()) {
      alert('Por favor ingrese el número telefónico o WhatsApp del cliente.');
      return;
    }

    setIsSubmitting(true);

    const srvEnCatalogo = serviciosDisponibles.find(c => c.nombre.toLowerCase() === servicio.toLowerCase());
    const montoFinal = srvEnCatalogo ? Number(srvEnCatalogo.precio) : 250.0;
    const duracionFinal = srvEnCatalogo ? (Number(srvEnCatalogo.duracion) || 60) : 60;
    const assignedTherapist = especialista.split('(')[0].trim();
    const codigoReserva = 'ALE-' + Math.floor(10000 + Math.random() * 90000);

    const fullNotes = [
      aromaterapia ? `Aromaterapia: ${aromaterapia}` : null,
      notas ? `Notas: ${notas}` : null
    ].filter(Boolean).join(' | ') || 'Atención registrada en mostrador';

    const nuevaCitaPayload = {
      cliente: cliente.trim(),
      dni: dni.trim(),
      telefono: telefono.trim(),
      preferencias: fullNotes,
      servicio,
      cabina,
      especialista: assignedTherapist,
      fecha,
      hora,
      monto: montoFinal,
      estado: 'Confirmada',
      cobrado: false,
      codigoReserva
    };

    const result = await onSaveCita(nuevaCitaPayload);
    setIsSubmitting(false);

    if (result && result.success === false) {
      setBackendError(result.error || 'El horario solicitado no se encuentra disponible.');
      return;
    }

    // Paso 11 del Diagrama de Secuencia: Mostrar ticket / constancia oficial de cita reservada
    setConfirmedVoucher({
      codigo: codigoReserva,
      cliente: cliente.trim(),
      dni: dni.trim(),
      telefono: telefono.trim(),
      servicio,
      duracion: duracionFinal,
      precio: montoFinal,
      cabina,
      especialista: assignedTherapist,
      fecha,
      hora,
      aromaterapia,
      notas: fullNotes
    });
  };

  // Función de impresión térmica / voucher
  const handlePrintVoucher = () => {
    const originalTitle = document.title;
    document.title = `Voucher_Reserva_${confirmedVoucher?.codigo || 'ALE-78219'}_Salon_Spa_Aleida`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1500);
  };

  // Generador de enlace WhatsApp oficial
  const getWhatsAppShareUrl = () => {
    if (!confirmedVoucher) return '#';
    const raw = (confirmedVoucher.telefono || '').replace(/\D/g, '');
    let targetPhone = '';
    if (raw && raw.length >= 9) {
      targetPhone = raw.startsWith('51') ? raw : `51${raw}`;
    }

    const message =
      `*SALON SPA ALEIDA S.A.C.* · Voucher Oficial de Cita\n\n` +
      `Estimada/o *${confirmedVoucher.cliente}*: Su cita ha sido registrada con éxito en mostrador:\n\n` +
      `*Código de Reserva:* #${confirmedVoucher.codigo}\n` +
      `*DNI Titular:* ${confirmedVoucher.dni}\n` +
      `*Tratamiento:* ${confirmedVoucher.servicio} (${confirmedVoucher.duracion} min)\n` +
      `*Cabina Asignada:* ${confirmedVoucher.cabina}\n` +
      `*Especialista:* ${confirmedVoucher.especialista}\n` +
      `*Fecha:* ${confirmedVoucher.fecha}\n` +
      `*Hora:* ${confirmedVoucher.hora}\n` +
      `*Total:* S/ ${Number(confirmedVoucher.precio).toFixed(2)}\n\n` +
      `*Dirección:* Av. Circunvalación del Golf 340, Santiago de Surco (Lima)\n` +
      `*POLÍTICA DE TOLERANCIA ESTRICTA:* 10 minutos de tolerancia máxima para conservar su cabina.`;

    if (targetPhone) {
      return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
    }
    return `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: confirmedVoucher ? '760px' : '680px', maxHeight: '92vh', overflowY: 'auto' }}
      >
        {/* Cabecera del Modal */}
        <div className="modal-header">
          <div>
            <span className="badge-tag gold">
              {mode === 'crear'
                ? 'CUS04: Agendar Cita - Atención en Mostrador'
                : mode === 'reprogramar'
                  ? ':FormAgenda · CUS Reprogramar Cita (Diagrama de Secuencia BCE)'
                  : ':FormAgenda · Cancelar Cita (Liberación de Cabina)'}
            </span>
            <h2 style={{ fontSize: '1.24rem', marginTop: '4px' }}>
              {confirmedVoucher
                ? 'Voucher de Confirmación Emitido'
                : mode === 'crear'
                  ? 'Formulario de Registro de Cita'
                  : mode === 'reprogramar'
                    ? `Paso 5: Desplegar modal de reprogramación (:CitaService → :FormAgenda)`
                    : `Cancelar Cita #${citaEditando?.id || ''}: ${cliente}`}
            </h2>
          </div>
          <button className="btn-close" onClick={onClose} title="Cerrar ventana">&times;</button>
        </div>

        {/* Pestañas de Reprogramar / Cancelar en modo edición */}
        {isExistingCita && !confirmedVoucher && (
          <div className="filter-buttons" style={{ padding: '0 24px', marginTop: '12px' }}>
            <button
              type="button"
              className={`btn-pill ${mode === 'reprogramar' ? 'active' : ''}`}
              onClick={() => { setMode('reprogramar'); setBackendError(''); }}
            >
              🔄 Opción A: Reprogramar Cita (Flujo CUS05)
            </button>
            <button
              type="button"
              className={`btn-pill ${mode === 'cancelar' ? 'active' : ''}`}
              onClick={() => { setMode('cancelar'); setBackendError(''); }}
            >
              ❌ Opción B: Cancelar Cita (Liberar Turno)
            </button>
          </div>
        )}

        {/* VISTA 1: TICKET / VOUCHER DE CONFIRMACIÓN (Paso 11 del Diagrama de Secuencia) */}
        {confirmedVoucher ? (
          <div className="modal-body" style={{ padding: '20px 24px' }}>
            <div style={{
              textAlign: 'center',
              background: '#F0F7F2',
              border: '1.5px solid #A3D3B4',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <div style={{
                background: '#1B3D2B',
                color: '#FFF',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '8px'
              }}>
                <CheckIcon size={20} color="#FFF" />
              </div>
              <h3 style={{ color: '#1B3D2B', margin: '0 0 4px', fontSize: '1.15rem' }}>
                ¡Cita Agendada y Confirmada con Éxito!
              </h3>
              <p style={{ color: '#3A5A40', margin: 0, fontSize: '0.85rem' }}>
                Reserva registrada en el sistema de recepción. Bloque de horario y cabina asegurados.
              </p>
            </div>

            {/* Voucher Oficial Estilizado */}
            <div id="printable-voucher" className="luxury-voucher-card printable-voucher">
              <div className="voucher-header">
                <div className="voucher-brand-block">
                  <div className="voucher-title-row">
                    <div>
                      <span className="voucher-brand">SALON SPA ALEIDA S.A.C.</span>
                      <span className="voucher-sub">SANTUARIO DE BELLEZA &amp; BIENESTAR INTEGRAL</span>
                    </div>
                  </div>
                  <div className="voucher-meta-info">
                    <span>RUC: 20608945123 · Sede Principal: Santiago de Surco (Lima)</span>
                    <span>Central de Citas: (01) 421-8900 · WhatsApp: (+51) 987 654 321</span>
                  </div>
                </div>
                <div className="voucher-code-badge">
                  <span className="code-label">CÓDIGO DE RESERVA</span>
                  <span className="code-value">#{confirmedVoucher.codigo}</span>
                  <span className="code-status-pill">● CONFIRMADA EN MOSTRADOR</span>
                </div>
              </div>

              <div className="voucher-cert-strip">
                <span>CONSTANCIA OFICIAL DE RESERVA · GESTIÓN ADMINISTRATIVA</span>
              </div>

              <div className="voucher-body-grid">
                <div className="voucher-data-columns">
                  <div className="voucher-item">
                    <span className="v-label">Cliente Titular</span>
                    <strong className="v-value">{confirmedVoucher.cliente}</strong>
                  </div>

                  <div className="voucher-item">
                    <span className="v-label">Documento DNI</span>
                    <strong className="v-value" style={{ color: '#1B3D2B' }}>{confirmedVoucher.dni}</strong>
                  </div>

                  <div className="voucher-item">
                    <span className="v-label">Teléfono / WhatsApp</span>
                    <strong className="v-value">{confirmedVoucher.telefono}</strong>
                  </div>

                  <div className="voucher-item">
                    <span className="v-label">Tratamiento de Spa</span>
                    <strong className="v-value">{confirmedVoucher.servicio} ({confirmedVoucher.duracion} min)</strong>
                  </div>

                  <div className="voucher-item">
                    <span className="v-label">Cabina Asignada</span>
                    <strong className="v-value" style={{ color: '#B38B28' }}>{confirmedVoucher.cabina}</strong>
                  </div>

                  <div className="voucher-item">
                    <span className="v-label">Especialista Asignada</span>
                    <strong className="v-value">{confirmedVoucher.especialista}</strong>
                  </div>

                  <div className="voucher-item">
                    <span className="v-label">Fecha Programada</span>
                    <strong className="v-value">{confirmedVoucher.fecha}</strong>
                  </div>

                  <div className="voucher-item">
                    <span className="v-label">Horario de Inicio</span>
                    <strong className="v-value">{confirmedVoucher.hora}</strong>
                  </div>
                </div>

                <div className="voucher-qr-column">
                  <VoucherQRCode code={confirmedVoucher.codigo} />
                  <div className="voucher-badge-seal">
                    <span>Validez Oficial</span>
                  </div>
                </div>
              </div>

              <div className="voucher-footer-strip">
                <div className="voucher-total-box">
                  <span className="total-label">Total a Cancelar en Caja</span>
                  <span className="total-amount">S/ {Number(confirmedVoucher.precio).toFixed(2)}</span>
                </div>
                <div className="voucher-payment-tags">
                  <span>Efectivo</span>
                  <span>Visa / Mastercard</span>
                  <span>Yape / Plin</span>
                </div>
              </div>

              <div className="voucher-policies-block">
                <span className="policy-title">POLÍTICA ESTRICTA DE ASISTENCIA (10 MINUTOS)</span>
                <p className="policy-text">
                  Para resguardar el turno de todos los tratamientos, su cita cuenta con una tolerancia máxima de 10 minutos. Pasado este tiempo, el sistema liberará automáticamente la cabina y la especialista.
                </p>
              </div>

              <div className="voucher-watermark-bar">
                <span>SALON SPA ALEIDA · CONTROL DE ACCESO EN RECEPCIÓN</span>
              </div>
            </div>

            {/* Acciones del Voucher */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                type="button"
                className="btn-outline"
                onClick={handlePrintVoucher}
              >
                🖨️ Imprimir Voucher
              </button>
              <a
                href={getWhatsAppShareUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-action primary"
                style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                💬 Enviar por WhatsApp
              </a>
              <button
                type="button"
                className="btn-action gold"
                onClick={onClose}
              >
                ✓ Finalizar y Ver Agenda
              </button>
            </div>
          </div>
        ) : (
          /* VISTA 2: FORMULARIO DE CAPTURA Y GESTIÓN */
          <form onSubmit={handleSubmit}>
            <div className="modal-body" style={{ padding: '20px 24px' }}>
              {mode === 'cancelar' ? (
                <div className="form-group">
                  <div style={{
                    background: '#FFF3E0',
                    border: '1px solid #FFE0B2',
                    padding: '12px 14px',
                    borderRadius: '8px',
                    marginBottom: '14px',
                    fontSize: '0.88rem',
                    color: '#E65100',
                    lineHeight: '1.45'
                  }}>
                    <strong>Regla de Cancelación:</strong> Al registrar la cancelación con motivo justificado, el sistema liberará de inmediato la cabina y el bloque de horario en la agenda central del spa para permitir nuevas atenciones.
                  </div>
                  <label style={{ fontWeight: 600, color: '#1B3D2B', marginBottom: '6px', display: 'block' }}>
                    Motivo Justificado de Cancelación <span style={{ color: '#C53030' }}>*</span>
                  </label>
                  <textarea
                    rows="3"
                    value={motivoCancelacion}
                    onChange={(e) => setMotivoCancelacion(e.target.value)}
                    placeholder="Ej: Inasistencia por motivos de salud / Solicitud expresa del cliente..."
                    required
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E0' }}
                  />
                </div>
              ) : (
                <>
                  {/* SECCIÓN 1: DATOS DEL CLIENTE CON VALIDACIÓN DNI */}
                  <div style={{
                    background: '#F8FAF8',
                    border: '1px solid #D8E6DC',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#1B3D2B', letterSpacing: '0.04em' }}>
                        1. Identificación del Cliente (Padrón Central)
                      </span>
                      {clientFound && (
                        <span style={{ fontSize: '0.74rem', background: '#D1E7DD', color: '#0F5132', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
                          ✓ Cliente Registrado ({clientFound.visitas || 1} visitas)
                        </span>
                      )}
                    </div>

                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div className="form-group">
                        <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                          DNI del Cliente (8 dígitos) <span style={{ color: '#C53030' }}>*</span>
                        </label>
                        <input
                          type="text"
                          value={dni}
                          onChange={(e) => handleDniChange(e.target.value)}
                          placeholder="Ej. 72819382"
                          maxLength={8}
                          required
                          disabled={isExistingCita}
                          style={{ fontWeight: 700, letterSpacing: '0.05em' }}
                        />
                        <span style={{ fontSize: '0.72rem', color: '#666', marginTop: '3px', display: 'block' }}>
                          {cleanDniHint(dni, clientFound)}
                        </span>
                      </div>

                      <div className="form-group">
                        <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                          Teléfono / WhatsApp <span style={{ color: '#C53030' }}>*</span>
                        </label>
                        <input
                          type="tel"
                          value={telefono}
                          onChange={(e) => setTelefono(e.target.value)}
                          placeholder="Ej. 987 654 321"
                          required
                          disabled={isExistingCita}
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '10px' }}>
                      <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                        Nombre y Apellidos Completos <span style={{ color: '#C53030' }}>*</span>
                      </label>
                      <input
                        type="text"
                        value={cliente}
                        onChange={(e) => setCliente(e.target.value)}
                        placeholder="Ej. Valeria Carranza Morales"
                        required
                        disabled={isExistingCita}
                      />
                    </div>
                  </div>

                  {/* SECCIÓN 2: SERVICIO, CABINA Y ESPECIALISTA */}
                  <div style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    marginBottom: '16px'
                  }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#1B3D2B', letterSpacing: '0.04em', display: 'block', marginBottom: '10px' }}>
                      2. Tratamiento y Asignación de Recursos
                    </span>

                    <div className="form-group">
                      <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Servicio Requerido</label>
                      <select
                        value={servicio}
                        onChange={(e) => handleServiceChange(e.target.value)}
                        disabled={isExistingCita}
                      >
                        {serviciosDisponibles.map(s => (
                          <option key={s.id || s.nombre} value={s.nombre}>
                            {s.nombre} · {s.duracion || 60} min · S/ {Number(s.precio).toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '10px' }}>
                      <div className="form-group">
                        <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Cabina Climatizada</label>
                        <select
                          value={cabina}
                          onChange={(e) => setCabina(e.target.value)}
                          disabled={isExistingCita}
                        >
                          <option value="Cabina 01 - Facial Oro & Luz LED">Cabina 01 - Facial Oro &amp; Luz LED</option>
                          <option value="Cabina 02 - Masajes & Cromoterapia">Cabina 02 - Masajes &amp; Cromoterapia</option>
                          <option value="Cabina 03 - Capilar & Lavacabezas">Cabina 03 - Capilar &amp; Lavacabezas</option>
                          <option value="Cabina 04 - Manos & Pies Spa">Cabina 04 - Manos &amp; Pies Spa</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Especialista Asignada</label>
                        <select
                          value={especialista}
                          onChange={(e) => setEspecialista(e.target.value)}
                          disabled={isExistingCita}
                        >
                          <option value="Carmen Sánchez">Carmen Sánchez (Cosmiatra &amp; Masajista)</option>
                          <option value="Luisa Paredes">Luisa Paredes (Estilista Capilar Senior)</option>
                          <option value="Ana Vargas">Ana Vargas (Especialista en Manicura)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* EXPEDIENTE DE CITA CONSULTADO (Pasos 2, 3 y 4 del Diagrama de Secuencia) */}
                  {isExistingCita && (
                    <div style={{
                      background: '#F0F4FF',
                      border: '1.5px solid #90CAF9',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      marginBottom: '16px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#0D47A1', letterSpacing: '0.04em' }}>
                          Paso 2, 3 y 4: Expediente de Cita Consultado (:Cita → :CitaService → :FormAgenda)
                        </span>
                        <span style={{ fontSize: '0.75rem', background: '#BBDEFB', color: '#0D47A1', padding: '2px 8px', borderRadius: '10px', fontWeight: 700 }}>
                          Cita #{citaEditando?.id}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', fontSize: '0.84rem' }}>
                        <div><strong>Cliente:</strong> {cliente} (DNI: {dni || 'Sin DNI'})</div>
                        <div><strong>Especialista:</strong> {especialista}</div>
                        <div><strong>Servicio:</strong> {servicio}</div>
                        <div><strong>Horario Original:</strong> {citaEditando?.fecha} a las {citaEditando?.hora}</div>
                        <div><strong>Estado Actual:</strong> <span style={{ fontWeight: 700, color: '#0D47A1' }}>{citaEditando?.estado || 'Confirmada'}</span></div>
                      </div>
                    </div>
                  )}

                  {/* SECCIÓN 3: FECHA, HORARIO Y VALIDACIÓN DE CONFLICTO (Pasos 6 a 15) */}
                  <div style={{
                    background: '#FFFFFF',
                    border: '1px solid #E2E8F0',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    marginBottom: '16px'
                  }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#1B3D2B', letterSpacing: '0.04em', display: 'block', marginBottom: '10px' }}>
                      {mode === 'reprogramar'
                        ? 'Paso 6: Ingresar nueva fecha y nuevo horario (:Recepcionista → :FormAgenda)'
                        : '3. Programación de Agenda y Horario'}
                    </span>

                    <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                      <div className="form-group">
                        <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                          {mode === 'reprogramar' ? 'Nueva Fecha Requerida' : 'Fecha de Atención'}
                        </label>
                        <input
                          type="date"
                          value={fecha}
                          onChange={(e) => { setFecha(e.target.value); setBackendError(''); }}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                          {mode === 'reprogramar' ? 'Nuevo Horario Requerido' : 'Horario'}
                        </label>
                        <select value={hora} onChange={(e) => { setHora(e.target.value); setBackendError(''); }}>
                          <option value="09:00 AM">09:00 AM</option>
                          <option value="10:30 AM">10:30 AM</option>
                          <option value="11:45 AM">11:45 AM</option>
                          <option value="02:30 PM">02:30 PM</option>
                          <option value="04:00 PM">04:00 PM</option>
                          <option value="04:30 PM">04:30 PM</option>
                          <option value="05:30 PM">05:30 PM</option>
                          <option value="06:00 PM">06:00 PM</option>
                          <option value="07:00 PM">07:00 PM</option>
                        </select>
                      </div>
                    </div>

                    {/* Alerta de Conflicto en Tiempo Real (Secuencia CUS05 Pasos 14 y 15: Nuevo Horario Ocupado) */}
                    {(hasConflict || backendError) ? (
                      <div className="alert-box warning" style={{
                        background: '#FFF3F3',
                        border: '2px solid #D9534F',
                        borderRadius: '8px',
                        padding: '12px 14px',
                        marginTop: '12px',
                        fontSize: '0.85rem',
                        color: '#A02020',
                        lineHeight: '1.45'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                          <span style={{ fontSize: '1.1rem' }}>⚠️</span>
                          <strong style={{ fontSize: '0.88rem' }}>
                            Paso 14 y 15: Notificar conflicto de horario y mostrar alerta en pantalla
                          </strong>
                        </div>
                        <div style={{ color: '#721C24' }}>
                          {backendError || (
                            <>
                              La especialista <strong>{especialista.split('(')[0].trim()}</strong> ya tiene una cita confirmada en el horario <strong>{hora}</strong> del <strong>{fecha}</strong>
                              {conflictoCita?.cliente ? ` (Cliente: ${conflictoCita.cliente})` : ''}.
                              <br />
                              <em>Por favor seleccione otro turno horario u otra fecha disponible en la agenda.</em>
                            </>
                          )}
                        </div>
                      </div>
                    ) : (
                      /* Alerta de Disponibilidad Exitosa (Secuencia CUS05 Pasos 8 y 9: Nuevo Horario Disponible) */
                      <div style={{
                        background: '#F0F9F4',
                        border: '1px solid #A3D3B4',
                        borderRadius: '8px',
                        padding: '10px 14px',
                        marginTop: '12px',
                        fontSize: '0.84rem',
                        color: '#1E6F3E',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span>✓</span>
                        <span>
                          <strong>Paso 8 y 9: Confirmación de horario libre:</strong> {especialista.split('(')[0].trim()} disponible para atención a las {hora} del {fecha}.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* SECCIÓN 4: PREFERENCIAS Y CONDICIONES DÉRMICAS */}
                  <div style={{
                    background: '#F8FAF8',
                    border: '1px solid #D8E6DC',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    marginBottom: '16px'
                  }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', color: '#1B3D2B', letterSpacing: '0.04em', display: 'block', marginBottom: '10px' }}>
                      4. Aromaterapia de Cabina y Preferencias
                    </span>

                    <div className="form-group">
                      <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>Aromaterapia de Cortesía</label>
                      <select
                        value={aromaterapia}
                        onChange={(e) => setAromaterapia(e.target.value)}
                        disabled={isExistingCita}
                      >
                        <option value="Lavanda Francesa (Relajante)">Lavanda Francesa (Relajante &amp; Antiestrés)</option>
                        <option value="Eucalipto & Menta (Vitalidad)">Eucalipto &amp; Menta (Vitalidad &amp; Descongestión)</option>
                        <option value="Cítricos & Bergamota (Energizante)">Cítricos &amp; Bergamota (Energizante)</option>
                        <option value="Flor de Loto & Jazmín (Sensorial)">Flor de Loto &amp; Jazmín (Sensorial)</option>
                        <option value="Hipoalergénico / Neutro">Sin Aroma (Sensibilidad dérmica)</option>
                      </select>
                    </div>

                    <div className="form-group" style={{ marginTop: '10px' }}>
                      <label style={{ fontWeight: 600, fontSize: '0.85rem' }}>
                        Condiciones Dérmicas, Alergias o Preferencias Clínicas
                      </label>
                      <textarea
                        rows="2"
                        value={notas}
                        onChange={(e) => setNotas(e.target.value)}
                        placeholder="Ej. Piel reactiva, prefiere presión media en espalda, etc."
                        disabled={isExistingCita}
                        style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #CBD5E0', fontSize: '0.85rem' }}
                      />
                    </div>

                    {/* Aviso de Tolerancia Oficial de 10 minutos */}
                    <div style={{
                      background: '#FFFBEB',
                      border: '1px solid #FCD34D',
                      borderRadius: '8px',
                      padding: '10px 12px',
                      marginTop: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '0.78rem',
                      color: '#92400E'
                    }}>
                      <span style={{ fontWeight: 'bold', fontSize: '1rem' }}>⏱</span>
                      <span>
                        <strong>Tolerancia de 10 minutos:</strong> El sistema liberará la cabina si el cliente no se presenta tras 10 minutos de la hora pactada.
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Pie del Modal */}
            <div className="modal-footer">
              <button type="button" className="btn-outline" onClick={onClose}>Cerrar</button>
              <button
                type="submit"
                className={`btn-action ${mode === 'cancelar' ? 'danger' : 'primary'}`}
                disabled={(mode !== 'cancelar' && hasConflict) || isSubmitting}
              >
                {isSubmitting
                  ? 'Procesando en base de datos...'
                  : mode === 'crear'
                    ? `Confirmar Cita (S/ ${Number(currentServiceObj?.precio || 250).toFixed(2)})`
                    : mode === 'reprogramar'
                      ? 'Paso 7: Solicitar validación y reprogramar cita'
                      : 'Confirmar Cancelación y Liberar Cabina'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function cleanDniHint(dni, clientFound) {
  if (!dni) return 'Ingrese los 8 dígitos del DNI para consultar el padrón.';
  if (dni.length < 8) return `Faltan ${8 - dni.length} dígitos numéricos.`;
  if (clientFound) return `✓ Cliente identificado: ${clientFound.nombre}.`;
  return 'ℹ Cliente nuevo: Complete los datos para incorporarlo al padrón.';
}
