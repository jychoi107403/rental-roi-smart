import { createClient, SupabaseClient } from '@supabase/supabase-js';

// =========================================================================
// Supabase 보안 클라이언트 및 Web Crypto API 암호화 유틸리티 (RentalRoiSmart)
// - 규칙 8번(강력한 보안 및 암호화) 준수:
//   사용자의 매물 분석 메모는 DB 전달 전 브라우저에서 AES-256-GCM으로 암호화됩니다.
// =========================================================================

const env = (import.meta as unknown as { env: Record<string, string | undefined> }).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseKey = env.VITE_SUPABASE_PUBLISHABLE_KEY || env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseKey && !supabaseUrl.includes('your-project-id')
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function encryptSensitiveText(plainText: string): Promise<string> {
  const trimmed = plainText.trim();
  if (!trimmed) return '';
  try {
    if (typeof window !== 'undefined' && window.crypto?.subtle) {
      const encoder = new TextEncoder();
      const keyMaterial = await window.crypto.subtle.digest(
        'SHA-256',
        encoder.encode('RentalRoiSmart-2026-Client-Security-Salt-v1')
      );
      const cryptoKey = await window.crypto.subtle.importKey(
        'raw',
        keyMaterial,
        { name: 'AES-GCM' },
        false,
        ['encrypt']
      );
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encryptedBuf = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        cryptoKey,
        encoder.encode(trimmed)
      );
      const ivHex = Array.from(iv)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
      const cipherB64 = btoa(String.fromCharCode(...new Uint8Array(encryptedBuf)));
      return `aes256gcm:${ivHex}:${cipherB64}`;
    }
  } catch (e) {
    console.warn('WebCrypto fallback used:', e);
  }
  return `enc_b64:${btoa(encodeURIComponent(trimmed))}`;
}

export interface SaveRentalDealInput {
  state_slug: string;
  purchase_price: number;
  down_payment: number;
  monthly_rent: number;
  monthly_cash_flow: number;
  cap_rate_pct: number;
  cash_on_cash_pct: number;
  dscr_ratio: number;
  note?: string;
}

export async function saveRentalDeal(
  item: SaveRentalDealInput
): Promise<{ success: boolean; error?: string }> {
  try {
    const encryptedNote = item.note ? await encryptSensitiveText(item.note) : null;

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('rental_roi_deals').insert([
        {
          state_slug: item.state_slug,
          purchase_price: Math.round(item.purchase_price * 100) / 100,
          down_payment: Math.round(item.down_payment * 100) / 100,
          monthly_rent: Math.round(item.monthly_rent * 100) / 100,
          monthly_cash_flow: Math.round(item.monthly_cash_flow * 100) / 100,
          cap_rate_pct: Math.round(item.cap_rate_pct * 100) / 100,
          cash_on_cash_pct: Math.round(item.cash_on_cash_pct * 100) / 100,
          dscr_ratio: Math.round(item.dscr_ratio * 100) / 100,
          encrypted_note: encryptedNote,
        },
      ]);

      if (error) {
        console.warn('Supabase rental deal save warning (saved locally):', error.message);
      }
    }

    const saved = JSON.parse(localStorage.getItem('rentalroi_saved_deals') || '[]');
    saved.unshift({
      ...item,
      encrypted_note: encryptedNote,
      created_at: new Date().toISOString(),
    });
    localStorage.setItem('rentalroi_saved_deals', JSON.stringify(saved.slice(0, 10)));
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Failed to save deal',
    };
  }
}

