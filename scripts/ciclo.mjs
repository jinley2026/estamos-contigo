// CICLO AUTOMÁTICO DE INFORMACIÓN (cada 30 minutos en .github/workflows/ciclo.yml).
// Consulta las fuentes oficiales configuradas, detecta comunicados nuevos y cifras cambiadas,
// marca contradicciones y posibles datos personales, y deja PROPUESTAS en cola/propuestas.json.
// No publica cifras ni noticias: eso lo hace una persona con scripts/aprobar.mjs.
// La única excepción (categoría A) está desactivada por defecto en src/config/fuentes.json.
//
// Uso: node scripts/ciclo.mjs [--fixtures <carpeta>] [--ahora <ISO>]
//   --fixtures: lee <carpeta>/<id-fuente>.html en lugar de internet (pruebas). Si falta el archivo, simula un fallo.
//   EC_RAIZ: carpeta raíz alternativa del proyecto (pruebas sobre una copia).
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { createHash } from 'node:crypto';

const RAIZ = process.env.EC_RAIZ ? pathToFileURL(process.env.EC_RAIZ.replace(/\/?$/, '/')) : new URL('../', import.meta.url);
const arg = (n) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null; };
const FIXTURES = arg('--fixtures');
const AHORA = arg('--ahora') || new Date().toISOString();

const ruta = (p) => new URL(p, RAIZ);
const leer = (p, def) => (existsSync(ruta(p)) ? JSON.parse(readFileSync(ruta(p), 'utf8')) : def);
const escribir = (p, d) => { mkdirSync(new URL('.', ruta(p)), { recursive: true }); writeFileSync(ruta(p), JSON.stringify(d, null, 2) + '\n'); };

const cfg = leer('src/config/fuentes.json');
const estadoSistema = leer('src/data/estado-sistema.json', { fuentes: {}, ciclos: [] });
const estadoFuentes = leer('cola/estado-fuentes.json', {});
const cola = leer('cola/propuestas.json', { propuestas: [] });
const afirmaciones = leer('src/data/afirmaciones.json').afirmaciones;
const actualizaciones = leer('src/data/actualizaciones.json').entradas;

