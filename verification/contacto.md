# Contacto — Prompt 05

Implementadas las seis fases aprobadas. Desktop conserva el layout split original (información a la izquierda y formulario a la derecha). Solo en mobile, hasta el breakpoint existente de 980 px, el orden es título y bajada, formulario, número, esquema y datos del taller. Se conservan la textura de papel, la grilla y las marcas de esquina.

## Archivos

- Contacto.jsx / Contacto.css: layout split restaurado en escritorio y reordenamiento visual aplicado solo en mobile mediante media query.

- ContactForm.jsx / ContactForm.css: lectura y limpieza de tipo, seis chips, valores inmediatos y preview diferido, validación y foco, autofill y línea de foco.
- MessagePreview.jsx (nuevo): indicador finito reiniciado por escritura, debounce visual de 700 ms, hora local, entrada de burbuja y reduced motion.
- ContactInfo.jsx / ContactInfo.css: copy aprobado, estado del taller, enlace al número y copia accesible con fallback.
- WorkshopRoute.jsx (nuevo): esquema BA–Tandil, ruta/nodos/cota secuenciales al entrar en viewport.
- contact.js / estadoTaller.js (nuevo): horarios estructurados, textos de horario derivados, zona argentina y función pura de estado.
- contactTypes.js (nuevo) / CtaPlano.jsx: identificadores compartidos, con Vanitory y Abertura explícitos. Estos dos tipos usan los campos de Otro proyecto, manteniendo su nombre en el mensaje.
- WhatsAppButton.jsx: admite botón de formulario además del enlace habitual; Contacto usa dark y ancho completo. Apertura directa tras validar, para evitar el bloqueo de popups por demoras.
- WhatsAppFloat.css: pulso limitado a dos ciclos; el del taller abierto es el único infinito del sitio público.

## Casos de horario verificados

Todas las horas corresponden a America/Argentina/Buenos_Aires. Verificación ejecutable: node verification/check-contact.mjs.

| Caso | Estado | Respuesta |
| --- | --- | --- |
| Lunes 8:59 | Cerrado | Hoy a las 9h |
| Lunes 9:00 | Abierto | Respondemos hoy |
| Viernes 18:01 | Cerrado | Mañana a las 9h (sábado) |
| Sábado 12:59 | Abierto | Respondemos hoy |
| Sábado 13:00 | Cerrado | El lunes a las 9h |
| Domingo | Cerrado | Mañana a las 9h (lunes) |

También se verificó que el mismo instante expresado en UTC y en Argentina devuelve el mismo resultado.

## Validación y pendientes

- npm run build: correcto. Los intentos durante las fases fallaron por permisos del sandbox; el build completo pasó con la ejecución autorizada fuera de esa restricción.
- ESLint de archivos modificados: correcto.
- Capturas a 375/1440 y autofill real de Chrome: pendientes, porque las herramientas no tienen un navegador conectado. Se incorporaron name, autocomplete y reglas de labels para autofill; falta verificar el comportamiento real en Chrome.
- TODO distancia: confirmar los ≈ 360 km por ruta. La constante incluye el comentario solicitado.
- Copy aprobado implementado: “Completás esto y te abre WhatsApp con el mensaje listo”. Sin TODO de copy pendiente.
- La guía .claude/skills/frontend-design/SKILL.md no existe en el proyecto ni en las ubicaciones personales revisadas; se usaron las primitivas y tokens existentes.
