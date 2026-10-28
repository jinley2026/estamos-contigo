// Imprime el mapa de archivos para publicar la vista en el Artifact: { "ruta/publicada": "ruta/local" }.
// Incluye dist/ (salvo index.html, _headers y robots.txt) y el paquete del código fuente para la siguiente pasada.
// Uso: node scripts/archivos-artifact.mjs <ruta-al-paquete-b64>
import { readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
const dist = resolve(new URL('../dist', import.meta.url).pathname);
const mapa = {};
const recorrer = (d) => { for (const n of readdirSync(d)) { const p = join(d, n); if (statSync(p).isDirectory()) recorrer(p); else { const r = relative(dist, p); if (!['index.html', '_headers', 'robots.txt'].includes(r)) mapa[r] = p; } } };
recorrer(dist);
if (process.argv[2]) mapa['fuente/estamos-contigo.tgz.b64.txt'] = resolve(process.argv[2]);
console.log(JSON.stringify(mapa));
