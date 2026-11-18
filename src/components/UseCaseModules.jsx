/**
 * =============================================================================
 * SALON SPA ALEIDA - MÓDULOS DE CASOS DE USO DEL SISTEMA (CUS)
 * ÁREA DELIMITADA: Área de Recepción y Atención al Cliente
 *   - CUS02: Registrar Personal (Recepción y Especialistas)
 *   - CUS06: Consultar Catálogo de Servicios y Productos
 *   - CUS07: Aperturar Turno de Caja
 * =============================================================================
 */

import React, { useState } from 'react';

// =============================================
// CUS02: Formulario Registrar Personal
// =============================================
export function PersonalManager({ usuarios, onAddPersonal, showToast }) {
  const [form, setForm] = useState({
    nombre: '', usuario: '', password: '', rol: 'Recepcionista',
    dni: '', telefono: '', email: ''
  });
  const [mode, setMode] = useState('list'); // 'list' | 'form'
  const [editId, setEditId] = useState(null);

  const ROLES = ['Administrador', 'Recepcionista', 'Cajero', 'Terapeuta'];
  const PERMISOS_ROL = {
    'Administrador': 'Control total del sistema',
    'Recepcionista': 'Agenda de citas y clientes',
    'Cajero': 'Cobros, caja y comprobantes',
    'Terapeuta': 'Agenda - Solo consulta'
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre || !form.usuario || !form.password || !form.dni) {
      showToast('Complete los campos obligatorios: nombre, usuario, contraseña y DNI.');
      return;
    }
    const nuevo = {
      ...form,
      permisos: PERMISOS_ROL[form.rol],
      id: Date.now()
    };
    onAddPersonal(nuevo);
    showToast(`Personal "${form.nombre}" registrado como ${form.rol}.`);
    setForm({ nombre: '', usuario: '', password: '', rol: 'Recepcionista', dni: '', telefono: '', email: '' });
    setMode('list');
  };

  return (
    <div className="uc-module">
      <div className="uc-module__header">
        <div>
          <span className="uc-badge">Personal de Salón</span>
          <h2 className="uc-module__title">Registrar Personal</h2>
          <p className="uc-module__subtitle">Gestión de usuarios y accesos del sistema</p>
        </div>
        <button
          id="btn-nuevo-personal"
          className="btn-gold"
          onClick={() => setMode(mode === 'form' ? 'list' : 'form')}
        >
          {mode === 'form' ? '← Ver Lista' : '+ Nuevo Personal'}
        </button>
      </div>

      {mode === 'form' && (
        <form onSubmit={handleSubmit} className="uc-form" id="form-registrar-personal">
          <h3 className="uc-form__title">Ficha de Personal</h3>
          <div className="uc-form__grid">
            <div className="form-field">
              <label htmlFor="personal-nombre">Nombre Completo *</label>
              <input id="personal-nombre" name="nombre" value={form.nombre} onChange={handleChange}
                placeholder="Ej: Carmen Sánchez García" required />
            </div>
            <div className="form-field">
              <label htmlFor="personal-dni">DNI *</label>
              <input id="personal-dni" name="dni" value={form.dni} onChange={handleChange}
                placeholder="12345678" maxLength={8} required />
            </div>
            <div className="form-field">
              <label htmlFor="personal-rol">Rol en el Sistema *</label>
              <select id="personal-rol" name="rol" value={form.rol} onChange={handleChange}>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="personal-usuario">Usuario del Sistema *</label>
              <input id="personal-usuario" name="usuario" value={form.usuario} onChange={handleChange}
                placeholder="Ej: csanchez" required />
            </div>
            <div className="form-field">
              <label htmlFor="personal-password">Contraseña *</label>
              <input id="personal-password" name="password" type="password" value={form.password}
                onChange={handleChange} placeholder="Mínimo 4 caracteres" required />
            </div>
            <div className="form-field">
              <label htmlFor="personal-telefono">Teléfono</label>
              <input id="personal-telefono" name="telefono" value={form.telefono} onChange={handleChange}
                placeholder="987654321" />
            </div>
            <div className="form-field">
              <label htmlFor="personal-email">Email</label>
              <input id="personal-email" name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="correo@spa.com" />
            </div>
          </div>
          <div className="uc-form__permisos-preview">
            <span className="uc-form__permisos-label">Permisos asignados:</span>
            <span className="uc-form__permisos-value">{PERMISOS_ROL[form.rol]}</span>
          </div>
          <div className="uc-form__actions">
            <button type="button" className="btn-secondary" onClick={() => setMode('list')}>Cancelar</button>
            <button type="submit" className="btn-gold" id="btn-guardar-personal">Registrar Personal</button>
          </div>
        </form>
      )}

      {mode === 'list' && (
        <div className="uc-table-wrapper">
          <table className="uc-table" id="tabla-personal">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>DNI</th>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Permisos</th>
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
// CUS06: Consultar Catálogo de Servicios y Productos
// =============================================
export function CatalogoManager({ catalogo, onAddServicio, showToast }) {
  const [form, setForm] = useState({
    nombre: '', categoria: 'Spa & Bienestar', duracion: 60, precio: '', comision: 25, descripcion: '', cabina: 'Cabina 01 - Facial Oro & Luz LED'
  });
  const [mode, setMode] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCat, setSelectedCat] = useState('Todas');

  const CATEGORIAS = ['Todas', 'Spa & Bienestar', 'Cosmiatría Facial', 'Cuidado Capilar', 'Manos & Pies', 'Masajes', 'Tratamientos Corporales'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre || !form.precio) {
      showToast('Ingrese nombre y precio del servicio.');
      return;
    }
    onAddServicio({ ...form, id: Date.now(), precio: parseFloat(form.precio) });
    showToast(`Servicio "${form.nombre}" registrado en catálogo.`);
    setForm({ nombre: '', categoria: 'Spa & Bienestar', duracion: 60, precio: '', comision: 25, descripcion: '', cabina: 'Cabina 01 - Facial Oro & Luz LED' });
    setMode('list');
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
          <span className="uc-badge">CUS06 · Área de Recepción</span>
          <h2 className="uc-module__title">Consultar Catálogo de Servicios y Productos</h2>
          <p className="uc-module__subtitle">Tarifario oficial, duración, cabinas asignadas y disponibilidad para mostrador</p>
        </div>
        <button id="btn-nuevo-servicio" className="btn-gold" onClick={() => setMode(mode === 'form' ? 'list' : 'form')}>
          {mode === 'form' ? '← Ver Catálogo de Consulta' : '+ Agregar Servicio al Catálogo'}
        </button>
      </div>

      {mode === 'form' && (
        <form onSubmit={handleSubmit} className="uc-form" id="form-registrar-servicio">
          <h3 className="uc-form__title">Ficha Técnica de Servicio</h3>
          <div className="uc-form__grid">
            <div className="form-field" style={{gridColumn:'1/-1'}}>
              <label htmlFor="servicio-nombre">Nombre del Servicio *</label>
              <input id="servicio-nombre" name="nombre" value={form.nombre}
                onChange={e => setForm({...form, nombre: e.target.value})}
                placeholder="Ej: Masaje Descontracturante Premium" required />
            </div>
            <div className="form-field">
              <label htmlFor="servicio-categoria">Categoría *</label>
              <select id="servicio-categoria" value={form.categoria}
                onChange={e => setForm({...form, categoria: e.target.value})}>
                {CATEGORIAS.filter(c => c !== 'Todas').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="servicio-duracion">Duración (min)</label>
              <input id="servicio-duracion" type="number" min="15" step="15" value={form.duracion}
                onChange={e => setForm({...form, duracion: parseInt(e.target.value)})} />
            </div>
            <div className="form-field">
              <label htmlFor="servicio-precio">Precio al Público (S/) *</label>
              <input id="servicio-precio" type="number" step="0.01" min="0" value={form.precio}
                onChange={e => setForm({...form, precio: e.target.value})}
                placeholder="0.00" required />
            </div>
            <div className="form-field">
              <label htmlFor="servicio-cabina">Cabina Sugerida</label>
              <input id="servicio-cabina" value={form.cabina}
                onChange={e => setForm({...form, cabina: e.target.value})}
                placeholder="Cabina 01, 02, etc." />
            </div>
          </div>
          <div className="uc-form__actions">
            <button type="button" className="btn-secondary" onClick={() => setMode('list')}>Cancelar</button>
            <button type="submit" className="btn-gold" id="btn-guardar-servicio">Guardar en Catálogo</button>
          </div>
        </form>
      )}

      {mode === 'list' && (
        <>
          {/* Barra de Filtro y Búsqueda Rápida para Recepción */}
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
              {CATEGORIAS.map(cat => (
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
            {filteredCatalogo.map((s, i) => (
              <div key={i} className="catalogo-card" style={{ borderTop: '3px solid #D4AF37' }}>
                <div className="catalogo-card__cat">{s.categoria || 'Tratamiento Spa'}</div>
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
              </div>
            ))}
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
// CUS07: Aperturar Turno de Caja (Persistente con PostgreSQL)
// =============================================
export function AperturasCaja({ onApertura, caja, cajaAbierta, currentUser, showToast }) {
  const [form, setForm] = useState({ 
    responsable: currentUser?.nombre || 'Carmen Sánchez García', 
    turno: 'Turno Mañana',
    saldo_inicial: '150.00', 
    observaciones: 'Fondo de sencillo verificado en billetes y monedas' 
  });
  const [modoEdicion, setModoEdicion] = useState(false);

  const cajaEstaAbierta = (caja?.estado === 'Abierta') || cajaAbierta;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const saldo = parseFloat(form.saldo_inicial);
    if (!form.responsable) { showToast('Ingrese el nombre del responsable de caja.'); return; }
    if (isNaN(saldo) || saldo < 0) { showToast('Ingrese un saldo inicial válido (≥ 0).'); return; }
    
    const apertura = {
      responsable: form.responsable,
      turno: form.turno,
      saldo_inicial: saldo,
      observaciones: form.observaciones,
      hora_apertura: new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
      fecha: new Date().toLocaleDateString('es-PE'),
      numero_turno: form.turno === 'Turno Mañana' ? 'T-01' : 'T-02'
    };

    await onApertura(apertura);
    setModoEdicion(false);
  };

  return (
    <div className="uc-module">
      <div className="uc-module__header">
        <div>
          <h2 className="uc-module__title">Aperturar Turno de Caja</h2>
          <p className="uc-module__subtitle">Control de apertura de turno, fondo inicial y balance operativo</p>
        </div>
        {cajaEstaAbierta && !modoEdicion ? (
          <span className="status-badge status-badge--success" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#4CAF50', display: 'inline-block' }}></span>
            Caja Abierta (Operativa)
          </span>
        ) : (
          <span className="status-badge status-badge--warning">
            Apertura Requerida
          </span>
        )}
      </div>

      {cajaEstaAbierta && !modoEdicion ? (
        <div className="apertura-confirmacion" style={{ border: '1px solid #C2E0C6', borderRadius: '12px', padding: '24px', background: '#F8FBF9' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#2E7D32', display: 'inline-block' }}></span>
                <h3 style={{ margin: 0, color: '#1B3D2B', fontSize: '1.25rem' }}>Turno de Caja Activo</h3>
              </div>
              <p style={{ margin: 0, color: '#4A5568', fontSize: '0.88rem' }}>
                Los cobros en efectivo y pagos digitales se registran en tiempo real en la caja de turno.
              </p>
            </div>
            <button 
              className="btn-outline" 
              onClick={() => setModoEdicion(true)}
              style={{ fontSize: '0.84rem' }}
            >
              Re-Aperturar / Iniciar Nuevo Turno
            </button>
          </div>

          <div className="apertura-info-grid" style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '14px' }}>
            <div className="apertura-info-item" style={{ background: '#FFF', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <span className="apertura-info-label" style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#718096', fontWeight: 600 }}>Turno Fiscal</span>
              <strong className="apertura-info-value" style={{ display: 'block', fontSize: '1.1rem', color: '#1B3D2B', marginTop: '4px' }}>
                {caja?.turno || 'Turno Mañana'}
              </strong>
            </div>
            <div className="apertura-info-item" style={{ background: '#FFF', padding: '12px 14px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
              <span className="apertura-info-label" style={{ fontSize: '0.74rem', textTransform: 'uppercase', color: '#718096', fontWeight: 600 }}>Fondo de Sencillo</span>
              <strong className="apertura-info-value" style={{ display: 'block', fontSize: '1.1rem', color: '#B38B28', marginTop: '4px' }}>
                S/ {(Number(caja?.apertura) || 0).toFixed(2)}
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

          <div style={{ marginTop: '18px', background: '#E8F5E9', border: '1px solid #C8E6C9', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontSize: '0.84rem', color: '#2E7D32' }}>
              <strong>Sincronización de Caja:</strong> El terminal POS y las citas cobradas actualizan en tiempo real los movimientos y el balance de caja.
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="uc-form" id="form-apertura-caja">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 className="uc-form__title" style={{ margin: 0 }}>Registro Oficial de Apertura de Caja</h3>
            {cajaEstaAbierta && (
              <button type="button" className="btn-secondary" onClick={() => setModoEdicion(false)}>
                ← Volver a Resumen de Turno
              </button>
            )}
          </div>

          <div className="uc-form__grid">
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

            <div className="form-field">
              <label htmlFor="apertura-saldo">Fondo Inicial de Sencillo (S/) *</label>
              <input 
                id="apertura-saldo" 
                type="number" 
                step="0.01" 
                min="0" 
                value={form.saldo_inicial}
                onChange={e => setForm({...form, saldo_inicial: e.target.value})}
                placeholder="Ej: 150.00" 
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
            <strong>Información Operativa:</strong> Al registrar la apertura se inicializa el fondo de mostrador y se habilitan las operaciones de venta del turno.
          </div>

          <div className="uc-form__actions">
            {cajaEstaAbierta && (
              <button type="button" className="btn-secondary" onClick={() => setModoEdicion(false)}>
                Cancelar
              </button>
            )}
            <button type="submit" className="btn-gold btn-gold--large" id="btn-aperturar-caja">
              Aperturar Turno de Caja
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
