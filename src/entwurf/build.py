"""Baut den Entwurf: setzt jede Seite aus src/entwurf/pages in die gemeinsame Vorlage ein.

Aufruf (aus dem Ordner vorschau):  python3 -I src/entwurf/build.py
Ergebnis: vorschau/entwurf/<seite>.html
"""
import html
import re
from pathlib import Path

SRC = Path(__file__).resolve().parent
OUT = SRC.parent.parent / "entwurf"
SITE_NAME = "Fokus Service AG"

# Menü wie auf der bisherigen Website: (Seite, Beschriftung, Unterseiten)
NAV = [
    ("index", "Home", []),
    ("unternehmen", "Unternehmen", [
        ("unternehmen", "Übersicht Unternehmen"),
        ("stellenvermittlung", "Stellenvermittlung"),
        ("firmenpartnerschaften", "Firmenpartnerschaften"),
        ("kmu-spezialsupport", "KMU Spezialsupport"),
        ("weitere-dienstleistungen", "Weitere Dienstleistungen"),
    ]),
    ("kandidaten", "Kandidaten", [
        ("kandidaten", "Übersicht Kandidaten"),
        ("stellensuchende", "Stellensuchende"),
        ("arbeitsmigration-integration", "Arbeitsmigration & Integration"),
    ]),
    ("transport", "Transport", []),
    ("integralbautreuhand", "Integralbautreuhand", []),
    ("zimmer", "Zimmer", []),
    ("team", "Team", []),
    ("kontakt", "Kontakt", []),
]

_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{}</svg>'
ICONS = {
    "phone": '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
    "mail": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    "arrow": '<path d="M5 12h14M13 6l6 6-6 6"/>',
    "chevron": '<path d="m6 9 6 6 6-6"/>',
    "info": '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    "warn": '<path d="M12 3 2 20h20L12 3z"/><path d="M12 10v4M12 17h.01"/>',
    "users": '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16 14.2a5 5 0 0 1 5.5 4.8"/>',
    "globe": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    "briefcase": '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 12h18"/>',
    "heart": '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
    "compass": '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
    "search": '<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
    "car": '<path d="M5 17H3v-5l2-5h14l2 5v5h-2"/><circle cx="7.5" cy="17" r="2"/><circle cx="16.5" cy="17" r="2"/><path d="M9.5 17h5M3 12h18"/>',
    "building": '<path d="M4 21V5l8-3v19M12 8h8v13M8 7h.01M8 11h.01M8 15h.01M16 12h.01M16 16h.01M2 21h20"/>',
    "bed": '<path d="M3 18V6M3 14h18v4M21 14v-2a3 3 0 0 0-3-3h-7v5"/><circle cx="7" cy="11" r="2"/>',
    "pin": '<path d="M12 21s-7-5.6-7-11a7 7 0 0 1 14 0c0 5.4-7 11-7 11z"/><circle cx="12" cy="10" r="2.5"/>',
}

CONTACT_BAND = """  <section class="contact-band" aria-labelledby="kontakt-band-titel">
    <div class="container">
      <div>
        <h2 id="kontakt-band-titel">Haben Sie Fragen? Wir sind gerne für Sie da.</h2>
        <p>Rufen Sie uns an oder schreiben Sie uns – wir nehmen uns Zeit für Sie.</p>
      </div>
      <div class="actions">
        <a class="btn btn--primary" href="tel:+41555081412">{{icon:phone}}055 508 14 12</a>
        <a class="btn btn--outline" href="mailto:info@fokusservice.ch">{{icon:mail}}E-Mail schreiben</a>
      </div>
    </div>
  </section>
"""


def icon(name: str) -> str:
    return _SVG.format(ICONS[name])


def render_icons(text: str) -> str:
    return re.sub(r"\{\{icon:([a-z]+)\}\}", lambda m: icon(m.group(1)), text)


def parse_page(path: Path) -> tuple[dict, str]:
    raw = path.read_text(encoding="utf-8")
    match = re.match(r"<!--(.*?)-->\s*", raw, re.S)
    if not match:
        raise ValueError(f"{path.name}: Kopfzeilen-Kommentar fehlt")
    meta = {}
    for line in match.group(1).strip().splitlines():
        key, _, value = line.partition(":")
        meta[key.strip()] = value.strip()
    for required in ("title", "description", "active"):
        if not meta.get(required):
            raise ValueError(f"{path.name}: '{required}' fehlt im Kopf")
    return meta, raw[match.end():]


CURRENT_ATTR = ' aria-current="page"'


def render_nav(slug: str, active: str) -> str:
    items = []
    for key, label, children in NAV:
        if children:
            is_active = " is-active" if key == active else ""
            sub = "\n".join(
                f'                <li><a href="{child}.html"{CURRENT_ATTR if child == slug else ""}>{html.escape(text)}</a></li>'
                for child, text in children
            )
            items.append(
                f'          <li class="has-sub">\n'
                f'            <button type="button" class="{is_active.strip()}" data-sub-toggle aria-expanded="false" aria-controls="sub-{key}">{html.escape(label)} {icon("chevron")}</button>\n'
                f'            <div class="sub" id="sub-{key}">\n              <ul>\n{sub}\n              </ul>\n            </div>\n          </li>'
            )
        else:
            current = CURRENT_ATTR if key == slug else ""
            css = ' class="nav-cta"' if key == "kontakt" else ""
            items.append(f'          <li><a href="{key}.html"{css}{current}>{html.escape(label)}</a></li>')
    return "\n".join(items)


def build() -> None:
    layout = (SRC / "layout.html").read_text(encoding="utf-8")
    OUT.mkdir(exist_ok=True)
    pages = sorted((SRC / "pages").glob("*.html"))
    for page in pages:
        slug = page.stem
        meta, body = parse_page(page)
        title = meta["title"] if slug == "index" else f'{meta["title"]} | {SITE_NAME}'
        band = "" if meta.get("contactband") == "nein" else CONTACT_BAND
        out = (layout
               .replace("{{TITLE}}", html.escape(title))
               .replace("{{DESCRIPTION}}", html.escape(meta["description"]))
               .replace("{{NAV}}", render_nav(slug, meta["active"]))
               .replace("{{CONTACT_BAND}}", band)
               .replace("{{CONTENT}}", body.rstrip()))
        (OUT / f"{slug}.html").write_text(render_icons(out), encoding="utf-8")
    print(f"{len(pages)} Seiten gebaut → {OUT}")


if __name__ == "__main__":
    build()
