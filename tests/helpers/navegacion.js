// tests/helpers/navegacion.js
// Funciones de navegación compartidas por los specs de todos los flujos.
import { expect } from "@playwright/test";

export const URL_FORMULARIO = "/solicitud-reclamaciones";

// Opciones del Paso 1 - Empecemos
export const OPCIONES_PASO1 = {
  nuevaSolicitud: "Nueva solicitud Es la primera",
  complemento: "Complemento",
  reconsideracion: "Reconsideración",
  seguimiento: "Seguimiento trámite Consulta",
};

export const opcionPaso1 = (page, opcion) =>
  page.getByRole("radio", { name: OPCIONES_PASO1[opcion] ?? opcion });

/**
 * Abre el Paso 1 y selecciona una opción.
 * Ocasionalmente la app no hidrata y ningún clic surte efecto hasta recargar,
 * por eso se recarga la página en cada reintento.
 * `antesDeSeleccionar` corre sobre la página recién cargada (ej. validar el estado inicial).
 */
export async function abrirPaso1YSeleccionar(page, opcion, antesDeSeleccionar = async () => {}) {
  const radio = typeof opcion === "string" ? opcionPaso1(page, opcion) : opcion;
  await expect(async () => {
    await page.goto(URL_FORMULARIO);
    await antesDeSeleccionar();
    await radio.click();
    await expect(radio).toHaveAttribute("aria-checked", "true", { timeout: 3000 });
  }).toPass({ timeout: 30000 });
}
