export interface PhoneticLetter {
  letter: string;
  canonical: string;
  grammarForms: string[];
}

export const NATO_ALPHABET: PhoneticLetter[] = [
  { letter: "A", canonical: "Alfa", grammarForms: ["alfa", "alpha"] },
  { letter: "B", canonical: "Bravo", grammarForms: ["bravo"] },
  { letter: "C", canonical: "Charlie", grammarForms: ["charlie"] },
  { letter: "D", canonical: "Delta", grammarForms: ["delta"] },
  { letter: "E", canonical: "Echo", grammarForms: ["echo"] },
  { letter: "F", canonical: "Foxtrot", grammarForms: ["foxtrot"] },
  { letter: "G", canonical: "Golf", grammarForms: ["golf"] },
  { letter: "H", canonical: "Hotel", grammarForms: ["hotel"] },
  { letter: "I", canonical: "India", grammarForms: ["india"] },
  { letter: "J", canonical: "Juliett", grammarForms: ["juliett", "juliet"] },
  { letter: "K", canonical: "Kilo", grammarForms: ["kilo"] },
  { letter: "L", canonical: "Lima", grammarForms: ["lima"] },
  { letter: "M", canonical: "Mike", grammarForms: ["mike"] },
  { letter: "N", canonical: "November", grammarForms: ["november"] },
  { letter: "O", canonical: "Oscar", grammarForms: ["oscar"] },
  { letter: "P", canonical: "Papa", grammarForms: ["papa"] },
  { letter: "Q", canonical: "Quebec", grammarForms: ["quebec"] },
  { letter: "R", canonical: "Romeo", grammarForms: ["romeo"] },
  { letter: "S", canonical: "Sierra", grammarForms: ["sierra"] },
  { letter: "T", canonical: "Tango", grammarForms: ["tango"] },
  { letter: "U", canonical: "Uniform", grammarForms: ["uniform"] },
  { letter: "V", canonical: "Victor", grammarForms: ["victor"] },
  { letter: "W", canonical: "Whiskey", grammarForms: ["whiskey", "whisky"] },
  { letter: "X", canonical: "X-ray", grammarForms: ["xray", "x-ray", "x ray"] },
  { letter: "Y", canonical: "Yankee", grammarForms: ["yankee"] },
  { letter: "Z", canonical: "Zulu", grammarForms: ["zulu"] }
];

const LETTER_BY_LETTER = new Map(NATO_ALPHABET.map((p) => [p.letter, p]));

const FORM_TO_LETTER = new Map<string, string>();
for (const entry of NATO_ALPHABET) {
  for (const form of entry.grammarForms) {
    FORM_TO_LETTER.set(form, entry.letter);
  }
}

export function getPhoneticLetter(letter: string): PhoneticLetter | undefined {
  return LETTER_BY_LETTER.get(letter.toUpperCase());
}

export function buildGrammar(): string[] {
  const forms = NATO_ALPHABET.flatMap((p) => p.grammarForms);
  return [...forms, "[unk]"];
}

export function lookupLetterByToken(token: string): string | null {
  const normalized = token.trim().toLowerCase().replace(/[^a-z]/g, "");
  return FORM_TO_LETTER.get(normalized) ?? null;
}
