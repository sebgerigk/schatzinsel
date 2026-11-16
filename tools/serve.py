#!/usr/bin/env python3
"""Kleiner Entwicklungs-Server für die Schatzinsel.

Aufruf (im Projektordner):  python3 tools/serve.py [Port]

Wie `python3 -m http.server`, aber der Browser darf nichts zwischenspeichern –
so sieht man Änderungen sofort, auch auf dem iPad im gleichen WLAN.
"""
import http.server
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8137


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def log_message(self, fmt, *args):  # ruhige Konsole
        pass


Handler.extensions_map.update({".webmanifest": "application/manifest+json", ".m4a": "audio/mp4"})

if __name__ == "__main__":
    with http.server.ThreadingHTTPServer(("0.0.0.0", PORT), Handler) as server:
        print(f"Schatzinsel läuft auf http://localhost:{PORT}")
        server.serve_forever()
