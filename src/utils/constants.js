// Node types
export const NODE_TYPES = {
  USER_FORM: 'user-form',
  LOCATION_FORM: 'location-form',
  LAYOUT_DESIGNER: 'layout-designer'
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

// Node configurations
export const NODE_CONFIG = {
  [NODE_TYPES.USER_FORM]: {
    title: 'Formulario Usuario',
    icon: 'User',
    color: '#2563eb',
    fields: ['nombre']
  },
  
  [NODE_TYPES.LOCATION_FORM]: {
    title: 'Formulario Ubicación',
    icon: 'MapPin',
    color: '#16a34a',
    fields: ['apellido', 'ciudad']
  },
  
  [NODE_TYPES.LAYOUT_DESIGNER]: {
    title: 'Diseñador Layout',
    icon: 'FileText',
    color: '#7c3aed',
    fields: []
  }
};