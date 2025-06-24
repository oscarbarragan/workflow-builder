// src/components/workflow/nodes/ScriptProcessor/ScriptProcessor.jsx - COMPACTO
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Code, 
  Play, 
  RotateCcw,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  FileText,
  Database,
  Zap
} from 'lucide-react';
import Button from '../../../common/Button/Button';
import ScriptCodeEditor from './ScriptCodeEditor';
import { scriptTemplates, getDefaultScript } from '../../../../utils/scriptTemplates';

const ScriptProcessor = ({ 
  isOpen, 
  onClose, 
  initialData = {}, 
  onSave,
  availableData = {} 
}) => {
  const [script, setScript] = useState(initialData.script || getDefaultScript());
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(initialData.executionResult || null);
  const [executionError, setExecutionError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [outputVariables, setOutputVariables] = useState(initialData.outputVariables || {});
  const [showInputData, setShowInputData] = useState(true);

  // Disable ReactFlow when modal is open
  useEffect(() => {
    if (isOpen) {
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

  const prepareInputData = () => {
    const inputData = {};
    Object.entries(availableData).forEach(([key, varData]) => {
      if (typeof varData === 'object' && varData !== null && varData.value !== undefined) {
        inputData[key] = varData.value;
      } else {
        inputData[key] = varData;
      }
    });
    return inputData;
  };

  const executeScript = async () => {
    setIsExecuting(true);
    setExecutionError(null);
    setLogs([]);
    
    try {
      const inputData = prepareInputData();
      const sandboxedFunction = new Function('input', 'console', script);
      
      const mockConsole = {
        log: (...args) => {
          const logEntry = {
            type: 'log',
            message: args.map(arg => 
              typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
            ).join(' '),
            timestamp: new Date().toISOString()
          };
          setLogs(prev => [...prev, logEntry]);
        },
        error: (...args) => {
          const logEntry = {
            type: 'error',
            message: args.map(arg => String(arg)).join(' '),
            timestamp: new Date().toISOString()
          };
          setLogs(prev => [...prev, logEntry]);
        },
        warn: (...args) => {
          const logEntry = {
            type: 'warn',
            message: args.map(arg => String(arg)).join(' '),
            timestamp: new Date().toISOString()
          };
          setLogs(prev => [...prev, logEntry]);
        }
      };
      
      const result = await sandboxedFunction(inputData, mockConsole);
      setExecutionResult(result);
      
      if (result && typeof result === 'object') {
        const newOutputVariables = {};
        
        const processObject = (obj, prefix = '') => {
          Object.entries(obj).forEach(([key, value]) => {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            
            if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
              processObject(value, fullKey);
            } else {
              newOutputVariables[fullKey] = {
                type: inferType(value),
                value: value,
                displayValue: String(value).length > 50 
                  ? String(value).substring(0, 50) + '...'
                  : String(value)
              };
            }
          });
        };
        
        processObject(result);
        setOutputVariables(newOutputVariables);
      }
      
    } catch (error) {
      setExecutionError(error.message);
      setLogs(prev => [...prev, {
        type: 'error',
        message: `Execution Error: ${error.message}`,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsExecuting(false);
    }
  };

  const inferType = (value) => {
    if (value === null) return 'null';
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'string') {
      if (/^\d{4}-\d{2}-\d{2}/.test(value)) return 'date';
      return 'string';
    }
    return 'unknown';
  };

  const handleSave = () => {
    const savedData = {
      script,
      executionResult,
      outputVariables,
      status: 'configured',
      lastExecuted: executionResult ? new Date().toISOString() : null,
      createdAt: new Date().toISOString()
    };
    
    onSave(savedData);
    onClose();
  };

  const handleClose = () => {
    setScript(getDefaultScript());
    setExecutionResult(null);
    setExecutionError(null);
    setLogs([]);
    setOutputVariables({});
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
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
          handleClose();
        }
      }}
    >
      <div 
        style={{
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
        }}
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
            ⚡ Script Processor
          </h2>
          
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            fontFamily: 'monospace',
            textAlign: 'center',
            background: '#f3f4f6',
            padding: '4px 8px',
            borderRadius: '4px'
          }}>
            <div><strong>Input:</strong> {Object.keys(availableData).length}</div>
            <div><strong>Output:</strong> {Object.keys(outputVariables).length}</div>
            <div><strong>Status:</strong> {executionResult ? '✅' : '⏸️'}</div>
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

        {/* Toolbar */}
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          padding: '12px',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <Button
            variant="success"
            icon={<Play size={14} />}
            onClick={executeScript}
            disabled={isExecuting}
            loading={isExecuting}
          >
            {isExecuting ? 'Ejecutando...' : 'Ejecutar'}
          </Button>
          
          <Button
            variant="secondary"
            icon={<RotateCcw size={14} />}
            onClick={() => setScript(getDefaultScript())}
          >
            Reset
          </Button>
          
          <select
            onChange={(e) => setScript(scriptTemplates[e.target.value] || getDefaultScript())}
            style={{
              padding: '6px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '12px',
              background: 'white'
            }}
          >
            <option value="">Templates...</option>
            <option value="basic">Básico</option>
            <option value="dataMapper">🗂️ Data Mapper</option>
            <option value="workflowData">🔄 Workflow</option>
            <option value="dataTransform">Transformación</option>
            <option value="validation">Validación</option>
            <option value="calculations">Cálculos</option>
          </select>
          
          <Button
            variant="secondary"
            icon={showInputData ? <EyeOff size={14} /> : <Eye size={14} />}
            onClick={() => setShowInputData(!showInputData)}
            size="small"
          >
            {showInputData ? 'Ocultar' : 'Mostrar'} Input
          </Button>
        </div>

        {/* Main Content */}
        <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: 0 }}>
          
          {/* Left Panel - Script Editor */}
          <ScriptCodeEditor
            script={script}
            onScriptChange={setScript}
            executionError={executionError}
          />

          {/* Right Panel - Data & Results */}
          <div style={{ flex: '1 1 40%', display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 0 }}>
            
            {/* Input Data */}
            {showInputData && Object.keys(availableData).length > 0 && (
              <div style={{
                flex: '0 0 200px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  background: '#f3f4f6',
                  padding: '8px 12px',
                  borderBottom: '1px solid #e5e7eb',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexShrink: 0
                }}>
                  <Database size={14} />
                  Datos de Entrada ({Object.keys(availableData).length})
                </div>
                <div style={{
                  padding: '8px',
                  background: '#f8fafc',
                  flex: 1,
                  overflow: 'auto',
                  fontSize: '11px',
                  fontFamily: 'monospace'
                }}>
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(prepareInputData(), null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Execution Result */}
            <div style={{
              flex: 1,
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0
            }}>
              <div style={{
                background: executionResult ? '#f0fdf4' : '#f3f4f6',
                padding: '8px 12px',
                borderBottom: '1px solid #e5e7eb',
                fontSize: '12px',
                fontWeight: '600',
                color: executionResult ? '#15803d' : '#374151',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0
              }}>
                {executionResult ? <CheckCircle size={14} /> : <FileText size={14} />}
                Resultado de Ejecución
              </div>
              
              <div style={{
                flex: 1,
                padding: '8px',
                background: '#ffffff',
                overflow: 'auto',
                fontSize: '11px',
                fontFamily: 'monospace'
              }}>
                {executionResult ? (
                  <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                    {JSON.stringify(executionResult, null, 2)}
                  </pre>
                ) : (
                  <div style={{
                    color: '#6b7280',
                    fontStyle: 'italic',
                    textAlign: 'center',
                    padding: '20px'
                  }}>
                    Ejecuta el script para ver los resultados
                  </div>
                )}
              </div>
            </div>

            {/* Console Logs */}
            {logs.length > 0 && (
              <div style={{
                flex: '0 0 120px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
              }}>
                <div style={{
                  background: '#1f2937',
                  padding: '6px 12px',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexShrink: 0
                }}>
                  <Code size={12} />
                  Console ({logs.length})
                </div>
                <div style={{
                  padding: '4px',
                  background: '#111827',
                  flex: 1,
                  overflow: 'auto',
                  fontSize: '10px',
                  fontFamily: 'monospace'
                }}>
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      style={{
                        color: log.type === 'error' ? '#ef4444' : 
                               log.type === 'warn' ? '#f59e0b' : '#10b981',
                        marginBottom: '2px',
                        whiteSpace: 'pre-wrap'
                      }}
                    >
                      [{new Date(log.timestamp).toLocaleTimeString()}] {log.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Output Variables Summary */}
        {Object.keys(outputVariables).length > 0 && (
          <div style={{
            marginTop: '16px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '6px',
            padding: '12px'
          }}>
            <h5 style={{
              margin: '0 0 8px 0',
              fontSize: '13px',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Zap size={14} />
              Variables de Salida ({Object.keys(outputVariables).length})
            </h5>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '8px',
              maxHeight: '100px',
              overflowY: 'auto'
            }}>
              {Object.entries(outputVariables).map(([key, varData]) => (
                <div
                  key={key}
                  style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    background: '#dcfce7',
                    color: '#166534',
                    borderRadius: '4px',
                    border: '1px solid #bbf7d0'
                  }}
                >
                  <strong>{key}</strong> ({varData.type}): {varData.displayValue}
                </div>
              ))}
            </div>
          </div>
        )}

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
            fontSize: '14px',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            💡 <code>console.log()</code> para debug | <code>return</code> para variables
            {Object.keys(outputVariables).length > 0 && (
              <span style={{ marginLeft: '20px', color: '#3b82f6' }}>
                📊 <strong>{Object.keys(outputVariables).length}</strong> variables
              </span>
            )}
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
              size="large"
              icon={<Save size={16} />}
            >
              💾 Guardar
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ScriptProcessor;