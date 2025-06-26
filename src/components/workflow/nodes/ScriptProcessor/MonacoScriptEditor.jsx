// src/components/workflow/nodes/ScriptProcessor/MonacoScriptEditor.jsx - CON MONACO EDITOR
import React, { useRef, useEffect } from 'react';
import { AlertCircle, Lightbulb, Zap } from 'lucide-react';

const MonacoScriptEditor = ({ 
  script, 
  onScriptChange, 
  executionError,
  availableData = {},
  autocompleteSuggestions = []
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

      // Crear el editor
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

      // Registrar provider de autocompletado
      window.monaco.languages.registerCompletionItemProvider('javascript', {
        provideCompletionItems: (model, position) => {
          console.log('🎯 Monaco completion triggered at position:', position);
          
          const word = model.getWordUntilPosition(position);
          const range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
          };

          const suggestions = [];

          // ✅ Agregar variables del workflow
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

          // ✅ Agregar input como variable especial
          suggestions.push({
            label: 'input',
            kind: window.monaco.languages.CompletionItemKind.Variable,
            insertText: 'input',
            detail: 'object - Datos de entrada del workflow',
            documentation: 'Objeto principal con todos los datos disponibles',
            range: range
          });

          // ✅ Métodos JavaScript comunes
          const jsMethods = [
            { label: 'console.log', kind: window.monaco.languages.CompletionItemKind.Method, insertText: 'console.log(${1:value})', detail: 'Log to console' },
            { label: 'console.error', kind: window.monaco.languages.CompletionItemKind.Method, insertText: 'console.error(${1:value})', detail: 'Error to console' },
            { label: 'JSON.stringify', kind: window.monaco.languages.CompletionItemKind.Method, insertText: 'JSON.stringify(${1:obj}, null, 2)', detail: 'Convert to JSON' },
            { label: 'JSON.parse', kind: window.monaco.languages.CompletionItemKind.Method, insertText: 'JSON.parse(${1:str})', detail: 'Parse JSON' },
            { label: 'Object.keys', kind: window.monaco.languages.CompletionItemKind.Method, insertText: 'Object.keys(${1:obj})', detail: 'Get object keys' },
            { label: 'Object.values', kind: window.monaco.languages.CompletionItemKind.Method, insertText: 'Object.values(${1:obj})', detail: 'Get object values' },
            { label: 'Object.entries', kind: window.monaco.languages.CompletionItemKind.Method, insertText: 'Object.entries(${1:obj})', detail: 'Get key-value pairs' },
            { label: 'typeof', kind: window.monaco.languages.CompletionItemKind.Keyword, insertText: 'typeof ${1:value}', detail: 'Get type' },
            { label: 'new Date', kind: window.monaco.languages.CompletionItemKind.Constructor, insertText: 'new Date(${1:})', detail: 'Create new date' },
            { label: 'Date.now', kind: window.monaco.languages.CompletionItemKind.Method, insertText: 'Date.now()', detail: 'Current timestamp' }
          ];

          jsMethods.forEach(method => {
            suggestions.push({
              ...method,
              range: range,
              insertTextRules: window.monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
            });
          });

          console.log('📋 Monaco suggestions generated:', suggestions.length);
          return { suggestions };
        }
      });

      // Listener para cambios en el contenido
      editorRef.current.onDidChangeModelContent(() => {
        const value = editorRef.current.getValue();
        onScriptChange(value);
      });

      // Configurar validación personalizada
      window.monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
        noSemanticValidation: false,
        noSyntaxValidation: false
      });

      // Agregar tipos personalizados para mejor IntelliSense
      const inputTypeDefinition = `
        declare const input: {
          ${Object.keys(availableData).map(key => {
            const value = availableData[key];
            const type = typeof value === 'object' && value !== null ? 'object' : typeof value;
            return `${key}: ${type};`;
          }).join('\n          ')}
        };
      `;

      window.monaco.languages.typescript.javascriptDefaults.addExtraLib(
        inputTypeDefinition,
        'ts:workflow-types.d.ts'
      );

      console.log('✅ Monaco Editor initialized with', suggestions.length, 'custom suggestions');
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
      {/* Header del Editor */}
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
              <Lightbulb size={12} />
              {Object.keys(availableData).length} variables
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

      {/* Info de Variables Disponibles */}
      {Object.keys(availableData).length > 0 && (
        <div style={{
          marginTop: '12px',
          padding: '12px',
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          border: '1px solid #bfdbfe',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#1e40af'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <Zap size={14} />
            <strong>Variables Disponibles (autocompletado automático):</strong>
          </div>
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '6px',
            maxHeight: '60px',
            overflow: 'auto'
          }}>
            {Object.keys(availableData).map(varName => (
              <span 
                key={varName}
                style={{
                  background: '#dbeafe',
                  color: '#1e40af',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  fontWeight: '500',
                  border: '1px solid #93c5fd'
                }}
                title={`Variable: ${varName} (${typeof availableData[varName]})`}
              >
                {varName}
              </span>
            ))}
          </div>
          <div style={{
            marginTop: '8px',
            fontSize: '10px',
            color: '#6b7280',
            fontStyle: 'italic'
          }}>
            💡 Tip: Escribe "input." para ver todas las propiedades disponibles
          </div>
        </div>
      )}
      
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