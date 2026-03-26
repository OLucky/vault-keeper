import { describe, it, expect } from "vite-plus/test";
import { z, ZodError } from "zod";
import { validateRangeCoverage, formatValidationError, validateTableSet } from "../validation";
import { ComputeSchema } from "../types";
import type { Entry } from "../types";

describe("validateRangeCoverage", () => {
  it("accepts valid full coverage", () => {
    const entries: Entry[] = [
      { range: [1, 2], title: "A" },
      { range: [3, 4], title: "B" },
      { range: [5, 6], title: "C" },
    ];
    const result = validateRangeCoverage(entries, 6);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("accepts single entry covering full range", () => {
    const entries: Entry[] = [{ range: [1, 6], title: "All" }];
    const result = validateRangeCoverage(entries, 6);
    expect(result.valid).toBe(true);
  });

  it("accepts entries in any order", () => {
    const entries: Entry[] = [
      { range: [5, 6], title: "C" },
      { range: [1, 2], title: "A" },
      { range: [3, 4], title: "B" },
    ];
    const result = validateRangeCoverage(entries, 6);
    expect(result.valid).toBe(true);
  });

  it("detects gap in ranges", () => {
    const entries: Entry[] = [
      { range: [1, 2], title: "A" },
      { range: [4, 6], title: "B" },
    ];
    const result = validateRangeCoverage(entries, 6);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Gap");
  });

  it("detects gap at the end", () => {
    const entries: Entry[] = [
      { range: [1, 2], title: "A" },
      { range: [3, 4], title: "B" },
    ];
    const result = validateRangeCoverage(entries, 6);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Gap");
  });

  it("detects overlapping ranges", () => {
    const entries: Entry[] = [
      { range: [1, 3], title: "A" },
      { range: [3, 6], title: "B" },
    ];
    const result = validateRangeCoverage(entries, 6);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("Overlapping");
  });

  it("detects ranges exceeding die maximum", () => {
    const entries: Entry[] = [
      { range: [1, 4], title: "A" },
      { range: [5, 8], title: "B" },
    ];
    const result = validateRangeCoverage(entries, 6);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("exceed");
  });
});

describe("formatValidationError", () => {
  it("formats a ZodError into a readable string", () => {
    const result = z.object({ name: z.string() }).safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      const message = formatValidationError(result.error as ZodError);
      expect(message).toContain("name");
    }
  });
});

describe("validateTableSet", () => {
  it("accepts a valid table set", () => {
    const data = {
      name: "Test Generator",
      tables: [
        {
          name: "Table",
          die: "d6",
          entries: [
            { range: [1, 2], title: "A" },
            { range: [3, 4], title: "B" },
            { range: [5, 6], title: "C" },
          ],
        },
      ],
    };
    const result = validateTableSet(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Test Generator");
    }
  });

  it("rejects invalid table set (bad schema)", () => {
    const data = { tables: [{ die: "d6" }] };
    const result = validateTableSet(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
  });

  it("rejects table set with range coverage errors", () => {
    const data = {
      name: "Bad Generator",
      tables: [
        {
          name: "Broken Table",
          die: "d6",
          entries: [
            { range: [1, 2], title: "A" },
            { range: [5, 6], title: "B" },
          ],
        },
      ],
    };
    const result = validateTableSet(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Broken Table");
      expect(result.error).toContain("Gap");
    }
  });

  it("validates multiple tables in a set", () => {
    const data = {
      name: "Multi Table",
      tables: [
        {
          name: "Good Table",
          die: "d4",
          entries: [
            { range: [1, 2], title: "A" },
            { range: [3, 4], title: "B" },
          ],
        },
        {
          name: "Bad Table",
          die: "d4",
          entries: [
            { range: [1, 1], title: "A" },
            { range: [3, 4], title: "B" },
          ],
        },
      ],
    };
    const result = validateTableSet(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Bad Table");
    }
  });

  it("accepts a table set with only computed tables", () => {
    const data = {
      name: "Ability Scores",
      tables: [
        {
          name: "Strength",
          type: "computed" as const,
          compute: { dice: "3d6", method: "lowest" },
        },
        {
          name: "Dexterity",
          type: "computed" as const,
          compute: { dice: "3d6", method: "lowest" },
        },
      ],
    };
    const result = validateTableSet(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tables).toHaveLength(2);
      expect(result.data.tables[0].type).toBe("computed");
    }
  });

  it("accepts a mixed table set with lookup and computed tables", () => {
    const data = {
      name: "Mixed Generator",
      tables: [
        {
          name: "Background",
          die: "d4",
          entries: [
            { range: [1, 2], title: "Nomad" },
            { range: [3, 4], title: "Scholar" },
          ],
        },
        {
          name: "Strength",
          type: "computed" as const,
          compute: { dice: "3d6", method: "lowest" },
        },
      ],
    };
    const result = validateTableSet(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tables).toHaveLength(2);
    }
  });

  it("rejects a computed table with malformed dice format", () => {
    const data = {
      name: "Bad Computed",
      tables: [
        {
          name: "Strength",
          type: "computed" as const,
          compute: { dice: "roll3d6", method: "lowest" },
        },
      ],
    };
    const result = validateTableSet(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
  });

  it("rejects a computed table with unsupported method", () => {
    const data = {
      name: "Bad Method",
      tables: [
        {
          name: "Strength",
          type: "computed" as const,
          compute: { dice: "3d6", method: "highest" },
        },
      ],
    };
    const result = validateTableSet(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeTruthy();
    }
  });

  it("passes computed table but fails lookup table with missing entries", () => {
    const data = {
      name: "Mixed Validity",
      tables: [
        {
          name: "Strength",
          type: "computed" as const,
          compute: { dice: "3d6", method: "lowest" },
        },
        {
          name: "Broken Lookup",
          die: "d6",
          entries: [
            { range: [1, 2], title: "A" },
            { range: [5, 6], title: "B" },
          ],
        },
      ],
    };
    const result = validateTableSet(data);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toContain("Broken Lookup");
      expect(result.error).toContain("Gap");
    }
  });
});

describe("ComputeSchema (Zod validation)", () => {
  it("accepts valid compute object", () => {
    const result = ComputeSchema.safeParse({ dice: "3d6", method: "lowest" });
    expect(result.success).toBe(true);
  });

  it("accepts different valid dice formats", () => {
    expect(ComputeSchema.safeParse({ dice: "4d8", method: "lowest" }).success).toBe(true);
    expect(ComputeSchema.safeParse({ dice: "1d20", method: "lowest" }).success).toBe(true);
  });

  it("rejects dice missing count prefix", () => {
    const result = ComputeSchema.safeParse({ dice: "d6", method: "lowest" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid dice string", () => {
    const result = ComputeSchema.safeParse({ dice: "abc", method: "lowest" });
    expect(result.success).toBe(false);
  });

  it("rejects unsupported method", () => {
    const result = ComputeSchema.safeParse({ dice: "3d6", method: "highest" });
    expect(result.success).toBe(false);
  });

  it("rejects missing fields", () => {
    expect(ComputeSchema.safeParse({ dice: "3d6" }).success).toBe(false);
    expect(ComputeSchema.safeParse({ method: "lowest" }).success).toBe(false);
    expect(ComputeSchema.safeParse({}).success).toBe(false);
  });
});
