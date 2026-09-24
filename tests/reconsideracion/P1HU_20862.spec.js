// tests/reconsideracion/P1HU_20862.spec.js
// HU 20862 - Selección de Reconsideración (Reconsideración)
import { test, expect } from "@playwright/test";
import {
  URL_FORMULARIO,
  abrirPaso1YSeleccionar,
  irAPaso2Reconsideracion,
  opcionPaso1,
} from "../helpers/navegacion.js";

const TEXTOS = {
  descripcionOpcion: "Pides revisar de nuevo una resolución previa.",
  nota:
    "Para una reconsideración vamos a pedirte el folio del trámite que ya tienes con nosotros, junto con tus datos de contacto y los documentos que quieras sumar.",
  paso2: "PASO 2 · TU RECONSIDERACIÓN",
  modalTitulo: "¿Quieres reiniciar tu solicitud?",
  modalMensaje:
    "Al reiniciar, perderás la información que has ingresado hasta ahora y volverás al inicio del trámite. Esta acción no se puede deshacer.",
};

// Estilos de la tarjeta según su estado (CA02)
const AZUL = "rgb(45, 109, 246)";
const ESTILO_TARJETA = {
  inactiva: { borde: "rgb(231, 231, 231)", fondo: "rgb(255, 255, 255)", check: "rgba(0, 0, 0, 0)" },
  activa: { borde: AZUL, fondo: "rgb(223, 234, 255)", check: AZUL },
};

test.describe("HU 20862 - Reconsideración", () => {
  const opcionReconsideracion = (page) => opcionPaso1(page, "reconsideracion");
  const tituloPaso1 = (page) => page.getByText("PASO 1 · EMPECEMOS");
  const nota = (page) => page.getByText(TEXTOS.nota);
  const seleccionadas = (page) => page.getByRole("radio").and(page.locator('[aria-checked="true"]'));

  async function validarEstiloTarjeta(tarjeta, estado) {
    const { borde, fondo, check } = ESTILO_TARJETA[estado];
    await expect(tarjeta).toHaveCSS("border-color", borde);
    await expect(tarjeta).toHaveCSS("background-color", fondo);
    await expect(tarjeta.locator(".type-card__check")).toHaveCSS("background-color", check);
  }

  async function abrirModalReiniciar(page) {
    await page.getByRole("button", { name: "Reiniciar" }).click();
    const modal = page.getByRole("alertdialog");
    await expect(modal).toBeVisible();
    return modal;
  }

  test("CA01 - Paso 1 muestra la opción Reconsideración con su descripción", async ({ page }) => {
    await page.goto(URL_FORMULARIO);

    await expect(tituloPaso1(page)).toBeVisible();
    await expect(opcionReconsideracion(page)).toBeVisible();
    await expect(opcionReconsideracion(page).locator(".type-card__title")).toHaveText("Reconsideración");
    await expect(opcionReconsideracion(page).locator(".type-card__desc")).toHaveText(TEXTOS.descripcionOpcion);
  });

  test("CA02 - Tarjeta seleccionada con borde destacado, fondo resaltado y control activo", async ({ page }) => {
    const tarjeta = opcionReconsideracion(page);

    await abrirPaso1YSeleccionar(page, tarjeta, async () => {
      await expect(tarjeta).toHaveAttribute("aria-checked", "false");
      await validarEstiloTarjeta(tarjeta, "inactiva");
    });

    await expect(tarjeta).toHaveAttribute("aria-checked", "true");
    await expect(seleccionadas(page)).toHaveCount(1);
    await validarEstiloTarjeta(tarjeta, "activa");
  });

  test("CA03 - Al seleccionar Reconsideración se muestra la nota informativa", async ({ page }) => {
    await abrirPaso1YSeleccionar(page, opcionReconsideracion(page), async () => {
      await expect(nota(page)).toBeHidden();
    });

    await expect(nota(page)).toBeVisible();

    // La nota es propia de Reconsideración: desaparece al elegir otra opción
    await opcionPaso1(page, "complemento").click();
    await expect(nota(page)).toBeHidden();
  });

  test("CA04 - Continuar avanza al Paso 2 - Tu reconsideración", async ({ page }) => {
    const continuar = page.getByRole("button", { name: "Continuar" });

    await abrirPaso1YSeleccionar(page, opcionReconsideracion(page), async () => {
      await expect(continuar).toBeDisabled();
    });
    await expect(continuar).toBeEnabled();
    await continuar.click();

    await expect(page.getByText(TEXTOS.paso2)).toBeVisible();
    await expect(tituloPaso1(page)).toBeHidden();
  });

  test("CA05 - Reiniciar muestra modal de confirmación con textos y acciones", async ({ page }) => {
    await abrirPaso1YSeleccionar(page, opcionReconsideracion(page));
    const modal = await abrirModalReiniciar(page);

    await expect(modal.getByRole("heading", { name: TEXTOS.modalTitulo })).toBeVisible();
    await expect(modal.getByText(TEXTOS.modalMensaje)).toBeVisible();
    await expect(modal.getByRole("button", { name: "Continuar solicitud" })).toBeVisible();
    await expect(modal.getByRole("button", { name: "Sí, reiniciar" })).toBeVisible();
  });

  test("CA05 - Continuar solicitud cierra el modal sin reiniciar", async ({ page }) => {
    await abrirPaso1YSeleccionar(page, opcionReconsideracion(page));
    const modal = await abrirModalReiniciar(page);
    await modal.getByRole("button", { name: "Continuar solicitud" }).click();

    await expect(modal).toBeHidden();
    await expect(opcionReconsideracion(page)).toHaveAttribute("aria-checked", "true");
    await expect(nota(page)).toBeVisible();
    await expect(page.getByRole("button", { name: "Continuar" })).toBeEnabled();
  });

  test("CA05 - Sí, reiniciar limpia la selección del Paso 1", async ({ page }) => {
    await abrirPaso1YSeleccionar(page, opcionReconsideracion(page));
    const modal = await abrirModalReiniciar(page);
    await modal.getByRole("button", { name: "Sí, reiniciar" }).click();

    await expect(modal).toBeHidden();
    await expect(tituloPaso1(page)).toBeVisible();
    await expect(seleccionadas(page)).toHaveCount(0);
    await expect(nota(page)).toBeHidden();
    await expect(page.getByRole("button", { name: "Continuar" })).toBeDisabled();
  });

  test("CA05 - Sí, reiniciar desde el Paso 2 regresa al inicio del trámite", async ({ page }) => {
    await irAPaso2Reconsideracion(page);
    await page.getByRole("textbox", { name: "Primer Nombre *" }).fill("JUANA");

    const modal = await abrirModalReiniciar(page);
    await modal.getByRole("button", { name: "Sí, reiniciar" }).click();

    await expect(modal).toBeHidden();
    await expect(tituloPaso1(page)).toBeVisible();
    await expect(seleccionadas(page)).toHaveCount(0);

    // La información ingresada se pierde: al volver al Paso 2 el formulario está vacío
    await opcionReconsideracion(page).click();
    await page.getByRole("button", { name: "Continuar" }).click();
    await expect(page.getByRole("textbox", { name: "Primer Nombre *" })).toHaveValue("");
  });
});
