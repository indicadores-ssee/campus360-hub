import { test, expect } from './fixtures';

test('un estudiante completa el wizard y recibe su número de turno', async ({ wizard, page }) => {
  await wizard.goto();
  await wizard.selectEstudiante();

  await wizard.fillDatos({
    nombres: 'Juan Carlos',
    apellidos: 'Pérez Rodríguez',
    email: 'juan@ejemplo.com',
    cedula: '1101234567',
    telefono: '0991234567',
  });
  await wizard.next();

  await wizard.selectServicio('Matrícula');
  await wizard.fillDetalleYEnviar('Necesito ayuda con mi matrícula.');

  await expect(page).toHaveURL(/\/resultado/);
  await expect(page.getByText('42')).toBeVisible();
});
