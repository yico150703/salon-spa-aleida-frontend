# Diseño de la landing pública

Propuestas visuales para la portada pública de **Salon Spa Aleida**: una página de marketing que convive con el portal de clientes actual (`src/components/Portal.jsx`) y entrega el agendamiento a `src/components/BookingPage.jsx`.

> Estado: **propuesta de diseño**, todavía no implementada en React. Estas vistas existen para decidir la dirección antes de escribir componentes.

## Propuestas

| Archivo | Dirección | Qué la distingue |
| --- | --- | --- |
| `preview/1-carta-de-servicios.html` | Tratamiento primero | La carta de servicios es el objeto principal: columna de ambiente junto a cinco filas de tratamiento con duración y precio alineados. Reserva en dos columnas con resumen propio. |
| `preview/2-elige-por-duracion.html` | Duración primero | Las cinco tarjetas se ordenan de 45 a 120 minutos y la duración es el primer campo de cada una, para comparar el tiempo que exige cada tratamiento. |
| `preview/3-con-tu-especialista.html` | Especialista primero | Catálogo en cuatro franjas por tipo de tratamiento, sin sección de equipo aparte: la especialista es la primera decisión de la reserva. |
| `preview/4-movil-carta-de-servicios.html` | Móvil | La propuesta 1 adaptada a 390 px: navegación compacta, catálogo de tarjetas y reserva en orden especialista, fecha, horario y resumen. |

Las tres primeras están compuestas a 1440 px; la cuarta a 390 px.

## Cómo verlas

Abrir cualquier archivo de `preview/` directamente en el navegador. Son HTML autocontenidos: tipografías desde Google Fonts, iconos desde el webfont de Tabler y fotografías desde Unsplash y Pexels, así que necesitan conexión.

Las selecciones de servicio, especialista, fecha y hora son interactivas y actualizan el resumen de la reserva.

## Sistema visual

| Token | Valor |
| --- | --- |
| Verde bosque | `#2B573C` |
| Verde salvia | `#4A7C59` |
| Fondo menta | `#F4FAF6` |
| Salvia pastel | `#EBF5F0` |
| Oro cálido | `#D4AF37` (solo filetes y marcas pequeñas) |
| Texto | `#183023` / `#42634F` |
| Bordes | `#CFE3D7` / `#E4F1E9` |
| Titulares | Playfair Display |
| Texto | Outfit |

## Contenido

Los precios, duraciones, nombres de especialistas, dirección, horario y teléfonos provienen de `src/components/Portal.jsx`, que es la fuente tomada como canónica.

`src/components/BookingPage.jsx` mantiene valores distintos para los mismos datos (calle 780 en lugar de 450, teléfono 421-8900 en lugar de 421-9876). Conviene unificarlos antes de implementar la landing.

## Fuente editable

`salon-spa-aleida.canvas` es una copia del canvas de trabajo de Kombai. La copia viva, que es la que se edita, está en `.kombai/canvas/` en la raíz del proyecto.
