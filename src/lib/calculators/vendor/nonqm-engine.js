export const clamp = (n, min = -Infinity, max = Infinity) => Math.min(max, Math.max(min, Number.isFinite(+n) ? +n : 0));

export function monthlyPI(principal, annualRatePct, termYears) {
  const p = Math.max(0, +principal || 0);
  const n = Math.max(1, Math.round((+termYears || 30) * 12));
  const r = Math.max(0, +annualRatePct || 0) / 100 / 12;
  if (!p) return 0;
  if (!r) return p / n;
  return p * r / (1 - Math.pow(1 + r, -n));
}

export function loanFromPayment(monthlyPayment, annualRatePct, termYears) {
  const pay = Math.max(0, +monthlyPayment || 0);
  const n = Math.max(1, Math.round((+termYears || 30) * 12));
  const r = Math.max(0, +annualRatePct || 0) / 100 / 12;
  if (!pay) return 0;
  if (!r) return pay * n;
  return pay * (1 - Math.pow(1 + r, -n)) / r;
}

export function monthlyInterestOnly(principal, annualRatePct) {
  const p = Math.max(0, +principal || 0);
  const r = Math.max(0, +annualRatePct || 0) / 100 / 12;
  return p * r;
}

export function modeledLoanPayment(principal, annualRatePct, termYears, paymentMode = 'amortizing') {
  return paymentMode === 'interest_only'
    ? monthlyInterestOnly(principal, annualRatePct)
    : monthlyPI(principal, annualRatePct, termYears);
}

export function loanFromModeledPayment(monthlyPayment, annualRatePct, termYears, paymentMode = 'amortizing') {
  if (paymentMode !== 'interest_only') return loanFromPayment(monthlyPayment, annualRatePct, termYears);
  const pay = Math.max(0, +monthlyPayment || 0);
  const r = Math.max(0, +annualRatePct || 0) / 100 / 12;
  if (!pay || !r) return 0;
  return pay / r;
}

export function amortizationTotalInterest(principal, annualRatePct, termYears) {
  const pi = monthlyPI(principal, annualRatePct, termYears);
  return Math.max(0, pi * (+termYears || 30) * 12 - (+principal || 0));
}

export function averageDeposits(values = []) {
  const clean = values.map(Number).filter(Number.isFinite).filter(v => v >= 0);
  return clean.length ? clean.reduce((a, b) => a + b, 0) / clean.length : 0;
}

export function weightedBlendedRate(items = []) {
  const clean = items
    .map(x => ({ balance: Math.max(0, +x.balance || 0), ratePct: Math.max(0, +x.ratePct || 0) }))
    .filter(x => x.balance > 0);
  const totalBalance = clean.reduce((s, x) => s + x.balance, 0);
  const weightedRatePct = totalBalance ? clean.reduce((s, x) => s + x.balance * x.ratePct, 0) / totalBalance : 0;
  return { totalBalance, blendedRatePct: weightedRatePct };
}

export function temporaryBuydownSchedule(input) {
  const loanAmount = Math.max(0, +input.loanAmount || 0);
  const noteRatePct = Math.max(0, +input.noteRatePct || 0);
  const termYears = Math.max(1, +input.termYears || 30);
  const type = String(input.type || '2-1');
  const reductions = type === '3-2-1' ? [3, 2, 1] : type === '1-0' ? [1] : [2, 1];
  const fullPI = monthlyPI(loanAmount, noteRatePct, termYears);
  const years = reductions.map((reductionPct, i) => {
    const effectiveRatePct = Math.max(0, noteRatePct - reductionPct);
    const borrowerPI = monthlyPI(loanAmount, effectiveRatePct, termYears);
    return { year: i + 1, reductionPct, effectiveRatePct, borrowerPI, monthlySubsidy: Math.max(0, fullPI - borrowerPI) };
  });
  const estimatedSubsidy = years.reduce((s, y) => s + y.monthlySubsidy * 12, 0);
  return { fullPI, years, estimatedSubsidy };
}

function bankStatementIncome(input) {
  const avgMonthlyDeposits = Math.max(0, +input.avgMonthlyDeposits || 0);
  const accountType = +input.accountType || 0; // 0 personal, 1 business
  const expenseFactor = clamp(+input.expenseFactorPct || 0, 0, 100) / 100;
  const depositQualifyingIncome = accountType === 1 ? avgMonthlyDeposits * (1 - expenseFactor) : avgMonthlyDeposits;
  const otherMonthlyIncome = Math.max(0, +input.otherMonthlyIncome || 0);
  const qualifyingIncome = depositQualifyingIncome + otherMonthlyIncome;
  return {
    avgMonthlyDeposits,
    accountType,
    expenseFactor,
    depositQualifyingIncome,
    otherMonthlyIncome,
    qualifyingIncome,
    annualQualifyingIncome: qualifyingIncome * 12,
  };
}

