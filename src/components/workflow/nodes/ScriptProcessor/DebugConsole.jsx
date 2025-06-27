// src/components/workflow/nodes/ScriptProcessor/DebugConsole.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const DebugConsole = ({ logs, executionError, onClearLogs }) => {
  const [isExpanded, setIsExpanded] = useState(true); // ✅ CAMBIADO: Expandido por defecto
  const consoleRef = useRef(null);

  // Auto-scroll al final cuando hay nuevos logs
  useEffect(() => {
    if (consoleRef.current && logs.length > 0) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (type) => {
    switch (type) {
      case 'error': return '#ef4444';
      case 'warn': return '#f59e0b';
      case 'info': return '#3b82f6';
      case 'log': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getLogIcon = (type) => {
    switch (type) {
      case 'error': return '❌';
      case 'warn': return '⚠️';
      case 'info': return 'ℹ️';
      case 'log': return '📝';
      default: return '•';
    }
  };

  const totalLogs = logs.length;
  const errorCount = logs.filter(log => log.type === 'error').length;
  const warningCount = logs.filter(log => log.type === 'warn').length;

  return (
    <div style={{
      flex: isExpanded ? '0 0 250px' : '0 0 40px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: 'white',
      transition: 'flex-basis 0.3s ease'
    }}>
      {/* Header colapsable */}
      <div 
        style={{
          background: errorCount > 0 ? 
            'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' :
            warningCount > 0 ?
            'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
            'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
          padding: '8px 12px',
          fontSize: '12px',
          fontWeight: '600',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          flexShrink: 0
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={14} />
          <span>Debug Console</span>
          {totalLogs > 0 && (
            <div style={{ display: 'flex', gap: '8px', fontSize: '10px' }}>
              {errorCount > 0 && (
                <span style={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  padding: '2px 6px', 
                  borderRadius: '3px' 
                }}>
                  ❌ {errorCount}
                </span>
              )}
              {warningCount > 0 && (
                <span style={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  padding: '2px 6px', 
                  borderRadius: '3px' 
                }}>
                  ⚠️ {warningCount}
                </span>
              )}
              <span style={{ 
                background: 'rgba(255,255,255,0.2)', 
                padding: '2px 6px', 
                borderRadius: '3px' 
              }}>
                Total: {totalLogs}
              </span>
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {totalLogs > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearLogs();
              }}
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
              <Trash2 size={10} />
            </button>
          )}
          {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </div>
      </div>
      
      {/* Contenido de la consola */}
      {isExpanded && (
        <div 
          ref={consoleRef}
          style={{
            flex: 1,
            padding: '8px',
            background: '#111827',
            overflow: 'auto',
            fontSize: '11px',
            fontFamily: '"Fira Code", "SF Mono", "Monaco", monospace',
            maxHeight: '200px'
          }}
        >
          {/* Error de ejecución global */}
          {executionError && (
            <div style={{
              color: '#ef4444',
              marginBottom: '8px',
              padding: '6px 8px',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '4px',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                ❌ EXECUTION ERROR:
              </div>
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {executionError}
              </div>
            </div>
          )}
          
          {/* Logs de la aplicación */}
          {logs.length > 0 ? (
            logs.map((log, index) => (
              <div
                key={index}
                style={{
                  color: getLogColor(log.type),
                  marginBottom: '4px',
                  whiteSpace: 'pre-wrap',
                  padding: '2px 0',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '6px'
                }}
              >
                <span style={{ flexShrink: 0, fontSize: '10px' }}>
                  {getLogIcon(log.type)}
                </span>
                <span style={{ color: '#6b7280', fontSize: '9px', flexShrink: 0 }}>
                  [{new Date(log.timestamp).toLocaleTimeString()}]
                </span>
                <span style={{ flex: 1, wordBreak: 'break-word' }}>
                  {log.message}
                </span>
              </div>
            ))
          ) : (
            <div style={{
              color: '#6b7280',
              fontStyle: 'italic',
              textAlign: 'center',
              padding: '20px',
              opacity: 0.7
            }}>
              {totalLogs === 0 ? 
                '📝 Console output will appear here...' : 
                '🧹 Console cleared'
              }
            </div>
          )}
        </div>
      )}
      
      {/* Mini indicador cuando está colapsado */}
      {!isExpanded && totalLogs > 0 && (
        <div style={{
          position: 'absolute',
          top: '8px',
          right: '40px',
          fontSize: '10px',
          color: 'white',
          background: errorCount > 0 ? '#dc2626' : warningCount > 0 ? '#f59e0b' : '#10b981',
          borderRadius: '10px',
          padding: '2px 6px',
          minWidth: '16px',
          textAlign: 'center'
        }}>
          {errorCount > 0 ? errorCount : warningCount > 0 ? warningCount : totalLogs}
        </div>
      )}
    </div>
  );
};

export default DebugConsole;