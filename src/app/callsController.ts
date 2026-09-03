import { getEngine } from "./engineHost";
import { loadCallContext, loadIdentity, saveCallContext, saveIdentity } from "./shipStore";
import {
  applyCallTokens,
  countEarlyTerminators,
  createCallMatch,
  finalizeCallMatch,
  scoreCall,
  type CallMatchState
} from "../domain/callMatcher";
import {
  buildCall,
  buildCallGrammar,
  contextFieldsFor,
  NATURE_OPTIONS,
  type CallType,
  type RenderedCall
} from "../domain/radioCalls";
import { splitWords } from "../domain/phrase";
import {
  randomIdentity,
  randomPersonsOnBoard,
  randomPosition,
  randomWorkingChannel,
  SHIP_NAMES,
  validateCallSign,
  validateLatitude,
  validateLongitude,
  validateMmsi,
  validatePersonsOnBoard,
  validateShipName,
  validateWorkingChannel,
  type CallContext,
  type ShipIdentity
} from "../domain/shipIdentity";
import { startRecording, type CallRecorder } from "../speech/recorder";
import {
  renderCalls,
  renderMessage,
  type CallsPhase,
  type CallsResult,
  type CallsViewContext
} from "../ui/callsView";
import type { PageController } from "./pageController";

// An attempt that is never stopped would hold the microphone open forever.
const MAX_ATTEMPT_MS = 3 * 60 * 1000;

type FieldId = "ship-name" | "call-sign" | "mmsi" | "latitude" | "longitude" | "persons" | "channel";

const IDENTITY_FIELDS: FieldId[] = ["ship-name", "call-sign", "mmsi"];

