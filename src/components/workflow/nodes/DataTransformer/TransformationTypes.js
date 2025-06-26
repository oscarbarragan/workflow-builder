// src/components/workflow/nodes/DataTransformer/TransformationTypes.js - VERIFICADO
// Definiciones de transformaciones - VERSION CORREGIDA

export const TRANSFORMATION_CATEGORIES = {
  STRING: 'string',
  NUMBER: 'number',
  DATE: 'date',
  BOOLEAN: 'boolean',
  ARRAY: 'array',
  OBJECT: 'object',
  EMAIL: 'email',
  URL: 'url'
};

// ✅ VERIFICADO: Transformaciones para STRING - todas las opciones disponibles
export const STRING_TRANSFORMATIONS = {
  none: { 
    label: 'Sin transformación', 
    icon: '➡️',
    description: 'Mantener el valor original'
  },
  uppercase: { 
    label: 'Mayúsculas', 
    icon: '🔠',
    description: 'Convertir a MAYÚSCULAS'
  },
  lowercase: { 
    label: 'Minúsculas', 
    icon: '🔡',
    description: 'Convertir a minúsculas'
  },
  capitalize: { 
    label: 'Capitalizar', 
    icon: '🔤',
    description: 'Primera letra en mayúscula'
  },
  title_case: { 
    label: 'Título', 
    icon: '📝',
    description: 'Cada Palabra Capitalizada'
  },
  trim: { 
    label: 'Eliminar espacios', 
    icon: '✂️',
    description: 'Quitar espacios al inicio y final'
  },
  remove_spaces: { 
    label: 'Sin espacios', 
    icon: '🚫',
    description: 'Eliminar todos los espacios'
  },
  replace_spaces: { 
    label: 'Reemplazar espacios', 
    icon: '🔄',
    description: 'Cambiar espacios por otro carácter',
    config: { replacement: '_' }
  },
  substring: { 
    label: 'Subcadena', 
    icon: '✂️',
    description: 'Extraer parte del texto',
    config: { start: 0, length: 10 }
  },
  pad_left: { 
    label: 'Rellenar izquierda', 
    icon: '⬅️',
    description: 'Agregar caracteres a la izquierda',
    config: { length: 10, character: '0' }
  },
  pad_right: { 
    label: 'Rellenar derecha', 
    icon: '➡️',
    description: 'Agregar caracteres a la derecha',
    config: { length: 10, character: ' ' }
  },
  reverse: { 
    label: 'Invertir', 
    icon: '🔃',
    description: 'Invertir el orden de caracteres'
  },
  replace_text: { 
    label: 'Reemplazar texto', 
    icon: '🔍',
    description: 'Buscar y reemplazar texto',
    config: { search: '', replace: '' }
  },
  remove_accents: { 
    label: 'Sin acentos', 
    icon: '🎯',
    description: 'Eliminar acentos y diacríticos'
  },
  slug: { 
    label: 'URL Slug', 
    icon: '🔗',
    description: 'Formato URL amigable'
  },
  extract_numbers: { 
    label: 'Extraer números', 
    icon: '🔢',
    description: 'Solo los números del texto'
  },
  extract_letters: { 
    label: 'Solo letras', 
    icon: '🔤',
    description: 'Solo caracteres alfabéticos'
  }
};

export const NUMBER_TRANSFORMATIONS = {
  none: { 
    label: 'Sin transformación', 
    icon: '➡️',
    description: 'Mantener el valor original'
  },
  round: { 
    label: 'Redondear', 
    icon: '⭕',
    description: 'Redondear a entero',
    config: { decimals: 0 }
  },
  floor: { 
    label: 'Piso', 
    icon: '⬇️',
    description: 'Redondear hacia abajo'
  },
  ceil: { 
    label: 'Techo', 
    icon: '⬆️',
    description: 'Redondear hacia arriba'
  },
  abs: { 
    label: 'Valor absoluto', 
    icon: '📏',
    description: 'Eliminar signo negativo'
  },
  add: { 
    label: 'Sumar', 
    icon: '➕',
    description: 'Sumar un valor',
    config: { value: 0 }
  },
  subtract: { 
    label: 'Restar', 
    icon: '➖',
    description: 'Restar un valor',
    config: { value: 0 }
  },
  multiply: { 
    label: 'Multiplicar', 
    icon: '✖️',
    description: 'Multiplicar por un valor',
    config: { value: 1 }
  },
  divide: { 
    label: 'Dividir', 
    icon: '➗',
    description: 'Dividir por un valor',
    config: { value: 1 }
  },
  percentage: { 
    label: 'Porcentaje', 
    icon: '%',
    description: 'Convertir a porcentaje',
    config: { total: 100 }
  },
  format_currency: { 
    label: 'Formato moneda', 
    icon: '💰',
    description: 'Formato de moneda',
    config: { currency: 'COP', locale: 'es-CO' }
  },
  format_number: { 
    label: 'Formato número', 
    icon: '🔢',
    description: 'Formato con separadores',
    config: { locale: 'es-CO' }
  },
  to_string: { 
    label: 'A texto', 
    icon: '📝',
    description: 'Convertir a cadena de texto'
  },
  power: { 
    label: 'Potencia', 
    icon: '⚡',
    description: 'Elevar a potencia',
    config: { exponent: 2 }
  },
  sqrt: { 
    label: 'Raíz cuadrada', 
    icon: '√',
    description: 'Calcular raíz cuadrada'
  },
  min_max: { 
    label: 'Limitar rango', 
    icon: '📊',
    description: 'Asegurar valor en rango',
    config: { min: 0, max: 100 }
  }
};

