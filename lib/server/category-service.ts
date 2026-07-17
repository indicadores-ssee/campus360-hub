import {
  filterCategoriesByAudience,
  mapSharePointCategories,
} from '@/lib/server/category-mapper';
import { readCategoriesFromKv, writeCategoriesToKv } from '@/lib/server/category-kv';
import type { WizardCategory, WizardStudentType } from '@/types/category';

const PA_TIMEOUT_MS = 15_000;

async function fetchCategoriesFromPowerAutomate(): Promise<WizardCategory[]> {
  const url = process.env.MICROSOFT_CATEGORIAS_FLOW_URL?.trim();
  if (!url) {
    console.warn('[category-service] MICROSOFT_CATEGORIAS_FLOW_URL is not set');
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
  return mapSharePointCategories(raw);
}

export function refreshCategoriesFromPayload(raw: unknown): WizardCategory[] {
  return mapSharePointCategories(raw);
}

export async function persistCategories(categories: WizardCategory[]): Promise<void> {
  await writeCategoriesToKv(categories, 'refresh');
}

async function getAllCategories(): Promise<WizardCategory[]> {
  const cached = await readCategoriesFromKv();
  if (cached) return cached;

  try {
    const categories = await fetchCategoriesFromPowerAutomate();
    await writeCategoriesToKv(categories, 'refresh');
    return categories;
  } catch (error) {
    console.error('[category-service] Failed to fetch categories:', error);
    return [];
  }
}

export async function getCategoriesForAudience(
  audience: WizardStudentType
): Promise<WizardCategory[]> {
  const all = await getAllCategories();
  return filterCategoriesByAudience(all, audience);
}

export function parseAudienceParam(value: string | null): WizardStudentType | null {
  if (value === 'continuo' || value === 'nuevo') return value;
  return null;
}

export function userTypeToAudience(userType: 'estudiante' | 'aspirante'): WizardStudentType {
  return userType === 'estudiante' ? 'continuo' : 'nuevo';
}
