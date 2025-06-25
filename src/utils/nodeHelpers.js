// src/utils/nodeHelpers.js - CORREGIDO PARA HTTP INPUT
import { NODE_CONFIG, NODE_TYPES } from './constants';

// Generate unique node ID
export const generateNodeId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Generate unique element ID
export const generateElementId = () => `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

// Get node configuration
export const getNodeConfig = (nodeType) => {
  return NODE_CONFIG[nodeType] || {
    title: 'Nodo Desconocido',
    icon: 'Circle',
    color: '#6b7280',
    fields: []
  };
};

// FIXED: Get available data from incoming nodes with improved HTTP Input detection
export const getAvailableData = (nodeId, nodes, edges) => {
  const availableData = {};
  const incomingEdges = edges.filter(edge => edge.target === nodeId);
  
  console.log(`🔍 Getting available data for node: ${nodeId}`);
  console.log(`📥 Incoming edges: ${incomingEdges.length}`, incomingEdges);
  
  incomingEdges.forEach(edge => {
    const sourceNode = nodes.find(node => node.id === edge.source);
    if (sourceNode && sourceNode.data.properties) {
      const nodeType = sourceNode.data.type;
      const properties = sourceNode.data.properties;
      
      console.log(`📊 Processing source node: ${sourceNode.id}, type: ${nodeType}`, properties);
      
      switch (nodeType) {
        case NODE_TYPES.USER_FORM:
        case NODE_TYPES.LOCATION_FORM:
          // Datos de formularios
          Object.keys(properties).forEach(key => {
            if (key !== 'status' && key !== 'createdAt') {
              const fullKey = `${nodeType.replace('-', '_')}.${key}`;
              availableData[fullKey] = properties[key];
              console.log(`✅ Added form data: ${fullKey} = ${properties[key]}`);
            }
          });
          break;
          
        case NODE_TYPES.HTTP_INPUT:
          // CRITICAL FIX: Mejorar la detección de HTTP Input
          console.log('🌐 Processing HTTP Input node:', properties);
          
          // Generar una clave única y descriptiva para el HTTP Input
          const httpInputKey = `httpInput_${sourceNode.id}`;
          
          // FIXED: Crear estructura completa del HTTP Input
          const httpInputData = {
            // Información básica del endpoint
            endpoint: properties.endpoint || `http://localhost:3000/api${properties.path || '/unknown'}`,
            method: properties.method || 'GET',
            path: properties.path || '/unknown',
            
            // Configuración del body
            bodyVariable: properties.bodyVariable || 'requestBody',
            enableBodyCapture: properties.enableBodyCapture !== undefined ? properties.enableBodyCapture : false,
            contentType: properties.contentType || 'application/json',
            
            // Headers
            headers: properties.headers || [],
            
            // Configuración adicional
            authentication: properties.authentication || 'none',
            description: properties.description || `${properties.method || 'GET'} endpoint`,
            
            // Metadata para debugging
            nodeId: sourceNode.id,
            configured: !!(properties.path && properties.method)
          };
          
          // Agregar el HTTP Input completo con clave específica
          availableData[httpInputKey] = httpInputData;
          console.log(`✅ Added HTTP Input: ${httpInputKey}`, httpInputData);
          
          // ADDITIONAL: Agregar también las variables individuales para compatibilidad
          if (httpInputData.headers && httpInputData.headers.length > 0) {
            httpInputData.headers.forEach(header => {
              if (header.variable) {
                const headerKey = `headers.${header.variable}`;
                availableData[headerKey] = {
                  type: 'string',
                  source: 'http-header',
                  headerName: header.name,
                  required: header.required,
                  defaultValue: header.defaultValue || `example_${header.variable}`,
                  description: header.description,
                  httpInputNodeId: sourceNode.id
                };
                console.log(`✅ Added header variable: ${headerKey}`);
              }
            });
          }
          
          // Agregar variable del body si está habilitada
          if (httpInputData.enableBodyCapture && httpInputData.bodyVariable) {
            availableData[httpInputData.bodyVariable] = {
              type: 'object',
              source: 'http-body',
              contentType: httpInputData.contentType,
              description: 'Request body content',
              httpInputNodeId: sourceNode.id,
              example: getBodyExampleForContentType(httpInputData.contentType)
            };
            console.log(`✅ Added body variable: ${httpInputData.bodyVariable}`);
          }
          
          break;
          
        case NODE_TYPES.DATA_MAPPER:
          // Variables mapeadas del Data Mapper
          if (properties.outputVariables) {
            Object.entries(properties.outputVariables).forEach(([varName, varData]) => {
              const fullKey = `mapper.${varName}`;
              availableData[fullKey] = {
                type: varData.type,
                value: typeof varData.sourceValue === 'object' 
                  ? `[${varData.type}] ${JSON.stringify(varData.sourceValue).substring(0, 30)}...`
                  : String(varData.sourceValue || `[${varData.type}] from ${varData.jsonPath}`),
                jsonPath: varData.jsonPath,
                source: varData.source || 'manual',
                httpInputConnected: varData.httpInputConnected || null
              };
              console.log(`✅ Added mapper variable: ${fullKey}`);
            });
          }
          
          // Información del mapeo
          if (properties.mappings && properties.mappings.length > 0) {
            availableData[`${nodeType}.mappingsCount`] = properties.mappings.length;
            availableData[`${nodeType}.validMappings`] = properties.mappings.filter(m => m.isValid).length;
          }
          
          // Información de la conexión HTTP Input
          if (properties.connectedHttpInput) {
            availableData[`${nodeType}.connectedEndpoint`] = properties.connectedHttpInput.endpoint;
            availableData[`${nodeType}.sourceType`] = 'http-input';
          }
          break;
          
        case NODE_TYPES.SCRIPT_PROCESSOR:
          // Variables generadas por Script Processor
          if (properties.outputVariables) {
            Object.entries(properties.outputVariables).forEach(([varName, varData]) => {
              const fullKey = `script.${varName}`;
              availableData[fullKey] = typeof varData.value === 'object' 
                ? `[${varData.type}] ${JSON.stringify(varData.value).substring(0, 30)}...`
                : String(varData.value || `[${varData.type}] processed`);
              console.log(`✅ Added script variable: ${fullKey}`);
            });
          }
          
          if (properties.executionResult) {
            availableData[`${nodeType}.executed`] = 'true';
            availableData[`${nodeType}.outputCount`] = Object.keys(properties.outputVariables || {}).length;
          }
          break;
          
        case NODE_TYPES.LAYOUT_DESIGNER:
          // Datos del layout
          if (properties.layout && properties.layout.elements) {
            availableData[`${nodeType}.elementsCount`] = properties.layout.elements.length;
          }
          break;
          
        default:
          // Fallback para otros tipos
          Object.keys(properties).forEach(key => {
            if (key !== 'status' && key !== 'createdAt') {
              const fullKey = `${nodeType}.${key}`;
              const value = properties[key];
              if (typeof value === 'object') {
                availableData[fullKey] = `[Object] ${JSON.stringify(value).substring(0, 20)}...`;
              } else {
                availableData[fullKey] = String(value);
              }
              console.log(`✅ Added generic data: ${fullKey}`);
            }
          });
      }
    }
  });
  
  console.log(`📋 Final available data for node ${nodeId}:`, Object.keys(availableData));
  return availableData;
};

