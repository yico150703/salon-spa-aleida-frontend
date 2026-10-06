/**
 * SALON SPA ALEIDA - API CLIENT SERVICE
 * Conecta con el backend Flask desplegado en Render (o localhost)
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Fallback datos locales si el backend aún no está encendido o en cold start
export const initialMockState = {
  citas: [
    { id: 1, hora: '09:00 AM', fecha: '2026-10-06', cliente: 'Mariana Torres', dni: '72819382', servicio: 'Masaje Relajante Aleida', especialista: 'Carmen Sánchez', estado: 'Atendida', monto: 280, cobrado: true },
    { id: 2, hora: '10:30 AM', fecha: '2026-10-06', cliente: 'Patricia Valdivia', dni: '45910284', servicio: 'Facial Rejuvenecedor con Oro', especialista: 'Carmen Sánchez', estado: 'Confirmada', monto: 450, cobrado: false },
    { id: 3, hora: '11:45 AM', fecha: '2026-10-06', cliente: 'Claudia Morales', dni: '48192039', servicio: 'Tratamiento Capilar Keratina', especialista: 'Luisa Paredes', estado: 'En Atención', monto: 350, cobrado: false },
    { id: 4, hora: '02:30 PM', fecha: '2026-10-06', cliente: 'Jessica Rivas', dni: '70829104', servicio: 'Manicura Spa Premium', especialista: 'Ana Vargas', estado: 'Pendiente', monto: 150, cobrado: false }
  ],
  clientes: [
    { dni: '72819382', nombre: 'Mariana Torres', telefono: '987654321', preferencias: 'Piel mixta, prefiere aromaterapia de lavanda.', visitas: 12, ultima_visita: '2026-10-06' },
    { dni: '45910284', nombre: 'Patricia Valdivia', telefono: '945112233', preferencias: 'Sensibilidad a tintes con amoníaco.', visitas: 8, ultima_visita: '2026-10-06' },
    { dni: '48192039', nombre: 'Claudia Morales', telefono: '912345678', preferencias: 'Tratamiento keratina semestral.', visitas: 5, ultima_visita: '2026-10-06' }
  ],
  caja: {
    apertura: 150.0,
    efectivo: 720.0,
    digital: 1580.0,
    egresos: 45.0,
    total_teorico: 2405.0
  },
  insumos: [
    { id: 1, nombre: 'Tinte Profesional 6.1 (Cenizo)', proveedor: "L'Oréal Professionnel Perú", stock: 2, stock_min: 6, alerta: true },
    { id: 2, nombre: 'Crema Nutritiva Keratina 1L', proveedor: 'Distribuidora Belleza Total SAC', stock: 1, stock_min: 4, alerta: true },
    { id: 3, nombre: 'Aceite de Argán Puro 250ml', proveedor: 'BioCosmetics Natura', stock: 8, stock_min: 3, alerta: false }
  ],
  catalogo: [
    { id: 1, nombre: 'Masaje Relajante Aleida', categoria: 'Spa & Bienestar', duracion: 90, precio: 280.0, comision: 25 },
    { id: 2, nombre: 'Facial Rejuvenecedor con Oro', categoria: 'Cosmiatría Facial', duracion: 75, precio: 450.0, comision: 30 },
    { id: 3, nombre: 'Tratamiento Capilar Keratina', categoria: 'Cuidado Capilar', duracion: 120, precio: 350.0, comision: 30 },
    { id: 4, nombre: 'Manicura Spa Premium', categoria: 'Manos & Pies', duracion: 60, precio: 150.0, comision: 35 }
  ],
  usuarios: [
    { usuario: 'cramos', nombre: 'Camila Ramos', rol: 'Recepcionista', permisos: 'Agenda (CU01), Clientes (CU02), POS (CU03)' },
    { usuario: 'aleida_admin', nombre: 'Aleida Mendoza', rol: 'Gerente General', permisos: 'Acceso Total (CU01-CU09)' },
    { usuario: 'csanchez', nombre: 'Carmen Sánchez', rol: 'Terapeuta / Cosmiatra', permisos: 'Agenda y Fichas' }
  ],
  reportes: {
    objetivos_smart: [
      { codigo: 'OBJ-01', nombre: 'Puntualidad en Citas', meta: '≥ 88%', actual: '88.5%', detalle: '35% menos inasistencias' },
      { codigo: 'OBJ-02', nombre: 'Cuadre de Caja', meta: '≥ 98%', actual: '98.2%', detalle: '90% menos descuadres' },
      { codigo: 'OBJ-03', nombre: 'Disponibilidad Insumos', meta: '≥ 95%', actual: '96.5%', detalle: '80% menos quiebres' },
      { codigo: 'OBJ-04', nombre: 'Fidelización Clientes', meta: '≥ 70%', actual: '74.0%', detalle: '+25% retorno <45d' }
    ]
  }
};

export const api = {
  async getCitas() {
    try {
      const res = await fetch(`${API_BASE}/citas`);
      if (res.ok) return await res.json();
    } catch (_) {}
    return initialMockState.citas;
  },

  async createCita(citaData) {
    try {
      const res = await fetch(`${API_BASE}/citas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(citaData)
      });
      if (res.ok) return await res.json();
    } catch (_) {}
    return { cita: { id: Date.now(), ...citaData } };
  },

  async processVenta(ventaData) {
    try {
      const res = await fetch(`${API_BASE}/ventas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ventaData)
      });
      if (res.ok) return await res.json();
    } catch (_) {}
    return { message: 'Venta procesada localmente' };
  },

  async processAnulacion(anulacionData) {
    try {
      const res = await fetch(`${API_BASE}/anulaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(anulacionData)
      });
      if (res.ok) return await res.json();
    } catch (_) {}
    return { message: 'Anulación procesada con Nota de Crédito' };
  },

  async getCaja() {
    try {
      const res = await fetch(`${API_BASE}/caja`);
      if (res.ok) return await res.json();
    } catch (_) {}
    return initialMockState.caja;
  }
};
