// src/components/workflow/nodes/CustomNode/DataFlow.jsx - CORREGIDO
import React from 'react';
import { getAvailableData } from '../../../../utils/nodeHelpers';

const DataFlow = ({ nodeId, nodes, edges }) => {
  const availableData = getAvailableData(nodeId, nodes, edges);
  
  if (Object.keys(availableData).length === 0) {
    return (
      <div style={{
        fontSize: '11px', 
        color: '#6b7280', 
        marginTop: '8px',
        fontStyle: 'italic'
      }}>
        Sin datos de entrada
      </div>
    );
  }

  return (
    <div style={{ marginTop: '8px' }}>
      <div style={{
        fontSize: '11px', 
        fontWeight: '500', 
        color: '#374151', 
        marginBottom: '4px'
      }}>
        Datos disponibles:
      </div>
      
      <div style={{
        maxHeight: '80px',
        overflowY: 'auto',
        border: '1px solid #e5e7eb',
        borderRadius: '4px',
        padding: '4px'
      }}>
        {Object.entries(availableData).map(([key, value]) => (
          <div key={key} style={{
            fontSize: '10px', 
            color: '#16a34a', 
            padding: '2px 4px',
            background: '#f0fdf4',
            marginBottom: '2px',
            borderRadius: '2px',
            border: '1px solid #bbf7d0'
          }}>
            <span style={{ fontWeight: '500' }}>{key}:</span> 
            <span style={{ marginLeft: '4px' }}>
              {/* CORREGIDO: Convertir valores a string */}
              {typeof value === 'object' 
                ? JSON.stringify(value).substring(0, 20) + '...'
                : typeof value === 'string' && value.length > 20 
                  ? `${value.substring(0, 20)}...` 
                  : String(value)
              }
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DataFlow;