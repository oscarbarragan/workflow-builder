// src/components/workflow/nodes/ScriptProcessor/DebugConsole.jsx - VERSIÓN CORREGIDA
import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

const DebugConsole = ({ logs, executionError, onClearLogs }) => {
  const [isExpanded, setIsExpanded] = useState(false);
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
      height: isExpanded ? '180px' : '36px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: 'white',
      transition: 'height 0.3s ease',
      width: '100%',
      position: 'relative',
      zIndex: 10
    }}>
      {/* Header colapsable */}
      <div 
        style={{
          background: errorCount > 0 ? 
            'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)' :
            warningCount > 0 ?
            'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
            totalLogs > 0 ?
            'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
            'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
          padding: '6px 12px',
          fontSize: '11px',
          fontWeight: '600',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          flexShrink: 0,
          position: 'relative',
          zIndex: 11
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={12} />
          <span>Debug Console</span>
          {totalLogs > 0 && (
            <div style={{ display: 'flex', gap: '6px', fontSize: '9px' }}>
              {errorCount > 0 && (
                <span style={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  padding: '1px 4px', 
                  borderRadius: '3px' 
                }}>
                  ❌ {errorCount}
                </span>
              )}
              {warningCount > 0 && (
                <span style={{ 
                  background: 'rgba(255,255,255,0.2)', 
                  padding: '1px 4px', 
                  borderRadius: '3px' 
                }}>
                  ⚠️ {warningCount}
                </span>
              )}
              <span style={{ 
                background: 'rgba(255,255,255,0.2)', 
                padding: '1px 4px', 
                borderRadius: '3px' 
              }}>
                Total: {totalLogs}
              </span>
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {totalLogs > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearLogs();
              }}
              style={{
                background: 'rgba(255,255,255,0.2)',
                border: 'none',
                borderRadius: '3px',
                padding: '2px 4px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '9px'
              }}
            >
              <Trash2 size={8} />
            </button>
          )}
          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
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
            fontSize: '10px',
            fontFamily: '"Fira Code", "SF Mono", "Monaco", monospace',
            maxHeight: '140px',
            position: 'relative',
            zIndex: 10
          }}
        >
          {/* Error de ejecución global */}
          {executionError && (
            <div style={{
              color: '#ef4444',
              marginBottom: '6px',
              padding: '4px 6px',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '3px',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '2px', fontSize: '9px' }}>
                ❌ EXECUTION ERROR:
              </div>
              <div style={{ whiteSpace: 'pre-wrap', fontSize: '9px' }}>
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
                  marginBottom: '2px',
                  whiteSpace: 'pre-wrap',
                  padding: '1px 0',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '4px'
                }}
              >
                <span style={{ flexShrink: 0, fontSize: '8px' }}>
                  {getLogIcon(log.type)}
                </span>
                <span style={{ color: '#6b7280', fontSize: '8px', flexShrink: 0 }}>
                  [{new Date(log.timestamp).toLocaleTimeString()}]
                </span>
                <span style={{ flex: 1, wordBreak: 'break-word', fontSize: '9px' }}>
                  {log.message}
                </span>
              </div>
            ))
          ) : (
            <div style={{
              color: '#6b7280',
              fontStyle: 'italic',
              textAlign: 'center',
              padding: '15px',
              opacity: 0.7,
              fontSize: '9px'
            }}>
              {totalLogs === 0 ? 
                '📝 Console output will appear here...' : 
                '🧹 Console cleared'
              }
            </div>
          )}
        </div>
      )}
      
      {/* Indicador compacto cuando está colapsado */}
      {!isExpanded && totalLogs > 0 && (
        <div style={{
          position: 'absolute',
          top: '6px',
          right: '35px',
          fontSize: '9px',
          color: 'white',
          background: errorCount > 0 ? '#dc2626' : warningCount > 0 ? '#f59e0b' : '#10b981',
          borderRadius: '8px',
          padding: '1px 4px',
          minWidth: '14px',
          textAlign: 'center',
          zIndex: 12
        }}>
          {errorCount > 0 ? errorCount : warningCount > 0 ? warningCount : totalLogs}
        </div>
      )}
      
      {/* Resumen horizontal cuando está colapsado */}
      {!isExpanded && totalLogs > 0 && (
        <div style={{
          padding: '4px 12px',
          background: '#f8fafc',
          borderTop: '1px solid #e5e7eb',
          fontSize: '9px',
          color: '#6b7280',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'relative',
          zIndex: 11
        }}>
          <span>
            {logs.length > 0 && (
              <>
                {errorCount > 0 && <span style={{color: '#dc2626'}}>❌ {errorCount} </span>}
                {warningCount > 0 && <span style={{color: '#f59e0b'}}>⚠️ {warningCount} </span>}
                <span style={{color: '#10b981'}}>📝 {logs.filter(l => l.type === 'log').length}</span>
              </>
            )}
          </span>
          <span style={{ fontStyle: 'italic' }}>
            {logs.length > 0 ? logs[logs.length - 1].message.substring(0, 50) + '...' : 'Sin logs'}
          </span>
        </div>
      )}
    </div>
  );
};

export default DebugConsole;