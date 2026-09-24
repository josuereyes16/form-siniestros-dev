// tests/reconsideracion/P4HU_20868.spec.js
// HU 20868 - Revisión y envío de Reconsideración (Reconsideración)
import { test, expect } from "@playwright/test";
import {
  ARCHIVOS_PRUEBA,
  DATOS_RECONSIDERACION,
  campoReconsideracion,
  finalizarTramite as enviar,
  irAPaso4Reconsideracion,
  marcarNoSoyRobot,
} from "../helpers/navegacion.js";

const TEXTOS = {
  paso2: "PASO 2 · TU RECONSIDERACIÓN",
  paso3: "PASO 3 · DOCUMENTOS",
  paso4: "PASO 4 · REVISIÓN",
  titulo: "Revisa antes de enviar",
  intro: "Confirma que todo esté bien antes de enviar tu reconsideración.",
  placeholderComentarios: "Escribe aquí si tienes algún comentario adicional…",
  seguridad: "Confirma que no eres un robot para poder enviar tu solicitud.",
  errorEnvio: "No pudimos finalizar tu trámite en este momento. Por favor intenta nuevamente más tarde.",
  modalTitulo: "¿Quieres reiniciar tu solicitud?",
  modalMensaje:
    "Al reiniciar, perderás la información que has ingresado hasta ahora y volverás al inicio del trámite. Esta acción no se puede deshacer.",
};

// Endpoint que registra la reconsideración. Se simula para no crear trámites en DEV
// (el envío real lo cubre happy_path.spec.js)
const API_RECLAMACIONES = "**/api/reclamaciones";

const DATOS = { ...DATOS_RECONSIDERACION, segundoNombre: "MARÍA", segundoApellido: "GÓMEZ" };
const DOCUMENTOS = [
  { ruta: ARCHIVOS_PRUEBA.pdf, nombre: "PRUEBA.pdf", tipo: "PDF", tamano: "2.1 KB" },
  { ruta: ARCHIVOS_PRUEBA.png, nombre: "PRUEBA.png", tipo: "PNG", tamano: "5.2 KB" },
];
const VERDE_CARGA_EXITOSA = "rgb(0, 138, 75)";

