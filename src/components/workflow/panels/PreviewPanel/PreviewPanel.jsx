import React, { useState } from 'react';
import { Copy, Eye, EyeOff, Maximize2, Minimize2 } from 'lucide-react';
import Button from '../../../common/Button/Button';
import { STYLES } from '../../../../utils/constants';

const PreviewPanel = ({ workflowData = {} }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [copySuccess, setCopySuccess] = useState(false);

  const copyToClipboard = async () => {
    try {
      const jsonString = JSON.stringify(workflowData, null, 2);
      await navigator.clipboard.writeText(jsonString);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };

  const getDataSize = () => {
    const jsonString = JSON.stringify(workflowData);
    const bytes = new Blob([jsonString]).size;
    
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const hasData = workflowData && Object.keys(workflowData).length > 0;

  const panelStyle = {
    ...STYLES.panel,
    width: isExpanded ? '500px' : '320px',
    maxWidth: isExpanded ? '80vw' : '400px',
    transition: 'all 0.3s ease',
    position: 'relative'
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    paddingBottom: '8px',
    borderBottom: '1px solid #e5e7eb'
  };

  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h3 style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: '600',
          color: '#374151'
        }}>
          Vista Previa JSON
        </h3>
        
        <div style={{ display: 'flex', gap: '4px' }}>
          <Button
            size="small"
            variant="secondary"
            icon={isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
            onClick={() => setIsVisible(!isVisible)}
            title={isVisible ? 'Ocultar' : 'Mostrar'}
          />
          
          <Button
            size="small"
            variant="secondary"
            icon={isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Contraer' : 'Expandir'}
          />
          
          <Button
            size="small"
            variant="primary"
            icon={<Copy size={14} />}
            onClick={copyToClipboard}
            disabled={!hasData}
            title="Copiar JSON"
          />
        </div>
      </div>

      {/* Stats */}
      {hasData && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '12px',
          fontSize: '12px',
          color: '#6b7280'
        }}>
          <span>
            <strong>Nodos:</strong> {workflowData.nodes?.length || 0}
          </span>
          <span>
            <strong>Conexiones:</strong> {workflowData.edges?.length || 0}
          </span>
          <span>
            <strong>Tamaño:</strong> {getDataSize()}
          </span>
        </div>
      )}

      {/* Copy Success Message */}
      {copySuccess && (
        <div style={{
          background: '#d1fae5',
          color: '#065f46',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          marginBottom: '12px',
          border: '1px solid #a7f3d0'
        }}>
          ✅ JSON copiado al portapapeles
        </div>
      )}

      {/* JSON Content */}
      {isVisible && (
        <div style={{
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '6px',
          overflow: 'hidden'
        }}>
          {hasData ? (
            <pre style={{
              fontSize: '11px',
              padding: '12px',
              margin: 0,
              maxHeight: isExpanded ? '60vh' : '250px',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
              lineHeight: '1.4',
              color: '#374151'
            }}>
              {JSON.stringify(workflowData, null, 2)}
            </pre>
          ) : (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '14px'
            }}>
              <div style={{ marginBottom: '8px', fontSize: '24px' }}>📋</div>
              <div>No hay datos de workflow</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>
                Agrega nodos para ver el JSON
              </div>
            </div>
          )}
        </div>
      )}

      {/* Timestamp */}
      {workflowData.timestamp && (
        <div style={{
          marginTop: '8px',
          fontSize: '11px',
          color: '#9ca3af',
          textAlign: 'right'
        }}>
          Actualizado: {new Date(workflowData.timestamp).toLocaleString()}
        </div>
      )}

      {/* Quick Actions */}
      {hasData && (
        <div style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#374151',
            marginBottom: '6px',
            fontWeight: '500'
          }}>
            Acciones rápidas:
          </div>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button
              size="small"
              variant="secondary"
              onClick={() => {
                const blob = new Blob([JSON.stringify(workflowData, null, 2)], 
                  { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `workflow-${Date.now()}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              💾 Guardar
            </Button>
            
            <Button
              size="small"
              variant="secondary"
              onClick={() => {
                console.log('Workflow Data:', workflowData);
              }}
            >
              🔍 Log
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewPanel;