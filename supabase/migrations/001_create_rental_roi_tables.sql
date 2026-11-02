-- ==============================================================================
-- 001_create_rental_roi_tables.sql
-- 목적: RentalRoiSmart 사이트의 임대 부동산 투자 분석(Cap Rate, Cash Flow, DSCR) 저장 테이블 생성
-- 규칙 준수:
--   1. 파일명 앞에 001_ 순서 번호 부여 및 supabase/migrations 폴더 내 정리
--   2. 모든 사용자 메모 및 매물 식별 정보는 클라이언트에서 AES-256-GCM 암호화 후 저장
--   3. Row Level Security (RLS) 활성화로 익명 사용자의 타인 데이터 조회 원천 차단
-- ==============================================================================

-- 1. 임대 부동산 수익률 및 DSCR 매물 분석 저장 테이블
CREATE TABLE IF NOT EXISTS public.rental_roi_deals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    state_slug VARCHAR(64) NOT NULL,            -- 선택한 주 슬러그
    purchase_price NUMERIC(12, 2) NOT NULL,     -- 매물 매입 가격 ($)
    down_payment NUMERIC(12, 2) NOT NULL,       -- 자기자본 계약금 ($)
    monthly_rent NUMERIC(10, 2) NOT NULL,       -- 예상 월 임대료 ($)
    monthly_cash_flow NUMERIC(10, 2) NOT NULL,  -- 월 순수 현금흐름 ($)
    cap_rate_pct NUMERIC(6, 2) NOT NULL,        -- 자본환원율 (Cap Rate %)
    cash_on_cash_pct NUMERIC(6, 2) NOT NULL,    -- 자기자본수익률 (Cash-on-Cash %)
    dscr_ratio NUMERIC(6, 2) NOT NULL,          -- 부채상환비율 (DSCR)
    encrypted_note TEXT                         -- 클라이언트 AES-256-GCM 암호화된 매물 메모
);

CREATE INDEX IF NOT EXISTS idx_rental_roi_deals_state ON public.rental_roi_deals (state_slug);
CREATE INDEX IF NOT EXISTS idx_rental_roi_deals_created_at ON public.rental_roi_deals (created_at DESC);

ALTER TABLE public.rental_roi_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous rental deal insert"
    ON public.rental_roi_deals
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

-- 2. 사이트 보안 피드백 테이블
CREATE TABLE IF NOT EXISTS public.rental_roi_feedbacks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    category VARCHAR(50) NOT NULL,
    email_sha256_hash VARCHAR(128),
    encrypted_contact TEXT,
    message TEXT NOT NULL,
    page_url TEXT,
    status VARCHAR(30) DEFAULT 'new' NOT NULL
);

ALTER TABLE public.rental_roi_feedbacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous rental feedback insert"
    ON public.rental_roi_feedbacks
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

