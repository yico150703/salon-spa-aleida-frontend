import React, { useState } from 'react';

export default function LayerInspectorModal({ isOpen, onClose, currentAction = 'agendar_cita' }) {
  const [selectedAction, setSelectedAction] = useState(currentAction);

  if (!isOpen) return null;

  const scenarios = {
    agendar_cita: {
      title: 'Flujo 1: Agendamiento de Cita en Tiempo Real (CU01 / RF02)',
      actor: 'Cliente o Recepcionista',
      layer1: {
        nombre: 'Capa 1: Presentación (Frontend React SPA)',
        componente: 'Portal.jsx / AppointmentModal.jsx',
        accion: 'Captura fecha, horario, estilista y cliente. Dispara petición POST /api/citas al backend.'
      },
      layer2: {
        nombre: 'Capa 2: Control y Reglas de Negocio (Backend Flask)',
        componente: 'api_bp (Controller) -> CitaService.agendar_cita()',
        accion: 'Valida regla de negocio: Comprueba que el estilista no tenga otra cita en el mismo bloque horario (RF02). Si hay colisión, emite alerta didáctica. Crea o actualiza cliente en padrón (RF01).'
      },
      layer3: {
        nombre: 'Capa 3: Acceso a Datos (Patrón DAO)',
        componente: 'CitaDAO.find_conflict() -> CitaDAO.save() -> ClienteDAO.save()',
        accion: 'Ejecuta operaciones de consulta y persistencia en memoria/base de datos sin contener lógica de negocio.'
      },
      layer4: {
        nombre: 'Capa 4: Base de Datos y Entidades de Negocio',
        componente: 'Entidades: Cita y Cliente',
        accion: 'Almacena la tupla de Cita con estado "Confirmada" y vincula con el DNI del Cliente.'
      }
    },
    cobro_venta: {
      title: 'Flujo 2: Registro de Venta y Cobro en Caja (CU03 / RF04, RF05)',
      actor: 'Cajero o Recepcionista',
      layer1: {
        nombre: 'Capa 1: Presentación (Frontend React SPA)',
        componente: 'Dashboard.jsx (Tab Punto de Venta) / POSTab.jsx',
        accion: 'Selecciona cita atendida, productos adicionales, medio de pago (Efectivo/POS/Yape) y solicita cobro.'
      },
      layer2: {
        nombre: 'Capa 2: Control y Reglas de Negocio (Backend Flask)',
        componente: 'api_bp (Controller) -> VentaService.procesar_venta()',
        accion: 'Calcula matemáticamente el Subtotal e IGV del 18%, asigna correlativo tributario B001-XXXX, actualiza estado de cita a "Atendida" y transfiere el monto a CajaService.'
      },
      layer3: {
        nombre: 'Capa 3: Acceso a Datos (Patrón DAO)',
        componente: 'VentaDAO.save() -> CajaDAO.add_movimiento() -> CitaDAO.update()',
        accion: 'Inserta el registro de venta, asienta el movimiento en el libro de caja y actualiza la cita.'
      },
      layer4: {
        nombre: 'Capa 4: Base de Datos y Entidades de Negocio',
        componente: 'Entidades: Venta, Caja y Cita',
        accion: 'Persistencia del comprobante fiscal y aumento del saldo teórico de la caja.'
      }
    },
    arqueo_caja: {
      title: 'Flujo 3: Operaciones de Caja y Arqueo de Fin de Turno (CU05 / RF08)',
      actor: 'Cajero',
      layer1: {
        nombre: 'Capa 1: Presentación (Frontend React SPA)',
        componente: 'CashAuditModal.jsx (Calculadora de Arqueo Físico)',
        accion: 'El cajero digita la cantidad de billetes y monedas contados físicamente en mostrador.'
      },
      layer2: {
        nombre: 'Capa 2: Control y Reglas de Negocio (Backend Flask)',
        componente: 'api_bp (Controller) -> CajaService.realizar_arqueo_y_cierre()',
        accion: 'Compara conteo físico vs saldo teórico del sistema. Calcula discrepancia (S/ 0.00 = conforme). Evalúa el objetivo OBJ-02 (≥ 98% exactitud) y genera Reporte Z.'
      },
      layer3: {
        nombre: 'Capa 3: Acceso a Datos (Patrón DAO)',
        componente: 'CajaDAO.update_caja() -> CajaDAO.get_movimientos()',
        accion: 'Guarda el cierre de caja y extrae el consolidado de entradas y salidas del turno.'
      },
      layer4: {
        nombre: 'Capa 4: Base de Datos y Entidades de Negocio',
        componente: 'Entidad: Caja (Estado: "Cerrada")',
        accion: 'Cierre del registro contable de turno y emisión del voucher Z de auditoría.'
      }
    }
  };

  const sc = scenarios[selectedAction] || scenarios.agendar_cita;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="badge-tag gold">ARQUITECTURA POR CAPAS (SECCIÓN 3.8 DEL PDF)</span>
            <h2>Inspector Didáctico de Arquitectura en Tiempo Real</h2>
          </div>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--color-text-muted)', marginBottom: '16px', fontSize: '0.9rem' }}>
            Esta herramienta didáctica muestra cómo viaja la información a través de las <strong>4 capas</strong> diseñadas en el informe técnico (Patrón MVC + DAO Composite). Selecciona un flujo para inspeccionar la trazabilidad:
          </p>

          <div className="filter-buttons" style={{ marginBottom: '20px' }}>
            <button 
              className={`btn-pill ${selectedAction === 'agendar_cita' ? 'active' : ''}`}
              onClick={() => setSelectedAction('agendar_cita')}
            >
              1. Agendar Cita (CU01 / RF02)
            </button>
            <button 
              className={`btn-pill ${selectedAction === 'cobro_venta' ? 'active' : ''}`}
              onClick={() => setSelectedAction('cobro_venta')}
            >
              2. Cobro en Caja & POS (CU03 / RF05)
            </button>
            <button 
              className={`btn-pill ${selectedAction === 'arqueo_caja' ? 'active' : ''}`}
              onClick={() => setSelectedAction('arqueo_caja')}
            >
              3. Arqueo & Reporte Z (CU05 / RF08)
            </button>
          </div>

          <div className="architecture-diagram-flow">
            <div className="arch-flow-header">
              <strong>{sc.title}</strong>
              <small>Iniciado por: <span className="tag attended">{sc.actor}</span></small>
            </div>

            <div className="layers-stack">
              {/* Layer 1 */}
              <div className="layer-step layer-1">
                <div className="layer-number">1</div>
                <div className="layer-info">
                  <h4>{sc.layer1.nombre}</h4>
                  <code>{sc.layer1.componente}</code>
                  <p>{sc.layer1.accion}</p>
                </div>
                <div className="layer-arrow">↓ Llamada HTTP REST</div>
              </div>

              {/* Layer 2 */}
              <div className="layer-step layer-2">
                <div className="layer-number">2</div>
                <div className="layer-info">
                  <h4>{sc.layer2.nombre}</h4>
                  <code>{sc.layer2.componente}</code>
                  <p>{sc.layer2.accion}</p>
                </div>
                <div className="layer-arrow">↓ Delegación a Persistencia</div>
              </div>

              {/* Layer 3 */}
              <div className="layer-step layer-3">
                <div className="layer-number">3</div>
                <div className="layer-info">
                  <h4>{sc.layer3.nombre}</h4>
                  <code>{sc.layer3.componente}</code>
                  <p>{sc.layer3.accion}</p>
                </div>
                <div className="layer-arrow">↓ Lectura / Escritura SQL</div>
              </div>

              {/* Layer 4 */}
              <div className="layer-step layer-4">
                <div className="layer-number">4</div>
                <div className="layer-info">
                  <h4>{sc.layer4.nombre}</h4>
                  <code>{sc.layer4.componente}</code>
                  <p>{sc.layer4.accion}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <small style={{ color: 'var(--color-text-muted)' }}>
            ✓ Conforme al Principio de Independencia: La Capa de Presentación jamás se conecta directamente a la Base de Datos.
          </small>
          <button className="btn-action primary" onClick={onClose}>Entendido</button>
        </div>
      </div>
    </div>
  );
}
