import { expect, it, vi, afterEach } from "vitest";
import { fetchJson } from "./http";
import { mapPool } from "../search";
import { rates, rents } from "./index";
afterEach(() => vi.unstubAllEnvs());
it("aborts timed-out calls without including vendor details", async () => {
  const fetchImpl = vi.fn(
    (_url: string, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () =>
          reject(new DOMException("Aborted", "AbortError")),
        );
      }),
  );
  await expect(
    fetchJson("test", "https://example.test", {}, { fetchImpl, timeoutMs: 5 }),
  ).rejects.toThrow(/timed out/);
});
it("redacts transport errors and rejects invalid JSON", async () => {
  await expect(
    fetchJson(
      "test",
      "https://example.test",
      {},
      {
        fetchImpl: async () => {
          throw Error("secret credential");
        },
      },
    ),
  ).rejects.toThrow("test: request or JSON response failed");
  await expect(
    fetchJson(
      "test",
      "https://example.test",
      {},
      { fetchImpl: async () => new Response("{broken") },
    ),
  ).rejects.toThrow(/JSON response failed/);
});
it("limits concurrency while preserving input order", async () => {
  let inFlight = 0,
    max = 0;
  const out = await mapPool([1, 2, 3, 4, 5], 2, async (n) => {
    inFlight++;
    max = Math.max(max, inFlight);
    await new Promise((r) => setTimeout(r, 2));
    inFlight--;
    return n * 2;
  });
  expect(max).toBe(2);
  expect(out).toEqual([2, 4, 6, 8, 10]);
  await expect(mapPool([1], 0, async (n) => n)).rejects.toThrow(
    /positive integer/,
  );
});
it("stops scheduling additional vendor work after failure", async () => {
  const work = vi.fn(async (n: number) => {
    if (n === 1) throw Error("outage");
    await new Promise((r) => setTimeout(r, 2));
    return n;
  });
  await expect(mapPool([1, 2, 3, 4, 5], 2, work)).rejects.toThrow("outage");
  await new Promise((r) => setTimeout(r, 5));
  expect(work).toHaveBeenCalledTimes(2);
});
it("blocks live lookup configuration in demo and blocks pricing prototype in every mode", () => {
  vi.stubEnv("RENT_PROVIDER", "housecanary");
  vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "true");
  expect(() => rents()).toThrow(/demo mode/);
  vi.stubEnv("RATE_PROVIDER", "bankingbridge");
  vi.stubEnv("NEXT_PUBLIC_DEMO_MODE", "false");
  expect(() => rates()).toThrow(/not a live pricing integration/);
});
