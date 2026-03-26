import { describe, it, expect, beforeEach, vi } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRollStore } from "../../stores/rollStore";
import { ResultCard } from "../ResultCard/ResultCard";
import { rerollSingleField } from "../../lib/rolling";
import type { GeneratedResult, ResultField, TableSet } from "../../lib/types";

// Reset Zustand store between tests
beforeEach(() => {
  useRollStore.setState({
    recentRolls: [],
    stackedResults: {},
  });
});

const mockTableSet: TableSet = {
  name: "NPC Generator",
  tables: [
    {
      name: "Name",
      die: "d6",
      entries: [
        { range: [1, 3], title: "Zara" },
        { range: [4, 6], title: "Kael" },
      ],
    },
    {
      name: "Ancestry",
      die: "d6",
      entries: [
        { range: [1, 3], title: "Cacogen" },
        { range: [4, 6], title: "True-kin" },
      ],
    },
  ],
};

function makeResult(overrides: Partial<GeneratedResult> = {}): GeneratedResult {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    tableSetName: overrides.tableSetName ?? "NPC Generator",
    categoryName: overrides.categoryName ?? "npcs",
    fields: overrides.fields ?? [
      { tableName: "Name", entry: { title: "Zara" }, tableIndex: 0 },
      { tableName: "Ancestry", entry: { title: "Cacogen" }, tableIndex: 1 },
    ],
  };
}

// ──── rerollSingleField unit tests ────

describe("rerollSingleField", () => {
  it("returns a ResultField from the given table", () => {
    const table = mockTableSet.tables[0];
    const field = rerollSingleField(table, 0, () => 1);
    expect(field.tableName).toBe("Name");
    expect(field.entry.title).toBe("Zara");
    expect(field.tableIndex).toBe(0);
  });

  it("preserves the provided tableIndex", () => {
    const table = mockTableSet.tables[1];
    const field = rerollSingleField(table, 1, () => 4);
    expect(field.tableName).toBe("Ancestry");
    expect(field.entry.title).toBe("True-kin");
    expect(field.tableIndex).toBe(1);
  });

  it("includes description when entry has one", () => {
    const tableWithDesc: TableSet = {
      name: "Test",
      tables: [
        {
          name: "Trait",
          die: "d4",
          entries: [{ range: [1, 4], title: "Bold", description: "Fearless in battle" }],
        },
      ],
    };
    const field = rerollSingleField(tableWithDesc.tables[0], 0, () => 1);
    expect(field.entry.description).toBe("Fearless in battle");
  });
});

// ──── RerollButton rendering in ResultCard ────

