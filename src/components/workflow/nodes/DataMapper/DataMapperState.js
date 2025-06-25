// src/components/workflow/nodes/DataMapper/DataMapperState.js - SIMPLIFICADO
import React, { useState, useEffect, useMemo } from 'react';
import { 
  validateJsonInput,
  generateMappingsFromJson,
  readFileAsText,
  getSampleJson
} from './DataMapperUtils';

const useDataMapperState = (initialData, availableData) => {
  // State management
  const [activeTab, setActiveTab] = useState('source');
  const [jsonInput, setJsonInput] = useState(initialData.jsonInput || '');
  const [parsedJson, setParsedJson] = useState(initialData.parsedJson || null);
  const [mappings, setMappings] = useState(initialData.mappings || []);
  const [jsonError, setJsonError] = useState(null);
  
  // CORREGIDO: Determinar selectedSource basado en si hay uploadedFile en initialData
  const [selectedSource, setSelectedSource] = useState(() => {
    if (initialData.uploadedFile) {
      return 'file';
    }
    return initialData.selectedSource || 'manual';
  });
  
  // File upload state - CORREGIDO: Restaurar archivo si existe en initialData
  const [uploadedFile, setUploadedFile] = useState(() => {
    if (initialData.uploadedFile) {
      // Crear un objeto File-like desde los datos guardados
      return {
        name: initialData.uploadedFile.name,
        size: initialData.uploadedFile.size,
        type: initialData.uploadedFile.type,
        lastModified: initialData.uploadedFile.lastModified
      };
    }
    return null;
  });
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  // ANÁLISIS: Detectar HTTP Input conectado
  const httpInputAnalysis = useMemo(() => {
    console.log('🔍 Analyzing available data for HTTP Input:', availableData);
    
    // Asegurar que availableData existe
    if (!availableData || typeof availableData !== 'object') {
      return {
        hasHttpInput: false,
        headers: [],
        bodyVariable: null
      };
    }
    
    const httpInputKeys = Object.keys(availableData).filter(k => k.startsWith('httpInput_'));
    const headerKeys = Object.keys(availableData).filter(k => k.startsWith('headers.'));
    const hasRequestBody = !!availableData.requestBody;
    
    if (httpInputKeys.length === 0) {
      return {
        hasHttpInput: false,
        headers: [],
        bodyVariable: null
      };
    }
    
    const httpInputData = availableData[httpInputKeys[0]];
    
    // Asegurar que httpInputData existe
    if (!httpInputData || typeof httpInputData !== 'object') {
      return {
        hasHttpInput: false,
        headers: [],
        bodyVariable: null
      };
    }
    
    return {
      hasHttpInput: true,
      httpInputKey: httpInputKeys[0],
      httpInputData: httpInputData,
      headers: headerKeys.map(key => ({
        key: key.replace('headers.', ''),
        variable: key,
        value: availableData[key]
      })),
      bodyVariable: httpInputData.bodyVariable || 'requestBody',
      hasRequestBody: hasRequestBody,
      endpoint: httpInputData.endpoint,
      method: httpInputData.method,
      path: httpInputData.path
    };
  }, [availableData]);

  // Handle source change - SIMPLIFICADO
  const handleSourceChange = (newSource) => {
    console.log(`🔄 Changing source to: ${newSource}`);
    
    if (selectedSource === newSource) return;
    
    // Limpiar estado anterior
    setJsonInput('');
    setParsedJson(null);
    setMappings([]);
    setJsonError(null);
    setUploadedFile(null);
    
    setSelectedSource(newSource);
    
    if (newSource === 'manual') {
      loadSampleJson();
    }
  };

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
      console.log('📁 File loaded:', file.name);
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
      
      // MEJORADO: Generar mappings combinando JSON + Headers
      const jsonMappings = generateMappingsFromJson(validation.parsed, selectedSource);
      const headerMappings = generateHeaderMappings();
      
      const allMappings = [...jsonMappings, ...headerMappings];
      setMappings(allMappings);
      
      console.log('✅ Generated mappings:', {
        jsonMappings: jsonMappings.length,
        headerMappings: headerMappings.length,
        total: allMappings.length
      });
    } else {
      setJsonError(validation.error);
      setParsedJson(null);
      setMappings([]);
    }
  };

  // NUEVO: Generar mappings para headers
  const generateHeaderMappings = () => {
    if (!httpInputAnalysis || !httpInputAnalysis.hasHttpInput || !httpInputAnalysis.headers) {
      return [];
    }
    
    return httpInputAnalysis.headers.map(header => ({
      id: `header_${Date.now()}_${Math.random()}`,
      jsonPath: `headers.${header.key}`,
      variableName: `header_${header.key}`,
      dataType: 'string',
      jsonType: 'string',
      isValid: true,
      sourceValue: header.value?.defaultValue || `[Header: ${header.key}]`,
      source: 'http-header',
      httpInputConnected: true
    }));
  };

  // Update mapping
  const updateMapping = (id, field, value) => {
    setMappings(prev => prev.map(mapping => {
      if (mapping.id === id) {
        const updated = { ...mapping, [field]: value };
        
        if (field === 'dataType') {
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
      variableName: `custom_variable_${mappings.length + 1}`,
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
      uploadedFile,
      isProcessingFile,
      
      // NUEVO: HTTP Input analysis
      httpInputAnalysis,
      hasHttpInputsAvailable: httpInputAnalysis.hasHttpInput
    },
    actions: {
      setActiveTab,
      handleSourceChange,
      handleFileUpload,
      clearFile,
      handleJsonInput,
      updateMapping,
      addCustomMapping,
      removeMapping,
      loadSampleJson,
      reset
    }
  };
};

export default useDataMapperState;