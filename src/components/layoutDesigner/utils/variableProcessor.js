// src/components/layoutDesigner/utils/variableProcessor.js - SIMPLIFICADO
export const variableProcessor = {
  // Convertir estructura anidada a notación de punto
  flattenToDotNotation: (obj, prefix = '') => {
    const flattened = {};
    
    Object.entries(obj).forEach(([key, value]) => {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value) && value.constructor === Object) {
        // Es un objeto anidado, seguir aplanando
        Object.assign(flattened, variableProcessor.flattenToDotNotation(value, newKey));
      } else if (Array.isArray(value) && value.length > 0) {
        // Es un array, mostrar el primer elemento y longitud
        flattened[newKey] = {
          displayValue: `Array[${value.length}]`,
          type: 'array',
          actualValue: value
        };
        
        // Si el primer elemento es un objeto, mostrar sus propiedades
        if (value[0] && typeof value[0] === 'object') {
          Object.assign(flattened, variableProcessor.flattenToDotNotation(value[0], `${newKey}[0]`));
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
    
    return flattened;
  },

  // Procesar variables disponibles para componentes
  processAvailableVariables: (availableVariables) => {
    console.log('🔄 Processing available variables:', availableVariables);
    
    // Si no hay variables, usar datos de ejemplo
    let dataToProcess = availableVariables;
    if (!availableVariables || Object.keys(availableVariables).length === 0) {
      dataToProcess = {
        user_name: "Juan Pérez",
        user_age: 30,
        user: {
          id: 123,
          email: "juan@email.com",
          active: true
        },
        orders: [
          { id: 1, total: 100.50 },
          { id: 2, total: 250.75 }
        ],
        company: {
          name: "Mi Empresa",
          address: {
            city: "Bogotá"
          }
        }
      };
    }
    
    // Aplanar y formatear
    const flattened = variableProcessor.flattenToDotNotation(dataToProcess);
    
    console.log('✅ Processed variables:', flattened);
    return flattened;
  },

  // Buscar variables por término
  searchVariables: (variables, searchTerm) => {
    if (!searchTerm.trim()) {
      return variables;
    }
    
    const filtered = {};
    const searchLower = searchTerm.toLowerCase();
    
    Object.entries(variables).forEach(([key, value]) => {
      if (key.toLowerCase().includes(searchLower)) {
        filtered[key] = value;
      }
    });
    
    return filtered;
  },

  // Validar nombre de variable
  validateVariableName: (name) => {
    if (!name) return false;
    
    // Permitir letras, números, puntos, guiones bajos y corchetes
    const pattern = /^[a-zA-Z][a-zA-Z0-9_.[\]]*$/;
    return pattern.test(name);
  },

  // Resolver valor de variable
  resolveVariableValue: (variableName, availableVariables) => {
    if (!variableName || !availableVariables) return null;
    
    // Probar con notación de punto
    if (availableVariables[variableName]) {
      return availableVariables[variableName];
    }
    
    // Probar con guiones bajos
    const underscoreVersion = variableName.replace(/\./g, '_');
    if (availableVariables[underscoreVersion]) {
      return availableVariables[underscoreVersion];
    }
    
    return null;
  },

  // Reemplazar variables en texto
  replaceVariablesInText: (text, availableVariables, showValues = false) => {
    if (!text) return '';
    
    if (!showValues) return text;
    
    return text.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
      const trimmedName = variableName.trim();
      const value = variableProcessor.resolveVariableValue(trimmedName, availableVariables);
      
      if (value !== null) {
        if (typeof value === 'object' && value !== null && value.displayValue !== undefined) {
          return String(value.displayValue);
        }
        return String(value);
      }
      
      return `[${trimmedName}]`;
    });
  },

  // Obtener estadísticas de variables
  getVariableStatistics: (variables) => {
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

    Object.entries(variables).forEach(([key, value]) => {
      stats.total++;
      
      if (key.includes('.') || key.includes('[')) {
        stats.nested++;
      } else {
        stats.primitive++;
      }
      
      let type = typeof value;
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          type = 'array';
        } else if (value.type) {
          type = value.type;
        } else {
          type = 'object';
        }
      }
      
      if (stats.byType[type] !== undefined) {
        stats.byType[type]++;
      }
    });

    return stats;
  }
};