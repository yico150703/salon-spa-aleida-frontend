import React, { useState } from 'react';

export default function Portal({ onAddAppointment, onSwitchToAdmin, showToast }) {
  const [selectedService, setSelectedService] = useState('Masaje Relajante Aleida');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('11:00 AM');
  const [therapist, setTherapist] = useState('Carmen Sánchez');
  const [clientName, setClientName] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(null);

  const services = [
    { name: 'Masaje Relajante Aleida', price: 280, time: 90, desc: 'Terapia antiestrés con aceites esenciales botánicos, aromaterapia y piedras calientes.', tag: 'Top Ventas' },
    { name: 'Facial Rejuvenecedor con Oro', price: 450, time: 75, desc: 'Limpieza profunda e hidratación con micropartículas de oro coloidal y colágeno.', tag: 'Exclusivo' },
    { name: 'Tratamiento Capilar Keratina', price: 350, time: 120, desc: 'Alisado orgánico con sellado térmico y nutrición intensiva para eliminar el frizz.', tag: 'Popular' },
    { name: 'Manicura Spa Premium', price: 150, time: 60, desc: 'Exfoliación con sales marinas, mascarilla de parafina caliente y esmaltado en gel.', tag: 'Destacado' }
  ];

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!clientName) return;

    const servObj = services.find(s => s.name === selectedService) || { price: 280 };

    const newAppointment = {
      hora: time,
      fecha: date,
      cliente: clientName,
      dni: 'Web/Online',
      servicio: selectedService,
      especialista: therapist,
      estado: 'Confirmada',
      monto: servObj.price,
      cobrado: false
    };

    onAddAppointment(newAppointment);

    setBookingSuccess({
      client: clientName,
      service: selectedService,
      date,
      time,
      therapist
    });

    showToast(`¡Cita confirmada para ${clientName}! Se sincronizó con la agenda administrativa.`);
    setClientName('');
  };

  const handleSelectCard = (name) => {
    setSelectedService(name);
    const box = document.getElementById('booking-card-box');
    if (box) box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    showToast(`Servicio seleccionado: ${name}`);
  };

  return (
    <div className="view-portal">
      {/* Luxury Navbar */}
      <nav className="portal-nav">
        <div className="nav-container">
          <div className="brand-logo">
            <span className="logo-icon">✦</span>
            <div>
              <div className="logo-title">SALON SPA ALEIDA</div>
              <div className="logo-sub">BEAUTY & WELLNESS • LIMA</div>
            </div>
          </div>
          <div className="nav-links">
            <a href="#servicios">Servicios</a>
            <a href="#booking-card-box">Reservas</a>
            <a href="#nosotros">Nosotros</a>
          </div>
          <button className="btn-primary" onClick={() => handleSelectCard('Masaje Relajante Aleida')}>
            Reservar Cita
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="portal-hero">
        <div className="hero-content">
          <div className="hero-text">
            <span className="hero-badge">EXPERIENCIA EXCLUSIVA EN LIMA</span>
            <h1>Bienestar, Estética y Armonía</h1>
            <p>Déjate consentir por especialistas certificados en cuidado capilar, estética facial y masajes relajantes. Reserva tu momento de relajación en línea.</p>
            <div className="hero-stats">
              <div className="stat-item">
                <strong>+1,200</strong>
                <span>Clientas Felices</span>
              </div>
              <div className="stat-item">
                <strong>15+</strong>
                <span>Años de Calidad</span>
              </div>
              <div className="stat-item">
                <strong>4.9 ★</strong>
                <span>Calificación</span>
              </div>
            </div>
          </div>

          {/* Glassmorphic Booking Card (CU01) */}
          <div className="booking-widget" id="booking-card-box">
            <div className="widget-header">
              <h3>Reserva tu Experiencia (CU01)</h3>
              <p>Elige tu tratamiento y asegura tu horario</p>
            </div>
            <form onSubmit={handleBookingSubmit}>
              <div className="form-group">
                <label>1. Tratamiento o Servicio</label>
                <select value={selectedService} onChange={(e) => setSelectedService(e.target.value)}>
                  {services.map(s => (
                    <option key={s.name} value={s.name}>
                      {s.name} - {s.time} min (S/ {s.price})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>2. Fecha</label>
                  <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>3. Hora</label>
                  <select value={time} onChange={(e) => setTime(e.target.value)}>
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="02:30 PM">02:30 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                    <option value="06:00 PM">06:00 PM</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>4. Terapeuta / Estilista</label>
                <select value={therapist} onChange={(e) => setTherapist(e.target.value)}>
                  <option value="Carmen Sánchez">Carmen Sánchez (Cosmiatra & Masajista)</option>
                  <option value="Luisa Paredes">Luisa Paredes (Estilista Capilar Senior)</option>
                  <option value="Ana Vargas">Ana Vargas (Especialista en Manicura)</option>
                </select>
              </div>

              <div className="form-group">
                <label>5. Tu Nombre y Teléfono</label>
                <input
                  type="text"
                  placeholder="Ej. Mariana Torres (987654321)"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn-confirm-book">
                Confirmar Reserva Inmediata
              </button>
            </form>

            {bookingSuccess && (
              <div className="booking-success">
                <strong>✨ ¡Cita Confirmada con Éxito!</strong><br />
                Estimada(o) <b>{bookingSuccess.client}</b>, tu cita para <b>{bookingSuccess.service}</b> quedó agendada el día <b>{bookingSuccess.date} a las {bookingSuccess.time}</b> con <b>{bookingSuccess.therapist}</b>.<br />
                <small>Datos transmitidos en tiempo real al Dashboard administrativo.</small>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Treatments Catalog (CU07) */}
      <section className="portal-section" id="servicios">
        <div className="section-header">
          <span className="sub-title">NUESTRO PORTAFOLIO</span>
          <h2>Tratamientos Destacados</h2>
          <p>Descubre los servicios más solicitados para renovar tu belleza y bienestar.</p>
        </div>
        <div className="services-grid">
          {services.map(s => (
            <div className="service-card" key={s.name}>
              <div className={`card-badge ${s.tag === 'Exclusivo' ? 'gold' : ''}`}>{s.tag}</div>
              <div className="card-image" style={{ background: s.name.includes('Oro') ? '#BFA054' : s.name.includes('Masaje') ? '#7E6B60' : '#4E423E' }} />
              <div className="card-body">
                <h3>{s.name}</h3>
                <div className="service-meta">
                  <span>⏱ {s.time} min</span>
                  <span className="price">S/ {s.price.toFixed(2)}</span>
                </div>
                <p>{s.desc}</p>
                <button className="btn-card" onClick={() => handleSelectCard(s.name)}>
                  Reservar Servicio
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
