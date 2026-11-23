/**
 * =============================================================================
 * SALON SPA ALEIDA - SERVICIO CLIENTE API (REST API CLIENT)
 * ÁREA DELIMITADA: Área de Recepción y Atención al Cliente
 * Mapeo Oficial con los 10 Casos de Uso del Sistema (CUS):
 *   - CUS01: Autenticar Usuario
 *   - CUS02: Registrar Personal
 *   - CUS03: Registrar Cliente
 *   - CUS04: Agendar Cita
 *   - CUS05: Reprogramar Cita
 *   - CUS06: Consultar Catálogo de Servicios y Productos
 *   - CUS07: Aperturar Turno de Caja
 *   - CUS08: Procesar Venta y Cobro
 *   - CUS09: Anular Venta con Nota de Crédito
 *   - CUS10: Arqueo y Cierre de Caja
 * =============================================================================
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

// Estado Mock inicial para contingencia / modo offline de mostrador
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
  catalogo: [
    { id: 1, nombre: 'Masaje Relajante Aleida', categoria: 'Spa & Bienestar', duracion: 90, precio: 280.0, comision: 25, cabina: 'Cabina 02 - Masajes & Cromoterapia' },
    { id: 2, nombre: 'Facial Rejuvenecedor con Oro', categoria: 'Cosmiatría Facial', duracion: 75, precio: 450.0, comision: 30, cabina: 'Cabina 01 - Facial Oro & Luz LED' },
    { id: 3, nombre: 'Tratamiento Capilar Keratina', categoria: 'Cuidado Capilar', duracion: 120, precio: 350.0, comision: 30, cabina: 'Cabina 03 - Capilar & Lavacabezas' },
    { id: 4, nombre: 'Manicura Spa Premium', categoria: 'Manos & Pies', duracion: 60, precio: 150.0, comision: 35, cabina: 'Cabina 04 - Manos & Pies Spa' },
    { id: 5, nombre: 'Limpieza Facial Profunda', categoria: 'Cosmiatría Facial', duracion: 60, precio: 220.0, comision: 25, cabina: 'Cabina 01 - Facial Oro & Luz LED' },
    { id: 6, nombre: 'Drenaje Linfático Manual', categoria: 'Spa & Bienestar', duracion: 60, precio: 260.0, comision: 25, cabina: 'Cabina 02 - Masajes & Cromoterapia' }
  ],
  usuarios: [
    { usuario: 'cramos', nombre: 'Camila Ramos', rol: 'Recepcionista', permisos: 'Agenda de Citas, Padrón Clientes, Terminal POS, Caja' },
    { usuario: 'csanchez', nombre: 'Carmen Sánchez', rol: 'Cajero', permisos: 'Cobranzas, Arqueo de Caja, Notas de Crédito' },
    { usuario: 'admin', nombre: 'Aleida Mendoza', rol: 'Administrador', permisos: 'Acceso Total al Área de Recepción y Parámetros' }
  ]
};

export const api = {
  // CUS01: Autenticar Usuario
  async login(credenciales) {
    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credenciales)
      });
      return await res.json();
    } catch (_) {
      return { success: false, error: 'Servidor no disponible' };
    }
  },

  // CUS02: Personal del Área
  async getPersonal() {
    try {
      const res = await fetch(`${API_BASE}/personal`);
      if (res.ok) return await res.json();
    } catch (_) {}
    return initialMockState.usuarios;
  },

  async createPersonal(personalData) {
    try {
      const res = await fetch(`${API_BASE}/personal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personalData)
      });
      const data = await res.json();
      return data;
    } catch (e) {
      return { success: false, error: 'Servidor no disponible para registro de personal.' };
    }
  },

  // CUS03: Registrar y Consultar Clientes
  async getClientes() {
    try {
      const res = await fetch(`${API_BASE}/clientes`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
    } catch (_) {}
    return initialMockState.clientes;
  },

  async getClienteByDni(dni) {
    try {
      const res = await fetch(`${API_BASE}/clientes/${encodeURIComponent(dni)}`);
      const data = await res.json();
      return data;
    } catch (e) {
      return { success: false, error: 'Error al consultar cliente en base de datos.' };
    }
  },

  async createCliente(clienteData) {
    try {
      const res = await fetch(`${API_BASE}/clientes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clienteData)
      });
      const data = await res.json();
      return data;
    } catch (_) {
      return { success: false, error: 'Servidor no disponible para guardar cliente.' };
    }
  },

  // CUS04: Gestionar Citas (Antes Agendar Cita)
  async getCitas() {
    try {
      const res = await fetch(`${API_BASE}/citas`);
      if (res.ok) return await res.json();
    } catch (_) {}
    return initialMockState.citas;
  },

  // CUS05 Paso 2: Solicitar datos de cita seleccionada
  async getCitaById(citaId) {
    try {
      const res = await fetch(`${API_BASE}/citas/${citaId}`);
      if (res.ok) {
        const data = await res.json();
        return data.cita || data;
      }
    } catch (_) {}
    return null;
  },

  async createCita(citaData) {
    try {
      const res = await fetch(`${API_BASE}/citas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(citaData)
      });
      const data = await res.json();
      if (res.ok) return data;
      return { success: false, error: data.error || 'Error al registrar la cita.', sugerencia: data.sugerencia || '' };
    } catch (_) {
      return { success: false, error: 'No se pudo conectar con el servidor para agendar la cita.' };
    }
  },

  // CUS05: Reprogramar Cita y Control de Estados
  async updateCitaEstado(citaId, nuevoEstado, motivo = null) {
    try {
      const body = { estado: nuevoEstado };
      if (motivo) body.motivo = motivo;
      const res = await fetch(`${API_BASE}/citas/${citaId}/estado`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      return await res.json();
    } catch (_) {
      return { success: false, error: 'Error de conexión al actualizar estado de la cita.' };
    }
  },

  async reprogramarCita(citaId, nuevaFecha, nuevaHora) {
    try {
      const res = await fetch(`${API_BASE}/citas/${citaId}/reprogramar`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nueva_fecha: nuevaFecha, nueva_hora: nuevaHora })
      });
      return await res.json();
    } catch (_) {
      return { success: false, error: 'Error de conexión al reprogramar la cita.' };
    }
  },

  // CUS06: Consultar Catálogo de Servicios y Productos
  async getCatalogo() {
    try {
      const res = await fetch(`${API_BASE}/catalogo`);
      if (res.ok) return await res.json();
    } catch (_) {}
    return initialMockState.catalogo;
  },

  async getCategoriasServicio() {
    try {
      const res = await fetch(`${API_BASE}/servicios/categorias`);
      if (res.ok) {
        const data = await res.json();
        return data.categorias || [];
      }
    } catch (_) {}
    return ['Spa & Bienestar', 'Cosmiatría Facial', 'Cuidado Capilar', 'Manos & Pies', 'Masajes & Cromoterapia', 'Tratamientos Corporales'];
  },

  async createServicio(servicioData) {
    try {
      const res = await fetch(`${API_BASE}/servicios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(servicioData)
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data) {
        return data;
      }
      return data || { success: false, error: `Error del servidor (HTTP ${res.status})` };
    } catch (_) {
      return { success: false, error: 'Servidor no disponible para guardar el servicio.' };
    }
  },

  // CUS07: Aperturar Turno de Caja
  async getCaja() {
    try {
      const res = await fetch(`${API_BASE}/caja`);
      if (res.ok) {
        const data = await res.json();
        const ap = Number(data.apertura) || 0;
        const ef = Number(data.efectivo) || 0;
        const di = Number(data.digital) || 0;
        const eg = Number(data.egresos) || 0;
        const total = Math.round((ap + ef + di - eg) * 100) / 100;
        return {
          ...data,
          apertura: ap,
          efectivo: ef,
          digital: di,
          egresos: eg,
          saldo_teorico: data.saldo_teorico != null ? Number(data.saldo_teorico) : total,
          total_teorico: data.total_teorico != null ? Number(data.total_teorico) : total
        };
      }
    } catch (_) {}
    return initialMockState.caja;
  },

  async aperturarCaja(aperturaData) {
    try {
      const res = await fetch(`${API_BASE}/caja/apertura`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(aperturaData)
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        return data || { success: true, message: 'Turno aperturado exitosamente' };
      } else {
        return {
          success: false,
          error: data?.error || data?.mensaje || `Error HTTP ${res.status} al aperturar caja`,
          paso: data?.paso || 8
        };
      }
    } catch (err) {
      return { success: false, error: 'Servidor no disponible para aperturar caja.' };
    }
  },

  // CUS08: Procesar Venta y Cobro (Diagrama BCE Oficial)
  async getVentas() {
    try {
      const res = await fetch(`${API_BASE}/ventas`);
      if (res.ok) return await res.json();
    } catch (_) {}
    return [];
  },

  async liquidarCita(citaId) {
    try {
      const res = await fetch(`${API_BASE}/ventas/liquidar/${citaId}`);
      if (res.ok) return await res.json();
    } catch (_) {}
    return null;
  },

  async processVenta(ventaData) {
    try {
      const res = await fetch(`${API_BASE}/ventas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ventaData)
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        return data || { success: true, message: 'Venta procesada con éxito' };
      } else {
        return {
          success: false,
          error: data?.error || data?.mensaje || `Error HTTP ${res.status} al procesar venta`,
          mensaje: data?.mensaje,
          alerta: data?.alerta,
          paso: data?.paso || 13,
          faltante: data?.faltante
        };
      }
    } catch (err) {
      return { success: false, error: 'Servidor no disponible para procesar cobro.' };
    }
  },

  // CUS09: Anular Venta con Nota de Crédito (Diagrama BCE Oficial)
  async getAnulaciones() {
    try {
      const res = await fetch(`${API_BASE}/anulaciones`);
      if (res.ok) return await res.json();
    } catch (_) {}
    return [
      { id: 1, fecha: 'Hoy', boleta: 'B001-0004810', nota_credito: 'NC-012', monto: 120.0, motivo: 'Devolución por insatisfacción', autorizado_por: 'Aleida Mendoza (Gerente General)' }
    ];
  },

  async getDetalleComprobante(numeroBoleta) {
    try {
      const res = await fetch(`${API_BASE}/anulaciones/comprobante/${numeroBoleta}`);
      if (res.ok) return await res.json();
    } catch (_) {}
    return null;
  },

  async processAnulacion(anulacionData) {
    try {
      const res = await fetch(`${API_BASE}/anulaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(anulacionData)
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        return data || { success: true, message: 'Anulación procesada con Nota de Crédito' };
      } else {
        return {
          success: false,
          error: data?.error || data?.mensaje || `Error HTTP ${res.status}`,
          paso: data?.paso || 14,
          alerta: data?.alerta
        };
      }
    } catch (err) {
      return { success: false, error: 'Servidor no disponible para procesar anulación.' };
    }
  },

  // CUS10: Arqueo y Cierre de Caja (Diagrama BCE Oficial)
  async getSaldoTeorico() {
    try {
      const res = await fetch(`${API_BASE}/caja/saldo-teorico`);
      if (res.ok) return await res.json();
    } catch (_) {}
    return null;
  },

  async cerrarCaja(cierreData) {
    try {
      const res = await fetch(`${API_BASE}/caja/cierre`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cierreData)
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        return data || { success: true, message: 'Arqueo y cierre procesado exitosamente' };
      } else {
        return {
          success: false,
          error: data?.error || data?.mensaje || `Error HTTP ${res.status}`,
          paso: data?.paso || 13,
          discrepancia: data?.discrepancia,
          alerta: data?.alerta
        };
      }
    } catch (_) {
      return { success: false, error: 'Error de conexión con el servidor al procesar arqueo.' };
    }
  }
};

export default api;
