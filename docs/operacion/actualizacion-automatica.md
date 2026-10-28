# Actualización automática cada hora (tarea programada de Claude)

## ⚠️ REGLA VIGENTE DESDE EL 28/10/2026, 15:05 (decisión de Lin): SOLO CANALES OFICIALES
Toda la información publicada tiene que estar contrastada en un **canal oficial del propio organismo** (su web o su cuenta oficial; dominios en `src/config/fuentes.json → dominiosOficiales`).
- Lo que solo publica un medio NO se publica, aunque el medio cite a un organismo. Si no encuentras el dato en el canal oficial: no se publica («no lo sé»).
- Todo dato nuevo: `tipoFuente: "comunicado-oficial"`, `nivelFuente: 1` y enlace directo a la página oficial. Ya no se usa `medio-citando` / nivel 2 para publicar.
- Cifras de víctimas: solo si están en un comunicado oficial (enlace a dominio oficial, `tipoFuente: "comunicado-oficial"`). Si no hay ninguno, la web muestra «sin cifra comunicada».
- El código lo impone (`site.json → reglaFuentes.soloCanalesOficiales = true`): lo que no tenga fuente oficial no se muestra. No lo desactives.
- Si un dato publicado deja de cumplir la regla: `estado: "retirado"` con `correccion` (no borrar). Cifras: `estadoEditorial: "rechazado"` con la nota en `observaciones`.
- Canales oficiales útiles comprobados: castillalamancha.es/actualidad/notasdeprensa, 112.castillalamancha.es (incidentes y comunicación), adif.es/comunicacion/notas-prensa, adif.es/viajeros/estado-de-la-red, grupo.renfe.com/es/es/sala-de-prensa, iryo.eu, transportes.gob.es, lamoncloa.gob.es. Los directos de medios sirven SOLO como pista para ir a buscar el original oficial.


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
   - Directos de medios (elDiario.es, Libertad Digital, RTVE, Europa Press, CMM, El País): SOLO como pista; hay que encontrar el original en el canal oficial.
   - Búsquedas: «accidente tren Urda última hora», «Urda balance fallecidos 112», «Urda teléfono familiares».
   - Cuidado: no confundir con el accidente de Adamuz (enero de 2026) ni con otros.
4. Actualizar solo con lo NUEVO, siempre con hora, organismo y medio:
   - `src/data/actualizaciones.json`: entradas como las existentes (siempre `tipoFuente` `comunicado-oficial` y `nivelFuente` 1 con enlace oficial (ver la regla de las 15:05)), `verificadoPor: ["AUTO-CLAUDE"]`, `publicadoEn` = ahora, `comprobadoEn` = ahora. Título y resumen propios, breves, sin sensacionalismo. **En títulos y resúmenes no se ponen cifras de víctimas** (lo impide check-content): las cifras van a afirmaciones.
   - `src/data/afirmaciones.json`: nueva cifra SOLO si está en un comunicado oficial de un organismo de `site.json → publicacionAutomatica.organismosCifras` (ver la regla de las 15:05). `estadoEditorial: "aprobado"`, `verificadoPor: ["AUTO-CLAUDE"]`, `versionAnterior` = id de la anterior del mismo tipo y organismo. Si hay cifras distintas de organismos distintos, se registran ambas (la web muestra la discrepancia). Nunca estimar ni sumar.
   - `src/data/canales.json`, `puntos.json`, `ultimahora.json`, `trenes.json`: actualizar `comprobadoEn` de lo que siga vigente y añadir lo nuevo con su fuente.
   - Si algo publicado resulta erróneo: `estado: "corregido"` con `correccion` explicando qué cambió (no borrar).
5. PROHIBIDO siempre: nombres, DNI, teléfonos personales, direcciones, datos de salud individuales, fotos, listas de víctimas o desaparecidos, menores, testimonios, familiares. Causas o culpables no oficiales.
6. Poner `site.json → estadoOperativo.ultimaRevisionEditorial` y `ultimaAprobacion` = ahora.
7. `npm run build:publico-directo` (comprobación local de la versión pública; GitHub vuelve a compilar al publicar). Si `check-content` o `check-dist` fallan: corregir; si no se puede, NO publicar y avisar a Lin.
8. `git add -A && git commit -m "Actualización HH:MM"` (con las líneas de atribución que indique el sistema), `git pull --rebase origin main` y `git push origin main`.
9. Esperar ~1 minuto y comprobar que https://accidentetrentoledo.netlify.app/ muestra lo nuevo.
10. Resumen para Lin (SendUserMessage) solo si hubo novedades: qué se añadió, cifras con su organismo y hora, y cualquier duda o contradicción.

Notas: la pasada no puede escribir en el ordenador de Lin. El contador de visitas sigue desactivado.
