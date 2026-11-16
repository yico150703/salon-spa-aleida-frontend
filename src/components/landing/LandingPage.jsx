import React, { useMemo, useRef, useState } from 'react';
import {
  Award,
  Check,
  ChevronDown,
  Clock,
  Lock,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  ShieldCheck,
  X,
  Layers,
  FileText,
  UserCheck
} from 'lucide-react';

import styles from './LandingPage.module.css';
import {
  formatDuration,
  formatSoles,
  getMonthLabel,
  getWeek,
  HOME_IMAGES,
  SALON,
  SERVICES,
  SPECIALISTS,
  TIME_SLOTS,
} from '../../data/salonData';

const CURRENT_YEAR = new Date().getFullYear();

export default function LandingPage({
  onAddAppointment,
  onSwitchToAdmin,
  onNavigateToBooking,
  onOpenLayerInspector,
  onOpenRequirementsGuide,
  showToast,
  existingCitas = [],
  currentUser
}) {
  const week = useMemo(() => getWeek(), []);
  const firstOpenDay = week.find((day) => !day.closed) ?? week[0];
  const monthLabel = useMemo(() => getMonthLabel(), []);

  const [serviceId, setServiceId] = useState(SERVICES[0].id);
  const [specialistId, setSpecialistId] = useState(SPECIALISTS[0].id);
  const [dateIso, setDateIso] = useState(firstOpenDay.iso);
  const [time, setTime] = useState('10:30');
  const [menuOpen, setMenuOpen] = useState(false);

  // Datos del Cliente (RF01 - Padrón de Clientes)
  const [clientName, setClientName] = useState('');
  const [clientDni, setClientDni] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [ticketCode, setTicketCode] = useState('');

  const bookingRef = useRef(null);
  const serviceSelectRef = useRef(null);

  const service =
    SERVICES.find((item) => item.id === serviceId) ?? SERVICES[0];
  const specialist =
    SPECIALISTS.find((item) => item.id === specialistId) ?? SPECIALISTS[0];
  const selectedDay =
    week.find((day) => day.iso === dateIso) ?? firstOpenDay;

  // Validación de no-colisión de horario en tiempo real (RF02)
  const isTimeOccupied = (slotTime) => {
    return existingCitas.some((c) => {
      const matchFecha = c.fecha === dateIso;
      const matchHora = c.hora?.includes(slotTime) || slotTime?.includes(c.hora);
      const matchEsp = c.especialista?.toLowerCase().includes(specialist.name.toLowerCase().split(' ')[0]);
      return matchFecha && matchHora && matchEsp && c.estado !== 'Cancelada';
    });
  };

  const selectService = (id, { scroll = false } = {}) => {
    setServiceId(id);
    if (!scroll) return;
    bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => serviceSelectRef.current?.focus(), 340);
  };

  // Confirmar cita y persistir en PostgreSQL en Render
  const handleConfirmBooking = async (e) => {
    if (e) e.preventDefault();

    if (!clientName.trim() || !clientPhone.trim()) {
      if (showToast) {
        showToast('Por favor ingrese su Nombre y Teléfono para confirmar su cita.');
      } else {
        alert('Por favor ingrese su Nombre y Teléfono para confirmar su cita.');
      }
      return;
    }

    if (isTimeOccupied(time)) {
      if (showToast) {
        showToast(`Conflicto de horario: ${specialist.name} ya tiene un turno reservado a las ${time}.`);
      }
      return;
    }

    setIsSubmitting(true);
    const code = 'ALE-' + Math.floor(10000 + Math.random() * 90000);
    setTicketCode(code);

    try {
      if (onAddAppointment) {
        await onAddAppointment({
          cliente: clientName.trim(),
          dni: clientDni.trim() || 'Canal Web',
          telefono: clientPhone.trim(),
          preferencias: clientNotes.trim() || 'Reserva vía portal público',
          servicio: service.name,
          especialista: specialist.name,
          fecha: dateIso,
          hora: time,
          monto: service.price,
          estado: 'Confirmada',
          cobrado: false,
          codigoReserva: code
        });
      }

      setBookingConfirmed(true);
      if (showToast) {
        showToast(`¡Cita confirmada #${code}! Te esperamos el ${selectedDay.label} a las ${time}.`);
      }
    } catch (err) {
      console.error('Error al agendar cita:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetBooking = () => {
    setBookingConfirmed(false);
    setTicketCode('');
    setClientName('');
    setClientDni('');
    setClientPhone('');
    setClientNotes('');
  };

  // Desglose Tributario (IGV 18%)
  const subtotal = useMemo(() => Number((service.price / 1.18).toFixed(2)), [service.price]);
  const igv = useMemo(() => Number((service.price - subtotal).toFixed(2)), [service.price, subtotal]);

  return (
    <div className={styles.page}>
      {/* 1. TOP NAVBAR CON NAVEGACIÓN Y ACCESO ADMINISTRATIVO */}
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <a className={styles.brand} href="#inicio" aria-label="Salon Spa Aleida">
            <span className={styles.brandMark}>
              <img
                src={SALON.logo}
                alt=""
                width="32"
                height="32"
                decoding="async"
              />
            </span>
            <span>
              <span className={styles.brandName}>{SALON.name}</span>
              <span className={styles.brandSub}>Belleza &amp; Bienestar</span>
            </span>
          </a>

          <nav className={styles.navLinks} aria-label="Secciones">
            <a href="#servicios">Servicios</a>
            <a href="#reserva">Reservar Cita</a>
            <a href="#especialistas">Especialistas</a>
            <a href="#contacto">Contacto</a>
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {onOpenLayerInspector && (
              <button
                type="button"
                className={styles.btnToolNav}
                onClick={onOpenLayerInspector}
                title="Inspeccionar Arquitectura por Capas (Sección 3.8)"
              >
                <Layers size={14} /> 4 Capas
              </button>
            )}

            {onOpenRequirementsGuide && (
              <button
                type="button"
                className={styles.btnToolNav}
                onClick={onOpenRequirementsGuide}
                title="Guía Didáctica de Casos de Uso (CU01-CU09)"
              >
                <FileText size={14} /> Requisitos
              </button>
            )}

            <button
              type="button"
              className={styles.btnAdminNav}
              onClick={onSwitchToAdmin}
              title="Acceder al Panel de Gestión (Recepción, Caja, Ventas y Reportes)"
            >
              <UserCheck size={15} /> Acceso Administrativo
            </button>

            <a className={`${styles.btn} ${styles.btnSage}`} href="#reserva">
              Reservar
            </a>

            <button
              type="button"
              className={styles.menuToggle}
              aria-expanded={menuOpen}
              aria-controls="landing-mobile-menu"
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              onClick={() => setMenuOpen((open) => !open)}
            >
              {menuOpen ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className={styles.mobileMenu} id="landing-mobile-menu" aria-label="Secciones">
            <a href="#servicios" onClick={() => setMenuOpen(false)}>Servicios</a>
            <a href="#reserva" onClick={() => setMenuOpen(false)}>Reservar Cita</a>
            <a href="#especialistas" onClick={() => setMenuOpen(false)}>Especialistas</a>
            <a href="#contacto" onClick={() => setMenuOpen(false)}>Contacto</a>
            <button
              type="button"
              className={styles.btnAdminNav}
              style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
              onClick={() => {
                setMenuOpen(false);
                onSwitchToAdmin();
              }}
            >
              Acceso Administrativo (Staff)
            </button>
          </nav>
        )}
      </header>

      {/* 2. HERO PRINCIPAL */}
      <section className={styles.hero} id="inicio">
        <div className={styles.heroInner}>
          <div className={styles.heroGrid}>
            <figure className={styles.heroPhoto}>
              <img
                src={HOME_IMAGES.hero.src}
                alt={HOME_IMAGES.hero.alt}
                width="760"
                height="250"
                decoding="async"
              />
            </figure>

            <div className={styles.heroText}>
              <h1>
                Renueva tu Belleza,
                <br />
                Equilibra tu Bienestar
              </h1>
              <p className={styles.heroLead}>
                Combinamos rituales terapéuticos botánicos, tratamientos faciales
                antiedad y estilismo capilar personalizado en un ambiente de calma
                y cuidado integral.
              </p>
              <div className={styles.heroCta}>
                <a className={`${styles.btn} ${styles.btnSage}`} href="#reserva">
                  Reservar una Cita
                </a>
                <a
                  className={`${styles.btn}`}
                  href="#servicios"
                  style={{ background: '#fff', border: '1px solid var(--lp-border)', color: 'var(--lp-forest)' }}
                >
                  Ver Tratamientos
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CARTA DE SERVICIOS */}
      <section className={styles.catalogue} id="servicios">
        <div className={styles.wrap}>
          <div className={styles.catalogueHead}>
            <h2>Carta de Servicios &amp; Tratamientos</h2>
          </div>

          <div className={styles.catalogueGrid}>
            <aside className={styles.atmosphere}>
              <figure className={styles.aTall}>
                <img
                  src={HOME_IMAGES.cabin.src}
                  alt={HOME_IMAGES.cabin.alt}
                  width="300"
                  height="392"
                  decoding="async"
                  loading="lazy"
                />
              </figure>
              <figure className={styles.aWide}>
                <img
                  src={HOME_IMAGES.stillLife.src}
                  alt={HOME_IMAGES.stillLife.alt}
                  width="300"
                  height="208"
                  decoding="async"
                  loading="lazy"
                />
              </figure>
            </aside>

            <div className={styles.menu} role="list">
              {SERVICES.map((item) => {
                const isSelected = item.id === serviceId;

                return (
                  <article
                    key={item.id}
                    className={styles.treat}
                    role="listitem"
                    data-selected={isSelected}
                    onClick={() => selectService(item.id, { scroll: true })}
                  >
                    <span className={styles.treatCheck} aria-hidden="true">
                      <Check size={12} strokeWidth={3} />
                    </span>

                    <div className={styles.treatMain}>
                      <h3>{item.name}</h3>
                      <p className={styles.treatDesc}>{item.description}</p>
                    </div>

                    <div className={styles.treatDur}>
                      <Clock size={16} aria-hidden="true" />
                      {formatDuration(item.duration)}
                    </div>

                    <div className={styles.treatPrice}>
                      {formatSoles(item.price)}
                    </div>

                    <button
                      type="button"
                      className={styles.treatBtn}
                      onClick={(event) => {
                        event.stopPropagation();
                        selectService(item.id, { scroll: true });
                      }}
                    >
                      Seleccionar
                      <span className={styles.visuallyHidden}>: {item.name}</span>
                    </button>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 4. MÓDULO DE RESERVA EN VIVO (CONECTADO A POSTGRESQL EN RENDER) */}
      <section className={styles.booking} id="reserva" ref={bookingRef}>
        <div className={styles.wrap}>
          <h2>Reserva tu Cita en Línea</h2>
          <div className={styles.goldRule} aria-hidden="true" />

          {bookingConfirmed ? (
            <div className={styles.confirmedCard}>
              <div className={styles.confirmedBadge}>
                <Check size={16} /> ¡RESERVA CONFIRMADA EXITOSAMENTE!
              </div>
              <h3 className={styles.confirmedTicket}>Código de Reserva: {ticketCode}</h3>
              <p className={styles.confirmedDetails}>
                Estimada/o <strong>{clientName}</strong>, tu cita para <strong>{service.name}</strong> con <strong>{specialist.name}</strong> ha quedado registrada en el sistema oficial para el día <strong>{selectedDay.label}</strong> a las <strong>{time}</strong>.
              </p>
              <p style={{ fontSize: '13px', color: 'var(--lp-soft)', marginBottom: '16px' }}>
                ✓ Datos sincronizados con la Base de Datos PostgreSQL en Render (CU01 / RF02).
              </p>
              <button type="button" className={styles.btnResetBooking} onClick={handleResetBooking}>
                Agendar otra cita
              </button>
            </div>
          ) : (
            <div className={styles.bookingGrid}>
              {/* Formulario de Selección y Datos del Cliente */}
              <div>
                {/* 1. Selección de Servicio */}
                <div className={styles.field}>
                  <label className={styles.fieldLabel} htmlFor="landing-service">
                    1. Tratamiento o Servicio
                  </label>
                  <div className={styles.selectWrap}>
                    <select
                      id="landing-service"
                      ref={serviceSelectRef}
                      value={serviceId}
                      onChange={(event) => setServiceId(event.target.value)}
                    >
                      {SERVICES.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({formatSoles(item.price)} · {formatDuration(item.duration)})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className={styles.selectChevron} size={18} aria-hidden="true" />
                  </div>
                </div>

                {/* 2. Selección de Especialista */}
                <div className={styles.field} id="especialistas">
                  <span className={styles.fieldLabel} id="landing-specialist-label">
                    2. Especialista o Terapeuta
                  </span>
                  <div
                    className={styles.specialistList}
                    role="radiogroup"
                    aria-labelledby="landing-specialist-label"
                  >
                    {SPECIALISTS.map((person) => {
                      const isSelected = person.id === specialistId;

                      return (
                        <label
                          key={person.id}
                          className={styles.specialist}
                          data-selected={isSelected}
                        >
                          <input
                            type="radio"
                            name="landing-specialist"
                            value={person.id}
                            checked={isSelected}
                            onChange={() => setSpecialistId(person.id)}
                            className={styles.visuallyHidden}
                          />
                          <img
                            src={person.photo}
                            alt={person.photoAlt}
                            width="44"
                            height="44"
                            decoding="async"
                            loading="lazy"
                          />
                          <span className={styles.spText}>
                            <span className={styles.spName}>{person.name}</span>
                            <span className={styles.spRole}>{person.role}</span>
                          </span>
                          <span className={styles.radio} aria-hidden="true" />
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Selección de Fecha */}
                <div className={styles.field}>
                  <div className={styles.fieldRow}>
                    <span className={styles.fieldLabel} id="landing-date-label">
                      3. Fecha de Atención
                    </span>
                    <span className={styles.month}>{monthLabel}</span>
                  </div>
                  <div className={styles.dates} role="group" aria-labelledby="landing-date-label">
                    {week.map((day) => (
                      <button
                        key={day.iso}
                        type="button"
                        className={styles.date}
                        data-selected={day.iso === dateIso}
                        disabled={day.closed}
                        aria-pressed={day.iso === dateIso}
                        onClick={() => setDateIso(day.iso)}
                      >
                        <span className={styles.dateDow}>{day.weekDay}</span>
                        <span className={styles.dateNum}>{day.dayNumber}</span>
                        {day.closed && <span className={styles.dateNote}>Cerrado</span>}
                        <span className={styles.visuallyHidden}>{day.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Selección de Horario */}
                <div className={styles.field}>
                  <span className={styles.fieldLabel} id="landing-time-label">
                    4. Horario Libre Disponible
                  </span>
                  <div className={styles.times} role="group" aria-labelledby="landing-time-label">
                    {TIME_SLOTS.map((slot) => {
                      const occupied = isTimeOccupied(slot.time) || slot.occupied;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          className={styles.time}
                          data-selected={slot.time === time}
                          disabled={occupied}
                          aria-pressed={slot.time === time}
                          title={occupied ? 'Horario ocupado' : undefined}
                          onClick={() => setTime(slot.time)}
                        >
                          {slot.time} {occupied && '(Ocupado)'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 5. Datos Personales del Cliente (RF01 - Padrón) */}
                <div className={styles.field} style={{ borderTop: '1px solid var(--lp-border-soft)', paddingTop: '16px', marginTop: '20px' }}>
                  <span className={styles.fieldLabel}>
                    5. Datos del Cliente (Ficha de Cita)
                  </span>
                  <div className={styles.inputGrid}>
                    <input
                      type="text"
                      className={styles.textInput}
                      placeholder="Nombre y Apellidos *"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      className={styles.textInput}
                      placeholder="DNI o Documento"
                      value={clientDni}
                      onChange={(e) => setClientDni(e.target.value)}
                    />
                  </div>
                  <div className={styles.inputGrid} style={{ marginTop: '10px' }}>
                    <input
                      type="tel"
                      className={styles.textInput}
                      placeholder="Teléfono Celular / WhatsApp *"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      required
                    />
                    <input
                      type="text"
                      className={styles.textInput}
                      placeholder="Observaciones / Preferencia de aroma"
                      value={clientNotes}
                      onChange={(e) => setClientNotes(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Resumen de Reserva en Tiempo Real */}
              <aside className={styles.summary} aria-live="polite">
                <h3>Tu Reserva</h3>
                <div className={styles.goldRule} aria-hidden="true" />

                <div className={styles.sumRow}>
                  <span className={styles.sumLabel}>Tratamiento</span>
                  <p className={styles.sumValue}>{service.name}</p>
                </div>

                <div className={styles.sumRow}>
                  <span className={styles.sumLabel}>Especialista</span>
                  <p className={styles.sumValue}>{specialist.name}</p>
                </div>

                <div className={styles.sumLines}>
                  <div className={styles.sumLine}>
                    <span className={styles.sumLabel}>Fecha</span>
                    <p className={styles.sumValue}>{selectedDay.label}</p>
                  </div>
                  <div className={styles.sumLine}>
                    <span className={styles.sumLabel}>Horario</span>
                    <p className={styles.sumValue}>{time}</p>
                  </div>
                  <div className={styles.sumLine}>
                    <span className={styles.sumLabel}>Duración</span>
                    <p className={styles.sumValue}>{formatDuration(service.duration)}</p>
                  </div>
                  <div className={styles.sumLine}>
                    <span className={styles.sumLabel}>Base Imponible</span>
                    <p className={styles.sumValue}>S/ {subtotal.toFixed(2)}</p>
                  </div>
                  <div className={styles.sumLine}>
                    <span className={styles.sumLabel}>IGV (18%)</span>
                    <p className={styles.sumValue}>S/ {igv.toFixed(2)}</p>
                  </div>
                </div>

                <div className={styles.sumTotal}>
                  <span className={styles.sumLabel}>Total a Pagar</span>
                  <span className={styles.totalVal}>{formatSoles(service.price)}</span>
                </div>

                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnContinue}`}
                  onClick={handleConfirmBooking}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Guardando en Base de Datos...' : 'Confirmar y Agendar Cita'}
                </button>

                <p style={{ fontSize: '11.5px', color: 'var(--lp-soft)', textAlign: 'center', marginTop: '10px' }}>
                  🔒 Transacción segura · Guardado directo en PostgreSQL en Render
                </p>
              </aside>
            </div>
          )}
        </div>
      </section>

      {/* 5. FRANJA DE CONFIANZA & BIOSEGURIDAD */}
      <section className={styles.trust} aria-label="Garantías del servicio">
        <div className={styles.wrap}>
          <div className={styles.trustGrid}>
            <div className={styles.trustItem}>
              <ShieldCheck size={19} aria-hidden="true" />
              Bioseguridad médica certificada
            </div>
            <div className={styles.trustItem}>
              <Lock size={19} aria-hidden="true" />
              Cabinas privadas climatizadas
            </div>
            <div className={styles.trustItem}>
              <Award size={19} aria-hidden="true" />
              Terapeutas &amp; Cosmiatras colegiadas
            </div>
          </div>
        </div>
      </section>

      {/* 6. PIE DE PÁGINA */}
      <footer className={styles.footer} id="contacto">
        <div className={styles.wrap}>
          <div className={styles.footerGrid}>
            <div>
              <span className={styles.footerName}>{SALON.name}</span>
              <p className={styles.footerLine}>
                <MapPin size={17} aria-hidden="true" />
                {SALON.address}
              </p>
              <p className={styles.footerLine}>
                <Clock size={17} aria-hidden="true" />
                {SALON.hours}
              </p>
            </div>

            <div className={styles.footerContact}>
              <a className={styles.footerLink} href={SALON.phoneHref}>
                <Phone size={17} aria-hidden="true" />
                {SALON.phone}
              </a>
              <a
                className={styles.footerLink}
                href={SALON.whatsappHref}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={17} aria-hidden="true" />
                {SALON.whatsapp}
              </a>
              <a className={styles.footerLink} href={SALON.emailHref}>
                <Mail size={17} aria-hidden="true" />
                {SALON.email}
              </a>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <span>
              {SALON.legalName} · RUC {SALON.ruc}
            </span>
            <span className={styles.footerBottomRight}>
              <span>© {CURRENT_YEAR} {SALON.name}</span>
              <button
                type="button"
                className={styles.staffLink}
                onClick={onSwitchToAdmin}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', font: 'inherit', color: 'inherit' }}
              >
                Acceso del personal
              </button>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
