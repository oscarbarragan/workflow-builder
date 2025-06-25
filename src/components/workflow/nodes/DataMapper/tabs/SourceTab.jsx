// src/components/workflow/nodes/DataMapper/tabs/SourceTab.jsx
import React, { useRef } from 'react';
import { 
  Code, 
  File, 
  Globe, 
  Upload, 
  CheckCircle, 
  X, 
  AlertCircle,
  AlertTriangle
} from 'lucide-react';
import Button from '../../../../common/Button/Button';
import AvailableDataViewer from '../AvailableDataViewer';

const SourceTab = ({ state, actions, availableData = {} }) => {
  const fileInputRef = useRef(null);

  // DEBUGGING: Agregar logging detallado
  console.log('🔧 SOURCE TAB DEBUG:', {
    selectedSource: state.selectedSource,
    hasHttpInputsAvailable: state.hasHttpInputsAvailable,
    availableHttpInputsCount: state.availableHttpInputs.length,
    connectedHttpInput: state.connectedHttpInput,
    availableHttpInputs: state.availableHttpInputs
  });

  // FIXED: Handle file selection properly
  const handleFileSelect = () => {
    console.log('📁 Opening file selector...');
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Función para manejar la detección forzada
  const handleForceDetection = (availableData) => {
    console.log('🔧 FORCE DETECTION: Starting manual detection...');
    
    // Importar dinámicamente las utilidades
    import('../DataMapperUtils').then(utils => {
      const detectedHttpInputs = utils.getAvailableHttpInputs(availableData);
      console.log('🔧 FORCE DETECTION: Result:', detectedHttpInputs);
      
      if (detectedHttpInputs.length > 0) {
        // Forzar cambio a http-input y conectar
        actions.handleSourceChange('http-input');
        setTimeout(() => {
          actions.connectToHttpInput(detectedHttpInputs[0]);
        }, 200);
        
        alert(`✅ HTTP Input detectado y conectado: ${detectedHttpInputs[0].method} ${detectedHttpInputs[0].path}`);
      } else {
        alert('❌ No se pudo detectar ningún HTTP Input válido en los datos disponibles');
      }
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* NUEVO: Visualizador de datos disponibles */}
      <AvailableDataViewer 
        availableData={availableData}
        onForceDetection={handleForceDetection}
      />

      {/* Source Selection - FLUJO EXCLUSIVO */}
      <div style={{
        background: '#f0f9ff',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #bae6fd'
      }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#0c4a6e' }}>
          🔗 Seleccionar Fuente de Datos (Solo una opción activa)
        </h4>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          {/* HTTP Input Option */}
          <button
            onClick={() => actions.handleSourceChange('http-input')}
            disabled={!state.hasHttpInputsAvailable}
            style={{
              padding: '12px 16px',
              border: `2px solid ${state.selectedSource === 'http-input' ? '#3b82f6' : '#e5e7eb'}`,
              borderRadius: '8px',
              background: state.selectedSource === 'http-input' ? '#eff6ff' : 
                          !state.hasHttpInputsAvailable ? '#f3f4f6' : 'white',
              color: state.selectedSource === 'http-input' ? '#1e40af' : 
                     !state.hasHttpInputsAvailable ? '#9ca3af' : '#374151',
              cursor: !state.hasHttpInputsAvailable ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              opacity: !state.hasHttpInputsAvailable ? 0.5 : 1
            }}
          >
            <Globe size={16} />
            Desde HTTP Input ({state.availableHttpInputs.length})
            {state.selectedSource === 'http-input' && <CheckCircle size={14} color="#16a34a" />}
          </button>
          
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
            Entrada Manual JSON
            {state.selectedSource === 'manual' && <CheckCircle size={14} color="#16a34a" />}
          </button>
          
          {/* File Upload Option - FIXED */}
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
            Cargar Archivo JSON
            {state.selectedSource === 'file' && <CheckCircle size={14} color="#16a34a" />}
          </button>
        </div>

        {/* Warning when no HTTP Inputs available */}
        {!state.hasHttpInputsAvailable && (
          <div style={{
            marginTop: '12px',
            padding: '8px 12px',
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#92400e',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <AlertTriangle size={14} />
            Sin HTTP Inputs conectados. Conecta un HTTP Input primero o usa entrada manual.
            
            {/* DEBUGGING: Botón temporal para forzar re-detección */}
            <button
              onClick={() => {
                console.log('🔧 FORCE DEBUG: Current state:', state);
                console.log('🔧 FORCE DEBUG: Available HTTP Inputs:', state.availableHttpInputs);
                
                // Llamar directamente a la función de detección
                const { getAvailableHttpInputs } = require('../DataMapperUtils');
                const debugHttpInputs = getAvailableHttpInputs(window.lastAvailableData || {});
                console.log('🔧 FORCE DEBUG: Manual detection result:', debugHttpInputs);
                
                // Forzar la selección de HTTP Input si hay datos disponibles
                if (state.availableHttpInputs.length > 0) {
                  actions.handleSourceChange('http-input');
                  if (state.availableHttpInputs.length === 1) {
                    setTimeout(() => actions.connectToHttpInput(state.availableHttpInputs[0]), 100);
                  }
                } else if (debugHttpInputs.length > 0) {
                  console.log('🔧 FORCE DEBUG: Found HTTP Inputs manually, trying to connect...');
                  actions.handleSourceChange('http-input');
                  setTimeout(() => actions.connectToHttpInput(debugHttpInputs[0]), 100);
                }
              }}
              style={{
                marginLeft: '8px',
                padding: '4px 8px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              🔧 Force Detect
            </button>
            
            {/* SUPER DEBUG: Botón para logging completo */}
            <button
              onClick={() => {
                // Guardar datos para debugging
                window.lastAvailableData = window.lastAvailableData || {};
                
                console.log('🚨 SUPER DEBUG: Full debugging session');
                console.log('🚨 SUPER DEBUG: State:', state);
                console.log('🚨 SUPER DEBUG: Actions:', Object.keys(actions));
                console.log('🚨 SUPER DEBUG: Available data from window:', window.lastAvailableData);
                
                // Intentar importar y ejecutar detección directamente
                import('../DataMapperUtils').then(utils => {
                  console.log('🚨 SUPER DEBUG: Utils loaded:', Object.keys(utils));
                  const result = utils.getAvailableHttpInputs(window.lastAvailableData || {});
                  console.log('🚨 SUPER DEBUG: Direct detection result:', result);
                  
                  if (result.length > 0) {
                    alert(`🚨 Found ${result.length} HTTP Inputs directly! Check console.`);
                  } else {
                    alert('🚨 No HTTP Inputs found even with direct detection. Check available data.');
                  }
                });
              }}
              style={{
                marginLeft: '4px',
                padding: '4px 8px',
                background: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '10px',
                cursor: 'pointer'
              }}
            >
              🚨 Super Debug
            </button>
          </div>
        )}
      </div>

      {/* HTTP Input Selection - SOLO CUANDO ESTÁ SELECCIONADO */}
      {state.selectedSource === 'http-input' && (
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
            📡 HTTP Input Conectado
          </h4>
          
          {state.availableHttpInputs.length === 0 ? (
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
              {state.availableHttpInputs.map((httpInput, index) => (
                <div
                  key={index}
                  style={{
                    background: state.connectedHttpInput?.key === httpInput.key ? '#f0fdf4' : '#f9fafb',
                    border: `2px solid ${state.connectedHttpInput?.key === httpInput.key ? '#16a34a' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => actions.connectToHttpInput(httpInput)}
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
                    
                    {state.connectedHttpInput?.key === httpInput.key && (
                      <CheckCircle size={20} color="#16a34a" />
                    )}
                  </div>
                  
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    <div style={{ marginBottom: '4px' }}>
                      <strong>Headers:</strong> {httpInput.headers?.length || 0} configurados
                    </div>
                    <div style={{ marginBottom: '4px' }}>
                      <strong>Body:</strong> {httpInput.enableBodyCapture ? `Sí (${httpInput.bodyVariable})` : 'No'}
                    </div>
                    <div>
                      <strong>Tipo de contenido:</strong> {httpInput.contentType || 'application/json'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* File Upload Section - SOLO CUANDO ESTÁ SELECCIONADO Y CORREGIDO */}
      {state.selectedSource === 'file' && (
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
            📁 Cargar Archivo JSON
          </h4>
          
          {/* Hidden file input - CRÍTICO */}
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
                  Selecciona un archivo JSON
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '16px' }}>
                  Formatos soportados: .json (máx. 10MB)
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
                  {(state.uploadedFile.size / 1024).toFixed(1)} KB • {new Date(state.uploadedFile.lastModified).toLocaleString()}
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={handleFileSelect}
                  >
                    Cambiar
                  </Button>
                  <Button
                    variant="danger"
                    size="small"
                    icon={<X size={14} />}
                    onClick={actions.clearFile}
                  >
                    Quitar
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* JSON Input (Manual, File y HTTP Input) - SOLO CUANDO CORRESPONDE */}
      {(state.selectedSource === 'manual' || (state.selectedSource === 'file' && state.uploadedFile) || 
        (state.selectedSource === 'http-input' && state.connectedHttpInput)) && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
              {state.selectedSource === 'file' ? '📁 JSON desde Archivo' : 
               state.selectedSource === 'http-input' ? '📡 Estructura del HTTP Input' :
               '📝 Estructura JSON Manual'}
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
          
          <textarea
            value={state.jsonInput}
            onChange={(e) => state.selectedSource === 'manual' ? actions.handleJsonInput(e.target.value) : null}
            placeholder={
              state.selectedSource === 'file' ? "El contenido del archivo aparecerá aquí..." : 
              state.selectedSource === 'http-input' ? "La estructura del HTTP Input aparecerá aquí..." :
              "Pega aquí tu estructura JSON..."
            }
            readOnly={state.selectedSource === 'file' || state.selectedSource === 'http-input'}
            style={{
              width: '100%',
              minHeight: '300px',
              padding: '12px',
              border: `1px solid ${state.jsonError ? '#dc2626' : '#d1d5db'}`,
              borderRadius: '6px',
              fontSize: '12px',
              fontFamily: 'monospace',
              resize: 'vertical',
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
              gap: '4px'
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
              gap: '4px'
            }}>
              <CheckCircle size={14} />
              JSON válido - {state.mappings.length} campos detectados para mapeo
              {state.selectedSource === 'file' && state.uploadedFile && (
                <span style={{ marginLeft: '8px', color: '#6b7280' }}>
                  • Desde: {state.uploadedFile.name}
                </span>
              )}
              {state.selectedSource === 'http-input' && state.connectedHttpInput && (
                <span style={{ marginLeft: '8px', color: '#6b7280' }}>
                  • Desde: {state.connectedHttpInput.method} {state.connectedHttpInput.path}
                </span>
              )}
            </div>
          )}

          {/* Explicación específica para HTTP Input */}
          {state.selectedSource === 'http-input' && state.connectedHttpInput && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '6px'
            }}>
              <div style={{
                fontSize: '13px',
                color: '#1e40af',
                fontWeight: '600',
                marginBottom: '6px'
              }}>
                💡 Estructura generada automáticamente:
              </div>
              <ul style={{
                fontSize: '12px',
                color: '#1e40af',
                margin: 0,
                paddingLeft: '16px'
              }}>
                <li><strong>Headers:</strong> Variables configuradas en el HTTP Input</li>
                <li><strong>Body:</strong> Contenido del request body (si está habilitado)</li>
                <li><strong>Metadata:</strong> Información del endpoint y timestamp</li>
                <li>Esta estructura representa los datos que llegarán al Data Mapper</li>
              </ul>
              
              <div style={{
                marginTop: '8px',
                padding: '8px',
                background: '#dbeafe',
                borderRadius: '4px',
                fontSize: '11px',
                color: '#1e40af'
              }}>
                <strong>🧪 Para probar:</strong> Ve al HTTP Input y usa el botón "🧪 Probar Endpoint" 
                para simular datos de entrada y ver cómo se mapearían aquí.
              </div>
            </div>
          )}

          {/* Explicación del flujo de testing */}
          {state.selectedSource === 'manual' && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              background: '#fefbf3',
              border: '1px solid #fed7aa',
              borderRadius: '6px'
            }}>
              <div style={{
                fontSize: '13px',
                color: '#c2410c',
                fontWeight: '600',
                marginBottom: '6px'
              }}>
                📝 Entrada Manual:
              </div>
              <ul style={{
                fontSize: '12px',
                color: '#c2410c',
                margin: 0,
                paddingLeft: '16px'
              }}>
                <li>Pega o escribe tu estructura JSON aquí</li>
                <li>Se generará el mapeo automáticamente</li>
                <li>Perfecto para datos estáticos o pruebas</li>
                <li>Usa "Cargar Ejemplo" para ver una estructura de muestra</li>
              </ul>
            </div>
          )}

          {/* Explicación para archivo */}
          {state.selectedSource === 'file' && !state.uploadedFile && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '6px'
            }}>
              <div style={{
                fontSize: '13px',
                color: '#15803d',
                fontWeight: '600',
                marginBottom: '6px'
              }}>
                📁 Carga desde Archivo:
              </div>
              <ul style={{
                fontSize: '12px',
                color: '#15803d',
                margin: 0,
                paddingLeft: '16px'
              }}>
                <li>Sube un archivo .json con tu estructura de datos</li>
                <li>Ideal para estructuras complejas o grandes</li>
                <li>El mapeo se genera automáticamente</li>
                <li>Máximo 10MB por archivo</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Test Section para HTTP Input - MEJORADO */}
      {state.selectedSource === 'http-input' && state.connectedHttpInput && (
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
            🔄 Flujo Completo de Testing
          </h5>
          
          <div style={{ fontSize: '12px', color: '#c2410c', lineHeight: '1.5' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '12px',
              marginBottom: '12px'
            }}>
              <div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                  1️⃣ En HTTP Input:
                </div>
                <ul style={{ margin: 0, paddingLeft: '16px' }}>
                  <li>Configura endpoint y headers</li>
                  <li>Haz clic en "🧪 Probar Endpoint"</li>
                  <li>Simula datos de entrada</li>
                </ul>
              </div>
              
              <div>
                <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                  2️⃣ En Data Mapper:
                </div>
                <ul style={{ margin: 0, paddingLeft: '16px' }}>
                  <li>Ve estructura automática</li>
                  <li>Mapea campos a variables</li>
                  <li>Valida tipos de datos</li>
                </ul>
              </div>
            </div>
            
            <div style={{
              background: '#fff7ed',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #fed7aa'
            }}>
              <strong>💡 Importante:</strong> El testing es simulado localmente. 
              No se envían datos reales a ningún servidor. Es para verificar 
              que el mapeo funcione correctamente.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SourceTab;