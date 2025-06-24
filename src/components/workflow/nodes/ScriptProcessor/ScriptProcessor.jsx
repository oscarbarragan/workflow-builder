// src/components/workflow/nodes/ScriptProcessor/ScriptProcessor.jsx
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  Code, 
  Play, 
  Square, 
  AlertCircle, 
  CheckCircle, 
  Database,
  FileText,
  Zap,
  RotateCcw,
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import Button from '../../../common/Button/Button';

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
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showInputData, setShowInputData] = useState(true);
  
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  // Función para syntax highlighting mejorada
  const highlightSyntax = useCallback((code) => {
    if (!code) return '';
    
    // Escapar HTML primero
    let highlighted = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Aplicar highlighting con orden específico para evitar conflictos
    highlighted = highlighted
      // 1. Comentarios primero (más específicos)
      .replace(/(\/\/[^\r\n]*)/g, '<span style="color: #6A9955; font-style: italic;">$1</span>')
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color: #6A9955; font-style: italic;">$1</span>')
      
      // 2. Strings (proteger contenido)
      .replace(/("(?:[^"\\]|\\.)*")/g, '<span style="color: #CE9178;">$1</span>')
      .replace(/('(?:[^'\\]|\\.)*')/g, '<span style="color: #CE9178;">$1</span>')
      .replace(/(`(?:[^`\\]|\\.)*`)/g, '<span style="color: #CE9178;">$1</span>')
      
      // 3. Keywords (solo palabras completas)
      .replace(/\b(function|return|const|let|var|if|else|for|while|do|try|catch|finally|class|extends|import|export|default|async|await|true|false|null|undefined|typeof|instanceof|new|this|super)\b(?![">])/g, 
        '<span style="color: #569CD6; font-weight: bold;">$1</span>')
      
      // 4. Numbers (solo números completos)
      .replace(/\b(\d+\.?\d*)\b(?![">])/g, '<span style="color: #B5CEA8;">$1</span>')
      
      // 5. Console específico
      .replace(/\b(console)(?=\.)(?![">])/g, '<span style="color: #4EC9B0;">$1</span>')
      .replace(/\.(log|error|warn|info|debug|trace)\b(?![">])/g, '.<span style="color: #DCDCAA;">$1</span>')
      
      // 6. Propiedades y métodos (más conservador)
      .replace(/\.([a-zA-Z_$][a-zA-Z0-9_$]*)\b(?![">])/g, '.<span style="color: #9CDCFE;">$1</span>');
    
    return highlighted;
  }, []);

  // Disable ReactFlow when modal is open
  useEffect(() => {
    if (isOpen) {
      console.log('⚡ Script Processor opened - disabling ReactFlow');
      
      const reactFlowWrapper = document.querySelector('.react-flow');
      if (reactFlowWrapper) {
        reactFlowWrapper.style.pointerEvents = 'none';
        reactFlowWrapper.style.userSelect = 'none';
        console.log('✅ ReactFlow disabled');
      }
      
      document.body.style.overflow = 'hidden';
      
      return () => {
        console.log('⚡ Script Processor closed - re-enabling ReactFlow');
        if (reactFlowWrapper) {
          reactFlowWrapper.style.pointerEvents = 'auto';
          reactFlowWrapper.style.userSelect = 'auto';
        }
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  // Initialize Monaco Editor
  useEffect(() => {
    if (isOpen && !monacoRef.current) {
      // Simular Monaco Editor con textarea mejorada
      // En producción, aquí cargarías el Monaco Editor real
      console.log('📝 Initializing Monaco Editor simulation');
    }
  }, [isOpen]);

  function getDefaultScript() {
    return `// Script Processor - Procesa datos del workflow
// Variables disponibles: input (datos de entrada)
// Retorna: objeto con las variables de salida

function processData(input) {
  // Tus datos de entrada están en 'input'
  console.log('📥 Datos de entrada:', input);
  
  // Ejemplo de procesamiento
  const result = {
    // Procesar datos aquí
    processedAt: new Date().toISOString(),
    totalItems: Object.keys(input).length,
    
    // Ejemplos de transformaciones
    upperCaseNames: {},
    calculations: {}
  };
  
  // Transformar nombres a mayúsculas
  Object.entries(input).forEach(([key, value]) => {
    if (typeof value === 'string') {
      result.upperCaseNames[key] = value.toUpperCase();
    }
  });
  
  // Realizar cálculos
  const numbers = Object.values(input).filter(v => typeof v === 'number');
  if (numbers.length > 0) {
    result.calculations.sum = numbers.reduce((a, b) => a + b, 0);
    result.calculations.average = result.calculations.sum / numbers.length;
    result.calculations.max = Math.max(...numbers);
    result.calculations.min = Math.min(...numbers);
  }
  
  console.log('📤 Datos de salida:', result);
  return result;
}

// Ejecutar el procesamiento
return processData(input);`;
  }

  const prepareInputData = () => {
    const inputData = {};
    
    Object.entries(availableData).forEach(([key, varData]) => {
      if (typeof varData === 'object' && varData !== null && varData.value !== undefined) {
        // Nuevo formato con metadatos
        inputData[key] = varData.value;
      } else {
        // Formato viejo o valor simple
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
      
      // Crear contexto seguro para ejecución
      const sandboxedFunction = new Function('input', 'console', script);
      
      // Mock console para capturar logs
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
      
      // Ejecutar script
      const result = await sandboxedFunction(inputData, mockConsole);
      
      setExecutionResult(result);
      
      // Generar variables de salida
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

  const loadTemplate = (template) => {
    const templates = {
      basic: getDefaultScript(),
      dataTransform: `// Transformación de Datos
function processData(input) {
  const result = {};
  
  // Filtrar solo valores numéricos
  const numbers = Object.entries(input)
    .filter(([key, value]) => typeof value === 'number')
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  
  // Filtrar solo strings
  const strings = Object.entries(input)
    .filter(([key, value]) => typeof value === 'string')
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  
  result.numbers = numbers;
  result.strings = strings;
  result.summary = {
    totalNumbers: Object.keys(numbers).length,
    totalStrings: Object.keys(strings).length
  };
  
  return result;
}

return processData(input);`,
      validation: `// Validación de Datos
function processData(input) {
  const errors = [];
  const warnings = [];
  const validData = {};
  
  Object.entries(input).forEach(([key, value]) => {
    // Validar emails
    if (key.includes('email') || key.includes('mail')) {
      if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)) {
        errors.push(\`Email inválido en \${key}: \${value}\`);
      } else {
        validData[key] = value;
      }
    }
    // Validar números
    else if (typeof value === 'number') {
      if (value < 0) {
        warnings.push(\`Valor negativo en \${key}: \${value}\`);
      }
      validData[key] = value;
    }
    // Otros datos
    else {
      validData[key] = value;
    }
  });
  
  return {
    validData,
    errors,
    warnings,
    isValid: errors.length === 0,
    summary: {
      totalFields: Object.keys(input).length,
      validFields: Object.keys(validData).length,
      errorCount: errors.length,
      warningCount: warnings.length
    }
  };
}

return processData(input);`,
      calculations: `// Cálculos Avanzados
function processData(input) {
  const numbers = Object.values(input).filter(v => typeof v === 'number');
  const strings = Object.values(input).filter(v => typeof v === 'string');
  
  const calculations = {
    // Estadísticas numéricas
    count: numbers.length,
    sum: numbers.reduce((a, b) => a + b, 0),
    average: numbers.length > 0 ? numbers.reduce((a, b) => a + b, 0) / numbers.length : 0,
    min: numbers.length > 0 ? Math.min(...numbers) : null,
    max: numbers.length > 0 ? Math.max(...numbers) : null,
    
    // Análisis de strings
    stringStats: {
      count: strings.length,
      totalLength: strings.reduce((acc, str) => acc + str.length, 0),
      averageLength: strings.length > 0 ? strings.reduce((acc, str) => acc + str.length, 0) / strings.length : 0,
      longestString: strings.reduce((longest, current) => 
        current.length > longest.length ? current : longest, ''
      )
    },
    
    // Transformaciones
    normalized: numbers.map(n => n / Math.max(...numbers) || 0),
    rounded: numbers.map(n => Math.round(n * 100) / 100)
  };
  
  return {
    originalData: input,
    calculations,
    processedAt: new Date().toISOString()
  };
}

return processData(input);`
    };
    
    setScript(templates[template]);
  };

  if (!isOpen) return null;

  const modalOverlayStyle = {
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
            ⚡ Script Processor - Procesamiento de Datos
          </h2>
          
          {/* Status info */}
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            fontFamily: 'monospace',
            textAlign: 'center',
            background: '#f3f4f6',
            padding: '4px 8px',
            borderRadius: '4px'
          }}>
            <div><strong>Input vars:</strong> {Object.keys(availableData).length}</div>
            <div><strong>Output vars:</strong> {Object.keys(outputVariables).length}</div>
            <div><strong>Status:</strong> {executionResult ? '✅ Executed' : '⏸️ Not executed'}</div>
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
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#f3f4f6';
              e.target.style.color = '#374151';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'none';
              e.target.style.color = '#6b7280';
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
            {isExecuting ? 'Ejecutando...' : 'Ejecutar Script'}
          </Button>
          
          <Button
            variant="secondary"
            icon={<RotateCcw size={14} />}
            onClick={() => setScript(getDefaultScript())}
          >
            Reset
          </Button>
          
          <div style={{
            width: '1px',
            background: '#e2e8f0',
            margin: '0 8px',
            alignSelf: 'stretch'
          }} />
          
          <select
            onChange={(e) => loadTemplate(e.target.value)}
            style={{
              padding: '6px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '12px',
              background: 'white'
            }}
          >
            <option value="">Cargar Template...</option>
            <option value="basic">Básico</option>
            <option value="dataTransform">Transformación</option>
            <option value="validation">Validación</option>
            <option value="calculations">Cálculos</option>
          </select>
          
          <div style={{
            width: '1px',
            background: '#e2e8f0',
            margin: '0 8px',
            alignSelf: 'stretch'
          }} />
          
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
          <div style={{ flex: '1 1 60%', display: 'flex', flexDirection: 'column' }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
              📝 Editor de Script (JavaScript)
            </h4>
            
            {/* Monaco Editor Simulation con Syntax Highlighting */}
            <div style={{
              flex: 1,
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              overflow: 'hidden',
              background: '#1e1e1e',
              position: 'relative'
            }}>
              {/* Editor Header */}
              <div style={{
                background: '#2d2d30',
                padding: '8px 16px',
                borderBottom: '1px solid #3e3e42',
                fontSize: '12px',
                color: '#cccccc',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#ff5f57'
                }} />
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#ffbd2e'
                }} />
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  background: '#28ca42'
                }} />
                <span style={{ marginLeft: '8px', fontFamily: 'monospace' }}>
                  script.js
                </span>
              </div>
              
              {/* Line Numbers */}
              <div style={{
                display: 'flex',
                height: 'calc(100% - 40px)'
              }}>
                <div style={{
                  background: '#1e1e1e',
                  borderRight: '1px solid #3e3e42',
                  padding: '16px 8px 16px 16px',
                  fontSize: '13px',
                  fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
                  color: '#858585',
                  lineHeight: '1.5',
                  minWidth: '50px',
                  textAlign: 'right',
                  userSelect: 'none'
                }}>
                  {script.split('\n').map((_, index) => (
                    <div key={index}>{index + 1}</div>
                  ))}
                </div>
                
                {/* Code Editor with Syntax Highlighting */}
                <div style={{
                  flex: 1,
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {/* Syntax Highlighted Background */}
                  <div 
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      padding: '16px',
                      fontSize: '13px',
                      fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
                      lineHeight: '1.5',
                      whiteSpace: 'pre-wrap',
                      overflow: 'hidden',
                      pointerEvents: 'none',
                      userSelect: 'none',
                      zIndex: 1,
                      color: '#d4d4d4' // Color base del texto
                    }}
                    dangerouslySetInnerHTML={{
                      __html: highlightSyntax(script)
                    }}
                  />
                  
                  {/* Actual Textarea */}
                  <textarea
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      padding: '16px',
                      border: 'none',
                      background: 'transparent',
                      color: 'transparent', // Mantener transparente para mostrar highlighting
                      fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
                      fontSize: '13px',
                      lineHeight: '1.5',
                      resize: 'none',
                      outline: 'none',
                      caretColor: '#ffffff',
                      zIndex: 2,
                      whiteSpace: 'pre-wrap'
                    }}
                    placeholder=""
                    spellCheck={false}
                  />
                </div>
              </div>
            </div>
            
            {/* Execution Error */}
            {executionError && (
              <div style={{
                marginTop: '8px',
                padding: '12px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '6px',
                color: '#dc2626',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px'
              }}>
                <AlertCircle size={16} />
                <div>
                  <strong>Error de Ejecución:</strong><br />
                  {executionError}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Data & Results */}
          <div style={{ flex: '1 1 40%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Input Data */}
            {showInputData && Object.keys(availableData).length > 0 && (
              <div style={{
                flex: '0 0 200px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                overflow: 'hidden'
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
                  gap: '6px'
                }}>
                  <Database size={14} />
                  Datos de Entrada ({Object.keys(availableData).length})
                </div>
                <div style={{
                  padding: '8px',
                  background: '#f8fafc',
                  height: '160px',
                  overflowY: 'auto',
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
              flexDirection: 'column'
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
                gap: '6px'
              }}>
                {executionResult ? <CheckCircle size={14} /> : <FileText size={14} />}
                Resultado de Ejecución
              </div>
              
              <div style={{
                flex: 1,
                padding: '8px',
                background: '#ffffff',
                overflowY: 'auto',
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
                overflow: 'hidden'
              }}>
                <div style={{
                  background: '#1f2937',
                  padding: '6px 12px',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <Code size={12} />
                  Console ({logs.length})
                </div>
                <div style={{
                  padding: '4px',
                  background: '#111827',
                  height: '90px',
                  overflowY: 'auto',
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
              Variables de Salida Generadas ({Object.keys(outputVariables).length})
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
            💡 <strong>Tip:</strong> Usa <code>console.log()</code> para debugear y <code>return</code> para generar variables de salida
            {Object.keys(outputVariables).length > 0 && (
              <span style={{ marginLeft: '20px', color: '#3b82f6' }}>
                <strong>📊 Variables generadas:</strong> {Object.keys(outputVariables).length}
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
              💾 Guardar Script
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default ScriptProcessor;