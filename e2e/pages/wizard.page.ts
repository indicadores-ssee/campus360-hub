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
    await this.page.getByRole('button', { name: 'Ingresar' }).click();
    await this.page.waitForURL(/\/datos/);
  }

  async selectAspirante(): Promise<void> {
    await this.page.getByRole('button', { name: 'Comenzar' }).click();
    await this.page.waitForURL(/\/datos/);
  }

  async fillDatos(d: DatosInput): Promise<void> {
    await this.page.getByLabel('Nombres completos').fill(d.nombres);
    await this.page.getByLabel('Apellidos completos').fill(d.apellidos);
    await this.page.getByLabel('Correo electrónico').fill(d.email);
    await this.page.getByLabel('Identificación (cédula, pasaporte o RUC)').fill(d.cedula);
    await this.telefonoInput().fill(d.telefono);
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
    await this.page.getByRole('button', { name: nombre }).click();
    await this.page.waitForURL(/\/detalle/);
  }

  async fillDetalleYEnviar(texto: string): Promise<void> {
    await this.page.getByRole('textbox').first().fill(texto);
    await this.page.getByRole('button', { name: 'Enviar' }).click();
    await this.page.waitForURL(/\/resultado/);
  }
}
