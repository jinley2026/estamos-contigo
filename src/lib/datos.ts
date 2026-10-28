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

export type Fuente = { titulo: string; url: string; fechaPublicacion?: string };

export const SITE = site;
export const ES_PREVIA = buildMode.mode !== 'public';
export const MODO = site.estadoOperativo.modo as 'normal' | 'reducido' | 'cerrado';

/** Un dato está verificado para publicar cuando dos personas del equipo lo han comprobado. */
export const verificado = (x: { verificadoPor?: string[]; validadoPor?: string[] }) =>
  ((x.verificadoPor ?? x.validadoPor) ?? []).length >= 2;

/**
 * Regla de visibilidad: en la publicación solo se muestra lo verificado y de nivel 1-2.
 * En la vista previa privada se muestra también lo pendiente, marcado en ámbar.
 */
export function visible(x: { verificadoPor?: string[]; validadoPor?: string[]; nivelFuente?: number }) {
  const nivelOk = x.nivelFuente === undefined || (x.nivelFuente >= 1 && x.nivelFuente <= 2);
  if (ES_PREVIA) return nivelOk;
  return nivelOk && verificado(x);
}

export const canales = canalesData.canales;
export const canalDestacado = canales.find((c) => c.destacado && c.telefono);
export const actualizaciones = [...actualizacionesData.entradas]
  .filter((e) => e.nivelFuente >= 1 && e.nivelFuente <= 2)
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

export const nivelTexto = (n: number) =>
  n === 1 ? 'Oficial directa' : n === 2 ? 'Oficial citada por medio o agencia' : 'No publicable';
