import { describe, it, expect, beforeEach } from "vitest";
import { useSessionLogStore } from "../sessionLogStore";
import type { GeneratedResult } from "../../lib/types";

function makeResult(overrides: Partial<GeneratedResult> = {}): GeneratedResult {
  return {
    id: "test-id",
    tableSetName: "Test Table Set",
    categoryName: "Test Category",
    fields: [
      {
        tableName: "Test Table",
        entry: { title: "Test Entry", description: "A test entry" },
        tableIndex: 0,
      },
    ],
    ...overrides,
  };
}

describe("sessionLogStore", () => {
  beforeEach(() => {
    useSessionLogStore.setState({
      entries: [],
      sidebarOpen: false,
      unseenCount: 0,
    });
  });

  describe("addEntry", () => {
    it("adds an entry with timestamp, prepends to array (newest first)", () => {
      const before = Date.now();
      useSessionLogStore.getState().addEntry(makeResult({ id: "a" }), "cat-1");
      useSessionLogStore.getState().addEntry(makeResult({ id: "b" }), "cat-1");
      const after = Date.now();

      const { entries } = useSessionLogStore.getState();
      expect(entries).toHaveLength(2);
      expect(entries[0].id).toBe("b");
      expect(entries[1].id).toBe("a");
      expect(entries[0].timestamp).toBeGreaterThanOrEqual(before);
      expect(entries[0].timestamp).toBeLessThanOrEqual(after);
      expect(entries[0].categoryId).toBe("cat-1");
      expect(entries[0].categoryName).toBe("Test Category");
      expect(entries[0].tableSetName).toBe("Test Table Set");
      expect(entries[0].fields).toHaveLength(1);
    });

    it("increments unseenCount when sidebar is closed", () => {
      useSessionLogStore.getState().addEntry(makeResult({ id: "a" }), "cat-1");
      expect(useSessionLogStore.getState().unseenCount).toBe(1);

      useSessionLogStore.getState().addEntry(makeResult({ id: "b" }), "cat-1");
      expect(useSessionLogStore.getState().unseenCount).toBe(2);
    });

    it("does not increment unseenCount when sidebar is open", () => {
      useSessionLogStore.setState({ sidebarOpen: true });

      useSessionLogStore.getState().addEntry(makeResult({ id: "a" }), "cat-1");
      expect(useSessionLogStore.getState().unseenCount).toBe(0);
    });
  });

  describe("removeEntry", () => {
    it("removes entry by ID", () => {
      useSessionLogStore.getState().addEntry(makeResult({ id: "a" }), "cat-1");
      useSessionLogStore.getState().addEntry(makeResult({ id: "b" }), "cat-1");

      useSessionLogStore.getState().removeEntry("a");

      const { entries } = useSessionLogStore.getState();
      expect(entries).toHaveLength(1);
      expect(entries[0].id).toBe("b");
    });

    it("leaves entries unchanged when ID does not exist", () => {
      useSessionLogStore.getState().addEntry(makeResult({ id: "a" }), "cat-1");

      useSessionLogStore.getState().removeEntry("nonexistent");

      expect(useSessionLogStore.getState().entries).toHaveLength(1);
      expect(useSessionLogStore.getState().entries[0].id).toBe("a");
    });
  });

  describe("clearAll", () => {
    it("empties entries array and resets unseenCount", () => {
      useSessionLogStore.getState().addEntry(makeResult({ id: "a" }), "cat-1");
      useSessionLogStore.getState().addEntry(makeResult({ id: "b" }), "cat-1");
      expect(useSessionLogStore.getState().unseenCount).toBe(2);

      useSessionLogStore.getState().clearAll();

      const state = useSessionLogStore.getState();
      expect(state.entries).toEqual([]);
      expect(state.unseenCount).toBe(0);
    });
  });

  describe("toggleSidebar", () => {
    it("toggles sidebarOpen from false to true", () => {
      expect(useSessionLogStore.getState().sidebarOpen).toBe(false);

      useSessionLogStore.getState().toggleSidebar();

      expect(useSessionLogStore.getState().sidebarOpen).toBe(true);
    });

    it("resets unseenCount to 0 when opening", () => {
      useSessionLogStore.getState().addEntry(makeResult({ id: "a" }), "cat-1");
      useSessionLogStore.getState().addEntry(makeResult({ id: "b" }), "cat-1");
      expect(useSessionLogStore.getState().unseenCount).toBe(2);

      useSessionLogStore.getState().toggleSidebar();

      expect(useSessionLogStore.getState().sidebarOpen).toBe(true);
      expect(useSessionLogStore.getState().unseenCount).toBe(0);
    });

    it("preserves unseenCount when closing", () => {
      useSessionLogStore.setState({ sidebarOpen: true, unseenCount: 3 });

      useSessionLogStore.getState().toggleSidebar();

      expect(useSessionLogStore.getState().sidebarOpen).toBe(false);
      expect(useSessionLogStore.getState().unseenCount).toBe(3);
    });
  });

  describe("openSidebar", () => {
    it("sets sidebarOpen to true and resets unseenCount", () => {
      useSessionLogStore.getState().addEntry(makeResult({ id: "a" }), "cat-1");
      expect(useSessionLogStore.getState().unseenCount).toBe(1);

      useSessionLogStore.getState().openSidebar();

      const state = useSessionLogStore.getState();
      expect(state.sidebarOpen).toBe(true);
      expect(state.unseenCount).toBe(0);
    });
  });
});
