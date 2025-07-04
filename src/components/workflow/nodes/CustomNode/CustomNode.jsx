// src/components/workflow/nodes/CustomNode/CustomNode.jsx - CORREGIDO LA IMPORTACIÓN
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Handle, Position } from 'reactflow';
import { FileText, Globe, Database, Code, Zap } from 'lucide-react';
import { getNodeConfig, getMappedVariablesForLayout, getAvailableData } from '../../../../utils/nodeHelpers';
import { NODE_TYPES, STYLES } from '../../../../utils/constants';
import DataFlow from './DataFlow';
import NodeTooltip from '../NodeTooltip/NodeTooltip';
// ✅ CORREGIDO: Importar como named export
import { LayoutDesigner } from '../../../layoutDesigner';
import HttpInput from '../HttpInput/HttpInput';
import DataMapper from '../DataMapper/DataMapper';
import DataTransformer from '../DataTransformer/DataTransformer';
import ScriptProcessor from '../ScriptProcessor/ScriptProcessor';

const CustomNode = ({ id, data, selected }) => {
  // DEBUG: Log when component renders
  console.log('🔄 CustomNode render:', id, 'callbacks:', {
    onDelete: !!data.onDelete,
    onDuplicate: !!data.onDuplicate,
    onPropertiesChange: !!data.onPropertiesChange
  });

  const [isLayoutDesignerOpen, setIsLayoutDesignerOpen] = useState(false);
  const [isHttpInputOpen, setIsHttpInputOpen] = useState(false);
  const [isDataMapperOpen, setIsDataMapperOpen] = useState(false);
  const [isDataTransformerOpen, setIsDataTransformerOpen] = useState(false);
  const [isScriptProcessorOpen, setIsScriptProcessorOpen] = useState(false);
  
  // Estados para el tooltip
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isAnchored, setIsAnchored] = useState(data.properties?.isAnchored || false);
  const nodeRef = useRef(null);
  const tooltipTimeoutRef = useRef(null);

  // CRITICAL FIX: Declarar handlePropertiesChange ANTES de usarlo
  const handlePropertiesChange = useMemo(() => {
    return data.onPropertiesChange || ((nodeId, properties) => {
      console.warn('onPropertiesChange not available for node:', nodeId);
    });
  }, [data.onPropertiesChange]);

  // CRITICAL FIX: Declarar handleDelete ANTES de usarlo
  const handleDelete = useMemo(() => {
    return data.onDelete || ((nodeId) => {
      console.warn('onDelete not available for node:', nodeId);
    });
  }, [data.onDelete]);

  // CRITICAL FIX: Declarar handleDuplicate ANTES de usarlo
  const handleDuplicate = useMemo(() => {
    return data.onDuplicate || ((nodeId) => {
      console.warn('onDuplicate not available for node:', nodeId);
    });
  }, [data.onDuplicate]);

  // CRITICAL FIX: Declarar handleSave ANTES de usarlo
  const handleSave = useMemo(() => {
    return (formData) => {
      console.log('💾 Saving node data:', id, formData);
      if (handlePropertiesChange) {
        handlePropertiesChange(id, formData);
      }
    };
  }, [id, handlePropertiesChange]);

  // OPTIMIZATION: Memoize available data calculation
  const availableData = useMemo(() => {
    return getAvailableData(id, data.allNodes || [], data.allEdges || []);
  }, [id, data.allNodes, data.allEdges]);

  // OPTIMIZATION: Memoize mapped variables
  const mappedVariables = useMemo(() => {
    return getMappedVariablesForLayout(id, data.allNodes || [], data.allEdges || []);
  }, [id, data.allNodes, data.allEdges]);

  // Cleanup del timeout cuando se desmonta el componente
  useEffect(() => {
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, []);

  // Handlers para el tooltip
  const handleMouseEnter = (e) => {
    console.log('🖱️ Mouse enter on node:', id);
    
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    
    tooltipTimeoutRef.current = setTimeout(() => {
      if (nodeRef.current) {
        const rect = nodeRef.current.getBoundingClientRect();
        
        setTooltipPosition({
          x: rect.right + 8,
          y: rect.top - 5
        });
        setShowTooltip(true);
        console.log('👁️ Tooltip position (viewport):', {
          x: rect.right + 8,
          y: rect.top - 5,
          nodeRect: rect
        });
      }
    }, 300);
  };

  const handleMouseLeave = () => {
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    
    tooltipTimeoutRef.current = setTimeout(() => {
      setShowTooltip(false);
    }, 1000);
  };

  // Handlers para las acciones del tooltip
  const handleAnchor = (nodeId, shouldAnchor) => {
    console.log(`🔒 ${shouldAnchor ? 'Anchoring' : 'Unanchoring'} node:`, nodeId);
    setIsAnchored(shouldAnchor);
    
    if (handlePropertiesChange) {
      handlePropertiesChange(id, { 
        ...data.properties, 
        isAnchored: shouldAnchor 
      });
    }
    
    setShowTooltip(false);
  };

  const handleNodeDelete = (nodeId) => {
    console.log('🗑️ Deleting node:', nodeId, 'handleDelete available:', !!handleDelete);
    
    if (window.confirm('¿Estás seguro de que quieres eliminar este nodo?')) {
      if (handleDelete) {
        handleDelete(nodeId);
      } else {
        console.error('❌ handleDelete function not available');
      }
    }
    
    setShowTooltip(false);
  };

  const handleNodeDuplicate = (nodeId) => {
    console.log('📋 Duplicating node:', nodeId, 'handleDuplicate available:', !!handleDuplicate);
    
    if (handleDuplicate) {
      handleDuplicate(nodeId);
    } else {
      console.error('❌ handleDuplicate function not available');
    }
    
    setShowTooltip(false);
  };

  const nodeConfig = getNodeConfig(data.type);

  const handleNodeClick = (e) => {
    e.stopPropagation();
    e.preventDefault();
    
    switch (data.type) {
      case NODE_TYPES.LAYOUT_DESIGNER:
        setIsLayoutDesignerOpen(true);
        break;
      case NODE_TYPES.HTTP_INPUT:
        setIsHttpInputOpen(true);
        break;
      case NODE_TYPES.DATA_MAPPER:
        setIsDataMapperOpen(true);
        break;
      case NODE_TYPES.DATA_TRANSFORMER:
        setIsDataTransformerOpen(true);
        break;
      case NODE_TYPES.SCRIPT_PROCESSOR:
        setIsScriptProcessorOpen(true);
        break;
      default:
        console.log('Tipo de nodo no reconocido:', data.type);
    }
  };

  const handleLayoutSave = (layoutData) => {
    handlePropertiesChange(id, { 
      ...data.properties, 
      layout: layoutData 
    });
  };

  const getIcon = () => {
    switch (data.type) {
      case NODE_TYPES.LAYOUT_DESIGNER:
        return <FileText size={16} color={nodeConfig.color} />;
      case NODE_TYPES.HTTP_INPUT:
        return <Globe size={16} color={nodeConfig.color} />;
      case NODE_TYPES.DATA_MAPPER:
        return <Database size={16} color={nodeConfig.color} />;
      case NODE_TYPES.DATA_TRANSFORMER:
        return <Zap size={16} color={nodeConfig.color} />;
      case NODE_TYPES.SCRIPT_PROCESSOR:
        return <Code size={16} color={nodeConfig.color} />;
      default:
        return (
          <div style={{
            width: 16, 
            height: 16, 
            background: '#ccc', 
            borderRadius: '4px'
          }} />
        );
    }
  };

  const getNodeStatusInfo = () => {
    const hasProperties = data.properties && Object.keys(data.properties).length > 0;
    
    switch (data.type) {
      case NODE_TYPES.HTTP_INPUT:
        return {
          configured: hasProperties && data.properties.endpoint,
          statusText: hasProperties && data.properties.endpoint 
            ? `${data.properties.method} ${data.properties.path}`
            : 'Configurar endpoint'
        };
        
      case NODE_TYPES.DATA_MAPPER:
        const mappingsCount = data.properties?.mappings?.length || 0;
        const validMappings = data.properties?.mappings?.filter(m => m.isValid && m.variableName)?.length || 0;
        return {
          configured: hasProperties && validMappings > 0,
          statusText: validMappings > 0 
            ? `${validMappings} variables mapeadas`
            : 'Configurar mapeo'
        };

      case NODE_TYPES.DATA_TRANSFORMER:
        const transformationsCount = data.properties?.transformations?.length || 0;
        const enabledTransformations = data.properties?.transformations?.filter(t => t.enabled)?.length || 0;
        const outputVariablesCount = Object.keys(data.properties?.outputVariables || {}).length;
        return {
          configured: hasProperties && enabledTransformations > 0,
          statusText: enabledTransformations > 0 
            ? `${enabledTransformations}/${transformationsCount} transformaciones → ${outputVariablesCount} variables`
            : transformationsCount > 0 
              ? `${transformationsCount} transformaciones (deshabilitadas)`
              : 'Configurar transformaciones'
        };
        
      case NODE_TYPES.SCRIPT_PROCESSOR:
        const hasScript = hasProperties && data.properties.script;
        const hasResult = hasProperties && data.properties.executionResult;
        return {
          configured: hasScript,
          statusText: hasResult 
            ? `Script ejecutado - ${Object.keys(data.properties.outputVariables || {}).length} vars`
            : hasScript ? 'Script configurado' : 'Configurar script'
        };
        
      case NODE_TYPES.LAYOUT_DESIGNER:
        const elementsCount = data.properties?.layout?.elements?.length || 0;
        return {
          configured: hasProperties && elementsCount > 0,
          statusText: elementsCount > 0 
            ? `Layout con ${elementsCount} elementos`
            : 'Diseñar layout'
        };
        
      default:
        return {
          configured: hasProperties,
          statusText: hasProperties ? 'Configurado' : 'Pendiente'
        };
    }
  };

  const statusInfo = getNodeStatusInfo();

  const nodeStyle = {
    ...STYLES.node,
    border: `2px solid ${selected ? '#3b82f6' : isAnchored ? '#16a34a' : '#e5e7eb'}`,
    transform: selected ? 'scale(1.02)' : 'scale(1)',
    boxShadow: selected 
      ? '0 8px 25px -8px rgba(59, 130, 246, 0.4)' 
      : isAnchored
        ? '0 4px 12px -2px rgba(22, 163, 74, 0.3)'
        : '0 2px 4px rgba(0, 0, 0, 0.1)',
    cursor: isAnchored ? 'default' : 'grab',
    position: 'relative'
  };

  const contentStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px'
  };

  const iconContainerStyle = {
    padding: '6px',
    background: 'white',
    borderRadius: '50%',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `2px solid ${nodeConfig.color}`
  };

  const titleStyle = {
    fontWeight: '600',
    color: '#374151',
    fontSize: '11px',
    textAlign: 'center',
    lineHeight: '1.2',
    maxWidth: '100px'
  };

  const statusStyle = {
    fontSize: '9px',
    color: statusInfo.configured ? '#16a34a' : '#f59e0b',
    marginTop: '2px',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    textAlign: 'center',
    maxWidth: '120px'
  };

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: '10px',
          height: '10px',
          background: selected ? '#3b82f6' : '#6b7280',
          border: '2px solid white',
          borderRadius: '50%'
        }}
      />
      
      <div 
        ref={nodeRef}
        onClick={handleNodeClick} 
        onMouseDown={(e) => e.stopPropagation()}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={nodeStyle}
      >
        <div style={contentStyle}>
          <div style={iconContainerStyle}>
            {getIcon()}
          </div>
          
          <div style={{ textAlign: 'center' }}>
            <div style={titleStyle}>
              {nodeConfig.title}
            </div>
            
            <div style={statusStyle}>
              <span style={{ 
                width: '6px', 
                height: '6px', 
                background: statusInfo.configured ? '#16a34a' : '#f59e0b', 
                borderRadius: '50%' 
              }} />
              <span style={{ fontSize: '8px' }}>
                {statusInfo.statusText}
              </span>
              {isAnchored && (
                <span style={{ 
                  fontSize: '8px', 
                  marginLeft: '4px',
                  color: '#16a34a',
                  fontWeight: '600'
                }}>
                  🔒
                </span>
              )}
            </div>
          </div>
          
          <DataFlow 
            nodeId={id} 
            nodes={data.allNodes || []} 
            edges={data.allEdges || []} 
          />
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: '10px',
          height: '10px',
          background: selected ? '#3b82f6' : '#6b7280',
          border: '2px solid white',
          borderRadius: '50%'
        }}
      />

      {/* Layout Designer */}
      {data.type === NODE_TYPES.LAYOUT_DESIGNER && isLayoutDesignerOpen && (
        <LayoutDesigner
          isOpen={isLayoutDesignerOpen}
          onClose={() => setIsLayoutDesignerOpen(false)}
          onSave={handleLayoutSave}
          initialData={data.properties?.layout}
          availableData={mappedVariables}
        />
      )}

      {/* HTTP Input */}
      {data.type === NODE_TYPES.HTTP_INPUT && isHttpInputOpen && (
        <HttpInput
          isOpen={isHttpInputOpen}
          onClose={() => setIsHttpInputOpen(false)}
          initialData={data.properties || {}}
          onSave={handleSave}
        />
      )}

      {/* Data Mapper */}
      {data.type === NODE_TYPES.DATA_MAPPER && isDataMapperOpen && (
        <DataMapper
          isOpen={isDataMapperOpen}
          onClose={() => setIsDataMapperOpen(false)}
          initialData={data.properties || {}}
          onSave={handleSave}
          availableData={availableData}
        />
      )}

      {/* Data Transformer */}
      {data.type === NODE_TYPES.DATA_TRANSFORMER && isDataTransformerOpen && (
        <DataTransformer
          isOpen={isDataTransformerOpen}
          onClose={() => setIsDataTransformerOpen(false)}
          initialData={data.properties || {}}
          onSave={handleSave}
          availableData={availableData}
        />
      )}

      {/* Script Processor */}
      {data.type === NODE_TYPES.SCRIPT_PROCESSOR && isScriptProcessorOpen && (
        <ScriptProcessor
          isOpen={isScriptProcessorOpen}
          onClose={() => setIsScriptProcessorOpen(false)}
          initialData={data.properties || {}}
          onSave={handleSave}
          availableData={availableData}
        />
      )}

      {/* Tooltip del nodo */}
      <NodeTooltip
        nodeId={id}
        isVisible={showTooltip}
        position={tooltipPosition}
        isAnchored={isAnchored}
        onAnchor={handleAnchor}
        onDelete={handleNodeDelete}
        onDuplicate={handleNodeDuplicate}
      />
    </>
  );
};

export default CustomNode;