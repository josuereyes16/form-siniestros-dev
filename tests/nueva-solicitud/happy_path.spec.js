// tests/nueva-solicitud/happy_path.spec.js
import { test, expect } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';

const DATOS = {
  numeroPoliza: '100000010050',
  oficina: 'MULTINACIONALES',
  ramo: '012',
  primerNombreAsegurado: 'ANTONIO',
  primerApellidoAsegurado: 'REYES',
  codigoPostal: '15200',
  montoReclamado: '16000',
  primerNombreContacto: 'MICHELL',
  primerApellidoContacto: 'VASQUEZ',
  correoContacto: 'Formulario-sinietros@mailinator.com',
  buzonMailinator: 'formulario-sinietros',
  telefonoCelular: '3223223222',
  domicilio: 'CIRCUNVALAR',
  numeroIdentificacion: '1234567',
  archivoIdentificacion: path.resolve(__dirname, '../../data/PRUEBA.pdf'),
};

async function obtenerCodigoOTP(context, buzon) {
  await new Promise((resolve) => setTimeout(resolve, 8000));

  const otpPage = await context.newPage();
  const urlBandeja = `https://www.mailinator.com/v4/public/inboxes.jsp?to=${buzon}`;

  let codigo = null;
  const maxIntentos = 15;

  for (let intento = 1; intento <= maxIntentos; intento++) {
    await otpPage.goto(urlBandeja, { waitUntil: 'domcontentloaded' });
    await otpPage.waitForTimeout(2500);

    const primeraFila = otpPage.locator('[id^="row_"]').first();

    if (await primeraFila.count() > 0) {
      await primeraFila.click();
      await otpPage.waitForTimeout(1500);

      const frame = otpPage.frameLocator('iframe[name="html_msg_body"]');
      const textoCorreo = await frame.locator('body').textContent().catch(() => null);

      if (textoCorreo) {
        const match = textoCorreo.match(/Código:\s*(\d{6})/);
        if (match) {
          codigo = match[1];
          break;
        }
      }
    }

    await otpPage.waitForTimeout(2000);
  }

  await otpPage.close();

  if (!codigo) {
    throw new Error('No se pudo obtener el código OTP desde Mailinator después de varios intentos.');
  }

  return codigo;
}

async function seleccionarPrimeraFechaDisponible(page) {
  const maxRetrocesos = 36;

  for (let i = 0; i < maxRetrocesos; i++) {
    const diaHabilitado = page.locator('button:not([disabled])').filter({ hasText: /^\d{1,2}$/ }).first();

    if (await diaHabilitado.count() > 0) {
      await diaHabilitado.click();
      return;
    }

    await page.getByRole('button', { name: 'Anterior' }).click();
    await page.waitForTimeout(300);
  }

  throw new Error('No se encontró ningún día habilitado en el calendario después de retroceder 36 meses.');
}

