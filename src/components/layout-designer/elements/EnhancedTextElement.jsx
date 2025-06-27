// src/components/layout-designer/elements/EnhancedTextElement.jsx
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
  availableVariables = {}
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [showVariableMenu, setShowVariableMenu] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [variableMenuPosition, setVariableMenuPosition] = useState({ x: 0, y: 0 });
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

  // ✅ NUEVO: Función para obtener estilos aplicados del StyleManager
  const getAppliedStyles = () => {
    const appliedStyles = {
      textStyle: {},
      paragraphStyle: {},
      borderStyle: {},
      fillStyle: {}
    };

    // Obtener estilos del StyleManager
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

    // Merge con estilos inline del elemento (override)
    return {
      textStyle: { ...appliedStyles.textStyle, ...element.textStyle },
      paragraphStyle: { ...appliedStyles.paragraphStyle, ...element.paragraphStyle },
      borderStyle: { ...appliedStyles.borderStyle, ...element.borderStyle },
      fillStyle: { ...appliedStyles.fillStyle, ...element.fillStyle }
    };
  };

  // ✅ MEJORADO: Función para obtener estilos CSS finales
  const getFinalStyles = () => {
    const styles = getAppliedStyles();
    const { textStyle, paragraphStyle, borderStyle, fillStyle } = styles;
    
    return {
      // Text styles
      fontFamily: textStyle.fontFamily || 'Arial, sans-serif',
      fontSize: `${textStyle.fontSize || 14}px`,
      fontWeight: textStyle.bold ? 'bold' : (textStyle.fontWeight || 'normal'),
      fontStyle: textStyle.italic ? 'italic' : 'normal',
      textDecoration: [
        textStyle.underline ? 'underline' : '',
        textStyle.strikethrough ? 'line-through' : ''
      ].filter(Boolean).join(' ') || 'none',
      color: textStyle.color || '#000000',
      
      // Paragraph styles
      textAlign: paragraphStyle.alignment || 'left',
      lineHeight: paragraphStyle.lineHeight || '1.4',
      letterSpacing: paragraphStyle.letterSpacing ? `${paragraphStyle.letterSpacing}px` : 'normal',
      textIndent: paragraphStyle.indent ? `${paragraphStyle.indent}px` : '0',
      marginTop: paragraphStyle.spaceBefore ? `${paragraphStyle.spaceBefore}px` : '0',
      marginBottom: paragraphStyle.spaceAfter ? `${paragraphStyle.spaceAfter}px` : '0',
      whiteSpace: paragraphStyle.wordWrap === false ? 'nowrap' : 'pre-wrap',
      wordBreak: paragraphStyle.wordBreak || 'normal',
      
      // Border styles
      borderWidth: borderStyle.width !== undefined ? `${borderStyle.width}px` : '0',
      borderStyle: borderStyle.style || 'none',
      borderColor: borderStyle.color || 'transparent',
      borderRadius: borderStyle.radius !== undefined ? `${borderStyle.radius}px` : '0',
      
      // Fill styles
      backgroundColor: fillStyle.backgroundColor || 'transparent',
      opacity: fillStyle.opacity !== undefined ? fillStyle.opacity : 1
    };
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
      
      // ✅ Aplicar estilos finales
      ...finalStyles,
      
      // ✅ Override para selección (mantener visibilidad)
      boxShadow: isSelected 
        ? '0 0 0 2px rgba(59, 130, 246, 0.5), ' + (finalStyles.boxShadow || 'none')
        : finalStyles.boxShadow || 'none'
    };

    return baseStyle;
  };

  // ✅ NUEVO: Función para parsear texto con variables
  const parseTextWithVariables = (text) => {
    if (!text) return '';
    
    // Reemplazar variables {{variableName}} con valores reales
    return text.replace(/\{\{([^}]+)\}\}/g, (match, variableName) => {
      const variable = availableVariables[variableName.trim()];
      if (variable) {
        if (typeof variable === 'object' && variable.displayValue) {
          return variable.displayValue;
        }
        return String(variable);
      }
      return match; // Mantener placeholder si no se encuentra la variable
    });
  };

  // ✅ NUEVO: Función para insertar variable en la posición del cursor
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
    
    // Mover cursor después de la variable insertada
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPosition, newCursorPosition);
    }, 0);
  };

  // ✅ NUEVO: Mostrar menú de variables
  const showVariableMenuAt = (event) => {
    const rect = textareaRef.current.getBoundingClientRect();
    setVariableMenuPosition({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top + 20
    });
    setShowVariableMenu(true);
  };

  const handleDoubleClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('✏️ Starting text edit mode');
    setIsEditing(true);
    setEditValue(element.text || '');
    setCursorPosition(0);
  }, [element.text]);

  const handleTextareaKeyDown = useCallback((e) => {
    // Ctrl+Space para abrir menú de variables
    if (e.ctrlKey && e.code === 'Space') {
      e.preventDefault();
      showVariableMenuAt(e);
      return;
    }

    // Ctrl+Enter para finalizar edición
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleEditFinish();
    } 
    // Escape para cancelar
    else if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditing(false);
      setEditValue(element.text || '');
      setShowVariableMenu(false);
    }
    // Tab para insertar espacios
    else if (e.key === 'Tab') {
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
    console.log('✅ Finishing edit with value:', editValue);
    
    setIsEditing(false);
    setShowVariableMenu(false);
    
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

  // ✅ NUEVO: Renderizar menú de variables
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
        
        <div style={{
          padding: '6px 12px',
          borderTop: '1px solid #e5e7eb',
          fontSize: '10px',
          color: '#9ca3af',
          background: '#f9fafb',
          textAlign: 'center'
        }}>
          Ctrl+Espacio para abrir este menú
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
            pointerEvents: 'none'
          }}>
            {parseTextWithVariables(element.text) || 'Doble click para editar'}
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
      {isEditing && (
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