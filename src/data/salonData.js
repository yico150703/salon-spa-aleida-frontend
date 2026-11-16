/**
 * Datos del salón para la landing pública.
 *
 * Fuente tomada como canónica: src/components/Portal.jsx.
 * Nota: Portal.jsx y BookingPage.jsx todavía mantienen copias propias de este
 * catálogo con valores de contacto distintos. Al unificarlos, este módulo debe
 * pasar a ser el único origen.
 */

const DOW_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DOW_LONG = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];
const MONTHS = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

export const SERVICES = [
  {
    id: 'masaje-relajante',
    name: 'Masaje Relajante Aleida',
    category: 'Spa & Bienestar',
    duration: 90,
    price: 280,
    description:
      'Terapia antiestrés con aceites botánicos, aromaterapia personalizada y piedras calientes para disolver tensiones acumuladas.',
  },
  {
    id: 'facial-oro',
    name: 'Facial Rejuvenecedor con Oro',
    category: 'Estética Facial',
    duration: 75,
    price: 450,
    description:
      'Limpieza profunda e hidratación intensiva con micropartículas de oro coloidal y colágeno hidrolizado purificado.',
  },
  {
    id: 'capilar-keratina',
    name: 'Tratamiento Capilar Keratina',
    category: 'Cuidado Capilar',
    duration: 120,
    price: 350,
    description:
      'Nutrición intensiva con sellado térmico para eliminación total del frizz y brillo prolongado de calidad profesional.',
  },
  {
    id: 'manicura-spa',
    name: 'Manicura Spa Premium',
    category: 'Manicura & Pedicura',
    duration: 60,
    price: 150,
    description:
      'Exfoliación con sales minerales marinas, hidratación profunda con parafina tibia y esmaltado de alta duración.',
  },
  {
    id: 'corte-peinado',
    name: 'Corte y Peinado de Estilo',
    category: 'Cuidado Capilar',
    duration: 45,
    price: 120,
    description:
      'Asesoría de visagismo personalizada, lavado con shampoo dermocosmético, corte de autor y estilizado profesional.',
  },
];

export const SPECIALISTS = [
  {
    id: 'carmen-sanchez',
    name: 'Carmen Sánchez',
    role: 'Cosmiatra & Terapeuta Holística',
    photo:
      'https://images.unsplash.com/photo-1586165127014-f730957751f2?auto=format&w=200&h=200&fit=crop&q=80',
    photoAlt:
      'Retrato de Carmen Sánchez. Fotografía de xandro Vandewalle en Unsplash.',
  },
  {
    id: 'luisa-paredes',
    name: 'Luisa Paredes',
    role: 'Estilista Capilar Senior',
    photo:
      'https://images.unsplash.com/photo-1620198361326-a319ba24ec94?auto=format&w=200&h=200&fit=crop&q=80',
    photoAlt:
      'Retrato de Luisa Paredes. Fotografía de Rendy Novantino en Unsplash.',
  },
  {
    id: 'ana-vargas',
    name: 'Ana Vargas',
    role: 'Especialista en Manicura & Pedicura',
    photo:
      'https://images.pexels.com/photos/18090215/pexels-photo-18090215.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&fit=crop&q=80',
    photoAlt:
      'Retrato de Ana Vargas. Fotografía de Maria Isadora en Pexels.',
  },
];

/**
 * Horarios de atención. Marcar `occupied` reproduce la disponibilidad que
 * hoy devuelve la agenda de recepción para el día seleccionado; al conectar
 * el backend esta lista debe venir de /api/citas.
 */
export const TIME_SLOTS = [
  { time: '09:00', occupied: false },
  { time: '10:30', occupied: false },
  { time: '11:45', occupied: false },
  { time: '14:30', occupied: false },
  { time: '16:30', occupied: true },
  { time: '18:00', occupied: true },
];

export const SALON = {
  name: 'Salon Spa Aleida',
  legalName: 'Salon Spa Aleida S.A.C.',
  ruc: '20608192831',
  address: 'Av. Conquistadores 450, Lima — Perú',
  hours: 'Lunes a Sábado, 09:00 – 20:00',
  phone: '(01) 421-9876',
  phoneHref: 'tel:+5114219876',
  whatsapp: 'WhatsApp 987 654 321',
  whatsappHref: 'https://wa.me/51987654321',
  email: 'contacto@salonspaaleida.com',
  emailHref: 'mailto:contacto@salonspaaleida.com',
  logo: '/logo_zen_icon.svg',
};

export const HOME_IMAGES = {
  hero: {
    src: 'https://images.pexels.com/photos/35884502/pexels-photo-35884502.jpeg?auto=compress&cs=tinysrgb&w=1200&q=80',
    alt: 'Camilla de masajes con toallas dobladas y luz cálida. Fotografía de Marine Fougère en Pexels.',
  },
  cabin: {
    src: 'https://images.pexels.com/photos/6628520/pexels-photo-6628520.jpeg?auto=compress&cs=tinysrgb&w=700&q=80',
    alt: 'Cabina privada con camilla y cortinas de madera. Fotografía de KoolShooters en Pexels.',
  },
  stillLife: {
    src: 'https://images.pexels.com/photos/7795793/pexels-photo-7795793.jpeg?auto=compress&cs=tinysrgb&w=700&q=80',
    alt: 'Toallas dobladas junto a frascos de aceite y una vela. Fotografía de Alesia Kozik en Pexels.',
  },
};

export function formatSoles(value) {
  return `S/ ${value.toFixed(2)}`;
}

export function formatDuration(minutes) {
  return `${minutes} min`;
}

/**
 * Siete días consecutivos a partir de `start`. El salón no abre domingos,
 * así que ese día se marca como cerrado.
 */
export function getWeek(start = new Date()) {
  const days = [];

  for (let offset = 0; offset < 7; offset += 1) {
    const date = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + offset
    );
    const weekday = date.getDay();
    const monthName = MONTHS[date.getMonth()];

    days.push({
      iso: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
        2,
        '0'
      )}-${String(date.getDate()).padStart(2, '0')}`,
      weekDay: DOW_SHORT[weekday],
      dayNumber: date.getDate(),
      label: `${DOW_LONG[weekday]} ${date.getDate()} de ${monthName}`,
      closed: weekday === 0,
    });
  }

  return days;
}

export function getMonthLabel(date = new Date()) {
  const month = MONTHS[date.getMonth()];

  return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${date.getFullYear()}`;
}
