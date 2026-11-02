import { usePageSeo } from '../lib/seo';

// =========================================================================
// 사이트 소개 및 임대 부동산 수익률·DSCR 계산 공식 안내 페이지 (/about)
// =========================================================================

export default function AboutPage() {
  usePageSeo({
    title: 'About RentalRoiSmart & DSCR / Cap Rate Methodology | RentalRoiSmart',
    description:
      'Learn how RentalRoiSmart calculates rental property Net Operating Income (NOI), Cap Rate, Cash-on-Cash Return, and DSCR loan qualification ratios.',
    path: '/about',
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 text-sm text-slate-700 leading-relaxed">
      <h1 className="text-3xl font-bold text-slate-900">
        About RentalRoiSmart &amp; Methodology
      </h1>
      <p>
        <strong>RentalRoiSmart</strong> is a free, privacy-first US real estate investment and DSCR
        loan underwriting calculator designed for landlords, house hackers, and short-term rental
        hosts.
      </p>
      <h2 className="text-lg font-bold text-slate-900 pt-2">
        Key Real Estate Investment Formulas We Use
      </h2>
      <ul className="list-disc pl-5 space-y-1.5">
        <li>
          <strong>Net Operating Income (NOI):</strong> Effective Gross Rental Income (after vacancy
          allowance) minus operating expenses (property tax, DP-3 landlord insurance, HOA,
          property management, and maintenance/CapEx reserves), excluding mortgage debt service.
        </li>
        <li>
          <strong>Capitalization Rate (Cap Rate):</strong> Annual NOI divided by the property
          purchase price.
        </li>
        <li>
          <strong>Cash-on-Cash Return (CoC ROI):</strong> Annual pre-tax net cash flow (after
          mortgage principal and interest) divided by total cash invested (down payment + closing
          costs + rehab budget).
        </li>
        <li>
          <strong>Debt Service Coverage Ratio (DSCR):</strong> Gross monthly rental income divided
          by monthly PITIA (Principal, Interest, Taxes, Insurance, and Association dues). Most DSCR
          lenders look for a ratio of 1.00x to 1.25x+.
        </li>
      </ul>
    </div>
  );
}

