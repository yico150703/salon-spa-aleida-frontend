import React, { useState } from 'react';

export default function AppointmentModal({ 
  isOpen, 
  onClose, 
  citaEditando = null, 
  existingCitas = [],
  onSaveCita, 
  onReprogramCita, 
  onCancelCita 
}) {
  if (!isOpen) return null;

  const isEditing = !!citaEditando;

  const [cliente, setCliente] = useState(citaEditando ? citaEditando.cliente : '');
  const [servicio, setServicio] = useState(citaEditando ? citaEditando.servicio : 'Masaje Relajante Aleida');
  const [especialista, setEspecialista] = useState(citaEditando ? citaEditando.especialista : 'Carmen Sánchez');
  const [fecha, setFecha] = useState(citaEditando ? citaEditando.fecha : new Date().toISOString().split('T')[0]);
  const [hora, setHora] = useState(citaEditando ? citaEditando.hora : '09:00 AM');
  const [motivoCancelacion, setMotivoCancelacion] = useState('');
  const [mode, setMode] = useState(isEditing ? 'reprogramar' : 'crear'); // 'crear' | 'reprogramar' | 'cancelar'
  const [backendError, setBackendError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validación de conflicto en tiempo real (local — datos ya cargados):
  const normalizeEsp = (s = '') => s.split('(')[0].trim().toLowerCase();
  const estadosActivos = ['confirmada', 'en sala', 'pendiente', 'en atención'];

  const conflictoCita = existingCitas.find(c =>
    c.fecha === fecha &&
    c.hora === hora &&
    normalizeEsp(c.especialista) === normalizeEsp(especialista) &&
    (!citaEditando || c.id !== citaEditando.id) &&
    estadosActivos.includes((c.estado || '').toLowerCase())
  );
  const hasConflict = !!conflictoCita;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBackendError('');

    if (mode === 'cancelar') {
      if (!motivoCancelacion.trim()) {
        alert('Debe especificar el motivo de la cancelación de la cita.');
        return;
      }
      onCancelCita(citaEditando.id, motivoCancelacion);
      onClose();
      return;
    }

    // Bloqueo local inmediato si ya tenemos la info
    if (hasConflict) {
      setBackendError(`Horario no disponible: ${especialista.split('(')[0].trim()} ya tiene una cita confirmada a las ${hora} del ${fecha}. Seleccione otro horario o especialista.`);
      return;
    }

    setIsSubmitting(true);

    if (mode === 'reprogramar' && citaEditando) {
      const result = await onReprogramCita(citaEditando.id, fecha, hora);
      setIsSubmitting(false);
      if (result && result.success === false) {
        setBackendError(result.error || 'El horario solicitado ya se encuentra ocupado. Seleccione otro.');
        return;
      }
      onClose();
      return;
    }

    // Modo Crear
    const precios = {
      'Masaje Relajante Aleida': 280,
      'Facial Rejuvenecedor con Oro': 450,
      'Tratamiento Capilar Keratina': 350,
      'Manicura Spa Premium': 150
    };

    const result = await onSaveCita({
      cliente,
      dni: 'Mostrador',
      servicio,
      especialista,
      fecha,
      hora,
      monto: precios[servicio] || 200,
      estado: 'Confirmada',
      cobrado: false
    });

    setIsSubmitting(false);

    if (result && result.success === false) {
      setBackendError(result.error || 'El horario solicitado ya se encuentra ocupado. Seleccione otro.');
      return;
    }

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="badge-tag gold">Gestión de Citas del Spa</span>
            <h2>
              {mode === 'crear' ? 'Agendar Nueva Cita en Sala' : mode === 'reprogramar' ? `Reprogramar Cita: ${cliente}` : `Cancelar Cita: ${cliente}`}
            </h2>
          </div>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        {isEditing && (
          <div className="filter-buttons" style={{ padding: '0 24px', marginTop: '12px' }}>
            <button 
              type="button" 
              className={`btn-pill ${mode === 'reprogramar' ? 'active' : ''}`}
              onClick={() => setMode('reprogramar')}
            >
              Reprogramar Horario
            </button>
            <button 
              type="button" 
              className={`btn-pill ${mode === 'cancelar' ? 'active' : ''}`}
              onClick={() => setMode('cancelar')}
            >
              Cancelar Cita
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {mode === 'cancelar' ? (
              <div className="form-group">
                <label>Motivo Obligatorio de Cancelación</label>
                <textarea 
                  rows="3" 
                  value={motivoCancelacion}
                  onChange={(e) => setMotivoCancelacion(e.target.value)}
                  placeholder="Ej: Inasistencia por motivos de fuerza mayor del cliente..."
                  required
                />
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label>Nombre del Cliente</label>
                  <input 
                    type="text" 
                    value={cliente} 
                    onChange={(e) => setCliente(e.target.value)} 
                    placeholder="Ej. Valeria Carranza" 
                    required 
                    disabled={isEditing}
                  />
                </div>

                <div className="form-group">
                  <label>Servicio Requerido</label>
                  <select value={servicio} onChange={(e) => setServicio(e.target.value)} disabled={isEditing}>
                    <option value="Masaje Relajante Aleida">Masaje Relajante Aleida (S/ 280)</option>
                    <option value="Facial Rejuvenecedor con Oro">Facial Rejuvenecedor con Oro (S/ 450)</option>
                    <option value="Tratamiento Capilar Keratina">Tratamiento Capilar Keratina (S/ 350)</option>
                    <option value="Manicura Spa Premium">Manicura Spa Premium (S/ 150)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Especialista Asignada</label>
                  <select value={especialista} onChange={(e) => setEspecialista(e.target.value)} disabled={isEditing}>
                    <option value="Carmen Sánchez">Carmen Sánchez (Cosmiatra & Masajista)</option>
                    <option value="Luisa Paredes">Luisa Paredes (Estilista Capilar Senior)</option>
                    <option value="Ana Vargas">Ana Vargas (Especialista en Manicura)</option>
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Fecha de Atención</label>
                    <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Horario</label>
                    <select value={hora} onChange={(e) => setHora(e.target.value)}>
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="10:30 AM">10:30 AM</option>
                      <option value="11:45 AM">11:45 AM</option>
                      <option value="02:30 PM">02:30 PM</option>
                      <option value="04:30 PM">04:30 PM</option>
                      <option value="06:00 PM">06:00 PM</option>
                    </select>
                  </div>
                </div>

                {(hasConflict || backendError) && (
                  <div className="alert-box warning" style={{
                    background: '#fff3f3',
                    border: '2px solid #d9534f',
                    borderRadius: '8px',
                    padding: '12px 14px',
                    marginTop: '10px',
                    fontSize: '0.85rem',
                    color: '#a02020',
                    lineHeight: '1.5'
                  }}>
                    <strong style={{ display: 'block', marginBottom: '4px' }}>
                      Horario No Disponible
                    </strong>
                    {backendError || (
                      <>
                        La especialista <strong>{especialista.split('(')[0].trim()}</strong> ya tiene
                        una cita confirmada a las <strong>{hora}</strong> del <strong>{fecha}</strong>
                        {conflictoCita?.cliente ? ` (Cliente: ${conflictoCita.cliente})` : ''}.
                        Por favor seleccione un horario libre o una especialista disponible.
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-outline" onClick={onClose}>Cerrar</button>
            <button 
              type="submit" 
              className={`btn-action ${mode === 'cancelar' ? 'danger' : 'primary'}`}
              disabled={(mode !== 'cancelar' && hasConflict) || isSubmitting}
            >
              {isSubmitting
                ? 'Verificando disponibilidad...'
                : mode === 'crear' ? 'Confirmar Cita' : mode === 'reprogramar' ? 'Guardar Reprogramación' : 'Confirmar Cancelación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
