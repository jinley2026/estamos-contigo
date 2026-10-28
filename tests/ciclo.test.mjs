// PRUEBAS OBLIGATORIAS V2 (sección 15 del prompt). Ejecutar: node --test tests/ciclo.test.mjs
// TODOS LOS DATOS DE ESTAS PRUEBAS SON FICTICIOS y se usan sobre una COPIA temporal del proyecto.
// Nada de lo que se genera aquí llega al proyecto real ni se publica.
import { test, before } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, cpSync, writeFileSync, readFileSync, symlinkSync, existsSync, readdirSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';

const REAL = new URL('..', import.meta.url).pathname;
let T, FIX;
const leer = (p) => JSON.parse(readFileSync(join(T, p), 'utf8'));
const escribir = (p, d) => writeFileSync(join(T, p), JSON.stringify(d, null, 2));
const ciclo = (args = [], env = {}) => execFileSync('node', [join(T, 'scripts/ciclo.mjs'), ...args], { env: { ...process.env, EC_RAIZ: T, ...env }, encoding: 'utf8' });
const aprobar = (args) => spawnSync('node', [join(T, 'scripts/aprobar.mjs'), ...args], { env: { ...process.env, EC_RAIZ: T }, encoding: 'utf8' });
const pagina = (enlaces, texto = '') => `<html><body><h1>Sala de prensa (FICTICIA)</h1>${enlaces.map(([t, h]) => `<a href="${h}">${t}</a>`).join('')}<p>${texto}</p></body></html>`;

before(() => {
  T = mkdtempSync(join(tmpdir(), 'ec-pruebas-'));
  for (const d of ['src', 'public', 'scripts']) cpSync(join(REAL, d), join(T, d), { recursive: true });
  for (const f of ['astro.config.mjs', 'package.json', 'tsconfig.json']) cpSync(join(REAL, f), join(T, f));
  symlinkSync(join(REAL, 'node_modules'), join(T, 'node_modules'));
  // Estado limpio y datos FICTICIOS de partida
  escribir('src/data/estado-sistema.json', { ultimaConsulta: '', ultimoCicloOk: false, ultimaFuenteOk: null, fuentes: {}, ciclos: [] });
  const af = leer('src/data/afirmaciones.json');
  af.afirmaciones = [{ id: 'ficticia-fallecidos-junta', tipo: 'fallecidos', valor: 10, calificador: 'al menos', unidad: 'personas', ambito: 'global', organismo: 'Junta de Castilla-La Mancha', fuente: { titulo: 'FICTICIA', url: 'https://ejemplo.invalid/a', tipoFuente: 'comunicado-oficial' }, fechaComunicado: '2026-10-28T10:00:00+01:00', fechaVerificacion: '2026-10-28T10:05:00+01:00', estadoEditorial: 'aprobado', estadoDato: 'provisional', versionAnterior: null, observaciones: 'FICTICIA', verificadoPor: ['XX', 'YY'] }];
  escribir('src/data/afirmaciones.json', af);
  const fu = leer('src/config/fuentes.json');
  fu.fuentes = fu.fuentes.filter((f) => ['adif', 'jccm', 'renfe'].includes(f.id));
  escribir('src/config/fuentes.json', fu);
  FIX = join(T, 'fixtures');
  mkdirSync(FIX);
  writeFileSync(join(FIX, 'adif.html'), pagina([
    ['Simulacro FICTICIO: Adif informa sobre el accidente de Urda y la línea', 'https://ejemplo.invalid/adif-1'],
    ['Simulacro FICTICIO: Adif informa sobre el accidente de Urda y la línea', 'https://ejemplo.invalid/adif-1'],
    ['Identificada la víctima Juan Pérez Gómez en el accidente de Urda (FICTICIO)', 'https://ejemplo.invalid/adif-2']
  ], 'Texto FICTICIO de prueba sobre Urda: al menos 11 fallecidos.'));
  writeFileSync(join(FIX, 'jccm.html'), pagina([
    ['Simulacro FICTICIO: Adif informa sobre el accidente de Urda y la línea férrea', 'https://ejemplo.invalid/jccm-1'],
    ['Simulacro FICTICIO: la Junta habilita un punto de atención por el accidente de Urda', 'https://ejemplo.invalid/jccm-2']
  ], 'Comunicado FICTICIO sobre Urda: al menos 12 fallecidos y 30 heridos.'));
  // renfe sin archivo: fallo simulado
});

