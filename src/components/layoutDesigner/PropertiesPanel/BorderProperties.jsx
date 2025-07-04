// src/components/layoutDesigner/PropertiesPanel/BasicProperties.jsx
import React from 'react';
import { ELEMENT_TYPES } from '../utils/constants';
import { styleManager } from '../utils/StyleManager';
import { variableProcessor } from '../utils/variableProcessor';

const BasicProperties = ({ 
  selectedElement, 
  onUpdateSelectedElement, 
  availableData = {},
  onStyleChanged // Nuevo prop para notificar cambios de estilo
}) => {
  // Procesar variables para opciones
  const processedVariables = React.useMemo(() => {
    const processed = variableProcessor.processAvailableVariables(availableData);
    return Object.entries(processed).map(([key, value]) => ({
      value: key,
      label: `${key} (${value.type}) - ${value.displayValue.length > 30 ? value.displayValue.substring(0, 30) + '...' : value.displayValue}`,
      type: value.type,
      displayValue: value.displayValue
    })).sort((a, b) => a.value.localeCompare(b.value));
  }, [availableData]);

  // Manejar cambio de estilo y cargar configuración
  const handleStyleChange = (styleType, styleId) => {
    onUpdateSelectedElement(`${styleType}Id`, styleId);
    
    if (styleId && styleManager) {
      let style = null;
      switch (styleType) {
        case 'textStyle':
          style = styleManager.getTextStyle(styleId);
          break;
        case 'paragraphStyle':
          style = styleManager.getParagraphStyle(styleId);
          break;
        case 'borderStyle':
          style = styleManager.getBorderStyle(styleId);
          break;
        case 'fillStyle':
          style = styleManager.getFillStyle(styleId);
          break;
      }
      
      if (style) {
        // Cargar configuración del estilo seleccionado
        onUpdateSelectedElement(styleType, { ...style });
        if (onStyleChanged) {
          onStyleChanged(styleType, style);
        }
      }
    }
  };

  const renderFormField = (label, field, type = 'text', options = {}) => {
    const fieldStyle = {
      width: '100%',
      padding: '6px 8px',
      border: '1px solid #d1d5db',
      borderRadius: '4px',
      fontSize: '12px',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s'
    };

    const labelStyle = {
      display: 'block',
      fontSize: '12px',
      fontWeight: '500',
      marginBottom: '4px',
      color: '#374151'
    };

    return (
      <div style={{ marginBottom: '12px' }}>
        <label style={labelStyle}>
          {label}
          {options.unit && <span style={{ color: '#6b7280', fontSize: '11px' }}> ({options.unit})</span>}
        </label>
        
        {type === 'select' ? (
          <select
            value={selectedElement[field] || options.default || ''}
            onChange={(e) => onUpdateSelectedElement(field, e.target.value)}
            style={fieldStyle}
          >
            {options.placeholder && (
              <option value="">{options.placeholder}</option>
            )}
            {options.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            value={selectedElement[field] || ''}
            onChange={(e) => onUpdateSelectedElement(field, e.target.value)}
            style={{
              ...fieldStyle,
              minHeight: '60px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
            placeholder={options.placeholder}
          />
        ) : type === 'color' ? (
          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              type="color"
              value={selectedElement[field] || options.default || '#000000'}
              onChange={(e) => onUpdateSelectedElement(field, e.target.value)}
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
              value={selectedElement[field] || options.default || '#000000'}
              onChange={(e) => onUpdateSelectedElement(field, e.target.value)}
              style={{
                ...fieldStyle,
                flex: 1
              }}
              placeholder="#000000"
            />
          </div>
        ) : type === 'boolean' ? (
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            color: '#374151'
          }}>
            <input
              type="checkbox"
              checked={selectedElement[field] || false}
              onChange={(e) => onUpdateSelectedElement(field, e.target.checked)}
              style={{
                width: '14px',
                height: '14px',
                cursor: 'pointer'
              }}
            />
            {options.label || label}
          </label>
        ) : (
          <input
            type={type}
            value={selectedElement[field] || (type === 'number' ? (options.default || 0) : '')}
            onChange={(e) => {
              const value = type === 'number' 
                ? parseFloat(e.target.value) || options.default || 0
                : e.target.value;
              onUpdateSelectedElement(field, value);
            }}
            style={fieldStyle}
            placeholder={options.placeholder}
            min={options.min}
            max={options.max}
            step={options.step}
          />
        )}
      </div>
    );
  };

  const renderStyleSelector = (label, styleType, getAllStylesFunc, icon) => {
    return (
      <div style={{ marginBottom: '12px' }}>
        <label style={{
          display: 'block',
          fontSize: '12px',
          fontWeight: '500',
          marginBottom: '4px',
          color: '#374151'
        }}>
          {icon} {label}
        </label>
        <select
          value={selectedElement[`${styleType}Id`] || ''}
          onChange={(e) => handleStyleChange(styleType, e.target.value || null)}
          style={{
            width: '100%',
            padding: '6px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '12px',
            boxSizing: 'border-box'
          }}
        >
          <option value="">Sin estilo aplicado</option>
          {getAllStylesFunc().map(style => (
            <option key={style.id} value={style.id}>
              {style.name} {style.isCustom ? '(Custom)' : ''}
            </option>
          ))}
        </select>
        
        {/* Mostrar configuración actual si hay estilo seleccionado */}
        {selectedElement[`${styleType}Id`] && (
          <div style={{
            marginTop: '6px',
            padding: '6px 8px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '4px',
            fontSize: '11px',
            color: '#15803d'
          }}>
            ✅ Estilo aplicado: {styleManager[`get${styleType.charAt(0).toUpperCase() + styleType.slice(1)}`]?.(selectedElement[`${styleType}Id`])?.name || 'Desconocido'}
          </div>
        )}
      </div>
    );
  };

  return (
    <div>
      {/* Element Info */}
      <div style={{
        background: '#eff6ff',
        padding: '12px',
        borderRadius: '6px',
        marginBottom: '16px',
        border: '1px solid #bfdbfe'
      }}>
        <div style={{
          fontSize: '12px',
          color: '#1e40af',
          fontWeight: '600',
          marginBottom: '4px'
        }}>
          📝 Elemento seleccionado
        </div>
        <div style={{
          fontSize: '14px',
          color: '#1e40af',
          marginBottom: '4px'
        }}>
          <strong>Tipo:</strong> {selectedElement.type}
        </div>
        <div style={{
          fontSize: '12px',
          color: '#3730a3'
        }}>
          <strong>ID:</strong> {selectedElement.id}
        </div>
      </div>

      {/* Posición y Dimensiones */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{
          margin: '0 0 12px 0',
          fontSize: '14px',
          color: '#374151',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          📍 Posición y Dimensiones
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {renderFormField('Rotación X', 'rotationX', 'number', { min: -360, max: 360, step: 1, default: 0, unit: '°' })}
          {renderFormField('Rotación Y', 'rotationY', 'number', { min: -360, max: 360, step: 1, default: 0, unit: '°' })}
        </div>
      </div>

      {/* Contenido específico del elemento */}
      {selectedElement.type === ELEMENT_TYPES.TEXT && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            color: '#374151',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            📝 Contenido de Texto
          </h4>
          
          {renderFormField('Texto', 'text', 'textarea', {
            placeholder: 'Ingresa el texto a mostrar'
          })}
          
          {renderFormField('Padding', 'padding', 'text', {
            placeholder: '8px 12px',
            default: '8px 12px'
          })}
        </div>
      )}

      {/* Control de Enlaces para elementos de texto */}
      {(selectedElement.type === ELEMENT_TYPES.TEXT || selectedElement.type === ELEMENT_TYPES.VARIABLE) && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            color: '#374151',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            🔗 Configuración de Enlace
          </h4>
          
          {/* Habilitar enlace */}
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            marginBottom: '12px'
          }}>
            <input
              type="checkbox"
              checked={selectedElement.linkEnabled || false}
              onChange={(e) => onUpdateSelectedElement('linkEnabled', e.target.checked)}
              style={{
                width: '16px',
                height: '16px',
                cursor: 'pointer'
              }}
            />
            Habilitar como enlace
          </label>

          {selectedElement.linkEnabled && (
            <div>
              {/* Tipo de enlace */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  marginBottom: '4px',
                  color: '#374151'
                }}>
                  Tipo de Enlace
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
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
                      checked={selectedElement.linkType !== 'variable'}
                      onChange={(e) => onUpdateSelectedElement('linkType', 'static')}
                    />
                    Enlace estático
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
                      checked={selectedElement.linkType === 'variable'}
                      onChange={(e) => onUpdateSelectedElement('linkType', 'variable')}
                    />
                    Variable
                  </label>
                </div>
              </div>

              {/* URL estática */}
              {selectedElement.linkType !== 'variable' && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '500',
                    marginBottom: '4px',
                    color: '#374151'
                  }}>
                    URL del Enlace
                  </label>
                  <input
                    type="text"
                    value={selectedElement.linkUrl || ''}
                    onChange={(e) => onUpdateSelectedElement('linkUrl', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '12px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="https://ejemplo.com"
                  />
                </div>
              )}

              {/* Variable de enlace */}
              {selectedElement.linkType === 'variable' && (
                <div style={{ marginBottom: '12px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '500',
                    marginBottom: '4px',
                    color: '#374151'
                  }}>
                    Variable de Enlace
                  </label>
                  {processedVariables.filter(v => v.type === 'string').length === 0 ? (
                    <div style={{
                      padding: '8px 12px',
                      border: '1px dashed #d1d5db',
                      borderRadius: '4px',
                      textAlign: 'center',
                      color: '#6b7280',
                      fontSize: '11px'
                    }}>
                      No hay variables de tipo string disponibles
                    </div>
                  ) : (
                    <select
                      value={selectedElement.linkVariable || ''}
                      onChange={(e) => onUpdateSelectedElement('linkVariable', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '12px',
                        boxSizing: 'border-box',
                        fontFamily: 'monospace'
                      }}
                    >
                      <option value="">Selecciona una variable</option>
                      {processedVariables
                        .filter(v => v.type === 'string')
                        .map(option => (
                          <option key={option.value} value={option.value}>
                            {option.value}
                          </option>
                        ))}
                    </select>
                  )}
                </div>
              )}

              {/* Target del enlace */}
              <div style={{ marginBottom: '12px' }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  marginBottom: '4px',
                  color: '#374151'
                }}>
                  Abrir enlace
                </label>
                <select
                  value={selectedElement.linkTarget || '_self'}
                  onChange={(e) => onUpdateSelectedElement('linkTarget', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  <option value="_self">En la misma pestaña</option>
                  <option value="_blank">En nueva pestaña</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Z-Index y propiedades de orden */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{
          margin: '0 0 12px 0',
          fontSize: '14px',
          color: '#374151',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          📊 Orden y Visibilidad
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {renderFormField('Z-Index', 'zIndex', 'number', {
            min: 0, max: 9999, step: 1, default: 100
          })}
          {renderFormField('Opacidad', 'opacity', 'number', {
            min: 0, max: 1, step: 0.01, default: 1
          })}
        </div>
      </div>

      {/* Propiedades para Rectangle */}
      {selectedElement.type === ELEMENT_TYPES.RECTANGLE && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            color: '#374151',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            ⬜ Propiedades del Rectángulo
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            {renderFormField('Color Relleno', 'fillColor', 'color', {
              default: 'rgba(156, 163, 175, 0.1)'
            })}
            {renderFormField('Color Borde', 'borderColor', 'color', {
              default: '#6b7280'
            })}
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {renderFormField('Grosor Borde', 'borderWidth', 'number', {
              min: 0, max: 20, step: 1, default: 2, unit: 'px'
            })}
            {renderFormField('Radio Borde', 'borderRadius', 'number', {
              min: 0, max: 50, step: 1, default: 4, unit: 'px'
            })}
          </div>
        </div>
      )}

      {/* Variable para elementos de variable */}
      {selectedElement.type === ELEMENT_TYPES.VARIABLE && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            color: '#374151',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            🔗 Variable
          </h4>
          
          {processedVariables.length === 0 ? (
            <div style={{
              padding: '12px',
              border: '1px dashed #d1d5db',
              borderRadius: '6px',
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '12px'
            }}>
              <div style={{ marginBottom: '4px' }}>🔗 No hay variables disponibles</div>
              <div style={{ fontSize: '11px' }}>
                Conecta nodos para obtener variables
              </div>
            </div>
          ) : (
            <select
              value={selectedElement.variable || ''}
              onChange={(e) => onUpdateSelectedElement('variable', e.target.value)}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '12px',
                boxSizing: 'border-box',
                fontFamily: 'monospace'
              }}
            >
              <option value="">Selecciona una variable del workflow</option>
              {processedVariables.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Aplicar Estilos Existentes */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{
          margin: '0 0 12px 0',
          fontSize: '14px',
          color: '#374151',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          🎨 Estilos Aplicados
        </h4>

        {/* Text Style */}
        {(selectedElement.type === ELEMENT_TYPES.TEXT || selectedElement.type === ELEMENT_TYPES.VARIABLE) && 
          renderStyleSelector('Text Style', 'textStyle', () => styleManager.getAllTextStyles(), '🔤')
        }

        {/* Paragraph Style */}
        {selectedElement.type === ELEMENT_TYPES.TEXT && 
          renderStyleSelector('Paragraph Style', 'paragraphStyle', () => styleManager.getAllParagraphStyles(), '📄')
        }

        {/* Border Style */}
        {renderStyleSelector('Border Style', 'borderStyle', () => styleManager.getAllBorderStyles(), '🔲')}

        {/* Fill Style */}
        {renderStyleSelector('Fill Style', 'fillStyle', () => styleManager.getAllFillStyles(), '🎨')}
      </div>

      {/* Información de Estilos Aplicados */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{
          margin: '0 0 8px 0',
          fontSize: '14px',
          color: '#374151',
          fontWeight: '600'
        }}>
          📋 Resumen de Estilos
        </h4>
        
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          padding: '12px'
        }}>
          {selectedElement.textStyleId && (
            <div style={{
              fontSize: '11px',
              color: '#16a34a',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>🔤</span>
              <strong>Texto:</strong> {styleManager.getTextStyle(selectedElement.textStyleId)?.name || selectedElement.textStyleId}
            </div>
          )}
          {selectedElement.paragraphStyleId && (
            <div style={{
              fontSize: '11px',
              color: '#16a34a',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>📄</span>
              <strong>Párrafo:</strong> {styleManager.getParagraphStyle(selectedElement.paragraphStyleId)?.name || selectedElement.paragraphStyleId}
            </div>
          )}
          {selectedElement.borderStyleId && (
            <div style={{
              fontSize: '11px',
              color: '#16a34a',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>🔲</span>
              <strong>Borde:</strong> {styleManager.getBorderStyle(selectedElement.borderStyleId)?.name || selectedElement.borderStyleId}
            </div>
          )}
          {selectedElement.fillStyleId && (
            <div style={{
              fontSize: '11px',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span>🎨</span>
              <strong>Relleno:</strong> {styleManager.getFillStyle(selectedElement.fillStyleId)?.name || selectedElement.fillStyleId}
            </div>
          )}
          
          {!selectedElement.textStyleId && !selectedElement.paragraphStyleId && 
           !selectedElement.borderStyleId && !selectedElement.fillStyleId && (
            <div style={{
              fontSize: '11px',
              color: '#9ca3af',
              fontStyle: 'italic',
              textAlign: 'center',
              padding: '8px'
            }}>
              Sin estilos aplicados desde el sidebar
            </div>
          )}
        </div>
      </div>

      {/* Acciones rápidas */}
      <div style={{
        paddingTop: '12px',
        borderTop: '1px solid #e5e7eb'
      }}>
        <h4 style={{
          margin: '0 0 8px 0',
          fontSize: '14px',
          color: '#374151',
          fontWeight: '600'
        }}>
          ⚡ Acciones Rápidas
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button
            onClick={() => {
              onUpdateSelectedElement('x', 0);
              onUpdateSelectedElement('y', 0);
            }}
            style={{
              padding: '6px 10px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              background: 'white',
              fontSize: '11px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseOver={(e) => e.target.style.background = '#f3f4f6'}
            onMouseOut={(e) => e.target.style.background = 'white'}
          >
            📍 Mover a origen (0,0)
          </button>
          
          <button
            onClick={() => {
              const snapSize = 20;
              onUpdateSelectedElement('x', Math.round(selectedElement.x / snapSize) * snapSize);
              onUpdateSelectedElement('y', Math.round(selectedElement.y / snapSize) * snapSize);
            }}
            style={{
              padding: '6px 10px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              background: 'white',
              fontSize: '11px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseOver={(e) => e.target.style.background = '#f3f4f6'}
            onMouseOut={(e) => e.target.style.background = 'white'}
          >
            🧲 Ajustar a cuadrícula
          </button>

          <button
            onClick={() => {
              // Limpiar referencias a estilos del sidebar
              onUpdateSelectedElement('textStyleId', null);
              onUpdateSelectedElement('paragraphStyleId', null);
              onUpdateSelectedElement('borderStyleId', null);
              onUpdateSelectedElement('fillStyleId', null);
            }}
            style={{
              padding: '6px 10px',
              border: '1px solid #dc2626',
              borderRadius: '4px',
              background: 'white',
              color: '#dc2626',
              fontSize: '11px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseOver={(e) => e.target.style.background = '#fef2f2'}
            onMouseOut={(e) => e.target.style.background = 'white'}
          >
            🗑️ Quitar estilos aplicados
          </button>
        </div>
      </div>

      {/* Información sobre variables */}
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
          marginBottom: '6px'
        }}>
          💡 Configuración de Estilos
        </div>
        <ul style={{
          fontSize: '11px',
          color: '#15803d',
          margin: 0,
          paddingLeft: '16px',
          lineHeight: '1.4'
        }}>
          <li>Los <strong>estilos aplicados</strong> se cargan automáticamente al seleccionarlos</li>
          <li>Usa las pestañas <strong>Text Style</strong>, <strong>Paragraph</strong>, etc. para crear nuevos estilos</li>
          <li>Los cambios manuales sobrescriben temporalmente los estilos aplicados</li>
          <li>Usa <strong>Ctrl+Espacio</strong> en texto para insertar variables</li>
          <li>Los estilos creados se guardan automáticamente en el sidebar izquierdo</li>
        </ul>
      </div>
    </div>
  );
};

export default BasicProperties;