// src/components/layoutDesigner/StyleEditor/BorderStyleEditor.jsx
import React from 'react';

const BorderStyleEditor = ({ styleProperties, updateProperty }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Border Width */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '6px',
          color: '#374151'
        }}>
          Grosor (px)
        </label>
        <input
          type="number"
          value={styleProperties.width || 1}
          onChange={(e) => updateProperty('width', parseInt(e.target.value) || 0)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
          min="0"
          max="20"
        />
      </div>

      {/* Border Style */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '6px',
          color: '#374151'
        }}>
          Estilo
        </label>
        <select
          value={styleProperties.style || 'solid'}
          onChange={(e) => updateProperty('style', e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        >
          <option value="none">Sin borde</option>
          <option value="solid">Sólido</option>
          <option value="dashed">Punteado</option>
          <option value="dotted">Puntos</option>
          <option value="double">Doble</option>
        </select>
      </div>

      {/* Border Color */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '6px',
          color: '#374151'
        }}>
          Color
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="color"
            value={styleProperties.color || '#d1d5db'}
            onChange={(e) => updateProperty('color', e.target.value)}
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
            value={styleProperties.color || '#d1d5db'}
            onChange={(e) => updateProperty('color', e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
            placeholder="#d1d5db"
          />
        </div>
      </div>

      {/* Border Radius */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '6px',
          color: '#374151'
        }}>
          Radio de Esquinas (px)
        </label>
        <input
          type="number"
          value={styleProperties.radius || 0}
          onChange={(e) => updateProperty('radius', parseInt(e.target.value) || 0)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
          min="0"
          max="50"
        />
      </div>

      {/* Visual Preview of Border Styles */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '8px',
          color: '#374151'
        }}>
          Vista Previa de Estilos
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {[
            { value: 'solid', label: 'Sólido' },
            { value: 'dashed', label: 'Punteado' },
            { value: 'dotted', label: 'Puntos' },
            { value: 'double', label: 'Doble' },
            { value: 'groove', label: 'Biselado' },
            { value: 'ridge', label: 'Relieve' }
          ].map(borderStyle => (
            <div
              key={borderStyle.value}
              onClick={() => updateProperty('style', borderStyle.value)}
              style={{
                padding: '8px',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                cursor: 'pointer',
                textAlign: 'center',
                fontSize: '11px',
                background: styleProperties.style === borderStyle.value ? '#eff6ff' : 'white'
              }}
            >
              <div
                style={{
                  height: '3px',
                  width: '100%',
                  border: `2px ${borderStyle.value} #3b82f6`,
                  marginBottom: '4px'
                }}
              />
              {borderStyle.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BorderStyleEditor;