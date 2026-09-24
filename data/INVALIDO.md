# Technical Specs — FCDD-03.8 G7 Autogestión del Agente
**Capacidad padre:** FCDD-03 Endosos Integrados  
**Última actualización:** 19/05/26

---

## Enums

### validationStatus
Resultado de la validación preventiva de una póliza al iniciar un endoso individual.

| Valor | Descripción |
|---|---|
| `ENDORSEMENT_IN_PROGRESS` | La póliza o alguna de sus dependientes tiene un endoso abierto |
| `OPEN_CLAIM` | La póliza o alguna de sus dependientes tiene un siniestro abierto |
| `NOT_ACTIVE` | La póliza no se encuentra vigente |

---

### endorsementStatus
Estado de una solicitud de endoso.

| Valor | Descripción |
|---|---|
| `ABIERTO` | Solicitud creada y en espera de ser procesada — editable |
| `EN_PROCESO` | Solicitud enviada al wrapper — procesamiento asíncrono en curso |
| `PROCESADO` | Endoso ejecutado exitosamente |
| `RECHAZADO` | El procesamiento falló o fue rechazado |
| `CANCELADO` | La solicitud de endoso fue cancelada por el agente |
| `PROCESADO_CON_ERRORES` | Al menos un objeto fue procesado pero otros fallaron |

---

### endorsementType
Tipo de endoso — códigos del catálogo.

| Valor | Descripción |
|---|---|
| `INSURED` | Alta de asegurado(s) |
| `BINSURED` | Baja de asegurado(s) |
| `INAME` | Corrección de datos de asegurado |
| `SALARYCH` | Modificación de sueldo |
| `POLHOLD` | Cambio de contratante / RFC del contratante |
| `PAYERCH` | Cambio de pagador / RFC del pagador — ⚠️ código pendiente de confirmar |
| `CHNGFRQ` | Cambio de periodicidad de pago |
| `CANCHOLDER` | Cancelación de póliza |
| `CATBAJA` | Baja de categoría — ⚠️ código pendiente de confirmar |
| `BENEADD` | Alta de beneficiarios — ⚠️ código pendiente de confirmar |
| `HOLDMOD` | Modificación de información del contratante — ⚠️ código pendiente de confirmar |
| `PAYERMOD` | Modificación de información del pagador — solo dependiente — ⚠️ código pendiente de confirmar |

---

### cuestionCodes
Identificadores de cuestionarios consultados via `GET /policies/{policyNo}/questionnaire/current?questionId={value}`.

| Valor | Descripción |
|---|---|
| `QST_SAMI` | Consulta el monto de la Suma Asegurada Máxima Institucional (SAMI) |
| `QST_ADM` | Consulta el tipo de administración de la póliza |

> Se extenderá con nuevos identificadores conforme se definan más consultas al cuestionario.

---

### roleType
Rol responsable de la solicitud.

| Valor | Descripción |
|---|---|
| `AGENTE` | Solicitud originada desde el portal de autogestión del agente |

> Se extenderá con `Analista` u otros roles cuando se implemente el canal tradicional.

---

### insuredObjectStatus
Estado de un objeto asegurado en la colección `objetosAseguradosAgente`.

| Valor | Descripción |
|---|---|
| `VALIDO` | Pasó las validaciones al guardar borrador — listo para submit |
| `INVALIDO` | No pasó las validaciones — retroactividad, persona no encontrada, etc. |
| `PROCESADO` | Endoso ejecutado exitosamente en el wrapper |
| `RECHAZADO` | El procesamiento falló o fue rechazado por el wrapper |
| `CANCELADO` | La solicitud de endoso fue cancelada |

---

### Periodicidad
Enum interno para validar la vigencia mínima requerida por tipo de periodicidad en el endoso `CHNGFRQ`.

| Valor | `numberOfInstallments` | Meses mínimos requeridos |
|---|---|---|
| `ANNUAL` | 1 | 12 |
| `SEMIANNUAL` | 2 | 6 |
| `QUARTERLY` | 4 | 3 |
| `MONTHLY` | 12 | 1 |

---

### addressType
Tipos de domicilio válidos en Persona Única.

