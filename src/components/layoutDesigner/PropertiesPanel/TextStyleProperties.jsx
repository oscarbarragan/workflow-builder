// src/components/layoutDesigner/PropertiesPanel/TextStyleProperties.jsx
import React, { useState } from 'react';
import { styleManager } from '../utils/StyleManager';
import { propertiesConfig } from './properties.config';

const TextStyleProperties = ({ 
  selectedElement, 
  onUpdateSelectedElement,
  availableData = {},
  onStyleCreated
}) => {
  const [previewText, setPreviewText] = useState('Texto de ejemplo');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStyleName, setNewStyleName] = useState('');
  const [newStyleCategory, setNewStyleCategory] = useState('custom');

  const { textStyleConfig } = propertiesConfig;

  // Obtener el estilo actual del texto
  const getCurrentTextStyle = () => {
    if (selectedElement.textStyleId) {
      const style = styleManager.getTextStyle(selectedElement.textStyleId);
      if (style) return style;
    }
    return selectedElement.textStyle || textStyleConfig.properties;
  };

  const currentStyle = getCurrentTextStyle();

  // Actualizar propiedad del estilo de texto
  const updateTextStyleProperty = (property, value) => {
    const newTextStyle = { 
      ...currentStyle, 
      [property]: value 
    };
    onUpdateSelectedElement('textStyle', newTextStyle);
  };

  // Procesar variables para enlaces
  const processedVariables = React.useMemo(() => {
    if (!availableData || Object.keys(availableData).length === 0) return [];
    
    return Object.entries(availableData).map(([key, value]) => ({
      value: key,
      label: `{{${key}}} - ${typeof value === 'string' ? value.substring(0, 30) : String(value).substring(0, 30)}`
    }));
  }, [availableData]);

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
      ...currentStyle
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

  // Renderizar campo de propiedad
  const renderProperty = (property, config) => {
    const value = currentStyle[property] || config.default;

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
            value={value}
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
            type="text"
            value={currentStyle[property] !== undefined && currentStyle[property] !== null ? currentStyle[property] : ''}
            onChange={(e) => {
              const value = e.target.value;
              if (value === '' || value === null) {
                updateTextStyleProperty(property, '');
              } else {
                const numValue = parseFloat(value);
                if (!isNaN(numValue)) {
                  updateTextStyleProperty(property, numValue);
                } else {
                  updateTextStyleProperty(property, value); // Permitir escribir mientras tipea
                }
              }
            }}
            onBlur={(e) => {
              const value = e.target.value;
              if (value === '' || value === null) {
                updateTextStyleProperty(property, config.default);
              } else {
                const numValue = parseFloat(value);
                if (!isNaN(numValue)) {
                  updateTextStyleProperty(property, numValue);
                } else {
                  updateTextStyleProperty(property, config.default);
                }
              }
            }}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '12px'
            }}
            placeholder={String(config.default)}
            min={config.min}
            max={config.max}
            step={config.step}
          />
        )}

        {config.type === 'color' && (
          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              type="color"
              value={value}
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
              value={value}
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
            {/* Preset colors */}
            <div style={{ display: 'flex', gap: '2px' }}>
              {config.presets?.slice(0, 5).map(preset => (
                <button
                  key={preset}
                  onClick={() => updateTextStyleProperty(property, preset)}
                  style={{
                    width: '20px',
                    height: '20px',
                    backgroundColor: preset,
                    border: value === preset ? '2px solid #3b82f6' : '1px solid #d1d5db',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                  title={preset}
                />
              ))}
            </div>
          </div>
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

        {config.type === 'text' && property === 'link' && (
          <div>
            {/* Habilitar hipervínculo */}
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '12px',
              marginBottom: '8px'
            }}>
              <input
                type="checkbox"
                checked={currentStyle.linkEnabled || false}
                onChange={(e) => updateTextStyleProperty('linkEnabled', e.target.checked)}
                style={{
                  width: '16px',
                  height: '16px',
                  cursor: 'pointer'
                }}
              />
              Habilitar como hipervínculo
            </label>

            {currentStyle.linkEnabled && (
              <div>
                {/* Tipo de enlace */}
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="radio"
                        name="linkType"
                        value="static"
                        checked={currentStyle.linkType !== 'variable'}
                        onChange={() => updateTextStyleProperty('linkType', 'static')}
                      />
                      URL estática
                    </label>
                    <label style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}>
                      <input
                        type="radio"
                        name="linkType"
                        value="variable"
                        checked={currentStyle.linkType === 'variable'}
                        onChange={() => updateTextStyleProperty('linkType', 'variable')}
                      />
                      Variable
                    </label>
                  </div>
                </div>

                {/* URL estática */}
                {currentStyle.linkType !== 'variable' && (
                  <input
                    type="text"
                    value={currentStyle.linkUrl || ''}
                    onChange={(e) => updateTextStyleProperty('linkUrl', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '12px',
                      marginBottom: '8px'
                    }}
                    placeholder="https://ejemplo.com"
                  />
                )}

                {/* Variable de enlace */}
                {currentStyle.linkType === 'variable' && (
                  <select
                    value={currentStyle.linkVariable || ''}
                    onChange={(e) => updateTextStyleProperty('linkVariable', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '12px',
                      marginBottom: '8px',
                      fontFamily: 'monospace'
                    }}
                  >
                    <option value="">Selecciona una variable</option>
                    {processedVariables
                      .filter(v => v.type === 'string')
                      .map(variable => (
                        <option key={variable.value} value={variable.value}>
                          {variable.value}
                        </option>
                      ))}
                  </select>
                )}

                {/* Target del enlace */}
                <select
                  value={currentStyle.linkTarget || '_self'}
                  onChange={(e) => updateTextStyleProperty('linkTarget', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  <option value="_self">Misma ventana</option>
                  <option value="_blank">Nueva ventana</option>
                </select>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Renderizar vista previa
  const renderPreview = () => {
    const previewStyles = {
      fontFamily: currentStyle.fontFamily || 'Arial, sans-serif',
      fontSize: `${(currentStyle.fontSize || 14)}px`,
      color: currentStyle.color || '#000000',
      fontWeight: currentStyle.bold ? 'bold' : 'normal',
      fontStyle: currentStyle.italic ? 'italic' : 'normal',
      textDecoration: [
        currentStyle.underline ? 'underline' : '',
        currentStyle.strikethrough ? 'line-through' : ''
      ].filter(Boolean).join(' ') || 'none',
      transform: (currentStyle.scale && currentStyle.scale !== 1) ? `scale(${currentStyle.scale})` : 'none',
      transformOrigin: 'left center',
      display: 'inline-block'
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
        
        {/* Información actual */}
        <div style={{
          marginTop: '8px',
          fontSize: '10px',
          color: '#6b7280'
        }}>
          Tamaño: {currentStyle.fontSize || 14}px • Escala: {currentStyle.scale || 1}x
          {currentStyle.scale && currentStyle.scale !== 1 && (
            <span> → {Math.round((currentStyle.fontSize || 14) * (currentStyle.scale || 1))}px</span>
          )}
        </div>
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
          Configura propiedades de texto y guárdalas como estilos reutilizables
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