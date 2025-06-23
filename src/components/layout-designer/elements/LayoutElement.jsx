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
        return {
          ...baseStyle,
          width: element.width || 200,
          height: element.height || 40,
          padding: '8px 12px',
          background: isSelected ? '#fef3c7' : 'rgba(255, 255, 255, 0.95)',
          border: isSelected ? '2px solid #3b82f6' : '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: element.fontSize || 14,
          color: '#1f2937',
          fontFamily: 'inherit',
          fontWeight: '500',
          boxShadow: isSelected 
            ? '0 0 0 3px rgba(59, 130, 246, 0.2)' 
            : '0 1px 3px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: isEditing ? 'flex-start' : 'center',
          justifyContent: 'flex-start'
        };

      case ELEMENT_TYPES.VARIABLE:
        return {
          ...baseStyle,
          padding: '6px 10px',
          background: isSelected ? '#dbeafe' : '#e0f2fe',
          border: isSelected ? '2px solid #3b82f6' : '1px solid #0ea5e9',
          borderRadius: '6px',
          fontSize: element.fontSize || 14,
          color: '#1e40af',
          fontFamily: 'monospace',
          fontWeight: '600',
          boxShadow: isSelected 
            ? '0 0 0 3px rgba(59, 130, 246, 0.2)' 
            : '0 2px 4px rgba(14, 165, 233, 0.2)',
          minWidth: 'auto',
          minHeight: 'auto',
          maxWidth: '250px'
        };

      case ELEMENT_TYPES.RECTANGLE:
        return {
          ...baseStyle,
          width: element.width || 100,
          height: element.height || 50,
          background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'rgba(156, 163, 175, 0.1)',
          border: isSelected ? '2px solid #3b82f6' : '2px solid #6b7280',
          borderRadius: '4px',
          boxShadow: isSelected 
            ? '0 0 0 3px rgba(59, 130, 246, 0.2)' 
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

  // Handler para mousedown - MEJORADO
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

  // Handler para resize - MEJORADO con elemento completo
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
            overflow: 'hidden',
            display: 'flex',
            alignItems: element.type === ELEMENT_TYPES.TEXT ? 'flex-start' : 'center',
            justifyContent: 'flex-start',
            wordWrap: 'break-word',
            whiteSpace: element.type === ELEMENT_TYPES.TEXT ? 'pre-wrap' : 'nowrap',
            pointerEvents: 'none' // Importante: evitar interferencia
          }}>
            {getElementContent()}
          </div>
        )}
        
        {/* Textarea para edición inline - MEJORADO */}
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
              fontSize: 'inherit',
              fontFamily: 'inherit',
              fontWeight: 'inherit',
              color: 'inherit',
              padding: '8px 12px',
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
          
          {/* Borde de selección */}
          <div style={{
            position: 'absolute',
            left: element.x - 2,
            top: element.y - 2,
            width: (element.width || 100) + 4,
            height: (element.height || 50) + 4,
            border: '1px dashed #3b82f6',
            borderRadius: '4px',
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