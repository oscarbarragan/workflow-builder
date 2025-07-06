// src/components/layoutDesigner/PropertiesPanel/BorderProperties.jsx
import React, { useState } from 'react';
import { styleManager } from '../utils/StyleManager';
import { propertiesConfig } from './properties.config';

const BorderProperties = ({ 
  selectedElement, 
  onUpdateSelectedElement,
  onStyleCreated
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStyleName, setNewStyleName] = useState('');
  const [newStyleCategory, setNewStyleCategory] = useState('custom');

  const { borderConfig } = propertiesConfig;

  // ✅ CORREGIDO: Obtener el estilo actual del borde con valores por defecto
  const getCurrentBorderStyle = () => {
    if (selectedElement.borderStyleId) {
      const style = styleManager.getBorderStyle(selectedElement.borderStyleId);
      if (style) return style;
    }
    
    // Combinar estilo del elemento con valores por defecto
    const elementBorderStyle = selectedElement.borderStyle || {};
    const defaultBorderStyle = {
      width: 1,
      style: 'solid',
      color: '#d1d5db',
      radius: 0,
      sides: ['top', 'right', 'bottom', 'left']
    };
    
    return { ...defaultBorderStyle, ...elementBorderStyle };
  };

  const currentStyle = getCurrentBorderStyle();

  // ✅ CORREGIDO: Actualizar propiedad del estilo de borde con logging
  const updateBorderStyleProperty = (property, value) => {
    console.log('🔲 Updating border property:', property, 'to:', value);
    
    const newBorderStyle = { 
      ...currentStyle, 
      [property]: value 
    };
    
    console.log('🔲 New border style:', newBorderStyle);
    onUpdateSelectedElement('borderStyle', newBorderStyle);
    
    // ✅ NUEVO: Forzar re-render después de un breve delay
    setTimeout(() => {
      console.log('✅ Border style should be applied now');
    }, 0);
  };

  // Crear nuevo estilo
  const handleCreateStyle = () => {
    if (!newStyleName.trim()) {
      alert('Por favor ingresa un nombre para el estilo');
      return;
    }

    const styleId = styleManager.generateStyleId('borderStyle');
    const styleData = {
      name: newStyleName.trim(),
      category: newStyleCategory,
      isCustom: true,
      ...currentStyle
    };

    try {
      styleManager.addBorderStyle(styleId, styleData);
      
      // Aplicar el nuevo estilo al elemento
      onUpdateSelectedElement('borderStyleId', styleId);
      
      if (onStyleCreated) {
        onStyleCreated('borderStyle', styleId);
      }
      
      setShowCreateModal(false);
      setNewStyleName('');
      console.log('✅ Border style created:', styleId);
    } catch (error) {
      console.error('❌ Error creating border style:', error);
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

        {config.type === 'select' && (
          <select
            value={value}
            onChange={(e) => updateBorderStyleProperty(property, e.target.value)}
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
            value={value}
            onChange={(e) => updateBorderStyleProperty(property, parseFloat(e.target.value) || config.default)}
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

        {config.type === 'color' && (
          <div style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
              <input
                type="color"
                value={value === 'transparent' ? '#ffffff' : value}
                onChange={(e) => updateBorderStyleProperty(property, e.target.value)}
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
                onChange={(e) => updateBorderStyleProperty(property, e.target.value)}
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
                  onClick={() => updateBorderStyleProperty(property, preset)}
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

        {config.type === 'multiselect' && property === 'sides' && (
          <div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '4px',
              marginBottom: '8px'
            }}>
              {config.options.map(option => {
                const currentSides = currentStyle.sides || ['top', 'right', 'bottom', 'left'];
                const isSelected = currentSides.includes(option.value);
                
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      const newSides = isSelected 
                        ? currentSides.filter(side => side !== option.value)
                        : [...currentSides, option.value];
                      console.log('🔲 Updating sides from', currentSides, 'to', newSides);
                      updateBorderStyleProperty('sides', newSides);
                    }}
                    style={{
                      padding: '8px 4px',
                      border: '2px solid',
                      borderColor: isSelected ? '#3b82f6' : '#d1d5db',
                      borderRadius: '4px',
                      background: isSelected ? '#eff6ff' : 'white',
                      cursor: 'pointer',
                      fontSize: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px',
                      transition: 'all 0.2s',
                      fontWeight: isSelected ? '600' : '400'
                    }}
                    onMouseOver={(e) => {
                      if (!isSelected) {
                        e.target.style.backgroundColor = '#f8fafc';
                        e.target.style.borderColor = '#9ca3af';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (!isSelected) {
                        e.target.style.backgroundColor = 'white';
                        e.target.style.borderColor = '#d1d5db';
                      }
                    }}
                  >
                    <span style={{ fontSize: '12px' }}>{option.icon}</span>
                    <span>{option.label}</span>
                    {isSelected && (
                      <span style={{ 
                        fontSize: '8px', 
                        color: '#3b82f6',
                        fontWeight: '600'
                      }}>
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* ✅ NUEVO: Información de lados seleccionados */}
            <div style={{
              fontSize: '11px',
              color: '#6b7280',
              textAlign: 'center',
              padding: '4px 8px',
              background: '#f8fafc',
              borderRadius: '4px',
              border: '1px solid #e5e7eb'
            }}>
              {(() => {
                const currentSides = currentStyle.sides || ['top', 'right', 'bottom', 'left'];
                if (currentSides.length === 4) {
                  return '🔲 Todos los lados seleccionados';
                } else if (currentSides.length === 0) {
                  return '⚪ Sin bordes seleccionados';
                } else {
                  const sideNames = {
                    top: 'Arriba',
                    right: 'Derecha', 
                    bottom: 'Abajo',
                    left: 'Izquierda'
                  };
                  return `🔘 ${currentSides.map(side => sideNames[side]).join(', ')}`;
                }
              })()}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Renderizar vista previa
  const renderPreview = () => {
    const previewStyles = {
      width: '120px',
      height: '80px',
      margin: '0 auto',
      borderRadius: `${currentStyle.radius || 0}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      color: '#374151',
      fontWeight: '500',
      background: '#f8fafc'
    };

    // Aplicar bordes según los lados seleccionados
    const sides = currentStyle.sides || ['top', 'right', 'bottom', 'left'];
    const borderStyle = `${currentStyle.width || 1}px ${currentStyle.style || 'solid'} ${currentStyle.color || '#000000'}`;
    
    if (sides.includes('top')) previewStyles.borderTop = borderStyle;
    if (sides.includes('right')) previewStyles.borderRight = borderStyle;
    if (sides.includes('bottom')) previewStyles.borderBottom = borderStyle;
    if (sides.includes('left')) previewStyles.borderLeft = borderStyle;

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
          Vista Previa del Borde
        </div>
        
        <div style={{
          padding: '20px',
          background: 'white',
          borderRadius: '6px'
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
            🔲 Crear Border Style
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
              placeholder="Ej: Mi Borde Personalizado"
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
              {borderConfig.categories.map(category => (
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
          🔲 Border Style Configuration
        </div>
        <div style={{
          fontSize: '11px',
          color: '#0c4a6e'
        }}>
          Configura grosor, estilo, color y radio de bordes
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
          Propiedades de Borde
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
          💾 Crear Border Style
        </button>
      </div>

      {/* Propiedades principales */}
      <div style={{ marginBottom: '16px' }}>
        {/* Grosor */}
        {renderProperty('width', {
          label: 'Grosor',
          type: 'number',
          min: 0,
          max: 50,
          step: 1,
          default: 1,
          unit: 'px'
        })}

        {/* Estilo */}
        {renderProperty('style', {
          label: 'Estilo',
          type: 'select',
          options: [
            { value: 'none', label: 'Sin borde' },
            { value: 'solid', label: 'Sólido' },
            { value: 'dashed', label: 'Punteado' },
            { value: 'dotted', label: 'Puntos' },
            { value: 'double', label: 'Doble' },
            { value: 'groove', label: 'Biselado' },
            { value: 'ridge', label: 'Relieve' },
            { value: 'inset', label: 'Hundido' },
            { value: 'outset', label: 'Elevado' }
          ],
          default: 'solid'
        })}

        {/* Color */}
        {renderProperty('color', {
          label: 'Color',
          type: 'color',
          default: '#000000',
          presets: [
            '#000000', '#808080', '#C0C0C0', '#FFFFFF',
            '#FF0000', '#00FF00', '#0000FF', '#FFFF00'
          ]
        })}

        {/* Radio */}
        {renderProperty('radius', {
          label: 'Radio',
          type: 'number',
          min: 0,
          max: 100,
          step: 1,
          default: 0,
          unit: 'px'
        })}

        {/* Lados */}
        {renderProperty('sides', {
          label: 'Lados',
          type: 'multiselect',
          options: [
            { value: 'top', label: 'Arriba', icon: '⬆️' },
            { value: 'right', label: 'Derecha', icon: '➡️' },
            { value: 'bottom', label: 'Abajo', icon: '⬇️' },
            { value: 'left', label: 'Izquierda', icon: '⬅️' }
          ],
          default: ['top', 'right', 'bottom', 'left']
        })}
      </div>

      {/* Vista previa */}
      {renderPreview()}

      {/* Información del estilo actual */}
      {selectedElement.borderStyleId && (
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
            ✅ {styleManager.getBorderStyle(selectedElement.borderStyleId)?.name || 'Estilo aplicado'}
          </div>
        </div>
      )}

      {/* Modal */}
      {renderCreateModal()}
    </div>
  );
};

export default BorderProperties;