// src/components/workflow/nodes/ScriptProcessor/ResultsPanel.jsx - CON SCROLL INTERNO
import React from 'react';
import { CheckCircle, FileText, Code } from 'lucide-react';

const ResultsPanel = ({ previewData, logs }) => {
  return (
    <div style={{
      height: '100%', // ✅ Altura completa del contenedor
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: 'white'
    }}>
      {/* ✅ Header fijo */}
      <div style={{
        background: Object.keys(previewData).length > 0
          ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' 
          : 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
        padding: '12px 16px',
        color: 'white',
        fontSize: '13px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexShrink: 0 // ✅ No se reduce
      }}>
        {Object.keys(previewData).length > 0 ? <CheckCircle size={16} /> : <FileText size={16} />}
        {Object.keys(previewData).length > 0 ? 'Live Preview' : 'Preview Result'}
      </div>
      
      {/* ✅ Contenido con scroll */}
      <div style={{
        flex: 1, // ✅ Toma el espacio restante
        padding: '12px',
        background: '#ffffff',
        overflow: 'auto', // ✅ Scroll cuando sea necesario
        fontSize: '12px',
        fontFamily: '"Fira Code", "SF Mono", "Monaco", monospace',
        minHeight: 0 // ✅ Permite que el contenido se reduzca
      }}>
        {Object.keys(previewData).length > 0 ? (
          <pre style={{ 
            margin: 0, 
            whiteSpace: 'pre-wrap',
            color: '#1f2937',
            wordBreak: 'break-word' // ✅ Permite romper palabras largas
          }}>
            {JSON.stringify(previewData, null, 2)}
          </pre>
        ) : (
          <div style={{
            color: '#6b7280',
            fontStyle: 'italic',
            textAlign: 'center',
            padding: '40px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Code size={24} style={{ opacity: 0.5 }} />
            Write a script with return statement to see preview
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsPanel;