// src/components/workflow/nodes/DataTransformer/DataTransformer.jsx - COMPLETO CORREGIDO
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
    console.log('🔄 Initializing transformations with available data:', availableData);
    const newTransformations = [];
    
    Object.entries(availableData).forEach(([key, value]) => {
      console.log(`🔍 Processing variable: ${key}`, value);
      
      const dataType = inferDataType(value);
      console.log(`📊 Inferred data type for ${key}: ${dataType}`);
      
      newTransformations.push({
        id: `transform_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        inputVariable: key,
        outputVariable: key, // Mantener el mismo nombre por defecto
        inputValue: value,
        dataType: dataType,
        transformationType: 'none', // No transformation by default
        transformationConfig: {},
        enabled: false, // Disabled by default
        isValid: true
      });
    });
    
    console.log('✅ Created transformations:', newTransformations);
    setTransformations(newTransformations);
  };

  // ✅ FUNCIÓN CORREGIDA: Inferencia de tipos de datos más precisa
  const inferDataType = (value) => {
    console.log('🔍 inferDataType called with:', value, typeof value);
    
    // Manejar null/undefined
    if (value === null || value === undefined) {
      console.log('➡️ Detected: null/undefined -> string');
      return 'string';
    }
    
    // Manejar primitivos primero
    if (typeof value === 'boolean') {
      console.log('➡️ Detected: boolean');
      return 'boolean';
    }
    
    if (typeof value === 'number') {
      console.log('➡️ Detected: number');
      return 'number';
    }
    
    if (typeof value === 'string') {
      console.log('➡️ Detected: string, checking patterns...');
      
      // Detectar email
      if (/^[\w\.-]+@[\w\.-]+\.\w+$/.test(value)) {
        console.log('➡️ String pattern: email');
        return 'email';
      }
      
      // Detectar URL
      if (/^https?:\/\//.test(value)) {
        console.log('➡️ String pattern: url');
        return 'url';
      }
      
      // Detectar fecha (varios formatos)
      if (/^\d{4}-\d{2}-\d{2}/.test(value) || 
          /^\d{2}\/\d{2}\/\d{4}/.test(value) || 
          !isNaN(Date.parse(value))) {
        console.log('➡️ String pattern: date');
        return 'date';
      }
      
      console.log('➡️ String pattern: generic string');
      return 'string';
    }
    
    // Manejar arrays
    if (Array.isArray(value)) {
      console.log('➡️ Detected: array');
      return 'array';
    }
    
    // ✅ CORREGIDO: Manejar objetos complejos con más precisión
    if (typeof value === 'object' && value !== null) {
      console.log('➡️ Detected: object (complex)');
      
      // Si es un objeto con propiedades específicas del Data Mapper o HTTP Input
      if (value.hasOwnProperty('type') && value.hasOwnProperty('source')) {
        console.log('➡️ Object appears to be metadata, treating as object');
        return 'object';
      }
      
      // Si es un objeto simple con pocos campos, podríamos inferir como object
      const keys = Object.keys(value);
      if (keys.length <= 10) {
        console.log('➡️ Small object, keeping as object');
        return 'object';
      }
      
      return 'object';
    }
    
    // Fallback
    console.log('➡️ Fallback: string');
    return 'string';
  };

  // ✅ FUNCIÓN MEJORADA: Inferir tipos basándose en el valor real de los datos
  const inferDataTypeFromRealValue = (value) => {
    console.log('🎯 inferDataTypeFromRealValue:', value, typeof value);
    
    // Si tenemos un objeto con metadata del Data Transformer/Mapper
    if (typeof value === 'object' && value !== null) {
      // Verificar si es metadata de nuestro sistema
      if (value.hasOwnProperty('value')) {
        console.log('🎯 Found nested value, using that instead');
        return inferDataType(value.value);
      }
      
      if (value.hasOwnProperty('type') && value.hasOwnProperty('source')) {
        console.log('🎯 Metadata object detected, inferring from type');
        return value.type || 'object';
      }
      
      if (value.hasOwnProperty('displayValue')) {
        console.log('🎯 Display value detected, inferring from that');
        return inferDataType(value.displayValue);
      }
    }
    
    return inferDataType(value);
  };

  const updateTransformation = (id, field, value) => {
    setTransformations(prev => prev.map(transform => {
      if (transform.id === id) {
        const updated = { ...transform, [field]: value };
        
        // Reset transformation config when type changes
        if (field === 'transformationType') {
          updated.transformationConfig = {};
        }
        
        // Solo cambiar outputVariable si explícitamente se modifica
        if (field === 'inputVariable' && transform.outputVariable === transform.inputVariable) {
          updated.outputVariable = value;
        }
        
        // ✅ MEJORADO: Re-inferir tipo de dato cuando cambia la variable de entrada
        if (field === 'inputVariable') {
          const newInputValue = availableData[value];
          updated.inputValue = newInputValue;
          updated.dataType = inferDataTypeFromRealValue(newInputValue);
          updated.transformationType = 'none'; // Reset to none when changing input
          updated.transformationConfig = {};
          
          console.log(`🔄 Updated data type for ${value}: ${updated.dataType}`);
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

  // ✅ FUNCIÓN CORREGIDA: executeTransformations - Pasar TODAS las variables
  const executeTransformations = async () => {
    setIsExecuting(true);
    setExecutionError(null);
    setExecutionResult(null);
    
    try {
      const enabledTransformations = transformations.filter(t => t.enabled && t.isValid);
      
      // ✅ CORREGIDO: Comenzar con TODAS las variables originales
      const results = { ...availableData }; // Copiar todas las variables originales
      const newOutputVariables = {};
      
      console.log('⚡ Starting transformation execution...');
      console.log(`⚡ Original variables: ${Object.keys(availableData).length}`);
      console.log(`⚡ Enabled transformations: ${enabledTransformations.length}`);
      
      // Aplicar las transformaciones habilitadas
      for (const transformation of enabledTransformations) {
        const inputValue = availableData[transformation.inputVariable];
        
        console.log(`🔄 Transforming: ${transformation.inputVariable} → ${transformation.outputVariable}`);
        console.log(`🔄 Transformation type: ${transformation.transformationType}`);
        
        try {
          const transformedValue = applyTransformation(
            inputValue,
            transformation.transformationType,
            transformation.transformationConfig
          );
          
          // ✅ CORREGIDO: Agregar/actualizar en results (puede sobrescribir la original)
          results[transformation.outputVariable] = transformedValue;
          
          // Guardar metadata de la transformación
          newOutputVariables[transformation.outputVariable] = {
            type: inferDataType(transformedValue),
            value: transformedValue,
            originalValue: inputValue,
            transformationType: transformation.transformationType,
            inputVariable: transformation.inputVariable
          };
          
          console.log(`✅ Transformed ${transformation.inputVariable} → ${transformation.outputVariable}:`, transformedValue);
          
        } catch (error) {
          console.error(`❌ Error transforming ${transformation.inputVariable}:`, error);
          // En caso de error, mantener el valor original
          results[transformation.outputVariable] = inputValue;
        }
      }
      
      console.log('✅ Transformation execution completed');
      console.log(`✅ Total result variables: ${Object.keys(results).length}`);
      console.log(`✅ Original variables preserved: ${Object.keys(availableData).length}`);
      console.log(`✅ New/Modified variables: ${Object.keys(newOutputVariables).length}`);
      
      setExecutionResult(results); // ✅ results ahora contiene TODAS las variables
      setOutputVariables(newOutputVariables);
      
    } catch (error) {
      console.error('❌ Execution error:', error);
      setExecutionError(error.message);
    } finally {
      setIsExecuting(false);
    }
  };

  // ✅ FUNCIÓN CORREGIDA: handleSave - Guardar TODAS las variables
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

    // ✅ CORREGIDO: Guardar TODAS las variables (originales + transformadas)
    const allVariables = {};
    
    // 1. Primero agregar TODAS las variables de entrada (originales)
    Object.entries(availableData).forEach(([key, value]) => {
      allVariables[key] = value;
      console.log(`💾 Saving original variable: ${key} = ${value}`);
    });
    
    // 2. Luego agregar/sobrescribir con las variables transformadas
    Object.entries(outputVariables).forEach(([key, varData]) => {
      allVariables[key] = varData.value;
      console.log(`💾 Saving/Updating transformed variable: ${key} = ${varData.value}`);
    });
    
    // 3. También incluir execution results si existen
    if (executionResult) {
      Object.entries(executionResult).forEach(([key, value]) => {
        allVariables[key] = value;
        console.log(`💾 Saving execution result: ${key} = ${value}`);
      });
    }

    const savedData = {
      transformations,
      outputVariables,
      executionResult,
      
      // ✅ NUEVO: Guardar los datos de entrada para pasarlos a nodos siguientes
      inputData: availableData,  // Datos originales de entrada
      allVariables: allVariables, // Todas las variables (originales + transformadas)
      
      status: 'configured',
      createdAt: new Date().toISOString(),
      lastExecuted: executionResult ? new Date().toISOString() : null,
      statistics: {
        totalTransformations: transformations.length,
        enabledTransformations: transformations.filter(t => t.enabled).length,
        validTransformations: transformations.filter(t => t.isValid).length,
        outputVariablesCount: Object.keys(outputVariables).length,
        totalVariablesCount: Object.keys(allVariables).length, // ✅ NUEVO
        originalVariablesCount: Object.keys(availableData).length // ✅ NUEVO
      }
    };
    
    console.log('💾 Data Transformer saving data:', savedData);
    console.log(`💾 Total variables being passed: ${Object.keys(allVariables).length}`);
    console.log(`💾 Original variables: ${Object.keys(availableData).length}`);
    console.log(`💾 Transformed variables: ${Object.keys(outputVariables).length}`);
    
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