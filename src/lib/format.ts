export const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
export const pct = (n: number) => `${Math.round(n * 1000) / 10}%`;
export const ratio = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : "n/a");
