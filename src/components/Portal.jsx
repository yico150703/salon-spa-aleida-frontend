import React, { useState } from 'react';
import { ClockIcon, CheckIcon, UsersIcon, CalendarIcon, ShieldIcon, TargetIcon, UserIcon } from './Icons';

export default function Portal({ 
  onAddAppointment, 
  onSwitchToAdmin, 
  showToast, 
  existingCitas = [],
  onNavigateToBooking,
  currentUser,
  onLogin
}) {
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
  const [aromatherapy, setAromatherapy] = useState('Lavanda Francesa (Relajante)');
  const [ticketCode, setTicketCode] = useState('');

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

  const handleGoToBooking = (serviceToSelect = null) => {
    if (onNavigateToBooking) {
      onNavigateToBooking(serviceToSelect);
    } else {
      scrollToBooking(serviceToSelect);
    }
  };

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

    const code = 'ALE-' + Math.floor(10000 + Math.random() * 90000);
    setTicketCode(code);

    const fullNotes = [
      aromatherapy ? `Aroma Cabina: ${aromatherapy}` : null,
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
    showToast(`¡Reserva confirmada #${code}! Te esperamos el ${selectedDate} a las ${selectedTime}.`);
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
    <div className="belle-theme-container">
      {/* 1. TOP NAVIGATION BAR */}
      <nav className="belle-navbar">
        <div className="belle-navbar-inner">
          <div className="belle-logo-brand">
            <img src="/logo_aleida.png" alt="Aleida" className="navbar-logo-img" />
            <div className="logo-texts">
              <strong className="logo-title">Salon Spa Aleida</strong>
              <small className="logo-sub">Belleza &amp; Bienestar</small>
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
            <button className="btn-book-nav" id="btn-nav-reservar" onClick={() => handleGoToBooking()}>
              Reservar una Cita
            </button>
            <button 
              className="btn-admin-access" 
              onClick={onSwitchToAdmin}
              title="Acceso al Panel de Gestión Interno"
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
          <div className="hero-logo-wrapper">
            <div className="hero-brand-crest">
              <span className="crest-tag">LIMA · SALON &amp; SPA</span>
              <img src="/logo_aleida.png" alt="Aleida Salon Spa" className="hero-logo-img-grand" />
              <span className="crest-sub">BIENESTAR INTEGRAL &amp; ALTA ESTÉTICA</span>
            </div>
          </div>

          <h1 className="hero-headline">
            Renueva tu Belleza,<br />Equilibra tu Bienestar
          </h1>

          <p className="hero-subheadline">
            En Salon Spa Aleida combinamos rituales terapéuticos botánicos, tratamientos faciales antiedad de última generación y estilismo capilar personalizado en un ambiente de calma, sofisticación y cuidado integral.
          </p>

          <div className="hero-cta-group">
            <button className="btn-hero-primary" id="btn-hero-reservar" onClick={() => handleGoToBooking()}>
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
                    onClick={() => handleGoToBooking(item)}
                  >
                    Reservar Tratamiento
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. BANNER VIP: ACCESO DIRECTO A LA PÁGINA DEDICADA DE RESERVAS */}
      <section className="portal-booking-cta-section" id="reservar-cita">
        <div className="section-container">
          <div className="portal-booking-cta-card">
            <div className="cta-card-content">
              <span className="section-kicker">ATENCIÓN PERSONALIZADA</span>
              <h2>¿Lista para Disfrutar de tu Sesión de Spa?</h2>
              <p>
                Accede a nuestra plataforma oficial de agendamiento en línea para elegir tu tratamiento, tu especialista de confianza y tu cabina privada con confirmación inmediata.
              </p>
              <div className="cta-perks-row">
                <span className="cta-perk">
                  <ShieldIcon size={14} color="#C8A26A" /> Bioseguridad Certificada
                </span>
                <span className="cta-perk">
                  <ClockIcon size={14} color="#C8A26A" /> Puntualidad Garantizada
                </span>
                <span className="cta-perk">
                  <CheckIcon size={14} color="#C8A26A" /> Cancelación Flexible (DS_CU05)
                </span>
              </div>
            </div>
            <div className="cta-card-action">
              <button 
                id="btn-portal-open-booking-page"
                className="btn-open-booking-grand"
                onClick={() => handleGoToBooking()}
              >
                <div className="btn-text-block">
                  <strong className="btn-main-txt">Reservar Cita en Línea</strong>
                  <small className="btn-sub-txt">Abrir página de agendamiento en 5 pasos →</small>
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SECCIÓN DE EXPERIENCIA & FILOSOFÍA */}
      <section className="belle-experience-section" id="experiencia">
        <div className="section-container">
          <div className="experience-layout">
            <div className="experience-text">
              <span className="section-kicker">LA EXPERIENCIA ALEIDA</span>
              <h2>Un Santuario de Relajación y Estilo</h2>
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
              <span className="section-kicker">VISÍTANOS</span>
              <h2>Horarios & Ubicación</h2>
              <p>Te esperamos en nuestro salón en una de las zonas más exclusivas y accesibles de Lima.</p>
              
              <div className="contact-details">
                <div className="contact-row">
                  <strong>Dirección:</strong>
                  <span>Av. Conquistadores 450, Lima - Perú</span>
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
                <p>Av. Conquistadores 450, Lima</p>
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
              <p>Belleza, Estilo y Bienestar en Lima - Perú</p>
            </div>
            <div className="footer-links">
              <a href="#inicio">Inicio</a>
              <a href="#servicios">Servicios</a>
              <a href="#reservar-cita">Reservar una Cita</a>
              <a href="#contacto">Contacto</a>
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
