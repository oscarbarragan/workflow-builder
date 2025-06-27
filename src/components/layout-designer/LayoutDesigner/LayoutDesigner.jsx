import React, { useEffect, useState } from 'react';
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
  const [forceUpdate, setForceUpdate] = useState(0);

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

  // ✅ NUEVO: Handler para aplicar estilos desde el sidebar
  const handleApplyStyle = (elementId, styleType, styleId) => {
    console.log('🎨 Applying style:', styleType, styleId, 'to element:', elementId);
    
    const styleIdField = `${styleType}Id`;
    updateElement(elementId, { [styleIdField]: styleId });
    
    // Forzar actualización para reflejar cambios
    setForceUpdate(prev => prev + 1);
  };

  // ✅ NUEVO: Handler para crear nuevo estilo
  const handleCreateNewStyle = (styleType) => {
    console.log('✨ Creating new style:', styleType);
    setEditingStyleType(styleType);
    setEditingStyleId(null);
    setShowStyleEditor(true);
  };

  // ✅ NUEVO: Handler para editar estilo existente
  const handleEditStyle = (styleType, styleId) => {
    console.log('📝 Editing style:', styleType, styleId);
    setEditingStyleType(styleType);
    setEditingStyleId(styleId);
    setShowStyleEditor(true);
  };

  // ✅ NUEVO: Handler cuando se guarda un estilo
  const handleStyleSaved = (styleId, styleData) => {
    console.log('💾 Style saved:', styleId, styleData);
    setForceUpdate(prev => prev + 1);
  };

  const handleElementMouseDown = (e, element) => {
    console.log('🎯 LayoutDesigner handleElementMouseDown:', element.type, element.id);
    
    e.preventDefault();
    e.stopPropagation();
    
    selectElement(element);
    console.log('✅ Element selected:', element.id);
    
    handleMouseDown(e, element);
    console.log('✅ Drag started for:', element.id);
  };

  const handleCanvasClick = (e) => {
    console.log('🎨 LayoutDesigner handleCanvasClick - clearing selection');
    clearSelection();
  };

  const handleSave = () => {
    console.log('💾 Saving layout data');
    onSave(getLayoutData());
    onClose();
  };

  const handleDuplicateSelected = () => {
    if (selectedElement) {
      console.log('📋 Duplicating element:', selectedElement.id);
      duplicateElement(selectedElement.id);
    }
  };

  const handleClose = () => {
    console.log('❌ Closing layout designer');
    clearSelection();
    onClose();
  };

  const handleAddElement = (type) => {
    console.log('➕ Adding element:', type);
    addElement(type);
  };

  const handleDeleteSelected = () => {
    if (selectedElement) {
      console.log('🗑️ Deleting element:', selectedElement.id);
      deleteSelected();
    }
  };

  const handleTextChange = (elementId, field, value) => {
    console.log('✏️ Text changed:', elementId, field, value);
    updateElement(elementId, { [field]: value });
  };

  const handleElementDoubleClick = (element) => {
    console.log('👆 Element double clicked:', element.type);
    if (element.type === 'variable') {
      console.log('📝 Opening variable selector for:', element.id);
    }
  };

  const handleGlobalMouseMove = (e) => {
    if (isDragging) {
      handleMouseMove(e);
    } else if (isResizing) {
      handleResizeMove(e);
    }
  };

  const handleGlobalMouseUp = (e) => {
    if (isDragging) {
      handleMouseUp(e);
    } else if (isResizing) {
      handleResizeEnd(e);
    }
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
    width: '98vw',
    height: '95vh',
    maxWidth: '1600px', // ✅ Más ancho para acomodar el sidebar
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
            🎨 Diseñador de Layout - Estilo Inspire Designer
          </h2>
          
          {/* Debug info en el header */}
          <div style={{
            fontSize: '11px',
            color: '#6b7280',
            fontFamily: 'monospace',
            textAlign: 'center',
            background: '#f3f4f6',
            padding: '4px 8px',
            borderRadius: '4px'
          }}>
            <div><strong>Elements:</strong> {elements.length}</div>
            <div><strong>Selected:</strong> {selectedElement?.id || 'none'}</div>
            <div><strong>Mode:</strong> {isDragging ? '🖱️ Drag' : isResizing ? '🔧 Resize' : '⏸️ Idle'}</div>
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

        {/* ✅ NUEVO: Main Content Area con Sidebar de Estilos */}
        <div style={{
          display: 'flex',
          flex: 1,
          gap: '16px',
          minHeight: 0
        }}>
          {/* ✅ NUEVO: Styles Sidebar */}
          <StylesSidebar
            selectedElement={selectedElement}
            onApplyStyle={handleApplyStyle}
            onCreateNewStyle={handleCreateNewStyle}
            onEditStyle={handleEditStyle}
            key={forceUpdate} // Forzar re-render cuando cambian los estilos
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
            availableVariables={availableData} // ✅ Pasar variables disponibles
          />

          {/* Properties Panel */}
          <PropertiesPanel
            selectedElement={selectedElement}
            onUpdateSelectedElement={updateSelectedElement}
            availableData={availableData}
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
            {(isDragging || isResizing) && (
              <span style={{ marginLeft: '20px', color: '#16a34a' }}>
                <strong>{isDragging ? '🖱️ Arrastrando' : '🔧 Redimensionando'}</strong>
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
              size="large"
            >
              💾 Guardar Layout
            </Button>
          </div>
        </div>
      </div>

      {/* ✅ NUEVO: Modal de Editor de Estilos */}
      <StyleEditorModal
        isOpen={showStyleEditor}
        onClose={() => {
          setShowStyleEditor(false);
          setEditingStyleType(null);
          setEditingStyleId(null);
        }}
        styleType={editingStyleType}
        editingStyleId={editingStyleId}
        onStyleSaved={handleStyleSaved}
      />
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default LayoutDesigner;