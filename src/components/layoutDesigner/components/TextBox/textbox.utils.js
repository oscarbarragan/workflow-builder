// src/components/layoutDesigner/components/TextBox/textbox.utils.js
export const textBoxUtils = {
    // Verificar si un valor es primitivo
    isPrimitiveValue: (value) => {
      const type = typeof value;
      return type === 'string' || type === 'number' || type === 'boolean' || value === null || value === undefined;
    },
  
    // Procesar variables con notación de punto
    processVariablesWithDotNotation: (variables) => {
      const result = {};
      
      const addOnlyDirectPrimitives = (obj, parentKey = '') => {
        Object.entries(obj).forEach(([key, value]) => {
          const fullKey = parentKey ? `${parentKey}.${key}` : key;
          const cleanKey = fullKey.replace(/_/g, '.');
          
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            const hasMetadataProps = Object.keys(value).some(k => 
              k === 'type' || k === 'value' || k === 'jsonPath' || k === 'source' || 
              k === 'displayValue' || k === 'actualValue' || k === 'isInsertable'
            );
            
            if (hasMetadataProps) {
              if (value.hasOwnProperty('value') && textBoxUtils.isPrimitiveValue(value.value)) {
                result[cleanKey] = value.value;
              }
              return;
            } else {
              addOnlyDirectPrimitives(value, cleanKey);
            }
          } else if (Array.isArray(value)) {
            value.forEach((item, index) => {
              const arrayKey = `${cleanKey}[${index}]`;
              if (textBoxUtils.isPrimitiveValue(item)) {
                result[arrayKey] = item;
              } else if (typeof item === 'object' && item !== null) {
                addOnlyDirectPrimitives(item, arrayKey);
              }
            });
          } else if (textBoxUtils.isPrimitiveValue(value)) {
            result[cleanKey] = value;
          }
        });
      };
      
      addOnlyDirectPrimitives(variables);
      return result;
    },
  
    // Procesar texto con variables
    processTextWithVariables: (text, processedVariables, showVariableValues, availableVariables) => {
      if (!text) return '';
      
      if (showVariableValues) {
        return text.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
          const trimmedName = variableName.trim();
          const variable = processedVariables[trimmedName];
          
          if (variable !== undefined) {
            if (typeof variable === 'object' && variable !== null && variable.displayValue !== undefined) {
              return String(variable.displayValue);
            }
            return String(variable);
          }
          
          const underscoreVersion = trimmedName.replace(/\./g, '_');
          const underscoreVariable = availableVariables[underscoreVersion];
          if (underscoreVariable !== undefined) {
            return String(underscoreVariable);
          }
          
          return `[${trimmedName}]`;
        });
      }
      
      return text;
    },
  
    // Parsear partes del texto con variables
    parseTextParts: (text, processedVariables) => {
      if (!text.includes('{{') || !text.includes('}}')) {
        return [{ type: 'text', content: text || 'Doble click para editar' }];
      }
      
      const parts = [];
      let lastIndex = 0;
      const variableRegex = /\{\{([^}]+)\}\}/g;
      let match;
  
      while ((match = variableRegex.exec(text)) !== null) {
        if (match.index > lastIndex) {
          parts.push({
            type: 'text',
            content: text.slice(lastIndex, match.index)
          });
        }
        
        const variableName = match[1].trim();
        const isValidVariable = processedVariables.hasOwnProperty(variableName);
        
        parts.push({
          type: 'variable',
          content: match[0],
          variableName: variableName,
          isValid: isValidVariable
        });
        
        lastIndex = match.index + match[0].length;
      }
      
      if (lastIndex < text.length) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex)
        });
      }
  
      return parts;
    },
  
    // Validar variable
    validateVariable: (variableName, processedVariables) => {
      return processedVariables.hasOwnProperty(variableName);
    },
  
    // Insertar variable en texto
    insertVariableInText: (currentText, cursorPosition, variableName) => {
      const cleanVariableName = String(variableName).trim();
      const variableText = `{{${cleanVariableName}}}`;
      
      const newText = currentText.substring(0, cursorPosition) + 
                     variableText + 
                     currentText.substring(cursorPosition);
      
      const newCursorPosition = cursorPosition + variableText.length;
      
      return {
        newText,
        newCursorPosition
      };
    },
  
    // Formatear variables para el menú
    formatVariablesForMenu: (processedVariables) => {
      const formatted = {};
      
      Object.entries(processedVariables).forEach(([key, value]) => {
        formatted[key] = {
          displayValue: String(value),
          type: typeof value,
          actualValue: value
        };
      });
      
      return formatted;
    }
  };