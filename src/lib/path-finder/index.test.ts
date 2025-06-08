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

  it("should not do an 80-ABI evolution if we have 0 ABI", () => {
    const shoutmon = db["326"];
    const omnishoutmon = db["327"];
    // Given that we have 0 ABI, we can't evolve into OmniShoutmon in just one step
    const path = findPath(shoutmon, omnishoutmon, [], [], 0);
    expect(path).toBeDefined();

    expect(path?.length).toBeGreaterThan(2);
    expect(path?.[0].digimonId).toBe("326");
    // It can only de-digivolve to Koromon
    expect(path?.[1].digimonId).toBe("6");
    expect(path?.pop()?.digimonId).toBe("327");
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
    expect(path?.[1].abi).toBe(expectedAbiGain);
  });

  it("should always track the correct ABI gain", () => {
    const koromon = db["6"];
    const agumon = db["17"];
    const path = findPath(koromon, agumon, ["3"], [], 0);
    // Expected path for Wolkenapalm III is Koromon -> Agumon -> Agunimon Lv 10 -> Agumon
    expect(path).not.toBeNull();
    expect(path?.length).toBe(4);
    expect(path?.[0].digimonId).toBe("6");
    expect(path?.[0].abi).toBe(0);
    expect(path?.[1].digimonId).toBe("17");
    expect(path?.[1].abi).toBe(2);
    expect(path?.[2].digimonId).toBe("261");
    expect(path?.[2].abi).toBe(4);
    expect(path?.[3].digimonId).toBe("17");
    expect(path?.[3].abi).toBe(6);
  });
});
