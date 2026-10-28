// BLOQUEO DE PUBLICACIÓN (sección 26 del prompt maestro).
// Impide compilar la versión pública mientras falte cualquier requisito comprobable automáticamente.
// Los requisitos que dependen de personas se confirman en docs/operacion/checklist-publicacion.md.
import { readFileSync, existsSync } from 'node:fs';

const leer = (p) => JSON.parse(readFileSync(new URL(`../${p}`, import.meta.url), 'utf8'));
const site = leer('src/config/site.json');
const fallos = [];

const r = site.responsable;
for (const [k, etiqueta] of Object.entries({
  tipo: 'naturaleza del responsable', nombreORazonSocial: 'nombre o razón social', nif: 'NIF', domicilio: 'domicilio',
  correoContacto: 'correo de contacto', correoPrivacidad: 'correo de privacidad', personaResponsableEditorial: 'responsable editorial'
})) if (!r[k]) fallos.push(`Falta el dato del responsable: ${etiqueta} (src/config/site.json)`);

if (!site.dominio) fallos.push('Falta el dominio definitivo (src/config/site.json → dominio)');
for (const [doc, ok] of Object.entries(site.revisionJuridica)) if (doc !== '_comentario' && ok !== true) fallos.push(`Documento legal sin revisión profesional: ${doc}`);
for (const [k, ok] of Object.entries(site.validacionProfesional)) if (k !== '_comentario' && ok !== true) fallos.push(`Sin validación profesional: ${k}`);

const chk = new URL('../docs/operacion/checklist-publicacion.md', import.meta.url);
if (!existsSync(chk)) fallos.push('No existe docs/operacion/checklist-publicacion.md');
else {
  const txt = readFileSync(chk, 'utf8');
  const pendientes = (txt.match(/^- \[ \]/gm) || []).length;
  if (pendientes) fallos.push(`Checklist de publicación con ${pendientes} requisitos sin marcar`);
}

if (fallos.length) {
  console.error('\nPUBLICACIÓN BLOQUEADA. Requisitos pendientes:\n');
  for (const f of fallos) console.error(`  ✗ ${f}`);
  console.error('\nPuedes seguir usando la vista previa privada: npm run build:preview\n');
  process.exit(1);
}
console.log('Bloqueo de publicación: requisitos automáticos cumplidos.');
