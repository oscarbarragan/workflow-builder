// src/components/layoutDesigner/StylesSidebar/sidebar.config.js
export const sidebarConfig = {
    tabs: [
      {
        id: 'styles',
        label: 'Estilos',
        icon: '🎨'
      },
      {
        id: 'elements',
        label: 'Elementos',
        icon: '🌳'
      }
    ],
  
    sections: {
      variables: {
        title: 'Variables',
        icon: '🔗',
        expandedByDefault: true
      },
      textStyles: {
        title: 'Estilos de Texto',
        icon: '📝',
        expandedByDefault: true
      },
      paragraphStyles: {
        title: 'Estilos de Párrafo',
        icon: '📄',
        expandedByDefault: true
      },
      borderStyles: {
        title: 'Estilos de Borde',
        icon: '🔲',
        expandedByDefault: false
      },
      fillStyles: {
        title: 'Estilos de Relleno',
        icon: '🎨',
        expandedByDefault: false
      }
    },
  
    styles: {
      container: {
        width: '280px',
        background: '#f8fafc',
        borderRight: '1px solid #e2e8f0',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        overflow: 'hidden'
      },
  
      header: {
        borderBottom: '1px solid #e2e8f0',
        background: 'white'
      },
  
      tabContainer: {
        display: 'flex',
        borderBottom: '1px solid #e5e7eb'
      },
  
      tab: (isActive) => ({
        flex: 1,
        padding: '10px 12px',
        border: 'none',
        background: isActive ? '#eff6ff' : 'transparent',
        color: isActive ? '#3b82f6' : '#6b7280',
        fontSize: '12px',
        fontWeight: '500',
        cursor: 'pointer',
        borderBottom: isActive ? '2px solid #3b82f6' : '2px solid transparent'
      }),
  
      content: {
        flex: 1,
        overflowY: 'auto'
      },
  
      sectionHeader: (isExpanded) => ({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        background: '#e2e8f0',
        borderBottom: '1px solid #cbd5e1',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '600',
        color: '#475569'
      }),
  
      sectionContent: {
        // Contenido de cada sección
      },
  
      styleItem: (isApplied) => ({
        padding: '8px 12px',
        borderBottom: '1px solid #f1f5f9',
        background: isApplied ? '#eff6ff' : 'transparent',
        borderLeft: isApplied ? '3px solid #3b82f6' : '3px solid transparent',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px'
      }),
  
      footer: {
        padding: '12px',
        borderTop: '1px solid #e2e8f0',
        background: 'white'
      },
  
      actionButton: {
        flex: 1,
        padding: '6px 8px',
        border: '1px solid #d1d5db',
        borderRadius: '4px',
        background: 'white',
        fontSize: '10px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '4px'
      }
    }
  };