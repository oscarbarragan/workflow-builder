// src/components/workflow/nodes/DataMapper/DataMapperUtils.js
// Utilidades mejoradas para el Data Mapper con mejor detección de HTTP Input

// Data types para el selector - ASEGURAR EXPORT
export const dataTypes = [
  { value: 'string', label: 'String', color: '#16a34a' },
  { value: 'number', label: 'Number', color: '#3b82f6' },
  { value: 'boolean', label: 'Boolean', color: '#f59e0b' },
  { value: 'array', label: 'Array', color: '#7c3aed' },
  { value: 'object', label: 'Object', color: '#dc2626' },
  { value: 'date', label: 'Date', color: '#14b8a6' }
];

// Helper function to get type color - ASEGURAR EXPORT
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

// SUPER IMPROVED: Detectar HTTP Inputs con logging exhaustivo
export const getAvailableHttpInputs = (availableData) => {
  const httpInputs = [];
  
  console.log('🔍 SUPER DEBUG: Starting HTTP Input detection...');
  console.log('🔍 SUPER DEBUG: Available data keys:', Object.keys(availableData));
  console.log('🔍 SUPER DEBUG: Available data length:', Object.keys(availableData).length);
  console.log('🔍 SUPER DEBUG: Full available data:', availableData);
  
  // ANÁLISIS DETALLADO
  const httpInputKeys = Object.keys(availableData).filter(k => k.startsWith('httpInput_'));
  const headerKeys = Object.keys(availableData).filter(k => k.startsWith('headers.'));
  const hasRequestBody = !!availableData.requestBody;
  
  console.log('🔍 SUPER DEBUG: HTTP Input keys found:', httpInputKeys);
  console.log('🔍 SUPER DEBUG: Header keys found:', headerKeys);  
  console.log('🔍 SUPER DEBUG: Has request body:', hasRequestBody);
  
  // Si no hay nada, retornar inmediatamente
  if (Object.keys(availableData).length === 0) {
    console.log('❌ SUPER DEBUG: No available data at all');
    return [];
  }
  
  Object.entries(availableData).forEach(([key, value]) => {
    console.log(`📊 SUPER DEBUG: Processing key: ${key}`);
    console.log(`📊 SUPER DEBUG: Value type: ${typeof value}`);
    console.log(`📊 SUPER DEBUG: Value:`, value);
    
    // PATTERN 1: Claves que empiecen con "httpInput_"
    const isHttpInputKey = key.startsWith('httpInput_');
    
    if (isHttpInputKey) {
      console.log('✅ SUPER DEBUG: Found HTTP Input key:', key);
      
      try {
        let httpInputData;
        
        // Manejar diferentes tipos de datos
        if (typeof value === 'string') {
          try {
            httpInputData = JSON.parse(value);
            console.log('✅ SUPER DEBUG: Parsed JSON string:', httpInputData);
          } catch (e) {
            console.log('⚠️ SUPER DEBUG: Failed to parse as JSON, treating as string');
            httpInputData = { rawValue: value, path: '/string-value' };
          }
        } else if (typeof value === 'object' && value !== null) {
          httpInputData = value;
          console.log('✅ SUPER DEBUG: Using object directly:', httpInputData);
        } else {
          console.log('⚠️ SUPER DEBUG: Unexpected value type, creating fallback');
          httpInputData = { rawValue: value, path: '/fallback' };
        }
        
        // Crear HTTP Input con datos mínimos
        const processedHttpInput = {
          key,
          endpoint: httpInputData.endpoint || 
                   `http://localhost:3000/api${httpInputData.path || '/detected'}`,
          method: httpInputData.method || 'GET',
          path: httpInputData.path || '/detected',
          bodyVariable: httpInputData.bodyVariable || 'requestBody',
          headers: Array.isArray(httpInputData.headers) ? httpInputData.headers : [],
          contentType: httpInputData.contentType || 'application/json',
          enableBodyCapture: httpInputData.enableBodyCapture !== undefined ? 
                            httpInputData.enableBodyCapture : hasRequestBody,
          authentication: httpInputData.authentication || 'none',
          description: httpInputData.description || `HTTP Input detected from ${key}`,
          nodeId: httpInputData.nodeId || key.replace('httpInput_', ''),
          configured: true, // Si está en availableData, lo consideramos configurado
          
          // DEBUGGING: Info completa
          debug_original: httpInputData,
          debug_key: key,
          debug_hasRequestBody: hasRequestBody,
          debug_headerKeys: headerKeys
        };
        
        console.log('✅ SUPER DEBUG: Created HTTP Input:', processedHttpInput);
        httpInputs.push(processedHttpInput);
        
      } catch (error) {
        console.error(`❌ SUPER DEBUG: Error processing HTTP Input ${key}:`, error);
      }
    }
  });
  
  // FALLBACK: Si no encontramos httpInput_ pero hay headers o requestBody
  if (httpInputs.length === 0 && (headerKeys.length > 0 || hasRequestBody)) {
    console.log('🔧 SUPER DEBUG: No HTTP Input found, but headers/body exist, creating fallback');
    
    const fallbackHttpInput = {
      key: 'fallback_detected',
      endpoint: 'http://localhost:3000/api/detected',
      method: hasRequestBody ? 'POST' : 'GET',
      path: '/detected',
      bodyVariable: 'requestBody',
      headers: extractHeadersFromAvailableData(availableData),
      contentType: 'application/json',
      enableBodyCapture: hasRequestBody,
      authentication: 'none',
      description: 'HTTP Input reconstructed from detected headers/body',
      nodeId: 'detected',
      configured: true,
      
      // DEBUGGING
      debug_fallback: true,
      debug_headerKeys: headerKeys,
      debug_hasRequestBody: hasRequestBody,
      debug_availableDataKeys: Object.keys(availableData)
    };
    
    console.log('✅ SUPER DEBUG: Created fallback HTTP Input:', fallbackHttpInput);
    httpInputs.push(fallbackHttpInput);
  }
  
  // SUPER FALLBACK: Si absolutamente no hay nada pero hay datos
  if (httpInputs.length === 0 && Object.keys(availableData).length > 0) {
    console.log('🔧 SUPER DEBUG: Creating emergency fallback from any available data');
    
    const emergencyHttpInput = {
      key: 'emergency_fallback',
      endpoint: 'http://localhost:3000/api/emergency',
      method: 'GET',
      path: '/emergency',
      bodyVariable: 'requestBody',
      headers: [],
      contentType: 'application/json',
      enableBodyCapture: false,
      authentication: 'none',
      description: 'Emergency HTTP Input - Check your HTTP Input configuration',
      nodeId: 'emergency',
      configured: true,
      
      // DEBUGGING
      debug_emergency: true,
      debug_availableData: availableData
    };
    
    console.log('⚠️ SUPER DEBUG: Created emergency HTTP Input:', emergencyHttpInput);
    httpInputs.push(emergencyHttpInput);
  }
  
  console.log('📡 SUPER DEBUG: Final HTTP Inputs found:', httpInputs.length);
  console.log('📡 SUPER DEBUG: Final HTTP Inputs:', httpInputs);
  
  return httpInputs;
};

