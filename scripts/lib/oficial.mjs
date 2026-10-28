// Regla V3 §1: solo es publicable lo que tiene un enlace directo a un dominio oficial de la lista.
// La misma lógica está en src/lib/datos.ts (esUrlOficial) para la web.
import { readFileSync } from 'node:fs';

export function cargarDominios(raiz) {
  const cfg = JSON.parse(readFileSync(new URL('src/config/fuentes.json', raiz), 'utf8'));
  return cfg.dominiosOficiales.lista;
}

export function esUrlOficial(url, dominios) {
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:') return false;
    const h = u.hostname.toLowerCase();
    return dominios.some((d) => h === d || h.endsWith('.' + d));
  } catch { return false; }
}

/** Fuentes de un dato, en cualquiera de las formas que usan los archivos de datos. */
export const fuentesDe = (x) => [x.fuente, ...(x.fuentes ?? []), ...(x.fuentesAdicionales ?? [])].filter((f) => f && f.url);

export const origenOficial = (x, dominios) => fuentesDe(x).find((f) => esUrlOficial(f.url, dominios)) ?? null;
