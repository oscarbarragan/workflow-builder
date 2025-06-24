// src/components/workflow/nodes/HttpInput/HttpInput.jsx - FIXED
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
      style={{ maxWidth: '580px', width: '85vw' }} // FIXED: Narrower and better responsive
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: '18px', // FIXED: Increased gap for better spacing
        fontSize: '14px', // FIXED: Slightly larger base font
        maxWidth: '100%',
        overflow: 'hidden'
      }}>
        
        {/* Header Info */}
        <div style={{
          background: '#eff6ff',
          padding: '12px 16px', // FIXED: More padding for better look
          borderRadius: '8px',
          border: '1px solid #bfdbfe'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px'
          }}>
            <Globe size={16} color="#3b82f6" /> {/* FIXED: Larger icon */}
            <span style={{ 
              fontWeight: '600', 
              color: '#1e40af',
              fontSize: '15px' // FIXED: Better font size
            }}>
              HTTP Endpoint
            </span>
          </div>
          <div style={{ 
            fontSize: '13px', // FIXED: Better readability
            color: '#3730a3' 
          }}>
            Configure un endpoint HTTP que será expuesto por el servidor
          </div>
        </div>

        {/* Path Configuration */}
        <div>
          <label style={{
            display: 'block',
            marginBottom: '6px', // FIXED: Better spacing
            fontWeight: '500',
            color: '#374151',
            fontSize: '14px' // FIXED: Standard label size
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
                padding: '8px 10px', // FIXED: Better padding
                borderRight: '1px solid #d1d5db',
                fontSize: '13px', // FIXED: Readable font size
                color: '#6b7280',
                fontFamily: 'monospace',
                whiteSpace: 'nowrap',
                minWidth: 'fit-content'
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
                  padding: '8px 10px', // FIXED: Better padding
                  border: 'none',
                  fontSize: '13px', // FIXED: Readable font size
                  fontFamily: 'monospace',
                  outline: 'none',
                  minWidth: 0
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
              <div style={{ 
                fontSize: '12px', 
                color: '#15803d', 
                marginBottom: '4px' 
              }}>
                <strong>Endpoint generado:</strong>
              </div>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '12px', // FIXED: Better font size for URLs
                color: '#166534',
                background: 'white',
                padding: '6px 8px', // FIXED: Better padding
                borderRadius: '4px', // FIXED: Standard border radius
                border: '1px solid #bbf7d0',
                wordBreak: 'break-all',
                lineHeight: '1.3' // FIXED: Better line height
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(85px, 1fr))', // FIXED: Slightly smaller minimum
            gap: '8px',
            maxWidth: '100%' // FIXED: Ensure buttons don't overflow
          }}>
            {methods.map(method => (
              <button
                key={method.value}
                type="button"
                onClick={() => handleInputChange('method', method.value)}
                style={{
                  padding: '8px 10px', // FIXED: Slightly reduced padding
                  border: `2px solid ${formData.method === method.value ? method.color : '#e5e7eb'}`,
                  borderRadius: '6px',
                  background: formData.method === method.value ? method.color : 'white',
                  color: formData.method === method.value ? 'white' : method.color,
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  minWidth: '65px', // FIXED: Slightly smaller minimum width
                  textAlign: 'center' // FIXED: Center text in buttons
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
              padding: '10px 12px', // FIXED: Better padding for textarea visibility
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '13px',
              resize: 'vertical',
              fontFamily: 'inherit',
              minHeight: '100px', // FIXED: Increased minimum height
              boxSizing: 'border-box' // FIXED: Ensure proper sizing
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
              padding: '6px 8px', // FIXED: Reduced padding
              border: '1px solid #d1d5db',
              borderRadius: '4px', // FIXED: Smaller border radius
              fontSize: '11px', // FIXED: Much smaller font
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
              fontSize: '14px', // FIXED: Standard font size
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
          borderTop: '1px solid #e5e7eb',
          marginTop: '8px' // FIXED: Add some margin to ensure visibility
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