import React, { useState } from 'react';
import {
  Award,
  Calendar,
  Check,
  Clock,
  Heart,
  Lock,
  Mail,
  MapPin,
  Menu,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Star,
  UserCheck,
  Smartphone,
  X,
  ArrowRight
} from 'lucide-react';

import styles from './LandingPage.module.css';
import {
  formatDuration,
  formatSoles,
  HOME_IMAGES,
  SALON,
  SERVICES,
} from '../../data/salonData';

const CURRENT_YEAR = new Date().getFullYear();

export default function LandingPage({
  onSwitchToAdmin,
  onNavigateToBooking,
  showToast,
  currentUser
}) {
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const categories = ['Todos', 'Spa & Bienestar', 'Estética Facial', 'Cuidado Capilar', 'Manicura & Pedicura'];

  const filteredServices = categoryFilter === 'Todos'
    ? SERVICES
    : SERVICES.filter((s) => s.category === categoryFilter);

  const handleBookService = (service) => {
    if (onNavigateToBooking) {
      onNavigateToBooking({
        id: service.id,
        nombre: service.name,
        categoria: service.category,
        duracion: service.duration,
        precio: service.price,
        desc: service.description
      });
    }
  };

  const handleGeneralBooking = () => {
    if (onNavigateToBooking) {
      onNavigateToBooking();
    }
  };

  return (
    <div className={styles.page}>
      {/* 1. TOP NAVBAR ELEGANTE Y LIMPIA */}
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <a className={styles.brand} href="#inicio" aria-label="Salon Spa Aleida">
            <span className={styles.brandMark}>
              <img
                src="/logo_zen_icon.svg"
                alt="Salon Spa Aleida"
                width="34"
                height="34"
                decoding="async"
              />
            </span>
            <div className={styles.brandTextWrapper}>
              <span className={styles.brandName}>{SALON.name}</span>
              <span className={styles.brandSub}>Santuario de Belleza &amp; Bienestar</span>
            </div>
          </a>

          <nav className={styles.navLinks} aria-label="Secciones">
            <a href="#inicio">Inicio</a>
            <a href="#servicios">Servicios</a>
            <a href="#filosofia">Filosofía</a>
            <a href="#contacto">Contacto</a>
          </nav>

          <div className={styles.navActions}>
            {/* BOTÓN DE ACCESO ADMINISTRATIVO REFINADO */}
            <button
              type="button"
              className={styles.btnAdminNav}
              onClick={onSwitchToAdmin}
              title="Acceso al Panel de Gestión y Administración"
              id="btn-nav-acceso-admin"
            >
              <UserCheck size={15} />
              <span>Acceso Administrativo</span>
            </button>

            {/* BOTÓN DEDICADO DE RESERVAR CITA */}
            <button
              type="button"
              className={styles.btnReservarPill}
              onClick={handleGeneralBooking}
              id="btn-nav-reservar-cita"
            >
              <Calendar size={15} />
              <span>Reservar Cita</span>
            </button>

            {/* TOGGLE MENÚ MÓVIL */}
            <button
              type="button"
              className={styles.menuToggle}
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* MENÚ MÓVIL DESPLEGABLE */}
        {mobileMenuOpen && (
          <nav className={styles.mobileMenu} aria-label="Menú Móvil">
            <a href="#inicio" onClick={() => setMobileMenuOpen(false)}>Inicio</a>
            <a href="#servicios" onClick={() => setMobileMenuOpen(false)}>Servicios &amp; Tratamientos</a>
            <a href="#filosofia" onClick={() => setMobileMenuOpen(false)}>Filosofía &amp; Experiencia</a>
            <a href="#contacto" onClick={() => setMobileMenuOpen(false)}>Contacto</a>
            
            <div className={styles.mobileMenuBtns}>
              <button
                type="button"
                className={styles.btnReservarPill}
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleGeneralBooking();
                }}
              >
                <Calendar size={16} /> Reservar Cita en Línea
              </button>

              <button
                type="button"
                className={styles.btnAdminNav}
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onSwitchToAdmin();
                }}
              >
                <UserCheck size={16} /> Acceso Administrativo (Staff)
              </button>

            </div>
          </nav>
        )}
      </header>

      {/* 2. HERO PRINCIPAL REFINADO (FOTOGRAFÍA RECTA Y SIMÉTRICA, SIN ROSTROS) */}
      <section className={styles.hero} id="inicio">
        <div className={styles.heroInner}>
          <div className={styles.heroGrid}>
            
            {/* Columna Izquierda: Mensaje & Llamado a la Acción */}
            <div className={styles.heroText}>
              <div className={styles.heroKicker}>
                <Sparkles size={14} color="#D4AF37" />
                <span>Santuario de Belleza &amp; Bienestar Integral</span>
              </div>

              <h1>
                Renueva tu Belleza,
                <br />
                Equilibra tu Bienestar
              </h1>

              <p className={styles.heroLead}>
                Déjate envolver por rituales terapéuticos botánicos, tratamientos faciales 
                antiedad de alta gama y estilismo capilar personalizado en un santuario 
                diseñado para desconectar del estrés y reconectar con tu paz interior.
              </p>

              <div className={styles.heroCta}>
                <button
                  type="button"
                  className={styles.heroPrimaryBtn}
                  onClick={handleGeneralBooking}
                  id="btn-hero-reservar"
                >
                  <Calendar size={18} />
                  <span>Reservar Cita Online</span>
                  <ArrowRight size={16} />
                </button>

                <a href="#servicios" className={styles.heroSecondaryBtn}>
                  <span>Ver Tratamientos</span>
                </a>
              </div>

              <div className={styles.heroTrustRow}>
                <span>
                  <Check size={15} color="#A3D9B5" /> Terapeutas Colegiadas
                </span>
                <span>
                  <Check size={15} color="#A3D9B5" /> Cabinas Climatizadas
                </span>
                <span>
                  <Star size={15} color="#D4AF37" fill="#D4AF37" /> 4.9/5 (850+ reseñas)
                </span>
              </div>
            </div>

            {/* Columna Derecha: Fotografía simétrica, recta y proporcional del ambiente spa */}
            <div className={styles.heroPhotoWrapper}>
              <figure className={styles.heroPhoto}>
                <img
                  src={HOME_IMAGES.hero.src}
                  alt={HOME_IMAGES.hero.alt}
                  width="600"
                  height="470"
                  decoding="async"
                  fetchPriority="high"
                />
                <div className={styles.heroPhotoBadge}>
                  <div className={styles.heroBadgeIcon}>
                    <Heart size={20} color="#D4AF37" />
                  </div>
                  <div className={styles.heroPhotoBadgeText}>
                    <span className={styles.heroPhotoBadgeTitle}>100% Extractos Botánicos</span>
                    <span className={styles.heroPhotoBadgeSub}>Aceites puros prensados en frío y cosmética biológica</span>
                  </div>
                </div>
              </figure>
            </div>

          </div>
        </div>
      </section>

      {/* 3. FILOSOFÍA DE BIENESTAR: PAZ, ARMONÍA & CUIDADO BOTÁNICO */}
      <section className={styles.philosophy} id="filosofia">
        <div className={styles.wrap}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionKicker}>NUESTRA ESENCIA</span>
            <h2>Un Santuario Pensado para tu Tranquilidad</h2>
            <div className={styles.goldRule} aria-hidden="true" />
            <p className={styles.sectionLead}>
              Cada detalle de nuestro espacio ha sido concebido para brindarte una pausa reparadora 
              lejos del ajetreo urbano, combinando ciencia dermocosmética y bienestar holístico.
            </p>
          </div>

          <div className={styles.philosophyGrid}>
            <div className={styles.philosophyCard}>
              <div className={styles.philosophyIcon}>
                <Sparkles size={24} color="#4A7C59" />
              </div>
              <h3>Rituales Botánicos &amp; Esencias</h3>
              <p>
                Utilizamos aceites esenciales franceses de lavanda, romero y argán puro 
                con técnicas descontracturantes que alivian tensiones corporales profundas.
              </p>
            </div>

            <div className={styles.philosophyCard}>
              <div className={styles.philosophyIcon}>
                <ShieldCheck size={24} color="#4A7C59" />
              </div>
              <h3>Dermocosmética de Alta Gama</h3>
              <p>
                Tratamientos faciales con micropartículas de oro coloidal, ácido hialurónico 
                purificado y colágeno para una piel luminosa, tersa e hidratada.
              </p>
            </div>

            <div className={styles.philosophyCard}>
              <div className={styles.philosophyIcon}>
                <Award size={24} color="#4A7C59" />
              </div>
              <h3>Cabinas Privadas Climatizadas</h3>
              <p>
                Ambientes insonorizados con control térmico, toallas de algodón orgánico, 
                cromoterapia suave y música binaural para una inmersión sensitiva total.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CARTA DE SERVICIOS & TRATAMIENTOS EXCLUSIVOS */}
      <section className={styles.catalogue} id="servicios">
        <div className={styles.wrap}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionKicker}>MENÚ EXCLUSIVO</span>
            <h2>Carta de Tratamientos &amp; Experiencias</h2>
            <div className={styles.goldRule} aria-hidden="true" />
            <p className={styles.sectionLead}>
              Selecciona tu servicio preferido y haz clic en &ldquo;Reservar Cita&rdquo; para asegurar tu turno en línea.
            </p>
          </div>

          {/* Filtros por Categoría */}
          <div className={styles.categoryTabs}>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                className={`${styles.categoryTab} ${categoryFilter === cat ? styles.categoryTabActive : ''}`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grilla de Servicios */}
          <div className={styles.servicesGrid}>
            {filteredServices.map((item) => (
              <article key={item.id} className={styles.serviceCard}>
                <div className={styles.serviceCardTop}>
                  <span className={styles.serviceCategoryBadge}>{item.category}</span>
                  <div className={styles.serviceDuration}>
                    <Clock size={15} />
                    <span>{formatDuration(item.duration)}</span>
                  </div>
                </div>

                <h3 className={styles.serviceCardTitle}>{item.name}</h3>
                <p className={styles.serviceCardDesc}>{item.description}</p>

                <div className={styles.serviceCardBottom}>
                  <div className={styles.servicePriceBox}>
                    <span className={styles.servicePriceLabel}>Inversión</span>
                    <span className={styles.servicePriceValue}>{formatSoles(item.price)}</span>
                  </div>

                  <button
                    type="button"
                    className={styles.serviceBookBtn}
                    onClick={() => handleBookService(item)}
                    title={`Reservar cita para ${item.name}`}
                  >
                    <Calendar size={15} />
                    <span>Reservar Cita</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 5. BANNER DEDICADO DE RESERVAS: "RESERVAR CITA VA SOLO Y APARTE" */}
      <section className={styles.dedicatedBookingBanner} id="reserva">
        <div className={styles.wrap}>
          <div className={styles.dedicatedBookingBox}>
            <div className={styles.bookingBoxContent}>
              <div className={styles.bookingBoxKicker}>
                <Calendar size={16} color="#D4AF37" />
                <span>PLATAFORMA OFICIAL DE CITAS</span>
              </div>
              <h2>Agenda tu Cita en Línea en Sencillos Pasos</h2>
              <p>
                Sin filas ni llamadas telefónicas. Nuestro sistema de reserva dedicado te permite elegir 
                tu tratamiento, seleccionar a tu especialista y recibir tu comprobante de reserva con confirmación inmediata.
              </p>

              <div className={styles.bookingStepsPreview}>
                <div className={styles.stepItem}>
                  <span className={styles.stepNum}>1</span>
                  <span className={styles.stepText}>Elige Tratamiento</span>
                </div>
                <div className={styles.stepLine} />
                <div className={styles.stepItem}>
                  <span className={styles.stepNum}>2</span>
                  <span className={styles.stepText}>Terapeuta</span>
                </div>
                <div className={styles.stepLine} />
                <div className={styles.stepItem}>
                  <span className={styles.stepNum}>3</span>
                  <span className={styles.stepText}>Fecha &amp; Turno</span>
                </div>
                <div className={styles.stepLine} />
                <div className={styles.stepItem}>
                  <span className={styles.stepNum}>4</span>
                  <span className={styles.stepText}>Voucher Oficial</span>
                </div>
              </div>

              <div className={styles.bookingCtaActions}>
                <button
                  type="button"
                  className={styles.btnOpenDedicatedBooking}
                  onClick={handleGeneralBooking}
                  id="btn-abrir-pagina-reservas"
                >
                  <Calendar size={18} />
                  <span>Ir a la Página de Reservar Cita</span>
                  <ArrowRight size={17} />
                </button>
              </div>

              <span className={styles.bookingSecurityNote}>
                Datos sincronizados en tiempo real con la Base de Datos en PostgreSQL.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. FRANJA DE CONFIANZA & BIOSEGURIDAD */}
      <section className={styles.trust} aria-label="Garantías del servicio">
        <div className={styles.wrap}>
          <div className={styles.trustGrid}>
            <div className={styles.trustItem}>
              <ShieldCheck size={20} color="#4A7C59" />
              <span>Bioseguridad Grado Médico Certificada</span>
            </div>
            <div className={styles.trustItem}>
              <Lock size={20} color="#4A7C59" />
              <span>Cabinas Privadas Climatizadas</span>
            </div>
            <div className={styles.trustItem}>
              <Award size={20} color="#4A7C59" />
              <span>Comprobantes Oficiales con IGV (18%)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. PIE DE PÁGINA & CONTACTO */}
      <footer className={styles.footer} id="contacto">
        <div className={styles.wrap}>
          <div className={styles.footerGrid}>
            <div>
              <div className={styles.footerBrand}>
                <img src="/logo_zen_icon.svg" alt="" width="28" height="28" />
                <span className={styles.footerName}>{SALON.name}</span>
              </div>
              <p className={styles.footerLine}>
                <MapPin size={17} aria-hidden="true" />
                <span>{SALON.address}</span>
              </p>
              <p className={styles.footerLine}>
                <Clock size={17} aria-hidden="true" />
                <span>{SALON.hours}</span>
              </p>
            </div>

            <div className={styles.footerContact}>
              <h4 className={styles.footerTitle}>Atención y Consultas</h4>
              <a className={styles.footerLink} href={SALON.phoneHref}>
                <Phone size={17} aria-hidden="true" />
                <span>{SALON.phone}</span>
              </a>
              <a
                className={styles.footerLink}
                href={SALON.whatsappHref}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle size={17} aria-hidden="true" />
                <span>{SALON.whatsapp}</span>
              </a>
              <a className={styles.footerLink} href={SALON.emailHref}>
                <Mail size={17} aria-hidden="true" />
                <span>{SALON.email}</span>
              </a>
            </div>

            <div className={styles.footerAdminBox}>
              <h4 className={styles.footerTitle}>Personal &amp; Gerencia</h4>
              <p style={{ fontSize: '13px', color: 'var(--lp-muted)', marginBottom: '12px' }}>
                Acceso exclusivo para el personal del spa (Recepción, Caja, Administración).
              </p>
              <button
                type="button"
                className={styles.footerAdminBtn}
                onClick={onSwitchToAdmin}
                id="btn-footer-acceso-admin"
              >
                <UserCheck size={16} />
                <span>Acceso Administrativo</span>
              </button>
            </div>
          </div>

          <div className={styles.footerBottom}>
            <span>
              {SALON.legalName} · RUC {SALON.ruc}
            </span>
            <div className={styles.footerBottomRight}>
              <span>&copy; {CURRENT_YEAR} {SALON.name} · Todos los derechos reservados</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
