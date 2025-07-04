// src/components/layoutDesigner/hooks/useVariables.js - Hook para procesamiento de variables
import { useState, useCallback, useEffect, useMemo } from 'react';

export const useVariables = (availableData = {}) => {
  const [processedVariables, setProcessedVariables] = useState({});
  const [showValues, setShowValues] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // ✅ Función para verificar si un valor es primitivo
  const isPrimitiveValue = useCallback((value) => {
    const type = typeof value;
    return type === 'string' || type === 'number' || type === 'boolean' || value === null || value === undefined;
  }, []);

  // ✅ Función para procesar estructura JSON anidada y aplanarla con notación de punto
  const flattenObjectToDotNotation = useCallback((obj, prefix = '') => {
    const flattened = {};
    
    const processObject = (currentObj, currentPrefix) => {
      Object.entries(currentObj).forEach(([key, value]) => {
        const newKey = currentPrefix ? `${currentPrefix}.${key}` : key;
        
        if (value && typeof value === 'object' && !Array.isArray(value) && value.constructor === Object) {
          // Detectar si es un objeto con metadatos y extraer el valor
          const hasMetadataProps = Object.keys(value).some(k => 
            k === 'type' || k === 'value' || k === 'jsonPath' || k === 'source' || 
            k === 'displayValue' || k === 'actualValue' || k === 'isInsertable'
          );
          
          if (hasMetadataProps && value.hasOwnProperty('value') && isPrimitiveValue(value.value)) {
            // Extraer valor de metadatos
            flattened[newKey] = {
              displayValue: String(value.value),
              type: typeof value.value,
              actualValue: value.value,
              source: value.source || 'metadata'
            };
          } else if (!hasMetadataProps) {
            // Es un objeto normal, procesar recursivamente
            processObject(value, newKey);
          }
        } else if (Array.isArray(value)) {
          // Para arrays, mostrar info del array y procesar elementos
          flattened[newKey] = {
            displayValue: `Array[${value.length}]`,
            type: 'array',
            actualValue: value,
            source: 'array'
          };
          
          // Procesar elementos del array si son objetos
          value.forEach((item, index) => {
            const arrayKey = `${newKey}[${index}]`;
            if (isPrimitiveValue(item)) {
              flattened[arrayKey] = {
                displayValue: String(item),
                type: typeof item,
                actualValue: item,
                source: 'array_item'
              };
            } else if (typeof item === 'object' && item !== null) {
              processObject(item, arrayKey);
            }
          });
        } else if (isPrimitiveValue(value)) {
          // Es un valor primitivo directo
          flattened[newKey] = {
            displayValue: String(value),
            type: typeof value,
            actualValue: value,
            source: 'direct'
          };
        }
      });
    };
    
    processObject(obj, prefix);
    return flattened;
  }, [isPrimitiveValue]);

  // ✅ Función para convertir variables con guiones bajos a notación de punto
  const convertUnderscoresToDots = useCallback((variables) => {
    const converted = {};
    
    Object.entries(variables).forEach(([key, value]) => {
      const dotNotationKey = key.replace(/_/g, '.');
      
      if (isPrimitiveValue(value)) {
        converted[dotNotationKey] = {
          displayValue: String(value),
          type: typeof value,
          actualValue: value,
          source: 'underscore_converted'
        };
      } else if (typeof value === 'object' && value !== null) {
        // Si es un objeto, procesarlo
        const nestedConverted = flattenObjectToDotNotation(value, dotNotationKey);
        Object.assign(converted, nestedConverted);
      }
    });
    
    return converted;
  }, [isPrimitiveValue, flattenObjectToDotNotation]);

  // ✅ Función principal para procesar todas las variables
  const processAllVariables = useCallback((inputData) => {
    console.log('🔄 Processing variables:', inputData);
    setIsProcessing(true);
    
    try {
      let processed = {};
      
      // Si no hay datos, usar datos de ejemplo
      if (!inputData || Object.keys(inputData).length === 0) {
        const exampleData = {
          user_name: "Juan Pérez",
          user_age: 30,
          user_active: true,
          user: {
            id: 123,
            email: "juan@email.com",
            profile: {
              city: "Bogotá",
              country: "Colombia"
            }
          },
          orders: [
            { id: 1, total: 100.50, status: "completed" },
            { id: 2, total: 250.75, status: "pending" }
          ],
          company: {
            name: "Mi Empresa",
            address: {
              street: "Calle 123",
              city: "Bogotá",
              zipCode: "110111"
            }
          }
        };
        processed = flattenObjectToDotNotation(exampleData);
      } else {
        // Detectar el tipo de estructura de datos
        const hasUnderscores = Object.keys(inputData).some(key => key.includes('_'));
        const hasNestedObjects = Object.values(inputData).some(value => 
          typeof value === 'object' && value !== null && !Array.isArray(value)
        );
        
        if (hasUnderscores && !hasNestedObjects) {
          // Variables con guiones bajos (formato legacy)
          processed = convertUnderscoresToDots(inputData);
        } else if (hasNestedObjects) {
          // Estructura JSON anidada
          processed = flattenObjectToDotNotation(inputData);
        } else {
          // Estructura plana con notación de punto
          Object.entries(inputData).forEach(([key, value]) => {
            if (isPrimitiveValue(value)) {
              processed[key] = {
                displayValue: String(value),
                type: typeof value,
                actualValue: value,
                source: 'flat'
              };
            }
          });
        }
      }
      
      console.log('✅ Variables processed:', Object.keys(processed).length);
      return processed;
    } catch (error) {
      console.error('❌ Error processing variables:', error);
      return {};
    } finally {
      setIsProcessing(false);
    }
  }, [flattenObjectToDotNotation, convertUnderscoresToDots, isPrimitiveValue]);

  // ✅ Procesar variables cuando cambian los datos disponibles
  useEffect(() => {
    const processed = processAllVariables(availableData);
    setProcessedVariables(processed);
  }, [availableData, processAllVariables]);

  // ✅ Variables filtradas basadas en búsqueda
  const filteredVariables = useMemo(() => {
    if (!searchTerm.trim()) {
      return processedVariables;
    }
    
    const searchLower = searchTerm.toLowerCase();
    const filtered = {};
    
    Object.entries(processedVariables).forEach(([key, value]) => {
      // Buscar en el nombre de la variable
      if (key.toLowerCase().includes(searchLower)) {
        filtered[key] = value;
        return;
      }
      
      // Buscar en el valor si se muestran valores
      if (showValues && value.displayValue && 
          value.displayValue.toLowerCase().includes(searchLower)) {
        filtered[key] = value;
        return;
      }
      
      // Buscar por tipo
      if (value.type && value.type.toLowerCase().includes(searchLower)) {
        filtered[key] = value;
      }
    });
    
    return filtered;
  }, [processedVariables, searchTerm, showValues]);

  // ✅ Obtener variables por tipo
  const getVariablesByType = useCallback((type) => {
    const filtered = {};
    Object.entries(processedVariables).forEach(([key, value]) => {
      if (value.type === type) {
        filtered[key] = value;
      }
    });
    return filtered;
  }, [processedVariables]);

  // ✅ Obtener variables anidadas (que contienen puntos)
  const getNestedVariables = useCallback(() => {
    const nested = {};
    Object.entries(processedVariables).forEach(([key, value]) => {
      if (key.includes('.')) {
        nested[key] = value;
      }
    });
    return nested;
  }, [processedVariables]);

  // ✅ Obtener variables de nivel raíz (sin puntos)
  const getRootVariables = useCallback(() => {
    const root = {};
    Object.entries(processedVariables).forEach(([key, value]) => {
      if (!key.includes('.')) {
        root[key] = value;
      }
    });
    return root;
  }, [processedVariables]);

  // ✅ Procesar texto con variables (reemplazar variables por valores)
  const processTextWithVariables = useCallback((text) => {
    if (!text || typeof text !== 'string') return '';
    
    return text.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
      const trimmedName = variableName.trim();
      const variable = processedVariables[trimmedName];
      
      if (variable && variable.displayValue !== undefined) {
        return showValues ? variable.displayValue : match;
      }
      
      // Intentar con conversión de puntos a guiones bajos
      const underscoreVersion = trimmedName.replace(/\./g, '_');
      const underscoreVariable = processedVariables[underscoreVersion];
      
      if (underscoreVariable && underscoreVariable.displayValue !== undefined) {
        return showValues ? underscoreVariable.displayValue : match;
      }
      
      // Variable no encontrada
      return showValues ? `[${trimmedName}]` : match;
    });
  }, [processedVariables, showValues]);

  // ✅ Validar si una variable existe
  const validateVariable = useCallback((variableName) => {
    const trimmedName = variableName.trim();
    
    // Verificar existencia directa
    if (processedVariables[trimmedName]) {
      return {
        isValid: true,
        variable: processedVariables[trimmedName],
        suggestion: null
      };
    }
    
    // Verificar con conversión de puntos a guiones bajos
    const underscoreVersion = trimmedName.replace(/\./g, '_');
    if (processedVariables[underscoreVersion]) {
      return {
        isValid: true,
        variable: processedVariables[underscoreVersion],
        suggestion: underscoreVersion
      };
    }
    
    // Buscar sugerencias similares
    const suggestions = Object.keys(processedVariables).filter(key =>
      key.toLowerCase().includes(trimmedName.toLowerCase()) ||
      trimmedName.toLowerCase().includes(key.toLowerCase())
    ).slice(0, 3);
    
    return {
      isValid: false,
      variable: null,
      suggestions
    };
  }, [processedVariables]);

  // ✅ Obtener estructura jerárquica de variables
  const getVariableHierarchy = useCallback(() => {
    const hierarchy = {};
    
    Object.entries(processedVariables).forEach(([key, value]) => {
      const parts = key.split('.');
      let current = hierarchy;
      
      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          // Es la hoja final
          current[part] = {
            ...value,
            fullPath: key,
            isLeaf: true
          };
        } else {
          // Es un nodo intermedio
          if (!current[part]) {
            current[part] = {
              children: {},
              isLeaf: false,
              fullPath: parts.slice(0, index + 1).join('.')
            };
          }
          current = current[part].children || current[part];
        }
      });
    });
    
    return hierarchy;
  }, [processedVariables]);

  // ✅ Estadísticas de variables
  const getVariableStats = useCallback(() => {
    const stats = {
      total: Object.keys(processedVariables).length,
      filtered: Object.keys(filteredVariables).length,
      byType: {},
      bySource: {},
      nested: 0,
      root: 0
    };
    
    Object.values(processedVariables).forEach(variable => {
      // Por tipo
      stats.byType[variable.type] = (stats.byType[variable.type] || 0) + 1;
      
      // Por fuente
      stats.bySource[variable.source] = (stats.bySource[variable.source] || 0) + 1;
    });
    
    Object.keys(processedVariables).forEach(key => {
      if (key.includes('.')) {
        stats.nested++;
      } else {
        stats.root++;
      }
    });
    
    return stats;
  }, [processedVariables, filteredVariables]);

  // ✅ Toggles
  const toggleShowValues = useCallback(() => {
    setShowValues(prev => !prev);
  }, []);

  const updateSearchTerm = useCallback((term) => {
    setSearchTerm(term);
  }, []);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  // ✅ Refrescar variables
  const refreshVariables = useCallback(() => {
    const processed = processAllVariables(availableData);
    setProcessedVariables(processed);
  }, [availableData, processAllVariables]);

  return {
    // Estado
    processedVariables,
    filteredVariables,
    showValues,
    searchTerm,
    isProcessing,
    
    // Operaciones de filtrado
    getVariablesByType,
    getNestedVariables,
    getRootVariables,
    
    // Procesamiento de texto
    processTextWithVariables,
    validateVariable,
    
    // Estructura
    getVariableHierarchy,
    
    // Estadísticas
    getVariableStats,
    
    // Controles
    toggleShowValues,
    updateSearchTerm,
    clearSearch,
    refreshVariables,
    
    // Funciones de utilidad
    isPrimitiveValue,
    
    // Re-procesamiento manual
    processAllVariables
  };
};