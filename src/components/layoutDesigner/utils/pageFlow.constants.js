// src/components/layoutDesigner/utils/pageFlow.constants.js
// Constantes para el flujo de páginas - REESTRUCTURADO para Page Level

export const PAGE_FLOW_TYPES = {
  SIMPLE: 'simple',           // Página simple con start page específica
  CONDITIONAL: 'conditional', // Página con condiciones que determinan start page
  REPEATED: 'repeated'        // Página que se repite por datos con start page
};

export const CONDITION_TYPES = {
  VARIABLE: 'variable',       // Condición basada en variable
  SCRIPT: 'script',          // Condición basada en script/expresión
  EXISTS: 'exists',          // Verificar si existe un valor
  EQUALS: 'equals',          // Comparación de igualdad
  GREATER_THAN: 'greaterThan', // Mayor que
  LESS_THAN: 'lessThan',     // Menor que
  CONTAINS: 'contains',      // Contiene texto
  NOT_EMPTY: 'notEmpty'      // No está vacío
};

export const DATA_SOURCE_TYPES = {
  VARIABLE: 'variable',      // Variable específica
  ARRAY: 'array',           // Array de datos
  OBJECT: 'object',         // Objeto de datos
  FUNCTION: 'function'      // Función que retorna datos
};

// Operadores para condiciones
export const OPERATORS = {
  EQUALS: '==',
  NOT_EQUALS: '!=',
  GREATER_THAN: '>',
  LESS_THAN: '<',
  GREATER_EQUAL: '>=',
  LESS_EQUAL: '<=',
  CONTAINS: 'contains',
  NOT_CONTAINS: 'not_contains',
  STARTS_WITH: 'starts_with',
  ENDS_WITH: 'ends_with',
  IS_EMPTY: 'is_empty',
  IS_NOT_EMPTY: 'is_not_empty',
  IN_ARRAY: 'in_array',
  NOT_IN_ARRAY: 'not_in_array'
};

// ✅ REESTRUCTURADO: Configuración de flujo de página sin Next Page
export const DEFAULT_PAGE_FLOW_CONFIG = {
  // Tipo de página
  type: PAGE_FLOW_TYPES.SIMPLE,
  
  // ✅ NUEVO: Configuración para páginas simples con start page
  simple: {
    startPageId: null,
    startPageIndex: 0, // Por defecto primera página (índice 0)
    description: 'Página simple que inicia en una página específica'
  },
  
  // ✅ ACTUALIZADO: Configuración para páginas condicionales con start page
  conditional: {
    conditions: [
      {
        id: null,
        type: CONDITION_TYPES.VARIABLE, // Agregar tipo por defecto
        variable: '',
        operator: OPERATORS.EQUALS,
        value: '',
        script: '',
        startPageId: null,     // ✅ CAMBIADO: de targetPageId a startPageId
        startPageIndex: null,  // ✅ CAMBIADO: de targetPageIndex a startPageIndex
        description: ''
      }
    ],
    defaultStartPageId: null,     // ✅ CAMBIADO: de defaultTargetPageId
    defaultStartPageIndex: 0      // ✅ CAMBIADO: de defaultTargetPageIndex, default primera página
  },
  
  // ✅ ACTUALIZADO: Configuración para páginas repetidas con start page
  repeated: {
    dataSource: {
      type: DATA_SOURCE_TYPES.VARIABLE,
      variableName: '',
      arrayPath: '',
      filterConditions: []
    },
    itemVariableName: 'item',     // Nombre de la variable para cada elemento
    indexVariableName: 'index',   // Nombre de la variable para el índice
    maxIterations: 100,           // Límite de seguridad
    startPageId: null,            // ✅ CAMBIADO: de templatePageId a startPageId
    startPageIndex: 0,            // ✅ CAMBIADO: de templatePageIndex a startPageIndex, default primera página
    description: 'Página repetida que inicia en una página específica para cada iteración'
  },
  
  // ✅ ELIMINADO: nextPage configuration completamente removida
  
  // Metadatos
  isEnabled: true,
  description: '',
  createdAt: null,
  updatedAt: null
};

