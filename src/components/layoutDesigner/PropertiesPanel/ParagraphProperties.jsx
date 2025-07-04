// src/components/layoutDesigner/PropertiesPanel/ParagraphProperties.jsx
import React, { useState } from 'react';
import { styleManager } from '../utils/StyleManager';
import { propertiesConfig } from './properties.config';

const ParagraphProperties = ({ 
  selectedElement, 
  onUpdateSelectedElement,
  onStyleCreated
}) => {
  const [previewText, setPreviewText] = useState('Este es un ejemplo de párrafo que muestra cómo se aplican los estilos de párrafo. Puedes ver el interlineado, alineación y espaciado en esta vista previa.');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStyleName, setNewStyleName] = useState('');
  const [newStyleCategory, setNewStyleCategory] = useState('custom');

  const { paragraphConfig } = propertiesConfig;

  // Obtener el estilo actual del párrafo
  const getCurrentParagraphStyle = () => {
    if (selectedElement.paragraphStyleId) {
      const style = styleManager.getParagraphStyle(selectedElement.paragraphStyleId);
      if (style) return style;
    }
    return selectedElement.paragraphStyle || {};
  };

  const currentStyle = getCurrentParagraphStyle();

  // Actualizar propiedad del estilo de párrafo
  const updateParagraphStyleProperty = (property, value) => {
    const newParagraphStyle = { 
      ...currentStyle, 
      [property]: value 
    };
    onUpdateSelectedElement('paragraphStyle', newParagraphStyle);
  };

  // Crear nuevo estilo
  const handleCreateStyle = () => {
    if (!newStyleName.trim()) {
      alert('Por favor ingresa un nombre para el estilo');
      return;
    }

    const styleId = styleManager.generateStyleId('paragraphStyle');
    const styleData = {
      name: newStyleName.trim(),
      category: newStyleCategory,
      isCustom: true,
      ...currentStyle
    };

    try {
      styleManager.addParagraphStyle(styleId, styleData);
      
      // Aplicar el nuevo estilo al elemento
      onUpdateSelectedElement('paragraphStyleId', styleId);
      
      if (onStyleCreated) {
        onStyleCreated('paragraphStyle', styleId);
      }
      
      setShowCreateModal(false);
      setNewStyleName('');
      console.log('✅ Paragraph style created:', styleId);
    } catch (error) {
      console.error('❌ Error creating paragraph style:', error);
      alert('Error al crear el estilo');
    }
  };

  // Renderizar campo de propiedad
  const renderProperty = (property, config) => {
    const value = currentStyle[property] ?? config.default;

    return (
      <div key={property} style={{ marginBottom: '12px' }}>
        <label style={{
          display: 'block',
          fontSize: '12px',
          fontWeight: '500',
          marginBottom: '4px',
          color: '#374151'
        }}>
          {config.label}
          {config.unit && <span style={{ color: '#6b7280', fontSize: '11px' }}> ({config.unit})</span>}
        </label>

        {config.type === 'select' && property === 'alignment' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
            {config.options.map(option => (
              <button
                key={option.value}
                onClick={() => updateParagraphStyleProperty(property, option.value)}
                style={{
                  padding: '8px 4px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  background: value === option.value ? '#eff6ff' : 'white',
                  borderColor: value === option.value ? '#3b82f6' : '#d1d5db',
                  cursor: 'pointer',
                  fontSize: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '2px',
                  transition: 'all 0.2s'
                }}
                title={option.label}
              >
                <span style={{ fontSize: '12px' }}>{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        )}

        {config.type === 'number' && (
          <input
            type="number"
            value={value}
            onChange={(e) => updateParagraphStyleProperty(property, parseFloat(e.target.value) || config.default)}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '12px'
            }}
            min={config.min}
            max={config.max}
            step={config.step}
          />
        )}

        {config.type === 'boolean' && (
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontSize: '12px'
          }}>
            <input
              type="checkbox"
              checked={value || false}
              onChange={(e) => updateParagraphStyleProperty(property, e.target.checked)}
              style={{
                width: '16px',
                height: '16px',
                cursor: 'pointer'
              }}
            />
            {config.label}
          </label>
        )}
      </div>
    );
  };

  // Renderizar vista previa
  const renderPreview = () => {
    const previewStyles = {
      textAlign: currentStyle.alignment || 'left',
      lineHeight: currentStyle.lineHeight || 1.4,
      textIndent: `${currentStyle.indent || 0}px`,
      marginLeft: `${currentStyle.leftSpacing || 0}px`,
      marginRight: `${currentStyle.rightSpacing || 0}px`,
      marginTop: `${currentStyle.spaceBefore || 0}px`,
      marginBottom: `${currentStyle.spaceAfter || 0}px`,
      whiteSpace: currentStyle.wordWrap ? 'normal' : 'nowrap',
      overflow: currentStyle.wordWrap ? 'visible' : 'hidden'
    };

    // Aplicar sangría de primera línea
    if (currentStyle.firstLineIndent) {
      previewStyles.textIndent = `${(currentStyle.indent || 0) + (currentStyle.firstLineIndent || 0)}px`;
    }

    return (
      <div style={{
        marginTop: '16px',
        padding: '12px',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        background: '#f8fafc'
      }}>
        <div style={{
          fontSize: '11px',
          fontWeight: '500',
          color: '#6b7280',
          marginBottom: '8px'
        }}>
          Vista Previa
        </div>
        
        <div style={{
          padding: '12px',
          background: 'white',
          borderRadius: '4px',
          border: '1px solid #e5e7eb',
          marginBottom: '8px',
          minHeight: '60px'
        }}>
          <div style={{
            ...previewStyles,
            fontSize: '13px',
            fontFamily: 'Arial, sans-serif',
            color: '#374151'
          }}>
            {previewText}
          </div>
        </div>

        <textarea
          value={previewText}
          onChange={(e) => setPreviewText(e.target.value)}
          placeholder="Texto para vista previa del párrafo"
          style={{
            width: '100%',
            padding: '4px 6px',
            border: '1px solid #d1d5db',
            borderRadius: '3px',
            fontSize: '11px',
            minHeight: '40px',
            resize: 'vertical',
            boxSizing: 'border-box'
          }}
        />
      </div>
    );
  };

  // Modal para crear nuevo estilo
  const renderCreateModal = () => {
    if (!showCreateModal) return null;

    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000
      }}>
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          width: '300px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
        }}>
          <h3 style={{
            margin: '0 0 16px 0',
            fontSize: '16px',
            color: '#374151'
          }}>
            📄 Crear Paragraph Style
          </h3>

          <div style={{ marginBottom: '12px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              marginBottom: '4px',
              color: '#374151'
            }}>
              Nombre del Estilo *
            </label>
            <input
              type="text"
              value={newStyleName}
              onChange={(e) => setNewStyleName(e.target.value)}
              placeholder="Ej: Mi Párrafo Personalizado"
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              marginBottom: '4px',
              color: '#374151'
            }}>
              Categoría
            </label>
            <select
              value={newStyleCategory}
              onChange={(e) => setNewStyleCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            >
              <option value="custom">Personalizado</option>
              <option value="basic">Básico</option>
              <option value="advanced">Avanzado</option>
              <option value="special">Especial</option>
            </select>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px'
          }}>
            <button
              onClick={() => setShowCreateModal(false)}
              style={{
                padding: '6px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                background: 'white',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleCreateStyle}
              style={{
                padding: '6px 12px',
                border: 'none',
                borderRadius: '4px',
                background: '#059669',
                color: 'white',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              💾 Crear
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{
        background: '#f0f9ff',
        padding: '12px',
        borderRadius: '6px',
        marginBottom: '16px',
        border: '1px solid #0ea5e9'
      }}>
        <div style={{
          fontSize: '12px',
          color: '#0c4a6e',
          fontWeight: '600',
          marginBottom: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          📄 Paragraph Style Configuration
        </div>
        <div style={{
          fontSize: '11px',
          color: '#0c4a6e'
        }}>
          Configura espaciado, alineación e interlineado del párrafo
        </div>
      </div>

      {/* Botón para crear estilo */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h4 style={{
          margin: 0,
          fontSize: '14px',
          color: '#374151',
          fontWeight: '600'
        }}>
          Propiedades de Párrafo
        </h4>
        
        <button
          onClick={() => setShowCreateModal(true)}
          style={{
            background: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '6px 10px',
            fontSize: '11px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          💾 Crear Paragraph Style
        </button>
      </div>

      {/* Propiedades principales */}
      <div style={{ marginBottom: '16px' }}>
        {/* Alineación */}
        {renderProperty('alignment', {
          label: 'Alineación',
          type: 'select',
          options: [
            { value: 'left', label: 'Izquierda', icon: '⬅️' },
            { value: 'center', label: 'Centro', icon: '↔️' },
            { value: 'right', label: 'Derecha', icon: '➡️' },
            { value: 'justify', label: 'Justificado', icon: '⬌' }
          ],
          default: 'left'
        })}

        {/* Interlineado */}
        {renderProperty('lineHeight', {
          label: 'Interlineado',
          type: 'number',
          min: 0.5,
          max: 5.0,
          step: 0.1,
          default: 1.4,
          unit: ''
        })}

        {/* Sangría */}
        {renderProperty('indent', {
          label: 'Sangría',
          type: 'number',
          min: 0,
          max: 200,
          step: 1,
          default: 0,
          unit: 'px'
        })}

        {/* Espaciado lateral */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          {renderProperty('leftSpacing', {
            label: 'Espacio Izquierda',
            type: 'number',
            min: 0,
            max: 100,
            step: 1,
            default: 0,
            unit: 'px'
          })}
          {renderProperty('rightSpacing', {
            label: 'Espacio Derecha',
            type: 'number',
            min: 0,
            max: 100,
            step: 1,
            default: 0,
            unit: 'px'
          })}
        </div>

        {/* Sangría primera línea */}
        {renderProperty('firstLineIndent', {
          label: 'Sangría Primera Línea',
          type: 'number',
          min: -100,
          max: 200,
          step: 1,
          default: 0,
          unit: 'px'
        })}

        {/* Espaciado vertical */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
          {renderProperty('spaceBefore', {
            label: 'Espacio Antes',
            type: 'number',
            min: 0,
            max: 100,
            step: 1,
            default: 0,
            unit: 'px'
          })}
          {renderProperty('spaceAfter', {
            label: 'Espacio Después',
            type: 'number',
            min: 0,
            max: 100,
            step: 1,
            default: 0,
            unit: 'px'
          })}
        </div>

        {/* Ajuste de línea */}
        {renderProperty('wordWrap', {
          label: 'Ajuste de Línea Automático',
          type: 'boolean',
          default: true
        })}
      </div>

      {/* Vista previa */}
      {renderPreview()}

      {/* Información del estilo actual */}
      {selectedElement.paragraphStyleId && (
        <div style={{
          marginTop: '16px',
          padding: '8px 12px',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '4px'
        }}>
          <div style={{
            fontSize: '11px',
            color: '#15803d',
            fontWeight: '600'
          }}>
            ✅ {styleManager.getParagraphStyle(selectedElement.paragraphStyleId)?.name || 'Estilo aplicado'}
          </div>
        </div>
      )}

      {/* Modal */}
      {renderCreateModal()}
    </div>
  );
};

export default ParagraphProperties;