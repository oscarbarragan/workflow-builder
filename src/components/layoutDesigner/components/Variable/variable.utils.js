// src/components/layoutDesigner/components/Variable/variable.utils.js
export const variableUtils = {
    // Formatear nombre de variable para mostrar
    formatVariableName: (variableName) => {
      if (!variableName) return 'variable';
      return variableName.replace(/_/g, '.');
    },
  
    // Obtener valor de variable
    getVariableValue: (variableName, availableVariables) => {
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
  
    // Validar nombre de variable
    validateVariableName: (variableName) => {
      if (!variableName) return false;
      
      // Permitir letras, números, puntos y guiones bajos
      const pattern = /^[a-zA-Z][a-zA-Z0-9_.[\]]*$/;
      return pattern.test(variableName);
    },
  
    // Procesar variables disponibles para el selector
    processAvailableVariables: (availableVariables) => {
      const processed = [];
      
      Object.entries(availableVariables).forEach(([key, value]) => {
        // Convertir guiones bajos a puntos
        const dotNotationKey = key.replace(/_/g, '.');
        
        let displayValue = '';
        let type = typeof value;
        
        if (typeof value === 'object' && value !== null) {
          if (value.displayValue !== undefined) {
            displayValue = String(value.displayValue);
            type = value.type || 'object';
          } else if (Array.isArray(value)) {
            displayValue = `Array[${value.length}]`;
            type = 'array';
          } else {
            displayValue = 'Object';
            type = 'object';
          }
        } else {
          displayValue = String(value || '');
        }
        
        // Truncar valores largos
        if (displayValue.length > 30) {
          displayValue = displayValue.substring(0, 30) + '...';
        }
        
        processed.push({
          key: dotNotationKey,
          originalKey: key,
          value: value,
          displayValue: displayValue,
          type: type
        });
      });
      
      // Ordenar por nombre
      return processed.sort((a, b) => a.key.localeCompare(b.key));
    },
  
    // Obtener contenido a mostrar
    getDisplayContent: (element, availableVariables, showVariableValues) => {
      const variableName = element.variable || 'variable';
      const formattedName = variableUtils.formatVariableName(variableName);
      
      if (showVariableValues) {
        const value = variableUtils.getVariableValue(variableName, availableVariables);
        if (value !== null) {
          let displayValue = '';
          
          if (typeof value === 'object' && value !== null) {
            if (value.displayValue !== undefined) {
              displayValue = String(value.displayValue);
            } else if (Array.isArray(value)) {
              displayValue = `Array[${value.length}]`;
            } else {
              displayValue = 'Object';
            }
          } else {
            displayValue = String(value);
          }
          
          // Truncar si es muy largo
          if (displayValue.length > 20) {
            displayValue = displayValue.substring(0, 20) + '...';
          }
          
          return displayValue;
        }
        return `[${formattedName}]`;
      }
      
      return `{{${formattedName}}}`;
    },
  
    // Verificar si la variable existe
    variableExists: (variableName, availableVariables) => {
      return variableUtils.getVariableValue(variableName, availableVariables) !== null;
    }
  };