import React, { useState } from 'react';

export default function ClientFileModal({ isOpen, onClose, cliente, onSaveClient }) {
  if (!isOpen || !cliente) return null;

  const [nombre, setNombre] = useState(cliente.nombre);
  const [telefono, setTelefono] = useState(cliente.telefono);
  const [preferencias, setPreferencias] = useState(cliente.preferencias);

  const handleSave = (e) => {
    e.preventDefault();
    onSaveClient({
      ...cliente,
      nombre,
      telefono,
      preferencias
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="badge-tag gold">FICHA CLÍNICA & ESTÉTICA (CU02 / RF01)</span>
            <h2>Expediente Estético: {cliente.nombre}</h2>
          </div>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSave}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label>DNI del Cliente</label>
                <input type="text" value={cliente.dni} disabled style={{ background: '#F5F5F5' }} />
              </div>
              <div className="form-group">
                <label>Visitas Acumuladas</label>
                <input type="text" value={`${cliente.visitas} atenciones registradas`} disabled style={{ background: '#F5F5F5' }} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Nombres y Apellidos</label>
                <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Teléfono de Contacto</label>
                <input type="text" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
              </div>
            </div>

            <div className="form-group">
              <label>Diagnóstico Estético, Alergias y Preferencias</label>
              <textarea 
                rows="4" 
                value={preferencias} 
                onChange={(e) => setPreferencias(e.target.value)}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--color-border)' }}
                placeholder="Ejemplo: Sensibilidad al amoníaco, cutis mixto, prefiere masajes con aceite de lavanda..."
              />
            </div>

            <div className="alert-box success" style={{ fontSize: '0.82rem' }}>
              [TRAZABILIDAD RF01] <strong>Padrón Centralizado:</strong> Toda actualización queda registrada para las especialistas y el módulo de citas.
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-outline" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn-action primary">Guardar Ficha</button>
          </div>
        </form>
      </div>
    </div>
  );
}
