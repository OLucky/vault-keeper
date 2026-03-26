import { describe, it, expect, vi, beforeEach, afterEach } from "vite-plus/test";
import { QueryClient } from "@tanstack/react-query";
import type { QueryFunctionContext, QueryKey } from "@tanstack/react-query";
import { manifestQueryOptions, categoryQueryOptions, tableSetQueryOptions } from "../loader";

const client = new QueryClient();

function mockFetch(data: unknown, ok = true, status = 200) {
  return vi.fn().mockResolvedValue({
    ok,
    status,
    statusText: ok ? "OK" : "Not Found",
    json: () => Promise.resolve(data),
  });
}

function mockFetchRejection(error: string) {
  return vi.fn().mockRejectedValue(new Error(error));
}

describe("manifestQueryOptions", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", mockFetch({}));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("has the correct query key", () => {
    const options = manifestQueryOptions();
    expect(options.queryKey).toEqual(["manifest"]);
  });

  it("has staleTime set to Infinity", () => {
    const options = manifestQueryOptions();
    expect(options.staleTime).toBe(Infinity);
  });

  it("fetches /tables/manifest.json", async () => {
    const validManifest = { categories: ["npcs", "locations"] };
    vi.stubGlobal("fetch", mockFetch(validManifest));

    const options = manifestQueryOptions();
    const result = await options.queryFn!({
      queryKey: ["manifest"],
      signal: new AbortController().signal,
      meta: undefined,
      client,
    } as QueryFunctionContext<QueryKey>);

    expect(fetch).toHaveBeenCalledWith("/tables/manifest.json");
    expect(result).toEqual(validManifest);
  });

  it("parses valid manifest JSON successfully", async () => {
    const validManifest = { categories: ["npcs"] };
    vi.stubGlobal("fetch", mockFetch(validManifest));

    const options = manifestQueryOptions();
    const result = await options.queryFn!({
      queryKey: ["manifest"],
      signal: new AbortController().signal,
      meta: undefined,
      client,
    } as QueryFunctionContext<QueryKey>);

    expect(result).toEqual({ categories: ["npcs"] });
  });

  it("throws on malformed JSON (missing categories)", async () => {
    vi.stubGlobal("fetch", mockFetch({ name: "bad" }));

    const options = manifestQueryOptions();
    await expect(
      options.queryFn!({
        queryKey: ["manifest"],
        signal: new AbortController().signal,
        meta: undefined,
        client,
      } as QueryFunctionContext<QueryKey>),
    ).rejects.toThrow(/Validation error.*manifest\.json/);
  });

  it("throws on network error", async () => {
    vi.stubGlobal("fetch", mockFetchRejection("Network failure"));

    const options = manifestQueryOptions();
    await expect(
      options.queryFn!({
        queryKey: ["manifest"],
        signal: new AbortController().signal,
        meta: undefined,
        client,
      } as QueryFunctionContext<QueryKey>),
    ).rejects.toThrow("Network failure");
  });

  it("throws on non-OK response", async () => {
    vi.stubGlobal("fetch", mockFetch({}, false, 404));

    const options = manifestQueryOptions();
    await expect(
      options.queryFn!({
        queryKey: ["manifest"],
        signal: new AbortController().signal,
        meta: undefined,
        client,
      } as QueryFunctionContext<QueryKey>),
    ).rejects.toThrow(/Failed to fetch.*manifest\.json.*404/);
  });
});

