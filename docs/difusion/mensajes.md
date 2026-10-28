# Materiales de difusión (borradores para revisar)

> **No difundir** hasta que: (1) el teléfono esté verificado por dos personas, (2) exista dominio definitivo, (3) se haya autorizado la publicación. No se publica nada automáticamente ni se envía a autoridades o particulares sin autorización.
> Marcadores: `[DOMINIO]` y `[TELÉFONO VERIFICADO]` se sustituyen cuando existan.

## Principios

- Primero el teléfono oficial, después la web.
- Siempre «iniciativa solidaria independiente», «no pedimos dinero ni datos».
- Sin fotos del accidente, sin cifras de víctimas, sin música dramática, sin emojis de alarma.
- Dominio completo, sin acortadores de enlaces.

## WhatsApp / Telegram (reenviable)

> Familiares de pasajeros de los trenes accidentados en Toledo: el teléfono oficial de información es el [TELÉFONO VERIFICADO]. En [DOMINIO] hay una guía con los canales oficiales verificados y qué hacer. Es una iniciativa solidaria independiente: no pide datos ni dinero. Emergencias: 112.

## Facebook / X

> Teléfono oficial para familiares de pasajeros del accidente ferroviario de Toledo: [TELÉFONO VERIFICADO].
> En [DOMINIO] reunimos los canales oficiales, los puntos de atención anunciados y el estado del servicio, cada dato con su fuente y hora de comprobación.
> Estamos Contigo es una iniciativa solidaria independiente. No somos un servicio oficial. Emergencias: 112.

## Instagram / TikTok

Una imagen o vídeo de texto sobre fondo blanco o azul oscuro: el teléfono grande, el dominio pequeño y el aviso de independencia. Sin música o con fondo neutro. Texto del pie:

> Si buscas información sobre un familiar que viajaba en los trenes accidentados en Toledo, llama al [TELÉFONO VERIFICADO]. Más información verificada en [DOMINIO]. Iniciativa solidaria independiente. No pedimos dinero ni datos.

## Nota para medios

> **Estamos Contigo**, guía ciudadana independiente sobre el accidente ferroviario de Toledo
>
> [DOMINIO] reúne en una sola página los canales oficiales para familiares, los puntos de atención anunciados por los organismos, el estado del servicio ferroviario y avisos contra estafas. Cada dato indica su fuente y la hora de su última comprobación, y se retira automáticamente si no se vuelve a verificar.
>
> No recoge datos personales, no localiza personas, no publica listados de víctimas ni pide dinero. Es una iniciativa sin ánimo de lucro, sin relación con las compañías ferroviarias ni con ningún organismo.
>
> Si la citan, les pedimos que pongan antes el teléfono oficial: [TELÉFONO VERIFICADO].
>
> Contacto: [correo de contacto del aviso legal].

## Asociaciones y organizaciones locales

> Hola. Somos Estamos Contigo, una iniciativa solidaria independiente que ha preparado una guía verificada para familiares y afectados por el accidente ferroviario de Toledo ([DOMINIO]). No recoge datos ni pide dinero. Si os parece útil, podéis compartirla con vuestras personas usuarias. Cualquier error que detectéis, por favor, comunicádnoslo en [correo] y lo corregiremos de inmediato.

## Cartel y QR

- Cartel A4: página `cartel.html` (borrador en `tests/capturas/12-cartel-borrador.pdf`). No incluye teléfono hasta que esté verificado.
- QR: se genera con `node scripts/generar-qr.mjs` solo cuando `dominio` esté completo en `site.json`.
