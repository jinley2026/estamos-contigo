# Auditoría final — Estamos Contigo v0.1.0

Fecha: 28/10/2026, ~11:15 (hora peninsular). Entorno: espacio de trabajo en la nube con Node 22.23.4, Astro 7.4.2 y Chromium 153 sin interfaz.

**Estado de preparación: NO APTA PARA PUBLICACIÓN.** Vista previa privada completa y probada. La publicación está bloqueada por código y por requisitos que dependen de personas (ver apartado 5).

## 1. Funciones terminadas

| Función | Estado |
|---|---|
| Portada con aviso permanente, 112, idioma, versión ligera, teléfono destacado y 4 rutas | Terminada |
| Busco a un familiar (qué preparar, cómo funcionan los canales, qué no hacer) | Terminada |
| Iba en uno de los trenes + «Avisar a mi familia» (generación local, WhatsApp, SMS, copiar, compartir nativo, mención opcional, funciona sin JavaScript) | Terminada |
| Tenía un billete (estado de la línea, operadores, sin alternativas inventadas) | Terminada |
| Quiero ayudar (sin tablón de voluntarios ni donativos) | Terminada |
| Actualizaciones con fuente, nivel, fechas, estado y fe de erratas | Terminada |
| Puntos oficiales de atención | Terminada (1 punto, pendiente de verificación humana) |
| Preguntas frecuentes (10 categorías, 17 preguntas, sin chatbot) | Terminada |
| Ayuda emocional | Terminada, textos pendientes de validación profesional |
| Alertas de estafas | Terminada (avisos generales; ninguna alerta concreta contrastada) |
| Idiomas: es completo; en, fr, pt, it, de esenciales | Terminada, traducciones preliminares pendientes de revisión |
| Versión ligera sin estilos | Terminada |
| Cartel A4 (sin QR ni teléfono hasta que estén validados) | Terminada |
| Aviso legal, privacidad, cookies, condiciones, política editorial, independencia, contacto | Borradores marcados como no revisados |
| Caducidad automática de datos y modo seguro por falta de revisión | Terminada |
| Modos manuales reducido/cerrado y desactivación de módulos | Implementados; modo cerrado y reducido no probados en navegador |
| Bloqueo de publicación | Terminado y probado |
| CSP con hashes y cabeceras de seguridad | Terminado |

## 2. Pruebas ejecutadas y resultados (reales)

### Contenidos (`scripts/check-content.mjs`)
- Vista previa: 0 errores, 10 avisos (teléfono, punto y recursos sin doble verificación; 5 traducciones sin revisar).
- Modo publicación: 10 errores → bloquea, como debe.

### Sitio compilado (`scripts/check-dist.mjs`) — 14/14 superadas
Ningún `<form>`; sin campos de entrada salvo casillas; sin scripts ni estilos externos; todos los enlaces internos existen; todos los `tel:` corresponden a teléfonos de los datos; todas las páginas con título, idioma y CSP; imágenes con alternativo; todas las páginas < 50 KB sin comprimir (la mayor, ~23 KB); `_headers` presente; `robots.txt` bloquea la indexación; banda de vista previa presente.

### Navegador real (`tests/navegador.py`) — 15/15 superadas
1. axe-core (WCAG 2.0/2.1/2.2 A y AA): 0 violaciones en las 26 páginas a 360 px. Control: el mismo script detecta 8 tipos de violación en una página defectuosa de prueba.
2. Sin errores de consola ni bloqueos de CSP.
3. Ninguna petición de red a terceros al cargar las páginas.
4. Plantilla seleccionada se carga en el editor.
5. Mención al accidente opcional (se añade y se quita).
6. WhatsApp recibe exactamente el texto editado.
7. El texto del mensaje nunca llega a nuestro servidor.
8. Dato dentro de plazo: botón de llamada visible.
9. Dato caducado (2 h > 60 min): marcado como pendiente y botón de llamada oculto.
10. Más de 4 h sin revisión: aviso de modo seguro visible y «última actualización» oculta.
11. Sin JavaScript: 4 mensajes con enlace directo a WhatsApp.
12. Sin JavaScript: botón de llamada en la portada.
13. 320 px con texto grande: sin desplazamiento horizontal.
14. La preferencia de texto grande se recuerda.
15. Primer foco con Tab: «Saltar al contenido».

