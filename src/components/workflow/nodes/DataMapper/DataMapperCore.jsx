// src/components/workflow/nodes/DataMapper/DataMapperCore.jsx - CORREGIDO
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Button from '../../../common/Button/Button';
import DataMapperTabs from './DataMapperTabs';
import useDataMapperState from './DataMapperState';
import { validateDataMapperConfig } from './DataMapperUtils';
import { createSavedData } from './DataMapperUtils';
// ✅ REMOVIDO: DataMapperDebugPanel import

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

  // Handle save - CORREGIDO
  const handleSave = () => {
    const validation = validateDataMapperConfig({
      mappings: state.mappings,
      jsonInput: state.jsonInput,
      parsedJson: state.parsedJson,
      httpInputConnection: state.httpInputAnalysis
    });

    if (!validation.isValid) {
      console.error('Validation errors:', validation.errors);
      alert('Error de validación: ' + validation.errors.join('\n'));
      return;
    }

    const savedData = createSavedData(state);
    
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

  // ✅ MEJORADO: Modal overlay con mejor posicionamiento
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
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
    padding: '20px', // ✅ AGREGADO: Padding para evitar que el modal toque los bordes
    boxSizing: 'border-box'
  };

  // ✅ MEJORADO: Modal content con mejor estructura
  const modalContentStyle = {
    background: 'white',
    borderRadius: '12px',
    width: '100%',
    height: '100%',
    maxWidth: '1400px',
    maxHeight: '90vh', // ✅ CAMBIADO: Altura máxima para evitar overflow
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    position: 'relative',
    overflow: 'hidden' // ✅ AGREGADO: Prevenir overflow del contenedor principal
  };

  // ✅ MEJORADO: Header style
  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 24px 16px 24px', // ✅ AJUSTADO: Padding más específico
    borderBottom: '2px solid #e5e7eb',
    flexShrink: 0 // ✅ AGREGADO: Evitar que el header se encoja
  };

  // ✅ NUEVO: Content area style
  const contentAreaStyle = {
    flex: 1,
    padding: '0 24px',
    overflow: 'hidden', // ✅ IMPORTANTE: El overflow se maneja en los tabs
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0 // ✅ CRÍTICO: Permite que flex funcione correctamente
  };

  // ✅ MEJORADO: Footer style
  const footerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px 24px 24px', // ✅ AJUSTADO: Padding más específico
    borderTop: '2px solid #e5e7eb',
    flexShrink: 0 // ✅ AGREGADO: Evitar que el footer se encoja
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
        <div style={headerStyle}>
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
              state.selectedSource === 'file' ? '📁 Archivo' : '📝 Manual'
            }</div>
            <div><strong>Estructura:</strong> {state.parsedJson ? 'Definida' : 'Pendiente'}</div>
            <div><strong>Mappings:</strong> {state.mappings?.length || 0}</div>
            <div><strong>Válidos:</strong> {(state.mappings || []).filter(m => m.isValid && m.variableName).length}</div>
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

        {/* ✅ MEJORADO: Content Area */}
        <div style={contentAreaStyle}>
          <DataMapperTabs 
            state={state}
            actions={actions}
            availableData={availableData}
          />
        </div>

        {/* Footer */}
        <div style={footerStyle}>
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            🔄 <strong>Variables mapeadas:</strong> {(state.mappings || []).filter(m => m.isValid && m.variableName).length}/{(state.mappings || []).length}
            {state.httpInputAnalysis?.hasHttpInput && (
              <span style={{ marginLeft: '20px', color: '#3b82f6' }}>
                📡 <strong>HTTP Input:</strong> {state.httpInputAnalysis.method} {state.httpInputAnalysis.path}
              </span>
            )}
            {state.uploadedFile && (
              <span style={{ marginLeft: '20px', color: '#16a34a' }}>
                📁 <strong>Archivo:</strong> {state.uploadedFile.name}
                {state.selectedSource === 'file' && (
                  <span style={{ color: '#15803d', marginLeft: '4px' }}>(cargado)</span>
                )}
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
              disabled={(state.mappings || []).length === 0 || (state.mappings || []).filter(m => m.isValid && m.variableName).length === 0}
              size="large"
            >
              💾 Guardar Mapeo ({(state.mappings || []).filter(m => m.isValid && m.variableName).length} variables)
            </Button>
          </div>
        </div>
      </div>
      
      {/* ✅ REMOVIDO: DataMapperDebugPanel completamente eliminado */}
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default DataMapperCore;