import { escapeHtml } from "./escape";
import { renderTranscript } from "./transcript";
import type { CallMatchState, CallScore } from "../domain/callMatcher";
import {
  CALL_TYPES,
  NATURE_LABELS,
  NATURE_OPTIONS,
  contextFieldsFor,
  type CallType,
  type RenderedCall
} from "../domain/radioCalls";
import type { CallContext, ShipIdentity } from "../domain/shipIdentity";

export interface CallsResult {
  call: RenderedCall;
  match: CallMatchState;
  score: CallScore;
  earlyTerminators: number;
  audioUrl: string | null;
  stoppedBy: "terminator" | "button" | "timeout";
}

export type CallsPhase = "idle" | "preparingModel" | "recording" | "paused" | "error";

export interface CallsViewContext {
  phase: CallsPhase;
  progress: number;
  errorMessage: string | null;
  identity: ShipIdentity;
  context: CallContext;
  callType: CallType | "";
  errors: Record<string, string | null>;
  showMessage: boolean;
  call: RenderedCall | null;
  match: CallMatchState | null;
  partial: string;
  rejected: string[];
  result: CallsResult | null;
  canStart: boolean;
  nameWarning: string | null;
}

interface FieldSpec {
  id: string;
  label: string;
  value: string;
  hint?: string;
  placeholder?: string;
  maxLength?: number;
  inputMode?: string;
  unused?: boolean;
}

export function renderCalls(ctx: CallsViewContext): string {
  if (ctx.phase === "preparingModel") return renderPreparing(ctx.progress);
  if (ctx.phase === "error") return renderError(ctx.errorMessage ?? "Unknown error");

  const recording = ctx.phase === "recording" || ctx.phase === "paused";

  return `
    <div class="screen screen--calls">
      ${renderStationForm(ctx, recording)}
      ${renderTypeSelect(ctx, recording)}
      ${renderToggle(ctx)}
      ${ctx.showMessage ? renderMessage(ctx.call, ctx.match) : ""}
      ${renderControls(ctx, recording)}
      ${recording ? renderLive(ctx) : ""}
      ${ctx.result ? renderResult(ctx.result) : ""}
    </div>
  `;
}

function renderPreparing(progress: number): string {
  return `
    <div class="screen screen--loading">
      <h1>Preparing speech model…</h1>
      <p>Downloading the offline recognition model (one-time, ~40&nbsp;MB).</p>
      <progress max="100" value="${progress}"></progress>
      <p>${progress}%</p>
    </div>
  `;
}

function renderError(message: string): string {
  return `
    <div class="screen screen--error">
      <h1>Something went wrong</h1>
      <p>${escapeHtml(message)}</p>
      <button id="calls-retry-btn" type="button">Back</button>
    </div>
  `;
}

function textField(spec: FieldSpec, error: string | null, disabled: boolean): string {
  const invalid = error ? " field--invalid" : "";
  const unused = spec.unused ? " field--unused" : "";
  return `
    <div class="field${invalid}${unused}">
      <label for="${spec.id}">${escapeHtml(spec.label)}</label>
      <input id="${spec.id}" type="text" autocomplete="off" spellcheck="false"
        ${spec.maxLength ? `maxlength="${spec.maxLength}"` : ""}
        ${spec.inputMode ? `inputmode="${spec.inputMode}"` : ""}
        ${spec.placeholder ? `placeholder="${escapeHtml(spec.placeholder)}"` : ""}
        value="${escapeHtml(spec.value)}"
        ${disabled || spec.unused ? "disabled" : ""}
        aria-invalid="${error ? "true" : "false"}" />
      <p class="field__note" data-error-for="${spec.id}">${
        error ? escapeHtml(error) : escapeHtml(spec.hint ?? "")
      }</p>
    </div>
  `;
}

