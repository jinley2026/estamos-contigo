"""Pruebas en navegador real (Chromium sin interfaz) sobre dist/.

Uso:  python3 tests/navegador.py   (tras npm run build:preview)
Comprueba: accesibilidad automática (axe-core, WCAG 2.x A/AA), errores de consola y CSP,
peticiones de red a terceros, la herramienta «Avisar a mi familia», el control de caducidad,
el modo seguro, el funcionamiento sin JavaScript, el reflujo a 320 px y el orden de foco.
Genera capturas en tests/capturas/ y un informe en tests/resultados-navegador.json.
"""
import json, re, threading, http.server, functools, socketserver, pathlib, datetime, sys, urllib.parse
from playwright.sync_api import sync_playwright

RAIZ = pathlib.Path(__file__).resolve().parent.parent
DIST = RAIZ / "dist"
CAPT = RAIZ / "tests" / "capturas"
CAPT.mkdir(parents=True, exist_ok=True)
AXE = (RAIZ / "node_modules" / "axe-core" / "axe.min.js").read_text()

class Silencioso(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass

srv = socketserver.TCPServer(("127.0.0.1", 0), functools.partial(Silencioso, directory=str(DIST)))
PUERTO = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()
BASE = f"http://127.0.0.1:{PUERTO}/"

resultados = []
def prueba(nombre, ok, detalle=""):
    resultados.append({"prueba": nombre, "ok": bool(ok), "detalle": detalle})
    print(("OK    " if ok else "FALLO ") + nombre + (f" — {detalle}" if detalle and not ok else ""))

paginas = sorted(p.name for p in DIST.glob("*.html"))

with sync_playwright() as p:
    nav = p.chromium.launch()
    movil = dict(viewport={"width": 360, "height": 740}, device_scale_factor=2, is_mobile=True, has_touch=True, locale="es-ES", timezone_id="Europe/Madrid")

    # 1-3. Accesibilidad, consola y red en todas las páginas
    ctx = nav.new_context(**movil)
    externas, errores_consola, violaciones = [], [], {}
    for nombre in paginas:
        pg = ctx.new_page()
        pg.on("request", lambda r: externas.append(r.url) if not r.url.startswith(BASE) and not r.url.startswith("data:") else None)
        pg.on("console", lambda m, n=nombre: errores_consola.append(f"{n}: {m.text}") if m.type == "error" else None)
        pg.on("pageerror", lambda e, n=nombre: errores_consola.append(f"{n}: {e}"))
        pg.goto(BASE + nombre, wait_until="load")
        pg.add_script_tag(content=AXE) if False else pg.evaluate(AXE)
        r = pg.evaluate("""async () => (await axe.run(document, {runOnly: {type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}})).violations.map(v => ({id: v.id, impact: v.impact, n: v.nodes.length, ejemplo: v.nodes[0] && v.nodes[0].target.join(' ')}))""")
        if r: violaciones[nombre] = r
        ancho = pg.evaluate("[document.documentElement.scrollWidth, window.innerWidth]")
        if ancho[0] > ancho[1] + 1: violaciones.setdefault(nombre, []).append({"id": "desbordamiento-horizontal-360", "n": 1})
        pg.close()
    # El evaluate de axe no es una petición de red; las únicas externas serían de la propia página.
    prueba(f"Accesibilidad automática axe (WCAG 2.2 A/AA) sin violaciones en {len(paginas)} páginas", not violaciones, json.dumps(violaciones, ensure_ascii=False))
    prueba("Sin errores de consola ni bloqueos de CSP", not errores_consola, " | ".join(errores_consola[:8]))
    prueba("Ninguna petición de red a terceros al cargar las páginas", not externas, ", ".join(sorted(set(externas))[:8]))
    ctx.close()

    # 4. «Avisar a mi familia»: generación local y entrega a la app del usuario
    ctx = nav.new_context(**movil)
    pg = ctx.new_page()
    peticiones = []
    pg.on("request", lambda r: peticiones.append(r.url))
    pg.route("https://wa.me/**", lambda route: route.abort())
    pg.goto(BASE + "iba-en-el-tren.html")
    pg.get_by_role("button", name="Estoy bien, pero ahora no puedo hablar.").click()
    area = pg.locator("#texto-es")
    v1 = area.input_value()
    pg.get_by_label("Mencionar el accidente en el mensaje").check()
    v2 = area.input_value()
    pg.get_by_label("Mencionar el accidente en el mensaje").uncheck()
    v3 = area.input_value()
    area.fill("Estoy bien. Te llamo luego.")
    pg.screenshot(path=str(CAPT / "04-avisar-familia-movil.png"), full_page=False)
    with pg.expect_request(lambda r: r.url.startswith("https://wa.me/")) as info:
        pg.get_by_role("button", name="Enviar por WhatsApp").click()
    url_wa = info.value.url
    texto_wa = urllib.parse.parse_qs(urllib.parse.urlparse(url_wa).query).get("text", [""])[0]
    propias = [u for u in peticiones if u.startswith(BASE) and "texto" not in u]
    con_texto = [u for u in peticiones if u.startswith(BASE) and ("Estoy" in urllib.parse.unquote(u) or "llamo" in urllib.parse.unquote(u))]
    prueba("Plantilla seleccionada se carga en el editor", v1 == "Estoy bien, pero ahora no puedo hablar.", v1)
    prueba("La mención al accidente es opcional y se añade/quita", ("Toledo" in v2) and ("Toledo" not in v3), f"{v2} / {v3}")
    prueba("WhatsApp recibe exactamente el texto editado por el usuario", texto_wa == "Estoy bien. Te llamo luego.", texto_wa)
    prueba("El texto del mensaje nunca se envía a nuestro servidor", not con_texto, ", ".join(con_texto))
    ctx.close()

    # 5. Caducidad: 2 h después de la comprobación, el teléfono pasa a pendiente y se oculta el botón de llamada
    ctx = nav.new_context(**movil)
    pg = ctx.new_page()
    comprobado = json.loads((RAIZ / "src/data/canales.json").read_text())["canales"][0]["comprobadoEn"]
    t0 = datetime.datetime.fromisoformat(comprobado)
    pg.clock.install(time=(t0 + datetime.timedelta(minutes=30)))
    pg.goto(BASE + "index.html")
    fresco_visible = pg.locator(".tarjeta-tel .boton-llamar").is_visible()
    pg.screenshot(path=str(CAPT / "01-portada-movil.png"), full_page=True)
    pg.close()
    pg = ctx.new_page()
    pg.clock.install(time=(t0 + datetime.timedelta(hours=2)))
    pg.goto(BASE + "index.html")
    caducado = pg.locator(".tarjeta-tel").get_attribute("class")
    boton_oculto = not pg.locator(".tarjeta-tel .boton-llamar").is_visible()
    aviso = pg.locator(".tarjeta-tel .aviso-caducado").inner_text()
    pg.screenshot(path=str(CAPT / "05-telefono-caducado.png"), full_page=False)
    prueba("Dato fresco: botón de llamada visible", fresco_visible)
    prueba("Dato caducado (2 h > 60 min): se marca pendiente y se oculta el botón de llamada", "caducado" in caducado and boton_oculto, f"{caducado} / {aviso}")
    pg.close()

    # 6. Modo seguro: más de 4 h sin revisión editorial
    pg = ctx.new_page()
    rev = datetime.datetime.fromisoformat(json.loads((RAIZ / "src/config/site.json").read_text())["estadoOperativo"]["ultimaRevisionEditorial"])
    pg.clock.install(time=(rev + datetime.timedelta(hours=5)))
    pg.goto(BASE + "index.html")
    banda = pg.locator(".banda-modo-seguro").is_visible()
    ultima_oculta = not pg.locator(".ultima-hora").is_visible()
    pg.screenshot(path=str(CAPT / "06-modo-seguro.png"), full_page=False)
    prueba("Modo seguro automático tras 4 h sin revisión: aviso visible y se oculta «Última hora»", banda and ultima_oculta)
    ctx.close()

    # 7. Sin JavaScript
    ctx = nav.new_context(java_script_enabled=False, **movil)
    pg = ctx.new_page()
    pg.goto(BASE + "iba-en-el-tren.html")
    enlaces_wa = pg.locator(".sin-js a[href^='https://wa.me/?text=']").count()
    pg.screenshot(path=str(CAPT / "07-sin-javascript.png"), full_page=False)
    pg.goto(BASE + "index.html")
    tel_sin_js = pg.locator("a[href='tel:900101020']").count()
    prueba("Sin JavaScript: 4 mensajes con enlace directo a WhatsApp", enlaces_wa == 4, str(enlaces_wa))
    prueba("Sin JavaScript: portada con botón de llamada", tel_sin_js >= 1)
    ctx.close()

    # 8. Reflujo a 320 px con texto grande y orden de foco
    ctx = nav.new_context(viewport={"width": 320, "height": 640}, locale="es-ES", timezone_id="Europe/Madrid")
    pg = ctx.new_page()
    pg.goto(BASE + "index.html")
    pg.get_by_role("button", name="Texto más grande").click()
    w = pg.evaluate("[document.documentElement.scrollWidth, window.innerWidth]")
    prueba("320 px con texto grande: sin desplazamiento horizontal", w[0] <= w[1] + 1, str(w))
    pg.reload()
    persiste = pg.evaluate("document.documentElement.classList.contains('texto-grande')")
    prueba("La preferencia de texto grande se recuerda localmente", persiste)
    pg.keyboard.press("Tab")
    primero = pg.evaluate("document.activeElement.textContent.trim()")
    prueba("Primer elemento con Tab: «Saltar al contenido»", primero == "Saltar al contenido", primero)
    ctx.close()

    # V3 y contador: aviso de independencia, contador del pie y páginas legales en móvil (320 px)
    ctx = nav.new_context(viewport={"width": 320, "height": 640}, locale="es-ES", timezone_id="Europe/Madrid")
    pg = ctx.new_page()
    sin_contador, desbordes = [], []
    for f in ["index.html", "aviso-legal.html", "privacidad.html", "cookies.html", "condiciones-de-uso.html", "fuentes-y-verificacion.html", "rectificaciones.html", "quienes-somos.html", "comunicados.html"]:
        pg.goto(BASE + f)
        c = pg.locator("[data-contador-visitas]")
        if c.count() != 1 or not c.is_visible() or "Datos no disponibles" not in c.inner_text():
            sin_contador.append(f)
        w = pg.evaluate("[document.documentElement.scrollWidth, window.innerWidth]")
        if w[0] > w[1] + 1:
            desbordes.append(f"{f} {w}")
    pg.goto(BASE + "index.html")
    pg.locator("[data-contador-visitas]").scroll_into_view_if_needed()
    pg.screenshot(path=str(CAPT / "16-pie-contador-movil.png"), full_page=False)
    indep = pg.locator("#independencia").inner_text()
    pg.goto(BASE + "aviso-legal.html")
    aviso = pg.locator("main").inner_text()
    prueba("Contador del pie visible en móvil con «Datos no disponibles» (9 páginas)", not sin_contador, ", ".join(sin_contador))
    prueba("Páginas legales V3 sin desbordamiento a 320 px", not desbordes, "; ".join(desbordes))
    prueba("Portada: aviso de independencia con el texto de la V3 §6", "no pertenece a ninguna administración pública" in indep and "112" in indep)
    prueba("Aviso legal: promotor persona física, sin NIF ni domicilio inventados, sin XORVIUM",
           "José Antonio Marín García" in aviso and "Dos Hermanas" in aviso and "XORVIUM" not in aviso.upper() and not re.search(r"\b\d{8}[A-Z]\b", aviso), aviso[:200])
    ctx.close()

    # 13. Buscador de información aprobada (índice local; nada sale del dispositivo)
    ctx = nav.new_context(**movil)
    pg = ctx.new_page()
    salientes = []
    pg.on("request", lambda r: salientes.append(r.url) if not r.url.startswith(BASE) else None)
    pg.goto(BASE + "buscar.html")
    pg.locator("#consulta").fill("¿Cuántos pasajeros iban en el Iryo?")
    pg.wait_for_timeout(400)
    primero_txt = pg.locator(".resultado").first.inner_text()
    pg.locator("#consulta").fill("¿Cuál es el color del tren?")
    pg.wait_for_timeout(400)
    sin = pg.locator(".resultados").inner_text()
    pg.get_by_role("button", name="¿Qué tren salió de Madrid?").click()
    madrid = pg.locator(".resultado").first.inner_text()
    pg.screenshot(path=str(CAPT / "13-buscador.png"), full_page=False)
    prueba("Buscador: «¿Cuántos pasajeros iban en el Iryo?» responde con la cifra y su fuente", "147" in primero_txt and "Fuente" in primero_txt, primero_txt[:160])
    prueba("Buscador: pregunta sin respuesta comprobada muestra el aviso", "No disponemos de información oficial confirmada" in sin, sin[:120])
    prueba("Buscador: «¿Qué tren salió de Madrid?» encuentra el AVE 2080", "2080" in madrid, madrid[:120])
    prueba("Buscador: ninguna petición de red al buscar", not salientes, ", ".join(salientes))
    pg.goto(BASE + "comunicados.html")
    pg.get_by_role("button", name="Adif", exact=True).click()
    visibles = pg.locator(".comunicado:visible").count()
    adif = pg.locator(".comunicado[data-categoria='adif']:visible").count()
    prueba("Comunicados: el filtro por organismo muestra solo los de Adif", visibles == adif and adif > 0, f"{visibles}/{adif}")
    ctx.close()

    # 9. Capturas adicionales
    ctx = nav.new_context(**movil)
    pg = ctx.new_page()
    pg.clock.install(time=(t0 + datetime.timedelta(minutes=30)))
    for n, f in [("02-busco-familiar", "busco-a-un-familiar.html"), ("03-iba-en-el-tren", "iba-en-el-tren.html"), ("08-version-ligera", "ligera.html"), ("09-ingles", "en.html"), ("10-actualizaciones", "actualizaciones.html"), ("14-comunicados", "comunicados.html"), ("15-admin", "admin.html")]:
        pg.goto(BASE + f)
        pg.screenshot(path=str(CAPT / f"{n}.png"), full_page=True)
    ctx.close()
    ctx = nav.new_context(viewport={"width": 1280, "height": 900}, locale="es-ES", timezone_id="Europe/Madrid")
    pg = ctx.new_page()
    pg.clock.install(time=(t0 + datetime.timedelta(minutes=30)))
    pg.goto(BASE + "index.html")
    pg.screenshot(path=str(CAPT / "11-portada-escritorio.png"), full_page=False)
    pg.goto(BASE + "cartel.html")
    pg.pdf(path=str(CAPT / "12-cartel-borrador.pdf"), format="A4", print_background=True)
    ctx.close()
    nav.close()

srv.shutdown()
(RAIZ / "tests" / "resultados-navegador.json").write_text(json.dumps({"fecha": datetime.datetime.now().isoformat(timespec="seconds"), "resultados": resultados}, ensure_ascii=False, indent=2))
fallos = sum(1 for r in resultados if not r["ok"])
print(f"\n{len(resultados) - fallos}/{len(resultados)} pruebas de navegador superadas.")
sys.exit(1 if fallos else 0)
