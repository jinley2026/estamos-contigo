# Actualización automática cada hora (tarea programada de Claude)

Decisión de Lin (28/10/2026, 13:08): no hay segunda persona. Claude actualiza y publica cada hora sin revisión previa.
Lin revisa cuando puede y puede pararlo todo poniendo `automatizacion.suspendida = true` o pidiéndoselo a Claude.

## Dónde está todo
- Vista privada (Artifact): https://claude.ai/artifact/9wvpqU7KaVygLz4XijuJ6g
- Código fuente empaquetado dentro del propio Artifact: `fuente/estamos-contigo.tgz.b64.txt` (tar.gz en base64).
- Cada pasada descarga el paquete, actualiza, compila, publica la web Y vuelve a subir el paquete actualizado.

## Pasos de cada pasada
1. `Artifact read` con `url` = la del Artifact y `path` = `fuente/estamos-contigo.tgz.b64.txt` → guardar, `base64 -d > ec.tgz`, `tar xzf ec.tgz`, `cd estamos-contigo`, `npm install`.
2. Si `src/config/site.json → automatizacion.suspendida` es `true`: no hacer nada y terminar.
3. Buscar novedades desde la hora del aviso más reciente de `src/data/actualizaciones.json`:
   - Webs oficiales: castillalamancha.es (notas de prensa), 112.castillalamancha.es, adif.es, grupo.renfe.com, iryo.eu, lamoncloa.gob.es, transportes.gob.es.
   - Directos de medios: elDiario.es, Libertad Digital, RTVE, Europa Press, CMM, El País.
   - Búsquedas: «accidente tren Urda última hora», «Urda balance fallecidos 112», «Urda teléfono familiares».
   - Cuidado: no confundir con el accidente de Adamuz (enero de 2026) ni con otros.
4. Actualizar solo con lo NUEVO, siempre con hora, organismo y medio:
   - `src/data/actualizaciones.json`: entradas como las existentes (`tipoFuente` `comunicado-oficial` si el enlace es de una web oficial, si no `medio-citando` con `nivelFuente` 2), `verificadoPor: ["AUTO-CLAUDE"]`, `publicadoEn` = ahora, `comprobadoEn` = ahora. Título y resumen propios, breves, sin sensacionalismo. **En títulos y resúmenes no se ponen cifras de víctimas** (lo impide check-content): las cifras van a afirmaciones.
   - `src/data/afirmaciones.json`: nueva cifra SOLO si el medio la atribuye expresamente a un organismo de `site.json → publicacionAutomatica.organismosCifras`. `estadoEditorial: "aprobado"`, `verificadoPor: ["AUTO-CLAUDE"]`, `versionAnterior` = id de la anterior del mismo tipo y organismo. Si hay cifras distintas de organismos distintos, se registran ambas (la web muestra la discrepancia). Nunca estimar ni sumar.
   - `src/data/canales.json`, `puntos.json`, `ultimahora.json`, `trenes.json`: actualizar `comprobadoEn` de lo que siga vigente y añadir lo nuevo con su fuente.
   - Si algo publicado resulta erróneo: `estado: "corregido"` con `correccion` explicando qué cambió (no borrar).
5. PROHIBIDO siempre: nombres, DNI, teléfonos personales, direcciones, datos de salud individuales, fotos, listas de víctimas o desaparecidos, menores, testimonios, familiares. Causas o culpables no oficiales.
6. Poner `site.json → estadoOperativo.ultimaRevisionEditorial` y `ultimaAprobacion` = ahora.
7. `npm run build:publico-directo` (versión PÚBLICA, decisión de Lin 28/10 13:18: publicar ya sin esperar la revisión jurídica). Si `check-content` o `check-dist` fallan: corregir; si no se puede, NO publicar y avisar a Lin.
8. Empaquetar: desde la carpeta padre, `tar --exclude=estamos-contigo/node_modules --exclude=estamos-contigo/dist --exclude=estamos-contigo/.astro --exclude=estamos-contigo/tests/capturas --exclude=estamos-contigo/.git -czf ec.tgz estamos-contigo && base64 -w0 ec.tgz > ec.tgz.b64.txt`.
9. Publicar: `Artifact publish` con `url` = la del Artifact, `file_path` = `dist/index.html` y `files` = salida de `node scripts/archivos-artifact.mjs ../ec.tgz.b64.txt`. La versión pública no genera `admin.html`; no lo vuelvas a subir.
10. Resumen para Lin (SendUserMessage) solo si hubo novedades: qué se añadió, cifras con su organismo y hora, y cualquier duda o contradicción.

Notas: la pasada no puede escribir en el ordenador de Lin. El contador de visitas sigue desactivado.
