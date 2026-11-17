/**
 * DS_CU02 - Registrar Personal
 * Actor: Administrador
 * DS_CU06 - Registrar Servicio en Catálogo  
 * Actor: Administrador
 * DS_CU07 - Aperturar Turno de Caja
 * Actor: Cajero
 */

import React, { useState } from 'react';

// =============================================
// DS_CU02: Formulario Registrar Personal
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
          <span className="uc-badge">Personal</span>
          <h2 className="uc-module__title">Registrar Personal</h2>
          <p className="uc-module__subtitle">Actor: Administrador · Gestión de usuarios del sistema</p>
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
// DS_CU06: Formulario Registrar Servicio en Catálogo
// =============================================
export function CatalogoManager({ catalogo, onAddServicio, showToast }) {
  const [form, setForm] = useState({
    nombre: '', categoria: 'Spa & Bienestar', duracion: 60, precio: '', comision: 25, descripcion: ''
  });
  const [mode, setMode] = useState('list');

  const CATEGORIAS = ['Spa & Bienestar', 'Cosmiatría Facial', 'Cuidado Capilar', 'Manos & Pies', 'Masajes', 'Tratamientos Corporales'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.nombre || !form.precio) {
      showToast('Ingrese nombre y precio del servicio.');
      return;
    }
    onAddServicio({ ...form, id: Date.now(), precio: parseFloat(form.precio) });
    showToast(`Servicio "${form.nombre}" registrado en catálogo.`);
    setForm({ nombre: '', categoria: 'Spa & Bienestar', duracion: 60, precio: '', comision: 25, descripcion: '' });
    setMode('list');
  };

  return (
    <div className="uc-module">
      <div className="uc-module__header">
        <div>
          <span className="uc-badge">Catálogo</span>
          <h2 className="uc-module__title">Registrar Servicio en Catálogo</h2>
          <p className="uc-module__subtitle">Actor: Administrador · Tarifario de servicios del spa</p>
        </div>
        <button id="btn-nuevo-servicio" className="btn-gold" onClick={() => setMode(mode === 'form' ? 'list' : 'form')}>
          {mode === 'form' ? '← Ver Catálogo' : '+ Nuevo Servicio'}
        </button>
      </div>

      {mode === 'form' && (
        <form onSubmit={handleSubmit} className="uc-form" id="form-registrar-servicio">
          <h3 className="uc-form__title">Ficha de Servicio</h3>
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
                {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label htmlFor="servicio-duracion">Duración (min)</label>
              <input id="servicio-duracion" type="number" min="15" step="15" value={form.duracion}
                onChange={e => setForm({...form, duracion: parseInt(e.target.value)})} />
            </div>
            <div className="form-field">
              <label htmlFor="servicio-precio">Precio (S/) *</label>
              <input id="servicio-precio" type="number" step="0.01" min="0" value={form.precio}
                onChange={e => setForm({...form, precio: e.target.value})}
                placeholder="0.00" required />
            </div>
            <div className="form-field">
              <label htmlFor="servicio-comision">Comisión Terapeuta (%)</label>
              <input id="servicio-comision" type="number" min="0" max="50" value={form.comision}
                onChange={e => setForm({...form, comision: parseInt(e.target.value)})} />
            </div>
          </div>
          <div className="uc-form__actions">
            <button type="button" className="btn-secondary" onClick={() => setMode('list')}>Cancelar</button>
            <button type="submit" className="btn-gold" id="btn-guardar-servicio">Registrar Servicio</button>
          </div>
        </form>
      )}

      {mode === 'list' && (
        <div className="catalogo-grid" id="grid-catalogo">
          {(catalogo || []).map((s, i) => (
            <div key={i} className="catalogo-card">
              <div className="catalogo-card__cat">{s.categoria}</div>
              <h4 className="catalogo-card__name">{s.nombre}</h4>
              <div className="catalogo-card__details">
                <span>{s.duracion} min</span>
                <span>S/ {parseFloat(s.precio).toFixed(2)}</span>
                <span>{s.comision}% comisión</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =============================================
// DS_CU07: Aperturar Turno de Caja (Persistente con PostgreSQL)
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
          <span className="uc-badge">DS_CU07 · RF07</span>
          <h2 className="uc-module__title">Aperturar Turno de Caja</h2>
          <p className="uc-module__subtitle">Actor: Cajero / Administrador · Inicialización de caja y sincronización en PostgreSQL</p>
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
                <span style={{ fontSize: '1.4rem' }}>🟢</span>
                <h3 style={{ margin: 0, color: '#1B3D2B', fontSize: '1.25rem' }}>Turno de Caja Activo en Base de Datos</h3>
              </div>
              <p style={{ margin: 0, color: '#4A5568', fontSize: '0.88rem' }}>
                Los cobros en efectivo y billeteras digitales se acreditan en tiempo real a este balance.
              </p>
            </div>
            <button 
              className="btn-outline" 
              onClick={() => setModoEdicion(true)}
              style={{ fontSize: '0.84rem' }}
            >
              🔄 Re-Aperturar / Iniciar Nuevo Turno
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
            <span style={{ fontSize: '1.2rem' }}>ℹ️</span>
            <div style={{ fontSize: '0.84rem', color: '#2E7D32' }}>
              <strong>Sincronización Activa:</strong> El terminal POS y las citas cobradas impactan directamente la tabla <code>caja</code> y <code>caja_movimientos</code> en la base de datos PostgreSQL.
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="uc-form" id="form-apertura-caja">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 className="uc-form__title" style={{ margin: 0 }}>Registro Oficial de Apertura de Caja (RF07)</h3>
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
            ⚡ <strong>Impacto Inmediato:</strong> Al registrar la apertura se inicializa el saldo en PostgreSQL, se asienta la apertura en <code>caja_movimientos</code> y se reinician los contadores diarios para garantizar la meta de exactitud del arqueo (OBJ-02).
          </div>

          <div className="uc-form__actions">
            {cajaEstaAbierta && (
              <button type="button" className="btn-secondary" onClick={() => setModoEdicion(false)}>
                Cancelar
              </button>
            )}
            <button type="submit" className="btn-gold btn-gold--large" id="btn-aperturar-caja">
              💾 Aperturar Turno en Base de Datos (RF07)
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