test.describe('Nueva Solicitud - Happy Path', () => {
  test('debe completar y enviar una nueva solicitud de siniestro', async ({ page, context }) => {
    test.setTimeout(300000);

    await page.goto('/solicitud-reclamaciones');
    await page.getByRole('radio', { name: 'Nueva solicitud Es la primera' }).click();
    await page.getByRole('button', { name: 'Continuar' }).click();

    await page.getByRole('textbox', { name: 'Número de póliza' }).click();
    await page.getByRole('textbox', { name: 'Número de póliza' }).fill(DATOS.numeroPoliza);

    await page.getByRole('combobox', { name: 'Oficina *' }).click();
    await page.getByRole('listbox', { name: 'Seleccione una opción' }).getByText(DATOS.oficina).click();

    await page.getByRole('combobox', { name: 'Ramo *' }).click();
    await page.getByRole('option', { name: DATOS.ramo }).click();

    await page.getByRole('button', { name: 'Validar' }).click();
    await page.waitForTimeout(1000);

    await page.getByRole('button', { name: 'Seleccionar fecha' }).click();
    await seleccionarPrimeraFechaDisponible(page);

    await page.getByRole('textbox', { name: 'Primer Nombre *' }).click();
    await page.getByRole('textbox', { name: 'Primer Nombre *' }).fill(DATOS.primerNombreAsegurado);

    await page.getByRole('textbox', { name: 'Primer Apellido *' }).click();
    await page.getByRole('textbox', { name: 'Primer Apellido *' }).fill(DATOS.primerApellidoAsegurado);

    await page.getByRole('button', { name: 'Continuar' }).click();

    await page.getByRole('button', { name: 'Seleccionar fecha' }).click();
    await seleccionarPrimeraFechaDisponible(page);

    await page.getByRole('textbox', { name: 'Código Postal *' }).click();
    await page.getByRole('textbox', { name: 'Código Postal *' }).fill(DATOS.codigoPostal);
    await page.waitForTimeout(1000);

    await page.getByRole('combobox', { name: 'Colonia *' }).click();
    await page.getByRole('option').first().click();

    await page.getByRole('textbox', { name: 'Monto reclamado *' }).click();
    await page.getByRole('textbox', { name: 'Monto reclamado *' }).fill(DATOS.montoReclamado);

    await page.getByRole('button', { name: 'Continuar' }).click();

    await page.getByRole('textbox', { name: 'Primer Nombre *' }).click();
    await page.getByRole('textbox', { name: 'Primer Nombre *' }).fill(DATOS.primerNombreContacto);

    await page.getByRole('textbox', { name: 'Primer Apellido *' }).click();
    await page.getByRole('textbox', { name: 'Primer Apellido *' }).fill(DATOS.primerApellidoContacto);

    await page.getByRole('textbox', { name: 'Correo electrónico *' }).click();
    await page.getByRole('textbox', { name: 'Correo electrónico *' }).fill(DATOS.correoContacto);

    await page.getByRole('textbox', { name: 'Número de teléfono' }).click();
    await page.getByRole('textbox', { name: 'Número de teléfono' }).fill(DATOS.telefonoCelular);

    await page.getByRole('button', { name: 'Continuar' }).click();

    await page.getByRole('radio', { name: 'NATURAL Fallecimiento o' }).click();
    await page.getByRole('checkbox', { name: 'Fallecimiento Fallecimiento' }).click();
    await page.getByRole('checkbox', { name: 'Invalidez total y permanente' }).click();
    await page.getByRole('checkbox', { name: 'Pérdidas orgánicas Pérdida de' }).click();

    await page.getByRole('button', { name: 'Continuar' }).click();

    console.log('\n📧 Esperando el correo con el código OTP...\n');
    const codigoOTP = await obtenerCodigoOTP(context, DATOS.buzonMailinator);
    console.log(`\n🔑 Código OTP obtenido: ${codigoOTP}\n`);

    const digitos = codigoOTP.split('');
    for (let i = 0; i < digitos.length; i++) {
      await page.getByRole('textbox', { name: `Dígito ${i + 1}` }).fill(digitos[i]);
    }

    await page.getByRole('button', { name: 'Verificar y continuar' }).click();

    await page.getByRole('switch', { name: 'Usar mis datos de contacto' }).click();

    await page.getByRole('combobox', { name: 'Nacionalidad *' }).click();
    await page.getByRole('combobox', { name: 'Nacionalidad *' }).fill('COLOM');
    await page.waitForTimeout(500);
    await page.keyboard.press('Enter');

    await page.getByRole('textbox', { name: 'Domicilio *' }).click();
    await page.getByRole('textbox', { name: 'Domicilio *' }).fill(DATOS.domicilio);

    await page.getByRole('combobox', { name: 'Tipo de identificación *' }).click();
    await page.getByRole('option', { name: 'INE / Credencial para votar' }).click();

    await page.getByRole('textbox', { name: 'Número de identificación *' }).click();
    await page.getByRole('textbox', { name: 'Número de identificación *' }).fill(DATOS.numeroIdentificacion);

    await page.waitForTimeout(1000);
    await page.getByRole('combobox', { name: 'Tipo de pago *' }).click({ force: true });
    await page.waitForTimeout(800);
    await page.getByRole('option', { name: 'Cheque' }).click({ force: true });

    await page.getByRole('button', { name: 'Finalizar edición' }).click();
    await page.getByRole('button', { name: 'Continuar' }).click();

    // ===== PASO 8: Documentos (solo "Identificación oficial" es obligatorio) =====
    await page.getByRole('button', { name: 'Cargar Identificación oficial' }).setInputFiles(DATOS.archivoIdentificacion);

    await expect(page.getByText('de 1 documento obligatorio cargado')).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: 'Continuar' }).click();

    // ===== PASO 9: Revisión y envío =====
    await page.locator('.flex.h-7.w-7.shrink-0.items-center.justify-center.rounded-lg').click();

    await page.getByRole('button', { name: 'Finalizar trámite' }).click();
    await page.getByRole('button', { name: 'Sí, finalizar trámite' }).click();

    const folioLocator = page.getByText(/SURA\d{10}MX/);
    await expect(folioLocator).toBeVisible({ timeout: 15000 });

    const folioTexto = await folioLocator.textContent();
    console.log(`\n📋 FOLIO GENERADO: ${folioTexto}\n`);

    const fecha = new Date().toLocaleString('es-CO');
    const linea = `${fecha} | Nueva Solicitud | ${folioTexto}\n`;
    const rutaHistorial = path.resolve(__dirname, '../../data/folios_generados.txt');
    fs.appendFileSync(rutaHistorial, linea);
  });
});