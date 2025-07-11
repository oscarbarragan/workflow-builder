// src/components/layoutDesigner/utils/pageFlow.constants.js
// Constantes para el flujo avanzado de páginas al estilo Inspire Designer

export const PAGE_FLOW_TYPES = {
    SIMPLE: 'simple',           // Página simple (por defecto)
    CONDITIONAL: 'conditional', // Página con condiciones
    REPEATED: 'repeated'        // Página que se repite por datos
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
  
  export const NEXT_PAGE_TYPES = {
    NONE: 'none',              // Sin página siguiente
    SIMPLE: 'simple',          // Página siguiente específica
    CONDITIONAL: 'conditional', // Página siguiente condicional
    AUTO: 'auto'               // Siguiente automática (índice + 1)
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
  
  // Estructura por defecto para configuración de flujo de página
  export const DEFAULT_PAGE_FLOW_CONFIG = {
    // Tipo de página
    type: PAGE_FLOW_TYPES.SIMPLE,
    
    // Configuración para páginas simples
    simple: {
      targetPageId: null,
      targetPageIndex: null
    },
    
    // Configuración para páginas condicionales
    conditional: {
      conditions: [
        {
          id: null,
          variable: '',
          operator: OPERATORS.EQUALS,
          value: '',
          script: '',
          targetPageId: null,
          targetPageIndex: null,
          description: ''
        }
      ],
      defaultTargetPageId: null,
      defaultTargetPageIndex: null
    },
    
    // Configuración para páginas repetidas
    repeated: {
      dataSource: {
        type: DATA_SOURCE_TYPES.VARIABLE,
        variableName: '',
        arrayPath: '',
        filterConditions: []
      },
      itemVariableName: 'item', // Nombre de la variable para cada elemento
      indexVariableName: 'index', // Nombre de la variable para el índice
      maxIterations: 100, // Límite de seguridad
      templatePageId: null,
      templatePageIndex: null
    },
    
    // Configuración de página siguiente
    nextPage: {
      type: NEXT_PAGE_TYPES.AUTO,
      targetPageId: null,
      targetPageIndex: null,
      conditions: []
    },
    
    // Metadatos
    isEnabled: true,
    description: '',
    createdAt: null,
    updatedAt: null
  };
  
  // Funciones de validación de expresiones
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
  
  // Plantillas de condiciones comunes
  export const CONDITION_TEMPLATES = {
    'Variable exists': {
      type: CONDITION_TYPES.EXISTS,
      operator: OPERATORS.IS_NOT_EMPTY,
      description: 'Verificar si una variable tiene valor'
    },
    'Variable equals value': {
      type: CONDITION_TYPES.EQUALS,
      operator: OPERATORS.EQUALS,
      description: 'Verificar si una variable es igual a un valor específico'
    },
    'Array has items': {
      type: CONDITION_TYPES.SCRIPT,
      script: 'count({variable}) > 0',
      description: 'Verificar si un array tiene elementos'
    },
    'Number greater than': {
      type: CONDITION_TYPES.VARIABLE,
      operator: OPERATORS.GREATER_THAN,
      description: 'Verificar si un número es mayor que otro valor'
    },
    'Text contains': {
      type: CONDITION_TYPES.VARIABLE,
      operator: OPERATORS.CONTAINS,
      description: 'Verificar si un texto contiene una subcadena'
    }
  };
  
  // Configuración de validación
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
    NEXT_PAGE_TYPES,
    DATA_SOURCE_TYPES,
    OPERATORS,
    DEFAULT_PAGE_FLOW_CONFIG,
    EXPRESSION_FUNCTIONS,
    CONDITION_TEMPLATES,
    VALIDATION_RULES
  };