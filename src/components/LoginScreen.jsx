/**
 * DS_CU01 - Autenticar Usuario
 * Actor: Usuario (Administrador, Recepcionista, Cajero)
 * Precondición: Usuario registrado en el sistema
 * Flujo: ingresar credenciales → validar → redirigir según rol
 */

import React, { useState } from 'react';
import { CalendarIcon, DollarIcon, UsersIcon, ChartIcon, UserIcon, LockIcon } from './Icons';

const USUARIOS_SISTEMA = [
  { usuario: 'admin', password: '1234', nombre: 'Aleida Mendoza', rol: 'Administrador', 
    permisos: ['agenda', 'clientes', 'caja', 'catalogo', 'personal', 'reportes'] },
  { usuario: 'recepcion', password: '1234', nombre: 'Camila Ramos', rol: 'Recepcionista', 
    permisos: ['agenda', 'clientes'] },
  { usuario: 'cajero', password: '1234', nombre: 'Javier Torres', rol: 'Cajero', 
    permisos: ['caja'] },
];

export default function LoginScreen({ onLogin }) {
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
    }, 700);
  };

  const handleQuickLogin = (user) => {
    setUsuario(user.usuario);
    setPassword(user.password);
  };

  return (
    <div className="login-root">
      {/* Background decorative elements */}
      <div className="login-bg-orb login-bg-orb--1" />
      <div className="login-bg-orb login-bg-orb--2" />
      <div className="login-bg-orb login-bg-orb--3" />

      <div className="login-container">
        {/* Brand Panel */}
        <div className="login-brand">
          <div className="login-brand__logo">
            <span className="login-brand__icon"><LockIcon size={24} color="#C8A26A" /></span>
          </div>
          <h1 className="login-brand__name">Salon Spa Aleida</h1>
          <p className="login-brand__tagline">Sistema de Gestión Integral</p>
          <div className="login-brand__divider" />
          <div className="login-brand__features">
            <div className="login-feature">
              <span className="login-feature__icon"><CalendarIcon size={16} color="#C8A26A" /></span>
              <span>Agenda & Citas</span>
            </div>
            <div className="login-feature">
              <span className="login-feature__icon"><DollarIcon size={16} color="#C8A26A" /></span>
              <span>Caja & Ventas</span>
            </div>
            <div className="login-feature">
              <span className="login-feature__icon"><UsersIcon size={16} color="#C8A26A" /></span>
              <span>Clientes & Personal</span>
            </div>
            <div className="login-feature">
              <span className="login-feature__icon"><ChartIcon size={16} color="#C8A26A" /></span>
              <span>Reportes & Catálogo</span>
            </div>
          </div>
        </div>

        {/* Login Form Panel */}
        <div className="login-form-panel">
          <div className="login-form-header">
            <h2 className="login-form-title">Iniciar Sesión</h2>
            <p className="login-form-subtitle">DS_CU01 · Autenticar Usuario</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form" id="login-form">
            <div className="login-field">
              <label htmlFor="login-usuario" className="login-label">
                Usuario
              </label>
              <div className="login-input-wrapper">
                <span className="login-input-icon"><UserIcon size={16} color="#888" /></span>
                <input
                  id="login-usuario"
                  type="text"
                  className="login-input"
                  placeholder="Ingrese su usuario"
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
                <span className="login-input-icon"><LockIcon size={16} color="#888" /></span>
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
                  style={{ fontSize: '12px', fontWeight: 600 }}
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
                  Validando...
                </span>
              ) : (
                'Acceder al Sistema'
              )}
            </button>
          </form>

          {/* Quick Access Demo */}
          <div className="login-quick-access">
            <p className="login-quick-title">Acceso rápido (demo):</p>
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
            <span>Sistema MCUS · Spa &amp; Salon Aleida &copy; 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
}
