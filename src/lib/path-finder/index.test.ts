import { describe, it, expect } from "bun:test";
import { findPath } from "./index";

import db from "@/db/db.json";

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
    console.log(path);

    expect(path?.length).toBeGreaterThan(2);
    expect(path?.[0].digimonId).toBe("326");
    // It can only de-digivolve to Koromon
    expect(path?.[1].digimonId).toBe("6");
  });
});
