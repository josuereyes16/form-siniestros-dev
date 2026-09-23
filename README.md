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

| Trámite     | HU        |
| ----------- | --------- |
| Seguimiento | HU 24607  |

---

## 🗂️ Estructura del proyecto

```text
form-siniestros/
├── .github/
│   └── workflows/
│       └── playwright.yml
├── data/
│   ├── PRUEBA.png
│   ├── PRUEBA.pdf
│   ├── PRUEBA.xlsx
│   └── folios_generados.txt
├── reports/
│   └── reporte_<fecha>_<hora>/
├── scripts/
│   └── show-latest-report.js
├── tests/
│   ├── complemento.spec.js
│   ├── complemento_validaciones_P2.spec.js
│   ├── nueva-solicitud.spec.js
│   ├── nueva_solicitud_validaciones_P2.spec.js
│   ├── reconsideracion.spec.js
│   ├── reconsideracion_validaciones_P2.spec.js
│   ├── seguimiento.spec.js
│   └── seguimiento_validaciones.spec.js
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

Contiene las pruebas automatizadas correspondientes a los diferentes flujos del formulario:

* `nueva-solicitud.spec.js` → flujo principal de Nueva solicitud.
* `complemento.spec.js` → flujo principal de Complemento.
* `reconsideracion.spec.js` → flujo principal de Reconsideración.
* `seguimiento.spec.js` → flujo principal de Seguimiento (consulta exitosa de un folio).
* `*_validaciones*.spec.js` → validaciones de cada flujo contra los criterios de aceptación de su HU.

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

Cada trámite tiene siempre tres comandos:

| Script                        | Ejecuta                                   |
| ----------------------------- | ----------------------------------------- |
| `test:<trámite>`              | Solo el camino feliz.                     |
| `test:<trámite>:validaciones` | Solo las validaciones de la HU.           |
| `test:<trámite>:full`         | Camino feliz + validaciones.              |

Trámites disponibles: `nueva-solicitud`, `complemento`, `reconsideracion`, `seguimiento`.

| Script                               | Comando                                                                                              |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `test:nueva-solicitud`               | `playwright test nueva-solicitud.spec.js --headed`                                                   |
| `test:nueva-solicitud:validaciones`  | `playwright test nueva_solicitud_validaciones_P2.spec.js --headed`                                   |
| `test:nueva-solicitud:full`          | `playwright test nueva-solicitud.spec.js nueva_solicitud_validaciones_P2.spec.js --workers=2 --headed` |
| `test:complemento`                   | `playwright test complemento.spec.js --headed`                                                       |
| `test:complemento:validaciones`      | `playwright test complemento_validaciones_P2.spec.js --headed`                                       |
| `test:complemento:full`              | `playwright test complemento.spec.js complemento_validaciones_P2.spec.js --workers=2 --headed`       |
| `test:reconsideracion`               | `playwright test reconsideracion.spec.js --headed`                                                   |
| `test:reconsideracion:validaciones`  | `playwright test reconsideracion_validaciones_P2.spec.js --headed`                                   |
| `test:reconsideracion:full`          | `playwright test reconsideracion.spec.js reconsideracion_validaciones_P2.spec.js --workers=2 --headed` |
| `test:seguimiento`                   | `playwright test seguimiento.spec.js --headed`                                                       |
| `test:seguimiento:validaciones`      | `playwright test seguimiento_validaciones.spec.js --headed`                                          |
| `test:seguimiento:full`              | `playwright test seguimiento.spec.js seguimiento_validaciones.spec.js --workers=2 --headed`          |

Comandos generales:

| Script                   | Comando                                                                                              | Descripción                                        |
| ------------------------ | ---------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| `test`                   | `playwright test --workers=2`                                                                        | Ejecuta toda la suite (sin navegador visible).     |
| `test:headed`            | `playwright test --workers=2 --headed`                                                               | Ejecuta toda la suite mostrando el navegador.      |
| `test:validaciones:full` | `playwright test complemento_validaciones_P2.spec.js reconsideracion_validaciones_P2.spec.js seguimiento_validaciones.spec.js nueva_solicitud_validaciones_P2.spec.js --workers=2 --headed` | Ejecuta las validaciones de los cuatro trámites. |
| `test:ui`                | `playwright test --ui`                                                                               | Modo UI interactivo de Playwright.                 |
| `report`                 | `node scripts/show-latest-report.js`                                                                 | Abre el último reporte generado en `reports/`.     |

Ejemplos:

```bash
npm test
npm run test:seguimiento
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
