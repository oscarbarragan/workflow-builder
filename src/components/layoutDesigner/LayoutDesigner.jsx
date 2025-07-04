// src/components/layoutDesigner/LayoutDesigner.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Button from '../common/Button/Button';
import Canvas from './Canvas';
import Toolbar from './Toolbar';
import PropertiesPanel from './PropertiesPanel';
import StylesSidebar from './StylesSidebar';
import StyleEditorModal from './StyleEditor';
import { useLayoutDesigner } from './hooks/useLayoutDesigner';
import { useDragAndDrop } from './hooks/useDragAndDrop';
import { useResize } from './hooks/useResize';
import { layoutDesignerStyles } from './styles/theme';

const LayoutDesigner = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  availableData = {} 
}) => {
  const [showStyleEditor, setShowStyleEditor] = useState(false);
  const [editingStyleType, setEditingStyleType] = useState(null);
  const [editingStyleId, setEditingStyleId] = useState(null);
  const [showVariableValues, setShowVariableValues] = useState(false);
  const [sidebarUpdateTrigger, setSidebarUpdateTrigger] = useState(0);

  const {
    elements,
    selectedElement,
    addElement,
    updateSelectedElement,
    deleteSelected,
    selectElement,
    clearSelection,
    moveElement,
    duplicateElement,
    getLayoutData,
    clearLayout,
    updateElement
  } = useLayoutDesigner(initialData);

  const {
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp
  } = useDragAndDrop(moveElement);

  const {
    isResizing,
    handleResizeStart,
    handleResizeMove,
    handleResizeEnd
  } = useResize((elementId, corner, deltaX, deltaY, initialElement) => {
    if (!initialElement) return;

    const minWidth = 50;
    const minHeight = 30;
    
    let newWidth = initialElement.width;
    let newHeight = initialElement.height;
    let newX = initialElement.x;
    let newY = initialElement.y;

    switch (corner) {
      case 'bottom-right':
        newWidth = Math.max(minWidth, initialElement.width + deltaX);
        newHeight = Math.max(minHeight, initialElement.height + deltaY);
        break;
        
      case 'bottom-left':
        newWidth = Math.max(minWidth, initialElement.width - deltaX);
        newHeight = Math.max(minHeight, initialElement.height + deltaY);
        newX = initialElement.x + (initialElement.width - newWidth);
        break;
        
      case 'top-right':
        newWidth = Math.max(minWidth, initialElement.width + deltaX);
        newHeight = Math.max(minHeight, initialElement.height - deltaY);
        newY = initialElement.y + (initialElement.height - newHeight);
        break;
        
      case 'top-left':
        newWidth = Math.max(minWidth, initialElement.width - deltaX);
        newHeight = Math.max(minHeight, initialElement.height - deltaY);
        newX = initialElement.x + (initialElement.width - newWidth);
        newY = initialElement.y + (initialElement.height - newHeight);
        break;
    }

    updateElement(elementId, {
      width: Math.round(newWidth),
      height: Math.round(newHeight),
      x: Math.round(newX),
      y: Math.round(newY)
    });
  });

  // Lifecycle effects
  useEffect(() => {
    if (isOpen) {
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

  // Event handlers
  const handleToggleVariableValues = useCallback(() => {
    setShowVariableValues(prev => !prev);
  }, []);

  const handleApplyStyle = useCallback((elementId, styleType, styleId) => {
    if (!elementId || !styleType || !styleId) return;

    const styleIdField = `${styleType}Id`;
    const updates = { [styleIdField]: styleId };

    if (styleType === 'textStyle') {
      updates.textStyle = null;
    } else if (styleType === 'paragraphStyle') {
      updates.paragraphStyle = null;
    } else if (styleType === 'borderStyle') {
      updates.borderStyle = null;
    } else if (styleType === 'fillStyle') {
      updates.fillStyle = null;
    }

    updateElement(elementId, updates);
    setSidebarUpdateTrigger(prev => prev + 1);
  }, [updateElement]);

  const handleCreateNewStyle = useCallback((styleType) => {
    setEditingStyleType(styleType);
    setEditingStyleId(null);
    setShowStyleEditor(true);
  }, []);

  const handleEditStyle = useCallback((styleType, styleId) => {
    setEditingStyleType(styleType);
    setEditingStyleId(styleId);
    setShowStyleEditor(true);
  }, []);

  const handleStyleSaved = useCallback((styleId, styleData) => {
    setSidebarUpdateTrigger(prev => prev + 1);
    setShowStyleEditor(false);
    setEditingStyleType(null);
    setEditingStyleId(null);
  }, []);

  const handleStyleCreatedFromProperties = useCallback((styleType, styleId) => {
    setSidebarUpdateTrigger(prev => prev + 1);
  }, []);

  const handleElementMouseDown = useCallback((e, element) => {
    e.preventDefault();
    e.stopPropagation();
    selectElement(element);
    handleMouseDown(e, element);
  }, [selectElement, handleMouseDown]);

  const handleCanvasClick = useCallback((e) => {
    clearSelection();
  }, [clearSelection]);

  const handleSave = useCallback(() => {
    onSave(getLayoutData());
    onClose();
  }, [onSave, getLayoutData, onClose]);

  const handleDuplicateSelected = useCallback(() => {
    if (selectedElement) {
      duplicateElement(selectedElement.id);
    }
  }, [selectedElement, duplicateElement]);

  const handleClose = useCallback(() => {
    clearSelection();
    onClose();
  }, [clearSelection, onClose]);

  const handleAddElement = useCallback((type) => {
    addElement(type);
  }, [addElement]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedElement) {
      deleteSelected();
    }
  }, [selectedElement, deleteSelected]);

  const handleTextChange = useCallback((elementId, field, value) => {
    updateElement(elementId, { [field]: value });
  }, [updateElement]);

  const handleElementDoubleClick = useCallback((element) => {
    if (element.type === 'variable') {
      console.log('Variable double clicked:', element.id);
    }
  }, []);

  const handleGlobalMouseMove = useCallback((e) => {
    if (isDragging) {
      handleMouseMove(e);
    } else if (isResizing) {
      handleResizeMove(e);
    }
  }, [isDragging, isResizing, handleMouseMove, handleResizeMove]);

  const handleGlobalMouseUp = useCallback((e) => {
    if (isDragging) {
      handleMouseUp(e);
    } else if (isResizing) {
      handleResizeEnd(e);
    }
  }, [isDragging, isResizing, handleMouseUp, handleResizeEnd]);

  const handleCloseStyleEditor = useCallback(() => {
    setShowStyleEditor(false);
    setEditingStyleType(null);
    setEditingStyleId(null);
  }, []);

  if (!isOpen) return null;

  const modalContent = (
    <div 
      style={layoutDesignerStyles.modalOverlay}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div 
        style={layoutDesignerStyles.modalContent}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={layoutDesignerStyles.header}>
          <h2 style={layoutDesignerStyles.title}>
            🎨 Layout Designer - Estilo Inspire Designer
          </h2>
          
          <div style={layoutDesignerStyles.headerControls}>
            <button
              onClick={handleToggleVariableValues}
              style={{
                ...layoutDesignerStyles.toggleButton,
                background: showVariableValues ? '#eff6ff' : 'white',
                color: showVariableValues ? '#1e40af' : '#374151'
              }}
              title={showVariableValues ? 'Mostrar nombres de variables' : 'Mostrar valores de variables'}
            >
              <span style={{ fontSize: '14px' }}>
                {showVariableValues ? '👁️' : '🔗'}
              </span>
              {showVariableValues ? 'Ver Variables' : 'Ver Valores'}
            </button>
          </div>
          
          <button 
            onClick={handleClose}
            style={layoutDesignerStyles.closeButton}
          >
            ✕
          </button>
        </div>

        {/* Toolbar */}
        <Toolbar
          onAddElement={handleAddElement}
          onDeleteSelected={handleDeleteSelected}
          onDuplicateSelected={handleDuplicateSelected}
          onClearAll={clearLayout}
          selectedElement={selectedElement}
          elementsCount={elements.length}
        />

        {/* Main Content Area */}
        <div style={layoutDesignerStyles.mainContent}>
          <StylesSidebar
            selectedElement={selectedElement}
            onApplyStyle={handleApplyStyle}
            onCreateNewStyle={handleCreateNewStyle}
            onEditStyle={handleEditStyle}
            availableVariables={availableData}
            showVariableValues={showVariableValues}
            onToggleVariableValues={handleToggleVariableValues}
            updateTrigger={sidebarUpdateTrigger}
          />

          <Canvas
            elements={elements}
            selectedElement={selectedElement}
            isDragging={isDragging}
            isResizing={isResizing}
            onMouseMove={handleGlobalMouseMove}
            onMouseUp={handleGlobalMouseUp}
            onCanvasClick={handleCanvasClick}
            onElementMouseDown={handleElementMouseDown}
            onResizeStart={handleResizeStart}
            onTextChange={handleTextChange}
            onElementDoubleClick={handleElementDoubleClick}
            availableVariables={availableData}
            showVariableValues={showVariableValues}
          />

          <PropertiesPanel
            selectedElement={selectedElement}
            onUpdateSelectedElement={updateSelectedElement}
            availableData={availableData}
            onCreateNewStyle={handleCreateNewStyle}
            onStyleCreated={handleStyleCreatedFromProperties}
          />
        </div>

        {/* Footer */}
        <div style={layoutDesignerStyles.footer}>
          <div style={layoutDesignerStyles.footerInfo}>
            <strong>📊 Elementos:</strong> {elements.length}
            {selectedElement && (
              <span style={{ marginLeft: '20px', color: '#3b82f6' }}>
                <strong>🎯 Seleccionado:</strong> {selectedElement.type} 
                <span style={{ marginLeft: '8px', fontSize: '11px' }}>
                  ({Math.round(selectedElement.x)}, {Math.round(selectedElement.y)})
                </span>
              </span>
            )}
            <span style={{ marginLeft: '20px', color: showVariableValues ? '#16a34a' : '#f59e0b' }}>
              <strong>👁️ Vista:</strong> {showVariableValues ? 'Valores' : 'Variables'}
            </span>
          </div>
          
          <div style={layoutDesignerStyles.footerButtons}>
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
              size="large"
            >
              💾 Guardar Layout
            </Button>
          </div>
        </div>
      </div>

      <StyleEditorModal
        isOpen={showStyleEditor}
        onClose={handleCloseStyleEditor}
        styleType={editingStyleType}
        editingStyleId={editingStyleId}
        onStyleSaved={handleStyleSaved}
      />
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default LayoutDesigner;