import { escapeHtml } from "./escape";
import { DIAGRAMS, FIGURES } from "./diagrams";
import { filterEntries, type GlossaryEntry, type GlossaryPage, type Lang } from "../domain/glossary";

export interface PracticeView {
  entry: GlossaryEntry;
  revealed: boolean;
  learned: number;
  total: number;
}

export interface GlossaryViewContext {
  page: GlossaryPage;
  query: string;
  group: string;
  selectedId: string | null;
  diagram: string | null;
  lead: Lang;
  numbers: Map<string, number>;
  practice: PracticeView | null;
}

const LANG_LABELS: Record<Lang, string> = { de: "German", en: "English" };

function other(lang: Lang): Lang {
  return lang === "de" ? "en" : "de";
}

export function renderGlossary(ctx: GlossaryViewContext): string {
  return `
    <div class="screen screen--glossary">
      ${ctx.practice ? renderPractice(ctx, ctx.practice) : renderBrowse(ctx)}
    </div>
  `;
}

// ---------------------------------------------------------------------- browse

function renderBrowse(ctx: GlossaryViewContext): string {
  const selected = ctx.page.entries.find((entry) => entry.id === ctx.selectedId) ?? null;
  return `
    <p class="glossary__intro">${escapeHtml(ctx.page.intro)}</p>
    ${renderDiagramTabs(ctx)}
    ${ctx.diagram ? renderDiagram(ctx, ctx.diagram, null) : ""}
    ${ctx.diagram ? renderCaption(ctx, selected) : ""}
    <div class="glossary__tools">
      <input id="glossary-search" class="glossary__search" type="search" autocomplete="off"
        spellcheck="false" placeholder="Search German or English" aria-label="Search terms"
        value="${escapeHtml(ctx.query)}" />
      <button class="tool-btn" type="button" data-action="lead"
        aria-label="Switch leading language">${LANG_LABELS[ctx.lead]} first</button>
      <button class="tool-btn tool-btn--primary" type="button" data-action="practice">Practice</button>
    </div>
    ${renderGroupChips(ctx)}
    <ul id="glossary-list" class="glossary-list">${renderEntryList(ctx)}</ul>
  `;
}

function renderDiagramTabs(ctx: GlossaryViewContext): string {
  if (ctx.page.diagrams.length < 2) return "";
  return `
    <div class="chip-row" role="tablist" aria-label="Drawing">
      ${ctx.page.diagrams
        .map(
          (id) =>
            `<button class="chip${id === ctx.diagram ? " chip--active" : ""}" type="button" role="tab"
              aria-selected="${id === ctx.diagram}" data-diagram="${id}">${escapeHtml(DIAGRAMS[id].label)}</button>`
        )
        .join("")}
    </div>
  `;
}

/** `onlyId` draws a single unnumbered marker, used as a practice prompt. */
function renderDiagram(ctx: GlossaryViewContext, diagramId: string, onlyId: string | null): string {
  const def = DIAGRAMS[diagramId];
  const marked = ctx.page.entries.filter(
    (entry) => entry.mark?.diagram === diagramId && (onlyId === null || entry.id === onlyId)
  );

  const leaders = marked
    .filter((entry) => entry.mark?.to)
    .map((entry) => {
      const mark = entry.mark!;
      return `<line class="dia-leader" x1="${mark.x}" y1="${mark.y}" x2="${mark.to![0]}" y2="${mark.to![1]}" />`;
    })
    .join("");

  const markers = marked
    .map((entry) => {
      const mark = entry.mark!;
      if (onlyId !== null) {
        return `
          <g class="marker marker--active" transform="translate(${mark.x},${mark.y})">
            <circle class="marker__dot" r="7" />
            <text class="marker__num">?</text>
          </g>
        `;
      }
      const active = entry.id === ctx.selectedId;
      return `
        <g class="marker${active ? " marker--active" : ""}" transform="translate(${mark.x},${mark.y})"
          data-entry="${entry.id}" role="button" tabindex="0" aria-pressed="${active}"
          aria-label="${escapeHtml(`${entry.de} – ${entry.en}`)}">
          <circle class="marker__hit" r="11" />
          <circle class="marker__dot" r="7" />
          <text class="marker__num">${ctx.numbers.get(entry.id) ?? ""}</text>
        </g>
      `;
    })
    .join("");

  return `
    <figure class="diagram">
      <svg class="diagram__svg" viewBox="${def.viewBox}" role="group" aria-label="${escapeHtml(def.label)}">
        ${def.art}${leaders}${markers}
      </svg>
    </figure>
  `;
}

/** Names the selected part right under the drawing, so a tap needs no scrolling. */
function renderCaption(ctx: GlossaryViewContext, selected: GlossaryEntry | null): string {
  if (!selected || selected.mark?.diagram !== ctx.diagram) {
    return `<p class="diagram-caption diagram-caption--empty">Tap a number to see its name.</p>`;
  }
  return `
    <p class="diagram-caption" aria-live="polite">
      <span class="diagram-caption__num">${ctx.numbers.get(selected.id) ?? ""}</span>
      <strong lang="${ctx.lead}">${escapeHtml(selected[ctx.lead])}</strong>
      <span lang="${other(ctx.lead)}">${escapeHtml(selected[other(ctx.lead)])}</span>
      <span class="diagram-caption__use">${escapeHtml(selected.use)}</span>
    </p>
  `;
}

