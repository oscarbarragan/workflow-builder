// src/components/workflow/nodes/DataMapper/DataMapperUtils.js - SIMPLIFICADO
// Utilidades optimizadas para el Data Mapper simplificado

// Data types para el selector
export const dataTypes = [
  { value: 'string', label: 'String', color: '#16a34a' },
  { value: 'number', label: 'Number', color: '#3b82f6' },
  { value: 'boolean', label: 'Boolean', color: '#f59e0b' },
  { value: 'array', label: 'Array', color: '#7c3aed' },
  { value: 'object', label: 'Object', color: '#dc2626' },
  { value: 'date', label: 'Date', color: '#14b8a6' }
];

// Helper function to get type color
export const getTypeColor = (type) => {
  return dataTypes.find(dt => dt.value === type)?.color || '#6b7280';
};

// Infer data type from value
export const inferDataType = (value) => {
  if (value === null) return 'string';
  if (typeof value === 'boolean') return 'boolean';
  if (typeof value === 'number') return 'number';
  if (typeof value === 'string') {
    if (/^\d{4}-\d{2}-\d{2}/.test(value)) return 'date';
    return 'string';
  }
  if (Array.isArray(value)) return 'array';
  if (typeof value === 'object') return 'object';
  return 'string';
};

// Generate mappings from JSON structure
export const generateMappingsFromJson = (jsonData, selectedSource = 'manual', prefix = '') => {
  const mappings = [];
  
  const traverse = (obj, path = prefix) => {
    if (Array.isArray(obj)) {
      mappings.push({
        id: Date.now() + Math.random(),
        jsonPath: path,
        variableName: path.replace(/[\[\]\.]/g, '_').replace(/^_/, ''),
        dataType: 'array',
        jsonType: 'array',
        isValid: true,
        sourceValue: `Array[${obj.length}]`,
        source: selectedSource
      });
      
      if (obj.length > 0) {
        traverse(obj[0], `${path}[0]`);
      }
    } else if (obj !== null && typeof obj === 'object') {
      if (path) {
        mappings.push({
          id: Date.now() + Math.random(),
          jsonPath: path,
          variableName: path.replace(/[\[\]\.]/g, '_').replace(/^_/, ''),
          dataType: 'object',
          jsonType: 'object',
          isValid: true,
          sourceValue: 'Object',
          source: selectedSource
        });
      }
      
      Object.keys(obj).forEach(key => {
        const newPath = path ? `${path}.${key}` : key;
        traverse(obj[key], newPath);
      });
    } else {
      const type = obj === null ? 'null' : typeof obj;
      mappings.push({
        id: Date.now() + Math.random(),
        jsonPath: path,
        variableName: path.replace(/[\[\]\.]/g, '_').replace(/^_/, ''),
        dataType: inferDataType(obj),
        jsonType: type,
        isValid: true,
        sourceValue: obj,
        source: selectedSource
      });
    }
  };

  traverse(jsonData);
  return mappings;
};

// Read file as text (Promise-based)
export const readFileAsText = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(new Error('Error al leer el archivo'));
    reader.readAsText(file);
  });
};

// Get sample JSON structure
export const getSampleJson = () => {
  return {
    user: {
      id: 123,
      name: "Juan Pérez",
      email: "juan@example.com",
      active: true,
      created_at: "2023-01-15T10:30:00Z",
      profile: {
        bio: "Desarrollador Full Stack",
        location: "Bogotá, Colombia",
        preferences: {
          language: "es",
          notifications: true
        }
      }
    },
    orders: [
      {
        id: 1001,
        amount: 99.99,
        status: "completed",
        items: [
          {
            productId: "PROD-001",
            name: "Producto de ejemplo",
            quantity: 2,
            price: 49.99
          }
        ]
      }
    ],
    metadata: {
      version: "1.0",
      processed: true,
      timestamp: new Date().toISOString()
    }
  };
};

// Validate JSON input
export const validateJsonInput = (jsonString) => {
  if (!jsonString.trim()) {
    return { isValid: false, error: 'JSON vacío', parsed: null };
  }

  try {
    const parsed = JSON.parse(jsonString);
    return { isValid: true, error: null, parsed };
  } catch (error) {
    return { isValid: false, error: error.message, parsed: null };
  }
};

// NUEVO: Create output variables from mappings (incluye headers y body)
export const createOutputVariables = (mappings, httpInputAnalysis) => {
  const validMappings = mappings.filter(m => m.isValid && m.variableName);
  
  return validMappings.reduce((acc, mapping) => {
    acc[mapping.variableName] = {
      type: mapping.dataType,
      jsonPath: mapping.jsonPath,
      sourceValue: mapping.sourceValue,
      source: mapping.source,
      isHeaderVariable: mapping.source === 'http-header',
      isBodyVariable: mapping.source !== 'http-header',
      httpInputConnected: httpInputAnalysis.hasHttpInput ? httpInputAnalysis.httpInputKey : null,
      description: mapping.source === 'http-header' 
        ? `Header variable from HTTP Input: ${mapping.jsonPath}`
        : `Body field from JSON structure: ${mapping.jsonPath}`
    };
    return acc;
  }, {});
};

