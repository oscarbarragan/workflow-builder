// src/utils/workflowHelpers.js
import { getNodeConfig } from './nodeHelpers';

// Workflow execution and processing utilities

/**
 * Execute workflow and return processed data
 */
export const executeWorkflow = (nodes, edges) => {
    const processedData = {};
    const executionOrder = getExecutionOrder(nodes, edges);
    
    executionOrder.forEach(node => {
      if (node.data.properties && Object.keys(node.data.properties).length > 0) {
        processedData[node.id] = {
          type: node.data.type,
          properties: node.data.properties,
          timestamp: new Date().toISOString()
        };
      }
    });
    
    return processedData;
  };
  
  /**
   * Get nodes in execution order based on dependencies
   */
  export const getExecutionOrder = (nodes, edges) => {
    const nodeMap = new Map(nodes.map(node => [node.id, node]));
    const visited = new Set();
    const visiting = new Set();
    const order = [];
  
    const visit = (nodeId) => {
      if (visiting.has(nodeId)) {
        throw new Error(`Circular dependency detected at node ${nodeId}`);
      }
      
      if (visited.has(nodeId)) return;
      
      visiting.add(nodeId);
      
      // Visit all dependencies first
      const dependencies = edges
        .filter(edge => edge.target === nodeId)
        .map(edge => edge.source);
      
      dependencies.forEach(depId => visit(depId));
      
      visiting.delete(nodeId);
      visited.add(nodeId);
      
      const node = nodeMap.get(nodeId);
      if (node) order.push(node);
    };
  
    nodes.forEach(node => visit(node.id));
    
    return order;
  };
  
  /**
   * Validate workflow before execution or import
   */
  export const validateWorkflow = (nodes, edges) => {
    const errors = [];
    const warnings = [];

    // Basic structure validation
    if (!Array.isArray(nodes)) {
      errors.push('Los nodos deben ser un array válido');
      return { isValid: false, errors, warnings };
    }

    if (!Array.isArray(edges)) {
      errors.push('Las conexiones deben ser un array válido');
      return { isValid: false, errors, warnings };
    }

    // Validate nodes
    nodes.forEach((node, index) => {
      // Required properties
      if (!node.id) {
        errors.push(`Nodo en posición ${index} no tiene ID`);
      }
      
      if (!node.type && !node.data?.type) {
        errors.push(`Nodo ${node.id || index} no tiene tipo definido`);
      }

      // Position validation
      if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
        warnings.push(`Nodo ${node.id || index} no tiene posición válida`);
      }

      // Check for valid node type
      const nodeType = node.data?.type || node.type;
      if (nodeType) {
        const config = getNodeConfig(nodeType);
        if (!config || config.title === 'Nodo Desconocido') {
          warnings.push(`Tipo de nodo desconocido: ${nodeType}`);
        }
      }
    });

    // Validate edges
    edges.forEach((edge, index) => {
      if (!edge.id) {
        errors.push(`Conexión en posición ${index} no tiene ID`);
      }
      
      if (!edge.source) {
        errors.push(`Conexión ${edge.id || index} no tiene nodo origen`);
      }
      
      if (!edge.target) {
        errors.push(`Conexión ${edge.id || index} no tiene nodo destino`);
      }

      // Check if referenced nodes exist
      const sourceExists = nodes.some(node => node.id === edge.source);
      const targetExists = nodes.some(node => node.id === edge.target);
      
      if (!sourceExists) {
        errors.push(`Conexión ${edge.id || index} hace referencia a un nodo origen inexistente: ${edge.source}`);
      }
      
      if (!targetExists) {
        errors.push(`Conexión ${edge.id || index} hace referencia a un nodo destino inexistente: ${edge.target}`);
      }
    });

    // Check for isolated nodes
    const connectedNodes = new Set();
    edges.forEach(edge => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });

    const isolatedNodes = nodes.filter(node => !connectedNodes.has(node.id));
    if (isolatedNodes.length > 0) {
      warnings.push(`${isolatedNodes.length} nodo(s) aislado(s) encontrado(s)`);
    }

    // Check for circular dependencies
    try {
      getExecutionOrder(nodes, edges);
    } catch (error) {
      errors.push(error.message);
    }

    // Check for nodes without required properties
    nodes.forEach(node => {
      const nodeType = node.data?.type || node.type;
      if (nodeType) {
        const config = getNodeConfig(nodeType);
        const properties = node.data?.properties || node.properties || {};
        
        const missing = config.fields?.filter(field => 
          !properties[field] || properties[field].toString().trim() === ''
        ) || [];
        
        if (missing.length > 0) {
          warnings.push(`Nodo ${node.id} tiene campos requeridos vacíos: ${missing.join(', ')}`);
        }
      }
    });

    // Check for duplicate IDs
    const nodeIds = nodes.map(node => node.id);
    const duplicateNodeIds = nodeIds.filter((id, index) => nodeIds.indexOf(id) !== index);
    if (duplicateNodeIds.length > 0) {
      errors.push(`IDs de nodos duplicados encontrados: ${duplicateNodeIds.join(', ')}`);
    }

    const edgeIds = edges.map(edge => edge.id);
    const duplicateEdgeIds = edgeIds.filter((id, index) => edgeIds.indexOf(id) !== index);
    if (duplicateEdgeIds.length > 0) {
      errors.push(`IDs de conexiones duplicados encontrados: ${duplicateEdgeIds.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };

  /**
   * Import workflow from file
   */
  export const importWorkflow = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const workflowData = JSON.parse(e.target.result);
          
          // Validate basic structure
          if (!workflowData || typeof workflowData !== 'object') {
            throw new Error('El archivo no contiene un objeto JSON válido');
          }

          // Ensure required properties exist
          if (!workflowData.nodes) {
            workflowData.nodes = [];
          }
          
          if (!workflowData.edges) {
            workflowData.edges = [];
          }

          // Normalize node structure for ReactFlow
          workflowData.nodes = workflowData.nodes.map(node => ({
            id: node.id,
            type: 'customNode',
            position: node.position || { x: 100, y: 100 },
            data: {
              type: node.type,
              properties: node.properties || {}
            }
          }));

          // Normalize edge structure
          workflowData.edges = workflowData.edges.map(edge => ({
            id: edge.id,
            source: edge.source,
            target: edge.target
          }));

          // Add metadata if missing
          if (!workflowData.metadata) {
            workflowData.metadata = {
              version: '1.0',
              importedAt: new Date().toISOString()
            };
          }

          // Add timestamp if missing
          if (!workflowData.timestamp) {
            workflowData.timestamp = new Date().toISOString();
          }
          
          resolve(workflowData);
        } catch (error) {
          reject(new Error(`Error al procesar archivo JSON: ${error.message}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Error al leer el archivo'));
      };
      
      reader.readAsText(file);
    });
  };
  
  /**
   * Export workflow to different formats
   */
  export const exportWorkflow = (workflowData, format = 'json') => {
    switch (format) {
      case 'json':
        return exportAsJSON(workflowData);
      case 'yaml':
        return exportAsYAML(workflowData);
      case 'csv':
        return exportAsCSV(workflowData);
      default:
        throw new Error(`Formato de exportación no soportado: ${format}`);
    }
  };
  
  /**
   * Export as JSON
   */
  const exportAsJSON = (workflowData) => {
    const jsonString = JSON.stringify(workflowData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    return {
      blob,
      filename: `workflow-${Date.now()}.json`,
      mimeType: 'application/json'
    };
  };
  
  /**
   * Export as YAML (simplified)
   */
  const exportAsYAML = (workflowData) => {
    let yaml = `# Workflow Export - ${new Date().toISOString()}\n\n`;
    
    yaml += 'nodes:\n';
    workflowData.nodes?.forEach(node => {
      yaml += `  - id: ${node.id}\n`;
      yaml += `    type: ${node.type}\n`;
      yaml += `    position:\n`;
      yaml += `      x: ${node.position.x}\n`;
      yaml += `      y: ${node.position.y}\n`;
      if (node.properties) {
        yaml += `    properties:\n`;
        Object.entries(node.properties).forEach(([key, value]) => {
          yaml += `      ${key}: ${JSON.stringify(value)}\n`;
        });
      }
      yaml += '\n';
    });
  
    yaml += 'edges:\n';
    workflowData.edges?.forEach(edge => {
      yaml += `  - id: ${edge.id}\n`;
      yaml += `    source: ${edge.source}\n`;
      yaml += `    target: ${edge.target}\n\n`;
    });
  
    const blob = new Blob([yaml], { type: 'text/yaml' });
    return {
      blob,
      filename: `workflow-${Date.now()}.yaml`,
      mimeType: 'text/yaml'
    };
  };
  
  /**
   * Export as CSV (nodes only)
   */
  const exportAsCSV = (workflowData) => {
    const headers = ['id', 'type', 'x', 'y', 'properties'];
    let csv = headers.join(',') + '\n';
    
    workflowData.nodes?.forEach(node => {
      const row = [
        node.id,
        node.type,
        node.position.x,
        node.position.y,
        JSON.stringify(node.properties || {}).replace(/"/g, '""')
      ];
      csv += row.map(field => `"${field}"`).join(',') + '\n';
    });
  
    const blob = new Blob([csv], { type: 'text/csv' });
    return {
      blob,
      filename: `workflow-nodes-${Date.now()}.csv`,
      mimeType: 'text/csv'
    };
  };
  
  /**
   * Generate workflow summary
   */
  export const generateWorkflowSummary = (nodes, edges) => {
    const nodeTypes = nodes.reduce((acc, node) => {
      const nodeType = node.data?.type || node.type;
      acc[nodeType] = (acc[nodeType] || 0) + 1;
      return acc;
    }, {});
  
    const entryPoints = nodes.filter(node => 
      !edges.some(edge => edge.target === node.id)
    );
  
    const exitPoints = nodes.filter(node => 
      !edges.some(edge => edge.source === node.id)
    );
  
    return {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      nodeTypes,
      entryPoints: entryPoints.length,
      exitPoints: exitPoints.length,
      complexity: calculateComplexity(nodes, edges),
      estimatedExecutionTime: estimateExecutionTime(nodes, edges)
    };
  };
  
  /**
   * Calculate workflow complexity score
   */
  const calculateComplexity = (nodes, edges) => {
    const nodeCount = nodes.length;
    const edgeCount = edges.length;
    const cyclomaticComplexity = edgeCount - nodeCount + 2;
    
    // Simple complexity scoring
    if (cyclomaticComplexity <= 5) return 'Low';
    if (cyclomaticComplexity <= 10) return 'Medium';
    return 'High';
  };
  
  /**
   * Estimate execution time (mock implementation)
   */
  const estimateExecutionTime = (nodes, edges) => {
    const baseTimePerNode = 100; // ms
    const complexityMultiplier = edges.length * 0.1;
    const totalTime = nodes.length * baseTimePerNode * (1 + complexityMultiplier);
    
    return Math.round(totalTime);
  };

  /**
 * Validate HTTP Input configuration
 */
export const validateHttpInput = (properties) => {
  const errors = [];
  
  if (!properties.path || !properties.path.startsWith('/')) {
    errors.push('Path inválido: debe comenzar con /');
  }
  
  if (!properties.method || !['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].includes(properties.method)) {
    errors.push('Método HTTP inválido');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Validate Data Mapper configuration
 */
export const validateDataMapper = (properties) => {
  const errors = [];
  
  if (!properties.mappings || !Array.isArray(properties.mappings)) {
    errors.push('No hay mapeos configurados');
  }
  
  if (properties.mappings && properties.mappings.length === 0) {
    errors.push('Debe tener al menos un mapeo configurado');
  }
  
  // Validate each mapping
  if (properties.mappings) {
    properties.mappings.forEach((mapping, index) => {
      if (!mapping.variableName || mapping.variableName.trim() === '') {
        errors.push(`Mapeo ${index + 1}: nombre de variable requerido`);
      }
      
      if (!mapping.isValid) {
        errors.push(`Mapeo ${index + 1}: tipos incompatibles`);
      }
    });
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Generate API specification from HTTP Input nodes
 */
export const generateApiSpec = (nodes) => {
  const httpNodes = nodes.filter(node => node.data.type === 'http-input');
  
  const endpoints = httpNodes.map(node => {
    const props = node.data.properties;
    return {
      path: props.path,
      method: props.method,
      description: props.description,
      authentication: props.authentication,
      cors: props.enableCors,
      nodeId: node.id
    };
  });
  
  return {
    openapi: '3.0.0',
    info: {
      title: 'Workflow API',
      version: '1.0.0',
      description: 'API generada automáticamente desde el workflow'
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
        description: 'Servidor de desarrollo'
      }
    ],
    paths: endpoints.reduce((acc, endpoint) => {
      acc[endpoint.path] = {
        [endpoint.method.toLowerCase()]: {
          summary: endpoint.description || `${endpoint.method} ${endpoint.path}`,
          description: endpoint.description,
          responses: {
            '200': {
              description: 'Respuesta exitosa',
              content: {
                'application/json': {
                  schema: {
                    type: 'object'
                  }
                }
              }
            }
          }
        }
      };
      return acc;
    }, {})
  };
};

/**
 * Generate data structure documentation from Data Mapper nodes
 */
export const generateDataStructureDoc = (nodes) => {
  const mapperNodes = nodes.filter(node => node.data.type === 'data-mapper');
  
  return mapperNodes.map(node => {
    const props = node.data.properties;
    return {
      nodeId: node.id,
      inputStructure: props.parsedJson,
      outputVariables: props.outputVariables,
      mappings: props.mappings?.map(mapping => ({
        variable: mapping.variableName,
        type: mapping.dataType,
        jsonPath: mapping.jsonPath,
        sourceValue: mapping.sourceValue
      })) || []
    };
  });
};

  // Función para validar Data Transformer
  export const validateDataTransformer = (properties) => {
    const errors = [];
    
    if (!properties.transformations || !Array.isArray(properties.transformations)) {
      errors.push('No hay transformaciones configuradas');
    }
    
    const enabledTransformations = properties.transformations?.filter(t => t.enabled) || [];
    if (enabledTransformations.length === 0) {
      errors.push('Debe tener al menos una transformación habilitada');
    }
    
    // Validate each enabled transformation
    enabledTransformations.forEach((transformation, index) => {
      if (!transformation.inputVariable || transformation.inputVariable.trim() === '') {
        errors.push(`Transformación ${index + 1}: variable de entrada requerida`);
      }
      
      if (!transformation.outputVariable || transformation.outputVariable.trim() === '') {
        errors.push(`Transformación ${index + 1}: variable de salida requerida`);
      }
      
      if (!transformation.isValid) {
        errors.push(`Transformación ${index + 1}: configuración inválida`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

/**
 * Enhanced workflow execution for new node types
 */
export const executeWorkflowEnhanced = (nodes, edges) => {
  const processedData = {};
  const executionOrder = getExecutionOrder(nodes, edges);
  
  executionOrder.forEach(node => {
    const nodeType = node.data.type;
    const properties = node.data.properties;
    
    if (!properties || Object.keys(properties).length === 0) {
      return;
    }
    
    switch (nodeType) {
      case 'http-input':
        processedData[node.id] = {
          type: 'http-endpoint',
          endpoint: properties.endpoint,
          method: properties.method,
          path: properties.path,
          authentication: properties.authentication,
          cors: properties.enableCors,
          status: 'configured',
          timestamp: new Date().toISOString()
        };
        break;
        
      case 'data-mapper':
        processedData[node.id] = {
          type: 'data-mapping',
          variables: properties.outputVariables || {},
          mappingsCount: properties.mappings?.length || 0,
          inputStructure: properties.parsedJson,
          status: 'configured',
          timestamp: new Date().toISOString()
        };
        break;
        
      case 'layout-designer':
        processedData[node.id] = {
          type: 'layout-design',
          elementsCount: properties.layout?.elements?.length || 0,
          layout: properties.layout,
          status: 'configured',
          timestamp: new Date().toISOString()
        };
        break;
        case 'data-transformer':
          processedData[node.id] = {
            type: 'data-transformation',
            transformations: properties.transformations?.filter(t => t.enabled) || [],
            outputVariables: properties.outputVariables || {},
            transformationsCount: properties.transformations?.length || 0,
            enabledTransformationsCount: properties.transformations?.filter(t => t.enabled).length || 0,
            successRate: properties.statistics?.successRate || 0,
            status: 'configured',
            timestamp: new Date().toISOString()
          };
          break;
        
      default:
        // Handle existing node types
        processedData[node.id] = {
          type: nodeType,
          properties: properties,
          timestamp: new Date().toISOString()
        };
    }
  });
  
  return processedData;
};
  
  // Re-export node helpers for convenience
  export { getNodeConfig, validateNodeData } from './nodeHelpers';