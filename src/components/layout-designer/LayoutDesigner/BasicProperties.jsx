// src/components/layout-designer/LayoutDesigner/BasicProperties.jsx
import React from 'react';
import { ELEMENT_TYPES } from '../../../utils/constants';
import { styleManager } from '../../../utils/StyleManager';

const BasicProperties = ({ 
  selectedElement, 
  onUpdateSelectedElement, 
  availableData = {} 
}) => {
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

    const variableOptions = Object.entries(availableData).map(([key, varData]) => {
      let displayLabel;
      if (typeof varData === 'object' && varData !== null && varData.displayValue !== undefined) {
        displayLabel = `${key} (${varData.type || 'unknown'}) - ${String(varData.displayValue || '')}`;
      } else {
        const value = typeof varData === 'string' ? varData : String(varData || '');
        displayLabel = `${key} - ${value.length > 30 ? value.substring(0, 30) + '...' : value}`;
      }
      
      return {
        value: key,
        label: displayLabel
      };
    });

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
            {renderFormField('Variable', 'variable', 'select', {
              placeholder: 'Selecciona una variable del workflow',
              options: variableOptions
            })}
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

      {/* ✅ Aplicar estilos existentes para elementos de texto */}
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
    </div>
  );
};

export default BasicProperties;