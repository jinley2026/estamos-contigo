// Validación de contenidos antes de compilar.
// Uso: node scripts/check-content.mjs [--public]
// En modo --public, cualquier dato visible no verificado es un error que bloquea la publicación.
import { readFileSync } from 'node:fs';
import { cargarDominios, esUrlOficial, origenOficial } from './lib/oficial.mjs';

const leer = (p) => JSON.parse(readFileSync(new URL(`../src/${p}`, import.meta.url), 'utf8'));
const PUBLICO = process.argv.includes('--public');
const errores = [];
const avisos = [];
const err = (m) => errores.push(m);
const avi = (m) => (PUBLICO ? errores : avisos).push(m);

const esISO = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?([+-]\d{2}:\d{2}|Z)$/.test(s) && !isNaN(Date.parse(s));
const esURL = (s) => { try { return new URL(s).protocol === 'https:'; } catch { return false; } };
const verif = (x) => ((x.verificadoPor ?? x.validadoPor) ?? []).length >= 2;

// Palabras que delatan datos de personas o cifras de víctimas: deben revisarse a mano si aparecen.
const PATRONES_PELIGROSOS = [
  /\b\d{8}[A-HJ-NP-TV-Z]\b/i,                 // DNI
  /\b[XYZ]\d{7}[A-Z]\b/i,                       // NIE
  /\b(fallecid[oa]s?|muert[oa]s?|herid[oa]s?)\b.*\b\d+\b|\b\d+\b.*\b(fallecid[oa]s?|muert[oa]s?|herid[oa]s?)\b/i // cifras de víctimas
];

const canales = leer('data/canales.json').canales;
for (const c of canales) {
  const id = `canal ${c.id}`;
  if (c.telefono) {
    if (!/^\d{3,12}$/.test(c.telefono)) err(`${id}: teléfono con formato no válido`);
    if (c.telefonoVisible.replace(/\s/g, '') !== c.telefono) err(`${id}: telefonoVisible no coincide con telefono`);
    if (!c.fuentes?.length) err(`${id}: teléfono sin fuente`);
    if (![1, 2].includes(c.nivelFuente)) err(`${id}: nivel de fuente ${c.nivelFuente} no publicable`);
    if (!verif(c)) avi(`${id}: teléfono sin verificar por dos personas (verificadoPor)`);
  }
  for (const f of c.fuentes ?? []) if (!esURL(f.url)) err(`${id}: URL de fuente no válida (${f.url})`);
  if (!esISO(c.comprobadoEn)) err(`${id}: comprobadoEn no es fecha ISO con zona`);
  if (!(c.revisarCadaMinutos > 0)) err(`${id}: falta revisarCadaMinutos`);
}

const act = leer('data/actualizaciones.json').entradas;
const ids = new Set();
for (const e of act) {
  const id = `actualización ${e.id}`;
  if (ids.has(e.id)) err(`${id}: id duplicado`);
  ids.add(e.id);
  for (const k of ['titulo', 'resumen']) if (!e[k]) err(`${id}: falta ${k}`);
  if (!esURL(e.fuente?.url)) err(`${id}: sin fuente o URL no válida`);
  if (![1, 2].includes(e.nivelFuente)) err(`${id}: nivel ${e.nivelFuente} no publicable (solo 1 y 2)`);
  if (!esISO(e.fechaComunicado) || !esISO(e.comprobadoEn)) err(`${id}: fechas no ISO`);
  if (!['vigente', 'pendiente', 'corregido', 'retirado'].includes(e.estado)) err(`${id}: estado no válido`);
  if (['corregido', 'retirado'].includes(e.estado) && !e.correccion) err(`${id}: estado ${e.estado} sin texto de corrección`);
  for (const p of PATRONES_PELIGROSOS) if (p.test(`${e.titulo} ${e.resumen}`)) err(`${id}: posible dato personal o cifra de víctimas — revisar`);
}

