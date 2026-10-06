import React from 'react';

export default function RequirementsGuideModal({ isOpen, onClose, onSelectTab }) {
  if (!isOpen) return null;

  const requirements = [
    {
      code: 'RF01',
      title: 'Padrón de Clientes & Ficha de Historial Clínico',
      tab: 'clientes',
      prioridad: 'Alta',
      desc: 'El sistema debe permitir registrar, actualizar y consultar clientes junto con su historial de citas, atenciones y condiciones dérmicas/capilares.'
    },
    {
      code: 'RF02',
      title: 'Agendamiento de Citas con Validación en Tiempo Real',
      tab: 'agenda',
      prioridad: 'Alta',
      desc: 'El sistema debe permitir agendar citas validando en tiempo real la disponibilidad de fecha, horario y especialista, evitando choques de sillón.'
    },
    {
      code: 'RF03',
      title: 'Reprogramación, Cancelación y Control de Estados',
      tab: 'agenda',
      prioridad: 'Alta',
      desc: 'El sistema debe permitir reprogramar, cancelar y actualizar el estado de las citas (Confirmada, En Atención, Atendida, No Asistió).'
    },
    {
      code: 'RF04',
      title: 'Registro de Ventas, Subtotales, Descuentos e IGV',
      tab: 'caja',
      prioridad: 'Alta',
      desc: 'El sistema debe permitir registrar la venta de servicios y productos, calculando montos, subtotales, descuentos promocionales y desglose del IGV (18%).'
    },
    {
      code: 'RF05',
      title: 'Cobro Multicanal & Emisión de Boleta Electrónica',
      tab: 'caja',
      prioridad: 'Alta',
      desc: 'El sistema debe procesar el cobro en múltiples formas de pago (efectivo con cálculo de vuelto, POS y billetera digital Yape/Plin) y emitir comprobante.'
    },
    {
      code: 'RF06',
      title: 'Anulación Controlada de Venta & Notas de Crédito',
      tab: 'anulaciones',
      prioridad: 'Alta',
      desc: 'El sistema debe permitir anular ventas registradas, exigiendo motivo obligatorio, validando PIN de Gerencia y emitiendo Nota de Crédito con reversión en caja.'
    },
    {
      code: 'RF07',
      title: 'Apertura de Caja & Registro de Egresos Menores',
      tab: 'operaciones-caja',
      prioridad: 'Alta',
      desc: 'El sistema debe gestionar la apertura de caja diaria con fondo inicial de sencillo y registrar ingresos y egresos menores con justificación.'
    },
    {
      code: 'RF08',
      title: 'Arqueo Físico vs. Sistema & Cierre con Reporte Z',
      tab: 'operaciones-caja',
      prioridad: 'Alta',
      desc: 'El sistema debe realizar el arqueo y cierre de caja comparando el efectivo físico contado contra el saldo del sistema para conciliar diferencias.'
    },
    {
      code: 'RF09',
      title: 'Gestión de Proveedores & Órdenes de Compra',
      tab: 'compras',
      prioridad: 'Media',
      desc: 'El sistema debe permitir gestionar proveedores y registrar compras de productos e insumos, actualizando las existencias en inventario.'
    },
    {
      code: 'RF10',
      title: 'Catálogo de Servicios, Tarifas & Alertas de Stock',
      tab: 'catalogo',
      prioridad: 'Media',
      desc: 'El sistema debe administrar el catálogo de servicios (precios, duración, comisión) y productos con alerta de stock de reposición.'
    },
    {
      code: 'RF11',
      title: 'Administración de Usuarios, Roles & Permisos',
      tab: 'usuarios',
      prioridad: 'Media',
      desc: 'El sistema debe gestionar las cuentas de usuario del personal, controlando credenciales, roles y permisos de acceso según perfil de puesto.'
    },
    {
      code: 'RF12',
      title: 'Reportes Gerenciales & Objetivos Realistas SMART',
      tab: 'reportes',
      prioridad: 'Media',
      desc: 'El sistema debe generar reportes estadísticos consolidados (ventas, citas, balance y compras) y seguimiento de los 4 objetivos con porcentajes.'
    }
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="badge-tag gold">TABLA 12 DEL INFORME TÉCNICO</span>
            <h2>Matriz Didáctica de Requerimientos Funcionales (RF01 - RF12)</h2>
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
