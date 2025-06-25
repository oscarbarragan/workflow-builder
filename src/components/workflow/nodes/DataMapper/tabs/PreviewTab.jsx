// src/components/workflow/nodes/DataMapper/tabs/PreviewTab.jsx
import React from 'react';
import { Link2, FileText, Globe, Code, File } from 'lucide-react';

const PreviewTab = ({ state, getTypeColor }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Connection Info */}
      {state.connectedHttpInput && (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <h5 style={{
            margin: '0 0 8px 0',
            fontSize: '14px',
            color: '#15803d',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Link2 size={16} />
            Conectado a HTTP Input
          </h5>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            fontSize: '12px'
          }}>
            <div>
              <strong>Endpoint:</strong>
              <div style={{
                fontFamily: 'monospace',
                background: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #bbf7d0',
                marginTop: '2px'
              }}>
                {state.connectedHttpInput.method} {state.connectedHttpInput.path}
              </div>
            </div>
            
            <div>
              <strong>Tipo de contenido:</strong>
              <div style={{
                background: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #bbf7d0',
                marginTop: '2px'
              }}>
                {state.connectedHttpInput.contentType}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Output Variables Preview */}
      <div>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
          📤 Variables de Salida ({state.mappings.filter(m => m.isValid && m.variableName).length})
        </h4>
        
        {state.mappings.filter(m => m.isValid && m.variableName).length === 0 ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: '#6b7280',
            border: '2px dashed #e5e7eb',
            borderRadius: '8px'
          }}>
            <FileText size={32} style={{ margin: '0 auto 12px', display: 'block' }} />
            <div>No hay variables mapeadas</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              Configura el mapeo en la pestaña anterior
            </div>
          </div>
        ) : (
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#f3f4f6',
              padding: '8px 12px',
              borderBottom: '1px solid #e5e7eb',
              fontSize: '12px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Variables que estarán disponibles en nodos siguientes
            </div>
            
            <div style={{
              maxHeight: '300px',
              overflow: 'auto',
              padding: '8px'
            }}>
              {state.mappings.filter(m => m.isValid && m.variableName).map((mapping, index) => (
                <div
                  key={mapping.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: index % 2 === 0 ? '#f9fafb' : 'white',
                    borderRadius: '4px',
                    marginBottom: '4px'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '2px'
                    }}>
                      mapper.{mapping.variableName}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#6b7280',
                      fontFamily: 'monospace'
                    }}>
                      {mapping.jsonPath} → {mapping.dataType}
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {mapping.source === 'http-input' && <Globe size={12} color="#0ea5e9" />}
                    {mapping.source === 'manual' && <Code size={12} color="#7c3aed" />}
                    {mapping.source === 'file' && <File size={12} color="#16a34a" />}
                    
                    <div style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: getTypeColor(mapping.dataType),
                      color: 'white',
                      fontWeight: '500'
                    }}>
                      {mapping.dataType}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* JSON Structure Preview */}
      {state.parsedJson && (
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
            🔍 Estructura JSON Detectada
          </h4>
          
          <div style={{
            background: '#1f2937',
            color: '#e5e7eb',
            padding: '12px',
            borderRadius: '6px',
            fontSize: '11px',
            fontFamily: 'monospace',
            maxHeight: '200px',
            overflow: 'auto'
          }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(state.parsedJson, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Integration Guide */}
      <div style={{
        background: '#fefbf3',
        border: '1px solid #fed7aa',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <h5 style={{
          margin: '0 0 8px 0',
          fontSize: '13px',
          color: '#c2410c',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          💡 Guía de Integración
        </h5>
        
        <div style={{ fontSize: '12px', color: '#c2410c', lineHeight: '1.5' }}>
          <div style={{ marginBottom: '8px' }}>
            <strong>1. Flujo de Datos:</strong> HTTP Input → Data Mapper → Otros Nodos
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong>2. Variables:</strong> Todas las variables mapeadas estarán disponibles con el prefijo "mapper."
          </div>
          <div>
            <strong>3. Conexión:</strong> Conecta la salida de este nodo con Script Processor o Layout Designer
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewTab;