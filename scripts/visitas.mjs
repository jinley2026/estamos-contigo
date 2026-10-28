// CONTADOR DE VISITAS AGREGADO — DESACTIVADO hasta verificar la configuración (instrucción de Lin, 28/10 12:00).
// Lee estadísticas AGREGADAS del proveedor (Cloudflare, API GraphQL de analítica de zona). No usa cookies, no inserta
// scripts en la web y no guarda IP ni identificadores: solo dos números por día.
//
// Requisitos para activarlo (todos):
//   1. Dominio servido a través de Cloudflare y variables CF_API_TOKEN (solo lectura de analítica) y CF_ZONE_TAG
//      guardadas como secretos de GitHub, nunca en el repositorio.
//   2. Comprobar en la documentación de Cloudflare la definición de «page views» y «uniques» y si filtra bots
//      en el plan gratuito. [NO VERIFICADO: no consta en las páginas consultadas el 28/10/2026.]
//   3. Revisión jurídica del apartado «Estadísticas de audiencia» de la política de privacidad.
//   4. src/config/site.json → visitas.activo = true y visitas.verificadoPor con dos iniciales.
//
// Uso: node scripts/visitas.mjs                     (real; no hace nada si falta algo)
//      node scripts/visitas.mjs --prueba <json>     (PRUEBAS: escribe datos marcados esPrueba=true)
import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const RAIZ = process.env.EC_RAIZ ? pathToFileURL(process.env.EC_RAIZ.replace(/\/?$/, '/')) : new URL('../', import.meta.url);
const ruta = (p) => new URL(p, RAIZ);
const leer = (p) => JSON.parse(readFileSync(ruta(p), 'utf8'));
const escribir = (p, d) => writeFileSync(ruta(p), JSON.stringify(d, null, 2) + '\n');
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null; };

const site = leer('src/config/site.json');
const actual = leer('src/data/visitas.json');

if (arg('--prueba')) {
  const d = JSON.parse(readFileSync(arg('--prueba'), 'utf8'));
  escribir('src/data/visitas.json', { ...actual, ...d, proveedor: 'PRUEBA (datos ficticios)', esPrueba: true });
  console.log('Escritos datos de PRUEBA en src/data/visitas.json (esPrueba=true). No compilar la versión pública con ellos.');
  process.exit(0);
}

const { CF_API_TOKEN, CF_ZONE_TAG } = process.env;
if (!site.visitas?.activo) { console.log('Contador desactivado (site.json → visitas.activo=false). La web muestra «Datos no disponibles».'); process.exit(0); }
if ((site.visitas.verificadoPor ?? []).length < 2) { console.log('Contador sin verificar por dos personas: no se consulta.'); process.exit(0); }
if (!CF_API_TOKEN || !CF_ZONE_TAG) { console.log('Faltan CF_API_TOKEN o CF_ZONE_TAG: no se consulta.'); process.exit(0); }

const desde = site.estadoOperativo.fechaPublicacion || actual.desde;
if (!desde) { console.log('Falta la fecha de publicación (site.json → estadoOperativo.fechaPublicacion).'); process.exit(0); }
const hoy = new Date().toISOString().slice(0, 10);
// Campos según el ejemplo público consultado (httpRequests1dGroups, uniq.uniques). sum.pageViews: [MEMORIA, comprobar].
const query = `query($z:string,$d:Date,$h:Date){viewer{zones(filter:{zoneTag:$z}){httpRequests1dGroups(limit:1000,filter:{date_geq:$d,date_lt:$h}){dimensions{date} sum{pageViews} uniq{uniques}}}}}`;
try {
  const r = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST', headers: { Authorization: `Bearer ${CF_API_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { z: CF_ZONE_TAG, d: desde.slice(0, 10), h: hoy } })
  });
  const j = await r.json();
  if (j.errors?.length) throw new Error(j.errors.map((e) => e.message).join('; '));
  const dias = j.data.viewer.zones[0].httpRequests1dGroups;
  const visitas = dias.reduce((s, x) => s + (x.sum?.pageViews ?? 0), 0);
  escribir('src/data/visitas.json', {
    ...actual, proveedor: 'Cloudflare (analítica agregada de zona)', desde, hasta: hoy, visitas,
    // Los únicos diarios NO se pueden sumar (una persona contaría varias veces): no se publica un total inventado.
    visitantesUnicos: null, notaUnicos: 'El proveedor da visitantes únicos por día; sumarlos falsearía el total.',
    actualizadoEn: new Date().toISOString(), esPrueba: false
  });
  console.log(`Visitas agregadas ${desde} → ${hoy}: ${visitas}.`);
} catch (e) {
  // Si falla, se conserva el último dato real; nunca se estima.
  console.error(`No se pudo obtener la estadística: ${e.message}. Se conserva el último dato.`);
}