function renderStationForm(ctx: CallsViewContext, recording: boolean): string {
  const used = ctx.callType ? contextFieldsFor(ctx.callType) : [];
  const usesPersons = used.includes("personsOnBoard");
  const usesChannel = used.includes("workingChannel");

  const fields: FieldSpec[] = [
    {
      id: "ship-name",
      label: "Ship name",
      value: ctx.identity.shipName,
      placeholder: "e.g. SEA BREEZE",
      maxLength: 40,
      hint: ctx.nameWarning ?? ""
    },
    {
      id: "call-sign",
      label: "Call sign",
      value: ctx.identity.callSign,
      placeholder: "e.g. DA1234",
      maxLength: 7
    },
    {
      id: "mmsi",
      label: "MMSI",
      value: ctx.identity.mmsi,
      placeholder: "9 digits",
      maxLength: 9,
      inputMode: "numeric"
    },
    {
      id: "latitude",
      label: "Latitude",
      value: ctx.context.latitude,
      placeholder: "54 12.5 N",
      maxLength: 12
    },
    {
      id: "longitude",
      label: "Longitude",
      value: ctx.context.longitude,
      placeholder: "010 30.2 E",
      maxLength: 12
    },
    {
      id: "persons",
      label: "Persons on board",
      value: ctx.context.personsOnBoard,
      maxLength: 2,
      inputMode: "numeric",
      unused: ctx.callType !== "" && !usesPersons,
      hint: ctx.callType !== "" && !usesPersons ? "Not used for this message" : ""
    },
    {
      id: "channel",
      label: "Working channel",
      value: ctx.context.workingChannel,
      maxLength: 2,
      inputMode: "numeric",
      unused: ctx.callType !== "" && !usesChannel,
      hint: ctx.callType !== "" && !usesChannel ? "Not used for this message" : ""
    }
  ];

  return `
    <section class="card">
      <div class="card__header">
        <h2 class="card__title">Station details</h2>
        <div class="button-row button-row--compact">
          <button id="random-values-btn" type="button" ${recording ? "disabled" : ""}>Random test values</button>
          <button id="clear-values-btn" type="button" ${recording ? "disabled" : ""}>Clear</button>
        </div>
      </div>
      <div class="field-grid">
        ${fields.map((f) => textField(f, ctx.errors[f.id] ?? null, recording)).join("")}
        ${renderNatureField(ctx, recording)}
      </div>
    </section>
  `;
}

function renderNatureField(ctx: CallsViewContext, recording: boolean): string {
  const label = ctx.callType ? NATURE_LABELS[ctx.callType] : "Nature of the message";
  const options = ctx.callType ? NATURE_OPTIONS[ctx.callType] : [];
  const error = ctx.errors["nature"] ?? null;
  const disabled = recording || ctx.callType === "";
  return `
    <div class="field field--wide${error ? " field--invalid" : ""}">
      <label for="nature">${escapeHtml(label)}</label>
      <select id="nature" ${disabled ? "disabled" : ""} aria-invalid="${error ? "true" : "false"}">
        <option value="">${ctx.callType ? "Select…" : "Select a message type first"}</option>
        ${options
          .map(
            (option) =>
              `<option value="${escapeHtml(option.id)}" ${
                option.id === ctx.context.natureId ? "selected" : ""
              }>${escapeHtml(option.label)}</option>`
          )
          .join("")}
      </select>
      <p class="field__note" data-error-for="nature">${error ? escapeHtml(error) : ""}</p>
    </div>
  `;
}

function renderTypeSelect(ctx: CallsViewContext, recording: boolean): string {
  const info = CALL_TYPES.find((type) => type.id === ctx.callType);
  return `
    <section class="card">
      <div class="field field--wide">
        <label for="call-type">Message type</label>
        <select id="call-type" ${recording ? "disabled" : ""}>
          <option value="">Select a message…</option>
          ${CALL_TYPES.map(
            (type) =>
              `<option value="${type.id}" ${type.id === ctx.callType ? "selected" : ""}>${escapeHtml(
                type.label
              )}</option>`
          ).join("")}
        </select>
        <p class="field__note">${info ? escapeHtml(info.description) : ""}</p>
      </div>
    </section>
  `;
}

function renderToggle(ctx: CallsViewContext): string {
  return `
    <div class="button-row button-row--start">
      <button id="text-toggle-btn" type="button" class="toggle-btn"
        aria-expanded="${ctx.showMessage}" aria-controls="call-message">
        ${ctx.showMessage ? "Hide message text" : "Show message text"}
      </button>
    </div>
  `;
}

