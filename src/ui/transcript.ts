export function renderTranscript(partial: string, rejectedLog: string[]): string {
  const rejectedHtml = rejectedLog
    .slice(-5)
    .map((token) => `<span class="transcript__rejected">${escapeHtml(token) || "…"} ✗</span>`)
    .join(" ");
  return `
    <div class="transcript" aria-live="polite">
      <div class="transcript__partial">${escapeHtml(partial)}</div>
      <div class="transcript__log">${rejectedHtml}</div>
    </div>
  `;
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}
