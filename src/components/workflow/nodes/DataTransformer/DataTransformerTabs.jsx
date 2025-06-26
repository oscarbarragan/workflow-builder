// src/components/workflow/nodes/DataTransformer/DataTransformerTabs.jsx
import React from 'react';
import { Zap, Eye, Database } from 'lucide-react';

// Import individual tabs
import TransformationsTab from './tabs/TransformationsTab';
import PreviewTab from './tabs/PreviewTab';
import ResultsTab from './tabs/ResultsTab';

const DataTransformerTabs = ({
  activeTab,
  setActiveTab,
  transformations,
  updateTransformation,
  availableData,
  outputVariables,
  executionResult,
  executionError,
  showPreview
}) => {
  const tabs = [
    { 
      id: 'transformations', 
      label: '⚡ Transformaciones', 
      icon: <Zap size={14} />,
      count: transformations.filter(t => t.enabled).length
    },
    { 
      id: 'preview', 
      label: '👁️ Vista Previa', 
      icon: <Eye size={14} />,
      disabled: !showPreview
    },
    { 
      id: 'results', 
      label: '📊 Resultados', 
      icon: <Database size={14} />,
      count: Object.keys(outputVariables).length,
      hasError: !!executionError
    }
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
            onClick={() => !tab.disabled && setActiveTab(tab.id)}
            disabled={tab.disabled}
            style={{
              padding: '12px 20px',
              border: 'none',
              background: activeTab === tab.id ? '#3b82f6' : 'transparent',
              color: tab.disabled 
                ? '#9ca3af' 
                : activeTab === tab.id 
                  ? 'white' 
                  : tab.hasError 
                    ? '#dc2626'
                    : '#6b7280',
              cursor: tab.disabled ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              borderRadius: '6px 6px 0 0',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
              opacity: tab.disabled ? 0.5 : 1,
              position: 'relative'
            }}
          >
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span style={{
                background: activeTab === tab.id ? 'rgba(255,255,255,0.2)' : '#3b82f6',
                color: activeTab === tab.id ? 'white' : 'white',
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '10px',
                fontWeight: '600',
                minWidth: '18px',
                textAlign: 'center'
              }}>
                {tab.count}
              </span>
            )}
            {tab.hasError && (
              <span style={{
                background: '#dc2626',
                color: 'white',
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '10px',
                fontWeight: '600'
              }}>
                !
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'transformations' && (
          <TransformationsTab
            transformations={transformations}
            updateTransformation={updateTransformation}
            availableData={availableData}
          />
        )}
        
        {activeTab === 'preview' && showPreview && (
          <PreviewTab
            transformations={transformations}
            availableData={availableData}
          />
        )}
        
        {activeTab === 'results' && (
          <ResultsTab
            outputVariables={outputVariables}
            executionResult={executionResult}
            executionError={executionError}
            transformations={transformations}
          />
        )}
      </div>
    </>
  );
};

export default DataTransformerTabs;