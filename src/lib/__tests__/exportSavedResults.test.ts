import { describe, it, expect } from "vite-plus/test";
import { formatSavedResultsAsText } from "../exportSavedResults";
import type { SavedResult } from "../../stores/savedResultsStore";

function makeResult(overrides: Partial<SavedResult> = {}): SavedResult {
  return {
    id: "test-id",
    savedAt: 1000,
    categoryId: "cat-1",
    categoryName: "NPCs",
    tableSetName: "NPC Generator",
    fields: [
      { tableName: "Name", entry: { title: "Zara" }, tableIndex: 0 },
      { tableName: "Trait", entry: { title: "Paranoid" }, tableIndex: 1 },
    ],
    note: "",
    ...overrides,
  };
}

describe("formatSavedResultsAsText", () => {
  it("empty collection returns empty string", () => {
    expect(formatSavedResultsAsText([])).toBe("");
  });

  it("single result formats with header and indented field line", () => {
    const result = formatSavedResultsAsText([makeResult()]);
    expect(result).toBe("NPCs — NPC Generator\n" + "  Name: Zara, Trait: Paranoid");
  });

  it("multiple groups produce separate sections", () => {
    const results = [
      makeResult({
        categoryId: "cat-1",
        categoryName: "NPCs",
        tableSetName: "NPC Gen",
        savedAt: 2000,
      }),
      makeResult({
        categoryId: "cat-2",
        categoryName: "Weapons",
        tableSetName: "Weapon Gen",
        savedAt: 1000,
        id: "w1",
        fields: [{ tableName: "Type", entry: { title: "Blade" }, tableIndex: 0 }],
      }),
    ];
    const text = formatSavedResultsAsText(results);
    const sections = text.split("\n\n");
    expect(sections).toHaveLength(2);
    expect(sections[0]).toContain("NPCs — NPC Gen");
    expect(sections[1]).toContain("Weapons — Weapon Gen");
  });

  it("result with note includes note line", () => {
    const result = formatSavedResultsAsText([
      makeResult({ note: "Good villain for next session" }),
    ]);
    expect(result).toContain("Name: Zara, Trait: Paranoid");
    expect(result).toContain("Note: Good villain for next session");
  });

  it("result without note omits note line", () => {
    const result = formatSavedResultsAsText([makeResult({ note: "" })]);
    expect(result).not.toContain("Note:");
  });

  it("entries with descriptions show title and description", () => {
    const result = formatSavedResultsAsText([
      makeResult({
        fields: [
          {
            tableName: "Weapon",
            entry: { title: "Blade", description: "A sharp glass sword" },
            tableIndex: 0,
          },
        ],
      }),
    ]);
    expect(result).toContain("Weapon: Blade — A sharp glass sword");
  });
});
