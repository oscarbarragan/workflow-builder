// src/components/layoutDesigner/Toolbar/Toolbar.config.js
import { ELEMENT_TYPES } from '../utils/constants';

export const toolbarConfig = {
  toolGroups: [
    {
      title: 'Elementos',
      tools: [
        {
          type: ELEMENT_TYPES.TEXT,
          label: 'Texto',
          icon: '📝',
          variant: 'primary',
          description: 'Agregar elemento de texto',
          shortcut: 'T'
        },
        {
          type: ELEMENT_TYPES.RECTANGLE,
          label: 'Rectángulo',
          icon: '⬜',
          variant: 'success',
          description: 'Agregar rectángulo',
          shortcut: 'R'
        },
        {
          type: ELEMENT_TYPES.VARIABLE,
          label: 'Variable',
          icon: '🔗',
          variant: 'purple',
          description: 'Agregar variable dinámica',
          shortcut: 'V'
        }
      ]
    },
    {
      title: 'Acciones',
      tools: [
        {
          action: 'duplicate',
          label: 'Duplicar',
          icon: '📋',
          variant: 'secondary',
          description: 'Duplicar elemento seleccionado',
          shortcut: 'Ctrl+D'
        },
        {
          action: 'delete',
          label: 'Eliminar',
          icon: '🗑️',
          variant: 'danger',
          description: 'Eliminar elemento seleccionado',
          shortcut: 'Delete'
        },
        {
          action: 'clear',
          label: 'Limpiar',
          icon: '🧹',
          variant: 'secondary',
          description: 'Limpiar todo el canvas',
          shortcut: 'Ctrl+Shift+C'
        }
      ]
    }
  ],

  styles: {
    container: {
      display: 'flex',
      gap: '10px',
      marginBottom: '20px',
      flexWrap: 'wrap',
      padding: '12px',
      background: '#f8fafc',
      borderRadius: '8px',
      border: '1px solid #e2e8f0'
    },

    separator: {
      width: '1px',
      background: '#e2e8f0',
      margin: '0 8px',
      alignSelf: 'stretch'
    },

    group: {
      display: 'flex',
      gap: '8px',
      alignItems: 'center'
    },

    groupLabel: {
      fontSize: '12px',
      color: '#6b7280',
      fontWeight: '500',
      marginRight: '4px'
    },

    stats: {
      marginLeft: 'auto',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      fontSize: '12px',
      color: '#6b7280'
    },

    selectedInfo: {
      color: '#3b82f6'
    }
  },

  buttonVariants: {
    purple: {
      backgroundColor: '#7c3aed',
      color: 'white'
    }
  }
};