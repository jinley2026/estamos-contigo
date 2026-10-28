# Ficha de tratamientos y proveedores (para revisión jurídica)

> Borrador preliminar redactado con ayuda de IA. No es asesoramiento jurídico. Requiere revisión profesional.

## Tratamientos

| # | Tratamiento | Datos | Origen | Finalidad | Base jurídica a confirmar | Conservación | Encargado |
|---|---|---|---|---|---|---|---|
| 1 | Registros técnicos del alojamiento | IP, fecha y hora, URL solicitada, agente de usuario | Navegador del visitante | Servir la web y seguridad (antiataques) | Interés legítimo (art. 6.1.f RGPD) | La que fije el proveedor; reducir al mínimo | Proveedor de alojamiento/CDN [PENDIENTE] |
| 2 | Correo de contacto y reclamaciones | Lo que la persona escriba en su correo | Remitente | Atender correcciones, reclamaciones y derechos | Interés legítimo / cumplimiento de obligación legal en el caso de derechos | Hasta resolver + plazo de prescripción a definir | Proveedor de correo [PENDIENTE] |
| 3 | Preferencias de lectura | `ec-texto`, `ec-contraste` | Navegador, solo si el usuario lo pide | Recordar la preferencia | Almacenamiento técnico solicitado por el usuario (art. 22.2 LSSI) — confirmar | Hasta que el usuario lo borre | Ninguno (no sale del dispositivo) |

| 4 | Estadística agregada de visitas (DESACTIVADA) | Totales diarios de páginas servidas calculados por el proveedor a partir de sus registros; nosotros solo recibimos números | Proveedor de alojamiento (API) | Mostrar el contador del pie | Interés legítimo — confirmar | Solo totales agregados, sin plazo especial | Proveedor de alojamiento [PENDIENTE] |

Responsable (provisional): José Antonio Marín García, persona física promotora, Dos Hermanas (Sevilla), jinleyreal@gmail.com. Identidad pendiente de verificación.

**No existen** otros tratamientos: sin formularios, cuentas, analítica comercial, cookies, píxeles, chatbot, SMS ni base de datos. Los mensajes de «Avisar a mi familia» no llegan a nuestros sistemas (comprobado por prueba automática, ver `docs/AUDITORIA.md`).

## Flujos hacia terceros iniciados por el usuario

| Acción del usuario | Qué pasa | Comentario para revisión |
|---|---|---|
| Pulsar «Enviar por WhatsApp» | El navegador abre `wa.me` con el texto en la URL | El texto viaja a WhatsApp (Meta) por decisión del usuario. Informado en privacidad. |
| Pulsar «Enviar por SMS» | Abre la app de mensajes del teléfono | Sin intermediarios propios. |
| Pulsar un enlace a una fuente | Abre la web de un tercero | `Referrer-Policy: no-referrer` evita enviar la URL de procedencia. |

## Proveedores candidatos

| Proveedor | Función | Datos que trata | País / transferencias | Contrato de encargo | Estado |
|---|---|---|---|---|---|
| Cloudflare (Pages) | Alojamiento y CDN | Registros técnicos | Red global; empresa con sede en EE. UU. → analizar mecanismo de transferencia | Sus condiciones incluyen un acuerdo de tratamiento de datos [MEMORIA: verificar] | Pendiente de elegir y revisar |
| Proveedor de correo | Buzón de contacto | Correos recibidos | [PENDIENTE] | [PENDIENTE] | Pendiente |
| Registrador de dominio | Dominio | Datos del titular del dominio | [PENDIENTE] | — | Pendiente |
| GitHub | Repositorio y ciclo automático de 30 min | Código y datos públicos del suceso; no recibe datos de visitantes | EE. UU. | Condiciones de GitHub | En uso solo en la vista previa local; repositorio por crear |
| Cloudflare (API de analítica) | Contador de visitas | Solo totales agregados | EE. UU. | — | DESACTIVADO; definición de «visitas» y filtrado de robots sin verificar |

## Evaluación de impacto

Con los tratamientos actuales (sin datos de salud, sin datos de afectados) una evaluación de impacto completa probablemente no sea obligatoria, pero esa conclusión debe validarla el profesional. Cualquier función de `docs/funciones-futuras.md` que trate datos de afectados **sí** la requeriría antes de activarse.
