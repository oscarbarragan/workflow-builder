// src/components/layoutDesigner/PropertiesPanel/TextStyleProperties.jsx - CORRECCIÓN FINAL
import React, { useState, useEffect } from 'react';
import { styleManager } from '../utils/StyleManager';
import { propertiesConfig } from './properties.config';

const TextStyleProperties = ({ 
  selectedElement, 
  onUpdateSelectedElement,
  availableData = {},
  onStyleCreated
}) => {
  const [previewText, setPreviewText] = useState('Texto de ejemplo');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStyleName, setNewStyleName] = useState('');
  const [newStyleCategory, setNewStyleCategory] = useState('custom');

  // ✅ Estado para valores resueltos del estilo actual
  const [currentValues, setCurrentValues] = useState({});
  
  // ✅ NUEVO: Estado para valores temporales de inputs (permite edición libre)
  const [tempInputValues, setTempInputValues] = useState({});

  const { textStyleConfig } = propertiesConfig;

  // ✅ Resolver valores cada vez que cambie el elemento
  useEffect(() => {
    if (!selectedElement) return;

    let values = {};

    // Si hay un estilo aplicado, usar sus valores
    if (selectedElement.textStyleId) {
      const appliedStyle = styleManager.getTextStyle(selectedElement.textStyleId);
      if (appliedStyle) {
        values = { ...appliedStyle };
      }
    }

    // Los valores locales del elemento siempre tienen prioridad
    if (selectedElement.textStyle) {
      values = { ...values, ...selectedElement.textStyle };
    }

    setCurrentValues(values);
    
    // ✅ NUEVO: Limpiar valores temporales cuando cambie el elemento
    setTempInputValues({});
    
    console.log('🔤 Text style values resolved:', values);
  }, [selectedElement, selectedElement?.textStyleId, selectedElement?.textStyle]);

  // ✅ Función simple para actualizar propiedades
  const updateTextStyleProperty = (property, value) => {
    console.log('🔤 Updating text property:', property, 'to:', value);
    
    // Siempre actualizar el objeto textStyle local del elemento
    const currentTextStyle = selectedElement.textStyle || {};
    const newTextStyle = { 
      ...currentTextStyle, 
      [property]: value 
    };
    
    onUpdateSelectedElement('textStyle', newTextStyle);
    console.log('✅ Text style updated locally:', newTextStyle);

    // ✅ NUEVO: Limpiar valor temporal después de aplicar
    setTempInputValues(prev => {
      const updated = { ...prev };
      delete updated[property];
      return updated;
    });
  };

  // Crear nuevo estilo
  const handleCreateStyle = () => {
    if (!newStyleName.trim()) {
      alert('Por favor ingresa un nombre para el estilo');
      return;
    }

    const styleId = styleManager.generateStyleId('textStyle');
    const styleData = {
      name: newStyleName.trim(),
      category: newStyleCategory,
      isCustom: true,
      ...currentValues
    };

    try {
      styleManager.addTextStyle(styleId, styleData);
      
      // Aplicar el nuevo estilo al elemento
      onUpdateSelectedElement('textStyleId', styleId);
      
      if (onStyleCreated) {
        onStyleCreated('textStyle', styleId);
      }
      
      setShowCreateModal(false);
      setNewStyleName('');
      console.log('✅ Text style created:', styleId);
    } catch (error) {
      console.error('❌ Error creating text style:', error);
      alert('Error al crear el estilo');
    }
  };

  // ✅ CORREGIDO: Renderizar campo de propiedad con inputs editables
  const renderProperty = (property, config) => {
    // ✅ Obtener valor actual (temporal o resuelto)
    const getCurrentValue = () => {
      if (tempInputValues[property] !== undefined) {
        return tempInputValues[property];
      }
      const value = currentValues[property];
      return value !== undefined && value !== null ? value : config.default;
    };

    const currentValue = getCurrentValue();

    // ✅ Manejar cambio de input numérico
    const handleNumericChange = (inputValue) => {
      console.log('📝 Input change:', property, inputValue);
      setTempInputValues(prev => ({
        ...prev,
        [property]: inputValue
      }));
    };

    // ✅ Manejar blur de input numérico
    const handleNumericBlur = (inputValue) => {
      console.log('🔚 Input blur:', property, inputValue);
      
      if (inputValue === '' || inputValue === null || inputValue === undefined) {
        updateTextStyleProperty(property, config.default);
      } else {
        const numValue = parseFloat(inputValue);
        if (!isNaN(numValue)) {
          updateTextStyleProperty(property, numValue);
        } else {
          // Si no es un número válido, restaurar valor anterior
          setTempInputValues(prev => {
            const updated = { ...prev };
            delete updated[property];
            return updated;
          });
        }
      }
    };

    // ✅ Manejar Enter para aplicar inmediatamente
    const handleKeyPress = (e, inputValue) => {
      if (e.key === 'Enter') {
        e.target.blur(); // Trigger blur para aplicar valor
      }
    };

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

        {config.type === 'select' && (
          <select
            value={currentValue}
            onChange={(e) => updateTextStyleProperty(property, e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            {config.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {config.type === 'number' && (
          <input
            type="number"
            value={currentValue}
            onChange={(e) => handleNumericChange(e.target.value)}
            onBlur={(e) => handleNumericBlur(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, e.target.value)}
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
            placeholder={String(config.default)}
          />
        )}

        {config.type === 'color' && (
          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              type="color"
              value={currentValue}
              onChange={(e) => updateTextStyleProperty(property, e.target.value)}
              style={{
                width: '40px',
                height: '32px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            />
            <input
              type="text"
              value={currentValue}
              onChange={(e) => updateTextStyleProperty(property, e.target.value)}
              style={{
                flex: 1,
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '12px'
              }}
              placeholder="#000000"
            />
          </div>
        )}

        {config.type === 'boolean' && (
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            padding: '8px',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            background: currentValue ? '#eff6ff' : 'white'
          }}>
            <input
              type="checkbox"
              checked={currentValue || false}
              onChange={(e) => updateTextStyleProperty(property, e.target.checked)}
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

  // Vista previa
  const renderPreview = () => {
    const previewStyles = {
      fontFamily: currentValues.fontFamily || 'Arial, sans-serif',
      fontSize: `${currentValues.fontSize || 14}px`,
      color: currentValues.color || '#000000',
      fontWeight: currentValues.bold ? 'bold' : 'normal',
      fontStyle: currentValues.italic ? 'italic' : 'normal',
      textDecoration: [
        currentValues.underline ? 'underline' : '',
        currentValues.strikethrough ? 'line-through' : ''
      ].filter(Boolean).join(' ') || 'none'
    };

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
          minHeight: '50px',
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={previewStyles}>
            {previewText}
          </div>
        </div>

        <input
          type="text"
          value={previewText}
          onChange={(e) => setPreviewText(e.target.value)}
          placeholder="Texto para vista previa"
          style={{
            width: '100%',
            padding: '4px 6px',
            border: '1px solid #d1d5db',
            borderRadius: '3px',
            fontSize: '11px'
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
            🔤 Crear Text Style
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
              placeholder="Ej: Mi Texto Personalizado"
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
              {textStyleConfig.categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
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
        background: '#fef3c7',
        padding: '12px',
        borderRadius: '6px',
        marginBottom: '16px',
        border: '1px solid #fbbf24'
      }}>
        <div style={{
          fontSize: '12px',
          color: '#92400e',
          fontWeight: '600',
          marginBottom: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          🔤 Text Style Configuration
        </div>
        <div style={{
          fontSize: '11px',
          color: '#92400e'
        }}>
          Los cambios se aplican inmediatamente. Crea un estilo para reutilizar esta configuración.
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
          Propiedades de Texto
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
          💾 Crear Text Style
        </button>
      </div>

      {/* Propiedades principales */}
      <div style={{ marginBottom: '16px' }}>
        {Object.entries(textStyleConfig.properties).map(([property, config]) => 
          renderProperty(property, config)
        )}
      </div>

      {/* Vista previa */}
      {renderPreview()}

      {/* Información del estilo actual */}
      {selectedElement.textStyleId && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '6px'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#15803d',
            fontWeight: '600',
            marginBottom: '4px'
          }}>
            ✅ Estilo Aplicado
          </div>
          <div style={{
            fontSize: '11px',
            color: '#15803d'
          }}>
            <strong>Nombre:</strong> {styleManager.getTextStyle(selectedElement.textStyleId)?.name || 'Desconocido'}
            <br />
            <strong>Categoría:</strong> {styleManager.getTextStyle(selectedElement.textStyleId)?.category || 'Sin categoría'}
          </div>
        </div>
      )}

      {/* Modal */}
      {renderCreateModal()}
    </div>
  );
};

export default TextStyleProperties;