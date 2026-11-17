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


# ---------- Betonte Wörter für Fehler beim Schreiben ----------
# Vertippt sich das Kind, spricht Koko das Wort noch einmal und dehnt dabei
# den Laut, an dem der Fehler passiert ist: Schnecke -> „Schneeeeeeeecke".
# Die Stimme dehnt nur, was ausgeschrieben dasteht. Das klappt gut bei
# Selbstlauten, mäßig bei m, n, l, f, sch und ch – Laute wie k, t, p oder s
# lassen sich gar nicht halten. Dort macht Koko stattdessen eine kleine Pause
# vor dem Laut (Ra-kete), bei doppelten Mitlauten an der Silbengrenze (Son-ne).

STRETCH = 8                       # so oft steht der gedehnte Buchstabe da
VOWELS = "aeiouäöüy"
LONG_VOWELS = ["ie", "ei", "ai", "au", "eu", "äu", "aa", "ee", "oo"]
HOLD = ["sch", "ch", "m", "n", "l", "f"]     # Mitlaute, die sich halten lassen


def units(word):
    """Zerlegt ein Wort in Laute: [(start, ende, art)]; art ist 'vowel', 'hold', 'double' oder 'stop'."""
    low = word.lower()
    out, i = [], 0
    while i < len(low):
        rest = low[i:]
        if rest.startswith("sch"):
            out.append((i, i + 3, "hold")); i += 3; continue
        if i == 0 and rest[:2] in ("st", "sp"):
            out.append((i, i + 2, "stop")); i += 2; continue
        two = rest[:2]
        if two in LONG_VOWELS or (len(two) == 2 and two[0] in VOWELS and two[1] == "h"
                                   and (i + 2 == len(low) or low[i + 2] not in VOWELS)):
            out.append((i, i + 2, "vowel")); i += 2; continue
        if two == "ch":
            out.append((i, i + 2, "hold")); i += 2; continue
        if two in ("ck", "tz") or (len(two) == 2 and two[0] == two[1] and two[0] not in VOWELS):
            out.append((i, i + 2, "double")); i += 2; continue
        c = low[i]
        out.append((i, i + 1, "vowel" if c in VOWELS else "hold" if c in HOLD else "stop"))
        i += 1
    return out


def has_vowel(text):
    return any(c in VOWELS for c in text.lower())


def stressed(word, unit, cuts):
    """Wie Koko das Wort mit Betonung auf diesem Laut spricht (oder das Wort selbst).
    cuts: Stellen der Silbengrenzen im Wort (aus „syl" in words.json)."""
    a, b, kind = unit
    head, part, tail = word[:a], word[a:b], word[b:]
    if kind == "vowel":
        # Bei ie und Dehnungs-h wird der erste Buchstabe gedehnt (Biiiiene, Kuuuuh), sonst der letzte (Eiiiimer).
        if part.lower() == "ie" or part.lower().endswith("h"):
            return head + part[0] + part[0].lower() * (STRETCH - 1) + part[1:] + tail
        return head + part + part[-1].lower() * (STRETCH - 1) + tail
    if kind == "hold":
        sound = part.lower()
        return head + part + sound * ((STRETCH - 1) // len(sound) if len(sound) > 1 else STRETCH - 1) + tail
    if kind == "double":
        # Silbengrenze zwischen den beiden Buchstaben, wenn danach noch ein Selbstlaut kommt (Son-ne, Schne-cke).
        if has_vowel(tail):
            cut = a + 1 if part[0] == part[1] or part == "tz" else a
            return word[:cut] + "-" + word[cut:]
        if part.lower()[0] in HOLD:
            return head + part + part[-1].lower() * (STRETCH - 2) + tail
        return word
    # Nicht dehnbar: kleine Pause direkt am Laut – an einer Silbengrenze (Kis-te, Ker-ze)
    # oder gleich nach einem Selbstlaut (Ra-kete). Mitten in „Kr" oder „Schw" klänge es buchstabiert.
    for cut in (a, b):
        if cut in cuts:
            return word[:cut] + "-" + word[cut:]
    if head and head[-1].lower() in VOWELS and has_vowel(tail):
        return head + "-" + word[a:]
    return word


def emphasis_table():
    """{Wort: [betonte Fassung je Buchstabe]} für alle Wörter aus words.json."""
    table = {}
    for entry in load("words.json"):
        word = entry["w"]
        cuts, at = set(), 0
        for syl in entry["syl"].split("-")[:-1]:
            at += len(syl)
            cuts.add(at)
        per_letter = [None] * len(word)
        for unit in units(word):
            text = stressed(word, unit, cuts)
            for k in range(unit[0], unit[1]):
                per_letter[k] = text
        table[word] = per_letter
    return table


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
    for per_letter in emphasis_table().values():
        texts.extend(per_letter)
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
    with open(os.path.join(OUT, "emphasis.json"), "w", encoding="utf-8") as f:
        json.dump(emphasis_table(), f, ensure_ascii=False, indent=1)
    print(f"{len(index)} Clips im Index, {made} neu erzeugt (Stimme: {VOICE})")


if __name__ == "__main__":
    main()
