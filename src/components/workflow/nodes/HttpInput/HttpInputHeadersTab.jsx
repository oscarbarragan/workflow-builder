// src/components/workflow/nodes/HttpInput/HttpInputHeadersTab.jsx
import React from 'react';
import { Plus, Trash2, Settings } from 'lucide-react';
import Button from '../../../common/Button/Button';

const HttpInputHeadersTab = ({ formData, errors, onInputChange }) => {
  const addHeader = () => {
    const newHeader = {
      id: Date.now(),
      name: '',
      variable: '',
      required: false,
      defaultValue: '',
      description: ''
    };
    
    const newHeaders = [...formData.headers, newHeader];
    onInputChange('headers', newHeaders);
  };

  const updateHeader = (headerId, field, value) => {
    const newHeaders = formData.headers.map(header =>
      header.id === headerId ? { ...header, [field]: value } : header
    );
    onInputChange('headers', newHeaders);
  };

  const removeHeader = (headerId) => {
    const newHeaders = formData.headers.filter(header => header.id !== headerId);
    onInputChange('headers', newHeaders);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1, overflow: 'auto' }}>
      {/* Headers Info */}
      <div style={{
        background: '#f0f9ff',
        padding: '12px 16px',
        borderRadius: '8px',
        border: '1px solid #bae6fd'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '4px'
        }}>
          <Settings size={16} color="#0284c7" />
          <span style={{ fontWeight: '600', color: '#0c4a6e', fontSize: '14px' }}>
            Configuración de Headers
          </span>
        </div>
        <div style={{ fontSize: '12px', color: '#0369a1' }}>
          Define headers que el endpoint puede recibir y almacenar en variables
        </div>
      </div>

      {/* Headers List */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
            Headers ({formData.headers.length})
          </h4>
          <Button
            size="small"
            variant="primary"
            icon={<Plus size={14} />}
            onClick={addHeader}
          >
            Agregar Header
          </Button>
        </div>

        {formData.headers.length === 0 ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: '#6b7280',
            border: '2px dashed #e5e7eb',
            borderRadius: '8px'
          }}>
            <Settings size={32} style={{ margin: '0 auto 12px', display: 'block' }} />
            <div style={{ fontSize: '14px', marginBottom: '4px' }}>No hay headers configurados</div>
            <div style={{ fontSize: '12px' }}>
              Los headers permiten recibir datos adicionales en las peticiones
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {formData.headers.map((header, index) => (
              <div
                key={header.id}
                style={{
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '16px'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '12px'
                }}>
                  <h5 style={{
                    margin: 0,
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    Header #{index + 1}
                  </h5>
                  <button
                    onClick={() => removeHeader(header.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px',
                      color: '#dc2626'
                    }}
                    title="Eliminar header"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      marginBottom: '4px',
                      color: '#374151'
                    }}>
                      Nombre del Header
                    </label>
                    <input
                      type="text"
                      value={header.name}
                      onChange={(e) => updateHeader(header.id, 'name', e.target.value)}
                      placeholder="Authorization, X-API-Key, etc."
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: `1px solid ${errors[`header_${index}_name`] ? '#dc2626' : '#d1d5db'}`,
                        borderRadius: '4px',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      marginBottom: '4px',
                      color: '#374151'
                    }}>
                      Variable de Almacenamiento
                    </label>
                    <input
                      type="text"
                      value={header.variable}
                      onChange={(e) => updateHeader(header.id, 'variable', e.target.value)}
                      placeholder="apiKey, authToken, etc."
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: `1px solid ${errors[`header_${index}_variable`] ? '#dc2626' : '#d1d5db'}`,
                        borderRadius: '4px',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '500',
                    marginBottom: '4px',
                    color: '#374151'
                  }}>
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={header.description}
                    onChange={(e) => updateHeader(header.id, 'description', e.target.value)}
                    placeholder="Descripción del header y su propósito"
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '12px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="checkbox"
                      id={`required_${header.id}`}
                      checked={header.required}
                      onChange={(e) => updateHeader(header.id, 'required', e.target.checked)}
                      style={{
                        width: '14px',
                        height: '14px',
                        cursor: 'pointer'
                      }}
                    />
                    <label htmlFor={`required_${header.id}`} style={{
                      fontSize: '12px',
                      color: '#374151',
                      cursor: 'pointer'
                    }}>
                      Requerido
                    </label>
                  </div>

                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '500',
                      marginBottom: '4px',
                      color: '#374151'
                    }}>
                      Valor por Defecto
                    </label>
                    <input
                      type="text"
                      value={header.defaultValue}
                      onChange={(e) => updateHeader(header.id, 'defaultValue', e.target.value)}
                      placeholder="Valor opcional por defecto"
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HttpInputHeadersTab;