// PRUEBAS OBLIGATORIAS V2 (sección 15 del prompt) + V3 (solo fuentes oficiales, suspensión) + contador de visitas. Ejecutar: node --test tests/ciclo.test.mjs
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
  // SOLO EN ESTA COPIA DE PRUEBA: el dominio reservado «ejemplo.invalid» hace de web oficial ficticia.
  fu.dominiosOficiales.lista.push('ejemplo.invalid');
  escribir('src/config/fuentes.json', fu);
  FIX = join(T, 'fixtures');
  mkdirSync(FIX);
  writeFileSync(join(FIX, 'adif.html'), pagina([
    ['Simulacro FICTICIO: Adif informa sobre el accidente de Urda y la línea', 'https://ejemplo.invalid/adif-1'],
    ['Simulacro FICTICIO: Adif informa sobre el accidente de Urda y la línea', 'https://ejemplo.invalid/adif-1'],
    ['Identificada la víctima Juan Pérez Gómez en el accidente de Urda (FICTICIO)', 'https://ejemplo.invalid/adif-2'],
    ['Simulacro FICTICIO: vídeo del accidente de Urda en una red social', 'https://red-social-ficticia.test/urda']
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
  assert.ok(html.includes('28/10/2026, 12:00'), '11:00 UTC se muestra como 12:00 peninsular');
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
  const secretos = [...wf.matchAll(/secrets\.([A-Z_]+)/g)].map((m) => m[1]);
  assert.deepEqual([...new Set(secretos)].sort(), ['CF_API_TOKEN', 'CF_ZONE_TAG'], 'solo los secretos opcionales del contador, guardados en GitHub');
  assert.ok(!/echo .*CF_API_TOKEN/.test(wf), 'el token nunca se imprime');
  assert.match(readFileSync(join(REAL, '.gitignore'), 'utf8'), /node_modules/);
});

// ---------------- V3.0: solo fuentes oficiales y suspensión ----------------
const construir = (modo) => {
  writeFileSync(join(T, 'src/config/build-mode.json'), JSON.stringify({ mode: modo }));
  execFileSync('npx', ['astro', 'build'], { cwd: T, env: { ...process.env, ASTRO_TELEMETRY_DISABLED: '1' }, stdio: 'pipe' });
};

test('V3-1. El ciclo rechaza automáticamente un enlace fuera de los dominios oficiales', () => {
  const p = leer('cola/propuestas.json').propuestas.find((x) => x.enlace === 'https://red-social-ficticia.test/urda');
  assert.ok(p, 'la propuesta queda registrada');
  assert.equal(p.estado, 'rechazada');
  assert.match(p.motivoRechazo, /dominios oficiales/);
});

test('V3-2. No se puede aprobar una propuesta cuyo enlace no es oficial', () => {
  const cola = leer('cola/propuestas.json');
  cola.propuestas.unshift({ id: 'ficticia-prensa', creada: '2026-10-28T11:00:00Z', fuente: { id: 'adif', nombre: 'FICTICIA', organismo: 'Adif', categoria: 'adif', url: 'https://periodico-ficticio.test/' }, tipo: 'noticia', categoria: 'B', estado: 'pendiente', titulo: 'FICTICIA: un periódico dice que Adif…', enlace: 'https://periodico-ficticio.test/nota' });
  escribir('cola/propuestas.json', cola);
  const r = aprobar(['ficticia-prensa', '--por', 'AA,BB', '--titulo', 'X', '--resumen', 'Y']);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /dominio oficial/);
});

test('V3-3. No se puede verificar un dato de nivel 2 (un medio que cita a la autoridad)', () => {
  const act = leer('src/data/actualizaciones.json');
  act.entradas.push({ id: 'ficticia-medio', titulo: 'FICTICIA', resumen: 'FICTICIA', organismo: 'Junta', categoria: 'junta', tipoFuente: 'medio-citando', fuente: { titulo: 'Periódico FICTICIO', url: 'https://periodico-ficticio.test/x' }, nivelFuente: 2, fechaComunicado: '2026-10-28T10:00:00+01:00', comprobadoEn: '2026-10-28T10:00:00+01:00', revisarCadaMinutos: 60, estado: 'vigente', correccion: null, verificadoPor: [] });
  escribir('src/data/actualizaciones.json', act);
  const r = aprobar(['--verificar', 'actualizaciones:ficticia-medio', '--por', 'AA,BB']);
  assert.notEqual(r.status, 0);
  // Si alguien lo marca a mano como verificado, la comprobación de contenidos lo rechaza
  const act2 = leer('src/data/actualizaciones.json');
  act2.entradas.find((e) => e.id === 'ficticia-medio').verificadoPor = ['AA', 'BB'];
  escribir('src/data/actualizaciones.json', act2);
  const cc = spawnSync('node', [join(T, 'scripts/check-content.mjs')], { encoding: 'utf8' });
  assert.notEqual(cc.status, 0);
  assert.match(cc.stdout, /ficticia-medio: verificado pero sin enlace a un dominio oficial/);
  act2.entradas = act2.entradas.filter((e) => e.id !== 'ficticia-medio');
  escribir('src/data/actualizaciones.json', act2);
});

