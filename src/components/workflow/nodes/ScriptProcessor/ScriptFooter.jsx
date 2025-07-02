// src/components/workflow/nodes/ScriptProcessor/ScriptFooter.jsx - CON CONSOLA INTEGRADA
import React from 'react';
import { Info, Save } from 'lucide-react';
import Button from '../../../common/Button/Button';
import DebugConsole from './DebugConsole';

const ScriptFooter = ({ 
  outputSchema, 
  onCancel, 
  onSave,
  logs,
  executionError,
  onClearLogs
}) => {
  return (
    <>
      {/* Consola de Debug en el Footer */}
      <div style={{ marginTop: '20px' }}>
        <DebugConsole 
          logs={logs}
          executionError={executionError}
          onClearLogs={onClearLogs}
        />
      </div>

      {/* Footer */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '20px',
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
              gap: '4px',
              fontSize: '12px',
              background: '#f3e8ff',
              padding: '4px 8px',
              borderRadius: '6px',
              border: '1px solid #d8b4fe'
            }}>
              <span>📋</span>
              <strong>{outputSchema.filter(v => v.enabled).length}</strong> 
              <span>variables configuradas</span>
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