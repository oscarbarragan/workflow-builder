// src/components/workflow/nodes/DataMapper/DataMapperTabs.jsx
import React, { useRef } from 'react';
import { 
  Code, 
  File, 
  Globe, 
  Upload, 
  CheckCircle, 
  X, 
  Plus, 
  Trash2, 
  AlertCircle,
  Database,
  FileText,
  Zap,
  Link2
} from 'lucide-react';
import Button from '../../../common/Button/Button';

// SOURCE TAB
export const SourceTab = ({ 
  selectedSource, 
  setSelectedSource,
  availableHttpInputs,
  connectedHttpInput,
  connectToHttpInput,
  uploadedFile,
  setUploadedFile,
  isProcessingFile,
  handleFileUpload,
  clearFile,
  jsonInput,
  handleJsonInput,
  jsonError,
  parsedJson,
  mappings,
  loadSampleJson
}) => {
  const fileInputRef = useRef(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Source Selection */}
      <div style={{
        background: '#f0f9ff',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #bae6fd'
      }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#0c4a6e' }}>
          🔗 Seleccionar Fuente de Datos
        </h4>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setSelectedSource('manual');
              setUploadedFile && setUploadedFile(null);
            }}
            style={{
              padding: '12px 16px',
              border: `2px solid ${selectedSource === 'manual' ? '#3b82f6' : '#e5e7eb'}`,
              borderRadius: '8px',
              background: selectedSource === 'manual' ? '#eff6ff' : 'white',
              color: selectedSource === 'manual' ? '#1e40af' : '#374151',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <Code size={16} />
            Entrada Manual JSON
          </button>
          
          <button
            onClick={() => setSelectedSource('file')}
            style={{
              padding: '12px 16px',
              border: `2px solid ${selectedSource === 'file' ? '#16a34a' : '#e5e7eb'}`,
              borderRadius: '8px',
              background: selectedSource === 'file' ? '#f0fdf4' : 'white',
              color: selectedSource === 'file' ? '#15803d' : '#374151',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <File size={16} />
            Cargar Archivo JSON
          </button>
          
          <button
            onClick={() => setSelectedSource('http-input')}
            disabled={availableHttpInputs.length === 0}
            style={{
              padding: '12px 16px',
              border: `2px solid ${selectedSource === 'http-input' ? '#3b82f6' : '#e5e7eb'}`,
              borderRadius: '8px',
              background: selectedSource === 'http-input' ? '#eff6ff' : 'white',
              color: selectedSource === 'http-input' ? '#1e40af' : availableHttpInputs.length === 0 ? '#9ca3af' : '#374151',
              cursor: availableHttpInputs.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              opacity: availableHttpInputs.length === 0 ? 0.5 : 1
            }}
          >
            <Globe size={16} />
            Desde HTTP Input ({availableHttpInputs.length})
          </button>
        </div>
      </div>

      {/* File Upload Section */}
      {selectedSource === 'file' && (
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
            📁 Cargar Archivo JSON
          </h4>
          
          <div style={{
            border: '2px dashed #e5e7eb',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            background: '#f9fafb'
          }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            
            {!uploadedFile ? (
              <div>
                <Upload size={32} style={{ margin: '0 auto 12px', display: 'block', color: '#6b7280' }} />
                <div style={{ fontSize: '14px', marginBottom: '8px', color: '#374151' }}>
                  Selecciona un archivo JSON
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
                  Formatos soportados: .json (máx. 10MB)
                </div>
                <Button
                  variant="primary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessingFile}
                  loading={isProcessingFile}
                >
                  {isProcessingFile ? 'Procesando...' : 'Seleccionar Archivo'}
                </Button>
              </div>
            ) : (
              <div>
                <CheckCircle size={32} style={{ margin: '0 auto 12px', display: 'block', color: '#16a34a' }} />
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px', color: '#374151' }}>
                  {uploadedFile.name}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                  {(uploadedFile.size / 1024).toFixed(1)} KB • {new Date(uploadedFile.lastModified).toLocaleString()}
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Cambiar
                  </Button>
                  <Button
                    variant="danger"
                    size="small"
                    icon={<X size={14} />}
                    onClick={clearFile}
                  >
                    Quitar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* HTTP Input Selection */}
      {selectedSource === 'http-input' && (
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
            📡 Seleccionar HTTP Input
          </h4>
          
          {availableHttpInputs.length === 0 ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#6b7280',
              border: '2px dashed #e5e7eb',
              borderRadius: '8px'
            }}>
              <Globe size={32} style={{ margin: '0 auto 12px', display: 'block' }} />
              <div style={{ fontSize: '14px', marginBottom: '4px' }}>No hay HTTP Inputs configurados</div>
              <div style={{ fontSize: '12px' }}>
                Primero configura un nodo HTTP Input en el workflow y conéctalo a este Data Mapper
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {availableHttpInputs.map((httpInput, index) => (
                <div
                  key={index}
                  style={{
                    background: connectedHttpInput?.key === httpInput.key ? '#f0fdf4' : '#f9fafb',
                    border: `2px solid ${connectedHttpInput?.key === httpInput.key ? '#16a34a' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => connectToHttpInput(httpInput)}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '4px'
                      }}>
                        {httpInput.method} {httpInput.path}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        fontFamily: 'monospace'
                      }}>
                        {httpInput.endpoint}
                      </div>
                    </div>
                    
                    {connectedHttpInput?.key === httpInput.key && (
                      <CheckCircle size={20} color="#16a34a" />
                    )}
                  </div>
                  
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    <div style={{ marginBottom: '4px' }}>
                      <strong>Descripción:</strong> {httpInput.description || 'Sin descripción'}
                    </div>
                    <div style={{ marginBottom: '4px' }}>
                      <strong>Tipo de contenido:</strong> {httpInput.contentType}
                    </div>
                    <div>
                      <strong>Body habilitado:</strong> {httpInput.enableBodyCapture ? 'Sí' : 'No'}
                      {httpInput.enableBodyCapture && (
                        <span style={{ marginLeft: '8px', color: '#16a34a' }}>
                          (Variable: {httpInput.bodyVariable})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* JSON Input (Manual y File) */}
      {(selectedSource === 'manual' || selectedSource === 'file') && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
              {selectedSource === 'file' ? '📁 JSON desde Archivo' : '📝 Estructura JSON Manual'}
            </h4>
            {selectedSource === 'manual' && (
              <Button
                size="small"
                variant="secondary"
                onClick={loadSampleJson}
              >
                Cargar Ejemplo
              </Button>
            )}
          </div>
          
          <textarea
            value={jsonInput}
            onChange={(e) => handleJsonInput(e.target.value)}
            placeholder={selectedSource === 'file' ? 
              "El contenido del archivo aparecerá aquí..." : 
              "Pega aquí tu estructura JSON..."
            }
            readOnly={selectedSource === 'file'}
            style={{
              width: '100%',
              minHeight: '300px',
              padding: '12px',
              border: `1px solid ${jsonError ? '#dc2626' : '#d1d5db'}`,
              borderRadius: '6px',
              fontSize: '12px',
              fontFamily: 'monospace',
              resize: 'vertical',
              boxSizing: 'border-box',
              background: selectedSource === 'file' ? '#f8fafc' : 'white',
              cursor: selectedSource === 'file' ? 'default' : 'text'
            }}
          />
          
          {jsonError && (
            <div style={{
              color: '#dc2626',
              fontSize: '12px',
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <AlertCircle size={14} />
              Error JSON: {jsonError}
            </div>
          )}
          
          {parsedJson && (
            <div style={{
              color: '#16a34a',
              fontSize: '12px',
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <CheckCircle size={14} />
              JSON válido - {mappings.length} campos detectados
              {selectedSource === 'file' && uploadedFile && (
                <span style={{ marginLeft: '8px', color: '#6b7280' }}>
                  • Desde: {uploadedFile.name}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// MAPPING TAB
export const MappingTab = ({ 
  mappings, 
  updateMapping, 
  removeMapping, 
  addCustomMapping,
  selectedSource,
  connectedHttpInput,
  jsonInput,
  handleJsonInput,
  dataTypes,
  getTypeColor 
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
          🗂️ Mapeo de Variables ({mappings.length})
        </h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            size="small"
            variant="secondary"
            icon={<Database size={14} />}
            onClick={() => {
              if (selectedSource === 'http-input' && connectedHttpInput) {
                // Regenerar desde HTTP Input
                console.log('Regenerating from HTTP Input');
              } else if (jsonInput) {
                handleJsonInput(jsonInput);
              }
            }}
            disabled={!jsonInput && !connectedHttpInput}
          >
            Regenerar
          </Button>
          
          <Button
            size="small"
            variant="primary"
            icon={<Plus size={14} />}
            onClick={addCustomMapping}
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
        {mappings.length === 0 ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <Database size={32} style={{ margin: '0 auto 12px', display: 'block' }} />
            <div>No hay datos para mapear</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              {selectedSource === 'manual' 
                ? 'Carga un JSON para ver los campos disponibles'
                : selectedSource === 'file'
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
            {mappings.map((mapping, index) => (
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
                      onChange={(e) => updateMapping(mapping.id, 'variableName', e.target.value)}
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
                        onChange={(e) => updateMapping(mapping.id, 'dataType', e.target.value)}
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
                    onClick={() => removeMapping(mapping.id)}
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

// PREVIEW TAB
export const PreviewTab = ({ 
  connectedHttpInput, 
  mappings, 
  parsedJson, 
  getTypeColor 
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Connection Info */}
      {connectedHttpInput && (
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
                {connectedHttpInput.method} {connectedHttpInput.path}
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
                {connectedHttpInput.contentType}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Output Variables Preview */}
      <div>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
          📤 Variables de Salida ({mappings.filter(m => m.isValid && m.variableName).length})
        </h4>
        
        {mappings.filter(m => m.isValid && m.variableName).length === 0 ? (
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
              {mappings.filter(m => m.isValid && m.variableName).map((mapping, index) => (
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
      {parsedJson && (
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
              {JSON.stringify(parsedJson, null, 2)}
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