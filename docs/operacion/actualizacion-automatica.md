# Actualización automática cada hora (tarea programada de Claude)

## ⚠️ REGLA VIGENTE DESDE EL 28/10/2026, 15:40 (decisión de Lin, opción 2): OFICIALES Y PRENSA QUE CITA AL ORGANISMO
Anula la regla de «solo canales oficiales» de las 15:05.
- Se publica lo que comunican los organismos en sus canales oficiales (`tipoFuente: "comunicado-oficial"`, `nivelFuente: 1`) **y** lo que un medio atribuye expresamente a un organismo (`tipoFuente: "medio-citando"`, `nivelFuente: 2`), siempre con organismo, hora y medio enlazado.
- Cifras de víctimas: solo si el medio las atribuye expresamente a un organismo de `site.json → publicacionAutomatica.organismosCifras`. Nunca estimar, sumar ni calcular por diferencia.
- Si existe el comunicado oficial, se enlaza el oficial en primer lugar.
- `site.json → reglaFuentes.soloCanalesOficiales` debe seguir en `false`. No lo actives sin una nueva decisión de Lin.
- Revisar TODAS las fuentes (oficiales y directos de medios) y publicar TODAS las novedades, no solo una (decisión de Lin, 14:55).
- Puntos de reunión y atención a familiares (Lin, 17:06): revisar SIEMPRE Guardia Civil, Policía Nacional, Cruz Roja, Protección Civil, SAMUR/SUMMA 112, 061/Junta de Andalucía, Ayuntamientos de Sevilla, Córdoba, Madrid y Toledo, y Justicia (Orgaz). Cada lugar va en `src/data/puntos.json` con dirección exacta, función, organismo, horario y fuente.

Decisión de Lin (28/10/2026, 13:08): no hay segunda persona. Claude actualiza y publica cada hora sin revisión previa.
Lin revisa cuando puede y puede pararlo todo poniendo `automatizacion.suspendida = true` o pidiéndoselo a Claude.

## Dónde está todo (desde el 28/10/2026, 14:30)
- Web pública: https://accidentetrentoledo.netlify.app (Netlify sirve, sin publicar nada, el contenido de GitHub Pages).
- GitHub Pages: https://jinley2026.github.io/estamos-contigo/ — se publica sola con cada `git push` a `main` (workflow `publicar.yml`).
- Repositorio: https://github.com/jinley2026/estamos-contigo
- NO hace falta tocar Netlify ni el Artifact de claude.ai.

## Pasos de cada pasada
1. Conectar el repositorio con la herramienta `add_repo` (owner `jinley2026`, repo `estamos-contigo`, access `push`), clonarlo como indique, `cd` al clon y `npm install`.
2. Si `src/config/site.json → automatizacion.suspendida` es `true`: no hacer nada y terminar.
3. Buscar novedades desde la hora del aviso más reciente de `src/data/actualizaciones.json`:
   - Webs oficiales: castillalamancha.es (notas de prensa), 112.castillalamancha.es, adif.es, grupo.renfe.com, iryo.eu, lamoncloa.gob.es, transportes.gob.es.
   - Directos de medios: elDiario.es, Libertad Digital, RTVE, Europa Press, CMM, El País.
   - Búsquedas: «accidente tren Urda última hora», «Urda balance fallecidos 112», «Urda teléfono familiares».
   - Cuidado: no confundir con el accidente de Adamuz (enero de 2026) ni con otros.
4. Actualizar solo con lo NUEVO, siempre con hora, organismo y medio:
   - `src/data/actualizaciones.json`: entradas como las existentes (`tipoFuente` `comunicado-oficial` si el enlace es de una web oficial, si no `medio-citando` con `nivelFuente` 2), `verificadoPor: ["AUTO-CLAUDE"]`, `publicadoEn` = ahora, `comprobadoEn` = ahora. Título y resumen propios, breves, sin sensacionalismo. **En títulos y resúmenes no se ponen cifras de víctimas** (lo impide check-content): las cifras van a afirmaciones.
   - `src/data/afirmaciones.json`: nueva cifra SOLO si el medio la atribuye expresamente a un organismo de `site.json → publicacionAutomatica.organismosCifras` (o está en su comunicado oficial). `estadoEditorial: "aprobado"`, `verificadoPor: ["AUTO-CLAUDE"]`, `versionAnterior` = id de la anterior del mismo tipo y organismo. Si hay cifras distintas de organismos distintos, se registran ambas (la web muestra la discrepancia). Nunca estimar ni sumar.
   - `src/data/canales.json`, `puntos.json`, `ultimahora.json`, `trenes.json`: actualizar `comprobadoEn` de lo que siga vigente y añadir lo nuevo con su fuente.
   - Si algo publicado resulta erróneo: `estado: "corregido"` con `correccion` explicando qué cambió (no borrar).
5. PROHIBIDO siempre: nombres, DNI, teléfonos personales, direcciones, datos de salud individuales, fotos, listas de víctimas o desaparecidos, menores, testimonios, familiares. Causas o culpables no oficiales.
6. Poner `site.json → estadoOperativo.ultimaRevisionEditorial` y `ultimaAprobacion` = ahora.
7. `npm run build:publico-directo` (comprobación local de la versión pública; GitHub vuelve a compilar al publicar). Si `check-content` o `check-dist` fallan: corregir; si no se puede, NO publicar y avisar a Lin.
8. `git add -A && git commit -m "Actualización HH:MM"` (con las líneas de atribución que indique el sistema), `git pull --rebase origin main` y `git push origin main`.
9. Esperar ~1 minuto y comprobar que https://accidentetrentoledo.netlify.app/ muestra lo nuevo.
10. Resumen para Lin (SendUserMessage) solo si hubo novedades: qué se añadió, cifras con su organismo y hora, y cualquier duda o contradicción.

Notas: la pasada no puede escribir en el ordenador de Lin. El contador de visitas sigue desactivado.
