// REVISIÓN EDITORIAL: aprobar o rechazar propuestas de la cola y verificar datos existentes.
// Ninguna cifra ni noticia aparece como aprobada sin pasar por aquí con las iniciales de las personas que la han revisado.
//
//   Listar pendientes:        node scripts/aprobar.mjs --lista
//   Aprobar una noticia:      node scripts/aprobar.mjs <id> --por AB,CD --titulo "…" --resumen "…" [--operativa]
//                             (el resumen lo escribe la persona: no se copian textos de prensa)
//   Aprobar una cifra:        node scripts/aprobar.mjs <id> --por AB,CD [--fecha-comunicado ISO] [--definitivo]
//   Rechazar:                 node scripts/aprobar.mjs <id> --rechazar "motivo" --por AB
//   Verificar dato existente: node scripts/aprobar.mjs --verificar <archivo:id> --por AB,CD
//                             archivo = canales | puntos | actualizaciones | afirmaciones | trenes | ultimahora
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { cargarDominios, esUrlOficial, origenOficial } from './lib/oficial.mjs';

const RAIZ = process.env.EC_RAIZ ? pathToFileURL(process.env.EC_RAIZ.replace(/\/?$/, '/')) : new URL('../', import.meta.url);
const ruta = (p) => new URL(p, RAIZ);
const leer = (p) => JSON.parse(readFileSync(ruta(p), 'utf8'));
const escribir = (p, d) => writeFileSync(ruta(p), JSON.stringify(d, null, 2) + '\n');
const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(n); return i > -1 ? args[i + 1] : null; };
const flag = (n) => args.includes(n);
const ahora = opt('--ahora') || new Date().toISOString();
const fallar = (m) => { console.error(`ERROR: ${m}`); process.exit(1); };
const por = (opt('--por') || '').split(',').map((s) => s.trim()).filter(Boolean);

const DOMINIOS = cargarDominios(RAIZ);
const cola = existsSync(ruta('cola/propuestas.json')) ? leer('cola/propuestas.json') : { propuestas: [] };

// Reanudar el ciclo automático tras una suspensión (dos personas).
if (flag('--reanudar') || flag('--suspender')) {
  if (por.length < 2 || new Set(por).size < 2) fallar('Requiere las iniciales de dos personas distintas (--por AB,CD).');
  const site = leer('src/config/site.json');
  site.automatizacion = flag('--suspender')
    ? { ...(site.automatizacion ?? {}), suspendida: true, motivo: opt('--suspender') || 'suspensión manual', desde: ahora }
    : { ...(site.automatizacion ?? {}), suspendida: false, motivo: '', desde: '', reanudadaPor: por, reanudadaEn: ahora };
  escribir('src/config/site.json', site);
  const est = leer('src/data/estado-sistema.json');
  if (flag('--reanudar')) { delete est.suspendido; est.ciclosFallidosSeguidos = 0; } else est.suspendido = { motivo: site.automatizacion.motivo, desde: ahora };
  escribir('src/data/estado-sistema.json', est);
  console.log(flag('--reanudar') ? `Ciclo reanudado por ${por.join(' y ')}.` : `Ciclo suspendido: ${site.automatizacion.motivo}.`);
  process.exit(0);
}

if (flag('--lista')) {
  const p = cola.propuestas.filter((x) => x.estado === 'pendiente');
  if (!p.length) console.log('No hay propuestas pendientes.');
  for (const x of p) console.log(`${x.id}  [${x.tipo}${x.contradiccion ? ', CONTRADICCIÓN' : ''}] ${x.fuente.nombre}: ${x.titulo ?? `${x.cifra.tipo} = ${x.cifra.valor} (${x.cifra.calificador})`}\n    ${x.enlace ?? x.fuente.url}${x.contradiccion ? `\n    Discrepa de: ${x.contradiccion.detalle}` : ''}`);
  process.exit(0);
}

if (flag('--verificar')) {
  const [archivo, id] = (opt('--verificar') || '').split(':');
  if (por.length < 2 || new Set(por).size < 2) fallar('La verificación requiere las iniciales de dos personas distintas (--por AB,CD).');
  const mapa = { canales: ['src/data/canales.json', 'canales'], puntos: ['src/data/puntos.json', 'puntos'], actualizaciones: ['src/data/actualizaciones.json', 'entradas'], afirmaciones: ['src/data/afirmaciones.json', 'afirmaciones'], trenes: ['src/data/trenes.json', 'trenes'] };
  if (archivo === 'ultimahora') {
    const d = leer('src/data/ultimahora.json');
    if (!d[id]) fallar(`No existe el bloque ${id}`);
    const items = [d[id], ...(d[id].lista ?? [])].filter((x) => x.fuente);
    const malos = items.filter((x) => !origenOficial(x, DOMINIOS) || x.nivelFuente === 2);
    if (malos.length) fallar(`El bloque ${id} tiene ${malos.length} elemento(s) sin comunicado oficial directo. Sustitúyelos o elimínalos antes de verificar.`);
    d[id].verificadoPor = por; d[id].comprobadoEn = ahora;
    escribir('src/data/ultimahora.json', d);
  } else {
    if (!mapa[archivo]) fallar(`Archivo desconocido: ${archivo}`);
    const [p, clave] = mapa[archivo];
    const d = leer(p);
    const x = d[clave].find((e) => e.id === id);
    if (!x) fallar(`No existe ${id} en ${archivo}`);
    // V3 §1: no se puede verificar (y por tanto publicar) un dato sin enlace directo a un dominio oficial.
    if (!origenOficial(x, DOMINIOS)) fallar(`${archivo}:${id} no tiene ningún enlace a un dominio oficial. Localiza el comunicado original y añádelo a sus fuentes antes de verificarlo.`);
    if (x.nivelFuente === 2) fallar(`${archivo}:${id} es de nivel 2 (un medio que cita). Sustituye la fuente por el comunicado oficial y pon nivelFuente 1.`);
    x.verificadoPor = por;
    if ('comprobadoEn' in x) x.comprobadoEn = ahora;
    if ('fechaVerificacion' in x) x.fechaVerificacion = ahora;
    if (archivo === 'actualizaciones' && !x.publicadoEn) x.publicadoEn = ahora;
    if (archivo === 'afirmaciones') x.estadoEditorial = 'aprobado';
    escribir(p, d);
  }
  console.log(`Verificado ${archivo}:${id} por ${por.join(' y ')}.`);
  process.exit(0);
}

