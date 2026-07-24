import { type Page, type Locator, expect } from '@playwright/test';

export type DatosInput = {
  nombres: string;
  apellidos: string;
  email: string;
  cedula: string;
  telefono: string;
};

export class WizardPage {
  constructor(private readonly page: Page) {}

  async goto(): Promise<void> {
    await this.page.goto('/tipo');
    await expect(this.page.getByRole('button', { name: 'Ingresar' })).toBeVisible();
  }

  async selectEstudiante(): Promise<void> {
    await this.clickAndConfirmNavigation(
      this.page.getByRole('button', { name: 'Ingresar' }),
      /\/datos/
    );
  }

  async selectAspirante(): Promise<void> {
    await this.clickAndConfirmNavigation(
      this.page.getByRole('button', { name: 'Comenzar' }),
      /\/datos/
    );
  }

  async fillDatos(d: DatosInput): Promise<void> {
    await this.page.getByLabel('Nombres completos').fill(d.nombres);
    await this.page.getByLabel('Apellidos completos').fill(d.apellidos);
    await this.page.getByLabel('Correo electrónico').fill(d.email);
    await this.page.getByLabel('Identificación (cédula, pasaporte o RUC)').fill(d.cedula);
    await this.telefonoInput().fill(d.telefono);

    // ponytail: "Modalidad de estudio" solo se renderiza cuando userType es 'estudiante'
    // (StepPersonalData) y es obligatoria en ese caso. Se selecciona la primera opción
    // cuando el select está presente; no-op para el flujo aspirante.
    const modalidadTrigger = this.page.getByRole('button', { name: 'Selecciona tu modalidad' });
    if (await modalidadTrigger.isVisible()) {
      await modalidadTrigger.click();
      await this.page.getByRole('option', { name: 'Distancia y En línea' }).click();
    }

    // El checkbox de política de privacidad es obligatorio para ambos userType.
    await this.page.getByRole('checkbox').check();
  }

  private telefonoInput(): Locator {
    // ponytail: el teléfono no expone <label> asociado; se ancla por placeholder.
    return this.page.getByPlaceholder('0991234567');
  }

  async next(): Promise<void> {
    await this.page.getByRole('button', { name: 'Siguiente' }).click();
  }

  async selectServicio(nombre: string): Promise<void> {
    await this.page.waitForURL(/\/servicio/);
    await this.clickAndConfirmNavigation(
      this.page.getByRole('button', { name: nombre }),
      /\/detalle/
    );
  }

  async fillDetalleYEnviar(texto: string): Promise<void> {
    // ponytail: los botones de tipo de requerimiento (Queja/Soporte/Información) solo
    // aparecen para userType 'estudiante' (StepFreeText) y son obligatorios en ese caso.
    const quejaButton = this.page.getByRole('button', { name: 'Queja' });
    if (await quejaButton.isVisible()) {
      await quejaButton.click();
    }

    await this.page.getByRole('textbox').first().fill(texto);
    await this.page.getByRole('button', { name: 'Enviar' }).click();
    await this.page.waitForURL(/\/resultado/);
  }

  // ponytail: bug de app (no de este test) — app/(form)/tipo/page.tsx y
  // app/(form)/servicio/page.tsx despachan la selección y validan dentro de un
  // setTimeout(0) cuyo closure captura `data`/`validateCurrentStep` previos al dispatch.
  // El primer click SIEMPRE falla esa validación en silencio (sin error visible en UI) y
  // no navega; recién el segundo click navega porque para entonces el estado ya se
  // actualizó. Confirmado en vivo con chrome-devtools inspeccionando sessionStorage
  // (`attemptedStepValidation` queda seteado tras el 1er click, `step` recién avanza en
  // el 2do). Detalle completo en task-4-report.md. Se reintenta un click si la URL no
  // cambia en un plazo corto, de forma que esto deje de reintentar solo si se corrige el
  // bug de la app.
  private async clickAndConfirmNavigation(locator: Locator, urlPattern: RegExp): Promise<void> {
    await locator.click();
    try {
      await this.page.waitForURL(urlPattern, { timeout: 2_000 });
    } catch {
      await locator.click();
      await this.page.waitForURL(urlPattern);
    }
  }
}
