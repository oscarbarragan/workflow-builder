// src/components/workflow/nodes/ScriptProcessor/MonacoScriptEditor.jsx - SIN PANEL DE VARIABLES
import React, { useRef, useEffect } from 'react';
import { AlertCircle, Zap } from 'lucide-react';

const MonacoScriptEditor = ({ 
  script, 
  onScriptChange, 
  executionError,
  availableData = {},
  autocompleteSuggestions = [],
  onValidationChange = () => {}
}) => {
  const editorRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Cargar Monaco Editor dinámicamente
    const loadMonaco = async () => {
      // Cargar Monaco desde CDN
      if (!window.monaco) {
        // Crear script tag para cargar Monaco
        const script1 = document.createElement('script');
        script1.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/loader.min.js';
        document.head.appendChild(script1);

        script1.onload = () => {
          window.require.config({ 
            paths: { 
              vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' 
            } 
          });

          window.require(['vs/editor/editor.main'], () => {
            initializeEditor();
          });
        };
      } else {
        initializeEditor();
      }
    };

    const initializeEditor = () => {
      if (!containerRef.current || editorRef.current) return;

      // Configuración completa de Monaco
      editorRef.current = window.monaco.editor.create(containerRef.current, {
        value: script,
        language: 'javascript',
        theme: 'vs-dark',
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        fontFamily: '"Fira Code", "SF Mono", "Monaco", monospace',
        lineNumbers: 'on',
        roundedSelection: false,
        scrollbar: {
          vertical: 'visible',
          horizontal: 'visible',
          useShadows: false,
          verticalHasArrows: false,
          horizontalHasArrows: false,
        },
        overviewRulerLanes: 0,
        hideCursorInOverviewRuler: true,
        renderLineHighlight: 'line',
        selectionHighlight: false,
        occurrencesHighlight: false,
        codeLens: false,
        folding: true,
        foldingHighlight: false,
        unfoldOnClickAfterEndOfLine: false,
        renderWhitespace: 'none',
        renderControlCharacters: false,
        quickSuggestions: {
          other: true,
          comments: false,
          strings: false
        },
        acceptSuggestionOnCommitCharacter: true,
        acceptSuggestionOnEnter: 'on',
        accessibilitySupport: 'off',
        suggestOnTriggerCharacters: true,
        tabCompletion: 'on',
        wordBasedSuggestions: true,
        parameterHints: {
          enabled: true
        }
      });

      // Configurar validación en tiempo real
      window.monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false,
        noSuggestionDiagnostics: false,
        diagnosticCodesToIgnore: [80001]
      });

      // Configuraciones de TypeScript
      window.monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        target: window.monaco.languages.typescript.ScriptTarget.ES2020,
        allowNonTsExtensions: true,
        moduleResolution: window.monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        module: window.monaco.languages.typescript.ModuleKind.CommonJS,
        noEmit: true,
        esModuleInterop: true,
        jsx: window.monaco.languages.typescript.JsxEmit.React,
        reactNamespace: 'React',
        allowJs: true,
        typeRoots: ['node_modules/@types'],
        strict: false,
        noImplicitAny: true,
        strictNullChecks: false,
        strictFunctionTypes: true,
        noImplicitReturns: false,
        noFallthroughCasesInSwitch: true,
        noUnusedLocals: true,
        noUnusedParameters: false,
        noImplicitOverride: false,
        noPropertyAccessFromIndexSignature: true,
        noUncheckedIndexedAccess: false,
        alwaysStrict: true,
        exactOptionalPropertyTypes: false,
        noImplicitThis: true,
        useUnknownInCatchVariables: false
      });

      // Listener para cambios en marcadores
      const model = editorRef.current.getModel();
      const updateMarkers = () => {
        const markers = window.monaco.editor.getModelMarkers({ resource: model.uri });
        console.log('🔍 Monaco markers updated:', markers);
        onValidationChange(markers);
      };

      window.monaco.editor.onDidChangeMarkers(([uri]) => {
        if (model && uri.toString() === model.uri.toString()) {
          updateMarkers();
        }
      });

      // Registrar provider de autocompletado mejorado
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

          // Agregar variables del workflow
          Object.keys(availableData).forEach(varName => {
            suggestions.push({
              label: varName,
              kind: window.monaco.languages.CompletionItemKind.Variable,
              insertText: varName,
              detail: `Variable del workflow: ${typeof availableData[varName]}`,
              documentation: `Variable disponible: ${varName}`,
              range: range
            });

            // Si es un objeto, agregar sus propiedades
            if (availableData[varName] && typeof availableData[varName] === 'object') {
              Object.keys(availableData[varName]).forEach(prop => {
                suggestions.push({
                  label: `${varName}.${prop}`,
                  kind: window.monaco.languages.CompletionItemKind.Property,
                  insertText: `${varName}.${prop}`,
                  detail: `Property: ${typeof availableData[varName][prop]}`,
                  documentation: `Propiedad de ${varName}`,
                  range: range
                });
              });
            }
          });

          // Agregar input como variable especial
          suggestions.push({
            label: 'input',
            kind: window.monaco.languages.CompletionItemKind.Variable,
            insertText: 'input',
            detail: 'object - Datos de entrada del workflow',
            documentation: 'Objeto principal con todos los datos disponibles',
            range: range
          });

          // Métodos JavaScript comunes con snippets
          const jsMethods = [
            { 
              label: 'console.log', 
              kind: window.monaco.languages.CompletionItemKind.Method, 
              insertText: 'console.log(${1:value})', 
              detail: 'Log to console',
              documentation: 'Imprime un mensaje en la consola de debug'
            },
            { 
              label: 'console.error', 
              kind: window.monaco.languages.CompletionItemKind.Method, 
              insertText: 'console.error(${1:value})', 
              detail: 'Error to console',
              documentation: 'Imprime un error en la consola de debug'
            },
            { 
              label: 'JSON.stringify', 
              kind: window.monaco.languages.CompletionItemKind.Method, 
              insertText: 'JSON.stringify(${1:obj}, null, 2)', 
              detail: 'Convert to JSON',
              documentation: 'Convierte un objeto a string JSON'
            },
            { 
              label: 'JSON.parse', 
              kind: window.monaco.languages.CompletionItemKind.Method, 
              insertText: 'JSON.parse(${1:str})', 
              detail: 'Parse JSON',
              documentation: 'Convierte un string JSON a objeto'
            },
            { 
              label: 'Object.keys', 
              kind: window.monaco.languages.CompletionItemKind.Method, 
              insertText: 'Object.keys(${1:obj})', 
              detail: 'Get object keys',
              documentation: 'Obtiene las llaves de un objeto'
            },
            { 
              label: 'toString()', 
              kind: window.monaco.languages.CompletionItemKind.Method, 
              insertText: 'toString()', 
              detail: 'Convert to string (with parentheses)',
              documentation: 'Convierte un valor a string - IMPORTANTE: usar con paréntesis'
            },
            { 
              label: 'return', 
              kind: window.monaco.languages.CompletionItemKind.Snippet, 
              insertText: 'return {\n\t${1:variable}: ${2:value}\n};', 
              detail: 'Return object template',
              documentation: 'Template para retornar un objeto con variables'
            }
          ];

          jsMethods.forEach(method => {
            suggestions.push({
              ...method,
              range: range,
              insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
            });
          });

          return { suggestions };
        }
      });

      // Agregar tipos personalizados para mejor IntelliSense
      const inputTypeDefinition = `
        declare const input: {
          ${Object.keys(availableData).map(key => {
            const value = availableData[key];
            let type = 'any';
            
            if (typeof value === 'string') type = 'string';
            else if (typeof value === 'number') type = 'number';
            else if (typeof value === 'boolean') type = 'boolean';
            else if (Array.isArray(value)) type = 'any[]';
            else if (typeof value === 'object' && value !== null) type = 'object';
            
            // ✅ Convertir user_id a "user.id" para TypeScript
            const displayKey = key.includes('_') ? `"${key.replace(/_/g, '.')}"` : key;
            return `  ${displayKey}: ${type};`;
          }).join('\n')}
        };
        
        declare const console: {
          log(message?: any, ...optionalParams: any[]): void;
          error(message?: any, ...optionalParams: any[]): void;
          warn(message?: any, ...optionalParams: any[]): void;
          info(message?: any, ...optionalParams: any[]): void;
        };
      `;

      window.monaco.languages.typescript.javascriptDefaults.addExtraLib(
        inputTypeDefinition,
        'ts:workflow-types.d.ts'
      );

      // Configurar validación personalizada para errores comunes
      const setupCustomValidation = () => {
        const model = editorRef.current.getModel();
        if (!model) return;
        
        const validateToString = () => {
          const value = model.getValue();
          const lines = value.split('\n');
          const markers = [];
          
          lines.forEach((line, index) => {
            // Detectar .toString sin paréntesis
            const toStringRegex = /\.toString(?!\()/g;
            let match;
            
            while ((match = toStringRegex.exec(line)) !== null) {
              markers.push({
                severity: window.monaco.MarkerSeverity.Error,
                startLineNumber: index + 1,
                startColumn: match.index + 1,
                endLineNumber: index + 1,
                endColumn: match.index + match[0].length + 1,
                message: 'Usa .toString() con paréntesis, no .toString',
                code: 'missing-parentheses',
                source: 'custom-validation'
              });
            }
            
            // Detectar variables no definidas
            const varRegex = /\b(\w+)(?!\s*[:(])/g;
            let varMatch;
            while ((varMatch = varRegex.exec(line)) !== null) {
              const varName = varMatch[1];
              
              const excludeList = ['return', 'console', 'input', 'const', 'let', 'var', 'function', 'if', 'else', 'for', 'while', 'true', 'false', 'null', 'undefined', 'this', 'Object', 'JSON', 'Date', 'Math', 'Array', 'String', 'Number', 'Boolean'];
              
              if (!excludeList.includes(varName) && 
                  !Object.keys(availableData).includes(varName) && 
                  !line.includes(`input.${varName}`) &&
                  !line.includes(`${varName}:`)) {
                
                if (!line.match(new RegExp(`\\b(const|let|var)\\s+${varName}\\b`)) &&
                    !line.match(new RegExp(`${varName}\\s*:`))) {
                  
                  markers.push({
                    severity: window.monaco.MarkerSeverity.Warning,
                    startLineNumber: index + 1,
                    startColumn: varMatch.index + 1,
                    endLineNumber: index + 1,
                    endColumn: varMatch.index + varMatch[0].length + 1,
                    message: `Variable '${varName}' puede no estar definida. ¿Quisiste decir 'input.${varName}'?`,
                    code: 'undefined-variable',
                    source: 'custom-validation'
                  });
                }
              }
            }
          });
          
          window.monaco.editor.setModelMarkers(model, 'custom-validation', markers);
          
          setTimeout(() => {
            const allMarkers = window.monaco.editor.getModelMarkers({ resource: model.uri });
            onValidationChange(allMarkers);
          }, 100);
        };
        
        const contentChangeDisposable = model.onDidChangeContent(() => {
          setTimeout(validateToString, 200);
        });
        
        setTimeout(validateToString, 500);
        
        return () => {
          contentChangeDisposable.dispose();
        };
      };

      setTimeout(() => {
        setupCustomValidation();
      }, 1000);

      // Listener para cambios en el contenido
      editorRef.current.onDidChangeModelContent(() => {
        const value = editorRef.current.getValue();
        onScriptChange(value);
      });

      // Forzar validación inicial
      setTimeout(() => {
        const model = editorRef.current.getModel();
        if (model) {
          window.monaco.editor.setModelLanguage(model, 'javascript');
          
          setTimeout(() => {
            const markers = window.monaco.editor.getModelMarkers({ resource: model.uri });
            onValidationChange(markers);
          }, 200);
        }
      }, 1500);

      console.log('✅ Monaco Editor initialized with enhanced validation');
    };

    loadMonaco();

    return () => {
      if (editorRef.current) {
        editorRef.current.dispose();
        editorRef.current = null;
      }
    };
  }, []);

  // Actualizar el valor del editor cuando cambie el script desde fuera
  useEffect(() => {
    if (editorRef.current && editorRef.current.getValue() !== script) {
      editorRef.current.setValue(script);
    }
  }, [script]);

  return (
    <div style={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: 0,
      position: 'relative'
    }}>
      {/* Header del Editor - SIMPLIFICADO */}
      <div style={{ 
        marginBottom: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h4 style={{ 
          margin: 0, 
          fontSize: '16px', 
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: '#1f2937'
        }}>
          🚀 Monaco Editor (VS Code)
          {Object.keys(availableData).length > 0 && (
            <span style={{
              fontSize: '11px',
              background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
              color: '#1e40af',
              padding: '4px 8px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              border: '1px solid #93c5fd'
            }}>
              <Zap size={12} />
              IntelliSense activo
            </span>
          )}
        </h4>
        
        <div style={{
          fontSize: '11px',
          color: '#6b7280',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{
            background: '#f3f4f6',
            padding: '4px 8px',
            borderRadius: '6px',
            fontFamily: 'monospace'
          }}>
            Ctrl+Space: IntelliSense
          </span>
          <span style={{
            background: '#f3f4f6',
            padding: '4px 8px',
            borderRadius: '6px',
            fontFamily: 'monospace'
          }}>
            .: Auto-propiedades
          </span>
          <span style={{
            background: '#fef3c7',
            color: '#92400e',
            padding: '4px 8px',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '10px'
          }}>
            ⚡ Validación en vivo
          </span>
          
          {/* Botón para forzar validación */}
          <button
            onClick={() => {
              if (editorRef.current) {
                const model = editorRef.current.getModel();
                if (model) {
                  window.monaco.editor.setModelLanguage(model, 'javascript');
                  
                  setTimeout(() => {
                    const markers = window.monaco.editor.getModelMarkers({ resource: model.uri });
                    onValidationChange(markers);
                  }, 100);
                }
              }
            }}
            style={{
              background: '#fef3c7',
              color: '#92400e',
              border: '1px solid #fcd34d',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '10px',
              cursor: 'pointer',
              fontFamily: 'monospace'
            }}
          >
            🔍 Validar
          </button>
        </div>
      </div>
      
      {/* Container del Monaco Editor */}
      <div 
        ref={containerRef}
        style={{
          flex: 1,
          border: '2px solid #e5e7eb',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          minHeight: '400px'
        }}
      />
      
      {/* Error de Ejecución */}
      {executionError && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#dc2626',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px'
        }}>
          <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <strong>Error de Ejecución:</strong>
            <div style={{ 
              marginTop: '4px',
              padding: '8px',
              background: 'rgba(220, 38, 38, 0.1)',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '12px',
              whiteSpace: 'pre-wrap'
            }}>
              {executionError}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonacoScriptEditor;