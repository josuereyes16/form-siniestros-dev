// tests/nueva-solicitud/P5HU_28454.spec.js
// HU 28454 - 1.4.1 Selección de evento y cobertura (Nueva solicitud)
import { test, expect } from '@playwright/test';
import { abrirPaso1YSeleccionar } from '../helpers/navegacion.js';

const DATOS = {
  poliza: '100000010050',
  oficina: 'MULTINACIONALES',
  ramo: '012',
  nombreAsegurado: 'ANTONIO',
  apellidoAsegurado: 'REYES',
  codigoPostal: '15200',
  monto: '16000',
  nombreContacto: 'MICHELL',
  apellidoContacto: 'VASQUEZ',
  correo: 'Formulario-sinietros@mailinator.com',
  telefono: '3223223222',
};

const TEXTOS = {
  paso: 'Paso 5 · ¿Qué ocurrió?',
  titulo: '¿Qué tipo de siniestro quieres reportar?',
  mensaje:
    'Primero dinos qué pasó y luego marca las coberturas que quieres reportar. Con eso preparamos los documentos exactos que vas a necesitar — ni más, ni menos.',
  seccionEventos: '¿Qué tipo de evento ocurrió?',
  seccionCoberturas: '¿Qué coberturas quieres reportar?',
  mensajeCoberturas: 'Puedes elegir más de una. Los documentos de todas las coberturas se juntan en una sola lista.',
  modalTitulo: '¿Quieres reiniciar tu solicitud?',
  modalMensaje:
    'Al reiniciar, perderás la información que has ingresado hasta ahora y volverás al inicio del trámite. Esta acción no se puede deshacer.',
};

// Descripciones de la HU (CA03). Los eventos de la póliza están mockeados: siempre responde Natural, Enfermedad y Accidente
const EVENTOS_HU = {
  NATURAL: 'Fallecimiento o evento por causa natural.',
  'CÁNCER': 'Diagnóstico de cáncer cubierto por tu póliza.',
  ENFERMEDAD: 'Enfermedad o padecimiento cubierto.',
  DESEMPLEO: 'Pérdida involuntaria del empleo.',
  ACCIDENTE: 'Evento a consecuencia de un accidente.',
};
const EVENTOS_POLIZA = ['NATURAL', 'ENFERMEDAD', 'ACCIDENTE'];

// Matriz evento-cobertura (CA07), confirmada con el adjunto de la HU: los tres eventos muestran las mismas 5 coberturas
const COBERTURAS = {
  'Fallecimiento': 'Fallecimiento del asegurado por causa natural o enfermedad.',
  'Invalidez total y permanente': 'Pérdida permanente de la capacidad del asegurado para trabajar.',
  'Pérdidas orgánicas': 'Pérdida de miembros u órganos a consecuencia de un accidente o enfermedad.',
  'Enfermedades graves': 'Diagnóstico de una enfermedad cubierta por tu póliza.',
  'Muerte accidental colectivo': 'Fallecimiento accidental bajo modalidad colectiva.',
};
const MATRIZ_EVENTO_COBERTURA = Object.fromEntries(EVENTOS_POLIZA.map((e) => [e, Object.keys(COBERTURAS)]));

// Algunos textos de la app traen los acentos descompuestos (NFD): se comparan normalizados a NFC
const anotarEventosMockeados = () =>
  test.info().annotations.push({
    type: 'Eventos mockeados',
    description: `El servicio de eventos está mockeado y siempre responde ${EVENTOS_POLIZA.join(', ')}. CÁNCER y DESEMPLEO no se pueden validar hasta que se conecte el servicio real.`,
  });

const esperarTexto = (locator, texto) =>
  expect.poll(() => locator.evaluate((el) => el.textContent.normalize('NFC').replace(/\s+/g, ' ').trim()))
    .toBe(texto);

const eventos = (page) => page.getByRole('radiogroup', { name: 'Tipo de evento' }).getByRole('radio');
const evento = (page, nombre) => page.getByRole('radio', { name: new RegExp(`^${nombre}\\b`) });
const coberturas = (page) => page.getByRole('group', { name: 'Coberturas a reportar' }).getByRole('checkbox');
const cobertura = (page, nombre) =>
  page.getByRole('checkbox', { name: `${nombre} ${COBERTURAS[nombre]}`, exact: true });
const btnContinuar = (page) => page.getByRole('button', { name: 'Continuar' });
const btnAtras = (page) => page.getByRole('button', { name: 'Atrás' });

const estilo = (locator) =>
  locator.evaluate((el) => {
    const s = getComputedStyle(el);
    return { borde: `${s.borderColor}|${s.borderWidth}|${s.boxShadow}|${s.outline}`, fondo: s.backgroundColor, boton: `${s.backgroundColor}|${s.color}|${s.opacity}|${s.cursor}` };
  });

