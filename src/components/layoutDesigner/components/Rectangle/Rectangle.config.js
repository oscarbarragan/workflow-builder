// src/components/layoutDesigner/components/Rectangle/Rectangle.config.js
export const rectangleConfig = {
    name: 'Rectangle',
    type: 'rectangle',
    category: 'shapes',
    icon: '⬜',
    
    defaultProps: {
      width: 100,
      height: 50,
      fillColor: 'rgba(156, 163, 175, 0.1)',
      borderColor: '#6b7280',
      borderWidth: 2,
      borderStyle: 'solid',
      borderRadius: 4
    },
  
    editableProperties: [
      'width',
      'height',
      'fillColor',
      'borderColor',
      'borderWidth',
      'borderStyle',
      'borderRadius',
      'borderStyleId',
      'fillStyleId'
    ],
  
    resizable: true,
    draggable: true,
    editable: false,
  
    validation: {
      width: {
        min: 10,
        max: 1000
      },
      height: {
        min: 10,
        max: 1000
      },
      borderWidth: {
        min: 0,
        max: 20
      },
      borderRadius: {
        min: 0,
        max: 50
      }
    },
  
    borderStyles: [
      { value: 'none', label: 'Sin borde' },
      { value: 'solid', label: 'Sólido' },
      { value: 'dashed', label: 'Punteado' },
      { value: 'dotted', label: 'Puntos' },
      { value: 'double', label: 'Doble' }
    ]
  };