export function bankStatementCalc(input) {
  const income = bankStatementIncome(input);
  const propertyValue = Math.max(0, +input.propertyValue || 0);
  const downPaymentPct = clamp(+input.downPaymentPct || 0, 0, 100);
  const loanAmount = propertyValue * (1 - downPaymentPct / 100);
  const pi = monthlyPI(loanAmount, input.ratePct, input.termYears);
  const housing = pi + (+input.taxes || 0) + (+input.insurance || 0) + (+input.hoa || 0);
  const totalDebt = housing + Math.max(0, +input.otherMonthlyDebts || 0);
  const dti = income.qualifyingIncome > 0 ? totalDebt / income.qualifyingIncome : 0;
  // Current Griffin public page says borrowers generally maintain 50% DTI or lower.
  // Investor/program overlays can be tighter, so keep this configurable.
  const targetDti = clamp(+input.targetDtiPct || 50, 1, 100) / 100;
  const piBudget = Math.max(0,
    income.qualifyingIncome * targetDti
      - Math.max(0, +input.otherMonthlyDebts || 0)
      - Math.max(0, +input.taxes || 0)
      - Math.max(0, +input.insurance || 0)
      - Math.max(0, +input.hoa || 0)
  );
  const maxLoanAtTargetDti = loanFromPayment(piBudget, input.ratePct, input.termYears);
  return {
    ...income,
    loanAmount, pi, housing, dti, maxLoanAtTargetDti,
    totalInterest: amortizationTotalInterest(loanAmount, input.ratePct, input.termYears),
  };
}

export function bankStatementRefiCalc(input) {
  const income = bankStatementIncome(input);
  const currentBalance = Math.max(0, +input.currentLoanBalance || 0);
  const propertyValue = Math.max(0, +input.propertyValue || 0);
  const newLoanAmount = Math.max(0, +input.newLoanAmount || 0) || currentBalance;
  const currentRatePct = Math.max(0, +input.currentRatePct || 0);
  const newRatePct = Math.max(0, +input.newRatePct || 0);
  const currentRemainingTermYears = Math.max(1, +input.currentRemainingTermYears || +input.newTermYears || 30);
  const newTermYears = Math.max(1, +input.newTermYears || 30);
  const currentPI = monthlyPI(currentBalance, currentRatePct, currentRemainingTermYears);
  const newPI = monthlyPI(newLoanAmount, newRatePct, newTermYears);
  const monthlySavings = currentPI - newPI;
  const currentScheduledPI = currentPI * currentRemainingTermYears * 12;
  const newScheduledPI = newPI * newTermYears * 12;
  const totalScheduledPaymentSavings = currentScheduledPI - newScheduledPI;
  const currentRemainingInterest = Math.max(0, currentScheduledPI - currentBalance);
  const newTotalInterest = Math.max(0, newScheduledPI - newLoanAmount);
  const interestSavings = currentRemainingInterest - newTotalInterest;
  const ltv = propertyValue > 0 ? newLoanAmount / propertyValue : 0;
  return {
    ...income,
    currentBalance,
    newLoanAmount,
    currentPI,
    newPI,
    monthlySavings,
    totalScheduledPaymentSavings,
    currentRemainingInterest,
    newTotalInterest,
    interestSavings,
    ltv,
  };
}

export function assetDepletionCalc(input) {
  const liquid = Math.max(0, +input.liquidAssets || 0) * clamp(+input.liquidEligiblePct || 100, 0, 100) / 100;
  const retirement = Math.max(0, +input.retirementAssets || 0) * clamp(+input.retirementEligiblePct || 100, 0, 100) / 100;
  const other = Math.max(0, +input.otherEligibleAssets || 0) * clamp(+input.otherEligiblePct || 100, 0, 100) / 100;
  const deductions = Math.max(0, +input.closingAndReserveDeduction || 0);
  const netQualifiedAssets = Math.max(0, liquid + retirement + other - deductions);
  const divisorMonths = Math.max(1, +input.divisorMonths || 60);
  const assetIncome = netQualifiedAssets / divisorMonths;
  const qualifyingIncome = assetIncome + Math.max(0, +input.otherMonthlyIncome || 0);

  const propertyValue = Math.max(0, +input.propertyValue || 0);
  const downPaymentPct = clamp(+input.downPaymentPct || 0, 0, 100);
  const loanAmount = propertyValue * (1 - downPaymentPct / 100);
  const pi = monthlyPI(loanAmount, input.ratePct, input.termYears);
  const housing = pi + (+input.taxes || 0) + (+input.insurance || 0) + (+input.hoa || 0);
  const totalDebt = housing + Math.max(0, +input.otherMonthlyDebts || 0);
  const dti = qualifyingIncome > 0 ? totalDebt / qualifyingIncome : 0;
  const targetDti = clamp(+input.targetDtiPct || 50, 1, 100) / 100;
  const piBudget = Math.max(0,
    qualifyingIncome * targetDti
      - Math.max(0, +input.otherMonthlyDebts || 0)
      - Math.max(0, +input.taxes || 0)
      - Math.max(0, +input.insurance || 0)
      - Math.max(0, +input.hoa || 0)
  );
  const maxLoanAtTargetDti = loanFromPayment(piBudget, input.ratePct, input.termYears);
  return { netQualifiedAssets, assetIncome, qualifyingIncome, loanAmount, pi, housing, dti, maxLoanAtTargetDti };
}

