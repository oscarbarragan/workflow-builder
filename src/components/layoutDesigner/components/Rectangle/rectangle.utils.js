// src/components/layoutDesigner/components/Rectangle/rectangle.utils.js
export const rectangleUtils = {
    // Validar propiedades del rectángulo
    validateProperties: (props) => {
      const errors = {};
      
      if (props.width < 10 || props.width > 1000) {
        errors.width = 'El ancho debe estar entre 10 y 1000 píxeles';
      }
      
      if (props.height < 10 || props.height > 1000) {
        errors.height = 'La altura debe estar entre 10 y 1000 píxeles';
      }
      
      if (props.borderWidth < 0 || props.borderWidth > 20) {
        errors.borderWidth = 'El grosor del borde debe estar entre 0 y 20 píxeles';
      }
      
      if (props.borderRadius < 0 || props.borderRadius > 50) {
        errors.borderRadius = 'El radio del borde debe estar entre 0 y 50 píxeles';
      }
      
      return {
        isValid: Object.keys(errors).length === 0,
        errors
      };
    },
  
    // Generar estilos CSS a partir de las propiedades
    generateCSS: (element) => {
      return {
        width: `${element.width || 100}px`,
        height: `${element.height || 50}px`,
        backgroundColor: element.fillColor || 'rgba(156, 163, 175, 0.1)',
        borderWidth: `${element.borderWidth || 2}px`,
        borderStyle: element.borderStyle || 'solid',
        borderColor: element.borderColor || '#6b7280',
        borderRadius: `${element.borderRadius || 4}px`,
        opacity: element.opacity !== undefined ? element.opacity : 1
      };
    },
  
    // Aplicar estilos desde el StyleManager
    applyStyleManagerStyles: (element, styleManager) => {
      const appliedStyles = {
        borderStyle: {},
        fillStyle: {}
      };
  
      if (element.borderStyleId && styleManager) {
        const borderStyle = styleManager.getBorderStyle(element.borderStyleId);
        if (borderStyle) {
          appliedStyles.borderStyle = { ...borderStyle };
        }
      }
  
      if (element.fillStyleId && styleManager) {
        const fillStyle = styleManager.getFillStyle(element.fillStyleId);
        if (fillStyle) {
          appliedStyles.fillStyle = { ...fillStyle };
        }
      }
  
      return appliedStyles;
    },
  
    // Combinar estilos manuales con estilos del StyleManager
    getFinalStyles: (element, appliedStyles) => {
      const { borderStyle, fillStyle } = appliedStyles;
      
      return {
        width: element.width || 100,
        height: element.height || 50,
        fillColor: fillStyle.backgroundColor || element.fillColor || 'rgba(156, 163, 175, 0.1)',
        borderWidth: borderStyle.width !== undefined ? borderStyle.width : (element.borderWidth || 2),
        borderStyle: borderStyle.style || element.borderStyle || 'solid',
        borderColor: borderStyle.color || element.borderColor || '#6b7280',
        borderRadius: borderStyle.radius !== undefined ? borderStyle.radius : (element.borderRadius || 4),
        opacity: fillStyle.opacity !== undefined ? fillStyle.opacity : (element.opacity !== undefined ? element.opacity : 1)
      };
    },
  
    // Calcular posiciones de los handles de resize
    getResizeHandles: (element) => {
      const width = element.width || 100;
      const height = element.height || 50;
      
      return [
        { corner: 'top-left', x: element.x - 4, y: element.y - 4, cursor: 'nw-resize' },
        { corner: 'top-right', x: element.x + width - 4, y: element.y - 4, cursor: 'ne-resize' },
        { corner: 'bottom-left', x: element.x - 4, y: element.y + height - 4, cursor: 'sw-resize' },
        { corner: 'bottom-right', x: element.x + width - 4, y: element.y + height - 4, cursor: 'se-resize' }
      ];
    },
  
    // Generar información para el tooltip
    getTooltipInfo: (element) => {
      const width = element.width || 100;
      const height = element.height || 50;
      const x = Math.round(element.x);
      const y = Math.round(element.y);
      
      return `${element.type} | (${x}, ${y}) | ${width}×${height}`;
    },
  
    // Verificar si el rectángulo tiene estilos aplicados
    hasAppliedStyles: (element) => {
      return !!(element.borderStyleId || element.fillStyleId);
    },
  
    // Obtener colores predefinidos para relleno
    getPresetFillColors: () => [
      { name: 'Transparente', value: 'transparent' },
      { name: 'Blanco', value: '#ffffff' },
      { name: 'Gris claro', value: '#f3f4f6' },
      { name: 'Gris', value: '#9ca3af' },
      { name: 'Azul claro', value: '#eff6ff' },
      { name: 'Verde claro', value: '#f0fdf4' },
      { name: 'Amarillo claro', value: '#fefce8' },
      { name: 'Rojo claro', value: '#fef2f2' }
    ],
  
    // Obtener colores predefinidos para borde
    getPresetBorderColors: () => [
      { name: 'Gris', value: '#6b7280' },
      { name: 'Negro', value: '#000000' },
      { name: 'Azul', value: '#3b82f6' },
      { name: 'Verde', value: '#16a34a' },
      { name: 'Amarillo', value: '#f59e0b' },
      { name: 'Rojo', value: '#dc2626' },
      { name: 'Púrpura', value: '#7c3aed' },
      { name: 'Rosa', value: '#ec4899' }
    ]
  };