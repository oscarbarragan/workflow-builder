// src/components/layout-designer/elements/EnhancedTextElement.jsx - LIMPIO SIN DUPLICADOS
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { EXTENDED_ELEMENT_TYPES } from '../../../utils/StyleManager';
import { styleManager } from '../../../utils/StyleManager';

const EnhancedTextElement = ({ 
  element, 
  isSelected, 
  isDragging,
  isResizing,
  onMouseDown,
  onResizeStart,
  onDoubleClick,
  onTextChange,
  availableVariables = {},
  showVariableValues = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [showVariableMenu, setShowVariableMenu] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [variableMenuPosition, setVariableMenuPosition] = useState({ x: 0, y: 0 });
  const [showTooltip, setShowTooltip] = useState(false);
  const [searchTerm, setSearchTerm] = useState(''); // ✅ NUEVO: Estado para búsqueda
  const textareaRef = useRef(null);
  const elementRef = useRef(null);
  const variableMenuRef = useRef(null);
  const searchInputRef = useRef(null); // ✅ NUEVO: Ref para input de búsqueda

  // ✅ FUNCIÓN SIMPLE: Verificar si un valor es primitivo
  const isPrimitiveValue = (value) => {
    const type = typeof value;
    return type === 'string' || type === 'number' || type === 'boolean' || value === null || value === undefined;
  };

  // ✅ SOLUCIÓN ULTRA SIMPLE: Solo procesar valores directos, ignorar metadatos
  const processVariablesWithDotNotation = (variables) => {
    const result = {};
    
    console.log('🎯 ULTRA SIMPLE: Input variables:', variables);
    
    // ✅ FUNCIÓN SIMPLE: Solo agrega si es realmente un valor primitivo directo
    const addOnlyDirectPrimitives = (obj, parentKey = '') => {
      Object.entries(obj).forEach(([key, value]) => {
        const fullKey = parentKey ? `${parentKey}.${key}` : key;
        const cleanKey = fullKey.replace(/_/g, '.');
        
        // ✅ CRÍTICO: Detectar si el objeto tiene metadatos y SALTARLO COMPLETAMENTE
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // Si el objeto tiene propiedades como 'type', 'value', 'jsonPath', etc., lo ignoramos
          const hasMetadataProps = Object.keys(value).some(k => 
            k === 'type' || k === 'value' || k === 'jsonPath' || k === 'source' || 
            k === 'displayValue' || k === 'actualValue' || k === 'isInsertable'
          );
          
          if (hasMetadataProps) {
            console.log(`🚫 SKIPPING object with metadata: ${cleanKey}`, Object.keys(value));
            // ✅ Si tiene 'value' y es primitivo, usar ese valor
            if (value.hasOwnProperty('value') && (typeof value.value === 'string' || typeof value.value === 'number' || typeof value.value === 'boolean')) {
              result[cleanKey] = value.value;
              console.log(`✅ EXTRACTED value from metadata object: ${cleanKey} = ${value.value}`);
            }
            return; // NO procesar las propiedades del objeto
          } else {
            // Es un objeto normal, procesar sus propiedades
            console.log(`📁 Processing normal object: ${cleanKey}`);
            addOnlyDirectPrimitives(value, cleanKey);
          }
        } else if (Array.isArray(value)) {
          // Para arrays, procesar elementos
          value.forEach((item, index) => {
            const arrayKey = `${cleanKey}[${index}]`;
            if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean' || item === null) {
              result[arrayKey] = item;
              console.log(`✅ ADDED array primitive: ${arrayKey} = ${item}`);
            } else if (typeof item === 'object' && item !== null) {
              addOnlyDirectPrimitives(item, arrayKey);
            }
          });
        } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' || value === null || value === undefined) {
          // Es un valor primitivo directo
          result[cleanKey] = value;
          console.log(`✅ ADDED direct primitive: ${cleanKey} = ${value}`);
        }
      });
    };
    
    addOnlyDirectPrimitives(variables);
    
    console.log('🎯 ULTRA SIMPLE: Final result:', result);
    return result;
  };

  // ✅ Variables procesadas MUY SIMPLES
  const processedVariables = React.useMemo(() => {
    console.log('🎯 ULTRA SIMPLE: Processing variables for text element:', availableVariables);
    
    // Datos de ejemplo sin metadatos confusos
    let dataToProcess = availableVariables;
    if (Object.keys(availableVariables).length === 0) {
      console.log('⚠️ Using ultra simple example data');
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
    
    const processed = processVariablesWithDotNotation(dataToProcess);
    
    // ✅ Convertir a formato simple para el componente
    const formatted = {};
    Object.entries(processed).forEach(([key, value]) => {
      formatted[key] = {
        displayValue: String(value),
        type: typeof value,
        actualValue: value
      };
    });
    
    console.log('🎯 ULTRA SIMPLE: Final formatted:', formatted);
    return formatted;
  }, [availableVariables]);

  // ✅ FILTRADO SIMPLE DEFINITIVO
  const filteredVariables = React.useMemo(() => {
    console.log('🎯 DEFINITIVA: Filtering variables');
    
    if (!searchTerm.trim()) {
      return processedVariables;
    }
    
    const filtered = {};
    const searchLower = searchTerm.toLowerCase();
    
    Object.entries(processedVariables).forEach(([key, value]) => {
      // ✅ Buscar solo en el nombre de la variable
      if (key.toLowerCase().includes(searchLower)) {
        filtered[key] = value;
      }
    });
    
    return filtered;
  }, [processedVariables, searchTerm]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, [isEditing, cursorPosition]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (variableMenuRef.current && !variableMenuRef.current.contains(event.target)) {
        setShowVariableMenu(false);
      }
    };

    if (showVariableMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showVariableMenu]);

  const getAppliedStyles = () => {
    const appliedStyles = {
      textStyle: {},
      paragraphStyle: {},
      borderStyle: {},
      fillStyle: {}
    };

    if (element.textStyleId) {
      const textStyle = styleManager.getTextStyle(element.textStyleId);
      if (textStyle) {
        appliedStyles.textStyle = { ...textStyle };
      }
    }

    if (element.paragraphStyleId) {
      const paragraphStyle = styleManager.getParagraphStyle(element.paragraphStyleId);
      if (paragraphStyle) {
        appliedStyles.paragraphStyle = { ...paragraphStyle };
      }
    }

    if (element.borderStyleId) {
      const borderStyle = styleManager.getBorderStyle(element.borderStyleId);
      if (borderStyle) {
        appliedStyles.borderStyle = { ...borderStyle };
      }
    }

    if (element.fillStyleId) {
      const fillStyle = styleManager.getFillStyle(element.fillStyleId);
      if (fillStyle) {
        appliedStyles.fillStyle = { ...fillStyle };
      }
    }

    return {
      textStyle: { ...appliedStyles.textStyle, ...(element.textStyle || {}) },
      paragraphStyle: { ...appliedStyles.paragraphStyle, ...(element.paragraphStyle || {}) },
      borderStyle: { ...appliedStyles.borderStyle, ...(element.borderStyle || {}) },
      fillStyle: { ...appliedStyles.fillStyle, ...(element.fillStyle || {}) }
    };
  };

  const getFinalStyles = () => {
    const styles = getAppliedStyles();
    const { textStyle, paragraphStyle, borderStyle, fillStyle } = styles;
    
    return {
      fontFamily: textStyle.fontFamily || 'Arial, sans-serif',
      fontSize: `${textStyle.fontSize || 14}px`,
      fontWeight: textStyle.bold ? 'bold' : (textStyle.fontWeight || 'normal'),
      fontStyle: textStyle.italic ? 'italic' : 'normal',
      textDecoration: [
        textStyle.underline ? 'underline' : '',
        textStyle.strikethrough ? 'line-through' : ''
      ].filter(Boolean).join(' ') || 'none',
      color: textStyle.color || '#000000',
      textAlign: paragraphStyle.alignment || 'left',
      lineHeight: paragraphStyle.lineHeight || '1.4',
      letterSpacing: paragraphStyle.letterSpacing ? `${paragraphStyle.letterSpacing}px` : 'normal',
      textIndent: paragraphStyle.indent ? `${paragraphStyle.indent}px` : '0',
      marginTop: paragraphStyle.spaceBefore ? `${paragraphStyle.spaceBefore}px` : '0',
      marginBottom: paragraphStyle.spaceAfter ? `${paragraphStyle.spaceAfter}px` : '0',
      whiteSpace: paragraphStyle.wordWrap === false ? 'nowrap' : 'pre-wrap',
      wordBreak: paragraphStyle.wordBreak || 'normal',
      borderWidth: borderStyle.width !== undefined ? `${borderStyle.width}px` : '0',
      borderStyle: borderStyle.style || 'none',
      borderColor: borderStyle.color || 'transparent',
      borderRadius: borderStyle.radius !== undefined ? `${borderStyle.radius}px` : '0',
      backgroundColor: fillStyle.backgroundColor || 'transparent',
      opacity: fillStyle.opacity !== undefined ? fillStyle.opacity : 1
    };
  };

  // ✅ MEJORADO: Función para procesar texto con variables usando notación de punto
  const processTextWithVariables = (text) => {
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
  };

  // ✅ MEJORADO: Renderizar contenido con variables destacadas
  const renderTextContent = () => {
    const text = element.text || '';
    
    if (showVariableValues) {
      const processedText = processTextWithVariables(text);
      return processedText || 'Doble click para editar';
    }
    
    if (!text.includes('{{') || !text.includes('}}')) {
      return text || 'Doble click para editar';
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

    return (
      <span>
        {parts.map((part, index) => {
          if (part.type === 'variable') {
            return (
              <span 
                key={`var-${index}`}
                style={{
                  background: part.isValid 
                    ? 'rgba(59, 130, 246, 0.15)' 
                    : 'rgba(239, 68, 68, 0.15)',
                  color: part.isValid ? '#1e40af' : '#dc2626',
                  padding: '1px 3px',
                  borderRadius: '3px',
                  border: part.isValid 
                    ? '1px solid rgba(59, 130, 246, 0.4)' 
                    : '1px solid rgba(239, 68, 68, 0.4)',
                  fontSize: '0.95em',
                  fontWeight: '600',
                  fontFamily: 'monospace',
                  display: 'inline'
                }}
                title={part.isValid 
                  ? `Variable válida: ${part.variableName}` 
                  : `Variable no encontrada: ${part.variableName}`
                }
              >
                {part.content}
              </span>
            );
          }
          return <span key={`text-${index}`}>{part.content}</span>;
        })}
      </span>
    );
  };

  const getElementStyle = () => {
    const finalStyles = getFinalStyles();
    
    const baseStyle = {
      position: 'absolute',
      left: element.x,
      top: element.y,
      width: element.width || 200,
      height: element.height || 'auto',
      minHeight: element.height || 40,
      padding: element.padding || '8px 12px',
      cursor: isDragging && isSelected ? 'grabbing' : 
              isResizing ? 'auto' : 
              isEditing ? 'text' : 'grab',
      userSelect: isEditing ? 'text' : 'none',
      WebkitUserSelect: isEditing ? 'text' : 'none',
      MozUserSelect: isEditing ? 'text' : 'none',
      msUserSelect: isEditing ? 'text' : 'none',
      transition: (isDragging || isResizing || isEditing) ? 'none' : 'all 0.15s ease',
      zIndex: isSelected ? 1000 : 100,
      pointerEvents: 'auto',
      touchAction: 'none',
      boxSizing: 'border-box',
      overflow: 'visible',
      display: 'flex',
      alignItems: finalStyles.textAlign === 'center' ? 'center' : 'flex-start',
      justifyContent: finalStyles.textAlign === 'center' ? 'center' : 
                     finalStyles.textAlign === 'right' ? 'flex-end' : 'flex-start',
      
      ...finalStyles,
      
      border: isEditing 
        ? '2px solid #3b82f6' 
        : isSelected 
          ? '1px dashed #3b82f6' 
          : finalStyles.borderWidth === '0' || finalStyles.borderStyle === 'none'
            ? '1px dashed rgba(156, 163, 175, 0.3)'
            : `${finalStyles.borderWidth} ${finalStyles.borderStyle} ${finalStyles.borderColor}`,
      
      backgroundColor: isSelected && finalStyles.backgroundColor === 'transparent' 
        ? 'rgba(59, 130, 246, 0.02)' 
        : finalStyles.backgroundColor,
      
      boxShadow: isSelected 
        ? '0 0 0 1px rgba(59, 130, 246, 0.3), ' + (finalStyles.boxShadow || 'none')
        : finalStyles.boxShadow || 'none'
    };

    return baseStyle;
  };

  // ✅ HANDLERS - Todos definidos en orden correcto

  const handleEditFinish = useCallback(() => {
    console.log('✅ Finishing edit with value:', editValue);
    
    setIsEditing(false);
    setShowVariableMenu(false);
    setShowTooltip(false);
    
    if (onTextChange && editValue !== element.text) {
      onTextChange(element.id, 'text', editValue);
    }
  }, [editValue, element.id, element.text, onTextChange]);

  const handleTextareaBlur = useCallback((e) => {
    // ✅ CRÍTICO: Verificar si el foco se movió al input de búsqueda o al menú
    if (showVariableMenu && variableMenuRef.current) {
      const clickedElement = e.relatedTarget;
      
      // Si se hizo clic en el menú de variables o en el input de búsqueda
      if (clickedElement && (
        variableMenuRef.current.contains(clickedElement) ||
        clickedElement === searchInputRef.current
      )) {
        console.log('🎯 Blur ignored - clicked inside variable menu or search');
        setTimeout(() => {
          if (textareaRef.current && !document.activeElement.matches('input')) {
            textareaRef.current.focus();
          }
        }, 0);
        return;
      }
    }
    
    console.log('📤 Textarea blur - finishing edit');
    handleEditFinish();
  }, [showVariableMenu, handleEditFinish]);

  const insertVariable = useCallback((variableName) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      console.warn('❌ Textarea not found for variable insertion');
      return;
    }

    // ✅ DEBUGGING: Ver exactamente qué se está insertando
    console.log('📝 DEBUGGING insertVariable:');
    console.log('   - variableName received:', variableName);
    console.log('   - typeof variableName:', typeof variableName);
    console.log('   - variableName content:', JSON.stringify(variableName));

    const start = cursorPosition;
    const end = cursorPosition;
    const currentText = editValue;
    
    // ✅ CRÍTICO: Asegurarse de que solo insertamos la clave limpia
    const cleanVariableName = String(variableName).trim();
    const variableText = `{{${cleanVariableName}}}`;
    
    console.log('   - cleanVariableName:', cleanVariableName);
    console.log('   - variableText to insert:', variableText);
    
    const newText = currentText.substring(0, start) + variableText + currentText.substring(end);
    const newCursorPosition = start + variableText.length;
    
    console.log('   - newText:', newText);
    
    setShowVariableMenu(false);
    setEditValue(newText);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
        setCursorPosition(newCursorPosition);
        console.log('✅ Variable inserted at position:', newCursorPosition);
      }
    }, 10);
  }, [cursorPosition, editValue]);

  const showVariableMenuAt = useCallback((event) => {
    if (!textareaRef.current) return;
    
    console.log('📋 Showing variable menu with dot notation variables');
    
    const textarea = textareaRef.current;
    const textareaRect = textarea.getBoundingClientRect();
    const currentCursorPos = textarea.selectionStart;
    
    console.log('📍 Menu triggered at cursor position:', currentCursorPos);
    setCursorPosition(currentCursorPos);
    
    const menuX = Math.min(
      event.clientX - textareaRect.left + 10,
      textareaRect.width - 300 // ✅ AUMENTADO: Más espacio para búsqueda
    );
    
    const menuY = event.clientY - textareaRect.top + 25;
    
    setVariableMenuPosition({
      x: Math.max(0, menuX),
      y: Math.max(0, menuY)
    });
    
    // ✅ NUEVO: Limpiar búsqueda al abrir menú
    setSearchTerm('');
    setShowVariableMenu(true);
    setShowTooltip(false);
    
    // ✅ NUEVO: Enfocar input de búsqueda después de un frame
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  }, []);

  const handleTextareaKeyDown = useCallback((e) => {
    console.log('⌨️ Key pressed:', e.key, 'Ctrl:', e.ctrlKey, 'Code:', e.code);

    if ((e.ctrlKey && e.code === 'Space') || (e.ctrlKey && e.key === ' ')) {
      e.preventDefault();
      e.stopPropagation();
      
      if (Object.keys(processedVariables).length === 0) {
        console.warn('⚠️ No variables available');
        return;
      }
      
      const textarea = textareaRef.current;
      if (textarea) {
        const currentCursorPos = textarea.selectionStart;
        setCursorPosition(currentCursorPos);
        
        const syntheticEvent = {
          clientX: textarea.getBoundingClientRect().left + 50,
          clientY: textarea.getBoundingClientRect().top + 30,
          preventDefault: () => {},
          stopPropagation: () => {}
        };
        
        showVariableMenuAt(syntheticEvent);
      }
      return;
    }

    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleEditFinish();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditing(false);
      setEditValue(element.text || '');
      setShowVariableMenu(false);
      setShowTooltip(false);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newText = editValue.substring(0, start) + '    ' + editValue.substring(end);
      setEditValue(newText);
      
      setTimeout(() => {
        e.target.setSelectionRange(start + 4, start + 4);
        setCursorPosition(start + 4);
      }, 0);
    }
  }, [editValue, processedVariables, handleEditFinish, element.text, showVariableMenuAt]);

  const handleDoubleClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('👆 Double click - entering edit mode');
    setIsEditing(true);
    setEditValue(element.text || '');
    setCursorPosition(0);
    setShowTooltip(true);
  }, [element.text]);

  const handleMouseDown = useCallback((e) => {
    if (isEditing) {
      e.stopPropagation();
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    onMouseDown(e, element);
  }, [element, onMouseDown, isEditing]);

  const handleResizeMouseDown = useCallback((e, corner) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onResizeStart) {
      onResizeStart(e, element.id, corner, element);
    }
  }, [element, onResizeStart]);

  // ✅ MEJORADO: Menú de variables con búsqueda y filtrado estricto
  const renderVariableMenu = () => {
    if (!showVariableMenu) {
      return null;
    }

    const totalVariables = Object.keys(processedVariables).length;
    const filteredCount = Object.keys(filteredVariables).length;

    const menuStyle = {
      position: 'absolute',
      left: variableMenuPosition.x,
      top: variableMenuPosition.y,
      background: 'white',
      border: '2px solid #3b82f6',
      borderRadius: '8px',
      boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.25)',
      zIndex: 3000,
      maxHeight: '300px', // ✅ AUMENTADO: Más espacio
      minWidth: '320px',  // ✅ AUMENTADO: Más ancho
      maxWidth: '450px',
      display: 'flex',
      flexDirection: 'column'
    };

    return (
      <div 
        ref={variableMenuRef} 
        style={menuStyle}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {/* ✅ NUEVO: Header con búsqueda */}
        <div style={{
          padding: '12px 16px 8px 16px',
          borderBottom: '1px solid #e5e7eb',
          background: '#f8fafc',
          borderRadius: '6px 6px 0 0'
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>
            📋 Variables insertables ({filteredCount}{filteredCount !== totalVariables ? ` de ${totalVariables}` : ''})
          </div>
          
          {/* ✅ CORREGIDO: Input de búsqueda con manejo de eventos arreglado */}
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => {
              console.log('🔍 Search term changed:', e.target.value);
              setSearchTerm(e.target.value);
            }}
            placeholder="🔍 Buscar variable..."
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '12px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
            onMouseDown={(e) => {
              // ✅ CRÍTICO: Permitir que el input reciba eventos
              e.stopPropagation();
            }}
            onClick={(e) => {
              // ✅ CRÍTICO: Permitir que el input reciba focus
              e.stopPropagation();
            }}
            onFocus={(e) => {
              console.log('🔍 Search input focused');
            }}
            onKeyDown={(e) => {
              // ✅ CRÍTICO: Prevenir que se propague a otros handlers
              e.stopPropagation();
              
              if (e.key === 'Escape') {
                setSearchTerm('');
                if (textareaRef.current) {
                  textareaRef.current.focus();
                  setShowVariableMenu(false);
                }
              } else if (e.key === 'Enter') {
                const firstVariable = Object.keys(filteredVariables)[0];
                if (firstVariable) {
                  insertVariable(firstVariable);
                }
              }
            }}
          />
          
          <div style={{
            fontSize: '10px',
            color: '#6b7280',
            fontWeight: '400',
            marginTop: '4px'
          }}>
            Solo valores primitivos (string, number, boolean)
          </div>
        </div>

        {/* ✅ MEJORADO: Lista de variables filtradas */}
        <div style={{
          overflowY: 'auto',
          flex: 1
        }}>
          {Object.keys(filteredVariables).length === 0 ? (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#9ca3af',
              fontSize: '12px'
            }}>
              {searchTerm ? (
                <>
                  🔍 No se encontraron variables con "{searchTerm}"
                  <br />
                  <button
                    onClick={() => setSearchTerm('')}
                    style={{
                      marginTop: '8px',
                      padding: '4px 8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      background: 'white',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    Limpiar búsqueda
                  </button>
                </>
              ) : (
                'No hay variables insertables disponibles'
              )}
            </div>
          ) : (
            Object.entries(filteredVariables).map(([key, value]) => {
          let displayValue, typeInfo;
          
          if (typeof value === 'object' && value !== null && value.displayValue !== undefined) {
            displayValue = String(value.displayValue || '');
            typeInfo = value.type || 'unknown';
          } else {
            displayValue = typeof value === 'string' ? value : String(value || '');
            typeInfo = typeof value;
          }
          
          const truncatedValue = displayValue.length > 40 
            ? displayValue.substring(0, 40) + '...' 
            : displayValue;

          const isNestedPath = key.includes('.');
          const pathParts = key.split('.');
          const indentLevel = Math.max(0, pathParts.length - 1);

          return (
            <div
              key={key}
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('🎯 Variable clicked with dot notation:', key);
                insertVariable(key);
              }}
              style={{
                padding: '12px 16px',
                paddingLeft: `${16 + (indentLevel * 12)}px`,
                cursor: 'pointer',
                borderBottom: '1px solid #f3f4f6',
                fontSize: '13px',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                borderLeft: isNestedPath ? '3px solid #e5e7eb' : 'none'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#eff6ff';
                e.currentTarget.style.borderLeft = isNestedPath ? '3px solid #3b82f6' : '3px solid #3b82f6';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderLeft = isNestedPath ? '3px solid #e5e7eb' : 'none';
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{
                  fontWeight: '600',
                  color: '#374151',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ 
                    color: typeInfo === 'string' ? '#16a34a' : 
                          typeInfo === 'number' ? '#3b82f6' : 
                          typeInfo === 'boolean' ? '#f59e0b' : '#6b7280',
                    fontSize: '10px'
                  }}>
                    {/* ✅ NUEVO: Iconos específicos para tipos primitivos */}
                    {typeInfo === 'string' ? '📝' : 
                     typeInfo === 'number' ? '🔢' : 
                     typeInfo === 'boolean' ? '✅' : 
                     isNestedPath ? '└' : '🔗'}
                  </span>
                  
                  <span style={{ color: '#374151' }}>
                    {key.split('.').map((part, index, array) => (
                      <span key={index}>
                        {index > 0 && <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>.</span>}
                        <span style={{ 
                          color: index === array.length - 1 ? '#374151' : '#6b7280',
                          fontWeight: index === array.length - 1 ? '600' : '400'
                        }}>
                          {part}
                        </span>
                      </span>
                    ))}
                  </span>
                </div>
                
                <span style={{
                  fontSize: '9px',
                  padding: '2px 6px',
                  background: typeInfo === 'string' ? '#dcfce7' : 
                            typeInfo === 'number' ? '#dbeafe' : 
                            typeInfo === 'boolean' ? '#fef3c7' : '#f3f4f6',
                  color: typeInfo === 'string' ? '#16a34a' : 
                         typeInfo === 'number' ? '#2563eb' : 
                         typeInfo === 'boolean' ? '#d97706' : '#6b7280',
                  borderRadius: '4px',
                  fontWeight: '500',
                  border: '1px solid',
                  borderColor: typeInfo === 'string' ? '#16a34a' : 
                              typeInfo === 'number' ? '#2563eb' : 
                              typeInfo === 'boolean' ? '#d97706' : '#6b7280'
                }}>
                  {String(typeInfo).toUpperCase()}
                </span>
              </div>
              
              <div style={{
                color: '#6b7280',
                fontSize: '11px',
                lineHeight: '1.3',
                paddingLeft: '18px',
                fontStyle: 'italic'
              }}>
                {truncatedValue || 'Sin valor'}
              </div>
              
              <div style={{
                color: '#3b82f6',
                fontSize: '10px',
                fontFamily: 'monospace',
                paddingLeft: '18px',
                background: '#f8fafc',
                padding: '2px 6px',
                borderRadius: '3px',
                marginTop: '2px'
              }}>
                {`{{${key}}}`}
              </div>
            </div>
          );
        }))}
        </div>

        {/* ✅ MEJORADO: Footer con información */}
        <div style={{
          padding: '8px 16px',
          fontSize: '10px',
          color: '#9ca3af',
          fontStyle: 'italic',
          textAlign: 'center',
          borderTop: '1px solid #f1f5f9',
          background: '#fafafa'
        }}>
          💡 Enter para insertar primera variable • Esc para limpiar búsqueda
          <br />
          🚫 Objetos y arrays completos están filtrados
        </div>
      </div>
    );
  };

  const elementStyle = getElementStyle();

  return (
    <>
      {/* Elemento principal */}
      <div
        ref={elementRef}
        style={elementStyle}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onDragStart={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
        title={isEditing ? 'Editando texto...' : `${element.type} - Doble click para editar`}
        data-element-id={element.id}
        data-element-type={element.type}
      >
        {/* Contenido del elemento */}
        {!isEditing && (
          <div style={{
            width: '100%',
            height: '100%',
            overflow: 'visible',
            display: 'flex',
            alignItems: elementStyle.alignItems,
            justifyContent: elementStyle.justifyContent,
            wordWrap: 'break-word',
            whiteSpace: elementStyle.whiteSpace,
            pointerEvents: 'none',
            position: 'relative'
          }}>
            {renderTextContent()}
          </div>
        )}
        
        {/* Textarea para edición inline */}
        {isEditing && (
          <textarea
            ref={textareaRef}
            value={editValue}
            onChange={(e) => {
              const newValue = e.target.value;
              const cursorPos = e.target.selectionStart;
              setEditValue(newValue);
              setCursorPosition(cursorPos);
            }}
            onBlur={handleTextareaBlur}
            onKeyDown={handleTextareaKeyDown}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              const cursorPos = e.target.selectionStart;
              setCursorPosition(cursorPos);
            }}
            onSelect={(e) => {
              const cursorPos = e.target.selectionStart;
              setCursorPosition(cursorPos);
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: '2px solid #3b82f6',
              background: '#ffffff',
              fontFamily: elementStyle.fontFamily,
              fontSize: elementStyle.fontSize,
              fontWeight: elementStyle.fontWeight,
              fontStyle: elementStyle.fontStyle,
              textAlign: elementStyle.textAlign,
              lineHeight: elementStyle.lineHeight,
              padding: element.padding || '8px 12px',
              margin: 0,
              boxSizing: 'border-box',
              outline: 'none',
              resize: 'none',
              overflow: 'auto',
              zIndex: 1001
            }}
            placeholder="Escribe tu texto aquí... (Ctrl+Espacio para variables con notación de punto)"
            autoFocus
          />
        )}

        {/* Menú de variables */}
        {isEditing && renderVariableMenu()}
      </div>
      
      {/* Indicators de selección */}
      {isSelected && !isEditing && (
        <>
          <div style={{
            position: 'absolute',
            left: element.x,
            top: element.y - 30,
            background: '#1f2937',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: '600',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 2000,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
          }}>
            {element.type} | ({Math.round(element.x)}, {Math.round(element.y)})
            {(element.width || element.height) && ` | ${element.width || 'auto'}×${element.height || 'auto'}`}
            <span style={{ marginLeft: '8px', color: showVariableValues ? '#16a34a' : '#f59e0b' }}>
              | {showVariableValues ? 'Valores' : 'Variables'}
            </span>
          </div>
          
          {/* Handles de resize */}
          {[
            { corner: 'top-left', x: -4, y: -4, cursor: 'nw-resize' },
            { corner: 'top-right', x: (element.width || 200) - 4, y: -4, cursor: 'ne-resize' },
            { corner: 'bottom-left', x: -4, y: (element.height || 40) - 4, cursor: 'sw-resize' },
            { corner: 'bottom-right', x: (element.width || 200) - 4, y: (element.height || 40) - 4, cursor: 'se-resize' }
          ].map(({ corner, x, y, cursor }) => (
            <div
              key={corner}
              style={{
                position: 'absolute',
                left: element.x + x,
                top: element.y + y,
                width: 8,
                height: 8,
                background: '#3b82f6',
                border: '1px solid white',
                borderRadius: '2px',
                cursor,
                zIndex: 2000,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                pointerEvents: 'auto'
              }}
              onMouseDown={(e) => handleResizeMouseDown(e, corner)}
              title={`Redimensionar desde ${corner}`}
            />
          ))}
        </>
      )}

      {/* Indicador de modo edición */}
      {isEditing && showTooltip && !showVariableMenu && (
        <div style={{
          position: 'absolute',
          left: element.x,
          top: element.y - 35,
          background: '#059669',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '10px',
          fontWeight: '600',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 2000,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
        }}>
          ✏️ Editando - Ctrl+Espacio para variables (notación punto), Ctrl+Enter para guardar
        </div>
      )}
    </>
  );
};

export default EnhancedTextElement;