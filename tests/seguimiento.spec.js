// tests/seguimiento.spec.js
import { test, expect } from '@playwright/test';

// ============================================
// 🔧 CONFIGURACIÓN: cambia el folio a consultar
// ============================================
const DATOS = {
  folio: 'SURA1788295989MX',
};
// ============================================

test.describe('Formulario de Reclamaciones - Seguimiento', () => {
  test('debe consultar el estado de un trámite existente', async ({ page }) => {

    // ===== PASO 1: Seleccionar tipo de trámite =====
    await page.goto('/solicitud-reclamaciones');
    await page.getByRole('radio', { name: 'Seguimiento trámite Consulta' }).click();
    await page.getByRole('button', { name: 'Continuar' }).click();

    // ===== PASO ÚNICO: Ingresar folio y consultar =====
    await page.getByRole('textbox', { name: 'FOLIO' }).click();
    await page.getByRole('textbox', { name: 'FOLIO' }).fill(DATOS.folio);
    await page.getByRole('button', { name: 'Consultar' }).click();

    // ===== VERIFICACIÓN: debe mostrar el avance del trámite =====
    await expect(page.getByRole('heading', { name: 'AVANCE DEL TRÁMITE' })).toBeVisible();

    // Verifica que aparezcan las 5 etapas del proceso
    await expect(page.getByText('Solicitud recibida')).toBeVisible();
    await expect(page.getByText('En revisión documental')).toBeVisible();
    await expect(page.getByText('Validación técnica')).toBeVisible();
    await expect(page.getByText('Resolución')).toBeVisible();
    await expect(page.getByText('Pago de indemnización')).toBeVisible();

    console.log(`\n🔍 Consulta exitosa para el folio: ${DATOS.folio}\n`);
  });
});