describe("ResultCard with RerollButton", () => {
  it("renders a re-roll button next to each field when onFieldReroll is provided", () => {
    const result = makeResult();
    const onFieldReroll = vi.fn();

    render(<ResultCard result={result} tableSet={mockTableSet} onFieldReroll={onFieldReroll} />);

    expect(screen.getByRole("button", { name: "Re-roll Name" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Re-roll Ancestry" })).toBeInTheDocument();
  });

  it("does not render re-roll buttons when onFieldReroll is not provided", () => {
    const result = makeResult();

    render(<ResultCard result={result} />);

    expect(screen.queryByRole("button", { name: /Re-roll/ })).not.toBeInTheDocument();
  });

  it("calls onFieldReroll with correct arguments when a re-roll button is clicked", async () => {
    const user = userEvent.setup();
    const result = makeResult({ id: "test-id" });
    const onFieldReroll = vi.fn();

    render(<ResultCard result={result} tableSet={mockTableSet} onFieldReroll={onFieldReroll} />);

    await user.click(screen.getByRole("button", { name: "Re-roll Ancestry" }));

    expect(onFieldReroll).toHaveBeenCalledTimes(1);
    expect(onFieldReroll).toHaveBeenCalledWith("test-id", 1);
  });

  it("does not show re-roll buttons on triggered fields", () => {
    const result = makeResult({
      fields: [
        { tableName: "Race", entry: { title: "Cacogen" }, tableIndex: 0 },
        { tableName: "Mutation", entry: { title: "Extra Limb" }, tableIndex: 1, triggered: true },
      ],
    });
    const onFieldReroll = vi.fn();

    render(<ResultCard result={result} tableSet={mockTableSet} onFieldReroll={onFieldReroll} />);

    expect(screen.getByRole("button", { name: "Re-roll Race" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Re-roll Mutation" })).not.toBeInTheDocument();
  });
});

// ──── Zustand store rerollField tests ────

describe("rollStore.rerollField", () => {
  it("replaces only the targeted field in stackedResults", () => {
    const result = makeResult({ id: "r1" });
    useRollStore.getState().addRoll("npcs/npc.json", result);

    const newFields: ResultField[] = [
      {
        tableName: "Name",
        entry: { title: "Kael" },
        tableIndex: 0,
      },
    ];
    useRollStore.getState().rerollField("npcs/npc.json", "r1", 0, newFields);

    const state = useRollStore.getState();
    const updated = state.stackedResults["npcs/npc.json"][0];
    expect(updated.fields[0].entry.title).toBe("Kael");
    // Second field unchanged
    expect(updated.fields[1].entry.title).toBe("Cacogen");
  });

  it("also updates the same result in recentRolls", () => {
    const result = makeResult({ id: "r2" });
    useRollStore.getState().addRoll("npcs/npc.json", result);

    const newFields: ResultField[] = [
      {
        tableName: "Ancestry",
        entry: { title: "True-kin" },
        tableIndex: 1,
      },
    ];
    useRollStore.getState().rerollField("npcs/npc.json", "r2", 1, newFields);

    const state = useRollStore.getState();
    const recent = state.recentRolls.find((r) => r.id === "r2");
    expect(recent).toBeDefined();
    expect(recent!.fields[1].entry.title).toBe("True-kin");
    // First field unchanged
    expect(recent!.fields[0].entry.title).toBe("Zara");
  });

  it("does not affect other results in the same key", () => {
    const r1 = makeResult({ id: "r1" });
    const r2 = makeResult({ id: "r2" });
    useRollStore.getState().addRoll("npcs/npc.json", r1);
    useRollStore.getState().addRoll("npcs/npc.json", r2);

    const newFields: ResultField[] = [
      {
        tableName: "Name",
        entry: { title: "Kael" },
        tableIndex: 0,
      },
    ];
    useRollStore.getState().rerollField("npcs/npc.json", "r1", 0, newFields);

    const state = useRollStore.getState();
    const stacked = state.stackedResults["npcs/npc.json"];
    // r2 is first (newest), r1 is second
    const r1Updated = stacked.find((r) => r.id === "r1");
    const r2Unchanged = stacked.find((r) => r.id === "r2");
    expect(r1Updated!.fields[0].entry.title).toBe("Kael");
    expect(r2Unchanged!.fields[0].entry.title).toBe("Zara");
  });

  it("removes old triggered fields and inserts new ones on reroll", () => {
    const result: GeneratedResult = {
      id: "r1",
      tableSetName: "NPC Generator",
      categoryName: "npcs",
      fields: [
        { tableName: "Race", entry: { title: "Cacogen" }, tableIndex: 0 },
        { tableName: "Mutation", entry: { title: "Extra Limb" }, tableIndex: 1, triggered: true },
        { tableName: "Name", entry: { title: "Zara" }, tableIndex: 2 },
      ],
    };
    useRollStore.getState().addRoll("npcs/npc.json", result);

    // Re-roll Race to True-Kin (no triggers)
    useRollStore
      .getState()
      .rerollField("npcs/npc.json", "r1", 0, [
        { tableName: "Race", entry: { title: "True-Kin" }, tableIndex: 0 },
      ]);

    const updated = useRollStore.getState().stackedResults["npcs/npc.json"][0];
    expect(updated.fields).toHaveLength(2);
    expect(updated.fields[0].entry.title).toBe("True-Kin");
    expect(updated.fields[1].entry.title).toBe("Zara");
  });

  it("inserts new triggered fields when rerolled entry has triggers", () => {
    const result: GeneratedResult = {
      id: "r1",
      tableSetName: "NPC Generator",
      categoryName: "npcs",
      fields: [
        { tableName: "Race", entry: { title: "True-Kin" }, tableIndex: 0 },
        { tableName: "Name", entry: { title: "Zara" }, tableIndex: 2 },
      ],
    };
    useRollStore.getState().addRoll("npcs/npc.json", result);

    // Re-roll Race to Cacogen with a triggered mutation
    useRollStore.getState().rerollField("npcs/npc.json", "r1", 0, [
      { tableName: "Race", entry: { title: "Cacogen" }, tableIndex: 0 },
      { tableName: "Mutation", entry: { title: "Compound Eyes" }, tableIndex: 1, triggered: true },
    ]);

    const updated = useRollStore.getState().stackedResults["npcs/npc.json"][0];
    expect(updated.fields).toHaveLength(3);
    expect(updated.fields[0].entry.title).toBe("Cacogen");
    expect(updated.fields[1].entry.title).toBe("Compound Eyes");
    expect(updated.fields[1].triggered).toBe(true);
    expect(updated.fields[2].entry.title).toBe("Zara");
  });
});
