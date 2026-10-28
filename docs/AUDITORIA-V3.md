# Auditoría V3.0 — blindaje jurídico, titular provisional y contador de visitas

Versión 0.4.0 · 28/10/2026 · vista previa privada. **No se ha publicado nada ni contratado ningún servicio.**

> Esto no es un informe jurídico. El proyecto no está «jurídicamente blindado»: se han reducido riesgos razonables y queda pendiente la revisión de un profesional.

## 1. Qué estaba mal

1. **Se admitía prensa como fuente.** Las reglas V1/V2 permitían el «nivel 2», es decir, un medio que atribuye un dato a una autoridad. La V3 lo prohíbe. Estaban afectados:
   - 6 de 9 comunicados
   - el punto psicosocial de Atocha
   - las 2 fichas de trenes
   - los 3 bloques de «Asistencia y avisos»
   - las 4 cifras del balance: «al menos 10» fallecidos, 544 pasajeros, 397 en el AVE 2080 y 147 en el Iryo 6076
2. **El ciclo aceptaba cualquier enlace** de una página oficial, incluidos enlaces a redes sociales o a medios que aparecían dentro de ella.
3. **No había titular.** Además, la puerta de publicación exigía NIF y domicilio sin tener en cuenta si se aplica la LSSI.
4. **Páginas legales:** faltaban `/fuentes-y-verificacion`, `/rectificaciones` y `/quienes-somos`. La página de condiciones no se llamaba `/condiciones-de-uso`. El aviso de independencia no usaba el texto de la orden.
5. **Fechas:** faltaba la «fecha de publicación en nuestra plataforma». Las otras tres fechas no se mostraban juntas.
6. **Suspensión:** no existía la suspensión automática del sistema ante errores repetidos.
7. **Teléfonos:** el procedimiento decía que los teléfonos se comprueban **llamando**, lo que satura líneas de emergencia.
8. **Checklist:** tenía 16 puntos que no se correspondían con los 17 controles de la V3.
9. **Afirmación absoluta en el pie:** «No pedimos datos personales».
10. **Contador de visitas:** no existía.

## 2. Qué se ha corregido