// Helper function to extract headers from available data
const extractHeadersFromAvailableData = (availableData) => {
  const headers = [];
  
  Object.entries(availableData).forEach(([key, value]) => {
    if (key.startsWith('headers.')) {
      const headerVariable = key.replace('headers.', '');
      
      headers.push({
        name: headerVariable,
        variable: headerVariable,
        required: false,
        defaultValue: typeof value === 'object' ? value.defaultValue : String(value),
        description: `Header detected: ${headerVariable}`
      });
    }
  });
  
  return headers;
};

// TAMBIÉN ACTUALIZAR esta función para ser más permisiva
export const generateHttpInputStructureFromReal = (httpInputData, availableData) => {
  console.log('🏗️ STRUCTURE FIX: Generating HTTP Input structure from:', httpInputData);
  
  const structure = {
    metadata: {
      endpoint: httpInputData.endpoint,
      method: httpInputData.method,
      path: httpInputData.path,
      timestamp: new Date().toISOString(),
      contentType: httpInputData.contentType || 'application/json',
      requestId: "req_example_12345",
      
      // DEBUGGING
      debug_source: 'generateHttpInputStructureFromReal',
      debug_httpInputData: httpInputData
    }
  };

  // Agregar headers desde los datos disponibles
  const headerKeys = Object.keys(availableData).filter(k => k.startsWith('headers.'));
  if (headerKeys.length > 0) {
    structure.headers = {};
    headerKeys.forEach(headerKey => {
      const headerVariable = headerKey.replace('headers.', '');
      const headerValue = availableData[headerKey];
      
      structure.headers[headerVariable] = typeof headerValue === 'object' 
        ? headerValue.defaultValue || `example_${headerVariable}`
        : String(headerValue);
    });
  }

  // Agregar body si existe
  if (availableData.requestBody) {
    structure.requestBody = typeof availableData.requestBody === 'object'
      ? availableData.requestBody.example || generateExampleBodyForContentType(httpInputData.contentType, httpInputData.path)
      : availableData.requestBody;
  }

  console.log('✅ STRUCTURE FIX: Generated structure:', structure);
  return structure;
};

