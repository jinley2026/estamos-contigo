# Procedimientos legales y de seguridad (borradores)

> Borrador preliminar redactado con ayuda de IA. No es asesoramiento jurídico. Requiere revisión profesional antes del lanzamiento.

## 1. Corrección de errores

Ver `docs/operacion/procedimientos.md`, apartado 4. Plazo objetivo: corregir un dato operativo erróneo (teléfono, punto, horario) en menos de 30 minutos desde que se detecta; resto de errores en menos de 24 horas. La corrección es pública en la fe de erratas.

## 2. Atención de reclamaciones

1. Entrada única: correo de contacto del aviso legal.
2. Acuse de recibo en 48 h como máximo.
3. Si la reclamación señala un error de información, se aplica primero el procedimiento de corrección.
4. Respuesta motivada en un mes como máximo.
5. Registro interno de reclamaciones sin más datos personales de los necesarios; se elimina al cierre según el apartado 5.

## 3. Ejercicio de derechos de protección de datos

1. Entrada: correo de privacidad.
2. Verificar la identidad solo si es necesario y con el mínimo de datos.
3. Responder en un mes (prorrogable dos meses en casos complejos, informando al interesado).
4. Como la web no guarda datos identificativos, lo habitual será informar de que no constan datos más allá de los registros técnicos del alojamiento, y de su plazo de conservación.
5. Informar siempre del derecho a reclamar ante la AEPD.

## 4. Respuesta a incidentes de seguridad

| Fase | Acción | Responsable |
|---|---|---|
| Detección | Alerta del comprobador de disponibilidad, aviso de un usuario o revisión del historial de Git | Cualquier miembro |
| Contención (inmediata) | Revertir al último despliegue correcto; si hay contenido alterado, pasar a modo `reducido` o retirar la web; revocar accesos comprometidos | Coordinador técnico |
| Evaluación (< 24 h) | ¿Hubo datos personales afectados? ¿Se publicó información falsa? | Responsable + técnico |
| Notificación | Si hay brecha de datos personales con riesgo: notificar a la AEPD en un máximo de 72 h (art. 33 RGPD) y, si el riesgo es alto, a los afectados (art. 34) | Responsable |
| Comunicación | Si se difundió información falsa: corrección pública por los mismos canales | Responsable editorial |
| Cierre | Informe interno con causa, impacto y medidas | Responsable |

Supuestos específicos:

- **Web clonada o suplantada**: aviso en la portada y en alertas de estafas, comunicación a INCIBE (017) [MEMORIA: verificar] y denuncia.
- **Cuenta de administración comprometida**: revocar sesiones y tokens, rotar credenciales, revisar todos los commits desde el último correcto.

## 5. Conservación y eliminación

| Información | Plazo | Al vencer |
|---|---|---|
| Registros técnicos del alojamiento | El mínimo configurable por el proveedor [PENDIENTE: confirmar] | Borrado automático del proveedor |
| Correos de contacto y reclamaciones | Hasta su resolución + plazo legal de prescripción que indique el profesional | Borrado |
| Historial de Git del contenido | Indefinido: no contiene datos personales | Archivar al cierre |
| Iniciales de verificadores en `verificadoPor` | Mientras el servicio esté activo | Se pueden eliminar al cierre; no se publican nunca en la web |
