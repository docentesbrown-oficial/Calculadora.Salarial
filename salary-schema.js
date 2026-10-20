/* Docentes Brown — estructura compartida entre calculadora y administración.
   Valores de ejemplo: son los que ya estaban escritos en la versión entregada.
   NO son una escala salarial oficial ni corresponden a un mes verificado. */
(function(global){
  'use strict';
  const DEFAULT_PERIOD = {
  "estado": "borrador",
  "basicoReferencia": null,
  "conceptos": {
    "maestro_0641": 229915.19,
    "maestro_0455": 139229,
    "maestro_0438": 262500,
    "maestro_2761": 399.56,
    "biblio_0455": 139229,
    "biblio_0667": 145841.72,
    "biblio_0451": 255651.96,
    "especial_0623": 267662.46,
    "especial_0640": 68631.4,
    "especial_0455": 139229,
    "especial_0438": 262500,
    "precepInicial_0623": 229915.19,
    "precepInicial_0455": 139229,
    "precepInicial_2761": 507.54,
    "precepInicial_0648": 39.26,
    "precepSec_0653": 374555.87,
    "precepSec_0455": 139229,
    "equipo_0438": 262500,
    "equipo_0623": 253936.18,
    "equipo_0455": 139229,
    "equipo_2761": 298.43
  },
  "indicesBasico": {
    "Maestro de Grado": 1.1,
    "Maestro de Inicial": 1.1,
    "Preceptor (Inicial)": 1,
    "Preceptor (Sec/Sup)": 1,
    "Profesor Módulos Secundaria": 0.1,
    "Profesor Módulos Inicial": 0.06666666667,
    "Profesor Módulos Primaria": 0.08333333333,
    "Profesor Módulos Superior": 0.125,
    "Bibliotecario Inicial & Primaria": 1.1,
    "Bibliotecario Secundaria & Superior": 1.2,
    "EMATP": 1.2,
    "Maestro Especial": 1.1,
    "Equipo de Orientación": 1.1
  },
  "antiguedad": {
    "0": 0.21,
    "1": 0.21,
    "2": 0.24,
    "3": 0.24,
    "4": 0.33,
    "5": 0.33,
    "6": 0.33,
    "7": 0.43,
    "8": 0.43,
    "9": 0.43,
    "10": 0.54,
    "11": 0.54,
    "12": 0.64,
    "13": 0.64,
    "14": 0.64,
    "15": 0.74,
    "16": 0.74,
    "17": 0.84,
    "18": 0.84,
    "19": 0.84,
    "20": 1.05,
    "21": 1.05,
    "22": 1.15,
    "23": 1.15,
    "mas de 24": 1.24
  },
  "desfavorabilidad": {
    "0": 0,
    "1": 0.3,
    "2": 0.6,
    "3": 0.9,
    "4": 1.0,
    "5": 1.2
  },
  "maxAdicional455": 278458,
  "maxAdicional667": 291683.45,
  "porcentaje455": 0.4057,
  "porcentaje667": 0.425,
  "compensacionConectividadPorCargo": 30135,
  "compensacionConectividadMaxGlobal": 60270,
  "topeModulosConectividad": {
    "Inicial": 30,
    "Primaria": 24,
    "Secundaria": 20,
    "Superior": 16
  },
  "descuentoIPS": 0.16,
  "descuentoIOMA": 0.048
};
  const FIELDS = [
  {
    "path": "basicoReferencia",
    "label": "Básico de referencia (0110)",
    "group": "Básico",
    "kind": "money",
    "help": "Importe base para los índices de cada cargo. Es obligatorio para publicar."
  },
  {
    "path": "conceptos.maestro_0641",
    "label": "0641 Bonificación 1.º y 2.º ciclo",
    "group": "Maestro de Grado / Inicial / Bibliotecario Inicial y Primaria",
    "kind": "money",
    "help": ""
  },
  {
    "path": "conceptos.maestro_0455",
    "label": "0455 Bonificación docente agosto 2008",
    "group": "Maestro de Grado / Inicial / Bibliotecario Inicial y Primaria",
    "kind": "money",
    "help": ""
  },
  {
    "path": "conceptos.maestro_0438",
    "label": "0438 Bonificación remunerativa",
    "group": "Maestro de Grado / Inicial / Bibliotecario Inicial y Primaria",
    "kind": "money",
    "help": ""
  },
  {
    "path": "conceptos.maestro_2761",
    "label": "2761 Garantía sin aportes",
    "group": "Maestro de Grado / Inicial / Bibliotecario Inicial y Primaria",
    "kind": "money",
    "help": ""
  },
  {
    "path": "conceptos.biblio_0455",
    "label": "0455 Bonificación docente agosto 2008",
    "group": "Bibliotecario Secundaria / Superior y EMATP",
    "kind": "money",
    "help": ""
  },
  {
    "path": "conceptos.biblio_0667",
    "label": "0667 Bonificación hs./mód. media",
    "group": "Bibliotecario Secundaria / Superior y EMATP",
    "kind": "money",
    "help": ""
  },
  {
    "path": "conceptos.biblio_0451",
    "label": "0451 Suma no bonificable",
    "group": "Bibliotecario Secundaria / Superior y EMATP",
    "kind": "money",
    "help": ""
  },
  {
    "path": "conceptos.especial_0623",
    "label": "0623 Plus enseñanza",
    "group": "Maestro Especial",
    "kind": "money",
    "help": ""
  },
  {
    "path": "conceptos.especial_0640",
    "label": "0640 Bonificación función especial",
    "group": "Maestro Especial",
    "kind": "money",
    "help": ""
  },
  {
    "path": "conceptos.especial_0455",
    "label": "0455 Bonificación docente agosto 2008",
    "group": "Maestro Especial",
    "kind": "money",
    "help": ""
  },
  {
    "path": "conceptos.especial_0438",
    "label": "0438 Bonificación remunerativa",
    "group": "Maestro Especial",
    "kind": "money",
    "help": ""
  },
  {
    "path": "conceptos.precepInicial_0623",
    "label": "0623 Plus enseñanza",
    "group": "Preceptor Inicial",
    "kind": "money",
    "help": ""
  },
  {
    "path": "conceptos.precepInicial_0455",
    "label": "0455 Bonificación docente agosto 2008",
    "group": "Preceptor Inicial",
    "kind": "money",
    "help": ""
  },
  {
    "path": "conceptos.precepInicial_2761",
    "label": "2761 Garantía sin aportes",
    "group": "Preceptor Inicial",
    "kind": "money",
    "help": ""
  },
  {
    "path": "conceptos.precepInicial_0648",
    "label": "0648 Garantía con aportes",
    "group": "Preceptor Inicial",
    "kind": "money",
    "help": ""
  },
  {
    "path": "conceptos.precepSec_0653",
    "label": "0653 Bonificación PR",
    "group": "Preceptor Secundaria / Superior",
    "kind": "money",
    "help": ""
  },
  {
    "path": "conceptos.precepSec_0455",
    "label": "0455 Bonificación docente agosto 2008",
    "group": "Preceptor Secundaria / Superior",
    "kind": "money",
    "help": ""
  },
  {
    "path": "conceptos.equipo_0438",
    "label": "0438 Bonificación remunerativa 2014",
    "group": "Equipo de Orientación",
    "kind": "money",
    "help": ""
  },
  {
    "path": "conceptos.equipo_0623",
    "label": "0623 Plus enseñanza",
    "group": "Equipo de Orientación",
    "kind": "money",
    "help": ""
  },
  {
    "path": "conceptos.equipo_0455",
    "label": "0455 Bonificación docente agosto 2008",
    "group": "Equipo de Orientación",
    "kind": "money",
    "help": ""
  },
  {
    "path": "conceptos.equipo_2761",
    "label": "2761 Garantía sin aportes 930",
    "group": "Equipo de Orientación",
    "kind": "money",
    "help": ""
  },
  {
    "path": "indicesBasico.Maestro de Grado",
    "label": "Maestro de Grado",
    "group": "Índices de básico por cargo",
    "kind": "ratio",
    "help": "Coeficiente que multiplica al básico de referencia."
  },
  {
    "path": "indicesBasico.Maestro de Inicial",
    "label": "Maestro de Inicial",
    "group": "Índices de básico por cargo",
    "kind": "ratio",
    "help": "Coeficiente que multiplica al básico de referencia."
  },
  {
    "path": "indicesBasico.Preceptor (Inicial)",
    "label": "Preceptor (Inicial)",
    "group": "Índices de básico por cargo",
    "kind": "ratio",
    "help": "Coeficiente que multiplica al básico de referencia."
  },
  {
    "path": "indicesBasico.Preceptor (Sec/Sup)",
    "label": "Preceptor (Sec/Sup)",
    "group": "Índices de básico por cargo",
    "kind": "ratio",
    "help": "Coeficiente que multiplica al básico de referencia."
  },
  {
    "path": "indicesBasico.Profesor Módulos Secundaria",
    "label": "Profesor Módulos Secundaria",
    "group": "Índices de básico por cargo",
    "kind": "ratio",
    "help": "Coeficiente que multiplica al básico de referencia."
  },
  {
    "path": "indicesBasico.Profesor Módulos Inicial",
    "label": "Profesor Módulos Inicial",
    "group": "Índices de básico por cargo",
    "kind": "ratio",
    "help": "Coeficiente que multiplica al básico de referencia."
  },
  {
    "path": "indicesBasico.Profesor Módulos Primaria",
    "label": "Profesor Módulos Primaria",
    "group": "Índices de básico por cargo",
    "kind": "ratio",
    "help": "Coeficiente que multiplica al básico de referencia."
  },
  {
    "path": "indicesBasico.Profesor Módulos Superior",
    "label": "Profesor Módulos Superior",
    "group": "Índices de básico por cargo",
    "kind": "ratio",
    "help": "Coeficiente que multiplica al básico de referencia."
  },
  {
    "path": "indicesBasico.Bibliotecario Inicial & Primaria",
    "label": "Bibliotecario Inicial & Primaria",
    "group": "Índices de básico por cargo",
    "kind": "ratio",
    "help": "Coeficiente que multiplica al básico de referencia."
  },
  {
    "path": "indicesBasico.Bibliotecario Secundaria & Superior",
    "label": "Bibliotecario Secundaria & Superior",
    "group": "Índices de básico por cargo",
    "kind": "ratio",
    "help": "Coeficiente que multiplica al básico de referencia."
  },
  {
    "path": "indicesBasico.EMATP",
    "label": "EMATP",
    "group": "Índices de básico por cargo",
    "kind": "ratio",
    "help": "Coeficiente que multiplica al básico de referencia."
  },
  {
    "path": "indicesBasico.Maestro Especial",
    "label": "Maestro Especial",
    "group": "Índices de básico por cargo",
    "kind": "ratio",
    "help": "Coeficiente que multiplica al básico de referencia."
  },
  {
    "path": "indicesBasico.Equipo de Orientación",
    "label": "Equipo de Orientación",
    "group": "Índices de básico por cargo",
    "kind": "ratio",
    "help": "Coeficiente que multiplica al básico de referencia."
  },
  {
    "path": "antiguedad.0",
    "label": "0 años",
    "group": "Antigüedad",
    "kind": "percent",
    "help": ""
  },
  {
    "path": "antiguedad.1",
    "label": "1 años",
    "group": "Antigüedad",
    "kind": "percent",
    "help": ""
  },
  {
    "path": "antiguedad.2",
    "label": "2 años",
    "group": "Antigüedad",
    "kind": "percent",
    "help": ""
  },
  {
    "path": "antiguedad.3",
    "label": "3 años",
    "group": "Antigüedad",
    "kind": "percent",
    "help": ""
  },
  {
    "path": "antiguedad.4",
    "label": "4 años",
    "group": "Antigüedad",
    "kind": "percent",
    "help": ""
  },
  {
    "path": "antiguedad.5",
    "label": "5 años",
    "group": "Antigüedad",
    "kind": "percent",
    "help": ""
  },
  {
    "path": "antiguedad.6",
    "label": "6 años",
    "group": "Antigüedad",
    "kind": "percent",
    "help": ""
  },
  {
    "path": "antiguedad.7",
    "label": "7 años",
    "group": "Antigüedad",
    "kind": "percent",
    "help": ""
  },
  {
    "path": "antiguedad.8",
    "label": "8 años",
    "group": "Antigüedad",
    "kind": "percent",
    "help": ""
  },
  {
    "path": "antiguedad.9",
    "label": "9 años",
    "group": "Antigüedad",
    "kind": "percent",
    "help": ""
  },
  {
    "path": "antiguedad.10",
    "label": "10 años",
    "group": "Antigüedad",
    "kind": "percent",
    "help": ""
  },
  {
    "path": "antiguedad.11",
    "label": "11 años",
    "group": "Antigüedad",
    "kind": "percent",
    "help": ""
  },
  {
    "path": "antiguedad.12",
    "label": "12 años",
    "group": "Antigüedad",
    "kind": "percent",
    "help": ""
  },
  {
    "path": "antiguedad.13",
    "label": "13 años",
    "group": "Antigüedad",
    "kind": "percent",
    "help": ""
  },
  {
    "path": "antiguedad.14",
    "label": "14 años",
    "group": "Antigüedad",
    "kind": "percent",
    "help": ""
  },
  {
    "path": "antiguedad.15",
    "label": "15 años",
    "group": "Antigüedad",
    "kind": "percent",
    "help": ""
  },
  {
    "path": "antiguedad.16",
    "label": "16 años",
    "group": "Antigüedad",
    "kind": "percent",
    "help": ""
  },
  {
    "path": "antiguedad.17",
    "label": "17 años",
    "group": "Antigüedad",
    "kind": "percent",
    "help": ""
  },
  {
    "path": "antiguedad.18",
    "label": "18 años",
    "group": "Antigüedad",
    "kind": "percent",
    "help": ""
  },
  {
    "path": "antiguedad.19",
    "label": "19 años",
    "group": "Antigüedad",
    "kind": "percent",
    "help": ""
  },
  {
    "path": "antiguedad.20",
    "label": "20 años",
    "group": "Antigüedad",
    "kind": "percent",
    "help": ""
  },
  {
    "path": "antiguedad.21",
    "label": "21 años",
    "group": "Antigüedad",
    "kind": "percent",
    "help": ""
  },
  {
    "path": "antiguedad.22",
    "label": "22 años",
    "group": "Antigüedad",
    "kind": "percent",
    "help": ""
  },
  {
    "path": "antiguedad.23",
    "label": "23 años",
    "group": "Antigüedad",
    "kind": "percent",
    "help": ""
  },
  {
    "path": "antiguedad.mas de 24",
    "label": "24 años o más",
    "group": "Antigüedad",
    "kind": "percent",
    "help": ""
  },
  {
    "path": "desfavorabilidad.0",
    "label": "Desfavorabilidad 0",
    "group": "Desfavorabilidad",
    "kind": "percent",
    "help": ""
  },
  {
    "path": "desfavorabilidad.1",
    "label": "Desfavorabilidad 1",
    "group": "Desfavorabilidad",
    "kind": "percent",
    "help": ""
  },
  {
    "path": "desfavorabilidad.2",
    "label": "Desfavorabilidad 2",
    "group": "Desfavorabilidad",
    "kind": "percent",
    "help": ""
  },
  {
    "path": "desfavorabilidad.3",
    "label": "Desfavorabilidad 3",
    "group": "Desfavorabilidad",
    "kind": "percent",
    "help": ""
  },
  {
    "path": "desfavorabilidad.4",
    "label": "Desfavorabilidad 4",
    "group": "Desfavorabilidad",
    "kind": "percent",
    "help": ""
  },
  {
    "path": "desfavorabilidad.5",
    "label": "Desfavorabilidad 5",
    "group": "Desfavorabilidad",
    "kind": "percent",
    "help": ""
  },
  {
    "path": "maxAdicional455",
    "label": "Tope global concepto 0455",
    "group": "Módulos / topes",
    "kind": "money",
    "help": ""
  },
  {
    "path": "maxAdicional667",
    "label": "Tope global concepto 0667",
    "group": "Módulos / topes",
    "kind": "money",
    "help": ""
  },
  {
    "path": "porcentaje455",
    "label": "0455 — porcentaje sobre valor de módulos",
    "group": "Módulos / topes",
    "kind": "percent",
    "help": ""
  },
  {
    "path": "porcentaje667",
    "label": "0667 — porcentaje sobre valor de módulos",
    "group": "Módulos / topes",
    "kind": "percent",
    "help": ""
  },
  {
    "path": "compensacionConectividadPorCargo",
    "label": "Compensación por cargo",
    "group": "Compensación por conectividad",
    "kind": "money",
    "help": ""
  },
  {
    "path": "compensacionConectividadMaxGlobal",
    "label": "Tope global de conectividad",
    "group": "Compensación por conectividad",
    "kind": "money",
    "help": ""
  },
  {
    "path": "descuentoIPS",
    "label": "Descuento IPS",
    "group": "Descuentos",
    "kind": "percent",
    "help": ""
  },
  {
    "path": "descuentoIOMA",
    "label": "Descuento IOMA",
    "group": "Descuentos",
    "kind": "percent",
    "help": ""
  },
  {
    "path": "topeModulosConectividad.Inicial",
    "label": "Tope de módulos Inicial",
    "group": "Compensación por conectividad",
    "kind": "integer",
    "help": ""
  },
  {
    "path": "topeModulosConectividad.Primaria",
    "label": "Tope de módulos Primaria",
    "group": "Compensación por conectividad",
    "kind": "integer",
    "help": ""
  },
  {
    "path": "topeModulosConectividad.Secundaria",
    "label": "Tope de módulos Secundaria",
    "group": "Compensación por conectividad",
    "kind": "integer",
    "help": ""
  },
  {
    "path": "topeModulosConectividad.Superior",
    "label": "Tope de módulos Superior",
    "group": "Compensación por conectividad",
    "kind": "integer",
    "help": ""
  }
];
  function deepCopy(value){ return JSON.parse(JSON.stringify(value)); }
  function readPath(obj,path){return path.split('.').reduce((v,key)=>v==null?undefined:v[key],obj);}
  function writePath(obj,path,value){const keys=path.split('.');let target=obj;for(let i=0;i<keys.length-1;i++)target=target[keys[i]];target[keys[keys.length-1]]=value;}
  function validate(period){
    if (!period || !['borrador','publicado'].includes(period.estado)) return 'Estado de período inválido.';
    for (const field of FIELDS){
      const value=readPath(period,field.path);
      if(field.path==='basicoReferencia' && period.estado==='borrador' && value===null) continue;
      if(typeof value!=='number' || !Number.isFinite(value) || value<0) return 'Revisá: '+field.label+' (falta valor o no es válido).';
      if(field.path==='basicoReferencia' && period.estado==='publicado' && value<=0) return 'El básico debe ser mayor que cero para publicar.';
      if(field.kind==='integer' && !Number.isInteger(value)) return 'Revisá el número de módulos de '+field.label;
    }
    return null;
  }
  function periodLabel(yyyymm){
    if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(yyyymm))return yyyymm;
    const [year,month]=yyyymm.split('-').map(Number);
    const label = new Intl.DateTimeFormat('es-AR',{month:'long',year:'numeric'}).format(new Date(year,month-1,1));
    return label.charAt(0).toUpperCase()+label.slice(1);
  }
  global.SalarySchema={DEFAULT_PERIOD,FIELDS,deepCopy,readPath,writePath,validate,periodLabel};
})(window);
