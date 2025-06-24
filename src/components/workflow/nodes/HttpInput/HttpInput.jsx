// src/components/workflow/nodes/HttpInput/HttpInput.jsx
import React, { useState } from 'react';
import { Globe, Link, CheckCircle, AlertCircle } from 'lucide-react';
import Modal from '../../../common/Modal/Modal';
import Button from '../../../common/Button/Button';

const HttpInput = ({ 
  isOpen, 
  onClose, 
  initialData = {}, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    path: initialData.path || '',
    method: initialData.method || 'GET',
    description: initialData.description || '',
    enableCors: initialData.enableCors !== undefined ? initialData.enableCors : true,
    authentication: initialData.authentication || 'none',
    ...initialData
  });
  
  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [pathValidation, setPathValidation] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }

    // Validate path in real-time
    if (field === 'path') {
      validatePath(value);
    }
  };

  const validatePath = async (path) => {
    if (!path) {
      setPathValidation(null);
      return;
    }

    setIsValidating(true);
    
    // Simulate path validation
    setTimeout(() => {
      const isValid = /^\/[a-zA-Z0-9\-_\/]*$/.test(path) && !path.includes('//');
      setPathValidation({
        isValid,
        message: isValid 
          ? 'Path válido' 
          : 'El path debe comenzar con / y contener solo caracteres válidos'
      });
      setIsValidating(false);
    }, 500);
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.path || formData.path.trim() === '') {
      newErrors.path = 'El path es requerido';
    } else if (!formData.path.startsWith('/')) {
      newErrors.path = 'El path debe comenzar con /';
    }
    
    if (!formData.method) {
      newErrors.method = 'El método HTTP es requerido';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm() && pathValidation?.isValid !== false) {
      // Generate endpoint URL
      const baseUrl = 'http://localhost:3000/api';
      const fullEndpoint = `${baseUrl}${formData.path}`;
      
      const savedData = {
        ...formData,
        endpoint: fullEndpoint,
        status: 'configured',
        createdAt: new Date().toISOString()
      };
      
      onSave(savedData);
      onClose();
    }
  };

  const handleClose = () => {
    setFormData({
      path: '',
      method: 'GET',
      description: '',
      enableCors: true,
      authentication: 'none'
    });
    setErrors({});
    setPathValidation(null);
    onClose();
  };

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
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Configurar HTTP Input"
      size="medium"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Header Info */}
        <div style={{
          background: '#eff6ff',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid #bfdbfe'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px'
          }}>
            <Globe size={16} color="#3b82f6" />
            <span style={{ fontWeight: '600', color: '#1e40af' }}>
              HTTP Endpoint
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#3730a3' }}>
            Configure un endpoint HTTP que será expuesto por el servidor
          </div>
        </div>

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
                padding: '8px 12px',
                borderRight: '1px solid #d1d5db',
                fontSize: '14px',
                color: '#6b7280',
                fontFamily: 'monospace'
              }}>
                /api
              </div>
              <input
                type="text"
                value={formData.path}
                onChange={(e) => handleInputChange('path', e.target.value)}
                placeholder="/mi-endpoint"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: 'none',
                  fontSize: '14px',
                  fontFamily: 'monospace',
                  outline: 'none'
                }}
              />
            </div>
            
            {/* Path validation indicator */}
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
            <div style={{
              color: '#dc2626',
              fontSize: '12px',
              marginTop: '4px'
            }}>
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
          
          {formData.path && pathValidation?.isValid && (
            <div style={{
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '4px',
              padding: '8px 12px',
              marginTop: '8px'
            }}>
              <div style={{ fontSize: '12px', color: '#15803d', marginBottom: '4px' }}>
                <strong>Endpoint generado:</strong>
              </div>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '13px',
                color: '#166534',
                background: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #bbf7d0'
              }}>
                http://localhost:3000/api{formData.path}
              </div>
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))',
            gap: '8px'
          }}>
            {methods.map(method => (
              <button
                key={method.value}
                type="button"
                onClick={() => handleInputChange('method', method.value)}
                style={{
                  padding: '8px 12px',
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
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Describe el propósito de este endpoint..."
            rows={3}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              resize: 'vertical',
              fontFamily: 'inherit'
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
            onChange={(e) => handleInputChange('authentication', e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              background: 'white'
            }}
          >
            {authOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* CORS Configuration */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <input
            type="checkbox"
            id="enableCors"
            checked={formData.enableCors}
            onChange={(e) => handleInputChange('enableCors', e.target.checked)}
            style={{
              width: '16px',
              height: '16px',
              cursor: 'pointer'
            }}
          />
          <label 
            htmlFor="enableCors"
            style={{
              fontSize: '14px',
              color: '#374151',
              cursor: 'pointer'
            }}
          >
            Habilitar CORS
          </label>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          paddingTop: '16px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <Button
            variant="secondary"
            onClick={handleClose}
          >
            Cancelar
          </Button>
          
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isValidating || (pathValidation && !pathValidation.isValid)}
          >
            Guardar Endpoint
          </Button>
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </Modal>
  );
};

export default HttpInput;