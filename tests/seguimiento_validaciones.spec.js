// tests/seguimiento_validaciones.spec.js
import { test, expect } from "@playwright/test";

test.describe("Validaciones - Seguimiento", () => {
  async function irAConsultaSeguimiento(page) {
    await page.goto("/solicitud-reclamaciones");
    await page
      .getByRole("radio", { name: "Seguimiento trámite Consulta" })
      .click();
    await page.getByRole("button", { name: "Continuar" }).click();
  }

  test("ERROR Folio - formato inválido", async ({ page }) => {
    await irAConsultaSeguimiento(page);

    await page.getByRole("textbox", { name: "FOLIO" }).click();
    await page.getByRole("textbox", { name: "FOLIO" }).fill("SURA");
    await page.getByRole("button", { name: "Consultar" }).click();

    await expect(page.getByText("Folio inválido")).toBeVisible();
    await expect(page.getByText("Ingresa un folio válido.")).toBeVisible();
  });

  test("ERROR Folio - no encontrado (formato válido, no existe)", async ({
    page,
  }) => {
    await irAConsultaSeguimiento(page);

    await page.getByRole("textbox", { name: "FOLIO" }).click();
    await page.getByRole("textbox", { name: "FOLIO" }).fill("SURA1234567890MX");
    await page.getByRole("button", { name: "Consultar" }).click();

    await expect(page.getByText("Folio no encontrado")).toBeVisible();
    await expect(page.getByText("No encontramos un trámite")).toBeVisible();
  });

  test("Folio válido - debe mostrar el avance del trámite sin alertas", async ({
    page,
  }) => {
    await irAConsultaSeguimiento(page);

    await page.getByRole("textbox", { name: "FOLIO" }).click();
    await page.getByRole("textbox", { name: "FOLIO" }).fill("SURA1789747252MX");
    await page.getByRole("button", { name: "Consultar" }).click();

    // Debe mostrar el avance con las 5 etapas
    await expect(
      page.getByRole("heading", { name: "AVANCE DEL TRÁMITE" }),
    ).toBeVisible();
    await expect(page.getByText("Solicitud recibida")).toBeVisible();
    await expect(page.getByText("En revisión documental")).toBeVisible();
    await expect(page.getByText("Validación técnica")).toBeVisible();
    await expect(page.getByText("Resolución")).toBeVisible();
    await expect(page.getByText("Pago de indemnización")).toBeVisible();
  });
});
