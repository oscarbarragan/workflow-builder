// src/components/layoutDesigner/PageManager/PageAdvancedTab.jsx
import React from 'react';
import { unitsConfig } from '../utils/units.config';

const PageAdvancedTab = ({ config, updateConfig, convertValue, customSizes }) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '16px',
      height: '100%'
    }}>
      {/* DPI/Resolución */}
      <div>
        <label style={{
          display: 'block',
          fontSize: '12px',
          fontWeight: '500',
          marginBottom: '6px',
          color: '#374151'
        }}>
          🖨️ Resolución (DPI)
        </label>
        <select
          value={config.dpi}
          onChange={(e) => updateConfig('dpi', parseInt(e.target.value))}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            backgroundColor: 'white'
          }}
        >
          {unitsConfig.dpiPresets.map(preset => (
            <option key={preset.dpi} value={preset.dpi}>
              {preset.dpi} DPI - {preset.description}
            </option>
          ))}
        </select>
      </div>

      {/* Información calculada */}
      <div style={{
        padding: '16px',
        background: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <h4 style={{
          fontSize: '12px',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '12px'
        }}>
          📊 Información Calculada
        </h4>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '12px',
          fontSize: '11px'
        }}>
          <div>
            <div style={{ color: '#6b7280', marginBottom: '2px' }}>Dimensiones en píxeles:</div>
            <div style={{ fontWeight: '600', color: '#374151' }}>
              {Math.round(convertValue(config.size.width, config.size.unit, 'px'))} × {Math.round(convertValue(config.size.height, config.size.unit, 'px'))} px
            </div>
          </div>
          
          <div>
            <div style={{ color: '#6b7280', marginBottom: '2px' }}>Área imprimible:</div>
            <div style={{ fontWeight: '600', color: '#374151' }}>
              {(config.size.width - config.margins.left - config.margins.right).toFixed(1)} × {(config.size.height - config.margins.top - config.margins.bottom).toFixed(1)} {config.size.unit}
            </div>
          </div>
          
          <div>
            <div style={{ color: '#6b7280', marginBottom: '2px' }}>Resolución:</div>
            <div style={{ fontWeight: '600', color: '#374151' }}>
              {config.dpi} DPI
            </div>
          </div>
          
          <div>
            <div style={{ color: '#6b7280', marginBottom: '2px' }}>Formato:</div>
            <div style={{ fontWeight: '600', color: '#374151' }}>
              {config.orientation === 'portrait' ? 'Vertical' : 'Horizontal'}
            </div>
          </div>
        </div>
      </div>

      {/* Gestión de tamaños personalizados */}
      <div style={{
        padding: '16px',
        background: '#fefce8',
        borderRadius: '8px',
        border: '1px solid #fbbf24'
      }}>
        <h4 style={{
          fontSize: '12px',
          fontWeight: '600',
          color: '#92400e',
          marginBottom: '8px'
        }}>
          💾 Tamaños Personalizados Guardados
        </h4>
        
        {customSizes.length === 0 ? (
          <div style={{ fontSize: '11px', color: '#92400e', fontStyle: 'italic' }}>
            No hay tamaños personalizados guardados
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '6px',
            marginTop: '8px'
          }}>
            {customSizes.map((size, index) => (
              <div
                key={`${size.name}-${index}`}
                style={{
                  padding: '8px',
                  background: 'white',
                  border: '1px solid #d97706',
                  borderRadius: '4px',
                  fontSize: '10px'
                }}
              >
                <div style={{ fontWeight: '600', color: '#92400e' }}>{size.name}</div>
                <div style={{ color: '#a16207' }}>{size.width} × {size.height} {size.unit}</div>
                <div style={{ fontSize: '9px', color: '#a16207', marginTop: '2px' }}>
                  {new Date(size.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ayuda y conversiones */}
      <div style={{
        padding: '16px',
        background: '#fefce8',
        borderRadius: '8px',
        border: '1px solid #fbbf24'
      }}>
        <h4 style={{
          fontSize: '12px',
          fontWeight: '600',
          color: '#92400e',
          marginBottom: '8px'
        }}>
          💡 Conversiones Útiles
        </h4>
        <div style={{ fontSize: '10px', color: '#92400e', lineHeight: '1.4' }}>
          {unitsConfig.help.conversions.map((conversion, index) => (
            <div key={index}>{conversion}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PageAdvancedTab;