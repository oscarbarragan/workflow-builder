// src/components/layoutDesigner/PropertiesPanel/BasicProperties.jsx
import React from 'react';
import { ELEMENT_TYPES } from '../utils/constants';
import { styleManager } from '../utils/StyleManager';
import { variableProcessor } from '../utils/variableProcessor';

const BasicProperties = ({ 
  selectedElement, 
  onUpdateSelectedElement, 
  availableData = {} 
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

  const renderFormField = (label, field, type = 'text', options = {}) => {
    const fieldStyle = {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s'
    };

    const labelStyle = {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '6px',
      color: '#374151'
    };

    return (
      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>
          {label}
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
              minHeight: '80px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
            placeholder={options.placeholder}
          />
        ) : type === 'color' ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="color"
              value={selectedElement[field] || options.default || '#000000'}
              onChange={(e) => onUpdateSelectedElement(field, e.target.value)}
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
            gap: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#374151'
          }}>
            <input
              type="checkbox"
              checked={selectedElement[field] || false}
              onChange={(e) => onUpdateSelectedElement(field, e.target.checked)}
              style={{
                width: '16px',
                height: '16px',
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
        
        {options.unit && type === 'number' && (
          <span style={{ 
            fontSize: '12px', 
            color: '#6b7280', 
            marginTop: '4px', 
            display: 'block' 
          }}>
            Unidad: {options.unit}
          </span>
        )}
      </div>
    );
  };

  const renderElementProperties = () => {
    if (!selectedElement) return null;

    switch (selectedElement.type) {
      case ELEMENT_TYPES.TEXT:
        return (
          <>
            {renderFormField('Texto', 'text', 'textarea', {
              placeholder: 'Ingresa el texto a mostrar'
            })}
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                {renderFormField('Ancho', 'width', 'number', {
                  min: 50,
                  max: 1000,
                  step: 1
                })}
              </div>
              <div style={{ flex: 1 }}>
                {renderFormField('Alto', 'height', 'number', {
                  min: 30,
                  max: 1000,
                  step: 1
                })}
              </div>
            </div>
          </>
        );

      case ELEMENT_TYPES.VARIABLE:
        return (
          <>
            {/* Selector de variables */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '6px',
                color: '#374151'
              }}>
                Variable
              </label>
              
              {processedVariables.length === 0 ? (
                <div style={{
                  padding: '12px',
                  border: '1px dashed #d1d5db',
                  borderRadius: '6px',
                  textAlign: 'center',
                  color: '#6b7280',
                  fontSize: '14px'
                }}>
                  <div style={{ marginBottom: '4px' }}>🔗 No hay variables disponibles</div>
                  <div style={{ fontSize: '12px' }}>
                    Conecta nodos para obtener variables
                  </div>
                </div>
              ) : (
                <select
                  value={selectedElement.variable || ''}
                  onChange={(e) => onUpdateSelectedElement('variable', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px',
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
              
              {/* Vista previa de la variable seleccionada */}
              {selectedElement.variable && (
                <div style={{
                  marginTop: '8px',
                  padding: '8px 12px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '12px'
                }}>
                  <div style={{
                    color: '#374151',
                    fontWeight: '600',
                    marginBottom: '4px',
                    fontFamily: 'monospace'
                  }}>
                    📋 Variable seleccionada:
                  </div>
                  <div style={{
                    color: '#3b82f6',
                    fontFamily: 'monospace',
                    background: 'white',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid #dbeafe'
                  }}>
                    {`{{${selectedElement.variable}}}`}
                  </div>
                  
                  {(() => {
                    const selectedVar = processedVariables.find(v => v.value === selectedElement.variable);
                    if (selectedVar && selectedVar.displayValue) {
                      return (
                        <div style={{
                          marginTop: '6px',
                          color: '#6b7280',
                          fontSize: '11px'
                        }}>
                          <strong>Valor actual:</strong> {selectedVar.displayValue}
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              )}
            </div>

            {renderFormField('Tamaño de Fuente', 'fontSize', 'number', {
              min: 8,
              max: 72,
              step: 1
            })}
          </>
        );

      case ELEMENT_TYPES.RECTANGLE:
        return (
          <>
            {renderFormField('Ancho', 'width', 'number', {
              min: 10,
              max: 1000,
              step: 1
            })}
            {renderFormField('Alto', 'height', 'number', {
              min: 10,
              max: 1000,
              step: 1
            })}
            {renderFormField('Color de Relleno', 'fillColor', 'color', {
              default: 'rgba(156, 163, 175, 0.1)'
            })}
            {renderFormField('Color de Borde', 'borderColor', 'color', {
              default: '#6b7280'
            })}
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                {renderFormField('Grosor', 'borderWidth', 'number', {
                  min: 0,
                  max: 10,
                  step: 1,
                  default: 2
                })}
              </div>
              <div style={{ flex: 1 }}>
                {renderFormField('Radio', 'borderRadius', 'number', {
                  min: 0,
                  max: 50,
                  step: 1,
                  default: 4
                })}
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
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

      {/* Position */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{
          margin: '0 0 8px 0',
          fontSize: '14px',
          color: '#374151',
          fontWeight: '600'
        }}>
          📍 Posición
        </h4>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ flex: 1 }}>
            {renderFormField('X', 'x', 'number', { min: 0 })}
          </div>
          <div style={{ flex: 1 }}>
            {renderFormField('Y', 'y', 'number', { min: 0 })}
          </div>
        </div>
      </div>

      {/* Element-specific properties */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{
          margin: '0 0 8px 0',
          fontSize: '14px',
          color: '#374151',
          fontWeight: '600'
        }}>
          ⚙️ Configuración
        </h4>
        
        {renderElementProperties()}
      </div>

      {/* Aplicar estilos existentes para elementos de texto */}
      {selectedElement.type === ELEMENT_TYPES.TEXT && (
        <div style={{ marginBottom: '16px' }}>
          <h4 style={{
            margin: '0 0 8px 0',
            fontSize: '14px',
            color: '#374151',
            fontWeight: '600'
          }}>
            🎨 Aplicar Estilos Existentes
          </h4>
          
          {/* Estilo de Texto */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              marginBottom: '4px',
              color: '#374151'
            }}>
              Estilo de Texto
            </label>
            <select
              value={selectedElement.textStyleId || ''}
              onChange={(e) => onUpdateSelectedElement('textStyleId', e.target.value || null)}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            >
              <option value="">Sin estilo aplicado</option>
              {styleManager.getAllTextStyles().map(style => (
                <option key={style.id} value={style.id}>
                  {style.name} {style.isCustom ? '(Custom)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Estilo de Párrafo */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              marginBottom: '4px',
              color: '#374151'
            }}>
              Estilo de Párrafo
            </label>
            <select
              value={selectedElement.paragraphStyleId || ''}
              onChange={(e) => onUpdateSelectedElement('paragraphStyleId', e.target.value || null)}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            >
              <option value="">Sin estilo aplicado</option>
              {styleManager.getAllParagraphStyles().map(style => (
                <option key={style.id} value={style.id}>
                  {style.name} {style.isCustom ? '(Custom)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Estilo de Borde */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              marginBottom: '4px',
              color: '#374151'
            }}>
              Estilo de Borde
            </label>
            <select
              value={selectedElement.borderStyleId || ''}
              onChange={(e) => onUpdateSelectedElement('borderStyleId', e.target.value || null)}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            >
              <option value="">Sin estilo aplicado</option>
              {styleManager.getAllBorderStyles().map(style => (
                <option key={style.id} value={style.id}>
                  {style.name} {style.isCustom ? '(Custom)' : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Estilo de Relleno */}
          <div style={{ marginBottom: '12px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              marginBottom: '4px',
              color: '#374151'
            }}>
              Estilo de Relleno
            </label>
            <select
              value={selectedElement.fillStyleId || ''}
              onChange={(e) => onUpdateSelectedElement('fillStyleId', e.target.value || null)}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            >
              <option value="">Sin estilo aplicado</option>
              {styleManager.getAllFillStyles().map(style => (
                <option key={style.id} value={style.id}>
                  {style.name} {style.isCustom ? '(Custom)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Quick Actions */}
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
          ⚡ Acciones rápidas
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => {
              onUpdateSelectedElement('x', 0);
              onUpdateSelectedElement('y', 0);
            }}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: 'white',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
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
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: 'white',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#f3f4f6'}
            onMouseOut={(e) => e.target.style.background = 'white'}
          >
            🧲 Ajustar a cuadrícula
          </button>
        </div>
      </div>

      {/* Información sobre notación de punto */}
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
          💡 Variables con Notación de Punto
        </div>
        <ul style={{
          fontSize: '11px',
          color: '#15803d',
          margin: 0,
          paddingLeft: '16px',
          lineHeight: '1.4'
        }}>
          <li><strong>user.id</strong> en lugar de <s>user_id</s></li>
          <li><strong>data.response.status</strong> para estructuras anidadas</li>
          <li><strong>items[0].name</strong> para arrays de objetos</li>
          <li>Compatible con JSON estándar</li>
          <li>Usa Ctrl+Espacio en edición de texto</li>
        </ul>
      </div>
    </div>
  );
};

export default BasicProperties;