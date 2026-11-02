// =========================================================================
// 미국 임대 부동산 수익률(Cap Rate, Cash-on-Cash Return, NOI, Cash Flow)
// 및 투자용 DSCR Loan(부채상환비율 대출) 통과 심사 계산 엔진
// =========================================================================

export interface RentalRoiInput {
  purchasePrice: number;           // 매물 매입 가격 ($)
  downPaymentPct: number;          // 계약금 비율 (보통 투자용 20% ~ 25%)
  closingAndRehabCosts: number;    // 클로징 비용 + 초기 수리/리모델링 비용 ($)
  interestRateApr: number;         // 투자용 모기지 / DSCR 대출 금리 (APR %)
  loanTermYears: number;           // 대출 만기 (보통 30년)
  monthlyGrossRent: number;        // 예상 월 총 임대료 수입 ($)
  vacancyRatePct: number;          // 예상 공실률 (보통 5% ~ 8%)
  propertyTaxRatePct: number;      // 연간 실효 재산세율 (%)
  annualLandlordInsurance: number; // 연간 임대인 주택보험료 (DP-3 Policy, $)
  monthlyHoaFee: number;           // 월 HOA 관리비 ($)
  managementFeePct: number;        // 부동산 자산관리 대행 수수료율 (보통 월세의 8% ~ 10%, 직접 관리 시 0%)
  maintenanceAndCapexPct: number;  // 수선유지비 및 자본적지출(CapEx) 적립 비율 (보통 월세의 5% ~ 10%)
}

export interface RentalRoiResult {
  downPaymentAmount: number;
  loanPrincipal: number;
  totalCashInvested: number;       // 계약금 + 클로징/수리비 총 자기자본 투입액 ($)
  monthlyPrincipalAndInterest: number; // 월 원리금 상환액 (P&I, $)
  monthlyPropertyTax: number;
  monthlyInsurance: number;
  monthlyPitia: number;            // P&I + 세금 + 보험 + HOA 합계 (DSCR 심사 분모, $)
  effectiveMonthlyIncome: number;  // 공실률을 차감한 실효 월 임대 수입 ($)
  monthlyOperatingExpenses: number;// 세금+보험+HOA+관리비+수선비 (원리금 제외한 순수 운영비, $)
  monthlyNetOperatingIncome: number; // 월 순영업소득 (NOI, $)
  annualNetOperatingIncome: number;// 연간 순영업소득 (Annual NOI, $)
  monthlyCashFlow: number;         // 대출 원리금까지 모두 뺀 월 순수 현금흐름 ($)
  annualCashFlow: number;          // 연간 순수 현금흐름 ($)
  capRatePct: number;              // 자본환원율 (Cap Rate = Annual NOI / Purchase Price, %)
  cashOnCashReturnPct: number;     // 자기자본수익률 (CoC = Annual Cash Flow / Total Cash Invested, %)
  dscrRatio: number;               // DSCR 대출 비율 (Gross Rent / Monthly PITIA)
  dscrStatus: 'Strong (>= 1.25)' | 'Qualifies (1.00–1.24)' | 'Low (< 1.00 No-Ratio)';
  rentToPriceOnePctRule: number;   // 1% 법칙 비율 (Monthly Rent / Purchase Price, %)
}