| Valor | Descripción |
|---|---|
| `1` | PARTICULAR |
| `2` | FISCAL |
| `3` | LABORAL |
| `4` | UBICACIÓN RIESGO |
| `5` | POSTAL |
| `6` | ENVIA PRODUCCION |
| `7` | SUCURSAL |
| `8` | MATRIZ |
| `9` | CONSULTORIO |
| `10` | BANCARIO |

---

### eventType
Tipo de evento en el histórico de solicitudes.

| Valor | Descripción |
|---|---|
| `CREACION` | Solicitud creada |
| `ACTUALIZACION` | Borrador actualizado |
| `ENVIO` | Solicitud enviada para procesamiento |
| `PROCESADO` | Endoso procesado exitosamente |
| `RECHAZADO` | Endoso rechazado |
| `CANCELADO` | Solicitud cancelada |

---

## Estructura domicilioFiscal
Estructura reutilizada en `informacionSolicitud` para endosos `POLHOLD` y `PAYERCH`.

```json
{
    "rfc": "string",
    "razonSocial": "string",
    "calle": "string",
    "numeroExterior": "string",
    "numeroInterior": "string | null",
    "colonia": "string",
    "municipio": "string",
    "codigoPostal": "string",
    "regimenFiscal": "string",
    "correo": "string",
    "telefono": "string"
}
```

---

## Colecciones DB

### endososAgentes

Colección MongoDB que almacena las solicitudes de endoso del portal de autogestión del agente.

```json
{
    "_id": "ObjectId — generado por MongoDB",
    "numeroFolio": "number",
    "numeroPoliza": "string — siempre la póliza matriz como pivote",
    "numeroPolizaDependiente": "string | null — la dependiente consultada si aplica",
    "codigoProducto": "string",
    "codigoRamo": "string",
    "tipoEndoso": "string — ver enum endorsementType",
    "estado": "string — ver enum endorsementStatus",
    "rolResponsable": "string — ver enum roleType",
    "oficina": "string — officeNo de policyConsultation",
    "nombreOficina": "string — office de policyConsultation",
    "fechaInicioVigencia": "fecha — insrBeginDate de policyConsultation",
    "fechaFinVigencia": "fecha — insrEndDate de policyConsultation",
    "cliente": {
        "clientId": 0,
        "policyParticipantId": 0,
        "manId": 0,
        "name": "string"
    },
    "pagador": {
        "clientId": 0,
        "policyParticipantId": 0,
        "manId": 0,
        "name": "string"
    },
    "informacionSolicitud": {
        "fechaMovimiento": "fecha | null",
        "// CANCHOLDER": "{ fechaMovimiento }",
        "// CHNGFRQ": "{ fechaMovimiento, periodicidad: { valor, numeroCuotas, periodoCuotas, duracionPago: { dimension, duracion } } }",
        "// INSURED, INAME, SALARYCH, BINSURED": "ver colección objetosAseguradosAgente",
        "// POLHOLD": "{ fechaMovimiento, contratante: { manId, rfc, primerNombre, segundoNombre, primerApellido, segundoApellido, fechaNacimiento, domicilioFiscal } }",
        "// PAYERCH": "{ fechaMovimiento, pagador: { manId, rfc, primerNombre, segundoNombre, primerApellido, segundoApellido, fechaNacimiento, domicilioFiscal } }"
    },
    "documentos": {
        "archivoEndoso": {
            "url": "string",
            "nombre": "string"
        },
        "correoEml": {
            "url": "string",
            "nombre": "string"
        },
        "otros": [
            {
                "url": "string",
                "nombre": "string"
            }
        ]
    },
    "agente": {
        "agentId": "number — de policyConsultation.agentId"
    },
    "errores": [
        "string"
    ],
    "fechaCreacion": "new Date()",
    "fechaActualizacion": "fecha | null — solo en actualizaciones",
    "creadoPor": {
        "codigoAgente": "string — del ACCESS_TOKEN"
    }
}
```

---

### objetosAseguradosAgente

Colección MongoDB que almacena los registros individuales de asegurados del portal de autogestión del agente. Referencia la solicitud padre mediante `numeroFolio` de la colección `endososAgentes`.

