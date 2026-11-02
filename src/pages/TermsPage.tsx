import { usePageSeo } from '../lib/seo';

// =========================================================================
// 이용약관 및 부동산 투자 면책조항 페이지 (/terms)
// =========================================================================

export default function TermsPage() {
  usePageSeo({
    title: 'Terms of Use & Investment Disclaimer | RentalRoiSmart',
    description:
      'Terms of Use and Investment Disclaimer for RentalRoiSmart. All rental cash flow, Cap Rate, and DSCR loan figures are estimates for educational purposes only.',
    path: '/terms',
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 text-sm text-slate-700 leading-relaxed">
      <h1 className="text-3xl font-bold text-slate-900">
        Terms of Use &amp; Investment Disclaimer
      </h1>
      <p>
        All figures produced by <strong>RentalRoiSmart</strong>—including monthly rental cash flow,
        Net Operating Income (NOI), Cap Rate, Cash-on-Cash return, and DSCR loan ratios—are
        estimates provided strictly for informational and educational purposes.
      </p>
      <p>
        RentalRoiSmart is not a commercial mortgage lender, real estate broker, appraiser, or CPA.
        Actual rental yields, non-homestead property taxes, landlord insurance premiums, and DSCR
        lender underwriting guidelines vary by property and jurisdiction. Always conduct independent
        due diligence before purchasing real estate.
      </p>
    </div>
  );
}

