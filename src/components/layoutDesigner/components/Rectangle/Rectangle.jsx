// src/components/layoutDesigner/components/Rectangle/Rectangle.jsx
import React, { useCallback, useMemo } from 'react';
import { styleManager } from '../../utils/StyleManager';
import { rectangleStyles } from './Rectangle.styles';
import { rectangleUtils } from './rectangle.utils';
import { rectangleConfig } from './Rectangle.config';

const Rectangle = ({ 
  element, 
  isSelected, 
  isDragging,
  isResizing,
  onMouseDown,
  onResizeStart
}) => {
  // Obtener estilos aplicados del StyleManager
  const appliedStyles = useMemo(() => {
    return rectangleUtils.applyStyleManagerStyles(element, styleManager);
  }, [element]);

  // Obtener estilos finales
  const finalStyles = useMemo(() => {
    return rectangleUtils.getFinalStyles(element, appliedStyles);
  }, [element, appliedStyles]);

  // Obtener handles de resize
  const resizeHandles = useMemo(() => {
    return rectangleUtils.getResizeHandles(element);
  }, [element]);

  // Event handlers
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onMouseDown(e, element);
  }, [element, onMouseDown]);

  const handleResizeMouseDown = useCallback((e, corner) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onResizeStart) {
      onResizeStart(e, element.id, corner, element);
    }
  }, [element, onResizeStart]);

  // Crear estilos del contenedor con los estilos finales
  const containerStyle = {
    ...rectangleStyles.container(element, isSelected, isDragging),
    ...rectangleUtils.generateCSS({ ...element, ...finalStyles })
  };

  const tooltipInfo = rectangleUtils.getTooltipInfo(element);
  const hasAppliedStyles = rectangleUtils.hasAppliedStyles(element);

  return (
    <>
      {/* Elemento principal */}
      <div
        style={containerStyle}
        onMouseDown={handleMouseDown}
        onDragStart={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
        title={`${tooltipInfo}${hasAppliedStyles ? ' - Con estilos aplicados' : ''}`}
        data-element-id={element.id}
        data-element-type={element.type}
      >
        {/* Contenido opcional del rectángulo */}
        <div style={rectangleStyles.content}>
          {/* Aquí se podría agregar contenido personalizable */}
        </div>
      </div>

      {/* Indicadores de selección */}
      {isSelected && (
        <>
          {/* Tooltip de información */}
          <div style={rectangleStyles.tooltip(element.x, element.y)}>
            {tooltipInfo}
            {hasAppliedStyles && (
              <span style={{ marginLeft: '8px', color: '#16a34a' }}>
                | 🎨 Con estilos
              </span>
            )}
          </div>
          
          {/* Handles de resize */}
          {resizeHandles.map(({ corner, x, y, cursor }) => (
            <div
              key={corner}
              style={rectangleStyles.resizeHandle(x, y, cursor)}
              onMouseDown={(e) => handleResizeMouseDown(e, corner)}
              title={`Redimensionar desde ${corner}`}
            />
          ))}
          
          {/* Borde de selección */}
          <div style={rectangleStyles.selectionBorder(element)} />
        </>
      )}
    </>
  );
};

export default Rectangle;