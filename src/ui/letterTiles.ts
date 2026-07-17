import { getPhoneticLetter } from "../domain/natoAlphabet";
import type { MatchState } from "../domain/matcher";

export function renderLetterTiles(match: MatchState): string {
  return match.word
    .split("")
    .map((letter, index) => {
      const phonetic = getPhoneticLetter(letter);
      const matched = index < match.pointer;
      const isNext = index === match.pointer;
      const status = matched ? "matched" : isNext ? "next" : "pending";
      const sub = matched && phonetic ? `${phonetic.canonical} ✓` : "";
      return `
        <div class="tile tile--${status}" aria-label="Letter ${letter}${matched ? ", matched" : ""}">
          <span class="tile__letter">${letter}</span>
          <span class="tile__phonetic">${sub}</span>
        </div>
      `;
    })
    .join("");
}
