// tests/reconsideracion_validaciones_P2.spec.js
import { test, expect } from '@playwright/test';

test.describe('Validaciones - Reconsideración (Paso 2)', () => {

  async function irAlPaso2(page) {
    await page.goto('/solicitud-reclamaciones');
    await page.getByRole('radio', { name: 'Reconsideración Pides revisar' }).click();
    await page.getByRole('button', { name: 'Continuar' }).click();
  }

  test('ERROR Primer Nombre - vacío', async ({ page }) => {
    await irAlPaso2(page);
    await page.getByRole('textbox', { name: 'Primer Nombre *' }).click();
    await page.getByRole('textbox', { name: 'Segundo Nombre' }).click();

    await expect(page.locator('#txtPrimerNombreContactoRec-error')).toContainText('Este campo es requerido');
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  test('ERROR Primer Apellido - vacío', async ({ page }) => {
    await irAlPaso2(page);
    await page.getByRole('textbox', { name: 'Primer Apellido *' }).click();
    await page.getByRole('textbox', { name: 'Segundo Apellido' }).click();

    await expect(page.locator('#txtPrimerApellidoContactoRec-error')).toContainText('Este campo es requerido');
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  test('ERROR Correo de contacto - vacío', async ({ page }) => {
    await irAlPaso2(page);
    await page.getByRole('textbox', { name: 'Correo de contacto *' }).click();
    await page.getByRole('textbox', { name: 'Folio del trámite a' }).click();

    await expect(page.locator('#txtCorreoContactoRec-error')).toContainText('Este campo es requerido');
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  test('ERROR Folio del trámite - vacío', async ({ page }) => {
    await irAlPaso2(page);
    await page.getByRole('textbox', { name: 'Folio del trámite a' }).click();
    await page.getByRole('textbox', { name: 'Motivo de la reconsideración *' }).click();

    await expect(page.locator('#txtFolioTramiteRec-error')).toContainText('Este campo es requerido');
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  test('ERROR Motivo de la reconsideración - vacío', async ({ page }) => {
    await irAlPaso2(page);
    await page.getByRole('textbox', { name: 'Motivo de la reconsideración *' }).click();
    await page.getByRole('textbox', { name: 'Primer Nombre *' }).click();

    await expect(page.locator('#txtMotivoRec-error')).toContainText('Este campo es requerido');
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  test('ERROR Primer Nombre - caracteres inválidos', async ({ page }) => {
    await irAlPaso2(page);
    const campo = page.getByRole('textbox', { name: 'Primer Nombre *' });
    const salir = page.getByRole('textbox', { name: 'Segundo Nombre' });

    await campo.click();
    await campo.fill('1');
    await salir.click();
    await expect(page.getByText('Solo se permiten letras,')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled();

    await campo.click();
    await campo.fill('@');
    await salir.click();
    await expect(page.getByText('Solo se permiten letras,')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  test('ERROR Primer Apellido - caracteres inválidos ', async ({ page }) => {
    await irAlPaso2(page);
    const campo = page.getByRole('textbox', { name: 'Primer Apellido *' });
    const salir = page.getByRole('textbox', { name: 'Segundo Apellido' });

    await campo.click();
    await campo.fill('1');
    await salir.click();
    await expect(page.locator('#txtPrimerApellidoContactoRec-error')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled();

    await campo.click();
    await campo.fill('@');
    await salir.click();
    await expect(page.locator('#txtPrimerApellidoContactoRec-error')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  test('ERROR Segundo Nombre - caracteres inválidos', async ({ page }) => {
    await irAlPaso2(page);
    const campo = page.getByRole('textbox', { name: 'Segundo Nombre' });
    const salir = page.getByRole('textbox', { name: 'Primer Apellido *' });

    await campo.click();
    await campo.fill('1');
    await salir.click();
    await expect(page.locator('#txtSegundoNombreContactoRec-error')).toBeVisible();

    await campo.click();
    await campo.fill('@');
    await salir.click();
    await expect(page.locator('#txtSegundoNombreContactoRec-error')).toBeVisible();
  });

  test('ERROR Segundo Apellido - caracteres inválidos', async ({ page }) => {
    await irAlPaso2(page);
    const campo = page.getByRole('textbox', { name: 'Segundo Apellido' });
    const salir = page.getByRole('textbox', { name: 'Correo de contacto *' });

    await campo.click();
    await campo.fill('1');
    await salir.click();
    await expect(page.locator('#txtSegundoApellidoContactoRec-error')).toBeVisible();

    await campo.click();
    await campo.fill('@');
    await salir.click();
    await expect(page.locator('#txtSegundoApellidoContactoRec-error')).toBeVisible();
  });

  test('ERROR Correo de contacto - formato inválido', async ({ page }) => {
    await irAlPaso2(page);
    await page.getByRole('textbox', { name: 'Correo de contacto *' }).click();
    await page.getByRole('textbox', { name: 'Correo de contacto *' }).fill('d');
    await page.getByRole('textbox', { name: 'Folio del trámite a' }).click();

    await expect(page.getByText('Ingresa un correo electrónico')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  test('ERROR Folio del trámite - mínimo de caracteres', async ({ page }) => {
    await irAlPaso2(page);
    await page.getByRole('textbox', { name: 'Folio del trámite a' }).click();
    await page.getByRole('textbox', { name: 'Folio del trámite a' }).fill('d');
    await page.getByRole('textbox', { name: 'Motivo de la reconsideración *' }).click();

    await expect(page.locator('#txtFolioTramiteRec-error')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  test('ERROR Folio del trámite - formato inválido', async ({ page }) => {
    await irAlPaso2(page);
    await page.getByRole('textbox', { name: 'Folio del trámite a' }).click();
    await page.getByRole('textbox', { name: 'Folio del trámite a' }).fill('DDDd');
    await page.getByRole('textbox', { name: 'Motivo de la reconsideración *' }).click();

    await expect(page.getByText('Solo se permite el siguiente')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  test('ERROR Motivo de la reconsideración - mínimo de caracteres', async ({ page }) => {
    await irAlPaso2(page);
    await page.getByRole('textbox', { name: 'Motivo de la reconsideración *' }).click();
    await page.getByRole('textbox', { name: 'Motivo de la reconsideración *' }).fill('d');
    await page.getByRole('textbox', { name: 'Primer Nombre *' }).click();

    await expect(page.getByText('Mínimo 10 caracteres')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Continuar' })).toBeDisabled();
  });

  test('Continuar habilitado con todos los campos válidos', async ({ page }) => {
    await irAlPaso2(page);

    await page.getByRole('textbox', { name: 'Primer Nombre *' }).fill('ANTONIO');
    await page.getByRole('textbox', { name: 'Primer Apellido *' }).fill('REYES');
    await page.getByRole('textbox', { name: 'Correo de contacto *' }).fill('a.reyes@nelumbo.com.co');
    await page.getByRole('textbox', { name: 'Folio del trámite a' }).fill('SURA1234567890MX');
    await page.getByRole('textbox', { name: 'Motivo de la reconsideración *' }).fill('MOTIVO DE PRUEBA VALIDO');

    await expect(page.getByRole('button', { name: 'Continuar' })).toBeEnabled();
  });

});