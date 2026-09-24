// tests/reconsideracion/P3HU_20865.spec.js
// HU 20865 - Carga de documentos de Reconsideración (Reconsideración)
import { test, expect } from "@playwright/test";
import path from "node:path";
import {
  ARCHIVOS_PRUEBA,
  archivosCargados,
  cargarDocumentos,
  irAPaso3Reconsideracion,
  llenarPaso2Reconsideracion,
} from "../helpers/navegacion.js";

const TEXTOS = {
  paso3: "PASO 3 · DOCUMENTOS",
  titulo: "Carga tus documentos",
  apoyo: "Adjunta los documentos que respaldan tu reconsideración.",
  zonaTitulo: "Arrastra tus archivos aquí",
  zonaDetalle:
    "o selecciónalos desde tu dispositivo · Formatos permitidos: pdf, doc, docx, xls, xlsx, ppt, pptx, jpg, jpeg, png, gif, zip, rar, 7z, txt, raw, svg, eml, xlsm, msg · máx. 15 MB c/u",
  excede: "El archivo supera el máximo de 15 MB.",
  sinDocumentos: "Necesitas cargar al menos un documento para continuar.",
  paso2: "PASO 2 · TU RECONSIDERACIÓN",
  paso4: "PASO 4 · REVISIÓN",
  modalTitulo: "¿Quieres reiniciar tu solicitud?",
  modalMensaje:
    "Al reiniciar, perderás la información que has ingresado hasta ahora y volverás al inicio del trámite. Esta acción no se puede deshacer.",
};

// Archivos reales de data/ con el tipo y tamaño que debe mostrar la lista (CA07)
const REALES = [
  { ruta: ARCHIVOS_PRUEBA.pdf, nombre: "PRUEBA.pdf", tipo: "PDF", tamano: "2.1 KB" },
  { ruta: ARCHIVOS_PRUEBA.png, nombre: "PRUEBA.png", tipo: "PNG", tamano: "5.2 KB" },
  { ruta: ARCHIVOS_PRUEBA.xlsx, nombre: "PRUEBA.xlsx", tipo: "XLSX", tamano: "7.4 KB" },
];

// Un archivo real de data/ por cada formato permitido (CA03), con el tipo que muestra la lista
const DATA = (nombre) => path.resolve(__dirname, "../../data", nombre);
const FORMATOS_PERMITIDOS = [
  "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "jpg", "jpeg", "png",
  "gif", "zip", "rar", "7z", "txt", "raw", "svg", "eml", "xlsm", "msg",
].map((ext) => ({ ruta: DATA(`PRUEBA.${ext}`), nombre: `PRUEBA.${ext}`, tipo: ext.toUpperCase() }));

// Archivos reales fuera de las condiciones permitidas
const FORMATOS_NO_PERMITIDOS = ["INVALIDO.md", "INVALIDO.mhtml", "INVALIDO.mpeg"];
const ARCHIVO_PESADO = { ruta: DATA("PDF_15 MB.pdf"), nombre: "PDF_15 MB.pdf" }; // pesa 37.7 MB
// Mensaje de la app para formatos no permitidos (no está en la HU)
const FORMATO_NO_PERMITIDO = "Formato no permitido. Solo se permiten archivos en formatos autorizados.";

// Archivos generados en memoria (para arrastrar, y 1 byte por encima del límite de 15 MB)
const MB = 1024 * 1024;
const generado = (name, bytes) => ({ name, mimeType: "application/pdf", buffer: Buffer.alloc(bytes, "A") });
const EXCEDE_15MB = generado("excede_15MB.pdf", 15 * MB + 1);

// Ícono verde de "Carga exitosa" de cada archivo
const VERDE_CARGA_EXITOSA = "rgb(0, 138, 75)";

