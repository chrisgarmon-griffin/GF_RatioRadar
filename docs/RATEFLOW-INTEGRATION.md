# Rateflow integration status

Verified October 1, 2026 against https://cdn.bankingbridge.com/swagger/RATEFLOW.md and a live synthetic purchase scenario. LOID 13882 authenticated successfully and returned 13 DSCR cards through Optimal Blue. Account reference: brand 2035845, Rateflow 305. Credentials are not committed.

`src/lib/providers/rateflow.ts` implements the verified POST contract: x-api-key, flat scenario fields, Non-QM DSCR selection, response arrays, epoch timestamps, and separate APR, rate, price, and points. It preserves vendor order and rejects empty/error/malformed responses. Errors do not echo upstream bodies or credentials.

This is a server-side integration foundation, not an activated customer pricing flow. Keep RATE_PROVIDER=fixture and demo mode enabled. The existing BankingBridge prototype is blocked and is not this client. The property search prices a representative fictional property and lacks credit score, property ZIP and account-specific DSCR/prepayment selection. It must not consume live cards as generic property quotes.

Before customer activation: verify engine DSCR tier and prepayment mappings with quote logs; collect explicit scenario inputs; present the selected card with APR, points/credits, lock period, timestamp and assumptions; verify term and amortization against the request; implement authentication, abuse limits and quote refresh. Do not assume that a shared application link transfers this quote to the lender. Rates are estimates subject to human review, not a credit decision or locked offer.

Server credentials: RATEFLOW_API_KEY and RATEFLOW_LOID. Never use NEXT_PUBLIC for credentials. Brand and Rateflow identifiers are account references; the successful POST used LOID routing. Do not add the admin-only `id` request field without confirming key permissions.