export function renderMessage(call: RenderedCall | null, match: CallMatchState | null): string {
  if (!call) {
    return `
      <section id="call-message" class="call-message call-message--empty">
        <p>Select a message type and fill in the station details to see the text.</p>
      </section>
    `;
  }

  const lines: string[] = [];
  let current: string[] = [];
  const flush = (): void => {
    if (current.length > 0) lines.push(`<p class="call-message__line">${current.join(" ")}</p>`);
    current = [];
  };

  call.slots.forEach((slot, index) => {
    if (slot.dividerBefore) {
      flush();
      lines.push(`<p class="call-message__divider">${escapeHtml(slot.dividerBefore)}</p>`);
    } else if (slot.startsLine) {
      flush();
    }
    const status = match?.slots[index]?.status ?? "pending";
    const optional = slot.optional ? " call-slot--optional" : "";
    current.push(
      `<span class="call-slot call-slot--${status}${optional}" data-slot="${escapeHtml(
        slot.id
      )}">${escapeHtml(slot.text)}</span>`
    );
  });
  flush();

  return `<section id="call-message" class="call-message">${lines.join("")}</section>`;
}

function renderControls(ctx: CallsViewContext, recording: boolean): string {
  const paused = ctx.phase === "paused";
  return `
    <div class="button-row">
      <button id="start-call-btn" type="button" class="primary" ${
        recording || !ctx.canStart ? "disabled" : ""
      }>Start recording</button>
      <button id="pause-call-btn" type="button" ${recording ? "" : "disabled"}>${
        paused ? "Resume" : "Pause"
      }</button>
      <button id="stop-call-btn" type="button" ${recording ? "" : "disabled"}>Stop</button>
    </div>
    ${
      recording
        ? ""
        : `<p id="call-start-hint" class="call-hint" ${
            ctx.canStart ? "hidden" : ""
          }>Fill in every field above and choose a message type to start.</p>`
    }
  `;
}

function renderLive(ctx: CallsViewContext): string {
  const paused = ctx.phase === "paused";
  return `
    <section class="call-live">
      <div class="mic-indicator${paused ? " mic-indicator--paused" : ""}" aria-hidden="true"></div>
      <p class="call-live__label" aria-live="polite">${
        paused ? "Paused" : "Recording — say the message, finish with “over” or “out”."
      }</p>
      ${renderTranscript(ctx.partial, ctx.rejected)}
    </section>
  `;
}

function renderResult(result: CallsResult): string {
  const { score, call, match } = result;
  const items = call.slots
    .map((slot, index) => {
      const status = match.slots[index].status;
      const icon = status === "matched" ? "✓" : status === "partial" ? "◐" : "✗";
      const optional = slot.optional ? `<span class="checklist__tag">optional</span>` : "";
      const repeat =
        slot.repeat > 1 && status !== "matched"
          ? `<span class="checklist__tag">${match.slots[index].repeatsMatched} of ${slot.repeat}</span>`
          : "";
      return `
        <li class="checklist__item checklist__item--${status}">
          <span class="checklist__icon" aria-hidden="true">${icon}</span>
          <span class="checklist__label">${escapeHtml(slot.label)}</span>
          ${repeat}${optional}
        </li>
      `;
    })
    .join("");

  const stopNote =
    result.stoppedBy === "timeout"
      ? "<p class=\"call-hint\">Stopped automatically after the time limit.</p>"
      : "";

  const earlyNote =
    result.earlyTerminators > 0
      ? `<p class="call-hint call-hint--warn">Heard “over”/“out” ${result.earlyTerminators} time(s) before the end of the message — recording continued.</p>`
      : "";

  return `
    <section class="card call-result" aria-live="polite">
      <div class="card__header">
        <h2 class="card__title">Result</h2>
        <p class="call-score">${score.matched} of ${score.total} — ${score.percent}%</p>
      </div>
      ${stopNote}
      ${earlyNote}
      <ul class="checklist">${items}</ul>
      ${
        result.audioUrl
          ? `<div class="call-playback">
               <h3>Your recording</h3>
               <audio controls src="${result.audioUrl}"></audio>
             </div>`
          : `<p class="call-hint">Audio playback is not available in this browser.</p>`
      }
      <div class="button-row">
        <button id="clear-result-btn" type="button">Clear result</button>
      </div>
    </section>
  `;
}
