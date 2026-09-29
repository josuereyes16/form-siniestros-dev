// tests/nueva-solicitud/P2HU_27931.spec.js
// HU 27931 - 1.1.1 Consulta de póliza por Oficina, Ramo y Número de póliza (Nueva solicitud)
import { test, expect } from '@playwright/test';
import { abrirPaso1YSeleccionar } from '../helpers/navegacion.js';

// Longitud permitida para el Número de póliza (ajustar aquí si cambia la regla de negocio)
const POLIZA_MIN_DIGITOS = 1; // la HU dice 3; la PM confirmó que el mínimo es 1
const POLIZA_MAX_DIGITOS = 20;

// El servicio de pólizas de DEV está mockeado: 11111111 responde activa y 222222 no activa.
// El mock nunca responde "no encontrada", así que ese caso se simula interceptando API_POLIZAS
const POLIZA_ACTIVA = process.env.POLIZA_ACTIVA || '11111111';
const POLIZA_NO_ACTIVA = process.env.POLIZA_NO_ACTIVA || '222222';
const OFICINA = { nombre: 'MULTINACIONALES', numero: '92' };
const RAMO = '012';
const API_POLIZAS = '**/api/polizas/**';

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

const TEXTOS = {
  validando: 'Validando tu póliza con SURA…',
  activa: 'Póliza encontrada y activa',
  noActivaTitulo: 'Tu póliza no está activa',
  noActivaMensaje:
    'Encontramos la póliza, pero aparece como no vigente. Puedes continuar con tu solicitud. Si necesitas ayuda, comunícate al 800 911 7692.',
  noEncontrada:
    'No encontramos esa póliza. Revisa que los datos estén completos y sin espacios, e inténtalo de nuevo.',
  caratula: 'CARÁTULA DE LA PÓLIZA',
  sello: 'Verificado por SURA',
  requerido: 'Este campo es requerido (*)',
};

// Respuesta del servicio de pólizas (misma forma que devuelve DEV)
const respuestaPoliza = (numero, estatus) => ({
  data: {
    numero,
    productoId: RAMO,
    producto: 'VIDA GRUPO',
    ramo: RAMO,
    ramoNombre: 'Vida Grupo',
    tipo: 'VIDA GRUPO',
    oficina: `${OFICINA.numero} — OFICINA ${OFICINA.numero}`,
    contratante: 'NICOLAS JOSE',
    vigenciaIni: '2025-01-01',
    vigenciaFin: '2027-12-31',
    esDeudor: false,
    esDependiente: true,
    contratantePM: null,
    estatus,
  },
});

// La app trae algunos textos con doble espacio (ej. "OFICINA MEXICO, D.F  52")
const normalizar = (texto) => texto.replace(/\s+/g, ' ').trim();
const comoRegex = (texto) =>
  new RegExp(`^\\s*${texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/ /g, '\\s+')}\\s*$`);

