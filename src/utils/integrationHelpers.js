// src/utils/integrationHelpers.js
// Funciones de integración entre HTTP Input y Data Mapper

import { generateHttpInputApiDoc } from './httpInputHelpers';
import { generateDataMapperFlowDoc } from './dataMapperHelpers';

// Trace data flow from HTTP Input through Data Mapper to final nodes
export const traceDataFlow = (nodes, edges, startNodeId) => {
  const flow = [];
  const visited = new Set();
  
  const traceNode = (nodeId, depth = 0) => {
    if (visited.has(nodeId) || depth > 10) return; // Prevent infinite loops
    
    visited.add(nodeId);
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    const nodeInfo = {
      nodeId,
      type: node.data.type,
      depth,
      properties: node.data.properties,
      position: node.position
    };
    
    // Add specific information based on node type
    switch (node.data.type) {
      case 'http-input':
        nodeInfo.api = {
          endpoint: node.data.properties.endpoint,
          method: node.data.properties.method,
          headers: node.data.properties.headers?.filter(h => h.variable) || [],
          bodyVariable: node.data.properties.bodyVariable
        };
        break;
        
      case 'data-mapper':
        nodeInfo.mapping = {
          source: node.data.properties.selectedSource,
          mappingsCount: node.data.properties.mappings?.length || 0,
          outputVariables: Object.keys(node.data.properties.outputVariables || {})
        };
        break;
        
      case 'layout-designer':
        nodeInfo.layout = {
          elementsCount: node.data.properties.layout?.elements?.length || 0
        };
        break;
    }
    
    flow.push(nodeInfo);
    
    // Continue tracing to connected nodes
    const outgoingEdges = edges.filter(edge => edge.source === nodeId);
    outgoingEdges.forEach(edge => {
      traceNode(edge.target, depth + 1);
    });
  };
  
  traceNode(startNodeId);
  return flow;
};

// Generate complete workflow integration report
export const generateWorkflowIntegrationReport = (nodes, edges) => {
  const httpInputNodes = nodes.filter(n => n.data.type === 'http-input');
  const dataMapperNodes = nodes.filter(n => n.data.type === 'data-mapper');
  
  const httpInputs = httpInputNodes.map(node => generateHttpInputApiDoc(node));
  const dataMappers = dataMapperNodes.map(node => generateDataMapperFlowDoc(node, nodes, edges));
  
  // Find all data flows starting from HTTP Inputs
  const dataFlows = httpInputs.map(httpInput => ({
    httpInput,
    flow: traceDataFlow(nodes, edges, httpInput.nodeId)
  }));
  
  // Analyze integration patterns
  const integrationPatterns = {
    httpToMapper: dataFlows.filter(flow => 
      flow.flow.some(node => node.type === 'data-mapper')
    ).length,
    mapperToLayout: dataMappers.filter(mapper =>
      edges.some(edge => 
        edge.source === mapper.nodeId && 
        nodes.find(n => n.id === edge.target)?.data.type === 'layout-designer'
      )
    ).length,
    completeFlows: dataFlows.filter(flow =>
      flow.flow.length >= 3 && // HTTP Input -> Data Mapper -> Something else
      flow.flow.some(node => node.type === 'data-mapper') &&
      flow.flow.some(node => node.type === 'layout-designer')
    ).length
  };
  
  return {
    summary: {
      totalNodes: nodes.length,
      httpInputNodes: httpInputs.length,
      dataMapperNodes: dataMappers.length,
      integrationPatterns,
      dataFlows: dataFlows.length
    },
    httpInputs,
    dataMappers,
    dataFlows,
    recommendations: generateIntegrationRecommendations(nodes, edges, httpInputs, dataMappers)
  };
};

