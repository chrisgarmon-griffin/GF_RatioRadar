import { expect, it, vi, afterEach } from "vitest";
const run = vi.hoisted(() => vi.fn());
vi.mock("@/lib/search", () => ({ runSearch: run }));
import { POST } from "./route";
afterEach(() => {
  vi.restoreAllMocks();
  run.mockReset();
});
it("returns a recoverable 502 without disclosing vendor details", async () => {
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  run.mockRejectedValue(Error("private vendor payload"));
  const r = await POST(
    new Request("http://localhost/api/search", {
      method: "POST",
      body: JSON.stringify({ states: ["CA"] }),
    }),
  );
  expect(r.status).toBe(502);
  expect(await r.json()).toEqual({
    error: "Search is temporarily unavailable. Please try again.",
  });
  expect(log).toHaveBeenCalledWith("search failed", "Error");
});
it("retains the skipped count in successful API responses", async () => {
  run.mockResolvedValue({ rows: [], skipped: 3 });
  const r = await POST(
    new Request("http://localhost/api/search", { method: "POST", body: "{}" }),
  );
  expect(r.status).toBe(200);
  expect(await r.json()).toMatchObject({ skipped: 3 });
});
