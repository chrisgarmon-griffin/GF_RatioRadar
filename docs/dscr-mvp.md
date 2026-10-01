# DSCR MVP scope

Bill Lyons direction: ZIP search by rental DSCR; 20% down by default; estimated monthly rent; state investment-property taxes; insurance at 0.30% annually; listing HOA; 7.99% example rate pending verified BankingBridge pricing.

Show the current DSCR plus two independent paths to 1.0: required down at the current rate, and target rate at the current down payment. Target rates are mathematical values, not available rates or buydown-cost quotes. Unknown HOA is flagged and modeled at zero until verified. No cap-rate search, ratings, exit strategies or account features are added. Existing calculators remain available for later layers.

Reviewed sources:
- https://griffinfunding.com/blog/mortgage/property-tax-by-state/ — CA 0.70%, TX 1.90%, FL 1.02%, matching the currently supported markets.
- https://griffinfunding.com/non-qm-mortgages/dscr-loans/by-state/ — insurance illustration 0.30%; CEO rate instruction supersedes published illustration.

Launch dependencies: licensed live listing feed with HOA amounts normalized to monthly frequency; real addresses for HouseCanary rent lookups; verified BankingBridge account-specific DSCR pricing; live lead destination. Never silently fall back from failed live providers to fixtures.

## Original source review

Supplied sourcecode-master.zip identifies commit 6e8b71a18066a439e558221d29be2b7cc1a332ac and March 2019 archive timestamps. It contains legacy C# model/data-access libraries, not a complete runnable modern site. Useful references: MLS field normalization, user rent override, rental averages by ZIP/bedroom and HUD inputs. Do not reuse the price-derived rent fallback, hard-coded rent floors or equal averaging without validation. Database stored procedures/data and current feed access are not supplied. No legacy source or secrets are copied into this repository.

Preserved baseline: archive/pre-dscr-mvp at d6048c1ecb31b40a7ba2e0cd8d74da6acb1340fe. Deferred roadmap can be built in feature branches when approved.
