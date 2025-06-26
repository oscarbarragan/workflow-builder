// src/components/workflow/nodes/DataTransformer/DataTransformer.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Zap, 
  Play, 
  RotateCcw,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  Database,
  ArrowRight,
  AlertTriangle
} from 'lucide-react';
import Button from '../../../common/Button/Button';
import DataTransformerTabs from './DataTransformerTabs';
import { validateDataTransformerConfig } from './DataTransformerUtils';
import { applyTransformation } from './TransformationEngine';

const DataTransformer = ({ 
  isOpen, 
  onClose, 
  initialData = {}, 
  onSave,
  availableData = {} 
}) => {
  const [transformations, setTransformations] = useState(initialData.transformations || []);
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(initialData.executionResult || null);
  const [executionError, setExecutionError] = useState(null);
  const [outputVariables, setOutputVariables] = useState(initialData.outputVariables || {});
  const [showPreview, setShowPreview] = useState(true);
  const [activeTab, setActiveTab] = useState('transformations');

  // Disable ReactFlow when modal is open
  useEffect(() => {
    if (isOpen) {
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

  // Initialize transformations from available data
  useEffect(() => {
    if (isOpen && Object.keys(availableData).length > 0 && transformations.length === 0) {
      initializeTransformations();
    }
  }, [isOpen, availableData]);

  const initializeTransformations = () => {
    const newTransformations = [];
    
    Object.entries(availableData).forEach(([key, value]) => {
      const dataType = inferDataType(value);
      
      newTransformations.push({
        id: `transform_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        inputVariable: key,
        outputVariable: key, // ✅ CORREGIDO: Mantener el mismo nombre por defecto
        inputValue: value,
        dataType: dataType,
        transformationType: 'none', // No transformation by default
        transformationConfig: {},
        enabled: false, // Disabled by default
        isValid: true
      });
    });
    
    setTransformations(newTransformations);
  };

  const inferDataType = (value) => {
    if (value === null || value === undefined) return 'string';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'string') {
      // Try to detect specific string types
      if (/^\d{4}-\d{2}-\d{2}/.test(value)) return 'date';
      if (/^[\w\.-]+@[\w\.-]+\.\w+$/.test(value)) return 'email';
      if (/^https?:\/\//.test(value)) return 'url';
      return 'string';
    }
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return 'string';
  };

  const updateTransformation = (id, field, value) => {
    setTransformations(prev => prev.map(transform => {
      if (transform.id === id) {
        const updated = { ...transform, [field]: value };
        
        // Reset transformation config when type changes
        if (field === 'transformationType') {
          updated.transformationConfig = {};
        }
        
        // ✅ CORREGIDO: Solo cambiar outputVariable si explícitamente se modifica
        // NO cambiar automáticamente cuando cambia inputVariable
        if (field === 'inputVariable' && transform.outputVariable === transform.inputVariable) {
          // Solo actualizar si el outputVariable era igual al inputVariable anterior
          updated.outputVariable = value;
        }
        
        // Validate transformation
        updated.isValid = validateTransformation(updated);
        
        return updated;
      }
      return transform;
    }));
  };

  const validateTransformation = (transformation) => {
    if (!transformation.enabled) return true;
    if (!transformation.inputVariable) return false;
    if (!transformation.outputVariable) return false;
    if (transformation.transformationType === 'none') return true;
    
    // Additional validation based on transformation type
    return true;
  };

  const executeTransformations = async () => {
    setIsExecuting(true);
    setExecutionError(null);
    setExecutionResult(null);
    
    try {
      const enabledTransformations = transformations.filter(t => t.enabled && t.isValid);
      const results = {};
      const newOutputVariables = {};
      
      for (const transformation of enabledTransformations) {
        const inputValue = availableData[transformation.inputVariable];
        
        try {
          const transformedValue = applyTransformation(
            inputValue,
            transformation.transformationType,
            transformation.transformationConfig
          );
          
          results[transformation.outputVariable] = transformedValue;
          
          newOutputVariables[transformation.outputVariable] = {
            type: inferDataType(transformedValue),
            value: transformedValue,
            originalValue: inputValue,
            transformationType: transformation.transformationType,
            inputVariable: transformation.inputVariable
          };
          
        } catch (error) {
          console.error(`Error transforming ${transformation.inputVariable}:`, error);
          results[transformation.outputVariable] = inputValue; // Fallback to original value
        }
      }
      
      setExecutionResult(results);
      setOutputVariables(newOutputVariables);
      
    } catch (error) {
      setExecutionError(error.message);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSave = () => {
    const validation = validateDataTransformerConfig({
      transformations,
      outputVariables,
      executionResult
    });

    if (!validation.isValid) {
      alert('Error de validación: ' + validation.errors.join('\n'));
      return;
    }

    const savedData = {
      transformations,
      outputVariables,
      executionResult,
      status: 'configured',
      createdAt: new Date().toISOString(),
      lastExecuted: executionResult ? new Date().toISOString() : null,
      statistics: {
        totalTransformations: transformations.length,
        enabledTransformations: transformations.filter(t => t.enabled).length,
        validTransformations: transformations.filter(t => t.isValid).length,
        outputVariablesCount: Object.keys(outputVariables).length
      }
    };
    
    onSave(savedData);
    onClose();
  };

  const handleClose = () => {
    setTransformations([]);
    setExecutionResult(null);
    setExecutionError(null);
    setOutputVariables({});
    setActiveTab('transformations');
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      style={{
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
      }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div 
        style={{
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
        }}
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
            ⚡ Data Transformer
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
            <div><strong>Input:</strong> {Object.keys(availableData).length}</div>
            <div><strong>Transformations:</strong> {transformations.filter(t => t.enabled).length}/{transformations.length}</div>
            <div><strong>Output:</strong> {Object.keys(outputVariables).length}</div>
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

        {/* Toolbar */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          padding: '12px',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <Button
            variant="success"
            icon={<Play size={14} />}
            onClick={executeTransformations}
            disabled={isExecuting || transformations.filter(t => t.enabled).length === 0}
            loading={isExecuting}
          >
            {isExecuting ? 'Ejecutando...' : 'Ejecutar Transformaciones'}
          </Button>
          
          <Button
            variant="secondary"
            icon={<RotateCcw size={14} />}
            onClick={initializeTransformations}
          >
            Reinicializar
          </Button>
          
          <Button
            variant="secondary"
            icon={showPreview ? <EyeOff size={14} /> : <Eye size={14} />}
            onClick={() => setShowPreview(!showPreview)}
            size="small"
          >
            {showPreview ? 'Ocultar' : 'Mostrar'} Vista Previa
          </Button>

          {/* Stats */}
          <div style={{
            marginLeft: 'auto',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            fontSize: '12px',
            color: '#6b7280'
          }}>
            <span style={{
              background: '#eff6ff',
              color: '#1e40af',
              padding: '4px 8px',
              borderRadius: '4px'
            }}>
              📊 {transformations.length} Total
            </span>
            <span style={{
              background: '#f0fdf4',
              color: '#15803d',
              padding: '4px 8px',
              borderRadius: '4px'
            }}>
              ✅ {transformations.filter(t => t.enabled).length} Activas
            </span>
            {executionError && (
              <span style={{
                background: '#fef2f2',
                color: '#dc2626',
                padding: '4px 8px',
                borderRadius: '4px'
              }}>
                ❌ Error
              </span>
            )}
          </div>
        </div>

        {/* Tabs Content */}
        <DataTransformerTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          transformations={transformations}
          updateTransformation={updateTransformation}
          availableData={availableData}
          outputVariables={outputVariables}
          executionResult={executionResult}
          executionError={executionError}
          showPreview={showPreview}
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
            ⚡ <strong>Data Transformer:</strong> Aplica transformaciones a tus datos según el tipo
            {Object.keys(outputVariables).length > 0 && (
              <span style={{ marginLeft: '20px', color: '#3b82f6' }}>
                📊 <strong>{Object.keys(outputVariables).length}</strong> variables transformadas
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
              size="large"
              icon={<Save size={16} />}
              disabled={transformations.filter(t => t.enabled && t.isValid).length === 0}
            >
              💾 Guardar Transformaciones
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DataTransformer;