| Área | Cambio | Dónde |
|---|---|---|
| Solo fuentes oficiales | Lista única de dominios oficiales: gob.es, castillalamancha.es, adif.es, adifaltavelocidad.es, renfe.com, iryo.eu y ouigo.com. Solo es publicable lo que enlaza a uno de ellos por https y no es nivel 2. | `src/config/fuentes.json`, `scripts/lib/oficial.mjs`, `src/lib/datos.ts` |
| Rechazo automático | En el ciclo, `aprobar.mjs` y `check-content`: un dato verificado sin origen oficial **bloquea la compilación**. En la vista previa se ve «No confirmado oficialmente»; en la pública no aparece. | `scripts/ciclo.mjs`, `scripts/aprobar.mjs`, `scripts/check-content.mjs` |
| Cifras | Sin comunicado oficial, la portada pública dice «No confirmado oficialmente: fallecidos, heridos…». No hay estimaciones ni sumas. | `Balance.astro`, `afirmaciones.ts` |
| Cuatro fechas | Hecho, comunicado, comprobación y publicación aquí (`publicadoEn` lo pone el script al aprobar). Incluye historial de rectificaciones. | `Fechas.astro`, `Entrada.astro`, `comunicados.astro` |
| Sello | «Fuente oficial comprobada», con la aclaración de que es nuestra revisión y no una certificación. | `Sello.astro` |
| Suspensión | El ciclo se suspende solo tras 3 consultas seguidas sin respuesta. También se puede suspender o reanudar a mano, con dos personas. La portada lo avisa. | `ciclo.mjs`, `aprobar.mjs --suspender/--reanudar`, `EstadoSistema.astro` |
| «Actualizado» | El panel dice expresamente que una consulta sin novedades no equivale a información actualizada. | `EstadoSistema.astro` |
| Titular provisional | Persona física: José Antonio Marín García, Dos Hermanas (Sevilla), jinleyreal@gmail.com. Identidad marcada como «pendiente de verificación». NIF y domicilio **no** están en el repositorio ni en la web. Sin XORVIUM. | `site.json`, `aviso-legal`, `quienes-somos` |
| Régimen LSSI | `regimenLegal.lssiAplicable = "pendiente"`. Si un profesional decide que sí se aplica, el NIF y el domicilio se inyectan solo en el despliegue privado (`EC_NIF`/`EC_DOMICILIO`). Análisis en `docs/legal/pendientes-revision.md`. | `src/lib/legal.ts` |
| Páginas legales | Nuevas: `/fuentes-y-verificacion`, `/rectificaciones` y `/quienes-somos`. Renombrada: `/condiciones-de-uso`. Reescritas: `/aviso-legal`, `/privacidad` (con un apartado de estadísticas) y `/cookies`. Retiradas: `politica-editorial` e `independencia`, cuyo contenido pasa a las nuevas. Todas llevan la marca «Borrador». | `src/pages/` |
| Aviso de independencia | Texto literal de la V3 §6 en la portada y en «Quiénes somos», marcado como borrador. | `AvisoIndependencia.astro` |
| Verificación de teléfonos | Ahora se hace «sin llamar», en la web oficial. | `fuentes-y-verificacion`, `procedimientos.md` |
| Puerta de publicación | 17 controles de la V3 más 3 adicionales. Cada uno combina una comprobación automática y una casilla humana. Solo dice «Apto para publicación» si se cumplen todos. El panel de administración lo muestra. | `scripts/publish-gate.mjs`, `checklist-publicacion.md`, `admin.html` |
| Monetización | `check-dist` falla si detecta XORVIUM, PayPal, Bizum, IBAN, patrocinios, donativos o etiquetas publicitarias. | `scripts/check-dist.mjs` |

## 3. Funcionalidades que siguen activas

- **Portada:**
  - teléfono destacado
  - estado del sistema con tres marcas de tiempo
  - balance (solo cifras oficiales)
  - trenes, novedades y avisos
  - buscador local
  - rutas y aviso de independencia
- **Contenido:** comunicados por organismo, cronología y rectificaciones.
- **Utilidades:**
  - puntos de atención
  - preguntas frecuentes
  - apoyo emocional (pendiente de validación)
  - estafas
  - 5 idiomas
  - versión ligera
  - cartel
- **«Avisar a mi familia»:** el texto se compone en el dispositivo y se envía con WhatsApp, SMS, el portapapeles o el menú de compartir del sistema. No pasa por nuestros sistemas.
- **Automatismos:**
  - ciclo cada 30 minutos (propone, no publica)
  - caducidad automática de datos
  - modo seguro a las 4 horas sin revisión
  - recarga cada 10 minutos
- **Desactivado:** la publicación automática de la categoría A (`publicacionAutomatica.activa = false`) y el contador de visitas.

## 4. Qué datos se publicarán

Solo información oficial, agregada y verificada por dos personas:

- comunicados de organismos
- teléfonos y puntos de atención oficiales
- estado de la línea
- cifras globales con su organismo y hora
- datos de los trenes que dé un operador o la administración

Hoy, con lo que hay en los datos, **la versión pública no mostraría ninguna cifra ni ficha de tren**. Las fuentes actuales de esos datos son prensa. Mostraría «No confirmado oficialmente» hasta que se localicen los comunicados originales y se verifiquen.

Elementos con origen oficial que solo esperan la doble verificación:

- el teléfono de Renfe (nota de Adif)
- los 3 puntos de Adif
- el punto de Urda y las notas SO1/SO2 de la Junta
- los teléfonos de la Junta

**Nunca** se publican datos de personas: nombres, documentos, teléfonos personales, direcciones, salud, fotografías, hospital individual, listados, menores, testimonios ni familiares.

