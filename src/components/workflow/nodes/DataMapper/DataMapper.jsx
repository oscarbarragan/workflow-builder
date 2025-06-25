// src/components/workflow/nodes/DataMapper/DataMapper.jsx - REFACTORIZADO Y DIVIDIDO
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Database, 
  FileText, 
  Link2
} from 'lucide-react';
import Button from '../../../common/Button/Button';
import { SourceTab, MappingTab, PreviewTab } from './DataMapperTabs';
import { 
  dataTypes,
  getTypeColor,
  inferDataType,
  validateTypeCompatibility,
  generateMappingsFromJson,
  readFileAsText,
  getAvailableHttpInputs,
  generateHttpInputStructure,
  getSampleJson,
  validateJsonInput,
  createSavedData
} from './DataMapperUtils';

const DataMapper = ({ 
  isOpen, 
  onClose, 
  initialData = {}, 
  onSave,
  availableData = {} 
}) => {
  // State management
  const [activeTab, setActiveTab] = useState('source');
  const [jsonInput, setJsonInput] = useState(initialData.jsonInput || '');
  const [parsedJson, setParsedJson] = useState(initialData.parsedJson || null);
  const [mappings, setMappings] = useState(initialData.mappings || []);
  const [jsonError, setJsonError] = useState(null);
  const [selectedSource, setSelectedSource] = useState(initialData.selectedSource || 'manual');
  const [connectedHttpInput, setConnectedHttpInput] = useState(initialData.connectedHttpInput || null);
  
  // File upload state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  console.log('🔍 DataMapper - Available Data:', availableData);

  // Get available HTTP Inputs
  const availableHttpInputs = getAvailableHttpInputs(availableData);

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

  // Handle file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json')) {
      setJsonError('Por favor selecciona un archivo JSON válido');
      return;
    }

    setIsProcessingFile(true);
    setUploadedFile(file);
    setJsonError(null);

    try {
      const fileContent = await readFileAsText(file);
      console.log('📁 File loaded:', file.name, 'Size:', file.size, 'bytes');
      
      setSelectedSource('file');
      setConnectedHttpInput(null);
      handleJsonInput(fileContent);
      
    } catch (error) {
      console.error('❌ Error reading file:', error);
      setJsonError(`Error al leer el archivo: ${error.message}`);
      setUploadedFile(null);
    } finally {
      setIsProcessingFile(false);
    }
  };

  // Clear file selection
  const clearFile = () => {
    setUploadedFile(null);
    if (selectedSource === 'file') {
      setSelectedSource('manual');
      setJsonInput('');
      setParsedJson(null);
      setMappings([]);
    }
  };

  // Handle JSON input
  const handleJsonInput = (value) => {
    setJsonInput(value);
    setJsonError(null);
    
    if (!value.trim()) {
      setParsedJson(null);
      return;
    }

    const validation = validateJsonInput(value);
    
    if (validation.isValid) {
      setParsedJson(validation.parsed);
      const newMappings = generateMappingsFromJson(validation.parsed, selectedSource);
      setMappings(newMappings);
    } else {
      setJsonError(validation.error);
      setParsedJson(null);
    }
  };

  // Connect to HTTP Input
  const connectToHttpInput = (httpInputData) => {
    console.log('🔗 Connecting to HTTP Input:', httpInputData);
    
    setConnectedHttpInput(httpInputData);
    setSelectedSource('http-input');
    setUploadedFile(null);
    
    // Generate realistic structure based on HTTP Input
    const exampleStructure = generateHttpInputStructure(httpInputData);
    
    const jsonString = JSON.stringify(exampleStructure, null, 2);
    console.log('📋 Generated HTTP Input structure:', jsonString);
    
    setJsonInput(jsonString);
    handleJsonInput(jsonString);
  };

  // Update mapping
  const updateMapping = (id, field, value) => {
    setMappings(prev => prev.map(mapping => {
      if (mapping.id === id) {
        const updated = { ...mapping, [field]: value };
        
        if (field === 'dataType') {
          updated.isValid = validateTypeCompatibility(updated.jsonType, value);
        }
        
        return updated;
      }
      return mapping;
    }));
  };

  // Add custom mapping
  const addCustomMapping = () => {
    const newMapping = {
      id: Date.now(),
      jsonPath: '',
      variableName: `variable_${mappings.length + 1}`,
      dataType: 'string',
      jsonType: 'custom',
      isValid: true,
      sourceValue: 'Custom mapping',
      source: selectedSource
    };
    
    setMappings(prev => [...prev, newMapping]);
  };

  // Remove mapping
  const removeMapping = (id) => {
    setMappings(prev => prev.filter(mapping => mapping.id !== id));
  };

  // Load sample JSON
  const loadSampleJson = () => {
    const sampleJson = getSampleJson();
    
    setSelectedSource('manual');
    setConnectedHttpInput(null);
    setUploadedFile(null);
    handleJsonInput(JSON.stringify(sampleJson, null, 2));
  };

  // Handle save
  const handleSave = () => {
    const savedData = createSavedData({
      jsonInput,
      parsedJson,
      mappings,
      selectedSource,
      connectedHttpInput,
      uploadedFile
    });
    
    onSave(savedData);
    onClose();
  };

  // Handle close
  const handleClose = () => {
    setJsonInput('');
    setParsedJson(null);
    setMappings([]);
    setJsonError(null);
    setSelectedSource('manual');
    setConnectedHttpInput(null);
    setUploadedFile(null);
    setActiveTab('source');
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
            🗂️ Data Mapper Avanzado
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
              selectedSource === 'http-input' ? '🌐 HTTP Input' : 
              selectedSource === 'file' ? '📁 Archivo' : 
              '📝 Manual'
            }</div>
            <div><strong>Mappings:</strong> {mappings.length}</div>
            <div><strong>Válidos:</strong> {mappings.filter(m => m.isValid && m.variableName).length}</div>
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

        {/* Tabs Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '2px solid #e5e7eb',
          marginBottom: '20px'
        }}>
          {[
            { id: 'source', label: '🔗 Fuente', icon: <Link2 size={14} /> },
            { id: 'mapping', label: '🗂️ Mapeo', icon: <Database size={14} /> },
            { id: 'preview', label: '👁️ Vista Previa', icon: <FileText size={14} /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '12px 20px',
                border: 'none',
                background: activeTab === tab.id ? '#3b82f6' : 'transparent',
                color: activeTab === tab.id ? 'white' : '#6b7280',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                borderRadius: '6px 6px 0 0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div style={{ flex: 1, minHeight: 0 }}>
          {activeTab === 'source' && (
            <SourceTab
              selectedSource={selectedSource}
              setSelectedSource={setSelectedSource}
              availableHttpInputs={availableHttpInputs}
              connectedHttpInput={connectedHttpInput}
              connectToHttpInput={connectToHttpInput}
              uploadedFile={uploadedFile}
              setUploadedFile={setUploadedFile}
              isProcessingFile={isProcessingFile}
              handleFileUpload={handleFileUpload}
              clearFile={clearFile}
              jsonInput={jsonInput}
              handleJsonInput={handleJsonInput}
              jsonError={jsonError}
              parsedJson={parsedJson}
              mappings={mappings}
              loadSampleJson={loadSampleJson}
            />
          )}
          
          {activeTab === 'mapping' && (
            <MappingTab
              mappings={mappings}
              updateMapping={updateMapping}
              removeMapping={removeMapping}
              addCustomMapping={addCustomMapping}
              selectedSource={selectedSource}
              connectedHttpInput={connectedHttpInput}
              jsonInput={jsonInput}
              handleJsonInput={handleJsonInput}
              dataTypes={dataTypes}
              getTypeColor={getTypeColor}
            />
          )}
          
          {activeTab === 'preview' && (
            <PreviewTab
              connectedHttpInput={connectedHttpInput}
              mappings={mappings}
              parsedJson={parsedJson}
              getTypeColor={getTypeColor}
            />
          )}
        </div>

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
            🔄 <strong>Variables mapeadas:</strong> {mappings.filter(m => m.isValid && m.variableName).length}/{mappings.length}
            {connectedHttpInput && (
              <span style={{ marginLeft: '20px', color: '#3b82f6' }}>
                📡 <strong>Conectado a:</strong> {connectedHttpInput.method} {connectedHttpInput.path}
              </span>
            )}
            {uploadedFile && (
              <span style={{ marginLeft: '20px', color: '#16a34a' }}>
                📁 <strong>Archivo:</strong> {uploadedFile.name}
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
              disabled={mappings.length === 0 || mappings.filter(m => m.isValid && m.variableName).length === 0}
              size="large"
            >
              💾 Guardar Mapeo ({mappings.filter(m => m.isValid && m.variableName).length} variables)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default DataMapper;