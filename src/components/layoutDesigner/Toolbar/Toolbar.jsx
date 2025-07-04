// src/components/layoutDesigner/Toolbar/Toolbar.jsx
import React from 'react';
import Button from '../../common/Button/Button';
import { toolbarConfig } from './Toolbar.config';

const Toolbar = ({ 
  onAddElement, 
  onDeleteSelected,
  onDuplicateSelected,
  onClearAll,
  selectedElement,
  elementsCount 
}) => {
  const { toolGroups, styles, buttonVariants } = toolbarConfig;

  const getButtonStyle = (variant) => {
    return buttonVariants[variant] || {};
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
    <div style={styles.container}>
      {toolGroups.map((group, groupIndex) => (
        <React.Fragment key={group.title}>
          {groupIndex > 0 && <div style={styles.separator} />}
          
          <div style={styles.group}>
            <span style={styles.groupLabel}>
              {group.title}:
            </span>
            
            {group.tools.map((tool, toolIndex) => {
              const isDisabled = tool.action === 'duplicate' || tool.action === 'delete' 
                ? !selectedElement 
                : tool.action === 'clear' 
                  ? elementsCount === 0 
                  : false;

              return (
                <Button
                  key={toolIndex}
                  variant={tool.variant}
                  onClick={() => handleToolClick(tool)}
                  disabled={isDisabled}
                  title={`${tool.description}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
                  style={getButtonStyle(tool.variant)}
                >
                  <span style={{ marginRight: '6px' }}>{tool.icon}</span>
                  {tool.label}
                </Button>
              );
            })}
          </div>
        </React.Fragment>
      ))}
      
      {/* Stats */}
      <div style={styles.stats}>
        <div>
          <strong>Elementos:</strong> {elementsCount}
        </div>
        
        {selectedElement && (
          <div style={styles.selectedInfo}>
            <strong>Seleccionado:</strong> {selectedElement.type}
          </div>
        )}
      </div>
    </div>
  );
};

export default Toolbar;