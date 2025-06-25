// src/utils/dataMapperHelpers.js
// Funciones específicas para Data Mapper

// Validate Data Mapper configuration
export const validateDataMapperConfig = (properties) => {
    const errors = [];
    const warnings = [];
    
    if (!properties.mappings || !Array.isArray(properties.mappings)) {
      errors.push('No hay mapeos configurados');
      return { isValid: false, errors, warnings };
    }
    
    if (properties.mappings.length === 0) {
      errors.push('Debe tener al menos un mapeo configurado');
    }
    
    // Validate each mapping
    properties.mappings.forEach((mapping, index) => {
      if (!mapping.variableName || mapping.variableName.trim() === '') {
        errors.push(`Mapeo ${index + 1}: nombre de variable requerido`);
      }
      
      if (!mapping.isValid) {
        errors.push(`Mapeo ${index + 1}: tipos incompatibles`);
      }
      
      // Check for duplicate variable names
      const duplicates = properties.mappings.filter(m => m.variableName === mapping.variableName);
      if (duplicates.length > 1) {
        warnings.push(`Variable duplicada: ${mapping.variableName}`);
      }
    });
    
    // Validate source connection
    if (properties.selectedSource === 'http-input') {
      if (!properties.connectedHttpInput) {
        errors.push('HTTP Input no conectado');
      }
    } else {
      if (!properties.jsonInput || properties.jsonInput.trim() === '') {
        errors.push('JSON de entrada requerido para mapeo manual');
      }
      
      if (!properties.parsedJson) {
        errors.push('JSON inválido o no parseado');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };
  
  // Generate Data Mapper flow documentation
  export const generateDataMapperFlowDoc = (node, allNodes, edges) => {
    const props = node.data.properties;
    
    // Find connected HTTP Input
    const incomingEdges = edges.filter(edge => edge.target === node.id);
    const connectedHttpInputs = incomingEdges
      .map(edge => allNodes.find(n => n.id === edge.source))
      .filter(n => n && n.data.type === 'http-input');
    
    // Find target nodes
    const outgoingEdges = edges.filter(edge => edge.source === node.id);
    const targetNodes = outgoingEdges
      .map(edge => allNodes.find(n => n.id === edge.target))
      .filter(n => n);
    
    return {
      nodeId: node.id,
      source: {
        type: props.selectedSource,
        httpInputConnected: props.connectedHttpInput,
        manualJson: props.selectedSource === 'manual' ? props.parsedJson : null
      },
      mappings: props.mappings?.map(mapping => ({
        variable: mapping.variableName,
        type: mapping.dataType,
        jsonPath: mapping.jsonPath,
        sourceValue: mapping.sourceValue,
        valid: mapping.isValid
      })) || [],
      outputVariables: props.outputVariables || {},
      connections: {
        inputs: connectedHttpInputs.map(n => ({
          nodeId: n.id,
          type: n.data.type,
          endpoint: n.data.properties.endpoint
        })),
        outputs: targetNodes.map(n => ({
          nodeId: n.id,
          type: n.data.type
        }))
      },
      validation: validateDataMapperConfig(props),
      statistics: {
        totalMappings: props.mappings?.length || 0,
        validMappings: props.mappings?.filter(m => m.isValid && m.variableName).length || 0,
        dataTypes: props.mappings?.reduce((acc, m) => {
          acc[m.dataType] = (acc[m.dataType] || 0) + 1;
          return acc;
        }, {}) || {}
      }
    };
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
  
  // Infer data type from value
  export const inferDataType = (value) => {
    if (value === null) return 'string';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'string') {
      // Try to detect dates
      if (/^\d{4}-\d{2}-\d{2}/.test(value)) return 'date';
      return 'string';
    }
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return 'string';
  };
  
  // Generate mappings from JSON structure
  export const generateMappingsFromJson = (jsonData, prefix = '', selectedSource = 'manual') => {
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
  
  // Analyze Data Mapper performance and suggest optimizations
  export const analyzeDataMapperPerformance = (properties) => {
    const analysis = {
      score: 100,
      suggestions: [],
      warnings: [],
      optimizations: []
    };
  
    const mappings = properties.mappings || [];
    
    // Check for too many mappings
    if (mappings.length > 50) {
      analysis.score -= 20;
      analysis.warnings.push('Demasiados mapeos (>50) pueden afectar el rendimiento');
      analysis.optimizations.push('Considera agrupar campos relacionados');
    }
    
    // Check for complex nested paths
    const deepPaths = mappings.filter(m => m.jsonPath && m.jsonPath.split('.').length > 5);
    if (deepPaths.length > 0) {
      analysis.score -= 10;
      analysis.suggestions.push(`${deepPaths.length} mapeos con rutas muy profundas`);
    }
    
    // Check for unused mappings
    const invalidMappings = mappings.filter(m => !m.isValid || !m.variableName);
    if (invalidMappings.length > 0) {
      analysis.score -= 15;
      analysis.warnings.push(`${invalidMappings.length} mapeos inválidos o sin nombre`);
    }
    
    // Check for duplicate variable names
    const duplicates = mappings.reduce((acc, mapping) => {
      const name = mapping.variableName;
      if (name) {
        acc[name] = (acc[name] || 0) + 1;
      }
      return acc;
    }, {});
    
    const duplicateCount = Object.values(duplicates).filter(count => count > 1).length;
    if (duplicateCount > 0) {
      analysis.score -= 25;
      analysis.warnings.push(`${duplicateCount} nombres de variables duplicados`);
    }
    
    // Suggest data type optimizations
    const typeStats = mappings.reduce((acc, m) => {
      acc[m.dataType] = (acc[m.dataType] || 0) + 1;
      return acc;
    }, {});
    
    if (typeStats.string > mappings.length * 0.8) {
      analysis.suggestions.push('Muchos campos string - considera tipos más específicos');
    }
    
    return analysis;
  };
  
  // Generate Data Mapper summary for workflow
  export const generateDataMapperSummary = (nodes) => {
    const dataMapperNodes = nodes.filter(node => node.data.type === 'data-mapper');
    
    const summary = {
      totalMappers: dataMapperNodes.length,
      totalMappings: 0,
      totalOutputVariables: 0,
      sourceTypes: { manual: 0, 'http-input': 0 },
      dataTypes: {},
      connectedToHttpInput: 0,
      averageMappingsPerNode: 0
    };
    
    dataMapperNodes.forEach(node => {
      const props = node.data.properties;
      
      // Count mappings
      const mappingsCount = props.mappings?.length || 0;
      summary.totalMappings += mappingsCount;
      
      // Count output variables
      const outputVarsCount = Object.keys(props.outputVariables || {}).length;
      summary.totalOutputVariables += outputVarsCount;
      
      // Count source types
      if (props.selectedSource) {
        summary.sourceTypes[props.selectedSource]++;
      }
      
      // Count data types
      if (props.mappings) {
        props.mappings.forEach(mapping => {
          summary.dataTypes[mapping.dataType] = 
            (summary.dataTypes[mapping.dataType] || 0) + 1;
        });
      }
      
      // Check HTTP Input connections
      if (props.connectedHttpInput) {
        summary.connectedToHttpInput++;
      }
    });
    
    // Calculate averages
    if (summary.totalMappers > 0) {
      summary.averageMappingsPerNode = Math.round(summary.totalMappings / summary.totalMappers);
    }
    
    return summary;
  };
  
  // Validate JSON input for Data Mapper
  export const validateJsonInput = (jsonString) => {
    const result = {
      isValid: false,
      parsed: null,
      error: null,
      suggestions: []
    };
    
    if (!jsonString || jsonString.trim() === '') {
      result.error = 'JSON vacío';
      return result;
    }
    
    try {
      const parsed = JSON.parse(jsonString);
      result.isValid = true;
      result.parsed = parsed;
      
      // Analyze JSON structure
      const analysis = analyzeJsonStructure(parsed);
      result.suggestions = analysis.suggestions;
      
    } catch (error) {
      result.error = error.message;
      
      // Try to suggest fixes for common JSON errors
      if (error.message.includes('Unexpected token')) {
        result.suggestions.push('Verifica que todas las comillas estén balanceadas');
      }
      if (error.message.includes('Unexpected end of JSON')) {
        result.suggestions.push('El JSON parece estar incompleto');
      }
    }
    
    return result;
  };
  
  // Analyze JSON structure for optimization suggestions
  const analyzeJsonStructure = (obj, depth = 0) => {
    const analysis = {
      maxDepth: depth,
      totalFields: 0,
      complexFields: 0,
      suggestions: []
    };
    
    if (typeof obj === 'object' && obj !== null) {
      if (Array.isArray(obj)) {
        analysis.totalFields += obj.length;
        if (obj.length > 100) {
          analysis.suggestions.push('Array muy grande - considera paginación');
        }
        
        if (obj.length > 0) {
          const childAnalysis = analyzeJsonStructure(obj[0], depth + 1);
          analysis.maxDepth = Math.max(analysis.maxDepth, childAnalysis.maxDepth);
          analysis.totalFields += childAnalysis.totalFields;
          analysis.complexFields += childAnalysis.complexFields;
          analysis.suggestions.push(...childAnalysis.suggestions);
        }
      } else {
        const keys = Object.keys(obj);
        analysis.totalFields += keys.length;
        
        if (keys.length > 50) {
          analysis.suggestions.push('Objeto con muchos campos - considera estructura anidada');
          analysis.complexFields++;
        }
        
        keys.forEach(key => {
          const childAnalysis = analyzeJsonStructure(obj[key], depth + 1);
          analysis.maxDepth = Math.max(analysis.maxDepth, childAnalysis.maxDepth);
          analysis.totalFields += childAnalysis.totalFields;
          analysis.complexFields += childAnalysis.complexFields;
          analysis.suggestions.push(...childAnalysis.suggestions);
        });
      }
    }
    
    if (analysis.maxDepth > 10) {
      analysis.suggestions.push('Estructura muy profunda - puede ser difícil de mapear');
    }
    
    return analysis;
  };
  
  // Generate mapping recommendations based on field names and values
  export const generateMappingRecommendations = (mappings) => {
    const recommendations = [];
    
    mappings.forEach(mapping => {
      const { jsonPath, variableName, sourceValue, dataType } = mapping;
      
      // Recommend better variable names
      if (jsonPath) {
        const pathParts = jsonPath.split('.');
        const lastPart = pathParts[pathParts.length - 1];
        
        // Suggest more descriptive names
        if (variableName === lastPart.replace(/[\[\]]/g, '')) {
          const suggestedName = pathParts.length > 1 
            ? `${pathParts[pathParts.length - 2]}_${lastPart}`.toLowerCase()
            : lastPart.toLowerCase();
            
          if (suggestedName !== variableName) {
            recommendations.push({
              type: 'naming',
              mapping: mapping.id,
              current: variableName,
              suggested: suggestedName,
              reason: 'Nombre más descriptivo basado en la estructura'
            });
          }
        }
      }
      
      // Recommend data type improvements
      if (typeof sourceValue === 'string' && dataType === 'string') {
        // Check for dates
        if (/^\d{4}-\d{2}-\d{2}/.test(sourceValue)) {
          recommendations.push({
            type: 'dataType',
            mapping: mapping.id,
            current: 'string',
            suggested: 'date',
            reason: 'Valor parece ser una fecha'
          });
        }
        
        // Check for numbers
        if (/^\d+(\.\d+)?$/.test(sourceValue)) {
          recommendations.push({
            type: 'dataType',
            mapping: mapping.id,
            current: 'string',
            suggested: 'number',
            reason: 'Valor parece ser numérico'
          });
        }
        
        // Check for booleans
        if (['true', 'false', 'yes', 'no', '1', '0'].includes(sourceValue.toLowerCase())) {
          recommendations.push({
            type: 'dataType',
            mapping: mapping.id,
            current: 'string',
            suggested: 'boolean',
            reason: 'Valor parece ser booleano'
          });
        }
      }
    });
    
    return recommendations;
  };