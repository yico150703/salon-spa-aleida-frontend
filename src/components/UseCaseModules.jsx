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
    'Administrador': 'Acceso total (DS_CU01–DS_CU10)',
    'Recepcionista': 'Agenda (DS_CU04, DS_CU05), Clientes (DS_CU03)',
    'Cajero': 'Caja (DS_CU07, DS_CU08, DS_CU09, DS_CU10)',
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
          <span className="uc-badge">DS_CU02</span>
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
                <th>Permisos (DS_CU)</th>
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
          <span className="uc-badge">DS_CU06</span>
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
// DS_CU07: Aperturar Turno de Caja
// =============================================
export function AperturasCaja({ onApertura, cajaAbierta, showToast }) {
  const [form, setForm] = useState({ responsable: '', saldo_inicial: '', observaciones: '' });
  const [aperturaHecha, setAperturaHecha] = useState(cajaAbierta || false);
  const [aperturaInfo, setAperturaInfo] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const saldo = parseFloat(form.saldo_inicial);
    if (!form.responsable) { showToast('Ingrese el nombre del responsable de caja.'); return; }
    if (isNaN(saldo) || saldo < 0) { showToast('Ingrese un saldo inicial válido (≥ 0).'); return; }
    
    const apertura = {
      responsable: form.responsable,
      saldo_inicial: saldo,
      observaciones: form.observaciones,
      hora_apertura: new Date().toLocaleTimeString('es-PE'),
      fecha: new Date().toLocaleDateString('es-PE'),
      numero_turno: `T-${Date.now().toString().slice(-4)}`
    };
    setAperturaInfo(apertura);
    setAperturaHecha(true);
    onApertura(apertura);
    showToast(`Turno ${apertura.numero_turno} aperturado. Saldo inicial: S/ ${saldo.toFixed(2)}`);
  };

  return (
    <div className="uc-module">
      <div className="uc-module__header">
        <div>
          <span className="uc-badge">DS_CU07</span>
          <h2 className="uc-module__title">Aperturar Turno de Caja</h2>
          <p className="uc-module__subtitle">Actor: Cajero · Inicio de operaciones del día</p>
        </div>
        {aperturaHecha && (
          <span className="status-badge status-badge--success">Turno Activo</span>
        )}
      </div>

      {aperturaHecha && aperturaInfo ? (
        <div className="apertura-confirmacion">
          <div className="apertura-confirmacion__icon">OK</div>
          <h3>Turno de Caja Aperturado</h3>
          <div className="apertura-info-grid">
            <div className="apertura-info-item">
              <span className="apertura-info-label">N° Turno</span>
              <span className="apertura-info-value">{aperturaInfo.numero_turno}</span>
            </div>
            <div className="apertura-info-item">
              <span className="apertura-info-label">Responsable</span>
              <span className="apertura-info-value">{aperturaInfo.responsable}</span>
            </div>
            <div className="apertura-info-item">
              <span className="apertura-info-label">Hora de Apertura</span>
              <span className="apertura-info-value">{aperturaInfo.hora_apertura}</span>
            </div>
            <div className="apertura-info-item">
              <span className="apertura-info-label">Saldo Inicial</span>
              <span className="apertura-info-value apertura-info-value--gold">
                S/ {aperturaInfo.saldo_inicial.toFixed(2)}
              </span>
            </div>
          </div>
          {aperturaInfo.observaciones && (
            <p className="apertura-obs"><strong>Obs:</strong> {aperturaInfo.observaciones}</p>
          )}
          <p className="apertura-nota">
            La caja está habilitada para procesar ventas (DS_CU08) y registrar egresos.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="uc-form" id="form-apertura-caja">
          <h3 className="uc-form__title">Datos de Apertura</h3>
          <div className="uc-form__grid">
            <div className="form-field">
              <label htmlFor="apertura-responsable">Responsable de Caja *</label>
              <input id="apertura-responsable" value={form.responsable}
                onChange={e => setForm({...form, responsable: e.target.value})}
                placeholder="Nombre del cajero responsable" required />
            </div>
            <div className="form-field">
              <label htmlFor="apertura-saldo">Saldo Inicial (S/) *</label>
              <input id="apertura-saldo" type="number" step="0.01" min="0" value={form.saldo_inicial}
                onChange={e => setForm({...form, saldo_inicial: e.target.value})}
                placeholder="Ej: 150.00" required />
            </div>
            <div className="form-field" style={{gridColumn:'1/-1'}}>
              <label htmlFor="apertura-obs">Observaciones</label>
              <input id="apertura-obs" value={form.observaciones}
                onChange={e => setForm({...form, observaciones: e.target.value})}
                placeholder="Billetes recibidos, condición de caja, etc." />
            </div>
          </div>
          <div className="uc-form__actions">
            <button type="submit" className="btn-gold btn-gold--large" id="btn-aperturar-caja">
              Aperturar Turno de Caja
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
