// src/components/workflow/nodes/ScriptProcessor/ScriptHeader.jsx
import React from 'react';
import { Code, Lightbulb } from 'lucide-react';

const ScriptHeader = ({ 
  expandedData, 
  outputSchema, 
  executionResult, 
  onClose 
}) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
      borderBottom: '2px solid #e5e7eb',
      paddingBottom: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '12px',
          padding: '8px',
          color: 'white'
        }}>
          <Code size={20} />
        </div>
        <h2 style={{
          margin: 0,
          fontSize: '24px',
          fontWeight: '700',
          color: '#1f2937'
        }}>
          Script Processor
        </h2>
        <span style={{
          fontSize: '11px',
          background: '#e0f2fe',
          color: '#0369a1',
          padding: '4px 8px',
          borderRadius: '6px',
          fontWeight: '500'
        }}>
          Con Output Schema
        </span>
      </div>
      
      <div style={{
        fontSize: '12px',
        color: '#6b7280',
        fontFamily: 'monospace',
        textAlign: 'center',
        background: '#f3f4f6',
        padding: '8px 12px',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <div><strong>Input:</strong> {Object.keys(expandedData).length} variables</div>
        <div><strong>Output Schema:</strong> {outputSchema.filter(v => v.enabled).length} variables</div>
        <div><strong>Status:</strong> {executionResult ? '✅ Executed' : outputSchema.length > 0 ? '📋 Schema Defined' : '⏸️ Ready'}</div>
      </div>
      
      <button 
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '8px',
          color: '#6b7280',
          fontSize: '20px',
          fontWeight: 'bold',
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => e.target.style.background = '#f3f4f6'}
        onMouseOut={(e) => e.target.style.background = 'none'}
      >
        ✕
      </button>
    </div>
  );
};

export default ScriptHeader;