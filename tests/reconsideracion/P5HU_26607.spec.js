// tests/reconsideracion/P5HU_26607.spec.js
// HU 26607 - Acuse de solicitud recibida (Reconsideración)
// Cubre el modal de confirmación del Paso 4 y la pantalla "Recibimos tu solicitud" que sigue al envío.
import { test, expect } from "@playwright/test";
import {
  ARCHIVOS_PRUEBA,
  DATOS_RECONSIDERACION,
  finalizarTramite,
  irAPaso4Reconsideracion,
  marcarNoSoyRobot,
} from "../helpers/navegacion.js";

const TEXTOS = {
  paso4: "PASO 4 · REVISIÓN",
  modalTitulo: "¿Finalizar y enviar tu reconsideración?",
  modalMensaje:
    "Revisaremos tu información y tus documentos, y te daremos seguimiento por correo. Podrás consultar el avance en cualquier momento con tu folio.",
  acuseTitulo: "Recibimos tu solicitud",
  acuseMensaje:
    "Gracias por confiar en nosotros. Si algo pasa, no pasa nada: a partir de aquí nos hacemos cargo y te mantenemos al tanto en cada paso.",
  folioEtiqueta: "TU FOLIO DE SEGUIMIENTO",
  copiado: "¡Copiado!",
  queSigue: "¿QUÉ SIGUE?",
  errorEnvio: "No pudimos finalizar tu trámite en este momento. Por favor intenta nuevamente más tarde.",
};

// Pasos de "¿Qué sigue?" (CA13-CA15)
const PASOS_QUE_SIGUE = [
  { titulo: "Te enviamos un correo", detalle: `A ${DATOS_RECONSIDERACION.correo} con tu folio y el resumen de tu caso.` },
  { titulo: "Revisamos tu información", detalle: "Nuestro equipo valida los datos y documentos. Suele tomar de 3 a 5 días hábiles." },
  { titulo: "Te avisamos del avance", detalle: "Si falta algo, te lo decimos con claridad y podrás subirlo desde tu seguimiento." },
];

// El endpoint de registro se simula: en DEV los envíos automatizados no se pueden registrar
// (la app no manda captchaToken y el reCAPTCHA v3 puntúa bajo a los navegadores automatizados).
// La respuesta imita el formato real del servicio: { data: { name: <folio>, receptionDate } }
const API_RECLAMACIONES = "**/api/reclamaciones";
const FOLIO_GENERADO = "SURA1790999999MX";
const RESPUESTA_EXITOSA = { data: { name: FOLIO_GENERADO, receptionDate: new Date().toISOString() } };

const VERDE_CHECK = "rgb(0, 168, 89)";
const DOCUMENTOS = [ARCHIVOS_PRUEBA.pdf, ARCHIVOS_PRUEBA.png];

