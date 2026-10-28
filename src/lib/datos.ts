// Acceso tipado a los datos y reglas de publicación compartidas por todas las páginas.
import site from '../config/site.json';
import buildMode from '../config/build-mode.json';
import canalesData from '../data/canales.json';
import actualizacionesData from '../data/actualizaciones.json';
import puntosData from '../data/puntos.json';
import recursosData from '../data/recursos.json';
import preguntasData from '../data/preguntas.json';
import estafasData from '../data/estafas.json';
import mensajesData from '../data/mensajes.json';
import esenciales from '../i18n/esenciales.json';
import ultimahoraData from '../data/ultimahora.json';
import trenesData from '../data/trenes.json';
import estadoData from '../data/estado-sistema.json';
import fuentesData from '../config/fuentes.json';

export type Fuente = { titulo: string; url: string; fechaPublicacion?: string };

export const SITE = site;
export const ES_PREVIA = buildMode.mode !== 'public';
export const MODO = site.estadoOperativo.modo as 'normal' | 'reducido' | 'cerrado';

/** Un dato está verificado para publicar cuando dos personas del equipo lo han comprobado. */
export const verificado = (x: { verificadoPor?: string[]; validadoPor?: string[] }) =>
  ((x.verificadoPor ?? x.validadoPor) ?? []).length >= 2;

/** V3 §1: un enlace es de origen oficial si es https y su dominio está en fuentes.json → dominiosOficiales. */
const DOMINIOS = fuentesData.dominiosOficiales.lista as string[];
export function esUrlOficial(url?: string) {
  if (!url) return false;
  try {
    const u = new URL(url);
    const h = u.hostname.toLowerCase();
    return u.protocol === 'https:' && DOMINIOS.some((d) => h === d || h.endsWith('.' + d));
  } catch { return false; }
}
type ConFuentes = { fuente?: { url?: string }; fuentes?: { url?: string }[]; fuentesAdicionales?: { url?: string }[] };
export const fuentesDe = (x: ConFuentes) => [x.fuente, ...(x.fuentes ?? []), ...(x.fuentesAdicionales ?? [])].filter((f): f is { url: string } => !!f?.url);
/** Fuente de origen oficial del dato, o null. */
export const origenOficial = (x: ConFuentes) => fuentesDe(x).find((f) => esUrlOficial(f.url)) ?? null;
/** Confirmado oficialmente = tiene enlace directo a un dominio oficial y no es de nivel 2 (medio que cita). */
export const confirmadoOficial = (x: ConFuentes & { nivelFuente?: number }) => x.nivelFuente !== 2 && !!origenOficial(x);
export const NO_CONFIRMADO = 'No confirmado oficialmente';

/**
 * Regla de visibilidad (V3): en la publicación solo se muestra lo confirmado oficialmente Y verificado por dos personas.
 * En la vista previa privada se muestra también lo pendiente y lo no confirmado, marcado como tal, para poder revisarlo.
 */
export function visible(x: ConFuentes & { verificadoPor?: string[]; validadoPor?: string[]; nivelFuente?: number }) {
  const nivelOk = x.nivelFuente === undefined || (x.nivelFuente >= 1 && x.nivelFuente <= 2);
  if (ES_PREVIA) return nivelOk;
  // Decisión de Lin (28/10, 12:47): se publican también datos de prensa (nivel 2) SIEMPRE con el organismo y el medio citados.
  // Sigue haciendo falta la verificación de dos personas y una fuente enlazada.
  return nivelOk && verificado(x) && (x.nivelFuente === undefined && !x.fuente && !x.fuentes ? true : fuentesDe(x).length > 0);
}
/** Para elementos sueltos de una lista (hospitales, avisos): en publicación, solo los de origen oficial. */
export const itemPublicable = (x: ConFuentes & { nivelFuente?: number }) => (x.nivelFuente ?? 1) <= 2 && fuentesDe(x).length > 0;

export const canales = canalesData.canales;
export const canalDestacado = canales.find((c) => c.destacado && c.telefono);
export const actualizaciones = [...actualizacionesData.entradas]
  .filter((e) => e.estado !== 'retirado' || ES_PREVIA)
  .filter((e) => e.nivelFuente >= 1 && e.nivelFuente <= 2 && (ES_PREVIA || verificado(e)))
  .sort((a, b) => b.fechaComunicado.localeCompare(a.fechaComunicado));
export const correcciones = actualizacionesData.entradas.filter((e) => e.correccion);
export const puntos = puntosData.puntos;
export const operadores = recursosData.operadores;
export const apoyo = recursosData.apoyoEmocional;
export const categoriasFAQ = preguntasData.categorias;
export const estafas = estafasData;
export const mensajes = mensajesData;
export const i18n = esenciales;
export const ultimahora = ultimahoraData;
export const trenes = trenesData.trenes;
export const hecho = trenesData.hecho;
export const estadoSistema = estadoData as any;
export const fuentesConfig = fuentesData;
export const CATEGORIAS: Record<string, string> = { gobierno: 'Gobierno de España', ministerio: 'Ministerio de Transportes', junta: 'Junta de Castilla-La Mancha', adif: 'Adif', renfe: 'Renfe', iryo: 'Iryo', emergencias: 'Emergencias', sanidad: 'Sanidad', ayuntamientos: 'Ayuntamientos', otros: 'Otros organismos' };
export const tipoFuenteTexto = (t: string) => (t === 'comunicado-oficial' ? 'Comunicado oficial' : 'Medio de comunicación');
export const horaCorta = (iso: string) => (iso ? new Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit' }).format(new Date(iso)) : '');
export const otrosCanales = canalesData.canales.filter((c) => !c.destacado && c.telefono);

const fmt = new Intl.DateTimeFormat('es-ES', {
  timeZone: 'Europe/Madrid',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});
/** Fecha y hora en hora peninsular española. */
export const fechaHora = (iso: string) => (iso ? fmt.format(new Date(iso)) + ' (hora peninsular)' : 'sin fecha');

/** La etiqueta describe NUESTRA revisión del enlace, no una certificación de la administración (V3 §9). */
export const nivelTexto = (n: number) =>
  n === 1 ? 'Fuente oficial comprobada' : n === 2 ? 'Según un medio que cita al organismo' : 'No publicable';
