import { loadLead, loadProgress, saveLead, saveProgress } from "./glossaryStore";
import type { PageController } from "./pageController";
import { countLearned, grade, pickNext, type Progress } from "../domain/flashcards";
import { filterEntries, markNumbers, type GlossaryPage, type Lang } from "../domain/glossary";
import { renderEntryList, renderGlossary, type GlossaryViewContext } from "../ui/glossaryView";

export function createGlossaryController(page: GlossaryPage, requestPaint: () => void): PageController {
  const numbers = markNumbers(page);
  let query = "";
  let group = "";
  let selectedId: string | null = null;
  let diagram: string | null = page.diagrams[0] ?? null;
  let practiceId: string | null = null;
  let revealed = false;

  // Progress is shared between the glossary pages, so ids carry the page name.
  const progressKey = (id: string): string => `${page.id}:${id}`;

  /** Practice covers the group currently filtered, or everything. */
  function practicePool(): string[] {
    return filterEntries(page, "", group).map((entry) => progressKey(entry.id));
  }

  function nextCard(progress: Progress): void {
    const previous = practiceId ? progressKey(practiceId) : null;
    const next = pickNext(practicePool(), progress, previous);
    practiceId = next ? next.slice(page.id.length + 1) : null;
    revealed = false;
  }

  function viewContext(): GlossaryViewContext {
    // Read fresh on every paint: the other glossary pages write the same store.
    const lead: Lang = loadLead();
    const entry = page.entries.find((candidate) => candidate.id === practiceId);
    const pool = practicePool();
    return {
      page,
      query,
      group,
      selectedId,
      diagram,
      lead,
      numbers,
      practice: entry
        ? { entry, revealed, learned: countLearned(pool, loadProgress()), total: pool.length }
        : null
    };
  }

  function select(id: string): void {
    selectedId = selectedId === id ? null : id;
    const mark = page.entries.find((entry) => entry.id === selectedId)?.mark;
    if (mark) diagram = mark.diagram;
    requestPaint();
  }

  function handleAction(action: string): void {
    switch (action) {
      case "lead":
        saveLead(loadLead() === "de" ? "en" : "de");
        break;
      case "practice":
        nextCard(loadProgress());
        break;
      case "reveal":
        revealed = true;
        break;
      case "knew":
      case "missed": {
        if (!practiceId) break;
        const progress = grade(loadProgress(), progressKey(practiceId), action === "knew");
        saveProgress(progress);
        nextCard(progress);
        break;
      }
      case "exit":
        practiceId = null;
        revealed = false;
        break;
    }
    requestPaint();
  }

  function handleActivate(target: Element): void {
    const hit = target.closest<HTMLElement | SVGElement>("[data-entry], [data-group], [data-diagram], [data-action]");
    if (!hit) return;
    const data = hit.dataset;
    if (data.entry !== undefined) select(data.entry);
    else if (data.action !== undefined) handleAction(data.action);
    else if (data.diagram !== undefined) {
      diagram = data.diagram;
      requestPaint();
    } else if (data.group !== undefined) {
      group = data.group;
      requestPaint();
    }
  }

  return {
    render(): string {
      return renderGlossary(viewContext());
    },

    bindEvents(): void {
      const screen = document.querySelector<HTMLElement>(".screen--glossary");
      if (!screen) return;

      screen.addEventListener("click", (event) => handleActivate(event.target as Element));
      // Diagram markers are SVG groups, which do not click on Enter or Space.
      screen.addEventListener("keydown", (event) => {
        const target = event.target as Element;
        if (!target.matches(".marker[data-entry]")) return;
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        handleActivate(target);
      });

      const search = document.getElementById("glossary-search") as HTMLInputElement | null;
      search?.addEventListener("input", () => {
        query = search.value;
        // Repainting the page would take the focus out of the search box.
        const list = document.getElementById("glossary-list");
        if (list) list.innerHTML = renderEntryList(viewContext());
      });
    },

    leave(): void {
      practiceId = null;
      revealed = false;
    }
  };
}
