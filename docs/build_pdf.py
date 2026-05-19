#!/usr/bin/env python3
"""
MarkaRadar v2 Hibrit Strateji — PDF builder.
Birleştirir: ana strateji + ekler. Çıktı: MarkaRadar_v2_Hibrit_Strateji.pdf
"""
import re
import os
import ctypes
import ctypes.util
from pathlib import Path

# Preload macOS Homebrew libs so weasyprint can find them (SIP blocks DYLD_LIBRARY_PATH for system Python)
BREW_LIB = "/opt/homebrew/lib"
for libname in [
    "libgobject-2.0.0.dylib",
    "libpango-1.0.0.dylib",
    "libpangoft2-1.0.0.dylib",
    "libharfbuzz.0.dylib",
    "libfontconfig.1.dylib",
    "libfreetype.6.dylib",
    "libcairo.2.dylib",
]:
    p = os.path.join(BREW_LIB, libname)
    if os.path.exists(p):
        try:
            ctypes.CDLL(p, mode=ctypes.RTLD_GLOBAL)
        except OSError:
            pass

# Patch ctypes.util.find_library so weasyprint's cffi.dlopen calls find the brew libs by short name
_orig_find_library = ctypes.util.find_library
def _patched_find_library(name):
    candidates = [
        f"lib{name}.dylib",
        f"lib{name}.0.dylib",
        f"lib{name}.1.dylib",
        f"lib{name}.2.dylib",
        f"lib{name}.6.dylib",
    ]
    # Special-case weasyprint's hyphenated names
    if name == "gobject-2.0-0":
        candidates = ["libgobject-2.0.0.dylib", "libgobject-2.0.dylib"]
    elif name == "pango-1.0-0":
        candidates = ["libpango-1.0.0.dylib", "libpango-1.0.dylib"]
    elif name == "harfbuzz-0":
        candidates = ["libharfbuzz.0.dylib", "libharfbuzz.dylib"]
    elif name == "fontconfig-1":
        candidates = ["libfontconfig.1.dylib", "libfontconfig.dylib"]
    elif name == "pangoft2-1.0-0":
        candidates = ["libpangoft2-1.0.0.dylib", "libpangoft2-1.0.dylib"]
    for c in candidates:
        p = os.path.join(BREW_LIB, c)
        if os.path.exists(p):
            return p
    return _orig_find_library(name)
ctypes.util.find_library = _patched_find_library

import markdown
from weasyprint import HTML, CSS

BASE = Path("/Users/emre/Desktop/brand")
MAIN_MD = BASE / "MarkaRadar_v2_Hibrit_Strateji.md"
EKLER_MD = BASE / "MarkaRadar_v2_Ekler.md"
OUT_PDF = BASE / "MarkaRadar_v2_Hibrit_Strateji.pdf"

# Birleştir
main_text = MAIN_MD.read_text(encoding="utf-8")
ekler_text = EKLER_MD.read_text(encoding="utf-8")

# Ekler dosyasının başındaki H1'leri tutarlı yapmak için ana doküman bitir, ekler başlat
combined = main_text + "\n\n<div class='page-break'></div>\n\n" + ekler_text

# Markdown → HTML
md = markdown.Markdown(extensions=["tables", "fenced_code", "toc", "sane_lists"])
html_body = md.convert(combined)

# Page break placeholder işle
html_body = html_body.replace(
    "<p><div class='page-break'></div></p>",
    "<div class='page-break'></div>",
)

