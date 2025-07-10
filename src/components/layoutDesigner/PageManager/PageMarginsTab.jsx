// src/components/layoutDesigner/PageManager/PageMarginsTab.jsx
import React from 'react';
import { unitsConfig } from '../utils/units.config';

const PageMarginsTab = ({ config, errors, updateConfig, convertValue }) => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '16px',
      height: '100%'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '12px',
        background: '#f0f9ff',
        borderRadius: '8px',
        border: '1px solid #0ea5e9'
      }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#0c4a6e' }}>
          📏 Configuración de Márgenes
        </div>
        <div style={{ fontSize: '11px', color: '#0c4a6e', marginTop: '4px' }}>
          Define el espacio libre alrededor del contenido de la página
        </div>
      </div>

      {/* Visualización de márgenes */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '20px'
      }}>
        <div style={{
          width: '200px',
          height: '280px',
          border: '2px solid #3b82f6',
          borderRadius: '8px',
          position: 'relative',
          background: 'white'
        }}>
          {/* Márgenes visuales */}
          <div style={{
            position: 'absolute',
            top: `${Math.max(2, (config.margins.top / config.size.height) * 100)}%`,
            left: `${Math.max(2, (config.margins.left / config.size.width) * 100)}%`,
            right: `${Math.max(2, (config.margins.right / config.size.width) * 100)}%`,
            bottom: `${Math.max(2, (config.margins.bottom / config.size.height) * 100)}%`,
            border: '1px dashed #10b981',
            background: 'rgba(16, 185, 129, 0.1)'
          }} />
          
          {/* Etiquetas de márgenes */}
          <div style={{
            position: 'absolute',
            top: '4px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '10px',
            color: '#3b82f6',
            fontWeight: '600'
          }}>
            {config.margins.top}{config.margins.unit}
          </div>
          
          <div style={{
            position: 'absolute',
            right: '4px',
            top: '50%',
            transform: 'translateY(-50%) rotate(90deg)',
            fontSize: '10px',
            color: '#3b82f6',
            fontWeight: '600'
          }}>
            {config.margins.right}{config.margins.unit}
          </div>
          
          <div style={{
            position: 'absolute',
            bottom: '4px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '10px',
            color: '#3b82f6',
            fontWeight: '600'
          }}>
            {config.margins.bottom}{config.margins.unit}
          </div>
          
          <div style={{
            position: 'absolute',
            left: '4px',
            top: '50%',
            transform: 'translateY(-50%) rotate(-90deg)',
            fontSize: '10px',
            color: '#3b82f6',
            fontWeight: '600'
          }}>
            {config.margins.left}{config.margins.unit}
          </div>
        </div>
      </div>

      {/* Controles de márgenes */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px'
      }}>
        {[
          { key: 'top', label: 'Superior', icon: '⬆️' },
          { key: 'right', label: 'Derecho', icon: '➡️' },
          { key: 'bottom', label: 'Inferior', icon: '⬇️' },
          { key: 'left', label: 'Izquierdo', icon: '⬅️' }
        ].map(margin => (
          <div key={margin.key}>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: '500',
              marginBottom: '4px',
              color: '#374151'
            }}>
              {margin.icon} {margin.label}
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <input
                type="number"
                value={config.margins[margin.key]}
                onChange={(e) => updateConfig(`margins.${margin.key}`, parseFloat(e.target.value) || 0)}
                style={{
                  flex: 1,
                  padding: '8px 10px',
                  border: errors[`margin_${margin.key}`] ? '2px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
                min="0"
                step="any"
              />
              <span style={{
                fontSize: '11px',
                color: '#6b7280',
                fontWeight: '500',
                minWidth: '20px'
              }}>
                {config.margins.unit}
              </span>
            </div>
            {errors[`margin_${margin.key}`] && (
              <div style={{ color: '#ef4444', fontSize: '10px', marginTop: '2px' }}>
                {errors[`margin_${margin.key}`]}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Presets de márgenes */}
      <div>
        <h4 style={{
          fontSize: '12px',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '8px'
        }}>
          📐 Márgenes Predefinidos
        </h4>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '8px'
        }}>
          {unitsConfig.elementPresets.margins.map(preset => (
            <button
              key={preset.name}
              onClick={() => {
                updateConfig('margins', {
                  top: convertValue(preset.top, preset.unit, config.margins.unit),
                  right: convertValue(preset.right, preset.unit, config.margins.unit),
                  bottom: convertValue(preset.bottom, preset.unit, config.margins.unit),
                  left: convertValue(preset.left, preset.unit, config.margins.unit),
                  unit: config.margins.unit
                });
              }}
              style={{
                padding: '8px 6px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                background: 'white',
                fontSize: '11px',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#f3f4f6';
                e.target.style.borderColor = '#9ca3af';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'white';
                e.target.style.borderColor = '#d1d5db';
              }}
            >
              <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                {preset.name}
              </div>
              <div style={{ color: '#6b7280', fontSize: '9px' }}>
                {preset.top}×{preset.right}×{preset.bottom}×{preset.left} {preset.unit}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PageMarginsTab;