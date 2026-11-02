import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { RENTAL_STATES, RentalStateInfo } from '../data/rentalStates';
import { calculateRentalRoi } from '../lib/rentalRoiCalc';
import { saveRentalDeal } from '../lib/supabase';

// =========================================================================
// 미국 임대 부동산 수익률(Cap Rate, Cash-on-Cash Return, Cash Flow)
// 및 DSCR 투자 대출 심사 비율 메인 계산기 컴포넌트
// =========================================================================

interface RentalRoiCalculatorProps {
  initialState?: RentalStateInfo;
}

const usd = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

export default function RentalRoiCalculator({ initialState }: RentalRoiCalculatorProps) {
  const defaultState =
    initialState || RENTAL_STATES.find((s) => s.slug === 'ohio') || RENTAL_STATES[0];

  const [selectedStateSlug, setSelectedStateSlug] = useState<string>(defaultState.slug);
  const [purchasePrice, setPurchasePrice] = useState<number>(defaultState.medianPropertyPrice || 280000);
  const [downPaymentPct, setDownPaymentPct] = useState<number>(25);
  const [closingAndRehabCosts, setClosingAndRehabCosts] = useState<number>(12000);
  const [interestRateApr, setInterestRateApr] = useState<number>(7.15);
  const [loanTermYears, setLoanTermYears] = useState<number>(30);
  const [monthlyGrossRent, setMonthlyGrossRent] = useState<number>(
    defaultState.medianMonthlyRent || 2350
  );
  const [vacancyRatePct, setVacancyRatePct] = useState<number>(5);
  const [propertyTaxRatePct, setPropertyTaxRatePct] = useState<number>(
    defaultState.propertyTaxRatePct
  );
  const [annualLandlordInsurance, setAnnualLandlordInsurance] = useState<number>(
    defaultState.avgLandlordInsuranceYr
  );
  const [monthlyHoaFee, setMonthlyHoaFee] = useState<number>(0);
  const [managementFeePct, setManagementFeePct] = useState<number>(8);
  const [maintenanceAndCapexPct, setMaintenanceAndCapexPct] = useState<number>(7);

  const [dealNote, setDealNote] = useState<string>('');
  const [saveMessage, setSaveMessage] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const currentStateInfo = useMemo(
    () => RENTAL_STATES.find((s) => s.slug === selectedStateSlug) || defaultState,
    [selectedStateSlug, defaultState]
  );

  const handleStateChange = (newSlug: string) => {
    setSelectedStateSlug(newSlug);
    const st = RENTAL_STATES.find((s) => s.slug === newSlug);
    if (st) {
      setPurchasePrice(st.medianPropertyPrice);
      setMonthlyGrossRent(st.medianMonthlyRent);
      setPropertyTaxRatePct(st.propertyTaxRatePct);
      setAnnualLandlordInsurance(st.avgLandlordInsuranceYr);
    }
  };

  const result = useMemo(
    () =>
      calculateRentalRoi({
        purchasePrice,
        downPaymentPct,
        closingAndRehabCosts,
        interestRateApr,
        loanTermYears,
        monthlyGrossRent,
        vacancyRatePct,
        propertyTaxRatePct,
        annualLandlordInsurance,
        monthlyHoaFee,
        managementFeePct,
        maintenanceAndCapexPct,
      }),
    [
      purchasePrice,
      downPaymentPct,
      closingAndRehabCosts,
      interestRateApr,
      loanTermYears,
      monthlyGrossRent,
      vacancyRatePct,
      propertyTaxRatePct,
      annualLandlordInsurance,
      monthlyHoaFee,
      managementFeePct,
      maintenanceAndCapexPct,
    ]
  );

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');
    const res = await saveRentalDeal({
      state_slug: selectedStateSlug,
      purchase_price: purchasePrice,
      down_payment: result.downPaymentAmount,
      monthly_rent: monthlyGrossRent,
      monthly_cash_flow: result.monthlyCashFlow,
      cap_rate_pct: result.capRatePct,
      cash_on_cash_pct: result.cashOnCashReturnPct,
      dscr_ratio: result.dscrRatio,
      note: dealNote,
    });
    setIsSaving(false);
    if (res.success) {
      setSaveMessage('Rental deal analysis encrypted & saved!');
      setDealNote('');
    } else {
      setSaveMessage('Saved locally to browser.');
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              2026 Real Estate Investor &amp; DSCR Underwriting Tool
            </span>
            <h2 className="mt-2 text-2xl font-bold text-slate-900">
              Rental Property Cash Flow, Cap Rate &amp; DSCR Loan Calculator
            </h2>
          </div>
          <div className="text-right">
            <div className="text-xs font-medium text-slate-500">Selected State Landlord Rules</div>
            <Link
              to={`/rental-roi/${currentStateInfo.slug}`}
              className="text-sm font-bold text-blue-600 underline hover:text-blue-800"
            >
              {currentStateInfo.name} ({currentStateInfo.propertyTaxRatePct}% Prop Tax) &rarr;
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* 왼쪽 입력 폼 (7칸) */}
          <div className="space-y-5 lg:col-span-7">
            {/* 1. 주 선택 */}
            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
              <label className="block text-sm font-semibold text-slate-800">
                1. Select Property State (Loads State Rental Tax Rate, Landlord Insurance &amp; Avg Rent)
              </label>
              <select
                value={selectedStateSlug}
                onChange={(e) => handleStateChange(e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-900"
              >
                {RENTAL_STATES.map((st) => (
                  <option key={st.slug} value={st.slug}>
                    {st.name} ({st.abbr}) — {st.propertyTaxRatePct}% Rental Tax | Avg Rent: $
                    {st.medianMonthlyRent}/mo
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-slate-600">
                <strong>{currentStateInfo.name} Investor Note:</strong>{' '}
                {currentStateInfo.rentalRuleNote}
              </p>
            </div>

            {/* 2. 매입가, 계약금 비율, 클로징/수리비 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Purchase Price ($)
                </label>
                <input
                  type="number"
                  min={20000}
                  step={5000}
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Down Payment (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={5}
                  value={downPaymentPct}
                  onChange={(e) => setDownPaymentPct(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base font-semibold text-slate-900"
                />
                <span className="mt-1 block text-[11px] text-slate-500">
                  Down: {usd(result.downPaymentAmount)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Closing + Rehab ($)
                </label>
                <input
                  type="number"
                  min={0}
                  step={1000}
                  value={closingAndRehabCosts}
                  onChange={(e) => setClosingAndRehabCosts(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base font-semibold text-slate-900"
                />
              </div>
            </div>

            {/* 3. 예상 월세, 대출 금리, 만기 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Monthly Gross Rent ($)
                </label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={monthlyGrossRent}
                  onChange={(e) => setMonthlyGrossRent(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  DSCR / Loan APR (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  step={0.1}
                  value={interestRateApr}
                  onChange={(e) => setInterestRateApr(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Loan Term (Years)
                </label>
                <select
                  value={loanTermYears}
                  onChange={(e) => setLoanTermYears(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-base font-semibold text-slate-900"
                >
                  <option value={30}>30 Years (Standard)</option>
                  <option value={20}>20 Years</option>
                  <option value={15}>15 Years</option>
                </select>
              </div>
            </div>

            {/* 4. 재산세율, 임대인 보험료, HOA, 공실/관리/수선비 */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-4">
              <h3 className="text-sm font-bold text-slate-900">
                Operating Expenses &amp; Reserves
              </h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Property Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={5}
                    step={0.05}
                    value={propertyTaxRatePct}
                    onChange={(e) => setPropertyTaxRatePct(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Landlord Ins. ($/yr)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={annualLandlordInsurance}
                    onChange={(e) => setAnnualLandlordInsurance(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Monthly HOA ($/mo)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={25}
                    value={monthlyHoaFee}
                    onChange={(e) => setMonthlyHoaFee(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Vacancy Rate (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={40}
                    step={1}
                    value={vacancyRatePct}
                    onChange={(e) => setVacancyRatePct(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Property Mgmt (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={25}
                    step={1}
                    value={managementFeePct}
                    onChange={(e) => setManagementFeePct(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Repairs &amp; CapEx (%)
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={25}
                    step={1}
                    value={maintenanceAndCapexPct}
                    onChange={(e) => setMaintenanceAndCapexPct(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-sm font-semibold text-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽 실시간 결과 영역 (5칸) */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-2xl bg-slate-900 p-6 text-white">
            <div className="space-y-5">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  Net Monthly Cash Flow
                </div>
                <div
                  className={`mt-1 text-4xl font-extrabold tracking-tight ${
                    result.monthlyCashFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {result.monthlyCashFlow >= 0 ? '+' : ''}
                  {usd(result.monthlyCashFlow)}
                  <span className="text-base font-normal text-slate-400"> / mo</span>
                </div>
                <div className="mt-1 text-xs text-slate-300">
                  Annual Cash Flow: <strong>{usd(result.annualCashFlow)} / yr</strong> on{' '}
                  {usd(result.totalCashInvested)} Total Cash Invested
                </div>
              </div>

              {/* 3대 핵심 투자 지표: Cap Rate, Cash-on-Cash, DSCR */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-slate-800 p-3">
                  <div className="text-[11px] text-slate-400">Cap Rate</div>
                  <div className="mt-1 text-lg font-extrabold text-white">
                    {result.capRatePct.toFixed(2)}%
                  </div>
                </div>
                <div className="rounded-xl bg-slate-800 p-3">
                  <div className="text-[11px] text-slate-400">Cash-on-Cash</div>
                  <div className="mt-1 text-lg font-extrabold text-emerald-400">
                    {result.cashOnCashReturnPct.toFixed(2)}%
                  </div>
                </div>
                <div className="rounded-xl bg-slate-800 p-3">
                  <div className="text-[11px] text-slate-400">DSCR Ratio</div>
                  <div className="mt-1 text-lg font-extrabold text-blue-300">
                    {result.dscrRatio.toFixed(2)}x
                  </div>
                </div>
              </div>

              {/* DSCR 대출 적격 여부 배지 */}
              <div className="rounded-xl bg-slate-800/90 p-4 space-y-2 text-xs">
                <div className="flex items-center justify-between border-b border-slate-700 pb-2">
                  <span className="font-bold text-slate-200 uppercase">DSCR Loan Status:</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                      result.dscrRatio >= 1.25
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : result.dscrRatio >= 1.0
                        ? 'bg-amber-500/20 text-amber-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {result.dscrStatus}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Monthly Gross Rent:</span>
                  <span className="font-semibold text-white">{usd(monthlyGrossRent)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Monthly Mortgage P&amp;I:</span>
                  <span className="font-semibold text-white">
                    -{usd(result.monthlyPrincipalAndInterest)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Monthly Tax + Landlord Ins + HOA:</span>
                  <span className="font-semibold text-white">
                    -{usd(result.monthlyPropertyTax + result.monthlyInsurance + monthlyHoaFee)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Total Monthly PITIA (DSCR Denominator):</span>
                  <span className="font-bold text-amber-300">{usd(result.monthlyPitia)}</span>
                </div>
                <div className="flex justify-between border-t border-slate-700 pt-1.5">
                  <span className="text-slate-400">Annual Net Operating Income (NOI):</span>
                  <span className="font-bold text-emerald-300">
                    {usd(result.annualNetOperatingIncome)} / yr
                  </span>
                </div>
              </div>
            </div>

            {/* Supabase 암호화 매물 저장 */}
            <div className="mt-6 border-t border-slate-800 pt-4">
              <label className="block text-[11px] font-medium text-slate-400">
                Save Rental Deal Analysis (Client-Side AES-256 Encrypted)
              </label>
              <div className="mt-1.5 flex gap-2">
                <input
                  type="text"
                  placeholder="e.g., 123 Oak St Duplex - DSCR Deal"
                  value={dealNote}
                  onChange={(e) => setDealNote(e.target.value)}
                  className="flex-1 rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs text-white placeholder-slate-500"
                />
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={handleSave}
                  className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Deal'}
                </button>
              </div>
              {saveMessage && (
                <p className="mt-1.5 text-[11px] font-medium text-emerald-400">{saveMessage}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

