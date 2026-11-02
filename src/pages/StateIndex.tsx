import { Link } from 'react-router-dom';
import { RENTAL_STATES } from '../data/rentalStates';
import { usePageSeo } from '../lib/seo';

// =========================================================================
// 51개 주(50개 주 + DC) 임대 부동산 재산세율, 임대인 보험료, 평균 월세 비교 목록 페이지
// =========================================================================

export default function StateIndex() {
  usePageSeo({
    title: 'Rental Property ROI, Cap Rate & DSCR Calculator by State (2026) | RentalRoiSmart',
    description:
      'Compare 2026 rental property tax rates, average landlord insurance costs, median rents, and DSCR loan metrics across all 50 US states and DC.',
    path: '/rental-roi',
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <h1 className="text-3xl font-bold text-slate-900">
          US Rental Property ROI, Cap Rate &amp; DSCR Calculator by State (2026)
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Choose a state below to analyze rental property cash flow, Net Operating Income (NOI),
          Cap Rate, Cash-on-Cash return, and DSCR loan qualification with state-specific property
          tax and landlord insurance averages.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100 text-slate-700 font-semibold">
                <th className="p-3">State</th>
                <th className="p-3">Rental Property Tax</th>
                <th className="p-3">Avg Landlord Ins.</th>
                <th className="p-3">Median Property Price</th>
                <th className="p-3">Median Monthly Rent</th>
                <th className="p-3">Calculator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {RENTAL_STATES.map((st) => (
                <tr key={st.slug} className="hover:bg-slate-50">
                  <td className="p-3 font-semibold text-slate-900">
                    <Link to={`/rental-roi/${st.slug}`} className="text-blue-600 hover:underline">
                      {st.name} ({st.abbr})
                    </Link>
                  </td>
                  <td className="p-3 font-semibold text-slate-900">
                    {st.propertyTaxRatePct.toFixed(2)}%
                  </td>
                  <td className="p-3 text-slate-700">
                    ${st.avgLandlordInsuranceYr.toLocaleString()}/yr
                  </td>
                  <td className="p-3 text-slate-700">
                    ${st.medianPropertyPrice.toLocaleString()}
                  </td>
                  <td className="p-3 font-semibold text-emerald-700">
                    ${st.medianMonthlyRent.toLocaleString()}/mo
                  </td>
                  <td className="p-3">
                    <Link
                      to={`/rental-roi/${st.slug}`}
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      Analyze ROI &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

