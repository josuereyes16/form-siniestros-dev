// tests/seguimiento/P1HU_24607.spec.js
// HU 24607 - Consulta y seguimiento de trámite por folio (Seguimiento trámite)
import { test, expect } from "@playwright/test";
import { abrirPaso1YSeleccionar, opcionPaso1 } from "../helpers/navegacion.js";

const FOLIO_NO_EXISTENTE = "SURA1234567890MX";
const API_SEGUIMIENTO = "**/api/seguimiento/**";

const ETAPAS = [
  "Solicitud recibida",
  "En revisión documental",
  "Validación técnica",
  "Resolución",
  "Pago de indemnización",
];

// Estado visual de cada etapa según el estatus del trámite (CA10).
// C = completada (verde), A = activa (azul), R = rechazada (rojo), P = pendiente (blanco)
const [C, A, R, P] = ["completada", "activa", "rechazada", "pendiente"];

// Folios reales en DEV por estatus (tablero Monday "Formulario de Siniestros - Vida V1_dev").
// Si el ambiente se limpia o el trámite cambia de estado, sobrescribir desde .env
// con FOLIO_<CLAVE>, ej. FOLIO_EN_DICTAMEN=SURA1788212878MX
const ESTATUS = [
  { clave: "NUEVA", estatus: "Nueva", folio: "SURA1790031457MX", etapas: [C, P, P, P, P] },
  { clave: "APERTURADO", estatus: "Aperturado", folio: "SURA1787160212MX", etapas: [C, A, P, P, P] },
  { clave: "EN_DICTAMEN", estatus: "En dictamen", folio: "SURA1788212878MX", etapas: [C, C, A, P, P] },
  { clave: "PROCEDENTE", estatus: "Procedente", folio: "SURA1787167572MX", etapas: [C, C, C, A, P] },
  { clave: "RECHAZADO", estatus: "Rechazado", folio: "SURA1781710680MX", etapas: [C, C, C, R, P] },
  { clave: "PAGO_PARCIAL", estatus: "Pago parcial", folio: "SURA1781644654MX", etapas: [C, C, C, C, A] },
  { clave: "PAGADO", estatus: "Pagado", folio: "SURA1781708496MX", etapas: [C, C, C, C, C] },
].map((e) => ({ ...e, folio: process.env[`FOLIO_${e.clave}`] || e.folio }));

const FOLIO_EXISTENTE = ESTATUS[0].folio;

const COLOR_ESTADO = {
  "rgb(24, 139, 87)": C,
  "rgb(27, 82, 217)": A,
  "rgb(220, 38, 38)": R,
  "rgb(255, 255, 255)": P,
};

const TEXTOS = {
  descripcionOpcion:
    "Consulta el avance y estado de un trámite previamente registrado.",
  subtitulo: "SEGUIMIENTO DE TU TRÁMITE",
  titulo: "Vamos al día con tu caso",
  placeholder: "Ej. SURA1787176664MX",
  infoInicial:
    "Ingresa el número de folio para consultar el estado y dar seguimiento al avance de tu trámite.",
  infoSecundaria:
    "Una vez consultes tu folio, podrás visualizar el estado actual y el progreso de tu trámite.",
  folioInvalido: "Ingresa un folio válido.",
  noEncontrado:
    "No encontramos un trámite asociado a este folio. Verifica la información e intenta nuevamente.",
  errorServicio:
    "No pudimos consultar tu trámite en este momento. Por favor intenta nuevamente más tarde.",
  modalTitulo: "¿Quieres reiniciar tu solicitud?",
  modalMensaje:
    "Al reiniciar, perderás la información que has ingresado hasta ahora y volverás al inicio del trámite. Esta acción no se puede deshacer.",
};

