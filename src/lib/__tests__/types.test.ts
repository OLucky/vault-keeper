import { describe, it, expect } from "vitest";
import {
  DieType,
  EntrySchema,
  TableSchema,
  TableSetSchema,
  CategoryIndexSchema,
  ManifestSchema,
  TriggerSchema,
  ComputeSchema,
} from "../types";

describe("DieType", () => {
  it("accepts valid die types", () => {
    expect(DieType.parse("d4")).toBe("d4");
    expect(DieType.parse("d6")).toBe("d6");
    expect(DieType.parse("d8")).toBe("d8");
    expect(DieType.parse("d10")).toBe("d10");
    expect(DieType.parse("d12")).toBe("d12");
    expect(DieType.parse("d20")).toBe("d20");
    expect(DieType.parse("d100")).toBe("d100");
  });

  it("accepts non-standard die types", () => {
    expect(DieType.parse("d3")).toBe("d3");
    expect(DieType.parse("d7")).toBe("d7");
    expect(DieType.parse("d80")).toBe("d80");
  });

  it("rejects invalid die types", () => {
    expect(() => DieType.parse("coin")).toThrow();
    expect(() => DieType.parse("abc")).toThrow();
    expect(() => DieType.parse("")).toThrow();
    expect(() => DieType.parse("20")).toThrow();
  });
});

describe("TriggerSchema", () => {
  it("accepts trigger with tableId only", () => {
    const result = TriggerSchema.parse({ tableId: "mutations" });
    expect(result.tableId).toBe("mutations");
  });

  it("accepts trigger with tableSet only", () => {
    const result = TriggerSchema.parse({ tableSet: "mutations/mutation-generator" });
    expect(result.tableSet).toBe("mutations/mutation-generator");
  });

  it("accepts trigger with both fields", () => {
    const result = TriggerSchema.parse({
      tableSet: "mutations/mutation-generator",
      tableId: "physical",
    });
    expect(result.tableSet).toBe("mutations/mutation-generator");
    expect(result.tableId).toBe("physical");
  });

  it("rejects trigger with neither field", () => {
    expect(() => TriggerSchema.parse({})).toThrow();
  });
});

describe("EntrySchema", () => {
  it("accepts a valid entry with range and title", () => {
    const entry = EntrySchema.parse({ range: [1, 3], title: "Test" });
    expect(entry.range).toEqual([1, 3]);
    expect(entry.title).toBe("Test");
  });

  it("accepts an entry with description", () => {
    const entry = EntrySchema.parse({
      range: [1, 1],
      title: "Test",
      description: "A description",
    });
    expect(entry.description).toBe("A description");
  });

  it("accepts an entry with triggers", () => {
    const entry = EntrySchema.parse({
      range: [1, 1],
      title: "Test",
      triggers: [{ tableId: "mutations" }],
    });
    expect(entry.triggers).toHaveLength(1);
  });

  it("rejects entry missing title", () => {
    expect(() => EntrySchema.parse({ range: [1, 1] })).toThrow();
  });

  it("rejects entry missing range", () => {
    expect(() => EntrySchema.parse({ title: "Test" })).toThrow();
  });

  it("rejects invalid range format", () => {
    expect(() => EntrySchema.parse({ range: [1], title: "Test" })).toThrow();
    expect(() => EntrySchema.parse({ range: "bad", title: "Test" })).toThrow();
    expect(() => EntrySchema.parse({ range: [1, 2, 3], title: "Test" })).toThrow();
  });
});

describe("TableSchema", () => {
  it("accepts a valid table", () => {
    const table = TableSchema.parse({
      name: "Test Table",
      die: "d6",
      entries: [{ range: [1, 6], title: "All" }],
    });
    expect(table.name).toBe("Test Table");
    expect("die" in table && table.die).toBe("d6");
  });

  it("accepts a table with optional id and conditional", () => {
    const table = TableSchema.parse({
      name: "Test",
      id: "test-id",
      die: "d6",
      conditional: true,
      entries: [{ range: [1, 6], title: "All" }],
    });
    expect(table.id).toBe("test-id");
    expect(table.conditional).toBe(true);
  });

  it("accepts table with non-standard die type", () => {
    const table = TableSchema.parse({
      name: "Test",
      die: "d80",
      entries: [{ range: [1, 80], title: "All" }],
    });
    expect("die" in table && table.die).toBe("d80");
  });

  it("rejects table with invalid die type", () => {
    expect(() =>
      TableSchema.parse({
        name: "Test",
        die: "coin",
        entries: [{ range: [1, 2], title: "All" }],
      }),
    ).toThrow();
  });

  it("rejects table missing name", () => {
    expect(() =>
      TableSchema.parse({
        die: "d6",
        entries: [{ range: [1, 6], title: "All" }],
      }),
    ).toThrow();
  });

  it("rejects table missing entries", () => {
    expect(() =>
      TableSchema.parse({
        name: "Test",
        die: "d6",
      }),
    ).toThrow();
  });
});

