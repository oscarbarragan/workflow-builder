import React, { useState, useCallback, useRef, useEffect } from 'react';
import { ELEMENT_TYPES } from '../../../utils/constants';

const LayoutElement = ({ 
  element, 
  isSelected, 
  isDragging,
  isResizing,
  onMouseDown,
  onResizeStart,
  onDoubleClick,
  onTextChange
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');
  const textareaRef = useRef(null);
  const elementRef = useRef(null);
  const doubleClickTimeoutRef = useRef(null);
  const clickCountRef = useRef(0);

  // Auto-focus cuando entra en modo edición
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  // ✅ NUEVO: Función para obtener estilos de texto de Inspire Designer
  const getTextStyles = () => {
    const textStyle = element.textStyle || {};
    const paragraphStyle = element.paragraphStyle || {};
    
    return {
      // Text Style properties
      fontFamily: textStyle.fontFamily || 'Arial, sans-serif',
      fontSize: `${textStyle.fontSize || element.fontSize || 14}px`,
      fontWeight: textStyle.fontWeight || (textStyle.bold ? 'bold' : 'normal'),
      fontStyle: textStyle.italic ? 'italic' : 'normal',
      textDecoration: [
        textStyle.underline ? 'underline' : '',
        textStyle.strikethrough ? 'line-through' : ''
      ].filter(Boolean).join(' ') || 'none',
      color: textStyle.color || '#000000',
      
      // Paragraph Style properties
      textAlign: paragraphStyle.alignment || 'left',
      lineHeight: paragraphStyle.lineHeight || '1.4',
      letterSpacing: paragraphStyle.letterSpacing ? `${paragraphStyle.letterSpacing}px` : 'normal',
      textIndent: paragraphStyle.indent ? `${paragraphStyle.indent}px` : '0',
      marginTop: paragraphStyle.spaceBefore ? `${paragraphStyle.spaceBefore}px` : '0',
      marginBottom: paragraphStyle.spaceAfter ? `${paragraphStyle.spaceAfter}px` : '0',
      whiteSpace: paragraphStyle.wordWrap === false ? 'nowrap' : 'pre-wrap',
      wordBreak: paragraphStyle.wordBreak || 'normal'
    };
  };

  const getElementStyle = () => {
    const baseStyle = {
      position: 'absolute',
      left: element.x,
      top: element.y,
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
      boxSizing: 'border-box'
    };

    switch (element.type) {
      case ELEMENT_TYPES.TEXT:
        // ✅ MEJORADO: Estilo sin borde ni background, como Inspire Designer
        const textStyles = getTextStyles();
        
        return {
          ...baseStyle,
          width: element.width || 200,
          height: element.height || 'auto',
          minHeight: element.height || 40,
          padding: element.padding || '4px 8px',
          
          // ✅ SIN BORDE NI BACKGROUND por defecto (como Inspire Designer)
          background: isSelected && !isEditing ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
          border: isSelected ? '1px dashed #3b82f6' : 'none',
          borderRadius: '2px',
          
          // ✅ Aplicar estilos de texto de Inspire Designer
          ...textStyles,
          
          // ✅ Shadow sutil solo cuando está seleccionado
          boxShadow: isSelected 
            ? '0 0 0 1px rgba(59, 130, 246, 0.3)' 
            : 'none',
          
          overflow: 'visible',
          display: 'flex',
          alignItems: element.paragraphStyle?.verticalAlign || 'flex-start',
          justifyContent: 'flex-start'
        };

      case ELEMENT_TYPES.VARIABLE:
        return {
          ...baseStyle,
          padding: '6px 10px',
          background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'rgba(14, 165, 233, 0.05)',
          border: isSelected ? '2px solid #3b82f6' : '1px dashed #0ea5e9',
          borderRadius: '4px',
          fontSize: element.fontSize || 14,
          color: '#1e40af',
          fontFamily: 'monospace',
          fontWeight: '600',
          boxShadow: isSelected 
            ? '0 0 0 2px rgba(59, 130, 246, 0.2)' 
            : '0 1px 3px rgba(14, 165, 233, 0.2)',
          minWidth: 'auto',
          minHeight: 'auto',
          maxWidth: '250px'
        };

      case ELEMENT_TYPES.RECTANGLE:
        return {
          ...baseStyle,
          width: element.width || 100,
          height: element.height || 50,
          background: element.fillColor || (isSelected ? 'rgba(59, 130, 246, 0.1)' : 'rgba(156, 163, 175, 0.1)'),
          border: `${element.borderWidth || 2}px ${element.borderStyle || 'solid'} ${element.borderColor || (isSelected ? '#3b82f6' : '#6b7280')}`,
          borderRadius: element.borderRadius || '4px',
          boxShadow: isSelected 
            ? '0 0 0 2px rgba(59, 130, 246, 0.2)' 
            : '0 2px 4px rgba(0, 0, 0, 0.1)'
        };

      default:
        return baseStyle;
    }
  };

  const getElementContent = () => {
    if (isEditing && element.type === ELEMENT_TYPES.TEXT) {
      return null; // El textarea se renderiza por separado
    }

    switch (element.type) {
      case ELEMENT_TYPES.TEXT:
        return element.text || 'Doble click para editar';
      
      case ELEMENT_TYPES.VARIABLE:
        return `{{${element.variable || 'variable'}}}`;
      
      case ELEMENT_TYPES.RECTANGLE:
        return '';
      
      default:
        return '';
    }
  };

  // Handler mejorado para manejar clicks simples y dobles
  const handleClick = useCallback((e) => {
    if (isEditing) {
      return; // Si está editando, no hacer nada
    }

    e.preventDefault();
    e.stopPropagation();

    clickCountRef.current += 1;

    if (clickCountRef.current === 1) {
      // Primer click - esperar para ver si hay un segundo
      doubleClickTimeoutRef.current = setTimeout(() => {
        // Solo fue un click simple
        clickCountRef.current = 0;
        console.log('🖱️ Single click on element:', element.type, element.id);
      }, 300);
    } else if (clickCountRef.current === 2) {
      // Doble click detectado
      clearTimeout(doubleClickTimeoutRef.current);
      clickCountRef.current = 0;
      
      console.log('✏️ Double click detected on element:', element.type, element.id);
      
      if (element.type === ELEMENT_TYPES.TEXT) {
        console.log('📝 Starting text edit mode');
        setIsEditing(true);
        setEditValue(element.text || '');
      } else if (element.type === ELEMENT_TYPES.VARIABLE) {
        onDoubleClick && onDoubleClick(element);
      }
    }
  }, [element, onDoubleClick, isEditing]);

  // Handler para terminar edición
  const handleEditFinish = useCallback(() => {
    console.log('✅ Finishing edit with value:', editValue);
    
    setIsEditing(false);
    
    if (onTextChange && editValue !== element.text) {
      onTextChange(element.id, 'text', editValue);
    }
  }, [editValue, element.id, element.text, onTextChange]);

  // Handler para teclas durante edición
  const handleEditKeyDown = useCallback((e) => {
    // Permitir Enter normal, Ctrl+Enter para finalizar
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleEditFinish();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setIsEditing(false);
      setEditValue(element.text || '');
    }
    // No prevenir otras teclas para permitir edición normal
  }, [handleEditFinish, element.text]);

  // Handler para mousedown
  const handleMouseDown = useCallback((e) => {
    if (isEditing) {
      // Si está editando, no permitir drag
      e.stopPropagation();
      return;
    }
    
    console.log('🎯 Element MouseDown triggered:', element.type, element.id);
    
    e.preventDefault();
    e.stopPropagation();
    
    onMouseDown(e, element);
  }, [element, onMouseDown, isEditing]);

  // Handler para resize
  const handleResizeMouseDown = useCallback((e, corner) => {
    console.log('🔧 Resize handle clicked:', corner);
    
    e.preventDefault();
    e.stopPropagation();
    
    if (onResizeStart) {
      onResizeStart(e, element.id, corner, element);
    }
  }, [element, onResizeStart]);

  // Cleanup de timeouts
  useEffect(() => {
    return () => {
      if (doubleClickTimeoutRef.current) {
        clearTimeout(doubleClickTimeoutRef.current);
      }
    };
  }, []);

  // Manejadores para prevenir comportamientos por defecto
  const preventDrag = useCallback((e) => {
    if (!isEditing) {
      e.preventDefault();
      return false;
    }
  }, [isEditing]);

  const preventContext = useCallback((e) => {
    e.preventDefault();
    return false;
  }, []);

  const elementStyle = getElementStyle();

  return (
    <>
      {/* Elemento principal */}
      <div
        ref={elementRef}
        style={elementStyle}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        onDragStart={preventDrag}
        onContextMenu={preventContext}
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
            alignItems: element.type === ELEMENT_TYPES.TEXT ? 
              (element.paragraphStyle?.verticalAlign || 'flex-start') : 'center',
            justifyContent: element.type === ELEMENT_TYPES.TEXT ? 
              (element.paragraphStyle?.alignment === 'center' ? 'center' :
               element.paragraphStyle?.alignment === 'right' ? 'flex-end' : 'flex-start') : 'flex-start',
            wordWrap: 'break-word',
            whiteSpace: element.paragraphStyle?.wordWrap === false ? 'nowrap' : 'pre-wrap',
            pointerEvents: 'none', // Importante: evitar interferencia
            
            // ✅ Aplicar estilos de texto también al contenedor
            ...(element.type === ELEMENT_TYPES.TEXT ? getTextStyles() : {})
          }}>
            {getElementContent()}
          </div>
        )}
        
        {/* Textarea para edición inline */}
        {isEditing && element.type === ELEMENT_TYPES.TEXT && (
          <textarea
            ref={textareaRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={handleEditFinish}
            onKeyDown={handleEditKeyDown}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: '2px solid #3b82f6',
              background: '#ffffff',
              
              // ✅ Aplicar estilos de texto del elemento al textarea
              ...getTextStyles(),
              
              padding: element.padding || '4px 8px',
              margin: 0,
              boxSizing: 'border-box',
              outline: 'none',
              resize: 'none',
              overflow: 'auto',
              zIndex: 1001
            }}
            placeholder="Escribe tu texto aquí..."
            autoFocus
          />
        )}
      </div>
      
      {/* Indicators y handles de selección */}
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
            {/* ✅ Mostrar info de estilos si es texto */}
            {element.type === ELEMENT_TYPES.TEXT && element.textStyle?.fontFamily && 
              ` | ${element.textStyle.fontFamily}`}
          </div>
          
          {/* Handles de resize para rectángulos Y textos */}
          {(element.type === ELEMENT_TYPES.RECTANGLE || element.type === ELEMENT_TYPES.TEXT) && (
            <>
              {[
                { corner: 'top-left', x: -4, y: -4, cursor: 'nw-resize' },
                { corner: 'top-right', x: (element.width || 100) - 4, y: -4, cursor: 'ne-resize' },
                { corner: 'bottom-left', x: -4, y: (element.height || 50) - 4, cursor: 'sw-resize' },
                { corner: 'bottom-right', x: (element.width || 100) - 4, y: (element.height || 50) - 4, cursor: 'se-resize' }
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
          
          {/* Borde de selección sutil */}
          <div style={{
            position: 'absolute',
            left: element.x - 1,
            top: element.y - 1,
            width: (element.width || 100) + 2,
            height: (element.height || 50) + 2,
            border: '1px dashed #3b82f6',
            borderRadius: '3px',
            pointerEvents: 'none',
            zIndex: 1500,
            opacity: 0.7
          }} />
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
          ✏️ Editando - Ctrl+Enter para guardar, Esc para cancelar
        </div>
      )}
    </>
  );
};

export default LayoutElement;