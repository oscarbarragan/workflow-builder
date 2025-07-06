// src/components/layoutDesigner/components/TextBox/TextBox.styles.js - CORREGIDO
export const textBoxStyles = {
  container: (element, isSelected, isDragging, isEditing, finalStyles, isLocked = false) => {
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
    
    // ✅ NUEVO: Función para generar bordes selectivos
    const generateSelectiveBorders = () => {
      // Verificar si hay un estilo de borde aplicado
      const borderStyle = element.borderStyle || finalStyles.borderStyle || {};
      const borderStyleId = element.borderStyleId;
      
      // Si no hay estilo de borde, usar valores por defecto
      if (!borderStyle.width && !borderStyleId) {
        return isEditing 
          ? { border: '2px solid #3b82f6' }
          : isLocked
            ? { border: '2px dashed #dc2626' }
            : isSelected 
              ? { border: '1px dashed #3b82f6' }
              : { border: '1px dashed rgba(156, 163, 175, 0.3)' };
      }
      
      // Obtener propiedades del borde
      const width = borderStyle.width || 1;
      const style = borderStyle.style || 'solid';
      const color = borderStyle.color || '#d1d5db';
      const sides = borderStyle.sides || ['top', 'right', 'bottom', 'left'];
      
      console.log('🔲 Applying selective borders:', { width, style, color, sides });
      
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
      
      console.log('✅ Generated border styles:', borderStyles);
      return borderStyles;
    };
    
    // Cursor y interacciones basadas en el estado bloqueado
    let cursor = 'grab';
    if (isLocked) {
      cursor = 'not-allowed';
    } else if (isDragging && isSelected) {
      cursor = 'grabbing';
    } else if (isEditing) {
      cursor = 'text';
    }
    
    const baseStyles = {
      position: 'absolute',
      left: element.x,
      top: element.y,
      width: element.width || 200,
      height: element.height || 'auto',
      minHeight: element.height || 40,
      padding: element.padding || '8px 12px',
      cursor: cursor,
      userSelect: isEditing && !isLocked ? 'text' : 'none',
      WebkitUserSelect: isEditing && !isLocked ? 'text' : 'none',
      MozUserSelect: isEditing && !isLocked ? 'text' : 'none',
      msUserSelect: isEditing && !isLocked ? 'text' : 'none',
      transition: (isDragging || isEditing) ? 'none' : 'all 0.15s ease',
      zIndex: isSelected ? 1000 : 100,
      pointerEvents: 'auto',
      touchAction: 'none',
      boxSizing: 'border-box',
      overflow: 'visible',
      display: 'flex',
      alignItems: finalStyles.textAlign === 'center' ? 'center' : 'flex-start',
      justifyContent: finalStyles.textAlign === 'center' ? 'center' : 
                     finalStyles.textAlign === 'right' ? 'flex-end' : 'flex-start',
      
      // Aplicar transformaciones
      transform: transformString,
      transformOrigin: 'center center',
      
      // Aplicar estilos finales
      ...finalStyles,
      
      // ✅ CORREGIDO: Aplicar bordes selectivos
      ...generateSelectiveBorders(),
      
      // Radio de borde
      borderRadius: (element.borderStyle?.radius !== undefined) 
        ? `${element.borderStyle.radius}px`
        : (finalStyles.borderRadius || '0'),
      
      // Fondo diferente para elementos bloqueados
      backgroundColor: isLocked
        ? 'rgba(220, 38, 38, 0.05)'
        : isSelected && finalStyles.backgroundColor === 'transparent' 
          ? 'rgba(59, 130, 246, 0.02)' 
          : finalStyles.backgroundColor,
      
      // Sombra diferente para elementos bloqueados
      boxShadow: isLocked
        ? '0 0 0 1px rgba(220, 38, 38, 0.3), inset 0 0 0 1px rgba(220, 38, 38, 0.1)'
        : isSelected 
          ? '0 0 0 1px rgba(59, 130, 246, 0.3), ' + (finalStyles.boxShadow || 'none')
          : finalStyles.boxShadow || 'none',
      
      // Opacidad reducida para elementos bloqueados
      opacity: isLocked ? (finalStyles.opacity || 1) * 0.7 : (finalStyles.opacity || 1)
    };
    
    return baseStyles;
  },

  content: (elementStyle) => ({
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
  }),

  textarea: (elementStyle, element) => ({
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
    textAlign: elementStyle.textAlign,
    lineHeight: elementStyle.lineHeight,
    padding: element.padding || '8px 12px',
    margin: 0,
    boxSizing: 'border-box',
    outline: 'none',
    resize: 'none',
    overflow: 'auto',
    zIndex: 1001,
    // El textarea NO debe heredar la rotación
    transform: 'none',
    transformOrigin: 'center center'
  }),

  variableHighlight: (isValid) => ({
    background: isValid 
      ? 'rgba(59, 130, 246, 0.15)' 
      : 'rgba(239, 68, 68, 0.15)',
    color: isValid ? '#1e40af' : '#dc2626',
    padding: '1px 3px',
    borderRadius: '3px',
    border: isValid 
      ? '1px solid rgba(59, 130, 246, 0.4)' 
      : '1px solid rgba(239, 68, 68, 0.4)',
    fontSize: '0.95em',
    fontWeight: '600',
    fontFamily: 'monospace',
    display: 'inline'
  }),

  tooltip: (x, y, isDark = false) => ({
    position: 'absolute',
    left: x,
    top: y - (isDark ? 35 : 30),
    background: isDark ? '#059669' : '#1f2937',
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

  // Indicador de bloqueo
  lockIndicator: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    width: '20px',
    height: '20px',
    background: '#dc2626',
    color: 'white',
    border: '2px solid white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '10px',
    fontWeight: 'bold',
    zIndex: 2001,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    pointerEvents: 'none',
    // Sin transformaciones para que siempre sea visible
    transform: 'none'
  }
};