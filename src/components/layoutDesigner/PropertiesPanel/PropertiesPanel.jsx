// src/components/layoutDesigner/PropertiesPanel/PropertiesPanel.jsx
import React, { useState } from 'react';
import { ELEMENT_TYPES } from '../utils/constants';
import BasicProperties from './BasicProperties';
import ManualStyles from './ManualStyles';
import AdvancedProperties from './AdvancedProperties';
import { propertiesConfig } from './properties.config';

const PropertiesPanel = ({ 
  selectedElement, 
  onUpdateSelectedElement, 
  availableData = {},
  onCreateNewStyle,
  onStyleCreated
}) => {
  const [activeTab, setActiveTab] = useState('properties');
  const { tabs, styles, helpTips } = propertiesConfig;

  // Filtrar tabs según el tipo de elemento
  const availableTabs = tabs.filter(tab => 
    !tab.elementTypes || 
    (selectedElement && tab.elementTypes.includes(selectedElement.type))
  );

  const renderTabContent = () => {
    if (!selectedElement) return null;

    switch (activeTab) {
      case 'properties':
        return (
          <BasicProperties
            selectedElement={selectedElement}
            onUpdateSelectedElement={onUpdateSelectedElement}
            availableData={availableData}
          />
        );

      case 'manualStyles':
        if (selectedElement.type === ELEMENT_TYPES.TEXT) {
          return (
            <ManualStyles
              selectedElement={selectedElement}
              onUpdateSelectedElement={onUpdateSelectedElement}
              onStyleCreated={onStyleCreated}
            />
          );
        }
        return null;

      case 'advanced':
        return (
          <AdvancedProperties
            selectedElement={selectedElement}
            onUpdateSelectedElement={onUpdateSelectedElement}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.header}>
        Propiedades
      </h3>
      
      {selectedElement ? (
        <div>
          {/* Tabs */}
          <div style={styles.tabContainer}>
            {availableTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={styles.tabButton(activeTab === tab.id)}
                title={tab.description}
              >
                <span style={{ marginRight: '4px' }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {renderTabContent()}
        </div>
      ) : (
        <div style={styles.emptyState}>
          <div style={styles.emptyIcon}>🎯</div>
          <div style={styles.emptyTitle}>
            Ningún elemento seleccionado
          </div>
          <div style={styles.emptyDescription}>
            Haz clic en un elemento para editarlo
          </div>
        </div>
      )}

      {/* Help Section */}
      <div style={styles.helpSection}>
        <div style={styles.helpTitle}>
          💡 Consejos:
        </div>
        <ul style={styles.helpList}>
          {helpTips.map((tip, index) => (
            <li key={index} dangerouslySetInnerHTML={{ __html: tip }} />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PropertiesPanel;