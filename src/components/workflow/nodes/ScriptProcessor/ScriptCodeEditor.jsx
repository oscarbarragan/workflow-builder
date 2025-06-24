// src/components/workflow/nodes/ScriptProcessor/ScriptCodeEditor.jsx
import React, { useCallback } from 'react';
import { AlertCircle } from 'lucide-react';

const ScriptCodeEditor = ({ 
  script, 
  onScriptChange, 
  executionError 
}) => {
  // Función para syntax highlighting
  const highlightSyntax = useCallback((code) => {
    if (!code) return '';
    
    let highlighted = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    highlighted = highlighted
      .replace(/(\/\/[^\r\n]*)/g, '<span style="color: #6A9955; font-style: italic;">$1</span>')
      .replace(/(\/\*[\s\S]*?\*\/)/g, '<span style="color: #6A9955; font-style: italic;">$1</span>')
      .replace(/("(?:[^"\\]|\\.)*")/g, '<span style="color: #CE9178;">$1</span>')
      .replace(/('(?:[^'\\]|\\.)*')/g, '<span style="color: #CE9178;">$1</span>')
      .replace(/(`(?:[^`\\]|\\.)*`)/g, '<span style="color: #CE9178;">$1</span>')
      .replace(/\b(function|return|const|let|var|if|else|for|while|do|try|catch|finally|class|extends|import|export|default|async|await|true|false|null|undefined|typeof|instanceof|new|this|super)\b(?![">])/g, 
        '<span style="color: #569CD6; font-weight: bold;">$1</span>')
      .replace(/\b(\d+\.?\d*)\b(?![">])/g, '<span style="color: #B5CEA8;">$1</span>')
      .replace(/\b(console)(?=\.)(?![">])/g, '<span style="color: #4EC9B0;">$1</span>')
      .replace(/\.(log|error|warn|info|debug|trace)\b(?![">])/g, '.<span style="color: #DCDCAA;">$1</span>')
      .replace(/\.([a-zA-Z_$][a-zA-Z0-9_$]*)\b(?![">])/g, '.<span style="color: #9CDCFE;">$1</span>');
    
    return highlighted;
  }, []);

  return (
    <div style={{ 
      flex: '1 1 60%', 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: 0 
    }}>
      <h4 style={{ 
        margin: '0 0 12px 0', 
        fontSize: '14px', 
        fontWeight: '600' 
      }}>
        📝 Editor de Script (JavaScript)
      </h4>
      
      {/* Editor Container - SCROLL FIXED */}
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
          gap: '8px',
          flexShrink: 0
        }}>
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f57' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ffbd2e' }} />
          <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#28ca42' }} />
          <span style={{ marginLeft: '8px', fontFamily: 'monospace' }}>script.js</span>
        </div>
        
        {/* Editor Body - SYNTAX HIGHLIGHTING + FUNCTIONAL SCROLL */}
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
          
          {/* Code Editor with Syntax Highlighting */}
          <div style={{
            flex: 1,
            position: 'relative',
            overflow: 'hidden',
            minHeight: 0
          }}>
            {/* Syntax Highlighted Background */}
            <div 
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
                scrollbarWidth: 'none', // Hide scrollbar on highlighted layer
                msOverflowStyle: 'none'
              }}
              dangerouslySetInnerHTML={{
                __html: highlightSyntax(script)
              }}
            />
            
            {/* Actual Textarea - TRANSPARENT WITH WORKING SCROLL */}
            <textarea
              value={script}
              onChange={(e) => onScriptChange(e.target.value)}
              onScroll={(e) => {
                // Sync scroll between textarea and highlighted background
                const highlightedDiv = e.target.previousElementSibling;
                if (highlightedDiv) {
                  highlightedDiv.scrollTop = e.target.scrollTop;
                  highlightedDiv.scrollLeft = e.target.scrollLeft;
                }
              }}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                padding: '16px',
                border: 'none',
                background: 'transparent',
                color: 'transparent', // Keep transparent to show highlighting
                fontFamily: '"Fira Code", "Consolas", "Monaco", monospace',
                fontSize: '13px',
                lineHeight: '1.5',
                resize: 'none',
                outline: 'none',
                caretColor: '#ffffff', // Visible cursor
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