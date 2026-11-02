// =========================================================================
// 57개 전체 페이지 정적 HTML 사전 생성(Pre-rendering / SSG) 스크립트 (RentalRoiSmart)
// =========================================================================

import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const STATES_TS = join(ROOT, 'src', 'data', 'rentalStates.ts');

const SITE_ORIGIN = 'https://rentalroi.bangjang.net';

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const baseHtml = readFileSync(join(DIST, 'index.html'), 'utf8');

const stateRegex =
  /\{\s*slug:\s*'([^']+)',\s*name:\s*'([^']+)',\s*abbr:\s*'([^']+)',\s*propertyTaxRatePct:\s*([0-9.]+),\s*avgLandlordInsuranceYr:\s*([0-9]+),\s*medianPropertyPrice:\s*([0-9]+),\s*medianMonthlyRent:\s*([0-9]+),\s*rentalRuleNote:\s*'([^']+)'\s*\}/g;

const states = [...readFileSync(STATES_TS, 'utf8').matchAll(stateRegex)].map((m) => ({
  slug: m[1],
  name: m[2],
  abbr: m[3],
  propertyTaxRatePct: Number(m[4]),
  avgLandlordInsuranceYr: Number(m[5]),
  medianPropertyPrice: Number(m[6]),
  medianMonthlyRent: Number(m[7]),
  rentalRuleNote: m[8],
}));

if (states.length !== 51) {
  console.error(`주 데이터 파싱 실패: ${states.length}개`);
  process.exit(1);
}

function writePageHtml({ routePath, title, description, heading, summaryHtml, faqItems }) {
  const canonical = `${SITE_ORIGIN}${routePath}`;
  let html = baseHtml;

  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(title)}</title>`);
  html = html.replace(
    /<meta\s+name="title"\s+content="[^"]*"\s*\/>/,
    `<meta name="title" content="${esc(title)}" />`
  );
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/>/,
    `<meta name="description" content="${esc(description)}" />`
  );
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/,
    `<link rel="canonical" href="${esc(canonical)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:url" content="${esc(canonical)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:title" content="${esc(title)}" />`
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="og:description" content="${esc(description)}" />`
  );
  html = html.replace(
    /<meta\s+property="twitter:title"\s+content="[^"]*"\s*\/>/,
    `<meta property="twitter:title" content="${esc(title)}" />`
  );
  html = html.replace(
    /<meta\s+property="twitter:description"\s+content="[^"]*"\s*\/>/,
    `<meta property="twitter:description" content="${esc(description)}" />`
  );

  if (faqItems && faqItems.length > 0) {
    const faqJsonLd = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.a,
        },
      })),
    };
    const scriptTag = `    <script type="application/ld+json">${JSON.stringify(faqJsonLd)}</script>\n  </head>`;
    html = html.replace('</head>', scriptTag);
  }

  const seoBody = `<div id="root"><main class="mx-auto max-w-5xl p-6"><h1 class="text-3xl font-bold text-slate-900">${esc(heading)}</h1>${summaryHtml}</main></div>`;
  html = html.replace('<div id="root"></div>', seoBody);

  const outDir = routePath === '/' ? DIST : join(DIST, ...routePath.replace(/^\//, '').split('/'));
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, 'index.html'), html, 'utf8');
}

let count = 0;