for (const p of leer('data/puntos.json').puntos) {
  const id = `punto ${p.id}`;
  if (!esURL(p.fuente?.url)) err(`${id}: sin fuente`);
  if (![1, 2].includes(p.nivelFuente)) err(`${id}: nivel no publicable`);
  if (!esISO(p.comprobadoEn)) err(`${id}: comprobadoEn no ISO`);
  if (!verif(p)) avi(`${id}: punto sin verificar por dos personas`);
}

for (const r of leer('data/recursos.json').apoyoEmocional) if (!verif(r)) avi(`recurso de apoyo ${r.id}: sin validar por dos personas`);

for (const cat of leer('data/preguntas.json').categorias)
  for (const q of cat.preguntas) {
    if (!q.p || !q.r) err(`FAQ ${cat.id}: pregunta o respuesta vacía`);
    if (q.fuente && !esURL(q.fuente.url)) err(`FAQ ${cat.id}: fuente no válida`);
    for (const p of PATRONES_PELIGROSOS) if (p.test(q.r)) err(`FAQ ${cat.id}: posible dato personal o cifra — revisar`);
  }

const uh = leer('data/ultimahora.json');
if (!esISO(uh.actualizadoEn)) err('última hora: actualizadoEn no ISO');
for (const k of ['hospitales', 'avisos', 'linea']) {
  const b = uh[k];
  if (!esISO(b.comprobadoEn) || !(b.revisarCadaMinutos > 0)) err(`última hora ${k}: falta comprobadoEn o revisarCadaMinutos`);
  if (!verif(b)) avi(`última hora ${k}: sin verificar por dos personas`);
  const items = [...(b.datos ?? []), ...(b.lista ?? []), ...(b.fuente ? [b] : [])];
  for (const it of items) {
    if (it.valor === '' || it.nivelFuente === 0) continue;
    if (![1, 2].includes(it.nivelFuente)) err(`última hora ${k}: dato con nivel ${it.nivelFuente} no publicable`);
    if (!esURL(it.fuente?.url)) err(`última hora ${k}: dato sin fuente válida`);
  }
  const txt = JSON.stringify(b);
  if (/\b\d{8}[A-HJ-NP-TV-Z]\b/i.test(txt)) err(`última hora ${k}: posible DNI`);
}

const af = leer('data/afirmaciones.json');
const idsAf = new Set();
for (const a of af.afirmaciones) {
  const id = `afirmación ${a.id}`;
  if (idsAf.has(a.id)) err(`${id}: id duplicado`);
  idsAf.add(a.id);
  if (!af.tipos[a.tipo]) err(`${id}: tipo desconocido ${a.tipo}`);
  if (!Number.isFinite(a.valor) || a.valor < 0) err(`${id}: valor no numérico`);
  if (!['exacto', 'al menos', 'aproximadamente'].includes(a.calificador)) err(`${id}: calificador no válido`);
  if (!esURL(a.fuente?.url) || !['comunicado-oficial', 'medio-citando'].includes(a.fuente?.tipoFuente)) err(`${id}: fuente no válida`);
  if (!esISO(a.fechaComunicado) || !esISO(a.fechaVerificacion)) err(`${id}: fechas no ISO`);
  if (!['aprobado', 'pendiente', 'rechazado'].includes(a.estadoEditorial)) err(`${id}: estado editorial no válido`);
  if (a.estadoEditorial === 'aprobado' && !verif(a)) err(`${id}: aprobada sin dos verificadores`);
  if (a.estadoEditorial !== 'aprobado') avi(`${id}: pendiente de aprobación`);
  if (a.versionAnterior && !af.afirmaciones.some((b) => b.id === a.versionAnterior)) err(`${id}: versionAnterior inexistente`);
}
const tr = leer('data/trenes.json');
for (const t of tr.trenes) {
  if (!esURL(t.fuente?.url)) err(`tren ${t.id}: sin fuente`);
  if (!verif(t)) avi(`tren ${t.id}: sin verificar`);
}
for (const e of act) {
  if (!e.categoria || !e.tipoFuente) err(`actualización ${e.id}: falta categoria o tipoFuente`);
  if (!verif(e)) avi(`actualización ${e.id}: sin verificar por dos personas`);
}