**Estructura para `INSURED`, `INAME`, `SALARYCH`:**
```json
{
    "_id": "ObjectId — generado por MongoDB",
    "numeroFolio": "number — referencia a endososAgentes",
    "tipoMovimiento": "string — ver enum endorsementType",
    "estado": "string — ver enum insuredObjectStatus",
    "detalle": "string | null — nota adicional cuando aplica. Ej: monto topado a SAMI",
    "asegurado": {
        "manId": "string",
        "rfc": "string",
        "primerNombre": "string",
        "segundoNombre": "string | null",
        "primerApellido": "string",
        "segundoApellido": "string | null",
        "fechaNacimiento": "fecha",
        "sexo": "string | null",
        "curp": "string | null",
        "numeroEmpleado": "string | null",
        "categoria": {
            "id": "number",
            "descripcion": "string"
        },
        "numeroPolizaDependiente": "string",
        "montoAsegurado": "number — valor final después de validación SAMI",
        "fechaMovimiento": "fecha"
    },
    "fechaCreacion": "new Date()",
    "fechaActualizacion": "new Date() | null"
}
```

**Estructura para `BINSURED`:**
```json
{
    "_id": "ObjectId — generado por MongoDB",
    "numeroFolio": "number — referencia a endososAgentes",
    "tipoMovimiento": "BINSURED",
    "estado": "string — ver enum insuredObjectStatus",
    "detalle": "string | null",
    "asegurado": {
        "insuredObjectId": "number — id del asegurado en INSIS",
        "policyId": "number — id de la póliza en INSIS",
        "primerNombre": "string",
        "segundoNombre": "string | null",
        "primerApellido": "string",
        "segundoApellido": "string | null",
        "categoria": {
            "id": "number",
            "descripcion": "string"
        },
        "numeroPolizaDependiente": "string",
        "fechaMovimiento": "fecha"
    },
    "fechaCreacion": "new Date()",
    "fechaActualizacion": "new Date() | null"
}
```

---

### objetosAseguradosInterno

Colección MongoDB que almacena los registros individuales de asegurados en procesos masivos del canal tradicional (futuro). Referencia la solicitud padre mediante `numeroFolio` de la colección `endososInterno`.

```json
{
    "_id": "ObjectId — generado por MongoDB",
    "numeroFolio": "number — referencia a endososInterno",
    "tipoMovimiento": "string — ver enum endorsementType",
    "estado": "string — ver enum insuredObjectStatus",
    "detalle": "string | null — nota adicional cuando aplica",
    "...camposEspecificosPorTipo": "pendiente de definir por tipo de endoso"
}
```

---

### historicoEndososAgente

Colección MongoDB que almacena el histórico de cambios de las solicitudes de endoso del portal de autogestión del agente.

```json
{
    "_id": "ObjectId — generado por MongoDB",
    "numeroFolio": "number — referencia a endososAgentes",
    "numeroPoliza": "string",
    "codigoProducto": "string",
    "codigoRamo": "string",
    "tipoEndoso": "string — ver enum endorsementType",
    "tipoEvento": "string — ver enum eventType",
    "actualizadoPor": {
        "codigoAgente": "string",
        "nombreCompleto": "string"
    },
    "informacionActualizada": {
        "estadoAnterior": "string — ver enum endorsementStatus",
        "estadoNuevo": "string — ver enum endorsementStatus",
        "detalle": "string | null",
        "data": {}
    },
    "fecha": "new Date()"
}
```

---

### catalogoEndosos

Colección MongoDB que define los endosos disponibles por ramo y rol.

