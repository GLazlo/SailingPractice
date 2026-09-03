import { describe, expect, it } from "vitest";
import {
  buildCall,
  buildCallGrammar,
  callText,
  contextFieldsFor,
  NATURE_OPTIONS,
  type CallType
} from "../src/domain/radioCalls";
import { TEST_CONTEXT, TEST_IDENTITY } from "./support/speak";

const ALL_TYPES: CallType[] = ["securite", "panpan", "mayday"];

function contextFor(type: CallType) {
  return { ...TEST_CONTEXT, natureId: NATURE_OPTIONS[type][0].id };
}

describe("radioCalls", () => {
  it("builds a Mayday in the required order", () => {
    const call = buildCall("mayday", TEST_IDENTITY, contextFor("mayday"));
    expect(call.slots.map((s) => s.id)).toEqual([
      "distress-signal",
      "this-is",
      "name",
      "callsign",
      "mmsi-label",
      "mmsi",
      "mayday-name",
      "position",
      "nature",
      "assistance",
      "persons",
      "over"
    ]);
  });

  it("repeats the distress signal and the vessel name three times", () => {
    const call = buildCall("mayday", TEST_IDENTITY, contextFor("mayday"));
    const bySlot = new Map(call.slots.map((s) => [s.id, s]));
    expect(bySlot.get("distress-signal")?.repeat).toBe(3);
    expect(bySlot.get("distress-signal")?.text).toBe("MAYDAY MAYDAY MAYDAY");
    expect(bySlot.get("name")?.repeat).toBe(3);
    expect(bySlot.get("name")?.text).toBe("SEA BREEZE SEA BREEZE SEA BREEZE");
  });

  it("interpolates the current station details into the text", () => {
    const text = callText(buildCall("mayday", TEST_IDENTITY, contextFor("mayday")));
    expect(text).toContain("SEA BREEZE");
    expect(text).toContain("CALL SIGN D A 1 2");
    expect(text).toContain("211234567");
    expect(text).toContain("54 12.5 N 010 30.2 E");
    expect(text).toContain("4 PERSONS ON BOARD");
    expect(text.trimEnd().endsWith("OVER")).toBe(true);
  });

  it("models Sécurité as two transmissions split by a divider", () => {
    const call = buildCall("securite", TEST_IDENTITY, contextFor("securite"));
    const ids = call.slots.map((s) => s.id);
    expect(ids).toContain("channel");
    expect(ids).toContain("announce-out");
    const divider = call.slots.find((s) => s.dividerBefore);
    expect(divider?.id).toBe("safety-signal-2");
    expect(divider?.dividerBefore).toContain("channel 72");
    expect(callText(call).trimEnd().endsWith("OUT")).toBe(true);
  });

  it("accepts in-dictionary stand-ins for the word Sécurité", () => {
    const call = buildCall("securite", TEST_IDENTITY, contextFor("securite"));
    const grammar = buildCallGrammar(call);
    expect(grammar).toContain("security");
    expect(grammar).toContain("securitas");
    expect(grammar).toContain("securitate");
    // The display text keeps the real spelling.
    expect(call.slots[0].text).toBe("SÉCURITÉ SÉCURITÉ SÉCURITÉ");
  });

  it("always admits both terminators so an early one can be reported", () => {
    for (const type of ALL_TYPES) {
      const grammar = buildCallGrammar(buildCall(type, TEST_IDENTITY, contextFor(type)));
      expect(grammar).toContain("over");
      expect(grammar).toContain("out");
      expect(grammar).toContain("[unk]");
    }
  });

  it("marks only the last slot as the terminator", () => {
    for (const type of ALL_TYPES) {
      const call = buildCall(type, TEST_IDENTITY, contextFor(type));
      const terminators = call.slots.filter((s) => s.terminator);
      expect(terminators).toHaveLength(1);
      expect(call.slots[call.slots.length - 1].terminator).toBe(true);
    }
  });

  it("asks for a working channel only for Sécurité", () => {
    expect(contextFieldsFor("securite")).toContain("workingChannel");
    expect(contextFieldsFor("mayday")).not.toContain("workingChannel");
    expect(contextFieldsFor("mayday")).toContain("personsOnBoard");
    expect(contextFieldsFor("securite")).not.toContain("personsOnBoard");
  });
});
