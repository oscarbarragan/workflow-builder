// src/components/workflow/nodes/DataTransformer/tabs/ResultsTab.jsx
import React from 'react';
import { Database, CheckCircle, AlertTriangle, Zap } from 'lucide-react';

const ResultsTab = ({ 
  outputVariables, 
  executionResult, 
  executionError, 
  transformations 
}) => {
  const enabledTransformations = transformations.filter(t => t.enabled);
  const successfulTransformations = Object.keys(executionResult || {}).length;
  const hasResults = outputVariables && Object.keys(outputVariables).length > 0;

  // Helper function to get type colors
  const getTypeColor = (type) => {
    const colors = {
      string: '#16a34a',
      number: '#3b82f6',
      boolean: '#f59e0b',
      array: '#7c3aed',
      object: '#dc2626',
      date: '#14b8a6',
      email: '#06b6d4',
      url: '#8b5cf6'
    };
    return colors[type] || '#6b7280';
  };

  if (executionError) {
    return (
      <div style={{
        padding: '40px 20px',
        textAlign: 'center',
        color: '#dc2626'
      }}>
        <AlertTriangle size={32} style={{ margin: '0 auto 12px', display: 'block' }} />
        <div style={{ fontSize: '14px', marginBottom: '8px', fontWeight: '600' }}>
          Error en la ejecución
        </div>
        <div style={{ 
          fontSize: '12px', 
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          padding: '12px',
          fontFamily: 'monospace'
        }}>
          {executionError}
        </div>
      </div>
    );
  }

  if (!hasResults) {
    return (
      <div style={{
        padding: '40px 20px',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        <Database size={32} style={{ margin: '0 auto 12px', display: 'block' }} />
        <div style={{ fontSize: '14px', marginBottom: '4px' }}>
          No hay resultados disponibles
        </div>
        <div style={{ fontSize: '12px' }}>
          Ejecuta las transformaciones para ver los resultados
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '16px',
      height: '100%',
      overflow: 'hidden'
    }}>
      
      {/* Execution Summary */}
      <div style={{
        background: '#f0fdf4',
        border: '1px solid #bbf7d0',
        borderRadius: '8px',
        padding: '16px',
        flexShrink: 0
      }}>
        <h4 style={{
          margin: '0 0 8px 0',
          fontSize: '14px',
          color: '#15803d',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <CheckCircle size={16} />
          Resumen de Ejecución
        </h4>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '12px',
          fontSize: '12px'
        }}>
          <div>
            <strong>Transformaciones:</strong>
            <div style={{ color: '#166534' }}>
              {successfulTransformations}/{enabledTransformations.length}
            </div>
          </div>
          <div>
            <strong>Variables generadas:</strong>
            <div style={{ color: '#166534' }}>
              {Object.keys(outputVariables).length}
            </div>
          </div>
          <div>
            <strong>Tasa de éxito:</strong>
            <div style={{ color: '#166534' }}>
              {enabledTransformations.length > 0 
                ? Math.round((successfulTransformations / enabledTransformations.length) * 100)
                : 0}%
            </div>
          </div>
        </div>
      </div>

      {/* Output Variables */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
          📊 Variables de Salida
        </h4>
        
        <div style={{
          flex: 1,
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          overflow: 'auto'
        }}>
          {Object.entries(outputVariables).map(([varName, varData], index) => (
            <div
              key={varName}
              style={{
                padding: '12px 16px',
                borderBottom: index < Object.keys(outputVariables).length - 1 ? '1px solid #f1f5f9' : 'none',
                background: index % 2 === 0 ? '#ffffff' : '#f8fafc'
              }}
            >
              {/* Variable Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#374151',
                    fontFamily: 'monospace'
                  }}>
                    transformer.{varName}
                  </span>
                  
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '12px',
                    background: getTypeColor(varData.type),
                    color: 'white',
                    fontWeight: '500'
                  }}>
                    {varData.type}
                  </span>
                </div>
                
                <Zap size={12} color="#16a34a" />
              </div>

              {/* Transformation Info */}
              <div style={{
                fontSize: '10px',
                color: '#6b7280',
                marginBottom: '6px'
              }}>
                <strong>Origen:</strong> {varData.inputVariable} → 
                <strong> Transformación:</strong> {varData.transformationType}
              </div>

              {/* Value Display */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                padding: '8px'
              }}>
                <div style={{
                  fontSize: '10px',
                  fontWeight: '500',
                  color: '#6b7280',
                  marginBottom: '4px'
                }}>
                  Valor transformado:
                </div>
                <div style={{
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  color: '#374151',
                  maxHeight: '60px',
                  overflow: 'auto',
                  wordBreak: 'break-all'
                }}>
                  {typeof varData.value === 'object'
                    ? JSON.stringify(varData.value, null, 2)
                    : String(varData.value)
                  }
                </div>
              </div>

              {/* Original Value Comparison */}
              {varData.originalValue !== undefined && (
                <div style={{
                  marginTop: '6px',
                  padding: '6px 8px',
                  background: '#fffbeb',
                  border: '1px solid #fed7aa',
                  borderRadius: '4px'
                }}>
                  <div style={{
                    fontSize: '9px',
                    fontWeight: '500',
                    color: '#d97706',
                    marginBottom: '2px'
                  }}>
                    Valor original:
                  </div>
                  <div style={{
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    color: '#d97706',
                    maxHeight: '40px',
                    overflow: 'auto',
                    wordBreak: 'break-all'
                  }}>
                    {typeof varData.originalValue === 'object'
                      ? JSON.stringify(varData.originalValue, null, 2)
                      : String(varData.originalValue)
                    }
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Usage Instructions */}
      <div style={{
        background: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderRadius: '6px',
        padding: '12px',
        flexShrink: 0
      }}>
        <h5 style={{
          margin: '0 0 6px 0',
          fontSize: '12px',
          color: '#0c4a6e',
          fontWeight: '600'
        }}>
          💡 Uso de Variables
        </h5>
        <div style={{ fontSize: '11px', color: '#0369a1', lineHeight: '1.4' }}>
          <div><strong>Prefijo:</strong> Todas las variables están disponibles con el prefijo "transformer."</div>
          <div><strong>Ejemplo:</strong> transformer.{Object.keys(outputVariables)[0] || 'variable_name'}</div>
          <div><strong>Conexión:</strong> Conecta este nodo con Layout Designer o Script Processor para usar las variables</div>
        </div>
      </div>
    </div>
  );
};

export default ResultsTab;