// Pruebas automáticas sobre el sitio compilado (dist/).
// Uso: node scripts/check-dist.mjs [--public]
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const PUBLICO = process.argv.includes('--public');
const dist = new URL('../dist/', import.meta.url);
const canales = JSON.parse(readFileSync(new URL('../src/data/canales.json', import.meta.url), 'utf8')).canales;
const telefonosConocidos = new Set(['112', '024', ...canales.filter((c) => c.telefono).map((c) => c.telefono)]);
const paginas = readdirSync(dist).filter((f) => f.endsWith('.html'));
const resultados = [];
const prueba = (nombre, ok, detalle = '') => resultados.push({ nombre, ok, detalle });

let formularios = [], scriptsExternos = [], enlacesRotos = [], telDesconocidos = [], sinTitulo = [], sinLang = [],
  imgSinAlt = [], estilosExternos = [], pesados = [], marcasPrevia = [], pendientes = [], sinCSP = [], camposTexto = [],
  sinContador = [], comercial = [], datosReservados = [], datosPrueba = [], noConfirmado = [], sinIndependencia = [];

for (const f of paginas) {
  const html = readFileSync(new URL(f, dist), 'utf8');
  if (/<form\b/i.test(html)) formularios.push(f);
  if (!/data-contador-visitas/.test(html) && !['ligera.html', 'cartel.html'].includes(f)) sinContador.push(f);
  if (/xorvium|bizum|paypal|patreon|ko-fi|patrocinad[oa] por|haz (un|tu) donativo|dona aqu[ií]|colabora con \d|adsbygoogle|googletag/i.test(html) || /\bIBAN\b|\bES\d{22}\b/.test(html)) comercial.push(f);
  if (/\b\d{8}[A-HJ-NP-TV-Z]\b|\bNIF: [0-9]/.test(html)) datosReservados.push(f);
  if (/DATOS DE PRUEBA/.test(html)) datosPrueba.push(f);
  if (/No confirmado oficialmente:? (no se publicará|ficha no publicable)|sello-pendiente">No confirmado/.test(html)) noConfirmado.push(f);
  for (const m of html.matchAll(/<input\b[^>]*>/gi)) if (!/type="checkbox"/.test(m[0]) && !/data-busqueda-local/.test(m[0])) camposTexto.push(f);
  if (/<script[^>]*\bsrc=/i.test(html)) scriptsExternos.push(f);
  if (/<link[^>]*rel="stylesheet"[^>]*href="https?:/i.test(html)) estilosExternos.push(f);
  if (!/<title>[^<]+<\/title>/.test(html)) sinTitulo.push(f);
  if (!/<html lang="[a-z]{2}"/.test(html)) sinLang.push(f);
  if (!/http-equiv="Content-Security-Policy"/.test(html)) sinCSP.push(f);
  for (const m of html.matchAll(/<img\b(?![^>]*\balt=)[^>]*>/g)) imgSinAlt.push(f);
  for (const m of html.matchAll(/href="([^"#]+)(#[^"]*)?"/g)) {
    const href = m[1];
    if (/^(https?:|mailto:|sms:)/.test(href)) continue;
    if (href.startsWith('tel:')) { if (!telefonosConocidos.has(href.slice(4))) telDesconocidos.push(`${f} → ${href}`); continue; }
    if (!existsSync(new URL(href, dist))) enlacesRotos.push(`${f} → ${href}`);
  }
  if (gzipSync(html).length > 30 * 1024) pesados.push(f);
  if (/VISTA PREVIA PRIVADA|BORRADOR DE CARTEL/i.test(html)) marcasPrevia.push(f);
  if (/Pendiente de verificación|PENDIENTE DE VERIFICACIÓN|\[PENDIENTE/.test(html)) pendientes.push(f);
}

prueba('Ningún formulario (<form>)', formularios.length === 0, formularios.join(', '));
prueba('Sin campos de entrada salvo casillas y el buscador local (sin envío de datos)', camposTexto.length === 0, camposTexto.join(', '));
prueba('Sin scripts externos', scriptsExternos.length === 0, scriptsExternos.join(', '));
prueba('Sin hojas de estilo externas', estilosExternos.length === 0, estilosExternos.join(', '));
prueba('Todos los enlaces internos existen', enlacesRotos.length === 0, enlacesRotos.join('; '));
prueba('Todos los enlaces tel: corresponden a teléfonos de los datos', telDesconocidos.length === 0, telDesconocidos.join('; '));
prueba('Todas las páginas tienen <title>', sinTitulo.length === 0, sinTitulo.join(', '));
prueba('Todas las páginas declaran idioma', sinLang.length === 0, sinLang.join(', '));
prueba('Todas las páginas llevan CSP', sinCSP.length === 0, sinCSP.join(', '));
prueba('Imágenes con texto alternativo', imgSinAlt.length === 0, imgSinAlt.join(', '));
prueba('Cada página transfiere menos de 30 KB comprimida (gzip)', pesados.length === 0, pesados.join(', '));
prueba('Existe _headers con cabeceras de seguridad', existsSync(new URL('_headers', dist)));
prueba('Contador de visitas en el pie de todas las páginas', sinContador.length === 0, sinContador.join(', '));
prueba('Sin XORVIUM, publicidad, patrocinios ni donaciones económicas', comercial.length === 0, comercial.join(', '));
prueba('Sin NIF ni DNI en el HTML', datosReservados.length === 0, datosReservados.join(', '));
prueba('Portada con el aviso de independencia (texto V3 §6)', readFileSync(new URL('index.html', dist), 'utf8').includes('Estamos Contigo es una iniciativa privada, independiente y gratuita cuya finalidad consiste exclusivamente'));
const robots = existsSync(new URL('robots.txt', dist)) ? readFileSync(new URL('robots.txt', dist), 'utf8') : '';
if (PUBLICO) {
  prueba('Publicación: el panel de administración no existe', !existsSync(new URL('admin.html', dist)));
  prueba('Publicación: sin marcas de vista previa', marcasPrevia.length === 0, marcasPrevia.join(', '));
  prueba('Publicación: sin datos pendientes ni marcadores [PENDIENTE]', pendientes.length === 0, pendientes.join(', '));
  prueba('Publicación: ningún dato «No confirmado oficialmente» publicado', noConfirmado.length === 0, noConfirmado.join(', '));
  prueba('Publicación: sin datos de prueba del contador', datosPrueba.length === 0, datosPrueba.join(', '));
} else {
  prueba('Vista previa: robots.txt bloquea indexación', /Disallow: \//.test(robots));
  prueba('Vista previa: banda «VISTA PREVIA PRIVADA» presente', marcasPrevia.length >= paginas.length - 1);
}

let fallos = 0;
for (const r of resultados) {
  console.log(`${r.ok ? 'OK   ' : 'FALLO'} ${r.nombre}${!r.ok && r.detalle ? ` — ${r.detalle}` : ''}`);
  if (!r.ok) fallos++;
}
console.log(`\n${paginas.length} páginas comprobadas. ${resultados.length - fallos}/${resultados.length} pruebas superadas.`);
if (!PUBLICO && pendientes.length) console.log(`(Vista previa) ${pendientes.length} páginas contienen datos pendientes, como se espera hasta la verificación humana.`);
process.exit(fallos ? 1 : 0);
