import React from 'react';
import Button from '../../common/Button/Button';
import { Type, Square, Link, Trash2, Copy, RotateCcw } from 'lucide-react';
import { ELEMENT_TYPES } from '../../../utils/constants';

const Toolbar = ({ 
  onAddElement, 
  onDeleteSelected,
  onDuplicateSelected,
  onClearAll,
  selectedElement,
  elementsCount 
}) => {
  const toolbarStyle = {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap',
    padding: '12px',
    background: '#f8fafc',
    borderRadius: '8px',
    border: '1px solid #e2e8f0'
  };

  const toolGroups = [
    {
      title: 'Elementos',
      tools: [
        {
          type: ELEMENT_TYPES.TEXT,
          label: 'Texto',
          icon: <Type size={16} />,
          variant: 'primary',
          description: 'Agregar elemento de texto'
        },
        {
          type: ELEMENT_TYPES.RECTANGLE,
          label: 'Rectángulo',
          icon: <Square size={16} />,
          variant: 'success',
          description: 'Agregar rectángulo'
        },
        {
          type: ELEMENT_TYPES.VARIABLE,
          label: 'Variable',
          icon: <Link size={16} />,
          variant: 'purple',
          description: 'Agregar variable dinámica'
        }
      ]
    },
    {
      title: 'Acciones',
      tools: [
        {
          action: 'duplicate',
          label: 'Duplicar',
          icon: <Copy size={16} />,
          variant: 'secondary',
          description: 'Duplicar elemento seleccionado',
          disabled: !selectedElement
        },
        {
          action: 'delete',
          label: 'Eliminar',
          icon: <Trash2 size={16} />,
          variant: 'danger',
          description: 'Eliminar elemento seleccionado',
          disabled: !selectedElement
        },
        {
          action: 'clear',
          label: 'Limpiar',
          icon: <RotateCcw size={16} />,
          variant: 'secondary',
          description: 'Limpiar todo el canvas',
          disabled: elementsCount === 0
        }
      ]
    }
  ];

  const getButtonStyle = (variant) => {
    const variantStyles = {
      purple: {
        backgroundColor: '#7c3aed',
        color: 'white'
      }
    };
    
    return variantStyles[variant] || {};
  };

  const handleToolClick = (tool) => {
    if (tool.type) {
      onAddElement(tool.type);
    } else if (tool.action) {
      switch (tool.action) {
        case 'duplicate':
          onDuplicateSelected();
          break;
        case 'delete':
          onDeleteSelected();
          break;
        case 'clear':
          if (window.confirm('¿Estás seguro de que quieres limpiar todo el canvas?')) {
            onClearAll();
          }
          break;
        default:
          break;
      }
    }
  };

  return (
    <div style={toolbarStyle}>
      {toolGroups.map((group, groupIndex) => (
        <React.Fragment key={group.title}>
          {groupIndex > 0 && (
            <div style={{
              width: '1px',
              background: '#e2e8f0',
              margin: '0 8px',
              alignSelf: 'stretch'
            }} />
          )}
          
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{
              fontSize: '12px',
              color: '#6b7280',
              fontWeight: '500',
              marginRight: '4px'
            }}>
              {group.title}:
            </span>
            
            {group.tools.map((tool, toolIndex) => (
              <Button
                key={toolIndex}
                variant={tool.variant}
                icon={tool.icon}
                iconPosition="left"
                onClick={() => handleToolClick(tool)}
                disabled={tool.disabled}
                title={tool.description}
                style={getButtonStyle(tool.variant)}
              >
                {tool.label}
              </Button>
            ))}
          </div>
        </React.Fragment>
      ))}
      
      {/* Stats */}
      <div style={{
        marginLeft: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        fontSize: '12px',
        color: '#6b7280'
      }}>
        <div>
          <strong>Elementos:</strong> {elementsCount}
        </div>
        
        {selectedElement && (
          <div style={{ color: '#3b82f6' }}>
            <strong>Seleccionado:</strong> {selectedElement.type}
          </div>
        )}
      </div>
    </div>
  );
};

export default Toolbar;