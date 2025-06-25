// src/components/workflow/nodes/HttpInput/HttpInputBodyTab.jsx - SIMPLIFICADO
import React from 'react';
import { Database } from 'lucide-react';

const HttpInputBodyTab = ({ formData, errors, onInputChange }) => {
  const contentTypes = [
    { value: 'application/json', label: 'JSON', icon: '📄' },
    { value: 'application/xml', label: 'XML', icon: '🏷️' },
    { value: 'text/plain', label: 'Text', icon: '📝' },
    { value: 'application/x-www-form-urlencoded', label: 'Form Data', icon: '📋' },
    { value: 'multipart/form-data', label: 'Multipart', icon: '📎' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflow: 'auto' }}>
      {/* Body Info */}
      <div style={{
        background: '#f0fdf4',
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid #bbf7d0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '4px'
        }}>
          <Database size={16} color="#15803d" />
          <span style={{ fontWeight: '600', color: '#166534', fontSize: '14px' }}>
            Configuración del Body
          </span>
        </div>
        <div style={{ fontSize: '12px', color: '#15803d' }}>
          Configura cómo capturar el body de las peticiones. La validación y mapeo se realizará en el Data Mapper.
        </div>
      </div>

      {/* Enable Body Capture */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px',
        background: '#f8fafc',
        borderRadius: '6px',
        border: '1px solid #e2e8f0'
      }}>
        <input
          type="checkbox"
          id="enableBodyCapture"
          checked={formData.enableBodyCapture}
          onChange={(e) => onInputChange('enableBodyCapture', e.target.checked)}
          style={{
            width: '16px',
            height: '16px',
            cursor: 'pointer'
          }}
        />
        <label htmlFor="enableBodyCapture" style={{
          fontSize: '14px',
          fontWeight: '500',
          color: '#374151',
          cursor: 'pointer'
        }}>
          Habilitar captura del body
        </label>
      </div>

      {formData.enableBodyCapture && (
        <>
          {/* Body Variable Name */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '500',
              color: '#374151',
              fontSize: '14px'
            }}>
              Nombre de Variable para el Body *
            </label>
            <input
              type="text"
              value={formData.bodyVariable}
              onChange={(e) => onInputChange('bodyVariable', e.target.value)}
              placeholder="requestBody, payload, data, etc."
              style={{
                width: '100%',
                padding: '8px 12px',
                border: `1px solid ${errors.bodyVariable ? '#dc2626' : '#d1d5db'}`,
                borderRadius: '6px',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
            />
            {errors.bodyVariable && (
              <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
                {errors.bodyVariable}
              </div>
            )}
            <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              Esta variable estará disponible para conectar con Data Mapper
            </div>
          </div>

          {/* Content Type */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500',
              color: '#374151',
              fontSize: '14px'
            }}>
              Tipo de Contenido Esperado
            </label>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '8px'
            }}>
              {contentTypes.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => onInputChange('contentType', type.value)}
                  style={{
                    padding: '12px',
                    border: `2px solid ${formData.contentType === type.value ? '#3b82f6' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    background: formData.contentType === type.value ? '#eff6ff' : 'white',
                    color: formData.contentType === type.value ? '#1e40af' : '#374151',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: '500',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontSize: '16px', marginBottom: '4px' }}>{type.icon}</div>
                  <div>{type.label}</div>
                </button>
              ))}
            </div>
            
            <div style={{
              fontSize: '12px',
              color: '#6b7280',
              marginTop: '8px',
              padding: '8px 12px',
              background: '#f9fafb',
              borderRadius: '4px',
              border: '1px solid #e5e7eb'
            }}>
              💡 <strong>Tip:</strong> El HTTP Input solo captura el body en la variable especificada. 
              Usa Data Mapper para validar el esquema y mapear campos específicos.
            </div>
          </div>

          {/* Preview Structure */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '12px'
          }}>
            <h5 style={{
              margin: '0 0 8px 0',
              fontSize: '13px',
              fontWeight: '600',
              color: '#374151'
            }}>
              👁️ Variables que se generarán
            </h5>
            
            <div style={{
              fontSize: '11px',
              fontFamily: 'monospace',
              background: '#1f2937',
              color: '#e5e7eb',
              padding: '8px',
              borderRadius: '4px',
              whiteSpace: 'pre-wrap'
            }}>
              {JSON.stringify({
                // Headers variables
                ...formData.headers.reduce((acc, header) => {
                  if (header.variable) {
                    acc[`headers.${header.variable}`] = `[Header: ${header.name}]`;
                  }
                  return acc;
                }, {}),
                // Body variable
                [formData.bodyVariable]: `[Body: ${formData.contentType}]`
              }, null, 2)}
            </div>
          </div>
        </>
      )}

      {/* Data Mapper Integration Guide */}
      <div style={{
        background: '#fefbf3',
        border: '1px solid #fed7aa',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <h5 style={{
          margin: '0 0 8px 0',
          fontSize: '13px',
          color: '#c2410c',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          🔄 Integración con Data Mapper
        </h5>
        
        <div style={{ fontSize: '12px', color: '#c2410c', lineHeight: '1.5' }}>
          <div style={{ marginBottom: '8px' }}>
            <strong>1. HTTP Input:</strong> Captura headers y body como variables
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong>2. Data Mapper:</strong> Define el esquema JSON y mapea campos específicos
          </div>
          <div>
            <strong>3. Validación:</strong> Se realiza en Data Mapper, no en HTTP Input
          </div>
        </div>
      </div>
    </div>
  );
};

export default HttpInputBodyTab;