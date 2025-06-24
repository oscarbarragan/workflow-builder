// src/components/workflow/nodes/CustomNode/CustomNode.jsx - FINAL ACTUALIZADO
import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { User, MapPin, FileText, Globe, Database, Code } from 'lucide-react';
import { getNodeConfig, getMappedVariablesForLayout } from '../../../../utils/nodeHelpers';
import { NODE_TYPES, STYLES } from '../../../../utils/constants';
import NodeModal from './NodeModal';
import DataFlow from './DataFlow';
import LayoutDesigner from '../../../layout-designer/LayoutDesigner/LayoutDesigner';
import HttpInput from '../HttpInput/HttpInput';
import DataMapper from '../DataMapper/DataMapper';
import ScriptProcessor from '../ScriptProcessor/ScriptProcessor';

const CustomNode = ({ id, data, selected }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLayoutDesignerOpen, setIsLayoutDesignerOpen] = useState(false);
  const [isHttpInputOpen, setIsHttpInputOpen] = useState(false);
  const [isDataMapperOpen, setIsDataMapperOpen] = useState(false);
  const [isScriptProcessorOpen, setIsScriptProcessorOpen] = useState(false);

  const nodeConfig = getNodeConfig(data.type);

  const handleNodeClick = (e) => {
    // CRÍTICO: Prevenir que el click se propague
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
      case NODE_TYPES.SCRIPT_PROCESSOR:
        setIsScriptProcessorOpen(true);
        break;
      default:
        setIsModalOpen(true);
    }
  };

  const handleSave = (formData) => {
    data.onPropertiesChange(id, formData);
  };

  const handleLayoutSave = (layoutData) => {
    data.onPropertiesChange(id, { 
      ...data.properties, 
      layout: layoutData 
    });
  };

  // MEJORADO: Usar la nueva función para obtener variables mapeadas
  const getAvailableDataForLayout = () => {
    return getMappedVariablesForLayout(id, data.allNodes || [], data.allEdges || []);
  };

  const getIcon = () => {
    switch (data.type) {
      case NODE_TYPES.USER_FORM:
        return <User size={16} color={nodeConfig.color} />;
      case NODE_TYPES.LOCATION_FORM:
        return <MapPin size={16} color={nodeConfig.color} />;
      case NODE_TYPES.LAYOUT_DESIGNER:
        return <FileText size={16} color={nodeConfig.color} />;
      case NODE_TYPES.HTTP_INPUT:
        return <Globe size={16} color={nodeConfig.color} />;
      case NODE_TYPES.DATA_MAPPER:
        return <Database size={16} color={nodeConfig.color} />;
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
    
    // Special status logic for different node types
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
    border: `2px solid ${selected ? '#3b82f6' : '#e5e7eb'}`,
    transform: selected ? 'scale(1.02)' : 'scale(1)',
    boxShadow: selected 
      ? '0 8px 25px -8px rgba(59, 130, 246, 0.4)' 
      : '0 2px 4px rgba(0, 0, 0, 0.1)'
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
        onClick={handleNodeClick} 
        onMouseDown={(e) => e.stopPropagation()} // Prevenir interferencia
        style={nodeStyle}
      >
        <div style={contentStyle}>
          {/* Icon */}
          <div style={iconContainerStyle}>
            {getIcon()}
          </div>
          
          {/* Content */}
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
            </div>
          </div>
          
          {/* Data Flow */}
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

      {/* Standard Configuration Modal */}
      <NodeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        nodeType={data.type}
        initialData={data.properties || {}}
        onSave={handleSave}
      />

      {/* Layout Designer */}
      {data.type === NODE_TYPES.LAYOUT_DESIGNER && isLayoutDesignerOpen && (
        <LayoutDesigner
          isOpen={isLayoutDesignerOpen}
          onClose={() => setIsLayoutDesignerOpen(false)}
          onSave={handleLayoutSave}
          initialData={data.properties?.layout}
          availableData={getAvailableDataForLayout()}
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
          availableData={getAvailableDataForLayout()}
        />
      )}
      {/* Script Processor */}
      {data.type === NODE_TYPES.SCRIPT_PROCESSOR && isScriptProcessorOpen && (
        <ScriptProcessor
          isOpen={isScriptProcessorOpen}
          onClose={() => setIsScriptProcessorOpen(false)}
          initialData={data.properties || {}}
          onSave={handleSave}
          availableData={getAvailableDataForLayout()}
        />
      )}
    </>
  );
};

export default CustomNode;