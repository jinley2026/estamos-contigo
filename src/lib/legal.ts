import { SITE } from './datos';
/** Devuelve el dato del responsable o un marcador visible de pendiente. Nunca inventa datos. */
export const dato = (k: string, etiqueta: string) =>
  ((SITE.responsable as any)[k] as string) || `[PENDIENTE: ${etiqueta}]`;

/** Régimen LSSI decidido por un profesional: 'pendiente' | 'si' | 'no'. */
export const LSSI = (SITE as any).regimenLegal?.lssiAplicable as 'pendiente' | 'si' | 'no';

/**
 * NIF y domicilio: NUNCA en el repositorio. Solo si la revisión jurídica decide que la LSSI es aplicable,
 * se inyectan en la compilación privada mediante las variables EC_NIF y EC_DOMICILIO.
 */
export function datoReservado(k: 'nif' | 'domicilio') {
  const v = k === 'nif' ? process.env.EC_NIF : process.env.EC_DOMICILIO;
  if (LSSI === 'si') return v || `[PENDIENTE: ${k === 'nif' ? 'NIF' : 'domicilio'} — obligatorio si se aplica la LSSI; se añade en el despliegue privado]`;
  if (LSSI === 'no') return null;
  return `[PENDIENTE de revisión jurídica: si la LSSI resulta aplicable, aquí figurará el ${k === 'nif' ? 'NIF' : 'domicilio'}]`;
}
