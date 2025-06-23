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
   * Validate workflow before execution
   */
  export const validateWorkflow = (nodes, edges) => {
    const errors = [];
    const warnings = [];
  
    // Check for isolated nodes
    const connectedNodes = new Set();
    edges.forEach(edge => {
      connectedNodes.add(edge.source);
      connectedNodes.add(edge.target);
    });
  
    const isolatedNodes = nodes.filter(node => !connectedNodes.has(node.id));
    if (isolatedNodes.length > 0) {
      warnings.push(`Found ${isolatedNodes.length} isolated node(s)`);
    }
  
    // Check for circular dependencies
    try {
      getExecutionOrder(nodes, edges);
    } catch (error) {
      errors.push(error.message);
    }
  
    // Check for nodes without required properties
    nodes.forEach(node => {
      const config = getNodeConfig(node.data.type);
      const missing = config.fields.filter(field => 
        !node.data.properties || !node.data.properties[field]
      );
      
      if (missing.length > 0) {
        warnings.push(`Node ${node.id} missing required fields: ${missing.join(', ')}`);
      }
    });
  
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
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
        throw new Error(`Unsupported export format: ${format}`);
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
   * Import workflow from JSON
   */
  export const importWorkflow = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const workflowData = JSON.parse(e.target.result);
          
          // Validate structure
          if (!workflowData.nodes || !Array.isArray(workflowData.nodes)) {
            throw new Error('Invalid workflow format: missing nodes array');
          }
          
          if (!workflowData.edges || !Array.isArray(workflowData.edges)) {
            throw new Error('Invalid workflow format: missing edges array');
          }
          
          resolve(workflowData);
        } catch (error) {
          reject(new Error(`Failed to parse workflow file: ${error.message}`));
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  };
  
  /**
   * Generate workflow summary
   */
  export const generateWorkflowSummary = (nodes, edges) => {
    const nodeTypes = nodes.reduce((acc, node) => {
      acc[node.data.type] = (acc[node.data.type] || 0) + 1;
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
  
  // Re-export node helpers for convenience
  export { getNodeConfig, validateNodeData } from './nodeHelpers';