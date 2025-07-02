// src/components/workflow/nodes/ScriptProcessor/InputDataPanel.jsx - CON SCROLL INTERNO
import React from 'react';
import { Database, Copy, ChevronRight, ChevronDown } from 'lucide-react';

const InputDataPanel = ({ 
  expandedData, 
  expandedNodes, 
  onExpandedNodesChange 
}) => {
  const [viewMode, setViewMode] = React.useState('tree'); // 'tree' o 'json'

  const copyInputToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(expandedData, null, 2));
  };

  const renderJsonTree = (obj, path = '', level = 0) => {
    if (obj === null || obj === undefined) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: '#6b7280', fontStyle: 'italic' }}>null</span>
          <span style={{ 
            fontSize: '8px', 
            background: '#f3f4f6', 
            color: '#6b7280', 
            padding: '1px 3px', 
            borderRadius: '2px',
            fontWeight: '500'
          }}>
            null
          </span>
        </span>
      );
    }

    if (typeof obj !== 'object') {
      const getTypeInfo = (value) => {
        if (typeof value === 'string') {
          // Detectar tipos especiales de string
          if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
            return { type: 'datetime', color: '#7c3aed' };
          }
          if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
            return { type: 'date', color: '#7c3aed' };
          }
          if (/@/.test(value)) {
            return { type: 'email', color: '#059669' };
          }
          if (/^https?:\/\//.test(value)) {
            return { type: 'url', color: '#0284c7' };
          }
          return { type: 'string', color: '#16a34a' };
        }
        if (typeof value === 'number') {
          return Number.isInteger(value) 
            ? { type: 'int', color: '#2563eb' }
            : { type: 'float', color: '#2563eb' };
        }
        if (typeof value === 'boolean') {
          return { type: 'bool', color: '#dc2626' };
        }
        return { type: typeof value, color: '#6b7280' };
      };

      const typeInfo = getTypeInfo(obj);
      
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          {/* ✅ Valor con su color */}
          <span style={{ color: typeInfo.color, fontWeight: '500' }}>
            {typeof obj === 'string' ? `"${obj}"` : String(obj)}
          </span>
          {/* ✅ Tipo compacto */}
          <span style={{ 
            fontSize: '8px', 
            background: '#f1f5f9', 
            color: '#475569', 
            padding: '1px 4px', 
            borderRadius: '2px',
            fontWeight: '500',
            fontFamily: 'monospace'
          }}>
            {typeInfo.type}
          </span>
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
              display: 'inline-flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              padding: '2px 0',
              gap: '4px'
            }}
            onClick={() => {
              const newExpanded = new Set(expandedNodes);
              if (isExpanded) {
                newExpanded.delete(nodeKey);
              } else {
                newExpanded.add(nodeKey);
              }
              onExpandedNodesChange(newExpanded);
            }}
          >
            {obj.length > 0 && (
              isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />
            )}
            <span style={{ color: '#7c3aed', fontWeight: '500' }}>
              Array[{obj.length}]
            </span>
            <span style={{ 
              fontSize: '8px', 
              background: '#f1f5f9', 
              color: '#475569', 
              padding: '1px 4px', 
              borderRadius: '2px',
              fontWeight: '500',
              fontFamily: 'monospace'
            }}>
              array
            </span>
          </div>
          {isExpanded && obj.map((item, index) => (
            <div key={index} style={{ marginLeft: 16, marginTop: '2px' }}>
              <span style={{ color: '#6b7280', fontSize: '10px' }}>[{index}]: </span>
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
            display: 'inline-flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            padding: '2px 0',
            gap: '4px'
          }}
          onClick={() => {
            const newExpanded = new Set(expandedNodes);
            if (isExpanded) {
              newExpanded.delete(nodeKey);
            } else {
              newExpanded.add(nodeKey);
            }
            onExpandedNodesChange(newExpanded);
          }}
        >
          {keys.length > 0 && (
            isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />
          )}
          <span style={{ color: '#f59e0b', fontWeight: '500' }}>
            Object{keys.length > 0 ? `{${keys.length}}` : '{}'}
          </span>
          <span style={{ 
            fontSize: '8px', 
            background: '#f1f5f9', 
            color: '#475569', 
            padding: '1px 4px', 
            borderRadius: '2px',
            fontWeight: '500',
            fontFamily: 'monospace'
          }}>
            object
          </span>
        </div>
        {isExpanded && keys.map(key => (
          <div key={key} style={{ marginLeft: 16, padding: '1px 0' }}>
            {/* ✅ Estructura mejorada: nombre, valor, tipo en línea */}
            <span style={{ 
              color: '#1f2937', 
              fontWeight: '600',
              marginRight: '4px'
            }}>
              {key}:
            </span>
            {renderJsonTree(obj[key], `${path}.${key}`, level + 1)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{
      height: '100%', // ✅ Altura completa del contenedor
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: 'white'
    }}>
      {/* ✅ Header fijo con opciones de vista */}
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        padding: '12px 16px',
        color: 'white',
        fontSize: '13px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0 // ✅ No se reduce
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={16} />
          Input Data ({Object.keys(expandedData).length})
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* ✅ Toggle para cambiar vista */}
          <button
            onClick={() => setViewMode(viewMode === 'tree' ? 'json' : 'tree')}
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
            {viewMode === 'tree' ? '📄 JSON' : '🌳 Tree'}
          </button>
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
      </div>

      {/* ✅ Contenido con scroll */}
      <div style={{
        padding: '12px',
        background: '#f8fafc',
        flex: 1, // ✅ Toma el espacio restante
        overflow: 'auto', // ✅ Scroll cuando sea necesario
        fontSize: '12px',
        fontFamily: '"Fira Code", "SF Mono", "Monaco", monospace',
        minHeight: 0 // ✅ Permite que el contenido se reduzca
      }}>
        {Object.keys(expandedData).length > 0 ? (
          viewMode === 'tree' ? (
            // ✅ Vista en árbol con tipos de datos y dot notation
            Object.entries(expandedData).map(([key, value]) => {
              // ✅ Convertir user_id a user.id, user_name a user.name, etc.
              const displayKey = key.includes('_') ? key.replace(/_/g, '.') : key;
              
              return (
                <div key={key} style={{ marginBottom: '8px' }}>
                  <span style={{ 
                    color: '#1f2937', 
                    fontWeight: '600',
                    marginRight: '4px'
                  }}>
                    {displayKey}:
                  </span>
                  {renderJsonTree(value, displayKey, 0)}
                </div>
              );
            })
          ) : (
            // ✅ Vista JSON pura con dot notation
            <pre style={{ 
              margin: 0, 
              whiteSpace: 'pre-wrap',
              color: '#1f2937',
              wordBreak: 'break-word',
              fontSize: '11px',
              lineHeight: '1.4'
            }}>
              {(() => {
                // Transformar las claves para dot notation en JSON view
                const transformedData = {};
                Object.entries(expandedData).forEach(([key, value]) => {
                  const displayKey = key.includes('_') ? key.replace(/_/g, '.') : key;
                  transformedData[displayKey] = value;
                });
                return JSON.stringify(transformedData, null, 2);
              })()}
            </pre>
          )
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
  );
};

export default InputDataPanel;