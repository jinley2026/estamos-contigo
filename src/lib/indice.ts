// Índice de búsqueda construido en la compilación con información publicable (verificada en la versión pública).
// No contiene datos de personas: solo cifras agregadas, trenes, comunicados, teléfonos, puntos y preguntas frecuentes.
import { actualizaciones, canales, puntos, trenes, hecho, ultimahora, categoriasFAQ, visible, horaCorta, CATEGORIAS, tipoFuenteTexto } from './datos';
import { cifra, texto, TIPOS } from './afirmaciones';

export type Entrada = { titulo: string; respuesta: string; claves: string; fuente: { titulo: string; url: string } | null; fecha: string; enlace: string };
const e: Entrada[] = [];
const SIN_DATO = 'No disponemos de información oficial confirmada sobre esta cuestión.';

const sinonimos: Record<string, string> = {
  fallecidos: 'fallecidos muertos muertes victimas mortales cuantos murieron balance',
  heridos: 'heridos lesionados cuantos heridos balance',
  hospitalizados: 'hospitalizados ingresados hospital cuantos',
  altas: 'altas dados alta hospital',
  pasajeros: 'pasajeros viajeros personas iban bordo cuantos ocupacion',
  atendidos: 'atendidos atendidas personas atencion'
};

for (const tipo of Object.keys(TIPOS)) {
  const c = cifra(tipo, 'global');
  const a = c.vigente;
  e.push({
    titulo: `${TIPOS[tipo]} (cifra oficial)`,
    respuesta: a ? `${texto(a)}, según ${a.organismo}${c.discrepancias.length ? `. Otras cifras oficiales: ${c.discrepancias.map((d) => `${d.organismo}: ${texto(d)}`).join('; ')}` : ''}.` : SIN_DATO,
    claves: `${sinonimos[tipo]} total junta gobierno oficial ${a?.organismo ?? ''}`,
    fuente: a ? { titulo: a.fuente.titulo, url: a.fuente.url } : null,
    fecha: a ? a.fechaComunicado : '',
    enlace: 'index.html#balance'
  });
}

for (const t of trenes.filter((x) => visible(x))) {
  const p = cifra('pasajeros', `tren:${t.id}`).vigente;
  const nombre = `${t.servicio} ${t.numero}`;
  e.push({
    titulo: `${nombre} (${t.operador})`,
    respuesta: [
      t.origen && t.destino ? `Circulaba de ${t.origen} a ${t.destino}.` : 'Origen y destino: sin dato oficial.',
      t.salida ? `Salida: ${t.salida}.` : 'Hora de salida: sin dato oficial.',
      p ? `Pasajeros a bordo: ${texto(p)}, según ${p.organismo}.` : 'Pasajeros a bordo: sin dato oficial.'
    ].join(' '),
    claves: `tren ${t.servicio} ${t.numero} ${t.operador} ${t.origen} ${t.destino} salio sale salida origen destino desde hacia iba pasajeros viajeros bordo cuantos`,
    fuente: p ? { titulo: p.fuente.titulo, url: p.fuente.url } : { titulo: t.fuente.titulo, url: t.fuente.url },
    fecha: p ? p.fechaComunicado : t.comprobadoEn,
    enlace: 'index.html#trenes'
  });
}

e.push({
  titulo: 'Qué ha pasado, cuándo y dónde',
  respuesta: `${hecho.descripcion} ${hecho.lugar} Hora: ${horaCorta(hecho.hora)} del 28 de octubre.`,
  claves: 'que ha pasado ocurrido sucedido accidente cuando donde hora lugar urda toledo alcance choque colision',
  fuente: { titulo: hecho.fuentes[0].titulo, url: hecho.fuentes[0].url },
  fecha: hecho.hora,
  enlace: 'trenes.html'
});
e.push({
  titulo: 'Organismos que trabajan en la emergencia',
  respuesta: hecho.organismos.join(', ') + '.',
  claves: 'organismos quien trabaja emergencia rescate ume guardia civil bomberos sescam cruz roja proteccion civil',
  fuente: hecho.fuenteOrganismos,
  fecha: '',
  enlace: 'trenes.html#organismos'
});
e.push({
  titulo: 'Situación de la línea ferroviaria',
  respuesta: `${ultimahora.linea.estado}. ${ultimahora.linea.detalle}`,
  claves: 'linea circulacion interrumpida suspendida cortada trenes servicio restablecimiento alta velocidad madrid andalucia sevilla hora',
  fuente: ultimahora.linea.fuente,
  fecha: ultimahora.linea.comprobadoEn,
  enlace: 'viaje-afectado.html'
});
e.push({
  titulo: 'Centros a los que se traslada a los heridos',
  respuesta: ultimahora.hospitales.lista.map((h) => `${h.centro} (${h.papel.toLowerCase()})`).join('; ') + '. ' + ultimahora.hospitales.aviso,
  claves: 'hospital hospitales donde llevan trasladan heridos centro salud asistencia sanitaria toledo ciudad real alcazar consuegra',
  fuente: ultimahora.hospitales.lista[0].fuente,
  fecha: ultimahora.hospitales.comprobadoEn,
  enlace: 'index.html#asistencia'
});

for (const a of actualizaciones) {
  e.push({
    titulo: a.titulo,
    respuesta: a.resumen,
    claves: `${a.organismo} ${CATEGORIAS[a.categoria] ?? ''} comunicado dijo informa ${a.categoria === 'renfe' ? 'billetes cambios anulaciones' : ''}`,
    fuente: { titulo: `${tipoFuenteTexto(a.tipoFuente)}: ${a.fuente.titulo}`, url: a.fuente.url },
    fecha: a.fechaComunicado,
    enlace: 'actualizaciones.html'
  });
}

for (const c of canales.filter((x) => x.telefono && visible(x))) {
  e.push({
    titulo: `Teléfono: ${c.organismoCorto ?? c.organismo}`,
    respuesta: `${c.telefonoVisible}. ${c.finalidad}${(c as any).discrepancia ? ' ' + (c as any).discrepancia : ''}`,
    claves: 'telefono numero llamar familiares informacion servicios oficiales ' + c.organismo,
    fuente: { titulo: c.fuentes[0].titulo, url: c.fuentes[0].url },
    fecha: c.comprobadoEn,
    enlace: 'busco-a-un-familiar.html'
  });
}

for (const p of puntos.filter((x) => visible(x))) {
  e.push({
    titulo: p.nombre,
    respuesta: `${p.funcion} ${p.organismo}. Horario: ${p.horario}.`,
    claves: 'punto atencion familiares servicios oficiales donde ir estacion ' + p.direccion,
    fuente: p.fuente,
    fecha: p.comprobadoEn,
    enlace: 'puntos-de-atencion.html'
  });
}

for (const cat of categoriasFAQ)
  for (const q of cat.preguntas)
    e.push({ titulo: q.p, respuesta: q.r, claves: cat.titulo, fuente: q.fuente, fecha: '', enlace: `preguntas-frecuentes.html#${cat.id}` });

export const indice = e.map((x) => ({ ...x, hora: x.fecha ? horaCorta(x.fecha) : '' }));
export const MENSAJE_SIN_DATO = SIN_DATO;
