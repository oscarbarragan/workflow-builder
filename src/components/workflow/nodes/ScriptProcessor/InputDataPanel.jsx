// src/components/workflow/nodes/ScriptProcessor/InputDataPanel.jsx
import React from 'react';
import { Database, Copy, ChevronRight, ChevronDown } from 'lucide-react';

const InputDataPanel = ({ 
  expandedData, 
  expandedNodes, 
  onExpandedNodesChange 
}) => {
  const copyInputToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(expandedData, null, 2));
  };

  const renderJsonTree = (obj, path = '', level = 0) => {
    if (obj === null || obj === undefined) {
      return <span style={{ color: '#6b7280', fontStyle: 'italic' }}>null</span>;
    }

    if (typeof obj !== 'object') {
      const color = typeof obj === 'string' ? '#16a34a' : 
                   typeof obj === 'number' ? '#2563eb' : 
                   typeof obj === 'boolean' ? '#dc2626' : '#6b7280';
      return (
        <span style={{ color }}>
          {typeof obj === 'string' ? `"${obj}"` : String(obj)}
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
              display: 'flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              padding: '2px 0'
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
            <span style={{ color: '#7c3aed', fontWeight: '500', marginLeft: 4 }}>
              Array[{obj.length}]
            </span>
          </div>
          {isExpanded && obj.map((item, index) => (
            <div key={index} style={{ marginLeft: 16 }}>
              <span style={{ color: '#6b7280' }}>[{index}]: </span>
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
            display: 'flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            padding: '2px 0'
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
          <span style={{ color: '#f59e0b', fontWeight: '500', marginLeft: 4 }}>
            Object{keys.length > 0 ? `{${keys.length}}` : '{}'}
          </span>
        </div>
        {isExpanded && keys.map(key => (
          <div key={key} style={{ marginLeft: 16, padding: '1px 0' }}>
            <span style={{ color: '#1f2937', fontWeight: '500' }}>{key}: </span>
            {renderJsonTree(obj[key], `${path}.${key}`, level + 1)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{
      flex: '0 0 200px',
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: 'white'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        padding: '12px 16px',
        color: 'white',
        fontSize: '13px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={16} />
          Input Data ({Object.keys(expandedData).length})
        </div>
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
      <div style={{
        padding: '12px',
        background: '#f8fafc',
        flex: 1,
        overflow: 'auto',
        fontSize: '12px',
        fontFamily: '"Fira Code", "SF Mono", "Monaco", monospace'
      }}>
        {Object.keys(expandedData).length > 0 ? (
          Object.entries(expandedData).map(([key, value]) => (
            <div key={key} style={{ marginBottom: '8px' }}>
              <span style={{ color: '#1f2937', fontWeight: '600' }}>{key}: </span>
              {renderJsonTree(value, key, 0)}
            </div>
          ))
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