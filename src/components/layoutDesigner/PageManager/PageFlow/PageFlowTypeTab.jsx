// src/components/layoutDesigner/PageManager/PageFlowTypeTab.jsx
import React from 'react';
import { PAGE_FLOW_TYPES } from '../../utils/pageFlow.constants';

const PageFlowTypeTab = ({ flowConfig, updateFlowConfig }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
          🎯 Seleccionar Tipo de Página
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          {Object.entries(PAGE_FLOW_TYPES).map(([key, value]) => {
            const configs = {
              [PAGE_FLOW_TYPES.SIMPLE]: {
                title: '📄 Página Simple',
                description: 'Se muestra una vez, sin condiciones especiales',
                color: '#10b981'
              },
              [PAGE_FLOW_TYPES.CONDITIONAL]: {
                title: '🔀 Página Condicional',
                description: 'Se muestra solo si se cumplen ciertas condiciones',
                color: '#f59e0b'
              },
              [PAGE_FLOW_TYPES.REPEATED]: {
                title: '🔁 Página Repetida',
                description: 'Se repite por cada elemento de un array de datos',
                color: '#8b5cf6'
              }
            };
            
            const config = configs[value];
            const isSelected = flowConfig.type === value;
            
            return (
              <button
                key={value}
                onClick={() => updateFlowConfig('type', value)}
                style={{
                  padding: '20px',
                  border: isSelected ? `2px solid ${config.color}` : '2px solid #e5e7eb',
                  borderRadius: '12px',
                  background: isSelected ? `${config.color}15` : 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: isSelected ? config.color : '#374151'
                }}>
                  {config.title}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  lineHeight: '1.4'
                }}>
                  {config.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Configuración básica según tipo */}
      {flowConfig.type === PAGE_FLOW_TYPES.SIMPLE && (
        <div style={{
          padding: '20px',
          background: '#f0fdf4',
          borderRadius: '8px',
          border: '1px solid #bbf7d0'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#166534', marginBottom: '12px' }}>
            📄 Configuración de Página Simple
          </h4>
          <div style={{ fontSize: '13px', color: '#166534' }}>
            Esta página se mostrará una vez durante la generación del documento.
            No requiere configuración adicional.
          </div>
        </div>
      )}

      {flowConfig.type === PAGE_FLOW_TYPES.CONDITIONAL && (
        <div style={{
          padding: '20px',
          background: '#fffbeb',
          borderRadius: '8px',
          border: '1px solid #fbbf24'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#92400e', marginBottom: '12px' }}>
            🔀 Configuración de Página Condicional
          </h4>
          <div style={{ fontSize: '13px', color: '#92400e', marginBottom: '12px' }}>
            Esta página solo se mostrará si se cumplen las condiciones que definas.
            Ve a la pestaña "Condiciones" para configurarlas.
          </div>
          <div style={{ fontSize: '12px', color: '#a16207' }}>
            💡 Puedes usar variables de datos para crear condiciones dinámicas
          </div>
        </div>
      )}

      {flowConfig.type === PAGE_FLOW_TYPES.REPEATED && (
        <div style={{
          padding: '20px',
          background: '#faf5ff',
          borderRadius: '8px',
          border: '1px solid #c084fc'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#7c3aed', marginBottom: '12px' }}>
            🔁 Configuración de Página Repetida
          </h4>
          <div style={{ fontSize: '13px', color: '#7c3aed', marginBottom: '12px' }}>
            Esta página se repetirá por cada elemento de un array de datos.
            Ve a la pestaña "Repetición" para configurar el origen de datos.
          </div>
          <div style={{ fontSize: '12px', color: '#8b5cf6' }}>
            💡 Ideal para facturas con líneas, listas de productos, etc.
          </div>
        </div>
      )}
    </div>
  );
};

export default PageFlowTypeTab;