### Dependencias
`npm audit`: 0 vulnerabilidades conocidas (28/10/2026).

### Bloqueo de publicación
`npm run build:public`: bloqueado con 17 requisitos pendientes listados.

## 3. Pruebas NO ejecutadas (límites no verificados)

- Lector de pantalla real (NVDA, VoiceOver, TalkBack): no disponible en este entorno. axe no sustituye una prueba con lector.
- Móviles físicos y navegadores antiguos: solo se ha probado Chromium 153 con emulación móvil. No probado en Safari/iOS ni Android antiguos.
- Apertura real de WhatsApp y SMS en un teléfono: se verificó la URL generada, no la app.
- Web Share API: no se pudo probar (requiere dispositivo real).
- Prueba de carga: no realizada. La capacidad ante un pico depende del proveedor; sin cifras garantizadas.
- Conexión lenta (3G simulado): no medida; se infiere carga ligera por el tamaño (~21 KB por página, sin recursos externos).
- Cabeceras HTTP en el alojamiento real: solo se ha generado `_headers`; hay que comprobarlas tras desplegar.
- Modos `reducido` y `cerrado`: implementados, no probados en navegador.

## 4. Problemas detectados y corregidos durante el desarrollo

- El primer logotipo (dos círculos y una forma inferior dentro de un círculo) podía leerse como una cara triste. Se rediseñó como dos figuras sobre un cuadrado redondeado.
- Un atributo `style=""` en la página de viajes habría quedado bloqueado por la CSP. Se sustituyó por una clase.

## 5. Elementos pendientes de verificación (bloquean la publicación)

1. Titular: nombre, naturaleza, NIF, domicilio, correos y responsable editorial (`src/config/site.json`).
2. Dominio definitivo.
3. Teléfono 900 10 10 20: nivel 2 (medios que citan a InfoRenfe). Falta confirmarlo en un canal oficial de Renfe y la prueba de llamada por dos personas.
4. Punto psicosocial de Atocha: nivel 2 (medio que cita a Emergencias 112 Comunidad de Madrid). Falta la doble verificación.
5. Recursos de apoyo 112 y 024: falta validación; el 024 es un dato recordado, no comprobado hoy.
6. Teléfono de Iryo para este accidente: no encontrado. No se publica ninguno.
7. Revisión jurídica de los 6 documentos legales y de `docs/legal/pendientes-revision.md`.
8. Validación profesional de los textos de apoyo emocional.
9. Revisión de traducciones por hablantes competentes.
10. Elección del proveedor de alojamiento y revisión de sus registros, retención y transferencias.

## 6. Riesgos pendientes

Ver `docs/legal/pendientes-revision.md`. El principal riesgo operativo no es técnico: sin un equipo que verifique y revise en turnos durante 72 h, la web solo debe funcionar en modo reducido.

## 7. Costes y servicios necesarios

| Concepto | Coste | Estado |
|---|---|---|
| Alojamiento estático (Cloudflare Pages, plan gratuito) | 0 € según sus condiciones actuales; límite de ancho de banda no indicado en su página de límites | Por confirmar |
| Dominio | Del orden de 10-15 €/año (estimación, sin presupuesto real) | No contratado |
| Correo de contacto | 0 € con un buzón existente o gratuito | No creado |
| Revisión jurídica | Sin presupuesto real | Pendiente |
| Validación psicológica y traducciones | Posible voluntariado profesional | Pendiente |

No se ha contratado ningún servicio ni se ha publicado nada.