export function createCallsController(requestPaint: () => void): PageController {
  let identity: ShipIdentity = loadIdentity();
  let context: CallContext = loadCallContext();
  let callType: CallType | "" = "";
  let showMessage = true;
  let phase: CallsPhase = "idle";
  let progress = 0;
  let errorMessage: string | null = null;

  let call: RenderedCall | null = null;
  let match: CallMatchState | null = null;
  let partial = "";
  let rejected: string[] = [];
  let earlyTerminators = 0;
  let result: CallsResult | null = null;

  let recorder: CallRecorder | null = null;
  let timeoutHandle: number | null = null;

  // ------------------------------------------------------------- validation

  function validateField(field: FieldId): string | null {
    switch (field) {
      case "ship-name":
        return validateShipName(identity.shipName);
      case "call-sign":
        return validateCallSign(identity.callSign);
      case "mmsi":
        return validateMmsi(identity.mmsi);
      case "latitude":
        return validateLatitude(context.latitude);
      case "longitude":
        return validateLongitude(context.longitude);
      case "persons":
        return validatePersonsOnBoard(context.personsOnBoard);
      case "channel":
        return validateWorkingChannel(context.workingChannel);
    }
  }

  function activeFields(): FieldId[] {
    if (!callType) return IDENTITY_FIELDS;
    const used = contextFieldsFor(callType);
    const fields = [...IDENTITY_FIELDS];
    if (used.includes("latitude")) fields.push("latitude");
    if (used.includes("longitude")) fields.push("longitude");
    if (used.includes("personsOnBoard")) fields.push("persons");
    if (used.includes("workingChannel")) fields.push("channel");
    return fields;
  }

  function fieldValue(field: FieldId): string {
    switch (field) {
      case "ship-name":
        return identity.shipName;
      case "call-sign":
        return identity.callSign;
      case "mmsi":
        return identity.mmsi;
      case "latitude":
        return context.latitude;
      case "longitude":
        return context.longitude;
      case "persons":
        return context.personsOnBoard;
      case "channel":
        return context.workingChannel;
    }
  }

  /** Errors worth showing: a blank field is incomplete, not wrong. */
  function displayErrors(): Record<string, string | null> {
    const errors: Record<string, string | null> = {};
    for (const field of activeFields()) {
      errors[field] = fieldValue(field).trim().length === 0 ? null : validateField(field);
    }
    return errors;
  }

  function natureValid(): boolean {
    if (!callType) return false;
    return NATURE_OPTIONS[callType].some((option) => option.id === context.natureId);
  }

  function isComplete(): boolean {
    if (!callType) return false;
    if (!natureValid()) return false;
    return activeFields().every(
      (field) => fieldValue(field).trim().length > 0 && validateField(field) === null
    );
  }

  function nameWarning(): string | null {
    const name = identity.shipName.trim();
    if (name.length === 0) return null;
    const known = SHIP_NAMES.some((entry) => entry.toLowerCase() === name.toLowerCase());
    return known ? null : "Custom name — the offline model may not recognize it.";
  }

  /** The message actually practised — only once every field is valid. */
  function currentCall(): RenderedCall | null {
    if (!callType || !isComplete()) return null;
    return buildCall(callType, identity, context);
  }

  /**
   * The message as shown on screen. It updates on every keystroke, so blanks
   * are filled with placeholders rather than making the whole text disappear
   * while a field is half-typed.
   */
  function displayCall(): RenderedCall | null {
    if (!callType) return null;
    return buildCall(
      callType,
      {
        shipName: identity.shipName.trim() || "[ship name]",
        callSign: identity.callSign.trim() || "[call sign]",
        mmsi: identity.mmsi.trim() || "[MMSI]"
      },
      {
        ...context,
        latitude: context.latitude.trim() || "[latitude]",
        longitude: context.longitude.trim() || "[longitude]",
        personsOnBoard: context.personsOnBoard.trim() || "[number]",
        workingChannel: context.workingChannel.trim() || "[channel]"
      }
    );
  }

  // ---------------------------------------------------------------- painting

  function viewContext(): CallsViewContext {
    return {
      phase,
      progress,
      errorMessage,
      identity,
      context,
      callType,
      errors: displayErrors(),
      showMessage,
      call: call ?? displayCall(),
      match,
      partial,
      rejected,
      result,
      canStart: isComplete(),
      nameWarning: nameWarning()
    };
  }

  /**
   * Update the parts that depend on the field values without re-rendering the
   * form, so typing does not lose focus or caret position.
   */
  function refreshDerived(): void {
    const messageEl = document.getElementById("call-message");
    if (messageEl && showMessage) {
      messageEl.outerHTML = renderMessage(call ?? displayCall(), match);
    }

    const errors = displayErrors();
    for (const [field, error] of Object.entries(errors)) {
      const note = document.querySelector<HTMLElement>(`[data-error-for="${field}"]`);
      const input = document.getElementById(field) as HTMLInputElement | null;
      if (note) {
        if (field === "ship-name" && !error) note.textContent = nameWarning() ?? "";
        else note.textContent = error ?? "";
      }
      input?.parentElement?.classList.toggle("field--invalid", Boolean(error));
      input?.setAttribute("aria-invalid", error ? "true" : "false");
    }

    const startBtn = document.getElementById("start-call-btn") as HTMLButtonElement | null;
    if (startBtn) startBtn.disabled = phase !== "idle" || !isComplete();

    const hint = document.getElementById("call-start-hint");
    if (hint && phase === "idle") hint.hidden = isComplete();
  }

  // ------------------------------------------------------------- attempt flow

  function clearTimer(): void {
    if (timeoutHandle !== null) {
      window.clearTimeout(timeoutHandle);
      timeoutHandle = null;
    }
  }

  function clearResult(): void {
    if (result?.audioUrl) URL.revokeObjectURL(result.audioUrl);
    result = null;
  }

  async function handleStart(): Promise<void> {
    const built = currentCall();
    if (!built || !callType) return;

    clearResult();
    call = built;
    match = createCallMatch(built);
    partial = "";
    rejected = [];
    earlyTerminators = 0;

    try {
      phase = "preparingModel";
      progress = 0;
      requestPaint();

      const speech = getEngine();
      await speech.init((pct) => {
        progress = pct;
        requestPaint();
      });

      speech.onFinalText((text) => {
        if (!call || !match) return;
        const tokens = splitWords(text).filter((token) => token !== "unk");
        if (tokens.length === 0) return;

        const applied = applyCallTokens(call, match, tokens);
        match = applied.state;
        earlyTerminators += countEarlyTerminators(applied.rejected);
        rejected = [...rejected, ...applied.rejected].slice(-10);
        requestPaint();

        if (match.done) void handleStop("terminator");
      });
      speech.onPartial((text) => {
        partial = text;
        const el = document.querySelector<HTMLElement>(".transcript__partial");
        if (el) el.textContent = partial;
      });
      speech.onError((err) => {
        phase = "error";
        errorMessage = err.message;
        requestPaint();
      });

      await speech.start(buildCallGrammar(built));
      const stream = speech.getStream();
      recorder = stream ? startRecording(stream) : null;

      phase = "recording";
      clearTimer();
      timeoutHandle = window.setTimeout(() => void handleStop("timeout"), MAX_ATTEMPT_MS);
      requestPaint();
    } catch (err) {
      phase = "error";
      errorMessage = err instanceof Error ? err.message : String(err);
      requestPaint();
    }
  }

  async function handlePauseToggle(): Promise<void> {
    const speech = getEngine();
    try {
      if (phase === "recording") {
        await speech.pause();
        recorder?.pause();
        phase = "paused";
      } else if (phase === "paused") {
        await speech.resume();
        recorder?.resume();
        phase = "recording";
      }
      requestPaint();
    } catch (err) {
      phase = "error";
      errorMessage = err instanceof Error ? err.message : String(err);
      requestPaint();
    }
  }

  async function handleStop(stoppedBy: CallsResult["stoppedBy"]): Promise<void> {
    if (phase !== "recording" && phase !== "paused") return;
    clearTimer();

    const audioBlob = await recorder?.stop().catch(() => null);
    recorder = null;

    try {
      await getEngine().stop();
    } catch (err) {
      console.error("Failed to stop speech engine", err);
    }

    if (call && match) {
      const finalMatch = finalizeCallMatch(match);
      result = {
        call,
        match: finalMatch,
        score: scoreCall(call, finalMatch),
        earlyTerminators,
        audioUrl: audioBlob ? URL.createObjectURL(audioBlob) : null,
        stoppedBy
      };
      match = finalMatch;
    }

    phase = "idle";
    partial = "";
    call = null;
    match = null;
    requestPaint();
  }

  // -------------------------------------------------------------- value edits

  function setIdentity(next: Partial<ShipIdentity>): void {
    identity = { ...identity, ...next };
    saveIdentity(identity);
  }

  function setContext(next: Partial<CallContext>): void {
    context = { ...context, ...next };
    saveCallContext(context);
  }

  function applyRandomValues(): void {
    setIdentity(randomIdentity());
    const position = randomPosition();
    const natureId = callType
      ? NATURE_OPTIONS[callType][Math.floor(Math.random() * NATURE_OPTIONS[callType].length)].id
      : context.natureId;
    setContext({
      latitude: position.latitude,
      longitude: position.longitude,
      personsOnBoard: randomPersonsOnBoard(),
      workingChannel: randomWorkingChannel(),
      natureId
    });
  }

  function clearValues(): void {
    setIdentity({ shipName: "", callSign: "", mmsi: "" });
    setContext({
      latitude: "",
      longitude: "",
      personsOnBoard: "",
      workingChannel: "",
      natureId: ""
    });
  }

  function bindTextField(id: FieldId, apply: (value: string) => void): void {
    const input = document.getElementById(id) as HTMLInputElement | null;
    input?.addEventListener("input", () => {
      apply(input.value);
      refreshDerived();
    });
  }

  return {
    render(): string {
      return renderCalls(viewContext());
    },

    bindEvents(): void {
      if (phase === "error") {
        document.getElementById("calls-retry-btn")?.addEventListener("click", () => {
          phase = "idle";
          errorMessage = null;
          requestPaint();
        });
        return;
      }
      if (phase === "preparingModel") return;

      bindTextField("ship-name", (value) => setIdentity({ shipName: value }));
      bindTextField("call-sign", (value) => setIdentity({ callSign: value.toUpperCase() }));
      bindTextField("mmsi", (value) => setIdentity({ mmsi: value.replace(/\D/g, "") }));
      bindTextField("latitude", (value) => setContext({ latitude: value.toUpperCase() }));
      bindTextField("longitude", (value) => setContext({ longitude: value.toUpperCase() }));
      bindTextField("persons", (value) => setContext({ personsOnBoard: value.replace(/\D/g, "") }));
      bindTextField("channel", (value) => setContext({ workingChannel: value.replace(/\D/g, "") }));

      const typeSelect = document.getElementById("call-type") as HTMLSelectElement | null;
      typeSelect?.addEventListener("change", () => {
        callType = typeSelect.value as CallType | "";
        // The nature options differ per message type; drop a now-invalid choice.
        if (!natureValid()) setContext({ natureId: "" });
        clearResult();
        requestPaint();
      });

      const natureSelect = document.getElementById("nature") as HTMLSelectElement | null;
      natureSelect?.addEventListener("change", () => {
        setContext({ natureId: natureSelect.value });
        requestPaint();
      });

      document.getElementById("random-values-btn")?.addEventListener("click", () => {
        applyRandomValues();
        requestPaint();
      });
      document.getElementById("clear-values-btn")?.addEventListener("click", () => {
        clearValues();
        requestPaint();
      });
      document.getElementById("text-toggle-btn")?.addEventListener("click", () => {
        showMessage = !showMessage;
        requestPaint();
      });
      document.getElementById("start-call-btn")?.addEventListener("click", () => {
        void handleStart();
      });
      document.getElementById("pause-call-btn")?.addEventListener("click", () => {
        void handlePauseToggle();
      });
      document.getElementById("stop-call-btn")?.addEventListener("click", () => {
        void handleStop("button");
      });
      document.getElementById("clear-result-btn")?.addEventListener("click", () => {
        clearResult();
        requestPaint();
      });
    },

    leave(): void {
      clearTimer();
      if (phase === "recording" || phase === "paused" || phase === "preparingModel") {
        void handleStop("button");
      }
      clearResult();
      phase = "idle";
      call = null;
      match = null;
      partial = "";
    }
  };
}
