// Genera el código QR del cartel SOLO cuando existe un dominio definitivo en src/config/site.json.
// Requiere instalar la librería en ese momento: npm install --save-dev qrcode
import { readFileSync } from 'node:fs';
const site = JSON.parse(readFileSync(new URL('../src/config/site.json', import.meta.url), 'utf8'));
if (!site.dominio) {
  console.error('No hay dominio definitivo en src/config/site.json. No se genera ningún QR.');
  process.exit(1);
}
const { default: QRCode } = await import('qrcode').catch(() => {
  console.error('Instala la librería: npm install --save-dev qrcode');
  process.exit(1);
});
const url = `https://${site.dominio}/`;
await QRCode.toFile(new URL('../public/recursos-marca/qr.svg', import.meta.url).pathname, url, { type: 'svg', errorCorrectionLevel: 'M', margin: 2 });
console.log(`QR generado para ${url} en public/recursos-marca/qr.svg. Comprueba con un móvil que abre la dirección correcta antes de imprimir.`);
