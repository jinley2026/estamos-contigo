# Estamos Contigo

Plataforma solidaria independiente de información y apoyo para personas afectadas por el accidente ferroviario del 28 de octubre de 2026 entre Mora/Orgaz y Urda (Toledo).

> **Estado: VISTA PREVIA PRIVADA. No publicar.** La publicación está bloqueada por código hasta cumplir los requisitos de `docs/operacion/checklist-publicacion.md`.

## Qué es y qué no es

- Web estática, gratuita, sin cuentas, sin formularios, sin cookies, sin analítica y sin base de datos.
- Reúne canales oficiales verificados, puntos de atención anunciados, estado del servicio, preguntas frecuentes, apoyo emocional, alertas de estafas y la herramienta «Avisar a mi familia» (mensajes que el usuario envía desde su propio teléfono).
- **No** localiza personas, **no** publica listados de víctimas ni hospitales, **no** confirma estados de salud, **no** recoge datos ni dinero, **no** es un servicio oficial.

## Requisitos

- Node.js 20 o superior (probado con 22.23).
- Para las pruebas de navegador: Python 3 con `playwright` y Chromium (`pip install playwright && playwright install chromium`).

## Comandos

| Comando | Qué hace |
|---|---|
| `npm install` | Instala dependencias (solo Astro; axe-core para pruebas). |
| `npm run dev` | Servidor de desarrollo local en modo vista previa. |
| `npm run build:preview` | Valida contenidos, compila la vista previa privada (banda «VISTA PREVIA», `noindex`), inserta CSP y ejecuta las pruebas estáticas. |
| `python3 tests/navegador.py` | Pruebas en navegador real: accesibilidad axe, red, consola/CSP, «Avisar a mi familia», caducidad, modo seguro, sin JavaScript, reflujo y foco. Genera capturas. |
| `npm run build:public` | Compila la versión pública **solo si** se cumplen todos los requisitos (responsable, dominio, revisión jurídica y profesional, datos verificados por dos personas, checklist). |
| `npm run serve` | Sirve `dist/` en `127.0.0.1` para revisarla. |

La vista previa también se puede abrir sin servidor: doble clic en `dist/index.html`.

Para desactivar la telemetría anónima de Astro: `npx astro telemetry disable` (o variable `ASTRO_TELEMETRY_DISABLED=1`).

## Dónde se edita cada cosa

| Contenido | Archivo |
|---|---|
| Responsable legal, dominio, modo operativo, módulos, revisiones | `src/config/site.json` |
| Teléfonos oficiales | `src/data/canales.json` |
| Registro cronológico y fe de erratas | `src/data/actualizaciones.json` |
| Puntos de atención | `src/data/puntos.json` |
| Operadores y recursos de apoyo | `src/data/recursos.json` |
| Preguntas frecuentes | `src/data/preguntas.json` |
| Alertas de estafas | `src/data/estafas.json` |
| Plantillas de «Avisar a mi familia» | `src/data/mensajes.json` |
| Textos en otros idiomas | `src/i18n/esenciales.json` |

Procedimientos paso a paso: `docs/operacion/procedimientos.md`.

## Documentación

- `docs/ARQUITECTURA.md` — decisiones técnicas, comparativa Astro/Next.js y alojamiento, seguridad.
- `docs/operacion/` — procedimientos editoriales, checklist de publicación, cierre del servicio.
- `docs/legal/` — ficha de tratamientos y proveedores, procedimientos (derechos, reclamaciones, incidentes, conservación), riesgos y asuntos pendientes de revisión profesional.
- `docs/funciones-futuras.md` — ampliaciones que NO se implementan ahora.
- `docs/difusion/` — mensajes para redes y medios (pendientes de dominio y teléfono verificado).
- `docs/AUDITORIA.md` — estado del proyecto y resultados reales de las pruebas.