// Generate recommendations for better integration
export const generateIntegrationRecommendations = (nodes, edges, httpInputs, dataMappers) => {
  const recommendations = [];
  
  // Check for unconnected HTTP Inputs
  const unconnectedHttpInputs = httpInputs.filter(httpInput => {
    const hasOutgoingConnections = edges.some(edge => edge.source === httpInput.nodeId);
    return !hasOutgoingConnections;
  });
  
  if (unconnectedHttpInputs.length > 0) {
    recommendations.push({
      type: 'warning',
      category: 'connectivity',
      message: `${unconnectedHttpInputs.length} HTTP Input(s) sin conectar`,
      suggestion: 'Conecta los HTTP Inputs con Data Mappers para procesar los datos',
      nodes: unconnectedHttpInputs.map(h => h.nodeId)
    });
  }
  
  // Check for Data Mappers without HTTP Input source
  const manualDataMappers = dataMappers.filter(mapper => 
    mapper.source.type === 'manual'
  );
  
  if (manualDataMappers.length > 0 && httpInputs.length > 0) {
    recommendations.push({
      type: 'info',
      category: 'optimization',
      message: `${manualDataMappers.length} Data Mapper(s) usando entrada manual`,
      suggestion: 'Considera conectar con HTTP Inputs para datos dinámicos',
      nodes: manualDataMappers.map(m => m.nodeId)
    });
  }
  
  // Check for HTTP Inputs with body but no Data Mapper
  const httpInputsWithBody = httpInputs.filter(httpInput => 
    httpInput.body.enabled
  );
  
  const httpInputsWithBodyButNoMapper = httpInputsWithBody.filter(httpInput => {
    const hasDataMapperConnection = edges.some(edge => {
      if (edge.source !== httpInput.nodeId) return false;
      const targetNode = nodes.find(n => n.id === edge.target);
      return targetNode?.data.type === 'data-mapper';
    });
    return !hasDataMapperConnection;
  });
  
  if (httpInputsWithBodyButNoMapper.length > 0) {
    recommendations.push({
      type: 'suggestion',
      category: 'data-flow',
      message: `${httpInputsWithBodyButNoMapper.length} HTTP Input(s) con body sin Data Mapper`,
      suggestion: 'Agrega Data Mappers para estructurar los datos del body',
      nodes: httpInputsWithBodyButNoMapper.map(h => h.nodeId)
    });
  }
  
  // Check for incomplete flows
  const incompleteFlows = dataMappers.filter(mapper => {
    const hasOutgoingConnections = edges.some(edge => edge.source === mapper.nodeId);
    return !hasOutgoingConnections;
  });
  
  if (incompleteFlows.length > 0) {
    recommendations.push({
      type: 'info',
      category: 'workflow',
      message: `${incompleteFlows.length} Data Mapper(s) sin nodos de salida`,
      suggestion: 'Conecta con Layout Designer o Script Processor para usar los datos',
      nodes: incompleteFlows.map(m => m.nodeId)
    });
  }
  
  // Check for optimal flow patterns
  const optimalFlows = dataFlows.filter(flow => {
    const hasHttpInput = flow.flow.some(n => n.type === 'http-input');
    const hasDataMapper = flow.flow.some(n => n.type === 'data-mapper');
    const hasOutput = flow.flow.some(n => ['layout-designer', 'script-processor'].includes(n.type));
    return hasHttpInput && hasDataMapper && hasOutput;
  });
  
  if (optimalFlows.length > 0) {
    recommendations.push({
      type: 'success',
      category: 'best-practice',
      message: `${optimalFlows.length} flujo(s) óptimo(s) detectado(s)`,
      suggestion: 'Excelente - tienes flujos completos HTTP → Mapper → Output',
      nodes: []
    });
  }
  
  return recommendations;
};

// Calculate integration complexity
export const calculateIntegrationComplexity = (nodes, edges) => {
  const httpInputs = nodes.filter(n => n.data.type === 'http-input').length;
  const dataMappers = nodes.filter(n => n.data.type === 'data-mapper').length;
  const connections = edges.length;
  
  // Calculate total variables
  let totalVariables = 0;
  nodes.forEach(node => {
    if (node.data.type === 'http-input') {
      const props = node.data.properties;
      totalVariables += (props.headers?.filter(h => h.variable).length || 0);
      if (props.enableBodyCapture) totalVariables += 1;
    }
    if (node.data.type === 'data-mapper') {
      const props = node.data.properties;
      totalVariables += Object.keys(props.outputVariables || {}).length;
    }
  });
  
  // Complex calculation
  const complexity = (httpInputs * 2) + (dataMappers * 3) + connections + (totalVariables * 0.5);
  
  if (complexity <= 10) return 'Low';
  if (complexity <= 25) return 'Medium';
  if (complexity <= 50) return 'High';
  return 'Very High';
};

