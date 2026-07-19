import { getPhoneticLetter } from "../domain/natoAlphabet";
import type { MatchState } from "../domain/matcher";

export function renderLetterTiles(match: MatchState): string {
  return match.word
    .split("")
    .map((letter, index) => {
      const phonetic = getPhoneticLetter(letter);
      const isSkipped = match.skipped.includes(index);
      const matched = index < match.pointer && !isSkipped;
      const isNext = index === match.pointer;
      const status = isSkipped ? "revealed" : matched ? "matched" : isNext ? "next" : "pending";
      const sub = matched && phonetic ? `${phonetic.canonical} ✓` : isSkipped && phonetic ? phonetic.canonical : "";
      const label = matched ? ", matched" : isSkipped ? ", revealed" : "";
      return `
        <div class="tile tile--${status}" aria-label="Letter ${letter}${label}">
          <span class="tile__letter">${letter}</span>
          <span class="tile__phonetic">${sub}</span>
        </div>
      `;
    })
    .join("");
}
