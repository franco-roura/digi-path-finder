import { describe, it, expect } from "bun:test";
import { findPath } from "./index";

import db from "@/db/db.json";
import { calculateAbiGain } from "./optimal-abi";

describe("Path Finder", () => {
  it("should find a simple path", () => {
    const koromon = db["6"];
    const agumon = db["17"];
    const path = findPath(koromon, agumon, [], [], 0);
    expect(path).toBeDefined();
    expect(path?.length).toBe(2);
    expect(path?.[0].digimonId).toBe("6");
    expect(path?.[1].digimonId).toBe("17");
  });

  it("should find a path with a skill", () => {
    const koromon = db["6"];
    const agumon = db["17"];
    const path = findPath(koromon, agumon, ["81"], [], 0);
    expect(path).toBeDefined();
    expect(path?.length).toBe(2);
    expect(path?.[0].digimonId).toBe("6");
    expect(path?.[1].digimonId).toBe("17");
  });

  it("should register the correct ABI gain", () => {
    const koromon = db["6"];
    const agumon = db["17"];
    const path = findPath(koromon, agumon, [], [], 0);
    expect(path).toBeDefined();
    // Koromon needs to be Lv9 to evolve to Agumon
    expect(path?.[1].gainedLevels).toBe(9);
    const expectedAbiGain = Math.ceil(
      calculateAbiGain("In-Training", "digivolve", 9) || 0
    );
    expect(path?.[1].abiThusFar).toBe(expectedAbiGain);
  });

  it("should always track the correct ABI gain", () => {
    const koromon = db["6"];
    const agumon = db["17"];
    const path = findPath(koromon, agumon, ["3"], [], 0);
    // Expected path for Wolkenapalm III is Koromon -> Agumon -> Agunimon Lv 10 -> Agumon
    expect(path).not.toBeNull();
    expect(path?.length).toBe(4);
    expect(path?.[0].digimonId).toBe("6");
    expect(path?.[0].abiThusFar).toBe(0);
    expect(path?.[1].digimonId).toBe("17");
    expect(path?.[1].abiThusFar).toBe(2);
    expect(path?.[2].digimonId).toBe("261");
    expect(path?.[2].abiThusFar).toBe(5);
    expect(path?.[3].digimonId).toBe("17");
    expect(path?.[3].abiThusFar).toBe(11);
  });

  it("should find an optimal path for farming ABI", () => {
    const veemon = db["46"];
    const magnamon = db["239"];
    const path = findPath(veemon, magnamon, [], [], 0);
    expect(path).toBeDefined();
    expect(path?.[0].digimonId).toBe("46");
    expect(path?.pop()?.digimonId).toBe("239");
    expect(path?.pop()?.digimonId).toBe("46");
  });

  it("should find a path with a misc requirement", () => {
    const agumon = db["17"];
    const kaiserGreymon = db["303"];
    const path = findPath(agumon, kaiserGreymon, [], [], 0);
    expect(path).toBeDefined();
    expect(path?.[0].digimonId).toBe("17");
    expect(path?.pop()?.digimonId).toBe("303");
  });
});
