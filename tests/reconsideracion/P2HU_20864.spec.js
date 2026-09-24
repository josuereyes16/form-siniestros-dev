// tests/reconsideracion/P2HU_20864.spec.js
// HU 20864 - Captura de datos de Reconsideración (Reconsideración)
import { test, expect } from "@playwright/test";
import {
  CAMPOS_RECONSIDERACION,
  DATOS_RECONSIDERACION,
  campoReconsideracion,
  irAPaso2Reconsideracion,
  llenarPaso2Reconsideracion,
} from "../helpers/navegacion.js";

const TEXTOS = {
  paso2: "PASO 2 · TU RECONSIDERACIÓN",
  titulo: "Datos de tu reconsideración",
  apoyo: "Pides revisar de nuevo una resolución previa. Llena los datos del trámite y dinos el motivo.",
  notaContacto: "Se recomienda agregar el mismo contacto que compartiste en la reclamación inicial.",
  ayudaFolio: "Ejemplo: SURA1782488772MX",
  ayudaMotivo: "Cuéntanos qué información o motivos tienes para solicitar la reconsideración.",
  folioInvalido: "Solo se permite el siguiente formato: SURA1234567890MX",
  motivoMinimo: "Mínimo 10 caracteres.",
  requerido: "Este campo es requerido (*).",
  nombreInvalido: "Solo se permiten letras, espacios, apóstrofo y guion.",
  correoInvalido: "Ingresa un correo electrónico válido.",
  paso3: "PASO 3 · DOCUMENTOS",
  modalTitulo: "¿Quieres reiniciar tu solicitud?",
  modalMensaje:
    "Al reiniciar, perderás la información que has ingresado hasta ahora y volverás al inicio del trámite. Esta acción no se puede deshacer.",
};

const OBLIGATORIOS = {
  primerNombre: "Primer nombre",
  primerApellido: "Primer apellido",
  correo: "Correo de contacto",
  folio: "Folio del trámite a reconsiderar",
  motivo: "Motivo de la reconsideración",
};
const OPCIONALES = { segundoNombre: "Segundo nombre", segundoApellido: "Segundo apellido" };
const NOMBRES = {
  primerNombre: OBLIGATORIOS.primerNombre,
  segundoNombre: OPCIONALES.segundoNombre,
  primerApellido: OBLIGATORIOS.primerApellido,
  segundoApellido: OPCIONALES.segundoApellido,
};

const PLACEHOLDERS = {
  primerNombre: "Primer nombre",
  segundoNombre: "Segundo nombre",
  primerApellido: "Primer apellido",
  segundoApellido: "Segundo apellido",
  correo: "tucorreo@ejemplo.com",
  folio: "SURA1782488772MX",
  motivo: "Ej. Solicito reconsideración de mi trámite debido a...",
};

// Indicador visual de error en el campo (CA08)
const ROJO_ERROR = "rgb(209, 45, 53)";