const id = args[0];
const prop = cola.propuestas.find((x) => x.id === id);
if (!prop) fallar(`No existe la propuesta ${id}. Usa --lista.`);
if (prop.estado !== 'pendiente') fallar(`La propuesta ya está ${prop.estado}.`);

if (flag('--rechazar')) {
  if (!por.length) fallar('Indica quién rechaza (--por AB).');
  prop.estado = 'rechazada'; prop.motivoRechazo = opt('--rechazar'); prop.revisadoPor = por; prop.revisadaEn = ahora;
  escribir('cola/propuestas.json', cola);
  console.log(`Rechazada ${id}: ${prop.motivoRechazo}`);
  process.exit(0);
}

if (por.length < 2 || new Set(por).size < 2) fallar('Aprobar requiere las iniciales de dos personas distintas (--por AB,CD).');
const enlaceProp = prop.enlace ?? prop.fuente?.url;
if (!esUrlOficial(enlaceProp, DOMINIOS)) fallar(`La propuesta ${id} no enlaza a un dominio oficial (${enlaceProp}). Rechazada por la regla de solo fuentes oficiales.`);

if (prop.tipo === 'noticia') {
  const titulo = opt('--titulo'), resumen = opt('--resumen');
  if (!titulo || !resumen) fallar('Para aprobar una noticia escribe un --titulo y un --resumen propios (no se copia el texto de la fuente).');
  const act = leer('src/data/actualizaciones.json');
  act.entradas.unshift({
    id: `aprobada-${id}`, titulo, resumen,
    organismo: prop.fuente.organismo, categoria: prop.fuente.categoria,
    tipoFuente: 'comunicado-oficial', fuente: { titulo: prop.fuente.nombre, url: prop.enlace },
    nivelFuente: 1, fechaComunicado: opt('--fecha-comunicado') || prop.creada, comprobadoEn: ahora,
    revisarCadaMinutos: 120, estado: 'vigente', operativa: flag('--operativa'), alerta: flag('--alerta'), correccion: null, verificadoPor: por, publicadoEn: ahora, historial: []
  });
  escribir('src/data/actualizaciones.json', act);
} else if (prop.tipo === 'cifra') {
  const af = leer('src/data/afirmaciones.json');
  const anterior = af.afirmaciones
    .filter((a) => a.tipo === prop.cifra.tipo && a.ambito === prop.cifra.ambito && a.organismo === prop.fuente.organismo)
    .sort((x, y) => y.fechaComunicado.localeCompare(x.fechaComunicado))[0];
  af.afirmaciones.push({
    id: `${prop.cifra.tipo}-${prop.fuente.id}-${ahora.slice(0, 16).replace(/\D/g, '')}`,
    tipo: prop.cifra.tipo, valor: prop.cifra.valor, calificador: prop.cifra.calificador, unidad: 'personas', ambito: prop.cifra.ambito,
    organismo: prop.fuente.organismo,
    fuente: { titulo: prop.fuente.nombre, url: prop.enlace ?? prop.fuente.url, tipoFuente: 'comunicado-oficial' },
    fechaComunicado: opt('--fecha-comunicado') || prop.creada, fechaVerificacion: ahora,
    estadoEditorial: 'aprobado', estadoDato: flag('--definitivo') ? 'definitivo' : 'provisional',
    versionAnterior: anterior ? anterior.id : null,
    observaciones: prop.contradiccion ? `Aprobada con discrepancia conocida: ${prop.contradiccion.detalle}` : '',
    verificadoPor: por
  });
  escribir('src/data/afirmaciones.json', af);
}
prop.estado = 'aprobada'; prop.revisadoPor = por; prop.revisadaEn = ahora;
escribir('cola/propuestas.json', cola);
// La aprobación cuenta como revisión editorial de la web
const site = leer('src/config/site.json');
site.estadoOperativo.ultimaRevisionEditorial = ahora;
site.estadoOperativo.ultimaAprobacion = ahora;
escribir('src/config/site.json', site);
console.log(`Aprobada ${id} por ${por.join(' y ')}. Recompila para publicarla.`);
