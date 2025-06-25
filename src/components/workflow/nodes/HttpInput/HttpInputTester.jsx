// src/components/workflow/nodes/HttpInput/HttpInputTester.jsx
import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Send, 
  Code, 
  CheckCircle, 
  AlertCircle, 
  Copy,
  FileText,
  Globe,
  Zap
} from 'lucide-react';
import Button from '../../../common/Button/Button';

const HttpInputTester = ({ 
  isOpen, 
  onClose, 
  httpInputConfig = {},
  onTestResult
}) => {
  const [testData, setTestData] = useState({
    headers: {},
    body: '',
    contentType: httpInputConfig.contentType || 'application/json'
  });
  
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testError, setTestError] = useState(null);

  // Initialize test data based on HTTP Input config
  React.useEffect(() => {
    if (httpInputConfig && isOpen) {
      const initialHeaders = {};
      
      // Pre-fill headers with example values
      if (httpInputConfig.headers) {
        httpInputConfig.headers.forEach(header => {
          if (header.variable) {
            initialHeaders[header.name] = header.defaultValue || generateExampleHeaderValue(header.name);
          }
        });
      }

      const initialBody = generateExampleBody(
        httpInputConfig.contentType || 'application/json',
        httpInputConfig.path || '/test'
      );

      setTestData({
        headers: initialHeaders,
        body: typeof initialBody === 'object' ? JSON.stringify(initialBody, null, 2) : initialBody,
        contentType: httpInputConfig.contentType || 'application/json'
      });
    }
  }, [httpInputConfig, isOpen]);

  const generateExampleHeaderValue = (headerName) => {
    const name = headerName.toLowerCase();
    if (name.includes('authorization')) return 'Bearer test_token_12345';
    if (name.includes('api-key') || name.includes('apikey')) return 'test_api_key_67890';
    if (name.includes('content-type')) return 'application/json';
    if (name.includes('user-agent')) return 'HttpInputTester/1.0';
    if (name.includes('accept')) return 'application/json';
    return `test_${headerName}_value`;
  };

  const generateExampleBody = (contentType, path) => {
    const pathLower = path.toLowerCase();
    
    switch (contentType) {
      case 'application/json':
        if (pathLower.includes('user')) {
          return {
            id: 12345,
            name: "Juan Pérez",
            email: "juan.test@ejemplo.com",
            age: 30,
            active: true,
            preferences: {
              language: "es",
              notifications: true
            }
          };
        }
        
        if (pathLower.includes('order')) {
          return {
            orderId: "TEST-ORD-001",
            customerId: 12345,
            items: [
              {
                productId: "PROD-TEST-001",
                name: "Producto de Prueba",
                quantity: 2,
                price: 15000
              }
            ],
            total: 30000,
            currency: "COP"
          };
        }

        return {
          testId: "test_12345",
          message: "Datos de prueba para el endpoint",
          timestamp: new Date().toISOString(),
          data: {
            field1: "valor_prueba_1",
            field2: 42,
            field3: true,
            nested: {
              subfield1: "sub_valor_1",
              subfield2: 123,
              array: ["item1", "item2", "item3"]
            }
          }
        };
        
      case 'application/x-www-form-urlencoded':
        return 'nombre=Juan+Pérez&email=juan.test@ejemplo.com&edad=30&activo=true';
        
      case 'multipart/form-data':
        return 'nombre=Juan Pérez\nemail=juan.test@ejemplo.com\nedad=30\nactivo=true';
        
      case 'text/plain':
        return 'Datos de prueba en formato texto plano.\nLínea 2 de datos.\nTimestamp: ' + new Date().toISOString();
        
      case 'application/xml':
        return `<?xml version="1.0" encoding="UTF-8"?>
<testData>
  <id>12345</id>
  <message>Datos de prueba XML</message>
  <timestamp>${new Date().toISOString()}</timestamp>
  <data>
    <field1>valor_prueba_1</field1>
    <field2>42</field2>
    <field3>true</field3>
  </data>
</testData>`;
      
      default:
        return 'Datos de prueba para ' + contentType;
    }
  };

  const updateHeader = (headerName, value) => {
    setTestData(prev => ({
      ...prev,
      headers: {
        ...prev.headers,
        [headerName]: value
      }
    }));
  };

  const removeHeader = (headerName) => {
    setTestData(prev => {
      const newHeaders = { ...prev.headers };
      delete newHeaders[headerName];
      return {
        ...prev,
        headers: newHeaders
      };
    });
  };

  const addCustomHeader = () => {
    const headerName = prompt('Nombre del header:');
    if (headerName) {
      updateHeader(headerName, '');
    }
  };

  const simulateHttpRequest = async () => {
    setIsTesting(true);
    setTestError(null);
    setTestResult(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

      // Create mock result
      const mockResult = {
        status: 200,
        statusText: 'OK',
        headers: {
          'content-type': 'application/json',
          'x-response-time': Math.round(Math.random() * 100) + 'ms',
          'x-request-id': 'test_' + Math.random().toString(36).substr(2, 9)
        },
        data: {
          success: true,
          message: 'Datos recibidos correctamente en el HTTP Input',
          receivedHeaders: testData.headers,
          receivedBody: testData.contentType === 'application/json' 
            ? JSON.parse(testData.body) 
            : testData.body,
          processedVariables: generateProcessedVariables(),
          timestamp: new Date().toISOString()
        }
      };

      setTestResult(mockResult);
      
      // Notify parent component
      if (onTestResult) {
        onTestResult(mockResult);
      }

    } catch (error) {
      setTestError(error.message);
    } finally {
      setIsTesting(false);
    }
  };

  const generateProcessedVariables = () => {
    const variables = {};
    
    // Process headers
    Object.entries(testData.headers).forEach(([headerName, value]) => {
      const headerConfig = httpInputConfig.headers?.find(h => h.name === headerName);
      if (headerConfig?.variable) {
        variables[`headers.${headerConfig.variable}`] = value;
      }
    });
    
    // Process body
    if (httpInputConfig.enableBodyCapture && httpInputConfig.bodyVariable) {
      try {
        variables[httpInputConfig.bodyVariable] = testData.contentType === 'application/json' 
          ? JSON.parse(testData.body)
          : testData.body;
      } catch (e) {
        variables[httpInputConfig.bodyVariable] = testData.body;
      }
    }
    
    return variables;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const generateCurlCommand = () => {
    const headers = Object.entries(testData.headers)
      .map(([name, value]) => `-H "${name}: ${value}"`)
      .join(' ');
    
    const bodyFlag = ['POST', 'PUT', 'PATCH'].includes(httpInputConfig.method) 
      ? ` -d '${testData.body}'` 
      : '';
    
    return `curl -X ${httpInputConfig.method} ${headers} ${bodyFlag} "${httpInputConfig.endpoint}"`;
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        style={{
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
        }}
        onMouseDown={(e) => e.stopPropagation()}
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
            🧪 HTTP Input Tester
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
            <div><strong>Endpoint:</strong> {httpInputConfig.method} {httpInputConfig.path}</div>
            <div><strong>Content-Type:</strong> {httpInputConfig.contentType}</div>
          </div>
          
          <button 
            onClick={onClose}
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

        {/* Main Content */}
        <div style={{ display: 'flex', gap: '24px', flex: 1, minHeight: 0 }}>
          
          {/* Left Panel - Request Configuration */}
          <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Endpoint Info */}
            <div style={{
              background: '#f0f9ff',
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid #bae6fd'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#0c4a6e',
                marginBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <Globe size={16} />
                Endpoint de Prueba
              </div>
              <div style={{
                fontFamily: 'monospace',
                fontSize: '13px',
                color: '#0369a1',
                background: 'white',
                padding: '6px 8px',
                borderRadius: '4px',
                border: '1px solid #bae6fd'
              }}>
                {httpInputConfig.method} {httpInputConfig.endpoint}
              </div>
            </div>

            {/* Headers */}
            <div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
                  📋 Headers ({Object.keys(testData.headers).length})
                </h4>
                <Button
                  size="small"
                  variant="secondary"
                  onClick={addCustomHeader}
                >
                  + Agregar
                </Button>
              </div>
              
              <div style={{
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                maxHeight: '200px',
                overflow: 'auto'
              }}>
                {Object.keys(testData.headers).length === 0 ? (
                  <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: '#6b7280',
                    fontSize: '12px'
                  }}>
                    No hay headers configurados
                  </div>
                ) : (
                  Object.entries(testData.headers).map(([headerName, value]) => (
                    <div
                      key={headerName}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px 12px',
                        borderBottom: '1px solid #f3f4f6'
                      }}
                    >
                      <div style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#374151',
                        minWidth: '100px',
                        marginRight: '8px'
                      }}>
                        {headerName}:
                      </div>
                      <input
                        type="text"
                        value={value}
                        onChange={(e) => updateHeader(headerName, e.target.value)}
                        style={{
                          flex: 1,
                          padding: '4px 6px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontFamily: 'monospace'
                        }}
                      />
                      <button
                        onClick={() => removeHeader(headerName)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#dc2626',
                          marginLeft: '8px',
                          padding: '2px'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Body */}
            {['POST', 'PUT', 'PATCH'].includes(httpInputConfig.method) && (
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>
                  📦 Request Body ({testData.contentType})
                </h4>
                
                <textarea
                  value={testData.body}
                  onChange={(e) => setTestData(prev => ({ ...prev, body: e.target.value }))}
                  style={{
                    flex: 1,
                    minHeight: '200px',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                    resize: 'vertical'
                  }}
                  placeholder="Datos del body para enviar..."
                />
              </div>
            )}

            {/* Test Actions */}
            <div style={{
              display: 'flex',
              gap: '12px',
              paddingTop: '12px',
              borderTop: '1px solid #e5e7eb'
            }}>
              <Button
                variant="primary"
                onClick={simulateHttpRequest}
                disabled={isTesting}
                loading={isTesting}
                icon={<Send size={16} />}
              >
                {isTesting ? 'Enviando...' : 'Enviar Prueba'}
              </Button>
              
              <Button
                variant="secondary"
                onClick={() => copyToClipboard(generateCurlCommand())}
                icon={<Copy size={16} />}
              >
                Copiar cURL
              </Button>
            </div>
          </div>

          {/* Right Panel - Results */}
          <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* cURL Command */}
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>
                💻 Comando cURL Equivalente
              </h4>
              <div style={{
                background: '#1f2937',
                color: '#e5e7eb',
                padding: '12px',
                borderRadius: '6px',
                fontSize: '11px',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
                maxHeight: '100px',
                overflow: 'auto'
              }}>
                {generateCurlCommand()}
              </div>
            </div>

            {/* Test Results */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>
                📄 Resultado de la Prueba
              </h4>
              
              <div style={{
                flex: 1,
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>
                {testError ? (
                  <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: '#dc2626',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <AlertCircle size={32} />
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>Error en la prueba</div>
                    <div style={{ fontSize: '12px' }}>{testError}</div>
                  </div>
                ) : testResult ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Status */}
                    <div style={{
                      background: '#f0fdf4',
                      padding: '8px 12px',
                      borderBottom: '1px solid #e5e7eb',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <CheckCircle size={16} color="#16a34a" />
                      <span style={{ fontSize: '12px', fontWeight: '600', color: '#15803d' }}>
                        {testResult.status} {testResult.statusText}
                      </span>
                      <span style={{ fontSize: '11px', color: '#16a34a', marginLeft: 'auto' }}>
                        {testResult.headers['x-response-time']}
                      </span>
                    </div>
                    
                    {/* Response Data */}
                    <div style={{
                      flex: 1,
                      padding: '8px',
                      overflow: 'auto',
                      background: '#f8fafc'
                    }}>
                      <pre style={{
                        margin: 0,
                        fontSize: '11px',
                        fontFamily: 'monospace',
                        whiteSpace: 'pre-wrap',
                        color: '#374151'
                      }}>
                        {JSON.stringify(testResult.data, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    color: '#6b7280',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Zap size={32} />
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>Listo para prueba</div>
                    <div style={{ fontSize: '12px' }}>Haz clic en "Enviar Prueba" para simular el request</div>
                  </div>
                )}
              </div>
            </div>

            {/* Variables Preview */}
            {testResult && (
              <div>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>
                  🔗 Variables Generadas (para Data Mapper)
                </h4>
                <div style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '6px',
                  padding: '12px',
                  maxHeight: '150px',
                  overflow: 'auto'
                }}>
                  {Object.entries(testResult.data.processedVariables).map(([key, value]) => (
                    <div
                      key={key}
                      style={{
                        fontSize: '11px',
                        padding: '4px 8px',
                        background: '#dbeafe',
                        border: '1px solid #93c5fd',
                        borderRadius: '4px',
                        marginBottom: '4px',
                        fontFamily: 'monospace'
                      }}
                    >
                      <strong>{key}:</strong> {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '2px solid #e5e7eb'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#6b7280'
          }}>
            💡 <strong>Simulación:</strong> Esta es una prueba simulada. Los datos no se envían a un servidor real.
          </div>
          
          <Button
            variant="secondary"
            onClick={onClose}
            size="large"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default HttpInputTester;