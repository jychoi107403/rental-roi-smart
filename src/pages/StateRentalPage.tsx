import { Link, useParams } from 'react-router-dom';
import RentalRoiCalculator from '../components/RentalRoiCalculator';
import { RENTAL_STATES, findRentalStateBySlug } from '../data/rentalStates';
import { calculateRentalRoi } from '../lib/rentalRoiCalc';
import { usePageSeo } from '../lib/seo';

// =========================================================================
// 주(State)별 임대 부동산 수익률 & DSCR 대출 전용 SEO 페이지 (/rental-roi/:state)
// =========================================================================

const usd = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

export default function StateRentalPage() {
  const { state = '' } = useParams<{ state: string }>();
  const stateInfo = findRentalStateBySlug(state);

  usePageSeo({
    title: stateInfo
      ? `${stateInfo.name} Rental Property ROI, Cap Rate & DSCR Loan Calculator (2026)`
      : 'State Rental Property Calculator | RentalRoiSmart',
    description: stateInfo
      ? `Calculate rental property cash flow, Cap Rate, Cash-on-Cash return, and DSCR loan ratios in ${stateInfo.name}. Includes ${stateInfo.propertyTaxRatePct.toFixed(2)}% ${stateInfo.abbr} rental property tax and $${stateInfo.avgLandlordInsuranceYr}/yr landlord insurance.`
      : 'State rental property ROI and DSCR loan calculator.',
    path: stateInfo ? `/rental-roi/${stateInfo.slug}` : '/rental-roi',
  });

  if (!stateInfo) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">State Not Found</h1>
        <Link to="/rental-roi" className="mt-4 inline-block font-semibold text-blue-600 underline">
          Browse all 50 US states &rarr;
        </Link>
      </div>
    );
  }

  const basePrice = stateInfo.medianPropertyPrice;
  const baseRent = stateInfo.medianMonthlyRent;
  const scenarios = [
    { label: 'Starter Single-Family', price: Math.round(basePrice * 0.75), rent: Math.round(baseRent * 0.85) },
    { label: 'Median Single-Family', price: basePrice, rent: baseRent },
    { label: 'Duplex / Small Multi-Family', price: Math.round(basePrice * 1.25), rent: Math.round(baseRent * 1.55) },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="text-xs text-slate-500">
          <Link to="/" className="hover:underline">
            Home
          </Link>{' '}
          &rsaquo;{' '}
          <Link to="/rental-roi" className="hover:underline">
            States
          </Link>{' '}
          &rsaquo; <span className="font-semibold text-slate-700">{stateInfo.name}</span>
        </div>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          {stateInfo.name} ({stateInfo.abbr}) Rental Property ROI, Cap Rate &amp; DSCR Calculator
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Analyzing an investment property in <strong>{stateInfo.name}</strong>?{' '}
          {stateInfo.rentalRuleNote}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
            <div className="text-xs text-slate-500">{stateInfo.abbr} Rental Prop Tax</div>
            <div className="mt-1 text-xl font-bold text-slate-900">
              {stateInfo.propertyTaxRatePct.toFixed(2)}%
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
            <div className="text-xs text-slate-500">Avg Landlord Insurance</div>
            <div className="mt-1 text-xl font-bold text-slate-900">
              ${stateInfo.avgLandlordInsuranceYr}/yr
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
            <div className="text-xs text-slate-500">Median Property Price</div>
            <div className="mt-1 text-xl font-bold text-slate-900">
              {usd(stateInfo.medianPropertyPrice)}
            </div>
          </div>
          <div className="rounded-xl bg-slate-50 p-3.5 border border-slate-200">
            <div className="text-xs text-slate-500">Median Monthly Rent</div>
            <div className="mt-1 text-xl font-bold text-emerald-700">
              {usd(stateInfo.medianMonthlyRent)}/mo
            </div>
          </div>
        </div>
      </div>

      <RentalRoiCalculator key={stateInfo.slug} initialState={stateInfo} />

      {/* 매물 유형별 Cap Rate & DSCR 비교 예시 표 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-bold text-slate-900">
          {stateInfo.name} Sample Investment Property Cap Rate &amp; DSCR Scenarios
        </h2>
        <p className="mt-1 text-xs text-slate-600">
          Assumes 25% down payment, 30-year DSCR loan at 7.15% APR, and {stateInfo.name}&apos;s{' '}
          {stateInfo.propertyTaxRatePct.toFixed(2)}% rental property tax rate:
        </p>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-slate-700 font-semibold">
                <th className="p-3">Property Type</th>
                <th className="p-3">Price / Monthly Rent</th>
                <th className="p-3">Cap Rate</th>
                <th className="p-3">DSCR Ratio</th>
                <th className="p-3">Net Monthly Cash Flow</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {scenarios.map((sc) => {
                const sample = calculateRentalRoi({
                  purchasePrice: sc.price,
                  downPaymentPct: 25,
                  closingAndRehabCosts: 8000,
                  interestRateApr: 7.15,
                  loanTermYears: 30,
                  monthlyGrossRent: sc.rent,
                  vacancyRatePct: 5,
                  propertyTaxRatePct: stateInfo.propertyTaxRatePct,
                  annualLandlordInsurance: stateInfo.avgLandlordInsuranceYr,
                  monthlyHoaFee: 0,
                  managementFeePct: 8,
                  maintenanceAndCapexPct: 7,
                });
                return (
                  <tr key={sc.label} className="hover:bg-slate-50">
                    <td className="p-3 font-semibold text-slate-900">{sc.label}</td>
                    <td className="p-3 text-slate-700">
                      {usd(sc.price)} / {usd(sc.rent)}/mo
                    </td>
                    <td className="p-3 font-bold text-slate-900">
                      {sample.capRatePct.toFixed(2)}%
                    </td>
                    <td className="p-3 font-bold text-blue-600">
                      {sample.dscrRatio.toFixed(2)}x
                    </td>
                    <td
                      className={`p-3 font-bold ${
                        sample.monthlyCashFlow >= 0 ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {sample.monthlyCashFlow >= 0 ? '+' : ''}
                      {usd(sample.monthlyCashFlow)} / mo
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 주별 자주 묻는 질문 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        <h2 className="text-xl font-bold text-slate-900">
          {stateInfo.name} Rental Property &amp; DSCR Loan FAQs
        </h2>
        <div className="space-y-3 text-sm text-slate-700">
          <div className="rounded-xl bg-slate-50 p-4">
            <h3 className="font-bold text-slate-900">
              What DSCR ratio do I need to buy a rental property in {stateInfo.name}?
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Most DSCR (Debt Service Coverage Ratio) lenders in {stateInfo.name} require a minimum{' '}
              <strong>1.00x to 1.25x DSCR</strong>—meaning the property&apos;s gross monthly rent
              must equal or exceed 100% to 125% of the monthly PITIA (Principal, Interest, Property
              Taxes, Landlord Insurance, and HOA fees).
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <h3 className="font-bold text-slate-900">
              Are property taxes higher on rental properties in {stateInfo.name}?
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              {stateInfo.rentalRuleNote} You can also check county-level property tax rates on our
              sister site{' '}
              <a
                href={`https://mortgage.bangjang.net/mortgage/${stateInfo.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-blue-600 underline"
              >
                MortgageSmart {stateInfo.name} Property Tax Directory &rarr;
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* 다른 주 빠른 이동 링크 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h2 className="text-base font-bold text-slate-900">
          Compare Rental Property ROI &amp; DSCR in Other US States
        </h2>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          {RENTAL_STATES.map((s) => (
            <Link
              key={s.slug}
              to={`/rental-roi/${s.slug}`}
              className={`rounded-md border px-2.5 py-1 font-medium ${
                s.slug === stateInfo.slug
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-blue-400'
              }`}
            >
              {s.name} ({s.propertyTaxRatePct}%)
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