// ---------- utilidades de texto ----------
export const normalizar = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ ]+/g, ' ').replace(/\s+/g, ' ').trim();
const VACIAS = new Set('el la los las de del y en a por con un una al para que se su sus o e lo es ha han tras'.split(' '));
const tokens = (s) => new Set(normalizar(s).split(' ').filter((t) => t.length > 2 && !VACIAS.has(t)));
export const parecido = (a, b) => {
  const A = tokens(a), B = tokens(b);
  if (!A.size || !B.size) return 0;
  let c = 0; for (const t of A) if (B.has(t)) c++;
  return c / (A.size + B.size - c);
};
const decodificar = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
const textoPlano = (html) => decodificar(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();

function enlaces(html, base) {
  const out = [];
  for (const m of html.matchAll(/<item\b[\s\S]*?<title>([\s\S]*?)<\/title>[\s\S]*?<link>([\s\S]*?)<\/link>[\s\S]*?<\/item>/gi))
    out.push({ titulo: textoPlano(m[1].replace(/<!\[CDATA\[|\]\]>/g, '')), href: m[2].trim() });
  for (const m of html.matchAll(/<a\b[^>]*href="([^"#]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const titulo = textoPlano(m[2]);
    if (titulo.length < 15) continue;
    try { out.push({ titulo, href: new URL(decodificar(m[1]), base).href }); } catch {}
  }
  return out;
}

// ---------- filtro de datos personales ----------
// Rechaza (categoría C) cualquier texto que pueda identificar a personas afectadas. No guarda el texto rechazado.
const NO_NOMBRES = new Set(normalizar('Urda Yebenes Los Mora Orgaz Toledo Madrid Sevilla Cordoba Ciudad Real Castilla La Mancha Mancha Centro Alcazar San Juan Consuegra Atocha Almudena Grandes Santa Justa Julio Anguita Junta Gobierno Renfe Iryo Adif Guardia Civil Proteccion Civil Cruz Roja Sescam Platecam Ministerio Transportes Comunidad Andalucia Espana Moncloa Emergencias Hospital Universitario Puerta Esther Padilla Oscar Puente Emiliano Garcia Page Pedro Sanchez Lunes Martes Miercoles Jueves Viernes Sabado Domingo Octubre AVE UME SUMMA').split(' '));
const PALABRAS_VICTIMA = /(fallecid|muert|victima|herid|identificad|ingresad|desaparecid|pasajer|viajer)/;
export function datosPersonales(texto) {
  if (/\b\d{8}[A-HJ-NP-TV-Z]\b|\b[XYZ]\d{7}[A-Z]\b/i.test(texto)) return 'posible documento de identidad';
  const candidatos = [...texto.matchAll(/\b([A-ZÁÉÍÓÚÑ][a-záéíóúñ]+(?:\s+(?:de\s+|del\s+)?[A-ZÁÉÍÓÚÑ][a-záéíóúñ]+){1,3})\b/g)];
  for (const c of candidatos) {
    const palabras = normalizar(c[1]).split(' ').filter((w) => w !== 'de' && w !== 'del');
    if (palabras.every((w) => NO_NOMBRES.has(w))) continue;
    const entorno = normalizar(texto.slice(Math.max(0, c.index - 80), c.index + c[1].length + 80));
    if (PALABRAS_VICTIMA.test(entorno)) return 'posible identificación de una persona afectada';
  }
  return null;
}

// ---------- extracción de cifras ----------
const TIPO = { fallecidos: 'fallecidos', fallecidas: 'fallecidos', muertos: 'fallecidos', muertas: 'fallecidos', 'victimas mortales': 'fallecidos', heridos: 'heridos', heridas: 'heridos', hospitalizados: 'hospitalizados', hospitalizadas: 'hospitalizados', ingresados: 'hospitalizados', altas: 'altas', pasajeros: 'pasajeros', viajeros: 'pasajeros', atendidos: 'atendidos', atendidas: 'atendidos' };
export function extraerCifras(texto) {
  const t = normalizar(texto);
  const out = [];
  const re = /(al menos|unos|unas|mas de|cerca de)?\s*\b(\d{1,4})\s+(?:personas\s+)?(fallecidos|fallecidas|muertos|muertas|victimas mortales|heridos|heridas|hospitalizados|hospitalizadas|ingresados|altas|pasajeros|viajeros|atendidos|atendidas)\b/g;
  for (const m of t.matchAll(re)) {
    const calificador = m[1] === 'al menos' || m[1] === 'mas de' ? 'al menos' : m[1] ? 'aproximadamente' : 'exacto';
    out.push({ tipo: TIPO[m[3]], valor: Number(m[2]), calificador, contexto: t.slice(Math.max(0, m.index - 90), m.index + m[0].length + 60) });
  }
  return out;
}

// ---------- obtención ----------
async function obtener(f) {
  if (FIXTURES) {
    const p = join(FIXTURES, `${f.id}.html`);
    if (!existsSync(p)) throw new Error('fallo simulado (sin respuesta)');
    return readFileSync(p, 'utf8');
  }
  const r = await fetch(f.url, { headers: { 'User-Agent': 'EstamosContigo/2.0 (revision editorial; contacto en el aviso legal)' }, signal: AbortSignal.timeout(20000) });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return await r.text();
}

// ---------- ciclo ----------
const suceso = (cfg.palabrasSuceso ?? cfg.palabrasClave).map(normalizar);
const relevante = (s) => { const n = normalizar(s); return suceso.some((k) => n.includes(k)); };
const resumen = { inicio: AHORA, fuentesOk: 0, fuentesError: 0, nuevas: 0, duplicadas: 0, cifras: 0, contradicciones: 0, rechazadas: 0, automaticas: 0 };
const nuevasProp = [];
const cifrasCiclo = [];
const idProp = (s) => 'p-' + AHORA.slice(0, 16).replace(/\D/g, '') + '-' + createHash('sha1').update(s).digest('hex').slice(0, 8);

const latestAprobada = (tipo, ambito = 'global') =>
  afirmaciones.filter((a) => a.tipo === tipo && a.ambito === ambito && a.estadoEditorial === 'aprobado').sort((x, y) => y.fechaComunicado.localeCompare(x.fechaComunicado))[0];

for (const f of cfg.fuentes) {
  if (f.accesoAutomatico !== 'permitido' || !f.url) {
    estadoSistema.fuentes[f.id] = { nombre: f.nombre, ok: null, motivo: f.accesoAutomatico === 'bloqueado' ? 'bloquea el acceso automatizado: entrada manual' : 'sin dirección verificada: entrada manual', hora: AHORA };
    continue;
  }
  let html;
  try {
    html = await obtener(f);
  } catch (e) {
    resumen.fuentesError++;
    estadoSistema.fuentes[f.id] = { nombre: f.nombre, ok: false, motivo: e.message, hora: AHORA, ultimaOk: estadoSistema.fuentes[f.id]?.ultimaOk ?? null };
    continue;
  }
  resumen.fuentesOk++;
  estadoSistema.fuentes[f.id] = { nombre: f.nombre, ok: true, motivo: '', hora: AHORA, ultimaOk: AHORA };
  estadoSistema.ultimaFuenteOk = { id: f.id, nombre: f.nombre, hora: AHORA };

  const ef = (estadoFuentes[f.id] ??= { vistos: [] });
  // 1. Comunicados nuevos
  for (const e of enlaces(html, f.url).filter((x) => relevante(x.titulo))) {
    const clave = normalizar(e.titulo);
    if (ef.vistos.includes(clave)) continue;
    ef.vistos.push(clave);
    const motivo = datosPersonales(e.titulo);
    if (motivo) {
      resumen.rechazadas++;
      nuevasProp.push({ id: idProp(e.href), creada: AHORA, fuente: { id: f.id, nombre: f.nombre, organismo: f.organismo, categoria: f.categoria, url: f.url }, tipo: 'noticia', categoria: 'C', estado: 'rechazada', enlace: e.href, motivoRechazo: motivo });
      continue;
    }
    const urlConocida = actualizaciones.some((a) => a.fuente?.url === e.href) || cola.propuestas.some((p) => p.enlace === e.href) || nuevasProp.some((p) => p.enlace === e.href);
    if (urlConocida) { resumen.duplicadas++; continue; }
    const dup = [...actualizaciones.map((a) => a.titulo), ...cola.propuestas.filter((p) => p.titulo).map((p) => p.titulo), ...nuevasProp.filter((p) => p.titulo).map((p) => p.titulo)]
      .find((t) => parecido(t, e.titulo) >= 0.6);
    if (dup) { resumen.duplicadas++; continue; }
    const auto = cfg.publicacionAutomatica?.activa && cfg.publicacionAutomatica.fuentes.includes(f.id) && /restablec|circulacion|reanuda/.test(clave) && cfg.publicacionAutomatica.tipos.includes('estado_linea');
    resumen.nuevas++;
    if (auto) resumen.automaticas++;
    nuevasProp.push({ id: idProp(e.titulo), creada: AHORA, fuente: { id: f.id, nombre: f.nombre, organismo: f.organismo, categoria: f.categoria, url: f.url }, tipo: 'noticia', categoria: auto ? 'A' : 'B', estado: auto ? 'aprobada-automatica' : 'pendiente', titulo: e.titulo.slice(0, 200), enlace: e.href, vecesVisto: 1 });
  }
  // 2. Cifras en el texto de la página
  const texto = textoPlano(html);
  if (relevante(texto)) {
    for (const c of extraerCifras(texto)) {
      if (datosPersonales(c.contexto)) { resumen.rechazadas++; continue; }
      cifrasCiclo.push({ ...c, fuente: f });
    }
  }
  ef.hash = texto.length;
}

// 3. Propuestas de cifras y contradicciones
for (const c of cifrasCiclo) {
  const ref = latestAprobada(c.tipo);
  const yaEnCola = cola.propuestas.find((p) => p.tipo === 'cifra' && p.estado === 'pendiente' && p.cifra.tipo === c.tipo && p.cifra.valor === c.valor && p.fuente.id === c.fuente.id);
  if (yaEnCola) { yaEnCola.vecesVisto = (yaEnCola.vecesVisto ?? 1) + 1; continue; }
  if (ref && ref.valor === c.valor && ref.calificador === c.calificador) continue;
  const otrasDelCiclo = cifrasCiclo.filter((o) => o !== c && o.tipo === c.tipo && o.valor !== c.valor && o.fuente.organismo !== c.fuente.organismo);
  const contraAprobada = ref && ref.organismo !== c.fuente.organismo && ref.valor !== c.valor;
  const contradiccion = otrasDelCiclo.length || contraAprobada
    ? { detalle: [...otrasDelCiclo.map((o) => `${o.fuente.organismo}: ${o.valor}`), ...(contraAprobada ? [`${ref.organismo} (aprobada): ${ref.valor}`] : [])].join('; ') }
    : null;
  if (contradiccion) resumen.contradicciones++;
  resumen.cifras++;
  nuevasProp.push({ id: idProp(`${c.tipo}-${c.valor}-${c.fuente.id}`), creada: AHORA, fuente: { id: c.fuente.id, nombre: c.fuente.nombre, organismo: c.fuente.organismo, categoria: c.fuente.categoria, url: c.fuente.url }, tipo: 'cifra', categoria: 'B', estado: 'pendiente', cifra: { tipo: c.tipo, valor: c.valor, calificador: c.calificador, ambito: 'global' }, extracto: c.contexto.slice(0, 220), anterior: ref ? { id: ref.id, valor: ref.valor, organismo: ref.organismo } : null, contradiccion, vecesVisto: 1 });
}

// 4. Publicación automática limitada (categoría A, desactivada por defecto)
if (resumen.automaticas) {
  const act = leer('src/data/actualizaciones.json');
  for (const p of nuevasProp.filter((x) => x.categoria === 'A')) {
    act.entradas.unshift({ id: p.id, titulo: p.titulo, resumen: 'Publicado automáticamente desde la fuente oficial (categoría A). Consulta el comunicado original.', organismo: p.fuente.organismo, categoria: p.fuente.categoria, tipoFuente: 'comunicado-oficial', fuente: { titulo: p.fuente.nombre, url: p.enlace }, nivelFuente: 1, fechaComunicado: AHORA, comprobadoEn: AHORA, revisarCadaMinutos: 60, estado: 'vigente', operativa: true, alerta: true, correccion: null, automatica: true });
  }
  escribir('src/data/actualizaciones.json', act);
}

// 5. Registro
cola.propuestas = [...nuevasProp, ...cola.propuestas].slice(0, 500);
resumen.fin = new Date().toISOString();
estadoSistema.ultimaConsulta = AHORA;
estadoSistema.ultimoCicloOk = resumen.fuentesOk > 0;
estadoSistema.ciclos = [resumen, ...(estadoSistema.ciclos ?? [])].slice(0, 20);
estadoSistema.pendientes = cola.propuestas.filter((p) => p.estado === 'pendiente').length;
estadoSistema.contradicciones = cola.propuestas.filter((p) => p.estado === 'pendiente' && p.contradiccion).length;
escribir('cola/propuestas.json', cola);
escribir('cola/estado-fuentes.json', estadoFuentes);
escribir('src/data/estado-sistema.json', estadoSistema);
const registro = leer('cola/registro.json', { ciclos: [] });
registro.ciclos.unshift(resumen);
registro.ciclos = registro.ciclos.slice(0, 2000);
escribir('cola/registro.json', registro);

console.log(`Ciclo ${AHORA}: ${resumen.fuentesOk} fuentes bien, ${resumen.fuentesError} con error; ${resumen.nuevas} comunicados nuevos (${resumen.duplicadas} duplicados descartados), ${resumen.cifras} cifras propuestas, ${resumen.contradicciones} contradicciones, ${resumen.rechazadas} rechazadas por posibles datos personales, ${resumen.automaticas} publicadas automáticamente.`);
for (const [id, s] of Object.entries(estadoSistema.fuentes)) console.log(`  ${s.ok === true ? 'OK ' : s.ok === false ? 'ERR' : '---'} ${id}: ${s.motivo || 'respondió'}`);
