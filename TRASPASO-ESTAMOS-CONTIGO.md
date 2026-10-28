# TRASPASO — Proyecto ESTAMOS CONTIGO

Documento para continuar el trabajo en un proyecto nuevo llamado «ESTAMOS CONTIGO», separado por completo de PRELUXINT.
Estado a 28/10/2026, 12:40 (hora peninsular). Versión de la web: **v0.4.1, vista previa privada. No hay nada publicado.**

**Cómo usarlo:** crea el proyecto «ESTAMOS CONTIGO». Sube como documentos del proyecto este archivo y `estamos-contigo-v0.4.1.zip`. Después, en una conversación nueva dentro de ese proyecto, pega el mensaje del apartado 9.

---

## 1. Qué es

- **Qué es:** «Estamos Contigo» es una web informativa, gratuita, independiente y sin finalidad comercial.
- **Tema:** el accidente ferroviario del 28/10/2026 en Urda (Toledo), PK 118, hacia las 08:54, entre el AVE 2080 de Renfe y el Iryo 6076.
- **Función:** reúne en un solo lugar lo que comunican los organismos oficiales, con enlace a cada fuente.
- **Qué no hace:**
  - No identifica ni localiza personas.
  - No informa de estados de salud.
  - No sustituye a ningún servicio oficial.
  - No tiene publicidad, patrocinios, donaciones ni enlaces comerciales.
  - No tiene relación con PRELUXINT ni con XORVIUM.

## 2. Titular (provisional, fijado por Lin a las 12:00)

| Campo | Valor |
|---|---|
| Promotor | José Antonio Marín García, persona física |
| Localidad | Dos Hermanas (Sevilla), España |
| Correo de contacto | jinleyreal@gmail.com |
| Dominio | Pendiente de asignación |
| Identidad | Pendiente de verificación |
| NIF y domicilio | **No** se guardan en el repositorio ni se muestran. Si un profesional decide que se aplica la LSSI, se añaden solo en el despliegue privado (`EC_NIF`, `EC_DOMICILIO`). |
| XORVIUM | **No** es titular ni aparece en la web |

## 3. Normas fijas del proyecto

1. **Fuentes** (orden V3.0, **modificada por Lin a las 12:47**, ver el final del documento: ahora se admite prensa con organismo y medio citados):
   - Dominios oficiales admitidos: gob.es, castillalamancha.es, adif.es, adifaltavelocidad.es, renfe.com, iryo.eu y ouigo.com.
   - La prensa, los buscadores y las redes sociales sirven solo para descubrir novedades. Un dato que un periódico atribuye a una autoridad no se publica hasta encontrar el comunicado original.
2. **Ningún dato personal de afectados.** Nada de nombres, DNI, teléfonos personales, direcciones, datos de salud, fotografías, hospital de una persona concreta, listados, menores, testimonios ni datos de familiares.
3. **Sin formularios, comentarios ni chats.** El texto de «Avisar a mi familia» se compone en el dispositivo del usuario y no pasa por nuestros sistemas.
4. **Ciclo automático cada 30 minutos.** Propone cambios, pero no publica nada. Para publicar hacen falta **dos personas** (`scripts/aprobar.mjs`). Las cifras de víctimas y la información sanitaria nunca se publican automáticamente.
5. **Cuatro fechas por cada información:** hecho, comunicado, nuestra comprobación y publicación en la web.
6. **Los teléfonos se comprueban en la web oficial, sin llamar,** para no saturar las líneas.
7. **No inventar nada:** ni titularidad, ni NIF, ni domicilio, ni autorizaciones, ni colaboraciones. No describir el proyecto como «jurídicamente blindado».
8. **Nada público sin control.** No se publica nada sin revisión jurídica y técnica, y sin cumplir los 17 controles de publicación. Tampoco se contratan servicios de pago.
9. **Reglas de veracidad de Lin:**
   - Etiquetar qué es oficial, qué es prensa y qué procede de memoria.
   - Citar siempre la fuente.
   - Rectificar por escrito los errores propios, conservando la versión anterior.
   - Decir «yo no puedo» cuando el límite sea de los permisos de Claude.
10. **Norma de cierre:** «SOLO FUENTES OFICIALES, SIN DATOS PERSONALES DE AFECTADOS, SIN PUBLICACIONES NO VERIFICADAS Y SIN FINGIR VINCULACIÓN INSTITUCIONAL.»

## 4. Decisiones de diseño tomadas por Lin

- **Diseño:** tipo señalética, tipografía Atkinson Hyperlegible alojada en la propia web, logo de dos figuras.
- **Avisos de verificación:** en lugar de un cartel amarillo en cada apartado, hay **una sola nota arriba** («Información en evolución…»). Solo queda un sello verde, «Fuente oficial comprobada», en los datos ya verificados. *(12:32)*
- **Contador de visitas fijo arriba,** visible al desplazarse. Usa cifras agregadas del alojamiento, sin cookies. Está **desactivado** hasta comprobar cómo cuenta Cloudflare las visitas y si filtra robots. Mientras tanto muestra «Visitas: Datos no disponibles». *(12:00 y 12:32)*
- **Listas de víctimas o pasajeros:** no se publican, por motivos legales.

## 5. Qué contiene la web (v0.4.1)

- **Portada:**
  - teléfono para familiares
  - estado del sistema
  - qué ha pasado
  - balance (solo cifras oficiales)
  - fichas de los trenes, novedades, asistencia y avisos
  - buscador local
  - rutas: «Busco a un familiar», «Iba en el tren», «Tenía un billete», «Quiero ayudar»
  - aviso de independencia
- **Otras páginas:**
  - comunicados por organismo, cronología y trenes
  - puntos de atención, preguntas frecuentes, apoyo emocional y estafas
  - 5 idiomas, versión ligera y cartel imprimible
