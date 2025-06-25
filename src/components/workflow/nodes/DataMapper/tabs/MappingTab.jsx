// src/components/workflow/nodes/DataMapper/tabs/MappingTab.jsx
import React from 'react';
import { Plus, Trash2, Database, AlertCircle, File, Code, Globe } from 'lucide-react';
import Button from '../../../../common/Button/Button';

const MappingTab = ({ state, actions, dataTypes, getTypeColor }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
          🗂️ Mapeo de Variables ({state.mappings.length})
        </h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            size="small"
            variant="secondary"
            icon={<Database size={14} />}
            onClick={() => {
              if (state.selectedSource === 'http-input' && state.connectedHttpInput) {
                console.log('Regenerating from HTTP Input');
              } else if (state.jsonInput) {
                actions.handleJsonInput(state.jsonInput);
              }
            }}
            disabled={!state.jsonInput && !state.connectedHttpInput}
          >
            Regenerar
          </Button>
          
          <Button
            size="small"
            variant="primary"
            icon={<Plus size={14} />}
            onClick={actions.addCustomMapping}
          >
            Agregar
          </Button>
        </div>
      </div>
      
      <div style={{
        flex: 1,
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        overflow: 'hidden'
      }}>
        {state.mappings.length === 0 ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <Database size={32} style={{ margin: '0 auto 12px', display: 'block' }} />
            <div>No hay datos para mapear</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              {state.selectedSource === 'manual' 
                ? 'Carga un JSON para ver los campos disponibles'
                : state.selectedSource === 'file'
                ? 'Carga un archivo JSON para generar el mapeo'
                : 'Selecciona un HTTP Input para generar el mapeo'
              }
            </div>
          </div>
        ) : (
          <div style={{
            height: '400px',
            overflow: 'auto',
            padding: '8px'
          }}>
            {state.mappings.map((mapping, index) => (
              <div
                key={mapping.id}
                style={{
                  background: mapping.isValid ? '#f9fafb' : '#fef2f2',
                  border: `1px solid ${mapping.isValid ? '#e5e7eb' : '#fecaca'}`,
                  borderRadius: '6px',
                  padding: '12px',
                  marginBottom: '8px'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '8px'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      {mapping.source === 'http-input' && <Globe size={12} />}
                      {mapping.source === 'manual' && <Code size={12} />}
                      {mapping.source === 'file' && <File size={12} />}
                      JSON Path: <code>{mapping.jsonPath || 'custom'}</code>
                    </div>
                    
                    <input
                      type="text"
                      value={mapping.variableName}
                      onChange={(e) => actions.updateMapping(mapping.id, 'variableName', e.target.value)}
                      placeholder="nombre_variable"
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '13px',
                        marginBottom: '8px',
                        boxSizing: 'border-box'
                      }}
                    />
                    
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center'
                    }}>
                      <select
                        value={mapping.dataType}
                        onChange={(e) => actions.updateMapping(mapping.id, 'dataType', e.target.value)}
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '12px',
                          background: 'white'
                        }}
                      >
                        {dataTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      
                      <div style={{
                        fontSize: '11px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: getTypeColor(mapping.jsonType),
                        color: 'white',
                        fontWeight: '500'
                      }}>
                        {mapping.jsonType}
                      </div>
                      
                      {!mapping.isValid && (
                        <AlertCircle size={14} color="#dc2626" title="Tipos incompatibles" />
                      )}
                    </div>
                    
                    {mapping.sourceValue && (
                      <div style={{
                        fontSize: '11px',
                        color: '#6b7280',
                        marginTop: '4px',
                        fontFamily: 'monospace'
                      }}>
                        Valor: {typeof mapping.sourceValue === 'object' 
                          ? JSON.stringify(mapping.sourceValue).substring(0, 50) + '...'
                          : String(mapping.sourceValue).substring(0, 50)
                        }
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => actions.removeMapping(mapping.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px',
                      color: '#dc2626'
                    }}
                    title="Eliminar mapeo"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MappingTab;