/**
 * DS_CU01 - Autenticar Usuario
 * Actor: Usuario (Administrador, Recepcionista, Cajero)
 * Precondición: Usuario registrado en el sistema
 * Flujo: ingresar credenciales → validar → redirigir según rol
 */

import React, { useState } from 'react';
import { CalendarIcon, DollarIcon, UsersIcon, ChartIcon, UserIcon, LockIcon } from './Icons';

const USUARIOS_SISTEMA = [
  { 
    usuario: 'admin', 
    password: '1234', 
    nombre: 'Aleida Mendoza', 
    rol: 'Administrador', 
    permisos: ['agenda', 'clientes', 'caja', 'catalogo', 'personal', 'reportes'] 
  },
  { 
    usuario: 'recepcion', 
    password: '1234', 
    nombre: 'Camila Ramos', 
    rol: 'Recepcionista', 
    permisos: ['agenda', 'clientes'] 
  },
  { 
    usuario: 'cajero', 
    password: '1234', 
    nombre: 'Javier Torres', 
    rol: 'Cajero', 
    permisos: ['caja'] 
  },
];

export default function LoginScreen({ onLogin, onBackToHome }) {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      const user = USUARIOS_SISTEMA.find(
        u => u.usuario === usuario.trim() && u.password === password
      );
      if (user) {
        onLogin(user);
      } else {
        setError('Usuario o contraseña incorrectos. Verifique sus credenciales.');
        setLoading(false);
      }
    }, 600);
  };

  const handleQuickLogin = (user) => {
    setUsuario(user.usuario);
    setPassword(user.password);
  };

  return (
    <div className="login-root">
      {/* Background decorative emerald & gold ambient orbs */}
      <div className="login-bg-orb login-bg-orb--1" />
      <div className="login-bg-orb login-bg-orb--2" />
      <div className="login-bg-orb login-bg-orb--3" />

      {/* Botón flotante para regresar al portal */}
      {onBackToHome && (
        <button 
          type="button" 
          onClick={onBackToHome} 
          className="login-floating-back"
          title="Regresar a la Página Principal"
        >
          <span>←</span> Volver al Portal del Spa
        </button>
      )}

      <div className="login-container">
        {/* Brand Panel */}
        <div className="login-brand">
          <div className="login-brand__logo">
            <img 
              src="/logo_zen_icon.svg" 
              alt="Salon Spa Aleida" 
              style={{ width: '48px', height: '48px' }} 
            />
          </div>
          <h1 className="login-brand__name">Salon Spa Aleida</h1>
          <p className="login-brand__tagline">Portal de Gestión Administrativa</p>
          <div className="login-brand__divider" />
          
          <div className="login-brand__features">
            <div className="login-feature">
              <span className="login-feature__icon"><CalendarIcon size={16} color="#D4AF37" /></span>
              <span>Agenda de Citas & Cabinas</span>
            </div>
            <div className="login-feature">
              <span className="login-feature__icon"><DollarIcon size={16} color="#D4AF37" /></span>
              <span>Caja, Cobros & Comprobantes</span>
            </div>
            <div className="login-feature">
              <span className="login-feature__icon"><UsersIcon size={16} color="#D4AF37" /></span>
              <span>Padrón de Clientes & Personal</span>
            </div>
            <div className="login-feature">
              <span className="login-feature__icon"><ChartIcon size={16} color="#D4AF37" /></span>
              <span>Catálogo, Stock & Reportes</span>
            </div>
          </div>

          <div className="login-brand__badge">
            <span>Santuario de Belleza & Bienestar</span>
          </div>
        </div>

        {/* Login Form Panel */}
        <div className="login-form-panel">
          <div className="login-form-top-actions">
            {onBackToHome && (
              <button 
                type="button" 
                onClick={onBackToHome} 
                className="login-top-back-btn"
              >
                ← Volver al Portal
              </button>
            )}
            <span className="login-secure-indicator">Acceso Seguro SSL</span>
          </div>

          <div className="login-form-header">
            <h2 className="login-form-title">Acceso Administrativo</h2>
            <p className="login-form-subtitle">Autenticación segura para personal autorizado</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form" id="login-form">
            <div className="login-field">
              <label htmlFor="login-usuario" className="login-label">
                Usuario
              </label>
              <div className="login-input-wrapper">
                <span className="login-input-icon"><UserIcon size={16} color="#4A7C59" /></span>
                <input
                  id="login-usuario"
                  type="text"
                  className="login-input"
                  placeholder="Ej: admin, recepcion o cajero"
                  value={usuario}
                  onChange={e => setUsuario(e.target.value)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="login-password" className="login-label">
                Contraseña
              </label>
              <div className="login-input-wrapper">
                <span className="login-input-icon"><LockIcon size={16} color="#4A7C59" /></span>
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  className="login-input"
                  placeholder="Ingrese su contraseña"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="login-show-pass"
                  onClick={() => setShowPass(!showPass)}
                  id="toggle-password-visibility"
                  style={{ fontSize: '12px', fontWeight: 600, color: '#4A7C59' }}
                >
                  {showPass ? 'Ocultar' : 'Ver'}
                </button>
              </div>
            </div>

            {error && (
              <div className="login-error" role="alert">
                <span style={{ fontWeight: 600 }}>Aviso:</span> {error}
              </div>
            )}

            <button
              type="submit"
              className="login-btn-submit"
              disabled={loading}
              id="btn-login-submit"
            >
              {loading ? (
                <span className="login-btn-loading">
                  <span className="login-spinner" />
                  Validando Credenciales...
                </span>
              ) : (
                'Ingresar al Panel de Gestión'
              )}
            </button>
          </form>

          {/* Quick Access Demo */}
          <div className="login-quick-access">
            <p className="login-quick-title">Selección rápida de perfil (demostración):</p>
            <div className="login-quick-buttons">
              {USUARIOS_SISTEMA.map(u => (
                <button
                  key={u.usuario}
                  className={`login-quick-btn login-quick-btn--${u.rol.toLowerCase()}`}
                  onClick={() => handleQuickLogin(u)}
                  id={`quick-login-${u.rol.toLowerCase()}`}
                  type="button"
                >
                  <span className="login-quick-btn__role">{u.rol}</span>
                  <span className="login-quick-btn__name">{u.nombre}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="login-footer-note">
            <span>Sistema MCUS · Spa &amp; Salon Aleida &copy; 2026 · Conexión PostgreSQL Render</span>
          </div>
        </div>
      </div>
    </div>
  );
}
