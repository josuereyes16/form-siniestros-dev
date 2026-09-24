// tests/helpers/navegacion.js
// Funciones de navegación compartidas por los specs de todos los flujos.
import { expect } from "@playwright/test";
import path from "node:path";

export const URL_FORMULARIO = "/solicitud-reclamaciones";

// Archivos de prueba de data/
export const ARCHIVOS_PRUEBA = {
  pdf: path.resolve(__dirname, "../../data/PRUEBA.pdf"),
  png: path.resolve(__dirname, "../../data/PRUEBA.png"),
  xlsx: path.resolve(__dirname, "../../data/PRUEBA.xlsx"),
};

/** Encabezado "ARCHIVOS CARGADOS (n)" del paso de documentos. */
export const archivosCargados = (page) => page.getByText(/^ARCHIVOS CARGADOS/i);

/**
 * Carga archivos con "Seleccionar archivos", de uno en uno, esperando que cada uno
 * termine de subir. (Cargar varios en la misma selección a veces pierde alguno: ver HU 20865)
 */
export async function cargarDocumentos(page, archivos) {
  for (const archivo of archivos) {
    const selector = page.waitForEvent("filechooser");
    await page.getByRole("button", { name: "Seleccionar archivos" }).click();
    await (await selector).setFiles(archivo);
    await expect(page.getByRole("button", { name: `Eliminar archivo ${path.basename(archivo.name ?? archivo)}`, exact: true })).toBeVisible();
  }
  await expect(archivosCargados(page)).toHaveText(/^ARCHIVOS CARGADOS \(\d+\)$/i, { timeout: 30000 });
}

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

// ===== Reconsideración =====

// Campos del Paso 2 - Tu reconsideración (id del input)
export const CAMPOS_RECONSIDERACION = {
  primerNombre: "txtPrimerNombreContactoRec",
  segundoNombre: "txtSegundoNombreContactoRec",
  primerApellido: "txtPrimerApellidoContactoRec",
  segundoApellido: "txtSegundoApellidoContactoRec",
  correo: "txtCorreoContactoRec",
  folio: "txtFolioTramiteRec",
  motivo: "txtMotivoRec",
};

// Datos válidos del Paso 2. El folio es un trámite real en DEV (estatus Rechazado);
// se puede sobrescribir desde .env con FOLIO_RECONSIDERACION
export const DATOS_RECONSIDERACION = {
  primerNombre: "JUANA",
  primerApellido: "REYES",
  correo: "a.reyes@nelumbo.com.co",
  folio: process.env.FOLIO_RECONSIDERACION || "SURA1781710680MX",
  motivo: "SOLICITO REVISIÓN DEL DICTAMEN EMITIDO",
};

export const campoReconsideracion = (page, campo) =>
  page.locator(`#${CAMPOS_RECONSIDERACION[campo]}`);

/** Selecciona Reconsideración en el Paso 1 y avanza al Paso 2 - Tu reconsideración. */
export async function irAPaso2Reconsideracion(page) {
  await abrirPaso1YSeleccionar(page, "reconsideracion");
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByText("PASO 2 · TU RECONSIDERACIÓN")).toBeVisible();
}

/** Llena los campos del Paso 2 con `datos` (por defecto los obligatorios válidos). */
export async function llenarPaso2Reconsideracion(page, datos = DATOS_RECONSIDERACION) {
  for (const [campo, valor] of Object.entries(datos)) {
    await campoReconsideracion(page, campo).fill(valor);
  }
}

/** Completa el Paso 2 con datos válidos y avanza al Paso 3 - Documentos. */
export async function irAPaso3Reconsideracion(page, datos = DATOS_RECONSIDERACION) {
  await irAPaso2Reconsideracion(page);
  await llenarPaso2Reconsideracion(page, datos);
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByText("PASO 3 · DOCUMENTOS")).toBeVisible();
}

/** Marca "No soy un robot" en el Paso 4 - Revisión. */
export async function marcarNoSoyRobot(page) {
  const robot = page.locator("label").filter({ hasText: "No soy un robot" });
  await robot.click();
  await expect(robot.getByRole("checkbox")).toBeChecked();
}

/** Marca "No soy un robot", presiona Finalizar trámite y confirma con "Sí, finalizar trámite". */
export async function finalizarTramite(page) {
  await marcarNoSoyRobot(page);
  await page.getByRole("button", { name: "Finalizar trámite" }).click();
  await page.getByRole("button", { name: "Sí, finalizar trámite" }).click();
}

/** Completa los Pasos 2 y 3 (carga `archivos`) y avanza al Paso 4 - Revisión. */
export async function irAPaso4Reconsideracion(page, archivos = [ARCHIVOS_PRUEBA.pdf], datos = DATOS_RECONSIDERACION) {
  await irAPaso3Reconsideracion(page, datos);
  await cargarDocumentos(page, archivos);
  await page.getByRole("button", { name: "Continuar" }).click();
  await expect(page.getByText("PASO 4 · REVISIÓN")).toBeVisible();
}
