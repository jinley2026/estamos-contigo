// Configuración de Astro: salida 100 % estática, páginas planas (.html) y estilos en línea.
// Las páginas planas permiten enlaces relativos que funcionan igual en el alojamiento
// y abriendo los archivos directamente desde el disco (vista previa privada).
import { defineConfig } from 'astro/config';

export default defineConfig({
  output: 'static',
  build: {
    format: 'file',
    inlineStylesheets: 'always',
    assets: 'recursos'
  },
  compressHTML: true,
  devToolbar: { enabled: false },
  telemetry: false
});
