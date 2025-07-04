// src/components/layoutDesigner/PropertiesPanel/properties.config.js
import { ELEMENT_TYPES } from '../utils/constants';

export const propertiesConfig = {
  tabs: [
    {
      id: 'basic',
      label: 'Básico',
      icon: '⚙️',
      description: 'Propiedades básicas del elemento'
    },
    {
      id: 'textStyle',
      label: 'Text Style',
      icon: '🔤',
      description: 'Configuración de estilo de texto',
      elementTypes: [ELEMENT_TYPES.TEXT, ELEMENT_TYPES.VARIABLE]
    },
    {
      id: 'paragraph',
      label: 'Paragraph',
      icon: '📄',
      description: 'Configuración de párrafo',
      elementTypes: [ELEMENT_TYPES.TEXT]
    },
    {
      id: 'border',
      label: 'Border',
      icon: '🔲',
      description: 'Configuración de bordes'
    },
    {
      id: 'fill',
      label: 'Relleno',
      icon: '🎨',
      description: 'Configuración de relleno y fondo'
    }
  ],

  // Configuración de Text Style
  textStyleConfig: {
    properties: {
      fontFamily: {
        label: 'Fuente',
        type: 'select',
        options: [
          { value: 'Arial, sans-serif', label: 'Arial' },
          { value: 'Times, serif', label: 'Times New Roman' },
          { value: 'Helvetica, sans-serif', label: 'Helvetica' },
          { value: 'Georgia, serif', label: 'Georgia' },
          { value: 'Verdana, sans-serif', label: 'Verdana' },
          { value: 'Courier, monospace', label: 'Courier New' },
          { value: 'Tahoma, sans-serif', label: 'Tahoma' },
          { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet MS' },
          { value: 'Impact, sans-serif', label: 'Impact' },
          { value: 'Comic Sans MS, cursive', label: 'Comic Sans MS' }
        ],
        default: 'Arial, sans-serif'
      },
      fontSize: {
        label: 'Tamaño',
        type: 'number',
        min: 6,
        max: 144,
        step: 1,
        default: 14,
        unit: 'px'
      },
      color: {
        label: 'Color',
        type: 'color',
        default: '#000000',
        presets: [
          '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF',
          '#FFFF00', '#FF00FF', '#00FFFF', '#808080', '#FFA500'
        ]
      },
      bold: {
        label: 'Negrita',
        type: 'boolean',
        default: false
      },
      italic: {
        label: 'Cursiva',
        type: 'boolean',
        default: false
      },
      underline: {
        label: 'Subrayado',
        type: 'boolean',
        default: false
      },
      strikethrough: {
        label: 'Tachado',
        type: 'boolean',
        default: false
      },
      scale: {
        label: 'Escala',
        type: 'number',
        min: 0.1,
        max: 5.0,
        step: 0.1,
        default: 1.0,
        unit: 'x'
      },
      link: {
        label: 'Enlace',
        type: 'text',
        placeholder: 'https://... o {{variable}}',
        default: ''
      }
    },
    categories: [
      { value: 'custom', label: 'Personalizado' },
      { value: 'headings', label: 'Títulos' },
      { value: 'body', label: 'Cuerpo' },
      { value: 'display', label: 'Display' },
      { value: 'decorative', label: 'Decorativo' }
    ]
  },

  // Configuración de Paragraph
  paragraphConfig: {
    properties: {
      lineHeight: {
        label: 'Interlineado',
        type: 'number',
        min: 0.5,
        max: 5.0,
        step: 0.1,
        default: 1.4,
        unit: ''
      },
      alignment: {
        label: 'Alineación',
        type: 'select',
        options: [
          { value: 'left', label: 'Izquierda', icon: '⬅️' },
          { value: 'center', label: 'Centro', icon: '↔️' },
          { value: 'right', label: 'Derecha', icon: '➡️' },
          { value: 'justify', label: 'Justificado', icon: '⬌' }
        ],
        default: 'left'
      },
      indent: {
        label: 'Sangría',
        type: 'number',
        min: 0,
        max: 200,
        step: 1,
        default: 0,
        unit: 'px'
      },
      leftSpacing: {
        label: 'Espacio Izquierda',
        type: 'number',
        min: 0,
        max: 100,
        step: 1,
        default: 0,
        unit: 'px'
      },
      rightSpacing: {
        label: 'Espacio Derecha',
        type: 'number',
        min: 0,
        max: 100,
        step: 1,
        default: 0,
        unit: 'px'
      },
      firstLineIndent: {
        label: 'Sangría Primera Línea',
        type: 'number',
        min: -100,
        max: 200,
        step: 1,
        default: 0,
        unit: 'px'
      },
      wordWrap: {
        label: 'Ajuste de Línea Automático',
        type: 'boolean',
        default: true
      },
      spaceBefore: {
        label: 'Espacio Antes',
        type: 'number',
        min: 0,
        max: 100,
        step: 1,
        default: 0,
        unit: 'px'
      },
      spaceAfter: {
        label: 'Espacio Después',
        type: 'number',
        min: 0,
        max: 100,
        step: 1,
        default: 0,
        unit: 'px'
      }
    },
    categories: [
      { value: 'custom', label: 'Personalizado' },
      { value: 'basic', label: 'Básico' },
      { value: 'advanced', label: 'Avanzado' },
      { value: 'special', label: 'Especial' }
    ]
  },

  // Configuración de Border
  borderConfig: {
    properties: {
      width: {
        label: 'Grosor',
        type: 'number',
        min: 0,
        max: 50,
        step: 1,
        default: 1,
        unit: 'px'
      },
      style: {
        label: 'Estilo',
        type: 'select',
        options: [
          { value: 'none', label: 'Sin borde' },
          { value: 'solid', label: 'Sólido' },
          { value: 'dashed', label: 'Punteado' },
          { value: 'dotted', label: 'Puntos' },
          { value: 'double', label: 'Doble' },
          { value: 'groove', label: 'Biselado' },
          { value: 'ridge', label: 'Relieve' },
          { value: 'inset', label: 'Hundido' },
          { value: 'outset', label: 'Elevado' }
        ],
        default: 'solid'
      },
      color: {
        label: 'Color',
        type: 'color',
        default: '#000000',
        presets: [
          '#000000', '#808080', '#C0C0C0', '#FFFFFF',
          '#FF0000', '#00FF00', '#0000FF', '#FFFF00'
        ]
      },
      radius: {
        label: 'Radio',
        type: 'number',
        min: 0,
        max: 100,
        step: 1,
        default: 0,
        unit: 'px'
      },
      radiusType: {
        label: 'Tipo de Redondeo',
        type: 'select',
        options: [
          { value: 'all', label: 'Todas las esquinas' },
          { value: 'custom', label: 'Personalizado' }
        ],
        default: 'all'
      },
      topLeftRadius: {
        label: 'Superior Izquierda',
        type: 'number',
        min: 0,
        max: 100,
        step: 1,
        default: 0,
        unit: 'px'
      },
      topRightRadius: {
        label: 'Superior Derecha',
        type: 'number',
        min: 0,
        max: 100,
        step: 1,
        default: 0,
        unit: 'px'
      },
      bottomLeftRadius: {
        label: 'Inferior Izquierda',
        type: 'number',
        min: 0,
        max: 100,
        step: 1,
        default: 0,
        unit: 'px'
      },
      bottomRightRadius: {
        label: 'Inferior Derecha',
        type: 'number',
        min: 0,
        max: 100,
        step: 1,
        default: 0,
        unit: 'px'
      },
      sides: {
        label: 'Lados',
        type: 'multiselect',
        options: [
          { value: 'top', label: 'Arriba', icon: '⬆️' },
          { value: 'right', label: 'Derecha', icon: '➡️' },
          { value: 'bottom', label: 'Abajo', icon: '⬇️' },
          { value: 'left', label: 'Izquierda', icon: '⬅️' }
        ],
        default: ['top', 'right', 'bottom', 'left']
      }
    },
    categories: [
      { value: 'custom', label: 'Personalizado' },
      { value: 'basic', label: 'Básico' },
      { value: 'decorative', label: 'Decorativo' },
      { value: 'modern', label: 'Moderno' }
    ]
  },

  // Configuración de Fill/Relleno
  fillConfig: {
    properties: {
      backgroundColor: {
        label: 'Color de Fondo',
        type: 'color',
        default: 'transparent',
        presets: [
          'transparent', '#FFFFFF', '#F8F9FA', '#E9ECEF',
          '#DEE2E6', '#CED4DA', '#ADB5BD', '#6C757D',
          '#495057', '#343A40', '#212529', '#000000'
        ]
      },
      opacity: {
        label: 'Opacidad',
        type: 'range',
        min: 0,
        max: 1,
        step: 0.01,
        default: 1,
        unit: '%'
      },
      gradientEnabled: {
        label: 'Habilitar Degradado',
        type: 'boolean',
        default: false
      },
      gradientType: {
        label: 'Tipo de Degradado',
        type: 'select',
        options: [
          { value: 'linear', label: 'Lineal' },
          { value: 'radial', label: 'Radial' },
          { value: 'conic', label: 'Cónico' }
        ],
        default: 'linear'
      },
      gradientDirection: {
        label: 'Dirección',
        type: 'select',
        options: [
          { value: '0deg', label: 'Arriba' },
          { value: '45deg', label: 'Diagonal ↗' },
          { value: '90deg', label: 'Derecha' },
          { value: '135deg', label: 'Diagonal ↘' },
          { value: '180deg', label: 'Abajo' },
          { value: '225deg', label: 'Diagonal ↙' },
          { value: '270deg', label: 'Izquierda' },
          { value: '315deg', label: 'Diagonal ↖' }
        ],
        default: '180deg'
      },
      gradientStops: {
        label: 'Paradas de Color',
        type: 'gradient-stops',
        default: [
          { color: '#FFFFFF', position: 0 },
          { color: '#000000', position: 100 }
        ]
      },
      pattern: {
        label: 'Patrón',
        type: 'select',
        options: [
          { value: 'none', label: 'Sin patrón' },
          { value: 'dots', label: 'Puntos' },
          { value: 'lines', label: 'Líneas' },
          { value: 'grid', label: 'Cuadrícula' },
          { value: 'diagonal', label: 'Diagonal' }
        ],
        default: 'none'
      },
      shadow: {
        label: 'Sombra',
        type: 'shadow',
        properties: {
          enabled: { type: 'boolean', default: false },
          offsetX: { type: 'number', default: 2, unit: 'px' },
          offsetY: { type: 'number', default: 2, unit: 'px' },
          blur: { type: 'number', default: 4, unit: 'px' },
          spread: { type: 'number', default: 0, unit: 'px' },
          color: { type: 'color', default: '#00000040' },
          inset: { type: 'boolean', default: false }
        }
      }
    },
    categories: [
      { value: 'custom', label: 'Personalizado' },
      { value: 'solid', label: 'Sólido' },
      { value: 'gradient', label: 'Degradado' },
      { value: 'pattern', label: 'Patrón' },
      { value: 'transparent', label: 'Transparente' }
    ]
  },

  styles: {
    container: {
      flex: '0 0 350px',
      width: '350px',
      background: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      display: 'flex',
      flexDirection: 'column',
      maxHeight: '100%',
      overflow: 'hidden'
    },

    header: {
      padding: '16px',
      borderBottom: '1px solid #e5e7eb',
      background: 'white'
    },

    title: {
      margin: '0 0 12px 0',
      fontSize: '16px',
      fontWeight: '600',
      color: '#374151'
    },

    tabContainer: {
      display: 'flex',
      marginBottom: '0',
      borderBottom: '1px solid #e5e7eb',
      overflowX: 'auto'
    },

    tab: (isActive) => ({
      flex: '0 0 auto',
      padding: '8px 12px',
      border: 'none',
      background: isActive ? '#eff6ff' : 'transparent',
      color: isActive ? '#2563eb' : '#6b7280',
      fontSize: '11px',
      fontWeight: '500',
      cursor: 'pointer',
      borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
      transition: 'all 0.2s',
      whiteSpace: 'nowrap',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    }),

    content: {
      flex: 1,
      overflowY: 'auto',
      padding: '16px'
    },

    section: {
      marginBottom: '20px'
    },

    sectionTitle: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '12px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },

    property: {
      marginBottom: '12px'
    },

    label: {
      display: 'block',
      fontSize: '12px',
      fontWeight: '500',
      marginBottom: '4px',
      color: '#374151'
    },

    input: {
      width: '100%',
      padding: '6px 8px',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      fontSize: '12px',
      boxSizing: 'border-box'
    },

    createButton: {
      background: '#059669',
      color: 'white',
      border: 'none',
      borderRadius: '4px',
      padding: '4px 8px',
      fontSize: '10px',
      cursor: 'pointer',
      marginTop: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },

    preview: {
      marginTop: '12px',
      padding: '12px',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      background: '#f8fafc'
    },

    previewLabel: {
      fontSize: '11px',
      fontWeight: '500',
      color: '#6b7280',
      marginBottom: '6px'
    },

    previewContent: {
      padding: '8px 12px',
      background: 'white',
      borderRadius: '4px',
      fontSize: '14px'
    },

    emptyState: {
      textAlign: 'center',
      color: '#6b7280',
      padding: '40px 20px'
    },

    emptyIcon: {
      fontSize: '48px',
      marginBottom: '12px'
    },

    emptyTitle: {
      fontSize: '16px',
      marginBottom: '6px',
      fontWeight: '500'
    },

    emptyDescription: {
      fontSize: '14px'
    }
  },

  helpTips: [
    '<strong>Básico</strong>: Posición, dimensiones y propiedades generales',
    '<strong>Text Style</strong>: Fuente, color, tamaño y efectos de texto',
    '<strong>Paragraph</strong>: Interlineado, alineación y espaciado',
    '<strong>Border</strong>: Bordes, esquinas y estilos de línea',
    '<strong>Relleno</strong>: Colores, degradados y efectos de fondo',
    '<strong>Crear</strong>: Guarda configuraciones como estilos reutilizables'
  ]
};