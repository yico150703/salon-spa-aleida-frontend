import React, { useState } from 'react';

export default function SpecialistMobileApp({
  citas = [],
  onUpdateCitaEstado,
  onSwitchToPortal,
  onSwitchToAdmin,
  onSwitchToBooking,
  showToast
}) {
  const [selectedTherapist, setSelectedTherapist] = useState('Carmen Sánchez');
  const [activeTab, setActiveTab] = useState('agenda'); // 'agenda' | 'comisiones' | 'notificaciones'
  const [showNotification, setShowNotification] = useState(true);

  // Filtrar citas de la especialista seleccionada
  const therapistCitas = citas.filter(c => 
    c.especialista?.toLowerCase().includes(selectedTherapist.toLowerCase()) ||
    c.especialista?.includes('Cualquier')
  );

  const atendidasCount = therapistCitas.filter(c => c.estado === 'Atendida').length;
  const pendientesCount = therapistCitas.filter(c => c.estado !== 'Atendida' && c.estado !== 'Cancelada').length;
  const totalComisionesEstimadas = therapistCitas
    .filter(c => c.estado === 'Atendida')
    .reduce((acc, c) => acc + (parseFloat(c.monto || 0) * 0.30), 0);

  const handleMarcarAtendida = (citaId, clienteNombre) => {
    if (onUpdateCitaEstado) {
      onUpdateCitaEstado(citaId, 'Atendida');
    }
    if (showToast) {
      showToast(`[APP MÓVIL] Tratamiento de ${clienteNombre} finalizado con éxito.`);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0F2417 0%, #1B3D2B 100%)',
      padding: '24px 16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      {/* Barra de Navegación de Arquitectura Multi-canal */}
      <header style={{
        width: '100%',
        maxWidth: '900px',
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        borderRadius: '16px',
        padding: '12px 20px',
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.4rem' }}>📱</span>
          <div>
            <strong style={{ color: '#D4AF37', fontSize: '1rem', display: 'block' }}>
              CANAL MÓVIL (Flutter / Multiplataforma MVVM)
            </strong>
            <small style={{ color: '#D8ECDE', fontSize: '0.78rem' }}>
              Paso 2 de Arquitectura: Diseñada para especialistas (Agenda del día y push notifications)
            </small>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={onSwitchToPortal}
            style={{
              background: '#FFFFFF',
              color: '#1B3D2B',
              border: 'none',
              borderRadius: '20px',
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            ← Canal Web Clientes
          </button>
          <button
            onClick={onSwitchToAdmin}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '20px',
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Panel Web Admin
          </button>
          <button
            onClick={onSwitchToBooking}
            style={{
              background: '#D4AF37',
              color: '#1B3D2B',
              border: 'none',
              borderRadius: '20px',
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Reserva PWA
          </button>
        </div>
      </header>

      {/* DISPOSITIVO MÓVIL SIMULADO (SMARTPHONE FRAME) */}
      <div style={{
        width: '100%',
        maxWidth: '390px',
        height: '780px',
        background: '#000000',
        borderRadius: '48px',
        padding: '12px',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6), 0 0 0 4px #2D3748',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Pantalla del Celular */}
        <div style={{
          flex: 1,
          background: '#F4FAF6',
          borderRadius: '38px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}>
          {/* Barra de Estado (Status Bar) */}
          <div style={{
            background: '#1B3D2B',
            color: '#FFFFFF',
            padding: '8px 20px 4px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            fontWeight: 600
          }}>
            <span>09:41</span>
            {/* Dynamic Island / Notch */}
            <div style={{
              width: '90px',
              height: '18px',
              background: '#000000',
              borderRadius: '12px',
              margin: '0 auto'
            }} />
            <span>5G 📶 100% 🔋</span>
          </div>

          {/* Top Bar de la App Móvil */}
          <div style={{
            background: '#1B3D2B',
            padding: '12px 18px 16px',
            color: '#FFFFFF'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.7rem', color: '#D4AF37', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700 }}>
                  SALON SPA ALEIDA MOBILE
                </span>
                <h3 style={{ margin: '2px 0 0', fontSize: '1.2rem', fontFamily: 'serif' }}>Mi Cabina Diaria</h3>
              </div>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#D4AF37',
                color: '#1B3D2B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem'
              }}>
                {selectedTherapist.split(' ').map(n=>n[0]).join('')}
              </div>
            </div>

            {/* Selector de Especialista */}
            <div style={{ marginTop: '10px' }}>
              <select
                value={selectedTherapist}
                onChange={(e) => setSelectedTherapist(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(212, 175, 55, 0.4)',
                  borderRadius: '10px',
                  color: '#FFFFFF',
                  padding: '6px 10px',
                  fontSize: '0.82rem',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="Carmen Sánchez" style={{ color: '#000' }}>Especialista: Carmen Sánchez (Cosmiatra)</option>
                <option value="Rosa Gómez" style={{ color: '#000' }}>Especialista: Rosa Gómez (Terapeuta Spa)</option>
                <option value="Elena Torres" style={{ color: '#000' }}>Especialista: Elena Torres (Estilista Capilar)</option>
              </select>
            </div>
          </div>

          {/* Notificación Push Simulada */}
          {showNotification && (
            <div style={{
              background: '#FFF9C4',
              borderBottom: '1px solid #FFE082',
              padding: '8px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.74rem',
              color: '#5D4037'
            }}>
              <span>🔔 <strong>Notificación Push:</strong> Próxima cita inicia a las 10:00 AM en Cabina 1.</span>
              <button
                onClick={() => setShowNotification(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, color: '#5D4037' }}
              >
                ✕
              </button>
            </div>
          )}

          {/* Métricas Rápidas en Móvil */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            padding: '12px 14px',
            background: '#FFFFFF',
            borderBottom: '1px solid #E2E8F0'
          }}>
            <div style={{ textAlign: 'center' }}>
              <strong style={{ display: 'block', fontSize: '1.2rem', color: '#1B3D2B' }}>{pendientesCount}</strong>
              <small style={{ fontSize: '0.68rem', color: '#64748B' }}>Pendientes</small>
            </div>
            <div style={{ textAlign: 'center', borderLeft: '1px solid #E2E8F0', borderRight: '1px solid #E2E8F0' }}>
              <strong style={{ display: 'block', fontSize: '1.2rem', color: '#2E7D32' }}>{atendidasCount}</strong>
              <small style={{ fontSize: '0.68rem', color: '#64748B' }}>Atendidas</small>
            </div>
            <div style={{ textAlign: 'center' }}>
              <strong style={{ display: 'block', fontSize: '1.05rem', color: '#D4AF37' }}>S/ {totalComisionesEstimadas.toFixed(0)}</strong>
              <small style={{ fontSize: '0.68rem', color: '#64748B' }}>Comisión 30%</small>
            </div>
          </div>

          {/* Contenido según Pestaña Móvil */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 14px'
          }}>
            {activeTab === 'agenda' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#1B3D2B' }}>
                    Turnos Asignados para Hoy ({therapistCitas.length})
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#4A7C59' }}>Sincronizado vía REST API</span>
                </div>

                {therapistCitas.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 10px', color: '#64748B' }}>
                    <p>No tienes citas asignadas para hoy.</p>
                  </div>
                ) : (
                  therapistCitas.map(cita => {
                    const isAtendida = cita.estado === 'Atendida';
                    return (
                      <div
                        key={cita.id}
                        style={{
                          background: '#FFFFFF',
                          borderRadius: '14px',
                          padding: '12px 14px',
                          marginBottom: '10px',
                          border: isAtendida ? '1.5px solid #A5D6A7' : '1.5px solid #E2E8F0',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{
                            background: '#EBF5F0',
                            color: '#1B3D2B',
                            fontWeight: 700,
                            padding: '3px 8px',
                            borderRadius: '8px',
                            fontSize: '0.75rem'
                          }}>
                            ⏰ {cita.hora}
                          </span>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            color: isAtendida ? '#2E7D32' : '#B45309',
                            background: isAtendida ? '#E8F5E9' : '#FEF3C7',
                            padding: '2px 8px',
                            borderRadius: '10px'
                          }}>
                            {cita.estado}
                          </span>
                        </div>

                        <strong style={{ fontSize: '0.95rem', color: '#0F2417', display: 'block' }}>
                          {cita.cliente}
                        </strong>
                        <span style={{ fontSize: '0.8rem', color: '#4A7C59', display: 'block', margin: '2px 0 4px' }}>
                          ✨ {cita.servicio}
                        </span>

                        <div style={{
                          background: '#FAF8F5',
                          borderRadius: '8px',
                          padding: '6px 10px',
                          fontSize: '0.72rem',
                          color: '#557B64',
                          margin: '6px 0 10px'
                        }}>
                          <strong>Ficha de Cliente:</strong> DNI {cita.dni || '72849102'} · Sin alergias reportadas · Cabina climatizada N° 2
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            disabled={isAtendida}
                            onClick={() => handleMarcarAtendida(cita.id, cita.cliente)}
                            style={{
                              flex: 1,
                              background: isAtendida ? '#E2E8F0' : '#1B3D2B',
                              color: isAtendida ? '#94A3B8' : '#FFFFFF',
                              border: 'none',
                              borderRadius: '8px',
                              padding: '8px',
                              fontSize: '0.78rem',
                              fontWeight: 700,
                              cursor: isAtendida ? 'default' : 'pointer'
                            }}
                          >
                            {isAtendida ? '✓ Servicio Concluido' : 'Finalizar Tratamiento'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeTab === 'comisiones' && (
              <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '14px' }}>
                <h4 style={{ margin: '0 0 10px', color: '#1B3D2B' }}>Liquidación de Comisiones</h4>
                <p style={{ fontSize: '0.8rem', color: '#64748B', lineHeight: '1.4' }}>
                  Esquema de comisiones según catálogo oficial (30% sobre tarifa de tratamientos atendidos).
                </p>
                <div style={{
                  background: '#EBF5F0',
                  padding: '12px',
                  borderRadius: '10px',
                  margin: '14px 0',
                  textAlign: 'center'
                }}>
                  <span style={{ fontSize: '0.75rem', color: '#4A7C59', textTransform: 'uppercase' }}>Total Acumulado Hoy</span>
                  <h2 style={{ color: '#1B3D2B', margin: '4px 0' }}>S/ {totalComisionesEstimadas.toFixed(2)}</h2>
                  <small style={{ color: '#2E7D32', fontSize: '0.72rem' }}>Calculado en tiempo real</small>
                </div>
              </div>
            )}

            {activeTab === 'notificaciones' && (
              <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '14px' }}>
                <h4 style={{ margin: '0 0 10px', color: '#1B3D2B' }}>Centro de Notificaciones Push</h4>
                <ul style={{ paddingLeft: '18px', fontSize: '0.78rem', color: '#334155', lineHeight: '1.8' }}>
                  <li><strong>09:15 AM:</strong> Cita confirmada de Mariana Valdivia.</li>
                  <li><strong>08:30 AM:</strong> Turno de mañana aperturado por caja.</li>
                  <li><strong>Ayer:</strong> 4 tratamientos completados con calificación 5/5.</li>
                </ul>
              </div>
            )}
          </div>

          {/* Barra de Navegación Inferior (Bottom Nav Bar Móvil) */}
          <div style={{
            background: '#FFFFFF',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-around',
            padding: '10px 0 16px'
          }}>
            <button
              onClick={() => setActiveTab('agenda')}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === 'agenda' ? '#1B3D2B' : '#94A3B8',
                fontWeight: activeTab === 'agenda' ? 700 : 500,
                fontSize: '0.74rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              <span>📅</span>
              Agenda
            </button>
            <button
              onClick={() => setActiveTab('comisiones')}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === 'comisiones' ? '#1B3D2B' : '#94A3B8',
                fontWeight: activeTab === 'comisiones' ? 700 : 500,
                fontSize: '0.74rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              <span>💰</span>
              Comisiones
            </button>
            <button
              onClick={() => setActiveTab('notificaciones')}
              style={{
                background: 'none',
                border: 'none',
                color: activeTab === 'notificaciones' ? '#1B3D2B' : '#94A3B8',
                fontWeight: activeTab === 'notificaciones' ? 700 : 500,
                fontSize: '0.74rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px'
              }}
            >
              <span>🔔</span>
              Alertas
            </button>
          </div>

          {/* Barra de Inicio (Home Indicator del Teléfono) */}
          <div style={{
            height: '4px',
            width: '120px',
            background: '#CBD5E1',
            borderRadius: '2px',
            margin: '0 auto 6px'
          }} />
        </div>
      </div>
    </div>
  );
}
