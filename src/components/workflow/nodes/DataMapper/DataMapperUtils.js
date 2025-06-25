// src/components/workflow/nodes/DataMapper/DataMapperUtils.js
// Utilidades para el Data Mapper

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

// Validate type compatibility for mappings
export const validateTypeCompatibility = (jsonType, targetType) => {
  const compatibilityMatrix = {
    'string': ['string', 'date'],
    'number': ['number', 'string'],
    'boolean': ['boolean', 'string'],
    'array': ['array'],
    'object': ['object'],
    'null': ['string', 'number', 'boolean']
  };
  
  return compatibilityMatrix[jsonType]?.includes(targetType) ?? false;
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

// FIXED: Detectar HTTP Inputs disponibles con mejor lógica
export const getAvailableHttpInputs = (availableData) => {
  const httpInputs = [];
  
  console.log('🔍 Checking available data for HTTP Inputs:', Object.keys(availableData));
  
  Object.entries(availableData).forEach(([key, value]) => {
    console.log(`📊 Analyzing key: ${key}, type: ${typeof value}`, value);
    
    // CRITICAL FIX: Buscar específicamente las claves que empiecen con "httpInput_"
    const isHttpInputKey = key.startsWith('httpInput_') && typeof value === 'object' && value !== null;
    
    if (isHttpInputKey) {
      console.log('✅ Found HTTP Input with new pattern:', key, value);
      
      // Verificar que tenga la estructura correcta de HTTP Input
      if (value.endpoint || value.path) {
        const httpInputData = {
          key,
          endpoint: value.endpoint || `http://localhost:3000/api${value.path || '/unknown'}`,
          method: value.method || 'GET',
          path: value.path || '/unknown',
          bodyVariable: value.bodyVariable || 'requestBody',
          headers: value.headers || [],
          contentType: value.contentType || 'application/json',
          enableBodyCapture: value.enableBodyCapture !== undefined ? value.enableBodyCapture : false,
          authentication: value.authentication || 'none',
          description: value.description || `${value.method || 'HTTP'} endpoint`,
          nodeId: value.nodeId,
          configured: value.configured || false
        };
        
        // Solo agregar si está configurado correctamente
        if (httpInputData.configured && httpInputData.path !== '/unknown') {
          httpInputs.push(httpInputData);
          console.log(`✅ Added HTTP Input: ${key}`, httpInputData);
        } else {
          console.log(`⚠️ HTTP Input not properly configured: ${key}`);
        }
      }
    }
    
    // FALLBACK: También buscar por patrones antiguos para compatibilidad
    else if ((key.includes('http-input') || key.includes('endpoint')) && 
             typeof value === 'object' && value !== null && 
             (value.endpoint || value.path)) {
      
      console.log('📡 Found HTTP Input with legacy pattern:', key, value);
      
      const httpInputData = {
        key,
        endpoint: value.endpoint || `http://localhost:3000/api${value.path || '/unknown'}`,
        method: value.method || 'GET',
        path: value.path || '/unknown',
        bodyVariable: value.bodyVariable || 'requestBody',
        headers: value.headers || [],
        contentType: value.contentType || 'application/json',
        enableBodyCapture: value.enableBodyCapture !== undefined ? value.enableBodyCapture : false,
        authentication: value.authentication || 'none',
        description: value.description || `${value.method || 'HTTP'} endpoint (legacy)`
      };
      
      httpInputs.push(httpInputData);
      console.log(`✅ Added legacy HTTP Input: ${key}`, httpInputData);
    }
  });
  
  console.log('📡 Total HTTP Inputs found:', httpInputs.length, httpInputs);
  return httpInputs;
};

// Generate example header values
export const generateExampleValueForHeader = (header) => {
  const headerName = header.name.toLowerCase();
  
  if (headerName.includes('authorization')) {
    return header.defaultValue || 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
  }
  if (headerName.includes('api') && headerName.includes('key')) {
    return header.defaultValue || 'sk_live_abcd1234567890';
  }
  if (headerName.includes('content-type')) {
    return header.defaultValue || 'application/json';
  }
  if (headerName.includes('user-agent')) {
    return header.defaultValue || 'WorkflowApp/1.0';
  }
  if (headerName.includes('accept')) {
    return header.defaultValue || 'application/json';
  }
  
  return header.defaultValue || `example_${header.variable || header.name}`;
};

// Generate realistic body examples based on content type and path
export const generateExampleBodyForContentType = (contentType, path) => {
  const pathLower = path.toLowerCase();
  
  switch (contentType) {
    case 'application/json':
      // Generate different examples based on the endpoint path
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
            skills: ["JavaScript", "React", "Node.js"],
            joinedAt: "2023-01-15T10:30:00Z"
          },
          preferences: {
            language: "es",
            timezone: "America/Bogota",
            notifications: true
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
              price: 2500000,
              category: "electronics"
            },
            {
              productId: "PROD-002", 
              name: "Mouse Inalámbrico",
              quantity: 2,
              price: 75000,
              category: "accessories"
            }
          ],
          total: 2650000,
          currency: "COP",
          status: "pending",
          shipping: {
            address: "Calle 123 #45-67",
            city: "Bogotá",
            country: "Colombia",
            zipCode: "110111"
          },
          createdAt: "2024-06-25T14:30:00Z"
        };
      }
      
      if (pathLower.includes('product') || pathLower.includes('catalog')) {
        return {
          id: "PROD-12345",
          name: "Smartphone Galaxy S24",
          description: "Último modelo con cámara profesional",
          price: 1800000,
          currency: "COP",
          category: "electronics",
          brand: "Samsung",
          inStock: true,
          quantity: 150,
          specifications: {
            screen: "6.2 pulgadas",
            memory: "128GB",
            ram: "8GB",
            camera: "50MP + 12MP + 10MP",
            battery: "4000mAh"
          },
          tags: ["smartphone", "android", "5g"],
          createdAt: "2024-06-25T09:00:00Z",
          updatedAt: "2024-06-25T14:30:00Z"
        };
      }
      
      // Generic structure for other endpoints
      return {
        id: 123,
        name: "Elemento de Ejemplo",
        description: "Descripción del elemento",
        value: 1000,
        active: true,
        data: {
          field1: "valor1",
          field2: 42,
          field3: true,
          nested: {
            subfield: "sub-valor",
            array: ["item1", "item2", "item3"]
          }
        },
        metadata: {
          version: "1.0",
          createdBy: "sistema",
          tags: ["ejemplo", "test"]
        },
        timestamps: {
          createdAt: "2024-06-25T10:30:00Z",
          updatedAt: "2024-06-25T14:30:00Z"
        }
      };
      
    case 'application/x-www-form-urlencoded':
    case 'multipart/form-data':
      return {
        nombre: "Juan Pérez",
        email: "juan@ejemplo.com",
        telefono: "+57 300 123 4567",
        edad: 30,
        activo: "true",
        categoria: "cliente_premium",
        comentarios: "Información adicional del formulario"
      };
      
    case 'application/xml':
      return `<?xml version="1.0" encoding="UTF-8"?>
<data>
  <usuario>
    <id>123</id>
    <nombre>Juan Pérez</nombre>
    <email>juan@ejemplo.com</email>
    <activo>true</activo>
    <perfil>
      <edad>30</edad>
      <ciudad>Bogotá</ciudad>
      <intereses>
        <interes>tecnología</interes>
        <interes>desarrollo</interes>
      </intereses>
    </perfil>
  </usuario>
</data>`;
      
    case 'text/plain':
      return "Contenido de texto plano del cuerpo de la petición.\nPuede contener múltiples líneas.\nEjemplo de datos enviados por el cliente.";
      
    default:
      return "Contenido del body en formato " + contentType;
  }
};

// Generate more realistic HTTP Input structure
export const generateHttpInputStructure = (httpInputData) => {
  const structure = {
    metadata: {
      endpoint: httpInputData.endpoint,
      method: httpInputData.method,
      path: httpInputData.path,
      timestamp: new Date().toISOString(),
      contentType: httpInputData.contentType,
      requestId: "req_" + Math.random().toString(36).substr(2, 9)
    }
  };

  // Agregar headers si existen
  if (httpInputData.headers && httpInputData.headers.length > 0) {
    structure.headers = {};
    httpInputData.headers.forEach(header => {
      if (header.variable) {
        structure.headers[header.variable] = generateExampleValueForHeader(header);
      }
    });
  }

  // Generar estructura del body según el tipo de contenido y método
  if (httpInputData.enableBodyCapture && httpInputData.bodyVariable && 
      ['POST', 'PUT', 'PATCH'].includes(httpInputData.method)) {
    
    structure[httpInputData.bodyVariable] = generateExampleBodyForContentType(
      httpInputData.contentType, 
      httpInputData.path
    );
  }

  return structure;
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