// src/components/layoutDesigner/LayoutDesigner.jsx - HEADER OPTIMIZADO
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLayoutDesigner } from './hooks/useLayoutDesigner';
import { useDragAndDrop } from '../../hooks/useDragAndDrop';
import { useVariableManager } from './hooks/useVariableManager';

// Componentes principales
import Canvas from './Canvas';
import Toolbar from './Toolbar';
import PropertiesPanel from './PropertiesPanel';
import PageManager from './PageManager/PageManager';
import StylesSidebar from './StylesSidebar';
import StyleEditorModal from './StyleEditor';

// Constantes
import { ELEMENT_TYPES } from './utils/constants';

// Estilos optimizados para layout compacto
const layoutDesignerStyles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    zIndex: 999999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px', // Reducido
    boxSizing: 'border-box'
  },
  modalContent: {
    width: '98vw',
    height: '95vh',
    background: 'white',
    borderRadius: '8px', // Reducido
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
  },
  // ✅ Header compacto optimizado
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 16px', // Reducido de 16px a 8px
    borderBottom: '1px solid #e5e7eb',
    background: '#ffffff',
    flexShrink: 0,
    minHeight: '48px' // Altura mínima definida
  },
  title: {
    margin: 0,
    fontSize: '16px', // Reducido de 20px
    fontWeight: '600',
    color: '#1f2937',
    flex: 1
  },
  headerControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px', // Reducido de 12px
    flexShrink: 0
  },
  toggleButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 10px', // Reducido
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '11px', // Reducido
    cursor: 'pointer',
    transition: 'all 0.2s',
    backgroundColor: 'white',
    fontWeight: '500'
  },
  closeButton: {
    background: '#fee2e2',
    border: '1px solid #fecaca',
    cursor: 'pointer',
    padding: '6px 10px', // Reducido
    borderRadius: '4px',
    color: '#dc2626',
    fontSize: '12px', // Reducido
    fontWeight: 'bold',
    transition: 'all 0.2s'
  },
  mainContent: {
    display: 'flex',
    flex: 1,
    minHeight: 0,
    overflow: 'hidden'
  },
  // ✅ Footer compacto
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 16px', // Reducido de 12px
    borderTop: '1px solid #e5e7eb',
    background: '#f8fafc',
    flexShrink: 0,
    minHeight: '44px' // Altura mínima definida
  },
  footerInfo: {
    fontSize: '11px', // Reducido
    color: '#6b7280',
    fontWeight: '500'
  },
  footerButtons: {
    display: 'flex',
    gap: '8px' // Reducido
  }
};

