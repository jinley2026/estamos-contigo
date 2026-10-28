# Procedimientos operativos

Todos los cambios se hacen editando los archivos JSON de `src/data/` o `src/config/site.json`, se revisan por una segunda persona antes de fusionarse en la rama principal y se publican recompilando. Cada cambio queda en el historial de Git (quién, cuándo y qué).

## 0. Ciclo de 30 minutos (regla V3: solo fuentes oficiales)

1. `scripts/ciclo.mjs` se ejecuta cada 30 minutos (`.github/workflows/ciclo.yml`, minutos 7 y 37). Consulta las webs oficiales que lo permiten, detecta comunicados y cifras nuevas, descarta duplicados, rechaza enlaces fuera de los dominios oficiales y textos con posibles datos personales, marca contradicciones y abre una propuesta de cambios (PR). **No publica nada.**
2. La persona de turno revisa: `node scripts/aprobar.mjs --lista`.
3. Abre el enlace oficial, escribe un título y resumen propios y fieles, y aprueba con dos iniciales: `node scripts/aprobar.mjs <id> --por AB,CD --titulo "…" --resumen "…"`. El script se niega si el enlace no es de un dominio oficial.
4. Las cifras de víctimas y la información sanitaria se aprueban siempre a mano, nunca automáticamente.
5. Al fusionar la PR, el alojamiento recompila. Las páginas abiertas se recargan solas cada 10 minutos.
6. Las cuentas oficiales en redes sociales se revisan a mano y **solo para descubrir**: lo publicado en una red se busca después en la web del organismo; si no está, no se publica.

**Nunca** se publican: nombres o datos de personas, listas de pasajeros, cifras que solo publique la prensa (aunque la atribuya a una autoridad), ni hospitales donde está una persona concreta.

## 1. Añadir una información

1. Localiza el comunicado en la web del organismo. Solo vale el origen oficial directo (dominios de `src/config/fuentes.json → dominiosOficiales`). Una noticia de prensa sirve para saber qué buscar, no como fuente.
2. Pregúntate si sirve para que alguien actúe. Si no sirve (causas, polémica, cifras), no se publica.
3. Añade la entrada en `actualizaciones.json` con `fechaComunicado`, `comprobadoEn` (hora actual con `+01:00`), `revisarCadaMinutos`, `nivelFuente: 1` y `fuente` (enlace oficial). `publicadoEn` lo pone el script al verificar.
4. Ejecuta `npm run build:preview` y revisa el resultado.
5. Una segunda persona revisa el cambio antes de publicarlo.

## 2. Verificar un teléfono o punto de atención

1. Encuentra el número o el punto en la web o en la cuenta oficial del organismo.
2. Dos personas distintas comprueban, **sin llamar** (para no saturar líneas de emergencia), que el número figura en la web oficial del organismo para ese servicio.
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

## 8. Suspensión del sistema automático y del servicio

- **Suspensión automática:** si ninguna fuente oficial responde en 3 consultas seguidas, el ciclo se suspende solo (`site.json → automatizacion.suspendida`) y la portada lo avisa.
- **Suspensión manual** (error relevante detectado, dato erróneo publicado, duda grave): `node scripts/aprobar.mjs --suspender "motivo" --por AB,CD`.
- **Reanudar:** `node scripts/aprobar.mjs --reanudar --por AB,CD`, tras revisar la causa.
- **Suspender el servicio:** modo `reducido` (solo enlaces oficiales) o, en último extremo, sustituir la web por una página con solo el 112 y los enlaces a los operadores, o retirarla del alojamiento.
- **Retirada urgente de un dato:** ver apartado 5; se puede hacer desde el móvil editando el JSON en GitHub.

## 9. Cierre (fin de actualizaciones)

1. En `site.json → estadoOperativo`: `modo` a `"cerrado"`, `fechaCierre` con la fecha y hora, y `mensajeCierre`.
2. Al recompilar, se ocultan los teléfonos y datos temporales (clase `temporal`) y aparece el aviso de cierre en todas las páginas.
3. Se mantienen los enlaces a recursos permanentes (operadores, 112).
4. Se revisa la retención de registros técnicos en el alojamiento y se eliminan los que ya no sean necesarios.
5. Se archiva el repositorio sin datos personales (el proyecto no los contiene).
6. Fecha recomendada de revisión del cierre: cuando los organismos den por finalizada la atención de emergencia o, como máximo, a las 4 semanas.

## 10. Incidente de seguridad

Ver `docs/legal/procedimientos-legales.md`, apartado «Respuesta a incidentes».
