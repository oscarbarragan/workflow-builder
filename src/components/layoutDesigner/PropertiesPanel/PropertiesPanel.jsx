// src/components/layoutDesigner/PropertiesPanel/PropertiesPanel.jsx
import React, { useState } from 'react';
import { ELEMENT_TYPES } from '../utils/constants';
import BasicProperties from './BasicProperties';
import TextStyleProperties from './TextStyleProperties';
import ParagraphProperties from './ParagraphProperties';
import BorderProperties from './BorderProperties';
import FillProperties from './FillProperties';
import { propertiesConfig } from './properties.config';

const PropertiesPanel = ({ 
  selectedElement, 
  onUpdateSelectedElement, 
  availableData = {},
  onCreateNewStyle,
  onStyleCreated
}) => {
  const [activeTab, setActiveTab] = useState('basic');
  const { tabs, styles, helpTips } = propertiesConfig;

  // Filtrar tabs según el tipo de elemento
  const availableTabs = tabs.filter(tab => 
    !tab.elementTypes || 
    (selectedElement && tab.elementTypes.includes(selectedElement.type))
  );

  // Manejar cambio de estilo aplicado desde Básico
  const handleStyleChanged = (styleType, styleData) => {
    console.log('🎨 Style applied from basic tab:', styleType, styleData);
    // Aquí se podría agregar lógica adicional si es necesaria
  };

  const renderTabContent = () => {
    if (!selectedElement) return null;

    switch (activeTab) {
      case 'basic':
        return (
          <BasicProperties
            selectedElement={selectedElement}
            onUpdateSelectedElement={onUpdateSelectedElement}
            availableData={availableData}
            onStyleChanged={handleStyleChanged}
          />
        );

      case 'textStyle':
        if (selectedElement.type === ELEMENT_TYPES.TEXT || selectedElement.type === ELEMENT_TYPES.VARIABLE) {
          return (
            <TextStyleProperties
              selectedElement={selectedElement}
              onUpdateSelectedElement={onUpdateSelectedElement}
              availableData={availableData}
              onStyleCreated={onStyleCreated}
            />
          );
        }
        return (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🔤</div>
            <div style={styles.emptyTitle}>
              Text Style no disponible
            </div>
            <div style={styles.emptyDescription}>
              Solo disponible para elementos de texto y variables
            </div>
          </div>
        );

      case 'paragraph':
        if (selectedElement.type === ELEMENT_TYPES.TEXT) {
          return (
            <ParagraphProperties
              selectedElement={selectedElement}
              onUpdateSelectedElement={onUpdateSelectedElement}
              onStyleCreated={onStyleCreated}
            />
          );
        }
        return (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>📄</div>
            <div style={styles.emptyTitle}>
              Paragraph Style no disponible
            </div>
            <div style={styles.emptyDescription}>
              Solo disponible para elementos de texto
            </div>
          </div>
        );

      case 'border':
        return (
          <BorderProperties
            selectedElement={selectedElement}
            onUpdateSelectedElement={onUpdateSelectedElement}
            onStyleCreated={onStyleCreated}
          />
        );

      case 'fill':
        return (
          <FillProperties
            selectedElement={selectedElement}
            onUpdateSelectedElement={onUpdateSelectedElement}
            onStyleCreated={onStyleCreated}
          />
        );

      default:
        return (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>❓</div>
            <div style={styles.emptyTitle}>
              Pestaña no encontrada
            </div>
            <div style={styles.emptyDescription}>
              La pestaña seleccionada no existe
            </div>
          </div>
        );
    }
  };

  // Renderizar información del elemento en el header
  const renderElementInfo = () => {
    if (!selectedElement) return null;

    const appliedStylesCount = [
      selectedElement.textStyleId,
      selectedElement.paragraphStyleId,
      selectedElement.borderStyleId,
      selectedElement.fillStyleId
    ].filter(Boolean).length;

    return (
      <div style={{
        background: '#f0f9ff',
        padding: '12px',
        borderRadius: '6px',
        marginBottom: '16px',
        border: '1px solid #0ea5e9'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '6px'
        }}>
          <div style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#0c4a6e'
          }}>
            {selectedElement.type.toUpperCase()} - {selectedElement.id.split('_')[0]}
          </div>
          
          {appliedStylesCount > 0 && (
            <div style={{
              background: '#16a34a',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '10px',
              fontSize: '10px',
              fontWeight: '600'
            }}>
              {appliedStylesCount} estilo{appliedStylesCount !== 1 ? 's' : ''}
            </div>
          )}
        </div>
        
        <div style={{
          fontSize: '11px',
          color: '#0c4a6e',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>
            Pos: ({Math.round(selectedElement.x)}, {Math.round(selectedElement.y)})
            {selectedElement.width && selectedElement.height && 
              ` • ${selectedElement.width}×${selectedElement.height}`
            }
          </span>
          
          <div style={{ display: 'flex', gap: '4px' }}>
            {selectedElement.textStyleId && <span title="Text Style aplicado">🔤</span>}
            {selectedElement.paragraphStyleId && <span title="Paragraph Style aplicado">📄</span>}
            {selectedElement.borderStyleId && <span title="Border Style aplicado">🔲</span>}
            {selectedElement.fillStyleId && <span title="Fill Style aplicado">🎨</span>}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h3 style={styles.title}>
          Propiedades
        </h3>
        
        {/* Información del elemento */}
        {selectedElement && renderElementInfo()}
        
        {/* Tabs */}
        <div style={styles.tabContainer}>
          {availableTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={styles.tab(activeTab === tab.id)}
              title={tab.description}
            >
              {tab.icon}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {selectedElement ? (
          renderTabContent()
        ) : (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>🎯</div>
            <div style={styles.emptyTitle}>
              Ningún elemento seleccionado
            </div>
            <div style={styles.emptyDescription}>
              Haz clic en un elemento del canvas para editarlo
            </div>
            
            {/* Información sobre las pestañas */}
            <div style={{
              marginTop: '20px',
              padding: '12px',
              background: '#f0fdf4',
              borderRadius: '6px',
              border: '1px solid #bbf7d0'
            }}>
              <div style={{
                fontSize: '12px',
                color: '#15803d',
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                💡 Pestañas Disponibles
              </div>
              <div style={{
                fontSize: '11px',
                color: '#15803d',
                lineHeight: '1.4'
              }}>
                ⚙️ Básico • 🔤 Text Style • 📄 Paragraph • 🔲 Border • 🎨 Relleno
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;