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
  const [hora, setHora] = useState(citaEditando ? citaEditando.hora : '11:00 AM');
  const [motivoCancelacion, setMotivoCancelacion] = useState('');
  const [mode, setMode] = useState(isEditing ? 'reprogramar' : 'crear'); // 'crear' | 'reprogramar' | 'cancelar'

  // Validación de conflicto en tiempo real (RF02)
  const hasConflict = existingCitas.some(c => 
    c.fecha === fecha && 
    c.hora === hora && 
    c.especialista === especialista && 
    (!citaEditando || c.id !== citaEditando.id) &&
    c.estado !== 'Cancelada'
  );

  const handleSubmit = (e) => {
    e.preventDefault();

    if (mode === 'cancelar') {
      if (!motivoCancelacion.trim()) {
        alert('Debe especificar el motivo de la cancelación de la cita.');
        return;
      }
      onCancelCita(citaEditando.id, motivoCancelacion);
      onClose();
      return;
    }

    if (hasConflict) {
      alert(`[CONFLICTO DE HORARIO] ${especialista} ya tiene una cita agendada a las ${hora}. Seleccione otro horario.`);
      return;
    }

    if (mode === 'reprogramar' && citaEditando) {
      onReprogramCita(citaEditando.id, fecha, hora);
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

    onSaveCita({
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
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="badge-tag gold">GESTIÓN DE CITAS (CU01 / RF02, RF03)</span>
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
              [CAMBIAR] Reprogramar Horario
            </button>
            <button 
              type="button" 
              className={`btn-pill ${mode === 'cancelar' ? 'active' : ''}`}
              onClick={() => setMode('cancelar')}
            >
              [ANULAR] Cancelar Cita
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {mode === 'cancelar' ? (
              <div className="form-group">
                <label>Motivo Obligatorio de Cancelación (RF03)</label>
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

                {hasConflict && (
                  <div className="alert-box warning">
                    [ALERTA] <strong>Conflicto de Horario Detectado:</strong> {especialista} ya tiene otra cita ocupando el bloque de las {hora}. Seleccione otra terapeuta o un horario libre.
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
              disabled={mode !== 'cancelar' && hasConflict}
            >
              {mode === 'crear' ? 'Confirmar Cita' : mode === 'reprogramar' ? 'Guardar Reprogramación' : 'Confirmar Cancelación'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
