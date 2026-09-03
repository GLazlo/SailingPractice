import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";

import { buildGrammar, NATO_ALPHABET } from "../src/domain/natoAlphabet";
import { splitWords } from "../src/domain/phrase";
import { buildCall, buildCallGrammar, NATURE_OPTIONS, type CallType } from "../src/domain/radioCalls";
import { numberToWords, SHIP_NAMES } from "../src/domain/shipIdentity";

const MODEL_NAME = "vosk-model-small-en-us-0.15";
const MODEL_TGZ = path.resolve(__dirname, `../public/models/${MODEL_NAME}.tgz`);
const GRAPH_MEMBER = `${MODEL_NAME}/graph/Gr.fst`;

// Vosk grammar mode can only return words the model knows. The model ships no
// words.txt, so the vocabulary is read out of the FST's symbol table. Anything
// this app can put into a grammar must appear there or it can never be heard —
// which is how "xray" and "juliett" ended up as dead entries.
const KNOWN_DEAD_NATO_FORMS = new Set(["xray", "juliett"]);

/**
 * Pull one member out of a .tgz. Done in process rather than by shelling out to
 * tar, which is not portable: the tar bundled with Git for Windows reads a
 * "F:\..." argument as a remote host and refuses.
 */
function readTarMember(archive: Buffer, member: string): Buffer {
  const BLOCK = 512;
  for (let offset = 0; offset + BLOCK <= archive.length; ) {
    const name = archive.toString("utf8", offset, offset + 100).replace(/\0.*$/, "");
    if (name.length === 0) break; // end-of-archive padding
    const size = parseInt(archive.toString("utf8", offset + 124, offset + 136).replace(/\0.*$/, "").trim(), 8) || 0;
    const dataStart = offset + BLOCK;
    if (name === member) return archive.subarray(dataStart, dataStart + size);
    offset = dataStart + Math.ceil(size / BLOCK) * BLOCK;
  }
  throw new Error(`${member} not found in the model archive`);
}

function extractGraph(): Buffer {
  return readTarMember(gunzipSync(readFileSync(MODEL_TGZ)), GRAPH_MEMBER);
}

const SYMBOL_TABLE_MAGIC = 2125658996;

/** Read the largest OpenFst symbol table embedded in the graph. */
function readVocabulary(buf: Buffer): Set<string> {
  let best: string[] = [];

  for (let offset = 0; offset + 4 <= buf.length; offset++) {
    if (buf.readInt32LE(offset) !== SYMBOL_TABLE_MAGIC) continue;
    try {
      const symbols = parseTable(buf, offset);
      if (symbols.length > best.length) best = symbols;
    } catch {
      // Not a symbol table after all; keep scanning.
    }
  }

  if (best.length === 0) throw new Error("No symbol table found in Gr.fst");
  return new Set(best);
}

function parseTable(buf: Buffer, offset: number): string[] {
  let p = offset + 4;
  const readString = (): string => {
    const length = buf.readInt32LE(p);
    p += 4;
    if (length < 0 || length > 1000 || p + length > buf.length) throw new Error("bad string");
    const value = buf.toString("latin1", p, p + length);
    p += length;
    return value;
  };

  readString(); // table name
  p += 8; // available key
  const size = Number(buf.readBigInt64LE(p));
  p += 8;
  if (size <= 0 || size > 5_000_000) throw new Error("bad size");

  const symbols: string[] = new Array(size);
  for (let i = 0; i < size; i++) {
    symbols[i] = readString();
    p += 8; // key
  }
  return symbols;
}

/** Every word this app can hand to the recognizer. */
function appVocabulary(): Map<string, string> {
  // word -> where it came from, so a failure says what to fix.
  const words = new Map<string, string>();
  const add = (word: string, source: string): void => {
    if (!words.has(word)) words.set(word, source);
  };
  // "[unk]" is Vosk's own control token, not something the model must know.
  const spokenWords = (form: string): string[] => (form === "[unk]" ? [] : splitWords(form));

  for (const form of buildGrammar()) {
    for (const word of spokenWords(form)) add(word, `NATO form "${form}"`);
  }

  const types: CallType[] = ["securite", "panpan", "mayday"];
  for (const type of types) {
    for (const nature of NATURE_OPTIONS[type]) {
      for (const shipName of SHIP_NAMES) {
        const call = buildCall(
          type,
          // A call sign covering letters and digits, and a nine-digit MMSI.
          { shipName, callSign: "QZ7", mmsi: "211234567" },
          {
            latitude: "54 12.5 S",
            longitude: "010 30.2 W",
            personsOnBoard: "47",
            workingChannel: "72",
            natureId: nature.id
          }
        );
        for (const form of buildCallGrammar(call)) {
          for (const word of spokenWords(form)) add(word, `${type}/${nature.id}/${shipName}`);
        }
      }
    }
  }

  // Positions and counts can produce any hemisphere, digit or number word.
  for (const hemisphere of ["north", "south", "east", "west"]) add(hemisphere, "position");
  for (let n = 0; n < 100; n++) {
    for (const word of splitWords(numberToWords(n))) add(word, `number ${n}`);
  }

  return words;
}

describe.skipIf(!existsSync(MODEL_TGZ))("offline model vocabulary", () => {
  it("knows every word the app can put into a grammar", () => {
    const vocabulary = readVocabulary(extractGraph());
    const missing: string[] = [];

    for (const [word, source] of appVocabulary()) {
      if (vocabulary.has(word)) continue;
      if (KNOWN_DEAD_NATO_FORMS.has(word)) continue;
      missing.push(`${word} (from ${source})`);
    }

    expect(missing, "words the speech model cannot recognize").toEqual([]);
  });

  it("still contains the words the NATO page depends on", () => {
    const vocabulary = readVocabulary(extractGraph());
    for (const entry of NATO_ALPHABET) {
      const usable = entry.grammarForms.some((form) =>
        splitWords(form).every((word) => vocabulary.has(word))
      );
      expect(usable, `no usable spoken form for ${entry.letter}`).toBe(true);
    }
  });
});