export function pnlCalc(input) {
  const periodMonths = Math.max(1, +input.pnlPeriodMonths || 12);
  const grossProfit = Math.max(0, +input.pnlNetProfit || 0);
  const ownershipPct = clamp(+input.ownershipPct || 100, 0, 100) / 100;
  const eligibleAddbacks = Math.max(0, +input.eligibleAddbacks || 0);
  const qualifyingIncome = (grossProfit + eligibleAddbacks) * ownershipPct / periodMonths + Math.max(0, +input.otherMonthlyIncome || 0);

  const propertyValue = Math.max(0, +input.propertyValue || 0);
  const downPaymentPct = clamp(+input.downPaymentPct || 0, 0, 100);
  const loanAmount = propertyValue * (1 - downPaymentPct / 100);
  const pi = monthlyPI(loanAmount, input.ratePct, input.termYears);
  const housing = pi + (+input.taxes || 0) + (+input.insurance || 0) + (+input.hoa || 0);
  const totalDebt = housing + Math.max(0, +input.otherMonthlyDebts || 0);
  const dti = qualifyingIncome > 0 ? totalDebt / qualifyingIncome : 0;
  const targetDti = clamp(+input.targetDtiPct || 50, 1, 100) / 100;
  const piBudget = Math.max(0,
    qualifyingIncome * targetDti
      - Math.max(0, +input.otherMonthlyDebts || 0)
      - Math.max(0, +input.taxes || 0)
      - Math.max(0, +input.insurance || 0)
      - Math.max(0, +input.hoa || 0)
  );
  const maxLoanAtTargetDti = loanFromPayment(piBudget, input.ratePct, input.termYears);
  return { qualifyingIncome, loanAmount, pi, housing, dti, maxLoanAtTargetDti };
}

export function dscrCalc(input) {
  const grossRent = Math.max(0, +input.grossRent || 0);
  const otherIncome = Math.max(0, +input.otherPropertyIncome || 0);
  // Griffin's current public DSCR explanation uses gross qualifying rent divided by PITIA.
  // Vacancy and operating expenses are intentionally excluded from lender DSCR and used only for investor analysis.
  const qualifyingRent = grossRent + otherIncome;
  const loanAmount = Math.max(0, +input.loanAmount || 0);
  const paymentMode = input.paymentMode === 'interest_only' ? 'interest_only' : 'amortizing';
  const piAuto = modeledLoanPayment(loanAmount, input.ratePct, input.termYears, paymentMode);
  const pi = Math.max(0, +input.piOverride || 0) || piAuto;
  const taxes = Math.max(0, +input.taxes || 0);
  const insurance = Math.max(0, +input.insurance || 0);
  const hoa = Math.max(0, +input.hoa || 0);
  const flood = Math.max(0, +input.flood || 0);
  const otherHousing = Math.max(0, +input.otherHousing || 0);
  const pitia = pi + taxes + insurance + hoa + flood + otherHousing;
  const lenderDscr = pitia > 0 ? qualifyingRent / pitia : 0;

  const investorVacancyPct = clamp(+input.investorVacancyPct || 0, 0, 100) / 100;
  const investorEffectiveIncome = grossRent * (1 - investorVacancyPct) + otherIncome;
  const management = Math.max(0, +input.management || 0);
  const maintenance = Math.max(0, +input.maintenance || 0);
  const utilities = Math.max(0, +input.utilities || 0);
  const otherOperating = Math.max(0, +input.otherOperating || 0);
  const operatingExpenses = taxes + insurance + hoa + flood + otherHousing + management + maintenance + utilities + otherOperating;
  // NOI can legitimately be negative. Preserve the sign so investor-return
  // metrics such as cap rate, cash flow, and NOI-based DSCR remain mathematically faithful.
  const monthlyNoi = investorEffectiveIncome - operatingExpenses;
  const investorDscr = pi > 0 ? monthlyNoi / pi : 0;
  const monthlyCashFlow = investorEffectiveIncome - operatingExpenses - pi;
  const annualNoi = monthlyNoi * 12;
  const propertyValue = Math.max(0, +input.propertyValue || 0);
  const capRate = propertyValue > 0 ? annualNoi / propertyValue : 0;
  const cashInvested = Math.max(0, +input.cashInvested || 0);
  const cashOnCash = cashInvested > 0 ? (monthlyCashFlow * 12) / cashInvested : 0;
  const ltv = propertyValue > 0 ? loanAmount / propertyValue : 0;
  const rentNeeded = (target) => Math.max(0, Math.max(0, +target || 0) * pitia - otherIncome);
  return {
    qualifyingRent,
    investorEffectiveIncome,
    pi, loanPayment: pi, paymentMode, pitia, lenderDscr, operatingExpenses, monthlyNoi, investorDscr,
    monthlyCashFlow, annualNoi, capRate, cashOnCash, ltv,
    rentNeeded100: rentNeeded(1), rentNeeded110: rentNeeded(1.1), rentNeeded125: rentNeeded(1.25),
  };
}

export function strDscrCalc(input) {
  const annualRevenue = Math.max(0, +input.annualStrRevenue || 0);
  const rawMonthlyStrRevenue = annualRevenue / 12;
  // The engine accepts an explicit STR modeling factor so the borrower-facing
  // calculator can be configured by program. When omitted, 20% is the
  // illustrative default; final qualifying-income treatment belongs to the
  // selected investor/program and loan review.
  const hasFactor = Object.prototype.hasOwnProperty.call(input, 'strIncomeHaircutPct');
  const rawFactor = hasFactor ? +input.strIncomeHaircutPct : 20;
  const haircutPct = clamp(Number.isFinite(rawFactor) ? rawFactor : 20, 0, 100);
  const qualifyingMonthlyStrRevenue = rawMonthlyStrRevenue * (1 - haircutPct / 100);
  const result = dscrCalc({
    ...input,
    grossRent: qualifyingMonthlyStrRevenue,
  });
  return { ...result, rawMonthlyStrRevenue, qualifyingMonthlyStrRevenue };
}

export function dscrCashoutCalc(input) {
  const propertyValue = Math.max(0, +input.propertyValue || 0);
  const currentBalance = Math.max(0, +input.currentLoanBalance || 0);
  const closingCosts = Math.max(0, +input.closingCosts || 0);
  const hasDesiredCashOut = Object.prototype.hasOwnProperty.call(input, 'desiredCashOut');
  const maxLtvPct = clamp(+input.maxLtvPct || 80, 0, 100);
  const maxLoanAmount = propertyValue * maxLtvPct / 100;

  let desiredCashOut = 0;
  let maxCashOut = Math.max(0, maxLoanAmount - currentBalance - closingCosts);
  let newLoanAmount = 0;
  let estimatedCashOut = 0;
  let cashOutLimited = false;

  if (hasDesiredCashOut) {
    desiredCashOut = Math.max(0, +input.desiredCashOut || 0);
    estimatedCashOut = Math.min(desiredCashOut, maxCashOut);
    cashOutLimited = desiredCashOut > maxCashOut + 0.01;
    newLoanAmount = Math.min(maxLoanAmount, currentBalance + closingCosts + desiredCashOut);
  } else {
    // Backward-compatible path for existing integrations that still pass a
    // target LTV rather than a borrower-friendly desired cash-out amount.
    const targetLtvPct = clamp(+input.targetLtvPct || 0, 0, 100);
    newLoanAmount = propertyValue * targetLtvPct / 100;
    estimatedCashOut = Math.max(0, newLoanAmount - currentBalance - closingCosts);
    desiredCashOut = estimatedCashOut;
    maxCashOut = Math.max(0, propertyValue - currentBalance - closingCosts);
  }

  const estimatedLtv = propertyValue > 0 ? newLoanAmount / propertyValue : 0;
  const cashToClose = Math.max(0, currentBalance + closingCosts - newLoanAmount);
  const dscr = dscrCalc({ ...input, loanAmount: newLoanAmount });
  return {
    ...dscr,
    desiredCashOut,
    maxCashOut,
    maxLoanAmount,
    maxLtvPct,
    estimatedLtv,
    newLoanAmount,
    estimatedCashOut,
    cashOutLimited,
    cashToClose,
    currentEquity: Math.max(0, propertyValue - currentBalance),
  };
}
