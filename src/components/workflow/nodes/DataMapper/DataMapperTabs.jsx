// src/components/workflow/nodes/DataMapper/DataMapperTabs.jsx
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

  return (
    <>
      {/* Tabs Navigation */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid #e5e7eb',
        marginBottom: '20px'
      }}>
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
      <div style={{ flex: 1, minHeight: 0 }}>
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
    </>
  );
};

export default DataMapperTabs;