## 5. Cómo se comprueban las fuentes

1. **Detección:** el ciclo lee solo webs oficiales y descarta los enlaces que no son de dominios oficiales.
2. **Comprobación humana:** una persona abre el comunicado y escribe un resumen propio y fiel.
3. **Aprobación:** una segunda persona lo aprueba. `aprobar.mjs` exige dos iniciales y un enlace oficial.
4. **Control al compilar:** `check-content` rechaza todo lo verificado que no tenga origen oficial, y `check-dist --public` comprueba que no sale nada «No confirmado».
5. **Caducidad:** cada dato caduca según su `revisarCadaMinutos`.

## 6. Protecciones jurídicas implantadas (mitigaciones, no garantías)

- **Identificación transparente** del promotor como persona física. No se finge ninguna vinculación institucional. Sin logotipos oficiales.
- **Aviso de independencia** y límites del servicio, sin excluir la responsabilidad que la ley no permite excluir. Se indica que el art. 17 LSSI no cubre los resúmenes propios.
- **Rectificaciones:** procedimiento público, historial que no se borra y retirada inmediata de lo que pueda causar daño.
- **Privacidad por diseño:**
  - sin formularios, cuentas, comentarios ni chat
  - sin cookies, analítica comercial ni scripts o fuentes externos
  - CSP con hashes
  - `Referrer-Policy: no-referrer`
  - no se afirma «no recogemos ningún dato»: se explican los registros técnicos del alojamiento
- **Sin datos personales** de afectados: filtro automático en el ciclo y revisión humana obligatoria (control C06).
- **Puerta de publicación** que impide declarar la web apta mientras quede un control pendiente.

## 7. Qué requiere revisión profesional

Ver `docs/legal/pendientes-revision.md`, puntos 1 a 15. Los principales:

- la aplicabilidad de la LSSI a una web personal sin actividad económica (análisis preliminar incluido)
- la responsabilidad personal del promotor
- la base jurídica de los registros técnicos y del contador
- las transferencias internacionales del proveedor
- el derecho de rectificación
- la etiqueta «Fuente oficial comprobada»
- los 8 textos legales (todos en borrador)

## 8. Qué falta para publicar

La puerta marca hoy **NO apto para publicación: 0 de 20 controles cumplidos**. Falta:

1. **Verificar la identidad del promotor:** `identidadVerificada`.
2. **Decisión profesional sobre la LSSI:** `regimenLegal`. Si se aplica, cargar `EC_NIF` y `EC_DOMICILIO` en el despliegue.
3. **Dominio y proveedor:** asignar el dominio y elegir proveedor. Después, auditar las cookies y los registros reales.
4. **Revisión jurídica** de los 8 documentos legales.
5. **Comunicados originales:** localizar los oficiales de cada dato hoy «No confirmado» (cifras, trenes, hospitales, línea, PAVAFF, Atocha) o retirarlos. Después, verificar con dos personas.
6. **Equipo:** al menos dos personas con turnos para 72 h.
7. **Validaciones:** apoyo emocional (psicología) y traducciones.
8. **Checklist:** marcar las casillas humanas de la checklist.

## Contador de visitas

**Estado:** desactivado. Todas las páginas muestran en el pie «Visitas: Datos no disponibles. Una visita no equivale a una persona ayudada.»

**Funcionamiento previsto** (`scripts/visitas.mjs`, en el ciclo de 30 min):

- lee totales diarios agregados de la API de analítica del proveedor (Cloudflare)
- suma las páginas servidas desde la fecha de publicación
- **no suma visitantes únicos diarios**, porque falsearía el total: se muestra «no disponible para el periodo completo»
- sin cookies, scripts, píxeles ni identificadores
- el número es fijo en el HTML: recargar no lo cambia

**No verificado:**

