// src/utils/nodeHelpers.js - ARCHIVO COMPLETO SIN DATOS DEMO
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

// DEBUGGING: Función para imprimir el estado de conexiones
export const debugNodeConnections = (nodeId, nodes, edges) => {
  console.log(`🔧 DEBUG: Analizando nodo ${nodeId}`);
  console.log(`📊 Total nodos:`, nodes.length);
  console.log(`🔗 Total edges:`, edges.length);
  
  const incomingEdges = edges.filter(edge => edge.target === nodeId);
  console.log(`📥 Incoming edges para ${nodeId}:`, incomingEdges);
  
  incomingEdges.forEach(edge => {
    const sourceNode = nodes.find(node => node.id === edge.source);
    console.log(`📍 Source node ${edge.source}:`, sourceNode);
    if (sourceNode) {
      console.log(`📋 Properties:`, sourceNode.data.properties);
      console.log(`🏷️ Type:`, sourceNode.data.type);
    }
  });
};

// ✅ FUNCIÓN CORREGIDA: Extraer el valor real de los objetos complejos
const extractRealValue = (value) => {
  console.log('🔍 extractRealValue:', value);
  
  // Si es null o undefined, devolver tal como está
  if (value === null || value === undefined) {
    return value;
  }
  
  // Si es un primitivo, devolver tal como está
  if (typeof value !== 'object') {
    return value;
  }
  
  // Si es un array, devolver tal como está
  if (Array.isArray(value)) {
    return value;
  }
  
  // Si es un objeto con metadata de nuestro sistema
  if (value.hasOwnProperty('value')) {
    console.log('✅ Found nested value:', value.value);
    return value.value;
  }
  
  if (value.hasOwnProperty('displayValue')) {
    console.log('✅ Found display value:', value.displayValue);
    return value.displayValue;
  }
  
  if (value.hasOwnProperty('defaultValue')) {
    console.log('✅ Found default value:', value.defaultValue);
    return value.defaultValue;
  }
  
  // Si es un objeto simple pequeño, mantenerlo como está
  const keys = Object.keys(value);
  if (keys.length <= 5) {
    return value;
  }
  
  // Para objetos complejos, devolver una representación string
  return JSON.stringify(value);
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
      return "nombre=Juan&email=juan@ejemplo.com&edad=30";
    case 'text/plain':
      return "Contenido de texto plano";
    default:
      return "Contenido del body";
  }
};

