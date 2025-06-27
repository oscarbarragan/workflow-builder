// src/components/layout-designer/LayoutDesigner/AdvancedProperties.jsx
import React from 'react';
import { ELEMENT_TYPES } from '../../../utils/constants';

const AdvancedProperties = ({ 
  selectedElement, 
  onUpdateSelectedElement 
}) => {
  return (
    <div>
      <div style={{
        background: '#fef3c7',
        padding: '8px 12px',
        borderRadius: '6px',
        marginBottom: '16px',
        border: '1px solid #fbbf24'
      }}>
        <div style={{
          fontSize: '12px',
          color: '#92400e',
          fontWeight: '600',
          marginBottom: '4px'
        }}>
          🔧 Propiedades Avanzadas
        </div>
        <div style={{
          fontSize: '11px',
          color: '#92400e'
        }}>
          Configuraciones adicionales y metadatos del elemento
        </div>
      </div>

      {/* Z-Index */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          marginBottom: '6px',
          color: '#374151'
        }}>
          Z-Index (Orden)
        </label>
        <input
          type="number"
          value={selectedElement.zIndex || 100}
          onChange={(e) => onUpdateSelectedElement('zIndex', parseInt(e.target.value) || 100)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
          min="0"
          max="9999"
          step="1"
        />
      </div>

      {/* Padding */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          marginBottom: '6px',
          color: '#374151'
        }}>
          Padding
        </label>
        <input
          type="text"
          value={selectedElement.padding || '8px 12px'}
          onChange={(e) => onUpdateSelectedElement('padding', e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
          placeholder="8px 12px"
        />
      </div>

      {/* Element ID */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '500',
          marginBottom: '6px',
          color: '#374151'
        }}>
          ID del Elemento
        </label>
        <input
          type="text"
          value={selectedElement.id}
          readOnly
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '12px',
            background: '#f9fafb',
            color: '#6b7280',
            fontFamily: 'monospace'
          }}
        />
      </div>

      {/* Styles Applied */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{
          margin: '0 0 8px 0',
          fontSize: '14px',
          color: '#374151',
          fontWeight: '600'
        }}>
          🎨 Estilos Aplicados
        </h4>
        
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          padding: '8px'
        }}>
          {selectedElement.textStyleId && (
            <div style={{
              fontSize: '11px',
              color: '#16a34a',
              marginBottom: '4px'
            }}>
              <strong>Texto:</strong> {selectedElement.textStyleId}
            </div>
          )}
          {selectedElement.paragraphStyleId && (
            <div style={{
              fontSize: '11px',
              color: '#16a34a',
              marginBottom: '4px'
            }}>
              <strong>Párrafo:</strong> {selectedElement.paragraphStyleId}
            </div>
          )}
          {selectedElement.borderStyleId && (
            <div style={{
              fontSize: '11px',
              color: '#16a34a',
              marginBottom: '4px'
            }}>
              <strong>Borde:</strong> {selectedElement.borderStyleId}
            </div>
          )}
          {selectedElement.fillStyleId && (
            <div style={{
              fontSize: '11px',
              color: '#16a34a'
            }}>
              <strong>Relleno:</strong> {selectedElement.fillStyleId}
            </div>
          )}
          
          {!selectedElement.textStyleId && !selectedElement.paragraphStyleId && 
           !selectedElement.borderStyleId && !selectedElement.fillStyleId && (
            <div style={{
              fontSize: '11px',
              color: '#9ca3af',
              fontStyle: 'italic'
            }}>
              Sin estilos aplicados desde el sidebar
            </div>
          )}
        </div>
      </div>

      {/* Reset Actions */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{
          margin: '0 0 8px 0',
          fontSize: '14px',
          color: '#374151',
          fontWeight: '600'
        }}>
          🔄 Restablecer
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {selectedElement.type === ELEMENT_TYPES.TEXT && (
            <button
              onClick={() => {
                onUpdateSelectedElement('textStyle', {
                  fontFamily: 'Arial, sans-serif',
                  fontSize: 14,
                  bold: false,
                  italic: false,
                  underline: false,
                  strikethrough: false,
                  color: '#000000'
                });
                onUpdateSelectedElement('paragraphStyle', {
                  alignment: 'left',
                  verticalAlign: 'flex-start',
                  lineHeight: 1.4,
                  letterSpacing: 0,
                  indent: 0,
                  spaceBefore: 0,
                  spaceAfter: 0,
                  wordWrap: true,
                  wordBreak: 'normal'
                });
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
              🎨 Restablecer estilos de texto
            </button>
          )}
          
          <button
            onClick={() => {
              // Limpiar referencias a estilos del sidebar
              onUpdateSelectedElement('textStyleId', null);
              onUpdateSelectedElement('paragraphStyleId', null);
              onUpdateSelectedElement('borderStyleId', null);
              onUpdateSelectedElement('fillStyleId', null);
            }}
            style={{
              padding: '8px 12px',
              border: '1px solid #dc2626',
              borderRadius: '6px',
              background: 'white',
              color: '#dc2626',
              fontSize: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#fef2f2'}
            onMouseOut={(e) => e.target.style.background = 'white'}
          >
            🗑️ Quitar todos los estilos del sidebar
          </button>
        </div>
      </div>

      {/* Element Stats */}
      <div style={{ marginBottom: '16px' }}>
        <h4 style={{
          margin: '0 0 8px 0',
          fontSize: '14px',
          color: '#374151',
          fontWeight: '600'
        }}>
          📊 Estadísticas
        </h4>
        
        <div style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '6px',
          padding: '8px'
        }}>
          <div style={{
            fontSize: '11px',
            color: '#64748b',
            marginBottom: '4px'
          }}>
            <strong>Posición:</strong> ({selectedElement.x}, {selectedElement.y})
          </div>
          <div style={{
            fontSize: '11px',
            color: '#64748b',
            marginBottom: '4px'
          }}>
            <strong>Dimensiones:</strong> {selectedElement.width || 'auto'} × {selectedElement.height || 'auto'}
          </div>
          <div style={{
            fontSize: '11px',
            color: '#64748b',
            marginBottom: '4px'
          }}>
            <strong>Tipo:</strong> {selectedElement.type}
          </div>
          {selectedElement.text && (
            <div style={{
              fontSize: '11px',
              color: '#64748b'
            }}>
              <strong>Caracteres:</strong> {selectedElement.text.length}
            </div>
          )}
        </div>
      </div>

      {/* Help Section */}
      <div style={{
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '6px',
        padding: '12px'
      }}>
        <div style={{
          fontSize: '12px',
          color: '#1e40af',
          fontWeight: '600',
          marginBottom: '6px'
        }}>
          💡 Propiedades Avanzadas:
        </div>
        <ul style={{
          fontSize: '11px',
          color: '#1e40af',
          margin: 0,
          paddingLeft: '16px'
        }}>
          <li><strong>Z-Index</strong> controla el orden de apilamiento</li>
          <li><strong>Padding</strong> usa formato CSS (ej: "8px 12px")</li>
          <li><strong>ID</strong> es único e inmutable</li>
          <li><strong>Estilos aplicados</strong> vienen del sidebar izquierdo</li>
          <li><strong>Reset</strong> limpia configuraciones específicas</li>
        </ul>
      </div>
    </div>
  );
};

export default AdvancedProperties;