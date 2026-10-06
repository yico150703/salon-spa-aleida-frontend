import React, { useState } from 'react';
import { ClockIcon, CheckIcon, UsersIcon, CalendarIcon } from './Icons';

export default function Portal({ onAddAppointment, showToast, existingCitas = [] }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('Todos');

  // Booking selections
  const [selectedService, setSelectedService] = useState({
    id: 1,
    nombre: 'Masaje Relajante Aleida',
    categoria: 'Spa & Bienestar',
    duracion: 90,
    precio: 280.0,
    desc: 'Terapia antiestrés con aceites botánicos, aromaterapia personalizada y piedras calientes para relajar tensiones musculares.'
  });

  const [selectedTherapist, setSelectedTherapist] = useState({
    nombre: 'Cualquier Especialista Disponible',
    cargo: 'Asignación automática según disponibilidad'
  });

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('11:00 AM');

  // Intake Form (RF01)
  const [clientDni, setClientDni] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientNotes, setClientNotes] = useState('');

  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const services = [
    {
      id: 1,
      nombre: 'Masaje Relajante Aleida',
      categoria: 'Spa & Bienestar',
      duracion: 90,
      precio: 280.0,
      desc: 'Terapia antiestrés con aceites botánicos, aromaterapia personalizada y piedras calientes.'
    },
    {
      id: 2,
      nombre: 'Facial Rejuvenecedor con Oro',
      categoria: 'Estética Facial',
      duracion: 75,
      precio: 450.0,
      desc: 'Limpieza profunda e hidratación intensiva con micropartículas de oro coloidal y colágeno purificado.'
    },
    {
      id: 3,
      nombre: 'Tratamiento Capilar Keratina',
      categoria: 'Cuidado Capilar',
      duracion: 120,
      precio: 350.0,
      desc: 'Nutrición intensiva con sellado térmico para eliminación total del frizz y brillo prolongado.'
    },
    {
      id: 4,
      nombre: 'Manicura Spa Premium',
      categoria: 'Manicura & Pedicura',
      duracion: 60,
      precio: 150.0,
      desc: 'Exfoliación con sales minerales, hidratación con parafina tibia y esmaltado de alta duración.'
    },
    {
      id: 5,
      nombre: 'Corte y Peinado de Estilo',
      categoria: 'Cuidado Capilar',
      duracion: 45,
      precio: 120.0,
      desc: 'Asesoría de visagismo, lavado con shampoo dermocosmético, corte y estilizado profesional.'
    }
  ];

  const therapists = [
    { nombre: 'Cualquier Especialista Disponible', cargo: 'Asignación automática según horario' },
    { nombre: 'Carmen Sánchez', cargo: 'Cosmiatra & Terapeuta de Spa (8 años de experiencia)' },
    { nombre: 'Luisa Paredes', cargo: 'Estilista Capilar Senior (Colorimetría y tratamientos)' },
    { nombre: 'Ana Vargas', cargo: 'Especialista en Manicura & Spa de manos y pies' }
  ];

  const timeSlots = ['09:00 AM', '10:30 AM', '11:45 AM', '02:30 PM', '04:30 PM', '06:00 PM'];

  // Validar si el slot está ocupado por la especialista seleccionada (RF02)
  const isSlotOccupied = (slot) => {
    if (selectedTherapist.nombre.includes('Cualquier')) return false;
    return existingCitas.some(c => 
      c.fecha === selectedDate &&
      c.hora === slot &&
      c.especialista === selectedTherapist.nombre &&
      c.estado !== 'Cancelada'
    );
  };

  const filteredServices = categoryFilter === 'Todos' 
    ? services 
    : services.filter(s => s.categoria === categoryFilter);

  const handleConfirmReservation = (e) => {
    e.preventDefault();
    if (!clientName || !clientPhone) {
      alert('Por favor complete su nombre y número de teléfono.');
      return;
    }

    const assignedTherapist = selectedTherapist.nombre.includes('Cualquier') 
      ? 'Carmen Sánchez' 
      : selectedTherapist.nombre;

    onAddAppointment({
      cliente: clientName,
      dni: clientDni || 'Canal Web',
      telefono: clientPhone,
      preferencias: clientNotes || 'Sin notas especiales',
      servicio: selectedService.nombre,
      especialista: assignedTherapist,
      fecha: selectedDate,
      hora: selectedTime,
      monto: selectedService.precio,
      estado: 'Confirmada',
      cobrado: false
    });

    setBookingConfirmed(true);
    showToast(`Reserva confirmada para ${clientName} el ${selectedDate} a las ${selectedTime}.`);
  };

  const handleReset = () => {
    setCurrentStep(1);
    setBookingConfirmed(false);
    setClientName('');
    setClientDni('');
    setClientPhone('');
    setClientNotes('');
  };

  return (
    <div className="belle-theme-container">
      {/* Top Banner & Header */}
      <header className="belle-header">
        <div className="belle-header-content">
          <div className="belle-brand">
            <span className="belle-tag">CENTRO DE BELLEZA & BIENESTAR</span>
            <h1>Salon Spa Aleida</h1>
            <p>San Isidro, Lima - Experiencia de relajación y estética certificada</p>
          </div>
          <div className="belle-header-actions">
            <a href="#booking-wizard" className="btn-action primary" onClick={() => setCurrentStep(1)}>
              Reservar Cita
            </a>
            <button className="btn-outline" onClick={() => showToast('Ubicación: Av. Conquistadores 450, San Isidro.')}>
              Ver en el Mapa
            </button>
          </div>
        </div>
      </header>

      {/* Booking Wizard Section */}
      <section className="belle-wizard-section" id="booking-wizard">
        <div className="belle-wizard-card">
          {/* Step Indicator Header (SimplyBook Belle Style) */}
          <div className="belle-steps-nav">
            <button className={`step-item ${currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : ''}`} onClick={() => setCurrentStep(1)}>
              <span className="step-num">1</span>
              <span className="step-label">Servicios</span>
            </button>
            <button className={`step-item ${currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : ''}`} onClick={() => setCurrentStep(2)}>
              <span className="step-num">2</span>
              <span className="step-label">Especialista</span>
            </button>
            <button className={`step-item ${currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : ''}`} onClick={() => setCurrentStep(3)}>
              <span className="step-num">3</span>
              <span className="step-label">Fecha y Hora</span>
            </button>
            <button className={`step-item ${currentStep === 4 ? 'active' : currentStep > 4 ? 'completed' : ''}`} onClick={() => setCurrentStep(4)}>
              <span className="step-num">4</span>
              <span className="step-label">Datos del Cliente</span>
            </button>
            <button className={`step-item ${currentStep === 5 ? 'active' : ''}`} onClick={() => setCurrentStep(5)}>
              <span className="step-num">5</span>
              <span className="step-label">Confirmación</span>
            </button>
          </div>

          {/* STEP 1: SELECT SERVICE */}
          {currentStep === 1 && (
            <div className="wizard-step-content">
              <div className="step-title-box">
                <h2>1. Seleccione el Tratamiento o Servicio</h2>
                <p>Elija la experiencia que desea recibir en nuestras cabinas de atención.</p>
              </div>

              {/* Category Pills */}
              <div className="belle-category-tabs">
                {['Todos', 'Spa & Bienestar', 'Estética Facial', 'Cuidado Capilar', 'Manicura & Pedicura'].map(cat => (
                  <button 
                    key={cat}
                    className={`cat-pill ${categoryFilter === cat ? 'active' : ''}`}
                    onClick={() => setCategoryFilter(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Service Cards Grid */}
              <div className="belle-services-list">
                {filteredServices.map(s => (
                  <div 
                    key={s.id} 
                    className={`belle-service-row ${selectedService.id === s.id ? 'selected' : ''}`}
                    onClick={() => setSelectedService(s)}
                  >
                    <div className="service-row-main">
                      <h3>{s.nombre}</h3>
                      <p>{s.desc}</p>
                      <div className="service-row-meta">
                        <span className="meta-tag"><ClockIcon size={14} /> {s.duracion} minutos</span>
                        <span className="meta-tag category">{s.categoria}</span>
                      </div>
                    </div>
                    <div className="service-row-action">
                      <div className="service-row-price">S/ {s.precio.toFixed(2)}</div>
                      <button 
                        className={`btn-action ${selectedService.id === s.id ? 'primary' : 'outline'}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedService(s);
                          setCurrentStep(2);
                        }}
                      >
                        {selectedService.id === s.id ? 'Seleccionado' : 'Seleccionar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="wizard-footer-nav">
                <div></div>
                <button className="btn-action primary" onClick={() => setCurrentStep(2)}>
                  Siguiente: Especialista
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SELECT THERAPIST */}
          {currentStep === 2 && (
            <div className="wizard-step-content">
              <div className="step-title-box">
                <h2>2. Seleccione la Especialista</h2>
                <p>Servicio seleccionado: <strong>{selectedService.nombre}</strong> (S/ {selectedService.precio.toFixed(2)})</p>
              </div>

              <div className="therapists-grid">
                {therapists.map(t => (
                  <div 
                    key={t.nombre}
                    className={`therapist-card ${selectedTherapist.nombre === t.nombre ? 'selected' : ''}`}
                    onClick={() => setSelectedTherapist(t)}
                  >
                    <div className="therapist-avatar">
                      <UsersIcon size={24} color="#9E7434" />
                    </div>
                    <div className="therapist-info">
                      <h4>{t.nombre}</h4>
                      <p>{t.cargo}</p>
                    </div>
                    <div className="therapist-check">
                      {selectedTherapist.nombre === t.nombre && <CheckIcon size={18} color="#2E7D32" />}
                    </div>
                  </div>
                ))}
              </div>

              <div className="wizard-footer-nav">
                <button className="btn-outline" onClick={() => setCurrentStep(1)}>
                  Anterior
                </button>
                <button className="btn-action primary" onClick={() => setCurrentStep(3)}>
                  Siguiente: Fecha y Hora
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: SELECT DATE & TIME (SLOTS) */}
          {currentStep === 3 && (
            <div className="wizard-step-content">
              <div className="step-title-box">
                <h2>3. Seleccione Fecha y Horario Disponible</h2>
                <p>Especialista: <strong>{selectedTherapist.nombre}</strong></p>
              </div>

              <div className="datetime-selection-box">
                <div className="date-picker-col">
                  <label><strong>Fecha de Atención:</strong></label>
                  <input 
                    type="date" 
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="input-date-styled"
                  />
                  <small style={{ color: 'var(--color-text-muted)', display: 'block', marginTop: '6px' }}>
                    Horario de atención: Lunes a Sábado de 09:00 AM a 07:00 PM.
                  </small>
                </div>

                <div className="time-slots-col">
                  <label><strong>Horarios Disponibles para esta Fecha (RF02):</strong></label>
                  <div className="slots-grid">
                    {timeSlots.map(slot => {
                      const occupied = isSlotOccupied(slot);
                      return (
                        <button
                          key={slot}
                          type="button"
                          disabled={occupied}
                          className={`slot-btn ${selectedTime === slot ? 'selected' : ''} ${occupied ? 'occupied' : ''}`}
                          onClick={() => setSelectedTime(slot)}
                        >
                          {slot}
                          {occupied && <span className="slot-occupied-tag">Ocupado</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="wizard-footer-nav">
                <button className="btn-outline" onClick={() => setCurrentStep(2)}>
                  Anterior
                </button>
                <button className="btn-action primary" onClick={() => setCurrentStep(4)}>
                  Siguiente: Datos de Contacto
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: INTAKE FORM (RF01) */}
          {currentStep === 4 && (
            <div className="wizard-step-content">
              <div className="step-title-box">
                <h2>4. Formulario de Admisión del Cliente (Intake Form)</h2>
                <p>Ingrese sus datos para vincular su ficha de atención y confirmación de reserva.</p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); setCurrentStep(5); }}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nombres y Apellidos *</label>
                    <input 
                      type="text" 
                      placeholder="Ej. Mariana Torres" 
                      value={clientName} 
                      onChange={(e) => setClientName(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Número de Teléfono / WhatsApp *</label>
                    <input 
                      type="text" 
                      placeholder="Ej. 987654321" 
                      value={clientPhone} 
                      onChange={(e) => setClientPhone(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Documento de Identidad (DNI) (Opcional)</label>
                    <input 
                      type="text" 
                      placeholder="Ej. 72819382" 
                      value={clientDni} 
                      onChange={(e) => setClientDni(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Condiciones o Alergias Médicas (RF01)</label>
                    <input 
                      type="text" 
                      placeholder="Ej. Piel sensible, alergia a tintes con amoníaco..." 
                      value={clientNotes} 
                      onChange={(e) => setClientNotes(e.target.value)}
                    />
                  </div>
                </div>

                <div className="wizard-footer-nav">
                  <button type="button" className="btn-outline" onClick={() => setCurrentStep(3)}>
                    Anterior
                  </button>
                  <button type="submit" className="btn-action primary">
                    Siguiente: Resumen & Confirmación
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 5: SUMMARY & CONFIRMATION */}
          {currentStep === 5 && (
            <div className="wizard-step-content">
              <div className="step-title-box">
                <h2>5. Resumen y Confirmación de la Reserva</h2>
                <p>Verifique los detalles antes de registrar su cita en el sistema de Salon Spa Aleida.</p>
              </div>

              {bookingConfirmed ? (
                <div className="booking-completed-card">
                  <div className="completed-badge">Reserva Confirmada</div>
                  <h3>¡Gracias, {clientName}! Tu cita ha sido registrada con éxito.</h3>
                  <p>Hemos separado tu espacio y asignado a tu especialista.</p>
                  <div className="confirmation-details-box">
                    <p><strong>Tratamiento:</strong> {selectedService.nombre} ({selectedService.duracion} min)</p>
                    <p><strong>Fecha y Hora:</strong> {selectedDate} a las {selectedTime}</p>
                    <p><strong>Especialista:</strong> {selectedTherapist.nombre}</p>
                    <p><strong>Importe a Pagar en Sala:</strong> S/ {selectedService.precio.toFixed(2)}</p>
                  </div>
                  <button className="btn-action primary" onClick={handleReset} style={{ marginTop: '20px' }}>
                    Realizar Otra Reserva
                  </button>
                </div>
              ) : (
                <div className="booking-summary-card">
                  <div className="summary-block">
                    <h3>Detalle de la Sesión</h3>
                    <div className="summary-line">
                      <span>Servicio:</span>
                      <strong>{selectedService.nombre}</strong>
                    </div>
                    <div className="summary-line">
                      <span>Duración:</span>
                      <span>{selectedService.duracion} minutos</span>
                    </div>
                    <div className="summary-line">
                      <span>Especialista Asignada:</span>
                      <strong>{selectedTherapist.nombre}</strong>
                    </div>
                    <div className="summary-line">
                      <span>Fecha y Horario:</span>
                      <strong>{selectedDate} • {selectedTime}</strong>
                    </div>
                    <div className="summary-line">
                      <span>Cliente:</span>
                      <span>{clientName || 'Por completar'} ({clientPhone})</span>
                    </div>
                    <hr />
                    <div className="summary-line total">
                      <span>Importe Total:</span>
                      <strong className="price-tag">S/ {selectedService.precio.toFixed(2)}</strong>
                    </div>
                  </div>

                  <div className="policy-note">
                    <p>
                      <strong>Política de Puntualidad (OBJ-01):</strong> Por favor presentarse 10 minutos antes de su horario programado. Podrá reprogramar o cancelar su cita comunicándose con recepción con un mínimo de 2 horas de anticipación.
                    </p>
                  </div>

                  <div className="wizard-footer-nav">
                    <button className="btn-outline" onClick={() => setCurrentStep(4)}>
                      Anterior
                    </button>
                    <button className="btn-action success" onClick={handleConfirmReservation}>
                      Confirmar Reserva Inmediata
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
