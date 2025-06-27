// src/utils/constants.js - ACTUALIZADO con estilos de Inspire Designer
// Node types
export const NODE_TYPES = {
  LAYOUT_DESIGNER: 'layout-designer',
  HTTP_INPUT: 'http-input',
  DATA_MAPPER: 'data-mapper',
  DATA_TRANSFORMER: 'data-transformer',
  SCRIPT_PROCESSOR: 'script-processor'
};

// Element types for layout designer
export const ELEMENT_TYPES = {
  TEXT: 'text',
  VARIABLE: 'variable',
  RECTANGLE: 'rectangle'
};

// ✅ NUEVO: Text Style properties (como Inspire Designer)
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

// ✅ NUEVO: Paragraph Style properties (como Inspire Designer)
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

// Default styles
export const STYLES = {
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  
  button: {
    primary: {
      padding: '10px 16px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      background: '#3b82f6',
      color: 'white',
      fontSize: '14px',
      fontWeight: '500'
    },
    
    secondary: {
      padding: '10px 16px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      background: '#e5e7eb',
      color: '#374151',
      fontSize: '14px',
      fontWeight: '500'
    },
    
    success: {
      padding: '10px 16px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      background: '#16a34a',
      color: 'white',
      fontSize: '14px',
      fontWeight: '500'
    },
    
    danger: {
      padding: '10px 16px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      background: '#dc2626',
      color: 'white',
      fontSize: '14px',
      fontWeight: '500'
    },
    
    warning: {
      padding: '10px 16px',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      background: '#f59e0b',
      color: 'white',
      fontSize: '14px',
      fontWeight: '500'
    }
  },

  node: {
    background: 'white',
    borderRadius: '6px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    minWidth: '100px',
    padding: '8px',
    transition: 'all 0.2s'
  },

  panel: {
    background: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    padding: '16px'
  }
};

// ✅ ACTUALIZADO: Default properties con estilos de Inspire Designer
export const DEFAULT_ELEMENT_PROPS = {
  [ELEMENT_TYPES.TEXT]: {
    text: 'Nuevo Texto',
    fontSize: 14,
    width: 200,
    height: 40,
    padding: '4px 8px',
    // ✅ Text Style por defecto
    textStyle: {
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      color: '#000000'
    },
    // ✅ Paragraph Style por defecto
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

// Node configurations - ACTUALIZADO
export const NODE_CONFIG = {
  [NODE_TYPES.LAYOUT_DESIGNER]: {
    title: 'Diseñador Layout',
    icon: 'FileText',
    color: '#7c3aed',
    fields: [],
    category: 'output'
  },
  
  [NODE_TYPES.HTTP_INPUT]: {
    title: 'HTTP Input',
    icon: 'Globe',
    color: '#f59e0b',
    fields: ['path', 'method'],
    category: 'input'
  },
  
  [NODE_TYPES.DATA_MAPPER]: {
    title: 'Data Mapper',
    icon: 'Database',
    color: '#14b8a6',
    fields: [],
    category: 'processing'
  },
  
  [NODE_TYPES.DATA_TRANSFORMER]: {
    title: 'Data Transformer',
    icon: 'Zap',
    color: '#8b5cf6',
    fields: [],
    category: 'processing'
  },
  
  [NODE_TYPES.SCRIPT_PROCESSOR]: {
    title: 'Script Processor',
    icon: 'Code',
    color: '#8b5cf6',
    fields: [],
    category: 'processing'
  }
};

// Data types for data mapper
export const DATA_TYPES = {
  STRING: 'string',
  NUMBER: 'number',
  BOOLEAN: 'boolean',
  ARRAY: 'array',
  OBJECT: 'object',
  DATE: 'date'
};

// HTTP methods
export const HTTP_METHODS = [
  { value: 'GET', label: 'GET', color: '#16a34a' },
  { value: 'POST', label: 'POST', color: '#3b82f6' },
  { value: 'PUT', label: 'PUT', color: '#f59e0b' },
  { value: 'DELETE', label: 'DELETE', color: '#dc2626' },
  { value: 'PATCH', label: 'PATCH', color: '#7c3aed' }
];

// Authentication types
export const AUTH_TYPES = [
  { value: 'none', label: 'Sin autenticación' },
  { value: 'basic', label: 'Basic Auth' },
  { value: 'bearer', label: 'Bearer Token' },
  { value: 'apikey', label: 'API Key' },
  { value: 'oauth', label: 'OAuth 2.0' }
];

// Node categories for UI grouping
export const NODE_CATEGORIES = {
  INPUT: 'input',
  PROCESSING: 'processing',
  OUTPUT: 'output'
};

// ✅ NUEVO: Presets de estilos predefinidos (como Inspire Designer)
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
  },
  caption: {
    name: 'Leyenda',
    textStyle: {
      fontFamily: 'Arial, sans-serif',
      fontSize: 12,
      bold: false,
      italic: true,
      underline: false,
      strikethrough: false,
      color: '#6b7280'
    },
    paragraphStyle: {
      alignment: 'center',
      verticalAlign: 'flex-start',
      lineHeight: 1.4,
      letterSpacing: 0,
      indent: 0,
      spaceBefore: 4,
      spaceAfter: 0,
      wordWrap: true,
      wordBreak: 'normal'
    }
  },
  monospace: {
    name: 'Código',
    textStyle: {
      fontFamily: 'Courier, monospace',
      fontSize: 13,
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      color: '#1f2937'
    },
    paragraphStyle: {
      alignment: 'left',
      verticalAlign: 'flex-start',
      lineHeight: 1.4,
      letterSpacing: 0.5,
      indent: 0,
      spaceBefore: 0,
      spaceAfter: 0,
      wordWrap: false,
      wordBreak: 'normal'
    }
  }
};