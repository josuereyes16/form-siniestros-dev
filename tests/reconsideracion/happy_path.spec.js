// tests/reconsideracion/happy_path.spec.js
import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

// ============================================
// 🔧 CONFIGURACIÓN: cambia estos datos según el caso a probar
// ============================================
const DATOS = {
  primerNombre: 'JUANA',
  primerApellido: 'REYES',
  correo: 'a.reyes@nelumbo.com.co',
  folioTramite: 'SURA1234567890MX',
  motivoReconsideracion: 'SOLICITO REVISIÓN DEL DICTAMEN EMITIDO',
  comentarios: 'Solicitud de reconsideración',
  archivosAdjuntos: [
    path.resolve(__dirname, '../../data/PRUEBA.png'),
    path.resolve(__dirname, '../../data/PRUEBA.pdf'),
    path.resolve(__dirname, '../../data/PRUEBA.xlsx'),
  ],
};
// ============================================

test.describe('Formulario de Reclamaciones - Reconsideración', () => {
  test('debe completar y enviar el trámite de reconsideración', async ({ page }) => {

    // ===== PASO 1: Tipo de trámite =====
    await page.goto('/solicitud-reclamaciones');
    await page.getByRole('radio', { name: 'Reconsideración Pides revisar' }).click();
    await page.getByRole('button', { name: 'Continuar' }).click();

    // ===== PASO 2: Datos de contacto y trámite =====
    await page.getByRole('textbox', { name: 'Primer Nombre *' }).click();
    await page.getByRole('textbox', { name: 'Primer Nombre *' }).fill(DATOS.primerNombre);

    await page.getByRole('textbox', { name: 'Primer Apellido *' }).click();
    await page.getByRole('textbox', { name: 'Primer Apellido *' }).fill(DATOS.primerApellido);

    await page.getByRole('textbox', { name: 'Correo de contacto *' }).click();
    await page.getByRole('textbox', { name: 'Correo de contacto *' }).fill(DATOS.correo);

    await page.getByRole('textbox', { name: 'Folio del trámite a' }).click();
    await page.getByRole('textbox', { name: 'Folio del trámite a' }).fill(DATOS.folioTramite);

    await page.getByRole('textbox', { name: 'Motivo de la reconsideración *' }).click();
    await page.getByRole('textbox', { name: 'Motivo de la reconsideración *' }).fill(DATOS.motivoReconsideracion);

    await page.getByRole('button', { name: 'Continuar' }).click();

    // ===== PASO 3: Documentos - subir uno por uno usando el interceptor de diálogo =====
    for (const archivo of DATOS.archivosAdjuntos) {
      const nombreArchivo = path.basename(archivo);

      const fileChooserPromise = page.waitForEvent('filechooser');
      await page.getByRole('button', { name: 'Seleccionar archivos' }).click();
      const fileChooser = await fileChooserPromise;

      await fileChooser.setFiles(archivo);

      await expect(page.getByText(nombreArchivo)).toBeVisible({ timeout: 10000 });
    }

    await page.getByRole('button', { name: 'Continuar' }).click();

    await page.getByRole('textbox', { name: 'Comentarios adicionales' }).click();
    await page.getByRole('textbox', { name: 'Comentarios adicionales' }).fill(DATOS.comentarios);

    // ===== Verificación "No soy un robot" =====
    await page.locator('.flex.h-7.w-7.shrink-0.items-center.justify-center.rounded-lg').click();

    // ===== Finalizar trámite =====
    await page.getByRole('button', { name: 'Finalizar trámite' }).click();
    await page.getByRole('button', { name: 'Sí, finalizar trámite' }).click();

    // ===== Verificación final: folio con formato SURA + 10 dígitos + MX =====
    const folioLocator = page.getByText(/SURA\d{10}MX/);
    await expect(folioLocator).toBeVisible();

    const folioTexto = await folioLocator.textContent();
    console.log(`\n📋 FOLIO GENERADO: ${folioTexto}\n`);

    // Guarda el folio en el mismo historial compartido
    const fecha = new Date().toLocaleString('es-CO');
    const linea = `${fecha} | Reconsideración | ${folioTexto}\n`;
    const rutaHistorial = path.resolve(__dirname, '../../data/folios_generados.txt');
    fs.appendFileSync(rutaHistorial, linea);
  });
});