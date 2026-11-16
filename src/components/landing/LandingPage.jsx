import { useMemo, useRef, useState } from 'react';
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

/**
 * Landing pública de Salon Spa Aleida.
 *
 * Vive fuera del portal para no alterar el flujo de reservas existente: los
 * botones de reserva devuelven al portal con `?vista=reservar`.
 */
export default function LandingPage() {
  const week = useMemo(() => getWeek(), []);
  const firstOpenDay = week.find((day) => !day.closed) ?? week[0];
  const monthLabel = useMemo(() => getMonthLabel(), []);

  const [serviceId, setServiceId] = useState(SERVICES[0].id);
  const [specialistId, setSpecialistId] = useState(SPECIALISTS[0].id);
  const [dateIso, setDateIso] = useState(firstOpenDay.iso);
  const [time, setTime] = useState('11:45');
  const [menuOpen, setMenuOpen] = useState(false);

  const bookingRef = useRef(null);
  const serviceSelectRef = useRef(null);

  const service =
    SERVICES.find((item) => item.id === serviceId) ?? SERVICES[0];
  const specialist =
    SPECIALISTS.find((item) => item.id === specialistId) ?? SPECIALISTS[0];
  const selectedDay =
    week.find((day) => day.iso === dateIso) ?? firstOpenDay;

  const selectService = (id, { scroll = false } = {}) => {
    setServiceId(id);

    if (!scroll) return;

    bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => serviceSelectRef.current?.focus(), 340);
  };

  const goToPortalBooking = () => {
    window.location.assign('/portal?vista=reservar');
  };

  return (
    <div className={styles.page}>
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <a className={styles.brand} href="#inicio" aria-label="Salon Spa Aleida, inicio">
            <span className={styles.brandMark}>
              <img
                src={SALON.logo}
                alt=""
                width="28"
                height="28"
                decoding="async"
              />
            </span>
            <span>
              <span className={styles.brandName}>{SALON.name}</span>
              <span className={styles.brandSub}>Salón &amp; Spa</span>
            </span>
          </a>

          <nav className={styles.navLinks} aria-label="Secciones">
            <a href="#servicios">Servicios</a>
            <a href="#reserva">Reservar</a>
            <a href="#contacto">Contacto</a>
          </nav>

          <button
            type="button"
            className={styles.menuToggle}
            aria-expanded={menuOpen}
            aria-controls="landing-mobile-menu"
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? (
              <X size={18} aria-hidden="true" />
            ) : (
              <Menu size={18} aria-hidden="true" />
            )}
          </button>

          <a className={`${styles.btn} ${styles.btnSage}`} href="#reserva">
            Reservar Cita
          </a>
        </div>

        {menuOpen && (
          <nav
            className={styles.mobileMenu}
            id="landing-mobile-menu"
            aria-label="Secciones"
          >
            <a href="#servicios" onClick={() => setMenuOpen(false)}>
              Servicios
            </a>
            <a href="#reserva" onClick={() => setMenuOpen(false)}>
              Reservar
            </a>
            <a href="#contacto" onClick={() => setMenuOpen(false)}>
              Contacto
            </a>
          </nav>
        )}
      </header>

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
                  Reservar Cita
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.catalogue} id="servicios">
        <div className={styles.wrap}>
          <div className={styles.catalogueHead}>
            <h2>Carta de Servicios</h2>
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
                      Reservar Cita
                      <span className={styles.visuallyHidden}>: {item.name}</span>
                    </button>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.booking} id="reserva" ref={bookingRef}>
        <div className={styles.wrap}>
          <h2>Reserva tu Cita</h2>
          <div className={styles.goldRule} aria-hidden="true" />

          <div className={styles.bookingGrid}>
            <div>
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="landing-service">
                  Servicio
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
                        {item.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className={styles.selectChevron}
                    size={18}
                    aria-hidden="true"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <span className={styles.fieldLabel} id="landing-specialist-label">
                  Especialista
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

              <div className={styles.field}>
                <div className={styles.fieldRow}>
                  <span className={styles.fieldLabel} id="landing-date-label">
                    Fecha
                  </span>
                  <span className={styles.month}>{monthLabel}</span>
                </div>
                <div
                  className={styles.dates}
                  role="group"
                  aria-labelledby="landing-date-label"
                >
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
                      {day.closed && (
                        <span className={styles.dateNote}>Cerrado</span>
                      )}
                      <span className={styles.visuallyHidden}>{day.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.field}>
                <span className={styles.fieldLabel} id="landing-time-label">
                  Horario
                </span>
                <div
                  className={styles.times}
                  role="group"
                  aria-labelledby="landing-time-label"
                >
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot.time}
                      type="button"
                      className={styles.time}
                      data-selected={slot.time === time}
                      disabled={slot.occupied}
                      aria-pressed={slot.time === time}
                      title={slot.occupied ? 'Horario ocupado' : undefined}
                      onClick={() => setTime(slot.time)}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <aside className={styles.summary} aria-live="polite">
              <h3>Tu reserva</h3>
              <div className={styles.goldRule} aria-hidden="true" />

              <div className={styles.sumRow}>
                <span className={styles.sumLabel}>Servicio</span>
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
                  <p className={styles.sumValue}>
                    {formatDuration(service.duration)}
                  </p>
                </div>
              </div>

              <div className={styles.sumTotal}>
                <span className={styles.sumLabel}>Total</span>
                <span className={styles.totalVal}>
                  {formatSoles(service.price)}
                </span>
              </div>

              <button
                type="button"
                className={`${styles.btn} ${styles.btnContinue}`}
                onClick={goToPortalBooking}
              >
                Continuar reserva
              </button>
            </aside>
          </div>
        </div>
      </section>

      <section className={styles.trust} aria-label="Garantías del servicio">
        <div className={styles.wrap}>
          <div className={styles.trustGrid}>
            <div className={styles.trustItem}>
              <ShieldCheck size={19} aria-hidden="true" />
              Bioseguridad médica
            </div>
            <div className={styles.trustItem}>
              <Lock size={19} aria-hidden="true" />
              Cabinas privadas
            </div>
            <div className={styles.trustItem}>
              <Award size={19} aria-hidden="true" />
              Terapeutas certificadas
            </div>
          </div>
        </div>
      </section>

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
              <a className={styles.staffLink} href="/portal">
                Acceso del personal
              </a>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