// Calculate data flow health score
export const calculateDataFlowHealth = (nodes, edges) => {
  let score = 100;
  
  // Penalize disconnected nodes
  const isolatedNodes = nodes.filter(node => {
    const hasConnections = edges.some(edge => 
      edge.source === node.id || edge.target === node.id
    );
    return !hasConnections;
  });
  
  score -= isolatedNodes.length * 10;
  
  // Penalize HTTP Inputs without Data Mappers
  const httpInputs = nodes.filter(n => n.data.type === 'http-input');
  const httpInputsWithoutMappers = httpInputs.filter(httpInput => {
    const hasDataMapperConnection = edges.some(edge => {
      if (edge.source !== httpInput.id) return false;
      const targetNode = nodes.find(n => n.id === edge.target);
      return targetNode?.data.type === 'data-mapper';
    });
    return !hasDataMapperConnection;
  });
  
  score -= httpInputsWithoutMappers.length * 15;
  
  // Bonus for complete flows (HTTP Input -> Data Mapper -> Output)
  const completeFlows = httpInputs.filter(httpInput => {
    const flow = traceDataFlow(nodes, edges, httpInput.id);
    return flow.length >= 3 && 
           flow.some(n => n.type === 'data-mapper') &&
           flow.some(n => ['layout-designer', 'script-processor'].includes(n.type));
  });
  
  score += completeFlows.length * 20;
  
  // Bonus for proper variable mapping
  const dataMappers = nodes.filter(n => n.data.type === 'data-mapper');
  const wellConfiguredMappers = dataMappers.filter(mapper => {
    const props = mapper.data.properties;
    const validMappings = props.mappings?.filter(m => m.isValid && m.variableName).length || 0;
    return validMappings > 0;
  });
  
  score += wellConfiguredMappers.length * 10;
  
  return Math.max(0, Math.min(100, score));
};

// Find integration issues in workflow
export const findIntegrationIssues = (nodes, edges) => {
  const issues = [];
  
  // Find orphaned nodes
  const orphanedNodes = nodes.filter(node => {
    const hasConnections = edges.some(edge => 
      edge.source === node.id || edge.target === node.id
    );
    return !hasConnections && nodes.length > 1;
  });
  
  orphanedNodes.forEach(node => {
    issues.push({
      type: 'error',
      severity: 'medium',
      nodeId: node.id,
      nodeType: node.data.type,
      message: `Nodo ${node.data.type} sin conexiones`,
      suggestion: 'Conecta este nodo con otros para formar un flujo de datos'
    });
  });
  
  // Find HTTP Inputs with body but no variables
  const httpInputsWithBodyButNoVars = nodes
    .filter(n => n.data.type === 'http-input')
    .filter(node => {
      const props = node.data.properties;
      return props.enableBodyCapture && !props.bodyVariable;
    });
  
  httpInputsWithBodyButNoVars.forEach(node => {
    issues.push({
      type: 'warning',
      severity: 'low',
      nodeId: node.id,
      nodeType: node.data.type,
      message: 'Body habilitado pero sin variable configurada',
      suggestion: 'Configura una variable para almacenar el contenido del body'
    });
  });
  
  // Find Data Mappers with no valid mappings
  const invalidDataMappers = nodes
    .filter(n => n.data.type === 'data-mapper')
    .filter(node => {
      const props = node.data.properties;
      const validMappings = props.mappings?.filter(m => m.isValid && m.variableName).length || 0;
      return validMappings === 0;
    });
  
  invalidDataMappers.forEach(node => {
    issues.push({
      type: 'error',
      severity: 'high',
      nodeId: node.id,
      nodeType: node.data.type,
      message: 'Data Mapper sin mapeos válidos',
      suggestion: 'Configura al menos un mapeo válido para procesar datos'
    });
  });
  
  // Find circular dependencies
  const findCircularDeps = (nodeId, visited = new Set(), path = []) => {
    if (path.includes(nodeId)) {
      return path.slice(path.indexOf(nodeId)).concat(nodeId);
    }
    
    if (visited.has(nodeId)) return null;
    visited.add(nodeId);
    
    const outgoingEdges = edges.filter(edge => edge.source === nodeId);
    for (const edge of outgoingEdges) {
      const cycle = findCircularDeps(edge.target, visited, [...path, nodeId]);
      if (cycle) return cycle;
    }
    
    return null;
  };
  
  nodes.forEach(node => {
    const cycle = findCircularDeps(node.id);
    if (cycle) {
      issues.push({
        type: 'error',
        severity: 'high',
        nodeId: node.id,
        nodeType: node.data.type,
        message: 'Dependencia circular detectada',
        suggestion: 'Elimina las conexiones que crean el ciclo',
        additionalInfo: { cycle }
      });
    }
  });
  
  return issues;
};