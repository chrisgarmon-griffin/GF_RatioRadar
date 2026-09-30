/** Ratio Radar mark: concentric rings with a sweep line. Product mark, not the Griffin logo. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="14" stroke="#bd0c0c" strokeWidth="2" />
      <circle cx="16" cy="16" r="8" stroke="#d7a224" strokeWidth="2" />
      <path d="M16 16 L27 8" stroke="#bd0c0c" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="16" cy="16" r="2.5" fill="#bd0c0c" />
    </svg>
  );
}

export function HouseIcon() {
  return (
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M6 22 24 7l18 15M11 20v21h26V20M20 41V28h8v13" strokeLinejoin="round" />
    </svg>
  );
}
