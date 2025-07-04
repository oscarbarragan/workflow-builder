// src/components/layoutDesigner/components/TextBox/TextBox.jsx
import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { styleManager } from '../../utils/StyleManager';
import { textBoxStyles } from './TextBox.styles';
import { textBoxUtils } from './textbox.utils';
import { textBoxConfig } from './TextBox.config';
import TextBoxEditor from './TextBoxEditor';

const TextBox = ({ 
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
  const [showTooltip, setShowTooltip] = useState(false);
  const elementRef = useRef(null);

  // Procesar variables disponibles
  const processedVariables = useMemo(() => {
    let dataToProcess = availableVariables;
    if (Object.keys(availableVariables).length === 0) {
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
    
    const processed = textBoxUtils.processVariablesWithDotNotation(dataToProcess);
    return textBoxUtils.formatVariablesForMenu(processed);
  }, [availableVariables]);

  // Obtener estilos aplicados
  const getAppliedStyles = useCallback(() => {
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
  }, [element]);

  // Obtener estilos finales
  const getFinalStyles = useCallback(() => {
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
  }, [getAppliedStyles]);

  // Renderizar contenido del texto
  const renderTextContent = useCallback(() => {
    const text = element.text || '';
    
    if (showVariableValues) {
      const processedText = textBoxUtils.processTextWithVariables(
        text, 
        processedVariables, 
        showVariableValues, 
        availableVariables
      );
      return processedText || 'Doble click para editar';
    }
    
    const parts = textBoxUtils.parseTextParts(text, processedVariables);
    
    if (parts.length === 1 && parts[0].type === 'text') {
      return parts[0].content;
    }

    return (
      <span>
        {parts.map((part, index) => {
          if (part.type === 'variable') {
            return (
              <span 
                key={`var-${index}`}
                style={textBoxStyles.variableHighlight(part.isValid)}
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
  }, [element.text, showVariableValues, processedVariables, availableVariables]);

  // Event handlers
  const handleDoubleClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsEditing(true);
    setEditValue(element.text || '');
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

  const handleEditFinish = useCallback((newText) => {
    setIsEditing(false);
    setShowTooltip(false);
    
    if (onTextChange && newText !== element.text) {
      onTextChange(element.id, 'text', newText);
    }
  }, [element.id, element.text, onTextChange]);

  const handleEditCancel = useCallback(() => {
    setIsEditing(false);
    setEditValue(element.text || '');
    setShowTooltip(false);
  }, [element.text]);

  const finalStyles = getFinalStyles();
  const elementStyle = textBoxStyles.container(
    element, 
    isSelected, 
    isDragging, 
    isEditing, 
    finalStyles
  );

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
          <div style={textBoxStyles.content(elementStyle)}>
            {renderTextContent()}
          </div>
        )}
        
        {/* Editor de texto */}
        {isEditing && (
          <TextBoxEditor
            initialValue={editValue}
            element={element}
            elementStyle={elementStyle}
            finalStyles={finalStyles}
            availableVariables={processedVariables}
            onFinish={handleEditFinish}
            onCancel={handleEditCancel}
          />
        )}
      </div>
      
      {/* Indicadores de selección */}
      {isSelected && !isEditing && (
        <>
          <div style={textBoxStyles.tooltip(element.x, element.y)}>
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
              style={textBoxStyles.resizeHandle(element.x + x, element.y + y, cursor)}
              onMouseDown={(e) => handleResizeMouseDown(e, corner)}
              title={`Redimensionar desde ${corner}`}
            />
          ))}
        </>
      )}

      {/* Indicador de modo edición */}
      {isEditing && showTooltip && (
        <div style={textBoxStyles.tooltip(element.x, element.y, true)}>
          ✏️ Editando - Ctrl+Espacio para variables (notación punto), Ctrl+Enter para guardar
        </div>
      )}
    </>
  );
};

export default TextBox;