describe("categoryQueryOptions", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("has the correct query key", () => {
    const options = categoryQueryOptions("npcs");
    expect(options.queryKey).toEqual(["category", "npcs"]);
  });

  it("fetches /tables/npcs/index.json", async () => {
    const validCategory = { name: "NPCs", tableSets: ["npc-generator.json"] };
    vi.stubGlobal("fetch", mockFetch(validCategory));

    const options = categoryQueryOptions("npcs");
    const result = await options.queryFn!({
      queryKey: ["category", "npcs"],
      signal: new AbortController().signal,
      meta: undefined,
      client,
    } as QueryFunctionContext<QueryKey>);

    expect(fetch).toHaveBeenCalledWith("/tables/npcs/index.json");
    expect(result).toEqual(validCategory);
  });

  it("parses valid category JSON successfully", async () => {
    const validCategory = { name: "Locations", tableSets: ["ruins.json"] };
    vi.stubGlobal("fetch", mockFetch(validCategory));

    const options = categoryQueryOptions("locations");
    const result = await options.queryFn!({
      queryKey: ["category", "locations"],
      signal: new AbortController().signal,
      meta: undefined,
      client,
    } as QueryFunctionContext<QueryKey>);

    expect(result).toEqual(validCategory);
  });

  it("throws on malformed JSON (missing name)", async () => {
    vi.stubGlobal("fetch", mockFetch({ tableSets: [] }));

    const options = categoryQueryOptions("npcs");
    await expect(
      options.queryFn!({
        queryKey: ["category", "npcs"],
        signal: new AbortController().signal,
        meta: undefined,
        client,
      } as QueryFunctionContext<QueryKey>),
    ).rejects.toThrow(/Validation error.*npcs\/index\.json/);
  });
});

describe("tableSetQueryOptions", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  const validTableSet = {
    name: "NPC Generator",
    tables: [
      {
        name: "Ancestry",
        die: "d6" as const,
        entries: [
          { range: [1, 2], title: "Human" },
          { range: [3, 4], title: "Synth" },
          { range: [5, 6], title: "Cacogen" },
        ],
      },
    ],
  };

  it("has the correct query key", () => {
    const options = tableSetQueryOptions("npcs", "npc-generator.json");
    expect(options.queryKey).toEqual(["tableSet", "npcs", "npc-generator.json"]);
  });

  it("fetches /tables/npcs/npc-generator.json", async () => {
    vi.stubGlobal("fetch", mockFetch(validTableSet));

    const options = tableSetQueryOptions("npcs", "npc-generator.json");
    const result = await options.queryFn!({
      queryKey: ["tableSet", "npcs", "npc-generator.json"],
      signal: new AbortController().signal,
      meta: undefined,
      client,
    } as QueryFunctionContext<QueryKey>);

    expect(fetch).toHaveBeenCalledWith("/tables/npcs/npc-generator.json");
    expect(result).toEqual(validTableSet);
  });

  it("parses valid table set JSON successfully", async () => {
    vi.stubGlobal("fetch", mockFetch(validTableSet));

    const options = tableSetQueryOptions("npcs", "npc-generator.json");
    const result = await options.queryFn!({
      queryKey: ["tableSet", "npcs", "npc-generator.json"],
      signal: new AbortController().signal,
      meta: undefined,
      client,
    } as QueryFunctionContext<QueryKey>);

    expect(result.name).toBe("NPC Generator");
    expect(result.tables).toHaveLength(1);
  });

  it("throws on malformed JSON (missing name)", async () => {
    vi.stubGlobal("fetch", mockFetch({ tables: [] }));

    const options = tableSetQueryOptions("npcs", "npc-generator.json");
    await expect(
      options.queryFn!({
        queryKey: ["tableSet", "npcs", "npc-generator.json"],
        signal: new AbortController().signal,
        meta: undefined,
        client,
      } as QueryFunctionContext<QueryKey>),
    ).rejects.toThrow(/Validation error.*npc-generator\.json/);
  });

  it("throws on table set with invalid range coverage (gap)", async () => {
    const tableSetWithGap = {
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
    vi.stubGlobal("fetch", mockFetch(tableSetWithGap));

    const options = tableSetQueryOptions("npcs", "npc-generator.json");
    await expect(
      options.queryFn!({
        queryKey: ["tableSet", "npcs", "npc-generator.json"],
        signal: new AbortController().signal,
        meta: undefined,
        client,
      } as QueryFunctionContext<QueryKey>),
    ).rejects.toThrow(/Validation error.*npc-generator\.json.*Gap/);
  });

  it("throws on network error", async () => {
    vi.stubGlobal("fetch", mockFetchRejection("Connection refused"));

    const options = tableSetQueryOptions("npcs", "npc-generator.json");
    await expect(
      options.queryFn!({
        queryKey: ["tableSet", "npcs", "npc-generator.json"],
        signal: new AbortController().signal,
        meta: undefined,
        client,
      } as QueryFunctionContext<QueryKey>),
    ).rejects.toThrow("Connection refused");
  });
});