test.describe('HU 27931 - Nueva solicitud: consulta de póliza (Paso 2)', () => {
  const campoPoliza = (page) => page.getByRole('textbox', { name: 'Número de póliza' });
  const comboOficina = (page) => page.getByRole('combobox', { name: 'Oficina *' });
  const comboRamo = (page) => page.getByRole('combobox', { name: 'Ramo *' });
  const btnValidar = (page) => page.getByRole('button', { name: 'Validar' });
  const btnContinuar = (page) => page.getByRole('button', { name: 'Continuar' });
  const caratula = (page) => page.getByText(TEXTOS.caratula);

  async function irAlPaso2(page) {
    await abrirPaso1YSeleccionar(page, 'nuevaSolicitud');
    await btnContinuar(page).click();
    await expect(page.getByText('PASO 2 · IDENTIFICACIÓN')).toBeVisible();
  }

  async function seleccionarOficina(page, oficina = OFICINA.nombre) {
    await comboOficina(page).click();
    await page.getByRole('listbox', { name: 'Seleccione una opción' })
      .getByRole('option', { name: oficina, exact: true })
      .click();
  }

  async function seleccionarRamo(page) {
    await comboRamo(page).click();
    await page.getByRole('option', { name: RAMO }).click();
  }

  async function llenarPoliza(page, poliza = POLIZA_ACTIVA) {
    await campoPoliza(page).fill(poliza);
    await seleccionarOficina(page);
    await seleccionarRamo(page);
  }

  /** Intercepta el servicio de pólizas: `estatus` = 'activa' | 'noActiva' | null (no encontrada). */
  async function simularPoliza(page, estatus, retrasoMs = 0) {
    await page.unroute(API_POLIZAS);
    await page.route(API_POLIZAS, async (route) => {
      if (retrasoMs) await new Promise((r) => setTimeout(r, retrasoMs));
      const numero = new URL(route.request().url()).pathname.split('/').pop();
      if (estatus === null) return route.fulfill({ status: 404, json: { error: 'Not found' } });
      return route.fulfill({ json: respuestaPoliza(numero, estatus) });
    });
  }

  async function validar(page) {
    const respuesta = page.waitForResponse((r) => r.url().includes('/api/polizas/'));
    await btnValidar(page).click();
    return (await respuesta).request();
  }

  async function esperarCaratula(page, contratante = 'NICOLAS JOSE') {
    await expect(caratula(page)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(TEXTOS.sello)).toHaveCount(4);
    await expect(page.getByText('NÚMERO DE OFICINA')).toBeVisible();
    await expect(page.getByText('VIDA GRUPO', { exact: true })).toBeVisible();
    await expect(page.getByText(`Vida Grupo · ${RAMO}`)).toBeVisible();
    await expect(page.getByText(contratante, { exact: true })).toBeVisible();
  }

  // ===== CA01 - Presentación de datos de póliza =====

  test('CA01 - Póliza, Oficina y Ramo se muestran como obligatorios', async ({ page }) => {
    await irAlPaso2(page);
    await expect(campoPoliza(page)).toBeVisible();
    await expect(comboOficina(page)).toBeVisible();
    await expect(comboRamo(page)).toBeVisible();

    // Falta cualquiera de los tres → Validar deshabilitado
    await seleccionarOficina(page);
    await seleccionarRamo(page);
    await expect(btnValidar(page)).toBeDisabled();
  });

  test('CA01 - Número de póliza no permite letras ni caracteres especiales', async ({ page }) => {
    await irAlPaso2(page);
    const poliza = campoPoliza(page);

    await poliza.click();
    await poliza.pressSequentially('ABCdef');
    await expect(poliza).toHaveValue('');

    await poliza.pressSequentially('@#$%&*-.');
    await expect(poliza).toHaveValue('');

    await poliza.pressSequentially('AB@12cd34');
    await expect(poliza).toHaveValue('1234');
  });

  test(`CA01 - Número de póliza acepta máximo ${POLIZA_MAX_DIGITOS} dígitos`, async ({ page }) => {
    await irAlPaso2(page);
    const valorMaximo = '1'.repeat(POLIZA_MAX_DIGITOS);

    await campoPoliza(page).click();
    await campoPoliza(page).pressSequentially(valorMaximo + '999');
    await expect(campoPoliza(page)).toHaveValue(valorMaximo);
  });

  test(`CA01 - Número de póliza requiere mínimo ${POLIZA_MIN_DIGITOS} dígitos para habilitar Validar`, async ({ page }) => {
    await irAlPaso2(page);
    await seleccionarOficina(page);
    await seleccionarRamo(page);

    await campoPoliza(page).fill('1'.repeat(POLIZA_MIN_DIGITOS - 1));
    await expect(btnValidar(page)).toBeDisabled();

    await campoPoliza(page).fill('1'.repeat(POLIZA_MIN_DIGITOS));
    await expect(btnValidar(page)).toBeEnabled();
  });

  test('CA01 - No considera los espacios antes o después del número', async ({ page }) => {
    await irAlPaso2(page);
    await llenarPoliza(page, `   ${POLIZA_ACTIVA}   `);
    await expect(campoPoliza(page)).toHaveValue(POLIZA_ACTIVA);

    const peticion = await validar(page);
    expect(new URL(peticion.url()).pathname).toMatch(new RegExp(`/api/polizas/${POLIZA_ACTIVA}$`));
    await expect(page.getByText(TEXTOS.activa)).toBeVisible();
  });

  // ===== CA02 - Selección de Ramo =====

  test('CA02 - Ramo muestra únicamente la opción 012', async ({ page }) => {
    await irAlPaso2(page);
    await comboRamo(page).click();

    const opciones = page.getByRole('option');
    await expect(opciones).toHaveCount(1);
    await expect(opciones).toHaveText(RAMO);

    await opciones.click();
    await expect(comboRamo(page)).toContainText(RAMO);
  });

  test('CA02 - Sin Ramo seleccionado el formulario queda incompleto', async ({ page }) => {
    await irAlPaso2(page);
    await campoPoliza(page).fill(POLIZA_ACTIVA);
    await seleccionarOficina(page);
    await expect(btnValidar(page)).toBeDisabled();
  });

  // ===== CA03 - Selección de Oficina =====

  test('CA03 - Oficina muestra todas las opciones del catálogo', async ({ page }) => {
    await irAlPaso2(page);
    await comboOficina(page).click();

    const opciones = page.getByRole('listbox', { name: 'Seleccione una opción' }).getByRole('option');
    await expect(opciones).toHaveCount(OFICINAS_ESPERADAS.length);

    const textos = (await opciones.allTextContents()).map(normalizar);
    expect(textos.sort()).toEqual([...OFICINAS_ESPERADAS].sort());
  });

  test('CA03 - Oficina permite seleccionar cada una de las opciones', async ({ page }) => {
    test.setTimeout(300000);
    await irAlPaso2(page);
    const combo = comboOficina(page);

    for (const oficina of OFICINAS_ESPERADAS) {
      await test.step(`Seleccionar ${oficina}`, async () => {
        await combo.clear();
        await seleccionarOficina(page, oficina);
        await expect(combo).toHaveValue(comoRegex(oficina));
      });
    }
  });

  test('CA03 - Sin Oficina seleccionada el formulario queda incompleto', async ({ page }) => {
    await irAlPaso2(page);
    await campoPoliza(page).fill(POLIZA_ACTIVA);
    await seleccionarRamo(page);
    await expect(btnValidar(page)).toBeDisabled();
  });

  // ===== CA04 - Estado inicial del botón Validar =====

  test('CA04 - Validar deshabilitado, con estilo distinto y sin acción hasta completar los 3 campos', async ({ page }) => {
    await irAlPaso2(page);
    let consultas = 0;
    page.on('request', (r) => { if (r.url().includes('/api/polizas/')) consultas++; });

    await expect(btnValidar(page)).toBeDisabled();
    const estiloDeshabilitado = await btnValidar(page).evaluate((b) => {
      const s = getComputedStyle(b);
      return `${s.backgroundColor}|${s.color}|${s.opacity}|${s.cursor}`;
    });

    await btnValidar(page).click({ force: true });
    expect(consultas).toBe(0);

    await llenarPoliza(page);
    await expect(btnValidar(page)).toBeEnabled();
    const estiloHabilitado = await btnValidar(page).evaluate((b) => {
      const s = getComputedStyle(b);
      return `${s.backgroundColor}|${s.color}|${s.opacity}|${s.cursor}`;
    });
    expect(estiloHabilitado).not.toBe(estiloDeshabilitado);
  });

  // ===== CA05 - Inicio de la validación =====

  test('CA05 - Durante la validación muestra el mensaje y bloquea botones y campos', async ({ page }) => {
    await irAlPaso2(page);
    await simularPoliza(page, 'activa', 4000);
    let consultas = 0;
    page.on('request', (r) => { if (r.url().includes('/api/polizas/')) consultas++; });

    await llenarPoliza(page);
    await btnValidar(page).click();

    await expect(page.getByText(TEXTOS.validando)).toBeVisible();
    await expect(btnValidar(page)).toBeDisabled();
    await expect(btnContinuar(page)).toBeDisabled();
    await expect(campoPoliza(page)).toBeDisabled();
    await expect(comboOficina(page)).toBeDisabled();
    await expect(comboRamo(page)).toBeDisabled();

    // No se puede iniciar una segunda validación
    await btnValidar(page).click({ force: true });

    await expect(page.getByText(TEXTOS.activa)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(TEXTOS.validando)).toBeHidden();
    expect(consultas).toBe(1);
  });

  test('CA05 - La validación no se dispara al perder el foco de los campos', async ({ page }) => {
    await irAlPaso2(page);
    let consultas = 0;
    page.on('request', (r) => { if (r.url().includes('/api/polizas/')) consultas++; });

    await llenarPoliza(page);
    await campoPoliza(page).focus();
    await campoPoliza(page).blur();
    await comboOficina(page).focus();
    await comboOficina(page).blur();
    await page.waitForTimeout(2000);

    expect(consultas).toBe(0);
    await expect(page.getByText(TEXTOS.validando)).toBeHidden();
    await expect(caratula(page)).toBeHidden();
  });

  // ===== CA06 - Póliza encontrada y activa =====

  test('CA06 - Póliza activa muestra el mensaje y la carátula verificada', async ({ page }) => {
    await irAlPaso2(page);
    await llenarPoliza(page);

    const peticion = await validar(page);
    const url = new URL(peticion.url());
    expect(url.pathname).toMatch(new RegExp(`/api/polizas/${POLIZA_ACTIVA}$`));
    expect(url.searchParams.get('officeNo')).toBe(OFICINA.numero);
    expect(url.searchParams.get('branchId')).toBe(RAMO);

    await expect(page.getByText(TEXTOS.activa)).toBeVisible();
    await esperarCaratula(page);

    // Carátula en solo lectura: sus datos no son campos editables
    for (const campo of [/tipo de póliza/i, /número de oficina/i, /^ramo$/i, /contratante/i]) {
      await expect(page.getByRole('textbox', { name: campo })).toHaveCount(0);
    }
  });

  test('CA06 - La oficina de la carátula corresponde a la oficina capturada', async ({ page }) => {
    await irAlPaso2(page);
    await llenarPoliza(page);
    await validar(page);
    await esperarCaratula(page);

    await expect(page.getByText(OFICINA.numero, { exact: true })).toBeVisible();
  });

  // ===== CA07 - Póliza no activa (servicio real de DEV) =====

  test('CA07 - Póliza no activa muestra el aviso y permite continuar', async ({ page }) => {
    await irAlPaso2(page);
    await llenarPoliza(page, POLIZA_NO_ACTIVA);
    await validar(page);

    await expect(page.getByText(TEXTOS.noActivaTitulo)).toBeVisible({ timeout: 15000 });
    await expect(page.getByText(TEXTOS.noActivaMensaje)).toBeVisible();
    await esperarCaratula(page);
    await expect(btnContinuar(page)).toBeEnabled();
  });

  test('CA07 - Con póliza no activa se puede modificar la consulta e intentar nuevamente', async ({ page }) => {
    await irAlPaso2(page);
    await llenarPoliza(page, POLIZA_NO_ACTIVA);
    await validar(page);
    await expect(page.getByText(TEXTOS.noActivaTitulo)).toBeVisible({ timeout: 15000 });

    await expect(campoPoliza(page)).toBeEditable();
    await expect(comboOficina(page)).toBeEnabled();
    await expect(comboRamo(page)).toBeEnabled();

    await campoPoliza(page).fill(POLIZA_ACTIVA);
    await expect(btnValidar(page)).toBeEnabled();
    await validar(page);
    await expect(page.getByText(TEXTOS.activa)).toBeVisible();
    await expect(page.getByText(TEXTOS.noActivaTitulo)).toBeHidden();
  });

  // ===== CA08 - Póliza no encontrada =====

  test('CA08 - Póliza no encontrada muestra el mensaje y mantiene Continuar deshabilitado', async ({ page }) => {
    await irAlPaso2(page);
    await simularPoliza(page, null);
    await llenarPoliza(page, '999');
    await validar(page);

    await expect(page.getByText(TEXTOS.noEncontrada)).toBeVisible();
    await expect(caratula(page)).toBeHidden();
    await expect(btnContinuar(page)).toBeDisabled();
  });

  test('CA08 - No muestra la carátula de una póliza consultada anteriormente', async ({ page }) => {
    await irAlPaso2(page);
    await llenarPoliza(page);
    await validar(page);
    await esperarCaratula(page);

    await simularPoliza(page, null);
    await campoPoliza(page).fill('999');
    await validar(page);

    await expect(page.getByText(TEXTOS.noEncontrada)).toBeVisible();
    await expect(page.getByText(TEXTOS.activa)).toBeHidden();
    await expect(caratula(page)).toBeHidden();
    await expect(page.getByText('NICOLAS JOSE', { exact: true })).toBeHidden();
    await expect(btnContinuar(page)).toBeDisabled();
  });

  test('CA08 - Tras no encontrar la póliza se puede corregir y validar nuevamente', async ({ page }) => {
    await irAlPaso2(page);
    await simularPoliza(page, null);
    await llenarPoliza(page, '999');
    await validar(page);
    await expect(page.getByText(TEXTOS.noEncontrada)).toBeVisible();

    await page.unroute(API_POLIZAS);
    await campoPoliza(page).fill(POLIZA_ACTIVA);
    await seleccionarOficina(page);
    await expect(btnValidar(page)).toBeEnabled();
    await validar(page);

    await expect(page.getByText(TEXTOS.noEncontrada)).toBeHidden();
    await esperarCaratula(page);
  });

  // ===== CA09 - Habilitación del botón Continuar =====

  test('CA09 - Con datos del asegurado vacíos no avanza y muestra el mensaje bajo cada campo', async ({ page }) => {
    await irAlPaso2(page);
    await llenarPoliza(page);
    await validar(page);
    await esperarCaratula(page);

    await btnContinuar(page).click();

    for (const id of ['txtPrimerNombreAsegurado', 'txtPrimerApellidoAsegurado']) {
      await expect(page.locator(`#${id}-error`)).toHaveText(TEXTOS.requerido);
    }
    await expect(page.getByText(TEXTOS.requerido)).toHaveCount(3); // + Fecha de nacimiento
    await expect(page.getByText('PASO 2 · IDENTIFICACIÓN')).toBeVisible();
  });

  // ===== CA10 - Estado inicial de Continuar =====

  test('CA10 - Continuar deshabilitado al cargar el paso y mientras no se valide la póliza', async ({ page }) => {
    await irAlPaso2(page);
    await expect(btnContinuar(page)).toBeDisabled();

    await llenarPoliza(page);
    await expect(btnContinuar(page)).toBeDisabled();
  });

});
