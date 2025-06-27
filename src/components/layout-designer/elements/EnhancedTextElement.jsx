// src/components/layout-designer/elements/EnhancedTextElement.jsx - VERSIÓN SIMPLIFICADA
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
      if (textStyle) appliedStyles.textStyle = textStyle;
    }

    if (element.paragraphStyleId) {
      const paragraphStyle = styleManager.getParagraphStyle(element.paragraphStyleId);
      if (paragraphStyle) appliedStyles.paragraphStyle = paragraphStyle;
    }

    if (element.borderStyleId) {
      const borderStyle = styleManager.getBorderStyle(element.borderStyleId);
      if (borderStyle) appliedStyles.borderStyle = borderStyle;
    }

    if (element.fillStyleId) {
      const fillStyle = styleManager.getFillStyle(element.fillStyleId);
      if (fillStyle) appliedStyles.fillStyle = fillStyle;
    }

    return {
      textStyle: { ...appliedStyles.textStyle, ...element.textStyle },
      paragraphStyle: { ...appliedStyles.paragraphStyle, ...element.paragraphStyle },
      borderStyle: { ...appliedStyles.borderStyle, ...element.borderStyle },
      fillStyle: { ...appliedStyles.fillStyle, ...element.fillStyle }
    };
  };

  // ✅ Función para obtener estilos CSS finales
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

  // ✅ MEJORADO: Función para renderizar texto con variables destacadas inline
  const renderTextContent = () => {
    const text = element.text || '';
    
    if (showVariableValues) {
      // ✅ CORREGIDO: Función para mostrar valores reales
      return text.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
        const variable = availableVariables[variableName.trim()];
        if (variable) {
          if (typeof variable === 'object' && variable.displayValue) {
            return String(variable.displayValue);
          }
          return String(variable);
        }
        return match;
      }) || 'Doble click para editar';
    }
    
    if (!text.includes('{{') || !text.includes('}}')) {
      // No hay variables, mostrar texto normal
      return text || 'Doble click para editar';
    }
    
    // ✅ RENDERIZADO INLINE: Dividir texto y variables
    const parts = [];
    let lastIndex = 0;
    const variableRegex = /\{\{([^}]+)\}\}/g;
    let match;

    while ((match = variableRegex.exec(text)) !== null) {
      // Texto antes de la variable
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: text.slice(lastIndex, match.index)
        });
      }
      
      // Variable
      parts.push({
        type: 'variable',
        content: match[0],
        variableName: match[1].trim()
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Texto después de la última variable
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

  // ✅ Función para detectar si hay variables en el texto
  const hasVariables = () => {
    return element.text && element.text.includes('{{') && element.text.includes('}}');
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
      
      // ✅ CORREGIDO: Aplicar TODOS los estilos finales siempre
      ...finalStyles,
      
      // ✅ Solo el borde se maneja especialmente
      border: isEditing 
        ? '2px solid #3b82f6' 
        : isSelected 
          ? '1px dashed #3b82f6' 
          : finalStyles.borderWidth === '0' || finalStyles.borderStyle === 'none'
            ? '1px dashed rgba(156, 163, 175, 0.3)'
            : finalStyles.border,
      
      // ✅ Solo agregar selección si no hay background configurado
      backgroundColor: isSelected && finalStyles.backgroundColor === 'transparent' 
        ? 'rgba(59, 130, 246, 0.02)' 
        : finalStyles.backgroundColor,
      
      boxShadow: isSelected 
        ? '0 0 0 1px rgba(59, 130, 246, 0.3), ' + (finalStyles.boxShadow || 'none')
        : finalStyles.boxShadow || 'none'
    };

    return baseStyle;
  };

  // ✅ Función para insertar variable
  const insertVariable = (variableName) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = editValue;
    const variableText = `{{${variableName}}}`;
    
    const newText = currentText.substring(0, start) + variableText + currentText.substring(end);
    const newCursorPosition = start + variableText.length;
    
    setEditValue(newText);
    setShowVariableMenu(false);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  };

  const showVariableMenuAt = (event) => {
    const rect = textareaRef.current.getBoundingClientRect();
    setVariableMenuPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top + 20
    });
    setShowVariableMenu(true);
    setShowTooltip(false);
  };

  const handleDoubleClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsEditing(true);
    setEditValue(element.text || '');
    setCursorPosition(0);
    setShowTooltip(true);
  }, [element.text]);

  const handleTextareaKeyDown = useCallback((e) => {
    if (e.ctrlKey && e.code === 'Space') {
      e.preventDefault();
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
  }, [editValue]);

  const handleEditFinish = useCallback(() => {
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

  // ✅ Menú de variables simplificado
  const renderVariableMenu = () => {
    if (!showVariableMenu || Object.keys(availableVariables).length === 0) {
      return null;
    }

    return (
      <div
        ref={variableMenuRef}
        style={{
          position: 'absolute',
          left: variableMenuPosition.x,
          top: variableMenuPosition.y,
          background: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          zIndex: 3000,
          maxHeight: '200px',
          overflowY: 'auto',
          minWidth: '200px'
        }}
      >
        <div style={{
          padding: '8px 12px',
          borderBottom: '1px solid #e5e7eb',
          fontSize: '12px',
          fontWeight: '600',
          color: '#374151',
          background: '#f9fafb'
        }}>
          Variables disponibles
        </div>
        
        {Object.entries(availableVariables).map(([key, value]) => {
          const displayValue = typeof value === 'object' && value.displayValue 
            ? value.displayValue 
            : String(value).substring(0, 30);
            
          return (
            <div
              key={key}
              onClick={() => insertVariable(key)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                borderBottom: '1px solid #f3f4f6',
                fontSize: '12px',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
              onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              <div style={{ fontWeight: '500', color: '#374151', marginBottom: '2px' }}>
                {key}
              </div>
              <div style={{ fontSize: '10px', color: '#6b7280' }}>
                {displayValue.length > 30 ? displayValue + '...' : displayValue}
              </div>
            </div>
          );
        })}
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
            {/* ✅ MEJORADO: Renderizado inline de variables */}
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
          {/* Tooltip de información */}
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