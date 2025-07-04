// src/components/layoutDesigner/Canvas/Canvas.jsx
import React, { useCallback } from 'react';
import { TextBox, Variable, Rectangle } from '../components';
import { ELEMENT_TYPES } from '../utils/constants';
import { canvasStyles } from './Canvas.styles';
import { canvasUtils } from './Canvas.utils';

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
  // Event handlers
  const handleCanvasMouseDown = useCallback((e) => {
    const isCanvas = canvasUtils.isCanvasElement(e.target);
    
    if (isCanvas) {
      e.stopPropagation();
      e.preventDefault();
    }
  }, []);

  const handleCanvasMouseMove = useCallback((e) => {
    if (isDragging || isResizing) {
      onMouseMove && onMouseMove(e);
    }
  }, [isDragging, isResizing, onMouseMove]);

  const handleCanvasMouseUp = useCallback((e) => {
    if (isDragging || isResizing) {
      onMouseUp && onMouseUp(e);
    }
  }, [isDragging, isResizing, onMouseUp]);

  const handleCanvasClick = useCallback((e) => {
    const isCanvas = canvasUtils.isCanvasElement(e.target);
    
    if (isCanvas) {
      e.stopPropagation();
      e.preventDefault();
      onCanvasClick && onCanvasClick(e);
    }
  }, [onCanvasClick]);

  const handleElementMouseDown = useCallback((e, element) => {
    onElementMouseDown && onElementMouseDown(e, element);
  }, [onElementMouseDown]);

  // Element renderer
  const renderElement = (element) => {
    if (!canvasUtils.validateElement(element)) {
      return null;
    }

    const elementKey = canvasUtils.getElementKey(element);
    const commonProps = {
      element: element,
      isSelected: selectedElement?.id === element.id,
      isDragging: isDragging && selectedElement?.id === element.id,
      isResizing: isResizing,
      onMouseDown: handleElementMouseDown,
      onResizeStart: onResizeStart,
      onDoubleClick: onElementDoubleClick,
      onTextChange: onTextChange,
      availableVariables: availableVariables,
      showVariableValues: showVariableValues
    };

    switch (element.type) {
      case ELEMENT_TYPES.TEXT:
        return (
          <TextBox
            key={elementKey}
            {...commonProps}
          />
        );
      
      case ELEMENT_TYPES.VARIABLE:
        return (
          <Variable
            key={elementKey}
            {...commonProps}
          />
        );
      
      case ELEMENT_TYPES.RECTANGLE:
        return (
          <Rectangle
            key={elementKey}
            {...commonProps}
          />
        );
      
      default:
        console.warn('Unknown element type:', element.type);
        return null;
    }
  };

  const canvasInfo = canvasUtils.getCanvasInfo(elements, selectedElement);

  return (
    <div style={canvasStyles.container}>
      <div 
        data-canvas="true"
        style={canvasStyles.wrapper(isDragging, isResizing)}
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onClick={handleCanvasClick}
        onDragStart={canvasUtils.preventDrag}
        onContextMenu={canvasUtils.preventContext}
        onMouseDownCapture={(e) => {
          if (canvasUtils.isCanvasElement(e.target)) {
            canvasUtils.preventSelect(e);
          }
        }}
      >
        {/* Elements Layer */}
        <div style={canvasStyles.elementsLayer}>
          {elements && Array.isArray(elements) ? 
            elements.map(element => renderElement(element)) : 
            null
          }
        </div>

        {/* Empty state */}
        {elements.length === 0 && (
          <div style={canvasStyles.emptyState}>
            <div style={canvasStyles.emptyStateIcon}>🎨</div>
            <div style={canvasStyles.emptyStateTitle}>
              Canvas Vacío
            </div>
            <div style={canvasStyles.emptyStateDescription}>
              Usa la barra de herramientas para agregar elementos
            </div>
            <div style={canvasStyles.emptyStateBrand}>
              ✨ Estilo Inspire Designer con gestor de estilos avanzado
            </div>
          </div>
        )}

        {/* Canvas info */}
        <div style={canvasStyles.statsOverlay}>
          📊 {canvasInfo.totalElements} elementos
          {canvasInfo.selectedType && (
            <span style={canvasStyles.selectedElementInfo}>
              | 🎯 {canvasInfo.selectedType}
            </span>
          )}
        </div>

        {/* Active operation overlay */}
        {(isDragging || isResizing) && (
          <div style={canvasStyles.operationOverlay(isDragging)} />
        )}

        {/* Features indicator */}
        <div style={canvasStyles.featuresIndicator}>
          💡 Doble-clic para editar | Ctrl+Espacio para variables
        </div>
      </div>
    </div>
  );
};

export default Canvas;