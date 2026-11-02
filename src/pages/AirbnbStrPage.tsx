import { useState, useMemo } from 'react';
import { calculateStrVsLtr } from '../lib/rentalRoiCalc';
import { usePageSeo } from '../lib/seo';

// =========================================================================
// 에어비앤비 단기임대(Airbnb STR) vs 일반 장기임대(LTR) 현금흐름 비교 계산기 (/airbnb-str)
// =========================================================================

const usd = (n: number) => '$' + Math.round(n).toLocaleString('en-US');

export default function AirbnbStrPage() {
  usePageSeo({
    title: 'Airbnb Short-Term Rental (STR) vs Long-Term Rental ROI Calculator (2026) | RentalRoiSmart',
    description:
      'Compare Airbnb and VRBO short-term rental cash flow against traditional long-term leases using Average Daily Rate (ADR), occupancy rate, host fees, and monthly PITIA.',
    path: '/airbnb-str',
  });

  const [averageDailyRate, setAverageDailyRate] = useState<number>(215);
  const [occupancyRatePct, setOccupancyRatePct] = useState<number>(65);
  const [platformAndMgmtFeePct, setPlatformAndMgmtFeePct] = useState<number>(18);
  const [monthlyUtilitiesAndWifi, setMonthlyUtilitiesAndWifi] = useState<number>(420);
  const [monthlyPitia, setMonthlyPitia] = useState<number>(2100);
  const [longTermMonthlyRent, setLongTermMonthlyRent] = useState<number>(2400);

  const result = useMemo(
    () =>
      calculateStrVsLtr({
        averageDailyRate,
        occupancyRatePct,
        platformAndMgmtFeePct,
        monthlyUtilitiesAndWifi,
        monthlyPitia,
        longTermMonthlyRent,
      }),
    [
      averageDailyRate,
      occupancyRatePct,
      platformAndMgmtFeePct,
      monthlyUtilitiesAndWifi,
      monthlyPitia,
      longTermMonthlyRent,
    ]
  );

  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
        <span className="inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          Airbnb / VRBO vs 12-Month Lease
        </span>
        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Airbnb Short-Term Rental (STR) vs. Long-Term Rental Cash Flow Calculator
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Should you operate your investment property as an Airbnb / VRBO vacation rental or sign a
          traditional 12-month tenant? Compare net monthly cash flow after host utilities,
          cleaning/management fees, and mortgage PITIA.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Airbnb Average Daily Rate (ADR $)
                </label>
                <input
                  type="number"
                  min={25}
                  step={10}
                  value={averageDailyRate}
                  onChange={(e) => setAverageDailyRate(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Average Occupancy Rate (%)
                </label>
                <input
                  type="number"
                  min={5}
                  max={100}
                  step={5}
                  value={occupancyRatePct}
                  onChange={(e) => setOccupancyRatePct(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-base font-semibold text-slate-900"
                />
                <span className="mt-1 block text-xs text-slate-500">
                  {result.bookedNightsPerMonth.toFixed(1)} booked nights / month
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Platform + Co-Host Mgmt Fee (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  step={1}
                  value={platformAndMgmtFeePct}
                  onChange={(e) => setPlatformAndMgmtFeePct(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  STR Utilities, WiFi &amp; Supplies ($/mo)
                </label>
                <input
                  type="number"
                  min={0}
                  step={25}
                  value={monthlyUtilitiesAndWifi}
                  onChange={(e) => setMonthlyUtilitiesAndWifi(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Monthly Mortgage PITIA ($/mo)
                </label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={monthlyPitia}
                  onChange={(e) => setMonthlyPitia(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Comparable Long-Term Rent ($/mo)
                </label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={longTermMonthlyRent}
                  onChange={(e) => setLongTermMonthlyRent(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl bg-slate-900 p-6 text-white space-y-4">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                Airbnb STR Net Monthly Cash Flow
              </div>
              <div className="mt-1 text-4xl font-extrabold text-white">
                {usd(result.strMonthlyNetCashFlow)} / mo
              </div>
              <div className="mt-1 text-xs text-blue-300 font-medium">
                STR vs Long-Term Lease Difference:{' '}
                <strong>
                  {result.monthlyStrAdvantage >= 0 ? '+' : ''}
                  {usd(result.monthlyStrAdvantage)} / mo
                </strong>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">STR Gross Monthly Revenue:</span>
                <span className="font-semibold text-white">
                  {usd(result.strGrossMonthlyRevenue)} / mo
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">STR Total Monthly Expenses + PITIA:</span>
                <span className="font-semibold text-rose-300">
                  -{usd(result.strMonthlyExpenses)} / mo
                </span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2">
                <span className="text-slate-400">Long-Term Rental Net Cash Flow:</span>
                <span className="font-semibold text-emerald-300">
                  {usd(result.ltrMonthlyNetCashFlow)} / mo
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

