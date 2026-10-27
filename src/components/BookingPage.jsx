import React, { useState, useEffect } from 'react';
import { 
  ClockIcon, CheckIcon, UsersIcon, CalendarIcon, ShieldIcon, 
  LockIcon 
} from './Icons';

export default function BookingPage({
  onAddAppointment,
  onBackToHome,
  onSwitchToAdmin,
  showToast,
  existingCitas = [],
  preselectedService = null
}) {
  const [currentStep, setCurrentStep] = useState(1);
  const [categoryFilter, setCategoryFilter] = useState('Todos');

  // Booking selections
  const [selectedService, setSelectedService] = useState(
    preselectedService || {
      id: 1,
      nombre: 'Masaje Relajante Aleida',
      categoria: 'Spa & Bienestar',
      duracion: 90,
      precio: 280.0,
      desc: 'Terapia antiestrés con aceites botánicos, aromaterapia personalizada y piedras calientes para disolver tensiones acumuladas.'
    }
  );

  const [selectedTherapist, setSelectedTherapist] = useState({
    nombre: 'Cualquier Especialista Disponible',
    cargo: 'Asignación inteligente según cabina',
    experiencia: 'Disponibilidad inmediata',
    rating: '5.0',
    especialidad: 'Máxima flexibilidad horaria'
  });

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('10:30 AM');

  // Intake Form (DS_CU03 & RF01)
  const [clientDni, setClientDni] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [aromatherapy, setAromatherapy] = useState('Lavanda Francesa (Relajante)');
  const [ticketCode, setTicketCode] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  useEffect(() => {
    if (preselectedService) {
      setSelectedService(preselectedService);
      setCurrentStep(2); // Jump directly to specialist selection
    }
  }, [preselectedService]);

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
    { 
      nombre: 'Cualquier Especialista Disponible', 
      cargo: 'Asignación inteligente según cabina', 
      experiencia: 'Disponibilidad inmediata', 
      rating: '5.0', 
      especialidad: 'Máxima flexibilidad horaria' 
    },
    { 
      nombre: 'Carmen Sánchez', 
      cargo: 'Cosmiatra Máster & Terapeuta Spa', 
      experiencia: '8 años de experiencia', 
      rating: '4.95', 
      especialidad: 'Masajes descontracturantes & Faciales con Oro' 
    },
    { 
      nombre: 'Luisa Paredes', 
      cargo: 'Estilista Capilar & Colorista Senior', 
      experiencia: '6 años de experiencia', 
      rating: '4.88', 
      especialidad: 'Tratamientos de Keratina y Nutrición Profunda' 
    },
    { 
      nombre: 'Ana Vargas', 
      cargo: 'Especialista en Manicura & Podología Spa', 
      experiencia: '5 años de experiencia', 
      rating: '4.92', 
      especialidad: 'Spa de Manos y Pies con Parafina Tibia' 
    }
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
    if (!clientName.trim() || !clientPhone.trim()) {
      alert('Por favor complete su nombre y número de WhatsApp.');
      return;
    }

    const assignedTherapist = selectedTherapist.nombre.includes('Cualquier') 
      ? 'Carmen Sánchez' 
      : selectedTherapist.nombre;

    const code = 'ALE-' + Math.floor(10000 + Math.random() * 90000);
    setTicketCode(code);

    const fullNotes = [
      aromatherapy ? `Aromaterapia: ${aromatherapy}` : null,
      clientNotes ? `Observaciones: ${clientNotes}` : null
    ].filter(Boolean).join(' | ') || 'Sin notas especiales';

    onAddAppointment({
      cliente: clientName,
      dni: clientDni || 'Canal Web',
      telefono: clientPhone,
      preferencias: fullNotes,
      servicio: selectedService.nombre,
      especialista: assignedTherapist,
      fecha: selectedDate,
      hora: selectedTime,
      monto: selectedService.precio,
      estado: 'Confirmada',
      cobrado: false,
      codigoReserva: code
    });

    setBookingConfirmed(true);
    if (showToast) {
      showToast(`¡Reserva confirmada #${code}! Te esperamos el ${selectedDate} a las ${selectedTime}.`);
    }
  };

  const handleReset = () => {
    setCurrentStep(1);
    setBookingConfirmed(false);
    setTicketCode('');
    setClientName('');
    setClientDni('');
    setClientPhone('');
    setClientNotes('');
  };

  return (
    <div className="booking-page-root">
      {/* 1. TOP HEADER DE LA PÁGINA DEDICADA DE RESERVAS */}
      <header className="booking-page-header">
        <div className="booking-header-inner">
          <div className="booking-header-left">
            <button 
              id="btn-booking-back-home"
              className="btn-back-portal"
              onClick={onBackToHome}
              title="Volver a la Página Principal"
            >
              <span>←</span> Volver al Portal
            </button>
            <div className="booking-header-brand" onClick={onBackToHome} style={{ cursor: 'pointer' }}>
              <span className="brand-name">Salon Spa Aleida</span>
              <span className="brand-tagline">Reserva Oficial en Línea</span>
            </div>
          </div>

          <div className="booking-header-right">
            <div className="booking-header-contact">
              <span className="contact-label">Atención y Consultas:</span>
              <strong className="contact-phone">(01) 421-8900</strong>
            </div>
            <button 
              id="btn-booking-switch-admin"
              className="btn-admin-access-pill"
              onClick={onSwitchToAdmin}
            >
              Acceso Administrativo (Staff)
            </button>
          </div>
        </div>
      </header>

      {/* 2. BREADCRUMBS & INTRO BANNER */}
      <div className="booking-breadcrumb-strip">
        <div className="section-container">
          <div className="breadcrumb-nav">
            <span className="bc-link" onClick={onBackToHome}>Portal Principal</span>
            <span className="bc-separator">/</span>
            <span className="bc-current">Página de Reserva de Citas en Línea (DS_CU04)</span>
          </div>
        </div>
      </div>

      {/* 3. CONTENIDO PRINCIPAL: ASISTENTE INTERACTIVO DE ALTA GAMA */}
      <main className="booking-page-main">
        <div className="section-container">
          
          {/* Header de la Página */}
          <div className="booking-page-hero">
            <span className="section-kicker">SISTEMA OFICIAL DE CITAS · SALON SPA ALEIDA</span>
            <h1 className="booking-page-title">Reserva tu Experiencia Spa &amp; Bienestar</h1>
            <p className="booking-page-sub">
              Elige tu tratamiento preferido, tu especialista de confianza y asegura tu cabina climatizada con confirmación instantánea.
            </p>

            {/* Franja de Confianza */}
            <div className="luxury-trust-strip">
              <span className="trust-badge-item">
                <ShieldIcon size={15} color="#C8A26A" /> Bioseguridad Grado Médico
              </span>
              <span className="trust-badge-item">
                <ClockIcon size={15} color="#C8A26A" /> Puntualidad Garantizada
              </span>
              <span className="trust-badge-item">
                <UsersIcon size={15} color="#C8A26A" /> Terapeutas Certificadas
              </span>
              <span className="trust-badge-item">
                <CheckIcon size={15} color="#C8A26A" /> Cancelación Libre hasta 2h antes (DS_CU05)
              </span>
            </div>
          </div>

          {/* WIZARD CONTAINER */}
          <div className="luxury-wizard-wrapper">
            
            {/* Progress Stepper Bar */}
            <div className="luxury-stepper-container">
              <div className="stepper-progress-track">
                <div 
                  className="stepper-progress-fill" 
                  style={{ width: `${(currentStep / 5) * 100}%` }}
                ></div>
              </div>

              <div className="luxury-steps-nav">
                {[
                  { step: 1, label: 'Tratamiento', sub: 'Elige tu servicio' },
                  { step: 2, label: 'Especialista', sub: 'Tu terapeuta' },
                  { step: 3, label: 'Agenda', sub: 'Fecha y turno' },
                  { step: 4, label: 'Ficha Cliente', sub: 'DS_CU03 Datos' },
                  { step: 5, label: 'Confirmación', sub: 'Voucher Oficial' }
                ].map((s) => {
                  const isActive = currentStep === s.step;
                  const isCompleted = currentStep > s.step;
                  return (
                    <button 
                      key={s.step}
                      id={`dedicated-step-btn-${s.step}`}
                      className={`luxury-step-tab ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
                      onClick={() => !bookingConfirmed && setCurrentStep(s.step)}
                    >
                      <div className="step-badge">
                        {isCompleted ? <CheckIcon size={14} color="#FFF" /> : s.step}
                      </div>
                      <div className="step-text-meta">
                        <span className="step-title">{s.label}</span>
                        <span className="step-sub">{s.sub}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Two-Column Booking Layout: Left Step Form + Right Sticky Summary */}
            <div className="luxury-booking-layout">
              
              {/* Left Column: Active Step Form */}
              <div className="luxury-step-pane">
                
                {/* STEP 1: SELECT SERVICE */}
                {currentStep === 1 && (
                  <div className="wizard-step-body animate-fade-in">
                    <div className="step-heading-row">
                      <div>
                        <h3>1. Selecciona tu Tratamiento o Experiencia Spa</h3>
                        <p>Cada tratamiento incluye consulta previa, toallas térmicas e infusión détox botánica de cortesía.</p>
                      </div>
                      <span className="step-pill-counter">Paso 1 de 5</span>
                    </div>

                    {/* Category Filter Pills */}
                    <div className="luxury-cat-filter-pills">
                      {['Todos', 'Spa & Bienestar', 'Estética Facial', 'Cuidado Capilar', 'Manicura & Pedicura'].map(cat => (
                        <button 
                          key={cat}
                          id={`cat-filter-${cat.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                          className={`luxury-filter-btn ${categoryFilter === cat ? 'active' : ''}`}
                          onClick={() => setCategoryFilter(cat)}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>

                    {/* Services Grid */}
                    <div className="luxury-services-grid">
                      {filteredServices.map(s => {
                        const isSelected = selectedService.id === s.id;
                        return (
                          <div 
                            key={s.id}
                            id={`booking-service-card-${s.id}`}
                            className={`luxury-service-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => setSelectedService(s)}
                          >
                            <div className="service-card-top">
                              <span className="service-cat-chip">{s.categoria}</span>
                              <span className="service-duration-chip">
                                <ClockIcon size={13} color="#C8A26A" /> {s.duracion} min
                              </span>
                            </div>

                            <h4 className="service-card-title">{s.nombre}</h4>
                            <p className="service-card-desc">{s.desc}</p>

                            <div className="service-perks-row">
                              <span className="perk-tag">Cabina Climatizada</span>
                              <span className="perk-tag">Aromaterapia</span>
                            </div>

                            <div className="service-card-bottom">
                              <div className="service-card-price-box">
                                <span className="price-label">Inversión Final</span>
                                <span className="price-amount">S/ {s.precio.toFixed(2)}</span>
                              </div>
                              <button 
                                id={`btn-select-svc-${s.id}`}
                                className={`btn-select-luxury ${isSelected ? 'active' : ''}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedService(s);
                                  setCurrentStep(2);
                                }}
                              >
                                {isSelected ? 'Tratamiento Elegido' : 'Seleccionar'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="luxury-wizard-footer">
                      <div></div>
                      <button 
                        id="btn-goto-step-2"
                        className="btn-luxury-action primary" 
                        onClick={() => setCurrentStep(2)}
                      >
                        Siguiente: Elegir Especialista →
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 2: SELECT THERAPIST */}
                {currentStep === 2 && (
                  <div className="wizard-step-body animate-fade-in">
                    <div className="step-heading-row">
                      <div>
                        <h3>2. Selecciona a tu Especialista de Confianza</h3>
                        <p>Nuestro equipo de cosmiatras y terapeutas certificadas cuentan con amplia trayectoria.</p>
                      </div>
                      <span className="step-pill-counter">Paso 2 de 5</span>
                    </div>

                    <div className="luxury-therapists-grid">
                      {therapists.map((t, idx) => {
                        const isSelected = selectedTherapist.nombre === t.nombre;
                        return (
                          <div 
                            key={t.nombre}
                            id={`booking-therapist-card-${idx}`}
                            className={`luxury-therapist-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => setSelectedTherapist(t)}
                          >
                            <div className="therapist-avatar-luxury">
                              {t.nombre.split(' ').map(n => n[0]).slice(0, 2).join('')}
                              {isSelected && <span className="avatar-check-badge"><CheckIcon size={12} color="#FFF" /></span>}
                            </div>
                            <div className="therapist-details">
                              <div className="therapist-title-row">
                                <h4>{t.nombre}</h4>
                                <span className="therapist-rating-pill">Calif. {t.rating}</span>
                              </div>
                              <p className="therapist-cargo">{t.cargo}</p>
                              <div className="therapist-specialty-badge">{t.especialidad}</div>
                              <div className="therapist-exp-tag">
                                <ClockIcon size={12} color="#795548" /> {t.experiencia}
                              </div>
                            </div>
                            <div className="therapist-select-radio">
                              <div className={`custom-radio-circle ${isSelected ? 'checked' : ''}`}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="luxury-wizard-footer">
                      <button 
                        id="btn-back-step-1"
                        className="btn-luxury-action outline" 
                        onClick={() => setCurrentStep(1)}
                      >
                        ← Anterior: Cambiar Servicio
                      </button>
                      <button 
                        id="btn-goto-step-3"
                        className="btn-luxury-action primary" 
                        onClick={() => setCurrentStep(3)}
                      >
                        Siguiente: Fecha y Horario →
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: SELECT DATE & TIME (DS_CU04 CON RF02) */}
                {currentStep === 3 && (
                  <div className="wizard-step-body animate-fade-in">
                    <div className="step-heading-row">
                      <div>
                        <h3>3. Selecciona Fecha y Horario de Atención</h3>
                        <p>Validación en tiempo real para evitar cualquier cruce de cabina o especialista (RF02).</p>
                      </div>
                      <span className="step-pill-counter">Paso 3 de 5</span>
                    </div>

                    <div className="luxury-datetime-grid">
                      {/* Date Picker Box */}
                      <div className="luxury-date-box">
                        <div className="box-header-row">
                          <CalendarIcon size={18} color="#C8A26A" />
                          <h4>Fecha de Tratamiento</h4>
                        </div>
                        <p className="box-sub">Seleccione el día en que desea su cita en cabina:</p>
                        
                        <input 
                          type="date" 
                          id="input-fecha-reserva"
                          value={selectedDate} 
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setSelectedDate(e.target.value)}
                          className="luxury-date-input"
                        />

                        {/* Quick Day Shortcuts */}
                        <div className="quick-dates-strip">
                          <button 
                            type="button"
                            className="quick-date-btn"
                            onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                          >
                            Hoy
                          </button>
                          <button 
                            type="button"
                            className="quick-date-btn"
                            onClick={() => {
                              const tm = new Date();
                              tm.setDate(tm.getDate() + 1);
                              setSelectedDate(tm.toISOString().split('T')[0]);
                            }}
                          >
                            Mañana
                          </button>
                        </div>

                        <div className="date-selection-note">
                          <strong>Especialista Asignada:</strong>
                          <p>{selectedTherapist.nombre}</p>
                        </div>
                      </div>

                      {/* Time Slots Picker Box */}
                      <div className="luxury-slots-box">
                        <div className="box-header-row">
                          <ClockIcon size={18} color="#C8A26A" />
                          <h4>Turnos Disponibles en Cabina</h4>
                        </div>
                        <p className="box-sub">Seleccione un horario libre para su atención:</p>

                        <div className="slots-group-section">
                          <span className="slots-group-label">Turno Mañana</span>
                          <div className="slots-grid-luxury">
                            {timeSlots.slice(0, 3).map(slot => {
                              const occupied = isSlotOccupied(slot);
                              const isSelected = selectedTime === slot;
                              return (
                                <button
                                  key={slot}
                                  id={`slot-btn-${slot.replace(/[^a-zA-Z0-9]/g, '')}`}
                                  disabled={occupied}
                                  className={`luxury-slot-btn ${isSelected ? 'selected' : ''} ${occupied ? 'occupied' : ''}`}
                                  onClick={() => setSelectedTime(slot)}
                                >
                                  <span className="slot-time-text">{slot}</span>
                                  <span className="slot-status-text">
                                    {occupied ? 'Ocupado' : 'Disponible'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="slots-group-section" style={{ marginTop: '16px' }}>
                          <span className="slots-group-label">Turno Tarde</span>
                          <div className="slots-grid-luxury">
                            {timeSlots.slice(3).map(slot => {
                              const occupied = isSlotOccupied(slot);
                              const isSelected = selectedTime === slot;
                              return (
                                <button
                                  key={slot}
                                  id={`slot-btn-${slot.replace(/[^a-zA-Z0-9]/g, '')}`}
                                  disabled={occupied}
                                  className={`luxury-slot-btn ${isSelected ? 'selected' : ''} ${occupied ? 'occupied' : ''}`}
                                  onClick={() => setSelectedTime(slot)}
                                >
                                  <span className="slot-time-text">{slot}</span>
                                  <span className="slot-status-text">
                                    {occupied ? 'Ocupado' : 'Disponible'}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="luxury-wizard-footer">
                      <button 
                        id="btn-back-step-2"
                        className="btn-luxury-action outline" 
                        onClick={() => setCurrentStep(2)}
                      >
                        ← Anterior
                      </button>
                      <button 
                        id="btn-goto-step-4"
                        className="btn-luxury-action primary" 
                        onClick={() => setCurrentStep(4)}
                      >
                        Siguiente: Ficha del Cliente →
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: CLIENT INTAKE & AROMATHERAPY (DS_CU03 & RF01) */}
                {currentStep === 4 && (
                  <div className="wizard-step-body animate-fade-in">
                    <div className="step-heading-row">
                      <div>
                        <h3>4. Ficha del Cliente y Preferencias de Cabina</h3>
                        <p>Registro formal conforme a DS_CU03 para personalización de aromas y cuidados estéticos.</p>
                      </div>
                      <span className="step-pill-counter">Paso 4 de 5</span>
                    </div>

                    <form 
                      id="form-intake-cliente"
                      className="luxury-intake-form" 
                      onSubmit={(e) => { 
                        e.preventDefault(); 
                        setCurrentStep(5); 
                      }}
                    >
                      <div className="form-fields-grid">
                        <div className="luxury-field-group">
                          <label htmlFor="input-client-name">
                            Nombre y Apellidos Completos <span className="req">*</span>
                          </label>
                          <input 
                            id="input-client-name"
                            type="text" 
                            required 
                            placeholder="Ej. Valeria Carranza Morales" 
                            value={clientName} 
                            onChange={(e) => setClientName(e.target.value)} 
                            className="luxury-text-input"
                          />
                        </div>

                        <div className="luxury-field-group">
                          <label htmlFor="input-client-phone">
                            Teléfono Celular / WhatsApp <span className="req">*</span>
                          </label>
                          <input 
                            id="input-client-phone"
                            type="tel" 
                            required 
                            placeholder="Ej. 987 654 321" 
                            value={clientPhone} 
                            onChange={(e) => setClientPhone(e.target.value)} 
                            className="luxury-text-input"
                          />
                          <span className="field-hint">Enviaremos el recordatorio oficial a este WhatsApp.</span>
                        </div>

                        <div className="luxury-field-group">
                          <label htmlFor="input-client-dni">
                            Documento de Identidad (DNI / Carné)
                          </label>
                          <input 
                            id="input-client-dni"
                            type="text" 
                            placeholder="Ej. 45892104" 
                            value={clientDni} 
                            onChange={(e) => setClientDni(e.target.value)} 
                            className="luxury-text-input"
                          />
                          <span className="field-hint">Para emisión de comprobante electrónico (DS_CU09).</span>
                        </div>

                        <div className="luxury-field-group">
                          <label htmlFor="select-aromaterapia">Aromaterapia de Cabina de Cortesía</label>
                          <select 
                            id="select-aromaterapia"
                            value={aromatherapy}
                            onChange={(e) => setAromatherapy(e.target.value)}
                            className="luxury-select-input"
                          >
                            <option value="Lavanda Francesa (Relajante)">Lavanda Francesa (Relajante & Antiestrés)</option>
                            <option value="Eucalipto & Menta (Vitalidad)">Eucalipto & Menta (Vitalidad & Descongestión)</option>
                            <option value="Cítricos & Bergamota (Energizante)">Cítricos & Bergamota (Energizante)</option>
                            <option value="Flor de Loto & Jazmín (Sensorial)">Flor de Loto & Jazmín (Sensorial)</option>
                            <option value="Hipoalergénico / Neutro">Sin Aroma (Sensibilidad dérmica)</option>
                          </select>
                          <span className="field-hint">Personalizamos el difusor ultrasónico de tu cabina.</span>
                        </div>
                      </div>

                      <div className="luxury-field-group full-width" style={{ marginTop: '16px' }}>
                        <label htmlFor="input-client-notes">
                          Condiciones Dérmicas, Alergias o Preferencias Particulares
                        </label>
                        <textarea 
                          id="input-client-notes"
                          rows="2"
                          placeholder="Ej. Piel reactiva con tendencia a rojeces, preferencia por presión media en espalda, embarazo, etc." 
                          value={clientNotes} 
                          onChange={(e) => setClientNotes(e.target.value)} 
                          className="luxury-textarea-input"
                        ></textarea>
                      </div>

                      <div className="luxury-privacy-box">
                        <LockIcon size={16} color="#C8A26A" />
                        <div>
                          <strong>Compromiso de Privacidad Médica y Estética:</strong>
                          <p>Tus datos quedan registrados bajo estrictos protocolos de confidencialidad conforme a la Ley N° 29733 de Protección de Datos Personales del Perú.</p>
                        </div>
                      </div>

                      <div className="luxury-wizard-footer">
                        <button 
                          type="button" 
                          id="btn-back-step-3"
                          className="btn-luxury-action outline" 
                          onClick={() => setCurrentStep(3)}
                        >
                          ← Anterior
                        </button>
                        <button 
                          type="submit" 
                          id="btn-goto-step-5"
                          className="btn-luxury-action primary"
                        >
                          Siguiente: Revisar y Confirmar →
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* STEP 5: SUMMARY & CONFIRMATION (DS_CU04 & VOUCHER) */}
                {currentStep === 5 && (
                  <div className="wizard-step-body animate-fade-in">
                    {bookingConfirmed ? (
                      /* Success State */
                      <div className="luxury-success-ticket-screen">
                        <div className="success-celebration-badge">
                          <CheckIcon size={24} color="#FFF" />
                        </div>

                        <span className="success-kicker-tag">RESERVA CONFIRMADA CON ÉXITO</span>
                        <h2 className="success-heading">¡Gracias, {clientName}! Tu Cita ha Sido Agendada</h2>
                        <p className="success-subtext">
                          Hemos reservado la cabina exclusiva y notificado a la especialista asignada en Salon Spa Aleida.
                        </p>

                        {/* Luxury Voucher Card */}
                        <div className="luxury-voucher-card">
                          <div className="voucher-header">
                            <div>
                              <span className="voucher-brand">SALON SPA ALEIDA</span>
                              <span className="voucher-sub">COMPROBANTE OFICIAL DE RESERVA</span>
                            </div>
                            <div className="voucher-code-badge">
                              <span className="code-label">CÓDIGO DE RESERVA</span>
                              <span className="code-value">#{ticketCode || 'ALE-78219'}</span>
                            </div>
                          </div>

                          <div className="voucher-body-grid">
                            <div className="voucher-item">
                              <span className="v-label">Tratamiento Reservado</span>
                              <strong className="v-val">{selectedService.nombre}</strong>
                              <span className="v-extra">{selectedService.duracion} minutos de sesión</span>
                            </div>
                            <div className="voucher-item">
                              <span className="v-label">Especialista Asignada</span>
                              <strong className="v-val">{selectedTherapist.nombre}</strong>
                              <span className="v-extra">{selectedTherapist.cargo}</span>
                            </div>
                            <div className="voucher-item">
                              <span className="v-label">Fecha y Turno</span>
                              <strong className="v-val">{selectedDate}</strong>
                              <span className="v-extra">{selectedTime} en Punto</span>
                            </div>
                            <div className="voucher-item">
                              <span className="v-label">Cliente Titular</span>
                              <strong className="v-val">{clientName}</strong>
                              <span className="v-extra">WhatsApp: {clientPhone}</span>
                            </div>
                          </div>

                          <div className="voucher-footer-strip">
                            <div className="voucher-total-box">
                              <span className="total-label">Total a Cancelar en Recepción:</span>
                              <span className="total-amount">S/ {selectedService.precio.toFixed(2)}</span>
                            </div>
                            <span className="voucher-security-tag">
                              <ShieldIcon size={14} color="#2E7D32" /> Verificado por Sistema
                            </span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="success-actions-row">
                          <button 
                            id="btn-print-voucher"
                            className="btn-luxury-action outline" 
                            onClick={() => window.print()}
                          >
                            Imprimir / Guardar Voucher
                          </button>
                          <a 
                            id="btn-whatsapp-share"
                            className="btn-luxury-action primary"
                            href={`https://wa.me/51987654321?text=${encodeURIComponent(`Hola Salon Spa Aleida, confirmo mi reserva #${ticketCode} para el servicio ${selectedService.nombre} el día ${selectedDate} a las ${selectedTime}.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            Notificar por WhatsApp
                          </a>
                          <button 
                            id="btn-new-reservation"
                            className="btn-luxury-action secondary" 
                            onClick={handleReset}
                          >
                            Realizar Otra Reserva
                          </button>
                          <button 
                            id="btn-return-home-from-success"
                            className="btn-luxury-action outline" 
                            onClick={onBackToHome}
                          >
                            Volver al Portal Principal
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Pre-confirmation Summary & Voucher Preview */
                      <div>
                        <div className="step-heading-row">
                          <div>
                            <h3>5. Resumen Oficial y Confirmación de tu Reserva</h3>
                            <p>Verifica los detalles antes de que generemos el voucher y reservemos el horario en agenda.</p>
                          </div>
                          <span className="step-pill-counter">Paso 5 de 5</span>
                        </div>

                        <div className="luxury-summary-ticket">
                          <div className="summary-ticket-top">
                            <div>
                              <h4>Salon Spa Aleida</h4>
                              <p>Voucher de Tratamiento y Bienestar</p>
                            </div>
                            <div className="status-pill-ready">LISTO PARA CONFIRMAR</div>
                          </div>

                          <div className="summary-ticket-rows">
                            <div className="ticket-detail-row">
                              <span className="row-concept">Tratamiento Seleccionado:</span>
                              <span className="row-value highlight">{selectedService.nombre}</span>
                            </div>
                            <div className="ticket-detail-row">
                              <span className="row-concept">Duración Estimada:</span>
                              <span className="row-value">{selectedService.duracion} minutos</span>
                            </div>
                            <div className="ticket-detail-row">
                              <span className="row-concept">Especialista a Cargo:</span>
                              <span className="row-value">{selectedTherapist.nombre}</span>
                            </div>
                            <div className="ticket-detail-row">
                              <span className="row-concept">Fecha y Turno:</span>
                              <span className="row-value">{selectedDate} · {selectedTime}</span>
                            </div>
                            <div className="ticket-detail-row">
                              <span className="row-concept">Titular de la Cita:</span>
                              <span className="row-value">{clientName || 'Por completar'} (Cel: {clientPhone})</span>
                            </div>
                            <div className="ticket-detail-row">
                              <span className="row-concept">Aromaterapia en Cabina:</span>
                              <span className="row-value">{aromatherapy}</span>
                            </div>
                            {clientNotes && (
                              <div className="ticket-detail-row">
                                <span className="row-concept">Observaciones:</span>
                                <span className="row-value">{clientNotes}</span>
                              </div>
                            )}

                            <div className="ticket-total-divider"></div>

                            <div className="ticket-detail-row total-row">
                              <span className="row-concept">Importe Total a Cancelar:</span>
                              <span className="row-total-val">S/ {selectedService.precio.toFixed(2)}</span>
                            </div>
                          </div>

                          {/* Cancellation Policy Box (DS_CU05 notice) */}
                          <div className="luxury-policy-box">
                            <strong>Política de Puntualidad y Reprogramación (DS_CU05):</strong>
                            <p>
                              Agradecemos presentarse con 10 minutos de anticipación. Podrá reprogramar o cancelar su cita comunicándose con recepción con un mínimo de 2 horas de anticipación sin ningún recargo.
                            </p>
                          </div>

                          <div className="luxury-wizard-footer">
                            <button 
                              id="btn-back-step-4"
                              className="btn-luxury-action outline" 
                              onClick={() => setCurrentStep(4)}
                            >
                              ← Anterior: Modificar Datos
                            </button>
                            <button 
                              id="btn-confirm-reservation-final"
                              className="btn-luxury-action success-glow" 
                              onClick={handleConfirmReservation}
                            >
                              Confirmar Reserva Oficial
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Sticky Live Summary Card */}
              {!bookingConfirmed && (
                <div className="luxury-summary-sidebar">
                  <div className="sticky-summary-card">
                    <div className="sidebar-card-header">
                      <span className="sidebar-tag">TU EXPERIENCIA</span>
                      <h4>Resumen en Vivo</h4>
                    </div>

                    <div className="sidebar-service-preview">
                      <div className="sidebar-service-badge">{selectedService.categoria}</div>
                      <h5>{selectedService.nombre}</h5>
                      <div className="sidebar-meta-row">
                        <span><ClockIcon size={12} color="#C8A26A" /> {selectedService.duracion} min</span>
                        <strong className="sidebar-price">S/ {selectedService.precio.toFixed(2)}</strong>
                      </div>
                    </div>

                    <div className="sidebar-divider"></div>

                    <div className="sidebar-info-block">
                      <span className="info-block-label">Especialista:</span>
                      <p className="info-block-value">
                        <strong>{selectedTherapist.nombre}</strong>
                      </p>
                    </div>

                    <div className="sidebar-info-block">
                      <span className="info-block-label">Fecha y Turno:</span>
                      <p className="info-block-value">
                        {selectedDate} • {selectedTime}
                      </p>
                    </div>

                    {clientName && (
                      <div className="sidebar-info-block">
                        <span className="info-block-label">Cliente:</span>
                        <p className="info-block-value">{clientName}</p>
                      </div>
                    )}

                    <div className="sidebar-divider"></div>

                    <div className="sidebar-perks-list">
                      <div className="sidebar-perk-item">
                        <CheckIcon size={13} color="#C8A26A" />
                        <span>Infusión détox botánica de bienvenida</span>
                      </div>
                      <div className="sidebar-perk-item">
                        <CheckIcon size={13} color="#C8A26A" />
                        <span>Cabina privada con cromoterapia</span>
                      </div>
                      <div className="sidebar-perk-item">
                        <CheckIcon size={13} color="#C8A26A" />
                        <span>Cancelación flexible (DS_CU05)</span>
                      </div>
                    </div>

                    <div className="sidebar-total-box">
                      <div className="sidebar-total-row">
                        <span>Total Estimado:</span>
                        <span className="sidebar-grand-total">S/ {selectedService.precio.toFixed(2)}</span>
                      </div>
                      <small className="sidebar-igv-note">IGV incluido · Cancelación en recepción</small>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* 4. FOOTER DE LA PÁGINA DE RESERVAS */}
      <footer className="booking-page-footer">
        <div className="section-container">
          <div className="booking-footer-content">
            <p>© {new Date().getFullYear()} Salon Spa Aleida S.A.C. · Av. Conquistadores 780, Lima · Citas: (01) 421-8900</p>
            <div className="booking-footer-links">
              <span onClick={onBackToHome} style={{ cursor: 'pointer' }}>Inicio</span>
              <span>·</span>
              <span>Políticas de Privacidad</span>
              <span>·</span>
              <span>Términos del Servicio</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
