// src/components/workflow/nodes/HttpInput/HttpInputTabs.jsx - TABS SEPARADAS CON MEJORAS
import React from 'react';
import { Globe, CheckCircle, AlertCircle, Plus, Trash2, Settings, Database, Code } from 'lucide-react';
import Button from '../../../common/Button/Button';

// BASIC TAB - Sin cambios mayores
export const BasicTab = ({ 
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

// HEADERS TAB - Sin cambios mayores
export const HeadersTab = ({ formData, errors, onInputChange }) => {
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

// BODY TAB - MEJORADO CON CAMPOS DINÁMICOS Y VALIDACIÓN CONFIGURABLE
export const BodyTab = ({ formData, errors, onInputChange }) => {
  const contentTypes = [
    { value: 'application/json', label: 'JSON', supportsFields: false, icon: '📄' },
    { value: 'application/xml', label: 'XML', supportsFields: false, icon: '🏷️' },
    { value: 'text/plain', label: 'Text', supportsFields: false, icon: '📝' },
    { value: 'application/x-www-form-urlencoded', label: 'Form Data', supportsFields: true, icon: '📋' },
    { value: 'multipart/form-data', label: 'Multipart', supportsFields: true, icon: '📎' }
  ];

  const validationTypes = [
    { value: 'none', label: 'Sin validación' },
    { value: 'json-schema', label: 'JSON Schema' },
    { value: 'required-fields', label: 'Campos requeridos' },
    { value: 'custom', label: 'Validación personalizada' }
  ];

  const fieldTypes = [
    { value: 'text', label: 'Texto' },
    { value: 'email', label: 'Email' },
    { value: 'number', label: 'Número' },
    { value: 'boolean', label: 'Booleano' },
    { value: 'date', label: 'Fecha' },
    { value: 'file', label: 'Archivo' }
  ];

  const addFormField = () => {
    const newField = {
      id: Date.now(),
      name: '',
      type: 'text',
      required: false,
      description: '',
      validation: ''
    };
    
    const newFields = [...(formData.formFields || []), newField];
    onInputChange('formFields', newFields);
  };

  const updateFormField = (fieldId, field, value) => {
    const newFields = (formData.formFields || []).map(formField =>
      formField.id === fieldId ? { ...formField, [field]: value } : formField
    );
    onInputChange('formFields', newFields);
  };

  const removeFormField = (fieldId) => {
    const newFields = (formData.formFields || []).filter(field => field.id !== fieldId);
    onInputChange('formFields', newFields);
  };

  const updateValidationConfig = (field, value) => {
    const newConfig = {
      ...formData.validationConfig,
      [field]: value
    };
    onInputChange('validationConfig', newConfig);
  };

  const selectedContentType = contentTypes.find(ct => ct.value === formData.contentType);

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
          Configura cómo capturar y procesar el body de las peticiones
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
                  {type.supportsFields && (
                    <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '2px' }}>
                      Soporta campos
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields (solo para form-data y multipart) */}
          {selectedContentType?.supportsFields && (
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
                  📋 Campos del Formulario ({(formData.formFields || []).length})
                </h4>
                <Button
                  size="small"
                  variant="primary"
                  icon={<Plus size={14} />}
                  onClick={addFormField}
                >
                  Agregar Campo
                </Button>
              </div>

              {(formData.formFields || []).length === 0 ? (
                <div style={{
                  padding: '20px',
                  textAlign: 'center',
                  color: '#6b7280',
                  border: '2px dashed #e5e7eb',
                  borderRadius: '8px'
                }}>
                  <Code size={24} style={{ margin: '0 auto 8px', display: 'block' }} />
                  <div style={{ fontSize: '12px' }}>
                    Define los campos que esperas recibir en el formulario
                  </div>
                </div>
              ) : (
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '8px',
                  maxHeight: '200px',
                  overflow: 'auto'
                }}>
                  {(formData.formFields || []).map((field, index) => (
                    <div
                      key={field.id}
                      style={{
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '6px',
                        padding: '12px'
                      }}
                    >
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr auto',
                        gap: '8px',
                        alignItems: 'end'
                      }}>
                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '11px',
                            fontWeight: '500',
                            marginBottom: '2px',
                            color: '#374151'
                          }}>
                            Nombre del Campo
                          </label>
                          <input
                            type="text"
                            value={field.name}
                            onChange={(e) => updateFormField(field.id, 'name', e.target.value)}
                            placeholder="nombre, email, edad..."
                            style={{
                              width: '100%',
                              padding: '4px 6px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '11px',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>

                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '11px',
                            fontWeight: '500',
                            marginBottom: '2px',
                            color: '#374151'
                          }}>
                            Tipo
                          </label>
                          <select
                            value={field.type}
                            onChange={(e) => updateFormField(field.id, 'type', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '4px 6px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '11px',
                              background: 'white'
                            }}
                          >
                            {fieldTypes.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          onClick={() => removeFormField(field.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            borderRadius: '4px',
                            color: '#dc2626'
                          }}
                          title="Eliminar campo"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>

                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr auto',
                        gap: '8px',
                        alignItems: 'end',
                        marginTop: '8px'
                      }}>
                        <div>
                          <label style={{
                            display: 'block',
                            fontSize: '11px',
                            fontWeight: '500',
                            marginBottom: '2px',
                            color: '#374151'
                          }}>
                            Descripción
                          </label>
                          <input
                            type="text"
                            value={field.description}
                            onChange={(e) => updateFormField(field.id, 'description', e.target.value)}
                            placeholder="Descripción del campo..."
                            style={{
                              width: '100%',
                              padding: '4px 6px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '11px',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', paddingBottom: '4px' }}>
                          <input
                            type="checkbox"
                            id={`fieldRequired_${field.id}`}
                            checked={field.required}
                            onChange={(e) => updateFormField(field.id, 'required', e.target.checked)}
                            style={{
                              width: '12px',
                              height: '12px',
                              cursor: 'pointer'
                            }}
                          />
                          <label htmlFor={`fieldRequired_${field.id}`} style={{
                            fontSize: '11px',
                            color: '#374151',
                            cursor: 'pointer'
                          }}>
                            Requerido
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Body Validation */}
          <div>
            <label style={{
              display: 'block',
              marginBottom: '6px',
              fontWeight: '500',
              color: '#374151',
              fontSize: '14px'
            }}>
              Validación del Body
            </label>
            <select
              value={formData.bodyValidation}
              onChange={(e) => onInputChange('bodyValidation', e.target.value)}
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
              {validationTypes.map(validation => (
                <option key={validation.value} value={validation.value}>
                  {validation.label}
                </option>
              ))}
            </select>
          </div>

          {/* Validation Configuration */}
          {formData.bodyValidation !== 'none' && (
            <div style={{
              background: '#fef3c7',
              border: '1px solid #fbbf24',
              borderRadius: '6px',
              padding: '12px'
            }}>
              <h5 style={{
                margin: '0 0 8px 0',
                fontSize: '13px',
                color: '#92400e',
                fontWeight: '600'
              }}>
                ⚙️ Configuración de Validación: {validationTypes.find(v => v.value === formData.bodyValidation)?.label}
              </h5>

              {formData.bodyValidation === 'json-schema' && (
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '500',
                    marginBottom: '4px',
                    color: '#92400e'
                  }}>
                    JSON Schema
                  </label>
                  <textarea
                    value={formData.validationConfig.jsonSchema || ''}
                    onChange={(e) => updateValidationConfig('jsonSchema', e.target.value)}
                    placeholder='{"type": "object", "properties": {"name": {"type": "string"}}, "required": ["name"]}'
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #fbbf24',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}

              {formData.bodyValidation === 'required-fields' && (
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '500',
                    marginBottom: '4px',
                    color: '#92400e'
                  }}>
                    Campos Requeridos (separados por coma)
                  </label>
                  <input
                    type="text"
                    value={formData.validationConfig.requiredFields || ''}
                    onChange={(e) => updateValidationConfig('requiredFields', e.target.value)}
                    placeholder="name, email, age"
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #fbbf24',
                      borderRadius: '4px',
                      fontSize: '12px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}

              {formData.bodyValidation === 'custom' && (
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '500',
                    marginBottom: '4px',
                    color: '#92400e'
                  }}>
                    Función de Validación (JavaScript)
                  </label>
                  <textarea
                    value={formData.validationConfig.customValidation || ''}
                    onChange={(e) => updateValidationConfig('customValidation', e.target.value)}
                    placeholder="function validate(body) { return body.name && body.name.length > 0; }"
                    rows={3}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #fbbf24',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}
            </div>
          )}

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
              👁️ Vista Previa de la Estructura
            </h5>
            
            <div style={{
              fontSize: '11px',
              fontFamily: 'monospace',
              background: '#1f2937',
              color: '#e5e7eb',
              padding: '8px',
              borderRadius: '4px',
              whiteSpace: 'pre-wrap',
              maxHeight: '150px',
              overflow: 'auto'
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
                [formData.bodyVariable]: selectedContentType?.supportsFields && formData.formFields?.length > 0
                  ? formData.formFields.reduce((acc, field) => {
                      if (field.name) {
                        acc[field.name] = `[${field.type}${field.required ? ' - required' : ''}]`;
                      }
                      return acc;
                    }, {})
                  : `[Body: ${formData.contentType}]`
              }, null, 2)}
            </div>
          </div>
        </>
      )}
    </div>
  );
};