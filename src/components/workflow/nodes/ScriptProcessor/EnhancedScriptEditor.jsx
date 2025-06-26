// src/components/workflow/nodes/ScriptProcessor/EnhancedScriptEditor.jsx - VERSIÓN LIMPIA
import React, { useRef, useEffect, useState, useCallback } from 'react';
import { AlertCircle, Lightbulb, Zap } from 'lucide-react';

const EnhancedScriptEditor = ({ 
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
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [currentWord, setCurrentWord] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);

  // ✅ SIMPLIFICADO: Syntax highlighting básico sin problemas
  const highlightSyntax = useCallback((code) => {
    if (!code) return '';
    
    let highlighted = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Keywords de JavaScript
    highlighted = highlighted
      .replace(/\b(function|return|const|let|var|if|else|for|while|do|try|catch|finally|class|extends|import|export|default|async|await|true|false|null|undefined|typeof|instanceof|new|this|super)\b/g, 
        '<span style="color: #c792ea; font-weight: bold;">$1</span>');
    
    // Strings
    highlighted = highlighted
      .replace(/("(?:[^"\\\\]|\\\\.)*")/g, '<span style="color: #c3e88d;">$1</span>')
      .replace(/('(?:[^'\\\\]|\\\\.)*')/g, '<span style="color: #c3e88d;">$1</span>')
      .replace(/(`(?:[^`\\\\]|\\\\.)*`)/g, '<span style="color: #c3e88d;">$1</span>');
    
    // Números
    highlighted = highlighted
      .replace(/\\b(\\d+\\.?\\d*)\\b/g, '<span style="color: #f78c6c;">$1</span>');
    
    // Comentarios
    highlighted = highlighted
      .replace(/(\/\/[^\\r\\n]*)/g, '<span style="color: #546e7a; font-style: italic;">$1</span>')
      .replace(/(\/\\*[\\s\\S]*?\\*\/)/g, '<span style="color: #546e7a; font-style: italic;">$1</span>');
    
    // Console methods
    highlighted = highlighted
      .replace(/\\b(console)\\./g, '<span style="color: #82aaff;">$1</span>.')
      .replace(/\\.(log|error|warn|info|debug|trace)\\b/g, '.<span style="color: #c792ea;">$1</span>');
    
    // Variables disponibles del workflow - MÉTODO SEGURO
    Object.keys(availableData).forEach(varName => {
      if (varName && varName.length > 0) {
        try {
          // Escape especial para nombres de variables seguros
          const safeVarName = varName.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&');
          const regex = new RegExp('\\\\b(' + safeVarName + ')\\\\b', 'g');
          highlighted = highlighted.replace(regex, '<span style="color: #ff6b6b; font-weight: bold; background: rgba(255, 107, 107, 0.15); padding: 1px 3px; border-radius: 3px;">$1</span>');
        } catch (e) {
          console.warn('Error highlighting variable:', varName, e);
        }
      }
    });
    
    return highlighted;
  }, [availableData]);

  // ✅ Obtener palabra actual en cursor
  const getCurrentWord = useCallback((text, position) => {
    const beforeCursor = text.substring(0, position);
    const afterCursor = text.substring(position);
    
    const wordStartMatch = beforeCursor.match(/[a-zA-Z_$][a-zA-Z0-9_.$]*$/);
    const wordStart = wordStartMatch ? wordStartMatch[0] : '';
    
    const wordEndMatch = afterCursor.match(/^[a-zA-Z0-9_.$]*/);
    const wordEnd = wordEndMatch ? wordEndMatch[0] : '';
    
    return {
      fullWord: wordStart + wordEnd,
      beforeWord: wordStart,
      position: position - wordStart.length
    };
  }, []);

  // ✅ Filtrar sugerencias
  const filterSuggestions = useCallback((word, suggestions) => {
    if (!word || word.length < 1) {
      return suggestions.slice(0, 12);
    }
    
    const lowerWord = word.toLowerCase();
    
    const filtered = suggestions.filter(suggestion => {
      const label = suggestion.label.toLowerCase();
      return label.includes(lowerWord) || label.startsWith(lowerWord);
    }).sort((a, b) => {
      const aLabel = a.label.toLowerCase();
      const bLabel = b.label.toLowerCase();
      
      if (aLabel === lowerWord && bLabel !== lowerWord) return -1;
      if (bLabel === lowerWord && aLabel !== lowerWord) return 1;
      
      const aStarts = aLabel.startsWith(lowerWord);
      const bStarts = bLabel.startsWith(lowerWord);
      if (aStarts && !bStarts) return -1;
      if (bStarts && !aStarts) return 1;
      
      if (a.kind === 'variable' && b.kind !== 'variable') return -1;
      if (b.kind === 'variable' && a.kind !== 'variable') return 1;
      
      return a.label.length - b.label.length;
    });
    
    return filtered.slice(0, 15);
  }, []);

  // ✅ Calcular posición del autocompletado
  const calculateAutocompletePosition = useCallback((textarea, cursorPos) => {
    const rect = textarea.getBoundingClientRect();
    const style = window.getComputedStyle(textarea);
    const fontSize = parseInt(style.fontSize, 10);
    const lineHeight = parseInt(style.lineHeight, 10) || fontSize * 1.2;
    
    const textBeforeCursor = script.substring(0, cursorPos);
    const lines = textBeforeCursor.split('\\n');
    const currentLine = lines.length - 1;
    const currentColumn = lines[lines.length - 1].length;
    
    const charWidth = fontSize * 0.6;
    const x = rect.left + 60 + (currentColumn * charWidth);
    const y = rect.top + 50 + (currentLine * lineHeight);
    
    return { x, y };
  }, [script]);

  // ✅ Manejar teclas para autocompletado
  const handleKeyDown = useCallback((e) => {
    // Ctrl+Space para activar autocompletado
    if (e.ctrlKey && e.code === 'Space') {
      e.preventDefault();
      console.log('🔄 Ctrl+Space pressed - triggering autocomplete');
      
      const textarea = textareaRef.current;
      if (!textarea) return;
      
      const position = textarea.selectionStart;
      const wordInfo = getCurrentWord(script, position);
      
      console.log('📝 Current word info:', wordInfo);
      console.log('🎯 Available suggestions:', autocompleteSuggestions.length);
      
      const filtered = filterSuggestions(wordInfo.beforeWord, autocompleteSuggestions);
      console.log('📋 Filtered suggestions:', filtered.length, filtered.map(s => s.label));
      
      if (filtered.length > 0) {
        const pos = calculateAutocompletePosition(textarea, position);
        console.log('📍 Autocomplete position:', pos);
        
        setAutocompletePosition(pos);
        setCurrentWord(wordInfo.beforeWord);
        setFilteredSuggestions(filtered);
        setSelectedIndex(0);
        setShowAutocomplete(true);
        setCursorPosition(wordInfo.position);
        
        console.log('✅ Autocomplete shown');
      } else {
        console.log('❌ No suggestions found');
      }
      return;
    }
    
    // Punto para mostrar propiedades
    if (e.key === '.' && !showAutocomplete) {
      console.log('🔸 Dot pressed - checking for object properties');
      
      setTimeout(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        
        const position = textarea.selectionStart;
        const wordInfo = getCurrentWord(script, position);
        
        console.log('🔸 Word before dot:', wordInfo.beforeWord);
        
        const baseWord = wordInfo.beforeWord.split('.').slice(0, -1).join('.');
        console.log('🔸 Base word for object properties:', baseWord);
        
        const objectSuggestions = autocompleteSuggestions.filter(s => 
          s.label.startsWith(baseWord + '.') && s.label !== baseWord
        );
        
        console.log('🔸 Object suggestions found:', objectSuggestions.length);
        
        if (objectSuggestions.length > 0) {
          const pos = calculateAutocompletePosition(textarea, position);
          setAutocompletePosition(pos);
          setCurrentWord('');
          setFilteredSuggestions(objectSuggestions);
          setSelectedIndex(0);
          setShowAutocomplete(true);
          setCursorPosition(position);
          
          console.log('✅ Object properties shown');
        }
      }, 50);
      return;
    }
    
    // Navegación en autocompletado
    if (showAutocomplete) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredSuggestions.length - 1));
        return;
      }
      
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        return;
      }
      
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        insertSuggestion(filteredSuggestions[selectedIndex]);
        return;
      }
      
      if (e.key === 'Escape') {
        setShowAutocomplete(false);
        return;
      }
    }
  }, [script, showAutocomplete, filteredSuggestions, selectedIndex, autocompleteSuggestions, getCurrentWord, filterSuggestions, calculateAutocompletePosition]);

  // ✅ Insertar sugerencia
  const insertSuggestion = useCallback((suggestion) => {
    if (!suggestion) return;
    
    const textarea = textareaRef.current;
    const beforeCursor = script.substring(0, cursorPosition);
    const afterCursor = script.substring(textarea.selectionStart);
    
    let textToInsert = suggestion.insertText || suggestion.label;
    
    // Limpiar ${} placeholders
    if (textToInsert.includes('${')) {
      textToInsert = textToInsert.replace(/\\$\\{[^}]*\\}/g, '');
    }
    
    const newScript = beforeCursor + textToInsert + afterCursor;
    onScriptChange(newScript);
    setShowAutocomplete(false);
    
    setTimeout(() => {
      const newPosition = cursorPosition + textToInsert.length;
      textarea.setSelectionRange(newPosition, newPosition);
      textarea.focus();
    }, 10);
  }, [script, cursorPosition, onScriptChange]);

  // ✅ Autocompletado mientras se escribe
  const handleInputChange = useCallback((e) => {
    const newScript = e.target.value;
    onScriptChange(newScript);
    
    if (showAutocomplete) {
      const position = e.target.selectionStart;
      const wordInfo = getCurrentWord(newScript, position);
      
      if (wordInfo.beforeWord.length >= 1) {
        const filtered = filterSuggestions(wordInfo.beforeWord, autocompleteSuggestions);
        if (filtered.length > 0) {
          setCurrentWord(wordInfo.beforeWord);
          setFilteredSuggestions(filtered);
          setSelectedIndex(0);
          setCursorPosition(wordInfo.position);
        } else {
          setShowAutocomplete(false);
        }
      } else {
        setShowAutocomplete(false);
      }
    }
  }, [onScriptChange, getCurrentWord, filterSuggestions, autocompleteSuggestions, showAutocomplete]);

  // Sincronizar scroll
  const handleScroll = useCallback((e) => {
    if (highlightRef.current) {
      highlightRef.current.scrollTop = e.target.scrollTop;
      highlightRef.current.scrollLeft = e.target.scrollLeft;
    }
  }, []);

  // Cerrar autocompletado al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showAutocomplete && !e.target.closest('.autocomplete-dropdown')) {
        setShowAutocomplete(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAutocomplete]);

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
          📝 JavaScript Editor
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
            Ctrl+Space: Autocompletado
          </span>
          <span style={{
            background: '#f3f4f6',
            padding: '4px 8px',
            borderRadius: '6px',
            fontFamily: 'monospace'
          }}>
            .: Propiedades
          </span>
        </div>
      </div>
      
      {/* Container del Editor */}
      <div style={{
        flex: 1,
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        background: '#263238',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
        overflow: 'hidden',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header del Archivo */}
        <div style={{
          background: 'linear-gradient(135deg, #37474f 0%, #263238 100%)',
          padding: '12px 16px',
          borderBottom: '1px solid #37474f',
          fontSize: '13px',
          color: '#b0bec5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f56' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }} />
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#27ca3f' }} />
            <span style={{ marginLeft: '8px', fontFamily: 'monospace', fontWeight: '500' }}>script.js</span>
          </div>
          <div style={{ 
            fontSize: '11px', 
            color: '#78909c',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <Zap size={12} />
            {autocompleteSuggestions.length} suggestions available
          </div>
        </div>
        
        {/* Área del Editor */}
        <div style={{
          flex: 1,
          display: 'flex',
          minHeight: 0,
          position: 'relative'
        }}>
          {/* Números de Línea */}
          <div style={{
            background: '#263238',
            borderRight: '1px solid #37474f',
            padding: '16px 8px 16px 16px',
            fontSize: '13px',
            fontFamily: '"Fira Code", "SF Mono", "Monaco", monospace',
            color: '#546e7a',
            lineHeight: '1.5',
            minWidth: '50px',
            textAlign: 'right',
            userSelect: 'none',
            flexShrink: 0,
            overflow: 'hidden'
          }}>
            {script.split('\\n').map((_, index) => (
              <div key={index} style={{ 
                padding: '0 4px',
                borderRadius: '3px',
                transition: 'background 0.1s'
              }}>
                {index + 1}
              </div>
            ))}
          </div>
          
          {/* Área de Código */}
          <div style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            minHeight: 0
          }}>
            {/* Capa de Syntax Highlighting */}
            <div 
              ref={highlightRef}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                padding: '16px',
                fontSize: '14px',
                fontFamily: '"Fira Code", "SF Mono", "Monaco", monospace',
                lineHeight: '1.5',
                whiteSpace: 'pre-wrap',
                overflow: 'auto',
                pointerEvents: 'none',
                userSelect: 'none',
                zIndex: 1,
                color: '#eeffff',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
              dangerouslySetInnerHTML={{
                __html: highlightSyntax(script)
              }}
            />
            
            {/* Textarea Real */}
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
                fontFamily: '"Fira Code", "SF Mono", "Monaco", monospace',
                fontSize: '14px',
                lineHeight: '1.5',
                resize: 'none',
                outline: 'none',
                caretColor: '#ffcc02',
                zIndex: 2,
                whiteSpace: 'pre-wrap',
                overflow: 'auto',
                scrollbarWidth: 'thin',
                scrollbarColor: '#546e7a #263238'
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

      {/* Dropdown de Autocompletado */}
      {showAutocomplete && filteredSuggestions.length > 0 && (
        <div 
          className="autocomplete-dropdown"
          style={{
            position: 'fixed',
            left: Math.min(autocompletePosition.x, window.innerWidth - 350),
            top: Math.min(autocompletePosition.y, window.innerHeight - 200),
            zIndex: 1000000,
            background: 'white',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            maxHeight: '250px',
            width: '320px',
            overflow: 'hidden',
            fontSize: '13px'
          }}
        >
          <div style={{
            background: '#f8fafc',
            padding: '8px 12px',
            borderBottom: '1px solid #e5e7eb',
            fontSize: '11px',
            fontWeight: '600',
            color: '#374151'
          }}>
            💡 Autocompletado ({filteredSuggestions.length})
          </div>
          
          <div style={{ maxHeight: '200px', overflow: 'auto' }}>
            {filteredSuggestions.map((suggestion, index) => (
              <div
                key={index}
                onClick={() => insertSuggestion(suggestion)}
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  background: index === selectedIndex ? '#f3f4f6' : 'transparent',
                  borderBottom: index < filteredSuggestions.length - 1 ? '1px solid #f3f4f6' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'background 0.1s'
                }}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{
                    fontSize: '10px',
                    padding: '3px 6px',
                    borderRadius: '4px',
                    fontWeight: '600',
                    background: suggestion.kind === 'variable' ? '#dbeafe' : 
                              suggestion.kind === 'method' ? '#fef3c7' : 
                              suggestion.kind === 'property' ? '#ecfdf5' : 
                              suggestion.kind === 'keyword' ? '#f3e8ff' : '#f3f4f6',
                    color: suggestion.kind === 'variable' ? '#1e40af' : 
                          suggestion.kind === 'method' ? '#92400e' : 
                          suggestion.kind === 'property' ? '#166534' : 
                          suggestion.kind === 'keyword' ? '#7c3aed' : '#374151'
                  }}>
                    {suggestion.kind === 'variable' ? '🔗' : 
                     suggestion.kind === 'method' ? '⚙️' : 
                     suggestion.kind === 'property' ? '📋' : 
                     suggestion.kind === 'keyword' ? '🔑' : '💫'}
                  </span>
                  <span style={{ 
                    fontFamily: '"Fira Code", monospace', 
                    fontWeight: '500',
                    color: '#1f2937'
                  }}>
                    {suggestion.label}
                  </span>
                </div>
                <span style={{ 
                  fontSize: '11px', 
                  color: '#6b7280',
                  fontStyle: 'italic',
                  maxWidth: '100px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {suggestion.detail}
                </span>
              </div>
            ))}
          </div>
          
          <div style={{
            padding: '8px 12px',
            background: '#f9fafb',
            borderTop: '1px solid #e5e7eb',
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
            <strong>Variables Disponibles en input:</strong>
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
                  border: '1px solid #93c5fd',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  const textarea = textareaRef.current;
                  const position = textarea.selectionStart;
                  const newScript = script.substring(0, position) + varName + script.substring(position);
                  onScriptChange(newScript);
                  setTimeout(() => {
                    textarea.setSelectionRange(position + varName.length, position + varName.length);
                    textarea.focus();
                  }, 10);
                }}
                title={`Click to insert: ${varName}`}
              >
                {varName}
              </span>
            ))}
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

export default EnhancedScriptEditor;