// src/components/workflow/nodes/DataMapper/DataMapperDebugPanel.jsx
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Bug, Info } from 'lucide-react';

const DataMapperDebugPanel = ({ availableData, state }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);

  const analyzeAvailableData = () => {
    const analysis = {
      totalKeys: Object.keys(availableData).length,
      httpInputKeys: Object.keys(availableData).filter(k => k.startsWith('httpInput_')),
      headerKeys: Object.keys(availableData).filter(k => k.startsWith('headers.')),
      hasRequestBody: !!availableData.requestBody,
      otherKeys: Object.keys(availableData).filter(k => 
        !k.startsWith('httpInput_') && 
        !k.startsWith('headers.') && 
        k !== 'requestBody'
      )
    };
    
    return analysis;
  };

  const analysis = analyzeAvailableData();

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      background: 'white',
      border: '2px solid #3b82f6',
      borderRadius: '8px',
      boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
      zIndex: 999999,
      fontFamily: 'monospace',
      fontSize: '12px',
      maxWidth: isExpanded ? '600px' : '200px',
      maxHeight: isExpanded ? '500px' : 'auto'
    }}>
      {/* Header */}
      <div 
        style={{
          padding: '8px 12px',
          background: '#3b82f6',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Bug size={16} />
        <span>Data Debug</span>
        {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
      </div>

      {/* Content */}
      {isExpanded && (
        <div style={{ padding: '12px', maxHeight: '400px', overflow: 'auto' }}>
          
          {/* Quick Analysis */}
          <div style={{
            background: '#f0f9ff',
            padding: '8px',
            borderRadius: '4px',
            marginBottom: '12px',
            border: '1px solid #bfdbfe'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#1e40af' }}>
              📊 Análisis Rápido:
            </div>
            <div>📋 Total keys: {analysis.totalKeys}</div>
            <div>🌐 HTTP Input keys: {analysis.httpInputKeys.length}</div>
            <div>📨 Header keys: {analysis.headerKeys.length}</div>
            <div>📦 Has requestBody: {analysis.hasRequestBody ? 'Sí' : 'No'}</div>
            <div>📄 Other keys: {analysis.otherKeys.length}</div>
          </div>

          {/* State Debug */}
          <div style={{
            background: '#f3f4f6',
            padding: '8px',
            borderRadius: '4px',
            marginBottom: '12px',
            border: '1px solid #d1d5db'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#374151' }}>
              🔧 Estado Actual:
            </div>
            <div>Source: {state.selectedSource}</div>
            <div>HTTP Inputs: {state.availableHttpInputs.length}</div>
            <div>Has Available: {state.hasHttpInputsAvailable ? 'Sí' : 'No'}</div>
            <div>Connected: {state.connectedHttpInput ? 'Sí' : 'No'}</div>
          </div>

          {/* HTTP Input Keys Detail */}
          {analysis.httpInputKeys.length > 0 && (
            <div style={{
              background: '#f0fdf4',
              padding: '8px',
              borderRadius: '4px',
              marginBottom: '12px',
              border: '1px solid #bbf7d0'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#15803d' }}>
                🌐 HTTP Input Keys Encontrados:
              </div>
              {analysis.httpInputKeys.map(key => (
                <div key={key} style={{ marginBottom: '4px' }}>
                  <button
                    onClick={() => setSelectedKey(selectedKey === key ? null : key)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#15803d',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      fontSize: '12px',
                      padding: 0
                    }}
                  >
                    {key}
                  </button>
                  {selectedKey === key && (
                    <pre style={{
                      background: '#dcfce7',
                      padding: '4px',
                      borderRadius: '2px',
                      marginTop: '2px',
                      fontSize: '10px',
                      overflow: 'auto',
                      maxHeight: '100px'
                    }}>
                      {JSON.stringify(availableData[key], null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Headers Detail */}
          {analysis.headerKeys.length > 0 && (
            <div style={{
              background: '#eff6ff',
              padding: '8px',
              borderRadius: '4px',
              marginBottom: '12px',
              border: '1px solid #bfdbfe'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#1e40af' }}>
                📨 Headers Encontrados:
              </div>
              {analysis.headerKeys.map(key => (
                <div key={key} style={{ marginBottom: '2px' }}>
                  {key}: {JSON.stringify(availableData[key])}
                </div>
              ))}
            </div>
          )}

          {/* Request Body */}
          {analysis.hasRequestBody && (
            <div style={{
              background: '#fef3c7',
              padding: '8px',
              borderRadius: '4px',
              marginBottom: '12px',
              border: '1px solid #fed7aa'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#d97706' }}>
                📦 Request Body:
              </div>
              <pre style={{
                background: '#fffbeb',
                padding: '4px',
                borderRadius: '2px',
                fontSize: '10px',
                overflow: 'auto',
                maxHeight: '80px'
              }}>
                {JSON.stringify(availableData.requestBody, null, 2)}
              </pre>
            </div>
          )}

          {/* All Data */}
          <div style={{
            background: '#f9fafb',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px', color: '#374151' }}>
              📋 Todos los Datos Disponibles:
            </div>
            <pre style={{
              background: '#f3f4f6',
              padding: '4px',
              borderRadius: '2px',
              fontSize: '10px',
              overflow: 'auto',
              maxHeight: '150px'
            }}>
              {JSON.stringify(availableData, null, 2)}
            </pre>
          </div>

          {/* Force Detection Button */}
          <button
            onClick={() => {
              console.log('🔧 MANUAL DEBUG: Full available data:', availableData);
              console.log('🔧 MANUAL DEBUG: Analysis:', analysis);
              
              // Intentar forzar la detección manualmente
              window.forceDataMapperDebug = {
                availableData,
                analysis,
                state
              };
              
              alert('🔧 Debug data saved to window.forceDataMapperDebug\nCheck console for details!');
            }}
            style={{
              width: '100%',
              padding: '8px',
              background: '#dc2626',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '8px',
              fontSize: '12px'
            }}
          >
            🔧 Manual Debug
          </button>
        </div>
      )}
    </div>
  );
};

export default DataMapperDebugPanel;