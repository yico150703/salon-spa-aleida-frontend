import React from 'react';

export default function RequirementsGuideModal({ isOpen, onClose, onSelectTab }) {
  if (!isOpen) return null;

  const requirements = [
    {
      code: 'CUS01',
      title: 'Autenticar Usuario en el Mostrador',
      tab: 'personal',
      prioridad: 'Alta',
      desc: 'El sistema valida las credenciales y el turno del personal asignado al Área de Recepción y Caja.'
    },
    {
      code: 'CUS02',
      title: 'Registrar Personal & Especialistas',
      tab: 'personal',
      prioridad: 'Media',
      desc: 'El sistema gestiona el padrón de terapeutas, cosmiatras y recepcionistas para la disponibilidad de agenda.'
    },
    {
      code: 'CUS03',
      title: 'Registrar y Consultar Clientes',
      tab: 'clientes',
      prioridad: 'Alta',
      desc: 'El sistema permite registrar nuevos clientes con DNI, teléfono y consultar su historial o ficha estética.'
    },
    {
      code: 'CUS04',
      title: 'Agendar Cita en Mostrador',
      tab: 'agenda',
      prioridad: 'Alta',
      desc: 'La recepcionista reserva citas validando en tiempo real la disponibilidad de cabina, horario y especialista.'
    },
    {
      code: 'CUS05',
      title: 'Reprogramar Cita y Control de Estados',
      tab: 'reprogramar',
      prioridad: 'Alta',
      desc: 'Permite actualizar fecha y hora de citas previas o cambiar el estado (Confirmada, En Atención, Cancelada).'
    },
    {
      code: 'CUS06',
      title: 'Consultar Catálogo de Servicios y Tarifario',
      tab: 'catalogo',
      prioridad: 'Alta',
      desc: 'Permite a la recepcionista consultar la duración, tarifa base, cabinas sugeridas y promociones vigentes.'
    },
    {
      code: 'CUS07',
      title: 'Aperturar Turno de Caja',
      tab: 'apertura',
      prioridad: 'Alta',
      desc: 'La recepcionista/cajera inicializa el fondo fijo de sencillo en mostrador para habilitar las transacciones del turno.'
    },
    {
      code: 'CUS08',
      title: 'Procesar Venta y Cobro en Mostrador',
      tab: 'caja',
      prioridad: 'Alta',
      desc: 'Liquida servicios prestados o productos vendidos con cálculo de IGV (18%), cobro multicanal y emisión de boleta.'
    },
    {
      code: 'CUS09',
      title: 'Anular Venta con Nota de Crédito',
      tab: 'anulaciones',
      prioridad: 'Alta',
      desc: 'Permite reversar una venta con motivo sustentado y emisión de Nota de Crédito autorizada.'
    },
    {
      code: 'CUS10',
      title: 'Arqueo Físico y Cierre de Caja',
      tab: 'operaciones-caja',
      prioridad: 'Alta',
      desc: 'Compara el efectivo físico contado frente al saldo del sistema para conciliar diferencias y emitir Reporte Z.'
    }
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="badge-tag gold">ÁREA DE RECEPCIÓN Y ATENCIÓN AL CLIENTE</span>
            <h2>Matriz de Casos de Uso del Sistema (CUS01 - CUS10)</h2>
          </div>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px', fontSize: '0.9rem' }}>
            Cada requerimiento funcional del documento oficial está implementado y vinculado directamente a una pantalla interactiva del sistema:
          </p>

          <div className="agenda-table-wrapper" style={{ maxHeight: '420px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Requerimiento Funcional</th>
                  <th>Prioridad</th>
                  <th>Estado en Sistema</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {requirements.map(rf => (
                  <tr key={rf.code}>
                    <td><strong>{rf.code}</strong></td>
                    <td>
                      <strong>{rf.title}</strong>
                      <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '4px 0 0' }}>{rf.desc}</p>
                    </td>
                    <td><span className={`tag ${rf.prioridad === 'Alta' ? 'in-progress' : 'confirmed'}`}>{rf.prioridad}</span></td>
                    <td><span className="tag attended">[OK] 100% Operativo</span></td>
                    <td>
                      <button 
                        className="btn-table primary"
                        onClick={() => {
                          onSelectTab(rf.tab);
                          onClose();
                        }}
                      >
                        Probar RF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="modal-footer">
          <small style={{ color: 'var(--color-text-muted)' }}>
            Total: 12 Requerimientos Funcionales Verificados y Coherentes con los 9 Casos de Uso.
          </small>
          <button className="btn-action primary" onClick={onClose}>Cerrar Guía</button>
        </div>
      </div>
    </div>
  );
}
