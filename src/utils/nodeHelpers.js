// src/utils/nodeHelpers.js - FIXED
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

// Get available data from incoming nodes - FIXED
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
          // Datos de HTTP Input
          if (properties.endpoint) {
            availableData[`${nodeType}.endpoint`] = properties.endpoint;
            availableData[`${nodeType}.method`] = properties.method;
            availableData[`${nodeType}.path`] = properties.path;
          }
          break;
          
        case NODE_TYPES.DATA_MAPPER:
          // Datos mapeados del Data Mapper
          if (properties.outputVariables) {
            Object.entries(properties.outputVariables).forEach(([varName, varData]) => {
              // Crear una representación segura del valor
              let safeValue;
              if (typeof varData.sourceValue === 'object') {
                safeValue = `[${varData.type}] ${JSON.stringify(varData.sourceValue).substring(0, 30)}...`;
              } else {
                safeValue = String(varData.sourceValue || `[${varData.type}] from ${varData.jsonPath}`);
              }
              
              availableData[`mapper.${varName}`] = safeValue;
            });
          }
          
          // También agregar información del mapeo
          if (properties.mappings && properties.mappings.length > 0) {
            availableData[`${nodeType}.mappingsCount`] = properties.mappings.length;
          }
          break;
          
        case NODE_TYPES.SCRIPT_PROCESSOR:
          // Variables generadas por Script Processor
          if (properties.outputVariables) {
            Object.entries(properties.outputVariables).forEach(([varName, varData]) => {
              // Crear una representación segura del valor
              let safeValue;
              if (typeof varData.value === 'object') {
                safeValue = `[${varData.type}] ${JSON.stringify(varData.value).substring(0, 30)}...`;
              } else {
                safeValue = String(varData.value || `[${varData.type}] processed`);
              }
              
              availableData[`script.${varName}`] = safeValue;
            });
          }
          
          // También agregar información del script
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
              // Asegurar que el valor sea una representación string segura
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

// FUNCIÓN específica para obtener variables mapeadas para el Layout Designer - FIXED
export const getMappedVariablesForLayout = (nodeId, nodes, edges) => {
  const mappedVariables = {};
  const incomingEdges = edges.filter(edge => edge.target === nodeId);
  
  incomingEdges.forEach(edge => {
    const sourceNode = nodes.find(node => node.id === edge.source);
    if (sourceNode && sourceNode.data.properties) {
      const nodeType = sourceNode.data.type;
      const properties = sourceNode.data.properties;
      
      switch (nodeType) {
        case NODE_TYPES.DATA_MAPPER:
          // Variables del Data Mapper
          if (properties.outputVariables) {
            Object.entries(properties.outputVariables).forEach(([varName, varData]) => {
              mappedVariables[varName] = {
                type: varData.type,
                jsonPath: varData.jsonPath,
                value: varData.sourceValue,
                displayValue: typeof varData.sourceValue === 'object' 
                  ? `[${varData.type}] Complex Object`
                  : String(varData.sourceValue)
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
  // Prevent self-connection
  if (sourceNode.id === targetNode.id) return false;
  
  // Check if connection already exists
  const existingConnection = edges.find(edge => 
    edge.source === sourceNode.id && edge.target === targetNode.id
  );
  
  return !existingConnection;
};

// Get node depth in workflow
export const getNodeDepth = (nodeId, edges, visited = new Set()) => {
  if (visited.has(nodeId)) return 0; // Circular reference protection
  
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

// Find nodes without incoming connections (entry points)
export const findEntryNodes = (nodes, edges) => {
  return nodes.filter(node => {
    const hasIncoming = edges.some(edge => edge.target === node.id);
    return !hasIncoming;
  });
};

// Find nodes without outgoing connections (exit points)
export const findExitNodes = (nodes, edges) => {
  return nodes.filter(node => {
    const hasOutgoing = edges.some(edge => edge.source === node.id);
    return !hasOutgoing;
  });
};

// Get node statistics
export const getWorkflowStats = (nodes, edges) => {
  return {
    totalNodes: nodes.length,
    totalEdges: edges.length,
    entryNodes: findEntryNodes(nodes, edges).length,
    exitNodes: findExitNodes(nodes, edges).length,
    maxDepth: Math.max(...nodes.map(node => getNodeDepth(node.id, edges)), 0),
    nodeTypes: nodes.reduce((acc, node) => {
      acc[node.data.type] = (acc[node.data.type] || 0) + 1;
      return acc;
    }, {})
  };
};