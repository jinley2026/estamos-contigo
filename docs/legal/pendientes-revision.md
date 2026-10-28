# Riesgos y asuntos pendientes de revisión profesional

> Lista para el profesional jurídico. Ningún punto se da por resuelto.

## Asuntos pendientes

1. **Titularidad**: quién actúa como responsable (persona física, asociación u otra entidad). Implicaciones de que sea una persona física (responsabilidad personal, exposición de su domicilio en el aviso legal conforme al art. 10 LSSI).
2. **LSSI**: confirmar si un sitio sin actividad económica está sujeto a todas las obligaciones de información del art. 10 y qué datos son exigibles.
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

## Riesgos principales

| Riesgo | Mitigación implementada | Riesgo residual |
|---|---|---|
| Publicar un teléfono erróneo | Doble verificación obligatoria, caducidad automática, bloqueo de publicación | Error humano en la verificación |
| Información desactualizada | Plazos de revisión y modo seguro automático | Sin JavaScript solo se ve la hora de comprobación |
| Confusión con servicio oficial | Aviso permanente, sin logotipos, página de independencia | Percepción de algunos usuarios |
| Suplantación de la web por estafadores | Avisos de que no pedimos dinero ni datos ni enviamos mensajes | No evitable técnicamente |
| Tratamiento indebido de datos | Sin formularios ni base de datos; pruebas que lo verifican | Correos de contacto con datos de terceros |
| Agotamiento del equipo | Modo reducido y modo seguro | Depende de personas |
