import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';
import { User, MapPin, FileText } from 'lucide-react';
import { getNodeConfig } from '../../../../utils/nodeHelpers';
import { NODE_TYPES, STYLES } from '../../../../utils/constants';
import NodeModal from './NodeModal';
import DataFlow from './DataFlow';
import LayoutDesigner from '../../../layout-designer/LayoutDesigner/LayoutDesigner';

const CustomNode = ({ id, data, selected }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLayoutDesignerOpen, setIsLayoutDesignerOpen] = useState(false);

  const nodeConfig = getNodeConfig(data.type);

  const handleNodeClick = (e) => {
    // CRÍTICO: Prevenir que el click se propague
    e.stopPropagation();
    e.preventDefault();
    
    if (data.type === NODE_TYPES.LAYOUT_DESIGNER) {
      setIsLayoutDesignerOpen(true);
    } else {
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

  const getAvailableDataForLayout = () => {
    const availableData = {};
    const incomingEdges = (data.allEdges || []).filter(edge => edge.target === id);
    
    incomingEdges.forEach(edge => {
      const sourceNode = (data.allNodes || []).find(node => node.id === edge.source);
      if (sourceNode && sourceNode.data.properties) {
        Object.keys(sourceNode.data.properties).forEach(key => {
          availableData[`${sourceNode.data.type}.${key}`] = sourceNode.data.properties[key];
        });
      }
    });
    
    return availableData;
  };

  const getIcon = () => {
    switch (data.type) {
      case NODE_TYPES.USER_FORM:
        return <User size={16} color={nodeConfig.color} />;
      case NODE_TYPES.LOCATION_FORM:
        return <MapPin size={16} color={nodeConfig.color} />;
      case NODE_TYPES.LAYOUT_DESIGNER:
        return <FileText size={16} color={nodeConfig.color} />;
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
    color: '#16a34a',
    marginTop: '2px',
    display: 'flex',
    alignItems: 'center',
    gap: '2px'
  };

  const hasProperties = data.properties && Object.keys(data.properties).length > 0;

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
            
            {hasProperties && (
              <div style={statusStyle}>
                <span style={{ 
                  width: '6px', 
                  height: '6px', 
                  background: '#16a34a', 
                  borderRadius: '50%' 
                }} />
                Configurado
              </div>
            )}
            
            {!hasProperties && (
              <div style={{
                ...statusStyle,
                color: '#f59e0b'
              }}>
                <span style={{ 
                  width: '6px', 
                  height: '6px', 
                  background: '#f59e0b', 
                  borderRadius: '50%' 
                }} />
                Pendiente
              </div>
            )}
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

      {/* Configuration Modal */}
      <NodeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        nodeType={data.type}
        initialData={data.properties || {}}
        onSave={handleSave}
      />

      {/* Layout Designer - Portal para evitar conflictos */}
      {data.type === NODE_TYPES.LAYOUT_DESIGNER && isLayoutDesignerOpen && (
        <LayoutDesigner
          isOpen={isLayoutDesignerOpen}
          onClose={() => setIsLayoutDesignerOpen(false)}
          onSave={handleLayoutSave}
          initialData={data.properties?.layout}
          availableData={getAvailableDataForLayout()}
        />
      )}
    </>
  );
};

export default CustomNode;