# CSS — orijinal PDF tarzında: lacivert başlıklar, kod blokları, profesyonel layout
css_text = """
@page {
    size: A4;
    margin: 20mm 18mm 22mm 18mm;
    @bottom-center {
        content: "MarkaRadar v2 Hibrit Strateji · Sayfa " counter(page) " / " counter(pages);
        font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
        font-size: 8pt;
        color: #94a3b8;
    }
}

@page:first {
    @bottom-center { content: ""; }
}

* {
    box-sizing: border-box;
}

html {
    font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
    font-size: 10pt;
    line-height: 1.55;
    color: #0f172a;
}

body {
    margin: 0;
    padding: 0;
}

h1 {
    font-size: 22pt;
    font-weight: 800;
    color: #0a1f4a;
    margin: 28pt 0 14pt 0;
    padding-bottom: 8pt;
    border-bottom: 2.5pt solid #1e40af;
    page-break-before: always;
    page-break-after: avoid;
}

h1:first-of-type {
    page-break-before: avoid;
    font-size: 26pt;
    border-bottom-width: 3pt;
}

h2 {
    font-size: 15pt;
    font-weight: 700;
    color: #0a1f4a;
    margin: 22pt 0 10pt 0;
    padding-bottom: 4pt;
    border-bottom: 1pt solid #cbd5e1;
    page-break-after: avoid;
}

h3 {
    font-size: 12pt;
    font-weight: 700;
    color: #1e3a8a;
    margin: 16pt 0 6pt 0;
    page-break-after: avoid;
}

h4 {
    font-size: 11pt;
    font-weight: 700;
    color: #1e3a8a;
    margin: 12pt 0 4pt 0;
    page-break-after: avoid;
}

p {
    margin: 6pt 0;
    text-align: justify;
}

strong {
    color: #0a1f4a;
    font-weight: 700;
}

em {
    color: #334155;
}

ul, ol {
    margin: 6pt 0 6pt 0;
    padding-left: 18pt;
}

li {
    margin: 2pt 0;
}

li > ul, li > ol {
    margin: 2pt 0;
}

a {
    color: #1e40af;
    text-decoration: none;
}

code {
    font-family: 'JetBrains Mono', 'SF Mono', Consolas, 'Courier New', monospace;
    font-size: 8.5pt;
    background: #f1f5f9;
    color: #be185d;
    padding: 1pt 4pt;
    border-radius: 3pt;
}

pre {
    font-family: 'JetBrains Mono', 'SF Mono', Consolas, 'Courier New', monospace;
    background: #0f172a;
    color: #e2e8f0;
    padding: 10pt 12pt;
    border-radius: 5pt;
    font-size: 8.2pt;
    line-height: 1.4;
    overflow-x: hidden;
    white-space: pre-wrap;
    word-wrap: break-word;
    page-break-inside: avoid;
    margin: 8pt 0;
}

pre code {
    background: transparent;
    color: inherit;
    padding: 0;
    font-size: inherit;
}

table {
    border-collapse: collapse;
    width: 100%;
    margin: 8pt 0;
    font-size: 9pt;
    page-break-inside: avoid;
}

th {
    background: #1e40af;
    color: white;
    font-weight: 700;
    text-align: left;
    padding: 6pt 8pt;
    border: 1pt solid #1e40af;
}

td {
    padding: 5pt 8pt;
    border: 1pt solid #cbd5e1;
    vertical-align: top;
}

tr:nth-child(even) td {
    background: #f8fafc;
}

blockquote {
    border-left: 3pt solid #1e40af;
    background: #eff6ff;
    margin: 10pt 0;
    padding: 8pt 12pt;
    color: #1e3a8a;
    font-style: normal;
    border-radius: 0 4pt 4pt 0;
    page-break-inside: avoid;
}

blockquote p {
    margin: 4pt 0;
}

hr {
    border: none;
    border-top: 1pt solid #cbd5e1;
    margin: 16pt 0;
}

.page-break {
    page-break-before: always;
}

/* Kapak benzeri ilk sayfa için */
h1:first-of-type + p strong {
    display: inline-block;
    min-width: 100pt;
}

/* Vurgu işaretleri */
li:has(strong:first-child) > strong:first-child {
    color: #0a1f4a;
}

/* Çıkartılan kalın metin için iyileştirme */
.highlight {
    background: #fef3c7;
    padding: 2pt 4pt;
}
"""

# Tam HTML
full_html = f"""<!DOCTYPE html>
<html lang="tr">
<head>
<meta charset="utf-8">
<title>MarkaRadar v2 Hibrit Strateji</title>
</head>
<body>
{html_body}
</body>
</html>
"""

# Yazdır debug için (opsiyonel)
html_debug = BASE / "_debug.html"
html_debug.write_text(full_html, encoding="utf-8")
print(f"Debug HTML: {html_debug}")

# PDF üret
print("Generating PDF...")
HTML(string=full_html, base_url=str(BASE)).write_pdf(
    str(OUT_PDF),
    stylesheets=[CSS(string=css_text)],
)
print(f"✓ PDF oluştu: {OUT_PDF}")
print(f"  Boyut: {OUT_PDF.stat().st_size / 1024:.1f} KB")
