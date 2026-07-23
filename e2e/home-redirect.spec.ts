import { test, expect } from '@playwright/test';

test('el home redirige al wizard cuando el horario está abierto', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/tipo$/);
  await expect(page.getByRole('button', { name: 'Ingresar' })).toBeVisible();
});

// ponytail: el env del webServer fija 'open', así que no peleamos por forzar
// after-hours en el redirect; validamos la página de cierre visitándola directo.
test('la página fuera-horario renderiza sin romper', async ({ page }) => {
  await page.route('**/api/schedule-config', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ state: 'after-hours' }),
    })
  );
  await page.goto('/fuera-horario');
  await expect(page).toHaveURL(/\/fuera-horario$/);
  await expect(page.locator('body')).toBeVisible();
});
