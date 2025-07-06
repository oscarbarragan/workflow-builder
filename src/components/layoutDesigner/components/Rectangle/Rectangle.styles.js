// src/components/layoutDesigner/components/Rectangle/Rectangle.styles.js - CORREGIDO
export const rectangleStyles = {
  container: (element, isSelected, isDragging) => {
    // Generar transform correctamente
    const transforms = [];
    
    // Aplicar rotación si existe
    if (element.rotation && element.rotation !== 0) {
      transforms.push(`rotate(${element.rotation}deg)`);
    }
    
    // Aplicar escala si existe  
    if (element.scale && element.scale !== 1) {
      transforms.push(`scale(${element.scale})`);
    }
    
    const transformString = transforms.length > 0 ? transforms.join(' ') : 'none';
    
    // ✅ NUEVO: Función para generar bordes selectivos para rectángulos
    const generateSelectiveBorders = () => {
      // Verificar si hay un estilo de borde aplicado
      const borderStyle = element.borderStyle || {};
      const borderStyleId = element.borderStyleId;
      
      // Si no hay estilo de borde, usar valores por defecto del elemento
      if (!borderStyle.width && !borderStyleId) {
        const defaultBorderColor = isSelected ? '#3b82f6' : (element.borderColor || '#6b7280');
        const defaultBorderWidth = element.borderWidth || 2;
        const defaultBorderStyle = element.borderStyle || 'solid';
        
        return {
          border: `${defaultBorderWidth}px ${defaultBorderStyle} ${defaultBorderColor}`
        };
      }
      
      // Obtener propiedades del borde del estilo
      const width = borderStyle.width || element.borderWidth || 2;
      const style = borderStyle.style || element.borderStyle || 'solid';
      const color = borderStyle.color || element.borderColor || '#6b7280';
      const sides = borderStyle.sides || ['top', 'right', 'bottom', 'left'];
      
      console.log('🔲 Rectangle applying selective borders:', { width, style, color, sides });
      
      // Aplicar bordes selectivos
      const borderStyles = {};
      
      // Resetear todos los bordes primero
      borderStyles.borderTop = 'none';
      borderStyles.borderRight = 'none';
      borderStyles.borderBottom = 'none';
      borderStyles.borderLeft = 'none';
      
      // Aplicar solo los bordes seleccionados
      const borderValue = `${width}px ${style} ${color}`;
      
      if (sides.includes('top')) {
        borderStyles.borderTop = borderValue;
      }
      if (sides.includes('right')) {
        borderStyles.borderRight = borderValue;
      }
      if (sides.includes('bottom')) {
        borderStyles.borderBottom = borderValue;
      }
      if (sides.includes('left')) {
        borderStyles.borderLeft = borderValue;
      }
      
      console.log('✅ Rectangle generated border styles:', borderStyles);
      return borderStyles;
    };
    
    return {
      position: 'absolute',
      left: element.x,
      top: element.y,
      width: element.width || 100,
      height: element.height || 50,
      background: element.fillColor || (isSelected ? 'rgba(59, 130, 246, 0.1)' : 'rgba(156, 163, 175, 0.1)'),
      
      // ✅ CORREGIDO: Aplicar bordes selectivos
      ...generateSelectiveBorders(),
      
      borderRadius: `${(element.borderStyle?.radius !== undefined) ? element.borderStyle.radius : (element.borderRadius || 4)}px`,
      cursor: isDragging && isSelected ? 'grabbing' : 'grab',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none',
      transition: isDragging ? 'none' : 'all 0.15s ease',
      zIndex: isSelected ? 1000 : 100,
      pointerEvents: 'auto',
      touchAction: 'none',
      boxSizing: 'border-box',
      boxShadow: isSelected 
        ? '0 0 0 2px rgba(59, 130, 246, 0.2)' 
        : '0 2px 4px rgba(0, 0, 0, 0.1)',
      opacity: element.opacity !== undefined ? element.opacity : 1,
      
      // Aplicar transformaciones
      transform: transformString,
      transformOrigin: 'center center'
    };
  },

  content: {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    color: '#9ca3af',
    fontWeight: '500',
    pointerEvents: 'none'
  },

  tooltip: (x, y) => ({
    position: 'absolute',
    left: x,
    top: y - 30,
    background: '#1f2937',
    color: 'white',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '10px',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    pointerEvents: 'none',
    zIndex: 2000,
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
    // Tooltip sin transformaciones
    transform: 'none'
  }),

  resizeHandle: (x, y, cursor) => ({
    position: 'absolute',
    left: x,
    top: y,
    width: 8,
    height: 8,
    background: '#3b82f6',
    border: '1px solid white',
    borderRadius: '2px',
    cursor,
    zIndex: 2000,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
    pointerEvents: 'auto',
    // Handles sin transformaciones
    transform: 'none'
  }),

  selectionBorder: (element) => {
    // El borde de selección debe tener las mismas transformaciones
    const transforms = [];
    
    if (element.rotation && element.rotation !== 0) {
      transforms.push(`rotate(${element.rotation}deg)`);
    }
    
    if (element.scale && element.scale !== 1) {
      transforms.push(`scale(${element.scale})`);
    }
    
    const transformString = transforms.length > 0 ? transforms.join(' ') : 'none';
    
    return {
      position: 'absolute',
      left: element.x - 1,
      top: element.y - 1,
      width: (element.width || 100) + 2,
      height: (element.height || 50) + 2,
      border: '1px dashed #3b82f6',
      borderRadius: `${((element.borderStyle?.radius !== undefined) ? element.borderStyle.radius : (element.borderRadius || 4)) + 1}px`,
      pointerEvents: 'none',
      zIndex: 1500,
      opacity: 0.7,
      transform: transformString,
      transformOrigin: 'center center'
    };
  }
};