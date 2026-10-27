"""Rebuild index.html from the files in src/. Run: python build.py"""
import pathlib
s = pathlib.Path(__file__).parent / "src"
order = ["content1.js","content2.js","questions.js","content3.js","content4.js","content5.js","content6.js","engine.js","app.js"]
js = "\n".join((s / f).read_text(encoding="utf-8") for f in order)
reset = '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}body{margin:0;font-size:14px;font-family:system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>\n'
doc = ("<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n"
       "<meta name=\"viewport\" content=\"width=device-width,initial-scale=1,viewport-fit=cover\">\n"
       + reset + (s / "head.html").read_text(encoding="utf-8") + "</head>\n<body>\n"
       + (s / "body.html").read_text(encoding="utf-8")
       + "<script>\n(function(){\n" + js + "\n})();\n</script>\n</body>\n</html>\n")
(pathlib.Path(__file__).parent / "index.html").write_text(doc, encoding="utf-8")
print("Built index.html")
