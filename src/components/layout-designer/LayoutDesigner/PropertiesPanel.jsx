// src/components/layout-designer/LayoutDesigner/PropertiesPanel.jsx - REFACTORIZADO
import React, { useState } from 'react';
import { ELEMENT_TYPES } from '../../../utils/constants';
import BasicProperties from './BasicProperties';
import ManualStyles from './ManualStyles';
import AdvancedProperties from './AdvancedProperties';

const PropertiesPanel = ({ 
  selectedElement, 
  onUpdateSelectedElement, 
  availableData = {},
  onCreateNewStyle,
  onStyleCreated
}) => {
  const [activeTab, setActiveTab] = useState('properties');
  
  const panelStyle = {
    flex: '0 0 320px',
    width: '320px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '16px',
    overflowY: 'auto',
    maxHeight: '100%'
  };

  const tabButtonStyle = (isActive) => ({
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
  });

  return (
    <div style={panelStyle}>
      <h3 style={{
        margin: '0 0 16px 0',
        fontSize: '16px',
        color: '#374151',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '8px'
      }}>
        Propiedades
      </h3>
      
      {selectedElement ? (
        <div>
          {/* Tabs para organizar propiedades */}
          <div style={{
            display: 'flex',
            marginBottom: '16px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <button
              onClick={() => setActiveTab('properties')}
              style={tabButtonStyle(activeTab === 'properties')}
            >
              Básicas
            </button>
            
            {selectedElement.type === ELEMENT_TYPES.TEXT && (
              <button
                onClick={() => setActiveTab('manualStyles')}
                style={tabButtonStyle(activeTab === 'manualStyles')}
              >
                Estilos Manual
              </button>
            )}
            
            <button
              onClick={() => setActiveTab('advanced')}
              style={tabButtonStyle(activeTab === 'advanced')}
            >
              Avanzado
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'properties' && (
            <BasicProperties
              selectedElement={selectedElement}
              onUpdateSelectedElement={onUpdateSelectedElement}
              availableData={availableData}
            />
          )}

          {activeTab === 'manualStyles' && selectedElement.type === ELEMENT_TYPES.TEXT && (
            <ManualStyles
              selectedElement={selectedElement}
              onUpdateSelectedElement={onUpdateSelectedElement}
              onStyleCreated={onStyleCreated}
            />
          )}

          {activeTab === 'advanced' && (
            <AdvancedProperties
              selectedElement={selectedElement}
              onUpdateSelectedElement={onUpdateSelectedElement}
            />
          )}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          color: '#6b7280',
          padding: '40px 20px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎯</div>
          <div style={{ fontSize: '16px', marginBottom: '6px', fontWeight: '500' }}>
            Ningún elemento seleccionado
          </div>
          <div style={{ fontSize: '14px' }}>
            Haz clic en un elemento para editarlo
          </div>
        </div>
      )}

      {/* Help */}
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
          marginBottom: '6px'
        }}>
          💡 Consejos:
        </div>
        <ul style={{
          fontSize: '11px',
          color: '#15803d',
          margin: 0,
          paddingLeft: '16px'
        }}>
          <li><strong>Básicas</strong>: Posición, dimensiones y configuración</li>
          <li><strong>Estilos Manual</strong>: Crear componentes reutilizables</li>
          <li><strong>Avanzado</strong>: Z-index, padding y metadatos</li>
          <li><strong>Variables</strong>: Disponibles en sidebar izquierdo</li>
          <li><strong>Ctrl+Espacio</strong>: Insertar variables en edición</li>
        </ul>
      </div>
    </div>
  );
};

export default PropertiesPanel;