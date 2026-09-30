/**
 * Demo mode is on unless NEXT_PUBLIC_DEMO_MODE=false. While on: the site is marked noindex,
 * a banner says listings are samples, and lead submissions are validated but not stored.
 * Turn it off only after real listings and a lead destination are wired.
 */
export const DEMO = process.env.NEXT_PUBLIC_DEMO_MODE !== "false";
