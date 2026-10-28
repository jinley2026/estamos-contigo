import { SITE } from './datos';
/** Devuelve el dato del responsable o un marcador visible de pendiente. Nunca inventa datos. */
export const dato = (k: keyof typeof SITE.responsable, etiqueta: string) =>
  (SITE.responsable[k] as string) || `[PENDIENTE: ${etiqueta}]`;
