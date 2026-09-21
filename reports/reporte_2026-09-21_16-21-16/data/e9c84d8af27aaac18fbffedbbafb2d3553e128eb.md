# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: nueva-solicitud.spec.js >> Nueva Solicitud - Happy Path >> debe completar y enviar una nueva solicitud de siniestro
- Location: tests\nueva-solicitud.spec.js:86:9

# Error details

```
Error: page.waitForEvent: Test ended.
=========================== logs ===========================
waiting for event "filechooser"
============================================================
```

# Test source

```ts
  88  |         // (8s de espera inicial + 15 intentos x ~6.5s cada uno), y con slowMo:500
  89  |         // sumado a todas las acciones previas se puede agotar el timeout del test
  90  |         // justo antes de seleccionar la Nacionalidad. Se amplía con margen amplio.
  91  |         test.setTimeout(300000);
  92  | 
  93  |         await page.goto('/solicitud-reclamaciones');
  94  |         await page.getByRole('radio', { name: 'Nueva solicitud Es la primera' }).click();
  95  |         await page.getByRole('button', { name: 'Continuar' }).click();
  96  | 
  97  |         await page.getByRole('textbox', { name: 'Número de póliza' }).click();
  98  |         await page.getByRole('textbox', { name: 'Número de póliza' }).fill(DATOS.numeroPoliza);
  99  | 
  100 |         await page.getByRole('combobox', { name: 'Oficina *' }).click();
  101 |         await page.getByRole('listbox', { name: 'Seleccione una opción' }).getByText(DATOS.oficina).click();
  102 | 
  103 |         await page.getByRole('combobox', { name: 'Ramo *' }).click();
  104 |         await page.getByRole('option', { name: DATOS.ramo }).click();
  105 | 
  106 |         await page.getByRole('button', { name: 'Validar' }).click();
  107 |         await page.waitForTimeout(1000);
  108 | 
  109 |         await page.getByRole('button', { name: 'Seleccionar fecha' }).click();
  110 |         await seleccionarPrimeraFechaDisponible(page);
  111 | 
  112 |         await page.getByRole('textbox', { name: 'Primer Nombre *' }).click();
  113 |         await page.getByRole('textbox', { name: 'Primer Nombre *' }).fill(DATOS.primerNombreAsegurado);
  114 | 
  115 |         await page.getByRole('textbox', { name: 'Primer Apellido *' }).click();
  116 |         await page.getByRole('textbox', { name: 'Primer Apellido *' }).fill(DATOS.primerApellidoAsegurado);
  117 | 
  118 |         await page.getByRole('button', { name: 'Continuar' }).click();
  119 | 
  120 |         await page.getByRole('button', { name: 'Seleccionar fecha' }).click();
  121 |         await seleccionarPrimeraFechaDisponible(page);
  122 | 
  123 |         await page.getByRole('textbox', { name: 'Código Postal *' }).click();
  124 |         await page.getByRole('textbox', { name: 'Código Postal *' }).fill(DATOS.codigoPostal);
  125 |         await page.waitForTimeout(1000);
  126 | 
  127 |         await page.getByRole('combobox', { name: 'Colonia *' }).click();
  128 |         await page.getByRole('option').first().click();
  129 | 
  130 |         await page.getByRole('textbox', { name: 'Monto reclamado *' }).click();
  131 |         await page.getByRole('textbox', { name: 'Monto reclamado *' }).fill(DATOS.montoReclamado);
  132 | 
  133 |         await page.getByRole('button', { name: 'Continuar' }).click();
  134 | 
  135 |         await page.getByRole('textbox', { name: 'Primer Nombre *' }).click();
  136 |         await page.getByRole('textbox', { name: 'Primer Nombre *' }).fill(DATOS.primerNombreContacto);
  137 | 
  138 |         await page.getByRole('textbox', { name: 'Primer Apellido *' }).click();
  139 |         await page.getByRole('textbox', { name: 'Primer Apellido *' }).fill(DATOS.primerApellidoContacto);
  140 | 
  141 |         await page.getByRole('textbox', { name: 'Correo electrónico *' }).click();
  142 |         await page.getByRole('textbox', { name: 'Correo electrónico *' }).fill(DATOS.correoContacto);
  143 | 
  144 |         await page.getByRole('textbox', { name: 'Número de teléfono' }).click();
  145 |         await page.getByRole('textbox', { name: 'Número de teléfono' }).fill(DATOS.telefonoCelular);
  146 | 
  147 |         await page.getByRole('button', { name: 'Continuar' }).click();
  148 | 
  149 |         await page.getByRole('radio', { name: 'NATURAL Fallecimiento o' }).click();
  150 |         await page.getByRole('checkbox', { name: 'Fallecimiento Fallecimiento' }).click();
  151 |         await page.getByRole('checkbox', { name: 'Invalidez total y permanente' }).click();
  152 |         await page.getByRole('checkbox', { name: 'Pérdidas orgánicas Pérdida de' }).click();
  153 | 
  154 |         await page.getByRole('button', { name: 'Continuar' }).click();
  155 | 
  156 |         console.log('\n📧 Esperando el correo con el código OTP...\n');
  157 |         const codigoOTP = await obtenerCodigoOTP(context, DATOS.buzonMailinator);
  158 |         console.log(`\n🔑 Código OTP obtenido: ${codigoOTP}\n`);
  159 | 
  160 |         const digitos = codigoOTP.split('');
  161 |         for (let i = 0; i < digitos.length; i++) {
  162 |             await page.getByRole('textbox', { name: `Dígito ${i + 1}` }).fill(digitos[i]);
  163 |         }
  164 | 
  165 |         await page.getByRole('button', { name: 'Verificar y continuar' }).click();
  166 | 
  167 |         await page.getByRole('switch', { name: 'Usar mis datos de contacto' }).click();
  168 | 
  169 |         await page.getByRole('combobox', { name: 'Nacionalidad *' }).click();
  170 |         await page.getByRole('combobox', { name: 'Nacionalidad *' }).fill('COLOM');
  171 |         await page.waitForTimeout(500);
  172 |         await page.keyboard.press('Enter');
  173 | 
  174 |         await page.getByRole('textbox', { name: 'Domicilio *' }).click();
  175 |         await page.getByRole('textbox', { name: 'Domicilio *' }).fill(DATOS.domicilio);
  176 | 
  177 |         await page.getByRole('combobox', { name: 'Tipo de identificación *' }).click();
  178 |         await page.getByRole('option', { name: 'INE / Credencial para votar' }).click();
  179 | 
  180 |         await page.getByRole('textbox', { name: 'Número de identificación *' }).click();
  181 |         await page.getByRole('textbox', { name: 'Número de identificación *' }).fill(DATOS.numeroIdentificacion);
  182 | 
  183 |         await page.getByRole('combobox', { name: 'Tipo de pago *' }).click();
  184 |         await page.getByRole('combobox', { name: 'Tipo de pago *' }).fill('Cheque');
  185 |         await page.waitForTimeout(500);
  186 |         await page.keyboard.press('Enter');
  187 |         await page.getByRole('button', { name: 'Finalizar edición' }).click();
> 188 |         await page.getByRole('button', { name: 'Continuar' }).click();
      |                                         ^ Error: page.waitForEvent: Test ended.
  189 | 
  190 |         const fileChooserPromise = page.waitForEvent('filechooser');
  191 |         await page.getByRole('button', { name: 'Cargar Identificación oficial' }).click();
  192 |         const fileChooser = await fileChooserPromise;
  193 |         await fileChooser.setFiles(DATOS.archivoIdentificacion);
  194 | 
  195 |         await expect(page.getByText('de 1 documento obligatorio cargado')).toBeVisible({ timeout: 10000 });
  196 | 
  197 |         await page.getByRole('button', { name: 'Continuar' }).click();
  198 | 
  199 |         await page.locator('.flex.h-7.w-7.shrink-0.items-center.justify-center.rounded-lg').click();
  200 | 
  201 |         await page.getByRole('button', { name: 'Finalizar trámite' }).click();
  202 |         await page.getByRole('button', { name: 'Sí, finalizar trámite' }).click();
  203 | 
  204 |         const folioLocator = page.getByText(/SURA\d{10}MX/);
  205 |         await expect(folioLocator).toBeVisible({ timeout: 15000 });
  206 | 
  207 |         const folioTexto = await folioLocator.textContent();
  208 |         console.log(`\n📋 FOLIO GENERADO: ${folioTexto}\n`);
  209 | 
  210 |         const fecha = new Date().toLocaleString('es-CO');
  211 |         const linea = `${fecha} | Nueva Solicitud | ${folioTexto}\n`;
  212 |         const rutaHistorial = path.resolve(__dirname, '../data/folios_generados.txt');
  213 |         fs.appendFileSync(rutaHistorial, linea);
  214 |     });
  215 | });
```