// Helper para generar valores de ejemplo para headers
export const generateExampleValueForHeader = (header) => {
  const headerName = header.name.toLowerCase();
  
  if (headerName.includes('authorization')) {
    return 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
  }
  if (headerName.includes('api') && headerName.includes('key')) {
    return 'sk_live_abcd1234567890';
  }
  if (headerName.includes('content-type')) {
    return 'application/json';
  }
  if (headerName.includes('user-agent')) {
    return 'WorkflowApp/1.0';
  }
  if (headerName.includes('accept')) {
    return 'application/json';
  }
  
  return `example_${header.variable || header.name}`;
};

// Helper para generar ejemplos de body
export const generateExampleBodyForContentType = (contentType, path) => {
  const pathLower = path.toLowerCase();
  
  switch (contentType) {
    case 'application/json':
      if (pathLower.includes('user') || pathLower.includes('profile')) {
        return {
          id: 12345,
          name: "Juan Pérez",
          email: "juan.perez@ejemplo.com",
          age: 30,
          active: true,
          profile: {
            bio: "Desarrollador Full Stack",
            location: "Bogotá, Colombia",
            skills: ["JavaScript", "React", "Node.js"]
          }
        };
      }
      
      if (pathLower.includes('order') || pathLower.includes('purchase')) {
        return {
          orderId: "ORD-2024-001",
          customerId: 12345,
          items: [
            {
              productId: "PROD-001",
              name: "Laptop Dell XPS 13",
              quantity: 1,
              price: 2500000
            }
          ],
          total: 2500000,
          currency: "COP"
        };
      }
      
      return {
        id: 123,
        name: "Elemento de Ejemplo",
        description: "Descripción del elemento",
        value: 1000,
        active: true,
        data: {
          field1: "valor1",
          field2: 42,
          field3: true
        }
      };
      
    case 'application/x-www-form-urlencoded':
    case 'multipart/form-data':
      return {
        nombre: "Juan Pérez",
        email: "juan@ejemplo.com",
        telefono: "+57 300 123 4567",
        edad: 30
      };
      
    default:
      return `Contenido del body en formato ${contentType}`;
  }
};

// Get sample JSON structure
export const getSampleJson = () => {
  return {
    user: {
      id: 123,
      name: "Juan Pérez",
      email: "juan@example.com",
      active: true,
      created_at: "2023-01-15T10:30:00Z"
    },
    orders: [
      {
        id: 1001,
        amount: 99.99,
        status: "completed",
        items: ["item1", "item2"]
      }
    ],
    metadata: {
      version: "1.0",
      processed: true
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

// Create output variables from mappings
export const createOutputVariables = (mappings, selectedSource, connectedHttpInput) => {
  const validMappings = mappings.filter(m => m.isValid && m.variableName);
  
  return validMappings.reduce((acc, mapping) => {
    acc[mapping.variableName] = {
      type: mapping.dataType,
      jsonPath: mapping.jsonPath,
      sourceValue: mapping.sourceValue,
      source: mapping.source,
      httpInputConnected: selectedSource === 'http-input' ? connectedHttpInput?.key : null
    };
    return acc;
  }, {});
};

// Create saved data structure
export const createSavedData = (state) => {
  const {
    jsonInput,
    parsedJson,
    mappings,
    selectedSource,
    connectedHttpInput,
    uploadedFile
  } = state;
  
  const validMappings = mappings.filter(m => m.isValid && m.variableName);
  
  return {
    jsonInput,
    parsedJson,
    mappings: validMappings,
    selectedSource,
    connectedHttpInput,
    uploadedFile: uploadedFile ? {
      name: uploadedFile.name,
      size: uploadedFile.size,
      type: uploadedFile.type,
      lastModified: uploadedFile.lastModified
    } : null,
    outputVariables: createOutputVariables(validMappings, selectedSource, connectedHttpInput),
    status: 'configured',
    createdAt: new Date().toISOString()
  };
};