```json
{
    "codigoRamo": "012",
    "rol": "AGENTE",
    "endosos": [
        {
            "codigoEndoso": "INSURED",
            "descripcionEndoso": "Alta de asegurado(s)",
            "procesoIndividual": true,
            "procesoMasivo": true,
            "diasRetroactividad": 60,
            "soloMatriz": false,
            "tipoPoliza": ["MATRIZ", "DEPENDIENTE"]
        },
        {
            "codigoEndoso": "BINSURED",
            "descripcionEndoso": "Baja de asegurado(s)",
            "procesoIndividual": true,
            "procesoMasivo": true,
            "diasRetroactividad": 60,
            "soloMatriz": false,
            "tipoPoliza": ["MATRIZ", "DEPENDIENTE"]
        },
        {
            "codigoEndoso": "INAME",
            "descripcionEndoso": "Corrección de datos de asegurado",
            "procesoIndividual": true,
            "procesoMasivo": true,
            "diasRetroactividad": 60,
            "soloMatriz": false,
            "tipoPoliza": ["MATRIZ", "DEPENDIENTE"]
        },
        {
            "codigoEndoso": "SALARYCH",
            "descripcionEndoso": "Modificación de sueldo",
            "procesoIndividual": true,
            "procesoMasivo": true,
            "diasRetroactividad": 60,
            "soloMatriz": false,
            "tipoPoliza": ["MATRIZ", "DEPENDIENTE"]
        },
        {
            "codigoEndoso": "POLHOLD",
            "descripcionEndoso": "Cambio de contratante / RFC del contratante",
            "procesoIndividual": true,
            "procesoMasivo": false,
            "diasRetroactividad": 60,
            "soloMatriz": true,
            "tipoPoliza": ["MATRIZ"]
        },
        {
            "codigoEndoso": "PAYERCH",
            "descripcionEndoso": "Cambio de pagador / RFC del pagador — ⚠️ código pendiente de confirmar",
            "procesoIndividual": true,
            "procesoMasivo": false,
            "diasRetroactividad": 60,
            "soloMatriz": false,
            "tipoPoliza": ["DEPENDIENTE"]
        },
        {
            "codigoEndoso": "CHNGFRQ",
            "descripcionEndoso": "Cambio de periodicidad de pago",
            "procesoIndividual": true,
            "procesoMasivo": false,
            "diasRetroactividad": 60,
            "soloMatriz": true,
            "tipoPoliza": ["MATRIZ"]
        },
        {
            "codigoEndoso": "CANCHOLDER",
            "descripcionEndoso": "Cancelación de póliza",
            "procesoIndividual": true,
            "procesoMasivo": false,
            "diasRetroactividad": 60,
            "soloMatriz": false,
            "tipoPoliza": ["MATRIZ", "DEPENDIENTE"]
        },
        {
            "codigoEndoso": "CATBAJA",
            "descripcionEndoso": "Baja de categoría — ⚠️ código pendiente de confirmar",
            "procesoIndividual": true,
            "procesoMasivo": false,
            "diasRetroactividad": 60,
            "soloMatriz": false,
            "tipoPoliza": ["DEPENDIENTE"]
        },
        {
            "codigoEndoso": "BENEADD",
            "descripcionEndoso": "Alta de beneficiarios — ⚠️ código pendiente de confirmar",
            "procesoIndividual": true,
            "procesoMasivo": true,
            "diasRetroactividad": 60,
            "soloMatriz": false,
            "tipoPoliza": ["MATRIZ", "DEPENDIENTE"]
        },
        {
            "codigoEndoso": "HOLDMOD",
            "descripcionEndoso": "Modificación de información del contratante — ⚠️ código pendiente de confirmar",
            "procesoIndividual": true,
            "procesoMasivo": false,
            "diasRetroactividad": 60,
            "soloMatriz": true,
            "tipoPoliza": ["MATRIZ"]
        },
        {
            "codigoEndoso": "PAYERMOD",
            "descripcionEndoso": "Modificación de información del pagador — ⚠️ código pendiente de confirmar",
            "procesoIndividual": true,
            "procesoMasivo": false,
            "diasRetroactividad": 60,
            "soloMatriz": false,
            "tipoPoliza": ["DEPENDIENTE"]
        }
    ]
}
```

**Campos del catálogo:**

| Campo | Tipo | Descripción |
|---|---|---|
| `codigoRamo` | string | Código del ramo al que aplica el catálogo |
| `rol` | string | Rol que puede ver estos endosos — ver enum `roleType` |
| `codigoEndoso` | string | Código identificador del endoso — ver enum `endorsementType` |
| `descripcionEndoso` | string | Nombre visible en el portal |
| `procesoIndividual` | boolean | Si el endoso permite proceso individual |
| `procesoMasivo` | boolean | Si el endoso permite proceso masivo |
| `diasRetroactividad` | number | Días máximos de retroactividad permitidos |
| `soloMatriz` | boolean | Si el endoso solo está disponible desde la póliza matriz |
| `tipoPoliza` | array | Tipos de póliza en los que aparece disponible: `MATRIZ`, `DEPENDIENTE` |

---

### contadorFoliosAgente

Colección MongoDB que mantiene el contador global de folios para las solicitudes del portal de autogestión del agente.

