// src/components/workflow/nodes/DataMapper/DataMapperState.js
import React, { useState, useEffect, useMemo } from 'react';
import { 
  getAvailableHttpInputs,
  validateJsonInput,
  generateMappingsFromJson,
  readFileAsText,
  getSampleJson,
  generateHttpInputStructureFromReal
} from './DataMapperUtils';

const useDataMapperState = (initialData, availableData) => {
  // DEBUGGING: Guardar availableData en window para debugging
  React.useEffect(() => {
    window.lastAvailableData = availableData;
    console.log('🔧 WINDOW DEBUG: Saved availableData to window.lastAvailableData');
  }, [availableData]);

  // State management
  const [activeTab, setActiveTab] = useState('source');
  const [jsonInput, setJsonInput] = useState(initialData.jsonInput || '');
  const [parsedJson, setParsedJson] = useState(initialData.parsedJson || null);
  const [mappings, setMappings] = useState(initialData.mappings || []);
  const [jsonError, setJsonError] = useState(null);
  
  // FIXED: Flujo exclusivo de fuentes
  const [selectedSource, setSelectedSource] = useState(initialData.selectedSource || 'manual');
  const [connectedHttpInput, setConnectedHttpInput] = useState(initialData.connectedHttpInput || null);
  
  // File upload state
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  console.log('🔍 DataMapper State - Available Data:', availableData);

  // Get available HTTP Inputs - CORREGIDO CON NUEVA LÓGICA
  const availableHttpInputs = useMemo(() => {
    const httpInputs = getAvailableHttpInputs(availableData);
    console.log('📡 DETECTION FIX: Available HTTP Inputs encontrados:', httpInputs);
    
    // DEBUGGING: Imprimir información detallada
    console.log('🔍 DETECTION FIX: Available data keys:', Object.keys(availableData));
    console.log('🔍 DETECTION FIX: HTTP Input keys found:', Object.keys(availableData).filter(k => k.startsWith('httpInput_')));
    console.log('🔍 DETECTION FIX: Header keys found:', Object.keys(availableData).filter(k => k.startsWith('headers.')));
    console.log('🔍 DETECTION FIX: Has requestBody:', !!availableData.requestBody);
    
    return httpInputs;
  }, [availableData]);

  const hasHttpInputsAvailable = availableHttpInputs.length > 0;

  // FIXED: Determinar fuente inicial automáticamente - MEJORADO
  useEffect(() => {
    console.log('🔄 AUTO-DETECTION: Determining initial source...');
    console.log('🔄 AUTO-DETECTION: hasHttpInputsAvailable:', hasHttpInputsAvailable);
    console.log('🔄 AUTO-DETECTION: availableHttpInputs.length:', availableHttpInputs.length);
    console.log('🔄 AUTO-DETECTION: initialData.selectedSource:', initialData.selectedSource);
    
    if (!initialData.selectedSource) {
      if (hasHttpInputsAvailable && availableHttpInputs.length > 0) {
        console.log('✅ AUTO-DETECTION: Setting source to http-input');
        setSelectedSource('http-input');
        
        // Auto-conectar al primer HTTP Input si solo hay uno
        if (availableHttpInputs.length === 1) {
          console.log('✅ AUTO-DETECTION: Auto-connecting to single HTTP Input');
          setTimeout(() => connectToHttpInput(availableHttpInputs[0]), 100);
        }
      } else {
        console.log('⚠️ AUTO-DETECTION: No HTTP Inputs found, setting to manual');
        setSelectedSource('manual');
      }
    } else {
      console.log('📋 AUTO-DETECTION: Using initial source:', initialData.selectedSource);
    }
  }, [hasHttpInputsAvailable, availableHttpInputs.length, initialData.selectedSource]);

  // FIXED: Cambio de fuente exclusivo
  const handleSourceChange = (newSource) => {
    console.log(`🔄 Changing source from ${selectedSource} to ${newSource}`);
    
    // CRÍTICO: Solo limpiar si realmente cambia la fuente
    if (selectedSource === newSource) {
      console.log('🔄 Same source selected, no change needed');
      return;
    }
    
    // Limpiar estado anterior
    setJsonInput('');
    setParsedJson(null);
    setMappings([]);
    setJsonError(null);
    setUploadedFile(null);
    setConnectedHttpInput(null);
    
    setSelectedSource(newSource);
    
    // Auto-setup para la nueva fuente
    switch (newSource) {
      case 'http-input':
        if (availableHttpInputs.length === 1) {
          // Auto-conectar si solo hay un HTTP Input
          connectToHttpInput(availableHttpInputs[0]);
        }
        break;
      case 'manual':
        // Cargar ejemplo por defecto
        loadSampleJson();
        break;
      case 'file':
        // Usuario debe cargar archivo manualmente - NO hacer nada aquí
        console.log('📁 File source selected, waiting for user to upload file');
        break;
    }
  };

  // Handle file upload - CORREGIDO
  const handleFileUpload = async (event) => {
    console.log('📁 File upload triggered:', event.target.files);
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
    setJsonInput('');
    setParsedJson(null);
    setMappings([]);
    // Reset file input
    const fileInput = document.querySelector('input[type="file"][accept=".json"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Handle JSON input
  const handleJsonInput = (value) => {
    setJsonInput(value);
    setJsonError(null);
    
    if (!value.trim()) {
      setParsedJson(null);
      setMappings([]);
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
      setMappings([]);
    }
  };

  // FIXED: Connect to HTTP Input con datos reales
  const connectToHttpInput = (httpInputData) => {
    console.log('🔗 Connecting to HTTP Input:', httpInputData);
    
    setConnectedHttpInput(httpInputData);
    
    // FIXED: Generar estructura basada en datos reales del HTTP Input
    const httpInputStructure = generateHttpInputStructureFromReal(httpInputData, availableData);
    
    const jsonString = JSON.stringify(httpInputStructure, null, 2);
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
          // Validate type compatibility
          const compatibilityMatrix = {
            'string': ['string', 'date'],
            'number': ['number', 'string'],
            'boolean': ['boolean', 'string'],
            'array': ['array'],
            'object': ['object'],
            'null': ['string', 'number', 'boolean']
          };
          updated.isValid = compatibilityMatrix[updated.jsonType]?.includes(value) ?? false;
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
    handleJsonInput(JSON.stringify(sampleJson, null, 2));
  };

  // Reset state
  const reset = () => {
    setJsonInput('');
    setParsedJson(null);
    setMappings([]);
    setJsonError(null);
    setSelectedSource('manual');
    setConnectedHttpInput(null);
    setUploadedFile(null);
    setActiveTab('source');
    setIsProcessingFile(false);
  };

  return {
    state: {
      activeTab,
      jsonInput,
      parsedJson,
      mappings,
      jsonError,
      selectedSource,
      connectedHttpInput,
      uploadedFile,
      isProcessingFile,
      availableHttpInputs,
      hasHttpInputsAvailable
    },
    actions: {
      setActiveTab,
      handleSourceChange,
      handleFileUpload,
      clearFile,
      handleJsonInput,
      connectToHttpInput,
      updateMapping,
      addCustomMapping,
      removeMapping,
      loadSampleJson,
      reset
    }
  };
};

export default useDataMapperState;