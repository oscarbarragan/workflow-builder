// src/components/workflow/nodes/ScriptProcessor/ScriptCodeEditor.jsx - CON AUTOCOMPLETADO
import React, { useCallback, useRef, useEffect, useState } from 'react';
import { AlertCircle, Lightbulb } from 'lucide-react';

const ScriptCodeEditor = ({ 
  script, 
  onScriptChange, 
  executionError,
  availableData = {},
  autocompleteSuggestions = []
}) => {
  const textareaRef = useRef(null);
  const highlightRef = useRef(null);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompletePosition, setAutocompletePosition] = useState({ x: 0, y: 0 });
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);

  // ✅ NUEVO: Función para syntax highlighting mejorada
  const highlightSyntax = useCallback((code) => {
    if (!code) return '';
    
    let highlighted = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Comentarios
    highlighted = highlighted
      .replace(/(\/\/[^\r\n]*)/g, '<span style="color: #6A9955; font-style: italic;">$1</span>')
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color: #6A9955; font-style: italic;">$1</span>');
    
    // Strings
    highlighted = highlighted
      .replace(/("(?:[^"\\]|\\.)*")/g, '<span style="color: #CE9178;">$1</span>')
      .replace(/('(?:[^'\\]|\\.)*')/g, '<span style="color: #CE9178;">$1</span>')
      .replace(/(`(?:[^`\\]|\\.)*`)/g, '<span style="color: #CE9178;">$1</span>');
    
    // Keywords de JavaScript
    highlighted = highlighted
      .replace(/\b(function|return|const|let|var|if|else|for|while|do|try|catch|finally|class|extends|import|export|default|async|await|true|false|null|undefined|typeof|instanceof|new|this|super)\b(?![">])/g, 
        '<span style="color: #569CD6; font-weight: bold;">$1</span>');
    
    // Números
    highlighted = highlighted
      .replace(/\b(\d+\.?\d*)\b(?![">])/g, '<span style="color: #B5CEA8;">$1</span>');
    
    // Console y métodos especiales
    highlighted = highlighted
      .replace(/\b(console)(?=\.)(?![">])/g, '<span style="color: #4EC9B0;">$1</span>')
      .replace(/\.(log|error|warn|info|debug|trace)\b(?![">])/g, '.<span style="color: #DCDCAA;">$1</span>');
    
    // Variables disponibles del workflow (destacarlas especialmente)
    Object.keys(availableData).forEach(varName => {
      const regex = new RegExp(`\\b(${varName})\\b(?![">])`, 'g');
      highlighted = highlighted.replace(regex, '<span style="color: #FF6B6B; font-weight: bold; background: rgba(255, 107, 107, 0.1);">$1</span>');
    });
    
    // Propiedades generales
    highlighted = highlighted
      .replace(/\.([a-zA-Z_$][a-zA-Z0-9_$]*)\b(?![">])/g, '.<span style="color: #9CDCFE;">$1</span>');
    
    return highlighted;
  }, [availableData]);

  // ✅ NUEVO: Función para obtener la palabra actual en el cursor
  const getCurrentWord = useCallback((text, position) => {
    const beforeCursor = text.substring(0, position);
    const afterCursor = text.substring(position);
    
    // Buscar el inicio de la palabra (letras, números, puntos, guiones bajos)
    const wordStartMatch = beforeCursor.match(/[a-zA-Z_$][a-zA-Z0-9_.$]*$/);
    const wordStart = wordStartMatch ? wordStartMatch[0] : '';
    
    // Buscar el final de la palabra
    const wordEndMatch = afterCursor.match(/^[a-zA-Z0-9_.$]*/);
    const wordEnd = wordEndMatch ? wordEndMatch[0] : '';
    
    return wordStart + wordEnd;
  }, []);

  // ✅ NUEVO: Función para filtrar sugerencias
  const filterSuggestions = useCallback((word, suggestions) => {
    if (!word) return suggestions.slice(0, 10); // Mostrar las primeras 10 si no hay palabra
    
    const filtered = suggestions.filter(suggestion => 
      suggestion.label.toLowerCase().includes(word.toLowerCase())
    ).sort((a, b) => {
      // Priorizar coincidencias exactas al inicio
      const aStartsWith = a.label.toLowerCase().startsWith(word.toLowerCase());
      const bStartsWith = b.label.toLowerCase().startsWith(word.toLowerCase());
      
      if (aStartsWith && !bStartsWith) return -1;
      if (!aStartsWith && bStartsWith) return 1;
      
      // Luego por longitud (más cortas primero)
      return a.label.length - b.label.length;
    });
    
    return filtered.slice(0, 15); // Máximo 15 sugerencias
  }, []);

  // ✅ NUEVO: Manejar Ctrl+Space para mostrar autocompletado
  const handleKeyDown = useCallback((e) => {
    if (e.ctrlKey && e.code === 'Space') {
      e.preventDefault();
      const textarea = textareaRef.current;
      const position = textarea.selectionStart;
      const word = getCurrentWord(script, position);
      const filtered = filterSuggestions(word, autocompleteSuggestions);
      
      if (filtered.length > 0) {
        // Calcular posición del autocompletado
        const rect = textarea.getBoundingClientRect();
        const textBeforeCursor = script.substring(0, position);
        const lines = textBeforeCursor.split('\n');
        const currentLine = lines.length - 1;
        const currentColumn = lines[lines.length - 1].length;
        
        // Estimación aproximada de la posición
        const lineHeight = 20;
        const charWidth = 7.5;
        
        setAutocompletePosition({
          x: rect.left + (currentColumn * charWidth) + 16,
          y: rect.top + (currentLine * lineHeight) + 50
        });
        
        setCurrentWord(word);
        setFilteredSuggestions(filtered);
        setSelectedSuggestionIndex(0);
        setShowAutocomplete(true);
        setCursorPosition(position);
      }
      return;
    }
    
    // Manejar navegación en autocompletado
    if (showAutocomplete) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          Math.min(prev + 1, filteredSuggestions.length - 1)
        );
        return;
      }
      
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => Math.max(prev - 1, 0));
        return;
      }
      
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertSuggestion(filteredSuggestions[selectedSuggestionIndex]);
        return;
      }
      
      if (e.key === 'Escape') {
        setShowAutocomplete(false);
        return;
      }
    }
  }, [script, showAutocomplete, filteredSuggestions, selectedSuggestionIndex, currentWord, autocompleteSuggestions]);

  // ✅ NUEVO: Insertar sugerencia seleccionada
  const insertSuggestion = useCallback((suggestion) => {
    if (!suggestion) return;
    
    const textarea = textareaRef.current;
    const beforeCursor = script.substring(0, cursorPosition);
    const afterCursor = script.substring(cursorPosition);
    
    // Encontrar el inicio de la palabra actual para reemplazarla
    const wordStartMatch = beforeCursor.match(/[a-zA-Z_$][a-zA-Z0-9_.$]*$/);
    const wordStartPosition = wordStartMatch 
      ? cursorPosition - wordStartMatch[0].length 
      : cursorPosition;
    
    const newScript = 
      script.substring(0, wordStartPosition) + 
      suggestion.insertText + 
      script.substring(cursorPosition);
    
    onScriptChange(newScript);
    setShowAutocomplete(false);
    
    // Posicionar cursor después de la inserción
    setTimeout(() => {
      const newPosition = wordStartPosition + suggestion.insertText.length;
      textarea.setSelectionRange(newPosition, newPosition);
      textarea.focus();
    }, 10);
  }, [script, cursorPosition, onScriptChange]);

  // ✅ NUEVO: Manejar cambios en el input para autocompletado automático
  const handleInputChange = useCallback((e) => {
    const newScript = e.target.value;
    onScriptChange(newScript);
    
    // Auto-mostrar sugerencias mientras se escribe
    const position = e.target.selectionStart;
    const word = getCurrentWord(newScript, position);
    
    if (word.length >= 2) { // Mostrar después de 2 caracteres
      const filtered = filterSuggestions(word, autocompleteSuggestions);
      if (filtered.length > 0) {
        setCurrentWord(word);
        setFilteredSuggestions(filtered);
        setSelectedSuggestionIndex(0);
        setCursorPosition(position);
        // No mostrar automáticamente, solo cuando se presiona Ctrl+Space
      }
    } else {
      setShowAutocomplete(false);
    }
  }, [onScriptChange, getCurrentWord, filterSuggestions, autocompleteSuggestions]);

  // ✅ NUEVO: Cerrar autocompletado al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showAutocomplete && !e.target.closest('.autocomplete-container')) {
        setShowAutocomplete(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAutocomplete]);

  // Sincronizar scroll entre textarea y highlight
  const handleScroll = useCallback((e) => {
    if (highlightRef.current) {
      highlightRef.current.scrollTop = e.target.scrollTop;
      highlightRef.current.scrollLeft = e.target.scrollLeft;
    }
  }, []);

  return (
    <div style={{ 
      flex: '1 1 60%', 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: 0,
      position: 'relative'
    }}>
      <h4 style={{ 
        margin: '0 0 12px 0', 
        fontSize: '14px', 
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        📝 Editor de Script (JavaScript)
        {Object.keys(availableData).length > 0 && (
          <span style={{
            fontSize: '10px',
            background: '#e0f2fe',
            color: '#0369a1',
            padding: '2px 6px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Lightbulb size={10} />
            {Object.keys(availableData).length} variables disponibles
          </span>
        )}
      </h4>
      
      {/* Editor Container */}
      <div style={{
        flex: 1,
        border: '1px solid #d1d5db',
        borderRadius: '6px',
        background: '#1e1e1e',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden'
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
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f57' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28ca42' }} />
            <span style={{ marginLeft: '8px', fontFamily: 'monospace' }}>script.js</span>
          </div>
          <div style={{ fontSize: '10px', color: '#888' }}>
            Ctrl+Space para autocompletado
          </div>
        </div>
        
        {/* Editor Body */}
        <div style={{
          flex: 1,
          display: 'flex',
          minHeight: 0,
          position: 'relative'
        }}>
          {/* Line Numbers */}
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
            userSelect: 'none',
            flexShrink: 0,
            overflow: 'hidden'
          }}>
            {script.split('\n').map((_, index) => (
              <div key={index}>{index + 1}</div>
            ))}
          </div>
          
          {/* Code Editor Area */}
          <div style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            minHeight: 0
          }}>
            {/* Syntax Highlighted Background */}
            <div 
              ref={highlightRef}
              className="highlight-layer"
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
                overflow: 'auto',
                pointerEvents: 'none',
                userSelect: 'none',
                zIndex: 1,
                color: '#d4d4d4',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
              dangerouslySetInnerHTML={{
                __html: highlightSyntax(script)
              }}
            />
            
            {/* Actual Textarea */}
            <textarea
              ref={textareaRef}
              value={script}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onScroll={handleScroll}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                padding: '16px',
                border: 'none',
                background: 'transparent',
                color: 'transparent',
                fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
                fontSize: '13px',
                lineHeight: '1.5',
                resize: 'none',
                outline: 'none',
                caretColor: '#ffffff',
                zIndex: 2,
                whiteSpace: 'pre-wrap',
                overflow: 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: '#6b7280 #374151'
              }}
              placeholder=""
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
            />
          </div>
        </div>
      </div>

      {/* ✅ NUEVO: Autocomplete Dropdown */}
      {showAutocomplete && (
        <div 
          className="autocomplete-container"
          style={{
            position: 'fixed',
            left: autocompletePosition.x,
            top: autocompletePosition.y,
            zIndex: 999999,
            background: 'white',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            maxHeight: '200px',
            width: '300px',
            overflow: 'auto',
            fontSize: '12px'
          }}
        >
          {filteredSuggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => insertSuggestion(suggestion)}
              style={{
                padding: '8px 12px',
                cursor: 'pointer',
                background: index === selectedSuggestionIndex ? '#f3f4f6' : 'transparent',
                borderBottom: index < filteredSuggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontSize: '10px',
                  padding: '2px 6px',
                  borderRadius: '3px',
                  background: suggestion.kind === 'variable' ? '#dbeafe' : 
                            suggestion.kind === 'method' ? '#fef3c7' : 
                            suggestion.kind === 'property' ? '#ecfdf5' : '#f3f4f6',
                  color: suggestion.kind === 'variable' ? '#1e40af' : 
                        suggestion.kind === 'method' ? '#92400e' : 
                        suggestion.kind === 'property' ? '#166534' : '#374151',
                  fontWeight: '500'
                }}>
                  {suggestion.kind === 'variable' ? 'VAR' : 
                   suggestion.kind === 'method' ? 'MTH' : 
                   suggestion.kind === 'property' ? 'PROP' : 'GEN'}
                </span>
                <span style={{ fontFamily: 'monospace', fontWeight: '500' }}>
                  {suggestion.label}
                </span>
              </div>
              <span style={{ 
                fontSize: '10px', 
                color: '#6b7280',
                fontStyle: 'italic'
              }}>
                {suggestion.detail}
              </span>
            </div>
          ))}
          
          {filteredSuggestions.length === 0 && (
            <div style={{
              padding: '12px',
              color: '#6b7280',
              fontStyle: 'italic',
              textAlign: 'center'
            }}>
              No hay sugerencias
            </div>
          )}
          
          <div style={{
            padding: '6px 12px',
            background: '#f9fafb',
            borderTop: '1px solid #f3f4f6',
            fontSize: '10px',
            color: '#6b7280',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>↑↓ Navegar</span>
            <span>Enter/Tab Insertar</span>
            <span>Esc Cerrar</span>
          </div>
        </div>
      )}
      
      {/* Variables disponibles info */}
      {Object.keys(availableData).length > 0 && (
        <div style={{
          marginTop: '8px',
          padding: '8px',
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '4px',
          fontSize: '11px',
          color: '#0369a1'
        }}>
          <strong>Variables disponibles:</strong> {Object.keys(availableData).join(', ')}
        </div>
      )}
      
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
  );
};

export default ScriptCodeEditor;