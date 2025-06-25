// src/components/workflow/nodes/DataMapper/DataMapperCore.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle } from 'lucide-react';
import Button from '../../../common/Button/Button';
import DataMapperTabs from './DataMapperTabs';
import useDataMapperState from './DataMapperState';
import { validateDataMapperConfig } from './DataMapperValidation';
import { createSavedData } from './DataMapperUtils';
import DataMapperDebugPanel from './DataMapperDebugPanel';

const DataMapperCore = ({ 
  isOpen, 
  onClose, 
  initialData = {}, 
  onSave,
  availableData = {} 
}) => {
  // Usar el hook personalizado para el estado
  const {
    state,
    actions
  } = useDataMapperState(initialData, availableData);

  // Disable ReactFlow when modal is open
  useEffect(() => {
    if (isOpen) {
      console.log('🗂️ Enhanced Data Mapper opened - disabling ReactFlow');
      
      const reactFlowWrapper = document.querySelector('.react-flow');
      if (reactFlowWrapper) {
        reactFlowWrapper.style.pointerEvents = 'none';
        reactFlowWrapper.style.userSelect = 'none';
      }
      
      document.body.style.overflow = 'hidden';
      
      return () => {
        if (reactFlowWrapper) {
          reactFlowWrapper.style.pointerEvents = 'auto';
          reactFlowWrapper.style.userSelect = 'auto';
        }
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  // Handle save
  const handleSave = () => {
    const validation = validateDataMapperConfig({
      mappings: state.mappings,
      selectedSource: state.selectedSource,
      connectedHttpInput: state.connectedHttpInput,
      jsonInput: state.jsonInput,
      parsedJson: state.parsedJson
    });

    if (!validation.isValid) {
      console.error('Validation errors:', validation.errors);
      alert('Error de validación: ' + validation.errors.join('\n'));
      return;
    }

    const savedData = createSavedData({
      jsonInput: state.jsonInput,
      parsedJson: state.parsedJson,
      mappings: state.mappings,
      selectedSource: state.selectedSource,
      connectedHttpInput: state.connectedHttpInput,
      uploadedFile: state.uploadedFile
    });
    
    console.log('💾 Saving Data Mapper:', savedData);
    onSave(savedData);
    onClose();
  };

  // Handle close
  const handleClose = () => {
    actions.reset();
    onClose();
  };

  if (!isOpen) return null;

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999999,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
  };

  const modalContentStyle = {
    background: 'white',
    borderRadius: '12px',
    width: '95vw',
    height: '90vh',
    maxWidth: '1400px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    padding: '24px',
    position: 'relative'
  };

  const modalContent = (
    <div 
      style={modalOverlayStyle}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div 
        style={modalContentStyle}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '16px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '24px',
            fontWeight: '700',
            color: '#1f2937'
          }}>
            🗂️ Data Mapper
          </h2>
          
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            fontFamily: 'monospace',
            textAlign: 'center',
            background: '#f3f4f6',
            padding: '6px 12px',
            borderRadius: '6px'
          }}>
            <div><strong>Fuente:</strong> {
              state.selectedSource === 'http-input' ? '🌐 HTTP Input' : 
              state.selectedSource === 'file' ? '📁 Archivo' : 
              '📝 Manual'
            }</div>
            <div><strong>HTTP Inputs:</strong> {state.availableHttpInputs.length}</div>
            <div><strong>Mappings:</strong> {state.mappings.length}</div>
            <div><strong>Válidos:</strong> {state.mappings.filter(m => m.isValid && m.variableName).length}</div>
          </div>
          
          <button 
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              color: '#6b7280',
              fontSize: '24px',
              fontWeight: 'bold'
            }}
          >
            ✕
          </button>
        </div>

        {/* Alert si no hay HTTP Inputs disponibles */}
        {!state.hasHttpInputsAvailable && (
          <div style={{
            background: '#fef3c7',
            border: '1px solid #f59e0b',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <AlertTriangle size={16} color="#f59e0b" />
            <div style={{ fontSize: '14px', color: '#92400e' }}>
              <strong>Sin HTTP Inputs:</strong> No hay nodos HTTP Input conectados. 
              Conecta un HTTP Input a este Data Mapper para procesar datos dinámicos.
            </div>
          </div>
        )}

        {/* Tabs Content */}
        <DataMapperTabs 
          state={state}
          actions={actions}
          availableData={availableData}
        />

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '2px solid #e5e7eb'
        }}>
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            🔄 <strong>Variables mapeadas:</strong> {state.mappings.filter(m => m.isValid && m.variableName).length}/{state.mappings.length}
            {state.connectedHttpInput && (
              <span style={{ marginLeft: '20px', color: '#3b82f6' }}>
                📡 <strong>Conectado a:</strong> {state.connectedHttpInput.method} {state.connectedHttpInput.path}
              </span>
            )}
            {state.uploadedFile && (
              <span style={{ marginLeft: '20px', color: '#16a34a' }}>
                📁 <strong>Archivo:</strong> {state.uploadedFile.name}
              </span>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              variant="secondary"
              onClick={handleClose}
              size="large"
            >
              Cancelar
            </Button>
            
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={state.mappings.length === 0 || state.mappings.filter(m => m.isValid && m.variableName).length === 0}
              size="large"
            >
              💾 Guardar Mapeo ({state.mappings.filter(m => m.isValid && m.variableName).length} variables)
            </Button>
          </div>
        </div>
      </div>
      
      {/* Debug Panel - Solo visible en desarrollo */}
      <DataMapperDebugPanel 
        availableData={availableData} 
        state={state} 
      />
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default DataMapperCore;