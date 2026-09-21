// Abre el reporte HTML mas reciente generado en reports/reporte_<fecha>_<hora>/
const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const reportsDir = path.resolve(__dirname, "..", "reports");

if (!fs.existsSync(reportsDir)) {
  console.error(`No existe la carpeta ${reportsDir}. Ejecuta las pruebas primero.`);
  process.exit(1);
}

const carpetas = fs
  .readdirSync(reportsDir, { withFileTypes: true })
  .filter((entrada) => entrada.isDirectory())
  .map((entrada) => entrada.name)
  .sort();

const ultima = carpetas[carpetas.length - 1];

if (!ultima) {
  console.error(`No hay reportes dentro de ${reportsDir}.`);
  process.exit(1);
}

const resultado = spawnSync(
  "npx",
  ["playwright", "show-report", path.join("reports", ultima)],
  { stdio: "inherit", shell: true }
);

process.exit(resultado.status ?? 0);
