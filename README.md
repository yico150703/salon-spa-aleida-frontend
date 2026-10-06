# Salon Spa Aleida - Frontend (React + Vite)

Aplicación web desarrollada con **React y Vite**, optimizada para despliegue instantáneo en **[Vercel](https://vercel.com/)**.

Ofrece una interfaz de alta fidelidad que implementa:
- **Portal de Clientes:** Catálogo de tratamientos de lujo y Widget de agendamiento online en 5 pasos (`CU01`).
- **Dashboard Administrativo:** Gestión operativa para recepción y caja cubriendo los **9 Casos de Uso (`CU01` a `CU09`)**.
- **Panel de KPIs:** Monitoreo en tiempo real de los **4 Objetivos Estratégicos SMART** del negocio.

---

## 🚀 Despliegue en Vercel (Paso a Paso)

1. Sube esta carpeta `frontend` a un repositorio en tu GitHub (ej: `salon-spa-aleida-frontend`).
2. Entra a tu cuenta en **[https://vercel.com](https://vercel.com)**.
3. Haz clic en **Add New...** $\rightarrow$ **Project**.
4. Importa tu repositorio `salon-spa-aleida-frontend`.
5. Vercel detectará automáticamente que es un proyecto **Vite**.
6. En la sección **Environment Variables**, añade:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://tu-backend-en-render.onrender.com/api` (la URL de tu Flask en Render).
7. Haz clic en **Deploy**.
8. ¡Listo! En menos de 1 minuto tendrás tu frontend en vivo con dominio SSL gratuito (ej: `https://salon-spa-aleida.vercel.app`).

---

## 💻 Ejecución en Local

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo
npm run dev
```
La aplicación se abrirá en `http://localhost:5173`.

---

## 📁 Estructura del Código

```
frontend/
├── src/
│   ├── components/
│   │   ├── Portal.jsx        # Landing page, catálogo y widget de reservas (CU01)
│   │   └── Dashboard.jsx     # Panel administrativo con tabs para los 9 CU y los 4 KPIs SMART
│   ├── api.js                # Conexión con Flask REST API en Render
│   ├── App.jsx               # Gestor de vistas (Cliente / Administración)
│   ├── index.css             # Sistema de diseño de lujo (Gold, Rose, Serif, Glassmorphic)
│   └── main.jsx              # Punto de entrada de React
├── vercel.json               # Reglas de enrutamiento SPA para Vercel
├── vite.config.js            # Configuración de Vite
└── package.json
```