// Compara el texto sin distinguir mayúsculas y con el punto final opcional:
// la app muestra "Primer Nombre" y los mensajes sin punto, a diferencia de la HU
const textoHU = (texto) => {
  const base = texto.replace(/\.$/, "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${base}\\.?$`, "i");
};

test.describe("HU 20864 - Reconsideración", () => {
  const campo = campoReconsideracion;
  const id = (nombre) => CAMPOS_RECONSIDERACION[nombre];
  const error = (page, nombre) => page.locator(`#${id(nombre)}-error`);
  const ayuda = (page, nombre) => page.locator(`#${id(nombre)}-helper`);
  const etiqueta = (page, nombre) => page.locator(`label[for="${id(nombre)}"]`);
  const continuar = (page) => page.getByRole("button", { name: "Continuar" });
  const atras = (page) => page.getByRole("button", { name: "Atrás" });
  const tituloPaso1 = (page) => page.getByText("PASO 1 · EMPECEMOS");

  /** Escribe `valor` en el campo y sale de él para que la app lo valide. */
  async function capturar(page, nombre, valor) {
    await campo(page, nombre).fill(valor);
    await campo(page, nombre).blur();
  }

  /** Llena los obligatorios válidos y deja `nombre` con `valor` (validado al salir del campo). */
  async function llenarCon(page, nombre, valor) {
    await llenarPaso2Reconsideracion(page);
    await capturar(page, nombre, valor);
  }

  async function validarError(page, nombre, mensaje) {
    await expect(error(page, nombre)).toHaveText(textoHU(mensaje));
    await expect(campo(page, nombre)).toHaveAttribute("aria-invalid", "true");
    await expect(campo(page, nombre)).toHaveCSS("border-color", ROJO_ERROR);
  }

  async function validarSinError(page, nombre) {
    await expect(error(page, nombre)).toBeHidden();
    await expect(campo(page, nombre)).not.toHaveAttribute("aria-invalid", "true");
  }

  async function abrirModalReiniciar(page) {
    await page.getByRole("button", { name: "Reiniciar" }).click();
    const modal = page.getByRole("alertdialog");
    await expect(modal).toBeVisible();
    return modal;
  }

  test.beforeEach(async ({ page }) => {
    await irAPaso2Reconsideracion(page);
  });

  test("CA01 - Continuar desde Reconsideración muestra la pantalla Datos de tu reconsideración", async ({ page }) => {
    await expect(page.getByText(TEXTOS.paso2)).toBeVisible();
    await expect(page.getByText(TEXTOS.titulo, { exact: true })).toBeVisible();
  });

  test("CA02 - Muestra el texto de apoyo del Paso 2", async ({ page }) => {
    await expect(page.getByText(TEXTOS.apoyo, { exact: true })).toBeVisible();
  });

  test("CA03 - Sección Contacto muestra la nota informativa", async ({ page }) => {
    await expect(page.getByText("CONTACTO", { exact: true })).toBeVisible();
    await expect(page.getByText(TEXTOS.notaContacto, { exact: true })).toBeVisible();
  });

  test("CA04 - Campos obligatorios marcados con * y opcionales sin marca", async ({ page }) => {
    for (const [nombre, texto] of Object.entries(OBLIGATORIOS)) {
      await expect(etiqueta(page, nombre), texto).toHaveText(new RegExp(`^${texto}\\s*\\*$`, "i"));
    }
    for (const [nombre, texto] of Object.entries(OPCIONALES)) {
      await expect(etiqueta(page, nombre), texto).toHaveText(new RegExp(`^${texto}$`, "i"));
    }

    // Los opcionales vacíos no muestran error ni impiden continuar
    await llenarPaso2Reconsideracion(page);
    for (const nombre of Object.keys(OPCIONALES)) {
      await capturar(page, nombre, "");
      await validarSinError(page, nombre);
    }
    await expect(continuar(page)).toBeEnabled();
  });

  test("CA05 - Campos vacíos muestran sus placeholders", async ({ page }) => {
    for (const [nombre, placeholder] of Object.entries(PLACEHOLDERS)) {
      await expect(campo(page, nombre), nombre).toHaveValue("");
      await expect(campo(page, nombre), nombre).toHaveAttribute("placeholder", textoHU(placeholder));
    }
  });

  test("CA06 - Folio muestra la ayuda y acepta el formato SURA + 10 dígitos + MX", async ({ page }) => {
    await expect(ayuda(page, "folio")).toHaveText(TEXTOS.ayudaFolio);

    await llenarCon(page, "folio", "SURA1782488772MX");
    await validarSinError(page, "folio");
    await expect(continuar(page)).toBeEnabled();
  });

  const FOLIOS_INVALIDOS = [
    { caso: "9 dígitos", valor: "SURA178248877MX" },
    { caso: "11 dígitos", valor: "SURA17824887720MX" },
    { caso: "prefijo distinto a SURA", valor: "SURB1782488772MX" },
    { caso: "sufijo distinto a MX", valor: "SURA1782488772MY" },
    { caso: "letras en la parte numérica", valor: "SURA17824887A2MX" },
    { caso: "caracteres especiales", valor: "SURA-1782488772MX" },
  ];

  for (const { caso, valor } of FOLIOS_INVALIDOS) {
    test(`CA06 - Folio con formato inválido (${caso}) muestra mensaje y no permite continuar`, async ({ page }) => {
      await llenarCon(page, "folio", valor);

      await validarError(page, "folio", TEXTOS.folioInvalido);
      await expect(continuar(page)).toBeDisabled();
    });
  }

  test("CA07 - Motivo muestra la ayuda y acepta desde 10 caracteres", async ({ page }) => {
    await expect(ayuda(page, "motivo")).toHaveText(TEXTOS.ayudaMotivo);

    await llenarCon(page, "motivo", "1234567890");
    await validarSinError(page, "motivo");
    await expect(continuar(page)).toBeEnabled();
  });

  test("CA07 - Motivo con menos de 10 caracteres muestra \"Mínimo 10 caracteres.\"", async ({ page }) => {
    await llenarCon(page, "motivo", "123456789");

    await validarError(page, "motivo", TEXTOS.motivoMinimo);
    await expect(continuar(page)).toBeDisabled();
  });

  test("CA07 - Motivo no permite ingresar más de 500 caracteres", async ({ page }) => {
    await llenarCon(page, "motivo", "A".repeat(500));
    await campo(page, "motivo").pressSequentially("BCD");

    await expect(campo(page, "motivo")).toHaveValue("A".repeat(500));
    await validarSinError(page, "motivo");
    await expect(continuar(page)).toBeEnabled();
  });

  test("CA08 - Obligatorios vacíos: no permite avanzar y marcan error en cada campo", async ({ page }) => {
    await expect(continuar(page)).toBeDisabled();

    for (const nombre of Object.keys(OBLIGATORIOS)) {
      await capturar(page, nombre, "");
    }
    for (const nombre of Object.keys(OBLIGATORIOS)) {
      await validarError(page, nombre, TEXTOS.requerido);
    }
    await expect(continuar(page)).toBeDisabled();
  });

  for (const [nombre, texto] of Object.entries(OBLIGATORIOS)) {
    test(`CA08 - ${texto} vacío con el resto completo no permite avanzar`, async ({ page }) => {
      await llenarCon(page, nombre, "");

      await validarError(page, nombre, TEXTOS.requerido);
      await expect(continuar(page)).toBeDisabled();
    });
  }

  test("CA09 - Obligatorios válidos (sin opcionales) habilitan Continuar", async ({ page }) => {
    await expect(continuar(page)).toBeDisabled();
    await llenarPaso2Reconsideracion(page);

    for (const nombre of Object.keys(OPCIONALES)) {
      await expect(campo(page, nombre)).toHaveValue("");
    }
    await expect(continuar(page)).toBeEnabled();
  });

  const NOMBRES_VALIDOS = ["JOSÉ MARÍA", "O'NEIL", "ANA-LUZ", "ÑUÑO"];
  const NOMBRES_INVALIDOS = [
    { caso: "números", valor: "JUAN1" },
    { caso: "arroba", valor: "JUAN@" },
    { caso: "punto", valor: "JUAN." },
    { caso: "guion bajo", valor: "JUAN_" },
  ];

  for (const [nombre, texto] of Object.entries(NOMBRES)) {
    test(`CA10 - ${texto} acepta letras, espacios, acentos, apóstrofes y guiones`, async ({ page }) => {
      await llenarPaso2Reconsideracion(page);
      for (const valor of NOMBRES_VALIDOS) {
        await capturar(page, nombre, valor);
        await validarSinError(page, nombre);
        await expect(continuar(page), valor).toBeEnabled();
      }
    });

    test(`CA10 - ${texto} con números o caracteres especiales muestra mensaje y no permite continuar`, async ({ page }) => {
      await llenarPaso2Reconsideracion(page);
      for (const { caso, valor } of NOMBRES_INVALIDOS) {
        await capturar(page, nombre, valor);
        await validarError(page, nombre, TEXTOS.nombreInvalido);
        await expect(continuar(page), caso).toBeDisabled();
      }
    });
  }

  test("CA10 - Primer nombre y Primer apellido vacíos muestran campo requerido", async ({ page }) => {
    await capturar(page, "primerNombre", "");
    await capturar(page, "primerApellido", "");

    await validarError(page, "primerNombre", TEXTOS.requerido);
    await validarError(page, "primerApellido", TEXTOS.requerido);
  });

  test("CA11 - Correo con formato usuario@dominio.extensión es válido", async ({ page }) => {
    for (const valor of [DATOS_RECONSIDERACION.correo, "usuario@dominio.mx"]) {
      await llenarCon(page, "correo", valor);
      await validarSinError(page, "correo");
      await expect(continuar(page), valor).toBeEnabled();
    }
  });

  const CORREOS_INVALIDOS = [
    { caso: "sin @", valor: "usuariodominio.com" },
    { caso: "más de un @", valor: "usuario@@dominio.com" },
    { caso: "sin texto antes del @", valor: "@dominio.com" },
    { caso: "sin texto después del @", valor: "usuario@" },
    { caso: "dominio sin punto", valor: "usuario@dominio" },
    { caso: "sin extensión después del punto", valor: "usuario@dominio." },
    { caso: "sin dominio antes del punto", valor: "usuario@.com" },
  ];

  for (const { caso, valor } of CORREOS_INVALIDOS) {
    test(`CA11 - Correo inválido (${caso}) muestra mensaje y no permite avanzar`, async ({ page }) => {
      await llenarCon(page, "correo", valor);

      await validarError(page, "correo", TEXTOS.correoInvalido);
      await expect(continuar(page)).toBeDisabled();
    });
  }

  test("CA12 - Continuar con los obligatorios válidos avanza al Paso 3 - Documentos", async ({ page }) => {
    await llenarPaso2Reconsideracion(page);
    await continuar(page).click();

    await expect(page.getByText(TEXTOS.paso3)).toBeVisible();
    await expect(page.getByText(TEXTOS.paso2)).toBeHidden();
  });

  test("CA13 - Muestra las acciones Atrás y Continuar", async ({ page }) => {
    await expect(atras(page)).toBeVisible();
    await expect(atras(page)).toBeEnabled();
    await expect(continuar(page)).toBeVisible();
  });

  test("CA14 - Atrás regresa al Paso 1 - Empecemos", async ({ page }) => {
    await atras(page).click();

    await expect(tituloPaso1(page)).toBeVisible();
    await expect(page.getByText(TEXTOS.paso2)).toBeHidden();
  });

  const DATOS_COMPLETOS = { ...DATOS_RECONSIDERACION, segundoNombre: "MARÍA", segundoApellido: "GÓMEZ" };

  async function validarDatosConservados(page) {
    for (const [nombre, valor] of Object.entries(DATOS_COMPLETOS)) {
      await expect(campo(page, nombre), nombre).toHaveValue(valor);
    }
  }

  test("CA15 - Al regresar al Paso 1 y volver se conserva lo capturado", async ({ page }) => {
    await llenarPaso2Reconsideracion(page, DATOS_COMPLETOS);
    await atras(page).click();
    await expect(tituloPaso1(page)).toBeVisible();
    await continuar(page).click();

    await expect(page.getByText(TEXTOS.paso2)).toBeVisible();
    await validarDatosConservados(page);
  });

  test("CA15 - Al continuar al Paso 3 y regresar se conserva lo capturado", async ({ page }) => {
    await llenarPaso2Reconsideracion(page, DATOS_COMPLETOS);
    await continuar(page).click();
    await expect(page.getByText(TEXTOS.paso3)).toBeVisible();
    await atras(page).click();

    await expect(page.getByText(TEXTOS.paso2)).toBeVisible();
    await validarDatosConservados(page);
  });

  test("CA16 - Reiniciar muestra modal de confirmación con textos y acciones", async ({ page }) => {
    const modal = await abrirModalReiniciar(page);

    await expect(modal.getByRole("heading", { name: TEXTOS.modalTitulo })).toBeVisible();
    await expect(modal.getByText(TEXTOS.modalMensaje)).toBeVisible();
    await expect(modal.getByRole("button", { name: "Continuar solicitud" })).toBeVisible();
    await expect(modal.getByRole("button", { name: "Sí, reiniciar" })).toBeVisible();
  });

  test("CA16 - Continuar solicitud cierra el modal sin perder lo capturado", async ({ page }) => {
    await llenarPaso2Reconsideracion(page, DATOS_COMPLETOS);
    const modal = await abrirModalReiniciar(page);
    await modal.getByRole("button", { name: "Continuar solicitud" }).click();

    await expect(modal).toBeHidden();
    await expect(page.getByText(TEXTOS.paso2)).toBeVisible();
    await validarDatosConservados(page);
  });

  test("CA16 - Sí, reiniciar regresa al inicio del trámite y descarta lo capturado", async ({ page }) => {
    await llenarPaso2Reconsideracion(page, DATOS_COMPLETOS);
    const modal = await abrirModalReiniciar(page);
    await modal.getByRole("button", { name: "Sí, reiniciar" }).click();

    await expect(modal).toBeHidden();
    await expect(tituloPaso1(page)).toBeVisible();
    await expect(page.getByRole("radio").and(page.locator('[aria-checked="true"]'))).toHaveCount(0);

    await page.getByRole("radio", { name: "Reconsideración" }).click();
    await continuar(page).click();
    for (const nombre of Object.keys(DATOS_COMPLETOS)) {
      await expect(campo(page, nombre), nombre).toHaveValue("");
    }
  });
});
