// src/components/workflow/nodes/DataMapper/AvailableDataViewer.jsx
import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Database, Search } from 'lucide-react';

const AvailableDataViewer = ({ availableData, onForceDetection }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredData = React.useMemo(() => {
    if (!searchTerm) return availableData;
    
    const filtered = {};
    Object.entries(availableData).forEach(([key, value]) => {
      if (key.toLowerCase().includes(searchTerm.toLowerCase()) ||
          JSON.stringify(value).toLowerCase().includes(searchTerm.toLowerCase())) {
        filtered[key] = value;
      }
    });
    return filtered;
  }, [availableData, searchTerm]);

  const keyCount = Object.keys(availableData).length;
  const httpInputKeys = Object.keys(availableData).filter(k => k.startsWith('httpInput_'));
  const headerKeys = Object.keys(availableData).filter(k => k.startsWith('headers.'));
  const hasRequestBody = !!availableData.requestBody;

  return (
    <div style={{
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      marginBottom: '16px'
    }}>
      {/* Header */}
      <div 
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #e2e8f0',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <Database size={16} color="#64748b" />
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>
            Datos Disponibles ({keyCount})
          </span>
        </div>
        
        <div style={{ fontSize: '12px', color: '#64748b' }}>
          🌐 HTTP: {httpInputKeys.length} | 📨 Headers: {headerKeys.length} | 📦 Body: {hasRequestBody ? '✓' : '✗'}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div style={{ padding: '16px' }}>
          
          {/* Search */}
          <div style={{ marginBottom: '12px', position: 'relative' }}>
            <Search size={16} style={{ 
              position: 'absolute', 
              left: '8px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#64748b'
            }} />
            <input
              type="text"
              placeholder="Buscar en datos disponibles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 8px 8px 32px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '12px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Quick Stats */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <div style={{
              background: httpInputKeys.length > 0 ? '#dcfce7' : '#fef2f2',
              padding: '8px',
              borderRadius: '4px',
              textAlign: 'center',
              border: `1px solid ${httpInputKeys.length > 0 ? '#bbf7d0' : '#fecaca'}`
            }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: httpInputKeys.length > 0 ? '#166534' : '#dc2626' }}>
                {httpInputKeys.length}
              </div>
              <div style={{ fontSize: '10px', color: httpInputKeys.length > 0 ? '#166534' : '#dc2626' }}>
                HTTP Inputs
              </div>
            </div>
            
            <div style={{
              background: headerKeys.length > 0 ? '#dbeafe' : '#f3f4f6',
              padding: '8px',
              borderRadius: '4px',
              textAlign: 'center',
              border: `1px solid ${headerKeys.length > 0 ? '#93c5fd' : '#d1d5db'}`
            }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: headerKeys.length > 0 ? '#1e40af' : '#64748b' }}>
                {headerKeys.length}
              </div>
              <div style={{ fontSize: '10px', color: headerKeys.length > 0 ? '#1e40af' : '#64748b' }}>
                Headers
              </div>
            </div>
            
            <div style={{
              background: hasRequestBody ? '#fef3c7' : '#f3f4f6',
              padding: '8px',
              borderRadius: '4px',
              textAlign: 'center',
              border: `1px solid ${hasRequestBody ? '#fcd34d' : '#d1d5db'}`
            }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: hasRequestBody ? '#d97706' : '#64748b' }}>
                {hasRequestBody ? '✓' : '✗'}
              </div>
              <div style={{ fontSize: '10px', color: hasRequestBody ? '#d97706' : '#64748b' }}>
                Request Body
              </div>
            </div>
          </div>

          {/* Force Detection Button */}
          {(httpInputKeys.length > 0 || headerKeys.length > 0 || hasRequestBody) && (
            <button
              onClick={() => {
                console.log('🔧 VIEWER: Force detection triggered');
                if (onForceDetection) {
                  onForceDetection(availableData);
                }
              }}
              style={{
                width: '100%',
                padding: '8px',
                background: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                marginBottom: '12px'
              }}
            >
              🔧 Forzar Detección de HTTP Input
            </button>
          )}

          {/* Data List */}
          <div style={{
            maxHeight: '300px',
            overflow: 'auto',
            border: '1px solid #e2e8f0',
            borderRadius: '6px'
          }}>
            {Object.keys(filteredData).length === 0 ? (
              <div style={{
                padding: '20px',
                textAlign: 'center',
                color: '#64748b',
                fontSize: '12px'
              }}>
                {keyCount === 0 ? 'No hay datos disponibles' : 'No se encontraron resultados'}
              </div>
            ) : (
              Object.entries(filteredData).map(([key, value], index) => (
                <div
                  key={key}
                  style={{
                    padding: '8px 12px',
                    borderBottom: index < Object.keys(filteredData).length - 1 ? '1px solid #f1f5f9' : 'none',
                    background: index % 2 === 0 ? '#ffffff' : '#f8fafc'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '4px'
                  }}>
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '3px',
                      background: key.startsWith('httpInput_') ? '#dcfce7' :
                                 key.startsWith('headers.') ? '#dbeafe' :
                                 key === 'requestBody' ? '#fef3c7' : '#f1f5f9',
                      color: key.startsWith('httpInput_') ? '#166534' :
                             key.startsWith('headers.') ? '#1e40af' :
                             key === 'requestBody' ? '#d97706' : '#64748b',
                      fontWeight: '500'
                    }}>
                      {key.startsWith('httpInput_') ? 'HTTP' :
                       key.startsWith('headers.') ? 'HEADER' :
                       key === 'requestBody' ? 'BODY' : 'OTHER'}
                    </span>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      color: '#334155',
                      fontFamily: 'monospace'
                    }}>
                      {key}
                    </span>
                  </div>
                  
                  <div style={{
                    fontSize: '10px',
                    color: '#64748b',
                    fontFamily: 'monospace',
                    background: '#f8fafc',
                    padding: '4px 6px',
                    borderRadius: '3px',
                    maxHeight: '60px',
                    overflow: 'auto'
                  }}>
                    {typeof value === 'object' 
                      ? JSON.stringify(value, null, 2).substring(0, 200) + (JSON.stringify(value).length > 200 ? '...' : '')
                      : String(value).substring(0, 100) + (String(value).length > 100 ? '...' : '')
                    }
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AvailableDataViewer;