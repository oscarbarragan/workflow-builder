// src/utils/constants.js - ACTUALIZADO para incluir Data Transformer
// Node types
export const NODE_TYPES = {
  LAYOUT_DESIGNER: 'layout-designer',
  HTTP_INPUT: 'http-input',
  DATA_MAPPER: 'data-mapper',
  DATA_TRANSFORMER: 'data-transformer', // NUEVO
  SCRIPT_PROCESSOR: 'script-processor'
};

// Element types for layout designer
export const ELEMENT_TYPES = {
  TEXT: 'text',
  VARIABLE: 'variable',
  RECTANGLE: 'rectangle'
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

// Default properties for new elements
export const DEFAULT_ELEMENT_PROPS = {
  [ELEMENT_TYPES.TEXT]: {
    text: 'Nuevo Texto',
    fontSize: 14,
    width: 200,
    height: 100
  },
  
  [ELEMENT_TYPES.VARIABLE]: {
    variable: 'variable',
    fontSize: 14
  },
  
  [ELEMENT_TYPES.RECTANGLE]: {
    width: 100,
    height: 50
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
  
  [NODE_TYPES.DATA_TRANSFORMER]: { // NUEVO
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


