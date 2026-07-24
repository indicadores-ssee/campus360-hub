import { test, expect } from './fixtures';

test('datos vacíos no avanzan y muestran error', async ({ wizard, page }) => {
  await wizard.goto();
  await wizard.selectEstudiante();

  // Sin llenar nada, intentar avanzar.
  await page.getByRole('button', { name: 'Siguiente' }).click();

  // Se queda en /datos.
  await expect(page).toHaveURL(/\/datos/);
  // Aparece al menos un mensaje de error (rojo).
  await expect(page.locator('.text-red-500, [class*="text-red"]').first()).toBeVisible();
});

test('email inválido bloquea el avance', async ({ wizard, page }) => {
  await wizard.goto();
  await wizard.selectEstudiante();

  await wizard.fillDatos({
    nombres: 'Ana',
    apellidos: 'López',
    email: 'no-es-un-email',
    cedula: '1101234567',
    telefono: '0991234567',
  });
  await page.getByRole('button', { name: 'Siguiente' }).click();

  await expect(page).toHaveURL(/\/datos/);
});
