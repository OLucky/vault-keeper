import { describe, it, expect, beforeEach } from "vite-plus/test";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  createRootRoute,
  createRoute,
  createRouter,
  createMemoryHistory,
  RouterProvider,
} from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRollStore } from "../../stores/rollStore";
import { ResultCard } from "../ResultCard/ResultCard";
import { TableSetEntry } from "../TableSetEntry/TableSetEntry";
import type { GeneratedResult, TableSet } from "../../lib/types";

// Reset Zustand store between tests
beforeEach(() => {
  useRollStore.setState({
    recentRolls: [],
    stackedResults: {},
  });
});

function makeResult(overrides: Partial<GeneratedResult> = {}): GeneratedResult {
  return {
    id: overrides.id ?? crypto.randomUUID(),
    tableSetName: overrides.tableSetName ?? "Test Set",
    categoryName: overrides.categoryName ?? "test",
    fields: overrides.fields ?? [
      {
        tableName: "Name",
        entry: { title: "Zara" },
        tableIndex: 0,
      },
    ],
  };
}

// ──── Zustand store tests ────

describe("rollStore", () => {
  it("addRoll adds to both stackedResults and recentRolls", () => {
    const result = makeResult();
    useRollStore.getState().addRoll("cat/file.json", result);

    const state = useRollStore.getState();
    expect(state.stackedResults["cat/file.json"]).toHaveLength(1);
    expect(state.stackedResults["cat/file.json"][0]).toBe(result);
    expect(state.recentRolls).toHaveLength(1);
    expect(state.recentRolls[0]).toBe(result);
  });

  it("stackedResults are LIFO (newest first)", () => {
    const r1 = makeResult({ id: "1" });
    const r2 = makeResult({ id: "2" });
    const { addRoll } = useRollStore.getState();
    addRoll("cat/file.json", r1);
    addRoll("cat/file.json", r2);

    const stacked = useRollStore.getState().stackedResults["cat/file.json"];
    expect(stacked[0].id).toBe("2");
    expect(stacked[1].id).toBe("1");
  });

  it("enforces max 10 stacked results per key", () => {
    const { addRoll } = useRollStore.getState();
    for (let i = 0; i < 12; i++) {
      addRoll("cat/file.json", makeResult({ id: String(i) }));
    }

    const stacked = useRollStore.getState().stackedResults["cat/file.json"];
    expect(stacked).toHaveLength(10);
    // newest first
    expect(stacked[0].id).toBe("11");
    expect(stacked[9].id).toBe("2");
  });

  it("enforces max 5 recent rolls", () => {
    const { addRoll } = useRollStore.getState();
    for (let i = 0; i < 7; i++) {
      addRoll("cat/file.json", makeResult({ id: String(i) }));
    }

    const recent = useRollStore.getState().recentRolls;
    expect(recent).toHaveLength(5);
    expect(recent[0].id).toBe("6");
    expect(recent[4].id).toBe("2");
  });

  it("clearStacked removes entries matching categoryId prefix", () => {
    const { addRoll } = useRollStore.getState();
    addRoll("npcs/gen.json", makeResult());
    addRoll("npcs/other.json", makeResult());
    addRoll("weather/storm.json", makeResult());

    useRollStore.getState().clearStacked("npcs");

    const state = useRollStore.getState();
    expect(state.stackedResults["npcs/gen.json"]).toBeUndefined();
    expect(state.stackedResults["npcs/other.json"]).toBeUndefined();
    expect(state.stackedResults["weather/storm.json"]).toHaveLength(1);
  });

  it("clearStacked does not affect recentRolls", () => {
    const { addRoll } = useRollStore.getState();
    addRoll("npcs/gen.json", makeResult());

    useRollStore.getState().clearStacked("npcs");

    expect(useRollStore.getState().recentRolls).toHaveLength(1);
  });
});

// ──── ResultCard tests ────

describe("ResultCard", () => {
  it("renders labeled fields correctly", () => {
    const result = makeResult({
      fields: [
        { tableName: "Name", entry: { title: "Zara" }, tableIndex: 0 },
        { tableName: "Ancestry", entry: { title: "Cacogen" }, tableIndex: 1 },
      ],
    });

    render(<ResultCard result={result} />);

    expect(screen.getByText("Name:")).toBeInTheDocument();
    expect(screen.getByText("Zara")).toBeInTheDocument();
    expect(screen.getByText("Ancestry:")).toBeInTheDocument();
    expect(screen.getByText("Cacogen")).toBeInTheDocument();
  });

  it("shows description when present", () => {
    const result = makeResult({
      fields: [
        {
          tableName: "Trait",
          entry: { title: "Paranoid", description: "Trusts no one" },
          tableIndex: 0,
        },
      ],
    });

    render(<ResultCard result={result} />);

    expect(screen.getByText("Trait:")).toBeInTheDocument();
    expect(screen.getByText(/Paranoid/)).toBeInTheDocument();
    expect(screen.getByText(/Trusts no one/)).toBeInTheDocument();
  });

  it("omits description when absent", () => {
    const result = makeResult({
      fields: [{ tableName: "Name", entry: { title: "Zara" }, tableIndex: 0 }],
    });

    const { container } = render(<ResultCard result={result} />);

    expect(screen.getByText("Zara")).toBeInTheDocument();
    // no mdash present
    expect(container.textContent).not.toContain("\u2014");
  });
});

// ──── Roll button integration tests ────

const mockTableSet: TableSet = {
  name: "NPC Generator",
  tables: [
    {
      name: "Ancestry",
      die: "d6",
      entries: [
        { range: [1, 2], title: "Cacogen" },
        { range: [3, 4], title: "True-kin" },
        { range: [5, 6], title: "Newbeast" },
      ],
    },
  ],
};

function createTestRouter(component: () => React.JSX.Element) {
  const rootRoute = createRootRoute();
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => <div>Dashboard</div>,
  });
  const testRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/test",
    component,
  });
  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute, testRoute]),
    history: createMemoryHistory({ initialEntries: ["/test"] }),
  });
  return router;
}

function renderWithRouter(component: () => React.JSX.Element) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const router = createTestRouter(component);
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}

describe("Roll button integration", () => {
  it("clicking Roll produces an inline result below the entry", async () => {
    const user = userEvent.setup();
    renderWithRouter(() => (
      <TableSetEntry tableSet={mockTableSet} categoryId="npcs" fileName="npc-generator.json" />
    ));

    const rollButton = await screen.findByRole("button", { name: "Roll" });
    await user.click(rollButton);

    // Should show the Ancestry field label
    expect(screen.getByText("Ancestry:")).toBeInTheDocument();
  });

  it("multiple rolls stack newest first", async () => {
    const user = userEvent.setup();
    renderWithRouter(() => (
      <TableSetEntry tableSet={mockTableSet} categoryId="npcs" fileName="npc-generator.json" />
    ));

    const rollButton = await screen.findByRole("button", { name: "Roll" });
    await user.click(rollButton);
    await user.click(rollButton);
    await user.click(rollButton);

    // Should have 3 Ancestry labels (one per result card)
    const labels = screen.getAllByText("Ancestry:");
    expect(labels).toHaveLength(3);

    // Verify store has 3 stacked results with newest first
    const stacked = useRollStore.getState().stackedResults["npcs/npc-generator.json"];
    expect(stacked).toHaveLength(3);
    // Each result should have a unique id, and the first should be the newest
    expect(stacked[0].id).not.toBe(stacked[1].id);
    expect(stacked[1].id).not.toBe(stacked[2].id);
  });
});
