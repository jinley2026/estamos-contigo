# Riesgos y asuntos pendientes de revisión profesional

> Lista para el profesional jurídico. Ningún punto se da por resuelto.

## Asuntos pendientes

1. **Titularidad (provisional, 28/10/2026 12:00)**: persona física promotora, José Antonio Marín García, Dos Hermanas (Sevilla), contacto jinleyreal@gmail.com. Identidad pendiente de verificación documental. No se vincula a ninguna empresa. Valorar la responsabilidad personal del promotor y la conveniencia de un seguro o de constituir una asociación.
2. **LSSI — análisis preliminar (no es asesoramiento jurídico)**:
   - La exposición de motivos de la Ley 34/2002 (BOE, texto consolidado de 23/01/2025, consultado el 28/10/2026) extiende el concepto de servicio de la sociedad de la información a servicios no remunerados por sus destinatarios «siempre que represente una actividad económica para el prestador».
   - Esta web no tiene publicidad, patrocinio, donaciones, venta ni ninguna otra contrapartida económica, y no está vinculada a una empresa. Por eso **es razonable sostener que la LSSI no le resulta aplicable** y que no le alcanzan las obligaciones de información del art. 10 (nombre, domicilio, NIF, etc.).
   - Riesgos de esa conclusión que debe valorar el profesional: (a) la definición literal del anexo de la LSSI [MEMORIA: no he podido leer el anexo en el texto consultado]; (b) que el promotor tenga actividad profesional o empresarial relacionada y la web pueda considerarse promocional; (c) criterios de la AEPD o tribunales sobre webs personales.
   - **Aunque la LSSI no se aplique, siguen aplicándose**: el RGPD y la LOPDGDD (la excepción doméstica del art. 2.2.c RGPD no cubre una web abierta al público [MEMORIA: jurisprudencia del TJUE, caso Lindqvist, a confirmar]), el art. 22.2 LSSI sobre cookies [verificar si depende de la aplicabilidad general de la LSSI], la responsabilidad civil por contenidos propios, el derecho al honor, intimidad e imagen (LO 1/1982) y la propiedad intelectual.
   - Mientras no decida un profesional (`site.json → regimenLegal.lssiAplicable = "pendiente"`), la web identifica al promotor con nombre, localidad y correo, avisa de que la cuestión está pendiente y **no publica NIF ni domicilio**. Si se decide que la LSSI se aplica, el NIF y el domicilio se añaden solo en el despliegue privado (`EC_NIF`, `EC_DOMICILIO`), nunca en el repositorio.
   - El art. 17 LSSI (enlaces) no da inmunidad sobre los resúmenes propios: de esos respondemos.
3. **Base jurídica** de los registros técnicos (interés legítimo) y redacción del test de ponderación.
4. **Almacenamiento local** de preferencias: confirmar su encaje como almacenamiento técnico exento de consentimiento (art. 22.2 LSSI).
5. **Transferencias internacionales** del proveedor de alojamiento/CDN.
6. **Responsabilidad civil** por información errónea: alcance real del aviso legal (no excluye la responsabilidad que la ley no permita excluir) y conveniencia de un seguro.
7. **Apariencia oficial**: confirmar que nombre, diseño, avisos y textos no inducen a confusión con organismos (riesgo de usurpación de funciones o competencia desleal).
8. **Citas de fuentes**: uso de titulares y enlaces a medios como referencia (derecho de cita, art. 32 LPI) sin reproducir contenido protegido.
9. **Mención de compañías** (Renfe, Iryo, Adif, Ouigo): uso descriptivo de sus nombres sin logotipos.
10. **Honor e intimidad** (LO 1/1982): garantizar que ningún contenido identifique a víctimas o terceros.
11. **Accesibilidad**: determinar si el Real Decreto 1112/2018 u otra normativa resulta exigible a una iniciativa privada de este tipo; se aplica WCAG 2.2 AA como buena práctica.
12. **Plantillas de «Avisar a mi familia»**: confirmar que no hay tratamiento de datos por parte del titular (el texto se genera y envía en el dispositivo del usuario).

13. **Contador de visitas**: si se activa con estadísticas agregadas del proveedor, confirmar base jurídica (interés legítimo), información en la política de privacidad y que el proveedor no usa cookies ni identificadores para ese cálculo.
14. **Derecho de rectificación** (LO 2/1984): si resulta aplicable a esta web y plazos.
15. **Etiqueta «Fuente oficial comprobada»**: confirmar que no puede confundirse con un sello o certificación oficial.

## Riesgos principales

| Riesgo | Mitigación implementada | Riesgo residual |
|---|---|---|
| Publicar un teléfono erróneo | Doble verificación obligatoria, caducidad automática, bloqueo de publicación | Error humano en la verificación |
| Información desactualizada | Plazos de revisión y modo seguro automático | Sin JavaScript solo se ve la hora de comprobación |
| Confusión con servicio oficial | Aviso permanente, sin logotipos, página de independencia | Percepción de algunos usuarios |
| Suplantación de la web por estafadores | Avisos de que no pedimos dinero ni datos ni enviamos mensajes | No evitable técnicamente |
| Tratamiento indebido de datos | Sin formularios ni base de datos; pruebas que lo verifican | Correos de contacto con datos de terceros |
| Agotamiento del equipo | Modo reducido y modo seguro | Depende de personas |
