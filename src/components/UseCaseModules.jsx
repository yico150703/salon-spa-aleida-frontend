/**
 * =============================================================================
 * SALON SPA ALEIDA - MÓDULOS DE CASOS DE USO DEL SISTEMA (CUS)
 * ÁREA DELIMITADA: Área de Recepción y Atención al Cliente
 *   - CUS02: Registrar Personal (Recepción y Especialistas)
 *   - CUS06: Consultar Catálogo de Servicios y Productos
 *   - CUS07: Aperturar Turno de Caja
 * =============================================================================
 */

import React, { useState, useEffect } from 'react';
import { api } from '../api';

// =============================================
// CUS02: Formulario Registrar Personal
// Flujo oficial según Diagrama de Secuencia CUS02
// =============================================
export function PersonalManager({ usuarios, onAddPersonal, showToast }) {
  const [form, setForm] = useState({
    nombre: '', usuario: '', password: '', rol: 'Recepcionista',
    dni: '', telefono: '', email: ''
  });
  const [mode, setMode] = useState('list'); // 'list' | 'form'
  const [errorAlerta, setErrorAlerta] = useState(null);
  const [credencialesGeneradas, setCredencialesGeneradas] = useState(null);
  const [cargando, setCargando] = useState(false);

  const ROLES = ['Recepcionista', 'Cajero', 'Administrador'];
  const PERMISOS_ROL = {
    'Recepcionista': 'Agenda de citas (CUS04), clientes (CUS03) y POS mostrador',
    'Cajero': 'Cobranzas (CUS08), arqueo de caja (CUS10) y comprobantes',
    'Administrador': 'Control total del sistema, gestión de personal, seguridad y parámetros'
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errorAlerta) setErrorAlerta(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorAlerta(null);

    // Validar formato y solicitar registro
    if (!form.nombre.trim() || !form.dni.trim() || !form.rol) {
      setErrorAlerta('Datos incompletos. Ingrese DNI, nombre completo y rol.');
      return;
    }

    if (form.dni.trim().length < 8) {
      setErrorAlerta('El DNI debe contener al menos 8 dígitos numéricos válidos.');
      return;
    }

    setCargando(true);
    try {
      const res = await onAddPersonal({
        ...form,
        permisos: PERMISOS_ROL[form.rol]
      });

      if (res && res.success) {
        setCredencialesGeneradas(res.credenciales_temporales || {
          usuario: res.personal?.usuario || form.usuario || `user_${form.dni}`,
          password_temporal: res.personal?.password_temporal || `SpaAleida_${form.dni.slice(-4)}!`,
          rol: form.rol,
          permisos: PERMISOS_ROL[form.rol]
        });
        showToast(res.confirmacion || 'Personal registrado con éxito.');
        setForm({ nombre: '', usuario: '', password: '', rol: 'Recepcionista', dni: '', telefono: '', email: '' });
      } else {
        const errorMsg = res?.error || 'Rechazo por DNI duplicado o datos incompletos.';
        setErrorAlerta(errorMsg);
        showToast(`⚠️ ${errorMsg}`);
      }
    } catch (err) {
      setErrorAlerta('Error de comunicación con el servidor al registrar personal.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="uc-module">
      <div className="uc-module__header">
        <div>
          <span className="uc-badge" style={{ background: '#E8F5E9', color: '#1B5E20', border: '1px solid #C8E6C9' }}>
            CUS-02: Registrar Personal
          </span>
          <h2 className="uc-module__title">Gestión de Personal (Colaboradores del Spa)</h2>
          <p className="uc-module__subtitle">
            Alta en Base de Datos (PostgreSQL), verificación de unicidad de DNI y asignación de credenciales temporales
          </p>
        </div>
        <button
          id="btn-nuevo-personal"
          className="btn-gold"
          onClick={() => {
            setErrorAlerta(null);
            setCredencialesGeneradas(null);
            setMode(mode === 'form' ? 'list' : 'form');
          }}
        >
          {mode === 'form' ? '← Ver Lista de Colaboradores' : '+ Solicitar Nuevo Registro de Personal'}
        </button>
      </div>

      {/* Modal / Banner de Éxito */}
      {credencialesGeneradas && (
        <div style={{
          background: '#E8F5E9',
          border: '2px solid #2E7D32',
          borderRadius: '12px',
          padding: '20px 24px',
          marginBottom: '20px',
          boxShadow: '0 4px 14px rgba(46, 125, 50, 0.15)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <span style={{ fontSize: '1.6rem', color: '#2E7D32' }}>✓</span>
            <div>
              <div style={{ display: 'inline-block', background: '#2E7D32', color: '#FFF', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', marginBottom: '4px' }}>
                Registro Exitoso
              </div>
              <h3 style={{ margin: 0, color: '#1B5E20', fontSize: '1.2rem' }}>
                Confirmación de Almacenamiento Exitoso · Personal Registrado con Éxito
              </h3>
              <p style={{ margin: '4px 0 0', color: '#2E7D32', fontSize: '0.88rem' }}>
                El colaborador ha sido persistido en PostgreSQL (tabla <code>Usuario</code>). Entregue las siguientes credenciales de acceso temporales:
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '12px',
            background: '#FFFFFF',
            padding: '14px 18px',
            borderRadius: '8px',
            border: '1px solid #C8E6C9',
            marginTop: '12px'
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', fontWeight: 600 }}>Usuario Asignado:</span>
              <strong style={{ display: 'block', fontSize: '1.1rem', color: '#1B3D2B' }}>
                <code>{credencialesGeneradas.usuario}</code>
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', fontWeight: 600 }}>Contraseña Temporal:</span>
              <strong style={{ display: 'block', fontSize: '1.1rem', color: '#B78103' }}>
                <code>{credencialesGeneradas.password_temporal}</code>
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', fontWeight: 600 }}>Rol Asignado:</span>
              <strong style={{ display: 'block', fontSize: '1rem', color: '#1B3D2B' }}>
                {credencialesGeneradas.rol}
              </strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: '#666', textTransform: 'uppercase', fontWeight: 600 }}>Permisos Asignados:</span>
              <span style={{ display: 'block', fontSize: '0.85rem', color: '#4A5568' }}>
                {credencialesGeneradas.permisos}
              </span>
            </div>
          </div>

          <div style={{ marginTop: '14px', display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn-gold"
              onClick={() => {
                navigator.clipboard?.writeText(`Usuario: ${credencialesGeneradas.usuario}\nContraseña: ${credencialesGeneradas.password_temporal}\nRol: ${credencialesGeneradas.rol}`);
                showToast('Credenciales copiadas al portapapeles.');
              }}
            >
              Copiar Credenciales
            </button>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setCredencialesGeneradas(null);
                setMode('list');
              }}
            >
              Finalizar y Ver Lista
            </button>
          </div>
        </div>
      )}

      {/* Alerta de Error en Pantalla (Paso 12: Mostrar alerta de error en pantalla) */}
      {errorAlerta && (
        <div style={{
          background: '#FFEBEE',
          border: '2px solid #EF5350',
          borderRadius: '8px',
          padding: '14px 18px',
          marginBottom: '18px',
          color: '#C62828',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '1.4rem' }}>⚠️</span>
          <div style={{ flex: 1, fontSize: '0.92rem', fontWeight: 600 }}>
            {errorAlerta}
          </div>
          <button
            type="button"
            onClick={() => setErrorAlerta(null)}
            style={{ background: 'none', border: 'none', color: '#C62828', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Formulario */}
      {mode === 'form' && (
        <form onSubmit={handleSubmit} className="uc-form" id="form-registrar-personal">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <div style={{ display: 'inline-block', background: '#D4AF37', color: '#1B3D2B', fontSize: '0.72rem', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', marginBottom: '4px' }}>
                Formulario de Registro
              </div>
              <h3 className="uc-form__title" style={{ margin: 0 }}>Formulario de Registro de Nuevo Personal</h3>
            </div>
            <button type="button" className="btn-secondary" onClick={() => setMode('list')}>
              ← Cancelar
            </button>
          </div>

          <div className="uc-form__grid">
            <div className="form-field">
              <label htmlFor="personal-dni">DNI (8 dígitos) *</label>
              <input
                id="personal-dni"
                name="dni"
                value={form.dni}
                onChange={handleChange}
                placeholder="Ej: 45910284"
                maxLength={8}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="personal-nombre">Nombres y Apellidos *</label>
              <input
                id="personal-nombre"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Ej: Carmen Sánchez García"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="personal-rol">Cargo / Rol en el Spa *</label>
              <select id="personal-rol" name="rol" value={form.rol} onChange={handleChange}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="personal-usuario">Credencial: Usuario del Sistema (Opcional - auto)</label>
              <input
                id="personal-usuario"
                name="usuario"
                value={form.usuario}
                onChange={handleChange}
                placeholder="Dejar en blanco para autogenerar"
              />
            </div>
            <div className="form-field">
              <label htmlFor="personal-password">Credencial: Contraseña Inicial (Opcional - auto)</label>
              <input
                id="personal-password"
                name="password"
                type="text"
                value={form.password}
                onChange={handleChange}
                placeholder="Temporal (ej: SpaAleida_2026!)"
              />
            </div>
            <div className="form-field">
              <label htmlFor="personal-telefono">Teléfono / WhatsApp</label>
              <input
                id="personal-telefono"
                name="telefono"
                value={form.telefono}
                onChange={handleChange}
                placeholder="987654321"
              />
            </div>
            <div className="form-field" style={{ gridColumn: 'span 2' }}>
              <label htmlFor="personal-email">Correo Electrónico</label>
              <input
                id="personal-email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="personal@spaaleida.pe"
              />
            </div>
          </div>
          <div className="uc-form__permisos-preview" style={{ marginTop: '14px', background: '#F8FBF9', border: '1px solid #C2E0C6', padding: '10px 14px', borderRadius: '6px' }}>
            <span className="uc-form__permisos-label" style={{ fontWeight: 600, color: '#1B3D2B' }}>Permisos del Sistema Asignados para {form.rol}: </span>
            <span className="uc-form__permisos-value" style={{ color: '#2E7D32' }}>{PERMISOS_ROL[form.rol]}</span>
          </div>
          <div className="uc-form__actions" style={{ marginTop: '18px', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn-secondary" onClick={() => setMode('list')}>Cancelar</button>
            <button type="submit" className="btn-gold" id="btn-registrar-personal" disabled={cargando}>
              {cargando ? '5: Validando formato y solicitando registro...' : '4: Presionar botón: Registrar Personal'}
            </button>
          </div>
        </form>
      )}

      {mode === 'list' && (
        <div className="uc-table-wrapper">
          <table className="uc-table" id="tabla-personal">
            <thead>
              <tr>
                <th>Nombre del Colaborador</th>
                <th>DNI</th>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Permisos Oficiales</th>
                <th>Estado BD</th>
              </tr>
            </thead>
            <tbody>
              {(usuarios || []).map((u, i) => (
                <tr key={i}>
                  <td><strong>{u.nombre}</strong></td>
                  <td>{u.dni || '—'}</td>
                  <td><code>{u.usuario}</code></td>
                  <td>
                    <span className={`rol-badge rol-badge--${(u.rol || '').toLowerCase().split(' ')[0]}`}>
                      {u.rol}
                    </span>
                  </td>
                  <td className="permisos-cell">{u.permisos}</td>
                  <td><span className="tag confirmed">✓ Sincronizado</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// =============================================
// CUS06: Consultar y Registrar en Catálogo de Servicios
// Secuencia estricta de 15 pasos según requerimiento oficial
// =============================================
export function CatalogoManager({ catalogo, onAddServicio, showToast }) {
  // Pasos 1 y 5: Estado de modo ('list' | 'form')
  const [mode, setMode] = useState('list');
  
  // Paso 6: Campos del formulario
  const [form, setForm] = useState({
    nombre: '', categoria: '', duracion: 60, precio: '', comision: 25, cabina: 'Cabina 01 - Facial Oro & Luz LED'
  });
  
  // Pasos 3 y 4: Categorías activas del spa
  const [categoriasSpa, setCategoriasSpa] = useState([
    'Spa & Bienestar', 'Cosmiatría Facial', 'Cuidado Capilar', 'Manos & Pies', 'Masajes & Cromoterapia', 'Tratamientos Corporales'
  ]);
  
  // Pasos 14 y 15: Alerta de datos inválidos en pantalla
  const [alertaInvalida, setAlertaInvalida] = useState(null);
  const [servicioRecienteId, setServicioRecienteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('Todas');
  const [cargando, setCargando] = useState(false);

  // Paso 3 y 4: Cargar categorías de tratamientos desde backend
  useEffect(() => {
    api.getCategoriasServicio().then(cats => {
      if (cats && cats.length) {
        setCategoriasSpa(cats);
        if (!form.categoria) setForm(f => ({ ...f, categoria: cats[0] }));
      }
    });
  }, []);

  // Paso 2: Solicitar formulario de nuevo servicio
  const handleSolicitarFormulario = () => {
    setAlertaInvalida(null);
    setForm({
      nombre: '',
      categoria: categoriasSpa[0] || 'Spa & Bienestar',
      duracion: 60,
      precio: '',
      comision: 25,
      cabina: 'Cabina 01 - Facial Oro & Luz LED'
    });
    // Paso 5: Desplegar formulario de registro
    setMode('form');
  };

  // Paso 7: Presionar botón registrar servicio
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertaInvalida(null);

    const precioNum = parseFloat(form.precio);
    const duracionNum = parseInt(form.duracion);

    // Paso 8: Validar datos y tarifa positiva (> 0)
    if (!form.nombre.trim() || isNaN(precioNum) || precioNum <= 0 || isNaN(duracionNum) || duracionNum <= 0) {
      // Pasos 14 y 15: Notificar error de validación de tarifa o duración y mostrar alerta
      const errorMsg = 'Notificar error de validación de tarifa o duración: La tarifa (precio) y la duración deben ser valores positivos mayores a cero y el nombre es obligatorio.';
      setAlertaInvalida(errorMsg);
      showToast(`⚠️ ${errorMsg}`);
      return;
    }

    // Paso 9: Verificar no duplicidad de servicio
    const nombreNormalizado = form.nombre.trim().toLowerCase();
    const yaExiste = (catalogo || []).some(s => s.nombre.trim().toLowerCase() === nombreNormalizado);
    if (yaExiste) {
      const errorMsg = `Rechazo por duplicidad: Ya existe el servicio "${form.nombre.trim()}" en el catálogo del spa.`;
      setAlertaInvalida(errorMsg);
      showToast(`⚠️ ${errorMsg}`);
      return;
    }

    // → [Datos Válidos y Tarifa Positiva]:
    setCargando(true);
    try {
      // Paso 10: Guardar nuevo servicio en base de datos
      const res = await onAddServicio({
        nombre: form.nombre.trim(),
        categoria: form.categoria || categoriasSpa[0],
        duracion: duracionNum,
        precio: precioNum,
        comision: parseInt(form.comision) || 25,
        cabina: form.cabina || 'Cabina Especializada'
      });

      if (res && res.success === false) {
        // Error reportado por backend
        setAlertaInvalida(res.error || 'Error al registrar servicio en el catálogo.');
        showToast(`⚠️ ${res.error}`);
        return;
      }

      // Paso 11: Confirmar almacenamiento en catálogo
      // Paso 12: Notificar servicio registrado con éxito
      const nuevoId = res?.servicio?.id || Date.now();
      setServicioRecienteId(nuevoId);
      showToast(res?.confirmacion || `Servicio "${form.nombre.trim()}" registrado con éxito en catálogo.`);

      // Paso 13: Mostrar servicio activo en lista de atención
      setMode('list');
      setForm({ nombre: '', categoria: categoriasSpa[0], duracion: 60, precio: '', comision: 25, cabina: 'Cabina 01' });
    } catch (err) {
      setAlertaInvalida('Error inesperado de red al persistir el servicio.');
    } finally {
      setCargando(false);
    }
  };

  const filteredCatalogo = (catalogo || []).filter(s => {
    const matchesSearch = s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (s.categoria && s.categoria.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCat === 'Todas' || s.categoria === selectedCat;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="uc-module">
      <div className="uc-module__header">
        <div>
          <span className="uc-badge">:FormServicio · CUS Registrar Servicio en Catálogo (Diagrama BCE)</span>
          <h2 className="uc-module__title">Catálogo Oficial de Servicios & Tratamientos</h2>
          <p className="uc-module__subtitle">
            Actor: :Administrador | Límite: :FormServicio | Control: :CatalogoService | Entidad: :Servicio (PostgreSQL)
          </p>
        </div>
        {/* Paso 2: Botón Solicitar formulario de nuevo servicio */}
        <button
          id="btn-nuevo-servicio"
          className="btn-gold"
          onClick={() => {
            if (mode === 'form') {
              setMode('list');
            } else {
              handleSolicitarFormulario();
            }
          }}
        >
          {mode === 'form' ? '← Ver Catálogo de Consulta' : '+ Solicitar Formulario de Nuevo Servicio'}
        </button>
      </div>

      {/* Alerta de datos inválidos en pantalla */}
      {alertaInvalida && (
        <div style={{
          background: '#FFEBEE',
          border: '1.5px solid #EF5350',
          borderRadius: '8px',
          padding: '12px 18px',
          marginBottom: '18px',
          color: '#C62828',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <span style={{ fontSize: '1.3rem' }}>⚠️</span>
          <div style={{ flex: 1, fontSize: '0.92rem', fontWeight: 600 }}>
            <div><strong>Alerta de Validación en Pantalla</strong></div>
            <div>{alertaInvalida}</div>
          </div>
          <button
            type="button"
            onClick={() => setAlertaInvalida(null)}
            style={{ background: 'none', border: 'none', color: '#C62828', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Formulario de registro */}
      {mode === 'form' && (
        <form onSubmit={handleSubmit} className="uc-form" id="form-registrar-servicio">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3 className="uc-form__title" style={{ margin: 0 }}>
              Formulario de Registro de Nuevo Servicio
            </h3>
            <span style={{ fontSize: '0.82rem', color: '#1B3D2B', background: '#D1E7DD', padding: '4px 10px', borderRadius: '4px', fontWeight: 600 }}>
              Validación de tarifa positiva y no duplicidad
            </span>
          </div>

          <div className="uc-form__grid">
            {/* Ingresar nombre, categoría, precio, comisión y duración */}
            <div className="form-field" style={{ gridColumn: '1/-1' }}>
              <label htmlFor="servicio-nombre">Nombre del Servicio / Tratamiento *</label>
              <input
                id="servicio-nombre"
                name="nombre"
                value={form.nombre}
                onChange={e => {
                  setForm({ ...form, nombre: e.target.value });
                  if (alertaInvalida) setAlertaInvalida(null);
                }}
                placeholder="Ej: Drenaje Linfático Facial & Masaje Craneal"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="servicio-categoria">Categoría del Spa *</label>
              <select
                id="servicio-categoria"
                value={form.categoria}
                onChange={e => setForm({ ...form, categoria: e.target.value })}
              >
                {categoriasSpa.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="servicio-duracion">Duración en Cabina (minutos &gt; 0) *</label>
              <input
                id="servicio-duracion"
                type="number"
                min="15"
                step="15"
                value={form.duracion}
                onChange={e => setForm({ ...form, duracion: e.target.value })}
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="servicio-precio">Tarifa / Precio al Público (S/ &gt; 0) *</label>
              <input
                id="servicio-precio"
                type="number"
                step="0.01"
                min="0.01"
                value={form.precio}
                onChange={e => {
                  setForm({ ...form, precio: e.target.value });
                  if (alertaInvalida) setAlertaInvalida(null);
                }}
                placeholder="Ej: 180.00"
                required
              />
            </div>
            <div className="form-field">
              <label htmlFor="servicio-comision">Comisión Especialista (%)</label>
              <input
                id="servicio-comision"
                type="number"
                min="0"
                max="100"
                value={form.comision}
                onChange={e => setForm({ ...form, comision: e.target.value })}
              />
            </div>
            <div className="form-field" style={{ gridColumn: '1/-1' }}>
              <label htmlFor="servicio-cabina">Cabina Climatizada Sugerida</label>
              <input
                id="servicio-cabina"
                value={form.cabina}
                onChange={e => setForm({ ...form, cabina: e.target.value })}
                placeholder="Cabina 01 - Facial Oro & Luz LED, Cabina 02 - Masajes, etc."
              />
            </div>
          </div>

          <div className="uc-form__actions">
            <button type="button" className="btn-secondary" onClick={() => setMode('list')}>
              Cancelar
            </button>
            {/* Presionar botón registrar servicio */}
            <button
              type="submit"
              className="btn-gold btn-gold--large"
              id="btn-guardar-servicio"
              disabled={cargando}
            >
              {cargando ? 'Validando en Catálogo...' : 'Registrar Servicio'}
            </button>
          </div>
        </form>
      )}

      {/* Pasos 1 y 13: Mostrar servicio activo en lista de atención */}
      {mode === 'list' && (
        <>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Buscar servicio o tratamiento por nombre..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                flex: 1, minWidth: '240px', padding: '10px 14px', borderRadius: '8px',
                border: '1px solid #D1D5DB', fontSize: '0.92rem'
              }}
            />
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {['Todas', ...categoriasSpa].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCat(cat)}
                  style={{
                    padding: '6px 12px', borderRadius: '20px', fontSize: '0.8rem', cursor: 'pointer',
                    border: selectedCat === cat ? '1px solid #1B3D2B' : '1px solid #E5E7EB',
                    background: selectedCat === cat ? '#1B3D2B' : '#FFF',
                    color: selectedCat === cat ? '#FFF' : '#374151',
                    fontWeight: selectedCat === cat ? 600 : 400
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="catalogo-grid" id="grid-catalogo">
            {filteredCatalogo.map((s, i) => {
              const esReciente = s.id === servicioRecienteId;
              return (
                <div
                  key={i}
                  className="catalogo-card"
                  style={{
                    borderTop: esReciente ? '4px solid #2E7D32' : '3px solid #D4AF37',
                    background: esReciente ? '#F1F8F4' : '#FFFFFF',
                    boxShadow: esReciente ? '0 4px 16px rgba(46, 125, 50, 0.2)' : undefined,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div className="catalogo-card__cat">{s.categoria || 'Tratamiento Spa'}</div>
                    {esReciente ? (
                      <span className="tag confirmed" style={{ fontSize: '0.72rem' }}>★ Nuevo Activo</span>
                    ) : (
                      <span style={{ fontSize: '0.72rem', color: '#2E7D32', fontWeight: 600 }}>● Activo</span>
                    )}
                  </div>
                  <h4 className="catalogo-card__name">{s.nombre}</h4>
                  <div style={{ fontSize: '0.78rem', color: '#6B7280', margin: '4px 0 8px 0' }}>
                    {s.cabina || 'Cabina Especializada'}
                  </div>
                  <div className="catalogo-card__details">
                    <span>⏱ {s.duracion} min</span>
                    <span style={{ fontWeight: 700, color: '#1B3D2B', fontSize: '1.05rem' }}>
                      S/ {parseFloat(s.precio).toFixed(2)}
                    </span>
                  </div>
                  <div style={{ marginTop: '6px', fontSize: '0.75rem', color: '#718096' }}>
                    Comisión: {s.comision || 25}%
                  </div>
                </div>
              );
            })}
            {filteredCatalogo.length === 0 && (
              <p style={{ gridColumn: '1/-1', textAlign: 'center', color: '#6B7280', padding: '30px' }}>
                No se encontraron servicios que coincidan con la búsqueda.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// =============================================
// CUS07: Aperturar Turno de Caja (Diagrama BCE Oficial)
// Actor: :Cajero | Límite: :FormCaja | Control: :CajaService | Entidad: :Caja
// =============================================
export function AperturasCaja({ onApertura, caja, cajaAbierta, currentUser, showToast, onNavigateTab }) {
  const [form, setForm] = useState({ 
    responsable: currentUser?.nombre || 'Aleida Flores', 
    turno: 'Turno Mañana',
    saldo_inicial: '150.00', 
    observaciones: 'Fondo de sencillo verificado en billetes y monedas' 
  });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [alertaInvalida, setAlertaInvalida] = useState(null);
  const [cargando, setCargando] = useState(false);

  // Pasos 2, 3, 4, 13: Determinar si la caja ya cuenta con turno activo aperturado
  const cajaEstaAbierta = (caja?.estado === 'Abierta') || (caja?.estadosesion === 'Abierta') || cajaAbierta;

  // Paso 7: Presionar botón aperturar caja (:Cajero -> :FormCaja)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlertaInvalida(null);

    const saldo = parseFloat(form.saldo_inicial);

    if (isNaN(saldo) || saldo < 0) {
      const errorMsg = 'El monto de fondo inicial no puede ser un número negativo (debe ser ≥ 0).';
      setAlertaInvalida(errorMsg);
      showToast(`⚠️ ${errorMsg}`);
      return;
    }

    if (!form.responsable.trim()) {
      const errorMsg = 'El nombre del cajero responsable es obligatorio para registrar la apertura de turno.';
      setAlertaInvalida(errorMsg);
      showToast(`⚠️ ${errorMsg}`);
      return;
    }

    setCargando(true);
    try {
      const apertura = {
        responsable: form.responsable.trim(),
        turno: form.turno,
        saldo_inicial: saldo,
        observaciones: form.observaciones,
        hora_apertura: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        fecha: new Date().toLocaleDateString('es-PE'),
        numero_turno: form.turno === 'Turno Mañana' ? 'T-01' : (form.turno === 'Turno Tarde' ? 'T-02' : 'T-03')
      };

      const res = await onApertura(apertura);
      if (res && res.success === false) {
        setAlertaInvalida(res.error || res.mensaje || 'Error al aperturar turno de caja.');
        showToast(`⚠️ ${res.error || res.mensaje}`);
        return;
      }

      showToast(res?.message || `Turno '${form.turno}' aperturado exitosamente con fondo de S/ ${saldo.toFixed(2)}.`);
      setModoEdicion(false);
    } catch (err) {
      setAlertaInvalida('Error inesperado de red al persistir la apertura de turno en base de datos.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="uc-module">
      <div className="uc-module__header">
        <div>
          <span className="uc-badge">CUS: Apertura Turno de Caja</span>
          <h2 className="uc-module__title">Aperturar Turno de Caja</h2>
          <p className="uc-module__subtitle">
            Gestión de inicio de turno, asignación de cajero responsable y control de fondo de sencillo.
          </p>
        </div>
        {cajaEstaAbierta && !modoEdicion ? (
          <span className="status-badge status-badge--success" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4CAF50', display: 'inline-block' }}></span>
            Sesión de Caja Activa (Abierta)
          </span>
        ) : (
          <span className="status-badge status-badge--warning">
            Formulario de Apertura Habilitado
          </span>
        )}
      </div>

      {cajaEstaAbierta && !modoEdicion ? (
        <div className="apertura-confirmacion" style={{ border: '1px solid #C2E0C6', borderRadius: '12px', padding: '24px', background: '#F8FBF9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#2E7D32', display: 'inline-block' }}></span>
                <h3 style={{ margin: 0, color: '#1B3D2B', fontSize: '1.25rem' }}>
                  Sesión de Caja Activa en el Turno
                </h3>
              </div>
              <p style={{ margin: 0, color: '#4A5568', fontSize: '0.88rem' }}>
                El turno actual se encuentra con estado <strong>Abierta</strong> en la base de datos central.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button 
                className="btn-outline" 
                onClick={() => setModoEdicion(true)}
                style={{ fontSize: '0.84rem' }}
              >
                + Iniciar Nueva Apertura / Cambio de Turno
              </button>
            </div>
          </div>

          <div style={{ marginTop: '16px', padding: '12px 14px', background: '#E8F5E9', borderRadius: '8px', border: '1px solid #C8E6C9', color: '#1B5E20', fontSize: '0.86rem' }}>
            Panel de caja activo y habilitado para procesar cobros de tratamientos y ventas mostrador con sincronización en tiempo real.
          </div>

          <div className="apertura-info-grid" style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
            <div className="apertura-info-item" style={{ background: '#FFF', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <span className="apertura-info-label" style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#718096', fontWeight: 600 }}>Código de Sesión</span>
              <strong className="apertura-info-value" style={{ display: 'block', fontSize: '1.05rem', color: '#1B3D2B', marginTop: '4px' }}>
                {caja?.codigo_sesion || caja?.codigsesion || 'SES-ACTIVA'}
              </strong>
            </div>
            <div className="apertura-info-item" style={{ background: '#FFF', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <span className="apertura-info-label" style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#718096', fontWeight: 600 }}>Turno Fiscal</span>
              <strong className="apertura-info-value" style={{ display: 'block', fontSize: '1.05rem', color: '#1B3D2B', marginTop: '4px' }}>
                {caja?.turno || 'Turno Mañana'}
              </strong>
            </div>
            <div className="apertura-info-item" style={{ background: '#FFF', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <span className="apertura-info-label" style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#718096', fontWeight: 600 }}>Cajero en Turno</span>
              <strong className="apertura-info-value" style={{ display: 'block', fontSize: '1.05rem', color: '#1B3D2B', marginTop: '4px' }}>
                {caja?.cajero || currentUser?.nombre || 'Aleida Flores'}
              </strong>
            </div>
            <div className="apertura-info-item" style={{ background: '#FFF', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <span className="apertura-info-label" style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#718096', fontWeight: 600 }}>Fondo de Sencillo</span>
              <strong className="apertura-info-value" style={{ display: 'block', fontSize: '1.1rem', color: '#B38B28', marginTop: '4px' }}>
                S/ {(Number(caja?.apertura) || Number(caja?.montoapertura) || 0).toFixed(2)}
              </strong>
            </div>
            <div className="apertura-info-item" style={{ background: '#FFF', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <span className="apertura-info-label" style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#718096', fontWeight: 600 }}>Efectivo Mostrador</span>
              <strong className="apertura-info-value" style={{ display: 'block', fontSize: '1.1rem', color: '#2E7D32', marginTop: '4px' }}>
                S/ {(Number(caja?.efectivo) || 0).toFixed(2)}
              </strong>
            </div>
            <div className="apertura-info-item" style={{ background: '#FFF', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <span className="apertura-info-label" style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#718096', fontWeight: 600 }}>Cobros Digitales</span>
              <strong className="apertura-info-value" style={{ display: 'block', fontSize: '1.1rem', color: '#0277BD', marginTop: '4px' }}>
                S/ {(Number(caja?.digital) || 0).toFixed(2)}
              </strong>
            </div>
            <div className="apertura-info-item" style={{ background: '#FFF', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <span className="apertura-info-label" style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#718096', fontWeight: 600 }}>Saldo Teórico Total</span>
              <strong className="apertura-info-value" style={{ display: 'block', fontSize: '1.25rem', color: '#1B3D2B', marginTop: '4px', fontWeight: 800 }}>
                S/ {((Number(caja?.apertura) || 0) + (Number(caja?.efectivo) || 0) + (Number(caja?.digital) || 0) - (Number(caja?.egresos) || 0)).toFixed(2)}
              </strong>
            </div>
          </div>
        </div>
      ) : (
        /* ========================================================
           RAMA [Caja NO Aperturada en el Turno]: Pasos 4 a 12
           ======================================================== */
        <form onSubmit={handleSubmit} className="uc-form" id="form-apertura-caja">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <h3 className="uc-form__title" style={{ margin: 0 }}>
                Formulario de Apertura de Caja Habilitado
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.84rem', color: '#6B7280' }}>
                Ingresar monto de fondo inicial y turno operativo:
              </p>
            </div>
            {cajaEstaAbierta && (
              <button type="button" className="btn-secondary" onClick={() => setModoEdicion(false)}>
                ← Volver a Caja Activa
              </button>
            )}
          </div>

          {alertaInvalida && (
            <div style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#B91C1C', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>⚠️</span>
              <div>
                <strong>Alerta de Validación:</strong> {alertaInvalida}
              </div>
            </div>
          )}

          <div className="uc-form__grid">
            {/* Selección de Turno */}
            <div className="form-field">
              <label htmlFor="apertura-turno">Turno Operativo *</label>
              <select 
                id="apertura-turno" 
                value={form.turno}
                onChange={e => setForm({...form, turno: e.target.value})}
              >
                <option value="Turno Mañana">Turno Mañana (08:00 AM - 03:00 PM)</option>
                <option value="Turno Tarde">Turno Tarde (03:00 PM - 09:00 PM)</option>
                <option value="Turno Especial">Turno Especial (Sábados / Domingos)</option>
              </select>
            </div>

            {/* Cajero Responsable */}
            <div className="form-field">
              <label htmlFor="apertura-responsable">Cajero Responsable *</label>
              <input 
                id="apertura-responsable" 
                value={form.responsable}
                onChange={e => setForm({...form, responsable: e.target.value})}
                placeholder="Nombre completo del cajero responsable" 
                required 
              />
            </div>

            {/* Monto de Fondo Inicial */}
            <div className="form-field">
              <label htmlFor="apertura-saldo">Monto de Fondo Inicial (S/) [monto ≥ 0] *</label>
              <input 
                id="apertura-saldo" 
                type="number" 
                step="0.01" 
                min="0" 
                value={form.saldo_inicial}
                onChange={e => setForm({...form, saldo_inicial: e.target.value})}
                placeholder="Ej: 150.00 (No negativo)" 
                required 
              />
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                {['100.00', '150.00', '200.00', '300.00'].map(val => (
                  <button
                    key={val}
                    type="button"
                    style={{ fontSize: '0.76rem', padding: '3px 8px', borderRadius: '4px', border: '1px solid #D4AF37', background: form.saldo_inicial === val ? '#1B3D2B' : '#FFF', color: form.saldo_inicial === val ? '#FFF' : '#1B3D2B', cursor: 'pointer' }}
                    onClick={() => setForm({...form, saldo_inicial: val})}
                  >
                    S/ {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Observaciones */}
            <div className="form-field" style={{ gridColumn: '1/-1' }}>
              <label htmlFor="apertura-obs">Observaciones de Entrega de Mostrador</label>
              <input 
                id="apertura-obs" 
                value={form.observaciones}
                onChange={e => setForm({...form, observaciones: e.target.value})}
                placeholder="Detalle de billetes/monedas recibidos, terminal POS verificado, etc." 
              />
            </div>
          </div>

          <div style={{ background: '#FFFDE7', border: '1px solid #FFE082', borderRadius: '8px', padding: '12px 16px', margin: '14px 0', fontSize: '0.84rem', color: '#795548' }}>
            <strong>Validación de Fondo:</strong> Se verifica que el fondo inicial sea un valor no negativo (≥ 0). Al confirmar, la sesión iniciará con estado <code>Abierta</code> en el sistema.
          </div>

          <div className="uc-form__actions">
            {cajaEstaAbierta && (
              <button type="button" className="btn-secondary" onClick={() => setModoEdicion(false)}>
                Cancelar
              </button>
            )}
            {/* Presionar botón aperturar caja */}
            <button 
              type="submit" 
              className="btn-gold btn-gold--large" 
              id="btn-aperturar-caja"
              disabled={cargando}
            >
              {cargando ? 'Procesando Apertura...' : 'Aperturar Caja'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
