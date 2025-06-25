// src/components/workflow/nodes/HttpInput/HttpInputBasicTab.jsx
import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';

const HttpInputBasicTab = ({ 
  formData, 
  errors, 
  isValidating, 
  pathValidation, 
  onInputChange 
}) => {
  const methods = [
    { value: 'GET', label: 'GET', color: '#16a34a' },
    { value: 'POST', label: 'POST', color: '#3b82f6' },
    { value: 'PUT', label: 'PUT', color: '#f59e0b' },
    { value: 'DELETE', label: 'DELETE', color: '#dc2626' },
    { value: 'PATCH', label: 'PATCH', color: '#7c3aed' }
  ];

  const authOptions = [
    { value: 'none', label: 'Sin autenticación' },
    { value: 'basic', label: 'Basic Auth' },
    { value: 'bearer', label: 'Bearer Token' },
    { value: 'apikey', label: 'API Key' }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', flex: 1, overflow: 'auto' }}>
      {/* Path Configuration */}
      <div>
        <label style={{
          display: 'block',
          marginBottom: '6px',
          fontWeight: '500',
          color: '#374151',
          fontSize: '14px'
        }}>
          Path del Endpoint *
        </label>
        
        <div style={{ position: 'relative' }}>
          <div style={{
            display: 'flex',
            border: `1px solid ${errors.path ? '#dc2626' : '#d1d5db'}`,
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#f3f4f6',
              padding: '8px 10px',
              borderRight: '1px solid #d1d5db',
              fontSize: '13px',
              color: '#6b7280',
              fontFamily: 'monospace',
              whiteSpace: 'nowrap'
            }}>
              /api
            </div>
            <input
              type="text"
              value={formData.path}
              onChange={(e) => onInputChange('path', e.target.value)}
              placeholder="/mi-endpoint"
              style={{
                flex: 1,
                padding: '8px 10px',
                border: 'none',
                fontSize: '13px',
                fontFamily: 'monospace',
                outline: 'none'
              }}
            />
          </div>
          
          {isValidating && (
            <div style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid #e5e7eb',
                borderTop: '2px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            </div>
          )}
          
          {pathValidation && !isValidating && (
            <div style={{
              position: 'absolute',
              right: '8px',
              top: '50%',
              transform: 'translateY(-50%)'
            }}>
              {pathValidation.isValid ? (
                <CheckCircle size={16} color="#16a34a" />
              ) : (
                <AlertCircle size={16} color="#dc2626" />
              )}
            </div>
          )}
        </div>
        
        {errors.path && (
          <div style={{ color: '#dc2626', fontSize: '12px', marginTop: '4px' }}>
            {errors.path}
          </div>
        )}
        
        {pathValidation && (
          <div style={{
            color: pathValidation.isValid ? '#16a34a' : '#dc2626',
            fontSize: '12px',
            marginTop: '4px'
          }}>
            {pathValidation.message}
          </div>
        )}
      </div>

      {/* HTTP Method */}
      <div>
        <label style={{
          display: 'block',
          marginBottom: '6px',
          fontWeight: '500',
          color: '#374151',
          fontSize: '14px'
        }}>
          Método HTTP *
        </label>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(85px, 1fr))',
          gap: '8px'
        }}>
          {methods.map(method => (
            <button
              key={method.value}
              type="button"
              onClick={() => onInputChange('method', method.value)}
              style={{
                padding: '8px 10px',
                border: `2px solid ${formData.method === method.value ? method.color : '#e5e7eb'}`,
                borderRadius: '6px',
                background: formData.method === method.value ? method.color : 'white',
                color: formData.method === method.value ? 'white' : method.color,
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {method.label}
            </button>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label style={{
          display: 'block',
          marginBottom: '6px',
          fontWeight: '500',
          color: '#374151',
          fontSize: '14px'
        }}>
          Descripción
        </label>
        
        <textarea
          value={formData.description}
          onChange={(e) => onInputChange('description', e.target.value)}
          placeholder="Describe el propósito de este endpoint..."
          rows={3}
          style={{
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '13px',
            resize: 'vertical',
            fontFamily: 'inherit',
            minHeight: '100px',
            boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Authentication */}
      <div>
        <label style={{
          display: 'block',
          marginBottom: '6px',
          fontWeight: '500',
          color: '#374151',
          fontSize: '14px'
        }}>
          Autenticación
        </label>
        
        <select
          value={formData.authentication}
          onChange={(e) => onInputChange('authentication', e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '13px',
            background: 'white',
            boxSizing: 'border-box'
          }}
        >
          {authOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* CORS */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <input
          type="checkbox"
          id="enableCors"
          checked={formData.enableCors}
          onChange={(e) => onInputChange('enableCors', e.target.checked)}
          style={{
            width: '16px',
            height: '16px',
            cursor: 'pointer'
          }}
        />
        <label htmlFor="enableCors" style={{
          fontSize: '14px',
          color: '#374151',
          cursor: 'pointer'
        }}>
          Habilitar CORS
        </label>
      </div>
    </div>
  );
};

export default HttpInputBasicTab;