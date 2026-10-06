import React, { useState } from 'react';
import { ClockIcon, CheckIcon, UsersIcon, CalendarIcon, ShieldIcon, TargetIcon, UserIcon } from './Icons';

export default function Portal({ onAddAppointment, onSwitchToAdmin, showToast, existingCitas = [] }) {
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
      desc: 'Terapia antiestrés con aceites botánicos, aromaterapia personalizada y piedras calientes para disolver tensiones acumuladas.'
    },
    {
      id: 2,
      nombre: 'Facial Rejuvenecedor con Oro',
      categoria: 'Estética Facial',
      duracion: 75,
      precio: 450.0,
      desc: 'Limpieza profunda e hidratación intensiva con micropartículas de oro coloidal y colágeno hidrolizado purificado.'
    },
    {
      id: 3,
      nombre: 'Tratamiento Capilar Keratina',
      categoria: 'Cuidado Capilar',
      duracion: 120,
      precio: 350.0,
      desc: 'Nutrición intensiva con sellado térmico para eliminación total del frizz y brillo prolongado de calidad profesional.'
    },
    {
      id: 4,
      nombre: 'Manicura Spa Premium',
      categoria: 'Manicura & Pedicura',
      duracion: 60,
      precio: 150.0,
      desc: 'Exfoliación con sales minerales marinas, hidratación profunda con parafina tibia y esmaltado de alta duración.'
    },
    {
      id: 5,
      nombre: 'Corte y Peinado de Estilo',
      categoria: 'Cuidado Capilar',
      duracion: 45,
      precio: 120.0,
      desc: 'Asesoría de visagismo personalizada, lavado con shampoo dermocosmético, corte de autor y estilizado profesional.'
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

  const scrollToBooking = (serviceToSelect = null) => {
    if (serviceToSelect) {
      setSelectedService(serviceToSelect);
      setCurrentStep(2);
    }
    const el = document.getElementById('reservar-cita');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
      {/* 1. TOP NAVIGATION BAR */}
      <nav className="belle-navbar">
        <div className="belle-navbar-inner">
          <div className="belle-logo-brand">
            <span className="logo-symbol">ALEIDA</span>
            <div className="logo-texts">
              <strong className="logo-title">Salon Spa Aleida</strong>
              <small className="logo-sub">San Isidro • Belleza & Bienestar</small>
            </div>
          </div>

          <div className="belle-nav-links">
            <a href="#inicio">Inicio</a>
            <a href="#servicios">Servicios</a>
            <a href="#experiencia">Nuestra Experiencia</a>
            <a href="#especialistas">Especialistas</a>
            <a href="#contacto">Contacto</a>
          </div>

          <div className="belle-nav-actions">
            <button className="btn-book-nav" onClick={() => scrollToBooking()}>
              Reservar una Cita
            </button>
            <button 
              className="btn-admin-access" 
              onClick={onSwitchToAdmin}
              title="Acceso al Panel de Gestión Interno (9 Casos de Uso)"
            >
              Acceso Administrativo
            </button>
          </div>
        </div>
      </nav>

      {/* 2. HERO PRESENTATION SECTION */}
      <header className="belle-hero-presentation" id="inicio">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="hero-badge">
            <span>CENTRO EXCLUSIVO DE BELLEZA & BIENESTAR EN SAN ISIDRO</span>
          </div>

          <h1 className="hero-headline">
            Renueva tu Belleza,<br />Equilibra tu Bienestar
          </h1>

          <p className="hero-subheadline">
            En Salon Spa Aleida combinamos rituales terapéuticos botánicos, tratamientos faciales antiedad de última generación y estilismo capilar personalizado en un ambiente de calma, sofisticación y cuidado integral.
          </p>

          <div className="hero-cta-group">
            <button className="btn-hero-primary" onClick={() => scrollToBooking()}>
              Reservar una Cita
            </button>
            <a href="#servicios" className="btn-hero-secondary">
              Ver Tratamientos
            </a>
          </div>

          {/* 4 Pillars of Excellence */}
          <div className="hero-pillars-grid">
            <div className="pillar-item">
              <div className="pillar-icon"><UserIcon size={22} /></div>
              <div className="pillar-text">
                <strong>Especialistas Certificadas</strong>
                <span>Cosmiatras y terapeutas dedicadas a tu cuidado individual.</span>
              </div>
            </div>
            <div className="pillar-item">
              <div className="pillar-icon"><ShieldIcon size={22} /></div>
              <div className="pillar-text">
                <strong>Cosmética de Alta Gama</strong>
                <span>Fórmulas dermocosméticas libres de químicos agresivos.</span>
              </div>
            </div>
            <div className="pillar-item">
              <div className="pillar-icon"><TargetIcon size={22} /></div>
              <div className="pillar-text">
                <strong>Cabinas Climatizadas</strong>
                <span>Aromaterapia botánica, luz tenue y confort absoluto.</span>
              </div>
            </div>
            <div className="pillar-item">
              <div className="pillar-icon"><ClockIcon size={22} /></div>
              <div className="pillar-text">
                <strong>Puntualidad Garantizada</strong>
                <span>Agenda sin esperas; respetamos rigurosamente tu tiempo.</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* 3. SHOWCASE DE SERVICIOS */}
      <section className="belle-services-showcase" id="servicios">
        <div className="section-container">
          <div className="section-header-center">
            <span className="section-kicker">RITUALES & TRATAMIENTOS EXCLUSIVOS</span>
            <h2>Nuestra Carta de Experiencias</h2>
            <p>Cada sesión está concebida para restaurar el equilibrio físico, renovar tu vitalidad y realzar tu elegancia natural.</p>
          </div>

          <div className="showcase-cards-grid">
            {services.map((item) => (
              <div key={item.id} className="showcase-card">
                <div className="showcase-card-header">
                  <span className="showcase-category">{item.categoria}</span>
                  <span className="showcase-duration"><ClockIcon size={14} /> {item.duracion} min</span>
                </div>
                <h3>{item.nombre}</h3>
                <p>{item.desc}</p>
                <div className="showcase-card-footer">
                  <div className="showcase-price">S/ {item.precio.toFixed(2)}</div>
                  <button 
                    className="btn-showcase-book" 
                    onClick={() => scrollToBooking(item)}
                  >
                    Reservar Tratamiento
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. ASISTENTE INTERACTIVO DE RESERVA (SIMPLYBOOK BELLE V2 WIZARD) */}
      <section className="belle-wizard-section" id="reservar-cita">
        <div className="section-container">
          <div className="section-header-center">
            <span className="section-kicker">ASISTENTE DE AGENDAMIENTO EN LÍNEA</span>
            <h2>Reserva tu Cita en 5 Pasos</h2>
            <p>Selecciona tu tratamiento preferido, tu especialista de confianza y el bloque horario que mejor se adapte a tu agenda.</p>
          </div>

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
                  <h3>1. Seleccione el Tratamiento o Servicio</h3>
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
                        <h4>{s.nombre}</h4>
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
                    Siguiente: Elegir Especialista
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: SELECT THERAPIST */}
            {currentStep === 2 && (
              <div className="wizard-step-content">
                <div className="step-title-box">
                  <h3>2. Seleccione a su Especialista</h3>
                  <p>Puede elegir a su profesional de confianza o permitir que el sistema le asigne automáticamente.</p>
                </div>

                <div className="belle-therapists-grid">
                  {therapists.map(t => (
                    <div 
                      key={t.nombre}
                      className={`therapist-card ${selectedTherapist.nombre === t.nombre ? 'selected' : ''}`}
                      onClick={() => setSelectedTherapist(t)}
                    >
                      <div className="therapist-avatar">
                        {t.nombre.split(' ').map(n => n[0]).slice(0, 2).join('')}
                      </div>
                      <div className="therapist-info">
                        <h4>{t.nombre}</h4>
                        <p>{t.cargo}</p>
                        {selectedTherapist.nombre === t.nombre && (
                          <span className="tag-selected"><CheckIcon size={14} /> Seleccionada</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="wizard-footer-nav">
                  <button className="btn-outline" onClick={() => setCurrentStep(1)}>
                    Anterior
                  </button>
                  <button className="btn-action primary" onClick={() => setCurrentStep(3)}>
                    Siguiente: Fecha y Horario
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: SELECT DATE & TIME (RF02 CONFLICT VALIDATION) */}
            {currentStep === 3 && (
              <div className="wizard-step-content">
                <div className="step-title-box">
                  <h3>3. Seleccione Fecha y Hora de Atención</h3>
                  <p>Consulte la disponibilidad en tiempo real para evitar cualquier retraso o cruce de horario.</p>
                </div>

                <div className="belle-datetime-layout">
                  <div className="date-picker-box">
                    <h4>Fecha del Tratamiento</h4>
                    <input 
                      type="date" 
                      value={selectedDate} 
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="belle-date-input"
                    />
                    <div style={{ marginTop: '14px', fontSize: '0.84rem', color: '#6D4C41' }}>
                      <strong>Especialista:</strong> {selectedTherapist.nombre}
                    </div>
                  </div>

                  <div className="slots-picker-box">
                    <h4>Horarios Libres Disponibles</h4>
                    <div className="slots-grid">
                      {timeSlots.map(slot => {
                        const occupied = isSlotOccupied(slot);
                        return (
                          <button
                            key={slot}
                            disabled={occupied}
                            className={`slot-btn ${selectedTime === slot ? 'selected' : ''} ${occupied ? 'disabled' : ''}`}
                            onClick={() => setSelectedTime(slot)}
                          >
                            <span>{slot}</span>
                            {occupied && <small style={{ display: 'block', fontSize: '0.68rem', color: '#B71C1C' }}>Ocupado</small>}
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

            {/* STEP 4: CLIENT INTAKE FORM (RF01) */}
            {currentStep === 4 && (
              <div className="wizard-step-content">
                <div className="step-title-box">
                  <h3>4. Datos del Cliente & Ficha Estética (RF01)</h3>
                  <p>Ingrese sus datos de contacto y antecedentes dérmicos o capilares para una atención personalizada.</p>
                </div>

                <form className="intake-form" onSubmit={(e) => { e.preventDefault(); setCurrentStep(5); }}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Nombre y Apellidos Completos *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Ej. Valeria Carranza" 
                        value={clientName} 
                        onChange={(e) => setClientName(e.target.value)} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Teléfono / WhatsApp *</label>
                      <input 
                        type="tel" 
                        required 
                        placeholder="Ej. 987654321" 
                        value={clientPhone} 
                        onChange={(e) => setClientPhone(e.target.value)} 
                      />
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Documento de Identidad (DNI) (Opcional)</label>
                      <input 
                        type="text" 
                        placeholder="Ej. 45910284" 
                        value={clientDni} 
                        onChange={(e) => setClientDni(e.target.value)} 
                      />
                    </div>
                    <div className="form-group">
                      <label>Condiciones o Preferencias (Alergias, Cutis, Embarazo)</label>
                      <input 
                        type="text" 
                        placeholder="Ej. Piel sensible a perfumes, preferencia por presión media" 
                        value={clientNotes} 
                        onChange={(e) => setClientNotes(e.target.value)} 
                      />
                    </div>
                  </div>

                  <div className="intake-notice">
                    [CONFIDENCIALIDAD] Sus datos quedan registrados de forma segura conforme a la política de protección de datos de Salon Spa Aleida S.A.C.
                  </div>

                  <div className="wizard-footer-nav" style={{ marginTop: '24px' }}>
                    <button type="button" className="btn-outline" onClick={() => setCurrentStep(3)}>
                      Anterior
                    </button>
                    <button type="submit" className="btn-action primary">
                      Siguiente: Confirmar Reserva
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* STEP 5: SUMMARY & CONFIRMATION */}
            {currentStep === 5 && (
              <div className="wizard-step-content">
                {bookingConfirmed ? (
                  <div className="confirmation-success-card">
                    <span className="confirmation-badge">[RESERVA CONFIRMADA]</span>
                    <h3>¡Gracias, {clientName}! Tu cita ha sido programada exitosamente.</h3>
                    <p style={{ color: '#5D4037', margin: '10px 0 20px' }}>
                      Hemos reservado la cabina y notificado a la especialista asignada en Salon Spa Aleida.
                    </p>
                    <div className="confirmation-details-box">
                      <p><strong>Tratamiento:</strong> {selectedService.nombre} ({selectedService.duracion} min)</p>
                      <p><strong>Fecha y Horario:</strong> {selectedDate} a las {selectedTime}</p>
                      <p><strong>Especialista Asignada:</strong> {selectedTherapist.nombre}</p>
                      <p><strong>Total a Pagar en Recepción:</strong> S/ {selectedService.precio.toFixed(2)}</p>
                    </div>
                    <button className="btn-action primary" onClick={handleReset} style={{ marginTop: '24px' }}>
                      Realizar Otra Reserva
                    </button>
                  </div>
                ) : (
                  <div className="booking-summary-card">
                    <div className="summary-header">
                      <h3>Resumen de su Reserva</h3>
                      <p style={{ color: '#795548', fontSize: '0.88rem' }}>Por favor verifique los detalles antes de confirmar.</p>
                    </div>

                    <div className="summary-details">
                      <div className="summary-row">
                        <span>Tratamiento:</span>
                        <strong>{selectedService.nombre}</strong>
                      </div>
                      <div className="summary-row">
                        <span>Duración Estimada:</span>
                        <span>{selectedService.duracion} minutos</span>
                      </div>
                      <div className="summary-row">
                        <span>Especialista Asignada:</span>
                        <strong>{selectedTherapist.nombre}</strong>
                      </div>
                      <div className="summary-row">
                        <span>Fecha y Hora:</span>
                        <strong>{selectedDate} • {selectedTime}</strong>
                      </div>
                      <div className="summary-row">
                        <span>Cliente:</span>
                        <span>{clientName || 'Por completar'} ({clientPhone || 'Sin teléfono'})</span>
                      </div>
                      <div className="summary-row total">
                        <span>Importe Total:</span>
                        <span className="price-val">S/ {selectedService.precio.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="cancellation-policy-box">
                      <strong>Política de Puntualidad y Cancelación (RF03):</strong>
                      <p style={{ marginTop: '4px', fontSize: '0.82rem' }}>
                        Agradecemos presentarse con 10 minutos de anticipación. Podrá reprogramar o cancelar su cita comunicándose con recepción con un mínimo de 2 horas de anticipación.
                      </p>
                    </div>

                    <div className="wizard-footer-nav">
                      <button className="btn-outline" onClick={() => setCurrentStep(4)}>
                        Anterior
                      </button>
                      <button className="btn-action success" onClick={handleConfirmReservation}>
                        Confirmar Reserva Ahora
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. SECCIÓN DE EXPERIENCIA & FILOSOFÍA */}
      <section className="belle-experience-section" id="experiencia">
        <div className="section-container">
          <div className="experience-layout">
            <div className="experience-text">
              <span className="section-kicker">LA EXPERIENCIA ALEIDA</span>
              <h2>Un Santuario de Relajación en San Isidro</h2>
              <p>
                En Salon Spa Aleida entendemos la belleza no como un fin superficial, sino como el reflejo natural de la salud, la armonía y el bienestar integral. Nuestras cabinas han sido diseñadas con altos estándares de confort acústico, cromoterapia suave y aromas botánicos seleccionados para inducir un estado de descanso profundo.
              </p>
              <ul className="experience-list">
                <li>
                  <span className="list-bullet"><CheckIcon size={14} /></span>
                  <div>
                    <strong>Diagnóstico Personalizado</strong>
                    <span>Evaluamos las necesidades de tu tipo de piel o hebra capilar antes de cada aplicación.</span>
                  </div>
                </li>
                <li>
                  <span className="list-bullet"><CheckIcon size={14} /></span>
                  <div>
                    <strong>Bioseguridad e Higiene Certificada</strong>
                    <span>Instrumental esterilizado y protocolos rigurosos en cada procedimiento.</span>
                  </div>
                </li>
                <li>
                  <span className="list-bullet"><CheckIcon size={14} /></span>
                  <div>
                    <strong>Atención Cálida y Exclusiva</strong>
                    <span>Espacios creados para que disfrutes de tu momento personal sin prisas.</span>
                  </div>
                </li>
              </ul>
            </div>
            <div className="experience-box-card">
              <div className="badge-experience">CERTIFICACIÓN SPA PREMIUM</div>
              <h3>Salon Spa Aleida</h3>
              <p>Más de 10 años brindando tratamientos de autor en Lima con la más alta calificación de satisfacción.</p>
              <hr />
              <div className="experience-stat">
                <strong>98.5%</strong>
                <small>Índice de satisfacción y clientes recurrentes</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ESPECIALISTAS */}
      <section className="belle-team-section" id="especialistas">
        <div className="section-container">
          <div className="section-header-center">
            <span className="section-kicker">NUESTRO EQUIPO PROFESIONAL</span>
            <h2>Especialistas Dedicadas a Tu Bienestar</h2>
            <p>Profesionales tituladas y en constante capacitación para garantizarte resultados excepcionales.</p>
          </div>

          <div className="team-grid">
            <div className="team-card">
              <div className="team-avatar">CS</div>
              <h3>Carmen Sánchez</h3>
              <span className="team-role">Cosmiatra & Terapeuta Holística</span>
              <p>Especialista en drenaje linfático, masajes terapéuticos descontracturantes y tratamientos faciales rejuvenecedores.</p>
            </div>
            <div className="team-card">
              <div className="team-avatar">LP</div>
              <h3>Luisa Paredes</h3>
              <span className="team-role">Estilista Capilar Senior</span>
              <p>Experta en colorimetría, visagismo, botox capilar y aplicación de keratina orgánica para restauración profunda.</p>
            </div>
            <div className="team-card">
              <div className="team-avatar">AV</div>
              <h3>Ana Vargas</h3>
              <span className="team-role">Especialista en Manicura & Pedicura</span>
              <p>Dominio de técnicas de esmaltado en gel, spa de pies con parafina caliente y cuidado estético de uñas.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. UBICACIÓN & CONTACTO */}
      <section className="belle-contact-section" id="contacto">
        <div className="section-container">
          <div className="contact-layout">
            <div className="contact-info">
              <span className="section-kicker">VISÍTANOS EN SAN ISIDRO</span>
              <h2>Horarios & Ubicación</h2>
              <p>Te esperamos en nuestro salón en una de las zonas más exclusivas y accesibles de Lima.</p>
              
              <div className="contact-details">
                <div className="contact-row">
                  <strong>Dirección:</strong>
                  <span>Av. Conquistadores 450, San Isidro, Lima - Perú</span>
                </div>
                <div className="contact-row">
                  <strong>Horario de Atención:</strong>
                  <span>Lunes a Sábado: 09:00 AM – 08:00 PM (Previa Reserva)</span>
                </div>
                <div className="contact-row">
                  <strong>Teléfono / Citas:</strong>
                  <span>(01) 421-9876 | WhatsApp: 987 654 321</span>
                </div>
                <div className="contact-row">
                  <strong>Correo Electrónico:</strong>
                  <span>contacto@salonspaaleida.com</span>
                </div>
              </div>

              <div style={{ marginTop: '24px' }}>
                <button className="btn-hero-primary" onClick={() => scrollToBooking()}>
                  Reservar una Cita
                </button>
              </div>
            </div>

            <div className="contact-card-map">
              <div className="map-placeholder">
                <div className="map-pin">UBICACIÓN</div>
                <h4>Salon Spa Aleida</h4>
                <p>Av. Conquistadores 450, San Isidro</p>
                <small>Estacionamiento privado disponible para clientes.</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FOOTER ELEGANTE */}
      <footer className="belle-footer">
        <div className="section-container">
          <div className="footer-top">
            <div className="footer-brand">
              <strong>Salon Spa Aleida S.A.C.</strong>
              <p>Belleza, Estilo y Bienestar en San Isidro, Lima - Perú</p>
            </div>
            <div className="footer-links">
              <a href="#inicio">Inicio</a>
              <a href="#servicios">Servicios</a>
              <a href="#reservar-cita">Reservar una Cita</a>
              <a 
                href="/Objetivos_vs_Casos_de_Uso.png" 
                download="Objetivos_vs_Casos_de_Uso.png"
                className="footer-admin-btn"
                style={{ textDecoration: 'none' }}
              >
                Descargar Diagrama Objetivos vs CUs (PNG)
              </a>
              <button 
                className="footer-admin-btn"
                onClick={onSwitchToAdmin}
              >
                Acceso Administrativo (9 Casos de Uso)
              </button>
            </div>
          </div>
          <div className="footer-bottom">
            <small>© 2026 Salon Spa Aleida S.A.C. Todos los derechos reservados. RUC: 20608192831.</small>
          </div>
        </div>
      </footer>
    </div>
  );
}
