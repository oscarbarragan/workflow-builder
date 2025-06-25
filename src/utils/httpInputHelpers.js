// src/utils/httpInputHelpers.js
// Funciones específicas para HTTP Input

// Validate HTTP Input configuration
export const validateHttpInputConfig = (properties) => {
    const errors = [];
    const warnings = [];
    
    // Basic validation
    if (!properties.path || !properties.path.startsWith('/')) {
      errors.push('Path inválido: debe comenzar con /');
    }
    
    if (!properties.method || !['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(properties.method)) {
      errors.push('Método HTTP inválido');
    }
    
    // Headers validation
    if (properties.headers && properties.headers.length > 0) {
      properties.headers.forEach((header, index) => {
        if (header.name && !header.variable) {
          errors.push(`Header ${index + 1}: variable requerida`);
        }
        if (header.variable && !header.name) {
          errors.push(`Header ${index + 1}: nombre del header requerido`);
        }
        if (header.required && !header.defaultValue) {
          warnings.push(`Header ${index + 1}: header requerido sin valor por defecto`);
        }
      });
    }
    
    // Body validation
    if (properties.enableBodyCapture) {
      if (!properties.bodyVariable || properties.bodyVariable.trim() === '') {
        errors.push('Variable para el body es requerida');
      }
      
      if (properties.method === 'GET') {
        warnings.push('Método GET típicamente no incluye body');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };
  
  // Generate API documentation from HTTP Input node
  export const generateHttpInputApiDoc = (node) => {
    const props = node.data.properties;
    
    return {
      nodeId: node.id,
      endpoint: {
        method: props.method,
        path: props.path,
        url: props.endpoint,
        description: props.description
      },
      authentication: {
        type: props.authentication,
        required: props.authentication !== 'none'
      },
      cors: {
        enabled: props.enableCors
      },
      headers: props.headers?.map(header => ({
        name: header.name,
        variable: header.variable,
        required: header.required,
        defaultValue: header.defaultValue,
        description: header.description,
        example: header.defaultValue || `example_${header.variable}`
      })) || [],
      body: props.enableBodyCapture ? {
        enabled: true,
        variable: props.bodyVariable,
        contentType: props.contentType,
        validation: props.bodyValidation,
        example: getBodyExample(props.contentType)
      } : {
        enabled: false
      },
      outputVariables: props.outputStructure || {},
      validation: validateHttpInputConfig(props)
    };
  };
  
  // Helper function to generate body examples based on content type
  const getBodyExample = (contentType) => {
    switch (contentType) {
      case 'application/json':
        return {
          id: 123,
          name: "Ejemplo Usuario",
          email: "usuario@ejemplo.com",
          data: {
            field1: "valor1",
            field2: 42,
            field3: true
          }
        };
      case 'application/xml':
        return '<?xml version="1.0"?><data><id>123</id><name>Ejemplo</name></data>';
      case 'text/plain':
        return 'Contenido de texto plano';
      case 'application/x-www-form-urlencoded':
        return 'field1=value1&field2=value2&field3=value3';
      default:
        return 'Contenido del body';
    }
  };
  
  // Generate OpenAPI specification from HTTP Input
  export const generateOpenApiSpec = (httpInputNodes) => {
    const paths = {};
    
    httpInputNodes.forEach(node => {
      const props = node.data.properties;
      const path = props.path;
      const method = props.method.toLowerCase();
      
      if (!paths[path]) {
        paths[path] = {};
      }
      
      paths[path][method] = {
        summary: props.description || `${props.method} ${path}`,
        description: props.description,
        parameters: [
          // Headers as parameters
          ...(props.headers?.map(header => ({
            name: header.name,
            in: 'header',
            required: header.required,
            description: header.description,
            schema: {
              type: 'string',
              default: header.defaultValue
            }
          })) || [])
        ],
        requestBody: props.enableBodyCapture ? {
          required: true,
          content: {
            [props.contentType]: {
              schema: {
                type: 'object',
                description: `Body content for ${props.bodyVariable}`
              }
            }
          }
        } : undefined,
        responses: {
          '200': {
            description: 'Respuesta exitosa',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean' },
                    data: { type: 'object' }
                  }
                }
              }
            }
          },
          '400': {
            description: 'Error en la petición'
          },
          '500': {
            description: 'Error del servidor'
          }
        }
      };
    });
    
    return {
      openapi: '3.0.0',
      info: {
        title: 'Workflow API',
        version: '1.0.0',
        description: 'API generada automáticamente desde HTTP Input nodes'
      },
      servers: [
        {
          url: 'http://localhost:3000/api',
          description: 'Servidor de desarrollo'
        }
      ],
      paths
    };
  };
  
  // Validate HTTP Input path
  export const validateHttpPath = (path) => {
    const errors = [];
    const warnings = [];
    
    if (!path) {
      errors.push('Path es requerido');
      return { isValid: false, errors, warnings };
    }
    
    if (!path.startsWith('/')) {
      errors.push('Path debe comenzar con /');
    }
    
    if (path.includes('//')) {
      errors.push('Path no puede contener // consecutivos');
    }
    
    if (!/^\/[a-zA-Z0-9\-_\/]*$/.test(path)) {
      errors.push('Path contiene caracteres inválidos');
    }
    
    if (path.length > 100) {
      warnings.push('Path muy largo, considera acortarlo');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };
  
  // Generate HTTP Input summary
  export const generateHttpInputSummary = (nodes) => {
    const httpInputNodes = nodes.filter(node => node.data.type === 'http-input');
    
    const summary = {
      totalEndpoints: httpInputNodes.length,
      methods: {},
      totalHeaders: 0,
      totalBodyVariables: 0,
      authenticationTypes: {},
      contentTypes: {}
    };
    
    httpInputNodes.forEach(node => {
      const props = node.data.properties;
      
      // Count methods
      summary.methods[props.method] = (summary.methods[props.method] || 0) + 1;
      
      // Count headers
      summary.totalHeaders += props.headers?.length || 0;
      
      // Count body variables
      if (props.enableBodyCapture) {
        summary.totalBodyVariables++;
      }
      
      // Count auth types
      summary.authenticationTypes[props.authentication] = 
        (summary.authenticationTypes[props.authentication] || 0) + 1;
      
      // Count content types
      if (props.contentType) {
        summary.contentTypes[props.contentType] = 
          (summary.contentTypes[props.contentType] || 0) + 1;
      }
    });
    
    return summary;
  };