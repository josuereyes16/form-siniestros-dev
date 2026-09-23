// tests/nueva_solicitud_validaciones_P2.spec.js
import { test, expect } from '@playwright/test';

const OFICINAS_ESPERADAS = [
  'OFICINA SILAO',
  'OFICINA CELAYA',
  'FACULTATIVO',
  'OFICINA SATELITE',
  'FORANEOS',
  'COASEGURO LIDER',
  'OFICINA AGUASCALIEN',
  'OFICINA MEXICO, D.F 52',
  'TODAS LAS OFICINAS',
  'OFICINA TIJUANA',
  'OFICINA CUERNAVACA',
  'REASEGURO TOMADO',
  'OFICINA MATAMOROS',
  'AFFINITY',
  'OFICINA GUADALAJARA',
  'OFICINA QUERETARO',
  'SUCURSALES BANCARIAS(REMESAS)',
  'OFICINA PUEBLA',
  'OFICINA LEON',
  'OFICINA AGENTE DIRECTO',
  'OFICINA HERMOSILLO',
  'COASEGURO SEGUIDOR',
  'OFICINA IRAPUATO',
  'OFICINA MEXICO, D.F. 51',
  'MULTINACIONALES',
  'OFICINA MERIDA',
  'OFICINA TOLUCA',
  'REASEGURO TOMADOR',
  'GLOBAL BUSINESS',
  'OFICINA MEXICO, D.F.',
  'OFICINA COP 15',
  'OFICINA SAN LUIS',
  'OFICINA HUNTING',
  'OFICINA MONTERREY',
];

// La app trae algunos textos con doble espacio (ej. "OFICINA MEXICO, D.F  52")
const normalizar = (texto) => texto.replace(/\s+/g, ' ').trim();
const comoRegex = (texto) =>
  new RegExp(`^\\s*${texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+')}\\s*$`);

test.describe('Validaciones - Nueva Solicitud (Paso 2)', () => {

  async function irAlPaso2(page) {
    await page.goto('/solicitud-reclamaciones');
    await page.getByRole('radio', { name: 'Nueva solicitud Es la primera' }).click();
    await page.getByRole('button', { name: 'Continuar' }).click();
  }

  test('Oficina - muestra todas las opciones esperadas', async ({ page }) => {
    await irAlPaso2(page);
    await page.getByRole('combobox', { name: 'Oficina *' }).click();

    const opciones = page.getByRole('listbox', { name: 'Seleccione una opción' }).getByRole('option');
    await expect(opciones).toHaveCount(OFICINAS_ESPERADAS.length);

    const textos = (await opciones.allTextContents()).map(normalizar);
    expect(textos.sort()).toEqual([...OFICINAS_ESPERADAS].sort());
  });

  test('Oficina - permite seleccionar cada una de las opciones', async ({ page }) => {
    test.setTimeout(300000);
    await irAlPaso2(page);
    const combo = page.getByRole('combobox', { name: 'Oficina *' });

    for (const oficina of OFICINAS_ESPERADAS) {
      await test.step(`Seleccionar ${oficina}`, async () => {
        await combo.clear();
        await combo.click();
        await page.getByRole('listbox', { name: 'Seleccione una opción' })
          .getByRole('option', { name: oficina, exact: true })
          .click();
        await expect(combo).toHaveValue(comoRegex(oficina));
      });
    }
  });

  test('Número de póliza - no permite letras ni caracteres especiales', async ({ page }) => {
    await irAlPaso2(page);
    const poliza = page.getByRole('textbox', { name: 'Número de póliza' });

    await poliza.click();
    await poliza.pressSequentially('ABCdef');
    await expect(poliza).toHaveValue('');

    await poliza.pressSequentially('@#$%&*-.');
    await expect(poliza).toHaveValue('');

    await poliza.pressSequentially('AB@12cd34');
    await expect(poliza).toHaveValue('1234');
  });

  test('Número de póliza - acepta únicamente números', async ({ page }) => {
    await irAlPaso2(page);
    const poliza = page.getByRole('textbox', { name: 'Número de póliza' });

    await poliza.click();
    await poliza.pressSequentially('100000010050');
    await expect(poliza).toHaveValue('100000010050');
  });

  test('Ramo - solo muestra la opción 012', async ({ page }) => {
    await irAlPaso2(page);
    const combo = page.getByRole('combobox', { name: 'Ramo *' });
    await combo.click();

    const opciones = page.getByRole('option');
    await expect(opciones).toHaveCount(1);
    await expect(opciones).toHaveText('012');

    await opciones.click();
    await expect(combo).toContainText('012');
  });

  test('Validar habilitado con los 3 campos válidos', async ({ page }) => {
    await irAlPaso2(page);
    const validar = page.getByRole('button', { name: 'Validar' });
    await expect(validar).toBeDisabled();

    await page.getByRole('textbox', { name: 'Número de póliza' }).fill('100000010050');

    await page.getByRole('combobox', { name: 'Oficina *' }).click();
    await page.getByRole('listbox', { name: 'Seleccione una opción' })
      .getByRole('option', { name: 'MULTINACIONALES', exact: true })
      .click();

    await page.getByRole('combobox', { name: 'Ramo *' }).click();
    await page.getByRole('option', { name: '012' }).click();

    await expect(validar).toBeEnabled();
    await validar.click();

    // Al presionar Validar la app consulta la póliza: avanza al formulario o muestra el aviso de no encontrada
    const polizaValidada = page.getByRole('button', { name: 'Seleccionar fecha' });
    const polizaNoEncontrada = page.getByRole('alert').filter({ hasText: 'No encontramos esa póliza' });
    await expect(polizaValidada.or(polizaNoEncontrada)).toBeVisible({ timeout: 10000 });
  });

});
