// src/components/common/ImportWorkflow/ImportWorkflow.jsx
import React, { useState, useRef } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import Button from '../Button/Button';
import Modal from '../Modal/Modal';
import { importWorkflow, validateWorkflow } from '../../../utils/workflowHelpers';

const ImportWorkflow = ({ isOpen, onClose, onImport }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewData, setPreviewData] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const fileInputRef = useRef(null);

  const resetState = () => {
    setError(null);
    setPreviewData(null);
    setValidationResult(null);
    setIsLoading(false);
    setIsDragOver(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.json')) {
      setError('Por favor selecciona un archivo JSON válido');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo es demasiado grande. Máximo 10MB permitido');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const workflowData = await importWorkflow(file);
      setPreviewData(workflowData);

      // Validate workflow structure
      const validation = validateWorkflow(workflowData.nodes || [], workflowData.edges || []);
      setValidationResult(validation);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleImport = () => {
    if (previewData && onImport) {
      onImport(previewData);
      handleClose();
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const dropZoneStyle = {
    border: `2px dashed ${isDragOver ? '#3b82f6' : '#d1d5db'}`,
    borderRadius: '8px',
    padding: '40px 20px',
    textAlign: 'center',
    background: isDragOver ? '#eff6ff' : '#f9fafb',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Importar Workflow"
      size="medium"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Drop Zone */}
        {!previewData && (
          <div
            style={dropZoneStyle}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <Upload size={48} color={isDragOver ? '#3b82f6' : '#9ca3af'} />
              
              <div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                  {isDragOver ? 'Suelta el archivo aquí' : 'Arrastra tu archivo JSON aquí'}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  o <span style={{ color: '#3b82f6', textDecoration: 'underline' }}>haz clic para seleccionar</span>
                </div>
              </div>
              
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                Archivos JSON hasta 10MB
              </div>
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />

        {/* Loading State */}
        {isLoading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: '#f3f4f6',
            borderRadius: '8px'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid #e5e7eb',
              borderTop: '2px solid #3b82f6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginRight: '12px'
            }} />
            <span style={{ color: '#374151' }}>Procesando archivo...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626'
          }}>
            <AlertCircle size={20} style={{ marginRight: '8px' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Preview Data */}
        {previewData && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* File Info */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              background: '#f3f4f6',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <FileText size={20} color="#374151" style={{ marginRight: '12px' }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                  Workflow detectado
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {previewData.nodes?.length || 0} nodos, {previewData.edges?.length || 0} conexiones
                </div>
              </div>
              <button
                onClick={() => {
                  setPreviewData(null);
                  setValidationResult(null);
                  setError(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  color: '#6b7280'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Validation Results */}
            {validationResult && (
              <div style={{
                padding: '12px 16px',
                borderRadius: '8px',
                border: `1px solid ${validationResult.isValid ? '#bbf7d0' : '#fecaca'}`,
                background: validationResult.isValid ? '#f0fdf4' : '#fef2f2'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: validationResult.errors.length > 0 || validationResult.warnings.length > 0 ? '8px' : '0'
                }}>
                  {validationResult.isValid ? (
                    <CheckCircle size={16} color="#16a34a" style={{ marginRight: '8px' }} />
                  ) : (
                    <AlertCircle size={16} color="#dc2626" style={{ marginRight: '8px' }} />
                  )}
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: validationResult.isValid ? '#16a34a' : '#dc2626'
                  }}>
                    {validationResult.isValid ? 'Workflow válido' : 'Problemas detectados'}
                  </span>
                </div>

                {/* Errors */}
                {validationResult.errors.length > 0 && (
                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '500', color: '#dc2626', marginBottom: '4px' }}>
                      Errores:
                    </div>
                    {validationResult.errors.map((error, index) => (
                      <div key={index} style={{ fontSize: '12px', color: '#dc2626', marginLeft: '16px' }}>
                        • {error}
                      </div>
                    ))}
                  </div>
                )}

                {/* Warnings */}
                {validationResult.warnings.length > 0 && (
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: '500', color: '#f59e0b', marginBottom: '4px' }}>
                      Advertencias:
                    </div>
                    {validationResult.warnings.map((warning, index) => (
                      <div key={index} style={{ fontSize: '12px', color: '#f59e0b', marginLeft: '16px' }}>
                        • {warning}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Workflow Summary */}
            <div style={{
              padding: '12px 16px',
              background: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                Resumen del Workflow
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                <div>
                  <span style={{ color: '#6b7280' }}>Nodos: </span>
                  <span style={{ fontWeight: '500', color: '#374151' }}>{previewData.nodes?.length || 0}</span>
                </div>
                <div>
                  <span style={{ color: '#6b7280' }}>Conexiones: </span>
                  <span style={{ fontWeight: '500', color: '#374151' }}>{previewData.edges?.length || 0}</span>
                </div>
                {previewData.timestamp && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <span style={{ color: '#6b7280' }}>Creado: </span>
                    <span style={{ fontWeight: '500', color: '#374151' }}>
                      {new Date(previewData.timestamp).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Node Types */}
              {previewData.nodes && previewData.nodes.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>
                    Tipos de nodos:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {Object.entries(
                      previewData.nodes.reduce((acc, node) => {
                        acc[node.type] = (acc[node.type] || 0) + 1;
                        return acc;
                      }, {})
                    ).map(([type, count]) => (
                      <span
                        key={type}
                        style={{
                          fontSize: '11px',
                          padding: '2px 6px',
                          background: '#dbeafe',
                          color: '#1e40af',
                          borderRadius: '4px',
                          border: '1px solid #bfdbfe'
                        }}
                      >
                        {type}: {count}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          paddingTop: '16px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <Button
            variant="secondary"
            onClick={handleClose}
          >
            Cancelar
          </Button>
          
          {previewData && (
            <Button
              variant="primary"
              onClick={handleImport}
              disabled={validationResult && !validationResult.isValid}
            >
              Importar Workflow
            </Button>
          )}
        </div>
      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </Modal>
  );
};

export default ImportWorkflow;