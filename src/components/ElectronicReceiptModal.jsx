import React from 'react';

export default function ElectronicReceiptModal({ isOpen, onClose, ventaData, tipo = 'boleta' }) {
  if (!isOpen || !ventaData) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content receipt-style" onClick={(e) => e.stopPropagation()}>
        <div className="receipt-ticket">
          <div className="receipt-header">
            <h3>SALON SPA ALEIDA S.A.C.</h3>
            <p>RUC: 20608192831</p>
            <p>Av. Conquistadores 450, San Isidro - Lima</p>
            <p>Telf: (01) 421-9876 | spa.aleida@gmail.com</p>
            <hr />
            <h4>
              {tipo === 'nota_credito' ? 'NOTA DE CRÉDITO ELECTRÓNICA' : 'BOLETA DE VENTA ELECTRÓNICA'}
            </h4>
            <strong>{ventaData.numero_boleta || ventaData.nota_credito || 'B001-0004821'}</strong>
          </div>

          <div className="receipt-client-info">
            <p><strong>Fecha/Hora:</strong> {ventaData.fecha || 'Hoy 04:30 PM'}</p>
            <p><strong>Cliente:</strong> {ventaData.cliente || 'Patricia Valdivia'}</p>
            <p><strong>DNI/Documento:</strong> {ventaData.dni || '45910284'}</p>
            <p><strong>Forma de Pago:</strong> {ventaData.medio_pago || 'Billetera Digital (Yape)'}</p>
            {tipo === 'nota_credito' && (
              <p><strong>Motivo NC:</strong> {ventaData.motivo || 'Devolución por insatisfacción'}</p>
            )}
          </div>

          <table className="receipt-items-table">
            <thead>
              <tr>
                <th>Cant / Descripción</th>
                <th style={{ textAlign: 'right' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1 x {ventaData.servicio || 'Tratamiento Spa'}</td>
                <td style={{ textAlign: 'right' }}>S/ {parseFloat(ventaData.total || ventaData.monto || 0).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <div className="receipt-totals">
            <div className="receipt-row">
              <span>Op. Gravada:</span>
              <span>S/ {(parseFloat(ventaData.total || ventaData.monto || 0) / 1.18).toFixed(2)}</span>
            </div>
            <div className="receipt-row">
              <span>I.G.V. (18%):</span>
              <span>S/ {(parseFloat(ventaData.total || ventaData.monto || 0) - (parseFloat(ventaData.total || ventaData.monto || 0) / 1.18)).toFixed(2)}</span>
            </div>
            <div className="receipt-row total">
              <strong>IMPORTE TOTAL:</strong>
              <strong>S/ {parseFloat(ventaData.total || ventaData.monto || 0).toFixed(2)}</strong>
            </div>
          </div>

          <div className="receipt-qr-box">
            <div className="qr-placeholder">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h4v2h-4v-2zm-4 0h2v4h-2v-4zm4 4h4v2h-4v-2zm-2 2h2v2h-2v-2zm-2-4h2v2h-2v-2zm-6-2h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2z"/>
              </svg>
            </div>
            <small>Representación impresa de la Boleta Electrónica.<br />Consulte en sunat.gob.pe con el código hash.</small>
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'center', gap: '12px' }}>
          <button className="btn-outline" onClick={onClose}>Cerrar</button>
          <button className="btn-action primary" onClick={() => window.print()}>
            🖨️ Imprimir Comprobante
          </button>
        </div>
      </div>
    </div>
  );
}