test.describe("HU 24607 - Validaciones Seguimiento trámite", () => {
  const opcionSeguimiento = (page) => opcionPaso1(page, "seguimiento");
  const campoFolio = (page) => page.getByRole("textbox", { name: "FOLIO" });
  const btnConsultar = (page) =>
    page.getByRole("button", { name: "Consultar" });
  const tituloAvance = (page) =>
    page.getByRole("heading", { name: "AVANCE DEL TRÁMITE" });
  const tituloPaso1 = (page) => page.getByText("PASO 1 · EMPECEMOS");

  async function irAConsultaSeguimiento(page) {
    await abrirPaso1YSeleccionar(page, opcionSeguimiento(page));
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page.getByRole("heading", { name: TEXTOS.titulo })).toBeVisible();
  }

  async function consultarFolio(page, folio) {
    await campoFolio(page).fill(folio);
    await btnConsultar(page).click();
  }

  // Devuelve { etapa: estado } leyendo el color de fondo del ícono de cada etapa
  async function estadosEtapas(page) {
    const fondos = await page
      .locator('ol > li span.rounded-full[aria-hidden="true"]')
      .evaluateAll((iconos) => iconos.map((i) => getComputedStyle(i).backgroundColor));
    return Object.fromEntries(ETAPAS.map((etapa, i) => [etapa, COLOR_ESTADO[fondos[i]] ?? fondos[i]]));
  }

  const estadosEsperados = (etapas) =>
    Object.fromEntries(ETAPAS.map((etapa, i) => [etapa, etapas[i]]));

  const respuestaSeguimiento = (folio, estatus) => ({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      data: { folio, estatus, fechaEnvio: "2026-09-23", tipoSolicitud: "Nueva solicitud" },
    }),
  });

  test("CA01 - Paso 1 muestra la opción Seguimiento trámite con su descripción", async ({ page }) => {
    await page.goto("/solicitud-reclamaciones");

    await expect(tituloPaso1(page)).toBeVisible();
    await expect(opcionSeguimiento(page)).toBeVisible();
    await expect(opcionSeguimiento(page)).toContainText("Seguimiento trámite");
    await expect(opcionSeguimiento(page)).toContainText(TEXTOS.descripcionOpcion);
  });

  test("CA01 - Solo se puede seleccionar una opción del listado", async ({ page }) => {
    const opciones = page.getByRole("radio");
    const seleccionadas = opciones.and(page.locator('[aria-checked="true"]'));

    await abrirPaso1YSeleccionar(page, page.getByRole("radio", { name: "Complemento" }), async () => {
      await expect(opciones).toHaveCount(4);
      await expect(seleccionadas).toHaveCount(0);
    });
    await expect(seleccionadas).toHaveCount(1);

    // La página ya respondió al primer clic: el segundo se hace directo
    await opcionSeguimiento(page).click();
    await expect(opcionSeguimiento(page)).toHaveAttribute("aria-checked", "true");
    await expect(seleccionadas).toHaveCount(1);
    await expect(page.getByRole("radio", { name: "Complemento" })).toHaveAttribute("aria-checked", "false");
  });

  test("CA02 - Continuar se habilita al seleccionar Seguimiento trámite", async ({ page }) => {
    const continuar = page.getByRole("button", { name: "Continuar" });

    await abrirPaso1YSeleccionar(page, opcionSeguimiento(page), async () => {
      await expect(continuar).toBeDisabled();
    });
    await expect(continuar).toBeEnabled();
  });

  test("CA03 - Continuar muestra la pantalla Seguimiento de tu trámite", async ({ page }) => {
    await irAConsultaSeguimiento(page);

    await expect(page.getByText(TEXTOS.subtitulo, { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: TEXTOS.titulo })).toBeVisible();
  });

  test("CA04 - Formulario con campo Folio, texto de ayuda y botón Consultar", async ({ page }) => {
    await irAConsultaSeguimiento(page);

    await expect(campoFolio(page)).toBeVisible();
    await expect(campoFolio(page)).toHaveAttribute("placeholder", TEXTOS.placeholder);
    await expect(btnConsultar(page)).toBeVisible();
  });

  test("CA05 - Estado inicial: Consultar deshabilitado y mensajes informativos", async ({ page }) => {
    await irAConsultaSeguimiento(page);

    await expect(campoFolio(page)).toHaveValue("");
    await expect(btnConsultar(page)).toBeDisabled();
    await expect(page.getByText(TEXTOS.infoInicial)).toBeVisible();
    await expect(page.getByText(TEXTOS.infoSecundaria)).toBeVisible();
    await expect(tituloAvance(page)).toBeHidden();
  });

  test("CA06 - Consultar se habilita al ingresar un valor alfanumérico", async ({ page }) => {
    await irAConsultaSeguimiento(page);

    await campoFolio(page).fill("ABC123");
    await expect(btnConsultar(page)).toBeEnabled();

    // Al borrar el valor vuelve a deshabilitarse
    await campoFolio(page).fill("");
    await expect(btnConsultar(page)).toBeDisabled();
  });

  test("CA06 - Folio convierte a mayúsculas y descarta caracteres especiales", async ({ page }) => {
    await irAConsultaSeguimiento(page);

    await campoFolio(page).pressSequentially("sura-123 $%");
    await expect(campoFolio(page)).toHaveValue("SURA123");
  });

  const FOLIOS_INVALIDOS = [
    { caso: "solo prefijo", valor: "SURA" },
    { caso: "9 dígitos", valor: "SURA123456789MX" },
    { caso: "prefijo distinto a SURA", valor: "SUR11234567890MX" },
    { caso: "sufijo distinto a MX", valor: "SURA1234567890CO" },
    { caso: "letras en la parte numérica", valor: "SURA12345ABCDEMX" },
  ];

  for (const { caso, valor } of FOLIOS_INVALIDOS) {
    test(`CA07 - Folio con formato inválido (${caso}) muestra "Ingresa un folio válido."`, async ({ page }) => {
      await irAConsultaSeguimiento(page);
      await consultarFolio(page, valor);

      await expect(page.getByText("Folio inválido")).toBeVisible();
      await expect(page.getByText(TEXTOS.folioInvalido)).toBeVisible();
      await expect(tituloAvance(page)).toBeHidden();
    });
  }

  // La parte numérica es un timestamp: 10 dígitos (segundos) o hasta 13 (milisegundos).
  // Un folio con formato válido que no existe debe llegar al servicio y responder "no encontrado"
  for (const digitos of [10, 11, 12, 13]) {
    test(`CA07 - Folio con ${digitos} dígitos pasa la validación de formato`, async ({ page }) => {
      const folio = `SURA${"1".repeat(digitos)}MX`;
      await irAConsultaSeguimiento(page);
      const consulta = page.waitForRequest((r) => r.url().includes(`/api/seguimiento/${folio}`));
      await consultarFolio(page, folio);

      await consulta;
      await expect(page.getByText(TEXTOS.noEncontrado)).toBeVisible();
      await expect(page.getByText(TEXTOS.folioInvalido)).toBeHidden();
    });
  }

  test("CA08 - Consulta exitosa muestra Avance del trámite y conserva el folio", async ({ page }) => {
    await irAConsultaSeguimiento(page);
    await consultarFolio(page, FOLIO_EXISTENTE);

    await expect(tituloAvance(page)).toBeVisible();
    await expect(campoFolio(page)).toHaveValue(FOLIO_EXISTENTE);
    await expect(page.getByText(TEXTOS.folioInvalido)).toBeHidden();
    await expect(page.getByText(TEXTOS.noEncontrado)).toBeHidden();
  });

  test("CA09 - Avance del trámite muestra las 5 etapas en orden", async ({ page }) => {
    await irAConsultaSeguimiento(page);
    await consultarFolio(page, FOLIO_EXISTENTE);

    await expect(tituloAvance(page)).toBeVisible();
    await expect(page.locator("ol > li")).toHaveText(ETAPAS);
  });

  // Respuesta simulada: valida cómo pinta la app cada estatus sin depender de los datos de DEV
  for (const { estatus, etapas } of ESTATUS) {
    test(`CA10 - Estatus "${estatus}" (simulado) marca etapas: ${etapas.join(", ")}`, async ({ page }) => {
      await page.route(API_SEGUIMIENTO, (route) =>
        route.fulfill(respuestaSeguimiento(FOLIO_NO_EXISTENTE, estatus)),
      );
      await irAConsultaSeguimiento(page);
      await consultarFolio(page, FOLIO_NO_EXISTENTE);

      await expect(tituloAvance(page)).toBeVisible();
      await expect.poll(() => estadosEtapas(page)).toEqual(estadosEsperados(etapas));
    });
  }

  // Folio real en DEV: valida punta a punta con el estatus que devuelve el servicio
  for (const { estatus, folio, etapas } of ESTATUS) {
    test(`CA10 - Folio real en estatus "${estatus}" (${folio}) marca etapas: ${etapas.join(", ")}`, async ({ page }) => {
      await irAConsultaSeguimiento(page);
      const respuesta = page.waitForResponse((r) => r.url().includes(`/api/seguimiento/${folio}`));
      await consultarFolio(page, folio);

      const { data } = await (await respuesta).json();
      expect(data.estatus, `El folio ${folio} ya no está en "${estatus}", actualizar FOLIO_* en .env`).toBe(estatus);
      await expect(tituloAvance(page)).toBeVisible();
      await expect.poll(() => estadosEtapas(page)).toEqual(estadosEsperados(etapas));
    });
  }

  test("CA11 - Folio no encontrado muestra mensaje y permanece en la consulta", async ({ page }) => {
    await irAConsultaSeguimiento(page);
    await consultarFolio(page, FOLIO_NO_EXISTENTE);

    await expect(page.getByText("Folio no encontrado")).toBeVisible();
    await expect(page.getByText(TEXTOS.noEncontrado)).toBeVisible();
    await expect(page.getByRole("heading", { name: TEXTOS.titulo })).toBeVisible();
    await expect(campoFolio(page)).toHaveValue(FOLIO_NO_EXISTENTE);
    await expect(tituloAvance(page)).toBeHidden();
  });

  test("CA12 - Falla del servicio muestra mensaje de error y conserva el folio", async ({ page }) => {
    await page.route(API_SEGUIMIENTO, (route) =>
      route.fulfill({ status: 500, contentType: "application/json", body: "{}" }),
    );
    await irAConsultaSeguimiento(page);
    await consultarFolio(page, FOLIO_EXISTENTE);

    await expect(page.getByText(TEXTOS.errorServicio)).toBeVisible();
    await expect(campoFolio(page)).toHaveValue(FOLIO_EXISTENTE);
    await expect(tituloAvance(page)).toBeHidden();
  });

  test("CA12 - Sin conexión con el servicio muestra mensaje de error y conserva el folio", async ({ page }) => {
    await page.route(API_SEGUIMIENTO, (route) => route.abort("failed"));
    await irAConsultaSeguimiento(page);
    await consultarFolio(page, FOLIO_EXISTENTE);

    await expect(page.getByText(TEXTOS.errorServicio)).toBeVisible();
    await expect(campoFolio(page)).toHaveValue(FOLIO_EXISTENTE);
  });

  test("CA13 - Atrás regresa al Paso 1 - Empecemos", async ({ page }) => {
    await irAConsultaSeguimiento(page);
    await page.getByRole("button", { name: "Atrás" }).click();

    await expect(tituloPaso1(page)).toBeVisible();
    await expect(page.getByRole("heading", { name: TEXTOS.titulo })).toBeHidden();
  });

  test("CA14 - Reiniciar muestra modal de confirmación con textos y acciones", async ({ page }) => {
    await irAConsultaSeguimiento(page);
    await page.getByRole("button", { name: "Reiniciar" }).click();

    const modal = page.getByRole("alertdialog");
    await expect(modal).toBeVisible();
    await expect(modal.getByRole("heading", { name: TEXTOS.modalTitulo })).toBeVisible();
    await expect(modal).toContainText(TEXTOS.modalMensaje);
    await expect(modal.getByRole("button", { name: "Continuar solicitud" })).toBeVisible();
    await expect(modal.getByRole("button", { name: "Sí, reiniciar" })).toBeVisible();
  });

  test("CA14 - Continuar solicitud cierra el modal sin reiniciar", async ({ page }) => {
    await irAConsultaSeguimiento(page);
    await consultarFolio(page, FOLIO_EXISTENTE);
    await expect(tituloAvance(page)).toBeVisible();

    await page.getByRole("button", { name: "Reiniciar" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Continuar solicitud" }).click();

    await expect(page.getByRole("alertdialog")).toBeHidden();
    await expect(page.getByRole("heading", { name: TEXTOS.titulo })).toBeVisible();
    await expect(campoFolio(page)).toHaveValue(FOLIO_EXISTENTE);
    await expect(tituloAvance(page)).toBeVisible();
  });

  test("CA14 - Sí, reiniciar regresa al inicio del trámite", async ({ page }) => {
    await irAConsultaSeguimiento(page);
    await consultarFolio(page, FOLIO_EXISTENTE);
    await expect(tituloAvance(page)).toBeVisible();

    await page.getByRole("button", { name: "Reiniciar" }).click();
    await page.getByRole("alertdialog").getByRole("button", { name: "Sí, reiniciar" }).click();

    await expect(page.getByRole("alertdialog")).toBeHidden();
    await expect(tituloPaso1(page)).toBeVisible();
    await expect(page.getByRole("radio").and(page.locator('[aria-checked="true"]'))).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Continuar" })).toBeDisabled();
  });
});
