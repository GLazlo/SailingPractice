import { describe, expect, it } from "vitest";
import { phraseWords } from "../src/domain/phrase";
import {
  callSignPhrase,
  countPhrase,
  digitsPhrase,
  numberToWords,
  positionPhrase,
  randomIdentity,
  SHIP_NAMES,
  validateCallSign,
  validateLatitude,
  validateLongitude,
  validateMmsi,
  validatePersonsOnBoard,
  validateShipName,
  validateWorkingChannel
} from "../src/domain/shipIdentity";

/** First alternate of every term, i.e. one valid way of saying the phrase. */
function spoken(p: ReturnType<typeof digitsPhrase>): string[] {
  return p.flatMap((t) => t[0]);
}

describe("shipIdentity validation", () => {
  it("accepts a plausible vessel name and rejects junk", () => {
    expect(validateShipName("Sea Breeze")).toBeNull();
    expect(validateShipName("")).not.toBeNull();
    expect(validateShipName("A")).not.toBeNull();
    expect(validateShipName("Sea Breeze 2")).not.toBeNull();
  });

  it("requires a 3-7 character call sign", () => {
    expect(validateCallSign("DA1234")).toBeNull();
    expect(validateCallSign("AB")).not.toBeNull();
    expect(validateCallSign("ABCDEFGH")).not.toBeNull();
    expect(validateCallSign("DA-123")).not.toBeNull();
  });

  it("requires exactly nine MMSI digits", () => {
    expect(validateMmsi("211234567")).toBeNull();
    expect(validateMmsi("21123456")).not.toBeNull();
    expect(validateMmsi("2112345678")).not.toBeNull();
    expect(validateMmsi("21123456a")).not.toBeNull();
  });

  it("checks coordinate format and range", () => {
    expect(validateLatitude("54 12.5 N")).toBeNull();
    expect(validateLatitude("54 12.5 S")).toBeNull();
    expect(validateLatitude("91 12.5 N")).not.toBeNull();
    expect(validateLatitude("54 61.0 N")).not.toBeNull();
    expect(validateLatitude("54.5 N")).not.toBeNull();

    expect(validateLongitude("010 30.2 E")).toBeNull();
    expect(validateLongitude("181 30.2 E")).not.toBeNull();
  });

  it("checks persons on board and working channel", () => {
    expect(validatePersonsOnBoard("4")).toBeNull();
    expect(validatePersonsOnBoard("0")).not.toBeNull();
    expect(validatePersonsOnBoard("100")).not.toBeNull();

    expect(validateWorkingChannel("72")).toBeNull();
    expect(validateWorkingChannel("16")).not.toBeNull();
    expect(validateWorkingChannel("99")).not.toBeNull();
  });
});

describe("shipIdentity spoken forms", () => {
  it("spells numbers below one hundred", () => {
    expect(numberToWords(4)).toBe("four");
    expect(numberToWords(12)).toBe("twelve");
    expect(numberToWords(20)).toBe("twenty");
    expect(numberToWords(47)).toBe("forty seven");
  });

  it("says MMSI digits one by one and accepts niner for nine", () => {
    const p = digitsPhrase("219");
    expect(spoken(p)).toEqual(["two", "one", "nine"]);
    expect(phraseWords(p)).toContain("niner");
  });

  it("spells a call sign phonetically, digits included", () => {
    expect(spoken(callSignPhrase("DA12"))).toEqual(["delta", "alfa", "one", "two"]);
  });

  it("accepts a count either as a number word or digit by digit", () => {
    expect(phraseWords(countPhrase("12")).sort()).toEqual(["one", "twelve", "two"]);
    expect(spoken(countPhrase("4"))).toEqual(["four"]);
  });

  it("speaks a position as degrees, minutes and hemisphere", () => {
    expect(spoken(positionPhrase("54 12.5 N", "010 30.2 E"))).toEqual([
      "five", "four", "degrees", "one", "two", "decimal", "five", "minutes", "north",
      "zero", "one", "zero", "degrees", "three", "zero", "decimal", "two", "minutes", "east"
    ]);
  });

  it("omits the decimal part when minutes are whole", () => {
    expect(spoken(positionPhrase("54 12 N", ""))).toEqual([
      "five", "four", "degrees", "one", "two", "minutes", "north"
    ]);
  });
});

describe("random test values", () => {
  it("produces values that pass their own validation", () => {
    for (let i = 0; i < 50; i++) {
      const identity = randomIdentity();
      expect(validateShipName(identity.shipName)).toBeNull();
      expect(validateCallSign(identity.callSign)).toBeNull();
      expect(validateMmsi(identity.mmsi)).toBeNull();
      expect(SHIP_NAMES).toContain(identity.shipName);
    }
  });
});
