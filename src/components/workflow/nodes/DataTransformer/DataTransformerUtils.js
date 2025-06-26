// src/components/workflow/nodes/DataTransformer/DataTransformerUtils.js
// Utilidades y validaciones para el Data Transformer

export const validateDataTransformerConfig = (properties) => {
    const errors = [];
    const warnings = [];
    
    if (!properties || typeof properties !== 'object') {
      errors.push('Configuración inválida');
      return { isValid: false, errors, warnings };
    }
    
    if (!properties.transformations || !Array.isArray(properties.transformations)) {
      errors.push('No hay transformaciones configuradas');
      return { isValid: false, errors, warnings };
    }
    
    const enabledTransformations = properties.transformations.filter(t => t.enabled);
    
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
      
      // Check for duplicate output variable names
      const duplicates = enabledTransformations.filter(t => 
        t.outputVariable === transformation.outputVariable && t.id !== transformation.id
      );
      if (duplicates.length > 0) {
        warnings.push(`Variable de salida duplicada: ${transformation.outputVariable}`);
      }
    });
    
    // Check output variables
    if (!properties.outputVariables || Object.keys(properties.outputVariables).length === 0) {
      warnings.push('No se han generado variables de salida - ejecuta las transformaciones');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };
  
  // Generate Data Transformer documentation
  export const generateDataTransformerDoc = (properties) => {
    const enabledTransformations = properties.transformations?.filter(t => t.enabled) || [];
    
    return {
      title: 'Data Transformer Configuration',
      overview: {
        purpose: 'Apply data transformations based on data types',
        totalTransformations: properties.transformations?.length || 0,
        enabledTransformations: enabledTransformations.length,
        outputVariables: Object.keys(properties.outputVariables || {}).length
      },
      
      transformations: enabledTransformations.map(transform => ({
        input: transform.inputVariable,
        output: transform.outputVariable,
        type: transform.transformationType,
        dataType: transform.dataType,
        config: transform.transformationConfig,
        description: getTransformationDescription(transform)
      })),
      
      outputVariables: Object.entries(properties.outputVariables || {}).map(([key, value]) => ({
        name: key,
        type: value.type,
        originalVariable: value.inputVariable,
        transformationType: value.transformationType,
        value: value.value
      })),
      
      statistics: {
        dataTypes: getDataTypeStatistics(enabledTransformations),
        transformationTypes: getTransformationTypeStatistics(enabledTransformations),
        validTransformations: enabledTransformations.filter(t => t.isValid).length,
        invalidTransformations: enabledTransformations.filter(t => !t.isValid).length
      },
      
      usage: {
        prefix: 'transformer.',
        examples: Object.keys(properties.outputVariables || {}).slice(0, 5).map(key => `transformer.${key}`),
        totalAvailable: Object.keys(properties.outputVariables || {}).length
      }
    };
  };
  
  // Helper functions
  const getTransformationDescription = (transformation) => {
    const descriptions = {
      uppercase: 'Convert text to uppercase',
      lowercase: 'Convert text to lowercase',
      capitalize: 'Capitalize first letter',
      title_case: 'Convert to title case',
      trim: 'Remove leading/trailing spaces',
      round: 'Round number to specified decimals',
      add: 'Add specified value',
      subtract: 'Subtract specified value',
      multiply: 'Multiply by specified value',
      divide: 'Divide by specified value',
      format_currency: 'Format as currency',
      format_date: 'Format date string',
      negate: 'Negate boolean value',
      to_text: 'Convert boolean to text',
      length: 'Get array length',
      join: 'Join array elements',
      extract_domain: 'Extract domain from email/URL'
    };
    
    return descriptions[transformation.transformationType] || `Apply ${transformation.transformationType} transformation`;
  };
  
  const getDataTypeStatistics = (transformations) => {
    return transformations.reduce((acc, transform) => {
      acc[transform.dataType] = (acc[transform.dataType] || 0) + 1;
      return acc;
    }, {});
  };
  
  const getTransformationTypeStatistics = (transformations) => {
    return transformations.reduce((acc, transform) => {
      acc[transform.transformationType] = (acc[transform.transformationType] || 0) + 1;
      return acc;
    }, {});
  };
  
  // Generate execution summary
  export const generateExecutionSummary = (transformations, outputVariables, executionResult) => {
    const enabledTransformations = transformations.filter(t => t.enabled);
    const successfulTransformations = Object.keys(executionResult || {}).length;
    
    return {
      totalTransformations: transformations.length,
      enabledTransformations: enabledTransformations.length,
      executedTransformations: successfulTransformations,
      successRate: enabledTransformations.length > 0 
        ? Math.round((successfulTransformations / enabledTransformations.length) * 100) 
        : 0,
      outputVariables: Object.keys(outputVariables).length,
      executionTime: new Date().toISOString(),
      
      byDataType: enabledTransformations.reduce((acc, transform) => {
        if (!acc[transform.dataType]) {
          acc[transform.dataType] = {
            total: 0,
            successful: 0
          };
        }
        acc[transform.dataType].total++;
        if (executionResult && executionResult[transform.outputVariable] !== undefined) {
          acc[transform.dataType].successful++;
        }
        return acc;
      }, {}),
      
      byTransformationType: enabledTransformations.reduce((acc, transform) => {
        if (!acc[transform.transformationType]) {
          acc[transform.transformationType] = {
            total: 0,
            successful: 0
          };
        }
        acc[transform.transformationType].total++;
        if (executionResult && executionResult[transform.outputVariable] !== undefined) {
          acc[transform.transformationType].successful++;
        }
        return acc;
      }, {})
    };
  };
  
  // Data type inference utility
  export const inferDataType = (value) => {
    if (value === null || value === undefined) return 'string';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'string') {
      // Email detection
      if (/^[\w\.-]+@[\w\.-]+\.\w+$/.test(value)) return 'email';
      // URL detection
      if (/^https?:\/\//.test(value)) return 'url';
      // Date detection
      if (/^\d{4}-\d{2}-\d{2}/.test(value)) return 'date';
      return 'string';
    }
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return 'string';
  };
  
  // Create optimized transformation suggestions
  export const generateTransformationSuggestions = (availableData) => {
    const suggestions = [];
    
    Object.entries(availableData).forEach(([key, value]) => {
      const dataType = inferDataType(value);
      const commonTransformations = getCommonTransformationsForType(dataType);
      
      commonTransformations.forEach(transformationType => {
        suggestions.push({
          inputVariable: key,
          outputVariable: `${key}_${transformationType}`,
          dataType,
          transformationType,
          priority: getTransformationPriority(dataType, transformationType, value),
          reason: getTransformationReason(dataType, transformationType, value)
        });
      });
    });
    
    // Sort by priority and return top suggestions
    return suggestions
      .sort((a, b) => b.priority - a.priority)
      .slice(0, 10);
  };
  
  const getCommonTransformationsForType = (dataType) => {
    const commonTransformations = {
      string: ['uppercase', 'lowercase', 'trim', 'capitalize'],
      number: ['round', 'format_number', 'format_currency'],
      boolean: ['to_text', 'negate'],
      date: ['format_date', 'get_year', 'get_month'],
      array: ['length', 'join', 'first', 'last'],
      email: ['extract_username', 'extract_domain', 'lowercase'],
      url: ['extract_domain', 'extract_path']
    };
    
    return commonTransformations[dataType] || ['none'];
  };
  
  const getTransformationPriority = (dataType, transformationType, value) => {
    // Base priority by data type
    const basePriority = {
      string: 5,
      number: 4,
      boolean: 3,
      date: 4,
      array: 3,
      email: 6,
      url: 5
    };
    
    let priority = basePriority[dataType] || 1;
    
    // Boost priority for common transformations
    const highPriorityTransformations = {
      string: ['lowercase', 'trim'],
      number: ['round', 'format_number'],
      email: ['lowercase', 'extract_domain'],
      url: ['extract_domain']
    };
    
    if (highPriorityTransformations[dataType]?.includes(transformationType)) {
      priority += 2;
    }
    
    // Boost based on value characteristics
    if (typeof value === 'string') {
      if (value !== value.toLowerCase() && transformationType === 'lowercase') priority += 3;
      if (value !== value.trim() && transformationType === 'trim') priority += 3;
      if (/[A-Z]/.test(value) && transformationType === 'capitalize') priority += 2;
    }
    
    return priority;
  };
  
  const getTransformationReason = (dataType, transformationType, value) => {
    const reasons = {
      lowercase: 'Normalizar texto a minúsculas',
      uppercase: 'Convertir a mayúsculas para consistencia',
      trim: 'Eliminar espacios innecesarios',
      capitalize: 'Mejorar formato de presentación',
      round: 'Simplificar números decimales',
      format_currency: 'Mostrar como moneda',
      format_number: 'Mejorar legibilidad de números',
      to_text: 'Convertir a texto legible',
      extract_domain: 'Obtener dominio para análisis',
      extract_username: 'Separar usuario del email',
      length: 'Contar elementos del array',
      join: 'Convertir array a texto'
    };
    
    return reasons[transformationType] || `Aplicar transformación ${transformationType}`;
  };
  
  // Performance optimization utilities
  export const optimizeTransformations = (transformations) => {
    const optimized = [...transformations];
    const optimizations = [];
    
    // Check for redundant transformations
    optimized.forEach((transform, index) => {
      const redundant = optimized.find((other, otherIndex) => 
        otherIndex !== index &&
        other.inputVariable === transform.inputVariable &&
        other.transformationType === transform.transformationType &&
        JSON.stringify(other.transformationConfig) === JSON.stringify(transform.transformationConfig)
      );
      
      if (redundant) {
        optimizations.push({
          type: 'redundant',
          message: `Transformación duplicada: ${transform.inputVariable} → ${transform.transformationType}`,
          suggestion: 'Eliminar una de las transformaciones duplicadas'
        });
      }
    });
    
    // Check for conflicting output variables
    const outputVariables = {};
    optimized.forEach(transform => {
      if (outputVariables[transform.outputVariable]) {
        optimizations.push({
          type: 'conflict',
          message: `Variable de salida duplicada: ${transform.outputVariable}`,
          suggestion: 'Usar nombres únicos para variables de salida'
        });
      }
      outputVariables[transform.outputVariable] = true;
    });
    
    // Suggest transformation chains
    optimized.forEach(transform => {
      if (transform.dataType === 'string' && transform.transformationType === 'uppercase') {
        const trimTransform = optimized.find(t => 
          t.inputVariable === transform.inputVariable && 
          t.transformationType === 'trim'
        );
        
        if (!trimTransform) {
          optimizations.push({
            type: 'suggestion',
            message: `Considera agregar trim antes de uppercase para: ${transform.inputVariable}`,
            suggestion: 'Agregar transformación trim para mejor resultado'
          });
        }
      }
    });
    
    return {
      optimizedTransformations: optimized,
      optimizations
    };
  };
  
  // Export utility for other components
  export const createDataTransformerExport = (properties) => {
    return {
      nodeType: 'data-transformer',
      version: '1.0',
      configuration: properties,
      documentation: generateDataTransformerDoc(properties),
      exportedAt: new Date().toISOString(),
      
      // Include transformation definitions for import
      transformationDefinitions: {
        enabledCount: properties.transformations?.filter(t => t.enabled).length || 0,
        totalCount: properties.transformations?.length || 0,
        outputVariablesCount: Object.keys(properties.outputVariables || {}).length
      }
    };
  };