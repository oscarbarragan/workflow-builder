// src/utils/scriptTemplates.js - Templates para Script Processor
export const getDefaultScript = () => `// Script Processor - Procesa datos del workflow
// Variables disponibles: input (datos de entrada)
// Retorna: objeto con las variables de salida

function processData(input) {
  // Tus datos de entrada están en 'input'
  console.log('📥 Datos de entrada:', input);
  
  // Ejemplo de procesamiento
  const result = {
    // Procesar datos aquí
    processedAt: new Date().toISOString(),
    totalItems: Object.keys(input).length,
    
    // Ejemplos de transformaciones
    upperCaseNames: {},
    calculations: {}
  };
  
  // Transformar nombres a mayúsculas
  Object.entries(input).forEach(([key, value]) => {
    if (typeof value === 'string') {
      result.upperCaseNames[key] = value.toUpperCase();
    }
  });
  
  // Realizar cálculos
  const numbers = Object.values(input).filter(v => typeof v === 'number');
  if (numbers.length > 0) {
    result.calculations.sum = numbers.reduce((a, b) => a + b, 0);
    result.calculations.average = result.calculations.sum / numbers.length;
    result.calculations.max = Math.max(...numbers);
    result.calculations.min = Math.min(...numbers);
  }
  
  console.log('📤 Datos de salida:', result);
  return result;
}

// Ejecutar el procesamiento
return processData(input);`;

export const scriptTemplates = {
  basic: getDefaultScript(),
  
  dataMapper: `// Uso de Variables del Data Mapper
function processData(input) {
  console.log('📥 Datos de entrada del Data Mapper:', input);
  
  const mapperData = {};
  const otherData = {};
  
  Object.entries(input).forEach(([key, value]) => {
    if (key.startsWith('mapper.')) {
      const varName = key.replace('mapper.', '');
      mapperData[varName] = value;
    } else {
      otherData[key] = value;
    }
  });
  
  console.log('🗂️ Variables del Data Mapper:', mapperData);
  console.log('📊 Otros datos:', otherData);
  
  const result = {
    originalMapperData: mapperData,
    processedMapper: {},
    mapperStats: {
      totalMappedVars: Object.keys(mapperData).length,
      dataTypes: {}
    },
    validations: {
      errors: [],
      warnings: []
    }
  };
  
  Object.entries(mapperData).forEach(([varName, value]) => {
    const dataType = typeof value;
    result.mapperStats.dataTypes[dataType] = 
      (result.mapperStats.dataTypes[dataType] || 0) + 1;
    
    if (typeof value === 'string') {
      result.processedMapper[\`\${varName}_upper\`] = value.toUpperCase();
      result.processedMapper[\`\${varName}_length\`] = value.length;
      
      if (varName.includes('email') || varName.includes('mail')) {
        const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
        if (!emailRegex.test(value)) {
          result.validations.errors.push(\`Email inválido en \${varName}: \${value}\`);
        }
      }
    } 
    else if (typeof value === 'number') {
      result.processedMapper[\`\${varName}_squared\`] = value * value;
      result.processedMapper[\`\${varName}_formatted\`] = value.toLocaleString();
      
      if (value < 0) {
        result.validations.warnings.push(\`Valor negativo en \${varName}: \${value}\`);
      }
    }
    else if (typeof value === 'boolean') {
      result.processedMapper[\`\${varName}_text\`] = value ? 'Sí' : 'No';
    }
    else {
      result.processedMapper[\`\${varName}_type\`] = dataType;
      result.processedMapper[\`\${varName}_string\`] = String(value);
    }
  });
  
  result.summary = {
    totalVariables: Object.keys(input).length,
    mapperVariables: Object.keys(mapperData).length,
    processedVariables: Object.keys(result.processedMapper).length,
    validationsPassed: result.validations.errors.length === 0,
    processedAt: new Date().toISOString()
  };
  
  console.log('✅ Procesamiento completado:', result.summary);
  return result;
}

return processData(input);`,

  workflowData: `// Procesamiento de Datos del Workflow Completo
function processData(input) {
  console.log('🔄 Procesando datos del workflow:', input);
  
  const nodeData = {
    forms: {},
    mappers: {},
    scripts: {},
    httpInputs: {},
    other: {}
  };
  
  Object.entries(input).forEach(([key, value]) => {
    if (key.includes('user-form') || key.includes('location-form')) {
      nodeData.forms[key] = value;
    } else if (key.startsWith('mapper.')) {
      nodeData.mappers[key] = value;
    } else if (key.startsWith('script.')) {
      nodeData.scripts[key] = value;
    } else if (key.includes('http-input')) {
      nodeData.httpInputs[key] = value;
    } else {
      nodeData.other[key] = value;
    }
  });
  
  console.log('📊 Datos clasificados:', nodeData);
  
  const processedForms = {};
  Object.entries(nodeData.forms).forEach(([key, value]) => {
    if (typeof value === 'string') {
      processedForms[\`\${key}_normalized\`] = value.trim().toLowerCase();
      processedForms[\`\${key}_capitalized\`] = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
    }
  });
  
  const processedMappers = {};
  Object.entries(nodeData.mappers).forEach(([key, value]) => {
    const cleanKey = key.replace('mapper.', '');
    
    if (typeof value === 'string' && !isNaN(value)) {
      processedMappers[\`\${cleanKey}_asNumber\`] = parseFloat(value);
    } else if (typeof value === 'number') {
      processedMappers[\`\${cleanKey}_doubled\`] = value * 2;
      processedMappers[\`\${cleanKey}_formatted\`] = new Intl.NumberFormat('es-ES').format(value);
    }
  });
  
  const consolidatedReport = {
    summary: {
      totalInputs: Object.keys(input).length,
      formsCount: Object.keys(nodeData.forms).length,
      mappersCount: Object.keys(nodeData.mappers).length,
      scriptsCount: Object.keys(nodeData.scripts).length,
      httpInputsCount: Object.keys(nodeData.httpInputs).length
    },
    processed: {
      forms: processedForms,
      mappers: processedMappers
    },
    validation: {
      hasFormData: Object.keys(nodeData.forms).length > 0,
      hasMapperData: Object.keys(nodeData.mappers).length > 0,
      isComplete: Object.keys(input).length >= 2
    },
    metadata: {
      processedAt: new Date().toISOString(),
      processingTime: Date.now(),
      workflow: {
        complexity: Object.keys(input).length > 5 ? 'High' : 'Medium',
        dataFlow: 'Sequential'
      }
    }
  };
  
  consolidatedReport.alerts = [];
  
  if (consolidatedReport.summary.formsCount === 0) {
    consolidatedReport.alerts.push('⚠️ No hay datos de formularios');
  }
  
  if (consolidatedReport.summary.mappersCount === 0) {
    consolidatedReport.alerts.push('⚠️ No hay datos mapeados');
  }
  
  if (consolidatedReport.validation.isComplete) {
    consolidatedReport.alerts.push('✅ Workflow completo');
  }
  
  console.log('📋 Reporte consolidado:', consolidatedReport);
  return consolidatedReport;
}

return processData(input);`,

  dataTransform: `// Transformación de Datos
function processData(input) {
  const numbers = Object.entries(input)
    .filter(([key, value]) => typeof value === 'number')
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  
  const strings = Object.entries(input)
    .filter(([key, value]) => typeof value === 'string')
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  
  return {
    numbers,
    strings,
    summary: {
      totalNumbers: Object.keys(numbers).length,
      totalStrings: Object.keys(strings).length
    }
  };
}

return processData(input);`,

  validation: `// Validación de Datos
function processData(input) {
  const errors = [];
  const warnings = [];
  const validData = {};
  
  Object.entries(input).forEach(([key, value]) => {
    if (key.includes('email') || key.includes('mail')) {
      if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)) {
        errors.push(\`Email inválido en \${key}: \${value}\`);
      } else {
        validData[key] = value;
      }
    }
    else if (typeof value === 'number') {
      if (value < 0) {
        warnings.push(\`Valor negativo en \${key}: \${value}\`);
      }
      validData[key] = value;
    }
    else {
      validData[key] = value;
    }
  });
  
  return {
    validData,
    errors,
    warnings,
    isValid: errors.length === 0,
    summary: {
      totalFields: Object.keys(input).length,
      validFields: Object.keys(validData).length,
      errorCount: errors.length,
      warningCount: warnings.length
    }
  };
}

return processData(input);`,

  calculations: `// Cálculos Avanzados
function processData(input) {
  const numbers = Object.values(input).filter(v => typeof v === 'number');
  const strings = Object.values(input).filter(v => typeof v === 'string');
  
  const calculations = {
    count: numbers.length,
    sum: numbers.reduce((a, b) => a + b, 0),
    average: numbers.length > 0 ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0,
    min: numbers.length > 0 ? Math.min(...numbers) : null,
    max: numbers.length > 0 ? Math.max(...numbers) : null,
    
    stringStats: {
      count: strings.length,
      totalLength: strings.reduce((acc, str) => acc + str.length, 0),
      averageLength: strings.length > 0 ? strings.reduce((acc, str) => acc + str.length, 0) / strings.length : 0,
      longestString: strings.reduce((longest, current) => 
        current.length > longest.length ? current : longest, ''
      )
    },
    
    normalized: numbers.map(n => n / Math.max(...numbers) || 0),
    rounded: numbers.map(n => Math.round(n * 100) / 100)
  };
  
  return {
    originalData: input,
    calculations,
    processedAt: new Date().toISOString()
  };
}

return processData(input);`
};