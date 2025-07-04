// src/components/layoutDesigner/components/Variable/Variable.config.js
export const variableConfig = {
    name: 'Variable',
    type: 'variable',
    category: 'dynamic',
    icon: '🔗',
    
    defaultProps: {
      variable: 'variable',
      fontSize: 14
    },
  
    editableProperties: [
      'variable',
      'fontSize'
    ],
  
    resizable: false,
    draggable: true,
    editable: true,
  
    shortcuts: {
      edit: 'DoubleClick'
    },
  
    validation: {
      variable: {
        required: true,
        pattern: /^[a-zA-Z][a-zA-Z0-9_.]*$/
      },
      fontSize: {
        min: 8,
        max: 72
      }
    },
  
    styles: {
      base: {
        padding: '6px 10px',
        background: 'rgba(14, 165, 233, 0.05)',
        border: '1px dashed #0ea5e9',
        borderRadius: '4px',
        fontSize: 14,
        color: '#1e40af',
        fontFamily: 'monospace',
        fontWeight: '600',
        minWidth: 'auto',
        minHeight: 'auto',
        maxWidth: '250px'
      },
      
      selected: {
        background: 'rgba(59, 130, 246, 0.1)',
        border: '2px solid #3b82f6',
        boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)'
      },
      
      hover: {
        background: 'rgba(14, 165, 233, 0.08)',
        boxShadow: '0 1px 3px rgba(14, 165, 233, 0.2)'
      }
    }
  };