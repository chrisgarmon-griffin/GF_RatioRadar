import { ProviderError } from "./types";

export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

/** GET/POST JSON with a timeout. Maps transport and HTTP failures to ProviderError. */
export async function fetchJson(
  provider: string,
  url: string,
  init: RequestInit,
  { fetchImpl = fetch as FetchLike, timeoutMs = 8000 }: { fetchImpl?: FetchLike; timeoutMs?: number } = {},
): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetchImpl(url, { ...init, signal: ctrl.signal });
    if (!res.ok) throw new ProviderError(provider, `HTTP ${res.status}`, res.status);
    return await res.json();
  } catch (e) {
    if (e instanceof ProviderError) throw e;
    if (e instanceof Error && e.name === "AbortError") throw new ProviderError(provider, `timed out after ${timeoutMs}ms`);
    throw new ProviderError(provider, e instanceof Error ? e.message : "request failed");
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
  ) {}
  get(key: string, load: () => Promise<V>): Promise<V> {
    const hit = this.store.get(key);
    if (hit && this.now() - hit.at < this.ttlMs) return hit.value;
    const value = load();
    this.store.set(key, { at: this.now(), value });
    // Do not keep failures.
    value.catch(() => {
      if (this.store.get(key)?.value === value) this.store.delete(key);
    });
    return value;
  }
}
