// src/components/layoutDesigner/StyleEditor/ParagraphStyleEditor.jsx
import React from 'react';

const ParagraphStyleEditor = ({ styleProperties, updateProperty }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Alignment */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '8px',
          color: '#374151'
        }}>
          Alineación
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {[
            { value: 'left', label: 'Izquierda', icon: '⬅️' },
            { value: 'center', label: 'Centro', icon: '↔️' },
            { value: 'right', label: 'Derecha', icon: '➡️' },
            { value: 'justify', label: 'Justificado', icon: '⬌' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => updateProperty('alignment', option.value)}
              style={{
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: styleProperties.alignment === option.value ? '#eff6ff' : 'white',
                borderColor: styleProperties.alignment === option.value ? '#3b82f6' : '#d1d5db',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px'
              }}
              title={option.label}
            >
              <span>{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Line Height */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '6px',
          color: '#374151'
        }}>
          Interlineado
        </label>
        <input
          type="number"
          value={styleProperties.lineHeight || 1.4}
          onChange={(e) => updateProperty('lineHeight', parseFloat(e.target.value) || 1.4)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
          min="1.0"
          max="3.0"
          step="0.1"
        />
      </div>

      {/* Letter Spacing */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '6px',
          color: '#374151'
        }}>
          Espaciado de Letras (px)
        </label>
        <input
          type="number"
          value={styleProperties.letterSpacing || 0}
          onChange={(e) => updateProperty('letterSpacing', parseFloat(e.target.value) || 0)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
          min="-2"
          max="10"
          step="0.1"
        />
      </div>

      {/* Indent */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '6px',
          color: '#374151'
        }}>
          Sangría (px)
        </label>
        <input
          type="number"
          value={styleProperties.indent || 0}
          onChange={(e) => updateProperty('indent', parseInt(e.target.value) || 0)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
          min="0"
          max="100"
        />
      </div>

      {/* Spacing */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '14px', 
            fontWeight: '500', 
            marginBottom: '6px',
            color: '#374151'
          }}>
            Espacio Antes (px)
          </label>
          <input
            type="number"
            value={styleProperties.spaceBefore || 0}
            onChange={(e) => updateProperty('spaceBefore', parseInt(e.target.value) || 0)}
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

        <div>
          <label style={{ 
            display: 'block', 
            fontSize: '14px', 
            fontWeight: '500', 
            marginBottom: '6px',
            color: '#374151'
          }}>
            Espacio Después (px)
          </label>
          <input
            type="number"
            value={styleProperties.spaceAfter || 0}
            onChange={(e) => updateProperty('spaceAfter', parseInt(e.target.value) || 0)}
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
      </div>

      {/* Word Wrap */}
      <div>
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          color: '#374151'
        }}>
          <input
            type="checkbox"
            checked={styleProperties.wordWrap !== false}
            onChange={(e) => updateProperty('wordWrap', e.target.checked)}
            style={{
              width: '16px',
              height: '16px',
              cursor: 'pointer'
            }}
          />
          Ajuste de línea automático
        </label>
      </div>
    </div>
  );
};

export default ParagraphStyleEditor;