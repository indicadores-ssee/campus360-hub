import { mapSharePointBanners } from '@/lib/server/banner-mapper';
import { readBannersFromKv, writeBannersToKv } from '@/lib/server/banner-kv';
import type { BannerAnnouncement } from '@/types/banner';

const PA_TIMEOUT_MS = 15_000;
export const BANNER_ROTATION_INTERVAL_MS = 15_000;

async function fetchBannersFromPowerAutomate(): Promise<BannerAnnouncement[]> {
  const url = process.env.MICROSOFT_AVISOS_FLOW_URL?.trim();
  if (!url) {
    console.warn('[banner-service] MICROSOFT_AVISOS_FLOW_URL is not set');
    return [];
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
    cache: 'no-store',
    signal: AbortSignal.timeout(PA_TIMEOUT_MS),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`Power Automate returned ${response.status}: ${body.slice(0, 200)}`);
  }

  const raw: unknown = await response.json();
  return mapSharePointBanners(raw);
}

export function refreshBannersFromPayload(raw: unknown): BannerAnnouncement[] {
  return mapSharePointBanners(raw);
}

export async function persistBanners(messages: BannerAnnouncement[]): Promise<void> {
  await writeBannersToKv(messages, 'refresh');
}

export async function getActiveBanners(): Promise<BannerAnnouncement[]> {
  const cached = await readBannersFromKv();
  if (cached) return cached;

  try {
    const messages = await fetchBannersFromPowerAutomate();
    await writeBannersToKv(messages, 'refresh');
    return messages;
  } catch (error) {
    console.error('[banner-service] Failed to fetch banners:', error);
    return [];
  }
}
