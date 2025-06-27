// src/components/workflow/nodes/ScriptProcessor/ScriptFooter.jsx
import React from 'react';
import { Info, Settings, Save, Zap } from 'lucide-react';
import Button from '../../../common/Button/Button';

const ScriptFooter = ({ outputSchema, onCancel, onSave }) => {
  return (
    <>
      {/* Output Variables Summary */}
      {outputSchema.filter(v => v.enabled).length > 0 && (
        <div style={{
          marginTop: '20px',
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          border: '2px solid #bbf7d0',
          borderRadius: '12px',
          padding: '16px'
        }}>
          <h5 style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            color: '#15803d',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '600'
          }}>
            <Zap size={16} />
            Variables de Salida Definidas ({outputSchema.filter(v => v.enabled).length})
          </h5>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '12px',
            maxHeight: '120px',
            overflowY: 'auto'
          }}>
            {outputSchema.filter(v => v.enabled && v.name).map((variable) => (
              <div
                key={variable.id}
                style={{
                  fontSize: '12px',
                  padding: '8px 12px',
                  background: '#f0fdf4',
                  color: '#166534',
                  borderRadius: '8px',
                  border: '1px solid #bbf7d0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <strong>{variable.name}</strong>
                  <span style={{ 
                    fontSize: '10px',
                    background: '#dcfce7',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {variable.dataType}
                  </span>
                  <span style={{ 
                    fontSize: '9px',
                    background: variable.source === 'auto-detect' ? '#dbeafe' : '#f3e8ff',
                    color: variable.source === 'auto-detect' ? '#1e40af' : '#7c3aed',
                    padding: '1px 4px',
                    borderRadius: '3px'
                  }}>
                    {variable.source === 'auto-detect' ? 'AUTO' : 'MANUAL'}
                  </span>
                </div>
                {variable.previewValue !== undefined && (
                  <div style={{ 
                    fontSize: '10px',
                    color: '#15803d',
                    fontFamily: 'monospace',
                    background: '#dcfce7',
                    padding: '2px 4px',
                    borderRadius: '3px',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    Preview: {JSON.stringify(variable.previewValue)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '24px',
        paddingTop: '20px',
        borderTop: '2px solid #e5e7eb'
      }}>
        <div style={{
          fontSize: '13px',
          color: '#6b7280',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Info size={14} />
            <span>Define variables en Output Schema • Auto-detección disponible • Preview en tiempo real</span>
          </div>
          {outputSchema.filter(v => v.enabled).length > 0 && (
            <div style={{ 
              color: '#8b5cf6',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Settings size={14} />
              <strong>{outputSchema.filter(v => v.enabled).length}</strong> variables configuradas
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          <Button
            variant="secondary"
            onClick={onCancel}
            size="large"
          >
            ❌ Cancelar
          </Button>
          
          <Button
            variant="primary"
            onClick={onSave}
            size="large"
            icon={<Save size={18} />}
          >
            💾 Guardar Schema
          </Button>
        </div>
      </div>
    </>
  );
};

export default ScriptFooter;