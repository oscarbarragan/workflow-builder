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
      
      // Aplicar rotación si existe y es diferente de 0
      if (element.rotation && element.rotation !== 0) {
        transforms.push(`rotate(${element.rotation}deg)`);
      }
      
      // Aplicar escala si existe y es diferente de 1
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
        transform: this.generateTransform(element),
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
        case 'TEXT':
          return {
            ...baseStyles,
            ...this.getTextStyles(element)
          };
          
        case 'RECTANGLE':
          return {
            ...baseStyles,
            ...this.getRectangleStyles(element)
          };
          
        case 'VARIABLE':
          return {
            ...baseStyles,
            ...this.getVariableStyles(element)
          };
          
        default:
          return baseStyles;
      }
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
     * Aplica transformaciones a un elemento DOM directamente
     * @param {HTMLElement} domElement - Elemento DOM
     * @param {Object} element - Datos del elemento
     */
    applyTransformToDOM(domElement, element) {
      if (!domElement) return;
      
      const transform = this.generateTransform(element);
      domElement.style.transform = transform;
      domElement.style.transformOrigin = 'center center';
      
      // Aplicar opacidad
      if (element.opacity !== undefined) {
        domElement.style.opacity = element.opacity;
      }
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
     * Verifica si un elemento tiene transformaciones aplicadas
     * @param {Object} element - Elemento del layout
     * @returns {boolean}
     */
    hasTransformations(element) {
      return (element.rotation && element.rotation !== 0) || 
             (element.scale && element.scale !== 1) ||
             (element.rotationX && element.rotationX !== 0) ||
             (element.rotationY && element.rotationY !== 0);
    }
  };
  
  export default elementTransforms;