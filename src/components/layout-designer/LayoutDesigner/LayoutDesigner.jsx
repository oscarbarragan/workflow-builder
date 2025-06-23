import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import Button from '../../common/Button/Button';
import Canvas from './Canvas';
import Toolbar from './Toolbar';
import PropertiesPanel from './PropertiesPanel';
import { useLayoutDesigner } from '../../../hooks/useLayoutDesigner';
import { useDragAndDrop } from '../../../hooks/useDragAndDrop';
import { useResize } from '../../../hooks/useResize';

const LayoutDesigner = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData, 
  availableData = {} 
}) => {
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

    // Dimensiones mínimas
    const minWidth = 50;
    const minHeight = 30;
    
    let newWidth = initialElement.width;
    let newHeight = initialElement.height;
    let newX = initialElement.x;
    let newY = initialElement.y;

    // Calcular nuevas dimensiones SOLO desde las dimensiones iniciales
    switch (corner) {
      case 'bottom-right':
        newWidth = Math.max(minWidth, initialElement.width + deltaX);
        newHeight = Math.max(minHeight, initialElement.height + deltaY);
        // X e Y se mantienen iguales
        break;
        
      case 'bottom-left':
        newWidth = Math.max(minWidth, initialElement.width - deltaX);
        newHeight = Math.max(minHeight, initialElement.height + deltaY);
        // Ajustar X solo si el ancho cambió
        newX = initialElement.x + (initialElement.width - newWidth);
        break;
        
      case 'top-right':
        newWidth = Math.max(minWidth, initialElement.width + deltaX);
        newHeight = Math.max(minHeight, initialElement.height - deltaY);
        // Ajustar Y solo si el alto cambió
        newY = initialElement.y + (initialElement.height - newHeight);
        break;
        
      case 'top-left':
        newWidth = Math.max(minWidth, initialElement.width - deltaX);
        newHeight = Math.max(minHeight, initialElement.height - deltaY);
        // Ajustar ambos X e Y
        newX = initialElement.x + (initialElement.width - newWidth);
        newY = initialElement.y + (initialElement.height - newHeight);
        break;
    }

    console.log('📏 New dimensions:', { newWidth, newHeight, newX, newY });

    // Redondear valores y actualizar
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

  // Handler para cambios de texto inline
  const handleTextChange = (elementId, field, value) => {
    console.log('✏️ Text changed:', elementId, field, value);
    updateElement(elementId, { [field]: value });
  };

  // Handler para doble click (abrir selector de variables)
  const handleElementDoubleClick = (element) => {
    console.log('👆 Element double clicked:', element.type);
    if (element.type === 'variable') {
      // Aquí podrías abrir un modal selector de variables
      console.log('📝 Opening variable selector for:', element.id);
    }
  };

  // Combinar eventos de mouse para drag y resize
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
            🎨 Diseñador de Layout
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
          gap: '24px',
          minHeight: 0
        }}>
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
          marginTop: '20px',
          paddingTop: '16px',
          borderTop: '2px solid #e5e7eb'
        }}>
          <div style={{
            fontSize: '14px',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            <strong>📊 Elementos:</strong> {elements.length}
            {selectedElement && (
              <span style={{ marginLeft: '20px', color: '#3b82f6' }}>
                <strong>🎯 Seleccionado:</strong> {selectedElement.type} 
                <span style={{ marginLeft: '8px', fontSize: '12px' }}>
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
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default LayoutDesigner;