describe("TableSetSchema", () => {
  it("accepts a valid table set", () => {
    const tableSet = TableSetSchema.parse({
      name: "Generator",
      tables: [
        {
          name: "Table 1",
          die: "d6",
          entries: [{ range: [1, 6], title: "All" }],
        },
      ],
    });
    expect(tableSet.name).toBe("Generator");
    expect(tableSet.tables).toHaveLength(1);
  });

  it("rejects table set missing name", () => {
    expect(() =>
      TableSetSchema.parse({
        tables: [
          {
            name: "Table 1",
            die: "d6",
            entries: [{ range: [1, 6], title: "All" }],
          },
        ],
      }),
    ).toThrow();
  });
});

describe("CategoryIndexSchema", () => {
  it("accepts a valid category index", () => {
    const index = CategoryIndexSchema.parse({
      name: "NPCs",
      tableSets: ["npc-generator.json"],
    });
    expect(index.name).toBe("NPCs");
    expect(index.tableSets).toEqual(["npc-generator.json"]);
  });

  it("rejects missing name", () => {
    expect(() => CategoryIndexSchema.parse({ tableSets: ["file.json"] })).toThrow();
  });
});

describe("ManifestSchema", () => {
  it("accepts a valid manifest", () => {
    const manifest = ManifestSchema.parse({
      categories: ["npcs", "equipment"],
    });
    expect(manifest.categories).toEqual(["npcs", "equipment"]);
  });

  it("rejects missing categories", () => {
    expect(() => ManifestSchema.parse({})).toThrow();
  });
});

describe("ComputeSchema", () => {
  it("accepts valid compute config", () => {
    const compute = ComputeSchema.parse({ dice: "3d6", method: "lowest" });
    expect(compute.dice).toBe("3d6");
    expect(compute.method).toBe("lowest");
  });

  it("rejects invalid dice format", () => {
    expect(() => ComputeSchema.parse({ dice: "abc", method: "lowest" })).toThrow();
    expect(() => ComputeSchema.parse({ dice: "d6", method: "lowest" })).toThrow();
  });

  it("rejects invalid method", () => {
    expect(() => ComputeSchema.parse({ dice: "3d6", method: "highest" })).toThrow();
  });
});

describe("TableSchema - computed tables", () => {
  it("accepts a valid computed table", () => {
    const table = TableSchema.parse({
      name: "Str",
      type: "computed",
      compute: { dice: "3d6", method: "lowest" },
    });
    expect(table.name).toBe("Str");
    expect(table.type).toBe("computed");
    if (table.type !== "computed") throw new Error("expected computed table");
    expect(table.compute.dice).toBe("3d6");
  });

  it("accepts a lookup table without explicit type (backward compat)", () => {
    const table = TableSchema.parse({
      name: "Test Table",
      die: "d6",
      entries: [{ range: [1, 6], title: "All" }],
    });
    expect(table.name).toBe("Test Table");
    if (!("die" in table)) throw new Error("expected lookup table with die");
    expect(table.die).toBe("d6");
  });

  it('accepts a lookup table with explicit type: "lookup"', () => {
    const table = TableSchema.parse({
      name: "Test Table",
      type: "lookup",
      die: "d6",
      entries: [{ range: [1, 6], title: "All" }],
    });
    expect(table.name).toBe("Test Table");
    expect(table.type).toBe("lookup");
  });

  it("rejects computed table missing compute field", () => {
    expect(() =>
      TableSchema.parse({
        name: "Str",
        type: "computed",
      }),
    ).toThrow();
  });

  it("rejects computed table with bad method", () => {
    expect(() =>
      TableSchema.parse({
        name: "Str",
        type: "computed",
        compute: { dice: "3d6", method: "highest" },
      }),
    ).toThrow();
  });
});

describe("TableSetSchema - mixed tables", () => {
  it("accepts a table set with mixed lookup and computed tables", () => {
    const tableSet = TableSetSchema.parse({
      name: "Character Generator",
      tables: [
        {
          name: "Ancestry",
          die: "d6",
          entries: [{ range: [1, 6], title: "Human" }],
        },
        {
          name: "Strength",
          type: "computed",
          compute: { dice: "3d6", method: "lowest" },
        },
        {
          name: "Dexterity",
          type: "computed",
          compute: { dice: "3d6", method: "lowest" },
        },
      ],
    });
    expect(tableSet.tables).toHaveLength(3);
    expect(tableSet.tables[0].name).toBe("Ancestry");
    expect(tableSet.tables[1].name).toBe("Strength");
    expect(tableSet.tables[2].name).toBe("Dexterity");
  });
});
