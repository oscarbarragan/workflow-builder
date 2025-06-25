// src/utils/nodeHelpers.js - REFACTORIZADO Y CORREGIDO
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

// ENHANCED: Get available data from incoming nodes with HTTP Input support
export const getAvailableData = (nodeId, nodes, edges) => {
  const availableData = {};
  const incomingEdges = edges.filter(edge => edge.target === nodeId);
  
  incomingEdges.forEach(edge => {
    const sourceNode = nodes.find(node => node.id === edge.source);
    if (sourceNode && sourceNode.data.properties) {
      const nodeType = sourceNode.data.type;
      const properties = sourceNode.data.properties;
      
      switch (nodeType) {
        case NODE_TYPES.USER_FORM:
        case NODE_TYPES.LOCATION_FORM:
          // Datos de formularios
          Object.keys(properties).forEach(key => {
            if (key !== 'status' && key !== 'createdAt') {
              availableData[`${nodeType}.${key}`] = properties[key];
            }
          });
          break;
          
        case NODE_TYPES.HTTP_INPUT:
          // ENHANCED: Datos del HTTP Input con headers y body
          if (properties.endpoint) {
            availableData[`${nodeType}.endpoint`] = properties.endpoint;
            availableData[`${nodeType}.method`] = properties.method;
            availableData[`${nodeType}.path`] = properties.path;
            
            // Headers variables
            if (properties.headers && properties.headers.length > 0) {
              properties.headers.forEach(header => {
                if (header.variable) {
                  availableData[`headers.${header.variable}`] = {
                    type: 'string',
                    source: 'header',
                    headerName: header.name,
                    required: header.required,
                    defaultValue: header.defaultValue || `example_${header.variable}`,
                    description: header.description
                  };
                }
              });
            }
            
            // Body variable
            if (properties.enableBodyCapture && properties.bodyVariable) {
              availableData[properties.bodyVariable] = {
                type: 'object',
                source: 'body',
                contentType: properties.contentType,
                validation: properties.bodyValidation,
                description: 'Request body content',
                example: getBodyExample(properties.contentType)
              };
            }
            
            // Output structure for Data Mapper connection
            if (properties.outputStructure) {
              Object.entries(properties.outputStructure).forEach(([key, value]) => {
                availableData[key] = value;
              });
            }
          }
          break;
          
        case NODE_TYPES.DATA_MAPPER:
          // ENHANCED: Datos mapeados del Data Mapper con conexión HTTP Input
          if (properties.outputVariables) {
            Object.entries(properties.outputVariables).forEach(([varName, varData]) => {
              let safeValue;
              if (typeof varData.sourceValue === 'object') {
                safeValue = `[${varData.type}] ${JSON.stringify(varData.sourceValue).substring(0, 30)}...`;
              } else {
                safeValue = String(varData.sourceValue || `[${varData.type}] from ${varData.jsonPath}`);
              }
              
              availableData[`mapper.${varName}`] = {
                type: varData.type,
                value: safeValue,
                jsonPath: varData.jsonPath,
                source: varData.source || 'manual',
                httpInputConnected: varData.httpInputConnected || null
              };
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
              let safeValue;
              if (typeof varData.value === 'object') {
                safeValue = `[${varData.type}] ${JSON.stringify(varData.value).substring(0, 30)}...`;
              } else {
                safeValue = String(varData.value || `[${varData.type}] processed`);
              }
              
              availableData[`script.${varName}`] = safeValue;
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
              const value = properties[key];
              if (typeof value === 'object') {
                availableData[`${nodeType}.${key}`] = `[Object] ${JSON.stringify(value).substring(0, 20)}...`;
              } else {
                availableData[`${nodeType}.${key}`] = String(value);
              }
            }
          });
      }
    }
  });
  
  return availableData;
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
              value: getBodyExample(properties.contentType),
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

// Validate node data (existing function)
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

// Get node position within bounds (existing function)
export const getValidNodePosition = (x, y, canvasWidth = 800, canvasHeight = 600, nodeWidth = 120, nodeHeight = 80) => {
  return {
    x: Math.max(0, Math.min(canvasWidth - nodeWidth, x)),
    y: Math.max(0, Math.min(canvasHeight - nodeHeight, y))
  };
};

// Check if nodes can be connected (existing function)
export const canConnect = (sourceNode, targetNode, edges) => {
  if (sourceNode.id === targetNode.id) return false;
  
  const existingConnection = edges.find(edge => 
    edge.source === sourceNode.id && edge.target === targetNode.id
  );
  
  return !existingConnection;
};

// Get node depth in workflow (existing function)
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

// Sort nodes by execution order (existing function)
export const sortNodesByExecutionOrder = (nodes, edges) => {
  return nodes
    .map(node => ({
      ...node,
      depth: getNodeDepth(node.id, edges)
    }))
    .sort((a, b) => a.depth - b.depth);
};

// Find nodes without incoming connections (existing function)
export const findEntryNodes = (nodes, edges) => {
  return nodes.filter(node => {
    const hasIncoming = edges.some(edge => edge.target === node.id);
    return !hasIncoming;
  });
};

// Find nodes without outgoing connections (existing function)
export const findExitNodes = (nodes, edges) => {
  return nodes.filter(node => {
    const hasOutgoing = edges.some(edge => edge.source === node.id);
    return !hasOutgoing;
  });
};

// Get node statistics (enhanced but simplified)
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
    // Enhanced stats
    httpInputs: httpInputsCount,
    dataMappers: dataMappersCount
  };
};