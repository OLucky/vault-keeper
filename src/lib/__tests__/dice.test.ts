import { describe, it, expect, vi } from "vite-plus/test";
import { rollDie, rollComputed } from "../dice";
import { getDieMax } from "../types";
import type { DieType } from "../types";

describe("rollDie", () => {
  const dieTypes: DieType[] = ["d4", "d6", "d8", "d10", "d12", "d20", "d80", "d100"];

  it.each(dieTypes)("returns values within valid range for %s", (die) => {
    const max = getDieMax(die);
    for (let i = 0; i < 1000; i++) {
      const result = rollDie(die);
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(max);
    }
  });

  it.each(dieTypes)("returns integers only for %s", (die) => {
    for (let i = 0; i < 1000; i++) {
      const result = rollDie(die);
      expect(Number.isInteger(result)).toBe(true);
    }
  });
});

describe("rollComputed", () => {
  it("returns value in range 1-6 for 3d6 lowest", () => {
    for (let i = 0; i < 1000; i++) {
      const result = rollComputed("3d6", "lowest");
      expect(result).toBeGreaterThanOrEqual(1);
      expect(result).toBeLessThanOrEqual(6);
    }
  });

  it("returns the lowest die with mocked Math.random", () => {
    // Mock Math.random to return specific values
    // Math.floor(val * 6) + 1 gives: 0.0->1, 0.5->4, 0.99->6
    const mockRandom = vi.spyOn(Math, "random");
    mockRandom
      .mockReturnValueOnce(0.5) // die 1: floor(0.5*6)+1 = 4
      .mockReturnValueOnce(0.0) // die 2: floor(0.0*6)+1 = 1
      .mockReturnValueOnce(0.99); // die 3: floor(0.99*6)+1 = 6

    const result = rollComputed("3d6", "lowest");
    expect(result).toBe(1);

    mockRandom.mockRestore();
  });

  it("returns lowest of two dice with mocked Math.random", () => {
    const mockRandom = vi.spyOn(Math, "random");
    mockRandom
      .mockReturnValueOnce(0.4) // die 1: floor(0.4*6)+1 = 3
      .mockReturnValueOnce(0.8); // die 2: floor(0.8*6)+1 = 5

    const result = rollComputed("2d6", "lowest");
    expect(result).toBe(3);

    mockRandom.mockRestore();
  });

  it('throws on invalid dice format "abc"', () => {
    expect(() => rollComputed("abc", "lowest")).toThrow("Invalid dice format");
  });

  it('throws on invalid dice format "d6" (missing count)', () => {
    expect(() => rollComputed("d6", "lowest")).toThrow("Invalid dice format");
  });

  it('throws on invalid dice format "3x6"', () => {
    expect(() => rollComputed("3x6", "lowest")).toThrow("Invalid dice format");
  });

  it('throws on unknown method "highest"', () => {
    expect(() => rollComputed("3d6", "highest")).toThrow("Unknown compute method");
  });
});
