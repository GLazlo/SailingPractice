// A spoken phrase is an ordered list of terms; each term accepts one of several
// alternate word sequences. Modelling alternates per term (rather than per
// phrase) keeps things like a call sign — where every letter has its own
// alternates — from exploding into a cartesian product of whole phrases.
export type WordSeq = string[];
export type Term = WordSeq[];
export type Phrase = Term[];

export function splitWords(text: string): WordSeq {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9'\s-]/g, " ")
    .split(/[\s-]+/)
    .filter((w) => w.length > 0);
}

/** A term accepting any of the given forms; a form may itself be several words. */
export function term(...forms: string[]): Term {
  const seqs = forms.map(splitWords).filter((seq) => seq.length > 0);
  // Longest first, so "x ray" wins over a bare "x" when both could apply.
  return seqs.sort((a, b) => b.length - a.length);
}

/** A phrase of plain words, each accepting only itself. */
export function phrase(text: string): Phrase {
  return splitWords(text).map((word) => [[word]]);
}

export function concat(...parts: Phrase[]): Phrase {
  return parts.flat();
}

/** Every distinct word the phrase can accept — the grammar contribution. */
export function phraseWords(p: Phrase): string[] {
  const words = new Set<string>();
  for (const t of p) for (const seq of t) for (const w of seq) words.add(w);
  return [...words];
}

export type PhraseMatch =
  | { kind: "full"; consumed: number }
  | { kind: "prefix" }
  | { kind: "none" };

/**
 * Match a phrase against the head of a token buffer.
 * "prefix" means the buffer ran out mid-phrase — the caller should wait for
 * more tokens rather than discarding what it has.
 */
export function matchPhrase(p: Phrase, tokens: string[]): PhraseMatch {
  let offset = 0;
  for (const t of p) {
    if (offset >= tokens.length) return { kind: "prefix" };
    const seq = t.find((candidate) => matchesAt(candidate, tokens, offset));
    if (!seq) {
      // A longer alternate may still match once more tokens arrive.
      const couldExtend = t.some((candidate) => isPrefixAt(candidate, tokens, offset));
      return couldExtend ? { kind: "prefix" } : { kind: "none" };
    }
    offset += seq.length;
  }
  return { kind: "full", consumed: offset };
}

function matchesAt(seq: WordSeq, tokens: string[], offset: number): boolean {
  if (offset + seq.length > tokens.length) return false;
  return seq.every((word, i) => word === tokens[offset + i]);
}

function isPrefixAt(seq: WordSeq, tokens: string[], offset: number): boolean {
  const available = tokens.length - offset;
  if (available <= 0 || available >= seq.length) return false;
  for (let i = 0; i < available; i++) {
    if (seq[i] !== tokens[offset + i]) return false;
  }
  return true;
}
