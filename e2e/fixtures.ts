import { test as base, expect } from '@playwright/test';

import { WizardPage } from './pages/wizard.page';

export const test = base.extend<{ wizard: WizardPage }>({
  wizard: async ({ page }, use) => {
    // Stub del turno: evita Redis/QStash/Power Automate/Zoom reales.
    await page.route('**/api/turno**', async (route) => {
      if (route.request().method() !== 'PUT') return route.continue();
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          turnoNumber: 42,
          zoomLink: 'https://zoom.us/j/test',
          webZoomLink: 'https://zoom.us/wc/test',
          requestId: 'e2e-fixture',
        }),
      });
    });

    // ponytail: /api/categorias depende de Redis/Power Automate (MICROSOFT_CATEGORIAS_FLOW_URL),
    // ninguno configurado en dev local sin .env* -> devuelve { categories: [] } y /servicio
    // queda sin botones que clickear. Stub autorizado por el coordinador (ver task-3-report.md)
    // para desbloquear la selección de servicio en Tasks 4/5. Una sola categoría alcanza para
    // ambas audiencias porque el hook no filtra por studentType en el cliente.
    await page.route('**/api/categorias**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          categories: [
            {
              id: 'matricula',
              title: 'Matrícula',
              iconLabel: 'file-text',
              studentType: 'continuo',
            },
          ],
        }),
      });
    });

    await use(new WizardPage(page));
  },
});

export { expect };
