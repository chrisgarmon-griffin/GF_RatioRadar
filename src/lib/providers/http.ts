import { ProviderError } from "./types";

export type FetchLike = (
  input: string,
  init?: RequestInit,
) => Promise<Response>;

/** GET/POST JSON with a timeout. Maps transport and HTTP failures to ProviderError. */
export async function fetchJson(
  provider: string,
  url: string,
  init: RequestInit,
  {
    fetchImpl = fetch as FetchLike,
    timeoutMs = 8000,
  }: { fetchImpl?: FetchLike; timeoutMs?: number } = {},
): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetchImpl(url, {
      ...init,
      cache: "no-store",
      signal: ctrl.signal,
    });
    if (res.status === 204) throw new ProviderError(provider, "HTTP 204", 204);
    if (!res.ok)
      throw new ProviderError(provider, `HTTP ${res.status}`, res.status);
    return await res.json();
  } catch (e) {
    if (e instanceof ProviderError) throw e;
    if (e instanceof Error && e.name === "AbortError")
      throw new ProviderError(provider, `timed out after ${timeoutMs}ms`);
    throw new ProviderError(provider, "request or JSON response failed");
  } finally {
    clearTimeout(timer);
  }
}

/** Small TTL cache for vendor lookups. Per server instance; serverless instances do not share it. */
export class TtlCache<V> {
  private store = new Map<string, { at: number; value: Promise<V> }>();
  constructor(
    private ttlMs: number,
    private now: () => number = Date.now,
    private maxEntries = 1000,
  ) {}
  get(key: string, load: () => Promise<V>): Promise<V> {
    const hit = this.store.get(key);
    if (hit && this.now() - hit.at < this.ttlMs) return hit.value;
    this.store.delete(key);
    for (const [k, entry] of this.store)
      if (this.now() - entry.at >= this.ttlMs) this.store.delete(k);
    if (this.store.size >= this.maxEntries)
      this.store.delete(this.store.keys().next().value!);
    const value = Promise.resolve().then(load);
    this.store.set(key, { at: this.now(), value });
    // Do not keep failures.
    value.catch(() => {
      if (this.store.get(key)?.value === value) this.store.delete(key);
    });
    return value;
  }
}
