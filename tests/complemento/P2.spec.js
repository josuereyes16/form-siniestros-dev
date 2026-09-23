// tests/complemento/P2.spec.js
import { test, expect } from '@playwright/test';

test.describe('Validaciones - Complemento (Paso 2)', () => {

  async function irAlPaso2(page) {
    await page.goto('/solicitud-reclamaciones');
    await page.getByRole('radio', { name: 'Complemento Vas a agregar' }).click();
    await page.getByRole('button', { name: 'Continuar' }).click();
  }

  test('ERROR Primer Nombre - vacío', async ({ page }) => {
    await irAlPaso2(page);
    await page.getByRole('textbox', { name: 'Primer Nombre *' }).click();
    await page.getByRole('textbox', { name: 'Segundo Nombre' }).click();

    await expect(page.locator('#txtPrimerNombreContactoComp-error')).toContainText('Este campo es requerido');
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  test('ERROR Primer Apellido - vacío', async ({ page }) => {
    await irAlPaso2(page);
    await page.getByRole('textbox', { name: 'Primer Apellido *' }).click();
    await page.getByRole('textbox', { name: 'Segundo Apellido' }).click();

    await expect(page.locator('#txtPrimerApellidoContactoComp-error')).toContainText('Este campo es requerido');
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  test('ERROR Correo de contacto - vacío', async ({ page }) => {
    await irAlPaso2(page);
    await page.getByRole('textbox', { name: 'Correo de contacto *' }).click();
    await page.getByRole('textbox', { name: 'Folio del trámite a' }).click();

    await expect(page.locator('#txtCorreoContactoComp-error')).toContainText('Este campo es requerido');
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  test('ERROR Folio del trámite - vacío', async ({ page }) => {
    await irAlPaso2(page);
    await page.getByRole('textbox', { name: 'Folio del trámite a' }).click();
    await page.getByRole('textbox', { name: 'Motivo del complemento *' }).click();

    await expect(page.locator('#txtFolioTramiteComp-error')).toContainText('Este campo es requerido');
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  test('ERROR Motivo del complemento - vacío', async ({ page }) => {
    await irAlPaso2(page);
    await page.getByRole('textbox', { name: 'Motivo del complemento *' }).click();
    await page.getByRole('textbox', { name: 'Primer Nombre *' }).click();

    await expect(page.locator('#txtMotivoComp-error')).toContainText('Este campo es requerido');
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  test('ERROR Primer Nombre - caracteres inválidos', async ({ page }) => {
    await irAlPaso2(page);
    const campo = page.getByRole('textbox', { name: 'Primer Nombre *' });
    const salir = page.getByRole('textbox', { name: 'Segundo Nombre' });

    await campo.click();
    await campo.fill('4');
    await salir.click();
    await expect(page.getByText('Solo se permiten letras,')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled();

    await campo.click();
    await campo.fill('@');
    await salir.click();
    await expect(page.getByText('Solo se permiten letras,')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  test('ERROR Primer Apellido - caracteres inválidos', async ({ page }) => {
    await irAlPaso2(page);
    const campo = page.getByRole('textbox', { name: 'Primer Apellido *' });
    const salir = page.getByRole('textbox', { name: 'Segundo Apellido' });

    await campo.click();
    await campo.fill('4');
    await salir.click();
    await expect(page.locator('#txtPrimerApellidoContactoComp-error')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled();

    await campo.click();
    await campo.fill('@');
    await salir.click();
    await expect(page.locator('#txtPrimerApellidoContactoComp-error')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  test('ERROR Segundo Nombre - caracteres inválidos', async ({ page }) => {
    await irAlPaso2(page);
    const campo = page.getByRole('textbox', { name: 'Segundo Nombre' });
    const salir = page.getByRole('textbox', { name: 'Primer Apellido *' });

    await campo.click();
    await campo.fill('4');
    await salir.click();
    await expect(page.locator('#txtSegundoNombreContactoComp-error')).toBeVisible();

    await campo.click();
    await campo.fill('@');
    await salir.click();
    await expect(page.locator('#txtSegundoNombreContactoComp-error')).toBeVisible();
  });

  test('ERROR Segundo Apellido - caracteres inválidos', async ({ page }) => {
    await irAlPaso2(page);
    const campo = page.getByRole('textbox', { name: 'Segundo Apellido' });
    const salir = page.getByRole('textbox', { name: 'Correo de contacto *' });

    await campo.click();
    await campo.fill('4');
    await salir.click();
    await expect(page.locator('#txtSegundoApellidoContactoComp-error')).toBeVisible();

    await campo.click();
    await campo.fill('@');
    await salir.click();
    await expect(page.locator('#txtSegundoApellidoContactoComp-error')).toBeVisible();
  });

  test('ERROR Correo de contacto - formato inválido', async ({ page }) => {
    await irAlPaso2(page);
    await page.getByRole('textbox', { name: 'Correo de contacto *' }).click();
    await page.getByRole('textbox', { name: 'Correo de contacto *' }).fill('4');
    await page.getByRole('textbox', { name: 'Folio del trámite a' }).click();

    await expect(page.getByText('Ingresa un correo electrónico')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  test('ERROR Folio del trámite - mínimo de caracteres', async ({ page }) => {
    await irAlPaso2(page);
    await page.getByRole('textbox', { name: 'Folio del trámite a' }).click();
    await page.getByRole('textbox', { name: 'Folio del trámite a' }).fill('4');
    await page.getByRole('textbox', { name: 'Motivo del complemento *' }).click();

    await expect(page.getByText('Mínimo 4 caracteres')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  test('ERROR Folio del trámite - formato inválido', async ({ page }) => {
    await irAlPaso2(page);
    await page.getByRole('textbox', { name: 'Folio del trámite a' }).click();
    await page.getByRole('textbox', { name: 'Folio del trámite a' }).fill('4444');
    await page.getByRole('textbox', { name: 'Motivo del complemento *' }).click();

    await expect(page.getByText('Solo se permite el siguiente')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  test('ERROR Motivo del complemento - mínimo de caracteres', async ({ page }) => {
    await irAlPaso2(page);
    await page.getByRole('textbox', { name: 'Motivo del complemento *' }).click();
    await page.getByRole('textbox', { name: 'Motivo del complemento *' }).fill('4');
    await page.getByRole('textbox', { name: 'Primer Nombre *' }).click();

    await expect(page.getByText('Mínimo 10 caracteres')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  test('Continuar habilitado con todos los campos válidos', async ({ page }) => {
    await irAlPaso2(page);

    await page.getByRole('textbox', { name: 'Primer Nombre *' }).fill('JUANA');
    await page.getByRole('textbox', { name: 'Primer Apellido *' }).fill('REYES');
    await page.getByRole('textbox', { name: 'Correo de contacto *' }).fill('a.reyes@nelumbo.com.co');
    await page.getByRole('textbox', { name: 'Folio del trámite a' }).fill('SURA1234567890MX');
    await page.getByRole('textbox', { name: 'Motivo del complemento *' }).fill('MOTIVO DE PRUEBA VALIDO');

    await expect(page.getByRole('button', { name: 'Continuar' })).toBeEnabled();
  });

});