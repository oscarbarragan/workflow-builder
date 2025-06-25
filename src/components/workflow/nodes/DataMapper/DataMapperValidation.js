// src/components/workflow/nodes/DataMapper/DataMapperValidation.js
// Funciones de validación para Data Mapper

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