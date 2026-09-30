export interface EngineInput {
  grossRent?: number;
  otherPropertyIncome?: number;
  loanAmount?: number;
  ratePct?: number;
  termYears?: number;
  paymentMode?: string;
  piOverride?: number;
  taxes?: number;
  insurance?: number;
  hoa?: number;
  flood?: number;
  otherHousing?: number;
  investorVacancyPct?: number;
  management?: number;
  maintenance?: number;
  utilities?: number;
  otherOperating?: number;
  propertyValue?: number;
  cashInvested?: number;
  annualStrRevenue?: number;
  strIncomeHaircutPct?: number;
  currentLoanBalance?: number;
  closingCosts?: number;
  desiredCashOut?: number;
  maxLtvPct?: number;
  targetLtvPct?: number;
}
export interface DscrResult {
  qualifyingRent: number;
  investorEffectiveIncome: number;
  pi: number;
  loanPayment: number;
  paymentMode: string;
  pitia: number;
  lenderDscr: number;
  operatingExpenses: number;
  monthlyNoi: number;
  investorDscr: number;
  monthlyCashFlow: number;
  annualNoi: number;
  capRate: number;
  cashOnCash: number;
  ltv: number;
  rentNeeded100: number;
  rentNeeded110: number;
  rentNeeded125: number;
}
export interface RefinanceResult extends DscrResult {
  desiredCashOut: number;
  maxCashOut: number;
  maxLoanAmount: number;
  maxLtvPct: number;
  estimatedLtv: number;
  newLoanAmount: number;
  estimatedCashOut: number;
  cashOutLimited: boolean;
  cashToClose: number;
  currentEquity: number;
}
export function monthlyPI(
  principal: number,
  annualRatePct: number,
  termYears: number,
): number;
export function monthlyInterestOnly(
  principal: number,
  annualRatePct: number,
): number;
export function modeledLoanPayment(
  principal: number,
  annualRatePct: number,
  termYears: number,
  paymentMode?: string,
): number;
export function loanFromModeledPayment(
  payment: number,
  annualRatePct: number,
  termYears: number,
  paymentMode?: string,
): number;
export function dscrCalc(input: EngineInput): DscrResult;
export function strDscrCalc(
  input: EngineInput,
): DscrResult & {
  rawMonthlyStrRevenue: number;
  qualifyingMonthlyStrRevenue: number;
};
export function dscrCashoutCalc(input: EngineInput): RefinanceResult;
