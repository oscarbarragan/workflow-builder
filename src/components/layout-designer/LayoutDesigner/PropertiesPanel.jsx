import React from 'react';
import { ELEMENT_TYPES } from '../../../utils/constants';

const PropertiesPanel = ({ 
  selectedElement, 
  onUpdateSelectedElement, 
  availableData = {} 
}) => {
  const panelStyle = {
    flex: '0 0 280px',
    width: '280px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '16px',
    overflowY: 'auto',
    maxHeight: '100%'
  };

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
            value={selectedElement[field] || ''}
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
        ) : (
          <input
            type={type}
            value={selectedElement[field] || (type === 'number' ? 0 : '')}
            onChange={(e) => {
              const value = type === 'number' 
                ? parseInt(e.target.value) || 0 
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

  const renderElementProperties = () => {
    if (!selectedElement) return null;

    switch (selectedElement.type) {
      case ELEMENT_TYPES.TEXT:
        return (
          <>
            {renderFormField('Texto', 'text', 'textarea', {
              placeholder: 'Ingresa el texto a mostrar'
            })}
            {renderFormField('Tamaño de Fuente', 'fontSize', 'number', {
              min: 8,
              max: 72,
              step: 1
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
              options: Object.keys(availableData).map(key => ({
                value: key,
                label: `${key} (${availableData[key]})`
              }))
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
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div style={panelStyle}>
      <h3 style={{
        margin: '0 0 16px 0',
        fontSize: '16px',
        color: '#374151',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '8px'
      }}>
        Propiedades
      </h3>
      
      {selectedElement ? (
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

          {/* Actions */}
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
      ) : (
        <div style={{
          textAlign: 'center',
          color: '#6b7280',
          padding: '40px 20px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎯</div>
          <div style={{ fontSize: '16px', marginBottom: '6px', fontWeight: '500' }}>
            Ningún elemento seleccionado
          </div>
          <div style={{ fontSize: '14px' }}>
            Haz clic en un elemento para editarlo
          </div>
        </div>
      )}

      {/* Available Variables - MEJORADO */}
      {availableData && Object.keys(availableData).length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            color: '#374151',
            fontWeight: '600'
          }}>
            🔗 Variables del Workflow
          </h4>
          
          <div style={{
            maxHeight: '200px',
            overflowY: 'auto',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            background: 'white'
          }}>
            {Object.entries(availableData).map(([key, value]) => (
              <div
                key={key}
                style={{
                  fontSize: '12px',
                  padding: '8px 12px',
                  borderBottom: '1px solid #f3f4f6',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onClick={() => {
                  if (selectedElement?.type === ELEMENT_TYPES.VARIABLE) {
                    onUpdateSelectedElement('variable', key);
                  }
                }}
                onMouseOver={(e) => e.target.style.backgroundColor = '#f8fafc'}
                onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                title={`Click para usar en elemento variable\nValor actual: ${value}`}
              >
                <div style={{
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <span style={{ color: '#3b82f6' }}>🔗</span>
                  {key}
                </div>
                <div style={{
                  color: '#6b7280',
                  wordBreak: 'break-word',
                  fontSize: '11px'
                }}>
                  {typeof value === 'string' && value.length > 40 
                    ? `${value.substring(0, 40)}...` 
                    : value}
                </div>
              </div>
            ))}
          </div>
          
          <div style={{
            fontSize: '11px',
            color: '#9ca3af',
            marginTop: '8px',
            fontStyle: 'italic',
            textAlign: 'center'
          }}>
            💡 Haz clic en una variable para usarla en elementos de tipo "Variable"
          </div>
        </div>
      )}

      {/* Help */}
      <div style={{
        marginTop: '20px',
        padding: '12px',
        background: '#f0fdf4',
        borderRadius: '6px',
        border: '1px solid #bbf7d0'
      }}>
        <div style={{
          fontSize: '12px',
          color: '#15803d',
          fontWeight: '600',
          marginBottom: '6px'
        }}>
          💡 Consejos:
        </div>
        <ul style={{
          fontSize: '11px',
          color: '#15803d',
          margin: 0,
          paddingLeft: '16px'
        }}>
          <li><strong>Doble clic</strong> en texto para editar inline</li>
          <li><strong>Arrastra</strong> elementos para moverlos</li>
          <li><strong>Redimensiona</strong> rectángulos desde las esquinas</li>
          <li><strong>Variables</strong> se conectan automáticamente al workflow</li>
        </ul>
      </div>
    </div>
  );
};

export default PropertiesPanel;