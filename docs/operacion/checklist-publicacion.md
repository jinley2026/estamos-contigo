# Checklist de publicación — 17 controles (orden V3.0, §11)

`npm run build:public` se niega a compilar y el proyecto **no puede indicar «Apto para publicación»** mientras un solo control esté incumplido.
Cada control tiene una parte que comprueba el programa (`scripts/publish-gate.mjs`) y una confirmación humana: marca la casilla (`- [x]`) solo
cuando sea cierto, con quién y cuándo. Marcar una casilla no basta si la comprobación automática falla.

Para ver el estado: `node scripts/publish-gate.mjs --informe` (no bloquea; escribe `cola/estado-publicacion.json`, que se ve en el panel de administración de la vista previa).

- [ ] C01 Titular real identificado (identidad comprobada documentalmente; régimen LSSI decidido y, si aplica, NIF y domicilio cargados en el despliegue privado). Quién/cuándo:
- [ ] C02 Documentación legal revisada por un profesional (aviso legal, privacidad, cookies, condiciones, fuentes, rectificaciones, quiénes somos, aviso de independencia). Quién/cuándo:
- [ ] C03 Privacidad comprobada con el proveedor real (registros, IP, plazo de conservación, transferencias). Quién/cuándo:
- [ ] C04 Cookies auditadas en la web ya alojada (herramientas del navegador: ninguna cookie; solo ec-texto/ec-contraste en almacenamiento local). Quién/cuándo:
- [ ] C05 Proveedores revisados (alojamiento, GitHub, analítica agregada si se activa) y anotados en docs/legal/ficha-tratamientos-proveedores.md. Quién/cuándo:
- [ ] C06 Ausencia de datos personales de víctimas (revisión humana de todo el contenido, además del filtro automático). Quién/cuándo:
- [ ] C07 Ausencia de formularios sensibles (check-dist en modo público sin errores). Quién/cuándo:
- [ ] C08 Todas las fuentes enlazadas y abiertas a mano al menos una vez. Quién/cuándo:
- [ ] C09 Ninguna noticia sin origen oficial (lo «No confirmado oficialmente» no sale en la versión pública). Quién/cuándo:
- [ ] C10 Sistema de revisión editorial operativo: al menos dos personas con turnos para 72 h y acceso a aprobar.mjs. Quién/cuándo:
- [ ] C11 Rectificaciones disponibles: página publicada y correo atendido. Quién/cuándo:
- [ ] C12 Sin credenciales expuestas (escaneo automático + revisión de secretos de GitHub). Quién/cuándo:
- [ ] C13 Pruebas de seguridad satisfactorias (tests de navegador, cabeceras CSP en el alojamiento real). Quién/cuándo:
- [ ] C14 Información caducada correctamente marcada (probado cambiando la hora del equipo). Quién/cuándo:
- [ ] C15 Responsable de mantenimiento designado y localizable. Quién/cuándo:
- [ ] C16 Protocolo de retirada de información y suspensión del servicio conocido por el equipo (docs/operacion/procedimientos.md). Quién/cuándo:
- [ ] C17 Revisión profesional de las obligaciones jurídicas pendientes (docs/legal/pendientes-revision.md). Quién/cuándo:

## Controles adicionales que también bloquean
- [ ] A01 Textos de apoyo emocional validados por un profesional de la psicología. Quién/cuándo:
- [ ] A02 Traducciones revisadas por hablantes competentes (las no revisadas se retiran). Quién/cuándo:
- [ ] A03 Autorización expresa del titular para publicar y difundir. Quién/cuándo:
