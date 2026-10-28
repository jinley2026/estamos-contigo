# Procedimientos operativos

Todos los cambios se hacen editando los archivos JSON de `src/data/` o `src/config/site.json`, se revisan por una segunda persona antes de fusionarse en la rama principal y se publican recompilando. Cada cambio queda en el historial de Git (quién, cuándo y qué).

## 1. Añadir una información

1. Localiza la fuente original. Solo valen nivel 1 (organismo directo) o nivel 2 (agencia o medio que cita expresamente al organismo).
2. Pregúntate si sirve para que alguien actúe. Si no sirve (causas, polémica, cifras), no se publica.
3. Añade la entrada en `actualizaciones.json` con `fechaComunicado`, `comprobadoEn` (hora actual con `+01:00`), `revisarCadaMinutos`, `nivelFuente` y `fuente`.
4. Ejecuta `npm run build:preview` y revisa el resultado.
5. Una segunda persona revisa el cambio antes de publicarlo.

## 2. Verificar un teléfono o punto de atención

1. Encuentra el número o el punto en la web o en la cuenta oficial del organismo.
2. Dos personas distintas llaman al número y confirman que corresponde al servicio descrito.
3. Ambas añaden sus iniciales en `verificadoPor` y se actualiza `comprobadoEn`.
4. Sin dos iniciales, el dato no aparece en la versión pública.

## 3. Revisión periódica

- Cada dato tiene `revisarCadaMinutos`. Al vencer, la web lo marca sola como pendiente.
- El coordinador del turno revisa los datos vencidos, vuelve a comprobarlos y actualiza `comprobadoEn`.
- Al final de cada revisión, actualiza `estadoOperativo.ultimaRevisionEditorial` en `site.json`. Si pasan más de `horasMaximasSinRevision` horas sin hacerlo, la web entra sola en modo seguro.

## 4. Corregir un error

1. No borres la entrada. Cambia `estado` a `corregido` y escribe en `correccion` qué era erróneo, qué es lo correcto y la hora.
2. Si el error afectaba a un teléfono o punto, corrígelo en su archivo y verifícalo de nuevo.
3. La corrección aparece en la fe de erratas pública automáticamente.
4. Si el error pudo causar daño (teléfono equivocado), difunde la corrección por los mismos canales donde se difundió la información.

## 5. Retirar un contenido

Cambia `estado` a `retirado` con el motivo en `correccion`. Para retirar un teléfono, vacía `verificadoPor` o elimina el canal; si es urgente, desactiva el módulo correspondiente en `site.json → modulos`.

## 6. Desactivar un módulo

En `site.json → modulos`, pon `false` en el módulo y recompila.

## 7. Modo reducido (sin equipo disponible)

En `site.json → estadoOperativo.modo`, pon `"reducido"`. La web deja de mostrar actualizaciones y queda como directorio de fuentes oficiales.

## 8. Suspender el servicio

Si no se puede garantizar la exactitud: modo `reducido` o, en último extremo, sustituir la web por una página con solo el 112 y los enlaces a los operadores, o retirarla del alojamiento.

## 9. Cierre (fin de actualizaciones)

1. En `site.json → estadoOperativo`: `modo` a `"cerrado"`, `fechaCierre` con la fecha y hora, y `mensajeCierre`.
2. Al recompilar, se ocultan los teléfonos y datos temporales (clase `temporal`) y aparece el aviso de cierre en todas las páginas.
3. Se mantienen los enlaces a recursos permanentes (operadores, 112).
4. Se revisa la retención de registros técnicos en el alojamiento y se eliminan los que ya no sean necesarios.
5. Se archiva el repositorio sin datos personales (el proyecto no los contiene).
6. Fecha recomendada de revisión del cierre: cuando los organismos den por finalizada la atención de emergencia o, como máximo, a las 4 semanas.

## 10. Incidente de seguridad

Ver `docs/legal/procedimientos-legales.md`, apartado «Respuesta a incidentes».
