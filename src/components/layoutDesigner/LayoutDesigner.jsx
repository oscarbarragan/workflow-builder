// src/components/layoutDesigner/LayoutDesigner.jsx - CORRECCIÓN DEFINITIVA
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useLayoutDesigner } from './hooks/useLayoutDesigner';
import { useDragAndDrop } from '../../hooks/useDragAndDrop'; // ✅ USAR EL HOOK EXISTENTE
import { useVariableManager } from './hooks/useVariableManager';

// Componentes principales
import Canvas from './Canvas';
import Toolbar from './Toolbar';
import PropertiesPanel from './PropertiesPanel';
import PageManager from './PageManager/PageManager';
import StylesSidebar from './StylesSidebar';

// Constantes
import { ELEMENT_TYPES } from './utils/constants';

const LayoutDesigner = ({ 
  isOpen, 
  onClose, 
  onSave, 
  initialData = null,
  availableVariables = {},
  title = "Layout Designer"
}) => {
  // ✅ Hook principal del Layout Designer
  const {
    // Estado de elementos y páginas
    elements,
    selectedElement,
    pages,
    currentPageIndex,
    currentPage,
    stats,
    
    // Operaciones de elementos
    addElement,
    updateSelectedElement,
    updateElement,
    moveElement,
    deleteSelected,
    duplicateElement,
    selectElement,
    clearSelection,
    
    // Operaciones de páginas
    addPage,
    duplicatePage,
    deletePage,
    goToPage,
    updatePageConfig,
    applyPageSizePreset,
    togglePageOrientation,
    getPageSizePresets,
    
    // Layout completo
    clearLayout,
    getLayoutData,
    loadLayoutData,
    
    // Historial
    undo,
    redo,
    canUndo,
    canRedo
  } = useLayoutDesigner(initialData);

  // ✅ Hook para Drag & Drop (USAR EL EXISTENTE)
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
  } = useVariableManager(availableVariables);

  // ✅ Estados locales del componente
  const [showStylesSidebar, setShowStylesSidebar] = useState(false);
  const [showPageManager, setShowPageManager] = useState(true);
  const canvasRef = useRef(null);

  // ✅ Efectos para atajos de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
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
          case 'Backspace':
          case 'Delete':
            if (selectedElement && e.target.tagName !== 'INPUT') {
              e.preventDefault();
              deleteSelected();
            }
            break;
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
    console.log('🖱️ Element mouse down:', element.id);
    e.stopPropagation();
    selectElement(element);
    dragMouseDown(e, element);
  }, [selectElement, dragMouseDown]);

  const handleElementDoubleClick = useCallback((element) => {
    if (element.type === ELEMENT_TYPES.TEXT) {
      console.log('🖋️ Edit text mode for:', element.id);
    }
  }, []);

  const handleTextChange = useCallback((elementId, newText) => {
    updateElement(elementId, { text: newText });
  }, [updateElement]);

  // ✅ Manejadores de toolbar
  const handleAddElement = useCallback((type) => {
    const position = {
      x: Math.random() * 300 + 100,
      y: Math.random() * 200 + 100
    };
    addElement(type, position);
  }, [addElement]);

  // ✅ Manejador de guardado
  const handleSave = useCallback(() => {
    const layoutData = getLayoutData();
    console.log('💾 Saving layout data:', layoutData);
    
    if (onSave) {
      onSave(layoutData);
    }
  }, [getLayoutData, onSave]);

  // ✅ Manejador de carga de archivo
  const handleLoadFile = useCallback((file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const layoutData = JSON.parse(e.target.result);
        loadLayoutData(layoutData);
        console.log('📂 Layout loaded from file');
      } catch (error) {
        console.error('❌ Error loading file:', error);
        alert('Error al cargar el archivo. Verifique que sea un archivo válido.');
      }
    };
    reader.readAsText(file);
  }, [loadLayoutData]);

  // ✅ Manejador de exportación
  const handleExport = useCallback(() => {
    const layoutData = getLayoutData();
    const blob = new Blob([JSON.stringify(layoutData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `layout-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [getLayoutData]);

  // No renderizar si no está abierto
  if (!isOpen) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.8)',
        zIndex: 999999,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box'
      }}
      onClick={(e) => {
        // Cerrar solo si se hace clic en el overlay
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div style={{
        width: '95vw',
        height: '90vh',
        background: 'white',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid #e5e7eb',
          background: '#f8fafc',
          flexShrink: 0
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            {title}
            {pages.length > 1 && (
              <span style={{ 
                fontSize: '14px', 
                fontWeight: '400', 
                color: '#6b7280',
                marginLeft: '8px'
              }}>
                - Página {currentPageIndex + 1} de {pages.length}
              </span>
            )}
          </h2>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            {/* Toggle Page Manager */}
            <button
              onClick={() => setShowPageManager(!showPageManager)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: showPageManager ? '#eff6ff' : 'white',
                color: showPageManager ? '#2563eb' : '#6b7280'
              }}
              title="Mostrar/Ocultar gestor de páginas"
            >
              📄 Páginas
            </button>

            {/* Toggle Variables */}
            <button
              onClick={() => setShowVariableValues(!showVariableValues)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: showVariableValues ? '#f0fdf4' : 'white',
                color: showVariableValues ? '#16a34a' : '#6b7280'
              }}
              title="Mostrar/Ocultar valores de variables"
            >
              🔗 Variables: {showVariableValues ? 'ON' : 'OFF'}
            </button>

            {/* Toggle Styles Sidebar */}
            <button
              onClick={() => setShowStylesSidebar(!showStylesSidebar)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: showStylesSidebar ? '#fef3c7' : 'white',
                color: showStylesSidebar ? '#d97706' : '#6b7280'
              }}
              title="Mostrar/Ocultar panel de estilos"
            >
              🎨 Estilos
            </button>

            {/* Botón de cerrar */}
            <button
              onClick={onClose}
              style={{
                background: '#fee2e2',
                border: '1px solid #fecaca',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '6px',
                color: '#dc2626',
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'all 0.2s'
              }}
              title="Cerrar Layout Designer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Page Manager (opcional) */}
        {showPageManager && (
          <div style={{ 
            flexShrink: 0, 
            background: '#f8fafc', 
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

        {/* Main Content */}
        <div style={{
          display: 'flex',
          flex: 1,
          minHeight: 0,
          overflow: 'hidden'
        }}>
          {/* Styles Sidebar (opcional) */}
          {showStylesSidebar && (
            <div style={{ 
              width: '280px',
              flexShrink: 0,
              background: '#f9fafb',
              borderRight: '1px solid #e5e7eb' 
            }}>
              <StylesSidebar
                selectedElement={selectedElement}
                onStyleApply={(styleType, styleId) => {
                  if (selectedElement) {
                    updateSelectedElement(`${styleType}Id`, styleId);
                  }
                }}
              />
            </div>
          )}

          {/* Toolbar */}
          <div style={{ 
            flexShrink: 0,
            background: '#f3f4f6',
            borderRight: '1px solid #e5e7eb'
          }}>
            <Toolbar
              onAddElement={handleAddElement}
              onSave={handleSave}
              onLoadFile={handleLoadFile}
              onExport={handleExport}
              onClear={clearLayout}
              onUndo={undo}
              onRedo={redo}
              canUndo={canUndo}
              canRedo={canRedo}
              selectedElement={selectedElement}
              onDuplicate={() => selectedElement && duplicateElement(selectedElement.id)}
              onDelete={deleteSelected}
              stats={stats}
            />
          </div>

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
              onMouseMove={dragMouseMove}
              onMouseUp={dragMouseUp}
              onCanvasClick={handleCanvasClick}
              onElementMouseDown={handleElementMouseDown}
              onResizeStart={() => {}}
              onTextChange={handleTextChange}
              onElementDoubleClick={handleElementDoubleClick}
              availableVariables={processedVariables}
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
              onElementUpdate={updateSelectedElement}
              availableVariables={processedVariables}
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          borderTop: '1px solid #e5e7eb',
          background: '#f8fafc',
          flexShrink: 0
        }}>
          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            fontWeight: '500'
          }}>
            📊 {stats.totalElements} elementos en página actual
            {stats.hasMultiplePages && ` • ${stats.totalPages} páginas`}
            {selectedElement && ` • ${selectedElement.type} seleccionado`}
            {isDragging && ` • Moviendo elemento`}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={handleSave}
              style={{
                padding: '8px 16px',
                background: '#16a34a',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                transition: 'all 0.2s'
              }}
            >
              💾 Guardar Layout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LayoutDesigner;