test('1. Un ciclo de consulta de fuentes', () => {
  const salida = ciclo(['--fixtures', FIX, '--ahora', '2026-10-28T11:00:00.000Z']);
  const es = leer('src/data/estado-sistema.json');
  assert.equal(es.ultimaConsulta, '2026-10-28T11:00:00.000Z');
  assert.equal(es.fuentes.adif.ok, true);
  assert.equal(es.fuentes.jccm.ok, true);
  assert.equal(es.ciclos.length, 1);
  assert.match(salida, /Ciclo/);
});

test('2. Detección de una noticia nueva', () => {
  const p = leer('cola/propuestas.json').propuestas;
  assert.ok(p.some((x) => x.tipo === 'noticia' && x.estado === 'pendiente' && /punto de atención/.test(x.titulo)));
});

test('3. Detección de cambios en una cifra (con referencia a la anterior aprobada)', () => {
  const p = leer('cola/propuestas.json').propuestas.filter((x) => x.tipo === 'cifra' && x.cifra.tipo === 'fallecidos');
  const de12 = p.find((x) => x.cifra.valor === 12);
  assert.ok(de12, 'se propone el cambio a 12');
  assert.equal(de12.anterior.valor, 10);
  assert.equal(de12.estado, 'pendiente');
  assert.equal(de12.categoria, 'B', 'las cifras de víctimas nunca se publican solas');
});

test('4. Identificación de noticias duplicadas (mismo enlace y titulares casi iguales)', () => {
  const p = leer('cola/propuestas.json').propuestas.filter((x) => x.tipo === 'noticia' && /Adif informa/.test(x.titulo ?? ''));
  assert.equal(p.length, 1, 'una sola propuesta para el mismo comunicado');
  assert.ok(leer('src/data/estado-sistema.json').ciclos[0].duplicadas >= 1);
});

test('5. Identificación de fuentes contradictorias', () => {
  const p = leer('cola/propuestas.json').propuestas.filter((x) => x.tipo === 'cifra' && x.cifra.tipo === 'fallecidos');
  assert.ok(p.every((x) => x.contradiccion), 'ambas cifras quedan marcadas como contradictorias');
  assert.ok(leer('src/data/estado-sistema.json').contradicciones >= 1);
});

test('6. Procesamiento de un comunicado sin datos personales (categoría B, pendiente)', () => {
  const p = leer('cola/propuestas.json').propuestas.find((x) => /punto de atención/.test(x.titulo ?? ''));
  assert.equal(p.categoria, 'B');
  assert.equal(p.estado, 'pendiente');
});

test('7. Rechazo de contenido con nombres de víctimas, sin guardar el texto', () => {
  const p = leer('cola/propuestas.json').propuestas.find((x) => x.enlace === 'https://ejemplo.invalid/adif-2');
  assert.equal(p.categoria, 'C');
  assert.equal(p.estado, 'rechazada');
  assert.match(p.motivoRechazo, /persona/);
  assert.ok(!JSON.stringify(leer('cola/propuestas.json')).includes('Pérez'), 'el nombre no queda guardado');
});

test('8. Revisión y aprobación manual (exige dos personas y texto propio)', () => {
  const p = leer('cola/propuestas.json').propuestas.find((x) => /punto de atención/.test(x.titulo ?? ''));
  const una = aprobar([p.id, '--por', 'AA', '--titulo', 'X', '--resumen', 'Y']);
  assert.notEqual(una.status, 0, 'con una sola persona se rechaza');
  const sinResumen = aprobar([p.id, '--por', 'AA,BB']);
  assert.notEqual(sinResumen.status, 0, 'sin resumen propio se rechaza');
  const ok = aprobar([p.id, '--por', 'AA,BB', '--titulo', 'PRUEBA FICTICIA: punto de atención aprobado', '--resumen', 'Resumen ficticio redactado por el equipo.', '--fecha-comunicado', '2026-10-28T11:00:00Z', '--ahora', '2026-10-28T11:05:00Z']);
  assert.equal(ok.status, 0, ok.stderr);
  const act = leer('src/data/actualizaciones.json').entradas[0];
  assert.equal(act.titulo, 'PRUEBA FICTICIA: punto de atención aprobado');
  assert.deepEqual(act.verificadoPor, ['AA', 'BB']);
  assert.equal(leer('cola/propuestas.json').propuestas.find((x) => x.id === p.id).estado, 'aprobada');
});

