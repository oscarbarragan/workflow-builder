// src/components/workflow/nodes/HttpInput/HttpInput.jsx - SIMPLIFICADO
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Globe, Settings, Database } from 'lucide-react';
import Button from '../../../common/Button/Button';
import { BasicTab, HeadersTab, BodyTab } from './HttpInputTabs';
import { validateHttpInputConfig } from '../../../../utils/httpInputHelpers';

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
    
    // Headers
    headers: initialData.headers || [],
    
    // Body
    bodyVariable: initialData.bodyVariable || 'requestBody',
    enableBodyCapture: initialData.enableBodyCapture !== undefined ? initialData.enableBodyCapture : true,
    bodyValidation: initialData.bodyValidation || 'none',
    contentType: initialData.contentType || 'application/json',
    
    // NEW: Form fields for different content types
    formFields: initialData.formFields || [],
    
    // NEW: Validation configuration
    validationConfig: initialData.validationConfig || {},
    
    ...initialData
  });
  
  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [pathValidation, setPathValidation] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');

  // Disable ReactFlow when modal is open
  useEffect(() => {
    if (isOpen) {
      console.log('🌐 HTTP Input opened - disabling ReactFlow');
      
      const reactFlowWrapper = document.querySelector('.react-flow');
      if (reactFlowWrapper) {
        reactFlowWrapper.style.pointerEvents = 'none';
        reactFlowWrapper.style.userSelect = 'none';
      }
      
      document.body.style.overflow = 'hidden';
      
      return () => {
        if (reactFlowWrapper) {
          reactFlowWrapper.style.pointerEvents = 'auto';
          reactFlowWrapper.style.userSelect = 'auto';
        }
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }

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
    const validation = validateHttpInputConfig(formData);
    setErrors(validation.errors.reduce((acc, error, index) => {
      acc[`error_${index}`] = error;
      return acc;
    }, {}));
    
    return validation.isValid;
  };

  const handleSave = () => {
    if (validateForm() && pathValidation?.isValid !== false) {
      const baseUrl = 'http://localhost:3000/api';
      const fullEndpoint = `${baseUrl}${formData.path}`;
      
      const savedData = {
        ...formData,
        endpoint: fullEndpoint,
        status: 'configured',
        createdAt: new Date().toISOString(),
        
        // Generate output structure for Data Mapper connection
        outputStructure: generateOutputStructure(formData)
      };
      
      onSave(savedData);
      onClose();
    }
  };

  const generateOutputStructure = (data) => {
    const structure = {};
    
    // Headers variables
    data.headers.forEach(header => {
      if (header.variable) {
        structure[`headers.${header.variable}`] = {
          type: 'string',
          source: 'header',
          headerName: header.name,
          required: header.required,
          defaultValue: header.defaultValue,
          description: header.description
        };
      }
    });
    
    // Body variable
    if (data.enableBodyCapture && data.bodyVariable) {
      structure[data.bodyVariable] = {
        type: 'object',
        source: 'body',
        contentType: data.contentType,
        validation: data.bodyValidation,
        description: 'Request body content',
        fields: data.formFields || []
      };
    }
    
    return structure;
  };

  const handleClose = () => {
    setFormData({
      path: '',
      method: 'GET',
      description: '',
      enableCors: true,
      authentication: 'none',
      headers: [],
      bodyVariable: 'requestBody',
      enableBodyCapture: true,
      bodyValidation: 'none',
      contentType: 'application/json',
      formFields: [],
      validationConfig: {}
    });
    setErrors({});
    setPathValidation(null);
    setActiveTab('basic');
    onClose();
  };

  if (!isOpen) return null;

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999999,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
  };

  const modalContentStyle = {
    background: 'white',
    borderRadius: '12px',
    width: '95vw',
    height: '90vh',
    maxWidth: '1400px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    padding: '24px',
    position: 'relative'
  };

  const modalContent = (
    <div 
      style={modalOverlayStyle}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div 
        style={modalContentStyle}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '16px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '700',
            color: '#1f2937'
          }}>
            🌐 Configurar HTTP Input
          </h2>
          
          {/* Debug info en el header */}
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            fontFamily: 'monospace',
            textAlign: 'center',
            background: '#f3f4f6',
            padding: '6px 12px',
            borderRadius: '6px'
          }}>
            <div><strong>Método:</strong> {formData.method}</div>
            <div><strong>Headers:</strong> {formData.headers.length}</div>
            <div><strong>Body:</strong> {formData.enableBodyCapture ? 'Habilitado' : 'Deshabilitado'}</div>
          </div>
          
          <button 
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              color: '#6b7280',
              fontSize: '24px',
              fontWeight: 'bold'
            }}
          >
            ✕
          </button>
        </div>

        {/* Tabs Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '2px solid #e5e7eb',
          marginBottom: '20px'
        }}>
          {[
            { id: 'basic', label: '⚙️ Básico', icon: <Settings size={14} /> },
            { id: 'headers', label: '📋 Headers', icon: <Settings size={14} /> },
            { id: 'body', label: '📦 Body', icon: <Database size={14} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                border: 'none',
                background: activeTab === tab.id ? '#3b82f6' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#6b7280',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: '6px 6px 0 0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          {activeTab === 'basic' && (
            <BasicTab
              formData={formData}
              errors={errors}
              isValidating={isValidating}
              pathValidation={pathValidation}
              onInputChange={handleInputChange}
            />
          )}
          
          {activeTab === 'headers' && (
            <HeadersTab
              formData={formData}
              errors={errors}
              onInputChange={handleInputChange}
            />
          )}
          
          {activeTab === 'body' && (
            <BodyTab
              formData={formData}
              errors={errors}
              onInputChange={handleInputChange}
            />
          )}
        </div>

        {/* Generated Endpoint Preview */}
        {formData.path && pathValidation?.isValid && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '16px',
            marginTop: '16px'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#15803d',
              fontWeight: '600',
              marginBottom: '8px'
            }}>
              🚀 Endpoint Generado
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              fontSize: '12px'
            }}>
              <div>
                <strong>URL:</strong>
                <div style={{
                  fontFamily: 'monospace',
                  background: 'white',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  border: '1px solid #bbf7d0',
                  marginTop: '2px',
                  wordBreak: 'break-all'
                }}>
                  {formData.method} http://localhost:3000/api{formData.path}
                </div>
              </div>
              
              <div>
                <strong>Variables de Salida:</strong>
                <div style={{
                  fontFamily: 'monospace',
                  background: 'white',
                  padding: '6px 8px',
                  borderRadius: '4px',
                  border: '1px solid #bbf7d0',
                  marginTop: '2px',
                  fontSize: '11px'
                }}>
                  {formData.headers.length > 0 && (
                    <div>Headers: {formData.headers.filter(h => h.variable).map(h => h.variable).join(', ')}</div>
                  )}
                  {formData.enableBodyCapture && (
                    <div>Body: {formData.bodyVariable}</div>
                  )}
                  {formData.headers.length === 0 && !formData.enableBodyCapture && (
                    <div style={{ color: '#6b7280', fontStyle: 'italic' }}>No hay variables configuradas</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '20px',
          borderTop: '1px solid #e5e7eb',
          marginTop: '20px'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#6b7280'
          }}>
            💡 <strong>Tip:</strong> Las variables configuradas estarán disponibles para conectar con Data Mapper
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              variant="secondary"
              onClick={handleClose}
              size="large"
            >
              Cancelar
            </Button>
            
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isValidating || (pathValidation && !pathValidation.isValid)}
              size="large"
            >
              💾 Guardar Configuración
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
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default HttpInput;