# Don Teófilo Amoblamientos — Web

Sitio web de Don Teófilo Amoblamientos, carpintería a medida (cocinas, placards, vanitorys,
aberturas). Migrado desde una maqueta estática (HTML/CSS/JS vanilla, conservada en `legacy/`) a
un proyecto React + Vite listo para producción.

## Stack

- React 18 + Vite
- React Router v6 (rutas: `/`, `/productos`, `/proyectos`, `/como-trabajamos`, `/contacto`)
- Framer Motion (instalado, disponible para animaciones futuras)
- Supabase JS client (inicializado, sin lógica de datos todavía)
- CSS puro (custom properties globales + un archivo `.css` por componente)
- ESLint + Prettier

## Cómo correr el proyecto

```bash
npm install
npm run dev
```

Abrí `http://localhost:5173`.

Para build de producción:

```bash
npm run build
npm run preview
```

## Variables de entorno

Copiá `.env.example` a `.env` y completá las credenciales de Supabase cuando estén disponibles:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Estructura de carpetas

```
src/
  assets/           imágenes, íconos
  components/
    layout/         Navbar, Footer, ProgressBar, WhatsAppFloat, Layout (envuelve todas las páginas)
    home/           secciones de la Home (HeroSlider, StatsSection, ServicesGrid, FeaturedProject,
                    BeforeAfterSlider, ProcessSteps, Testimonials, CTABanner, InstagramStrip)
    ui/             botones (BtnPrimary, BtnOutline, BtnPill, BtnWhatsapp) e íconos reutilizables
  pages/            Home (completa) + Productos, Proyectos, ComoTrabajamos, Contacto (placeholders)
  hooks/            useScrollProgress, useScrollReveal, useCountUp
  lib/              supabaseClient.js
  config/           contact.js (datos de contacto, placeholders)
  styles/           variables.css (custom properties) y global.css (reset, tipografía, keyframes)
legacy/             maqueta estática original (index.html, styles.css, script.js), de referencia
```

Cada componente de `home/` y `layout/` importa su propio `.css` con las clases migradas 1:1 desde
la maqueta original — mismas clases, mismos valores, mismas media queries.

## Navegación

El Navbar usa anchors (`#top`, `#productos`, `#proyectos`, `#proceso`, `#contacto`) que hacen
scroll suave dentro de la Home, igual que en la maqueta original. Las rutas `/productos`,
`/proyectos`, `/como-trabajamos` y `/contacto` ya existen como páginas independientes (por ahora
placeholders) para cuando esas secciones se conviertan en páginas propias con contenido real.

## Qué falta por hacer

- Conectar Supabase con datos reales (productos, proyectos, testimonios) reemplazando los arrays
  estáticos actuales (por ejemplo, `testimonials` en `src/components/home/Testimonials.jsx`).
- Desarrollar el contenido real de `/productos`, `/proyectos`, `/como-trabajamos` y `/contacto`
  (hoy son placeholders con un `<h1>`).
- Reemplazar los datos de contacto placeholder en `src/config/contact.js` (WhatsApp, email,
  direcciones) por los datos reales de la empresa.
- Reemplazar los fondos degradados (hero, productos, before/after, Instagram) por fotos reales.
- Panel de administración para gestionar productos/proyectos vía Supabase.
- Formulario de contacto funcional (`#contacto-form`, actualmente solo un link ancla).
