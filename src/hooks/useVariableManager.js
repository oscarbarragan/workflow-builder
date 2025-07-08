// src/components/layoutDesigner/hooks/useVariableManager.js
import { useState, useCallback, useMemo } from 'react';
import { variableProcessor } from '../utils/variableProcessor';

export const useVariableManager = (availableVariables = {}) => {
  // ✅ Estado para mostrar/ocultar valores de variables
  const [showVariableValues, setShowVariableValues] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
    
    return variableProcessor.processAvailableVariables(availableVariables);
  }, [availableVariables]);

  // ✅ Variables filtradas por búsqueda
  const filteredVariables = useMemo(() => {
    if (!searchTerm.trim()) {
      return processedVariables;
    }
    
    return variableProcessor.searchVariables(processedVariables, searchTerm);
  }, [processedVariables, searchTerm]);

  // ✅ Resolver valor de variable
  const resolveVariableValue = useCallback((variableName) => {
    return variableProcessor.resolveVariableValue(variableName, processedVariables);
  }, [processedVariables]);

  // ✅ Reemplazar variables en texto
  const replaceVariablesInText = useCallback((text) => {
    return variableProcessor.replaceVariablesInText(text, processedVariables, showVariableValues);
  }, [processedVariables, showVariableValues]);

  // ✅ Validar nombre de variable
  const validateVariableName = useCallback((name) => {
    return variableProcessor.validateVariableName(name);
  }, []);

  // ✅ Obtener estadísticas de variables
  const getVariableStatistics = useCallback(() => {
    return variableProcessor.getVariableStatistics(processedVariables);
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