export function calculateRentalRoi(input: RentalRoiInput): RentalRoiResult {
  const price = Math.max(0, input.purchasePrice);
  const downPct = Math.max(0, Math.min(100, input.downPaymentPct)) / 100;
  const downPaymentAmount = price * downPct;
  const loanPrincipal = Math.max(0, price - downPaymentAmount);
  const totalCashInvested = downPaymentAmount + Math.max(0, input.closingAndRehabCosts);

  const months = Math.max(12, Math.round(input.loanTermYears * 12));
  const monthlyRate = Math.max(0, input.interestRateApr) / 100 / 12;

  let monthlyPrincipalAndInterest = 0;
  if (loanPrincipal <= 0) {
    monthlyPrincipalAndInterest = 0;
  } else if (monthlyRate === 0) {
    monthlyPrincipalAndInterest = loanPrincipal / months;
  } else {
    const factor = Math.pow(1 + monthlyRate, months);
    monthlyPrincipalAndInterest = (loanPrincipal * (monthlyRate * factor)) / (factor - 1);
  }

  const monthlyPropertyTax = (price * (Math.max(0, input.propertyTaxRatePct) / 100)) / 12;
  const monthlyInsurance = Math.max(0, input.annualLandlordInsurance) / 12;
  const hoa = Math.max(0, input.monthlyHoaFee);

  // DSCR 대출 기관이 사용하는 월 총 부채상환액 (PITIA = Principal + Interest + Taxes + Insurance + Association)
  const monthlyPitia =
    monthlyPrincipalAndInterest + monthlyPropertyTax + monthlyInsurance + hoa;

  const grossRent = Math.max(0, input.monthlyGrossRent);
  const vacancyLoss = grossRent * (Math.max(0, Math.min(100, input.vacancyRatePct)) / 100);
  const effectiveMonthlyIncome = grossRent - vacancyLoss;

  const mgmtFee = grossRent * (Math.max(0, input.managementFeePct) / 100);
  const maintFee = grossRent * (Math.max(0, input.maintenanceAndCapexPct) / 100);

  const monthlyOperatingExpenses =
    monthlyPropertyTax + monthlyInsurance + hoa + mgmtFee + maintFee;

  const monthlyNetOperatingIncome = effectiveMonthlyIncome - monthlyOperatingExpenses;
  const annualNetOperatingIncome = monthlyNetOperatingIncome * 12;

  const monthlyCashFlow = monthlyNetOperatingIncome - monthlyPrincipalAndInterest;
  const annualCashFlow = monthlyCashFlow * 12;

  const capRatePct = price > 0 ? (annualNetOperatingIncome / price) * 100 : 0;
  const cashOnCashReturnPct =
    totalCashInvested > 0 ? (annualCashFlow / totalCashInvested) * 100 : 0;

  // 미국 DSCR Lender 표준 공식: Gross Monthly Rent / Monthly PITIA
  const dscrRatio = monthlyPitia > 0 ? grossRent / monthlyPitia : 9.99;

  let dscrStatus: RentalRoiResult['dscrStatus'] = 'Low (< 1.00 No-Ratio)';
  if (dscrRatio >= 1.25) {
    dscrStatus = 'Strong (>= 1.25)';
  } else if (dscrRatio >= 1.0) {
    dscrStatus = 'Qualifies (1.00–1.24)';
  }

  const rentToPriceOnePctRule = price > 0 ? (grossRent / price) * 100 : 0;

  return {
    downPaymentAmount,
    loanPrincipal,
    totalCashInvested,
    monthlyPrincipalAndInterest,
    monthlyPropertyTax,
    monthlyInsurance,
    monthlyPitia,
    effectiveMonthlyIncome,
    monthlyOperatingExpenses,
    monthlyNetOperatingIncome,
    annualNetOperatingIncome,
    monthlyCashFlow,
    annualCashFlow,
    capRatePct,
    cashOnCashReturnPct,
    dscrRatio,
    dscrStatus,
    rentToPriceOnePctRule,
  };
}

// =========================================================================
// 에어비앤비 단기임대(Short-Term Rental) vs 장기임대(Long-Term Rental) 수익 비교 계산기
// =========================================================================
export interface StrComparisonInput {
  averageDailyRate: number;        // 1박당 평균 숙박 요금 (ADR, $)
  occupancyRatePct: number;        // 연평균 객실 가동률 (%)
  platformAndMgmtFeePct: number;   // 에어비앤비 수수료 + 호스트 관리 대행 비율 (%)
  monthlyUtilitiesAndWifi: number; // 단기임대 호스트 부담 공과금·인터넷·소모품비 ($/mo)
  monthlyPitia: number;            // 월 모기지 원리금 + 재산세 + 보험 합계 ($/mo)
  longTermMonthlyRent: number;     // 비교할 일반 1년 장기임대 월세 ($/mo)
}

export interface StrComparisonResult {
  bookedNightsPerMonth: number;
  strGrossMonthlyRevenue: number;
  strMonthlyExpenses: number;
  strMonthlyNetCashFlow: number;
  ltrMonthlyNetCashFlow: number;
  monthlyStrAdvantage: number;
}

export function calculateStrVsLtr(input: StrComparisonInput): StrComparisonResult {
  const bookedNightsPerMonth = 30.42 * (Math.max(0, Math.min(100, input.occupancyRatePct)) / 100);
  const strGrossMonthlyRevenue = Math.max(0, input.averageDailyRate) * bookedNightsPerMonth;
  const platformFee =
    strGrossMonthlyRevenue * (Math.max(0, input.platformAndMgmtFeePct) / 100);
  const strMonthlyExpenses =
    platformFee + Math.max(0, input.monthlyUtilitiesAndWifi) + Math.max(0, input.monthlyPitia);
  const strMonthlyNetCashFlow = strGrossMonthlyRevenue - strMonthlyExpenses;

  // 장기임대(LTR)는 공실·수선비 12% 차감 후 PITIA 차감
  const ltrMonthlyNetCashFlow =
    Math.max(0, input.longTermMonthlyRent) * 0.88 - Math.max(0, input.monthlyPitia);
  const monthlyStrAdvantage = strMonthlyNetCashFlow - ltrMonthlyNetCashFlow;

  return {
    bookedNightsPerMonth,
    strGrossMonthlyRevenue,
    strMonthlyExpenses,
    strMonthlyNetCashFlow,
    ltrMonthlyNetCashFlow,
    monthlyStrAdvantage,
  };
}