const LayoutDesigner = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData = null,
  availableVariables = {},
  availableData = {}, 
  title = "🎨 Layout Designer - Estilo Inspire Designer"
}) => {
  // ✅ Hook principal del Layout Designer
  const {
    elements,
    selectedElement,
    pages,
    currentPageIndex,
    currentPage,
    stats,
    addElement,
    updateSelectedElement,
    updateElement,
    moveElement,
    deleteSelected,
    duplicateElement,
    selectElement,
    clearSelection,
    addPage,
    duplicatePage,
    deletePage,
    goToPage,
    updatePageConfig,
    applyPageSizePreset,
    togglePageOrientation,
    getPageSizePresets,
    clearLayout,
    getLayoutData,
    loadLayoutData,
    undo,
    redo,
    canUndo,
    canRedo
  } = useLayoutDesigner(initialData);

  // ✅ Hook para Drag & Drop
  const {
    isDragging,
    draggedElement,
    dragOffset,
    handleMouseDown: dragMouseDown,
    handleMouseMove: dragMouseMove,
    handleMouseUp: dragMouseUp,
    resetDrag,
    cancelDrag
  } = useDragAndDrop(moveElement);

  // ✅ Hook para manejo de variables
  const {
    processedVariables,
    showVariableValues,
    setShowVariableValues
  } = useVariableManager(availableVariables || availableData);

  // ✅ Estados locales del componente
  const [showStylesSidebar, setShowStylesSidebar] = useState(true);
  const [showPageManager, setShowPageManager] = useState(true);
  const [showStyleEditor, setShowStyleEditor] = useState(false);
  const [editingStyleType, setEditingStyleType] = useState(null);
  const [editingStyleId, setEditingStyleId] = useState(null);
  const [sidebarUpdateTrigger, setSidebarUpdateTrigger] = useState(0);
  const canvasRef = useRef(null);

  // ✅ Efectos para el modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      
      const reactFlowWrapper = document.querySelector('.react-flow');
      if (reactFlowWrapper) {
        reactFlowWrapper.style.pointerEvents = 'none';
        reactFlowWrapper.style.userSelect = 'none';
      }
      
      return () => {
        document.body.style.overflow = 'unset';
        if (reactFlowWrapper) {
          reactFlowWrapper.style.pointerEvents = 'auto';
          reactFlowWrapper.style.userSelect = 'auto';
        }
      };
    }
  }, [isOpen]);

  // ✅ Efectos para atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      
      if ((e.ctrlKey || e.metaKey)) {
        switch (e.key) {
          case 'z':
            e.preventDefault();
            if (e.shiftKey) {
              redo();
            } else {
              undo();
            }
            break;
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'd':
            e.preventDefault();
            if (selectedElement) {
              duplicateElement(selectedElement.id);
            }
            break;
        }
      }
      
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedElement && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          deleteSelected();
        }
      }
      
      if (e.key === 'Escape') {
        clearSelection();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, selectedElement, undo, redo, deleteSelected, clearSelection, duplicateElement]);

  // ✅ Manejadores de eventos del Canvas
  const handleCanvasClick = useCallback((e) => {
    const isCanvasBackground = e.target.getAttribute('data-canvas') === 'true';
    if (isCanvasBackground) {
      clearSelection();
    }
  }, [clearSelection]);

  const handleElementMouseDown = useCallback((e, element) => {
    e.preventDefault();
    e.stopPropagation();
    selectElement(element);
    dragMouseDown(e, element);
  }, [selectElement, dragMouseDown]);

  const handleElementDoubleClick = useCallback((element) => {
    if (element.type === ELEMENT_TYPES.TEXT) {
      console.log('🖋️ Edit text mode for:', element.id);
    } else if (element.type === 'variable') {
      console.log('🔗 Variable double clicked:', element.id);
    }
  }, []);

  const handleTextChange = useCallback((elementId, field, value) => {
    updateElement(elementId, { [field]: value });
  }, [updateElement]);

  // ✅ Manejadores de toolbar
  const handleAddElement = useCallback((type) => {
    const position = {
      x: Math.random() * 300 + 100,
      y: Math.random() * 200 + 100
    };
    addElement(type, position);
  }, [addElement]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedElement) {
      deleteSelected();
    }
  }, [selectedElement, deleteSelected]);

  const handleDuplicateSelected = useCallback(() => {
    if (selectedElement) {
      duplicateElement(selectedElement.id);
    }
  }, [selectedElement, duplicateElement]);

  // ✅ Manejador de guardado
  const handleSave = useCallback(() => {
    const layoutData = getLayoutData();
    console.log('💾 Saving layout data:', layoutData);
    
    if (onSave) {
      onSave(layoutData);
    }
    onClose();
  }, [getLayoutData, onSave, onClose]);

  // ✅ Manejador de cierre
  const handleClose = useCallback(() => {
    clearSelection();
    onClose();
  }, [clearSelection, onClose]);

  // ✅ Manejadores de estilos
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

  const handleCloseStyleEditor = useCallback(() => {
    setShowStyleEditor(false);
    setEditingStyleType(null);
    setEditingStyleId(null);
  }, []);

  const handleToggleVariableValues = useCallback(() => {
    setShowVariableValues(prev => !prev);
  }, [setShowVariableValues]);

  // ✅ Manejadores globales de mouse
  const handleGlobalMouseMove = useCallback((e) => {
    if (isDragging) {
      dragMouseMove(e);
    }
  }, [isDragging, dragMouseMove]);

  const handleGlobalMouseUp = useCallback((e) => {
    if (isDragging) {
      dragMouseUp(e);
    }
  }, [isDragging, dragMouseUp]);

  // No renderizar si no está abierto
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
        {/* ✅ Header optimizado y compacto */}
        <div style={layoutDesignerStyles.header}>
          <div style={layoutDesignerStyles.title}>
            {title}
            {pages.length > 1 && (
              <span style={{ 
                fontSize: '12px', 
                fontWeight: '400', 
                color: '#6b7280',
                marginLeft: '8px'
              }}>
                - {currentPageIndex + 1}/{pages.length}
              </span>
            )}
          </div>

          <div style={layoutDesignerStyles.headerControls}>
            {/* Toggle Page Manager */}
            <button
              onClick={() => setShowPageManager(!showPageManager)}
              style={{
                ...layoutDesignerStyles.toggleButton,
                backgroundColor: showPageManager ? '#eff6ff' : 'white',
                color: showPageManager ? '#2563eb' : '#6b7280'
              }}
              title="Mostrar/Ocultar gestor de páginas"
            >
              📄
            </button>

            {/* Toggle Variables */}
            <button
              onClick={handleToggleVariableValues}
              style={{
                ...layoutDesignerStyles.toggleButton,
                backgroundColor: showVariableValues ? '#f0fdf4' : 'white',
                color: showVariableValues ? '#16a34a' : '#6b7280'
              }}
              title={showVariableValues ? 'Mostrar nombres' : 'Mostrar valores'}
            >
              {showVariableValues ? '👁️' : '🔗'}
            </button>

            {/* Toggle Styles Sidebar */}
            <button
              onClick={() => setShowStylesSidebar(!showStylesSidebar)}
              style={{
                ...layoutDesignerStyles.toggleButton,
                backgroundColor: showStylesSidebar ? '#fef3c7' : 'white',
                color: showStylesSidebar ? '#d97706' : '#6b7280'
              }}
              title="Mostrar/Ocultar panel de estilos"
            >
              🎨
            </button>

            <button 
              onClick={handleClose}
              style={layoutDesignerStyles.closeButton}
              title="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>

        {/* ✅ Page Manager compacto */}
        {showPageManager && (
          <div style={{ 
            flexShrink: 0, 
            background: '#ffffff', 
            borderBottom: '1px solid #e5e7eb'
          }}>
            <PageManager
              pages={pages}
              currentPageIndex={currentPageIndex}
              onAddPage={addPage}
              onDuplicatePage={duplicatePage}
              onDeletePage={deletePage}
              onGoToPage={goToPage}
              onUpdatePageConfig={updatePageConfig}
              onToggleOrientation={togglePageOrientation}
              onApplyPreset={applyPageSizePreset}
              getPageSizePresets={getPageSizePresets}
            />
          </div>
        )}

        {/* ✅ Toolbar compacto */}
        <div style={{ 
          flexShrink: 0,
          background: '#f8fafc',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <Toolbar
            onAddElement={handleAddElement}
            onDeleteSelected={handleDeleteSelected}
            onDuplicateSelected={handleDuplicateSelected}
            onClearAll={clearLayout}
            selectedElement={selectedElement}
            elementsCount={elements.length}
          />
        </div>

        {/* Main Content */}
        <div style={layoutDesignerStyles.mainContent}>
          {/* Styles Sidebar */}
          {showStylesSidebar && (
            <div style={{ 
              width: '280px',
              flexShrink: 0,
              background: '#f9fafb',
              borderRight: '1px solid #e5e7eb' 
            }}>
              <StylesSidebar
                selectedElement={selectedElement}
                onApplyStyle={handleApplyStyle}
                onCreateNewStyle={handleCreateNewStyle}
                onEditStyle={handleEditStyle}
                availableVariables={availableData || availableVariables}
                showVariableValues={showVariableValues}
                onToggleVariableValues={handleToggleVariableValues}
                updateTrigger={sidebarUpdateTrigger}
              />
            </div>
          )}

          {/* Canvas */}
          <div style={{ 
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            background: '#ffffff',
            overflow: 'hidden'
          }}>
            <Canvas
              ref={canvasRef}
              elements={elements}
              selectedElement={selectedElement}
              isDragging={isDragging}
              isResizing={false}
              onMouseMove={handleGlobalMouseMove}
              onMouseUp={handleGlobalMouseUp}
              onCanvasClick={handleCanvasClick}
              onElementMouseDown={handleElementMouseDown}
              onResizeStart={() => {}}
              onTextChange={handleTextChange}
              onElementDoubleClick={handleElementDoubleClick}
              availableVariables={availableData || availableVariables}
              showVariableValues={showVariableValues}
            />
          </div>

          {/* Properties Panel */}
          <div style={{ 
            width: '320px',
            flexShrink: 0,
            background: '#f9fafb',
            borderLeft: '1px solid #e5e7eb'
          }}>
            <PropertiesPanel
              selectedElement={selectedElement}
              onUpdateSelectedElement={updateSelectedElement}
              availableData={availableData || availableVariables}
              onCreateNewStyle={handleCreateNewStyle}
              onStyleCreated={handleStyleCreatedFromProperties}
            />
          </div>
        </div>

        {/* ✅ Footer compacto */}
        <div style={layoutDesignerStyles.footer}>
          <div style={layoutDesignerStyles.footerInfo}>
            <strong>📊</strong> {elements.length} elem.
            {selectedElement && (
              <span style={{ marginLeft: '16px', color: '#3b82f6' }}>
                <strong>🎯</strong> {selectedElement.type} 
                <span style={{ fontSize: '10px', marginLeft: '4px' }}>
                  ({Math.round(selectedElement.x)}, {Math.round(selectedElement.y)})
                </span>
              </span>
            )}
            <span style={{ marginLeft: '16px', color: showVariableValues ? '#16a34a' : '#f59e0b' }}>
              <strong>👁️</strong> {showVariableValues ? 'Valores' : 'Variables'}
            </span>
          </div>
          
          <div style={layoutDesignerStyles.footerButtons}>
            <button
              onClick={handleClose}
              style={{
                padding: '6px 12px', // Reducido
                background: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px', // Reducido
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              Cancelar
            </button>
            
            <button
              onClick={handleSave}
              style={{
                padding: '6px 12px', // Reducido
                background: '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px', // Reducido
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              💾 Guardar
            </button>
          </div>
        </div>

        {/* Style Editor Modal */}
        <StyleEditorModal
          isOpen={showStyleEditor}
          onClose={handleCloseStyleEditor}
          styleType={editingStyleType}
          editingStyleId={editingStyleId}
          onStyleSaved={handleStyleSaved}
        />
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default LayoutDesigner;