// Helper function to generate body examples based on content type
const getBodyExampleForContentType = (contentType) => {
  switch (contentType) {
    case 'application/json':
      return {
        id: 123,
        name: "Ejemplo Usuario",
        email: "usuario@ejemplo.com",
        data: { field1: "valor1", field2: 42 }
      };
    case 'application/x-www-form-urlencoded':
    case 'multipart/form-data':
      return {
        nombre: "Juan Pérez",
        email: "juan@ejemplo.com",
        edad: 30
      };
    case 'text/plain':
      return "Contenido de texto plano";
    default:
      return "Contenido del body";
  }
};

// ENHANCED: Get mapped variables specifically for Layout Designer with HTTP Input support
export const getMappedVariablesForLayout = (nodeId, nodes, edges) => {
  const mappedVariables = {};
  const incomingEdges = edges.filter(edge => edge.target === nodeId);
  
  incomingEdges.forEach(edge => {
    const sourceNode = nodes.find(node => node.id === edge.source);
    if (sourceNode && sourceNode.data.properties) {
      const nodeType = sourceNode.data.type;
      const properties = sourceNode.data.properties;
      
      switch (nodeType) {
        case NODE_TYPES.HTTP_INPUT:
          // Variables del HTTP Input
          if (properties.headers && properties.headers.length > 0) {
            properties.headers.forEach(header => {
              if (header.variable) {
                mappedVariables[`headers.${header.variable}`] = {
                  type: 'string',
                  source: 'http-header',
                  value: header.defaultValue || `[Header: ${header.name}]`,
                  displayValue: `Header ${header.name}${header.required ? ' (requerido)' : ''}`,
                  description: header.description
                };
              }
            });
          }
          
          if (properties.enableBodyCapture && properties.bodyVariable) {
            mappedVariables[properties.bodyVariable] = {
              type: 'object',
              source: 'http-body',
              value: getBodyExampleForContentType(properties.contentType),
              displayValue: `Body (${properties.contentType})`,
              description: 'Request body content'
            };
          }
          break;
          
        case NODE_TYPES.DATA_MAPPER:
          // Variables del Data Mapper
          if (properties.outputVariables) {
            Object.entries(properties.outputVariables).forEach(([varName, varData]) => {
              mappedVariables[varName] = {
                type: varData.type,
                source: varData.source === 'http-input' ? 'data-mapper-http' : 'data-mapper-manual',
                jsonPath: varData.jsonPath,
                value: varData.sourceValue,
                displayValue: typeof varData.sourceValue === 'object' 
                  ? `[${varData.type}] Complex Object`
                  : String(varData.sourceValue),
                httpInputConnected: varData.httpInputConnected
              };
            });
          }
          break;
          
        case NODE_TYPES.SCRIPT_PROCESSOR:
          // Variables del Script Processor
          if (properties.outputVariables) {
            Object.entries(properties.outputVariables).forEach(([varName, varData]) => {
              mappedVariables[varName] = {
                type: varData.type,
                source: 'script-processor',
                jsonPath: '',
                value: varData.value,
                displayValue: varData.displayValue || String(varData.value)
              };
            });
          }
          break;
          
        default:
          // Otros tipos de nodos
          Object.keys(properties).forEach(key => {
            if (key !== 'status' && key !== 'createdAt') {
              const fullKey = `${nodeType}.${key}`;
              mappedVariables[fullKey] = {
                type: 'string',
                source: nodeType,
                jsonPath: '',
                value: properties[key],
                displayValue: String(properties[key])
              };
            }
          });
      }
    }
  });
  
  return mappedVariables;
};