function renderGroupChips(ctx: GlossaryViewContext): string {
  const chip = (group: string, label: string): string =>
    `<button class="chip${group === ctx.group ? " chip--active" : ""}" type="button"
      aria-pressed="${group === ctx.group}" data-group="${escapeHtml(group)}">${escapeHtml(label)}</button>`;
  return `
    <div class="chip-row" aria-label="Filter by group">
      ${chip("", "All")}
      ${ctx.page.groups.map((group) => chip(group, group)).join("")}
    </div>
  `;
}

export function renderEntryList(ctx: GlossaryViewContext): string {
  const entries = filterEntries(ctx.page, ctx.query, ctx.group);
  if (entries.length === 0) return `<li class="glossary-list__empty">No terms match.</li>`;

  return entries
    .map((entry) => {
      const open = entry.id === ctx.selectedId;
      const number = ctx.numbers.get(entry.id);
      return `
        <li class="entry${open ? " entry--open" : ""}">
          <button class="entry__row" type="button" data-entry="${entry.id}" aria-expanded="${open}">
            <span class="entry__num">${number ?? ""}</span>
            <span class="entry__names">
              <span class="entry__primary" lang="${ctx.lead}">${escapeHtml(entry[ctx.lead])}</span>
              <span class="entry__secondary" lang="${other(ctx.lead)}">${escapeHtml(
                entry[other(ctx.lead)]
              )}</span>
            </span>
          </button>
          ${open ? renderDetail(entry, ctx.lead) : ""}
        </li>
      `;
    })
    .join("");
}

function renderDetail(entry: GlossaryEntry, lead: Lang): string {
  return `
    <div class="entry__detail">
      ${entry.enAlt ? `<p class="entry__alt">Also: ${escapeHtml(entry.enAlt)}</p>` : ""}
      <p class="entry__use">${escapeHtml(entry.use)}</p>
      ${entry.note ? `<p class="entry__note">${escapeHtml(entry.note)}</p>` : ""}
      ${entry.figure ? renderFigure(entry.figure) : ""}
      ${renderCommands(entry, lead)}
    </div>
  `;
}

function renderFigure(figureId: string): string {
  const def = FIGURES[figureId];
  return `
    <figure class="diagram diagram--figure">
      <svg class="diagram__svg" viewBox="${def.viewBox}" role="img" aria-label="Track of the maneuver">
        ${def.art}
      </svg>
      <ol class="figure-steps">
        ${def.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
      </ol>
    </figure>
  `;
}

function renderCommands(entry: GlossaryEntry, lead: Lang): string {
  if (!entry.commands || entry.commands.length === 0) return "";
  return `
    <h3 class="commands__title">Commands</h3>
    <ol class="commands">
      ${entry.commands
        .map(
          (command) => `
            <li class="command">
              <span class="command__primary" lang="${lead}">${escapeHtml(command[lead])}</span>
              <span class="command__secondary" lang="${other(lead)}">${escapeHtml(command[other(lead)])}</span>
              <span class="command__when">${escapeHtml(command.when)}</span>
            </li>
          `
        )
        .join("")}
    </ol>
  `;
}

// -------------------------------------------------------------------- practice

function renderPractice(ctx: GlossaryViewContext, practice: PracticeView): string {
  const { entry } = practice;
  const answerLang = other(ctx.lead);
  const scope = ctx.group === "" ? "all terms" : ctx.group;
  return `
    <div class="practice__bar">
      <p class="practice__progress">Learned ${practice.learned} of ${practice.total} · ${escapeHtml(scope)}</p>
      <button class="tool-btn" type="button" data-action="exit">Done</button>
    </div>
    ${entry.mark ? renderDiagram(ctx, entry.mark.diagram, entry.id) : ""}
    <section class="practice-card" aria-live="polite">
      <p class="practice__lang">${LANG_LABELS[ctx.lead]} → ${LANG_LABELS[answerLang]}</p>
      <p class="practice__prompt" lang="${ctx.lead}">${escapeHtml(entry[ctx.lead])}</p>
      ${
        practice.revealed
          ? `<p class="practice__answer" lang="${answerLang}">${escapeHtml(entry[answerLang])}</p>
             ${renderDetail(entry, ctx.lead)}`
          : `<p class="practice__hint">Say the ${LANG_LABELS[answerLang]} name and what it is for, then check.</p>`
      }
    </section>
    <div class="button-row">
      ${
        practice.revealed
          ? `<button class="practice-btn practice-btn--missed" type="button" data-action="missed">Missed it</button>
             <button class="practice-btn" type="button" data-action="knew">Knew it</button>`
          : `<button class="practice-btn" type="button" data-action="reveal">Show answer</button>`
      }
    </div>
  `;
}