// Funciones de validación de expresiones (sin cambios)
export const EXPRESSION_FUNCTIONS = {
  // Funciones matemáticas
  'abs': Math.abs,
  'ceil': Math.ceil,
  'floor': Math.floor,
  'round': Math.round,
  'max': Math.max,
  'min': Math.min,
  
  // Funciones de string
  'toLowerCase': (str) => String(str).toLowerCase(),
  'toUpperCase': (str) => String(str).toUpperCase(),
  'trim': (str) => String(str).trim(),
  'length': (str) => String(str).length,
  
  // Funciones de array
  'count': (arr) => Array.isArray(arr) ? arr.length : 0,
  'isEmpty': (val) => {
    if (Array.isArray(val)) return val.length === 0;
    if (typeof val === 'object' && val !== null) return Object.keys(val).length === 0;
    return !val;
  },
  'isNotEmpty': (val) => !EXPRESSION_FUNCTIONS.isEmpty(val),
  
  // Funciones de comparación
  'equals': (a, b) => a === b,
  'contains': (str, search) => String(str).includes(String(search)),
  'startsWith': (str, prefix) => String(str).startsWith(String(prefix)),
  'endsWith': (str, suffix) => String(str).endsWith(String(suffix)),
  
  // Funciones de fecha (básicas)
  'now': () => new Date(),
  'today': () => new Date().toDateString(),
  'year': (date) => new Date(date).getFullYear(),
  'month': (date) => new Date(date).getMonth() + 1,
  'day': (date) => new Date(date).getDate()
};

// ✅ ACTUALIZADO: Plantillas de condiciones con start page
export const CONDITION_TEMPLATES = {
  'Variable exists': {
    type: CONDITION_TYPES.EXISTS,
    operator: OPERATORS.IS_NOT_EMPTY,
    description: 'Verificar si una variable tiene valor y determinar página de inicio'
  },
  'Variable equals value': {
    type: CONDITION_TYPES.EQUALS,
    operator: OPERATORS.EQUALS,
    description: 'Verificar si una variable es igual a un valor específico para determinar página de inicio'
  },
  'Array has items': {
    type: CONDITION_TYPES.SCRIPT,
    script: 'return count({variable}) > 0',
    description: 'Verificar si un array tiene elementos para determinar página de inicio'
  },
  'Number greater than': {
    type: CONDITION_TYPES.VARIABLE,
    operator: OPERATORS.GREATER_THAN,
    description: 'Verificar si un número es mayor que otro valor para determinar página de inicio'
  },
  'Text contains': {
    type: CONDITION_TYPES.VARIABLE,
    operator: OPERATORS.CONTAINS,
    description: 'Verificar si un texto contiene una subcadena para determinar página de inicio'
  }
};

// Configuración de validación (sin cambios)
export const VALIDATION_RULES = {
  maxConditions: 20,
  maxIterations: 1000,
  maxNestingDepth: 10,
  allowedScriptPatterns: [
    /^[a-zA-Z_$][a-zA-Z0-9_$]*(\.[a-zA-Z_$][a-zA-Z0-9_$]*)*$/, // Variables y propiedades
    /^(true|false|null|undefined|\d+(\.\d+)?|'[^']*'|"[^"]*")$/, // Valores literales
    /^(==|!=|>|<|>=|<=|&&|\|\||!|\+|\-|\*|\/|\%|\(|\))$/ // Operadores
  ],
  reservedWords: ['function', 'eval', 'window', 'document', 'global', 'process']
};

export default {
  PAGE_FLOW_TYPES,
  CONDITION_TYPES,
  DATA_SOURCE_TYPES,
  OPERATORS,
  DEFAULT_PAGE_FLOW_CONFIG,
  EXPRESSION_FUNCTIONS,
  CONDITION_TEMPLATES,
  VALIDATION_RULES
};