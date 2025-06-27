// src/components/workflow/nodes/ScriptProcessor/OutputSchemaPanel.jsx
import React from 'react';
import { Settings, Plus, Trash2 } from 'lucide-react';

const OutputSchemaPanel = ({
  outputSchema,
  autoDetectEnabled,
  previewData,
  onSchemaChange,
  onAutoDetectToggle
}) => {
  const updateOutputVariable = (id, updates) => {
    onSchemaChange(prev => prev.map(variable => 
      variable.id === id ? { ...variable, ...updates } : variable
    ));
  };

  const removeOutputVariable = (id) => {
    onSchemaChange(prev => prev.filter(variable => variable.id !== id));
  };

  const addOutputVariable = () => {
    const newVariable = {
      id: Date.now() + Math.random(),
      name: '',
      type: 'manual',
      dataType: 'string',
      description: '',
      enabled: true,
      source: 'manual'
    };
    onSchemaChange(prev => [...prev, newVariable]);
  };

  return (
    <div style={{ flex: '1 1 25%', display: 'flex', flexDirection: 'column', gap: '16px', minHeight: 0 }}>
      <div style={{
        flex: 1,
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        background: 'white',
        minHeight: 0
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
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
            <Settings size={16} />
            Output Schema ({outputSchema.filter(v => v.enabled).length})
          </div>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => onAutoDetectToggle(!autoDetectEnabled)}
              style={{
                background: autoDetectEnabled ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 6px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '10px'
              }}
            >
              {autoDetectEnabled ? '🔍 AUTO' : '⏸️ OFF'}
            </button>
            <button
              onClick={addOutputVariable}
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
              <Plus size={12} />
            </button>
          </div>
        </div>
        
        <div style={{
          flex: 1,
          padding: '12px',
          overflow: 'auto',
          fontSize: '12px'
        }}>
          {outputSchema.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {outputSchema.map((variable) => (
                <div 
                  key={variable.id}
                  style={{
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '10px',
                    background: variable.enabled ? '#f8fafc' : '#f3f4f6'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    <input
                      type="checkbox"
                      checked={variable.enabled}
                      onChange={(e) => updateOutputVariable(variable.id, { enabled: e.target.checked })}
                    />
                    <span style={{
                      fontSize: '10px',
                      background: variable.source === 'auto-detect' ? '#dbeafe' : '#f3e8ff',
                      color: variable.source === 'auto-detect' ? '#1e40af' : '#7c3aed',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: '500'
                    }}>
                      {variable.source === 'auto-detect' ? '🔍 AUTO' : '✋ MANUAL'}
                    </span>
                    <button
                      onClick={() => removeOutputVariable(variable.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#dc2626',
                        cursor: 'pointer',
                        padding: '2px',
                        marginLeft: 'auto'
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Variable name"
                    value={variable.name}
                    onChange={(e) => updateOutputVariable(variable.id, { name: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '4px 6px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '11px',
                      marginBottom: '4px'
                    }}
                  />
                  
                  <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                    <select
                      value={variable.dataType}
                      onChange={(e) => updateOutputVariable(variable.id, { dataType: e.target.value })}
                      style={{
                        flex: 1,
                        padding: '2px 4px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '10px'
                      }}
                    >
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="array">Array</option>
                      <option value="object">Object</option>
                      <option value="date">Date</option>
                    </select>
                  </div>
                  
                  <input
                    type="text"
                    placeholder="Description (optional)"
                    value={variable.description || ''}
                    onChange={(e) => updateOutputVariable(variable.id, { description: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '4px 6px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '10px',
                      marginBottom: '4px'
                    }}
                  />
                  
                  {/* ✅ NUEVO: Campo para valor por defecto/ejemplo */}
                  <input
                    type="text"
                    placeholder="Default/Example value"
                    value={variable.defaultValue || ''}
                    onChange={(e) => updateOutputVariable(variable.id, { defaultValue: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '4px 6px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '10px',
                      marginBottom: '4px',
                      fontFamily: 'monospace'
                    }}
                  />
                  
                  {/* ✅ NUEVO: Botón para insertar en el editor */}
                  <button
                    onClick={() => {
                      if (variable.name) {
                        // Disparar evento personalizado para insertar en el editor
                        window.dispatchEvent(new CustomEvent('insertInEditor', {
                          detail: { 
                            text: variable.name,
                            type: 'variable',
                            suggestion: `// Asignar valor a ${variable.name}\n${variable.name}: ${variable.defaultValue || 'valor'},`
                          }
                        }));
                      }
                    }}
                    disabled={!variable.name}
                    style={{
                      width: '100%',
                      padding: '4px 6px',
                      border: '1px solid #3b82f6',
                      borderRadius: '4px',
                      fontSize: '10px',
                      background: variable.name ? '#dbeafe' : '#f3f4f6',
                      color: variable.name ? '#1e40af' : '#9ca3af',
                      cursor: variable.name ? 'pointer' : 'not-allowed',
                      marginBottom: '4px'
                    }}
                  >
                    📝 Insertar en Editor
                  </button>
                  
                  {variable.previewValue !== undefined && (
                    <div style={{
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '4px',
                      padding: '4px 6px',
                      fontSize: '10px',
                      color: '#166534',
                      fontFamily: 'monospace'
                    }}>
                      Preview: {JSON.stringify(variable.previewValue)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              color: '#6b7280',
              padding: '20px',
              fontStyle: 'italic'
            }}>
              <Settings size={24} style={{ opacity: 0.5, marginBottom: '8px' }} />
              <div>No output variables defined</div>
              <div style={{ fontSize: '10px', marginTop: '4px' }}>
                Add manually or write a return statement
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OutputSchemaPanel;