export const DATE_TRANSFORMATIONS = {
  none: { 
    label: 'Sin transformación', 
    icon: '➡️',
    description: 'Mantener el valor original'
  },
  format_date: { 
    label: 'Formato fecha', 
    icon: '📅',
    description: 'Cambiar formato de fecha',
    config: { format: 'DD/MM/YYYY' }
  },
  format_datetime: { 
    label: 'Fecha y hora', 
    icon: '🕐',
    description: 'Incluir fecha y hora',
    config: { format: 'DD/MM/YYYY HH:mm' }
  },
  add_days: { 
    label: 'Agregar días', 
    icon: '➕',
    description: 'Sumar días a la fecha',
    config: { days: 0 }
  },
  subtract_days: { 
    label: 'Restar días', 
    icon: '➖',
    description: 'Restar días de la fecha',
    config: { days: 0 }
  },
  get_year: { 
    label: 'Obtener año', 
    icon: '📆',
    description: 'Solo el año'
  },
  get_month: { 
    label: 'Obtener mes', 
    icon: '📅',
    description: 'Solo el mes (1-12)'
  },
  get_day: { 
    label: 'Obtener día', 
    icon: '📋',
    description: 'Solo el día del mes'
  },
  get_weekday: { 
    label: 'Día de semana', 
    icon: '📊',
    description: 'Nombre del día de la semana'
  },
  age_from_date: { 
    label: 'Edad desde fecha', 
    icon: '🎂',
    description: 'Calcular edad en años'
  },
  days_until: { 
    label: 'Días hasta fecha', 
    icon: '⏳',
    description: 'Días restantes hasta fecha',
    config: { targetDate: new Date().toISOString().split('T')[0] }
  },
  is_weekend: { 
    label: 'Es fin de semana', 
    icon: '🏖️',
    description: 'Verdadero si es sábado o domingo'
  },
  quarter: { 
    label: 'Trimestre', 
    icon: '📈',
    description: 'Trimestre del año (Q1-Q4)'
  }
};

export const BOOLEAN_TRANSFORMATIONS = {
  none: { 
    label: 'Sin transformación', 
    icon: '➡️',
    description: 'Mantener el valor original'
  },
  negate: { 
    label: 'Negar', 
    icon: '🚫',
    description: 'Invertir verdadero/falso'
  },
  to_text: { 
    label: 'A texto', 
    icon: '📝',
    description: 'Convertir a Sí/No',
    config: { trueText: 'Sí', falseText: 'No' }
  },
  to_number: { 
    label: 'A número', 
    icon: '🔢',
    description: 'Convertir a 1/0'
  },
  to_spanish: { 
    label: 'A español', 
    icon: '🇪🇸',
    description: 'Verdadero/Falso'
  },
  to_english: { 
    label: 'A inglés', 
    icon: '🇺🇸',
    description: 'True/False'
  }
};

export const ARRAY_TRANSFORMATIONS = {
  none: { 
    label: 'Sin transformación', 
    icon: '➡️',
    description: 'Mantener el valor original'
  },
  length: { 
    label: 'Longitud', 
    icon: '📏',
    description: 'Número de elementos'
  },
  first: { 
    label: 'Primer elemento', 
    icon: '👆',
    description: 'Solo el primer elemento'
  },
  last: { 
    label: 'Último elemento', 
    icon: '👇',
    description: 'Solo el último elemento'
  },
  join: { 
    label: 'Unir elementos', 
    icon: '🔗',
    description: 'Convertir a texto separado',
    config: { separator: ', ' }
  },
  sort: { 
    label: 'Ordenar', 
    icon: '📊',
    description: 'Ordenar elementos'
  },
  reverse: { 
    label: 'Invertir orden', 
    icon: '🔃',
    description: 'Orden inverso'
  },
  unique: { 
    label: 'Elementos únicos', 
    icon: '✨',
    description: 'Eliminar duplicados'
  },
  sum: { 
    label: 'Suma (si números)', 
    icon: '➕',
    description: 'Sumar todos los números'
  },
  average: { 
    label: 'Promedio (si números)', 
    icon: '📊',
    description: 'Promedio de números'
  }
};