test.describe("HU 20865 - Reconsideración", () => {
  const continuar = (page) => page.getByRole("button", { name: "Continuar" });
  const atras = (page) => page.getByRole("button", { name: "Atrás" });
  const btnSeleccionar = (page) => page.getByRole("button", { name: "Seleccionar archivos" });
  const zonaCarga = (page) => page.getByText(TEXTOS.zonaTitulo, { exact: true }).locator("xpath=..");
  const avisoSinDocumentos = (page) => page.getByText(TEXTOS.sinDocumentos, { exact: true });
  const mensajeExcede = (page) => page.getByText(TEXTOS.excede, { exact: true });
  const btnEliminar = (page, nombre) => page.getByRole("button", { name: `Eliminar archivo ${nombre}`, exact: true });
  const archivo = (page, nombre) => btnEliminar(page, nombre).locator("xpath=..");

  const cantidadCargados = (n) => new RegExp(`^ARCHIVOS CARGADOS \\(${n}\\)$`, "i");

  /** Selecciona todos los `archivos` a la vez desde "Seleccionar archivos". */
  async function seleccionarArchivos(page, archivos) {
    const selector = page.waitForEvent("filechooser");
    await btnSeleccionar(page).click();
    await (await selector).setFiles(archivos);
  }

  /**
   * Suelta `archivos` sobre la zona de carga. El arrastre desde el sistema operativo no se puede
   * automatizar: se simulan los eventos dragenter/dragover/drop con un DataTransfer real del navegador.
   */
  async function arrastrarArchivos(page, archivos) {
    const datos = archivos.map((a) => ({ name: a.name, type: a.mimeType, b64: a.buffer.toString("base64") }));
    const dataTransfer = await page.evaluateHandle((lista) => {
      const dt = new DataTransfer();
      for (const { name, type, b64 } of lista) {
        dt.items.add(new File([Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))], name, { type }));
      }
      return dt;
    }, datos);
    for (const evento of ["dragenter", "dragover", "drop"]) {
      await zonaCarga(page).dispatchEvent(evento, { dataTransfer });
    }
  }

  async function abrirModalReiniciar(page) {
    await page.getByRole("button", { name: "Reiniciar" }).click();
    const modal = page.getByRole("alertdialog");
    await expect(modal).toBeVisible();
    return modal;
  }

  async function validarDocumentosConservados(page, nombres) {
    await expect(archivosCargados(page)).toHaveText(cantidadCargados(nombres.length));
    for (const nombre of nombres) {
      await expect(archivo(page, nombre)).toBeVisible();
    }
  }

  test.beforeEach(async ({ page }) => {
    await irAPaso3Reconsideracion(page);
  });

  test("CA01 - Al completar los datos se muestra la pantalla Carga tus documentos", async ({ page }) => {
    await expect(page.getByText(TEXTOS.paso3)).toBeVisible();
    await expect(page.getByRole("heading", { name: TEXTOS.titulo })).toBeVisible();
  });

  test("CA02 - Muestra el texto de apoyo", async ({ page }) => {
    await expect(page.getByText(TEXTOS.apoyo, { exact: true })).toBeVisible();
  });

  test("CA03 - Zona de carga con área de arrastre, texto de formatos y Seleccionar archivos", async ({ page }) => {
    await expect(zonaCarga(page)).toBeVisible();
    await expect(page.getByText(TEXTOS.zonaTitulo, { exact: true })).toBeVisible();
    await expect(page.getByText(TEXTOS.zonaDetalle, { exact: true })).toBeVisible();
    await expect(btnSeleccionar(page)).toBeEnabled();

    // La acción abre el selector de archivos del dispositivo, que admite varios archivos
    const selector = page.waitForEvent("filechooser");
    await btnSeleccionar(page).click();
    expect((await selector).isMultiple()).toBe(true);
  });

  test("CA04 - Seleccionar archivos carga un archivo y lo muestra en Archivos cargados", async ({ page }) => {
    await seleccionarArchivos(page, [ARCHIVOS_PRUEBA.pdf]);

    await expect(archivosCargados(page)).toHaveText(cantidadCargados(1));
    await expect(archivo(page, "PRUEBA.pdf")).toBeVisible();
  });

  test("CA04 - Seleccionar varios archivos a la vez los carga todos", async ({ page }) => {
    await seleccionarArchivos(page, REALES.map((a) => a.ruta));

    await expect(archivosCargados(page)).toHaveText(cantidadCargados(REALES.length), { timeout: 30000 });
    for (const { nombre } of REALES) {
      await expect(archivo(page, nombre)).toBeVisible();
    }
  });

  test("CA04 - Arrastrar un archivo a la zona de carga lo carga", async ({ page }) => {
    await arrastrarArchivos(page, [generado("arrastrado.pdf", 2048)]);

    await expect(archivosCargados(page)).toHaveText(cantidadCargados(1));
    await expect(archivo(page, "arrastrado.pdf")).toBeVisible();
  });

  test("CA04 - Arrastrar varios archivos a la vez los carga todos", async ({ page }) => {
    const nombres = ["arrastrado_1.pdf", "arrastrado_2.pdf", "arrastrado_3.pdf"];
    await arrastrarArchivos(page, nombres.map((n) => generado(n, 2048)));

    await expect(archivosCargados(page)).toHaveText(cantidadCargados(nombres.length), { timeout: 30000 });
    for (const nombre of nombres) {
      await expect(archivo(page, nombre)).toBeVisible();
    }
  });

  test("CA04 - Carga un archivo de cada formato permitido y muestra su tipo", async ({ page }) => {
    test.setTimeout(120000);
    await cargarDocumentos(page, FORMATOS_PERMITIDOS.map((a) => a.ruta));

    await expect(archivosCargados(page)).toHaveText(cantidadCargados(FORMATOS_PERMITIDOS.length));
    for (const { nombre, tipo } of FORMATOS_PERMITIDOS) {
      await expect(archivo(page, nombre).getByText(tipo, { exact: true }), nombre).toBeVisible();
    }
  });

  for (const nombre of FORMATOS_NO_PERMITIDOS) {
    test(`CA04 - Formato no permitido (${path.extname(nombre)}) no se carga`, async ({ page }) => {
      await seleccionarArchivos(page, [DATA(nombre)]);

      await expect(page.getByText(FORMATO_NO_PERMITIDO, { exact: true })).toBeVisible();
      await expect(archivo(page, nombre)).toHaveCount(0);
      await expect(archivosCargados(page)).toBeHidden();
      await expect(continuar(page)).toBeDisabled();
    });
  }

  test("CA05 - Archivo real de 37.7 MB no se carga y muestra mensaje", async ({ page }) => {
    await seleccionarArchivos(page, [ARCHIVO_PESADO.ruta]);

    await expect(mensajeExcede(page)).toBeVisible();
    await expect(archivo(page, ARCHIVO_PESADO.nombre)).toHaveCount(0);
    await expect(archivosCargados(page)).toBeHidden();
    await expect(continuar(page)).toBeDisabled();
  });

  test("CA05 - Archivo mayor a 15 MB no se carga y muestra mensaje", async ({ page }) => {
    await seleccionarArchivos(page, [EXCEDE_15MB]);

    await expect(mensajeExcede(page)).toBeVisible();
    await expect(archivo(page, EXCEDE_15MB.name)).toHaveCount(0);
    await expect(archivosCargados(page)).toBeHidden();
    await expect(continuar(page)).toBeDisabled();
  });

  test("CA05 - Archivo mayor a 15 MB arrastrado no se carga y muestra mensaje", async ({ page }) => {
    await arrastrarArchivos(page, [EXCEDE_15MB]);

    await expect(mensajeExcede(page)).toBeVisible();
    await expect(archivo(page, EXCEDE_15MB.name)).toHaveCount(0);
    await expect(continuar(page)).toBeDisabled();
  });

  test("CA06 - Sin documentos Continuar está deshabilitado y el aviso aparece bajo la zona de carga", async ({ page }) => {
    await expect(archivosCargados(page)).toBeHidden();
    await expect(continuar(page)).toBeDisabled();
    await expect(avisoSinDocumentos(page)).toBeVisible();

    // Posición: debajo de la zona de carga y antes del pie (Atrás / Continuar)
    const zona = await zonaCarga(page).boundingBox();
    const aviso = await avisoSinDocumentos(page).boundingBox();
    const pie = await atras(page).boundingBox();
    expect(aviso.y).toBeGreaterThanOrEqual(zona.y + zona.height);
    expect(aviso.y + aviso.height).toBeLessThanOrEqual(pie.y);
  });

  test("CA07 - Archivos cargados muestra cantidad, nombre, tipo, tamaño y Carga exitosa", async ({ page }) => {
    await cargarDocumentos(page, REALES.map((a) => a.ruta));

    await expect(archivosCargados(page)).toHaveText(cantidadCargados(REALES.length));
    for (const { nombre, tipo, tamano } of REALES) {
      const fila = archivo(page, nombre);
      await expect(fila.getByText(nombre, { exact: true })).toBeVisible();
      await expect(fila.getByText(tipo, { exact: true })).toBeVisible();
      await expect(fila.getByText(tamano, { exact: true })).toBeVisible();
      await expect(fila.locator("div.rounded-full").first()).toHaveCSS("background-color", VERDE_CARGA_EXITOSA);
    }
  });

  test("CA07 - Varios archivos a la vez: carga los de hasta 15 MB y rechaza los que exceden", async ({ page }) => {
    const permitido = generado("permitido.pdf", 2048);
    await seleccionarArchivos(page, [permitido, EXCEDE_15MB]);

    await expect(mensajeExcede(page)).toBeVisible();
    await expect(archivosCargados(page)).toHaveText(cantidadCargados(1));
    await expect(archivo(page, permitido.name)).toBeVisible();
    await expect(archivo(page, EXCEDE_15MB.name)).toHaveCount(0);
    await expect(continuar(page)).toBeEnabled();
  });

  test("CA07 - Mezcla a la vez de válidos, formatos no permitidos y pesado: solo carga los válidos", async ({ page }) => {
    await seleccionarArchivos(page, [
      DATA("PRUEBA.pdf"),
      DATA("PRUEBA.docx"),
      ...FORMATOS_NO_PERMITIDOS.map(DATA),
      ARCHIVO_PESADO.ruta,
    ]);

    await expect(mensajeExcede(page)).toBeVisible();
    await expect(archivosCargados(page)).toHaveText(cantidadCargados(2), { timeout: 30000 });
    await expect(archivo(page, "PRUEBA.pdf")).toBeVisible();
    await expect(archivo(page, "PRUEBA.docx")).toBeVisible();
    for (const nombre of [...FORMATOS_NO_PERMITIDOS, ARCHIVO_PESADO.nombre]) {
      await expect(archivo(page, nombre), nombre).toHaveCount(0);
    }
  });

  test("CA07 - Todos los formatos permitidos a la vez junto con inválidos y pesado: carga los 20 válidos", async ({ page }) => {
    test.setTimeout(90000);
    await seleccionarArchivos(page, [
      ...FORMATOS_PERMITIDOS.map((a) => a.ruta),
      ...FORMATOS_NO_PERMITIDOS.map(DATA),
      ARCHIVO_PESADO.ruta,
    ]);

    await expect(mensajeExcede(page)).toBeVisible();
    await expect(archivosCargados(page)).toHaveText(cantidadCargados(FORMATOS_PERMITIDOS.length), { timeout: 60000 });
    for (const { nombre } of FORMATOS_PERMITIDOS) {
      await expect(archivo(page, nombre), nombre).toBeVisible();
    }
  });

  test("CA08 - Cada archivo cargado tiene la opción Eliminar", async ({ page }) => {
    await cargarDocumentos(page, REALES.map((a) => a.ruta));

    for (const { nombre } of REALES) {
      await expect(btnEliminar(page, nombre)).toBeVisible();
      await expect(btnEliminar(page, nombre)).toBeEnabled();
    }
  });

  test("CA09 - Eliminar un archivo actualiza la cantidad de Archivos cargados", async ({ page }) => {
    await cargarDocumentos(page, REALES.map((a) => a.ruta));
    await btnEliminar(page, "PRUEBA.png").click();

    await expect(archivosCargados(page)).toHaveText(cantidadCargados(2));
    await expect(archivo(page, "PRUEBA.png")).toHaveCount(0);
    await expect(archivo(page, "PRUEBA.pdf")).toBeVisible();
    await expect(archivo(page, "PRUEBA.xlsx")).toBeVisible();
  });

  test("CA10 - Al eliminar todos los archivos Continuar vuelve a deshabilitarse", async ({ page }) => {
    await cargarDocumentos(page, [ARCHIVOS_PRUEBA.pdf, ARCHIVOS_PRUEBA.png]);
    await expect(continuar(page)).toBeEnabled();

    await btnEliminar(page, "PRUEBA.pdf").click();
    await expect(continuar(page)).toBeEnabled();
    await btnEliminar(page, "PRUEBA.png").click();

    await expect(archivosCargados(page)).toBeHidden();
    await expect(continuar(page)).toBeDisabled();
    await expect(avisoSinDocumentos(page)).toBeVisible();
  });

  test("CA11 - Con un documento válido cargado Continuar se habilita", async ({ page }) => {
    await expect(continuar(page)).toBeDisabled();
    await cargarDocumentos(page, [ARCHIVOS_PRUEBA.pdf]);

    await expect(continuar(page)).toBeEnabled();
    await expect(avisoSinDocumentos(page)).toBeHidden();
  });

  test("CA12 - Continuar avanza al paso de revisión de la reconsideración", async ({ page }) => {
    await cargarDocumentos(page, [ARCHIVOS_PRUEBA.pdf]);
    await continuar(page).click();

    await expect(page.getByText(TEXTOS.paso4)).toBeVisible();
    await expect(page.getByText(TEXTOS.paso3)).toBeHidden();
  });

  test("CA13 - Pie con Atrás y Continuar, y el aviso sin documentos no los oculta", async ({ page }) => {
    await expect(avisoSinDocumentos(page)).toBeVisible();
    await expect(atras(page)).toBeVisible();
    await expect(atras(page)).toBeEnabled();
    await expect(continuar(page)).toBeVisible();

    const aviso = await avisoSinDocumentos(page).boundingBox();
    for (const boton of [atras(page), continuar(page)]) {
      expect((await boton.boundingBox()).y).toBeGreaterThanOrEqual(aviso.y + aviso.height);
    }
  });

  test("CA14 - Atrás regresa al Paso 2 - Tu reconsideración", async ({ page }) => {
    await atras(page).click();

    await expect(page.getByText(TEXTOS.paso2)).toBeVisible();
    await expect(page.getByText(TEXTOS.paso3)).toBeHidden();
  });

  test("CA15 - Al regresar al Paso 2 y volver se conservan los documentos", async ({ page }) => {
    await cargarDocumentos(page, [ARCHIVOS_PRUEBA.pdf, ARCHIVOS_PRUEBA.png]);
    await atras(page).click();
    await expect(page.getByText(TEXTOS.paso2)).toBeVisible();
    await continuar(page).click();

    await expect(page.getByText(TEXTOS.paso3)).toBeVisible();
    await validarDocumentosConservados(page, ["PRUEBA.pdf", "PRUEBA.png"]);
    await expect(continuar(page)).toBeEnabled();
  });

  test("CA15 - Al continuar a la revisión y regresar se conservan los documentos", async ({ page }) => {
    await cargarDocumentos(page, [ARCHIVOS_PRUEBA.pdf, ARCHIVOS_PRUEBA.png]);
    await continuar(page).click();
    await expect(page.getByText(TEXTOS.paso4)).toBeVisible();
    await atras(page).click();

    await expect(page.getByText(TEXTOS.paso3)).toBeVisible();
    await validarDocumentosConservados(page, ["PRUEBA.pdf", "PRUEBA.png"]);
  });

  test("CA16 - Reiniciar muestra modal de confirmación con textos y acciones", async ({ page }) => {
    const modal = await abrirModalReiniciar(page);

    await expect(modal.getByRole("heading", { name: TEXTOS.modalTitulo })).toBeVisible();
    await expect(modal.getByText(TEXTOS.modalMensaje)).toBeVisible();
    await expect(modal.getByRole("button", { name: "Continuar solicitud" })).toBeVisible();
    await expect(modal.getByRole("button", { name: "Sí, reiniciar" })).toBeVisible();
  });

  test("CA16 - Continuar solicitud cierra el modal sin perder los documentos", async ({ page }) => {
    await cargarDocumentos(page, [ARCHIVOS_PRUEBA.pdf]);
    const modal = await abrirModalReiniciar(page);
    await modal.getByRole("button", { name: "Continuar solicitud" }).click();

    await expect(modal).toBeHidden();
    await expect(page.getByText(TEXTOS.paso3)).toBeVisible();
    await validarDocumentosConservados(page, ["PRUEBA.pdf"]);
  });

  test("CA16 - Sí, reiniciar regresa al inicio del trámite y descarta los documentos", async ({ page }) => {
    await cargarDocumentos(page, [ARCHIVOS_PRUEBA.pdf]);
    const modal = await abrirModalReiniciar(page);
    await modal.getByRole("button", { name: "Sí, reiniciar" }).click();

    await expect(modal).toBeHidden();
    await expect(page.getByText("PASO 1 · EMPECEMOS")).toBeVisible();
    await expect(page.getByRole("radio").and(page.locator('[aria-checked="true"]'))).toHaveCount(0);

    // Al volver a recorrer el flujo no queda ningún documento cargado
    await page.getByRole("radio", { name: "Reconsideración" }).click();
    await continuar(page).click();
    await llenarPaso2Reconsideracion(page);
    await continuar(page).click();
    await expect(page.getByText(TEXTOS.paso3)).toBeVisible();
    await expect(archivosCargados(page)).toBeHidden();
    await expect(continuar(page)).toBeDisabled();
  });
});
