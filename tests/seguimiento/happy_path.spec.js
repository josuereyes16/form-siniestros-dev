// tests/seguimiento/happy_path.spec.js
import { test, expect } from '@playwright/test';
import { abrirPaso1YSeleccionar } from '../helpers/navegacion.js';

// ============================================
// 🔧 CONFIGURACIÓN: cambia el folio a consultar
// ============================================
const DATOS = {
  folio: 'SURA1788295989MX',
};
// ============================================

test.describe('Camino feliz - Seguimiento', () => {
  test('Consultar el estado de un trámite existente', async ({ page }) => {

    // ===== PASO 1: Seleccionar tipo de trámite =====
    await abrirPaso1YSeleccionar(page, 'seguimiento');
    await page.getByRole('button', { name: 'Continuar' }).click();
    await expect(page.getByRole('heading', { name: 'Vamos al día con tu caso' })).toBeVisible();

    // ===== PASO ÚNICO: Ingresar folio y consultar =====
    const folio = page.getByRole('textbox', { name: 'FOLIO' });
    await folio.fill(DATOS.folio);
    await page.getByRole('button', { name: 'Consultar' }).click();

    // ===== VERIFICACIÓN: debe mostrar el avance del trámite =====
    await expect(page.getByRole('heading', { name: 'AVANCE DEL TRÁMITE' })).toBeVisible();
    await expect(folio).toHaveValue(DATOS.folio);

    // Verifica que aparezcan las 5 etapas del proceso, en orden
    await expect(page.locator('ol > li')).toHaveText([
      'Solicitud recibida',
      'En revisión documental',
      'Validación técnica',
      'Resolución',
      'Pago de indemnización',
    ]);

    console.log(`\n🔍 Consulta exitosa para el folio: ${DATOS.folio}\n`);
  });
});