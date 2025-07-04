// src/components/layoutDesigner/StyleEditor/TextStyleEditor.jsx
import React from 'react';
import { styleManager } from '../utils/StyleManager';

const TextStyleEditor = ({ styleProperties, updateProperty }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Font Family */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '6px',
          color: '#374151'
        }}>
          Fuente
        </label>
        <select
          value={styleProperties.fontFamily || 'Arial, sans-serif'}
          onChange={(e) => updateProperty('fontFamily', e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        >
          {styleManager.getAvailableFonts().map(font => (
            <option key={font} value={font}>
              {font.split(',')[0]}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '6px',
          color: '#374151'
        }}>
          Tamaño (px)
        </label>
        <input
          type="number"
          value={styleProperties.fontSize || 14}
          onChange={(e) => updateProperty('fontSize', parseInt(e.target.value) || 14)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
          min="8"
          max="72"
        />
      </div>

      {/* Font Styles */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '8px',
          color: '#374151'
        }}>
          Estilos
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { key: 'bold', label: 'Negrita', icon: '𝐁' },
            { key: 'italic', label: 'Cursiva', icon: '𝐼' },
            { key: 'underline', label: 'Subrayado', icon: 'U̲' },
            { key: 'strikethrough', label: 'Tachado', icon: 'S̶' }
          ].map(style => (
            <label 
              key={style.key}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#374151',
                padding: '8px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                background: styleProperties[style.key] ? '#eff6ff' : 'white'
              }}
            >
              <input
                type="checkbox"
                checked={styleProperties[style.key] || false}
                onChange={(e) => updateProperty(style.key, e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span style={{ marginRight: '4px' }}>{style.icon}</span>
              {style.label}
            </label>
          ))}
        </div>
      </div>

      {/* Color */}
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
            value={styleProperties.color || '#000000'}
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
            value={styleProperties.color || '#000000'}
            onChange={(e) => updateProperty('color', e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
            placeholder="#000000"
          />
        </div>
      </div>
    </div>
  );
};

export default TextStyleEditor;