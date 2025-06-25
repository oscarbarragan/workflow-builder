// src/components/workflow/TestingFlowGuide.jsx
import React from 'react';
import { 
  ArrowRight, 
  Globe, 
  Database, 
  FileText, 
  TestTube,
  CheckCircle
} from 'lucide-react';

const TestingFlowGuide = ({ 
  isOpen, 
  onClose,
  httpInputConfig = {},
  testResult = null 
}) => {
  if (!isOpen) return null;

  const flowSteps = [
    {
      id: 1,
      title: "HTTP Input - Configuración",
      icon: <Globe size={24} color="#3b82f6" />,
      description: "Configuras el endpoint, headers y body que recibirá datos",
      status: httpInputConfig.path ? "complete" : "pending",
      details: [
        `Endpoint: ${httpInputConfig.method || 'GET'} ${httpInputConfig.path || '/no-configurado'}`,
        `Headers: ${httpInputConfig.headers?.length || 0} configurados`,
        `Body: ${httpInputConfig.enableBodyCapture ? 'Habilitado' : 'Deshabilitado'}`
      ]
    },
    {
      id: 2,
      title: "Testing - Simulación",
      icon: <TestTube size={24} color="#16a34a" />,
      description: "El tester simula un request con datos de ejemplo al endpoint",
      status: testResult ? "complete" : "ready",
      details: [
        "Genera datos de ejemplo automáticamente",
        "Simula headers y body según configuración",
        "Muestra cómo llegarían los datos al HTTP Input",
        "NO envía datos a servidor real (es simulación)"
      ]
    },
    {
      id: 3,
      title: "Data Mapper - Procesamiento",
      icon: <Database size={24} color="#7c3aed" />,
      description: "El Data Mapper recibe la estructura y la convierte en variables",
      status: "next",
      details: [
        "Detecta automáticamente la estructura del HTTP Input",
        "Genera mapeos para cada campo",
        "Valida tipos de datos",
        "Crea variables con prefijo 'mapper.'"
      ]
    },
    {
      id: 4,
      title: "Layout Designer - Uso",
      icon: <FileText size={24} color="#f59e0b" />,
      description: "Las variables mapeadas están disponibles para usar en el layout",
      status: "future",
      details: [
        "Variables accesibles como mapper.nombreVariable",
        "Tipos de datos preservados",
        "Actualización automática si cambia el HTTP Input"
      ]
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'complete': return '#16a34a';
      case 'ready': return '#3b82f6';
      case 'next': return '#7c3aed';
      case 'future': return '#6b7280';
      default: return '#9ca3af';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'complete': return <CheckCircle size={16} color="#16a34a" />;
      case 'ready': return <TestTube size={16} color="#3b82f6" />;
      case 'next': return <ArrowRight size={16} color="#7c3aed" />;
      default: return <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#e5e7eb' }} />;
    }
  };

  return (
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
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        padding: '24px'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '16px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '700',
            color: '#1f2937'
          }}>
            🔄 Flujo de Testing - HTTP Input a Data Mapper
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
              fontSize: '20px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Flow Steps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {flowSteps.map((step, index) => (
            <div key={step.id} style={{
              display: 'flex',
              gap: '16px',
              padding: '16px',
              border: `2px solid ${getStatusColor(step.status)}`,
              borderRadius: '8px',
              background: step.status === 'complete' ? '#f0fdf4' : 
                         step.status === 'ready' ? '#eff6ff' :
                         step.status === 'next' ? '#f3e8ff' : '#f9fafb'
            }}>
              {/* Icon */}
              <div style={{
                flexShrink: 0,
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${getStatusColor(step.status)}`
              }}>
                {step.icon}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <h3 style={{
                    margin: 0,
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    {step.title}
                  </h3>
                  {getStatusIcon(step.status)}
                </div>

                <p style={{
                  margin: '0 0 12px 0',
                  fontSize: '14px',
                  color: '#6b7280',
                  lineHeight: '1.5'
                }}>
                  {step.description}
                </p>

                <ul style={{
                  margin: 0,
                  paddingLeft: '16px',
                  fontSize: '12px',
                  color: '#374151'
                }}>
                  {step.details.map((detail, idx) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Arrow */}
              {index < flowSteps.length - 1 && (
                <div style={{
                  position: 'absolute',
                  right: '-12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '24px',
                  height: '24px',
                  background: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #e5e7eb'
                }}>
                  <ArrowRight size={12} color="#6b7280" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Explanation Box */}
        <div style={{
          marginTop: '24px',
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
            💡 ¿Cómo funciona el testing?
          </h4>
          
          <div style={{ fontSize: '12px', color: '#c2410c', lineHeight: '1.5' }}>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>1. Simulación Local:</strong> El tester NO envía datos a un servidor real. 
              Simula cómo llegarían los datos al HTTP Input.
            </p>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>2. Estructura Realista:</strong> Genera datos de ejemplo basados en tu configuración 
              (headers, body, content-type).
            </p>
            <p style={{ margin: '0 0 8px 0' }}>
              <strong>3. Preview del Data Mapper:</strong> Te muestra exactamente qué variables 
              se crearían cuando el Data Mapper procese estos datos.
            </p>
            <p style={{ margin: 0 }}>
              <strong>4. Validación del Flujo:</strong> Puedes verificar que el mapeo funcione 
              correctamente antes de usar datos reales.
            </p>
          </div>
        </div>

        {/* Test Result Preview */}
        {testResult && (
          <div style={{
            marginTop: '16px',
            padding: '16px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '8px'
          }}>
            <h4 style={{
              margin: '0 0 8px 0',
              fontSize: '14px',
              color: '#15803d',
              fontWeight: '600'
            }}>
              ✅ Último Resultado de Prueba
            </h4>
            
            <div style={{ fontSize: '11px', color: '#15803d', fontFamily: 'monospace' }}>
              <div><strong>Status:</strong> {testResult.status} {testResult.statusText}</div>
              <div><strong>Variables generadas:</strong> {Object.keys(testResult.data.processedVariables || {}).length}</div>
              <div><strong>Timestamp:</strong> {testResult.data.timestamp}</div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          marginTop: '24px',
          paddingTop: '16px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: 'white',
              color: '#374151',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestingFlowGuide;