import type { RenderedCall } from "../../src/domain/radioCalls";
import type { CallContext, ShipIdentity } from "../../src/domain/shipIdentity";

export const TEST_IDENTITY: ShipIdentity = {
  shipName: "Sea Breeze",
  callSign: "DA12",
  mmsi: "211234567"
};

export const TEST_CONTEXT: CallContext = {
  latitude: "54 12.5 N",
  longitude: "010 30.2 E",
  personsOnBoard: "4",
  workingChannel: "72",
  natureId: "sinking"
};

/** One valid delivery of the whole message, as the recognizer would report it. */
export function speak(call: RenderedCall): string[] {
  const tokens: string[] = [];
  for (const slot of call.slots) {
    for (let i = 0; i < slot.repeat; i++) {
      for (const term of slot.phrase) tokens.push(...term[0]);
    }
  }
  return tokens;
}

/** The same, but with one slot left unsaid. */
export function speakWithout(call: RenderedCall, slotId: string): string[] {
  const tokens: string[] = [];
  for (const slot of call.slots) {
    if (slot.id === slotId) continue;
    for (let i = 0; i < slot.repeat; i++) {
      for (const term of slot.phrase) tokens.push(...term[0]);
    }
  }
  return tokens;
}
