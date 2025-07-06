// src/components/layoutDesigner/utils/elementTransforms.js

/**
 * Utilidades para aplicar transformaciones CSS a elementos del Layout Designer
 */

export const elementTransforms = {
  /**
   * Genera el string de transform CSS para un elemento
   * @param {Object} element - Elemento con propiedades de transformación
   * @returns {string} - String CSS para transform
   */
  generateTransform(element) {
    const transforms = [];
    
    // ✅ CORREGIDO: Aplicar rotación si existe y es diferente de 0
    if (element.rotation && element.rotation !== 0) {
      transforms.push(`rotate(${element.rotation}deg)`);
    }
    
    // ✅ CORREGIDO: Aplicar escala si existe y es diferente de 1
    if (element.scale && element.scale !== 1) {
      transforms.push(`scale(${element.scale})`);
    }
    
    // Si hay rotaciones en X o Y (para futuro)
    if (element.rotationX && element.rotationX !== 0) {
      transforms.push(`rotateX(${element.rotationX}deg)`);
    }
    
    if (element.rotationY && element.rotationY !== 0) {
      transforms.push(`rotateY(${element.rotationY}deg)`);
    }
    
    return transforms.length > 0 ? transforms.join(' ') : 'none';
  },

  /**
   * ✅ NUEVO: Genera transformaciones específicas para elementos rotados
   */
  generateElementTransform(element) {
    console.log('🔄 Generating transform for element:', element.id, 'rotation:', element.rotation, 'scale:', element.scale);
    
    const transforms = [];
    
    // Rotación
    if (element.rotation !== undefined && element.rotation !== null && element.rotation !== 0) {
      transforms.push(`rotate(${element.rotation}deg)`);
      console.log('🔄 Added rotation:', element.rotation);
    }
    
    // Escala
    if (element.scale !== undefined && element.scale !== null && element.scale !== 1) {
      transforms.push(`scale(${element.scale})`);
      console.log('🔍 Added scale:', element.scale);
    }
    
    const result = transforms.length > 0 ? transforms.join(' ') : 'none';
    console.log('✅ Final transform:', result);
    return result;
  },

  /**
   * Genera todos los estilos CSS para un elemento
   * @param {Object} element - Elemento del layout
   * @returns {Object} - Objeto con estilos CSS
   */
  generateElementStyles(element) {
    const baseStyles = {
      position: 'absolute',
      left: `${element.x || 0}px`,
      top: `${element.y || 0}px`,
      zIndex: element.zIndex || 100,
      opacity: element.opacity !== undefined ? element.opacity : 1,
      transform: this.generateElementTransform(element),
      transformOrigin: 'center center',
      transition: 'transform 0.2s ease, opacity 0.2s ease',
      cursor: 'pointer',
      userSelect: 'none',
      boxSizing: 'border-box'
    };

    // Aplicar dimensiones si están definidas
    if (element.width) {
      baseStyles.width = `${element.width}px`;
    }
    if (element.height) {
      baseStyles.height = `${element.height}px`;
    }

    // Aplicar visibilidad
    if (element.visible === false) {
      baseStyles.display = 'none';
    }

    // Estilos específicos por tipo de elemento
    switch (element.type) {
      case 'text':
        return {
          ...baseStyles,
          ...this.getTextStyles(element)
        };
        
      case 'rectangle':
        return {
          ...baseStyles,
          ...this.getRectangleStyles(element)
        };
        
      case 'variable':
        return {
          ...baseStyles,
          ...this.getVariableStyles(element)
        };
        
      default:
        return baseStyles;
    }
  },

  /**
   * ✅ NUEVO: Aplica transformaciones directamente a un elemento DOM
   */
  applyTransformToElement(domElement, element) {
    if (!domElement || !element) return;
    
    const transform = this.generateElementTransform(element);
    domElement.style.transform = transform;
    domElement.style.transformOrigin = 'center center';
    
    console.log('🎯 Applied transform to DOM:', element.id, transform);
  },

  /**
   * Estilos específicos para elementos de texto
   */
  getTextStyles(element) {
    const textStyle = element.textStyle || {};
    
    return {
      fontSize: `${textStyle.fontSize || 14}px`,
      fontFamily: textStyle.fontFamily || 'Arial, sans-serif',
      color: textStyle.color || '#000000',
      fontWeight: textStyle.bold ? 'bold' : 'normal',
      fontStyle: textStyle.italic ? 'italic' : 'normal',
      textDecoration: [
        textStyle.underline ? 'underline' : '',
        textStyle.strikethrough ? 'line-through' : ''
      ].filter(Boolean).join(' ') || 'none',
      padding: element.padding || '8px 12px',
      border: element.borderStyle ? this.getBorderStyle(element) : 'none',
      backgroundColor: element.fillStyle?.backgroundColor || 'transparent',
      borderRadius: element.fillStyle?.borderRadius ? `${element.fillStyle.borderRadius}px` : '0',
      // Aplicar estilos de párrafo si existen
      ...(element.paragraphStyle && {
        textAlign: element.paragraphStyle.alignment || 'left',
        lineHeight: element.paragraphStyle.lineHeight || 1.4,
        letterSpacing: `${element.paragraphStyle.letterSpacing || 0}px`
      })
    };
  },

  /**
   * Estilos específicos para elementos rectángulo
   */
  getRectangleStyles(element) {
    return {
      backgroundColor: element.fillColor || 'rgba(156, 163, 175, 0.1)',
      border: `${element.borderWidth || 2}px solid ${element.borderColor || '#6b7280'}`,
      borderRadius: `${element.borderRadius || 4}px`,
      minWidth: element.width ? 'auto' : '100px',
      minHeight: element.height ? 'auto' : '60px'
    };
  },

  /**
   * Estilos específicos para elementos variable
   */
  getVariableStyles(element) {
    const textStyle = element.textStyle || {};
    
    return {
      fontSize: `${textStyle.fontSize || 14}px`,
      fontFamily: textStyle.fontFamily || 'Arial, sans-serif, monospace',
      color: textStyle.color || '#3b82f6',
      fontWeight: textStyle.bold ? 'bold' : 'normal',
      fontStyle: textStyle.italic ? 'italic' : 'normal',
      padding: '4px 8px',
      backgroundColor: '#eff6ff',
      border: '1px dashed #3b82f6',
      borderRadius: '4px',
      fontSize: '12px'
    };
  },

  /**
   * Genera estilo de borde desde borderStyle
   */
  getBorderStyle(element) {
    const borderStyle = element.borderStyle || {};
    return `${borderStyle.width || 1}px ${borderStyle.style || 'solid'} ${borderStyle.color || '#d1d5db'}`;
  },

  /**
   * Calcula las dimensiones reales de un elemento transformado
   * @param {Object} element - Elemento del layout
   * @returns {Object} - Dimensiones transformadas
   */
  getTransformedBounds(element) {
    const width = element.width || 100;
    const height = element.height || 60;
    const scale = element.scale || 1;
    
    return {
      width: width * scale,
      height: height * scale,
      centerX: element.x + (width * scale) / 2,
      centerY: element.y + (height * scale) / 2
    };
  },

  /**
   * ✅ NUEVO: Calcula la posición de los handles de resize considerando rotación
   */
  getTransformedResizeHandles(element) {
    const width = element.width || 100;
    const height = element.height || 50;
    const rotation = element.rotation || 0;
    const scale = element.scale || 1;
    
    // Posiciones base de los handles (sin rotación)
    const baseHandles = [
      { corner: 'top-left', x: -4, y: -4, cursor: 'nw-resize' },
      { corner: 'top-right', x: width - 4, y: -4, cursor: 'ne-resize' },
      { corner: 'bottom-left', x: -4, y: height - 4, cursor: 'sw-resize' },
      { corner: 'bottom-right', x: width - 4, y: height - 4, cursor: 'se-resize' }
    ];
    
    // Si hay rotación, calcular las nuevas posiciones
    if (rotation !== 0) {
      const rad = (rotation * Math.PI) / 180;
      const centerX = width / 2;
      const centerY = height / 2;
      
      return baseHandles.map(handle => {
        const relX = handle.x - centerX;
        const relY = handle.y - centerY;
        
        const newX = relX * Math.cos(rad) - relY * Math.sin(rad);
        const newY = relX * Math.sin(rad) + relY * Math.cos(rad);
        
        return {
          ...handle,
          x: element.x + centerX + newX,
          y: element.y + centerY + newY
        };
      });
    }
    
    // Sin rotación, posiciones normales
    return baseHandles.map(handle => ({
      ...handle,
      x: element.x + handle.x,
      y: element.y + handle.y
    }));
  },

  /**
   * Verifica si un elemento tiene transformaciones aplicadas
   * @param {Object} element - Elemento del layout
   * @returns {boolean}
   */
  hasTransformations(element) {
    return (element.rotation && element.rotation !== 0) || 
           (element.scale && element.scale !== 1) ||
           (element.rotationX && element.rotationX !== 0) ||
           (element.rotationY && element.rotationY !== 0);
  },

  /**
   * ✅ NUEVO: Resetea todas las transformaciones de un elemento
   */
  resetTransformations(element) {
    return {
      ...element,
      rotation: 0,
      scale: 1,
      rotationX: 0,
      rotationY: 0
    };
  },

  /**
   * ✅ NUEVO: Aplica una rotación específica
   */
  applyRotation(element, degrees) {
    return {
      ...element,
      rotation: degrees
    };
  },

  /**
   * ✅ NUEVO: Aplica una escala específica
   */
  applyScale(element, scaleValue) {
    return {
      ...element,
      scale: scaleValue
    };
  }
};

export default elementTransforms;