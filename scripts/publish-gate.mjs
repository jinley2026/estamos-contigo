// BLOQUEO DE PUBLICACIÓN — 17 controles de la orden V3.0 (§11) + controles adicionales.
// Cada control = comprobación automática (cuando es posible) Y confirmación humana en docs/operacion/checklist-publicacion.md.
// «APTO PARA PUBLICACIÓN» solo si TODOS se cumplen.
//   node scripts/publish-gate.mjs            → bloquea (exit 1) si algo falla
//   node scripts/publish-gate.mjs --informe  → no bloquea; escribe cola/estado-publicacion.json para el panel
import { readFileSync, existsSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { cargarDominios, origenOficial } from './lib/oficial.mjs';

const RAIZ = new URL('../', import.meta.url);
const R = fileURLToPath(RAIZ);
const leer = (p) => JSON.parse(readFileSync(new URL(p, RAIZ), 'utf8'));
const existe = (p) => existsSync(new URL(p, RAIZ));
const INFORME = process.argv.includes('--informe');
const site = leer('src/config/site.json');
const r = site.responsable;
const DOM = cargarDominios(RAIZ);
const _auto = JSON.parse(readFileSync(new URL('../src/config/site.json', import.meta.url), 'utf8')).publicacionAutomatica;
const verif = (x) => { const v = (x.verificadoPor ?? x.validadoPor) ?? []; return v.length >= 2 || (!!_auto?.activa && v.includes(_auto.marca)); };

const chkTxt = existe('docs/operacion/checklist-publicacion.md') ? readFileSync(new URL('docs/operacion/checklist-publicacion.md', RAIZ), 'utf8') : '';
const marcado = (id) => new RegExp(`^- \\[x\\] ${id}\\b`, 'mi').test(chkTxt);

// --- comprobaciones automáticas reutilizables ---
const contenido = spawnSync(process.execPath, [join(R, 'scripts/check-content.mjs'), '--public'], { encoding: 'utf8' });
const contenidoOk = contenido.status === 0;
const datos = {
  canales: leer('src/data/canales.json').canales.filter((c) => c.telefono),
  act: leer('src/data/actualizaciones.json').entradas.filter((e) => e.estado !== 'retirado'),
  puntos: leer('src/data/puntos.json').puntos,
  trenes: leer('src/data/trenes.json').trenes
};
const publicables = Object.values(datos).flat().filter(verif);
const sinFuente = publicables.filter((x) => !(x.fuente?.url || x.fuentes?.length));
const sinOficial = publicables.filter((x) => !origenOficial(x, DOM) || x.nivelFuente === 2);

function escanearCredenciales() {
  const patrones = [/ghp_[A-Za-z0-9]{20,}/, /github_pat_[A-Za-z0-9_]{20,}/, /AKIA[0-9A-Z]{16}/, /-----BEGIN [A-Z ]*PRIVATE KEY-----/, /Bearer\s+[A-Za-z0-9_\-]{30,}/, /CF_API_TOKEN\s*[:=]\s*['"][^'"$]{10,}/];
  const hallazgos = [];
  const saltar = new Set(['node_modules', '.git', 'dist', '.astro', 'tests/capturas']);
  const recorrer = (d) => {
    for (const n of readdirSync(join(R, d))) {
      const rel = d ? `${d}/${n}` : n;
      if (saltar.has(rel) || saltar.has(n)) continue;
      const st = statSync(join(R, rel));
      if (st.isDirectory()) recorrer(rel);
      else if (st.size < 2_000_000 && !/\.(png|jpg|woff2?|zip)$/i.test(n)) {
        const t = readFileSync(join(R, rel), 'utf8');
        if (patrones.some((p) => p.test(t))) hallazgos.push(rel);
      }
    }
  };
  recorrer('');
  if (existe('.env')) hallazgos.push('.env (no debe estar en el proyecto)');
  return hallazgos;
}
const credenciales = escanearCredenciales();
const pruebas = existe('tests/resultados-navegador.json') ? leer('tests/resultados-navegador.json') : null;
const pruebasOk = !!pruebas && Array.isArray(pruebas.resultados ?? pruebas) && (pruebas.resultados ?? pruebas).every((x) => x.ok !== false && x.estado !== 'fallo');
const lssi = site.regimenLegal?.lssiAplicable;
const lssiOk = lssi === 'no' || (lssi === 'si' && !!process.env.EC_NIF && !!process.env.EC_DOMICILIO);

const controles = [
  ['C01', 'Titular real identificado', [
    [!!r.nombreORazonSocial && !!r.correoContacto, 'faltan nombre o correo del responsable'],
    [r.identidadVerificada === true, 'identidad del promotor pendiente de verificación'],
    [lssiOk, lssi === 'pendiente' ? 'régimen LSSI pendiente de decisión profesional' : 'LSSI aplicable: faltan EC_NIF / EC_DOMICILIO en el despliegue privado'],
    [!!site.dominio, 'dominio pendiente de asignación']]],
  ['C02', 'Documentación legal revisada', Object.entries(site.revisionJuridica).filter(([k]) => k !== '_comentario').map(([k, v]) => [v === true, `sin revisión profesional: ${k}`])],
  ['C03', 'Privacidad comprobada', [[site.revisionJuridica.privacidad === true, 'política de privacidad sin revisar'], [!!site.dominio, 'sin proveedor/dominio real que comprobar']]],
  ['C04', 'Cookies auditadas', [[site.revisionJuridica.cookies === true, 'política de cookies sin revisar']]],
  ['C05', 'Proveedores revisados', [[!!site.dominio, 'proveedor de alojamiento no elegido']]],
  ['C06', 'Ausencia de datos personales de víctimas', [[contenidoOk, 'check-content --public con errores']]],
  ['C07', 'Ausencia de formularios sensibles', [[true, '']]], // lo impone check-dist --public tras compilar
  ['C08', 'Todas las fuentes enlazadas', [[sinFuente.length === 0, `${sinFuente.length} dato(s) sin enlace`], [publicables.length > 0, 'no hay ningún dato verificado que publicar']]],
  ['C09', 'Ninguna información sin fuente atribuida y enlazada (decisión de Lin, 28/10 12:47)', [[sinFuente.length === 0, `${sinFuente.length} dato(s) sin fuente`], [contenidoOk, 'check-content --public con errores']]],
  ['C10', 'Sistema de revisión editorial operativo', [[existe('.github/workflows/ciclo.yml') && existe('scripts/aprobar.mjs'), 'falta el ciclo o el script de aprobación'], [!!site.estadoOperativo.ultimaAprobacion, 'todavía no se ha aprobado nada']]],
  ['C11', 'Rectificaciones disponibles', [[existe('src/pages/rectificaciones.astro'), 'falta la página'], [site.revisionJuridica.rectificaciones === true, 'página sin revisar']]],
  ['C12', 'Sin credenciales expuestas', [[credenciales.length === 0, `posibles credenciales en: ${credenciales.join(', ')}`]]],
  ['C13', 'Pruebas de seguridad satisfactorias', [[pruebasOk, 'pruebas de navegador ausentes o con fallos']]],
  ['C14', 'Información caducada correctamente marcada', [[readFileSync(new URL('src/components/Scripts.astro', RAIZ), 'utf8').includes('data-revisar'), 'falta el control de caducidad']]],
  ['C15', 'Responsable de mantenimiento designado', [[!!r.responsableMantenimiento, 'sin responsable'], [r.identidadVerificada === true, 'identidad pendiente']]],
  ['C16', 'Protocolo de retirada y suspensión', [[existe('docs/operacion/procedimientos.md') && readFileSync(new URL('docs/operacion/procedimientos.md', RAIZ), 'utf8').includes('Suspensión'), 'procedimiento no documentado']]],
  ['C17', 'Revisión profesional de obligaciones pendientes', [[!!site.regimenLegal?.decididoPor, 'sin profesional que firme la revisión']]],
  ['A01', 'Apoyo emocional validado', [[site.validacionProfesional.apoyoEmocional === true, 'sin validar']]],
  ['A02', 'Traducciones revisadas', [[site.validacionProfesional.traducciones === true, 'sin revisar']]],
  ['A03', 'Autorización del titular', [[true, '']]]
].map(([id, nombre, autos]) => {
  const fallosAuto = autos.filter(([ok]) => !ok).map(([, m]) => m);
  const humano = marcado(id);
  if (!humano) fallosAuto.push('confirmación humana sin marcar en la checklist');
  return { id, nombre, cumplido: fallosAuto.length === 0, motivos: fallosAuto };
});

const apto = controles.every((c) => c.cumplido);
const informe = { generado: new Date().toISOString(), apto, estado: apto ? 'Apto para publicación' : 'NO apto para publicación', cumplidos: controles.filter((c) => c.cumplido).length, total: controles.length, controles };
writeFileSync(new URL('cola/estado-publicacion.json', RAIZ), JSON.stringify(informe, null, 2) + '\n');

console.log(`\n${informe.estado.toUpperCase()} — ${informe.cumplidos}/${informe.total} controles cumplidos\n`);
for (const c of controles) console.log(`  ${c.cumplido ? '✓' : '✗'} ${c.id} ${c.nombre}${c.cumplido ? '' : `: ${c.motivos.join('; ')}`}`);
if (!apto && !INFORME) { console.error('\nPUBLICACIÓN BLOQUEADA. Puedes seguir usando la vista previa privada: npm run build:preview\n'); process.exit(1); }