test.describe("HU 20868 - Reconsideración", () => {
  const seccion = (page, titulo) =>
    page.locator("section").filter({ has: page.getByRole("heading", { name: titulo }) });
  const seccionReconsideracion = (page) => seccion(page, "TU RECONSIDERACIÓN");
  const seccionDocumentos = (page) => seccion(page, /^DOCUMENTOS/);
  const dato = (page, etiqueta) =>
    seccionReconsideracion(page).locator("dl > div").filter({ has: page.getByText(etiqueta, { exact: true }) }).locator("dd");
  const documento = (page, nombre) =>
    seccionDocumentos(page).locator("div.rounded-xl").filter({ has: page.getByText(nombre, { exact: true }) });
  const comentarios = (page) => page.getByRole("textbox", { name: "Comentarios adicionales" });
  const noSoyRobot = (page) => page.locator("label").filter({ hasText: "No soy un robot" });
  const finalizar = (page) => page.getByRole("button", { name: "Finalizar trámite" });
  const atras = (page) => page.getByRole("button", { name: "Atrás" });
  const mensajeError = (page) => page.getByText(TEXTOS.errorEnvio, { exact: true });

  /** Simula el endpoint de envío: responde `status` tras `demoraMs` y cuenta las peticiones. */
  async function simularEnvio(page, { status = 500, demoraMs = 0 } = {}) {
    const envios = [];
    await page.route(API_RECLAMACIONES, async (route) => {
      envios.push(route.request().postDataJSON());
      await new Promise((r) => setTimeout(r, demoraMs));
      await route.fulfill({ status, contentType: "application/json", body: "{}" });
    });
    return envios;
  }

  async function abrirModalReiniciar(page) {
    await page.getByRole("button", { name: "Reiniciar" }).click();
    const modal = page.getByRole("alertdialog");
    await expect(modal).toBeVisible();
    return modal;
  }

  test.beforeEach(async ({ page }) => {
    await irAPaso4Reconsideracion(page, DOCUMENTOS.map((d) => d.ruta), DATOS);
  });

  test("CA01 - Con datos y documentos se muestra la pantalla Revisa antes de enviar", async ({ page }) => {
    await expect(page.getByText(TEXTOS.paso4)).toBeVisible();
    await expect(page.getByRole("heading", { name: TEXTOS.titulo })).toBeVisible();
  });

  test("CA02 - Muestra el texto introductorio", async ({ page }) => {
    await expect(page.getByText(TEXTOS.intro, { exact: true })).toBeVisible();
  });

  test("CA03 - Tu reconsideración muestra el resumen de los datos capturados", async ({ page }) => {
    await expect(dato(page, "TIPO DE SOLICITUD")).toHaveText("Reconsideración");
    await expect(dato(page, "FOLIO DEL TRÁMITE A RECONSIDERAR")).toHaveText(DATOS.folio);
    for (const parte of [DATOS.primerNombre, DATOS.segundoNombre, DATOS.primerApellido, DATOS.segundoApellido]) {
      await expect(dato(page, "NOMBRE DEL CONTACTO")).toContainText(parte);
    }
    await expect(dato(page, "CORREO DE CONTACTO")).toHaveText(DATOS.correo);
    await expect(dato(page, "MOTIVO DE LA RECONSIDERACIÓN")).toHaveText(DATOS.motivo);
  });

  test("CA04 - Editar en Tu reconsideración regresa al Paso 2 con los datos para modificarlos", async ({ page }) => {
    await seccionReconsideracion(page).getByRole("button", { name: "Editar" }).click();

    await expect(page.getByText(TEXTOS.paso2)).toBeVisible();
    await expect(campoReconsideracion(page, "motivo")).toHaveValue(DATOS.motivo);

    // El dato modificado se refleja al volver a la revisión
    const nuevoMotivo = "SOLICITO REVISIÓN POR NUEVA EVIDENCIA MÉDICA";
    await campoReconsideracion(page, "motivo").fill(nuevoMotivo);
    await page.getByRole("button", { name: "Continuar" }).click();
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page.getByText(TEXTOS.paso4)).toBeVisible();
    await expect(dato(page, "MOTIVO DE LA RECONSIDERACIÓN")).toHaveText(nuevoMotivo);
  });

  test("CA05 - Documentos muestra la cantidad y la lista de archivos cargados", async ({ page }) => {
    await expect(seccionDocumentos(page).getByRole("heading")).toHaveText(`DOCUMENTOS (${DOCUMENTOS.length})`);
    for (const { nombre } of DOCUMENTOS) {
      await expect(documento(page, nombre)).toBeVisible();
    }
  });

  test("CA06 - Cada documento muestra nombre, tipo, tamaño y Carga exitosa", async ({ page }) => {
    for (const { nombre, tipo, tamano } of DOCUMENTOS) {
      const fila = documento(page, nombre);
      await expect(fila.getByText(nombre, { exact: true })).toBeVisible();
      await expect(fila.getByText(tipo, { exact: true })).toBeVisible();
      await expect(fila.getByText(tamano, { exact: true })).toBeVisible();
      await expect(fila.locator("div.rounded-full").first()).toHaveCSS("background-color", VERDE_CARGA_EXITOSA);
    }
  });

  test("CA07 - Editar en Documentos regresa al paso de carga de documentos", async ({ page }) => {
    await seccionDocumentos(page).getByRole("button", { name: "Editar" }).click();

    await expect(page.getByText(TEXTOS.paso3)).toBeVisible();
    for (const { nombre } of DOCUMENTOS) {
      await expect(page.getByRole("button", { name: `Eliminar archivo ${nombre}`, exact: true })).toBeVisible();
    }
  });

  test("CA08 - Comentarios adicionales es opcional y muestra su placeholder", async ({ page }) => {
    await expect(page.getByText("OTROS", { exact: true })).toBeVisible();
    await expect(page.locator('label[for="txtComentariosAdicionalesRec"]')).toHaveText("Comentarios adicionales");
    await expect(comentarios(page)).toHaveValue("");
    // La app usa tres puntos "..." en lugar del carácter "…" de la HU
    const placeholder = new RegExp(`^${TEXTOS.placeholderComentarios.replace("…", "(…|\\.\\.\\.)")}$`);
    await expect(comentarios(page)).toHaveAttribute("placeholder", placeholder);
  });

  test("CA08 - Comentarios acepta letras, números, espacios, puntuación y caracteres especiales", async ({ page }) => {
    const texto = "Revisión 2026: ÁÉÍÓÚ ñ, ¿por qué? ¡Urgente! @#$%&*()[]{}<>/\\|\"' -_+=~^`";
    await comentarios(page).fill(texto);

    await expect(comentarios(page)).toHaveValue(texto);
  });

  test("CA08 - Comentarios permite hasta 800 caracteres", async ({ page }) => {
    await comentarios(page).fill("A".repeat(800));
    await comentarios(page).pressSequentially("BCD");

    await expect(comentarios(page)).toHaveValue("A".repeat(800));
  });

  test("CA09 - Comentarios vacío no muestra error y permite finalizar", async ({ page }) => {
    await comentarios(page).focus();
    await comentarios(page).blur();
    await marcarNoSoyRobot(page);

    await expect(page.locator("#txtComentariosAdicionalesRec-error")).toHaveCount(0);
    await expect(comentarios(page)).not.toHaveAttribute("aria-invalid", "true");
    await expect(finalizar(page)).toBeEnabled();
  });

  test("CA10 - Sección Seguridad muestra el mensaje y la opción No soy un robot", async ({ page }) => {
    await expect(page.getByText("SEGURIDAD", { exact: true })).toBeVisible();
    await expect(page.getByText(TEXTOS.seguridad, { exact: true })).toBeVisible();
    await expect(noSoyRobot(page)).toBeVisible();
    await expect(noSoyRobot(page).getByRole("checkbox")).not.toBeChecked();
  });

  test("CA11 - Sin No soy un robot, Finalizar trámite está deshabilitado", async ({ page }) => {
    await expect(noSoyRobot(page).getByRole("checkbox")).not.toBeChecked();
    await expect(finalizar(page)).toBeDisabled();
  });

  test("CA12 - Al confirmar No soy un robot se habilita Finalizar trámite", async ({ page }) => {
    await expect(finalizar(page)).toBeDisabled();
    await marcarNoSoyRobot(page);

    await expect(finalizar(page)).toBeEnabled();
  });

  test("CA13 - Finalizar trámite inicia el envío y bloquea reenviar mientras está en proceso", async ({ page }) => {
    const envios = await simularEnvio(page, { demoraMs: 4000 });
    await enviar(page);

    // Mientras el envío está en proceso el botón cambia a "Enviando..." y queda deshabilitado
    const enviando = page.getByRole("button", { name: /Enviando/ });
    await expect(enviando).toBeVisible();
    await expect(enviando).toBeDisabled();
    await expect(page.getByRole("button", { name: "Sí, finalizar trámite" })).toHaveCount(0);

    // Al terminar, solo se hizo una petición con los datos de la reconsideración
    await expect(enviando).toBeHidden({ timeout: 10000 });
    expect(envios).toHaveLength(1);
    expect(envios[0]).toMatchObject({
      requestType: "Reconsideración",
      folioNumber: DATOS.folio,
      contactEmail: DATOS.correo,
      reconsiderationReason: DATOS.motivo,
    });
    expect(envios[0].documentUrls).toHaveLength(DOCUMENTOS.length);
  });

  test("CA14 - Pie con Atrás y Finalizar trámite", async ({ page }) => {
    await expect(atras(page)).toBeVisible();
    await expect(atras(page)).toBeEnabled();
    await expect(finalizar(page)).toBeVisible();
  });

  test("CA15 - Atrás regresa al Paso 3 - Documentos", async ({ page }) => {
    await atras(page).click();

    await expect(page.getByText(TEXTOS.paso3)).toBeVisible();
    await expect(page.getByText(TEXTOS.paso4)).toBeHidden();
  });

  test("CA16 - Reiniciar muestra modal de confirmación con textos y acciones", async ({ page }) => {
    const modal = await abrirModalReiniciar(page);

    await expect(modal.getByRole("heading", { name: TEXTOS.modalTitulo })).toBeVisible();
    await expect(modal.getByText(TEXTOS.modalMensaje)).toBeVisible();
    await expect(modal.getByRole("button", { name: "Continuar solicitud" })).toBeVisible();
    await expect(modal.getByRole("button", { name: "Sí, reiniciar" })).toBeVisible();
  });

  test("CA16 - Continuar solicitud cierra el modal sin perder la revisión", async ({ page }) => {
    await comentarios(page).fill("COMENTARIO DE PRUEBA");
    const modal = await abrirModalReiniciar(page);
    await modal.getByRole("button", { name: "Continuar solicitud" }).click();

    await expect(modal).toBeHidden();
    await expect(page.getByText(TEXTOS.paso4)).toBeVisible();
    await expect(dato(page, "FOLIO DEL TRÁMITE A RECONSIDERAR")).toHaveText(DATOS.folio);
    await expect(seccionDocumentos(page).getByRole("heading")).toHaveText(`DOCUMENTOS (${DOCUMENTOS.length})`);
    await expect(comentarios(page)).toHaveValue("COMENTARIO DE PRUEBA");
  });

  test("CA16 - Sí, reiniciar regresa al inicio del trámite y descarta la información", async ({ page }) => {
    const modal = await abrirModalReiniciar(page);
    await modal.getByRole("button", { name: "Sí, reiniciar" }).click();

    await expect(modal).toBeHidden();
    await expect(page.getByText("PASO 1 · EMPECEMOS")).toBeVisible();
    await expect(page.getByRole("radio").and(page.locator('[aria-checked="true"]'))).toHaveCount(0);

    await page.getByRole("radio", { name: "Reconsideración" }).click();
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(campoReconsideracion(page, "folio")).toHaveValue("");
  });

  test("CA17 - Falla al registrar: permanece en revisión, conserva la información y muestra el mensaje", async ({ page }) => {
    await simularEnvio(page, { status: 500 });
    await comentarios(page).fill("COMENTARIO DE PRUEBA");
    await enviar(page);

    await expect(mensajeError(page)).toBeVisible();
    await expect(page.getByText(TEXTOS.paso4)).toBeVisible();
    await expect(dato(page, "FOLIO DEL TRÁMITE A RECONSIDERAR")).toHaveText(DATOS.folio);
    await expect(dato(page, "MOTIVO DE LA RECONSIDERACIÓN")).toHaveText(DATOS.motivo);
    await expect(seccionDocumentos(page).getByRole("heading")).toHaveText(`DOCUMENTOS (${DOCUMENTOS.length})`);
    await expect(comentarios(page)).toHaveValue("COMENTARIO DE PRUEBA");
  });

  test("CA17 - Sin conexión con el servicio: permanece en revisión y muestra el mensaje", async ({ page }) => {
    await page.route(API_RECLAMACIONES, (route) => route.abort("failed"));
    await enviar(page);

    await expect(mensajeError(page)).toBeVisible();
    await expect(page.getByText(TEXTOS.paso4)).toBeVisible();
    await expect(dato(page, "FOLIO DEL TRÁMITE A RECONSIDERAR")).toHaveText(DATOS.folio);
  });
});
