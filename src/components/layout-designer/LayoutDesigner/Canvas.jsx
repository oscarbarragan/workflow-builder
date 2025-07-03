import React, { useCallback } from 'react';
import LayoutElement from '../elements/LayoutElement';
import EnhancedTextElement from '../elements/EnhancedTextElement';
import { EXTENDED_ELEMENT_TYPES } from '../../../utils/StyleManager';

const Canvas = ({ 
  elements, 
  selectedElement, 
  isDragging,
  isResizing,
  onMouseMove, 
  onMouseUp, 
  onCanvasClick,
  onElementMouseDown,
  onResizeStart,
  onTextChange,
  onElementDoubleClick,
  availableVariables = {},
  showVariableValues = false
}) => {
  const canvasStyle = {
    flex: '1',
    minWidth: '500px',
    border: '3px solid #3b82f6',
    borderRadius: '12px',
    background: 'white',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.2)',
    backgroundImage: `
      repeating-linear-gradient(0deg, transparent, transparent 19px, #e5e7eb 20px),
      repeating-linear-gradient(90deg, transparent, transparent 19px, #e5e7eb 20px)
    `,
    backgroundSize: '20px 20px'
  };

  const canvasWrapperStyle = {
    width: '100%',
    height: '100%',
    position: 'relative',
    cursor: isDragging ? 'grabbing' : isResizing ? 'auto' : 'default',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    msUserSelect: 'none'
  };

  const handleCanvasMouseDown = useCallback((e) => {
    const isCanvas = e.target.getAttribute('data-canvas') === 'true';
    console.log('🎨 Canvas MouseDown:', isCanvas ? 'canvas' : 'other');
    
    if (isCanvas) {
      e.stopPropagation();
      e.preventDefault();
    }
  }, []);

  const handleCanvasMouseMove = useCallback((e) => {
    if (isDragging || isResizing) {
      console.log('🎨 Canvas MouseMove during', isDragging ? 'drag' : 'resize');
      onMouseMove && onMouseMove(e);
    }
  }, [isDragging, isResizing, onMouseMove]);

  const handleCanvasMouseUp = useCallback((e) => {
    if (isDragging || isResizing) {
      console.log('🎨 Canvas MouseUp during', isDragging ? 'drag' : 'resize');
      onMouseUp && onMouseUp(e);
    }
  }, [isDragging, isResizing, onMouseUp]);

  const handleCanvasClick = useCallback((e) => {
    const isCanvas = e.target.getAttribute('data-canvas') === 'true';
    console.log('🎨 Canvas Click:', isCanvas ? 'canvas' : 'other');
    
    if (isCanvas) {
      e.stopPropagation();
      e.preventDefault();
      console.log('🎨 Clearing selection via canvas click');
      onCanvasClick && onCanvasClick(e);
    }
  }, [onCanvasClick]);

  const handleElementMouseDown = useCallback((e, element) => {
    console.log('🎯 Canvas received element mousedown:', element.type, element.id);
    onElementMouseDown && onElementMouseDown(e, element);
  }, [onElementMouseDown]);

  const preventSelect = useCallback((e) => {
    e.preventDefault();
    return false;
  }, []);

  const preventDrag = useCallback((e) => {
    e.preventDefault();
    return false;
  }, []);

  const preventContext = useCallback((e) => {
    e.preventDefault();
    return false;
  }, []);

  // ✅ CORREGIDO: Función para renderizar el elemento apropiado SIN spread de key
  const renderElement = (element) => {
    // ✅ CRÍTICO: Separar key de las otras props
    const elementKey = element.id;
    const elementProps = {
      element: element,
      isSelected: selectedElement?.id === element.id,
      isDragging: isDragging && selectedElement?.id === element.id,
      isResizing: isResizing,
      onMouseDown: handleElementMouseDown,
      onResizeStart: onResizeStart,
      onDoubleClick: onElementDoubleClick,
      onTextChange: onTextChange
    };

    // ✅ Usar EnhancedTextElement para elementos de texto
    if (element.type === EXTENDED_ELEMENT_TYPES.TEXT || element.type === 'text') {
      return (
        <EnhancedTextElement
          key={elementKey} // ✅ CRÍTICO: key pasado directamente, no en spread
          {...elementProps}
          availableVariables={availableVariables}
          showVariableValues={showVariableValues}
        />
      );
    }

    // ✅ Usar LayoutElement para otros tipos
    return (
      <LayoutElement
        key={elementKey} // ✅ CRÍTICO: key pasado directamente, no en spread
        {...elementProps}
      />
    );
  };

  return (
    <div style={canvasStyle}>
      <div 
        data-canvas="true"
        style={canvasWrapperStyle}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onClick={handleCanvasClick}
        onDragStart={preventDrag}
        onContextMenu={preventContext}
        onMouseDownCapture={(e) => {
          if (e.target.getAttribute('data-canvas') === 'true') {
            preventSelect(e);
          }
        }}
      >
        {/* Elements Layer */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'auto',
          zIndex: 10
        }}>
          {elements && Array.isArray(elements) ? elements.map(element => {
            if (!element || !element.id) {
              console.warn('Invalid element found:', element);
              return null;
            }
            return renderElement(element);
          }) : null}
        </div>

        {/* Empty state */}
        {elements.length === 0 && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#9ca3af',
            pointerEvents: 'none',
            zIndex: 2
          }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎨</div>
            <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#6b7280' }}>
              Canvas Vacío
            </div>
            <div style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '8px' }}>
              Usa la barra de herramientas para agregar elementos
            </div>
            <div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: '500' }}>
              ✨ Estilo Inspire Designer con gestor de estilos avanzado
            </div>
          </div>
        )}

        {/* Canvas info */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          right: '12px',
          background: 'rgba(255, 255, 255, 0.95)',
          padding: '6px 12px',
          borderRadius: '8px',
          fontSize: '11px',
          color: '#6b7280',
          pointerEvents: 'none',
          zIndex: 5,
          fontWeight: '500',
          border: '1px solid #e5e7eb'
        }}>
          📊 {elements.length} elementos
          {selectedElement && (
            <span style={{ marginLeft: '12px', color: '#3b82f6' }}>
              | 🎯 {selectedElement.type}
            </span>
          )}
        </div>

        {/* Active operation overlay */}
        {(isDragging || isResizing) && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: isDragging 
              ? 'rgba(59, 130, 246, 0.03)' 
              : 'rgba(220, 38, 38, 0.03)',
            zIndex: 8,
            pointerEvents: 'none',
            border: `2px dashed ${isDragging ? '#3b82f6' : '#dc2626'}`,
            borderRadius: '8px'
          }} />
        )}

        {/* Indicador de funcionalidades */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '12px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          borderRadius: '6px',
          padding: '6px 10px',
          fontSize: '10px',
          color: '#3b82f6',
          pointerEvents: 'none',
          zIndex: 5,
          fontWeight: '500'
        }}>
          💡 Doble-clic para editar | Ctrl+Espacio para variables
        </div>
      </div>
    </div>
  );
};

export default Canvas;