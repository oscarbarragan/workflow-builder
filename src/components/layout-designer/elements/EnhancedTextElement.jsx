// src/components/layout-designer/elements/EnhancedTextElement.jsx - CORREGIDO inserción variables
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
  const textareaRef = useRef(null);
  const elementRef = useRef(null);
  const variableMenuRef = useRef(null);

  // Auto-focus cuando entra en modo edición
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, [isEditing, cursorPosition]);

  // Cerrar menú de variables al hacer clic fuera
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

  // ✅ Función para obtener estilos aplicados del StyleManager
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
        console.log('🎨 Applied text style from StyleManager:', textStyle);
      }
    }

    if (element.paragraphStyleId) {
      const paragraphStyle = styleManager.getParagraphStyle(element.paragraphStyleId);
      if (paragraphStyle) {
        appliedStyles.paragraphStyle = { ...paragraphStyle };
        console.log('📝 Applied paragraph style from StyleManager:', paragraphStyle);
      }
    }

    if (element.borderStyleId) {
      const borderStyle = styleManager.getBorderStyle(element.borderStyleId);
      if (borderStyle) {
        appliedStyles.borderStyle = { ...borderStyle };
        console.log('🖼️ Applied border style from StyleManager:', borderStyle);
      }
    }

    if (element.fillStyleId) {
      const fillStyle = styleManager.getFillStyle(element.fillStyleId);
      if (fillStyle) {
        appliedStyles.fillStyle = { ...fillStyle };
        console.log('🎨 Applied fill style from StyleManager:', fillStyle);
      }
    }

    // Overlay manual styles on top of StyleManager styles
    return {
      textStyle: { ...appliedStyles.textStyle, ...(element.textStyle || {}) },
      paragraphStyle: { ...appliedStyles.paragraphStyle, ...(element.paragraphStyle || {}) },
      borderStyle: { ...appliedStyles.borderStyle, ...(element.borderStyle || {}) },
      fillStyle: { ...appliedStyles.fillStyle, ...(element.fillStyle || {}) }
    };
  };

  // Función para obtener estilos CSS finales
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

  // Función para procesar y mostrar texto con variables
  const processTextWithVariables = (text) => {
    if (!text) return '';
    
    if (showVariableValues) {
      return text.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
        const trimmedName = variableName.trim();
        const variable = availableVariables[trimmedName];
        
        if (variable !== undefined) {
          if (typeof variable === 'object' && variable !== null && variable.displayValue !== undefined) {
            return String(variable.displayValue);
          }
          return String(variable);
        }
        
        return `[${trimmedName}]`;
      });
    }
    
    return text;
  };

  // Función para renderizar texto con variables destacadas inline
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
      
      parts.push({
        type: 'variable',
        content: match[0],
        variableName: match[1].trim()
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
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#1e40af',
                  padding: '1px 3px',
                  borderRadius: '3px',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  fontSize: '0.95em',
                  fontWeight: '600',
                  fontFamily: 'monospace',
                  display: 'inline'
                }}
                title={`Variable: ${part.variableName}`}
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

  // ✅ CORREGIDO: Función para insertar variable mejorada
  const insertVariable = (variableName) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      console.warn('❌ Textarea not found for variable insertion');
      return;
    }

    console.log('📝 Inserting variable:', variableName);

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = editValue;
    const variableText = `{{${variableName}}}`;
    
    const newText = currentText.substring(0, start) + variableText + currentText.substring(end);
    const newCursorPosition = start + variableText.length;
    
    console.log('✏️ New text:', newText);
    console.log('📍 New cursor position:', newCursorPosition);
    
    // Actualizar el valor
    setEditValue(newText);
    setShowVariableMenu(false);
    
    // ✅ CRÍTICO: Usar requestAnimationFrame para asegurar que el DOM se actualice
    requestAnimationFrame(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
        console.log('✅ Variable inserted and cursor positioned');
      }
    });
  };

  // ✅ MEJORADO: Función para mostrar menú de variables con mejor posicionamiento
  const showVariableMenuAt = (event) => {
    if (!textareaRef.current) return;
    
    console.log('📋 Showing variable menu');
    
    const textarea = textareaRef.current;
    const textareaRect = textarea.getBoundingClientRect();
    
    // Posicionar el menú cerca del cursor
    const menuX = Math.min(
      event.clientX - textareaRect.left + 10,
      textareaRect.width - 200 // Ancho mínimo del menú
    );
    
    const menuY = event.clientY - textareaRect.top + 25;
    
    setVariableMenuPosition({
      x: Math.max(0, menuX),
      y: Math.max(0, menuY)
    });
    
    setShowVariableMenu(true);
    setShowTooltip(false);
    
    console.log('📍 Menu positioned at:', { x: menuX, y: menuY });
  };

  const handleDoubleClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('👆 Double click - entering edit mode');
    setIsEditing(true);
    setEditValue(element.text || '');
    setCursorPosition(0);
    setShowTooltip(true);
  }, [element.text]);

  // ✅ MEJORADO: Handler para teclas con mejor manejo de Ctrl+Espacio
  const handleTextareaKeyDown = useCallback((e) => {
    console.log('⌨️ Key pressed:', e.key, 'Ctrl:', e.ctrlKey, 'Code:', e.code);

    // ✅ CRÍTICO: Detectar Ctrl+Espacio de múltiples formas
    if ((e.ctrlKey && e.code === 'Space') || (e.ctrlKey && e.key === ' ')) {
      e.preventDefault();
      e.stopPropagation();
      
      console.log('🎯 Ctrl+Space detected - showing variable menu');
      
      if (Object.keys(availableVariables).length === 0) {
        console.warn('⚠️ No variables available');
        return;
      }
      
      showVariableMenuAt(e);
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
      }, 0);
    }
  }, [editValue, availableVariables]);

  const handleEditFinish = useCallback(() => {
    console.log('✅ Finishing edit with value:', editValue);
    
    setIsEditing(false);
    setShowVariableMenu(false);
    setShowTooltip(false);
    
    if (onTextChange && editValue !== element.text) {
      onTextChange(element.id, 'text', editValue);
    }
  }, [editValue, element.id, element.text, onTextChange]);

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

  // ✅ MEJORADO: Menú de variables con mejor UX
  const renderVariableMenu = () => {
    if (!showVariableMenu || Object.keys(availableVariables).length === 0) {
      return null;
    }

    const menuStyle = {
      position: 'absolute',
      left: variableMenuPosition.x,
      top: variableMenuPosition.y,
      background: 'white',
      border: '2px solid #3b82f6',
      borderRadius: '8px',
      boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.25)',
      zIndex: 3000,
      maxHeight: '250px',
      overflowY: 'auto',
      minWidth: '250px',
      maxWidth: '350px'
    };

    return (
      <div ref={variableMenuRef} style={menuStyle}>
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid #e5e7eb',
          fontSize: '12px',
          fontWeight: '600',
          color: '#374151',
          background: '#f8fafc',
          borderRadius: '6px 6px 0 0'
        }}>
          📋 Variables disponibles ({Object.keys(availableVariables).length})
        </div>
        
        {Object.entries(availableVariables).map(([key, value]) => {
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

          return (
            <div
              key={key}
              onClick={() => {
                console.log('🎯 Variable clicked:', key);
                insertVariable(key);
              }}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                borderBottom: '1px solid #f3f4f6',
                fontSize: '13px',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#eff6ff';
                e.currentTarget.style.borderLeft = '4px solid #3b82f6';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderLeft = '4px solid transparent';
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
                  fontSize: '12px'
                }}>
                  {`{{${key}}}`}
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
                  fontWeight: '500'
                }}>
                  {typeInfo}
                </span>
              </div>
              
              <div style={{
                color: '#6b7280',
                fontSize: '11px',
                lineHeight: '1.3'
              }}>
                {truncatedValue || 'Sin valor'}
              </div>
            </div>
          );
        })}
        
        <div style={{
          padding: '8px 16px',
          fontSize: '10px',
          color: '#9ca3af',
          fontStyle: 'italic',
          textAlign: 'center',
          borderTop: '1px solid #f1f5f9',
          background: '#fafafa'
        }}>
          💡 Haz clic en una variable para insertarla
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
              setEditValue(e.target.value);
              setCursorPosition(e.target.selectionStart);
            }}
            onBlur={handleEditFinish}
            onKeyDown={handleTextareaKeyDown}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              setCursorPosition(e.target.selectionStart);
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
              color: elementStyle.color,
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
            placeholder="Escribe tu texto aquí... (Ctrl+Espacio para variables)"
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
          ✏️ Editando - Ctrl+Espacio para variables, Ctrl+Enter para guardar
        </div>
      )}
    </>
  );
};

export default EnhancedTextElement;