const fixedPages = [
  {
    routePath: '/',
    title: 'Rental Property ROI, Cap Rate & DSCR Loan Calculator 2026 | RentalRoiSmart',
    description:
      'Free US rental property cash flow, Cap Rate, Cash-on-Cash return, and DSCR loan qualification calculator covering all 50 states and DC.',
    heading: 'Rental Property Cash Flow, Cap Rate & DSCR Loan Calculator',
    summaryHtml:
      '<p class="mt-2 text-slate-600">Analyze US rental property cash flow, Net Operating Income (NOI), Cap Rate, Cash-on-Cash return, and DSCR loan qualification ratios across all 50 states.</p>',
  },
  {
    routePath: '/rental-roi',
    title: 'Rental Property ROI, Cap Rate & DSCR Calculator by State (2026) | RentalRoiSmart',
    description:
      'Compare 2026 rental property tax rates, average landlord insurance costs, median rents, and DSCR loan metrics across all 50 US states and DC.',
    heading: 'US Rental Property ROI, Cap Rate & DSCR Calculator by State',
    summaryHtml:
      '<p class="mt-2 text-slate-600">Select your state to analyze rental property cash flow, Cap Rate, and DSCR loan ratios with local tax and insurance data.</p>',
  },
  {
    routePath: '/airbnb-str',
    title: 'Airbnb Short-Term Rental (STR) vs Long-Term Rental ROI Calculator (2026) | RentalRoiSmart',
    description:
      'Compare Airbnb and VRBO short-term rental cash flow against traditional long-term leases using Average Daily Rate (ADR), occupancy rate, host fees, and monthly PITIA.',
    heading: 'Airbnb Short-Term Rental (STR) vs. Long-Term Rental Cash Flow Calculator',
    summaryHtml:
      '<p class="mt-2 text-slate-600">Compare monthly net cash flow between operating an Airbnb vacation rental and signing a traditional 12-month long-term tenant.</p>',
  },
  {
    routePath: '/about',
    title: 'About RentalRoiSmart & DSCR / Cap Rate Methodology | RentalRoiSmart',
    description:
      'Learn how RentalRoiSmart calculates rental property Net Operating Income (NOI), Cap Rate, Cash-on-Cash Return, and DSCR loan qualification ratios.',
    heading: 'About RentalRoiSmart & Methodology',
    summaryHtml:
      '<p class="mt-2 text-slate-600">RentalRoiSmart combines institutional NOI, Cap Rate, Cash-on-Cash, and DSCR formulas with 50-state landlord tax and insurance data.</p>',
  },
  {
    routePath: '/privacy',
    title: 'Privacy Policy | RentalRoiSmart',
    description:
      'Privacy Policy for RentalRoiSmart. Learn how we protect your real estate deal analyses with client-side calculations, AES-256 encryption, and cookie disclosures.',
    heading: 'Privacy Policy',
    summaryHtml:
      '<p class="mt-2 text-slate-600">All rental property underwriting runs locally in your browser with client-side AES-256 encryption for saved notes.</p>',
  },
  {
    routePath: '/terms',
    title: 'Terms of Use & Investment Disclaimer | RentalRoiSmart',
    description:
      'Terms of Use and Investment Disclaimer for RentalRoiSmart. All rental cash flow, Cap Rate, and DSCR loan figures are estimates for educational purposes only.',
    heading: 'Terms of Use & Investment Disclaimer',
    summaryHtml:
      '<p class="mt-2 text-slate-600">All calculators and real estate metrics on RentalRoiSmart are estimates for educational purposes only.</p>',
  },
];

for (const p of fixedPages) {
  writePageHtml(p);
  count++;
}

for (const state of states) {
  writePageHtml({
    routePath: `/rental-roi/${state.slug}`,
    title: `${state.name} Rental Property ROI, Cap Rate & DSCR Loan Calculator (2026)`,
    description: `Calculate rental property cash flow, Cap Rate, Cash-on-Cash return, and DSCR loan ratios in ${state.name}. Includes ${state.propertyTaxRatePct.toFixed(2)}% ${state.abbr} rental property tax and $${state.avgLandlordInsuranceYr}/yr landlord insurance.`,
    heading: `${state.name} (${state.abbr}) Rental Property ROI, Cap Rate & DSCR Calculator`,
    summaryHtml: `<p class="mt-2 text-slate-600">Analyze rental property cash flow, Cap Rate, and DSCR ratios in ${esc(state.name)}. ${esc(state.rentalRuleNote)}</p>`,
    faqItems: [
      {
        q: `What is the average rental property tax and landlord insurance in ${state.name}?`,
        a: `In ${state.name}, rental property investors pay an average effective property tax rate of ${state.propertyTaxRatePct.toFixed(2)}% and an average DP-3 landlord insurance premium of $${state.avgLandlordInsuranceYr} per year. ${state.rentalRuleNote}`,
      },
      {
        q: `What DSCR ratio is required for an investment property loan in ${state.name}?`,
        a: `Most DSCR lenders in ${state.name} require a Debt Service Coverage Ratio of 1.00x to 1.25x (Gross Monthly Rent divided by Monthly PITIA).`,
      },
    ],
  });
  count++;
}

console.log(`정적 HTML 사전 생성(SSG) 완료: 총 ${count}개 페이지 생성됨`);