test.describe("HU 26607 - Reconsideración", () => {
  const modal = (page) => page.getByRole("alertdialog");
  const finalizar = (page) => page.getByRole("button", { name: "Finalizar trámite" });
  const siFinalizar = (page) => page.getByRole("button", { name: "Sí, finalizar trámite" });
  const tituloAcuse = (page) => page.getByRole("heading", { name: TEXTOS.acuseTitulo });
  const tarjetaFolio = (page) => page.getByText(TEXTOS.folioEtiqueta, { exact: true }).locator("xpath=../..");
  const pasoQueSigue = (page, titulo) => page.locator("ol > li").filter({ has: page.getByText(titulo, { exact: true }) });

  /**
   * Simula el endpoint de registro. Cada respuesta de `respuestas` se usa una vez, en orden;
   * devuelve los cuerpos de las peticiones recibidas.
   */
  async function simularRegistro(page, respuestas = [{ status: 200, body: RESPUESTA_EXITOSA }]) {
    const envios = [];
    await page.route(API_RECLAMACIONES, async (route) => {
      envios.push(route.request().postDataJSON());
      const { status, body = {}, demoraMs = 0 } = respuestas[Math.min(envios.length, respuestas.length) - 1];
      await new Promise((r) => setTimeout(r, demoraMs));
      await route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });
    });
    return envios;
  }

  async function abrirModalConfirmacion(page) {
    await marcarNoSoyRobot(page);
    await finalizar(page).click();
    await expect(modal(page)).toBeVisible();
  }

  test.beforeEach(async ({ page }) => {
    await irAPaso4Reconsideracion(page, DOCUMENTOS);
  });

  test.describe("Modal de confirmación", () => {
    test("CA01 - Finalizar trámite muestra un modal de confirmación antes de enviar", async ({ page }) => {
      const envios = await simularRegistro(page);
      await abrirModalConfirmacion(page);

      expect(envios).toHaveLength(0);
    });

    test("CA02 - El modal muestra el mensaje principal", async ({ page }) => {
      await abrirModalConfirmacion(page);

      await expect(modal(page).getByRole("heading", { name: TEXTOS.modalTitulo })).toBeVisible();
    });

    test("CA03 - El modal muestra el texto informativo", async ({ page }) => {
      await abrirModalConfirmacion(page);

      await expect(modal(page).getByText(TEXTOS.modalMensaje, { exact: true })).toBeVisible();
    });

    test("CA04 - El modal muestra las acciones Cancelar y Sí, finalizar trámite", async ({ page }) => {
      await abrirModalConfirmacion(page);

      await expect(modal(page).getByRole("button", { name: "Cancelar" })).toBeEnabled();
      await expect(modal(page).getByRole("button", { name: "Sí, finalizar trámite" })).toBeEnabled();
    });

    test("CA05 - Cancelar cierra el modal, permanece en la revisión y no envía", async ({ page }) => {
      const envios = await simularRegistro(page);
      await abrirModalConfirmacion(page);
      await modal(page).getByRole("button", { name: "Cancelar" }).click();

      await expect(modal(page)).toBeHidden();
      await expect(page.getByText(TEXTOS.paso4)).toBeVisible();
      await expect(finalizar(page)).toBeEnabled();
      expect(envios).toHaveLength(0);
    });

    test("CA06 - Sí, finalizar trámite envía la reconsideración con sus datos y la validación de seguridad", async ({ page }) => {
      const envios = await simularRegistro(page);
      await finalizarTramite(page);

      await expect.poll(() => envios.length).toBe(1);
      expect(envios[0]).toMatchObject({
        requestType: "Reconsideración",
        folioNumber: DATOS_RECONSIDERACION.folio,
        contactEmail: DATOS_RECONSIDERACION.correo,
        reconsiderationReason: DATOS_RECONSIDERACION.motivo,
      });
      expect(envios[0].documentUrls).toHaveLength(DOCUMENTOS.length);
      // El servicio exige el token de "No soy un robot": sin él responde 400 "captchaToken is required"
      expect(envios[0].captchaToken, "La petición no incluye captchaToken").toBeTruthy();
    });

    test("CA17 - Mientras se envía, Sí, finalizar trámite se deshabilita y no permite confirmar de nuevo", async ({ page }) => {
      const envios = await simularRegistro(page, [{ status: 200, body: RESPUESTA_EXITOSA, demoraMs: 4000 }]);
      await finalizarTramite(page);

      const enviando = modal(page).getByRole("button", { name: /Enviando/ });
      await expect(enviando).toBeVisible();
      await expect(enviando).toBeDisabled();
      await expect(modal(page).getByRole("button", { name: "Cancelar" })).toBeDisabled();
      await expect(siFinalizar(page)).toHaveCount(0);

      await expect(tituloAcuse(page)).toBeVisible({ timeout: 10000 });
      expect(envios).toHaveLength(1);
    });

    test("CA18 - Si no se registra, permanece en la revisión con la información y los documentos", async ({ page }) => {
      await simularRegistro(page, [{ status: 500 }]);
      await finalizarTramite(page);

      await expect(page.getByText(TEXTOS.errorEnvio, { exact: true })).toBeVisible();
      await expect(page.getByText(TEXTOS.paso4)).toBeVisible();
      await expect(page.getByText(DATOS_RECONSIDERACION.folio, { exact: true })).toBeVisible();
      await expect(page.getByText(DATOS_RECONSIDERACION.motivo, { exact: true })).toBeVisible();
      await expect(page.getByRole("heading", { name: `DOCUMENTOS (${DOCUMENTOS.length})` })).toBeVisible();
      await expect(tituloAcuse(page)).toBeHidden();
    });

    test("CA18 - Tras la falla el usuario puede intentar nuevamente el envío", async ({ page }) => {
      const envios = await simularRegistro(page, [{ status: 500 }, { status: 200, body: RESPUESTA_EXITOSA }]);
      await finalizarTramite(page);
      await expect(page.getByText(TEXTOS.errorEnvio, { exact: true })).toBeVisible();

      await finalizar(page).click();
      await siFinalizar(page).click();

      await expect(tituloAcuse(page)).toBeVisible();
      expect(envios).toHaveLength(2);
    });
  });

  test.describe("Pantalla de confirmación", () => {
    test.beforeEach(async ({ page, context }) => {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await simularRegistro(page);
      await finalizarTramite(page);
    });

    test("CA07 - Al registrarse la solicitud se muestra la pantalla Recibimos tu solicitud", async ({ page }) => {
      await expect(tituloAcuse(page)).toBeVisible();
      await expect(page.getByText(TEXTOS.paso4)).toBeHidden();
    });

    test("CA08 - Encabezado con marca de verificación verde", async ({ page }) => {
      await expect(tituloAcuse(page)).toBeVisible();
      const check = tituloAcuse(page).locator("xpath=preceding-sibling::div[1]");
      await expect(check.locator("svg")).toBeVisible();
      await expect(check).toHaveCSS("color", VERDE_CHECK);
    });

    test("CA09 - Muestra el mensaje principal", async ({ page }) => {
      await expect(page.getByText(TEXTOS.acuseMensaje, { exact: true })).toBeVisible();
    });

    test("CA10 - Muestra el folio de seguimiento generado", async ({ page }) => {
      await expect(tarjetaFolio(page).getByText(TEXTOS.folioEtiqueta, { exact: true })).toBeVisible();
      await expect(tarjetaFolio(page).getByText(FOLIO_GENERADO, { exact: true })).toBeVisible();
    });

    test("CA11 - El folio tiene disponible la opción Copiar", async ({ page }) => {
      await expect(tarjetaFolio(page).getByRole("button", { name: "Copiar" })).toBeEnabled();
    });

    test("CA12 - Copiar copia el folio al portapapeles y muestra ¡Copiado!", async ({ page }) => {
      await tarjetaFolio(page).getByRole("button", { name: "Copiar" }).click();

      await expect(tarjetaFolio(page).getByRole("button", { name: TEXTOS.copiado })).toBeVisible();
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(FOLIO_GENERADO);
    });

    for (const [i, { titulo, detalle }] of PASOS_QUE_SIGUE.entries()) {
      test(`CA${13 + i} - ¿Qué sigue? muestra el paso "${titulo}"`, async ({ page }) => {
        await expect(page.getByText(TEXTOS.queSigue, { exact: true })).toBeVisible();
        await expect(pasoQueSigue(page, titulo)).toContainText(detalle);
        await expect(pasoQueSigue(page, titulo)).toContainText(String(i + 1));
      });
    }

    test("CA16 - La nota inferior indica que puede dar seguimiento más tarde con su folio", async ({ page }) => {
      await expect(page.getByText(/^También puedes dar seguimiento más tarde con tu folio/)).toBeVisible();
    });
  });
});