// NUEVO: Create saved data structure for simplified Data Mapper
export const createSavedData = (state) => {
  const {
    jsonInput,
    parsedJson,
    mappings,
    selectedSource,
    uploadedFile,
    httpInputAnalysis
  } = state;
  
  const validMappings = mappings.filter(m => m.isValid && m.variableName);
  const headerVariables = validMappings.filter(m => m.source === 'http-header');
  const bodyVariables = validMappings.filter(m => m.source !== 'http-header');
  
  return {
    // Configuración básica
    jsonInput,
    parsedJson,
    mappings: validMappings,
    selectedSource,
    
    // Información del archivo (si se usó)
    uploadedFile: uploadedFile ? {
      name: uploadedFile.name,
      size: uploadedFile.size,
      type: uploadedFile.type,
      lastModified: uploadedFile.lastModified
    } : null,
    
    // Variables de salida organizadas
    outputVariables: createOutputVariables(validMappings, httpInputAnalysis),
    
    // Información de conexión HTTP Input
    httpInputConnection: httpInputAnalysis.hasHttpInput ? {
      connected: true,
      httpInputKey: httpInputAnalysis.httpInputKey,
      endpoint: httpInputAnalysis.endpoint,
      method: httpInputAnalysis.method,
      path: httpInputAnalysis.path,
      bodyVariable: httpInputAnalysis.bodyVariable,
      headersCount: httpInputAnalysis.headers.length
    } : {
      connected: false
    },
    
    // Estadísticas del mapeo
    statistics: {
      totalMappings: validMappings.length,
      headerVariables: headerVariables.length,
      bodyVariables: bodyVariables.length,
      dataTypes: validMappings.reduce((acc, m) => {
        acc[m.dataType] = (acc[m.dataType] || 0) + 1;
        return acc;
      }, {})
    },
    
    // Metadata
    status: 'configured',
    createdAt: new Date().toISOString(),
    version: '2.0', // Versión simplificada
    
    // Para compatibilidad con versiones anteriores
    connectedHttpInput: httpInputAnalysis.hasHttpInput ? httpInputAnalysis.httpInputData : null
  };
};

// NUEVO: Generar documentación del Data Mapper
export const generateDataMapperDocumentation = (savedData) => {
  const doc = {
    title: 'Data Mapper Configuration',
    overview: {
      purpose: 'Parse HTTP Input body against defined JSON structure and map headers to variables',
      totalVariables: savedData.statistics.totalMappings,
      httpInputConnected: savedData.httpInputConnection.connected
    },
    
    structure: {
      jsonStructure: savedData.parsedJson,
      source: savedData.selectedSource,
      file: savedData.uploadedFile?.name || null
    },
    
    variables: {
      headers: Object.entries(savedData.outputVariables)
        .filter(([key, value]) => value.isHeaderVariable)
        .map(([key, value]) => ({
          name: key,
          type: value.type,
          source: value.jsonPath,
          description: value.description
        })),
      
      body: Object.entries(savedData.outputVariables)
        .filter(([key, value]) => value.isBodyVariable)
        .map(([key, value]) => ({
          name: key,
          type: value.type,
          jsonPath: value.jsonPath,
          sourceValue: value.sourceValue,
          description: value.description
        }))
    },
    
    usage: {
      prefix: 'mapper.',
      examples: Object.keys(savedData.outputVariables).slice(0, 5).map(key => `mapper.${key}`),
      totalAvailable: Object.keys(savedData.outputVariables).length
    },
    
    httpInputIntegration: savedData.httpInputConnection.connected ? {
      endpoint: savedData.httpInputConnection.endpoint,
      method: savedData.httpInputConnection.method,
      bodyVariable: savedData.httpInputConnection.bodyVariable,
      headersProcessed: savedData.httpInputConnection.headersCount,
      dataFlow: [
        '1. HTTP Input receives request with headers and body',
        '2. Headers are mapped to individual variables',
        '3. Body is parsed against defined JSON structure',
        '4. All variables are available with "mapper." prefix'
      ]
    } : {
      standalone: true,
      note: 'No HTTP Input connected - structure defined for manual testing'
    }
  };
  
  return doc;
};

