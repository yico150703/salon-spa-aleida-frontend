import React, { useState } from 'react';

export default function CashAuditModal({ isOpen, onClose, saldoTeorico, onConfirmCierre }) {
  if (!isOpen) return null;

  const [b100, setB100] = useState(15);  // 15 * 100 = 1500
  const [b50, setB50] = useState(10);    // 10 * 50 = 500
  const [b20, setB20] = useState(15);    // 15 * 20 = 300
  const [b10, setB10] = useState(8);     // 8 * 10 = 80
  const [m5, setM5] = useState(3);       // 3 * 5 = 15
  const [m2, setM2] = useState(3);       // 3 * 2 = 6
  const [m1, setM1] = useState(4);       // 4 * 1 = 4 (Total = 2405.00)

  const totalFisico = (b100 * 100) + (b50 * 50) + (b20 * 20) + (b10 * 10) + (m5 * 5) + (m2 * 2) + (m1 * 1);
  const diferencia = totalFisico - saldoTeorico;

  const handleCierre = () => {
    onConfirmCierre(totalFisico, diferencia);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <span className="badge-tag gold">OPERACIONES DE CAJA (CU05 / RF08)</span>
            <h2>Calculadora Interactiva de Arqueo de Caja Físico</h2>
          </div>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginBottom: '16px' }}>
            Digite la cantidad de billetes y monedas contados en el cajón de mostrador para conciliar el arqueo físico contra el saldo teórico del sistema:
          </p>

          <div className="denominations-grid">
            <div className="denom-group">
              <label>Billetes S/ 100:</label>
              <input type="number" min="0" value={b100} onChange={(e) => setB100(parseInt(e.target.value) || 0)} />
              <span>= S/ {b100 * 100}</span>
            </div>
            <div className="denom-group">
              <label>Billetes S/ 50:</label>
              <input type="number" min="0" value={b50} onChange={(e) => setB50(parseInt(e.target.value) || 0)} />
              <span>= S/ {b50 * 50}</span>
            </div>
            <div className="denom-group">
              <label>Billetes S/ 20:</label>
              <input type="number" min="0" value={b20} onChange={(e) => setB20(parseInt(e.target.value) || 0)} />
              <span>= S/ {b20 * 20}</span>
            </div>
            <div className="denom-group">
              <label>Billetes S/ 10:</label>
              <input type="number" min="0" value={b10} onChange={(e) => setB10(parseInt(e.target.value) || 0)} />
              <span>= S/ {b10 * 10}</span>
            </div>
            <div className="denom-group">
              <label>Monedas S/ 5:</label>
              <input type="number" min="0" value={m5} onChange={(e) => setM5(parseInt(e.target.value) || 0)} />
              <span>= S/ {m5 * 5}</span>
            </div>
            <div className="denom-group">
              <label>Monedas S/ 2 y S/ 1:</label>
              <input type="number" min="0" value={m2 + m1} onChange={(e) => {
                const val = parseInt(e.target.value) || 0;
                setM2(Math.floor(val / 2));
                setM1(val % 2);
              }} />
              <span>= S/ {(m2 * 2) + m1}</span>
            </div>
          </div>

          <div className="audit-comparison-box">
            <div className="audit-row">
              <span>Total Contado Físicamente:</span>
              <strong className="text-large">S/ {totalFisico.toFixed(2)}</strong>
            </div>
            <div className="audit-row">
              <span>Saldo Teórico en Sistema:</span>
              <strong>S/ {saldoTeorico.toFixed(2)}</strong>
            </div>
            <div className="audit-row highlight">
              <span>Diferencia de Arqueo:</span>
              <strong className={Math.abs(diferencia) < 0.01 ? 'text-success' : 'text-danger'}>
                {Math.abs(diferencia) < 0.01 ? 'S/ 0.00 (Cuadre 100% Conforme)' : `S/ ${diferencia.toFixed(2)}`}
              </strong>
            </div>
          </div>

          {Math.abs(diferencia) < 0.01 ? (
            <div className="alert-box success">
              [CONFORME] <strong>¡Cuadre Perfecto!</strong> Cumple con la meta del <strong>98% de exactitud en arqueo diario (OBJ-02)</strong>. Sin faltantes ni sobrantes.
            </div>
          ) : (
            <div className="alert-box warning">
              [DISCREPANCIA] Se detecta una discrepancia de S/ {diferencia.toFixed(2)}. Verifique comprobantes emitidos antes de emitir el Reporte Z.
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-outline" onClick={onClose}>Cancelar</button>
          <button className="btn-action success" onClick={handleCierre}>
            Confirmar Arqueo & Emitir Reporte Z
          </button>
        </div>
      </div>
    </div>
  );
}