test('V3-4. Lo «No confirmado oficialmente» no aparece en la versión pública; en la vista previa sí, marcado', () => {
  construir('preview');
  assert.ok(readFileSync(join(T, 'dist/index.html'), 'utf8').includes('No confirmado oficialmente'));
  construir('public');
  const idx = readFileSync(join(T, 'dist/index.html'), 'utf8');
  assert.ok(!/sello-pendiente">No confirmado/.test(idx), 'ningún dato no oficial con sello en público');
  assert.ok(!idx.includes('clm24.es') && !idx.includes('infobae.com') && !idx.includes('cmmedia.es'), 'sin enlaces de prensa como fuente');
  const fd = readFileSync(join(T, 'dist/actualizaciones.html'), 'utf8');
  assert.ok(fd.includes('Publicado aquí'), 'cada información muestra las cuatro fechas');
});

test('V3-5. Suspensión automática tras 3 consultas seguidas sin respuesta y reanudación por dos personas', () => {
  const vacia = join(T, 'sin-respuesta');
  ciclo(['--fixtures', vacia, '--ahora', '2026-10-28T12:00:00.000Z']);
  ciclo(['--fixtures', vacia, '--ahora', '2026-10-28T12:30:00.000Z']);
  const site = leer('src/config/site.json');
  assert.equal(site.automatizacion.suspendida, true);
  const salida = ciclo(['--fixtures', FIX, '--ahora', '2026-10-28T13:00:00.000Z']);
  assert.match(salida, /SUSPENDIDO/);
  assert.equal(leer('src/data/estado-sistema.json').ultimaConsulta, '2026-10-28T12:30:00.000Z', 'suspendido: no consulta');
  construir('preview');
  assert.ok(readFileSync(join(T, 'dist/index.html'), 'utf8').includes('La consulta automática está suspendida'));
  assert.notEqual(aprobar(['--reanudar', '--por', 'AA']).status, 0, 'una persona no basta');
  assert.equal(aprobar(['--reanudar', '--por', 'AA,BB']).status, 0);
  assert.equal(leer('src/config/site.json').automatizacion.suspendida, false);
});

test('V3-6. La puerta de publicación no declara «Apto» con controles pendientes', () => {
  mkdirSync(join(T, 'cola'), { recursive: true });
  for (const d of ['docs']) cpSync(join(REAL, d), join(T, d), { recursive: true });
  cpSync(join(REAL, 'tests'), join(T, 'tests'), { recursive: true });
  const r = spawnSync('node', [join(T, 'scripts/publish-gate.mjs')], { encoding: 'utf8' });
  assert.notEqual(r.status, 0);
  const inf = leer('cola/estado-publicacion.json');
  assert.equal(inf.apto, false);
  assert.equal(inf.estado, 'NO apto para publicación');
  assert.ok(inf.controles.filter((c) => c.id.startsWith('C')).length === 17, 'los 17 controles de la V3');
});

// ---------------- Contador de visitas (DATOS DE PRUEBA, claramente marcados) ----------------
const visitas = (args) => spawnSync('node', [join(T, 'scripts/visitas.mjs'), ...args], { env: { ...process.env, EC_RAIZ: T, CF_API_TOKEN: '', CF_ZONE_TAG: '' }, encoding: 'utf8' });

test('VIS-1. Sin configuración verificada muestra «Datos no disponibles» y no consulta nada', () => {
  const r = visitas([]);
  assert.match(r.stdout, /desactivado/);
  construir('preview');
  const idx = readFileSync(join(T, 'dist/index.html'), 'utf8');
  assert.match(idx, /Visitas: Datos no disponibles/);
  assert.match(idx, /Una visita no equivale a una persona ayudada/);
});

test('VIS-2. Con DATOS DE PRUEBA se ven marcados en la vista previa, no se suman al recargar y nunca salen en público', () => {
  const f = join(T, 'visitas-prueba.json');
  writeFileSync(f, JSON.stringify({ desde: '2026-10-28T09:00:00+01:00', hasta: '2026-10-28', visitas: 12345, visitantesUnicos: null, actualizadoEn: '2026-10-28T12:00:00+01:00' }));
  assert.equal(visitas(['--prueba', f]).status, 0);
  const site = leer('src/config/site.json');
  site.visitas.activo = true;
  escribir('src/config/site.json', site);
  construir('preview');
  const a = readFileSync(join(T, 'dist/index.html'), 'utf8').match(/<p class="pie-visitas"[\s\S]*?<\/p>/)[0];
  assert.match(a, /DATOS DE PRUEBA/);
  assert.match(a, /12\.345/);
  assert.match(a, /no disponible para el periodo completo/, 'no se inventan visitantes únicos');
  // «Recargar» = volver a servir la misma página: el número es fijo, no lo incrementa el navegador
  construir('preview');
  const b = readFileSync(join(T, 'dist/index.html'), 'utf8').match(/<p class="pie-visitas"[\s\S]*?<\/p>/)[0];
  assert.equal(a, b);
  assert.ok(!/localStorage|document\.cookie|<script/.test(readFileSync(join(T, 'src/components/ContadorVisitas.astro'), 'utf8')), 'sin cookies ni almacenamiento');
  construir('public');
  const pub = readFileSync(join(T, 'dist/index.html'), 'utf8');
  assert.ok(!pub.includes('DATOS DE PRUEBA') && !pub.includes('12.345'), 'los datos de prueba no se publican');
  assert.match(pub, /Visitas: Datos no disponibles/);
  const cc = spawnSync('node', [join(T, 'scripts/check-content.mjs'), '--public'], { encoding: 'utf8' });
  assert.match(cc.stdout, /DATOS DE PRUEBA/, 'check-content --public lo bloquea');
});
