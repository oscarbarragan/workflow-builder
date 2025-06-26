// src/components/workflow/nodes/DataTransformer/tabs/PreviewTab.jsx
import React, { useState, useEffect } from 'react';
import { Eye, Play, AlertTriangle, CheckCircle } from 'lucide-react';
import { previewTransformation } from '../TransformationEngine';

const PreviewTab = ({ transformations, availableData }) => {
  const [previews, setPreviews] = useState({});
  const [isGenerating, setIsGenerating] = useState(false);

  const enabledTransformations = transformations.filter(t => t.enabled && t.isValid);

  useEffect(() => {
    generateAllPreviews();
  }, [transformations, availableData]);

  const generateAllPreviews = async () => {
    setIsGenerating(true);
    const newPreviews = {};

    for (const transformation of enabledTransformations) {
      const inputValue = availableData[transformation.inputVariable];
      const preview = previewTransformation(
        inputValue,
        transformation.transformationType,
        transformation.transformationConfig
      );
      newPreviews[transformation.id] = preview;
    }

    setPreviews(newPreviews);
    setIsGenerating(false);
  };

  if (enabledTransformations.length === 0) {
    return (
      <div style={{
        padding: '40px 20px',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        <Eye size={32} style={{ margin: '0 auto 12px', display: 'block' }} />
        <div style={{ fontSize: '14px', marginBottom: '4px' }}>
          No hay transformaciones habilitadas
        </div>
        <div style={{ fontSize: '12px' }}>
          Habilita algunas transformaciones para ver la vista previa
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '16px',
      height: '100%',
      overflow: 'hidden'
    }}>
      
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0
      }}>
        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
          👁️ Vista Previa de Transformaciones
        </h4>
        
        <button
          onClick={generateAllPreviews}
          disabled={isGenerating}
          style={{
            padding: '6px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            background: 'white',
            color: '#374151',
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            fontSize: '12px',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Play size={12} />
          {isGenerating ? 'Generando...' : 'Actualizar Todo'}
        </button>
      </div>

      {/* Preview List */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        border: '1px solid #e5e7eb',
        borderRadius: '6px'
      }}>
        {enabledTransformations.map((transformation, index) => {
          const preview = previews[transformation.id];
          
          return (
            <div
              key={transformation.id}
              style={{
                padding: '16px',
                borderBottom: index < enabledTransformations.length - 1 ? '1px solid #f1f5f9' : 'none'
              }}
            >
              {/* Transformation Info */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#374151'
                  }}>
                    {transformation.inputVariable} → {transformation.outputVariable}
                  </span>
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '12px',
                    background: '#f3f4f6',
                    color: '#374151'
                  }}>
                    {transformation.transformationType}
                  </span>
                </div>
                
                {preview && (
                  preview.success ? (
                    <CheckCircle size={14} color="#16a34a" />
                  ) : (
                    <AlertTriangle size={14} color="#dc2626" />
                  )
                )}
              </div>

              {/* Before/After Comparison */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                gap: '12px',
                alignItems: 'flex-start'
              }}>
                {/* Original Value */}
                <div>
                  <div style={{
                    fontSize: '10px',
                    fontWeight: '500',
                    color: '#6b7280',
                    marginBottom: '4px'
                  }}>
                    Valor original:
                  </div>
                  <div style={{
                    padding: '8px',
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    maxHeight: '80px',
                    overflow: 'auto',
                    wordBreak: 'break-all'
                  }}>
                    {typeof transformation.inputValue === 'object'
                      ? JSON.stringify(transformation.inputValue, null, 2)
                      : String(transformation.inputValue)
                    }
                  </div>
                </div>

                {/* Arrow */}
                <div style={{
                  padding: '20px 8px',
                  color: preview?.success ? '#16a34a' : '#dc2626',
                  fontSize: '16px'
                }}>
                  →
                </div>

                {/* Transformed Value */}
                <div>
                  <div style={{
                    fontSize: '10px',
                    fontWeight: '500',
                    color: '#6b7280',
                    marginBottom: '4px'
                  }}>
                    Valor transformado:
                  </div>
                  <div style={{
                    padding: '8px',
                    background: preview?.success ? '#f0fdf4' : '#fef2f2',
                    border: `1px solid ${preview?.success ? '#bbf7d0' : '#fecaca'}`,
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    maxHeight: '80px',
                    overflow: 'auto',
                    wordBreak: 'break-all',
                    color: preview?.success ? '#166534' : '#dc2626'
                  }}>
                    {preview ? (
                      preview.success ? (
                        typeof preview.result === 'object'
                          ? JSON.stringify(preview.result, null, 2)
                          : String(preview.result)
                      ) : (
                        `Error: ${preview.error}`
                      )
                    ) : (
                      <span style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                        Generando vista previa...
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Type Change Info */}
              {preview?.success && (
                <div style={{
                  marginTop: '8px',
                  fontSize: '10px',
                  color: '#6b7280',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>
                    Tipo: {typeof transformation.inputValue} → {typeof preview.result}
                  </span>
                  {transformation.transformationConfig && Object.keys(transformation.transformationConfig).length > 0 && (
                    <span>
                      Config: {JSON.stringify(transformation.transformationConfig)}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PreviewTab;