// NUEVO: Validar configuración del Data Mapper simplificado
export const validateDataMapperConfig = (properties) => {
  const errors = [];
  const warnings = [];
  
  // Asegurar que properties existe y tiene las propiedades necesarias
  if (!properties || typeof properties !== 'object') {
    errors.push('Configuración inválida');
    return { isValid: false, errors, warnings };
  }
  
  if (!properties.mappings || !Array.isArray(properties.mappings)) {
    errors.push('No hay mapeos configurados');
    return { isValid: false, errors, warnings };
  }
  
  if (properties.mappings.length === 0) {
    errors.push('Debe tener al menos un mapeo configurado');
  }
  
  // Validate each mapping
  properties.mappings.forEach((mapping, index) => {
    if (!mapping.variableName || mapping.variableName.trim() === '') {
      errors.push(`Mapeo ${index + 1}: nombre de variable requerido`);
    }
    
    if (!mapping.isValid) {
      errors.push(`Mapeo ${index + 1}: tipos incompatibles`);
    }
    
    // Check for duplicate variable names
    const duplicates = properties.mappings.filter(m => m.variableName === mapping.variableName);
    if (duplicates.length > 1) {
      warnings.push(`Variable duplicada: ${mapping.variableName}`);
    }
  });
  
  // Validate JSON structure
  if (!properties.jsonInput || properties.jsonInput.trim() === '') {
    errors.push('Estructura JSON requerida');
  }
  
  if (!properties.parsedJson) {
    errors.push('JSON inválido o no parseado');
  }
  
  // Validaciones adicionales opcionales
  if (properties.httpInputConnection?.connected) {
    const headerVars = properties.mappings.filter(m => m.source === 'http-header');
    const bodyVars = properties.mappings.filter(m => m.source !== 'http-header');
    
    if (bodyVars.length === 0) {
      warnings.push('No hay campos del body mapeados');
    }
  } else {
    // Si no hay HTTP Input, solo advertir
    warnings.push('Data Mapper funcionará de forma independiente - ideal para testing');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// NUEVO: Generar ejemplo de uso para testing
export const generateTestingExample = (outputVariables, httpInputConnection) => {
  const example = {
    purpose: 'Example of how the Data Mapper will process incoming data',
    
    input: {
      note: 'This is what the HTTP Input would send to the Data Mapper'
    },
    
    output: {
      note: 'These variables will be available in subsequent nodes',
      variables: {}
    }
  };
  
  if (httpInputConnection.connected) {
    // Generar ejemplo de input HTTP
    example.input.httpRequest = {
      method: httpInputConnection.method,
      url: httpInputConnection.endpoint,
      headers: {},
      body: {}
    };
    
    // Headers de ejemplo
    Object.entries(outputVariables)
      .filter(([key, value]) => value.isHeaderVariable)
      .forEach(([key, value]) => {
        const headerName = value.jsonPath.replace('headers.', '');
        example.input.httpRequest.headers[headerName] = `example_${headerName}_value`;
      });
    
    // Body de ejemplo basado en la estructura JSON
    const bodyVariables = Object.entries(outputVariables)
      .filter(([key, value]) => value.isBodyVariable);
    
    if (bodyVariables.length > 0) {
      example.input.httpRequest.body = generateExampleBodyFromMappings(bodyVariables);
    }
  }
  
  // Variables de salida
  Object.entries(outputVariables).forEach(([key, value]) => {
    example.output.variables[`mapper.${key}`] = {
      type: value.type,
      source: value.isHeaderVariable ? 'header' : 'body',
      jsonPath: value.jsonPath,
      exampleValue: generateExampleValue(value.type, value.sourceValue)
    };
  });
  
  return example;
};

// Helper: Generar valor de ejemplo basado en tipo
const generateExampleValue = (type, sourceValue) => {
  switch (type) {
    case 'string':
      return typeof sourceValue === 'string' ? sourceValue : 'ejemplo_string';
    case 'number':
      return typeof sourceValue === 'number' ? sourceValue : 123;
    case 'boolean':
      return typeof sourceValue === 'boolean' ? sourceValue : true;
    case 'array':
      return Array.isArray(sourceValue) ? sourceValue : ['item1', 'item2'];
    case 'object':
      return typeof sourceValue === 'object' ? sourceValue : { ejemplo: 'valor' };
    case 'date':
      return new Date().toISOString();
    default:
      return sourceValue || 'ejemplo_valor';
  }
};

// Helper: Generar body de ejemplo desde mappings
const generateExampleBodyFromMappings = (bodyVariables) => {
  const body = {};
  
  bodyVariables.forEach(([key, value]) => {
    const pathParts = value.jsonPath.split('.');
    let current = body;
    
    for (let i = 0; i < pathParts.length - 1; i++) {
      const part = pathParts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    
    const finalKey = pathParts[pathParts.length - 1];
    current[finalKey] = generateExampleValue(value.type, value.sourceValue);
  });
  
  return body;
};