// ✅ FUNCIÓN PRINCIPAL CORREGIDA: Get available data from incoming nodes - SIN DATOS DEMO
export const getAvailableData = (nodeId, nodes, edges) => {
  const availableData = {};
  const incomingEdges = edges.filter(edge => edge.target === nodeId);
  
  console.log(`🔍 FIXED: Getting available data for node: ${nodeId}`);
  console.log(`📥 FIXED: Incoming edges: ${incomingEdges.length}`, incomingEdges);
  
  // DEBUGGING: Imprimir estado completo
  debugNodeConnections(nodeId, nodes, edges);
  
  incomingEdges.forEach(edge => {
    const sourceNode = nodes.find(node => node.id === edge.source);
    if (sourceNode && sourceNode.data.properties) {
      const nodeType = sourceNode.data.type;
      const properties = sourceNode.data.properties;
      
      console.log(`📊 FIXED: Processing source node: ${sourceNode.id}, type: ${nodeType}`, properties);
      
      switch (nodeType) {
        case NODE_TYPES.HTTP_INPUT:
          console.log('🌐 FIXED: Processing HTTP Input node:', properties);
          
          // VERIFICAR que el HTTP Input esté configurado correctamente
          if (!properties.configured || !properties.path || properties.path === '') {
            console.log('⚠️ FIXED: HTTP Input not properly configured:', {
              configured: properties.configured,
              path: properties.path,
              method: properties.method
            });
            break; // Skip this HTTP Input if not configured
          }
          
          // ✅ CORREGIDO: Solo agregar variables reales configuradas (sin datos demo)
          if (properties.headers && properties.headers.length > 0) {
            properties.headers.forEach(header => {
              if (header.variable) {
                const headerKey = header.variable;
                const headerValue = header.defaultValue || `example_${header.variable}`;
                
                availableData[headerKey] = headerValue;
                console.log(`✅ FIXED: Added header: ${headerKey} = "${headerValue}"`);
              }
            });
          }
          
          // Agregar variable del body si está habilitada
          if (properties.enableBodyCapture && properties.bodyVariable) {
            const bodyValue = getBodyExampleForContentType(properties.contentType);
            availableData[properties.bodyVariable] = bodyValue;
            console.log(`✅ FIXED: Added body variable: ${properties.bodyVariable}`);
          }
          break;
          
        case NODE_TYPES.DATA_MAPPER:
          // Variables mapeadas del Data Mapper
          if (properties.outputVariables) {
            Object.entries(properties.outputVariables).forEach(([varName, varData]) => {
              const realValue = extractRealValue(varData.sourceValue || varData.value || varData);
              availableData[varName] = realValue;
              console.log(`✅ FIXED: Added mapper variable: ${varName} = ${realValue} (type: ${typeof realValue})`);
            });
          }
          
          // Información del mapeo (como metadata adicional)
          if (properties.mappings && properties.mappings.length > 0) {
            // Agregar estadísticas como números simples
            availableData[`mappingsCount`] = properties.mappings.length;
            availableData[`validMappings`] = properties.mappings.filter(m => m.isValid).length;
          }
          break;
          
        case NODE_TYPES.SCRIPT_PROCESSOR:
          // Variables generadas por Script Processor
          if (properties.outputVariables) {
            Object.entries(properties.outputVariables).forEach(([varName, varData]) => {
              const realValue = extractRealValue(varData.value || varData);
              availableData[varName] = realValue;
              console.log(`✅ FIXED: Added script variable: ${varName} = ${realValue}`);
            });
          }
          
          if (properties.executionResult) {
            availableData[`scriptExecuted`] = true;  // boolean
            availableData[`outputCount`] = Object.keys(properties.outputVariables || {}).length; // number
          }
          break;
          
        case NODE_TYPES.LAYOUT_DESIGNER:
          // Datos del layout como números simples
          if (properties.layout && properties.layout.elements) {
            availableData[`elementsCount`] = properties.layout.elements.length; // number
          }
          break;

        case NODE_TYPES.DATA_TRANSFORMER:
          // ✅ CORREGIDO: El Data Transformer debe pasar TODAS las variables
          console.log('⚡ FIXED: Processing Data Transformer - passing ALL variables');
          
          // 1. Primero agregar TODAS las variables originales (sin transformar)
          if (properties.inputData) {
            Object.entries(properties.inputData).forEach(([varName, value]) => {
              availableData[varName] = value;
              console.log(`✅ FIXED: Added original variable from transformer: ${varName} = ${value}`);
            });
          }
          
          // 2. Si existe allVariables (que incluye originales + transformadas), usar eso
          if (properties.allVariables) {
            Object.entries(properties.allVariables).forEach(([varName, value]) => {
              availableData[varName] = value;
              console.log(`✅ FIXED: Added variable from allVariables: ${varName} = ${value}`);
            });
          } else {
            // 3. Fallback: agregar outputVariables (solo transformadas)
            if (properties.outputVariables) {
              Object.entries(properties.outputVariables).forEach(([varName, varData]) => {
                const realValue = extractRealValue(varData.value || varData);
                availableData[varName] = realValue;
                console.log(`✅ FIXED: Added transformer variable: ${varName} = ${realValue}`);
              });
            }
          }
          
          // 4. También agregar las variables del execution result si existen
          if (properties.executionResult) {
            Object.entries(properties.executionResult).forEach(([varName, value]) => {
              availableData[varName] = value;
              console.log(`✅ FIXED: Added execution result: ${varName} = ${value}`);
            });
          }
          
          // Información de las transformaciones como números simples
          if (properties.transformations && properties.transformations.length > 0) {
            availableData[`transformationsCount`] = properties.transformations.length; // number
            availableData[`enabledTransformations`] = properties.transformations.filter(t => t.enabled).length; // number
          }
          
          // Información de estadísticas como números
          if (properties.statistics) {
            availableData[`successRate`] = properties.statistics.successRate || 0; // number
            availableData[`outputVariablesCount`] = properties.statistics.outputVariablesCount || 0; // number
          }
          break;
          
        default:
          // Fallback para otros tipos - extraer valores reales
          Object.keys(properties).forEach(key => {
            if (key !== 'status' && key !== 'createdAt') {
              const value = properties[key];
              const realValue = extractRealValue(value);
              availableData[key] = realValue;
              console.log(`✅ FIXED: Added generic data: ${key} = ${realValue} (type: ${typeof realValue})`);
            }
          });
      }
    }
  });
  
  // ✅ ELIMINADO: No agregar datos de ejemplo automáticamente
  // Solo mostrar mensaje informativo si no hay datos
  if (Object.keys(availableData).length === 0) {
    console.log('ℹ️ No hay datos disponibles de nodos conectados');
  } else {
    console.log(`📋 FIXED: Final available data for node ${nodeId}:`, availableData);
    console.log(`🔍 FIXED: Data types detected:`, Object.fromEntries(
      Object.entries(availableData).map(([k, v]) => [k, `${typeof v} ${Array.isArray(v) ? '(array)' : ''}`])
    ));
  }
  
  return availableData;
};

