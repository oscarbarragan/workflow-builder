// src/components/workflow/nodes/DataMapper/tabs/MappingTab.jsx - CORREGIDO
import React from 'react';
import { Plus, Trash2, Database, AlertCircle, Globe, Code2 } from 'lucide-react';
import Button from '../../../../common/Button/Button';

const MappingTab = ({ state, actions, dataTypes, getTypeColor }) => {
  // Separar mappings por fuente
  const bodyMappings = state.mappings.filter(m => m.source !== 'http-header');
  const headerMappings = state.mappings.filter(m => m.source === 'http-header');
  
  const renderMappingCard = (mapping, index, source) => (
    <div
      key={mapping.id}
      style={{
        background: mapping.isValid ? '#f9fafb' : '#fef2f2',
        border: `1px solid ${mapping.isValid ? '#e5e7eb' : '#fecaca'}`,
        borderRadius: '6px',
        padding: '10px',
        marginBottom: '6px'
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '6px'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: '11px',
            color: '#6b7280',
            marginBottom: '3px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {source === 'header' ? (
              <React.Fragment>
                <Globe size={10} />
                <span style={{
                  background: '#dbeafe',
                  color: '#1e40af',
                  padding: '1px 4px',
                  borderRadius: '2px',
                  fontSize: '9px',
                  fontWeight: '600'
                }}>
                  HEADER
                </span>
              </React.Fragment>
            ) : (
              <React.Fragment>
                <Code2 size={10} />
                <span style={{
                  background: '#f3e8ff',
                  color: '#7c3aed',
                  padding: '1px 4px',
                  borderRadius: '2px',
                  fontSize: '9px',
                  fontWeight: '600'
                }}>
                  BODY
                </span>
              </React.Fragment>
            )}
            <code style={{ fontSize: '10px' }}>{mapping.jsonPath || 'custom'}</code>
          </div>
          
          <input
            type="text"
            value={mapping.variableName}
            onChange={(e) => actions.updateMapping(mapping.id, 'variableName', e.target.value)}
            placeholder="nombre_variable"
            style={{
              width: '100%',
              padding: '4px 6px',
              border: '1px solid #d1d5db',
              borderRadius: '3px',
              fontSize: '12px',
              marginBottom: '6px',
              boxSizing: 'border-box'
            }}
          />
          
          <div style={{
            display: 'flex',
            gap: '6px',
            alignItems: 'center'
          }}>
            <select
              value={mapping.dataType}
              onChange={(e) => actions.updateMapping(mapping.id, 'dataType', e.target.value)}
              style={{
                padding: '3px 6px',
                border: '1px solid #d1d5db',
                borderRadius: '3px',
                fontSize: '11px',
                background: 'white',
                flex: 1
              }}
            >
              {dataTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            
            <div style={{
              fontSize: '10px',
              padding: '2px 4px',
              borderRadius: '3px',
              background: getTypeColor(mapping.jsonType),
              color: 'white',
              fontWeight: '500',
              minWidth: '40px',
              textAlign: 'center'
            }}>
              {mapping.jsonType}
            </div>
            
            {!mapping.isValid && (
              <AlertCircle size={12} color="#dc2626" title="Tipos incompatibles" />
            )}
          </div>
          
          {mapping.sourceValue && (
            <div style={{
              fontSize: '10px',
              color: '#6b7280',
              marginTop: '3px',
              fontFamily: 'monospace',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              Valor: {typeof mapping.sourceValue === 'object' 
                ? JSON.stringify(mapping.sourceValue).substring(0, 30) + '...'
                : String(mapping.sourceValue).substring(0, 30)
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
            padding: '2px',
            borderRadius: '3px',
            color: '#dc2626',
            marginLeft: '8px'
          }}
          title="Eliminar mapeo"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '12px',
      height: '100%',
      overflow: 'hidden'
    }}>
      
      {/* Summary Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0
      }}>
        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
          🗂️ Mapeo de Variables
        </h4>
        
        <div style={{
          display: 'flex',
          gap: '6px',
          fontSize: '11px',
          color: '#6b7280'
        }}>
          <span style={{
            background: '#f3e8ff',
            color: '#7c3aed',
            padding: '3px 6px',
            borderRadius: '3px',
            fontWeight: '500'
          }}>
            Body: {bodyMappings.length}
          </span>
          <span style={{
            background: '#dbeafe',
            color: '#1e40af',
            padding: '3px 6px',
            borderRadius: '3px',
            fontWeight: '500'
          }}>
            Headers: {headerMappings.length}
          </span>
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div style={{ 
        flex: 1,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        
        {/* HTTP Input Headers Section */}
        {state.httpInputAnalysis && state.httpInputAnalysis.hasHttpInput && headerMappings.length > 0 && (
          <div style={{ flexShrink: 0 }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '6px'
            }}>
              <h5 style={{
                margin: 0,
                fontSize: '12px',
                fontWeight: '600',
                color: '#1e40af',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Globe size={12} />
                Headers del HTTP Input ({headerMappings.length})
              </h5>
            </div>
            
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '4px',
              padding: '6px',
              marginBottom: '6px'
            }}>
              <div style={{ fontSize: '10px', color: '#1e40af' }}>
                <strong>Endpoint:</strong> {state.httpInputAnalysis.method} {state.httpInputAnalysis.path}
              </div>
            </div>

            <div style={{
              maxHeight: '150px',
              overflow: 'auto',
              border: '1px solid #bfdbfe',
              borderRadius: '4px',
              padding: '6px',
              background: '#fafbff'
            }}>
              {headerMappings.map((mapping, index) => 
                renderMappingCard(mapping, index, 'header')
              )}
            </div>
          </div>
        )}

        {/* JSON Body Fields Section */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px',
            flexShrink: 0
          }}>
            <h5 style={{
              margin: 0,
              fontSize: '12px',
              fontWeight: '600',
              color: '#7c3aed',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Code2 size={12} />
              Campos del Body JSON ({bodyMappings.length})
            </h5>
            
            <div style={{ display: 'flex', gap: '6px' }}>
              <Button
                size="small"
                variant="secondary"
                icon={<Database size={12} />}
                onClick={() => {
                  if (state.jsonInput) {
                    actions.handleJsonInput(state.jsonInput);
                  }
                }}
                disabled={!state.jsonInput}
              >
                Regenerar
              </Button>
              
              <Button
                size="small"
                variant="primary"
                icon={<Plus size={12} />}
                onClick={actions.addCustomMapping}
              >
                Agregar
              </Button>
            </div>
          </div>
          
          <div style={{
            flex: 1,
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {bodyMappings.length === 0 ? (
              <div style={{
                padding: '30px 15px',
                textAlign: 'center',
                color: '#6b7280',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}>
                <Database size={28} style={{ margin: '0 auto 8px', display: 'block' }} />
                <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>
                  No hay campos del body para mapear
                </div>
                <div style={{ fontSize: '11px' }}>
                  Define una estructura JSON en la pestaña "Fuente"
                </div>
              </div>
            ) : (
              <div style={{
                flex: 1,
                overflow: 'auto',
                padding: '6px'
              }}>
                {bodyMappings.map((mapping, index) => 
                  renderMappingCard(mapping, index, 'body')
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Integration Summary - Fixed at bottom */}
      {state.httpInputAnalysis && state.httpInputAnalysis.hasHttpInput && (state.mappings.length > 0) && (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '6px',
          padding: '8px',
          flexShrink: 0
        }}>
          <h6 style={{
            margin: '0 0 4px 0',
            fontSize: '11px',
            fontWeight: '600',
            color: '#15803d'
          }}>
            📋 Resumen del Mapeo
          </h6>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '6px',
            fontSize: '10px',
            color: '#15803d'
          }}>
            <div>
              <strong>Headers:</strong> {headerMappings.filter(m => m.isValid && m.variableName).length}
            </div>
            <div>
              <strong>Body:</strong> {bodyMappings.filter(m => m.isValid && m.variableName).length}
            </div>
            <div>
              <strong>Total:</strong> {state.mappings.filter(m => m.isValid && m.variableName).length}
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {state.mappings.length === 0 && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#6b7280',
          border: '2px dashed #e5e7eb',
          borderRadius: '6px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <Database size={40} style={{ marginBottom: '12px' }} />
          <div style={{ fontSize: '15px', fontWeight: '600', marginBottom: '6px' }}>
            Sin estructura JSON definida
          </div>
          <div style={{ fontSize: '13px', marginBottom: '12px' }}>
            Define la estructura JSON del body para generar los mappings
          </div>
          <div style={{ fontSize: '11px', color: '#9ca3af', lineHeight: '1.4' }}>
            1. Ve a la pestaña "Fuente"<br/>
            2. Define la estructura JSON esperada<br/>
            3. Los mappings se generarán automáticamente
          </div>
        </div>
      )}
    </div>
  );
};

export default MappingTab;