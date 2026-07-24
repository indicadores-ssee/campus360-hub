import { test, expect } from '@playwright/test';

test('el paso tipo carga sin errores de consola', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  await page.goto('/tipo');
  await expect(page.getByRole('button', { name: 'Ingresar' })).toBeVisible();
  // Ignora ruido conocido de hidratación de framer-motion si aplica.
  const reales = errors.filter((e) => !/hydrat|framer/i.test(e));
  expect(reales).toEqual([]);
});

test('POST/PUT de turno sin datos requeridos responde error', async ({ request }) => {
  const res = await request.put('/api/turno?action=asignar', { data: {} });
  expect(res.status()).toBeGreaterThanOrEqual(400);
});
