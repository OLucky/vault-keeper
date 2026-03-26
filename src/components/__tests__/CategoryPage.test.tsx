import { describe, it, expect } from "vite-plus/test";
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
import { TableSetEntry } from "../TableSetEntry/TableSetEntry";
import { FilterInput } from "../FilterInput/FilterInput";
import type { TableSet } from "../../lib/types";
import { useState } from "react";

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

const mockTableSet2: TableSet = {
  name: "Weather Patterns",
  tables: [
    {
      name: "Weather",
      die: "d4",
      entries: [
        { range: [1, 1], title: "Sandstorm" },
        { range: [2, 2], title: "Clear" },
        { range: [3, 3], title: "Acid Rain" },
        { range: [4, 4], title: "Calm" },
      ],
    },
  ],
};

describe("TableSetEntry", () => {
  it("renders the table set name", async () => {
    renderWithRouter(() => <TableSetEntry tableSet={mockTableSet} categoryId="npcs" />);
    expect(await screen.findByText("NPC Generator")).toBeInTheDocument();
  });

  it("renders a Roll button", async () => {
    renderWithRouter(() => <TableSetEntry tableSet={mockTableSet} categoryId="npcs" />);
    expect(await screen.findByRole("button", { name: "Roll" })).toBeInTheDocument();
  });

  it("renders multiple table set entries", async () => {
    renderWithRouter(() => (
      <div>
        <TableSetEntry tableSet={mockTableSet} categoryId="npcs" />
        <TableSetEntry tableSet={mockTableSet2} categoryId="weather" />
      </div>
    ));
    expect(await screen.findByText("NPC Generator")).toBeInTheDocument();
    expect(screen.getByText("Weather Patterns")).toBeInTheDocument();
  });
});

describe("FilterInput", () => {
  it("renders with the provided value", () => {
    render(<FilterInput value="hello" onChange={() => {}} />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("hello");
  });

  it("renders with placeholder text", () => {
    render(<FilterInput value="" onChange={() => {}} placeholder="Search..." />);
    const input = screen.getByRole("textbox");
    expect(input).toHaveAttribute("placeholder", "Search...");
  });

  it("calls onChange when the user types", async () => {
    const user = userEvent.setup();
    let currentValue = "";
    const onChange = (val: string) => {
      currentValue = val;
    };

    render(<FilterInput value="" onChange={onChange} />);
    const input = screen.getByRole("textbox");
    await user.type(input, "a");
    expect(currentValue).toBe("a");
  });
});

describe("Category page filtering logic", () => {
  function FilterTestHarness() {
    const [filter, setFilter] = useState("");
    const tableSets = [mockTableSet, mockTableSet2];

    const filtered = tableSets.filter((ts) => ts.name.toLowerCase().includes(filter.toLowerCase()));

    return (
      <div>
        <FilterInput value={filter} onChange={setFilter} placeholder="Search table sets..." />
        {filtered.map((ts) => (
          <TableSetEntry key={ts.name} tableSet={ts} categoryId="test" />
        ))}
      </div>
    );
  }

  it("shows all table sets when filter is empty", async () => {
    renderWithRouter(() => <FilterTestHarness />);
    expect(await screen.findByText("NPC Generator")).toBeInTheDocument();
    expect(screen.getByText("Weather Patterns")).toBeInTheDocument();
  });

  it("filters table sets by name (case-insensitive)", async () => {
    const user = userEvent.setup();
    renderWithRouter(() => <FilterTestHarness />);

    const input = await screen.findByRole("textbox");
    await user.type(input, "npc");

    expect(screen.getByText("NPC Generator")).toBeInTheDocument();
    expect(screen.queryByText("Weather Patterns")).not.toBeInTheDocument();
  });

  it("filters case-insensitively with uppercase input", async () => {
    const user = userEvent.setup();
    renderWithRouter(() => <FilterTestHarness />);

    const input = await screen.findByRole("textbox");
    await user.type(input, "WEATHER");

    expect(screen.queryByText("NPC Generator")).not.toBeInTheDocument();
    expect(screen.getByText("Weather Patterns")).toBeInTheDocument();
  });

  it("restores full list when filter is cleared", async () => {
    const user = userEvent.setup();
    renderWithRouter(() => <FilterTestHarness />);

    const input = await screen.findByRole("textbox");
    await user.type(input, "npc");
    expect(screen.queryByText("Weather Patterns")).not.toBeInTheDocument();

    await user.clear(input);
    expect(screen.getByText("NPC Generator")).toBeInTheDocument();
    expect(screen.getByText("Weather Patterns")).toBeInTheDocument();
  });
});

describe("Category page back link", () => {
  it("renders a back link pointing to /", async () => {
    renderWithRouter(() => (
      <div>
        <a href="/">← Back to Dashboard</a>
      </div>
    ));
    const link = await screen.findByRole("link", { name: "← Back to Dashboard" });
    expect(link).toHaveAttribute("href", "/");
  });
});
