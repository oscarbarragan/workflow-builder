// src/utils/scriptTemplates.js - Templates para Script Processor SIN TEMPLATE POR DEFECTO

// ✅ CORREGIDO: No hay template por defecto, el editor inicia limpio
export const getDefaultScript = () => ''; // VACÍO

// ✅ CORREGIDO: Template básico con mejor manejo de propiedades y .toString()
export const scriptTemplates = {
  basic: `// Script Processor - Procesa datos del workflow
// Variables disponibles: input (datos de entrada)
// Retorna: objeto con las variables de salida

function processData(input) {
  // Tus datos de entrada están en 'input'
  console.log('📥 Datos de entrada:', input);
  
  // Ejemplo de procesamiento seguro
  const result = {
    // Procesar datos aquí
    processedAt: new Date().toISOString(),
    totalItems: Object.keys(input).length,
    
    // Ejemplos de transformaciones seguras
    stringData: {},
    numberData: {},
    safeConversions: {}
  };
  
  // ✅ CORREGIDO: Manejo seguro de conversiones de tipos
  Object.entries(input).forEach(([key, value]) => {
    // Para strings
    if (typeof value === 'string') {
      result.stringData[key + '_upper'] = value.toUpperCase();
      result.stringData[key + '_length'] = value.length;
    }
    
    // Para números - manejo seguro de toString()
    if (typeof value === 'number') {
      result.numberData[key + '_string'] = value.toString(); // ✅ Correcto
      result.numberData[key + '_doubled'] = value * 2;
    }
    
    // Conversiones seguras con validación
    if (typeof value === 'string' && !isNaN(value) && value.trim() !== '') {
      result.safeConversions[key + '_asNumber'] = parseFloat(value);
    }
    
    // ✅ EVITAR: input.user_id.toString (incorrecto)
    // ✅ USAR: input.user_id.toString() (correcto)
    if (key === 'user_id' && typeof value === 'number') {
      result.safeConversions['user_id_as_string'] = value.toString(); // Nota los paréntesis
    }
  });
  
  console.log('📤 Datos de salida:', result);
  return result;
}

// Ejecutar el procesamiento
return processData(input);`,

  dataMapper: `// ✅ CORREGIDO: Uso seguro de Variables del Data Mapper
function processData(input) {
  console.log('📥 Datos de entrada del Data Mapper:', input);
  
  const result = {
    processedData: {},
    validations: { errors: [], warnings: [] },
    statistics: { totalProcessed: 0, successCount: 0 }
  };
  
  // Procesar cada variable de entrada de forma segura
  Object.entries(input).forEach(([key, value]) => {
    try {
      result.statistics.totalProcessed++;
      
      // Procesar según el tipo de dato
      if (typeof value === 'string') {
        // ✅ Validaciones seguras para strings
        result.processedData[key + '_processed'] = {
          original: value,
          uppercase: value.toUpperCase(),
          length: value.length,
          trimmed: value.trim()
        };
        
        // Validar emails de forma segura
        if (key.toLowerCase().includes('email')) {
          const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
          if (!emailRegex.test(value)) {
            result.validations.errors.push(\`Email inválido en \${key}: \${value}\`);
          }
        }
        
        result.statistics.successCount++;
      }
      else if (typeof value === 'number') {
        // ✅ Manejo correcto de números
        result.processedData[key + '_processed'] = {
          original: value,
          asString: value.toString(), // ✅ Correcto con paréntesis
          doubled: value * 2,
          isPositive: value > 0
        };
        
        result.statistics.successCount++;
      }
      else if (typeof value === 'boolean') {
        result.processedData[key + '_processed'] = {
          original: value,
          asString: value.toString(), // ✅ Correcto
          asNumber: value ? 1 : 0
        };
        
        result.statistics.successCount++;
      }
      else {
        // Para otros tipos, conversión segura a string
        result.processedData[key + '_processed'] = {
          original: value,
          type: typeof value,
          asString: String(value) // ✅ Forma segura de convertir cualquier cosa a string
        };
        
        result.statistics.successCount++;
      }
    } catch (error) {
      result.validations.errors.push(\`Error procesando \${key}: \${error.message}\`);
    }
  });
  
  result.summary = {
    totalVariables: Object.keys(input).length,
    processedSuccessfully: result.statistics.successCount,
    errorsFound: result.validations.errors.length,
    successRate: (result.statistics.successCount / result.statistics.totalProcessed * 100).toFixed(2)
  };
  
  console.log('✅ Procesamiento completado:', result.summary);
  return result;
}

return processData(input);`,

  workflowData: `// ✅ CORREGIDO: Procesamiento seguro de Datos del Workflow
function processData(input) {
  console.log('🔄 Procesando datos del workflow:', input);
  
  const result = {
    categorizedData: {
      strings: {},
      numbers: {},
      booleans: {},
      objects: {},
      arrays: {}
    },
    transformations: {},
    validations: { passed: [], failed: [] },
    metadata: {
      processedAt: new Date().toISOString(),
      totalInputs: Object.keys(input).length
    }
  };
  
  // Categorizar y procesar datos de forma segura
  Object.entries(input).forEach(([key, value]) => {
    try {
      const dataType = typeof value;
      
      switch (dataType) {
        case 'string':
          result.categorizedData.strings[key] = {
            original: value,
            length: value.length,
            uppercase: value.toUpperCase(),
            lowercase: value.toLowerCase(),
            trimmed: value.trim(),
            // ✅ Detección segura de tipos especiales
            seemsLikeNumber: !isNaN(value) && value.trim() !== '',
            seemsLikeDate: /^\d{4}-\d{2}-\d{2}/.test(value),
            seemsLikeEmail: /@/.test(value)
          };
          
          // Transformaciones adicionales para strings
          if (!isNaN(value) && value.trim() !== '') {
            result.transformations[key + '_asNumber'] = parseFloat(value);
          }
          break;
          
        case 'number':
          result.categorizedData.numbers[key] = {
            original: value,
            asString: value.toString(), // ✅ Forma correcta
            doubled: value * 2,
            squared: value * value,
            isInteger: Number.isInteger(value),
            isPositive: value > 0,
            formatted: value.toLocaleString('es-ES')
          };
          break;
          
        case 'boolean':
          result.categorizedData.booleans[key] = {
            original: value,
            asString: value.toString(), // ✅ Correcto
            asNumber: value ? 1 : 0,
            inverted: !value
          };
          break;
          
        case 'object':
          if (Array.isArray(value)) {
            result.categorizedData.arrays[key] = {
              original: value,
              length: value.length,
              firstItem: value.length > 0 ? value[0] : null,
              isEmpty: value.length === 0
            };
          } else if (value !== null) {
            result.categorizedData.objects[key] = {
              original: value,
              keys: Object.keys(value),
              keyCount: Object.keys(value).length,
              hasNestedObjects: Object.values(value).some(v => typeof v === 'object')
            };
          }
          break;
      }
      
      result.validations.passed.push(key);
      
    } catch (error) {
      result.validations.failed.push({
        key: key,
        error: error.message,
        value: String(value) // Conversión segura para el log
      });
    }
  });
  
  // Generar estadísticas
  result.statistics = {
    totalStrings: Object.keys(result.categorizedData.strings).length,
    totalNumbers: Object.keys(result.categorizedData.numbers).length,
    totalBooleans: Object.keys(result.categorizedData.booleans).length,
    totalObjects: Object.keys(result.categorizedData.objects).length,
    totalArrays: Object.keys(result.categorizedData.arrays).length,
    successfullyProcessed: result.validations.passed.length,
    failedProcessing: result.validations.failed.length
  };
  
  console.log('📊 Estadísticas del procesamiento:', result.statistics);
  return result;
}

return processData(input);`,

  dataTransform: `// ✅ CORREGIDO: Transformación segura de Datos
function processData(input) {
  console.log('⚡ Iniciando transformación de datos:', input);
  
  const result = {
    transformedData: {},
    originalData: input,
    transformationLog: [],
    errors: []
  };
  
  // Función auxiliar para logging seguro
  const logTransformation = (key, originalValue, newValue, transformation) => {
    result.transformationLog.push({
      key,
      originalValue: String(originalValue), // Conversión segura
      newValue: String(newValue),
      transformation,
      timestamp: new Date().toISOString()
    });
  };
  
  // Transformar cada entrada de forma segura
  Object.entries(input).forEach(([key, value]) => {
    try {
      if (typeof value === 'string') {
        // Transformaciones para strings
        const transformed = {
          uppercase: value.toUpperCase(),
          lowercase: value.toLowerCase(),
          capitalized: value.charAt(0).toUpperCase() + value.slice(1).toLowerCase(),
          reversed: value.split('').reverse().join(''),
          wordCount: value.split(/\s+/).filter(word => word.length > 0).length,
          charCount: value.length
        };
        
        // ✅ Conversión segura a número si es posible
        if (!isNaN(value) && value.trim() !== '') {
          transformed.asNumber = parseFloat(value);
          logTransformation(key, value, transformed.asNumber, 'string_to_number');
        }
        
        result.transformedData[key] = transformed;
        logTransformation(key, value, transformed, 'string_transformations');
      }
      else if (typeof value === 'number') {
        // Transformaciones para números
        const transformed = {
          asString: value.toString(), // ✅ Forma correcta con paréntesis
          doubled: value * 2,
          halved: value / 2,
          squared: value * value,
          squareRoot: Math.sqrt(Math.abs(value)), // Raíz cuadrada del valor absoluto
          rounded: Math.round(value),
          floor: Math.floor(value),
          ceil: Math.ceil(value),
          absolute: Math.abs(value),
          percentage: (value * 100).toFixed(2) + '%'
        };
        
        result.transformedData[key] = transformed;
        logTransformation(key, value, transformed, 'number_transformations');
      }
      else if (typeof value === 'boolean') {
        // Transformaciones para booleanos
        const transformed = {
          asString: value.toString(), // ✅ Correcto
          asNumber: value ? 1 : 0,
          inverted: !value,
          asText: value ? 'Verdadero' : 'Falso',
          asYesNo: value ? 'Sí' : 'No'
        };
        
        result.transformedData[key] = transformed;
        logTransformation(key, value, transformed, 'boolean_transformations');
      }
      else if (Array.isArray(value)) {
        // Transformaciones para arrays
        const transformed = {
          length: value.length,
          asString: JSON.stringify(value),
          first: value.length > 0 ? value[0] : null,
          last: value.length > 0 ? value[value.length - 1] : null,
          isEmpty: value.length === 0,
          // Solo sumar si todos los elementos son números
          sum: value.every(item => typeof item === 'number') ? 
               value.reduce((acc, item) => acc + item, 0) : null
        };
        
        result.transformedData[key] = transformed;
        logTransformation(key, value, transformed, 'array_transformations');
      }
      else if (value && typeof value === 'object') {
        // Transformaciones para objetos
        const transformed = {
          keys: Object.keys(value),
          values: Object.values(value),
          keyCount: Object.keys(value).length,
          asString: JSON.stringify(value),
          isEmpty: Object.keys(value).length === 0
        };
        
        result.transformedData[key] = transformed;
        logTransformation(key, value, transformed, 'object_transformations');
      }
      else {
        // Para valores null, undefined u otros tipos
        const transformed = {
          type: typeof value,
          asString: String(value), // Conversión universal segura
          isNull: value === null,
          isUndefined: value === undefined
        };
        
        result.transformedData[key] = transformed;
        logTransformation(key, value, transformed, 'other_transformations');
      }
      
    } catch (error) {
      result.errors.push({
        key,
        originalValue: String(value),
        error: error.message
      });
    }
  });
  
  // Estadísticas finales
  result.summary = {
    totalInputs: Object.keys(input).length,
    successfulTransformations: Object.keys(result.transformedData).length,
    errors: result.errors.length,
    totalTransformationOperations: result.transformationLog.length,
    completedAt: new Date().toISOString()
  };
  
  console.log('✅ Transformación completada:', result.summary);
  return result;
}

return processData(input);`,

  validation: `// ✅ CORREGIDO: Validación segura de Datos
function processData(input) {
  console.log('✔️ Iniciando validación de datos:', input);
  
  const result = {
    validData: {},
    invalidData: {},
    errors: [],
    warnings: [],
    validationResults: {}
  };
  
  // Reglas de validación
  const validationRules = {
    email: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/,
    phone: /^[+]?[\d\s\-\(\)]{7,}$/,
    url: /^https?:\/\/.+/,
    date: /^\d{4}-\d{2}-\d{2}/,
    positiveNumber: (value) => typeof value === 'number' && value > 0,
    nonEmptyString: (value) => typeof value === 'string' && value.trim().length > 0
  };
  
  // Validar cada entrada
  Object.entries(input).forEach(([key, value]) => {
    const validationResult = {
      key,
      originalValue: value,
      type: typeof value,
      validations: []
    };
    
    try {
      // Validaciones específicas según el nombre de la variable
      if (key.toLowerCase().includes('email')) {
        if (typeof value === 'string') {
          const isValid = validationRules.email.test(value);
          validationResult.validations.push({
            rule: 'email_format',
            passed: isValid,
            message: isValid ? 'Email válido' : \`Email inválido: \${value}\`
          });
          
          if (!isValid) {
            result.errors.push(\`Email inválido en \${key}: \${value}\`);
            result.invalidData[key] = value;
          } else {
            result.validData[key] = value;
          }
        } else {
          result.errors.push(\`\${key} debería ser string para validación de email\`);
          result.invalidData[key] = value;
        }
      }
      else if (key.toLowerCase().includes('phone') || key.toLowerCase().includes('telefono')) {
        if (typeof value === 'string') {
          const isValid = validationRules.phone.test(value);
          validationResult.validations.push({
            rule: 'phone_format',
            passed: isValid,
            message: isValid ? 'Teléfono válido' : \`Formato de teléfono inválido: \${value}\`
          });
          
          if (!isValid) {
            result.warnings.push(\`Formato de teléfono cuestionable en \${key}: \${value}\`);
          }
          result.validData[key] = value; // Los teléfonos van a válidos pero con warning
        }
      }
      else if (key.toLowerCase().includes('url') || key.toLowerCase().includes('website')) {
        if (typeof value === 'string') {
          const isValid = validationRules.url.test(value);
          validationResult.validations.push({
            rule: 'url_format',
            passed: isValid,
            message: isValid ? 'URL válida' : \`URL inválida: \${value}\`
          });
          
          if (!isValid) {
            result.errors.push(\`URL inválida en \${key}: \${value}\`);
            result.invalidData[key] = value;
          } else {
            result.validData[key] = value;
          }
        }
      }
      else if (key.toLowerCase().includes('age') || key.toLowerCase().includes('edad')) {
        if (typeof value === 'number') {
          const isValid = value > 0 && value < 150;
          validationResult.validations.push({
            rule: 'age_range',
            passed: isValid,
            message: isValid ? 'Edad válida' : \`Edad fuera de rango: \${value}\`
          });
          
          if (!isValid) {
            result.errors.push(\`Edad inválida en \${key}: \${value}\`);
            result.invalidData[key] = value;
          } else {
            result.validData[key] = value;
          }
        } else if (typeof value === 'string' && !isNaN(value)) {
          // ✅ Conversión segura de string a número para edades
          const ageAsNumber = parseInt(value);
          const isValid = ageAsNumber > 0 && ageAsNumber < 150;
          
          if (isValid) {
            result.validData[key + '_converted'] = ageAsNumber;
            result.warnings.push(\`Edad convertida de string a número: \${value} -> \${ageAsNumber}\`);
          } else {
            result.errors.push(\`Edad inválida tras conversión en \${key}: \${value}\`);
            result.invalidData[key] = value;
          }
        }
      }
      else if (typeof value === 'number') {
        // Validaciones generales para números
        const validations = [
          {
            rule: 'is_finite',
            passed: isFinite(value),
            message: isFinite(value) ? 'Número finito' : 'Número no finito (Infinity o NaN)'
          },
          {
            rule: 'is_positive',
            passed: value >= 0,
            message: value >= 0 ? 'Número positivo o cero' : 'Número negativo'
          }
        ];
        
        validationResult.validations.push(...validations);
        
        if (!isFinite(value)) {
          result.errors.push(\`Número no finito en \${key}: \${value}\`);
          result.invalidData[key] = value;
        } else {
          result.validData[key] = value;
          if (value < 0) {
            result.warnings.push(\`Número negativo en \${key}: \${value}\`);
          }
        }
      }
      else if (typeof value === 'string') {
        // Validaciones generales para strings
        const isEmpty = value.trim().length === 0;
        const isTooLong = value.length > 1000;
        
        validationResult.validations.push({
          rule: 'non_empty',
          passed: !isEmpty,
          message: isEmpty ? 'String vacío' : 'String no vacío'
        });
        
        if (isEmpty) {
          result.warnings.push(\`String vacío en \${key}\`);
        }
        
        if (isTooLong) {
          result.warnings.push(\`String muy largo en \${key}: \${value.length} caracteres\`);
        }
        
        result.validData[key] = value;
      }
      else {
        // Para otros tipos, simplemente los agregamos como válidos
        result.validData[key] = value;
        validationResult.validations.push({
          rule: 'accepted_type',
          passed: true,
          message: \`Tipo aceptado: \${typeof value}\`
        });
      }
      
      result.validationResults[key] = validationResult;
      
    } catch (error) {
      result.errors.push(\`Error validando \${key}: \${error.message}\`);
      result.invalidData[key] = value;
    }
  });
  
  // Estadísticas de validación
  result.summary = {
    totalInputs: Object.keys(input).length,
    validItems: Object.keys(result.validData).length,
    invalidItems: Object.keys(result.invalidData).length,
    totalErrors: result.errors.length,
    totalWarnings: result.warnings.length,
    validationPassed: result.errors.length === 0,
    successRate: ((Object.keys(result.validData).length / Object.keys(input).length) * 100).toFixed(2) + '%',
    completedAt: new Date().toISOString()
  };
  
  console.log('📊 Resultado de validación:', result.summary);
  return result;
}

return processData(input);`,

  calculations: `// ✅ CORREGIDO: Cálculos seguros y avanzados
function processData(input) {
  console.log('🧮 Iniciando cálculos avanzados:', input);
  
  // Extraer todos los números de forma segura
  const numbers = [];
  const strings = [];
  const dataAnalysis = {};
  
  Object.entries(input).forEach(([key, value]) => {
    if (typeof value === 'number' && isFinite(value)) {
      numbers.push(value);
      dataAnalysis[key] = {
        type: 'number',
        value: value,
        asString: value.toString() // ✅ Correcto
      };
    } else if (typeof value === 'string') {
      strings.push(value);
      dataAnalysis[key] = {
        type: 'string',
        value: value,
        length: value.length
      };
      
      // ✅ Conversión segura de string a número
      if (!isNaN(value) && value.trim() !== '') {
        const numValue = parseFloat(value);
        if (isFinite(numValue)) {
          numbers.push(numValue);
          dataAnalysis[key].numericValue = numValue;
          dataAnalysis[key].convertedFromString = true;
        }
      }
    } else {
      dataAnalysis[key] = {
        type: typeof value,
        value: value,
        asString: String(value) // Conversión universal segura
      };
    }
  });
  
  const result = {
    originalData: input,
    dataAnalysis,
    numericCalculations: {},
    stringAnalysis: {},
    advancedCalculations: {}
  };
  
  // Cálculos numéricos básicos
  if (numbers.length > 0) {
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    const count = numbers.length;
    const average = sum / count;
    const min = Math.min(...numbers);
    const max = Math.max(...numbers);
    
    result.numericCalculations = {
      count,
      sum,
      average: parseFloat(average.toFixed(4)),
      min,
      max,
      range: max - min,
      
      // Medidas de dispersión
      median: calculateMedian(numbers),
      mode: calculateMode(numbers),
      variance: calculateVariance(numbers, average),
      standardDeviation: Math.sqrt(calculateVariance(numbers, average)),
      
      // Transformaciones
      normalized: numbers.map(n => parseFloat(((n - min) / (max - min)).toFixed(4))),
      rounded: numbers.map(n => Math.round(n)),
      squared: numbers.map(n => n * n),
      logarithmic: numbers.filter(n => n > 0).map(n => Math.log(n)),
      
      // Estadísticas adicionales
      positiveCount: numbers.filter(n => n > 0).length,
      negativeCount: numbers.filter(n => n < 0).length,
      zeroCount: numbers.filter(n => n === 0).length,
      
      // Percentiles
      percentile25: calculatePercentile(numbers, 25),
      percentile75: calculatePercentile(numbers, 75),
      
      // ✅ Conversiones seguras a string
      sumAsString: sum.toString(),
      averageAsString: average.toFixed(2),
      maxAsString: max.toString(),
      minAsString: min.toString()
    };
  }
  
  // Análisis de strings
  if (strings.length > 0) {
    const totalLength = strings.reduce((acc, str) => acc + str.length, 0);
    const averageLength = totalLength / strings.length;
    const longestString = strings.reduce((longest, current) => 
      current.length > longest.length ? current : longest, ''
    );
    const shortestString = strings.reduce((shortest, current) => 
      current.length < shortest.length ? current : shortest, strings[0]
    );
    
    result.stringAnalysis = {
      count: strings.length,
      totalLength,
      averageLength: parseFloat(averageLength.toFixed(2)),
      longestString,
      shortestString,
      longestLength: longestString.length,
      shortestLength: shortestString.length,
      
      // Análisis de contenido
      emptyStrings: strings.filter(s => s.trim() === '').length,
      uniqueStrings: [...new Set(strings)].length,
      duplicateCount: strings.length - [...new Set(strings)].length,
      
      // Transformaciones
      allUppercase: strings.map(s => s.toUpperCase()),
      allLowercase: strings.map(s => s.toLowerCase()),
      wordCounts: strings.map(s => s.split(/\s+/).filter(word => word.length > 0).length),
      
      // Estadísticas de longitud
      lengthDistribution: strings.map(s => s.length).sort((a, b) => a - b)
    };
  }
  
  // Cálculos avanzados combinando datos
  result.advancedCalculations = {
    totalDataPoints: Object.keys(input).length,
    numericRatio: numbers.length / Object.keys(input).length,
    stringRatio: strings.length / Object.keys(input).length,
    
    // Correlaciones simples (si hay suficientes números)
    numbersVariability: numbers.length > 1 ? 
      Math.sqrt(calculateVariance(numbers, result.numericCalculations?.average || 0)) / (result.numericCalculations?.average || 1) : 0,
    
    // Métricas de calidad de datos
    dataQualityScore: calculateDataQualityScore(input),
    completenessRatio: Object.values(input).filter(v => v !== null && v !== undefined && v !== '').length / Object.keys(input).length,
    
    // Timestamp y metadatos
    calculatedAt: new Date().toISOString(),
    processingTime: Date.now() - Date.now() // Placeholder para tiempo real de procesamiento
  };
  
  console.log('📊 Cálculos completados:', {
    numbersProcessed: numbers.length,
    stringsProcessed: strings.length,
    totalCalculations: Object.keys(result.numericCalculations || {}).length
  });
  
  return result;
}

// Funciones auxiliares para cálculos
function calculateMedian(numbers) {
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? 
    (sorted[mid - 1] + sorted[mid]) / 2 : 
    sorted[mid];
}

function calculateMode(numbers) {
  const frequency = {};
  numbers.forEach(num => {
    frequency[num] = (frequency[num] || 0) + 1;
  });
  
  let maxFreq = 0;
  let mode = numbers[0];
  
  Object.entries(frequency).forEach(([num, freq]) => {
    if (freq > maxFreq) {
      maxFreq = freq;
      mode = parseFloat(num);
    }
  });
  
  return mode;
}

function calculateVariance(numbers, mean) {
  const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
  return squaredDiffs.reduce((acc, val) => acc + val, 0) / numbers.length;
}

function calculatePercentile(numbers, percentile) {
  const sorted = [...numbers].sort((a, b) => a - b);
  const index = (percentile / 100) * (sorted.length - 1);
  
  if (Number.isInteger(index)) {
    return sorted[index];
  } else {
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }
}

function calculateDataQualityScore(input) {
  let score = 100;
  const total = Object.keys(input).length;
  
  // Penalizar valores nulos/vacíos
  const nullValues = Object.values(input).filter(v => v === null || v === undefined || v === '').length;
  score -= (nullValues / total) * 30;
  
  // Penalizar tipos inconsistentes si hay muchos
  const types = Object.values(input).map(v => typeof v);
  const uniqueTypes = [...new Set(types)].length;
  if (uniqueTypes > 3) score -= 10;
  
  // Bonificar consistencia
  if (nullValues === 0) score += 10;
  
  return Math.max(0, Math.min(100, score));
}

return processData(input);`
};