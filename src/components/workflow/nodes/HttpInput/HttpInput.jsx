// src/components/workflow/nodes/HttpInput/HttpInput.jsx - MEJORADO CON TESTER
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Globe, Settings, Database, TestTube, HelpCircle } from 'lucide-react';
import Button from '../../../common/Button/Button';
import { BasicTab, HeadersTab, BodyTab } from './HttpInputTabs';
import HttpInputTester from './HttpInputTester';
import { validateHttpInputConfig } from '../../../../utils/httpInputHelpers';

// NUEVO: Componente TestingFlowGuide inline para evitar imports
const TestingFlowGuide = ({ 
  isOpen, 
  onClose,
  httpInputConfig = {},
  testResult = null 
}) => {
  if (!isOpen) return null;

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999999,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        width: '90vw',
        maxWidth: '700px',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        padding: '24px'
      }}>
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
            fontSize: '20px',
            fontWeight: '700',
            color: '#1f2937'
          }}>
            🔄 ¿Cómo funciona el Testing?
          </h2>
          
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              color: '#6b7280',
              fontSize: '18px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Explanation */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Step 1 */}
          <div style={{
            padding: '16px',
            border: '2px solid #3b82f6',
            borderRadius: '8px',
            background: '#eff6ff'
          }}>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '16px',
              color: '#1e40af',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Globe size={20} />
              1. HTTP Input - Configuración
            </h3>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#1e40af' }}>
              Configuras el endpoint, headers y body que recibirá datos del exterior.
            </p>
            <div style={{ fontSize: '12px', color: '#3730a3' }}>
              • Endpoint: {httpInputConfig.method || 'GET'} {httpInputConfig.path || '/no-configurado'}<br/>
              • Headers: {httpInputConfig.headers?.length || 0} configurados<br/>
              • Body: {httpInputConfig.enableBodyCapture ? 'Habilitado' : 'Deshabilitado'}
            </div>
          </div>

          {/* Step 2 */}
          <div style={{
            padding: '16px',
            border: '2px solid #16a34a',
            borderRadius: '8px',
            background: '#f0fdf4'
          }}>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '16px',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <TestTube size={20} />
              2. Testing - Simulación
            </h3>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#15803d' }}>
              El botón "🧪 Probar Endpoint" simula un request con datos de ejemplo.
            </p>
            <div style={{ fontSize: '12px', color: '#14532d' }}>
              • <strong>NO envía datos reales</strong> - es simulación local<br/>
              • Genera headers y body según tu configuración<br/>
              • Muestra qué variables se crearían<br/>
              • Permite validar el flujo antes de usar datos reales
            </div>
          </div>

          {/* Step 3 */}
          <div style={{
            padding: '16px',
            border: '2px solid #7c3aed',
            borderRadius: '8px',
            background: '#f3e8ff'
          }}>
            <h3 style={{
              margin: '0 0 8px 0',
              fontSize: '16px',
              color: '#6b21a8',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <Database size={20} />
              3. Data Mapper - Procesamiento
            </h3>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6b21a8' }}>
              El Data Mapper recibe la estructura y la convierte en variables utilizables.
            </p>
            <div style={{ fontSize: '12px', color: '#581c87' }}>
              • Detecta automáticamente la estructura del HTTP Input<br/>
              • Genera mapeos para cada campo<br/>
              • Valida tipos de datos<br/>
              • Crea variables con prefijo "mapper."
            </div>
          </div>

          {/* Key Points */}
          <div style={{
            padding: '16px',
            background: '#fefbf3',
            border: '1px solid #fed7aa',
            borderRadius: '8px'
          }}>
            <h4 style={{
              margin: '0 0 8px 0',
              fontSize: '14px',
              color: '#c2410c',
              fontWeight: '600'
            }}>
              🎯 Puntos Clave:
            </h4>
            
            <ul style={{
              fontSize: '12px',
              color: '#c2410c',
              margin: 0,
              paddingLeft: '16px'
            }}>
              <li><strong>Testing Local:</strong> No se conecta a servidores reales</li>
              <li><strong>Datos de Ejemplo:</strong> Se generan automáticamente según tu configuración</li>
              <li><strong>Validación del Flujo:</strong> Verifica que HTTP Input → Data Mapper funcione</li>
              <li><strong>Variables Resultantes:</strong> Estarán disponibles como "mapper.nombreVariable"</li>
            </ul>
          </div>

          {/* Test Result Preview */}
          {testResult && (
            <div style={{
              padding: '12px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '6px'
            }}>
              <h4 style={{
                margin: '0 0 6px 0',
                fontSize: '12px',
                color: '#15803d',
                fontWeight: '600'
              }}>
                ✅ Último Test Realizado:
              </h4>
              
              <div style={{ fontSize: '11px', color: '#15803d', fontFamily: 'monospace' }}>
                <div>Status: {testResult.status} {testResult.statusText}</div>
                <div>Variables: {Object.keys(testResult.data.processedVariables || {}).length}</div>
                <div>Hora: {new Date(testResult.data.timestamp).toLocaleTimeString()}</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 24px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: '#3b82f6',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            ¡Entendido!
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

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
    
    // Body - SIMPLIFICADO
    bodyVariable: initialData.bodyVariable || 'requestBody',
    enableBodyCapture: initialData.enableBodyCapture !== undefined ? initialData.enableBodyCapture : true,
    contentType: initialData.contentType || 'application/json',
    
    ...initialData
  });
  
  const [errors, setErrors] = useState({});
  const [isValidating, setIsValidating] = useState(false);
  const [pathValidation, setPathValidation] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  
  // NUEVO: Estado del tester
  const [isTesterOpen, setIsTesterOpen] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [isFlowGuideOpen, setIsFlowGuideOpen] = useState(false);

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
        
        // CRITICAL FIX: Asegurar que se marca como configurado
        configured: true,
        
        // NUEVO: Incluir datos de prueba si existen
        testResults: testResults.length > 0 ? testResults : undefined,
        lastTested: testResults.length > 0 ? new Date().toISOString() : undefined,
        
        // Generate simplified output structure
        outputStructure: generateSimplifiedOutputStructure(formData)
      };
      
      console.log('💾 FIXED: Saving HTTP Input configuration with configured=true:', savedData);
      onSave(savedData);
      onClose();
    }
  };

  // SIMPLIFIED: Generate output structure without complex validation
  const generateSimplifiedOutputStructure = (data) => {
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
    
    // Body variable (simplified)
    if (data.enableBodyCapture && data.bodyVariable) {
      structure[data.bodyVariable] = {
        type: 'object',
        source: 'body',
        contentType: data.contentType,
        description: 'Raw request body content - use Data Mapper for validation and field mapping'
      };
    }
    
    return structure;
  };

  // NUEVO: Manejar resultado del test
  const handleTestResult = (result) => {
    setTestResults(prev => [result, ...prev.slice(0, 4)]); // Mantener últimos 5 resultados
    console.log('🧪 Test result received:', result);
  };

  // NUEVO: Abrir tester - CORREGIDO para que funcione siempre
  const handleOpenTester = () => {
    console.log('🧪 Opening tester with data:', formData);
    console.log('🧪 Path validation:', pathValidation);
    
    // Verificar condiciones mínimas
    if (!formData.path || formData.path.trim() === '') {
      alert('Por favor configura un path antes de hacer pruebas (ej: /test)');
      return;
    }
    
    // Si no hay validación de path o está validando, permitir de todas formas
    if (pathValidation && !pathValidation.isValid) {
      const proceed = confirm('El path tiene problemas de validación. ¿Continuar con la prueba de todas formas?');
      if (!proceed) return;
    }
    
    console.log('✅ Opening tester...');
    setIsTesterOpen(true);
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
      contentType: 'application/json'
    });
    setErrors({});
    setPathValidation(null);
    setActiveTab('basic');
    setTestResults([]); // NUEVO: Limpiar resultados
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
    maxWidth: '1200px',
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
            {testResults.length > 0 && (
              <div><strong>Pruebas:</strong> {testResults.length}</div>
            )}
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
          
          {/* NUEVO: Botón de Testing - CORREGIDO */}
          <button
            onClick={handleOpenTester}
            disabled={!formData.path || formData.path.trim() === ''}
            style={{
              marginLeft: 'auto',
              padding: '12px 20px',
              border: 'none',
              background: formData.path && formData.path.trim() !== '' ? '#16a34a' : '#9ca3af',
              color: 'white',
              cursor: formData.path && formData.path.trim() !== '' ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
              opacity: formData.path && formData.path.trim() !== '' ? 1 : 0.5
            }}
          >
            <TestTube size={14} />
            🧪 Probar Endpoint
          </button>
          
          {/* NUEVO: Botón de Ayuda del Flujo */}
          <button
            onClick={() => setIsFlowGuideOpen(true)}
            style={{
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: 'white',
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
            title="¿Cómo funciona el testing?"
          >
            <HelpCircle size={14} />
          </button>
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

        {/* NUEVO: Test Results Summary */}
        {testResults.length > 0 && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '12px',
            marginTop: '16px'
          }}>
            <div style={{
              fontSize: '13px',
              color: '#15803d',
              fontWeight: '600',
              marginBottom: '6px'
            }}>
              🧪 Últimas Pruebas ({testResults.length})
            </div>
            
            <div style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap'
            }}>
              {testResults.slice(0, 3).map((result, index) => (
                <div
                  key={index}
                  style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    background: result.status === 200 ? '#dcfce7' : '#fef2f2',
                    color: result.status === 200 ? '#166534' : '#dc2626',
                    borderRadius: '4px',
                    border: `1px solid ${result.status === 200 ? '#bbf7d0' : '#fecaca'}`,
                    fontFamily: 'monospace'
                  }}
                >
                  {result.status} - {new Date(result.data.timestamp).toLocaleTimeString()}
                </div>
              ))}
              {testResults.length > 3 && (
                <div style={{
                  fontSize: '11px',
                  padding: '4px 8px',
                  background: '#f3f4f6',
                  color: '#6b7280',
                  borderRadius: '4px',
                  border: '1px solid #e5e7eb'
                }}>
                  +{testResults.length - 3} más
                </div>
              )}
            </div>
          </div>
        )}

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
                  {(() => {
                    const parts = [];
                    if (formData.headers.length > 0) {
                      const headerVars = formData.headers.filter(h => h.variable).map(h => h.variable);
                      if (headerVars.length > 0) {
                        parts.push(`Headers: ${headerVars.join(', ')}`);
                      }
                    }
                    if (formData.enableBodyCapture) {
                      parts.push(`Body: ${formData.bodyVariable} (para Data Mapper)`);
                    }
                    if (parts.length === 0) {
                      return <span style={{ color: '#6b7280', fontStyle: 'italic' }}>No hay variables configuradas</span>;
                    }
                    return parts.map((part, index) => <div key={index}>{part}</div>);
                  })()}
                </div>
              </div>
            </div>
            
            {/* NUEVO: Guía de uso */}
            <div style={{
              marginTop: '12px',
              padding: '8px',
              background: '#ecfdf5',
              borderRadius: '4px',
              fontSize: '11px',
              color: '#15803d'
            }}>
              <strong>💡 Próximos pasos:</strong>
              <ol style={{ margin: '4px 0 0 16px', padding: 0 }}>
                <li>Usa el botón "🧪 Probar Endpoint" para simular requests</li>
                <li>Conecta este HTTP Input con un Data Mapper</li>
                <li>El Data Mapper procesará los datos y creará variables</li>
              </ol>
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
            💡 <strong>Simplificado:</strong> Solo captura datos. Usa Data Mapper para validación y mapeo detallado.
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
              💾 Guardar HTTP Input
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
      
      {/* NUEVO: HTTP Input Tester Modal */}
      <HttpInputTester
        isOpen={isTesterOpen}
        onClose={() => setIsTesterOpen(false)}
        httpInputConfig={{
          ...formData,
          endpoint: `http://localhost:3000/api${formData.path}`
        }}
        onTestResult={handleTestResult}
      />
      
      {/* NUEVO: Testing Flow Guide */}
      <TestingFlowGuide
        isOpen={isFlowGuideOpen}
        onClose={() => setIsFlowGuideOpen(false)}
        httpInputConfig={formData}
        testResult={testResults.length > 0 ? testResults[0] : null}
      />
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default HttpInput;