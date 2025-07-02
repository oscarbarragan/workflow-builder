// src/components/workflow/nodes/DataMapper/DataMapperTabs.jsx - CORREGIDO
import React from 'react';
import { Link2, Database, FileText } from 'lucide-react';

// Importar tabs desde archivos separados
import SourceTab from './tabs/SourceTab';
import MappingTab from './tabs/MappingTab';
import PreviewTab from './tabs/PreviewTab';

// Importar utilidades
import { dataTypes, getTypeColor } from './DataMapperUtils';

const DataMapperTabs = ({ state, actions, availableData }) => {
  const tabs = [
    { id: 'source', label: '🔗 Fuente', icon: <Link2 size={14} /> },
    { id: 'mapping', label: '🗂️ Mapeo', icon: <Database size={14} /> },
    { id: 'preview', label: '👁️ Vista Previa', icon: <FileText size={14} /> }
  ];

  // ✅ MEJORADO: Container style para usar todo el espacio disponible
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden'
  };

  // ✅ MEJORADO: Tabs navigation style
  const tabsNavigationStyle = {
    display: 'flex',
    borderBottom: '2px solid #e5e7eb',
    marginBottom: '20px',
    flexShrink: 0 // ✅ AGREGADO: Evitar que se encoja
  };

  // ✅ MEJORADO: Content area style
  const contentAreaStyle = {
    flex: 1,
    minHeight: 0, // ✅ CRÍTICO: Permite que el contenido use flexbox correctamente
    overflow: 'hidden', // ✅ AGREGADO: El overflow se maneja en cada tab
    display: 'flex',
    flexDirection: 'column'
  };

  return (
    <div style={containerStyle}>
      {/* Tabs Navigation */}
      <div style={tabsNavigationStyle}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => actions.setActiveTab(tab.id)}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: state.activeTab === tab.id ? '#3b82f6' : 'transparent',
              color: state.activeTab === tab.id ? 'white' : '#6b7280',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              borderRadius: '6px 6px 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={contentAreaStyle}>
        {state.activeTab === 'source' && (
          <SourceTab 
            state={state} 
            actions={actions}
            availableData={availableData} 
          />
        )}
        
        {state.activeTab === 'mapping' && (
          <MappingTab 
            state={state} 
            actions={actions}
            dataTypes={dataTypes}
            getTypeColor={getTypeColor}
          />
        )}
        
        {state.activeTab === 'preview' && (
          <PreviewTab 
            state={state}
            getTypeColor={getTypeColor}
          />
        )}
      </div>
    </div>
  );
};

export default DataMapperTabs;