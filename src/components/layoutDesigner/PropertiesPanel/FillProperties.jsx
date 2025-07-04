// src/components/layoutDesigner/PropertiesPanel/FillProperties.jsx
import React, { useState } from 'react';
import { styleManager } from '../utils/StyleManager';
import { propertiesConfig } from './properties.config';

const FillProperties = ({ 
  selectedElement, 
  onUpdateSelectedElement,
  onStyleCreated
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStyleName, setNewStyleName] = useState('');
  const [newStyleCategory, setNewStyleCategory] = useState('custom');

  const { fillConfig } = propertiesConfig;

  // Obtener el estilo actual del relleno
  const getCurrentFillStyle = () => {
    if (selectedElement.fillStyleId) {
      const style = styleManager.getFillStyle(selectedElement.fillStyleId);
      if (style) return style;
    }
    return selectedElement.fillStyle || {};
  };

  const currentStyle = getCurrentFillStyle();

  // Actualizar propiedad del estilo de relleno
  const updateFillStyleProperty = (property, value) => {
    const newFillStyle = { 
      ...currentStyle, 
      [property]: value 
    };
    onUpdateSelectedElement('fillStyle', newFillStyle);
  };

  // Crear nuevo estilo
  const handleCreateStyle = () => {
    if (!newStyleName.trim()) {
      alert('Por favor ingresa un nombre para el estilo');
      return;
    }

    const styleId = styleManager.generateStyleId('fillStyle');
    const styleData = {
      name: newStyleName.trim(),
      category: newStyleCategory,
      isCustom: true,
      ...currentStyle
    };

    try {
      styleManager.addFillStyle(styleId, styleData);
      
      // Aplicar el nuevo estilo al elemento
      onUpdateSelectedElement('fillStyleId', styleId);
      
      if (onStyleCreated) {
        onStyleCreated('fillStyle', styleId);
      }
      
      setShowCreateModal(false);
      setNewStyleName('');
      console.log('✅ Fill style created:', styleId);
    } catch (error) {
      console.error('❌ Error creating fill style:', error);
      alert('Error al crear el estilo');
    }
  };

  // Agregar parada de color al degradado
  const addGradientStop = () => {
    const currentStops = currentStyle.gradientStops || [
      { color: '#FFFFFF', position: 0 },
      { color: '#000000', position: 100 }
    ];
    
    const newStop = {
      color: '#808080',
      position: 50
    };
    
    updateFillStyleProperty('gradientStops', [...currentStops, newStop]);
  };

  // Eliminar parada de color
  const removeGradientStop = (index) => {
    const currentStops = currentStyle.gradientStops || [];
    if (currentStops.length > 2) { // Mantener al menos 2 paradas
      const newStops = currentStops.filter((_, i) => i !== index);
      updateFillStyleProperty('gradientStops', newStops);
    }
  };

  // Actualizar parada de color
  const updateGradientStop = (index, property, value) => {
    const currentStops = [...(currentStyle.gradientStops || [])];
    currentStops[index] = { ...currentStops[index], [property]: value };
    updateFillStyleProperty('gradientStops', currentStops);
  };

  // Renderizar campo de propiedad
  const renderProperty = (property, config) => {
    const value = currentStyle[property] ?? config.default;

    if (property === 'gradientStops') {
      return renderGradientStops();
    }

    if (property === 'shadow') {
      return renderShadowControls();
    }

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
            onChange={(e) => updateFillStyleProperty(property, e.target.value)}
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

        {config.type === 'color' && (
          <div style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
              <input
                type="color"
                value={value === 'transparent' ? '#ffffff' : value}
                onChange={(e) => updateFillStyleProperty(property, e.target.value)}
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
                onChange={(e) => updateFillStyleProperty(property, e.target.value)}
                style={{
                  flex: 1,
                  padding: '6px 8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '12px'
                }}
                placeholder="transparent"
              />
            </div>
            
            {/* Colores predefinidos */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '4px' }}>
              {config.presets?.map(preset => (
                <button
                  key={preset}
                  onClick={() => updateFillStyleProperty(property, preset)}
                  style={{
                    width: '30px',
                    height: '25px',
                    backgroundColor: preset === 'transparent' ? 'white' : preset,
                    border: value === preset ? '2px solid #3b82f6' : '1px solid #d1d5db',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    position: 'relative',
                    backgroundImage: preset === 'transparent' 
                      ? 'repeating-conic-gradient(#ccc 0% 25%, transparent 0% 50%) 50% / 8px 8px' 
                      : 'none'
                  }}
                  title={preset}
                >
                  {preset === 'transparent' && (
                    <div style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      fontSize: '8px',
                      color: '#dc2626',
                      fontWeight: 'bold'
                    }}>
                      ∅
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {config.type === 'range' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="range"
              value={value}
              onChange={(e) => updateFillStyleProperty(property, parseFloat(e.target.value))}
              style={{
                flex: 1,
                height: '6px',
                borderRadius: '3px',
                background: '#e5e7eb',
                outline: 'none',
                cursor: 'pointer'
              }}
              min={config.min}
              max={config.max}
              step={config.step}
            />
            <div style={{
              minWidth: '50px',
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: '600',
              color: '#374151',
              background: '#f3f4f6',
              padding: '2px 6px',
              borderRadius: '3px'
            }}>
              {Math.round(value * 100)}%
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
              onChange={(e) => updateFillStyleProperty(property, e.target.checked)}
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

  // Renderizar controles de degradado
  const renderGradientStops = () => {
    if (!currentStyle.gradientEnabled) return null;

    const stops = currentStyle.gradientStops || [
      { color: '#FFFFFF', position: 0 },
      { color: '#000000', position: 100 }
    ];

    return (
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px'
        }}>
          <label style={{
            fontSize: '12px',
            fontWeight: '500',
            color: '#374151'
          }}>
            Paradas de Color
          </label>
          <button
            onClick={addGradientStop}
            style={{
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              padding: '2px 6px',
              fontSize: '10px',
              cursor: 'pointer'
            }}
          >
            + Agregar
          </button>
        </div>

        {stops.map((stop, index) => (
          <div key={index} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '8px',
            padding: '8px',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            background: '#f8fafc'
          }}>
            <input
              type="color"
              value={stop.color}
              onChange={(e) => updateGradientStop(index, 'color', e.target.value)}
              style={{
                width: '30px',
                height: '25px',
                border: '1px solid #d1d5db',
                borderRadius: '3px',
                cursor: 'pointer'
              }}
            />
            <input
              type="range"
              value={stop.position}
              onChange={(e) => updateGradientStop(index, 'position', parseInt(e.target.value))}
              style={{ flex: 1 }}
              min="0"
              max="100"
            />
            <span style={{ fontSize: '10px', minWidth: '35px' }}>{stop.position}%</span>
            {stops.length > 2 && (
              <button
                onClick={() => removeGradientStop(index)}
                style={{
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '3px',
                  padding: '2px 4px',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Renderizar controles de sombra
  const renderShadowControls = () => {
    const shadowProps = currentStyle.shadow || fillConfig.properties.shadow.properties;
    const shadowEnabled = shadowProps.enabled || false;

    const updateShadowProperty = (property, value) => {
      const newShadow = { ...shadowProps, [property]: value };
      updateFillStyleProperty('shadow', newShadow);
    };

    return (
      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: '500',
          marginBottom: '8px'
        }}>
          <input
            type="checkbox"
            checked={shadowEnabled}
            onChange={(e) => updateShadowProperty('enabled', e.target.checked)}
            style={{
              width: '16px',
              height: '16px',
              cursor: 'pointer'
            }}
          />
          Sombra
        </label>

        {shadowEnabled && (
          <div style={{
            padding: '12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            background: '#f8fafc'
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#6b7280' }}>Offset X</label>
                <input
                  type="number"
                  value={shadowProps.offsetX || 2}
                  onChange={(e) => updateShadowProperty('offsetX', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '4px 6px',
                    border: '1px solid #d1d5db',
                    borderRadius: '3px',
                    fontSize: '11px'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#6b7280' }}>Offset Y</label>
                <input
                  type="number"
                  value={shadowProps.offsetY || 2}
                  onChange={(e) => updateShadowProperty('offsetY', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '4px 6px',
                    border: '1px solid #d1d5db',
                    borderRadius: '3px',
                    fontSize: '11px'
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '8px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#6b7280' }}>Difuminado</label>
                <input
                  type="number"
                  value={shadowProps.blur || 4}
                  onChange={(e) => updateShadowProperty('blur', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '4px 6px',
                    border: '1px solid #d1d5db',
                    borderRadius: '3px',
                    fontSize: '11px'
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#6b7280' }}>Extensión</label>
                <input
                  type="number"
                  value={shadowProps.spread || 0}
                  onChange={(e) => updateShadowProperty('spread', parseInt(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '4px 6px',
                    border: '1px solid #d1d5db',
                    borderRadius: '3px',
                    fontSize: '11px'
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '8px' }}>
              <label style={{ fontSize: '11px', color: '#6b7280' }}>Color de Sombra</label>
              <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                <input
                  type="color"
                  value={(shadowProps.color && typeof shadowProps.color === 'string' && shadowProps.color.length >= 7) 
                    ? shadowProps.color.substring(0, 7) 
                    : '#000000'}
                  onChange={(e) => updateShadowProperty('color', e.target.value + '40')}
                  style={{
                    width: '30px',
                    height: '25px',
                    border: '1px solid #d1d5db',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                />
                <input
                  type="text"
                  value={shadowProps.color || '#00000040'}
                  onChange={(e) => updateShadowProperty('color', e.target.value)}
                  style={{
                    flex: 1,
                    padding: '4px 6px',
                    border: '1px solid #d1d5db',
                    borderRadius: '3px',
                    fontSize: '11px'
                  }}
                  placeholder="#00000040"
                />
              </div>
            </div>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '11px'
            }}>
              <input
                type="checkbox"
                checked={shadowProps.inset || false}
                onChange={(e) => updateShadowProperty('inset', e.target.checked)}
                style={{
                  width: '14px',
                  height: '14px',
                  cursor: 'pointer'
                }}
              />
              Sombra interior
            </label>
          </div>
        )}
      </div>
    );
  };

  // Renderizar vista previa
  const renderPreview = () => {
    let previewStyles = {
      width: '120px',
      height: '80px',
      margin: '0 auto',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      color: '#374151',
      fontWeight: '500',
      border: '1px solid #e5e7eb'
    };

    // Aplicar color de fondo
    if (currentStyle.gradientEnabled && currentStyle.gradientStops) {
      const stops = currentStyle.gradientStops.map(stop => 
        `${stop.color} ${stop.position}%`
      ).join(', ');
      
      const gradientType = currentStyle.gradientType || 'linear';
      const direction = currentStyle.gradientDirection || '180deg';
      
      if (gradientType === 'linear') {
        previewStyles.background = `linear-gradient(${direction}, ${stops})`;
      } else if (gradientType === 'radial') {
        previewStyles.background = `radial-gradient(circle, ${stops})`;
      } else if (gradientType === 'conic') {
        previewStyles.background = `conic-gradient(${stops})`;
      }
    } else {
      previewStyles.backgroundColor = currentStyle.backgroundColor || 'transparent';
    }

    // Aplicar opacidad
    previewStyles.opacity = currentStyle.opacity ?? 1;

    // Aplicar sombra
    if (currentStyle.shadow?.enabled) {
      const s = currentStyle.shadow;
      previewStyles.boxShadow = `${s.inset ? 'inset ' : ''}${s.offsetX || 2}px ${s.offsetY || 2}px ${s.blur || 4}px ${s.spread || 0}px ${s.color || '#00000040'}`;
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
          marginBottom: '12px',
          textAlign: 'center'
        }}>
          Vista Previa del Relleno
        </div>
        
        <div style={{
          padding: '20px',
          background: 'white',
          borderRadius: '6px',
          backgroundImage: 'repeating-conic-gradient(#f3f4f6 0% 25%, white 0% 50%) 50% / 16px 16px'
        }}>
          <div style={previewStyles}>
            Ejemplo
          </div>
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
            🎨 Crear Fill Style
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
              placeholder="Ej: Mi Relleno Personalizado"
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
              {fillConfig.categories.map(category => (
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
        background: '#fff7ed',
        padding: '12px',
        borderRadius: '6px',
        marginBottom: '16px',
        border: '1px solid #fb923c'
      }}>
        <div style={{
          fontSize: '12px',
          color: '#9a3412',
          fontWeight: '600',
          marginBottom: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          🎨 Fill Style Configuration
        </div>
        <div style={{
          fontSize: '11px',
          color: '#9a3412'
        }}>
          Configura colores, degradados, patrones y efectos de relleno
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
          Propiedades de Relleno
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
          💾 Crear Fill Style
        </button>
      </div>

      {/* Propiedades principales */}
      <div style={{ marginBottom: '16px' }}>
        {/* Color de fondo básico */}
        {renderProperty('backgroundColor', fillConfig.properties.backgroundColor)}
        
        {/* Opacidad */}
        {renderProperty('opacity', fillConfig.properties.opacity)}

        {/* Habilitar degradado */}
        {renderProperty('gradientEnabled', fillConfig.properties.gradientEnabled)}

        {/* Configuración de degradado */}
        {currentStyle.gradientEnabled && (
          <div style={{
            padding: '12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            background: '#f8fafc',
            marginBottom: '12px'
          }}>
            <h5 style={{
              margin: '0 0 12px 0',
              fontSize: '12px',
              fontWeight: '600',
              color: '#374151'
            }}>
              🌈 Configuración de Degradado
            </h5>

            {renderProperty('gradientType', fillConfig.properties.gradientType)}
            {renderProperty('gradientDirection', fillConfig.properties.gradientDirection)}
            {renderGradientStops()}
          </div>
        )}

        {/* Patrón */}
        {renderProperty('pattern', fillConfig.properties.pattern)}

        {/* Sombra */}
        {renderShadowControls()}
      </div>

      {/* Vista previa */}
      {renderPreview()}

      {/* Presets de relleno */}
      <div style={{
        marginTop: '16px',
        padding: '12px',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        background: 'white'
      }}>
        <div style={{
          fontSize: '12px',
          fontWeight: '500',
          color: '#374151',
          marginBottom: '12px'
        }}>
          🎨 Rellenos Predefinidos
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px'
        }}>
          {[
            { name: 'Transparente', style: { backgroundColor: 'transparent', opacity: 1 } },
            { name: 'Blanco', style: { backgroundColor: '#ffffff', opacity: 1 } },
            { name: 'Gris Claro', style: { backgroundColor: '#f3f4f6', opacity: 1 } },
            { name: 'Azul Suave', style: { backgroundColor: '#eff6ff', opacity: 0.8 } },
            { name: 'Verde Suave', style: { backgroundColor: '#f0fdf4', opacity: 0.8 } },
            { name: 'Amarillo Suave', style: { backgroundColor: '#fefce8', opacity: 0.8 } },
            { name: 'Rojo Suave', style: { backgroundColor: '#fef2f2', opacity: 0.8 } },
            { name: 'Púrpura Suave', style: { backgroundColor: '#faf5ff', opacity: 0.8 } }
          ].map((preset, index) => (
            <button
              key={index}
              onClick={() => {
                // Limpiar degradado primero
                updateFillStyleProperty('gradientEnabled', false);
                // Aplicar el preset
                Object.entries(preset.style).forEach(([property, value]) => {
                  updateFillStyleProperty(property, value);
                });
              }}
              style={{
                padding: '8px 4px',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                background: 'white',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseOver={(e) => e.target.style.background = '#f8fafc'}
              onMouseOut={(e) => e.target.style.background = 'white'}
            >
              <div style={{
                width: '30px',
                height: '20px',
                backgroundColor: preset.style.backgroundColor,
                opacity: preset.style.opacity,
                borderRadius: '3px',
                border: '1px solid #e5e7eb',
                backgroundImage: preset.style.backgroundColor === 'transparent' 
                  ? 'repeating-conic-gradient(#f3f4f6 0% 25%, white 0% 50%) 50% / 8px 8px' 
                  : 'none'
              }} />
              <span style={{
                fontSize: '9px',
                color: '#6b7280',
                textAlign: 'center'
              }}>
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Información del estilo actual */}
      {selectedElement.fillStyleId && (
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
            ✅ {styleManager.getFillStyle(selectedElement.fillStyleId)?.name || 'Estilo aplicado'}
          </div>
        </div>
      )}

      {/* Modal */}
      {renderCreateModal()}
    </div>
  );
};

export default FillProperties;