```
{
    "_id": "folio_global",
    "secuencia": NumberLong("10000000"),
    "descripcion": "Contador global de folios — portal de autogestión agentes",
    "valorInicial": NumberLong("10000000"),
    "creadoEn": new Date()
}
```

> El documento semilla debe insertarse manualmente en la BD antes del primer despliegue.

---

## Mapeo request → persistencia

| Campo request (inglés) | Campo persistencia (español) |
|---|---|
| `folioNumber` | `numeroFolio` |
| `policyNumber` | `numeroPoliza` |
| `dependantPolicyNumber` | `numeroPolizaDependiente` |
| `productId` | `codigoProducto` |
| `branchId` | `codigoRamo` |
| `endorsementType` | `tipoEndoso` |
| `status` | `estado` |
| `roleResponsible` | `rolResponsable` |
| `officeNo` | `oficina` |
| `officeName` | `nombreOficina` |
| `insrBeginDate` | `fechaInicioVigencia` |
| `insrEndDate` | `fechaFinVigencia` |
| `client` | `cliente` |
| `payor` | `pagador` |
| `requestInformation` | `informacionSolicitud` |
| `requestInformation.movementDate` | `informacionSolicitud.fechaMovimiento` |
| `documents` | `documentos` |
| `documents.endorsementFile` | `documentos.archivoEndoso` |
| `documents.mailEml` | `documentos.correoEml` |
| `documents.others[]` | `documentos.otros[]` |
| `errors[]` | `errores[]` |
| `createdAt` | `fechaCreacion` |
| `updatedAt` | `fechaActualizacion` |
| `createdBy.agentCode` | `creadoPor.codigoAgente` |

---

### anexosAgentes

Colección MongoDB que almacena los endosos generados en el wrapper por solicitud. Permite consultar todos los `annexId` producidos por un folio, incluyendo la póliza matriz y sus dependientes afectadas.

```json
{
    "_id": "ObjectId — generado por MongoDB",
    "numeroFolio": "number — referencia a endososAgentes",
    "numeroPolizaMatriz": "string",
    "anexos": [
        {
            "annexId": "string",
            "copyPolicyNumber": "string — número temporal generado por el wrapper",
            "numeroPoliza": "string",
            "tipo": "MATRIZ | DEPENDIENTE"
        }
    ],
    "fechaCreacion": "new Date()"
}
```

---

## Variables de entorno adicionales

| Variable | Descripción | Valor dev |
|---|---|---|
| `CRON_CANCEL_SCHEDULE` | Expresión cron para cancelación automática de solicitudes | `0 0 * * *` |
| `CRON_CANCEL_DAYS` | Días de antigüedad para cancelar solicitudes inactivas | `30` |

---

### PeriodicidadesPago

Colección en la BD del wrapper de catálogos. Un documento por ramo con el listado de periodicidades de pago disponibles y sus parámetros de configuración para el wrapper de endosos.

```json
{
    "_id": "ObjectId — generado por MongoDB",
    "codigoRamo": "012",
    "periodicidades": [
        {
            "valor": "1",
            "numeroCuotas": 1,
            "periodoCuotas": "YEARLY",
            "duracionPago": { "dimension": "YEARS", "duracion": 1 },
            "mesesMinimoRequeridos": 12,
            "descripcion": "Anual"
        },
        {
            "valor": "2",
            "numeroCuotas": 2,
            "periodoCuotas": "HALF_YEARLY",
            "duracionPago": { "dimension": "YEARS", "duracion": 1 },
            "mesesMinimoRequeridos": 6,
            "descripcion": "Semestral"
        },
        {
            "valor": "3",
            "numeroCuotas": 4,
            "periodoCuotas": "QUARTERLY",
            "duracionPago": { "dimension": "YEARS", "duracion": 1 },
            "mesesMinimoRequeridos": 3,
            "descripcion": "Trimestral"
        },
        {
            "valor": "12",
            "numeroCuotas": 12,
            "periodoCuotas": "MONTHLY",
            "duracionPago": { "dimension": "YEARS", "duracion": 1 },
            "mesesMinimoRequeridos": 1,
            "descripcion": "Mensual"
        }
    ]
}
```

> Colección ubicada en la BD del wrapper de catálogos — no en la BD del backend de endosos.

---

## JSONs de configuración

> Pendiente de definir conforme avance el desarrollo.