export const EMAIL_TRANSFORMATIONS = {
  none: { 
    label: 'Sin transformación', 
    icon: '➡️',
    description: 'Mantener el valor original'
  },
  extract_username: { 
    label: 'Extraer usuario', 
    icon: '👤',
    description: 'Parte antes del @'
  },
  extract_domain: { 
    label: 'Extraer dominio', 
    icon: '🌐',
    description: 'Parte después del @'
  },
  lowercase: { 
    label: 'Minúsculas', 
    icon: '🔡',
    description: 'Email en minúsculas'
  },
  validate: { 
    label: 'Validar formato', 
    icon: '✅',
    description: 'Verificar si es email válido'
  },
  obfuscate: { 
    label: 'Ofuscar', 
    icon: '🔒',
    description: 'Ocultar parte del email',
    config: { method: 'middle' }
  }
};

export const URL_TRANSFORMATIONS = {
  none: { 
    label: 'Sin transformación', 
    icon: '➡️',
    description: 'Mantener el valor original'
  },
  extract_domain: { 
    label: 'Extraer dominio', 
    icon: '🌐',
    description: 'Solo el dominio'
  },
  extract_path: { 
    label: 'Extraer ruta', 
    icon: '📁',
    description: 'Solo la ruta'
  },
  extract_params: { 
    label: 'Extraer parámetros', 
    icon: '🔍',
    description: 'Parámetros de consulta'
  },
  validate: { 
    label: 'Validar URL', 
    icon: '✅',
    description: 'Verificar si es URL válida'
  },
  add_protocol: { 
    label: 'Agregar protocolo', 
    icon: '🔗',
    description: 'Asegurar https://',
    config: { protocol: 'https' }
  }
};

// ✅ FUNCIÓN PRINCIPAL - CORREGIDA
export const getTransformationsForDataType = (dataType) => {
  console.log('🔍 getTransformationsForDataType called with:', dataType);
  
  let transformations;
  
  switch (dataType) {
    case 'string':
      transformations = STRING_TRANSFORMATIONS;
      break;
    case 'number':
      transformations = NUMBER_TRANSFORMATIONS;
      break;
    case 'date':
      transformations = DATE_TRANSFORMATIONS;
      break;
    case 'boolean':
      transformations = BOOLEAN_TRANSFORMATIONS;
      break;
    case 'array':
      transformations = ARRAY_TRANSFORMATIONS;
      break;
    case 'email':
      // Email combina transformaciones de string y email específicas
      transformations = { ...STRING_TRANSFORMATIONS, ...EMAIL_TRANSFORMATIONS };
      break;
    case 'url':
      // URL combina transformaciones de string y URL específicas
      transformations = { ...STRING_TRANSFORMATIONS, ...URL_TRANSFORMATIONS };
      break;
    case 'object':
      transformations = {
        none: { 
          label: 'Sin transformación', 
          icon: '➡️',
          description: 'Mantener el valor original'
        },
        to_json: { 
          label: 'A JSON', 
          icon: '📄',
          description: 'Convertir a cadena JSON'
        },
        keys: { 
          label: 'Obtener claves', 
          icon: '🔑',
          description: 'Array con las claves del objeto'
        },
        values: { 
          label: 'Obtener valores', 
          icon: '💎',
          description: 'Array con los valores del objeto'
        },
        flatten: { 
          label: 'Aplanar', 
          icon: '📋',
          description: 'Convertir objeto anidado a plano'
        }
      };
      break;
    default:
      console.warn('⚠️ Unknown data type:', dataType, 'falling back to STRING_TRANSFORMATIONS');
      transformations = STRING_TRANSFORMATIONS;
  }
  
  console.log('✅ Returning transformations for', dataType, ':', transformations);
  console.log('✅ Number of transformations:', Object.keys(transformations).length);
  
  return transformations;
};

// Función para obtener la configuración por defecto de una transformación
export const getDefaultConfig = (transformationType, dataType) => {
  const transformations = getTransformationsForDataType(dataType);
  const transformation = transformations[transformationType];
  return transformation?.config || {};
};

// Función para obtener todas las categorías con sus transformaciones
export const getAllTransformationCategories = () => {
  return {
    string: {
      label: 'Texto',
      icon: '📝',
      transformations: STRING_TRANSFORMATIONS
    },
    number: {
      label: 'Número',
      icon: '🔢',
      transformations: NUMBER_TRANSFORMATIONS
    },
    date: {
      label: 'Fecha',
      icon: '📅',
      transformations: DATE_TRANSFORMATIONS
    },
    boolean: {
      label: 'Booleano',
      icon: '☑️',
      transformations: BOOLEAN_TRANSFORMATIONS
    },
    array: {
      label: 'Array',
      icon: '📊',
      transformations: ARRAY_TRANSFORMATIONS
    },
    email: {
      label: 'Email',
      icon: '📧',
      transformations: EMAIL_TRANSFORMATIONS
    },
    url: {
      label: 'URL',
      icon: '🔗',
      transformations: URL_TRANSFORMATIONS
    }
  };
};