- **Páginas legales (borradores):**
  - aviso legal, privacidad, cookies y condiciones de uso
  - fuentes y verificación, rectificaciones, quiénes somos y contacto
- **Panel de administración:** solo existe en la vista previa. Muestra el estado de publicación con los 17 controles.

## 6. Situación de los datos

- **Con origen oficial, pendientes de la doble verificación:**
  - Teléfono de Renfe para familiares, 900 10 10 20 (nota de Adif).
  - Teléfonos de la Junta: Iryo 655 28 69 75 y 112 CLM 900 122 112.
  - Puntos de atención de Adif en Atocha, Santa Justa y Córdoba.
  - Punto de atención de Urda.
  - Notas de la Junta sobre el PLATECAM (situaciones operativas 1 y 2).
- **Discrepancia sin resolver:** hay dos teléfonos oficiales para Iryo, el 900 001 403 que da Adif y el 655 28 69 75 que da la Junta.
- **Procedentes solo de prensa, no se publican** hasta encontrar el comunicado oficial:
  - Cifras: «al menos 10» fallecidos (dato oficial vía CMM, 10:37); otras cifras de 30, 40 y 46 sin verificar; 544 pasajeros; 397 en el AVE 2080 y 147 en el Iryo 6076.
  - Fichas de los trenes, hospitales, estado de la línea, PAVAFF de Renfe y punto psicosocial de Atocha.

## 7. Estado de publicación

**NO apto para publicación: 0 de 20 controles cumplidos.** Falta:

1. Verificar la identidad del promotor.
2. Que un profesional decida si se aplica la LSSI. El análisis preliminar indica que probablemente no, al no haber actividad económica. El RGPD se aplica igualmente.
3. Asignar el dominio y elegir el alojamiento. Candidato: Cloudflare Pages, plan gratuito.
4. Revisión jurídica de los 8 textos legales.
5. Encontrar los comunicados oficiales de los datos que hoy solo vienen de prensa y verificarlos entre dos personas.
6. Formar un equipo de al menos dos personas con turnos durante 72 horas.
7. Validación de los textos de apoyo emocional por un profesional de la psicología, y revisión de las traducciones.
8. Marcar las casillas de `docs/operacion/checklist-publicacion.md`.

## 8. Uso técnico

```
npm install
npm run build:preview          # vista previa privada → dist/index.html
node scripts/publish-gate.mjs --informe   # 17 controles
node --test tests/ciclo.test.mjs          # 22 pruebas
python3 tests/navegador.py                # 24 pruebas de navegador
node scripts/aprobar.mjs --lista          # propuestas pendientes
```

- **Informe completo:** `docs/AUDITORIA-V3.md`.
- **Asuntos legales pendientes:** `docs/legal/pendientes-revision.md`.
- **Procedimientos:** `docs/operacion/procedimientos.md`.

## 9. Mensaje para empezar la conversación nueva

> Continuamos el proyecto ESTAMOS CONTIGO. Lee el documento TRASPASO-ESTAMOS-CONTIGO.md y el código de estamos-contigo-v0.4.1.zip de este proyecto. Es una web independiente sin ninguna relación con PRELUXINT ni con XORVIUM. Mantén todas las normas del apartado 3. Siguiente tarea: [escribe aquí lo que quieras hacer].


## Cambio de norma — 28/10/2026, 12:47 (decisión de Lin)

Lin vio la web y comprobó que, con la regla estricta de la V3 (solo webs oficiales), no aportaba casi nada: las cifras y los datos útiles que ya circulaban no aparecían. Eligió la opción «Útil y prudente»:
- **Se publican también datos de prensa**, siempre con el **organismo** que los da y el **medio** que los publica, enlazado («Según la Junta de Castilla-La Mancha, 12:43. Publicado por Libertad Digital»).
- Se mantiene: verificación por dos personas antes de publicar, ningún dato personal de afectados, ninguna cifra sin autor, ninguna estimación propia, prioridad del comunicado oficial cuando exista.
- El ciclo automático sigue leyendo solo webs oficiales.
- Control C09 de la puerta pasa a «Ninguna información sin fuente atribuida y enlazada».
- **Riesgo que aumenta (para la revisión jurídica):** responsabilidad por reproducir cifras de prensa que luego resulten erróneas. Mitigación: atribución expresa, hora, enlace, historial de cifras y rectificación inmediata.

## Publicación automática cada hora — 28/10/2026, 13:08 (decisión de Lin)

- No hay segunda persona. Claude actualiza y publica sola cada hora, sin revisión previa. Las cifras de víctimas solo se publican si un medio las atribuye a un organismo. Nunca se publican datos personales.
- Tarea programada «ESTAMOS CONTIGO — actualización cada hora» (id `trig_01WtYq4Xaka35Vu3CoUfbD96`): se ejecuta a las hh:13 (hora UTC), es decir, a las 14:13, 15:13… hora peninsular. Funciona con aprobación automática y envía avisos al móvil.
- Guía que sigue la tarea: `docs/operacion/actualizacion-automatica.md`. El código viaja dentro del propio Artifact (`fuente/estamos-contigo.tgz.b64.txt`).
- Para pararla: pedírselo a Claude o desactivar la tarea en sus ajustes.

## Publicación sin revisión jurídica — 28/10/2026, 13:18 (decisión de Lin)

Lin decide publicar ya, con la revisión jurídica y la decisión sobre la LSSI pendientes. Se genera la versión pública con `npm run build:publico-directo` (sin la puerta de 17 controles). Alojamiento provisional: el Artifact de claude.ai. Lin pulsa «Compartir» para hacerlo público. Lin pide un dominio independiente de su Vercel (13:19).
