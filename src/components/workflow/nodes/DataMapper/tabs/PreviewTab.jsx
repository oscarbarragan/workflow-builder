// src/components/workflow/nodes/DataMapper/tabs/PreviewTab.jsx - CORREGIDO
import React from 'react';
import { Globe, Code2, FileText, Database, CheckCircle, AlertTriangle } from 'lucide-react';

const PreviewTab = ({ state, getTypeColor }) => {
  // Separar variables por fuente
  const validMappings = state.mappings.filter(m => m.isValid && m.variableName);
  const headerVariables = validMappings.filter(m => m.source === 'http-header');
  const bodyVariables = validMappings.filter(m => m.source !== 'http-header');

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '16px',
      height: '100%',
      overflow: 'hidden'
    }}>
      
      {/* HTTP Input Connection Status - SOLO SI ESTÁ CONECTADO */}
      {state.httpInputAnalysis?.hasHttpInput && (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '12px',
          flexShrink: 0
        }}>
          <h5 style={{
            margin: '0 0 6px 0',
            fontSize: '13px',
            color: '#15803d',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Globe size={14} />
            HTTP Input Detectado
            <CheckCircle size={12} color="#16a34a" />
          </h5>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            fontSize: '11px'
          }}>
            <div>
              <strong>Endpoint:</strong>
              <div style={{
                fontFamily: 'monospace',
                background: 'white',
                padding: '3px 6px',
                borderRadius: '3px',
                border: '1px solid #bbf7d0',
                marginTop: '2px',
                fontSize: '10px'
              }}>
                {state.httpInputAnalysis.method} {state.httpInputAnalysis.path}
              </div>
            </div>
            
            <div>
              <strong>Body Variable:</strong>
              <div style={{
                background: 'white',
                padding: '3px 6px',
                borderRadius: '3px',
                border: '1px solid #bbf7d0',
                marginTop: '2px',
                fontFamily: 'monospace',
                fontSize: '10px'
              }}>
                {state.httpInputAnalysis.bodyVariable}
              </div>
            </div>
          </div>
          
          <div style={{
            marginTop: '6px',
            fontSize: '10px',
            color: '#15803d',
            fontStyle: 'italic'
          }}>
            El body será parseado usando la estructura JSON definida + headers como variables adicionales
          </div>
        </div>
      )}

      {/* Scrollable Content Area */}
      <div style={{ 
        flex: 1,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        minHeight: 0
      }}>
        
        {/* Variables de Salida */}
        <div>
          <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>
            📤 Variables de Salida ({validMappings.length})
          </h4>
          
          {validMappings.length === 0 ? (
            <div style={{
              padding: '30px 20px',
              textAlign: 'center',
              color: '#6b7280',
              border: '2px dashed #e5e7eb',
              borderRadius: '8px'
            }}>
              <FileText size={32} style={{ margin: '0 auto 12px', display: 'block' }} />
              <div>No hay variables mapeadas</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>
                Define la estructura JSON y configura los mappings
              </div>
            </div>
          ) : (
            <div style={{
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              overflow: 'hidden',
              maxHeight: '400px'
            }}>
              
              {/* Headers Section */}
              {headerVariables.length > 0 && (
                <React.Fragment>
                  <div style={{
                    background: '#dbeafe',
                    padding: '6px 10px',
                    borderBottom: '1px solid #bfdbfe',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#1e40af',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Globe size={12} />
                    Variables de Headers ({headerVariables.length})
                  </div>
                  
                  <div style={{ 
                    padding: '6px',
                    maxHeight: '150px',
                    overflow: 'auto'
                  }}>
                    {headerVariables.map((mapping, index) => (
                      <div
                        key={mapping.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '6px 8px',
                          background: index % 2 === 0 ? '#f9fafb' : 'white',
                          borderRadius: '3px',
                          marginBottom: '3px'
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: '12px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '2px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            mapper.{mapping.variableName}
                          </div>
                          <div style={{
                            fontSize: '10px',
                            color: '#6b7280',
                            fontFamily: 'monospace',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {mapping.jsonPath} → {mapping.dataType}
                          </div>
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          flexShrink: 0
                        }}>
                          <Globe size={10} color="#0ea5e9" />
                          <div style={{
                            fontSize: '9px',
                            padding: '2px 4px',
                            borderRadius: '3px',
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
                </React.Fragment>
              )}
              
              {/* Body Variables Section */}
              {bodyVariables.length > 0 && (
                <React.Fragment>
                  <div style={{
                    background: '#f3e8ff',
                    padding: '6px 10px',
                    borderBottom: headerVariables.length > 0 ? '1px solid #e2e8f0' : '1px solid #ddd6fe',
                    borderTop: headerVariables.length > 0 ? '1px solid #bfdbfe' : 'none',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: '#7c3aed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Code2 size={12} />
                    Variables del Body JSON ({bodyVariables.length})
                  </div>
                  
                  <div style={{ 
                    padding: '6px',
                    maxHeight: '250px',
                    overflow: 'auto'
                  }}>
                    {bodyVariables.map((mapping, index) => (
                      <div
                        key={mapping.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '6px 8px',
                          background: index % 2 === 0 ? '#f9fafb' : 'white',
                          borderRadius: '3px',
                          marginBottom: '3px'
                        }}
                      >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: '12px',
                            fontWeight: '500',
                            color: '#374151',
                            marginBottom: '2px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            mapper.{mapping.variableName}
                          </div>
                          <div style={{
                            fontSize: '10px',
                            color: '#6b7280',
                            fontFamily: 'monospace',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {mapping.jsonPath} → {mapping.dataType}
                          </div>
                        </div>
                        
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          flexShrink: 0
                        }}>
                          <Code2 size={10} color="#7c3aed" />
                          <div style={{
                            fontSize: '9px',
                            padding: '2px 4px',
                            borderRadius: '3px',
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
                </React.Fragment>
              )}
            </div>
          )}
        </div>

        {/* JSON Structure Preview */}
        {state.parsedJson && (
          <div>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '600' }}>
              🔍 Estructura JSON del Body
            </h4>
            
            <div style={{
              background: '#1f2937',
              color: '#e5e7eb',
              padding: '10px',
              borderRadius: '6px',
              fontSize: '10px',
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

        {/* Data Flow Explanation */}
        <div style={{
          background: '#fefbf3',
          border: '1px solid #fed7aa',
          borderRadius: '8px',
          padding: '12px'
        }}>
          <h5 style={{
            margin: '0 0 6px 0',
            fontSize: '12px',
            color: '#c2410c',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Database size={14} />
            Flujo de Datos
          </h5>
          
          <div style={{ fontSize: '11px', color: '#c2410c', lineHeight: '1.4' }}>
            <div style={{ marginBottom: '6px' }}>
              <strong>1. HTTP Input recibe:</strong> Headers + Body JSON
            </div>
            <div style={{ marginBottom: '6px' }}>
              <strong>2. Data Mapper procesa:</strong>
              <ul style={{ margin: '3px 0 0 12px', padding: 0 }}>
                <li>Headers → Variables individuales</li>
                <li>Body → Parseado contra estructura definida</li>
              </ul>
            </div>
            <div style={{ marginBottom: '6px' }}>
              <strong>3. Variables finales:</strong> Todas con prefijo "mapper."
            </div>
            <div>
              <strong>4. Disponibles para:</strong> Layout Designer, Script Processor, etc.
            </div>
          </div>
        </div>

        {/* Variable Usage Example */}
        {validMappings.length > 0 && (
          <div style={{
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            padding: '12px'
          }}>
            <h5 style={{
              margin: '0 0 6px 0',
              fontSize: '12px',
              color: '#0c4a6e',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              💡 Ejemplo de Uso
            </h5>
            
            <div style={{
              background: '#1f2937',
              color: '#e5e7eb',
              padding: '8px',
              borderRadius: '4px',
              fontSize: '10px',
              fontFamily: 'monospace',
              overflow: 'auto'
            }}>
              <div style={{ color: '#9ca3af' }}>// En Layout Designer o Script Processor:</div>
              {validMappings.slice(0, 3).map(mapping => (
                <div key={mapping.id}>
                  {`mapper.${mapping.variableName} // ${mapping.dataType}`}
                </div>
              ))}
              {validMappings.length > 3 && (
                <div style={{ color: '#9ca3af' }}>
                  // ... y {validMappings.length - 3} variables más
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviewTab;