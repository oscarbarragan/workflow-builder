// src/components/layoutDesigner/PropertiesPanel/properties.config.js
import { ELEMENT_TYPES } from '../utils/constants';

export const propertiesConfig = {
  tabs: [
    {
      id: 'properties',
      label: 'Básicas',
      icon: '⚙️',
      description: 'Propiedades básicas del elemento'
    },
    {
      id: 'manualStyles',
      label: 'Estilos Manual',
      icon: '🎨',
      description: 'Crear y editar estilos manualmente',
      elementTypes: [ELEMENT_TYPES.TEXT]
    },
    {
      id: 'advanced',
      label: 'Avanzado',
      icon: '🔧',
      description: 'Configuraciones avanzadas y metadatos'
    }
  ],

  styles: {
    container: {
      flex: '0 0 320px',
      width: '320px',
      background: '#f9fafb',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      padding: '16px',
      overflowY: 'auto',
      maxHeight: '100%'
    },

    header: {
      margin: '0 0 16px 0',
      fontSize: '16px',
      color: '#374151',
      borderBottom: '1px solid #e5e7eb',
      paddingBottom: '8px'
    },

    tabContainer: {
      display: 'flex',
      marginBottom: '16px',
      borderBottom: '1px solid #e5e7eb'
    },

    tabButton: (isActive) => ({
      flex: 1,
      padding: '8px 12px',
      border: 'none',
      background: isActive ? '#eff6ff' : 'transparent',
      color: isActive ? '#3b82f6' : '#6b7280',
      fontSize: '12px',
      fontWeight: '500',
      cursor: 'pointer',
      borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent',
      transition: 'all 0.2s'
    }),

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
    },

    helpSection: {
      marginTop: '20px',
      padding: '12px',
      background: '#f0fdf4',
      borderRadius: '6px',
      border: '1px solid #bbf7d0'
    },

    helpTitle: {
      fontSize: '12px',
      color: '#15803d',
      fontWeight: '600',
      marginBottom: '6px'
    },

    helpList: {
      fontSize: '11px',
      color: '#15803d',
      margin: 0,
      paddingLeft: '16px'
    }
  },

  helpTips: [
    '<strong>Básicas</strong>: Posición, dimensiones y configuración',
    '<strong>Estilos Manual</strong>: Crear componentes reutilizables',
    '<strong>Avanzado</strong>: Z-index, padding y metadatos',
    '<strong>Variables</strong>: Disponibles en sidebar izquierdo',
    '<strong>Ctrl+Espacio</strong>: Insertar variables en edición'
  ]
};