// src/components/layoutDesigner/PageManager/MonacoConditionWrapper.jsx
// Monaco Editor completo para condiciones de página - Implementación standalone

import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';

const MonacoConditionWrapper = ({
  value = '',
  onChange,
  onValidationChange,
  onTest,
  availableVariables = {},
  height = '300px',
  placeholder = ''
}) => {
  const [localError, setLocalError] = useState(null);
  const [isMonacoLoaded, setIsMonacoLoaded] = useState(false);
  const [markers, setMarkers] = useState([]);
  const editorRef = useRef(null);
  const containerRef = useRef(null);

  // ✅ Procesar variables para autocompletado
  const processedVariables = useMemo(() => {
    const vars = [];
    
    const processObject = (obj, prefix = '') => {
      Object.entries(obj).forEach(([key, value]) => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          // Objeto anidado
          vars.push({
            name: fullKey,
            type: 'object',
            value: 'Object',
            description: `Objeto con ${Object.keys(value).length} propiedades`
          });
          // Procesar recursivamente hasta 3 niveles
          if (prefix.split('.').length < 2) {
            processObject(value, fullKey);
          }
        } else {
          // Variable primitiva o array
          const displayValue = Array.isArray(value) 
            ? `Array(${value.length})` 
            : String(value).length > 50 
              ? String(value).substring(0, 50) + '...'
              : String(value);

          vars.push({
            name: fullKey,
            type: Array.isArray(value) ? 'array' : typeof value,
            value: displayValue,
            description: `${typeof value} - ${displayValue}`
          });
        }
      });
    };

    processObject(availableVariables);
    return vars.sort((a, b) => a.name.localeCompare(b.name));
  }, [availableVariables]);

  // ✅ Generar placeholder inteligente (solo para documentación)
  const generatePlaceholder = useCallback(() => {
    if (placeholder) return placeholder;
    
    const variables = processedVariables.map(v => v.name);
    
    return `return true;

// Ejemplos de condiciones más complejas:
// return ${variables[0] || 'variable'} === "valor";
// return ${variables[0] || 'variable'} && ${variables[0] || 'variable'} !== "";
// return ${variables[0] || 'variable'} === "valor" && ${variables[1] || 'otra_variable'} > 18;

// Variables disponibles: ${variables.slice(0, 5).join(', ')}${variables.length > 5 ? '...' : ''}
// Presiona Ctrl+Espacio para ver autocompletado`;
  }, [placeholder, processedVariables]);

  // ✅ Manejar cambios en el script
  const handleScriptChange = useCallback((newScript) => {
    onChange && onChange(newScript);
    
    // Validación específica para condiciones
    if (newScript && newScript.trim()) {
      if (!newScript.includes('return')) {
        setLocalError('⚠️ El script debe incluir una declaración "return" que devuelva true o false');
      } else {
        setLocalError(null);
      }
    } else {
      setLocalError(null);
    }
  }, [onChange]);

  // ✅ Manejar validación de Monaco
  const handleValidationChange = useCallback((monacoMarkers) => {
    setMarkers(monacoMarkers || []);
    
    const errors = monacoMarkers
      ?.filter(marker => marker.severity === 8) // Error severity
      ?.map(marker => `Línea ${marker.startLineNumber}: ${marker.message}`) || [];
    
    const warnings = monacoMarkers
      ?.filter(marker => marker.severity === 4) // Warning severity  
      ?.map(marker => `Línea ${marker.startLineNumber}: ${marker.message}`) || [];

    // Agregar validación local
    if (localError) {
      warnings.push(localError);
    }

    const validation = {
      isValid: errors.length === 0 && !localError,
      errors,
      warnings,
      markers: monacoMarkers
    };

    onValidationChange && onValidationChange(validation);
  }, [localError, onValidationChange]);

  // ✅ Cargar Monaco Editor
  useEffect(() => {
    const loadMonaco = async () => {
      try {
        // Verificar si Monaco ya está cargado
        if (window.monaco) {
          initializeEditor();
          return;
        }

        // Cargar Monaco desde CDN
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/loader.min.js';
        document.head.appendChild(script);

        script.onload = () => {
          window.require.config({ 
            paths: { 
              vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' 
            } 
          });

          window.require(['vs/editor/editor.main'], () => {
            initializeEditor();
          });
        };

        script.onerror = () => {
          console.error('Failed to load Monaco Editor from CDN');
        };
      } catch (error) {
        console.error('Error loading Monaco Editor:', error);
      }
    };

    const initializeEditor = () => {
      if (!containerRef.current || editorRef.current || !window.monaco) return;

      try {
        // Configuraciones de TypeScript/JavaScript
        window.monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
          noSemanticValidation: false,
          noSyntaxValidation: false,
          noSuggestionDiagnostics: false
        });

        window.monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
          target: window.monaco.languages.typescript.ScriptTarget.ES2020,
          allowNonTsExtensions: true,
          moduleResolution: window.monaco.languages.typescript.ModuleResolutionKind.NodeJs,
          module: window.monaco.languages.typescript.ModuleKind.CommonJS,
          noEmit: true,
          allowJs: true,
          checkJs: false
        });

        // Crear el editor
        editorRef.current = window.monaco.editor.create(containerRef.current, {
          value: value || 'return true;', // ✅ CAMBIADO: Usar directamente 'return true;' si no hay valor
          language: 'javascript',
          theme: 'vs-dark',
          automaticLayout: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          fontFamily: '"Fira Code", "SF Mono", "Monaco", "Consolas", monospace',
          lineNumbers: 'on',
          glyphMargin: true,
          folding: true,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
          renderWhitespace: 'boundary',
          tabSize: 2,
          insertSpaces: true,
          wordWrap: 'on',
          quickSuggestions: {
            other: true,
            comments: true,
            strings: true
          },
          acceptSuggestionOnCommitCharacter: true,
          acceptSuggestionOnEnter: 'on',
          suggestOnTriggerCharacters: true,
          tabCompletion: 'on',
          wordBasedSuggestions: true,
          parameterHints: {
            enabled: true,
            cycle: true
          },
          contextmenu: true,
          mouseWheelZoom: true,
          cursorBlinking: 'blink',
          cursorSmoothCaretAnimation: true,
          smoothScrolling: true,
          bracketPairColorization: {
            enabled: true
          }
        });

        // ✅ Registrar provider de autocompletado inteligente
        window.monaco.languages.registerCompletionItemProvider('javascript', {
          provideCompletionItems: (model, position) => {
            const word = model.getWordUntilPosition(position);
            const range = {
              startLineNumber: position.lineNumber,
              endLineNumber: position.lineNumber,
              startColumn: word.startColumn,
              endColumn: word.endColumn
            };

            const suggestions = [];

            // ✅ Variables disponibles con autocompletado inteligente
            processedVariables.forEach(variable => {
              suggestions.push({
                label: variable.name,
                kind: window.monaco.languages.CompletionItemKind.Variable,
                insertText: variable.name,
                detail: `${variable.type}: ${variable.value}`,
                documentation: variable.description,
                range: range,
                sortText: `0_${variable.name}` // Priorizar variables
              });
            });

            // ✅ Palabras clave específicas para condiciones
            const keywords = [
              {
                label: 'return',
                kind: window.monaco.languages.CompletionItemKind.Keyword,
                insertText: 'return ',
                detail: 'return statement (REQUIRED)',
                documentation: 'Retorna un valor boolean (true o false) - OBLIGATORIO para condiciones',
                range: range,
                sortText: '1_return'
              },
              {
                label: 'true',
                kind: window.monaco.languages.CompletionItemKind.Constant,
                insertText: 'true',
                detail: 'boolean true',
                documentation: 'Valor verdadero',
                range: range
              },
              {
                label: 'false',
                kind: window.monaco.languages.CompletionItemKind.Constant,
                insertText: 'false',
                detail: 'boolean false',
                documentation: 'Valor falso',
                range: range
              }
            ];

            // ✅ Funciones auxiliares útiles
            const functions = [
              {
                label: 'isEmpty',
                kind: window.monaco.languages.CompletionItemKind.Function,
                insertText: 'isEmpty(${1:value})',
                insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                detail: 'isEmpty(value: any): boolean',
                documentation: 'Verifica si un valor está vacío (null, undefined, "", [], {})',
                range: range
              },
              {
                label: 'isNotEmpty',
                kind: window.monaco.languages.CompletionItemKind.Function,
                insertText: 'isNotEmpty(${1:value})',
                insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                detail: 'isNotEmpty(value: any): boolean',
                documentation: 'Verifica si un valor NO está vacío',
                range: range
              },
              {
                label: 'contains',
                kind: window.monaco.languages.CompletionItemKind.Function,
                insertText: 'contains(${1:text}, ${2:search})',
                insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                detail: 'contains(text: string, search: string): boolean',
                documentation: 'Verifica si un texto contiene una subcadena',
                range: range
              },
              {
                label: 'startsWith',
                kind: window.monaco.languages.CompletionItemKind.Function,
                insertText: 'startsWith(${1:text}, ${2:prefix})',
                insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                detail: 'startsWith(text: string, prefix: string): boolean',
                documentation: 'Verifica si un texto comienza con un prefijo',
                range: range
              },
              {
                label: 'endsWith',
                kind: window.monaco.languages.CompletionItemKind.Function,
                insertText: 'endsWith(${1:text}, ${2:suffix})',
                insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                detail: 'endsWith(text: string, suffix: string): boolean',
                documentation: 'Verifica si un texto termina con un sufijo',
                range: range
              },
              {
                label: 'length',
                kind: window.monaco.languages.CompletionItemKind.Function,
                insertText: 'length(${1:value})',
                insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                detail: 'length(value: any): number',
                documentation: 'Obtiene la longitud de un array, string u objeto',
                range: range
              }
            ];

            // ✅ Snippets útiles para condiciones
            const snippets = [
              {
                label: 'condition-true',
                kind: window.monaco.languages.CompletionItemKind.Snippet,
                insertText: 'return true;',
                detail: 'Always true condition',
                documentation: 'Condición que siempre se cumple',
                range: range,
                sortText: '0_true'
              },
              {
                label: 'condition-false',
                kind: window.monaco.languages.CompletionItemKind.Snippet,
                insertText: 'return false;',
                detail: 'Always false condition',
                documentation: 'Condición que nunca se cumple',
                range: range,
                sortText: '0_false'
              },
              {
                label: 'condition-basic',
                kind: window.monaco.languages.CompletionItemKind.Snippet,
                insertText: 'return ${1:variable} === ${2:"value"};',
                insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                detail: 'Basic condition template',
                documentation: 'Plantilla para condición básica de igualdad',
                range: range
              },
              {
                label: 'condition-and',
                kind: window.monaco.languages.CompletionItemKind.Snippet,
                insertText: 'return ${1:variable1} === ${2:"value1"} && ${3:variable2} === ${4:"value2"};',
                insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                detail: 'AND condition template',
                documentation: 'Plantilla para múltiples condiciones con AND',
                range: range
              },
              {
                label: 'condition-or',
                kind: window.monaco.languages.CompletionItemKind.Snippet,
                insertText: 'return ${1:variable1} === ${2:"value1"} || ${3:variable2} === ${4:"value2"};',
                insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                detail: 'OR condition template',
                documentation: 'Plantilla para condiciones alternativas con OR',
                range: range
              },
              {
                label: 'condition-exists',
                kind: window.monaco.languages.CompletionItemKind.Snippet,
                insertText: 'return ${1:variable} && ${1:variable} !== "";',
                insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                detail: 'Exists condition template',
                documentation: 'Plantilla para verificar que una variable existe y no está vacía',
                range: range
              },
              {
                label: 'condition-array',
                kind: window.monaco.languages.CompletionItemKind.Snippet,
                insertText: 'return Array.isArray(${1:variable}) && ${1:variable}.length > ${2:0};',
                insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                detail: 'Array condition template',
                documentation: 'Plantilla para verificar array no vacío',
                range: range
              }
            ];

            suggestions.push(...keywords, ...functions, ...snippets);

            return { suggestions };
          }
        });

        // ✅ Agregar definiciones de tipos para mejor IntelliSense
        const typeDefinitions = `
          // Variables disponibles en el contexto
          ${processedVariables.map(variable => {
            let type = 'any';
            if (variable.type === 'string') type = 'string';
            else if (variable.type === 'number') type = 'number';
            else if (variable.type === 'boolean') type = 'boolean';
            else if (variable.type === 'array') type = 'any[]';
            else if (variable.type === 'object') type = 'object';
            
            return `declare const ${variable.name.replace(/\./g, '_')}: ${type};`;
          }).join('\n          ')}

          // Funciones auxiliares disponibles
          declare function isEmpty(value: any): boolean;
          declare function isNotEmpty(value: any): boolean;
          declare function contains(text: string, search: string): boolean;
          declare function startsWith(text: string, prefix: string): boolean;
          declare function endsWith(text: string, suffix: string): boolean;
          declare function length(value: any): number;
        `;

        window.monaco.languages.typescript.javascriptDefaults.addExtraLib(
          typeDefinitions,
          'ts:condition-types.d.ts'
        );

        // ✅ Listeners para cambios y validación
        editorRef.current.onDidChangeModelContent(() => {
          const currentValue = editorRef.current.getValue();
          handleScriptChange(currentValue);
        });

        const model = editorRef.current.getModel();
        window.monaco.editor.onDidChangeMarkers(([uri]) => {
          if (model && uri.toString() === model.uri.toString()) {
            const markers = window.monaco.editor.getModelMarkers({ resource: model.uri });
            handleValidationChange(markers);
          }
        });

        setIsMonacoLoaded(true);
        console.log('✅ Monaco Editor for conditions initialized successfully');

      } catch (error) {
        console.error('Error initializing Monaco Editor:', error);
      }
    };

    loadMonaco();

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
        editorRef.current = null;
      }
    };
  }, []);

  // Actualizar valor cuando cambie desde fuera
  useEffect(() => {
    if (editorRef.current && isMonacoLoaded) {
      const currentValue = editorRef.current.getValue();
      if (currentValue !== value && value !== undefined) {
        editorRef.current.setValue(value || 'return true;'); // ✅ CAMBIADO: Usar 'return true;' por defecto
      }
    }
  }, [value, isMonacoLoaded]);

  // ✅ Función de prueba del script
  const handleTest = useCallback(() => {
    if (!onTest || !value) return;
    
    let result;
    try {
      // Funciones auxiliares disponibles en el contexto
      const contextFunctions = {
        isEmpty: (val) => {
          if (Array.isArray(val)) return val.length === 0;
          if (typeof val === 'object' && val !== null) return Object.keys(val).length === 0;
          return !val || val === '';
        },
        isNotEmpty: (val) => {
          if (Array.isArray(val)) return val.length > 0;
          if (typeof val === 'object' && val !== null) return Object.keys(val).length > 0;
          return !!val && val !== '';
        },
        contains: (str, search) => String(str).includes(String(search)),
        startsWith: (str, prefix) => String(str).startsWith(String(prefix)),
        endsWith: (str, suffix) => String(str).endsWith(String(suffix)),
        length: (val) => {
          if (Array.isArray(val) || typeof val === 'string') return val.length;
          if (typeof val === 'object' && val !== null) return Object.keys(val).length;
          return 0;
        }
      };

      // Crear contexto con variables y funciones
      const contextKeys = [...Object.keys(availableVariables), ...Object.keys(contextFunctions)];
      const contextValues = [...Object.values(availableVariables), ...Object.values(contextFunctions)];
      
      // Crear función temporal para probar el script
      const testFunc = new Function(...contextKeys, value);
      const testResult = testFunc(...contextValues);
      
      result = {
        success: true,
        result: Boolean(testResult) // Forzar a boolean
      };
    } catch (error) {
      result = {
        success: false,
        error: error.message,
        result: false
      };
    }
    
    // Crear mensaje detallado
    let message = `🧪 Resultado del Script de Condición\n\n`;
    message += `✅ Éxito: ${result.success ? 'Sí' : 'No'}\n`;
    message += `📊 Resultado: ${result.result}\n`;
    
    if (result.success) {
      message += `\n💡 El script retorna: ${result.result ? 'TRUE' : 'FALSE'}`;
      message += `\n🔄 Esto significa que la condición se ${result.result ? 'CUMPLE' : 'NO cumple'}`;
      message += `\n\n📋 Variables evaluadas: ${Object.keys(availableVariables).length}`;
    } else {
      message += `\n❌ Error: ${result.error}`;
      message += `\n\n💡 Verifica la sintaxis y que uses 'return' al inicio`;
    }
    
    // Llamar callback y mostrar resultado
    onTest(value, result);
    alert(message);
  }, [value, availableVariables, onTest]);

  return (
    <div style={{ 
      border: '2px solid #f59e0b', 
      borderRadius: '8px', 
      overflow: 'hidden',
      background: '#fef3c7'
    }}>
      {/* Header personalizado */}
      <div style={{
        padding: '12px 16px',
        background: '#fef3c7',
        borderBottom: '1px solid #f59e0b',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#d97706'
          }}>
            📜 Script de Condición (Monaco Editor)
          </span>
          <span style={{
            fontSize: '10px',
            background: 'white',
            color: '#92400e',
            padding: '2px 6px',
            borderRadius: '3px',
            border: '1px solid #fbbf24'
          }}>
            Debe retornar true/false
          </span>
          {isMonacoLoaded && (
            <span style={{
              fontSize: '10px',
              background: '#f0fdf4',
              color: '#15803d',
              padding: '2px 6px',
              borderRadius: '3px',
              border: '1px solid #bbf7d0'
            }}>
              ✅ Cargado
            </span>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {/* Indicador de variables */}
          <span style={{
            fontSize: '10px',
            color: '#92400e',
            background: 'white',
            padding: '2px 6px',
            borderRadius: '3px',
            border: '1px solid #fbbf24'
          }}>
            📊 {processedVariables.length} vars
          </span>
          
          {/* Botón de prueba */}
          <button
            onClick={handleTest}
            disabled={!value || !value.trim() || !isMonacoLoaded}
            style={{
              padding: '4px 8px',
              border: '1px solid #16a34a',
              borderRadius: '4px',
              background: (value && value.trim() && isMonacoLoaded) ? '#16a34a' : '#9ca3af',
              color: 'white',
              fontSize: '10px',
              cursor: (value && value.trim() && isMonacoLoaded) ? 'pointer' : 'not-allowed',
              fontWeight: '500'
            }}
          >
            🧪 Probar Script
          </button>
        </div>
      </div>

      {/* Monaco Editor Container */}
      <div style={{ 
        background: 'white',
        minHeight: height,
        position: 'relative'
      }}>
        {!isMonacoLoaded && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '14px'
          }}>
            <div style={{ marginBottom: '8px' }}>🔄 Cargando Monaco Editor...</div>
            <div style={{ fontSize: '12px' }}>
              Esto puede tomar unos segundos la primera vez
            </div>
          </div>
        )}
        <div 
          ref={containerRef}
          style={{
            height: height,
            opacity: isMonacoLoaded ? 1 : 0,
            transition: 'opacity 0.3s'
          }}
        />
      </div>

      {/* Footer con validación */}
      {(markers.length > 0 || localError) && (
        <div style={{
          padding: '8px 12px',
          background: markers.some(m => m.severity === 8) || localError ? '#fef2f2' : '#fffbeb',
          borderTop: '1px solid #f59e0b',
          fontSize: '11px'
        }}>
          {/* Errores */}
          {markers.filter(m => m.severity === 8).length > 0 && (
            <div style={{ marginBottom: '4px' }}>
              <div style={{ color: '#dc2626', fontWeight: '600', marginBottom: '2px' }}>
                ❌ Errores de sintaxis:
              </div>
              {markers.filter(m => m.severity === 8).map((marker, index) => (
                <div key={index} style={{ color: '#dc2626', marginLeft: '12px', fontSize: '10px' }}>
                  • Línea {marker.startLineNumber}: {marker.message}
                </div>
              ))}
            </div>
          )}
          
          {/* Error local */}
          {localError && (
            <div style={{ marginBottom: '4px' }}>
              <div style={{ color: '#d97706', fontWeight: '600', marginBottom: '2px' }}>
                ⚠️ Validación de condición:
              </div>
              <div style={{ color: '#d97706', marginLeft: '12px', fontSize: '10px' }}>
                • {localError}
              </div>
            </div>
          )}
          
          {/* Advertencias */}
          {markers.filter(m => m.severity === 4).length > 0 && (
            <div>
              <div style={{ color: '#d97706', fontWeight: '600', marginBottom: '2px' }}>
                ⚠️ Advertencias:
              </div>
              {markers.filter(m => m.severity === 4).slice(0, 2).map((marker, index) => (
                <div key={index} style={{ color: '#d97706', marginLeft: '12px', fontSize: '10px' }}>
                  • Línea {marker.startLineNumber}: {marker.message}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ayuda rápida */}
      <div style={{
        padding: '6px 12px',
        background: '#f0f9ff',
        borderTop: '1px solid #0ea5e9',
        fontSize: '10px',
        color: '#0369a1'
      }}>
        💡 <strong>Ctrl+Espacio:</strong> Ver variables disponibles • 
        <strong>Obligatorio:</strong> El script debe retornar true o false • 
        <strong>Variables:</strong> {processedVariables.slice(0, 3).map(v => v.name).join(', ')}
        {processedVariables.length > 3 && ` y ${processedVariables.length - 3} más`}
      </div>
    </div>
  );
};

export default MonacoConditionWrapper;