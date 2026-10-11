# 🌿 FamiCash - Aplicación Móvil (Frontend React)

Sistema de finanzas familiares con vista en **formato celular (Mobile-First)**, desarrollado con **React**, **JavaScript** y **CSS personalizado** con la paleta **Verde Agua**, conectado con la API REST del backend.

---

## 📱 Componentes del Frontend (en Español)

Ubicados en la carpeta `frontend/src/components/`:

1. **[VistaLogin.jsx](file:///c:/Users/Sandro/Desktop/Famicash-Front/Famicash-Front/frontend/src/components/VistaLogin.jsx)** *(Inspirado en el Mockup 1)*
   - Pantalla de inicio de sesión con fondo degradado pastel menta.
   - Monograma de FamiCash, campos de correo electrónico y contraseña con toggle de visibilidad.
   - Botón *"Iniciar Sesión →"* y botón demo rápido de *Laura Martínez*.

2. **[VistaIngresoMonto.jsx](file:///c:/Users/Sandro/Desktop/Famicash-Front/Famicash-Front/frontend/src/components/VistaIngresoMonto.jsx)** *(Inspirado en el Mockup 2)*
   - Header con avatar de Laura Martínez y campana de notificaciones.
   - Selector de tipo: **Gasto** vs **Ingreso**.
   - Selector de subtipo: **Cotidiano**, **Fijo**, **Extra**.
   - **Paso 1 (Cuenta donde sacar plata):** Selector de cuentas bancarias existentes mostrando el saldo actual disponible y proyectado.
   - **Paso 2 (Categoría):** Cuadrícula 4 columnas con iconos (*Comida*, *Transporte*, *Hogar*, *Otros*).
   - **Display de Monto:** Tarjeta con `$ 0` en verde bosque.
   - **Teclado Numérico Táctil en Pantalla:** Teclas `1` a `9`, punto `.`, `0` y tecla de borrado `⌫`.
   - Botón *"Confirmar Gasto (✓)"* que registra el movimiento y redirige a la vista de Resumen.

3. **[VistaResumen.jsx](file:///c:/Users/Sandro/Desktop/Famicash-Front/Famicash-Front/frontend/src/components/VistaResumen.jsx)** *(Inspirado en la estructura del Mockup 4 con tema Verde Agua)*
   - Selector de mes (*Octubre 2026*).
   - **Tarjeta de Saldo Total:** Muestra saldo disponible, total de gastos (en rojo) y total de ingresos (en verde).
   - **Presupuesto Mensual:** Barra de progreso acumulada del límite de S/ 5,000.00.
   - **Metas de Ahorro:** Carrusel con tarjetas de progreso (*Auto*, *Equipamiento*, *Fondo Niños*).
   - **Historial Visual de Gastos (Feed de Movimientos):**
     - Agrupado por fechas (*Hoy*, *Ayer*, *días previos*).
     - Cada movimiento muestra icono de categoría, etiquetas (`#comida • BCP Débito`) y monto.
     - Botón para eliminar transacciones que restaura automáticamente el saldo de la cuenta.

4. **[VistaPerfil.jsx](file:///c:/Users/Sandro/Desktop/Famicash-Front/Famicash-Front/frontend/src/components/VistaPerfil.jsx)** *(Inspirado en el Mockup 3)*
   - Perfil de *Laura Martínez* con foto editable y chip *"Cuenta Principal"*.
   - Menú de opciones: *Notificaciones*, *Seguridad*, *Familiares vinculados (badge 3)* y *Cerrar Sesión*.

5. **[VistaCuentas.jsx](file:///c:/Users/Sandro/Desktop/Famicash-Front/Famicash-Front/frontend/src/components/VistaCuentas.jsx)**
   - Vista de cuentas bancarias asociadas y consulta de balances.

6. **[NavegacionInferior.jsx](file:///c:/Users/Sandro/Desktop/Famicash-Front/Famicash-Front/frontend/src/components/NavegacionInferior.jsx)**
   - Barra de navegación inferior móvil: [Resumen], botón central flotante (+) verde agua [Gastos], [Línea / Cuentas], [Perfil].

7. **[MarcoCelular.jsx](file:///c:/Users/Sandro/Desktop/Famicash-Front/Famicash-Front/frontend/src/components/MarcoCelular.jsx)**
   - Chasis exterior de teléfono inteligente con barra de estado (batería, 5G, Dynamic Island) y botón superior para alternar entre marco celular y pantalla completa.

8. **[iconosCategorias.jsx](file:///c:/Users/Sandro/Desktop/Famicash-Front/Famicash-Front/frontend/src/utils/iconosCategorias.jsx)**
   - Mapeo de iconos vectoriales para cada categoría financiera.

---

## 🗄️ Backend y Base de Datos (PostgreSQL)

Todo el backend ha sido separado en su propio repositorio:
📁 **`C:\Users\Sandro\Desktop\Famicash-Back`**
- Contiene los endpoints REST API en Node.js/Express.
- Incluye el script **`database/famicash_dbeaver_setup.sql`** listo para ejecutar en DBeaver (`Alt + X`).

---

## 🚀 Cómo Iniciar el Frontend

Desde la raíz de este repositorio:
```bash
npm run dev
```

La aplicación abrirá en:
[http://localhost:5173/](http://localhost:5173/)