test('9 y 10. Actualización de la web y horas en zona peninsular', () => {
  writeFileSync(join(T, 'src/config/build-mode.json'), JSON.stringify({ mode: 'preview' }));
  execFileSync('npx', ['astro', 'build'], { cwd: T, env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' }, stdio: 'pipe' });
  const html = readFileSync(join(T, 'dist/actualizaciones.html'), 'utf8');
  assert.ok(html.includes('PRUEBA FICTICIA: punto de atención aprobado'), 'la noticia aprobada aparece en la web');
  assert.ok(html.includes('28/10/2026, 12:00 (hora peninsular)'), '11:00 UTC se muestra como 12:00 peninsular');
  const idx = readFileSync(join(T, 'dist/index.html'), 'utf8');
  assert.ok(idx.includes('Al menos 10'), 'la cifra aprobada vigente se muestra');
});

test('11. Fallo simulado del sistema de consultas', () => {
  const vacia = join(T, 'sin-respuesta');
  mkdirSync(vacia);
  ciclo(['--fixtures', vacia, '--ahora', '2026-10-28T11:30:00.000Z']);
  const es = leer('src/data/estado-sistema.json');
  assert.equal(es.ultimoCicloOk, false);
  assert.equal(es.fuentes.adif.ok, false);
  assert.match(es.fuentes.adif.motivo, /fallo simulado/);
  assert.equal(es.ultimaFuenteOk.hora, '2026-10-28T11:00:00.000Z', 'se conserva la última fuente que sí respondió');
});

test('11b. La web avisa cuando el ciclo falla', () => {
  execFileSync('npx', ['astro', 'build'], { cwd: T, env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' }, stdio: 'pipe' });
  const idx = readFileSync(join(T, 'dist/index.html'), 'utf8');
  assert.ok(idx.includes('no obtuvo respuesta de ninguna fuente oficial'));
});

test('12. Activación del modo seguro (modo reducido: solo enlaces oficiales)', () => {
  const site = leer('src/config/site.json');
  site.estadoOperativo.modo = 'reducido';
  escribir('src/config/site.json', site);
  execFileSync('npx', ['astro', 'build'], { cwd: T, env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' }, stdio: 'pipe' });
  const idx = readFileSync(join(T, 'dist/index.html'), 'utf8');
  assert.ok(idx.includes('modo reducido'));
  assert.ok(!idx.includes('id="balance"'), 'no se muestra el balance');
});

test('12b. En la versión pública no existe el panel de administración ni se muestran datos sin verificar', () => {
  const site = leer('src/config/site.json');
  site.estadoOperativo.modo = 'normal';
  escribir('src/config/site.json', site);
  writeFileSync(join(T, 'src/config/build-mode.json'), JSON.stringify({ mode: 'public' }));
  execFileSync('npx', ['astro', 'build'], { cwd: T, env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' }, stdio: 'pipe' });
  assert.ok(!existsSync(join(T, 'dist/admin.html')));
  const idx = readFileSync(join(T, 'dist/index.html'), 'utf8');
  assert.ok(!idx.includes('900 10 10 20'), 'el teléfono sin verificar no aparece en público');
});

test('16. Seguridad del repositorio y de las credenciales', () => {
  const PATRONES = [/ghp_[A-Za-z0-9]{20,}/, /github_pat_[A-Za-z0-9_]{20,}/, /sk-[A-Za-z0-9]{20,}/, /AKIA[0-9A-Z]{16}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /(password|contraseña|api[_-]?key|secret)\s*[:=]\s*['"][^'"]{6,}/i];
  const hallazgos = [];
  const recorrer = (d) => {
    for (const n of readdirSync(d)) {
      if (['node_modules', 'dist', '.git', '.astro', 'capturas'].includes(n)) continue;
      const p = join(d, n);
      if (statSync(p).isDirectory()) recorrer(p);
      else if (statSync(p).size < 2e6 && !/\.(png|woff2|pdf|zip)$/.test(n)) {
        const t = readFileSync(p, 'utf8');
        for (const re of PATRONES) if (re.test(t)) hallazgos.push(`${p}: ${re}`);
      }
    }
  };
  recorrer(REAL);
  assert.deepEqual(hallazgos, [], 'no hay secretos en el repositorio');
  assert.ok(!existsSync(join(REAL, '.env')), 'no hay archivo .env');
  const wf = readFileSync(join(REAL, '.github/workflows/ciclo.yml'), 'utf8');
  assert.match(wf, /permissions:\s*\n\s*contents: write\s*\n\s*pull-requests: write\s*\n/, 'permisos mínimos y explícitos');
  assert.ok(!/secrets\./.test(wf), 'el ciclo no necesita secretos propios');
  assert.match(readFileSync(join(REAL, '.gitignore'), 'utf8'), /node_modules/);
});