async function seleccionarPrimeraFechaDisponible(page) {
  await page.getByRole('button', { name: 'Seleccionar fecha' }).click();
  for (let i = 0; i < 36; i++) {
    const dia = page.locator('button:not([disabled])').filter({ hasText: /^\d{1,2}$/ }).first();
    if (await dia.count()) return dia.click();
    await page.getByRole('button', { name: 'Anterior' }).click();
  }
  throw new Error('No se encontró ningún día habilitado en el calendario.');
}

/** Completa los Pasos 1 a 4 de Nueva solicitud y llega al Paso 5 - ¿Qué ocurrió? */
async function irAlPaso5(page) {
  await abrirPaso1YSeleccionar(page, 'nuevaSolicitud');
  await btnContinuar(page).click();

  await page.getByRole('textbox', { name: 'Número de póliza' }).fill(DATOS.poliza);
  await page.getByRole('combobox', { name: 'Oficina *' }).click();
  await page.getByRole('listbox', { name: 'Seleccione una opción' }).getByText(DATOS.oficina).click();
  await page.getByRole('combobox', { name: 'Ramo *' }).click();
  await page.getByRole('option', { name: DATOS.ramo }).click();
  await page.getByRole('button', { name: 'Validar' }).click();
  await seleccionarPrimeraFechaDisponible(page);
  await page.getByRole('textbox', { name: 'Primer Nombre *' }).fill(DATOS.nombreAsegurado);
  await page.getByRole('textbox', { name: 'Primer Apellido *' }).fill(DATOS.apellidoAsegurado);
  await btnContinuar(page).click();

  await seleccionarPrimeraFechaDisponible(page);
  await page.getByRole('textbox', { name: 'Código Postal *' }).fill(DATOS.codigoPostal);
  await page.getByRole('combobox', { name: 'Colonia *' }).click();
  await page.getByRole('option').first().click();
  await page.getByRole('textbox', { name: 'Monto reclamado *' }).fill(DATOS.monto);
  await btnContinuar(page).click();

  await page.getByRole('textbox', { name: 'Primer Nombre *' }).fill(DATOS.nombreContacto);
  await page.getByRole('textbox', { name: 'Primer Apellido *' }).fill(DATOS.apellidoContacto);
  await page.getByRole('textbox', { name: 'Correo electrónico *' }).fill(DATOS.correo);
  await page.getByRole('textbox', { name: 'Número de teléfono' }).fill(DATOS.telefono);
  await btnContinuar(page).click();

  await expect(page.getByText(TEXTOS.paso)).toBeVisible();
}