const m = leer('data/mensajes.json');
for (const lang of ['es', 'en', 'fr', 'pt', 'it', 'de']) {
  if (m.plantillas[lang]?.length !== 4) err(`mensajes: faltan plantillas en ${lang}`);
  if (!m.menciones[lang]) err(`mensajes: falta mención en ${lang}`);
}
const t = leer('i18n/esenciales.json');
const claves = Object.keys(t.textos.en);
for (const lang of ['fr', 'pt', 'it', 'de']) for (const k of claves) if (!t.textos[lang][k]) err(`i18n ${lang}: falta ${k}`);
for (const [lang, v] of Object.entries(t.idiomas)) if (!v.revisado) avi(`traducción ${lang}: pendiente de revisión humana`);

// ---------- V3 §1: rechazo automático de lo que no tiene origen oficial comprobable ----------
const DOMINIOS = cargarDominios(new URL('../', import.meta.url));
const sinOrigen = [];
const revisa = (grupo, x) => {
  const oficial = origenOficial(x, DOMINIOS) && x.nivelFuente !== 2;
  if (!oficial) {
    sinOrigen.push(`${grupo} ${x.id ?? ''}`.trim());
    // Un dato verificado por dos personas se publicaría: sin origen oficial es SIEMPRE un error.
    // Decisión de Lin (28/10, 12:47): la prensa se admite con atribución; sin ninguna fuente enlazada, se rechaza.
    if (verif(x) && !(x.fuente?.url || x.fuentes?.length)) err(`${grupo} ${x.id ?? ''}: verificado sin fuente enlazada — se rechaza`);
  }
};
for (const c of canales.filter((c) => c.telefono)) revisa('canal', c);
for (const e of act.filter((e) => e.estado !== 'retirado')) revisa('actualización', e);
for (const p of leer('data/puntos.json').puntos) revisa('punto', p);
for (const t of tr.trenes) revisa('tren', t);
for (const a of af.afirmaciones) if (a.estadoEditorial === 'aprobado' && (!a.organismo || !esURL(a.fuente?.url))) err(`afirmación ${a.id}: aprobada sin organismo atribuido o sin enlace — se rechaza`);
for (const k of ['hospitales', 'avisos', 'linea']) {
  const b = uh[k];
  for (const it of [...(b.lista ?? []), ...(b.fuente ? [b] : [])]) if (!esUrlOficial(it.fuente?.url, DOMINIOS) || it.nivelFuente === 2) { sinOrigen.push(`última hora ${k}`); break; }
}
if (sinOrigen.length) avisos.push(`Procedente de medios, con atribución (se publica citando organismo y medio): ${[...new Set(sinOrigen)].join(', ')}`);

// Contador de visitas: nunca datos de prueba en la publicación
const vis = leer('data/visitas.json');
if (PUBLICO && vis.esPrueba) err('visitas.json contiene DATOS DE PRUEBA');
if (vis.visitas !== null && (!Number.isInteger(vis.visitas) || vis.visitas < 0)) err('visitas.json: valor no válido');

const site = leer('config/site.json');
if (/\d{8}[A-HJ-NP-TV-Z]/i.test(site.responsable.nif + site.responsable.domicilio) || site.responsable.nif || site.responsable.domicilio) err('site.json: el NIF y el domicilio NO se guardan en el repositorio (usar EC_NIF / EC_DOMICILIO en el despliegue privado)');
if (/xorvium/i.test(JSON.stringify(site))) err('site.json: no se vincula la plataforma a XORVIUM');
if (!esISO(site.estadoOperativo.ultimaRevisionEditorial)) err('site: ultimaRevisionEditorial no ISO');
if (!['normal', 'reducido', 'cerrado'].includes(site.estadoOperativo.modo)) err('site: modo no válido');

for (const a of avisos) console.log(`AVISO  ${a}`);
for (const e of errores) console.log(`ERROR  ${e}`);
console.log(`Contenidos: ${errores.length} errores, ${avisos.length} avisos${PUBLICO ? ' (modo publicación)' : ' (modo vista previa)'}.`);
process.exit(errores.length ? 1 : 0);
