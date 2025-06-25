// src/components/workflow/nodes/DataMapper/DataMapper.jsx - MEJORADO
import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Database, 
  Upload, 
  FileText, 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Link2,
  Globe,
  Code,
  RefreshCw
} from 'lucide-react';
import Button from '../../../common/Button/Button';

const DataMapper = ({ 
  isOpen, 
  onClose, 
  initialData = {}, 
  onSave,
  availableData = {} 
}) => {
  const [activeTab, setActiveTab] = useState('source'); // source, mapping, preview
  const [jsonInput, setJsonInput] = useState(initialData.jsonInput || '');
  const [parsedJson, setParsedJson] = useState(initialData.parsedJson || null);
  const [mappings, setMappings] = useState(initialData.mappings || []);
  const [jsonError, setJsonError] = useState(null);
  const [selectedSource, setSelectedSource] = useState(initialData.selectedSource || 'manual'); // manual, http-input
  const [connectedHttpInput, setConnectedHttpInput] = useState(initialData.connectedHttpInput || null);

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

  // Detectar HTTP Inputs disponibles - CORREGIDO
  const getAvailableHttpInputs = useCallback(() => {
    const httpInputs = [];
    
    console.log('🔍 Checking available data:', availableData);
    
    Object.entries(availableData).forEach(([key, value]) => {
      console.log('📊 Checking key:', key, 'value:', value);
      
      // CORREGIDO: Detectar HTTP Inputs por el patrón de clave httpInput_
      if (key.startsWith('httpInput_') && typeof value === 'object' && value !== null) {
        console.log('✅ Found HTTP Input:', key, value);
        
        httpInputs.push({
          key,
          endpoint: value.endpoint,
          method: value.method || 'GET',
          path: value.path || '/unknown',
          bodyVariable: value.bodyVariable || 'body',
          headers: value.headers || [],
          outputStructure: value.outputStructure || {},
          formFields: value.formFields || [],
          contentType: value.contentType || 'application/json',
          enableBodyCapture: value.enableBodyCapture || false
        });
      }
      
      // También buscar por patrones antiguos para compatibilidad
      else if (key.includes('http-input') && typeof value === 'object' && value !== null && value.endpoint) {
        console.log('✅ Found HTTP Input (legacy pattern):', key, value);
        
        httpInputs.push({
          key,
          endpoint: value.endpoint,
          method: value.method || 'GET',
          path: value.path || '/unknown',
          bodyVariable: value.bodyVariable || 'body',
          headers: value.headers || [],
          outputStructure: value.outputStructure || {},
          formFields: value.formFields || [],
          contentType: value.contentType || 'application/json',
          enableBodyCapture: value.enableBodyCapture || false
        });
      }
    });
    
    console.log('📡 Available HTTP Inputs found:', httpInputs.length, httpInputs);
    return httpInputs;
  }, [availableData]);

  const availableHttpInputs = getAvailableHttpInputs();

  const dataTypes = [
    { value: 'string', label: 'String', color: '#16a34a' },
    { value: 'number', label: 'Number', color: '#3b82f6' },
    { value: 'boolean', label: 'Boolean', color: '#f59e0b' },
    { value: 'array', label: 'Array', color: '#7c3aed' },
    { value: 'object', label: 'Object', color: '#dc2626' },
    { value: 'date', label: 'Date', color: '#14b8a6' }
  ];

  const handleJsonInput = (value) => {
    setJsonInput(value);
    setJsonError(null);
    
    if (!value.trim()) {
      setParsedJson(null);
      return;
    }

    try {
      const parsed = JSON.parse(value);
      setParsedJson(parsed);
      generateMappingsFromJson(parsed);
    } catch (error) {
      setJsonError(error.message);
      setParsedJson(null);
    }
  };

  const generateMappingsFromJson = (jsonData, prefix = '') => {
    const newMappings = [];
    
    const traverse = (obj, path = prefix) => {
      if (Array.isArray(obj)) {
        newMappings.push({
          id: Date.now() + Math.random(),
          jsonPath: path,
          variableName: path.replace(/[\[\]\.]/g, '_').replace(/^_/, ''),
          dataType: 'array',
          jsonType: 'array',
          isValid: true,
          sourceValue: `Array[${obj.length}]`,
          source: selectedSource
        });
        
        if (obj.length > 0) {
          traverse(obj[0], `${path}[0]`);
        }
      } else if (obj !== null && typeof obj === 'object') {
        if (path) {
          newMappings.push({
            id: Date.now() + Math.random(),
            jsonPath: path,
            variableName: path.replace(/[\[\]\.]/g, '_').replace(/^_/, ''),
            dataType: 'object',
            jsonType: 'object',
            isValid: true,
            sourceValue: 'Object',
            source: selectedSource
          });
        }
        
        Object.keys(obj).forEach(key => {
          const newPath = path ? `${path}.${key}` : key;
          traverse(obj[key], newPath);
        });
      } else {
        const type = obj === null ? 'null' : typeof obj;
        newMappings.push({
          id: Date.now() + Math.random(),
          jsonPath: path,
          variableName: path.replace(/[\[\]\.]/g, '_').replace(/^_/, ''),
          dataType: inferDataType(obj),
          jsonType: type,
          isValid: true,
          sourceValue: obj,
          source: selectedSource
        });
      }
    };

    traverse(jsonData);
    setMappings(newMappings);
  };

  const inferDataType = (value) => {
    if (value === null) return 'string';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (typeof value === 'string') {
      if (/^\d{4}-\d{2}-\d{2}/.test(value)) return 'date';
      return 'string';
    }
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return 'string';
  };

  const connectToHttpInput = (httpInputData) => {
    console.log('🔗 Connecting to HTTP Input:', httpInputData);
    
    setConnectedHttpInput(httpInputData);
    setSelectedSource('http-input');
    
    // Generar estructura de ejemplo basada en el HTTP Input y tipo de contenido
    const exampleStructure = {
      metadata: {
        endpoint: httpInputData.endpoint,
        method: httpInputData.method,
        timestamp: new Date().toISOString(),
        contentType: httpInputData.contentType
      }
    };

    // Agregar estructura de headers si existen
    if (httpInputData.headers && httpInputData.headers.length > 0) {
      exampleStructure.headers = {};
      httpInputData.headers.forEach(header => {
        if (header.variable) {
          exampleStructure.headers[header.variable] = header.defaultValue || `example_${header.variable}`;
        }
      });
    }

    // Generar estructura del body según el tipo de contenido
    if (httpInputData.enableBodyCapture && httpInputData.bodyVariable) {
      switch (httpInputData.contentType) {
        case 'application/json':
          exampleStructure[httpInputData.bodyVariable] = {
            id: 123,
            name: "Juan Pérez",
            email: "juan@ejemplo.com",
            created_at: new Date().toISOString(),
            data: {
              field1: "valor1",
              field2: 42,
              field3: true,
              nested: {
                subfield: "sub-valor"
              }
            }
          };
          break;
          
        case 'application/x-www-form-urlencoded':
        case 'multipart/form-data':
          // Si hay campos definidos, usar esos
          if (httpInputData.formFields && httpInputData.formFields.length > 0) {
            const formExample = {};
            httpInputData.formFields.forEach(field => {
              switch (field.type) {
                case 'email':
                  formExample[field.name] = 'usuario@ejemplo.com';
                  break;
                case 'number':
                  formExample[field.name] = 123;
                  break;
                case 'boolean':
                  formExample[field.name] = true;
                  break;
                case 'date':
                  formExample[field.name] = '2024-06-24';
                  break;
                case 'file':
                  formExample[field.name] = '[archivo_subido.pdf]';
                  break;
                default:
                  formExample[field.name] = `ejemplo_${field.name}`;
              }
            });
            exampleStructure[httpInputData.bodyVariable] = formExample;
          } else {
            // Estructura de formulario genérica
            exampleStructure[httpInputData.bodyVariable] = {
              nombre: "Juan Pérez",
              email: "juan@ejemplo.com",
              edad: 30,
              activo: true
            };
          }
          break;
          
        case 'application/xml':
          exampleStructure[httpInputData.bodyVariable] = `<?xml version="1.0" encoding="UTF-8"?>
<data>
  <usuario>
    <id>123</id>
    <nombre>Juan Pérez</nombre>
    <email>juan@ejemplo.com</email>
    <activo>true</activo>
  </usuario>
</data>`;
          break;
          
        case 'text/plain':
          exampleStructure[httpInputData.bodyVariable] = "Contenido de texto plano del body";
          break;
          
        default:
          exampleStructure[httpInputData.bodyVariable] = "Contenido del body";
      }
    }

    const jsonString = JSON.stringify(exampleStructure, null, 2);
    console.log('📋 Generated example structure:', jsonString);
    
    setJsonInput(jsonString);
    handleJsonInput(jsonString);
  };

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

  const validateTypeCompatibility = (jsonType, targetType) => {
    const compatibilityMatrix = {
      'string': ['string', 'date'],
      'number': ['number', 'string'],
      'boolean': ['boolean', 'string'],
      'array': ['array'],
      'object': ['object'],
      'null': ['string', 'number', 'boolean']
    };
    
    return compatibilityMatrix[jsonType]?.includes(targetType) ?? false;
  };

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

  const removeMapping = (id) => {
    setMappings(prev => prev.filter(mapping => mapping.id !== id));
  };

  const handleSave = () => {
    const validMappings = mappings.filter(m => m.isValid && m.variableName);
    
    const savedData = {
      jsonInput,
      parsedJson,
      mappings: validMappings,
      selectedSource,
      connectedHttpInput,
      outputVariables: validMappings.reduce((acc, mapping) => {
        acc[mapping.variableName] = {
          type: mapping.dataType,
          jsonPath: mapping.jsonPath,
          sourceValue: mapping.sourceValue,
          source: mapping.source,
          httpInputConnected: selectedSource === 'http-input' ? connectedHttpInput?.key : null
        };
        return acc;
      }, {}),
      status: 'configured',
      createdAt: new Date().toISOString()
    };
    
    onSave(savedData);
    onClose();
  };

  const handleClose = () => {
    setJsonInput('');
    setParsedJson(null);
    setMappings([]);
    setJsonError(null);
    setSelectedSource('manual');
    setConnectedHttpInput(null);
    setActiveTab('source');
    onClose();
  };

  const loadSampleJson = () => {
    const sampleJson = {
      user: {
        id: 123,
        name: "Juan Pérez",
        email: "juan@example.com",
        active: true,
        created_at: "2023-01-15T10:30:00Z"
      },
      orders: [
        {
          id: 1001,
          amount: 99.99,
          status: "completed",
          items: ["item1", "item2"]
        }
      ],
      metadata: {
        version: "1.0",
        processed: true
      }
    };
    
    setSelectedSource('manual');
    setConnectedHttpInput(null);
    handleJsonInput(JSON.stringify(sampleJson, null, 2));
  };

  const getTypeColor = (type) => {
    return dataTypes.find(dt => dt.value === type)?.color || '#6b7280';
  };

  const renderSourceTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Source Selection */}
      <div style={{
        background: '#f0f9ff',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #bae6fd'
      }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#0c4a6e' }}>
          🔗 Seleccionar Fuente de Datos
        </h4>
        
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => {
              setSelectedSource('manual');
              setConnectedHttpInput(null);
            }}
            style={{
              padding: '12px 16px',
              border: `2px solid ${selectedSource === 'manual' ? '#3b82f6' : '#e5e7eb'}`,
              borderRadius: '8px',
              background: selectedSource === 'manual' ? '#eff6ff' : 'white',
              color: selectedSource === 'manual' ? '#1e40af' : '#374151',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
          >
            <Code size={16} />
            Entrada Manual JSON
          </button>
          
          <button
            onClick={() => setSelectedSource('http-input')}
            disabled={availableHttpInputs.length === 0}
            style={{
              padding: '12px 16px',
              border: `2px solid ${selectedSource === 'http-input' ? '#3b82f6' : '#e5e7eb'}`,
              borderRadius: '8px',
              background: selectedSource === 'http-input' ? '#eff6ff' : 'white',
              color: selectedSource === 'http-input' ? '#1e40af' : availableHttpInputs.length === 0 ? '#9ca3af' : '#374151',
              cursor: availableHttpInputs.length === 0 ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s',
              opacity: availableHttpInputs.length === 0 ? 0.5 : 1
            }}
          >
            <Globe size={16} />
            Desde HTTP Input ({availableHttpInputs.length})
          </button>
        </div>
      </div>

      {/* HTTP Input Selection */}
      {selectedSource === 'http-input' && (
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
            📡 Seleccionar HTTP Input
          </h4>
          
          {availableHttpInputs.length === 0 ? (
            <div style={{
              padding: '40px 20px',
              textAlign: 'center',
              color: '#6b7280',
              border: '2px dashed #e5e7eb',
              borderRadius: '8px'
            }}>
              <Globe size={32} style={{ margin: '0 auto 12px', display: 'block' }} />
              <div style={{ fontSize: '14px', marginBottom: '4px' }}>No hay HTTP Inputs configurados</div>
              <div style={{ fontSize: '12px' }}>
                Primero configura un nodo HTTP Input en el workflow
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {availableHttpInputs.map((httpInput, index) => (
                <div
                  key={index}
                  style={{
                    background: connectedHttpInput?.key === httpInput.key ? '#f0fdf4' : '#f9fafb',
                    border: `2px solid ${connectedHttpInput?.key === httpInput.key ? '#16a34a' : '#e5e7eb'}`,
                    borderRadius: '8px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => connectToHttpInput(httpInput)}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '8px'
                  }}>
                    <div>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#374151',
                        marginBottom: '4px'
                      }}>
                        {httpInput.method} {httpInput.path}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        fontFamily: 'monospace'
                      }}>
                        {httpInput.endpoint}
                      </div>
                    </div>
                    
                    {connectedHttpInput?.key === httpInput.key && (
                      <CheckCircle size={20} color="#16a34a" />
                    )}
                  </div>
                  
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    Variables disponibles:
                    <div style={{ marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {httpInput.headers.length > 0 && (
                        <span style={{
                          padding: '2px 6px',
                          background: '#dbeafe',
                          color: '#1e40af',
                          borderRadius: '4px',
                          fontSize: '11px'
                        }}>
                          Headers: {httpInput.headers.filter(h => h.variable).length}
                        </span>
                      )}
                      {httpInput.bodyVariable && (
                        <span style={{
                          padding: '2px 6px',
                          background: '#dcfce7',
                          color: '#166534',
                          borderRadius: '4px',
                          fontSize: '11px'
                        }}>
                          Body: {httpInput.bodyVariable}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manual JSON Input */}
      {selectedSource === 'manual' && (
        <div>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
              📝 Estructura JSON
            </h4>
            <Button
              size="small"
              variant="secondary"
              onClick={loadSampleJson}
            >
              Cargar Ejemplo
            </Button>
          </div>
          
          <textarea
            value={jsonInput}
            onChange={(e) => handleJsonInput(e.target.value)}
            placeholder="Pega aquí tu estructura JSON..."
            style={{
              width: '100%',
              minHeight: '300px',
              padding: '12px',
              border: `1px solid ${jsonError ? '#dc2626' : '#d1d5db'}`,
              borderRadius: '6px',
              fontSize: '12px',
              fontFamily: 'monospace',
              resize: 'vertical',
              boxSizing: 'border-box'
            }}
          />
          
          {jsonError && (
            <div style={{
              color: '#dc2626',
              fontSize: '12px',
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <AlertCircle size={14} />
              Error JSON: {jsonError}
            </div>
          )}
          
          {parsedJson && (
            <div style={{
              color: '#16a34a',
              fontSize: '12px',
              marginTop: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <CheckCircle size={14} />
              JSON válido - {mappings.length} campos detectados
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderMappingTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
          🗂️ Mapeo de Variables ({mappings.length})
        </h4>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            size="small"
            variant="secondary"
            icon={<RefreshCw size={14} />}
            onClick={() => {
              if (selectedSource === 'http-input' && connectedHttpInput) {
                connectToHttpInput(connectedHttpInput);
              } else if (jsonInput) {
                handleJsonInput(jsonInput);
              }
            }}
            disabled={!jsonInput && !connectedHttpInput}
          >
            Regenerar
          </Button>
          
          <Button
            size="small"
            variant="primary"
            icon={<Plus size={14} />}
            onClick={addCustomMapping}
          >
            Agregar
          </Button>
        </div>
      </div>
      
      <div style={{
        flex: 1,
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        overflow: 'hidden'
      }}>
        {mappings.length === 0 ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <Database size={32} style={{ margin: '0 auto 12px', display: 'block' }} />
            <div>No hay datos para mapear</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              {selectedSource === 'manual' 
                ? 'Carga un JSON para ver los campos disponibles'
                : 'Selecciona un HTTP Input para generar el mapeo'
              }
            </div>
          </div>
        ) : (
          <div style={{
            height: '400px',
            overflow: 'auto',
            padding: '8px'
          }}>
            {mappings.map((mapping, index) => (
              <div
                key={mapping.id}
                style={{
                  background: mapping.isValid ? '#f9fafb' : '#fef2f2',
                  border: `1px solid ${mapping.isValid ? '#e5e7eb' : '#fecaca'}`,
                  borderRadius: '6px',
                  padding: '12px',
                  marginBottom: '8px'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: '8px'
                }}>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      marginBottom: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      {mapping.source === 'http-input' && <Globe size={12} />}
                      {mapping.source === 'manual' && <Code size={12} />}
                      JSON Path: <code>{mapping.jsonPath || 'custom'}</code>
                    </div>
                    
                    <input
                      type="text"
                      value={mapping.variableName}
                      onChange={(e) => updateMapping(mapping.id, 'variableName', e.target.value)}
                      placeholder="nombre_variable"
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '13px',
                        marginBottom: '8px',
                        boxSizing: 'border-box'
                      }}
                    />
                    
                    <div style={{
                      display: 'flex',
                      gap: '8px',
                      alignItems: 'center'
                    }}>
                      <select
                        value={mapping.dataType}
                        onChange={(e) => updateMapping(mapping.id, 'dataType', e.target.value)}
                        style={{
                          padding: '4px 8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '12px',
                          background: 'white'
                        }}
                      >
                        {dataTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                      
                      <div style={{
                        fontSize: '11px',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        background: getTypeColor(mapping.jsonType),
                        color: 'white',
                        fontWeight: '500'
                      }}>
                        {mapping.jsonType}
                      </div>
                      
                      {!mapping.isValid && (
                        <AlertCircle size={14} color="#dc2626" title="Tipos incompatibles" />
                      )}
                    </div>
                    
                    {mapping.sourceValue && (
                      <div style={{
                        fontSize: '11px',
                        color: '#6b7280',
                        marginTop: '4px',
                        fontFamily: 'monospace'
                      }}>
                        Valor: {typeof mapping.sourceValue === 'object' 
                          ? JSON.stringify(mapping.sourceValue).substring(0, 50) + '...'
                          : String(mapping.sourceValue).substring(0, 50)
                        }
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={() => removeMapping(mapping.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px',
                      color: '#dc2626'
                    }}
                    title="Eliminar mapeo"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderPreviewTab = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Connection Info */}
      {connectedHttpInput && (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #bbf7d0',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <h5 style={{
            margin: '0 0 8px 0',
            fontSize: '14px',
            color: '#15803d',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Link2 size={16} />
            Conectado a HTTP Input
          </h5>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
            fontSize: '12px'
          }}>
            <div>
              <strong>Endpoint:</strong>
              <div style={{
                fontFamily: 'monospace',
                background: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #bbf7d0',
                marginTop: '2px'
              }}>
                {connectedHttpInput.method} {connectedHttpInput.path}
              </div>
            </div>
            
            <div>
              <strong>Variables de Entrada:</strong>
              <div style={{
                background: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #bbf7d0',
                marginTop: '2px'
              }}>
                {connectedHttpInput.headers.filter(h => h.variable).length > 0 && (
                  <div>Headers: {connectedHttpInput.headers.filter(h => h.variable).length}</div>
                )}
                {connectedHttpInput.bodyVariable && (
                  <div>Body: {connectedHttpInput.bodyVariable}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Output Variables Preview */}
      <div>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
          📤 Variables de Salida ({mappings.filter(m => m.isValid && m.variableName).length})
        </h4>
        
        {mappings.filter(m => m.isValid && m.variableName).length === 0 ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: '#6b7280',
            border: '2px dashed #e5e7eb',
            borderRadius: '8px'
          }}>
            <FileText size={32} style={{ margin: '0 auto 12px', display: 'block' }} />
            <div>No hay variables mapeadas</div>
            <div style={{ fontSize: '12px', marginTop: '4px' }}>
              Configura el mapeo en la pestaña anterior
            </div>
          </div>
        ) : (
          <div style={{
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <div style={{
              background: '#f3f4f6',
              padding: '8px 12px',
              borderBottom: '1px solid #e5e7eb',
              fontSize: '12px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Variables que estarán disponibles en nodos siguientes
            </div>
            
            <div style={{
              maxHeight: '300px',
              overflow: 'auto',
              padding: '8px'
            }}>
              {mappings.filter(m => m.isValid && m.variableName).map((mapping, index) => (
                <div
                  key={mapping.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: index % 2 === 0 ? '#f9fafb' : 'white',
                    borderRadius: '4px',
                    marginBottom: '4px'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontSize: '13px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '2px'
                    }}>
                      mapper.{mapping.variableName}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#6b7280',
                      fontFamily: 'monospace'
                    }}>
                      {mapping.jsonPath} → {mapping.dataType}
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    {mapping.source === 'http-input' && <Globe size={12} color="#0ea5e9" />}
                    {mapping.source === 'manual' && <Code size={12} color="#7c3aed" />}
                    
                    <div style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      background: getTypeColor(mapping.dataType),
                      color: 'white',
                      fontWeight: '500'
                    }}>
                      {mapping.dataType}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* JSON Structure Preview */}
      {parsedJson && (
        <div>
          <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600' }}>
            🔍 Estructura JSON Detectada
          </h4>
          
          <div style={{
            background: '#1f2937',
            color: '#e5e7eb',
            padding: '12px',
            borderRadius: '6px',
            fontSize: '11px',
            fontFamily: 'monospace',
            maxHeight: '200px',
            overflow: 'auto'
          }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(parsedJson, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* Integration Guide */}
      <div style={{
        background: '#fefbf3',
        border: '1px solid #fed7aa',
        borderRadius: '8px',
        padding: '16px'
      }}>
        <h5 style={{
          margin: '0 0 8px 0',
          fontSize: '13px',
          color: '#c2410c',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          💡 Guía de Integración
        </h5>
        
        <div style={{ fontSize: '12px', color: '#c2410c', lineHeight: '1.5' }}>
          <div style={{ marginBottom: '8px' }}>
            <strong>1. Flujo de Datos:</strong> HTTP Input → Data Mapper → Otros Nodos
          </div>
          <div style={{ marginBottom: '8px' }}>
            <strong>2. Variables:</strong> Todas las variables mapeadas estarán disponibles con el prefijo "mapper."
          </div>
          <div>
            <strong>3. Conexión:</strong> Conecta la salida de este nodo con Script Processor o Layout Designer
          </div>
        </div>
      </div>
    </div>
  );

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
            <div><strong>Fuente:</strong> {selectedSource === 'http-input' ? '🌐 HTTP Input' : '📝 Manual'}</div>
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
          {activeTab === 'source' && renderSourceTab()}
          {activeTab === 'mapping' && renderMappingTab()}
          {activeTab === 'preview' && renderPreviewTab()}
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