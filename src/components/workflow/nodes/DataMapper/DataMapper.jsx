// src/components/workflow/nodes/DataMapper/DataMapper.jsx
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
  Link2
} from 'lucide-react';
import Button from '../../../common/Button/Button';

const DataMapper = ({ 
  isOpen, 
  onClose, 
  initialData = {}, 
  onSave,
  availableData = {} 
}) => {
  const [jsonInput, setJsonInput] = useState(initialData.jsonInput || '');
  const [parsedJson, setParsedJson] = useState(initialData.parsedJson || null);
  const [mappings, setMappings] = useState(initialData.mappings || []);
  const [jsonError, setJsonError] = useState(null);
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  // Disable ReactFlow when modal is open
  useEffect(() => {
    if (isOpen) {
      console.log('🗂️ Data Mapper opened - disabling ReactFlow');
      
      const reactFlowWrapper = document.querySelector('.react-flow');
      if (reactFlowWrapper) {
        reactFlowWrapper.style.pointerEvents = 'none';
        reactFlowWrapper.style.userSelect = 'none';
        console.log('✅ ReactFlow disabled');
      }
      
      document.body.style.overflow = 'hidden';
      
      return () => {
        console.log('🗂️ Data Mapper closed - re-enabling ReactFlow');
        if (reactFlowWrapper) {
          reactFlowWrapper.style.pointerEvents = 'auto';
          reactFlowWrapper.style.userSelect = 'auto';
        }
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

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

  const generateMappingsFromJson = (jsonData) => {
    const newMappings = [];
    
    const traverse = (obj, path = '') => {
      if (Array.isArray(obj)) {
        newMappings.push({
          id: Date.now() + Math.random(),
          jsonPath: path,
          variableName: path.replace(/[\[\]\.]/g, '_').replace(/^_/, ''),
          dataType: 'array',
          jsonType: 'array',
          isValid: true,
          sourceValue: `Array[${obj.length}]`
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
            sourceValue: 'Object'
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
          sourceValue: obj
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
      // Try to detect dates
      if (/^\d{4}-\d{2}-\d{2}/.test(value)) return 'date';
      return 'string';
    }
    if (Array.isArray(value)) return 'array';
    if (typeof value === 'object') return 'object';
    return 'string';
  };

  const updateMapping = (id, field, value) => {
    setMappings(prev => prev.map(mapping => {
      if (mapping.id === id) {
        const updated = { ...mapping, [field]: value };
        
        // Validate type compatibility
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
      sourceValue: 'Custom mapping'
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
      outputVariables: validMappings.reduce((acc, mapping) => {
        acc[mapping.variableName] = {
          type: mapping.dataType,
          jsonPath: mapping.jsonPath,
          sourceValue: mapping.sourceValue
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
    onClose();
  };

  const loadSampleJson = () => {
    const sampleJson = {
      "user": {
        "id": 123,
        "name": "Juan Pérez",
        "email": "juan@example.com",
        "active": true,
        "created_at": "2023-01-15T10:30:00Z"
      },
      "orders": [
        {
          "id": 1001,
          "amount": 99.99,
          "status": "completed",
          "items": ["item1", "item2"]
        },
        {
          "id": 1002,
          "amount": 149.50,
          "status": "pending",
          "items": ["item3"]
        }
      ],
      "metadata": {
        "version": "1.0",
        "processed": true
      }
    };
    
    handleJsonInput(JSON.stringify(sampleJson, null, 2));
  };

  const getTypeColor = (type) => {
    return dataTypes.find(dt => dt.value === type)?.color || '#6b7280';
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
            🗂️ Data Mapper - Mapeo de Datos JSON
          </h2>
          
          {/* Debug info en el header */}
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            fontFamily: 'monospace',
            textAlign: 'center',
            background: '#f3f4f6',
            padding: '4px 8px',
            borderRadius: '4px'
          }}>
            <div><strong>Mappings:</strong> {mappings.length}</div>
            <div><strong>Valid:</strong> {mappings.filter(m => m.isValid && m.variableName).length}</div>
            <div><strong>JSON:</strong> {parsedJson ? '✅ Válido' : '❌ No válido'}</div>
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
              fontWeight: 'bold',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#f3f4f6';
              e.target.style.color = '#374151';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'none';
              e.target.style.color = '#6b7280';
            }}
          >
            ✕
          </button>
        </div>

        {/* Header Info */}
        <div style={{
          background: '#eff6ff',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid #bfdbfe',
          marginBottom: '20px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '4px'
          }}>
            <Database size={16} color="#3b82f6" />
            <span style={{ fontWeight: '600', color: '#1e40af' }}>
              Mapeo de Estructura JSON
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#3730a3' }}>
            Carga un JSON y mapea sus campos a variables internas del workflow
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', flex: 1, minHeight: 0 }}>
          
          {/* Left Panel - JSON Input */}
          <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
                Estructura JSON
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
                flex: 1,
                minHeight: '300px',
                padding: '12px',
                border: `1px solid ${jsonError ? '#dc2626' : '#d1d5db'}`,
                borderRadius: '6px',
                fontSize: '12px',
                fontFamily: 'monospace',
                resize: 'none'
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

          {/* Right Panel - Mappings */}
          <div style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <h4 style={{ margin: 0, fontSize: '14px', fontWeight: '600' }}>
                Mapeo de Variables ({mappings.length})
              </h4>
              <Button
                size="small"
                variant="primary"
                icon={<Plus size={14} />}
                onClick={addCustomMapping}
              >
                Agregar
              </Button>
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
                    Carga un JSON para ver los campos disponibles
                  </div>
                </div>
              ) : (
                <div style={{
                  height: '100%',
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
                            marginBottom: '4px'
                          }}>
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
                              marginBottom: '8px'
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
        </div>

        {/* Available Data Sources */}
        {Object.keys(availableData).length > 0 && (
          <div style={{
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '6px',
            padding: '12px',
            marginTop: '16px'
          }}>
            <h5 style={{
              margin: '0 0 8px 0',
              fontSize: '13px',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Link2 size={14} />
              Datos Disponibles del Workflow
            </h5>
            
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '4px'
            }}>
              {Object.entries(availableData).map(([key, value]) => (
                <span
                  key={key}
                  style={{
                    fontSize: '11px',
                    padding: '2px 6px',
                    background: '#dcfce7',
                    color: '#166534',
                    borderRadius: '4px',
                    border: '1px solid #bbf7d0'
                  }}
                >
                  {key}: {typeof value === 'string' && value.length > 20 
                    ? `${value.substring(0, 20)}...` 
                    : value}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Summary */}
        {mappings.length > 0 && (
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '12px',
            marginTop: '16px'
          }}>
            <h5 style={{
              margin: '0 0 8px 0',
              fontSize: '13px',
              color: '#374151'
            }}>
              Resumen del Mapeo
            </h5>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '12px',
              fontSize: '12px'
            }}>
              <div>
                <strong>Variables totales:</strong> {mappings.length}
              </div>
              <div>
                <strong>Variables válidas:</strong> {mappings.filter(m => m.isValid).length}
              </div>
              <div>
                <strong>Tipos detectados:</strong>
                <div style={{ marginTop: '4px' }}>
                  {Object.entries(
                    mappings.reduce((acc, m) => {
                      acc[m.dataType] = (acc[m.dataType] || 0) + 1;
                      return acc;
                    }, {})
                  ).map(([type, count]) => (
                    <span
                      key={type}
                      style={{
                        display: 'inline-block',
                        margin: '2px 4px 2px 0',
                        padding: '1px 4px',
                        background: getTypeColor(type),
                        color: 'white',
                        borderRadius: '3px',
                        fontSize: '10px'
                      }}
                    >
                      {type}: {count}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

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
            💡 <strong>Tip:</strong> Los tipos deben ser compatibles con la estructura JSON original
            {mappings.length > 0 && (
              <span style={{ marginLeft: '20px', color: '#3b82f6' }}>
                <strong>📊 Variables mapeadas:</strong> {mappings.filter(m => m.isValid && m.variableName).length}/{mappings.length}
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