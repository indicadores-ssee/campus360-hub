import { test, expect } from '@playwright/test';

test('la app arranca con horario abierto y muestra el paso de tipo', async ({ page }) => {
  await page.goto('/tipo');
  await expect(page.getByText('¿En qué podemos ayudarte?')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Ingresar' })).toBeVisible();
});
