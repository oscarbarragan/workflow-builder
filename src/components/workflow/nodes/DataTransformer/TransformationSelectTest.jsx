// Componente de prueba para debuggear el problema del select de transformaciones
import React, { useState, useEffect } from 'react';
import { getTransformationsForDataType } from '../TransformationTypes';

const TransformationSelectTest = () => {
  const [selectedDataType, setSelectedDataType] = useState('string');
  const [selectedTransformation, setSelectedTransformation] = useState('none');
  const [transformations, setTransformations] = useState({});
  const [debugLog, setDebugLog] = useState([]);

  const addLog = (message, data = null) => {
    const logEntry = {
      timestamp: new Date().toLocaleTimeString(),
      message,
      data: data ? JSON.stringify(data, null, 2) : null
    };
    setDebugLog(prev => [logEntry, ...prev.slice(0, 9)]); // Keep last 10 logs
    console.log('🔍', message, data);
  };

  useEffect(() => {
    addLog('🚀 Component mounted');
    handleDataTypeChange('string');
  }, []);

  const handleDataTypeChange = (dataType) => {
    addLog(`📊 Changing data type to: ${dataType}`);
    setSelectedDataType(dataType);
    
    try {
      const availableTransformations = getTransformationsForDataType(dataType);
      addLog(`✅ Got transformations for ${dataType}`, {
        count: Object.keys(availableTransformations).length,
        keys: Object.keys(availableTransformations)
      });
      
      setTransformations(availableTransformations);
      
      // Set first transformation as default
      const firstKey = Object.keys(availableTransformations)[0];
      if (firstKey) {
        setSelectedTransformation(firstKey);
        addLog(`🎯 Set default transformation to: ${firstKey}`);
      }
    } catch (error) {
      addLog(`❌ Error getting transformations: ${error.message}`, error);
    }
  };

  const handleTransformationChange = (transformationType) => {
    addLog(`🔄 Changing transformation to: ${transformationType}`);
    setSelectedTransformation(transformationType);
  };

  const testDataTypes = ['string', 'number', 'boolean', 'date', 'array', 'object', 'email', 'url'];

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'Arial, sans-serif',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <h2>🧪 Prueba de Transformaciones</h2>
      
      {/* Data Type Selector */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Seleccionar Tipo de Dato:
        </label>
        <select
          value={selectedDataType}
          onChange={(e) => handleDataTypeChange(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '2px solid #3b82f6',
            borderRadius: '6px',
            fontSize: '14px',
            minWidth: '200px'
          }}
        >
          {testDataTypes.map(type => (
            <option key={type} value={type}>{type}</option>
          ))}
        </select>
      </div>

      {/* Transformation Selector */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
          Seleccionar Transformación:
        </label>
        <select
          value={selectedTransformation}
          onChange={(e) => handleTransformationChange(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '2px solid #10b981',
            borderRadius: '6px',
            fontSize: '14px',
            minWidth: '300px'
          }}
        >
          {Object.entries(transformations).map(([key, config]) => (
            <option key={key} value={key}>
              {config.icon} {config.label}
            </option>
          ))}
        </select>
        
        <div style={{
          marginTop: '8px',
          padding: '8px',
          background: '#f0f9ff',
          border: '1px solid #0ea5e9',
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          <strong>Opciones disponibles:</strong> {Object.keys(transformations).length}
        </div>
      </div>

      {/* Current Selection Info */}
      <div style={{
        background: '#f0fdf4',
        border: '2px solid #16a34a',
        borderRadius: '8px',
        padding: '16px',
        marginBottom: '20px'
      }}>
        <h3 style={{ margin: '0 0 12px 0' }}>📋 Información Actual</h3>
        <div><strong>Tipo de Dato:</strong> {selectedDataType}</div>
        <div><strong>Transformación:</strong> {selectedTransformation}</div>
        <div><strong>Total Opciones:</strong> {Object.keys(transformations).length}</div>
        
        {transformations[selectedTransformation] && (
          <div style={{ marginTop: '12px', padding: '8px', background: '#dcfce7', borderRadius: '4px' }}>
            <div><strong>Descripción:</strong> {transformations[selectedTransformation].description}</div>
            {transformations[selectedTransformation].config && (
              <div><strong>Config:</strong> {JSON.stringify(transformations[selectedTransformation].config)}</div>
            )}
          </div>
        )}
      </div>

      {/* Debug Log */}
      <div style={{
        background: '#1f2937',
        color: '#f9fafb',
        borderRadius: '8px',
        padding: '16px',
        fontSize: '12px',
        fontFamily: 'monospace',
        maxHeight: '300px',
        overflow: 'auto'
      }}>
        <h3 style={{ margin: '0 0 12px 0', color: '#fbbf24' }}>🔍 Log de Debug</h3>
        {debugLog.map((log, index) => (
          <div key={index} style={{ marginBottom: '8px', borderBottom: '1px solid #374151', paddingBottom: '4px' }}>
            <div style={{ color: '#9ca3af' }}>[{log.timestamp}] {log.message}</div>
            {log.data && (
              <pre style={{ 
                margin: '4px 0 0 16px', 
                fontSize: '10px', 
                color: '#60a5fa',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}>
                {log.data}
              </pre>
            )}
          </div>
        ))}
      </div>

      {/* Raw Data Display */}
      <details style={{ marginTop: '20px' }}>
        <summary style={{ 
          cursor: 'pointer', 
          padding: '8px', 
          background: '#fef3c7', 
          border: '1px solid #f59e0b',
          borderRadius: '4px',
          fontWeight: 'bold'
        }}>
          🔧 Ver Datos Raw
        </summary>
        <pre style={{
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '4px',
          padding: '12px',
          fontSize: '11px',
          overflow: 'auto',
          marginTop: '8px'
        }}>
          {JSON.stringify({
            selectedDataType,
            selectedTransformation,
            transformationsCount: Object.keys(transformations).length,
            transformationKeys: Object.keys(transformations),
            currentTransformationData: transformations[selectedTransformation]
          }, null, 2)}
        </pre>
      </details>
    </div>
  );
};

export default TransformationSelectTest;