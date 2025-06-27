// src/components/layout-designer/LayoutDesigner/LayoutDesigner.jsx - CORREGIDO colapso sidebar
import React, { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Button from '../../common/Button/Button';
import Canvas from './Canvas';
import Toolbar from './Toolbar';
import PropertiesPanel from './PropertiesPanel';
import StylesSidebar from '../StylesSidebar/StylesSidebar';
import StyleEditorModal from '../StyleEditor/StyleEditorModal';
import { useLayoutDesigner } from '../../../hooks/useLayoutDesigner';
import { useDragAndDrop } from '../../../hooks/useDragAndDrop';
import { useResize } from '../../../hooks/useResize';
import { styleManager } from '../../../utils/StyleManager';

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
  
  // ✅ NUEVO: Estado para controlar actualizaciones del sidebar sin perder estado
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

    console.log('🔧 Resize callback:', { elementId, corner, deltaX, deltaY, initialElement });

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

  useEffect(() => {
    if (isOpen) {
      console.log('🎨 Layout Designer opened - disabling ReactFlow');
      
      const reactFlowWrapper = document.querySelector('.react-flow');
      if (reactFlowWrapper) {
        reactFlowWrapper.style.pointerEvents = 'none';
        reactFlowWrapper.style.userSelect = 'none';
        console.log('✅ ReactFlow disabled');
      }
      
      document.body.style.overflow = 'hidden';
      
      return () => {
        console.log('🎨 Layout Designer closed - re-enabling ReactFlow');
        if (reactFlowWrapper) {
          reactFlowWrapper.style.pointerEvents = 'auto';
          reactFlowWrapper.style.userSelect = 'auto';
        }
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen]);

  const handleToggleVariableValues = useCallback(() => {
    setShowVariableValues(prev => !prev);
    console.log('🔄 Toggling variable values display:', !showVariableValues);
  }, [showVariableValues]);

  // ✅ CORREGIDO: Handler para aplicar estilos desde el sidebar
  const handleApplyStyle = useCallback((elementId, styleType, styleId) => {
    console.log('🎨 Applying style:', { elementId, styleType, styleId });
    
    if (!elementId || !styleType || !styleId) {
      console.warn('❌ Missing parameters for style application');
      return;
    }

    const styleIdField = `${styleType}Id`;
    
    const updates = {
      [styleIdField]: styleId
    };

    // Limpiar estilos manuales para evitar conflictos
    if (styleType === 'textStyle') {
      updates.textStyle = null;
    } else if (styleType === 'paragraphStyle') {
      updates.paragraphStyle = null;
    } else if (styleType === 'borderStyle') {
      updates.borderStyle = null;
    } else if (styleType === 'fillStyle') {
      updates.fillStyle = null;
    }

    console.log('📝 Updating element with:', updates);
    updateElement(elementId, updates);
    
    // ✅ CRÍTICO: Trigger sidebar update sin perder estado
    setSidebarUpdateTrigger(prev => prev + 1);
    
    console.log('✅ Style applied successfully');
  }, [updateElement]);

  // ✅ Handler para crear nuevo estilo
  const handleCreateNewStyle = useCallback((styleType) => {
    console.log('✨ Creating new style:', styleType);
    setEditingStyleType(styleType);
    setEditingStyleId(null);
    setShowStyleEditor(true);
  }, []);

  // ✅ Handler para editar estilo existente
  const handleEditStyle = useCallback((styleType, styleId) => {
    console.log('📝 Editing style:', styleType, styleId);
    setEditingStyleType(styleType);
    setEditingStyleId(styleId);
    setShowStyleEditor(true);
  }, []);

  // ✅ MEJORADO: Handler cuando se guarda un estilo
  const handleStyleSaved = useCallback((styleId, styleData) => {
    console.log('💾 Style saved:', styleId, styleData);
    
    // ✅ IMPORTANTE: Solo trigger update, no recargar página
    setSidebarUpdateTrigger(prev => prev + 1);
    
    // Cerrar modal
    setShowStyleEditor(false);
    setEditingStyleType(null);
    setEditingStyleId(null);
  }, []);

  // ✅ Handler cuando se crea un estilo desde Properties Panel
  const handleStyleCreatedFromProperties = useCallback((styleType, styleId) => {
    console.log('🎨 Style created from properties:', styleType, styleId);
    setSidebarUpdateTrigger(prev => prev + 1);
  }, []);

  const handleElementMouseDown = useCallback((e, element) => {
    console.log('🎯 LayoutDesigner handleElementMouseDown:', element.type, element.id);
    
    e.preventDefault();
    e.stopPropagation();
    
    selectElement(element);
    console.log('✅ Element selected:', element.id);
    
    handleMouseDown(e, element);
    console.log('✅ Drag started for:', element.id);
  }, [selectElement, handleMouseDown]);

  const handleCanvasClick = useCallback((e) => {
    console.log('🎨 LayoutDesigner handleCanvasClick - clearing selection');
    clearSelection();
  }, [clearSelection]);

  const handleSave = useCallback(() => {
    console.log('💾 Saving layout data');
    onSave(getLayoutData());
    onClose();
  }, [onSave, getLayoutData, onClose]);

  const handleDuplicateSelected = useCallback(() => {
    if (selectedElement) {
      console.log('📋 Duplicating element:', selectedElement.id);
      duplicateElement(selectedElement.id);
    }
  }, [selectedElement, duplicateElement]);

  const handleClose = useCallback(() => {
    console.log('❌ Closing layout designer');
    clearSelection();
    onClose();
  }, [clearSelection, onClose]);

  const handleAddElement = useCallback((type) => {
    console.log('➕ Adding element:', type);
    addElement(type);
  }, [addElement]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedElement) {
      console.log('🗑️ Deleting element:', selectedElement.id);
      deleteSelected();
    }
  }, [selectedElement, deleteSelected]);

  const handleTextChange = useCallback((elementId, field, value) => {
    console.log('✏️ Text changed:', elementId, field, value);
    updateElement(elementId, { [field]: value });
  }, [updateElement]);

  const handleElementDoubleClick = useCallback((element) => {
    console.log('👆 Element double clicked:', element.type);
    if (element.type === 'variable') {
      console.log('📝 Opening variable selector for:', element.id);
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

  // ✅ NUEVO: Handler para cerrar el modal de estilos
  const handleCloseStyleEditor = useCallback(() => {
    setShowStyleEditor(false);
    setEditingStyleType(null);
    setEditingStyleId(null);
  }, []);

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
    width: '98vw',
    height: '95vh',
    maxWidth: '1600px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    padding: '20px',
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
          marginBottom: '16px',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '12px'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '22px',
            fontWeight: '700',
            color: '#1f2937'
          }}>
            🎨 Layout Designer - Estilo Inspire Designer
          </h2>
          
          {/* Control de visualización de variables */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <button
              onClick={handleToggleVariableValues}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: showVariableValues ? '#eff6ff' : 'white',
                color: showVariableValues ? '#1e40af' : '#374151',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s'
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
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '6px',
              color: '#6b7280',
              fontSize: '20px',
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
        <div style={{
          display: 'flex',
          flex: 1,
          gap: '16px',
          minHeight: 0
        }}>
          {/* ✅ CORREGIDO: Styles Sidebar sin key que cause re-render completo */}
          <StylesSidebar
            selectedElement={selectedElement}
            onApplyStyle={handleApplyStyle}
            onCreateNewStyle={handleCreateNewStyle}
            onEditStyle={handleEditStyle}
            availableVariables={availableData}
            showVariableValues={showVariableValues}
            onToggleVariableValues={handleToggleVariableValues}
            updateTrigger={sidebarUpdateTrigger} // ✅ Usar prop para updates controlados
          />

          {/* Canvas */}
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

          {/* Properties Panel */}
          <PropertiesPanel
            selectedElement={selectedElement}
            onUpdateSelectedElement={updateSelectedElement}
            availableData={availableData}
            onCreateNewStyle={handleCreateNewStyle}
            onStyleCreated={handleStyleCreatedFromProperties}
          />
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '16px',
          paddingTop: '12px',
          borderTop: '2px solid #e5e7eb'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            fontWeight: '500'
          }}>
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
              size="large"
            >
              💾 Guardar Layout
            </Button>
          </div>
        </div>
      </div>

      {/* ✅ Modal de Editor de Estilos */}
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