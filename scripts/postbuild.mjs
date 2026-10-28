// Tras compilar: calcula los hashes de cada <script> y <style> en línea, inserta una CSP estricta
// en cada página (meta) y genera dist/_headers (Cloudflare Pages / Netlify) y dist/robots.txt.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const dist = new URL('../dist/', import.meta.url);
const mode = JSON.parse(readFileSync(new URL('../src/config/build-mode.json', import.meta.url), 'utf8')).mode;
const site = JSON.parse(readFileSync(new URL('../src/config/site.json', import.meta.url), 'utf8'));
const h = (s) => `'sha256-${createHash('sha256').update(s, 'utf8').digest('base64')}'`;

const paginas = readdirSync(dist).filter((f) => f.endsWith('.html'));
const todosScripts = new Set();
const todosEstilos = new Set();

const csp = (scripts, estilos) =>
  [
    "default-src 'none'",
    `script-src ${scripts.size ? [...scripts].join(' ') : "'none'"}`,
    `style-src ${estilos.size ? [...estilos].join(' ') : "'none'"}`,
    "img-src 'self' data:",
    "font-src 'self'",
    "base-uri 'none'",
    "form-action 'none'",
    "connect-src 'none'",
    "object-src 'none'"
  ].join('; ');

for (const f of paginas) {
  const ruta = new URL(f, dist);
  let html = readFileSync(ruta, 'utf8');
  const s = new Set(), e = new Set();
  for (const m of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) { s.add(h(m[1])); todosScripts.add(h(m[1])); }
  for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) { e.add(h(m[1])); todosEstilos.add(h(m[1])); }
  if (/\sstyle="/.test(html)) console.warn(`AVISO: ${f} contiene atributos style="" que la CSP bloqueará`);
  const meta = `<meta http-equiv="Content-Security-Policy" content="${csp(s, e)}">`;
  html = html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/, '').replace('<meta charset="utf-8">', `<meta charset="utf-8">${meta}`);
  if (site.dominio) html = html.replace('content="recursos-marca/compartir.png"', `content="https://${site.dominio}/recursos-marca/compartir.png"`);
  writeFileSync(ruta, html);
}

const cabeceras = `/*
  Content-Security-Policy: ${csp(todosScripts, todosEstilos)}; frame-ancestors 'none'
  Strict-Transport-Security: max-age=31536000; includeSubDomains
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: no-referrer
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()
  Cross-Origin-Opener-Policy: same-origin
${mode === 'preview' ? '  X-Robots-Tag: noindex, nofollow, noarchive\n' : ''}`;
writeFileSync(new URL('_headers', dist), cabeceras);
writeFileSync(new URL('robots.txt', dist), mode === 'preview' ? 'User-agent: *\nDisallow: /\n' : 'User-agent: *\nAllow: /\n');
console.log(`Postbuild (${mode}): CSP insertada en ${paginas.length} páginas; _headers y robots.txt generados.`);
