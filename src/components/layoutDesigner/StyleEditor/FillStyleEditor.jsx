// src/components/layoutDesigner/StyleEditor/FillStyleEditor.jsx
import React from 'react';

const FillStyleEditor = ({ styleProperties, updateProperty }) => {
  const presetColors = [
    { name: 'Transparente', value: 'transparent' },
    { name: 'Blanco', value: '#ffffff' },
    { name: 'Gris claro', value: '#f3f4f6' },
    { name: 'Gris', value: '#9ca3af' },
    { name: 'Azul claro', value: '#eff6ff' },
    { name: 'Verde claro', value: '#f0fdf4' },
    { name: 'Amarillo claro', value: '#fefce8' },
    { name: 'Rojo claro', value: '#fef2f2' },
    { name: 'Púrpura claro', value: '#faf5ff' },
    { name: 'Rosa claro', value: '#fdf2f8' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Background Color */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '6px',
          color: '#374151'
        }}>
          Color de Fondo
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="color"
            value={styleProperties.backgroundColor === 'transparent' ? '#ffffff' : (styleProperties.backgroundColor || '#f9fafb')}
            onChange={(e) => updateProperty('backgroundColor', e.target.value)}
            style={{
              width: '50px',
              height: '40px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          />
          <input
            type="text"
            value={styleProperties.backgroundColor || '#f9fafb'}
            onChange={(e) => updateProperty('backgroundColor', e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
            placeholder="#f9fafb"
          />
        </div>
      </div>

      {/* Preset Colors */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '8px',
          color: '#374151'
        }}>
          Colores Predefinidos
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
          {presetColors.map(preset => (
            <div
              key={preset.value}
              onClick={() => updateProperty('backgroundColor', preset.value)}
              style={{
                width: '40px',
                height: '40px',
                backgroundColor: preset.value === 'transparent' ? 'white' : preset.value,
                border: styleProperties.backgroundColor === preset.value ? '2px solid #3b82f6' : '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer',
                position: 'relative',
                backgroundImage: preset.value === 'transparent' 
                  ? 'repeating-conic-gradient(#ccc 0% 25%, transparent 0% 50%) 50% / 8px 8px' 
                  : 'none'
              }}
              title={preset.name}
            >
              {preset.value === 'transparent' && (
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: '10px',
                  color: '#dc2626',
                  fontWeight: 'bold'
                }}>
                  ∅
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Opacity */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '6px',
          color: '#374151'
        }}>
          Opacidad
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="range"
            value={styleProperties.opacity || 1}
            onChange={(e) => updateProperty('opacity', parseFloat(e.target.value))}
            style={{
              flex: 1,
              height: '6px',
              borderRadius: '3px',
              background: '#e5e7eb',
              outline: 'none',
              cursor: 'pointer'
            }}
            min="0"
            max="1"
            step="0.05"
          />
          <div style={{
            minWidth: '60px',
            textAlign: 'center',
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            background: '#f3f4f6',
            padding: '4px 8px',
            borderRadius: '4px'
          }}>
            {Math.round((styleProperties.opacity || 1) * 100)}%
          </div>
        </div>
      </div>

      {/* Gradient Support (Future Enhancement) */}
      <div style={{
        padding: '12px',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '6px'
      }}>
        <div style={{
          fontSize: '12px',
          color: '#6b7280',
          fontWeight: '600',
          marginBottom: '4px'
        }}>
          🎨 Gradientes (Próximamente)
        </div>
        <div style={{
          fontSize: '11px',
          color: '#9ca3af'
        }}>
          Soporte para gradientes lineales y radiales estará disponible en futuras versiones.
        </div>
      </div>

      {/* Visual Opacity Preview */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '8px',
          color: '#374151'
        }}>
          Vista Previa de Opacidad
        </label>
        <div style={{
          height: '60px',
          borderRadius: '8px',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid #e5e7eb',
          backgroundImage: 'repeating-conic-gradient(#f3f4f6 0% 25%, white 0% 50%) 50% / 20px 20px'
        }}>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: styleProperties.backgroundColor || '#f9fafb',
            opacity: styleProperties.opacity || 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: styleProperties.backgroundColor === '#ffffff' || 
                   styleProperties.backgroundColor === 'transparent' ? '#374151' : 'white',
            fontSize: '14px',
            fontWeight: '600'
          }}>
            Vista Previa
          </div>
        </div>
      </div>
    </div>
  );
};

export default FillStyleEditor;