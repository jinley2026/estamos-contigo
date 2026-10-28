# Arquitectura técnica

## Decisión: sitio estático con Astro

| Criterio | Astro (estático) | Next.js (exportación estática) |
|---|---|---|
| Simplicidad | Páginas `.astro` que generan HTML; sin JavaScript en el cliente salvo el que se escribe a propósito | Basado en React; la exportación estática envía el entorno de React al navegador por defecto |
| Velocidad y datos | ~21 KB por página (CSS en línea, sin librerías) | Más pesado por el JavaScript de React y la hidratación |
| Funcionar sin JavaScript | Nativo | Posible, pero hay que evitar componentes de cliente |
| Accesibilidad | HTML semántico controlado | Equivalente, con más capas |
| Seguridad | Superficie mínima: HTML estático + un único script propio con hash CSP | Más dependencias y scripts que autorizar en la CSP |
| Mantenimiento | Contenido en JSON editable por personas no técnicas; una sola dependencia de ejecución | Más dependencias que mantener actualizadas |
| Coste | Cualquier alojamiento estático | Igual |

Se elige **Astro 7.4.2** con TypeScript. Next.js aportaría ventajas si hiciera falta lógica de servidor, que en esta fase está expresamente excluida.

## Estructura

```
src/config/site.json       configuración: responsable, dominio, modo, módulos, revisiones
src/data/*.json            contenidos estructurados con fuente, nivel, fecha de comprobación y plazo de revisión
src/i18n/esenciales.json   textos esenciales en en, fr, pt, it, de (preliminares)
src/components/            plantilla, estilos, script de mejora progresiva, tarjeta de teléfono, mensaje a la familia
src/pages/                 26 páginas planas (.html), con enlaces relativos
scripts/                   validación de contenidos, bloqueo de publicación, CSP, pruebas estáticas
tests/navegador.py         pruebas en Chromium real
```

Las páginas se generan planas (`busco-a-un-familiar.html`) con enlaces relativos, de modo que la misma compilación funciona en el alojamiento y abriendo los archivos desde el disco.

## Reglas de publicación implementadas en código

- **Dos modos de compilación.** `preview` muestra los datos pendientes en ámbar, con banda «VISTA PREVIA PRIVADA», `noindex` y `robots.txt` que bloquea todo. `public` solo muestra datos de nivel 1-2 verificados por dos personas.
- **Bloqueo de publicación** (`scripts/publish-gate.mjs`): sin responsable completo, dominio, revisiones jurídicas y profesionales marcadas y checklist completa, `npm run build:public` termina con error.
- **Caducidad en el navegador**: cada dato lleva `data-comprobado` y `data-revisar`. Al vencer el plazo, se marca «pendiente de revisión» y, si es un teléfono, se oculta el botón de llamada. Sin JavaScript se sigue viendo la hora de comprobación.
- **Modo seguro automático**: si `ultimaRevisionEditorial` supera `horasMaximasSinRevision` (4 h), aparece un aviso y se ocultan los bloques que se presentan como información al día.
- **Modos manuales**: `reducido` (solo directorio de fuentes oficiales) y `cerrado` (fin de actualizaciones, se ocultan los datos temporales).

## Seguridad

- Sin formularios, sin campos de texto enviables, sin peticiones de red desde el navegador (`connect-src 'none'`).
- CSP estricta con hashes SHA-256 de cada `<script>` y `<style>` en línea, generada en cada compilación (`scripts/postbuild.mjs`), tanto en `<meta>` como en `dist/_headers`.
- Cabeceras: HSTS, `X-Content-Type-Options`, `X-Frame-Options: DENY` y `frame-ancestors 'none'`, `Referrer-Policy: no-referrer`, `Permissions-Policy` restrictiva y COOP.
- Sin secretos en el repositorio: el proyecto no necesita ninguno.
- Enlaces externos con `rel="noopener noreferrer"`.
- Dependencias: `npm install` informó de 0 vulnerabilidades conocidas el 28/10/2026.

## Alojamiento

Recomendado: **Cloudflare Pages** (lee `_headers` de forma nativa). Alternativas: Netlify (mismo formato `_headers`), GitHub Pages (no admite cabeceras propias: solo se aplicaría la CSP en `<meta>`) o Vercel (hay que trasladar las cabeceras a `vercel.json`).

Condiciones comprobadas el 28/10/2026 en las páginas oficiales:

- **Cloudflare Pages, plan gratuito** ([límites](https://developers.cloudflare.com/pages/platform/limits)): 500 compilaciones al mes, 20.000 archivos por sitio, 25 MiB por archivo y 100 dominios por proyecto. Esa página **no** indica límite de ancho de banda ni de peticiones a archivos estáticos; hay que confirmarlo en las condiciones del servicio antes de publicar.
- **Vercel, plan Hobby** ([guía de uso razonable](https://vercel.com/docs/limits/fair-use-guidelines)): orientativamente incluye los primeros 100 GB de transferencia al mes y está restringido a uso personal no comercial. Pedir donativos no cuenta como uso comercial. Hay que confirmar con Vercel si una iniciativa solidaria de este tipo encaja.

Ninguna de las dos páginas garantiza capacidad ante un pico de tráfico de emergencia. Estimación propia, no comprobada con prueba de carga: 100.000 visitas de unos 3 páginas ≈ 6-7 GB transferidos, muy por debajo de esos umbrales.

Antes de publicar hay que revisar qué registros técnicos (IP, logs) guarda el proveedor elegido, durante cuánto tiempo y en qué país, y reflejarlo en la política de privacidad y en `docs/legal/ficha-tratamientos-proveedores.md`.

## Despliegue (cuando se autorice)

1. Completar los requisitos y ejecutar `npm run build:public`.
2. Crear un repositorio **privado** con protección de la rama principal y revisión obligatoria.
3. Conectar el repositorio al alojamiento con la orden `npm run build:public` y la carpeta de salida `dist`.
4. Configurar el dominio, HTTPS y los registros SPF/DMARC que impidan enviar correo suplantándolo.
5. Activar un comprobador externo de disponibilidad.
6. Reversión: volver a desplegar la compilación anterior desde el panel del alojamiento, o hacer `git revert` y redesplegar.
