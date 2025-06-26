// src/components/workflow/nodes/DataTransformer/tabs/TransformationsTab.jsx
import React, { useState } from 'react';
import { 
  Power, 
  PowerOff, 
  Settings, 
  Eye, 
  Zap,
  AlertTriangle,
  CheckCircle,
  Search
} from 'lucide-react';
import { getTransformationsForDataType, getDefaultConfig } from '../TransformationTypes';
import { previewTransformation } from '../TransformationEngine';
import TransformationConfigPanel from '../TransformationConfigPanel';

const TransformationsTab = ({ 
  transformations, 
  updateTransformation, 
  availableData 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDataType, setSelectedDataType] = useState('all');
  const [showConfigPanel, setShowConfigPanel] = useState(null);
  const [previewResults, setPreviewResults] = useState({});

  // Filter transformations based on search and data type
  const filteredTransformations = transformations.filter(transform => {
    const matchesSearch = transform.inputVariable.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transform.outputVariable.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedDataType === 'all' || transform.dataType === selectedDataType;
    return matchesSearch && matchesType;
  });

  // Get unique data types for filter
  const dataTypes = ['all', ...new Set(transformations.map(t => t.dataType))];

  // Handle transformation type change
  const handleTransformationTypeChange = (transformId, newType) => {
    const transformation = transformations.find(t => t.id === transformId);
    if (!transformation) return;

    const defaultConfig = getDefaultConfig(newType, transformation.dataType);
    updateTransformation(transformId, 'transformationType', newType);
    updateTransformation(transformId, 'transformationConfig', defaultConfig);

    // Generate preview
    generatePreview(transformId, newType, defaultConfig);
  };

  // Generate preview for a transformation
  const generatePreview = (transformId, transformationType, config) => {
    const transformation = transformations.find(t => t.id === transformId);
    if (!transformation) return;

    const inputValue = availableData[transformation.inputVariable];
    const preview = previewTransformation(inputValue, transformationType, config);
    
    setPreviewResults(prev => ({
      ...prev,
      [transformId]: preview
    }));
  };

  // Get data type icon
  const getDataTypeIcon = (dataType) => {
    const icons = {
      string: '📝',
      number: '🔢',
      boolean: '☑️',
      date: '📅',
      array: '📊',
      object: '📦',
      email: '📧',
      url: '🔗'
    };
    return icons[dataType] || '📄';
  };

  // Get transformation type color
  const getTransformationTypeColor = (transformationType) => {
    if (transformationType === 'none') return '#9ca3af';
    return '#3b82f6';
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '16px',
      height: '100%',
      overflow: 'hidden'
    }}>
      
      {/* Header with filters */}
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexShrink: 0
      }}>
        {/* Search */}
        <div style={{ flex: 1, position: 'relative' }}>
          <Search size={16} style={{ 
            position: 'absolute', 
            left: '8px', 
            top: '50%', 
            transform: 'translateY(-50%)',
            color: '#6b7280'
          }} />
          <input
            type="text"
            placeholder="Buscar variables..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 8px 8px 32px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '12px',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Data type filter */}
        <select
          value={selectedDataType}
          onChange={(e) => setSelectedDataType(e.target.value)}
          style={{
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '12px',
            background: 'white'
          }}
        >
          <option value="all">Todos los tipos</option>
          {dataTypes.slice(1).map(type => (
            <option key={type} value={type}>
              {getDataTypeIcon(type)} {type}
            </option>
          ))}
        </select>

        {/* Stats */}
        <div style={{
          fontSize: '12px',
          color: '#6b7280',
          display: 'flex',
          gap: '8px'
        }}>
          <span style={{
            background: '#f3f4f6',
            padding: '4px 8px',
            borderRadius: '4px'
          }}>
            Total: {transformations.length}
          </span>
          <span style={{
            background: '#f0fdf4',
            color: '#15803d',
            padding: '4px 8px',
            borderRadius: '4px'
          }}>
            Activas: {transformations.filter(t => t.enabled).length}
          </span>
        </div>
      </div>

      {/* Transformations List */}
      <div style={{
        flex: 1,
        overflow: 'auto',
        border: '1px solid #e5e7eb',
        borderRadius: '6px'
      }}>
        {filteredTransformations.length === 0 ? (
          <div style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: '#6b7280'
          }}>
            <Zap size={32} style={{ margin: '0 auto 12px', display: 'block' }} />
            <div style={{ fontSize: '14px', marginBottom: '4px' }}>
              {searchTerm || selectedDataType !== 'all' 
                ? 'No se encontraron transformaciones' 
                : 'No hay datos disponibles para transformar'
              }
            </div>
            <div style={{ fontSize: '12px' }}>
              {!searchTerm && selectedDataType === 'all' && 
                'Conecta este nodo con otros que generen datos'
              }
            </div>
          </div>
        ) : (
          filteredTransformations.map((transformation, index) => (
            <div
              key={transformation.id}
              style={{
                padding: '16px',
                borderBottom: index < filteredTransformations.length - 1 ? '1px solid #f1f5f9' : 'none',
                background: transformation.enabled ? '#ffffff' : '#f8fafc'
              }}
            >
              {/* Transformation Header */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {/* Enable/Disable Toggle */}
                  <button
                    onClick={() => updateTransformation(transformation.id, 'enabled', !transformation.enabled)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      borderRadius: '4px',
                      color: transformation.enabled ? '#16a34a' : '#6b7280'
                    }}
                    title={transformation.enabled ? 'Deshabilitar' : 'Habilitar'}
                  >
                    {transformation.enabled ? <Power size={16} /> : <PowerOff size={16} />}
                  </button>

                  {/* Data Type Badge */}
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '12px',
                    background: '#f3f4f6',
                    color: '#374151',
                    fontWeight: '500'
                  }}>
                    {getDataTypeIcon(transformation.dataType)} {transformation.dataType}
                  </span>

                  {/* Variable Name */}
                  <span style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: transformation.enabled ? '#374151' : '#9ca3af'
                  }}>
                    {transformation.inputVariable}
                  </span>

                  {/* Validation Status */}
                  {transformation.enabled && (
                    transformation.isValid ? (
                      <CheckCircle size={14} color="#16a34a" />
                    ) : (
                      <AlertTriangle size={14} color="#dc2626" />
                    )
                  )}
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {/* Preview Button */}
                  <button
                    onClick={() => generatePreview(
                      transformation.id, 
                      transformation.transformationType, 
                      transformation.transformationConfig
                    )}
                    disabled={!transformation.enabled}
                    style={{
                      background: 'none',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      padding: '4px 8px',
                      cursor: transformation.enabled ? 'pointer' : 'not-allowed',
                      color: transformation.enabled ? '#6b7280' : '#9ca3af',
                      fontSize: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Eye size={12} />
                    Vista Previa
                  </button>

                  {/* Config Button */}
                  <button
                    onClick={() => setShowConfigPanel(transformation.id)}
                    disabled={!transformation.enabled || transformation.transformationType === 'none'}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: transformation.enabled && transformation.transformationType !== 'none' ? 'pointer' : 'not-allowed',
                      padding: '4px',
                      borderRadius: '4px',
                      color: transformation.enabled && transformation.transformationType !== 'none' ? '#6b7280' : '#9ca3af'
                    }}
                    title="Configurar transformación"
                  >
                    <Settings size={14} />
                  </button>
                </div>
              </div>

              {/* Input/Output Variables */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '12px'
              }}>
                {/* Input Variable */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '10px',
                    fontWeight: '500',
                    color: '#6b7280',
                    marginBottom: '4px'
                  }}>
                    Variable de entrada:
                  </label>
                  <select
                    value={transformation.inputVariable}
                    onChange={(e) => updateTransformation(transformation.id, 'inputVariable', e.target.value)}
                    disabled={!transformation.enabled}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '11px',
                      background: transformation.enabled ? 'white' : '#f9fafb',
                      color: transformation.enabled ? '#374151' : '#9ca3af'
                    }}
                  >
                    {Object.keys(availableData).map(key => (
                      <option key={key} value={key}>{key}</option>
                    ))}
                  </select>
                </div>

                {/* Arrow */}
                <div style={{
                  padding: '8px',
                  color: transformation.enabled ? '#3b82f6' : '#9ca3af'
                }}>
                  →
                </div>

                {/* Output Variable */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '10px',
                    fontWeight: '500',
                    color: '#6b7280',
                    marginBottom: '4px'
                  }}>
                    Variable de salida:
                  </label>
                  <input
                    type="text"
                    value={transformation.outputVariable}
                    onChange={(e) => updateTransformation(transformation.id, 'outputVariable', e.target.value)}
                    disabled={!transformation.enabled}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '11px',
                      background: transformation.enabled ? 'white' : '#f9fafb',
                      color: transformation.enabled ? '#374151' : '#9ca3af',
                      boxSizing: 'border-box'
                    }}
                    placeholder="nombre_variable_transformada"
                  />
                </div>
              </div>

              {/* Transformation Type Selector */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '10px',
                  fontWeight: '500',
                  color: '#6b7280',
                  marginBottom: '4px'
                }}>
                  Tipo de transformación:
                </label>
                <select
                  value={transformation.transformationType}
                  onChange={(e) => handleTransformationTypeChange(transformation.id, e.target.value)}
                  disabled={!transformation.enabled}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '11px',
                    background: transformation.enabled ? 'white' : '#f9fafb',
                    color: transformation.enabled ? '#374151' : '#9ca3af'
                  }}
                >
                  {Object.entries(getTransformationsForDataType(transformation.dataType)).map(([key, config]) => (
                    <option key={key} value={key}>
                      {config.icon} {config.label}
                    </option>
                  ))}
                </select>
                {transformation.enabled && transformation.transformationType !== 'none' && (
                  <div style={{
                    fontSize: '10px',
                    color: '#6b7280',
                    marginTop: '4px',
                    fontStyle: 'italic'
                  }}>
                    {getTransformationsForDataType(transformation.dataType)[transformation.transformationType]?.description}
                  </div>
                )}
              </div>

              {/* Current Value Display */}
              <div style={{
                marginTop: '12px',
                padding: '8px',
                background: '#f8fafc',
                borderRadius: '4px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  fontSize: '10px',
                  fontWeight: '500',
                  color: '#6b7280',
                  marginBottom: '4px'
                }}>
                  Valor actual:
                </div>
                <div style={{
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  color: '#374151',
                  background: 'white',
                  padding: '4px 6px',
                  borderRadius: '2px',
                  border: '1px solid #e5e7eb',
                  maxHeight: '60px',
                  overflow: 'auto'
                }}>
                  {typeof transformation.inputValue === 'object' 
                    ? JSON.stringify(transformation.inputValue, null, 2)
                    : String(transformation.inputValue)
                  }
                </div>
              </div>

              {/* Preview Result */}
              {previewResults[transformation.id] && (
                <div style={{
                  marginTop: '8px',
                  padding: '8px',
                  background: previewResults[transformation.id].success ? '#f0fdf4' : '#fef2f2',
                  borderRadius: '4px',
                  border: `1px solid ${previewResults[transformation.id].success ? '#bbf7d0' : '#fecaca'}`
                }}>
                  <div style={{
                    fontSize: '10px',
                    fontWeight: '500',
                    color: previewResults[transformation.id].success ? '#15803d' : '#dc2626',
                    marginBottom: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {previewResults[transformation.id].success ? (
                      <><CheckCircle size={12} /> Vista previa:</>
                    ) : (
                      <><AlertTriangle size={12} /> Error en vista previa:</>
                    )}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    fontFamily: 'monospace',
                    color: previewResults[transformation.id].success ? '#166534' : '#dc2626',
                    background: 'white',
                    padding: '4px 6px',
                    borderRadius: '2px',
                    border: `1px solid ${previewResults[transformation.id].success ? '#bbf7d0' : '#fecaca'}`,
                    maxHeight: '60px',
                    overflow: 'auto'
                  }}>
                    {previewResults[transformation.id].success
                      ? (typeof previewResults[transformation.id].result === 'object' 
                          ? JSON.stringify(previewResults[transformation.id].result, null, 2)
                          : String(previewResults[transformation.id].result)
                        )
                      : previewResults[transformation.id].error
                    }
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Configuration Panel */}
      {showConfigPanel && (
        <TransformationConfigPanel
          transformationId={showConfigPanel}
          transformation={transformations.find(t => t.id === showConfigPanel)}
          onClose={() => setShowConfigPanel(null)}
          onConfigChange={(config) => {
            updateTransformation(showConfigPanel, 'transformationConfig', config);
            generatePreview(
              showConfigPanel,
              transformations.find(t => t.id === showConfigPanel)?.transformationType,
              config
            );
          }}
        />
      )}
    </div>
  );
};

export default TransformationsTab;