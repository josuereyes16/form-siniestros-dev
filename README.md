# 🛡️ Automatización QA - Formulario de Reclamaciones SURA

Suite de pruebas automatizadas con **Playwright** para validar el formulario de reclamaciones/siniestros de **Seguros SURA México**, ejecutada sobre el ambiente de desarrollo.

![Playwright](https://img.shields.io/badge/Playwright-1.x-2EAD33?logo=playwright)
![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js)

---

## 📋 Descripción

Este proyecto contiene pruebas automatizadas para validar los principales flujos del formulario de reclamaciones/siniestros de SURA México.

Actualmente se automatizan los siguientes tipos de trámite:

| Trámite                | Descripción                                                                   |
| ---------------------- | ----------------------------------------------------------------------------- |
| 🆕 **Nueva solicitud** | Permite reportar un siniestro por primera vez.                                |
| 📄 **Complemento**     | Permite agregar información o documentos a un trámite previamente registrado. |
| 🔄 **Reconsideración** | Permite solicitar la revisión de una resolución previa.                       |
| 🕐 **Seguimiento**     | Permite consultar el avance y estado de un trámite mediante su folio.         |

### 🔗 Historias de usuario

| Trámite         | Paso   | HU       | Spec                                   |
| --------------- | ------ | -------- | -------------------------------------- |
| Nueva solicitud | Paso 2 | HU 27931 | `tests/nueva-solicitud/P2HU_27931.spec.js` |
| Nueva solicitud | Paso 5 | HU 28454 | `tests/nueva-solicitud/P5HU_28454.spec.js` |
| Complemento     | Paso 2 | —        | `tests/complemento/P2.spec.js`      |
| Reconsideración | Paso 1 | HU 20862 | `tests/reconsideracion/P1HU_20862.spec.js` |
| Reconsideración | Paso 2 | HU 20864 | `tests/reconsideracion/P2HU_20864.spec.js` |
| Reconsideración | Paso 3 | HU 20865 | `tests/reconsideracion/P3HU_20865.spec.js` |
| Reconsideración | Paso 4 | HU 20868 | `tests/reconsideracion/P4HU_20868.spec.js` |
| Reconsideración | Acuse (Paso 5) | HU 26607 | `tests/reconsideracion/P5HU_26607.spec.js` |
| Seguimiento     | Paso 1 | HU 24607 | `tests/seguimiento/P1HU_24607.spec.js` |

---

## 🗂️ Estructura del proyecto

```text
form-siniestros/
├── .github/
│   └── workflows/
│       └── playwright.yml
├── data/
│   ├── PRUEBA.<ext>          # uno por cada formato permitido (pdf, docx, png, zip, msg…)
│   ├── INVALIDO.<ext>        # formatos no permitidos (md, mhtml, mpeg)
│   ├── PDF_15 MB.pdf         # pesa 37.7 MB: supera el máximo de 15 MB
│   └── folios_generados.txt
├── reports/
│   └── reporte_<fecha>_<hora>/
├── scripts/
│   └── show-latest-report.js
├── tests/
│   ├── helpers/
│   │   └── navegacion.js
│   ├── nueva-solicitud/
│   │   ├── happy_path.spec.js
│   │   ├── P2HU_27931.spec.js
│   │   └── P5HU_28454.spec.js
│   ├── complemento/
│   │   ├── happy_path.spec.js
│   │   └── P2.spec.js
│   ├── reconsideracion/
│   │   ├── happy_path.spec.js
│   │   ├── P1HU_20862.spec.js
│   │   ├── P2HU_20864.spec.js
│   │   ├── P3HU_20865.spec.js
│   │   ├── P4HU_20868.spec.js
│   │   └── P5HU_26607.spec.js
│   └── seguimiento/
│       ├── happy_path.spec.js
│       └── P1HU_24607.spec.js
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── playwright.config.js
└── README.md
```

### 📁 `data/`

Contiene archivos utilizados como datos de prueba durante la ejecución de las automatizaciones, principalmente para validar la carga de documentos.

### 🧪 `tests/`

Una carpeta por flujo, con un archivo por HU (una HU por paso):

* `<flujo>/happy_path.spec.js` → camino feliz del flujo completo.
* `<flujo>/P<N>HU_<número>.spec.js` → validaciones de la HU del paso N contra sus criterios de aceptación (ej. `P1HU_24607.spec.js` = Paso 1, HU 24607). Mientras no se asocie la HU, el archivo se llama solo `P<N>.spec.js`.
* `helpers/navegacion.js` → funciones compartidas por todos los flujos (ej. abrir el Paso 1 y seleccionar un trámite, recargando si la página no responde, o llegar a un paso concreto como `irAPaso2Reconsideracion` / `irAPaso3Reconsideracion`), además de los campos y datos válidos de cada paso.

Para agregar la HU de un paso nuevo basta con crear `tests/<flujo>/P<N>HU_<número>.spec.js`: los comandos `:validaciones` y `:full` del flujo la incluyen automáticamente.

### 🛠️ `scripts/`

* `show-latest-report.js` → abre el reporte HTML más reciente de `reports/`.

### 🤖 `.github/workflows/`

Contiene la configuración de **GitHub Actions** utilizada para ejecutar las pruebas automatizadas de manera remota.

---

## ⚙️ Requisitos previos

* **Node.js** 18 o superior.
* **npm**, incluido con Node.js.
* **Git**.
* **Playwright**.

---

## 🚀 Instalación

Clonar el repositorio:

```bash
git clone <URL_DEL_REPOSITORIO>
```

Ingresar al proyecto:

```bash
cd form-siniestros
```

Instalar las dependencias:

```bash
npm install
```

Instalar los navegadores requeridos por Playwright:

```bash
npx playwright install
```

---

## ▶️ Ejecución de las pruebas

Los scripts están definidos en `package.json` y se ejecutan con `npm run <script>`.

Cada trámite tiene siempre estos comandos:

| Script                        | Ejecuta                                              |
| ----------------------------- | ---------------------------------------------------- |
| `test:<trámite>`              | Solo el camino feliz.                                |
| `test:<trámite>:p<N>`      | Solo las validaciones de la HU de ese paso.          |
| `test:<trámite>:validaciones` | Las validaciones de todas las HU del trámite.        |
| `test:<trámite>:full`         | Camino feliz + validaciones (toda la carpeta).       |

Trámites disponibles: `nueva-solicitud`, `complemento`, `reconsideracion`, `seguimiento`.

| Script                               | Comando                                                                     |
| ------------------------------------ | --------------------------------------------------------------------------- |
| `test:nueva-solicitud`               | `playwright test tests/nueva-solicitud/happy_path.spec.js --headed`    |
| `test:nueva-solicitud:p2`         | `playwright test tests/nueva-solicitud/P2 --headed`                      |
| `test:nueva-solicitud:p5`         | `playwright test tests/nueva-solicitud/P5 --headed`                      |
| `test:nueva-solicitud:validaciones`  | `playwright test tests/nueva-solicitud/P[0-9] --workers=2 --headed`           |
| `test:nueva-solicitud:full`          | `playwright test tests/nueva-solicitud/ --workers=2 --headed`               |
| `test:complemento`                   | `playwright test tests/complemento/happy_path.spec.js --headed`            |
| `test:complemento:p2`             | `playwright test tests/complemento/P2 --headed`                          |
| `test:complemento:validaciones`      | `playwright test tests/complemento/P[0-9] --workers=2 --headed`               |
| `test:complemento:full`              | `playwright test tests/complemento/ --workers=2 --headed`                   |
| `test:reconsideracion`               | `playwright test tests/reconsideracion/happy_path.spec.js --headed`    |
| `test:reconsideracion:p1`         | `playwright test tests/reconsideracion/P1 --headed`                      |
| `test:reconsideracion:p2`         | `playwright test tests/reconsideracion/P2 --headed`                      |
| `test:reconsideracion:p3`         | `playwright test tests/reconsideracion/P3 --headed`                      |
| `test:reconsideracion:p4`         | `playwright test tests/reconsideracion/P4 --headed`                      |
| `test:reconsideracion:p5`         | `playwright test tests/reconsideracion/P5 --headed`                      |
| `test:reconsideracion:validaciones`  | `playwright test tests/reconsideracion/P[0-9] --workers=2 --headed`           |
| `test:reconsideracion:full`          | `playwright test tests/reconsideracion/ --workers=2 --headed`               |
| `test:seguimiento`                   | `playwright test tests/seguimiento/happy_path.spec.js --headed`            |
| `test:seguimiento:p1`             | `playwright test tests/seguimiento/P1 --headed`                          |
| `test:seguimiento:validaciones`      | `playwright test tests/seguimiento/P[0-9] --workers=2 --headed`               |
| `test:seguimiento:full`              | `playwright test tests/seguimiento/ --workers=2 --headed`                   |

Comandos generales:

| Script                   | Comando                                                                                              | Descripción                                        |
| ------------------------ | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `test`                   | `playwright test --workers=2`                                                                        | Ejecuta toda la suite (sin navegador visible).     |
| `test:headed`            | `playwright test --workers=2 --headed`                                                               | Ejecuta toda la suite mostrando el navegador.      |
| `test:validaciones:full` | `playwright test tests/nueva-solicitud/P[0-9] tests/complemento/P[0-9] tests/reconsideracion/P[0-9] tests/seguimiento/P[0-9] --workers=2 --headed` | Ejecuta las validaciones de los cuatro trámites. |
| `test:ui`                | `playwright test --ui`                                                                               | Modo UI interactivo de Playwright.                 |
| `report`                 | `node scripts/show-latest-report.js`                                                                 | Abre el último reporte generado en `reports/`.     |

Ejemplos:

```bash
npm test
npm run test:seguimiento
npm run test:seguimiento:p1
npm run test:seguimiento:validaciones
npm run test:seguimiento:full
npm run test:validaciones:full
npm run report
```

También es posible seguir usando `npx playwright test ...` directamente para casos puntuales, por ejemplo para filtrar por proyecto:

```bash
npx playwright test --project=chromium
```

---

## 🧪 Cobertura de pruebas

### 🆕 Nueva solicitud

El flujo automatizado contempla:

* Camino feliz completo hasta la generación del folio.
* Paso 2 - Consulta de póliza (HU 27931, CA01–CA10): formato del número de póliza (solo números, 1–20 dígitos, sin espacios), catálogos de Oficina y Ramo, habilitación de Validar, estado "Validando tu póliza con SURA…", póliza activa, no activa y no encontrada, carátula "Verificado por SURA" y habilitación de Continuar.
* Paso 5 - ¿Qué ocurrió? (HU 28454, CA01–CA15): título y mensajes, eventos de la póliza con su descripción e ícono, selección única y cambio de evento, coberturas según la matriz evento-cobertura, selección múltiple y deselección, estado de Continuar, avance al Paso 6, conservación de la selección al ir y volver, y modal de Reiniciar. Los eventos están mockeados (siempre NATURAL, ENFERMEDAD y ACCIDENTE); los tests de CA02/CA03 lo dejan como anotación en el reporte.

> En DEV el servicio de pólizas está mockeado: `11111111` responde activa y `222222` no activa (se pueden sobrescribir desde `.env` con `POLIZA_ACTIVA` y `POLIZA_NO_ACTIVA`). El mock nunca responde "no encontrada", por lo que ese caso se simula interceptando `/api/polizas/`; el estado "Validando…" también se prueba retrasando esa respuesta.

### 📄 Complemento

El flujo automatizado contempla:

* Selección del tipo de trámite.
* Ingreso de información requerida.
* Validación de datos.
* Carga de documentos.
* Revisión de la información.
* Confirmación y envío de la solicitud.

Los archivos ubicados en `data/` permiten reutilizar documentos de prueba durante la ejecución.

### 🔄 Reconsideración

El flujo automatizado contempla:

* Selección del trámite.
* Ingreso de información requerida.
* Carga de documentos.
* Revisión de la información.
* Confirmación y envío de la solicitud.

### 🕐 Seguimiento

El flujo automatizado contempla:

* Consulta mediante folio.
* Validación de la información del trámite.
* Verificación de las diferentes etapas del proceso.

---

## 🔧 Configuración

La configuración principal de Playwright se encuentra en:

```text
playwright.config.js
```

En este archivo se configuran, entre otros aspectos:

* URL base.
* Navegadores.
* Reportes.
* Trazas para reintentos.
* Configuración general de ejecución.

Las variables sensibles o específicas del ambiente deben manejarse mediante variables de entorno y **no deben almacenarse directamente en el repositorio**.

---

## 📎 Archivos de prueba

Los archivos ubicados en:

```text
data/
```

son utilizados como insumos para las pruebas automatizadas de carga de documentos.

Actualmente se incluyen:

* `PRUEBA.pdf`
* `PRUEBA.png`
* `PRUEBA.xlsx`
* `folios_generados.txt`

El archivo `folios_generados.txt` permite conservar la trazabilidad de los folios generados durante determinadas ejecuciones de prueba.

---

## 📊 Historial de reportes

Cada vez que se ejecuta la suite, Playwright genera el reporte HTML dentro de una carpeta con fecha y hora de la corrida:

```text
reports/reporte_2026-09-18_16-45-30/
```

Esto permite conservar localmente un historial de los reportes ejecutados.

Solo se conservan los **5 reportes más recientes**: al iniciar cada corrida se borran automáticamente los más antiguos. Para cambiar la cantidad, ajustar `REPORTES_A_CONSERVAR` en `playwright.config.js`.

Para ver el reporte más reciente:

```bash
npm run report
```

Para ver un reporte anterior específico:

```bash
npx playwright show-report reports/reporte_2026-09-18_16-45-30
```

> Estas carpetas **no** se suben al repositorio (están excluidas en `.gitignore`), porque pesan y cambian en cada corrida. Lo mismo aplica para `test-results/`.

---

## 📝 Notas técnicas

* Las pruebas utilizan el mecanismo `filechooser` de Playwright para gestionar la carga de archivos.
* Los archivos de prueba se mantienen dentro de `data/` para facilitar su reutilización.
* Los reportes HTML se guardan por fecha/hora en `reports/`; ni los reportes ni los resultados temporales de ejecución (`test-results/`) se suben al repositorio.
* Las credenciales, variables sensibles y archivos `.env` están excluidos mediante `.gitignore`.
* La ejecución local y la ejecución mediante GitHub Actions utilizan la misma suite de pruebas.

---

## 🤖 Integración continua

El proyecto incluye un workflow de **GitHub Actions** ubicado en:

```text
.github/workflows/playwright.yml
```

El objetivo es automatizar la ejecución de las pruebas cuando se realicen cambios en el repositorio.

La estrategia de trabajo contempla el uso de ramas para separar el desarrollo de las versiones estables:

```text
main
  │
  └── develop
        │
        ├── feature/complemento
        ├── feature/reconsideracion
        └── feature/seguimiento
```

Las funcionalidades se desarrollan en ramas independientes y posteriormente se integran mediante Pull Requests.

---

## ⚠️ Ambiente

Las pruebas están configuradas para ejecutarse sobre el ambiente de **desarrollo/pruebas** de SURA México.

```text
https://formulario-dev.segurossura.com.mx
```

No ejecutar la suite contra producción sin realizar previamente los ajustes de configuración correspondientes y validar el impacto de las operaciones que puedan generar trámites reales.

---

## 👤 Responsable

**Antonio Josue Reyes**

Proyecto de automatización QA.
