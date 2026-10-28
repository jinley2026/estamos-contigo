// Lógica de cifras: selección de la cifra vigente, detección de discrepancias e historial.
// Reglas: no se suman cifras de distintos organismos; no se calcula nada por diferencia;
// si varios organismos dan cifras distintas, se muestran todas con su hora, sin cifra intermedia.
import data from '../data/afirmaciones.json';
import { ES_PREVIA, esUrlOficial } from './datos';

export type Afirmacion = (typeof data.afirmaciones)[number];
export const TIPOS = data.tipos as Record<string, string>;

/** Cifra confirmada oficialmente: su enlace es de un dominio oficial (V3 §1). Una cifra que un medio atribuye a un organismo NO lo es. */
export const cifraOficial = (a: Afirmacion) => esUrlOficial(a.fuente?.url);
/** En publicación solo cuenta lo aprobado Y de origen oficial; en la vista previa también lo pendiente, marcado. */
const publicable = (a: Afirmacion) =>
  a.estadoEditorial === 'aprobado' || (ES_PREVIA && a.estadoEditorial === 'pendiente');

export type Cifra = {
  tipo: string;
  ambito: string;
  vigente: Afirmacion | null;
  discrepancias: Afirmacion[];
  historial: Afirmacion[];
};

export function cifra(tipo: string, ambito = 'global'): Cifra {
  const todas = data.afirmaciones.filter((a) => a.tipo === tipo && a.ambito === ambito && publicable(a));
  const orden = [...todas].sort((x, y) => y.fechaComunicado.localeCompare(x.fechaComunicado));
  const vigente = orden[0] ?? null;
  // Última cifra de cada organismo
  const porOrganismo = new Map<string, Afirmacion>();
  for (const a of orden) if (!porOrganismo.has(a.organismo)) porOrganismo.set(a.organismo, a);
  const ultimas = [...porOrganismo.values()];
  const discrepancias = vigente ? ultimas.filter((a) => a !== vigente && (a.valor !== vigente.valor || a.calificador !== vigente.calificador)) : [];
  // Historial: versiones anteriores encadenadas
  const historial = orden.slice(1);
  return { tipo, ambito, vigente, discrepancias, historial };
}

export const texto = (a: Afirmacion) =>
  `${a.calificador === 'al menos' ? 'Al menos ' : a.calificador === 'aproximadamente' ? 'Unos ' : ''}${a.valor.toLocaleString('es-ES')}`;

export const todas = data.afirmaciones;
