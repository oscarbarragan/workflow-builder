// src/components/layoutDesigner/utils/constants.js
// Constantes específicas del Layout Designer

// Element types for layout designer
export const ELEMENT_TYPES = {
    TEXT: 'text',
    VARIABLE: 'variable',
    RECTANGLE: 'rectangle'
  };
  
  // Text Style properties
  export const TEXT_STYLE_PROPERTIES = {
    fontFamily: {
      label: 'Fuente',
      type: 'select',
      options: [
        { value: 'Arial, sans-serif', label: 'Arial' },
        { value: 'Times, serif', label: 'Times' },
        { value: 'Courier, monospace', label: 'Courier' },
        { value: 'Georgia, serif', label: 'Georgia' },
        { value: 'Verdana, sans-serif', label: 'Verdana' },
        { value: 'Helvetica, sans-serif', label: 'Helvetica' },
        { value: 'Tahoma, sans-serif', label: 'Tahoma' },
        { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet MS' }
      ],
      default: 'Arial, sans-serif'
    },
    fontSize: {
      label: 'Tamaño',
      type: 'number',
      min: 8,
      max: 72,
      default: 14,
      unit: 'px'
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
    color: {
      label: 'Color',
      type: 'color',
      default: '#000000'
    }
  };
  
  // Paragraph Style properties
  export const PARAGRAPH_STYLE_PROPERTIES = {
    alignment: {
      label: 'Alineación',
      type: 'select',
      options: [
        { value: 'left', label: 'Izquierda' },
        { value: 'center', label: 'Centro' },
        { value: 'right', label: 'Derecha' },
        { value: 'justify', label: 'Justificado' }
      ],
      default: 'left'
    },
    verticalAlign: {
      label: 'Alineación Vertical',
      type: 'select',
      options: [
        { value: 'flex-start', label: 'Arriba' },
        { value: 'center', label: 'Centro' },
        { value: 'flex-end', label: 'Abajo' }
      ],
      default: 'flex-start'
    },
    lineHeight: {
      label: 'Interlineado',
      type: 'number',
      min: 1.0,
      max: 3.0,
      step: 0.1,
      default: 1.4,
      unit: ''
    },
    letterSpacing: {
      label: 'Espaciado de Letras',
      type: 'number',
      min: -2,
      max: 10,
      step: 0.1,
      default: 0,
      unit: 'px'
    },
    indent: {
      label: 'Sangría',
      type: 'number',
      min: 0,
      max: 100,
      step: 1,
      default: 0,
      unit: 'px'
    },
    spaceBefore: {
      label: 'Espacio Antes',
      type: 'number',
      min: 0,
      max: 50,
      step: 1,
      default: 0,
      unit: 'px'
    },
    spaceAfter: {
      label: 'Espacio Después',
      type: 'number',
      min: 0,
      max: 50,
      step: 1,
      default: 0,
      unit: 'px'
    },
    wordWrap: {
      label: 'Ajuste de Línea',
      type: 'boolean',
      default: true
    },
    wordBreak: {
      label: 'Corte de Palabras',
      type: 'select',
      options: [
        { value: 'normal', label: 'Normal' },
        { value: 'break-all', label: 'Cortar Todo' },
        { value: 'keep-all', label: 'Mantener Todo' }
      ],
      default: 'normal'
    }
  };
  
  // Default properties with styles
  export const DEFAULT_ELEMENT_PROPS = {
    [ELEMENT_TYPES.TEXT]: {
      text: 'Nuevo Texto',
      fontSize: 14,
      width: 200,
      height: 40,
      padding: '4px 8px',
      textStyle: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 14,
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        color: '#000000'
      },
      paragraphStyle: {
        alignment: 'left',
        verticalAlign: 'flex-start',
        lineHeight: 1.4,
        letterSpacing: 0,
        indent: 0,
        spaceBefore: 0,
        spaceAfter: 0,
        wordWrap: true,
        wordBreak: 'normal'
      }
    },
    
    [ELEMENT_TYPES.VARIABLE]: {
      variable: 'variable',
      fontSize: 14
    },
    
    [ELEMENT_TYPES.RECTANGLE]: {
      width: 100,
      height: 50,
      fillColor: 'rgba(156, 163, 175, 0.1)',
      borderColor: '#6b7280',
      borderWidth: 2,
      borderStyle: 'solid',
      borderRadius: 4
    }
  };
  
  // Presets de estilos predefinidos
  export const TEXT_STYLE_PRESETS = {
    heading1: {
      name: 'Título 1',
      textStyle: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 24,
        bold: true,
        italic: false,
        underline: false,
        strikethrough: false,
        color: '#1f2937'
      },
      paragraphStyle: {
        alignment: 'left',
        verticalAlign: 'flex-start',
        lineHeight: 1.2,
        letterSpacing: 0,
        indent: 0,
        spaceBefore: 0,
        spaceAfter: 12,
        wordWrap: true,
        wordBreak: 'normal'
      }
    },
    heading2: {
      name: 'Título 2',
      textStyle: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 18,
        bold: true,
        italic: false,
        underline: false,
        strikethrough: false,
        color: '#374151'
      },
      paragraphStyle: {
        alignment: 'left',
        verticalAlign: 'flex-start',
        lineHeight: 1.3,
        letterSpacing: 0,
        indent: 0,
        spaceBefore: 8,
        spaceAfter: 8,
        wordWrap: true,
        wordBreak: 'normal'
      }
    },
    body: {
      name: 'Cuerpo',
      textStyle: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 14,
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        color: '#4b5563'
      },
      paragraphStyle: {
        alignment: 'left',
        verticalAlign: 'flex-start',
        lineHeight: 1.5,
        letterSpacing: 0,
        indent: 0,
        spaceBefore: 0,
        spaceAfter: 4,
        wordWrap: true,
        wordBreak: 'normal'
      }
    }
  };