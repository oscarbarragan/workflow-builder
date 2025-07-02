// src/components/workflow/nodes/DataMapper/tabs/SourceTab.jsx - CORREGIDO
import React, { useRef } from 'react';
import { 
  Code, 
  File, 
  Upload, 
  CheckCircle, 
  X, 
  AlertCircle,
  Globe,
  Database
} from 'lucide-react';
import Button from '../../../../common/Button/Button';
import AvailableDataViewer from '../AvailableDataViewer';

const SourceTab = ({ state, actions, availableData = {} }) => {
  const fileInputRef = useRef(null);

  // Extraer información de HTTP Input conectado
  const httpInputInfo = React.useMemo(() => {
    const httpInputKeys = Object.keys(availableData).filter(k => k.startsWith('httpInput_'));
    
    if (httpInputKeys.length === 0) return null;
    
    const httpInputData = availableData[httpInputKeys[0]];
    const headerKeys = Object.keys(availableData).filter(k => k.startsWith('headers.'));
    const hasRequestBody = !!availableData.requestBody;
    
    return {
      endpoint: httpInputData.endpoint,
      method: httpInputData.method,
      path: httpInputData.path,
      headers: headerKeys.map(key => ({
        key: key.replace('headers.', ''),
        variable: key,
        value: availableData[key]
      })),
      hasBody: hasRequestBody,
      bodyVariable: httpInputData.bodyVariable || 'requestBody'
    };
  }, [availableData]);

  const handleFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // ✅ MEJORADO: Container style para scroll correcto
  const containerStyle = {
    display: 'flex', 
    flexDirection: 'column', 
    gap: '20px',
    height: '100%',
    overflow: 'auto', // ✅ AGREGADO: Permitir scroll en el contenido
    paddingRight: '8px' // ✅ AGREGADO: Espacio para la scrollbar
  };

  return (
    <div style={containerStyle}>
      
      {/* HTTP Input Connection Status - SOLO SI ESTÁ CONECTADO */}
      {httpInputInfo && (
        <div style={{
          background: '#f0fdf4',
          border: '2px solid #16a34a',
          borderRadius: '8px',
          padding: '16px',
          flexShrink: 0 // ✅ AGREGADO: Evitar que se encoja
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <Globe size={20} color="#15803d" />
            <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#15803d' }}>
              HTTP Input Detectado
            </h4>
            <CheckCircle size={16} color="#16a34a" />
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            marginBottom: '12px'
          }}>
            <div>
              <div style={{ fontSize: '12px', color: '#15803d', fontWeight: '600' }}>Endpoint:</div>
              <div style={{ 
                fontFamily: 'monospace', 
                fontSize: '11px', 
                background: 'white',
                padding: '4px 8px',
                border: '1px solid #bbf7d0',
                borderRadius: '4px',
                color: '#166534'
              }}>
                {httpInputInfo.method} {httpInputInfo.path}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '12px', color: '#15803d', fontWeight: '600' }}>Body Variable:</div>
              <div style={{ 
                fontFamily: 'monospace', 
                fontSize: '11px', 
                background: 'white',
                padding: '4px 8px',
                border: '1px solid #bbf7d0',
                borderRadius: '4px',
                color: '#166534'
              }}>
                {httpInputInfo.bodyVariable}
              </div>
            </div>
          </div>
          
          {/* Headers disponibles */}
          {httpInputInfo.headers.length > 0 && (
            <div>
              <div style={{ fontSize: '12px', color: '#15803d', fontWeight: '600', marginBottom: '6px' }}>
                Headers Disponibles ({httpInputInfo.headers.length}):
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {httpInputInfo.headers.map(header => (
                  <span
                    key={header.key}
                    style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      background: '#dcfce7',
                      color: '#166534',
                      border: '1px solid #bbf7d0',
                      borderRadius: '4px',
                      fontFamily: 'monospace'
                    }}
                  >
                    {header.key}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div style={{
            marginTop: '12px',
            padding: '8px',
            background: '#ecfdf5',
            borderRadius: '4px',
            fontSize: '11px',
            color: '#15803d'
          }}>
            <strong>📋 Flujo:</strong> El body de este HTTP Input se parseará usando la estructura JSON que definas abajo.
            Los headers estarán disponibles como variables adicionales en el mapeo final.
          </div>
        </div>
      )}

      {/* Source Selection */}
      <div style={{
        background: '#f0f9ff',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #bae6fd',
        flexShrink: 0 // ✅ AGREGADO: Evitar que se encoja
      }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#0c4a6e' }}>
          📋 Definir Estructura del Body JSON
        </h4>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* Manual JSON Option */}
          <button
            onClick={() => actions.handleSourceChange('manual')}
            style={{
              padding: '12px 16px',
              border: `2px solid ${state.selectedSource === 'manual' ? '#7c3aed' : '#e5e7eb'}`,
              borderRadius: '8px',
              background: state.selectedSource === 'manual' ? '#f3e8ff' : 'white',
              color: state.selectedSource === 'manual' ? '#6b21a8' : '#374151',
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
            Escribir JSON Manualmente
            {state.selectedSource === 'manual' && <CheckCircle size={14} color="#16a34a" />}
          </button>
          
          {/* File Upload Option */}
          <button
            onClick={() => actions.handleSourceChange('file')}
            style={{
              padding: '12px 16px',
              border: `2px solid ${state.selectedSource === 'file' ? '#16a34a' : '#e5e7eb'}`,
              borderRadius: '8px',
              background: state.selectedSource === 'file' ? '#f0fdf4' : 'white',
              color: state.selectedSource === 'file' ? '#15803d' : '#374151',
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
            Cargar desde Archivo JSON
            {state.selectedSource === 'file' && <CheckCircle size={14} color="#16a34a" />}
          </button>
        </div>

        <div style={{
          marginTop: '12px',
          padding: '8px 12px',
          background: '#dbeafe',
          border: '1px solid #bfdbfe',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#1e40af'
        }}>
          💡 <strong>Propósito:</strong> Define la estructura JSON que esperas recibir en el body.
          El Data Mapper parseará automáticamente los datos entrantes contra esta estructura.
          {httpInputInfo && (
            <div style={{ marginTop: '4px' }}>
              ✨ <strong>Bonus:</strong> Headers del HTTP Input detectado se incluirán automáticamente como variables.
            </div>
          )}
        </div>
      </div>

      {/* File Upload Section */}
      {state.selectedSource === 'file' && (
        <div style={{ flexShrink: 0 }}> {/* ✅ AGREGADO: Evitar que se encoja */}
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
            📁 Cargar Estructura desde Archivo
          </h4>
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={actions.handleFileUpload}
            style={{ display: 'none' }}
          />
          
          <div style={{
            border: '2px dashed #e5e7eb',
            borderRadius: '8px',
            padding: '20px',
            textAlign: 'center',
            background: '#f9fafb'
          }}>
            {!state.uploadedFile ? (
              <div>
                <Upload size={32} style={{ margin: '0 auto 12px', display: 'block', color: '#6b7280' }} />
                <div style={{ fontSize: '14px', marginBottom: '8px', color: '#374151' }}>
                  Cargar archivo JSON con la estructura esperada
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
                  Ejemplo de estructura que el HTTP Input recibirá en el body
                </div>
                <Button
                  variant="primary"
                  onClick={handleFileSelect}
                  disabled={state.isProcessingFile}
                  loading={state.isProcessingFile}
                >
                  {state.isProcessingFile ? 'Procesando...' : 'Seleccionar Archivo'}
                </Button>
              </div>
            ) : (
              <div>
                <CheckCircle size={32} style={{ margin: '0 auto 12px', display: 'block', color: '#16a34a' }} />
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px', color: '#374151' }}>
                  {state.uploadedFile.name}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
                  {(state.uploadedFile.size / 1024).toFixed(1)} KB
                  {state.uploadedFile.lastModified && (
                    <span> • {new Date(state.uploadedFile.lastModified).toLocaleString()}</span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <Button variant="secondary" size="small" onClick={handleFileSelect}>
                    Cambiar
                  </Button>
                  <Button variant="danger" size="small" icon={<X size={14} />} onClick={actions.clearFile}>
                    Quitar
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          {/* Estado de archivo cargado desde datos guardados */}
          {state.uploadedFile && state.jsonInput && (
            <div style={{
              marginTop: '12px',
              padding: '8px 12px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#15803d'
            }}>
              ✅ <strong>Archivo cargado:</strong> La estructura JSON se cargó correctamente desde este archivo.
              {state.parsedJson && (
                <div style={{ marginTop: '4px' }}>
                  📊 <strong>Campos detectados:</strong> {state.mappings.length} variables para mapear
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* JSON Input - ✅ MEJORADO: Contenedor que se puede expandir */}
      {(state.selectedSource === 'manual' || (state.selectedSource === 'file' && state.uploadedFile)) && (
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          flex: 1, // ✅ AGREGADO: Permitir que este contenedor se expanda
          minHeight: 0 // ✅ AGREGADO: Crucial para flexbox
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
            flexShrink: 0 // ✅ AGREGADO: Evitar que el header se encoja
          }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
              {state.selectedSource === 'file' ? 
                '📁 Estructura desde Archivo' : 
                '📝 Estructura JSON del Body'
              }
              {state.selectedSource === 'file' && state.uploadedFile && (
                <span style={{ 
                  fontSize: '12px', 
                  color: '#16a34a', 
                  fontWeight: 'normal',
                  marginLeft: '8px'
                }}>
                  • {state.uploadedFile.name}
                </span>
              )}
            </h4>
            {state.selectedSource === 'manual' && (
              <Button
                size="small"
                variant="secondary"
                onClick={actions.loadSampleJson}
              >
                Cargar Ejemplo
              </Button>
            )}
          </div>
          
          {/* ✅ MEJORADO: Textarea que usa el espacio disponible */}
          <textarea
            value={state.jsonInput}
            onChange={(e) => state.selectedSource === 'manual' ? actions.handleJsonInput(e.target.value) : null}
            placeholder={
              state.selectedSource === 'file' ? 
                "El contenido del archivo aparecerá aquí..." : 
                "Pega aquí la estructura JSON que esperas recibir en el body..."
            }
            readOnly={state.selectedSource === 'file'}
            style={{
              width: '100%',
              flex: 1, // ✅ CAMBIADO: Usar flex en lugar de minHeight fijo
              minHeight: '200px', // ✅ AGREGADO: Altura mínima
              padding: '12px',
              border: `1px solid ${state.jsonError ? '#dc2626' : '#d1d5db'}`,
              borderRadius: '6px',
              fontSize: '12px',
              fontFamily: 'monospace',
              resize: 'none', // ✅ CAMBIADO: No permitir resize manual
              boxSizing: 'border-box',
              background: state.selectedSource === 'manual' ? 'white' : '#f8fafc',
              cursor: state.selectedSource === 'manual' ? 'text' : 'default'
            }}
          />
          
          {state.jsonError && (
            <div style={{
              color: '#dc2626',
              fontSize: '12px',
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              flexShrink: 0 // ✅ AGREGADO: Evitar que se encoja
            }}>
              <AlertCircle size={14} />
              Error JSON: {state.jsonError}
            </div>
          )}
          
          {state.parsedJson && (
            <div style={{
              color: '#16a34a',
              fontSize: '12px',
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              flexShrink: 0 // ✅ AGREGADO: Evitar que se encoja
            }}>
              <CheckCircle size={14} />
              Estructura válida - {state.mappings.length} campos detectados para mapeo
              {state.uploadedFile && (
                <span style={{ marginLeft: '8px', color: '#6b7280' }}>
                  • Desde: {state.uploadedFile.name}
                </span>
              )}
            </div>
          )}

          {/* Explicación del parsing */}
          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '6px',
            flexShrink: 0 // ✅ AGREGADO: Evitar que se encoja
          }}>
            <div style={{
              fontSize: '13px',
              color: '#1e40af',
              fontWeight: '600',
              marginBottom: '6px'
            }}>
              🔄 Proceso de Parsing:
            </div>
            <ul style={{
              fontSize: '12px',
              color: '#1e40af',
              margin: 0,
              paddingLeft: '16px'
            }}>
              <li><strong>1. HTTP Input recibe datos:</strong> Body + Headers</li>
              <li><strong>2. Data Mapper parsea el body:</strong> Usando esta estructura JSON</li>
              <li><strong>3. Variables finales:</strong> Campos del body + headers disponibles</li>
              <li><strong>4. Salida:</strong> Todas las variables listas para siguientes nodos</li>
            </ul>
          </div>
        </div>
      )}

      {/* Quick Start Guide */}
      {!state.parsedJson && (
        <div style={{
          background: '#fefbf3',
          border: '1px solid #fed7aa',
          borderRadius: '8px',
          padding: '16px',
          flexShrink: 0 // ✅ AGREGADO: Evitar que se encoja
        }}>
          <h5 style={{
            margin: '0 0 8px 0',
            fontSize: '13px',
            color: '#c2410c',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Database size={16} />
            Inicio Rápido
          </h5>
          
          <div style={{ fontSize: '12px', color: '#c2410c', lineHeight: '1.5' }}>
            <div style={{ marginBottom: '8px' }}>
              <strong>1.</strong> Define la estructura JSON que esperas en el body del HTTP Input
            </div>
            <div style={{ marginBottom: '8px' }}>
              <strong>2.</strong> El sistema generará automáticamente los mapeos de campos
            </div>
            <div>
              <strong>3.</strong> Headers del HTTP Input se incluirán como variables adicionales
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SourceTab;