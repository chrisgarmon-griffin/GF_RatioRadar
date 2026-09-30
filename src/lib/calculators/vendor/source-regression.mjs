import assert from 'node:assert/strict';
import {
  monthlyPI, monthlyInterestOnly, modeledLoanPayment, loanFromModeledPayment, bankStatementCalc, bankStatementRefiCalc, dscrCalc, strDscrCalc,
  dscrCashoutCalc, weightedBlendedRate, temporaryBuydownSchedule
} from './nonqm-engine.js';

const near = (actual, expected, tol, label) => assert.ok(Math.abs(actual - expected) <= tol, `${label}: ${actual} vs ${expected}`);

// Griffin public DSCR worked example: $300k at 7%/30, $367 taxes, $167 insurance, $120 HOA, $3,000 rent.
const pi = monthlyPI(300000, 7, 30);
near(pi, 1995.91, 0.02, 'monthly PI');
const dscr = dscrCalc({
  grossRent: 3000, loanAmount: 300000, ratePct: 7, termYears: 30,
  taxes: 367, insurance: 167, hoa: 120, investorVacancyPct: 15,
  management: 200, maintenance: 150,
});
near(dscr.pitia, 2649.91, 0.03, 'PITIA');
near(dscr.lenderDscr, 3000 / 2649.91, 0.001, 'Griffin-style lender DSCR');

// Interest-only payment modeling keeps the selected loan term as scenario context
// while the modeled monthly payment is principal * annual rate / 12.
const ioPayment = monthlyInterestOnly(400000, 7);
near(ioPayment, 2333.333333, 0.001, 'interest-only monthly payment');
near(modeledLoanPayment(400000, 7, 30, 'interest_only'), ioPayment, 1e-12, '30-year IO modeled payment');
near(modeledLoanPayment(400000, 7, 40, 'interest_only'), ioPayment, 1e-12, '40-year IO modeled payment is term-independent during IO period');
near(loanFromModeledPayment(ioPayment, 7, 30, 'interest_only'), 400000, 0.01, 'reverse IO buying-power calculation');
const ioDscr = dscrCalc({ grossRent: 5000, loanAmount: 400000, ratePct: 7, termYears: 30, paymentMode: 'interest_only', taxes: 400, insurance: 200 });
near(ioDscr.pi, ioPayment, 0.01, 'IO DSCR loan payment');
near(ioDscr.pitia, ioPayment + 600, 0.01, 'IO DSCR PITIA');
near(ioDscr.lenderDscr, 5000 / (ioPayment + 600), 0.001, 'IO DSCR ratio');
assert.equal(ioDscr.paymentMode, 'interest_only');

// Vacancy/operating assumptions must NOT reduce Griffin-style lender DSCR.
const dscrNoVacancy = dscrCalc({
  grossRent: 3000, loanAmount: 300000, ratePct: 7, termYears: 30,
  taxes: 367, insurance: 167, hoa: 120, investorVacancyPct: 0,
});
near(dscr.lenderDscr, dscrNoVacancy.lenderDscr, 1e-12, 'vacancy-independent lender DSCR');
assert.ok(dscr.investorDscr < dscrNoVacancy.investorDscr, 'Investor DSCR should reflect vacancy/expenses');

// Personal statements use gross eligible deposits; business statements can apply a program-specific expense factor.
const personal = bankStatementCalc({ accountType: 0, avgMonthlyDeposits: 18000, expenseFactorPct: 50 });
const business = bankStatementCalc({ accountType: 1, avgMonthlyDeposits: 18000, expenseFactorPct: 50 });
near(personal.depositQualifyingIncome, 18000, 0.001, 'personal deposit income');
near(business.depositQualifyingIncome, 9000, 0.001, 'business deposit income');

// Bank statement refi: LTV and payment comparison.
const refi = bankStatementRefiCalc({
  accountType: 0, avgMonthlyDeposits: 15000,
  currentLoanBalance: 320000, currentRatePct: 8, currentRemainingTermYears: 27,
  propertyValue: 500000, newLoanAmount: 350000, newRatePct: 7, newTermYears: 30,
});
near(refi.ltv, 0.70, 1e-12, 'refi LTV');
assert.ok(Number.isFinite(refi.monthlySavings), 'refi monthly savings should be finite');

// STR defaults to a 20% modeling factor when omitted, while an explicit
// factor remains configurable so the UI can be aligned to the selected program.
const strZero = strDscrCalc({ annualStrRevenue: 60000, strIncomeHaircutPct: 0 });
near(strZero.qualifyingMonthlyStrRevenue, 60000 / 12, 0.001, 'explicit STR factor of 0 is honored');
const strOmitted = strDscrCalc({ annualStrRevenue: 60000 });
near(strOmitted.qualifyingMonthlyStrRevenue, (60000 / 12) * 0.8, 0.001, 'omitted STR factor defaults to 20%');
const strHigher = strDscrCalc({ annualStrRevenue: 60000, strIncomeHaircutPct: 35 });
near(strHigher.qualifyingMonthlyStrRevenue, (60000 / 12) * 0.65, 0.001, 'explicit STR factor of 35% is honored');

// Borrower-friendly cash-out request is capped at the 80% LTV illustration.
const cashoutWithinCap = dscrCashoutCalc({
  propertyValue: 500000,
  currentLoanBalance: 300000,
  desiredCashOut: 50000,
  closingCosts: 5000,
  maxLtvPct: 80,
  grossRent: 5000,
  ratePct: 7,
  termYears: 30,
});
near(cashoutWithinCap.estimatedCashOut, 50000, 0.001, 'desired cash out within cap');
near(cashoutWithinCap.newLoanAmount, 355000, 0.001, 'new loan amount from desired cash out');
near(cashoutWithinCap.estimatedLtv, 0.71, 1e-12, 'estimated LTV from desired cash out');
assert.equal(cashoutWithinCap.cashOutLimited, false);

const cashoutCapped = dscrCashoutCalc({
  propertyValue: 500000,
  currentLoanBalance: 300000,
  desiredCashOut: 150000,
  closingCosts: 5000,
  maxLtvPct: 80,
  grossRent: 5000,
  ratePct: 7,
  termYears: 30,
});
near(cashoutCapped.maxCashOut, 95000, 0.001, 'maximum cash out at 80% LTV');
near(cashoutCapped.estimatedCashOut, 95000, 0.001, 'cash out capped at 80% LTV');
near(cashoutCapped.newLoanAmount, 400000, 0.001, 'new loan amount capped at 80% LTV');
near(cashoutCapped.estimatedLtv, 0.8, 1e-12, 'capped LTV');
assert.equal(cashoutCapped.cashOutLimited, true);

// Griffin blended-rate article example.
const blend = weightedBlendedRate([{balance:10000,ratePct:4},{balance:5000,ratePct:6}]);
near(blend.blendedRatePct, 4.6666667, 0.0001, 'blended rate');

// Temporary buydown uses payment-differential subsidy while qualification remains at full note-rate payment.
const buy = temporaryBuydownSchedule({ loanAmount: 300000, noteRatePct: 7, termYears: 30, type: '2-1' });
assert.equal(buy.years.length, 2);
assert.ok(buy.years[0].borrowerPI < buy.years[1].borrowerPI && buy.years[1].borrowerPI < buy.fullPI);
assert.ok(buy.estimatedSubsidy > 0);

console.log('All calculator-engine tests passed.');

// Negative investor NOI must remain negative rather than being floored at zero.
const negativeNoi = dscrCalc({
  grossRent: 1000,
  piOverride: 900,
  taxes: 500,
  insurance: 150,
  hoa: 100,
  management: 200,
  maintenance: 150,
  propertyValue: 250000,
  cashInvested: 50000,
});
assert.ok(negativeNoi.monthlyNoi < 0, 'negative NOI should preserve its sign');
assert.ok(negativeNoi.capRate < 0, 'negative NOI should produce a negative cap rate');
assert.ok(negativeNoi.monthlyCashFlow < negativeNoi.monthlyNoi, 'debt service should reduce cash flow below NOI');

// Free-and-clear refinance can still model desired cash out while remaining under the LTV illustration.
const freeClear = dscrCashoutCalc({
  propertyValue: 500000,
  currentLoanBalance: 0,
  desiredCashOut: 200000,
  closingCosts: 5000,
  maxLtvPct: 80,
  grossRent: 5000,
  ratePct: 7,
  termYears: 30,
});
near(freeClear.newLoanAmount, 205000, 0.001, 'free-and-clear cash-out new loan');
near(freeClear.estimatedCashOut, 200000, 0.001, 'free-and-clear desired cash out');
assert.equal(freeClear.cashOutLimited, false);
