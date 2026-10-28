// VIGILANTE DE FUENTES OFICIALES — no publica nada.
// Descarga cada página de src/config/fuentes-vigiladas.json, extrae el texto, lo compara con la última
// comprobación y, si ha cambiado y contiene palabras clave del suceso, genera un aviso para el equipo
// editorial (informe en vigilancia/ultimo-informe.md y código de salida 2).
// Una persona revisa el cambio, lo verifica y lo añade a src/data/*.json siguiendo docs/operacion/procedimientos.md.
// Uso: node scripts/vigilar-fuentes.mjs  (programado cada 10 minutos en .github/workflows/vigilar.yml)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const cfg = JSON.parse(readFileSync(new URL('../src/config/fuentes-vigiladas.json', import.meta.url), 'utf8'));
const dir = new URL('../vigilancia/', import.meta.url);
mkdirSync(dir, { recursive: true });
const estadoURL = new URL('estado.json', dir);
const estado = existsSync(estadoURL) ? JSON.parse(readFileSync(estadoURL, 'utf8')) : {};
const ahora = new Date().toISOString();

const texto = (html) => html
  .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const hallazgos = [];
const errores = [];
for (const f of cfg.fuentes) {
  try {
    const r = await fetch(f.url, { headers: { 'User-Agent': 'EstamosContigo-vigilante/1.0 (revisión editorial manual)' }, signal: AbortSignal.timeout(20000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const t = texto(await r.text());
    const hash = createHash('sha256').update(t).digest('hex');
    const previo = estado[f.id];
    const claves = cfg.palabrasClave.filter((k) => t.toLowerCase().includes(k.toLowerCase()));
    if (previo && previo.hash !== hash && claves.length) {
      const fragmentos = claves.slice(0, 3).map((k) => {
        const i = t.toLowerCase().indexOf(k.toLowerCase());
        return '…' + t.slice(Math.max(0, i - 120), i + 180) + '…';
      });
      hallazgos.push({ fuente: f.nombre, url: f.url, claves, fragmentos });
    }
    estado[f.id] = { hash, comprobado: ahora };
  } catch (e) {
    errores.push(`${f.nombre} (${f.url}): ${e.message}`);
  }
}
writeFileSync(estadoURL, JSON.stringify(estado, null, 2));

const informe = [
  `# Vigilancia de fuentes oficiales — ${ahora}`,
  '',
  hallazgos.length ? '## Cambios con palabras clave (REVISAR Y VERIFICAR ANTES DE PUBLICAR)' : 'Sin cambios relevantes.',
  ...hallazgos.flatMap((h) => ['', `### ${h.fuente}`, h.url, `Palabras clave: ${h.claves.join(', ')}`, ...h.fragmentos.map((x) => `> ${x}`)]),
  errores.length ? '\n## No se pudieron revisar\n' + errores.map((e) => `- ${e}`).join('\n') : ''
].join('\n');
writeFileSync(new URL('ultimo-informe.md', dir), informe + '\n');
console.log(informe);
process.exit(hallazgos.length ? 2 : 0);