- la definición exacta de «visitas» y «únicos» de Cloudflare
- si filtra robots en el plan gratuito
- el campo `sum.pageViews` de la API [MEMORIA]

Por eso sigue desactivado. Para activarlo:

1. Guardar los secretos `CF_API_TOKEN` y `CF_ZONE_TAG` en GitHub.
2. Poner `visitas.activo = true`.
3. Añadir dos iniciales en `visitas.verificadoPor`.
4. Obtener la revisión jurídica del apartado de privacidad.

**Pruebas** (con «DATOS DE PRUEBA» bien visibles, valor ficticio 12.345):

- se ven marcados en la vista previa
- no cambian al recompilar
- nunca salen en público: `check-content --public` y `check-dist --public` lo bloquean
- en móvil de 320 px el pie se ve sin desbordamiento (captura `tests/capturas/16-pie-contador-movil.png`)

## Pruebas ejecutadas (reales, 28/10/2026)

| Conjunto | Resultado |
|---|---|
| `node --test tests/ciclo.test.mjs`: 14 de la V2, 6 de la V3 y 2 del contador, con datos ficticios en una copia temporal | 22/22 |
| `python3 tests/navegador.py`: Chromium, axe WCAG 2.2 AA, móvil de 320 px, sin JavaScript, contador y páginas legales | 24/24 |
| `scripts/check-dist.mjs` (vista previa) | 18/18 |
| `scripts/check-content.mjs` (vista previa) | 0 errores. Los avisos listan lo «No confirmado oficialmente». |
| Compilación pública simulada (sin la puerta) | Solo falla por los marcadores `[PENDIENTE]` del dominio y del proveedor. Ninguna cifra ni ficha de prensa aparece. |
| `scripts/publish-gate.mjs` | NO apto, 0/20 (esperado) |

## Costes y límites (V2)

| Concepto | Coste | Fuente |
|---|---|---|
| GitHub Actions (ciclo de 30 min ≈ 1.440 ejecuciones al mes) | Gratis en repositorio público. En repositorio privado el plan Free incluye 2.000 min/mes: con ~1 min por ejecución puede **quedarse corto**. | Documentación de GitHub consultada |
| Cloudflare Pages, plan gratuito | 0 €. 500 compilaciones al mes: con una compilación por cada aprobación es suficiente. El ancho de banda no consta en su página de límites. | Página de límites de Cloudflare |
| Vercel Hobby | Solo uso personal no comercial. Opción alternativa. | Condiciones de Vercel |
| Dominio | Pendiente de asignación. Coste no presupuestado. | — |

**Limitaciones conocidas:**

- GitHub no garantiza la puntualidad de las ejecuciones programadas y puede desactivarlas tras 60 días sin actividad [MEMORIA].
- Iryo y transportes.gob.es bloquean el acceso automatizado: entrada manual.
- Las redes sociales no se vigilan, porque necesitarían una API de pago.


## Cambio de norma — 28/10/2026, 12:47 (decisión de Lin)

Lin vio la web y comprobó que, con la regla estricta de la V3 (solo webs oficiales), no aportaba casi nada: las cifras y los datos útiles que ya circulaban no aparecían. Eligió la opción «Útil y prudente»:
- **Se publican también datos de prensa**, siempre con el **organismo** que los da y el **medio** que los publica, enlazado («Según la Junta de Castilla-La Mancha, 12:43. Publicado por Libertad Digital»).
- Se mantiene: verificación por dos personas antes de publicar, ningún dato personal de afectados, ninguna cifra sin autor, ninguna estimación propia, prioridad del comunicado oficial cuando exista.
- El ciclo automático sigue leyendo solo webs oficiales.
- Control C09 de la puerta pasa a «Ninguna información sin fuente atribuida y enlazada».
- **Riesgo que aumenta (para la revisión jurídica):** responsabilidad por reproducir cifras de prensa que luego resulten erróneas. Mitigación: atribución expresa, hora, enlace, historial de cifras y rectificación inmediata.
