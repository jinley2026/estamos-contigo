// Fija el modo de compilación (preview | public) de forma compatible con Windows, macOS y Linux.
import { writeFileSync } from 'node:fs';
const mode = process.argv[2];
if (!['preview', 'public'].includes(mode)) {
  console.error('Uso: node scripts/set-mode.mjs preview|public');
  process.exit(1);
}
writeFileSync(new URL('../src/config/build-mode.json', import.meta.url), JSON.stringify({ mode }, null, 2) + '\n');
console.log(`Modo de compilación: ${mode}`);
