// src/components/workflow/nodes/ScriptProcessor/ScriptProcessor.jsx - COMPONENTE PRINCIPAL REFACTORIZADO
import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  Code, 
  Play, 
  RotateCcw,
  Save,
  Eye,
  EyeOff,
  Settings,
  Plus,
  RefreshCw
} from 'lucide-react';
import Button from '../../../common/Button/Button';
import MonacoScriptEditor from './MonacoScriptEditor';
import OutputSchemaPanel from './OutputSchemaPanel';
import InputDataPanel from './InputDataPanel';
import ResultsPanel from './ResultsPanel';
import DebugConsole from './DebugConsole';
import ScriptToolbar from './ScriptToolbar';
import ScriptHeader from './ScriptHeader';
import ScriptFooter from './ScriptFooter';
import { scriptTemplates } from '../../../../utils/scriptTemplates';

const ScriptProcessor = ({ 
  isOpen, 
  onClose, 
  initialData = {}, 
  onSave,
  availableData = {} 
}) => {
  // ✅ Estados principales
  const [script, setScript] = useState(initialData.script || ''); // SIN TEMPLATE POR DEFECTO
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(initialData.executionResult || null);
  const [executionError, setExecutionError] = useState(null);
  const [logs, setLogs] = useState([]);
  const [outputVariables, setOutputVariables] = useState(initialData.outputVariables || {});
  
  // ✅ Estados de UI
  const [showInputData, setShowInputData] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState(new Set());
  const [showOutputPanel, setShowOutputPanel] = useState(true);
  
  // ✅ Estados para Output Schema
  const [outputSchema, setOutputSchema] = useState(initialData.outputSchema || []);
  const [previewData, setPreviewData] = useState({});
  const [autoDetectEnabled, setAutoDetectEnabled] = useState(true);

  // ✅ NUEVO: Estado para validación de Monaco
  const [monacoMarkers, setMonacoMarkers] = useState([]);

  // ✅ CORREGIDO: Deshabilitar ReactFlow cuando el modal esté abierto
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

  // ✅ CORREGIDO: Función segura para expandir datos de entrada
  const expandInputData = useCallback((data, level = 0) => {
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
  }, []);

  // ✅ MEJORADO: Auto-detectar variables del script de forma más robusta
  const detectOutputVariables = useCallback((scriptCode) => {
    if (!autoDetectEnabled || !scriptCode) return;

    try {
      console.log('🔍 Auto-detecting variables from script:', scriptCode);
      
      // Buscar múltiples patrones de return
      const patterns = [
        /return\s*{([^}]*)}/s,           // return { ... }
        /return\s+(\w+)/g,              // return variable
        /return\s*\(\s*{([^}]*)}\s*\)/s // return ({ ... })
      ];
      
      const detected = [];
      
      patterns.forEach(pattern => {
        const matches = scriptCode.match(pattern);
        if (matches) {
          console.log('🎯 Found return pattern:', matches[0]);
          
          if (pattern.source.includes('{')) {
            // Extraer propiedades del objeto return
            const returnContent = matches[1];
            const propertyPattern = /(\w+)\s*:/g;
            let match;
            
            while ((match = propertyPattern.exec(returnContent)) !== null) {
              const varName = match[1];
              if (!detected.find(v => v.name === varName)) {
                detected.push({
                  id: Date.now() + Math.random(),
                  name: varName,
                  type: 'auto',
                  dataType: 'unknown',
                  description: `Auto-detectado desde return statement`,
                  enabled: true,
                  source: 'auto-detect'
                });
                console.log('✅ Auto-detected variable:', varName);
              }
            }
          }
        }
      });

      // Solo actualizar si hay cambios
      if (detected.length > 0) {
        setOutputSchema(prev => {
          const manual = prev.filter(v => v.source !== 'auto-detect');
          const updated = [...manual, ...detected];
          console.log('📝 Updated schema with auto-detected variables:', updated);
          return updated;
        });
        
        // Log para debug
        setLogs(prev => [...prev, {
          type: 'info',
          message: `🔍 Auto-detectadas ${detected.length} variables: ${detected.map(v => v.name).join(', ')}`,
          timestamp: new Date().toISOString()
        }]);
      } else {
        console.log('ℹ️ No variables auto-detected');
        setLogs(prev => [...prev, {
          type: 'warn',
          message: '🔍 No se encontraron variables en el return statement',
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.warn('Error auto-detecting variables:', error);
      setLogs(prev => [...prev, {
        type: 'error',
        message: `❌ Error en auto-detección: ${error.message}`,
        timestamp: new Date().toISOString()
      }]);
    }
  }, [autoDetectEnabled]);

  // ✅ MEJORADO: Generar preview en tiempo real de forma más segura
  const generatePreview = useCallback(async () => {
    if (!script || Object.keys(availableData).length === 0) return;

    try {
      const expandedData = expandInputData(availableData);
      
      console.log('🔄 Generating preview with data:', expandedData);
      
      // ✅ MEJORADO: Función más segura que captura todos los errores
      const createSafeFunction = (code) => {
        // Crear un contexto sandboxed más seguro
        const safeInput = JSON.parse(JSON.stringify(expandedData));
        
        const mockConsole = {
          log: (...args) => {
            setLogs(prev => [...prev, {
              type: 'log',
              message: `[Preview] ${args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
              ).join(' ')}`,
              timestamp: new Date().toISOString()
            }]);
          },
          error: (...args) => {
            setLogs(prev => [...prev, {
              type: 'error',
              message: `[Preview Error] ${args.map(arg => String(arg)).join(' ')}`,
              timestamp: new Date().toISOString()
            }]);
          },
          warn: (...args) => {
            setLogs(prev => [...prev, {
              type: 'warn',
              message: `[Preview Warning] ${args.map(arg => String(arg)).join(' ')}`,
              timestamp: new Date().toISOString()
            }]);
          }
        };
        
        try {
          // ✅ CORREGIDO: Detectar errores comunes antes de ejecutar
          if (code.includes('.toString;') && !code.includes('.toString();')) {
            const suggestion = code.replace(/\.toString;/g, '.toString();');
            setLogs(prev => [...prev, {
              type: 'warn',
              message: `⚠️ Posible error: usa .toString() en lugar de .toString - Sugerencia: ${suggestion}`,
              timestamp: new Date().toISOString()
            }]);
            
            // Corregir automáticamente para preview
            code = suggestion;
          }
          
          // Envolver el código en try-catch interno
          const wrappedCode = `
            try {
              ${code}
            } catch (previewError) {
              console.error('Error en preview:', previewError.message);
              return { 
                _error: true,
                _errorMessage: previewError.message,
                _suggestion: previewError.message.includes('toString') ? 
                  'Usa .toString() con paréntesis, no .toString sin paréntesis' : 
                  'Revisa la sintaxis de tu código',
                timestamp: new Date().toISOString() 
              };
            }
          `;
          
          const sandboxedFunction = new Function('input', 'console', wrappedCode);
          return sandboxedFunction(safeInput, mockConsole);
        } catch (error) {
          console.warn('Preview function creation failed:', error);
          setLogs(prev => [...prev, {
            type: 'error',
            message: `❌ Error creando función de preview: ${error.message}`,
            timestamp: new Date().toISOString()
          }]);
          return { 
            _error: true, 
            _errorMessage: error.message,
            _isCreationError: true
          };
        }
      };
      
      const result = createSafeFunction(script);
      
      if (result && typeof result === 'object') {
        if (result._error) {
          // Mostrar error en preview pero no romper la aplicación
          setPreviewData({ 
            error: result._errorMessage,
            suggestion: result._suggestion,
            timestamp: result.timestamp 
          });
          
          console.warn('Preview execution error:', result._errorMessage);
        } else {
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
          
          console.log('✅ Preview generated successfully');
        }
      } else {
        setPreviewData({});
      }
    } catch (error) {
      console.warn('Preview generation failed:', error);
      setPreviewData({ 
        error: error.message,
        suggestion: 'Revisa la sintaxis de tu código JavaScript'
      });
      
      setLogs(prev => [...prev, {
        type: 'error',
        message: `❌ Error generando preview: ${error.message}`,
        timestamp: new Date().toISOString()
      }]);
    }
  }, [script, availableData, expandInputData]);

  // ✅ NUEVO: Manejar inserción de código desde el Output Schema
  useEffect(() => {
    const handleInsertInEditor = (event) => {
      const { text, type, suggestion } = event.detail;
      
      if (type === 'variable' && suggestion) {
        // Insertar sugerencia de código
        const currentScript = script;
        let newScript;
        
        if (currentScript.includes('return {')) {
          // Si ya hay un return object, insertar la variable dentro
          newScript = currentScript.replace(
            /return\s*{([^}]*)}/, 
            (match, content) => {
              const trimmedContent = content.trim();
              const separator = trimmedContent ? ',\n    ' : '\n    ';
              return `return {${trimmedContent}${separator}${suggestion.replace('//', '').trim()}\n  }`;
            }
          );
        } else if (currentScript.includes('return ')) {
          // Si hay return pero no es objeto, agregarlo al final
          newScript = currentScript + '\n\n// Variable agregada desde Output Schema:\n' + suggestion;
        } else {
          // Si no hay return, crear estructura básica
          newScript = currentScript + (currentScript ? '\n\n' : '') + 
            `// Estructura de retorno con variable desde Output Schema:
return {
    ${suggestion.replace('//', '').replace('// Asignar valor a ', '').trim()}
};`;
        }
        
        setScript(newScript);
        
        // Log de la acción
        setLogs(prev => [...prev, {
          type: 'info',
          message: `📝 Variable "${text}" insertada en el editor`,
          timestamp: new Date().toISOString()
        }]);
      }
    };

    window.addEventListener('insertInEditor', handleInsertInEditor);
    
    return () => {
      window.removeEventListener('insertInEditor', handleInsertInEditor);
    };
  }, [script]);

  // Auto-detectar cuando cambie el script (con debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      detectOutputVariables(script);
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [script, detectOutputVariables]);

  // Preview automático (con debounce)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generatePreview();
    }, 1500);
    return () => clearTimeout(timeoutId);
  }, [generatePreview]);

  // ✅ MEJORADO: Ejecutar script de forma más segura con mejor manejo de errores
  const executeScript = async () => {
    setIsExecuting(true);
    setExecutionError(null);
    setLogs([]);
    
    try {
      const inputData = expandInputData(availableData);
      console.log('🔄 Executing script with expanded input:', inputData);
      
      // Log de inicio
      setLogs(prev => [...prev, {
        type: 'info',
        message: '🚀 Iniciando ejecución del script...',
        timestamp: new Date().toISOString()
      }]);
      
      // ✅ FUNCIÓN MÁS SEGURA: Detectar errores comunes antes de ejecutar
      let processedScript = script;
      
      // Detectar y corregir errores comunes
      if (script.includes('.toString;') && !script.includes('.toString();')) {
        const correctedScript = script.replace(/\.toString;/g, '.toString();');
        setLogs(prev => [...prev, {
          type: 'warn',
          message: '⚠️ Auto-corrección: .toString; → .toString()',
          timestamp: new Date().toISOString()
        }]);
        processedScript = correctedScript;
      }
      
      // Crear función con mejor manejo de errores
      const createExecutionFunction = (code, input) => {
        const mockConsole = {
          log: (...args) => {
            const logEntry = {
              type: 'log',
              message: `📝 ${args.map(arg => 
                typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
              ).join(' ')}`,
              timestamp: new Date().toISOString()
            };
            setLogs(prev => [...prev, logEntry]);
          },
          error: (...args) => {
            const logEntry = {
              type: 'error',
              message: `❌ ${args.map(arg => String(arg)).join(' ')}`,
              timestamp: new Date().toISOString()
            };
            setLogs(prev => [...prev, logEntry]);
          },
          warn: (...args) => {
            const logEntry = {
              type: 'warn',
              message: `⚠️ ${args.map(arg => String(arg)).join(' ')}`,
              timestamp: new Date().toISOString()
            };
            setLogs(prev => [...prev, logEntry]);
          },
          info: (...args) => {
            const logEntry = {
              type: 'info',
              message: `ℹ️ ${args.map(arg => String(arg)).join(' ')}`,
              timestamp: new Date().toISOString()
            };
            setLogs(prev => [...prev, logEntry]);
          }
        };
        
        // Crear una copia segura del input para evitar mutaciones
        const safeInput = JSON.parse(JSON.stringify(input));
        
        try {
          // Añadir validaciones adicionales
          if (!code.trim()) {
            throw new Error('El script está vacío');
          }
          
          if (!code.includes('return')) {
            setLogs(prev => [...prev, {
              type: 'warn',
              message: '⚠️ El script no contiene un statement "return". No se generarán variables de salida.',
              timestamp: new Date().toISOString()
            }]);
          }
          
          // ✅ CORREGIDO: Evaluar todo el código, no solo return
          // Esto permite que console.log funcione correctamente
          const sandboxedFunction = new Function('input', 'console', 
            `
            ${code}
            `
          );
          
          const result = sandboxedFunction(safeInput, mockConsole);
          
          setLogs(prev => [...prev, {
            type: 'info',
            message: '✅ Script ejecutado exitosamente',
            timestamp: new Date().toISOString()
          }]);
          
          return result;
        } catch (error) {
          // Mejor análisis del error
          let errorMessage = error.message;
          let suggestion = '';
          
          if (error.message.includes('toString') && error.message.includes('requires')) {
            errorMessage = 'Error con .toString - falta paréntesis ()';
            suggestion = 'Usa .toString() en lugar de .toString';
          } else if (error.message.includes('is not defined')) {
            errorMessage = `Variable no definida: ${error.message}`;
            suggestion = 'Verifica que todas las variables estén disponibles en input';
          } else if (error.message.includes('Cannot read property')) {
            errorMessage = `Propiedad inexistente: ${error.message}`;
            suggestion = 'Verifica que las propiedades del objeto existan antes de acceder';
          }
          
          setLogs(prev => [...prev, {
            type: 'error',
            message: `💥 ${errorMessage}`,
            timestamp: new Date().toISOString()
          }]);
          
          if (suggestion) {
            setLogs(prev => [...prev, {
              type: 'info',
              message: `💡 Sugerencia: ${suggestion}`,
              timestamp: new Date().toISOString()
            }]);
          }
          
          throw new Error(`${errorMessage}${suggestion ? ` - ${suggestion}` : ''}`);
        }
      };
      
      const result = createExecutionFunction(processedScript, inputData);
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
        
        setLogs(prev => [...prev, {
          type: 'info',
          message: `📊 Generadas ${Object.keys(newOutputVariables).length} variables de salida`,
          timestamp: new Date().toISOString()
        }]);
      }
      
    } catch (error) {
      const errorMessage = error.message || 'Error desconocido en la ejecución';
      setExecutionError(errorMessage);
      setLogs(prev => [...prev, {
        type: 'error',
        message: `❌ Error de Ejecución: ${errorMessage}`,
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsExecuting(false);
      setLogs(prev => [...prev, {
        type: 'info',
        message: '🏁 Ejecución finalizada',
        timestamp: new Date().toISOString()
      }]);
    }
  };

  // Función para inferir tipos
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

  // Generar autocompletado
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

  // ✅ MANEJADORES PARA LOS COMPONENTES HIJO
  const handleScriptTemplate = (templateKey) => {
    const template = scriptTemplates[templateKey];
    if (template) {
      setScript(template);
    }
  };

  const handleSave = () => {
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
    setScript(''); // ✅ LIMPIO: Sin template por defecto
    setExecutionResult(null);
    setExecutionError(null);
    setLogs([]); // ✅ NUEVO: Limpiar logs también
    setOutputVariables({});
    setOutputSchema([]);
    setPreviewData({});
    onClose();
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
        <ScriptHeader 
          expandedData={expandedData}
          outputSchema={outputSchema}
          executionResult={executionResult}
          onClose={handleClose}
        />

        {/* Toolbar */}
        <ScriptToolbar 
          isExecuting={isExecuting}
          showInputData={showInputData}
          showOutputPanel={showOutputPanel}
          onExecute={executeScript}
          onAutoDetect={() => detectOutputVariables(script)}
          onAddVariable={() => {
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
          }}
          onReset={() => {
            setScript('');
            setLogs([]);
            setExecutionError(null);
            setExecutionResult(null);
            setPreviewData({});
          }}
          onTemplateSelect={handleScriptTemplate}
          onToggleInput={() => setShowInputData(!showInputData)}
          onToggleSchema={() => setShowOutputPanel(!showOutputPanel)}
        />

        {/* Main Content */}
        <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: 0 }}>
          
          {/* ✅ CORREGIDO: Editor se redimensiona correctamente con cálculo dinámico */}
          <div style={{ 
            flex: showOutputPanel ? '1 1 45%' : '1 1 65%', 
            display: 'flex', 
            flexDirection: 'column',
            transition: 'flex-basis 0.3s ease', // Transición más específica
            minWidth: '300px' // Ancho mínimo para evitar colapso
          }}>
            <MonacoScriptEditor
              script={script}
              onScriptChange={setScript}
              executionError={executionError}
              availableData={expandedData}
              autocompleteSuggestions={generateAutocompleteSuggestions()}
              onValidationChange={(markers) => {
                // ✅ NUEVO: Capturar errores de validación de Monaco
                setMonacoMarkers(markers || []);
                
                if (markers && markers.length > 0) {
                  const errors = markers.filter(m => m.severity === 8); // Error severity
                  const warnings = markers.filter(m => m.severity === 4); // Warning severity
                  
                  if (errors.length > 0) {
                    console.log('🔍 Monaco errors detected:', errors);
                  }
                  
                  if (warnings.length > 0) {
                    console.log('⚠️ Monaco warnings detected:', warnings);
                  }
                }
              }}
            />
          </div>

          {/* Output Schema Panel - ✅ CORREGIDO: Tamaño fijo para evitar problemas */}
          {showOutputPanel && (
            <div style={{ 
              flex: '0 0 280px', // Flex fijo en lugar de porcentaje
              display: 'flex', 
              flexDirection: 'column',
              transition: 'opacity 0.3s ease',
              minWidth: '280px',
              maxWidth: '320px'
            }}>
              <OutputSchemaPanel 
                outputSchema={outputSchema}
                autoDetectEnabled={autoDetectEnabled}
                previewData={previewData}
                onSchemaChange={setOutputSchema}
                onAutoDetectToggle={setAutoDetectEnabled}
              />
            </div>
          )}

          {/* Input & Results Panel */}
          <div style={{ 
            flex: showOutputPanel ? '1 1 300px' : '1 1 35%', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px', 
            minHeight: 0,
            minWidth: '280px'
          }}>
            
            {/* Input Data */}
            {showInputData && Object.keys(expandedData).length > 0 && (
              <InputDataPanel 
                expandedData={expandedData}
                expandedNodes={expandedNodes}
                onExpandedNodesChange={setExpandedNodes}
              />
            )}

            {/* Results Panel */}
            <ResultsPanel 
              previewData={previewData}
              logs={logs}
            />
            
            {/* ✅ NUEVO: Consola de Debug */}
            <DebugConsole 
              logs={logs}
              executionError={executionError}
              onClearLogs={() => setLogs([])}
            />
          </div>
        </div>

        {/* Footer */}
        <ScriptFooter 
          outputSchema={outputSchema}
          onCancel={handleClose}
          onSave={handleSave}
        />
      </div>
    </div>,
    document.body
  );
};

export default ScriptProcessor;