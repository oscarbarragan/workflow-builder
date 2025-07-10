// src/components/layoutDesigner/hooks/useVariableManager.js - VERSIÓN CORREGIDA
import { useState, useCallback, useMemo } from 'react';

export const useVariableManager = (availableVariables = {}) => {
  // ✅ Estado para mostrar/ocultar valores de variables
  const [showVariableValues, setShowVariableValues] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // ✅ Función para aplanar objeto anidado a notación de punto
  const flattenObject = useCallback((obj, prefix = '') => {
    const flattened = {};
    
    try {
      Object.entries(obj).forEach(([key, value]) => {
        const newKey = prefix ? `${prefix}.${key}` : key;
        
        if (value && typeof value === 'object' && !Array.isArray(value) && value.constructor === Object) {
          // Es un objeto anidado, seguir aplanando
          Object.assign(flattened, flattenObject(value, newKey));
        } else if (Array.isArray(value) && value.length > 0) {
          // Es un array, mostrar el primer elemento
          flattened[newKey] = {
            displayValue: `Array[${value.length}]`,
            type: 'array',
            actualValue: value
          };
          
          // Si el primer elemento es un objeto, mostrar sus propiedades
          if (value[0] && typeof value[0] === 'object') {
            Object.assign(flattened, flattenObject(value[0], `${newKey}[0]`));
          }
        } else {
          // Es un valor primitivo
          flattened[newKey] = {
            displayValue: String(value),
            type: typeof value,
            actualValue: value
          };
        }
      });
    } catch (error) {
      console.warn('Error processing variables:', error);
    }
    
    return flattened;
  }, []);

  // ✅ Procesar variables disponibles
  const processedVariables = useMemo(() => {
    console.log('🔄 Processing variables in useVariableManager:', availableVariables);
    
    if (!availableVariables || Object.keys(availableVariables).length === 0) {
      // Datos de ejemplo cuando no hay variables
      return {
        'user.name': { displayValue: 'Juan Pérez', type: 'string', actualValue: 'Juan Pérez' },
        'user.email': { displayValue: 'juan@email.com', type: 'string', actualValue: 'juan@email.com' },
        'user.age': { displayValue: '30', type: 'number', actualValue: 30 },
        'company.name': { displayValue: 'Mi Empresa', type: 'string', actualValue: 'Mi Empresa' },
        'company.address.city': { displayValue: 'Bogotá', type: 'string', actualValue: 'Bogotá' }
      };
    }
    
    return flattenObject(availableVariables);
  }, [availableVariables, flattenObject]);

  // ✅ Variables filtradas por búsqueda
  const filteredVariables = useMemo(() => {
    if (!searchTerm.trim()) {
      return processedVariables;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const filtered = {};
    
    Object.entries(processedVariables).forEach(([key, value]) => {
      if (key.toLowerCase().includes(searchLower)) {
        filtered[key] = value;
      }
    });
    
    return filtered;
  }, [processedVariables, searchTerm]);

  // ✅ Resolver valor de variable
  const resolveVariableValue = useCallback((variableName) => {
    if (!variableName || !processedVariables) return null;
    
    // Probar con notación de punto
    if (processedVariables[variableName]) {
      return processedVariables[variableName];
    }
    
    // Probar con guiones bajos
    const underscoreVersion = variableName.replace(/\./g, '_');
    if (processedVariables[underscoreVersion]) {
      return processedVariables[underscoreVersion];
    }
    
    return null;
  }, [processedVariables]);

  // ✅ Reemplazar variables en texto
  const replaceVariablesInText = useCallback((text) => {
    if (!text) return '';
    
    if (!showVariableValues) return text;
    
    return text.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
      const trimmedName = variableName.trim();
      const value = resolveVariableValue(trimmedName);
      
      if (value !== null) {
        if (typeof value === 'object' && value !== null && value.displayValue !== undefined) {
          return String(value.displayValue);
        }
        return String(value);
      }
      
      return `[${trimmedName}]`;
    });
  }, [showVariableValues, resolveVariableValue]);

  // ✅ Validar nombre de variable
  const validateVariableName = useCallback((name) => {
    if (!name || typeof name !== 'string') return false;
    
    // Permitir letras, números, puntos, guiones bajos y corchetes
    const pattern = /^[a-zA-Z][a-zA-Z0-9_.[\]]*$/;
    return pattern.test(name);
  }, []);

  // ✅ Obtener estadísticas de variables
  const getVariableStatistics = useCallback(() => {
    const stats = {
      total: 0,
      byType: {
        string: 0,
        number: 0,
        boolean: 0,
        array: 0,
        object: 0
      },
      nested: 0,
      primitive: 0
    };

    Object.entries(processedVariables).forEach(([key, value]) => {
      stats.total++;
      
      if (key.includes('.') || key.includes('[')) {
        stats.nested++;
      } else {
        stats.primitive++;
      }
      
      const valueType = typeof value;
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          stats.byType.array++;
        } else if (value.type) {
          const detectedType = value.type;
          if (stats.byType[detectedType] !== undefined) {
            stats.byType[detectedType]++;
          } else {
            stats.byType.object++;
          }
        } else {
          stats.byType.object++;
        }
      } else {
        if (stats.byType[valueType] !== undefined) {
          stats.byType[valueType]++;
        }
      }
    });

    return stats;
  }, [processedVariables]);

  // ✅ Obtener lista de variables como array para componentes
  const getVariablesList = useCallback(() => {
    return Object.entries(filteredVariables).map(([key, value]) => ({
      name: key,
      displayValue: value.displayValue,
      type: value.type,
      actualValue: value.actualValue
    }));
  }, [filteredVariables]);

  // ✅ Verificar si una variable existe
  const variableExists = useCallback((variableName) => {
    return processedVariables.hasOwnProperty(variableName);
  }, [processedVariables]);

  // ✅ Obtener sugerencias de variables basadas en texto parcial
  const getVariableSuggestions = useCallback((partialName, limit = 10) => {
    const suggestions = Object.keys(processedVariables)
      .filter(name => name.toLowerCase().includes(partialName.toLowerCase()))
      .slice(0, limit)
      .map(name => ({
        name,
        displayValue: processedVariables[name].displayValue,
        type: processedVariables[name].type
      }));
    
    return suggestions;
  }, [processedVariables]);

  // ✅ Formatear variable para mostrar en UI
  const formatVariableForDisplay = useCallback((variableName) => {
    const variable = processedVariables[variableName];
    if (!variable) {
      return `{{${variableName}}}`;
    }
    
    if (showVariableValues) {
      return String(variable.displayValue);
    }
    
    return `{{${variableName}}}`;
  }, [processedVariables, showVariableValues]);

  return {
    // Estado
    showVariableValues,
    setShowVariableValues,
    searchTerm,
    setSearchTerm,
    
    // Variables procesadas
    processedVariables,
    filteredVariables,
    
    // Funciones de utilidad
    resolveVariableValue,
    replaceVariablesInText,
    validateVariableName,
    getVariableStatistics,
    getVariablesList,
    variableExists,
    getVariableSuggestions,
    formatVariableForDisplay,
    
    // Estadísticas
    stats: {
      total: Object.keys(processedVariables).length,
      filtered: Object.keys(filteredVariables).length,
      hasVariables: Object.keys(processedVariables).length > 0
    }
  };
};