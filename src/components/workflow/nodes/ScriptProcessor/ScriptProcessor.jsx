// src/components/workflow/nodes/ScriptProcessor/ScriptProcessor.jsx - CON OUTPUT SCHEMA
import React, { useState, useEffect, useCallback } from 'react';
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
  Zap,
  ChevronRight,
  ChevronDown,
  Copy,
  Info,
  Plus,
  Trash2,
  RefreshCw,
  Settings
} from 'lucide-react';
import Button from '../../../common/Button/Button';
import MonacoScriptEditor from './MonacoScriptEditor';
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
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  
  // ✅ NUEVO: Estados para Output Schema
  const [outputSchema, setOutputSchema] = useState(initialData.outputSchema || []);
  const [previewData, setPreviewData] = useState({});
  const [autoDetectEnabled, setAutoDetectEnabled] = useState(true);
  const [showOutputPanel, setShowOutputPanel] = useState(true);

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

  // ✅ NUEVO: Auto-detectar variables del script
  const detectOutputVariables = useCallback((scriptCode) => {
    if (!autoDetectEnabled || !scriptCode) return;

    try {
      // Buscar patrones de return
      const returnMatches = scriptCode.match(/return\s*{([^}]*)}/s);
      if (returnMatches) {
        const returnContent = returnMatches[1];
        
        // Extraer propiedades del objeto return
        const propertyPattern = /(\w+)\s*:/g;
        const detected = [];
        let match;
        
        while ((match = propertyPattern.exec(returnContent)) !== null) {
          const varName = match[1];
          if (!detected.find(v => v.name === varName)) {
            detected.push({
              id: Date.now() + Math.random(),
              name: varName,
              type: 'auto',
              dataType: 'unknown',
              description: `Auto-detectado desde return`,
              enabled: true,
              source: 'auto-detect'
            });
          }
        }

        // Solo actualizar si hay cambios
        if (detected.length > 0) {
          setOutputSchema(prev => {
            const manual = prev.filter(v => v.source !== 'auto-detect');
            return [...manual, ...detected];
          });
        }
      }
    } catch (error) {
      console.warn('Error auto-detecting variables:', error);
    }
  }, [autoDetectEnabled]);

  // ✅ NUEVO: Auto-detectar cuando cambie el script
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      detectOutputVariables(script);
    }, 1000); // Debounce de 1 segundo

    return () => clearTimeout(timeoutId);
  }, [script, detectOutputVariables]);

  // ✅ NUEVO: Generar preview en tiempo real
  const generatePreview = useCallback(async () => {
    if (!script || Object.keys(availableData).length === 0) return;

    try {
      const expandedData = expandInputData(availableData);
      const sandboxedFunction = new Function('input', 'console', script);
      
      const mockConsole = {
        log: () => {},
        error: () => {},
        warn: () => {}
      };
      
      const result = await sandboxedFunction(expandedData, mockConsole);
      
      if (result && typeof result === 'object') {
        setPreviewData(result);
        
        // Actualizar tipos detectados automáticamente
        setOutputSchema(prev => prev.map(variable => {
          if (variable.source === 'auto-detect' && result.hasOwnProperty(variable.name)) {
            return {
              ...variable,
              dataType: inferType(result[variable.name]),
              previewValue: result[variable.name]
            };
          }
          return variable;
        }));
      }
    } catch (error) {
      console.warn('Preview generation failed:', error);
      setPreviewData({});
    }
  }, [script, availableData]);

  // ✅ NUEVO: Preview automático
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generatePreview();
    }, 1500); // Debounce de 1.5 segundos

    return () => clearTimeout(timeoutId);
  }, [generatePreview]);

  // Función para expandir datos (reutilizada)
  const expandInputData = (data, level = 0) => {
    const result = {};
    
    Object.entries(data).forEach(([key, value]) => {
      let realValue = value;
      
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        if (value.hasOwnProperty('value')) {
          realValue = value.value;
        } else if (value.hasOwnProperty('sourceValue')) {
          realValue = value.sourceValue;
        } else if (value.hasOwnProperty('displayValue')) {
          try {
            if (typeof value.displayValue === 'string' && value.displayValue.startsWith('{')) {
              realValue = JSON.parse(value.displayValue);
            } else {
              realValue = value.displayValue;
            }
          } catch {
            realValue = value.displayValue;
          }
        }
      }
      
      if (typeof realValue === 'string') {
        try {
          if (realValue.startsWith('{') || realValue.startsWith('[')) {
            realValue = JSON.parse(realValue);
          }
        } catch {
          // Mantener como string
        }
      }
      
      result[key] = realValue;
    });
    
    return result;
  };

  // ✅ NUEVO: Renderizar árbol JSON expandible
  const renderJsonTree = (obj, path = '', level = 0) => {
    if (obj === null || obj === undefined) {
      return <span style={{ color: '#6b7280', fontStyle: 'italic' }}>null</span>;
    }

    if (typeof obj !== 'object') {
      const color = typeof obj === 'string' ? '#16a34a' : 
                   typeof obj === 'number' ? '#2563eb' : 
                   typeof obj === 'boolean' ? '#dc2626' : '#6b7280';
      return (
        <span style={{ color }}>
          {typeof obj === 'string' ? `"${obj}"` : String(obj)}
        </span>
      );
    }

    if (Array.isArray(obj)) {
      const nodeKey = `array-${path}`;
      const isExpanded = expandedNodes.has(nodeKey);
      
      return (
        <div style={{ marginLeft: level * 16 }}>
          <div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              padding: '2px 0'
            }}
            onClick={() => {
              const newExpanded = new Set(expandedNodes);
              if (isExpanded) {
                newExpanded.delete(nodeKey);
              } else {
                newExpanded.add(nodeKey);
              }
              setExpandedNodes(newExpanded);
            }}
          >
            {obj.length > 0 && (
              isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />
            )}
            <span style={{ color: '#7c3aed', fontWeight: '500', marginLeft: 4 }}>
              Array[{obj.length}]
            </span>
          </div>
          {isExpanded && obj.map((item, index) => (
            <div key={index} style={{ marginLeft: 16 }}>
              <span style={{ color: '#6b7280' }}>[{index}]: </span>
              {renderJsonTree(item, `${path}[${index}]`, level + 1)}
            </div>
          ))}
        </div>
      );
    }

    const keys = Object.keys(obj);
    const nodeKey = `object-${path}`;
    const isExpanded = expandedNodes.has(nodeKey);

    return (
      <div style={{ marginLeft: level * 16 }}>
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            padding: '2px 0'
          }}
          onClick={() => {
            const newExpanded = new Set(expandedNodes);
            if (isExpanded) {
              newExpanded.delete(nodeKey);
            } else {
              newExpanded.add(nodeKey);
            }
            setExpandedNodes(newExpanded);
          }}
        >
          {keys.length > 0 && (
            isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />
          )}
          <span style={{ color: '#f59e0b', fontWeight: '500', marginLeft: 4 }}>
            Object{keys.length > 0 ? `{${keys.length}}` : '{}'}
          </span>
        </div>
        {isExpanded && keys.map(key => (
          <div key={key} style={{ marginLeft: 16, padding: '1px 0' }}>
            <span style={{ color: '#1f2937', fontWeight: '500' }}>{key}: </span>
            {renderJsonTree(obj[key], `${path}.${key}`, level + 1)}
          </div>
        ))}
      </div>
    );
  };

  // ✅ NUEVO: Agregar variable manual al schema
  const addOutputVariable = () => {
    const newVariable = {
      id: Date.now() + Math.random(),
      name: '',
      type: 'manual',
      dataType: 'string',
      description: '',
      enabled: true,
      source: 'manual'
    };
    setOutputSchema(prev => [...prev, newVariable]);
  };

  // ✅ NUEVO: Actualizar variable del schema
  const updateOutputVariable = (id, updates) => {
    setOutputSchema(prev => prev.map(variable => 
      variable.id === id ? { ...variable, ...updates } : variable
    ));
  };

  // ✅ NUEVO: Eliminar variable del schema
  const removeOutputVariable = (id) => {
    setOutputSchema(prev => prev.filter(variable => variable.id !== id));
  };

  // Generar autocompletado (función existente simplificada)
  const generateAutocompleteSuggestions = () => {
    const expandedData = expandInputData(availableData);
    const suggestions = [];

    const extractProperties = (obj, prefix = '', depth = 0) => {
      if (!obj || typeof obj !== 'object' || depth > 3) return;

      Object.keys(obj).forEach(key => {
        const fullPath = prefix ? `${prefix}.${key}` : key;
        const value = obj[key];
        
        suggestions.push({
          label: fullPath,
          kind: 'variable',
          detail: `${typeof value} ${Array.isArray(value) ? `[${value.length}]` : ''}`,
          insertText: fullPath,
          documentation: `Variable del workflow: ${typeof value}`,
          priority: prefix ? 2 : 1
        });

        if (!prefix && typeof value === 'object' && !Array.isArray(value)) {
          suggestions.push({
            label: `input.${key}`,
            kind: 'variable',
            detail: `object via input`,
            insertText: `input.${key}`,
            documentation: `Acceso vía input: ${typeof value}`,
            priority: 1
          });
        }

        if (value && typeof value === 'object' && !Array.isArray(value) && depth < 2) {
          extractProperties(value, fullPath, depth + 1);
        }
      });
    };

    extractProperties(expandedData);

    if (Object.keys(expandedData).length > 0) {
      suggestions.push({
        label: 'input',
        kind: 'variable',
        detail: 'object - input data',
        insertText: 'input',
        documentation: 'Objeto con todos los datos de entrada',
        priority: 1
      });
    }

    return suggestions.sort((a, b) => (a.priority || 5) - (b.priority || 5));
  };

  const executeScript = async () => {
    setIsExecuting(true);
    setExecutionError(null);
    setLogs([]);
    
    try {
      const inputData = expandInputData(availableData);
      console.log('🔄 Executing script with expanded input:', inputData);
      
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
    // ✅ NUEVO: Incluir output schema en el guardado
    const savedData = {
      script,
      executionResult,
      outputVariables: generateOutputVariablesFromSchema(),
      outputSchema,
      status: 'configured',
      lastExecuted: executionResult ? new Date().toISOString() : null,
      createdAt: new Date().toISOString()
    };
    
    onSave(savedData);
    onClose();
  };

  // ✅ NUEVO: Generar variables de salida desde el schema
  const generateOutputVariablesFromSchema = () => {
    const variables = {};
    
    outputSchema.filter(v => v.enabled && v.name).forEach(variable => {
      variables[variable.name] = {
        type: variable.dataType,
        value: variable.previewValue || getDefaultValueForType(variable.dataType),
        source: variable.source,
        description: variable.description
      };
    });
    
    return variables;
  };

  const getDefaultValueForType = (type) => {
    switch (type) {
      case 'string': return '';
      case 'number': return 0;
      case 'boolean': return false;
      case 'array': return [];
      case 'object': return {};
      case 'date': return new Date().toISOString();
      default: return null;
    }
  };

  const handleClose = () => {
    setScript(getDefaultScript());
    setExecutionResult(null);
    setExecutionError(null);
    setLogs([]);
    setOutputVariables({});
    setOutputSchema([]);
    setPreviewData({});
    onClose();
  };

  const copyInputToClipboard = () => {
    const inputData = expandInputData(availableData);
    navigator.clipboard.writeText(JSON.stringify(inputData, null, 2));
  };

  if (!isOpen) return null;

  const expandedData = expandInputData(availableData);

  return createPortal(
    <div 
      style={{
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
          borderRadius: '16px',
          width: '98vw',
          height: '95vh',
          maxWidth: '1800px',
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
          marginBottom: '24px',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '12px',
              padding: '8px',
              color: 'white'
            }}>
              <Code size={20} />
            </div>
            <h2 style={{
              margin: 0,
              fontSize: '24px',
              fontWeight: '700',
              color: '#1f2937'
            }}>
              Script Processor
            </h2>
            <span style={{
              fontSize: '11px',
              background: '#e0f2fe',
              color: '#0369a1',
              padding: '4px 8px',
              borderRadius: '6px',
              fontWeight: '500'
            }}>
              Con Output Schema
            </span>
          </div>
          
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            fontFamily: 'monospace',
            textAlign: 'center',
            background: '#f3f4f6',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div><strong>Input:</strong> {Object.keys(expandedData).length} variables</div>
            <div><strong>Output Schema:</strong> {outputSchema.filter(v => v.enabled).length} variables</div>
            <div><strong>Status:</strong> {executionResult ? '✅ Executed' : outputSchema.length > 0 ? '📋 Schema Defined' : '⏸️ Ready'}</div>
          </div>
          
          <button 
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '8px',
              color: '#6b7280',
              fontSize: '20px',
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.target.style.background = '#f3f4f6'}
            onMouseOut={(e) => e.target.style.background = 'none'}
          >
            ✕
          </button>
        </div>

        {/* Toolbar */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
          flexWrap: 'wrap',
          padding: '16px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <Button
            variant="success"
            icon={<Play size={16} />}
            onClick={executeScript}
            disabled={isExecuting}
            loading={isExecuting}
            size="large"
          >
            {isExecuting ? 'Ejecutando...' : '▶️ Ejecutar & Test'}
          </Button>
          
          <Button
            variant="secondary"
            icon={<RefreshCw size={16} />}
            onClick={() => detectOutputVariables(script)}
          >
            🔍 Auto-detectar
          </Button>
          
          <Button
            variant="secondary"
            icon={<Plus size={16} />}
            onClick={addOutputVariable}
          >
            ➕ Variable
          </Button>
          
          <Button
            variant="secondary"
            icon={<RotateCcw size={16} />}
            onClick={() => setScript(getDefaultScript())}
          >
            🔄 Reset
          </Button>
          
          <select
            onChange={(e) => setScript(scriptTemplates[e.target.value] || getDefaultScript())}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              fontSize: '13px',
              background: 'white',
              cursor: 'pointer'
            }}
          >
            <option value="">📄 Templates...</option>
            <option value="basic">🚀 Básico</option>
            <option value="dataMapper">🗂️ Data Mapper</option>
            <option value="workflowData">🔄 Workflow</option>
            <option value="dataTransform">⚡ Transformación</option>
            <option value="validation">✅ Validación</option>
            <option value="calculations">🧮 Cálculos</option>
          </select>
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Button
              variant="secondary"
              icon={showInputData ? <EyeOff size={16} /> : <Eye size={16} />}
              onClick={() => setShowInputData(!showInputData)}
            >
              {showInputData ? '👁️‍🗨️ Input' : '👁️ Input'}
            </Button>
            
            <Button
              variant="secondary"
              icon={showOutputPanel ? <EyeOff size={16} /> : <Settings size={16} />}
              onClick={() => setShowOutputPanel(!showOutputPanel)}
            >
              {showOutputPanel ? '📋 Schema' : '📋 Schema'}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: 0 }}>
          
          {/* Left Panel - Script Editor */}
          <div style={{ flex: showOutputPanel ? '1 1 50%' : '1 1 70%', display: 'flex', flexDirection: 'column' }}>
            <MonacoScriptEditor
              script={script}
              onScriptChange={setScript}
              executionError={executionError}
              availableData={expandedData}
              autocompleteSuggestions={generateAutocompleteSuggestions()}
            />
          </div>

          {/* Middle Panel - Output Schema */}
          {showOutputPanel && (
            <div style={{ flex: '1 1 25%', display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 0 }}>
              
              {/* Output Schema Panel */}
              <div style={{
                flex: 1,
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                background: 'white',
                minHeight: 0
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                  padding: '12px 16px',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexShrink: 0
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Settings size={16} />
                    Output Schema ({outputSchema.filter(v => v.enabled).length})
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <button
                      onClick={() => setAutoDetectEnabled(!autoDetectEnabled)}
                      style={{
                        background: autoDetectEnabled ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 6px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '10px'
                      }}
                    >
                      {autoDetectEnabled ? '🔍 AUTO' : '⏸️ OFF'}
                    </button>
                    <button
                      onClick={addOutputVariable}
                      style={{
                        background: 'rgba(255,255,255,0.2)',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 6px',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '10px'
                      }}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>
                
                <div style={{
                  flex: 1,
                  padding: '12px',
                  overflow: 'auto',
                  fontSize: '12px'
                }}>
                  {outputSchema.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {outputSchema.map((variable) => (
                        <div 
                          key={variable.id}
                          style={{
                            border: '1px solid #e5e7eb',
                            borderRadius: '8px',
                            padding: '10px',
                            background: variable.enabled ? '#f8fafc' : '#f3f4f6'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                            <input
                              type="checkbox"
                              checked={variable.enabled}
                              onChange={(e) => updateOutputVariable(variable.id, { enabled: e.target.checked })}
                            />
                            <span style={{
                              fontSize: '10px',
                              background: variable.source === 'auto-detect' ? '#dbeafe' : '#f3e8ff',
                              color: variable.source === 'auto-detect' ? '#1e40af' : '#7c3aed',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: '500'
                            }}>
                              {variable.source === 'auto-detect' ? '🔍 AUTO' : '✋ MANUAL'}
                            </span>
                            <button
                              onClick={() => removeOutputVariable(variable.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                color: '#dc2626',
                                cursor: 'pointer',
                                padding: '2px',
                                marginLeft: 'auto'
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          
                          <input
                            type="text"
                            placeholder="Variable name"
                            value={variable.name}
                            onChange={(e) => updateOutputVariable(variable.id, { name: e.target.value })}
                            style={{
                              width: '100%',
                              padding: '4px 6px',
                              border: '1px solid #d1d5db',
                              borderRadius: '4px',
                              fontSize: '11px',
                              marginBottom: '4px'
                            }}
                          />
                          
                          <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                            <select
                              value={variable.dataType}
                              onChange={(e) => updateOutputVariable(variable.id, { dataType: e.target.value })}
                              style={{
                                flex: 1,
                                padding: '2px 4px',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                fontSize: '10px'
                              }}
                            >
                              <option value="string">String</option>
                              <option value="number">Number</option>
                              <option value="boolean">Boolean</option>
                              <option value="array">Array</option>
                              <option value="object">Object</option>
                              <option value="date">Date</option>
                            </select>
                          </div>
                          
                          {variable.previewValue !== undefined && (
                            <div style={{
                              background: '#f0fdf4',
                              border: '1px solid #bbf7d0',
                              borderRadius: '4px',
                              padding: '4px 6px',
                              fontSize: '10px',
                              color: '#166534',
                              fontFamily: 'monospace'
                            }}>
                              Preview: {JSON.stringify(variable.previewValue)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{
                      textAlign: 'center',
                      color: '#6b7280',
                      padding: '20px',
                      fontStyle: 'italic'
                    }}>
                      <Settings size={24} style={{ opacity: 0.5, marginBottom: '8px' }} />
                      <div>No output variables defined</div>
                      <div style={{ fontSize: '10px', marginTop: '4px' }}>
                        Add manually or write a return statement
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Right Panel - Data & Results */}
          <div style={{ flex: '1 1 25%', display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 0 }}>
            
            {/* Input Data */}
            {showInputData && Object.keys(expandedData).length > 0 && (
              <div style={{
                flex: '0 0 200px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                background: 'white'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                  padding: '12px 16px',
                  color: 'white',
                  fontSize: '13px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexShrink: 0
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Database size={16} />
                    Input Data ({Object.keys(expandedData).length})
                  </div>
                  <button
                    onClick={copyInputToClipboard}
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '4px 8px',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '11px'
                    }}
                  >
                    <Copy size={12} />
                  </button>
                </div>
                <div style={{
                  padding: '12px',
                  background: '#f8fafc',
                  flex: 1,
                  overflow: 'auto',
                  fontSize: '12px',
                  fontFamily: '"Fira Code", "SF Mono", "Monaco", monospace'
                }}>
                  {Object.keys(expandedData).length > 0 ? (
                    Object.entries(expandedData).map(([key, value]) => (
                      <div key={key} style={{ marginBottom: '8px' }}>
                        <span style={{ color: '#1f2937', fontWeight: '600' }}>{key}: </span>
                        {renderJsonTree(value, key, 0)}
                      </div>
                    ))
                  ) : (
                    <div style={{
                      color: '#6b7280',
                      fontStyle: 'italic',
                      textAlign: 'center',
                      padding: '20px'
                    }}>
                      No input data available
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Preview Results */}
            <div style={{
              flex: 1,
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              background: 'white',
              minHeight: 0
            }}>
              <div style={{
                background: Object.keys(previewData).length > 0
                  ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
                  : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                padding: '12px 16px',
                color: 'white',
                fontSize: '13px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                flexShrink: 0
              }}>
                {Object.keys(previewData).length > 0 ? <CheckCircle size={16} /> : <FileText size={16} />}
                {Object.keys(previewData).length > 0 ? 'Live Preview' : 'Preview Result'}
              </div>
              
              <div style={{
                flex: 1,
                padding: '12px',
                background: '#ffffff',
                overflow: 'auto',
                fontSize: '12px',
                fontFamily: '"Fira Code", "SF Mono", "Monaco", monospace'
              }}>
                {Object.keys(previewData).length > 0 ? (
                  <pre style={{ 
                    margin: 0, 
                    whiteSpace: 'pre-wrap',
                    color: '#1f2937'
                  }}>
                    {JSON.stringify(previewData, null, 2)}
                  </pre>
                ) : (
                  <div style={{
                    color: '#6b7280',
                    fontStyle: 'italic',
                    textAlign: 'center',
                    padding: '40px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <Code size={24} style={{ opacity: 0.5 }} />
                    Write a script with return statement to see preview
                  </div>
                )}
              </div>
            </div>

            {/* Console Logs */}
            {logs.length > 0 && (
              <div style={{
                flex: '0 0 120px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                background: 'white'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
                  padding: '12px 16px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  flexShrink: 0
                }}>
                  <Code size={16} />
                  Console Output ({logs.length})
                </div>
                <div style={{
                  padding: '8px',
                  background: '#111827',
                  flex: 1,
                  overflow: 'auto',
                  fontSize: '11px',
                  fontFamily: '"Fira Code", "SF Mono", "Monaco", monospace'
                }}>
                  {logs.map((log, index) => (
                    <div
                      key={index}
                      style={{
                        color: log.type === 'error' ? '#ef4444' : 
                               log.type === 'warn' ? '#f59e0b' : '#10b981',
                        marginBottom: '4px',
                        whiteSpace: 'pre-wrap',
                        padding: '2px 0'
                      }}
                    >
                      <span style={{ color: '#6b7280', fontSize: '9px' }}>
                        [{new Date(log.timestamp).toLocaleTimeString()}]
                      </span> {log.message}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Output Variables Summary */}
        {outputSchema.filter(v => v.enabled).length > 0 && (
          <div style={{
            marginTop: '20px',
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '2px solid #bbf7d0',
            borderRadius: '12px',
            padding: '16px'
          }}>
            <h5 style={{
              margin: '0 0 12px 0',
              fontSize: '14px',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '600'
            }}>
              <Zap size={16} />
              Variables de Salida Definidas ({outputSchema.filter(v => v.enabled).length})
            </h5>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '12px',
              maxHeight: '120px',
              overflowY: 'auto'
            }}>
              {outputSchema.filter(v => v.enabled && v.name).map((variable) => (
                <div
                  key={variable.id}
                  style={{
                    fontSize: '12px',
                    padding: '8px 12px',
                    background: '#f0fdf4',
                    color: '#166534',
                    borderRadius: '8px',
                    border: '1px solid #bbf7d0',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <strong>{variable.name}</strong>
                    <span style={{ 
                      fontSize: '10px',
                      background: '#dcfce7',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {variable.dataType}
                    </span>
                    <span style={{ 
                      fontSize: '9px',
                      background: variable.source === 'auto-detect' ? '#dbeafe' : '#f3e8ff',
                      color: variable.source === 'auto-detect' ? '#1e40af' : '#7c3aed',
                      padding: '1px 4px',
                      borderRadius: '3px'
                    }}>
                      {variable.source === 'auto-detect' ? 'AUTO' : 'MANUAL'}
                    </span>
                  </div>
                  {variable.previewValue !== undefined && (
                    <div style={{ 
                      fontSize: '10px',
                      color: '#15803d',
                      fontFamily: 'monospace',
                      background: '#dcfce7',
                      padding: '2px 4px',
                      borderRadius: '3px',
                      maxWidth: '100%',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      Preview: {JSON.stringify(variable.previewValue)}
                    </div>
                  )}
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
          marginTop: '24px',
          paddingTop: '20px',
          borderTop: '2px solid #e5e7eb'
        }}>
          <div style={{
            fontSize: '13px',
            color: '#6b7280',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Info size={14} />
              <span>Define variables en Output Schema • Auto-detección disponible • Preview en tiempo real</span>
            </div>
            {outputSchema.filter(v => v.enabled).length > 0 && (
              <div style={{ 
                color: '#8b5cf6',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Settings size={14} />
                <strong>{outputSchema.filter(v => v.enabled).length}</strong> variables configuradas
              </div>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              variant="secondary"
              onClick={handleClose}
              size="large"
            >
              ❌ Cancelar
            </Button>
            
            <Button
              variant="primary"
              onClick={handleSave}
              size="large"
              icon={<Save size={18} />}
            >
              💾 Guardar Schema
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ScriptProcessor;