#!/usr/bin/env python3
"""Erzeugt die deutschen Sprach-Clips für die App mit der macOS-Stimme.

Aufruf (im Projektordner):  python3 tools/gen-audio.py ["Petra (Premium)"]

Liest alle sprechbaren Texte aus content/*.json, erzeugt pro Text eine
kleine AAC-Datei in assets/audio/ und schreibt assets/audio/index.json
(Text -> Dateiname). Bereits vorhandene Clips werden nicht neu erzeugt.
"""
import hashlib
import json
import os
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "audio")
VOICE = sys.argv[1] if len(sys.argv) > 1 else "Petra (Premium)"
# Kurze Stille vor jedem Clip: ohne sie verschluckt die Tonausgabe gern die erste Silbe.
LEAD_IN = "[[slnc 250]] "
VERSION = "v2"

NUMBERS = ["null", "eins", "zwei", "drei", "vier", "fünf", "sechs", "sieben",
           "acht", "neun", "zehn", "elf", "zwölf", "dreizehn", "vierzehn",
           "fünfzehn", "sechzehn", "siebzehn", "achtzehn", "neunzehn", "zwanzig"]


def load(name):
    with open(os.path.join(ROOT, "content", name), encoding="utf-8") as f:
        return json.load(f)


def collect():
    texts = []
    for value in load("phrases.json").values():
        texts.extend(value if isinstance(value, list) else [value])
    texts.extend(w["w"] for w in load("words.json"))
    texts.extend(s["t"] for s in load("sentences.json"))
    for story in load("stories.json"):
        texts.extend(story["lines"])
        texts.append(story["q"])
    texts.extend(load("extras.json")["nichtNomen"])
    texts.extend("ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÜ")
    texts.append("Eszett")
    texts.extend(NUMBERS)
    seen, unique = set(), []
    for t in texts:
        if t not in seen:
            seen.add(t)
            unique.append(t)
    return unique


def main():
    os.makedirs(OUT, exist_ok=True)
    index = {}
    made = 0
    for text in collect():
        name = hashlib.sha1((VERSION + "|" + VOICE + "|" + text).encode("utf-8")).hexdigest()[:12] + ".m4a"
        target = os.path.join(OUT, name)
        if not os.path.exists(target):
            with tempfile.TemporaryDirectory() as tmp:
                aiff = os.path.join(tmp, "clip.aiff")
                subprocess.run(["say", "-v", VOICE, "-o", aiff, LEAD_IN + text], check=True)
                subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "64000",
                                "-c", "1", aiff, target], check=True)
            made += 1
        index[text] = name
    # Clips entfernen, die nicht mehr gebraucht werden
    keep = set(index.values())
    for f in os.listdir(OUT):
        if f.endswith(".m4a") and f not in keep:
            os.remove(os.path.join(OUT, f))
    with open(os.path.join(OUT, "index.json"), "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=1)
    print(f"{len(index)} Clips im Index, {made} neu erzeugt (Stimme: {VOICE})")


if __name__ == "__main__":
    main()