test.describe('HU 28454 - Nueva solicitud: selección de evento y cobertura (Paso 5)', () => {
  test.describe.configure({ timeout: 120000 });

  test.beforeEach(async ({ page }) => {
    await irAlPaso5(page);
  });

  // ===== CA01 - Presentación de la pantalla =====

  test('CA01 - Muestra el título y el mensaje del paso', async ({ page }) => {
    await esperarTexto(page.getByRole('heading', { level: 1 }), TEXTOS.titulo);
    await esperarTexto(page.getByRole('heading', { level: 1 }).locator('xpath=following-sibling::p[1]'), TEXTOS.mensaje);
  });

  // ===== CA02 / CA03 - Presentación y descripción de eventos =====

  test('CA02 - Muestra los eventos de la póliza con nombre, descripción, ícono y selección única', async ({ page }) => {
    anotarEventosMockeados();
    await expect(page.getByText(TEXTOS.seccionEventos)).toBeVisible();
    await expect(eventos(page)).toHaveCount(EVENTOS_POLIZA.length);

    for (const nombre of EVENTOS_POLIZA) {
      const tarjeta = evento(page, nombre);
      await expect(tarjeta).toBeVisible();
      await expect(tarjeta).toContainText(nombre);
      await expect(tarjeta.locator('svg, img').first()).toBeVisible();
    }
    // Controles tipo radio dentro de un mismo grupo → selección única
    await expect(page.getByRole('radiogroup', { name: 'Tipo de evento' })).toBeVisible();
  });

  test('CA02 - Los eventos mostrados pertenecen al catálogo de la HU', async ({ page }) => {
    anotarEventosMockeados();
    const nombres = (await eventos(page).allTextContents()).map((t) => t.split(/\s/)[0].trim());
    for (const nombre of nombres) expect(Object.keys(EVENTOS_HU)).toContain(nombre);
  });

  test('CA03 - Cada evento muestra la descripción definida en la HU', async ({ page }) => {
    anotarEventosMockeados();
    for (const nombre of EVENTOS_POLIZA) {
      await expect(evento(page, nombre)).toHaveAccessibleName(`${nombre} ${EVENTOS_HU[nombre]}`);
    }
  });

  // ===== CA04 / CA05 - Selección y cambio de evento =====

  test('CA04 - La tarjeta seleccionada se destaca y las demás quedan sin seleccionar', async ({ page }) => {
    const [primero, ...resto] = EVENTOS_POLIZA;
    const antes = await estilo(evento(page, primero));

    await evento(page, primero).click();
    await expect(evento(page, primero)).toBeChecked();
    for (const nombre of resto) await expect(evento(page, nombre)).not.toBeChecked();

    const despues = await estilo(evento(page, primero));
    expect(despues.borde, 'borde destacado').not.toBe(antes.borde);
    expect(despues.fondo, 'fondo resaltado').not.toBe(antes.fondo);
  });

  test('CA05 - Al cambiar de evento solo queda seleccionado el nuevo y se actualizan las coberturas', async ({ page }) => {
    for (const actual of EVENTOS_POLIZA) {
      await test.step(`Seleccionar ${actual}`, async () => {
        await evento(page, actual).click();
        await expect(evento(page, actual)).toBeChecked();
        for (const otro of EVENTOS_POLIZA.filter((e) => e !== actual)) {
          await expect(evento(page, otro)).not.toBeChecked();
        }
        await expect(coberturas(page)).toHaveCount(MATRIZ_EVENTO_COBERTURA[actual].length);
      });
    }
  });

  // ===== CA06 / CA07 / CA08 - Coberturas =====

  test('CA06 - La sección de coberturas muestra su mensaje', async ({ page }) => {
    await evento(page, 'NATURAL').click();
    await expect(page.getByText(TEXTOS.seccionCoberturas)).toBeVisible();
    await esperarTexto(page.getByRole('paragraph').filter({ hasText: 'Puedes elegir' }), TEXTOS.mensajeCoberturas);
  });

  test('CA07 - Cada evento muestra las coberturas de la matriz evento-cobertura', async ({ page }) => {
    for (const nombre of EVENTOS_POLIZA) {
      await test.step(nombre, async () => {
        await evento(page, nombre).click();
        const esperadas = MATRIZ_EVENTO_COBERTURA[nombre].map((c) => `${c} ${COBERTURAS[c]}`);
        await expect(coberturas(page)).toHaveCount(esperadas.length);
        for (const [i, nombreCobertura] of esperadas.entries()) {
          await expect(coberturas(page).nth(i)).toHaveAccessibleName(nombreCobertura);
        }
      });
    }
  });

  test('CA08 - Cada cobertura es una tarjeta con nombre, descripción, ícono y casilla múltiple', async ({ page }) => {
    await evento(page, 'NATURAL').click();
    for (const nombre of Object.keys(COBERTURAS)) {
      const tarjeta = cobertura(page, nombre);
      await expect(tarjeta).toBeVisible();
      await expect(tarjeta).toContainText(nombre);
      await expect(tarjeta).toContainText(COBERTURAS[nombre]);
      await expect(tarjeta.locator('svg, img').first()).toBeVisible();
    }
  });

  // ===== CA09 - Selección y deselección de coberturas =====

  test('CA09 - Permite seleccionar varias coberturas, se destacan y se pueden deseleccionar', async ({ page }) => {
    await evento(page, 'NATURAL').click();
    const [a, b] = Object.keys(COBERTURAS);
    const antes = await estilo(cobertura(page, a));

    await cobertura(page, a).click();
    await cobertura(page, b).click();
    await expect(cobertura(page, a)).toBeChecked();
    await expect(cobertura(page, b)).toBeChecked();

    const despues = await estilo(cobertura(page, a));
    expect(despues.borde, 'borde destacado').not.toBe(antes.borde);
    expect(despues.fondo, 'fondo resaltado').not.toBe(antes.fondo);

    await cobertura(page, a).click();
    await expect(cobertura(page, a)).not.toBeChecked();
    await expect(cobertura(page, b)).toBeChecked();
  });

  // ===== CA10 / CA11 / CA12 - Estado del botón Continuar =====

  test('CA10 - Sin evento ni cobertura Continuar está deshabilitado, se ve distinto y no avanza', async ({ page }) => {
    await expect(btnContinuar(page)).toBeDisabled();
    const deshabilitado = (await estilo(btnContinuar(page))).boton;

    await btnContinuar(page).click({ force: true });
    await expect(page.getByText(TEXTOS.paso)).toBeVisible();

    // Solo con evento tampoco avanza
    await evento(page, 'NATURAL').click();
    await expect(btnContinuar(page)).toBeDisabled();

    await cobertura(page, 'Fallecimiento').click();
    await expect(btnContinuar(page)).toBeEnabled();
    expect((await estilo(btnContinuar(page))).boton).not.toBe(deshabilitado);
  });

  test('CA11 - Con evento y una o más coberturas Continuar se habilita', async ({ page }) => {
    await evento(page, 'ACCIDENTE').click();
    await cobertura(page, 'Pérdidas orgánicas').click();
    await expect(btnContinuar(page)).toBeEnabled();
    await cobertura(page, 'Muerte accidental colectivo').click();
    await expect(btnContinuar(page)).toBeEnabled();
  });

  test('CA12 - Al desmarcar todas las coberturas Continuar vuelve a deshabilitarse', async ({ page }) => {
    await evento(page, 'NATURAL').click();
    await cobertura(page, 'Fallecimiento').click();
    await cobertura(page, 'Enfermedades graves').click();
    await expect(btnContinuar(page)).toBeEnabled();

    await cobertura(page, 'Fallecimiento').click();
    await cobertura(page, 'Enfermedades graves').click();
    await expect(btnContinuar(page)).toBeDisabled();
  });

  // ===== CA13 / CA14 - Avance, navegación y conservación =====

  test('CA13 - Continuar avanza al siguiente paso', async ({ page }) => {
    await evento(page, 'NATURAL').click();
    await cobertura(page, 'Fallecimiento').click();
    await btnContinuar(page).click();
    await expect(page.getByText(/^Paso 6 ·/)).toBeVisible({ timeout: 15000 });
  });

  test('CA14 - Muestra Atrás y Continuar en la parte inferior', async ({ page }) => {
    await expect(btnAtras(page)).toBeVisible();
    await expect(btnContinuar(page)).toBeVisible();
    const atras = await btnAtras(page).boundingBox();
    const titulo = await page.getByRole('heading', { level: 1 }).boundingBox();
    expect(atras.y).toBeGreaterThan(titulo.y);
  });

  test('CA13/CA14 - Conserva evento y coberturas al regresar y al avanzar y volver', async ({ page }) => {
    const verificarSeleccion = async () => {
      await expect(evento(page, 'ENFERMEDAD')).toBeChecked();
      await expect(cobertura(page, 'Invalidez total y permanente')).toBeChecked();
      await expect(cobertura(page, 'Enfermedades graves')).toBeChecked();
      await expect(cobertura(page, 'Fallecimiento')).not.toBeChecked();
    };

    await evento(page, 'ENFERMEDAD').click();
    await cobertura(page, 'Invalidez total y permanente').click();
    await cobertura(page, 'Enfermedades graves').click();

    await test.step('Atrás y regresar al Paso 5', async () => {
      await btnAtras(page).click();
      await expect(page.getByText(/^Paso 4 ·/)).toBeVisible();
      await btnContinuar(page).click();
      await expect(page.getByText(TEXTOS.paso)).toBeVisible();
      await verificarSeleccion();
    });

    await test.step('Avanzar al Paso 6 y volver', async () => {
      await btnContinuar(page).click();
      await expect(page.getByText(/^Paso 6 ·/)).toBeVisible({ timeout: 15000 });
      await btnAtras(page).click();
      await expect(page.getByText(TEXTOS.paso)).toBeVisible();
      await verificarSeleccion();
    });
  });

  // ===== CA15 - Confirmación de reinicio =====

  test('CA15 - Reiniciar muestra el modal y "Continuar solicitud" lo cierra sin reiniciar', async ({ page }) => {
    await evento(page, 'NATURAL').click();
    await cobertura(page, 'Fallecimiento').click();

    await page.getByRole('button', { name: 'Reiniciar' }).click();
    const modal = page.getByRole('alertdialog', { name: TEXTOS.modalTitulo });
    await expect(modal.getByText(TEXTOS.modalTitulo)).toBeVisible();
    await expect(modal.getByText(TEXTOS.modalMensaje)).toBeVisible();
    await expect(modal.getByRole('button', { name: 'Sí, reiniciar' })).toBeVisible();

    await modal.getByRole('button', { name: 'Continuar solicitud' }).click();
    await expect(modal).toBeHidden();
    await expect(page.getByText(TEXTOS.paso)).toBeVisible();
    await expect(evento(page, 'NATURAL')).toBeChecked();
    await expect(cobertura(page, 'Fallecimiento')).toBeChecked();
  });

  test('CA15 - "Sí, reiniciar" regresa al inicio del trámite', async ({ page }) => {
    await page.getByRole('button', { name: 'Reiniciar' }).click();
    await page.getByRole('alertdialog', { name: TEXTOS.modalTitulo }).getByRole('button', { name: 'Sí, reiniciar' }).click();

    await expect(page.getByText(/^Paso 1 ·/)).toBeVisible();
    await expect(page.getByRole('radio', { name: 'Nueva solicitud Es la primera' })).not.toBeChecked();
  });
});