// ENHANCED: Get mapped variables specifically for Layout Designer with HTTP Input support
export const getMappedVariablesForLayout = (nodeId, nodes, edges) => {
  const mappedVariables = {};
  const incomingEdges = edges.filter(edge => edge.target === nodeId);
  
  console.log(`🎨 FIXED: Getting mapped variables for Layout Designer: ${nodeId}`);
  
  incomingEdges.forEach(edge => {
    const sourceNode = nodes.find(node => node.id === edge.source);
    if (sourceNode && sourceNode.data.properties) {
      const nodeType = sourceNode.data.type;
      const properties = sourceNode.data.properties;
      
      console.log(`🎨 FIXED: Processing source for layout: ${nodeType}`, properties);
      
      switch (nodeType) {
        case NODE_TYPES.HTTP_INPUT:
          // VERIFICAR que esté configurado
          if (!properties.configured || !properties.path) {
            console.log('⚠️ FIXED: Skipping unconfigured HTTP Input for layout');
            break;
          }
          
          // Variables del HTTP Input
          if (properties.headers && properties.headers.length > 0) {
            properties.headers.forEach(header => {
              if (header.variable) {
                mappedVariables[header.variable] = {
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
              const realValue = extractRealValue(varData.sourceValue || varData.value || varData);
              mappedVariables[varName] = {
                type: typeof realValue,
                source: varData.source === 'http-input' ? 'data-mapper-http' : 'data-mapper-manual',
                jsonPath: varData.jsonPath,
                value: realValue,
                displayValue: typeof realValue === 'object' 
                  ? `[${typeof realValue}] Complex Object`
                  : String(realValue),
                httpInputConnected: varData.httpInputConnected
              };
            });
          }
          break;
          
        case NODE_TYPES.SCRIPT_PROCESSOR:
          // Variables del Script Processor
          if (properties.outputVariables) {
            Object.entries(properties.outputVariables).forEach(([varName, varData]) => {
              const realValue = extractRealValue(varData.value || varData);
              mappedVariables[varName] = {
                type: typeof realValue,
                source: 'script-processor',
                jsonPath: '',
                value: realValue,
                displayValue: varData.displayValue || String(realValue)
              };
            });
          }
          break;

        case NODE_TYPES.DATA_TRANSFORMER:
          // Variables del Data Transformer - usar allVariables si existe
          if (properties.allVariables) {
            Object.entries(properties.allVariables).forEach(([varName, value]) => {
              mappedVariables[varName] = {
                type: typeof value,
                source: 'data-transformer',
                value: value,
                displayValue: typeof value === 'object' 
                  ? `[${typeof value}] Transformed Object`
                  : String(value)
              };
            });
          } else if (properties.outputVariables) {
            Object.entries(properties.outputVariables).forEach(([varName, varData]) => {
              const realValue = extractRealValue(varData.value || varData);
              mappedVariables[varName] = {
                type: typeof realValue,
                source: 'data-transformer',
                value: realValue,
                displayValue: typeof realValue === 'object' 
                  ? `[${typeof realValue}] Transformed Object`
                  : String(realValue),
                originalVariable: varData.inputVariable,
                transformationType: varData.transformationType
              };
            });
          }
          break;     
          
        default:
          // Otros tipos de nodos
          Object.keys(properties).forEach(key => {
            if (key !== 'status' && key !== 'createdAt') {
              const realValue = extractRealValue(properties[key]);
              mappedVariables[key] = {
                type: typeof realValue,
                source: nodeType,
                jsonPath: '',
                value: realValue,
                displayValue: String(realValue)
              };
            }
          });
      }
    }
  });
  
  console.log(`🎨 FIXED: Final mapped variables for layout:`, Object.keys(mappedVariables));
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