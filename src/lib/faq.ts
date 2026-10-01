export const FAQ = [
  {
    q: "What does the DSCR actually measure?",
    a: "The debt service coverage ratio compares monthly rent with the modeled monthly housing payment. Ratio Radar uses principal, interest, state-based estimated property taxes, insurance and supplied HOA dues. Unknown HOA is modeled at $0 and flagged for verification. It is a comparison tool, not a complete view of ownership costs.",
  },
  {
    q: "Why is 1.0 the benchmark?",
    a: "In this model, 1.0 means the estimated rent equals the modeled housing payment. Above 1.0 means rent exceeds that payment; below 1.0 means it falls short. This is not a lender eligibility rule, an investment recommendation, or a promise of positive cash flow.",
  },
  {
    q: "What changes when I adjust the financing?",
    a: "A larger down payment reduces the modeled loan amount. A 40-year amortization changes how principal is repaid. Interest-only models interest without principal repayment during that period. These are illustrative scenarios; actual program availability and terms require a loan officer and underwriting review.",
  },
  {
    q: "Where do the numbers and photos come from?",
    a: "The current preview uses fictional listings, sample rent ranges and sample interest rates. Stock photographs illustrate the design and are not photos of the stated addresses. Taxes use Griffin’s state investment-property estimates; insurance is assumed at 0.30% of price annually. The example rate is 7.99%, not live pricing. Live listing, rent and rate providers are not connected.",
  },
  {
    q: "What happens when I request a review?",
    a: "In preview mode, the form validates your information but does not store it or send a request. A live handoff will carry the selected property, search assumptions and referral attribution to Griffin Funding. The live lead destination must be configured before launch.",
  },
] as const;