// Validate node data
export const validateNodeData = (nodeType, data) => {
  const config = getNodeConfig(nodeType);
  const errors = [];
  
  config.fields.forEach(field => {
    if (!data[field] || data[field].trim() === '') {
      errors.push(`El campo ${field} es requerido`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// Get node position within bounds
export const getValidNodePosition = (x, y, canvasWidth = 800, canvasHeight = 600, nodeWidth = 120, nodeHeight = 80) => {
  return {
    x: Math.max(0, Math.min(canvasWidth - nodeWidth, x)),
    y: Math.max(0, Math.min(canvasHeight - nodeHeight, y))
  };
};

// Check if nodes can be connected
export const canConnect = (sourceNode, targetNode, edges) => {
  if (sourceNode.id === targetNode.id) return false;
  
  const existingConnection = edges.find(edge => 
    edge.source === sourceNode.id && edge.target === targetNode.id
  );
  
  return !existingConnection;
};

// Get node depth in workflow
export const getNodeDepth = (nodeId, edges, visited = new Set()) => {
  if (visited.has(nodeId)) return 0;
  
  visited.add(nodeId);
  
  const incomingEdges = edges.filter(edge => edge.target === nodeId);
  
  if (incomingEdges.length === 0) return 0;
  
  const depths = incomingEdges.map(edge => 
    getNodeDepth(edge.source, edges, new Set(visited))
  );
  
  return Math.max(...depths) + 1;
};

// Sort nodes by execution order
export const sortNodesByExecutionOrder = (nodes, edges) => {
  return nodes
    .map(node => ({
      ...node,
      depth: getNodeDepth(node.id, edges)
    }))
    .sort((a, b) => a.depth - b.depth);
};

// Find nodes without incoming connections
export const findEntryNodes = (nodes, edges) => {
  return nodes.filter(node => {
    const hasIncoming = edges.some(edge => edge.target === node.id);
    return !hasIncoming;
  });
};

// Find nodes without outgoing connections
export const findExitNodes = (nodes, edges) => {
  return nodes.filter(node => {
    const hasOutgoing = edges.some(edge => edge.source === node.id);
    return !hasOutgoing;
  });
};

// Get node statistics
export const getWorkflowStats = (nodes, edges) => {
  const httpInputsCount = nodes.filter(n => n.data.type === NODE_TYPES.HTTP_INPUT).length;
  const dataMappersCount = nodes.filter(n => n.data.type === NODE_TYPES.DATA_MAPPER).length;
  
  return {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    entryNodes: findEntryNodes(nodes, edges).length,
    exitNodes: findExitNodes(nodes, edges).length,
    maxDepth: Math.max(...nodes.map(node => getNodeDepth(node.id, edges)), 0),
    nodeTypes: nodes.reduce((acc, node) => {
      acc[node.data.type] = (acc[node.data.type] || 0) + 1;
      return acc;
    }, {}),
    httpInputs: httpInputsCount,
    dataMappers: dataMappersCount
  };
};