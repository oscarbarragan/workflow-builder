// src/components/layoutDesigner/LayoutDesigner.jsx - ACTUALIZADO CON PAGE MANAGER
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useLayoutDesigner } from './hooks/useLayoutDesigner';
import { useDragAndDrop } from '../../hooks/useDragAndDrop'; // ✅ CORREGIDO: usar el hook existente
import { useVariableManager } from './hooks/useVariableManager';

// Componentes principales
import Canvas from './Canvas';
import Toolbar from './Toolbar';
import PropertiesPanel from './PropertiesPanel';
import PageManager from './PageManager/PageManager';
import StylesSidebar from './StylesSidebar';

// Estilos y constantes
import { layoutDesignerStyles } from './styles/theme';
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

  // ✅ Hook para Drag & Drop (usando el hook existente)
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

  // ✅ Efectos
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Atajos de teclado
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
      
      // Tecla Escape para limpiar selección
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
    // Solo limpiar selección si se hace clic en el canvas vacío
    const isCanvasBackground = e.target.getAttribute('data-canvas') === 'true';
    if (isCanvasBackground) {
      clearSelection();
    }
  }, [clearSelection]);

  const handleElementMouseDown = useCallback((e, element) => {
    e.stopPropagation();
    selectElement(element);
    dragMouseDown(e, element);
  }, [selectElement, dragMouseDown]);

  const handleElementDoubleClick = useCallback((element) => {
    if (element.type === ELEMENT_TYPES.TEXT) {
      // Activar modo de edición de texto
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
    <div style={layoutDesignerStyles.modalOverlay}>
      <div style={layoutDesignerStyles.modalContent}>
        {/* Header */}
        <div style={layoutDesignerStyles.header}>
          <h2 style={layoutDesignerStyles.title}>
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
              📄 Páginas
            </button>

            {/* Toggle Variables */}
            <button
              onClick={() => setShowVariableValues(!showVariableValues)}
              style={{
                ...layoutDesignerStyles.toggleButton,
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
                ...layoutDesignerStyles.toggleButton,
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
              style={layoutDesignerStyles.closeButton}
              title="Cerrar Layout Designer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Page Manager (opcional) */}
        {showPageManager && (
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
        )}

        {/* Main Content */}
        <div style={layoutDesignerStyles.mainContent}>
          {/* Styles Sidebar (opcional) */}
          {showStylesSidebar && (
            <StylesSidebar
              selectedElement={selectedElement}
              onStyleApply={(styleType, styleId) => {
                if (selectedElement) {
                  updateSelectedElement(`${styleType}Id`, styleId);
                }
              }}
            />
          )}

          {/* Toolbar */}
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

          {/* Canvas */}
          <Canvas
            ref={canvasRef}
            elements={elements}
            selectedElement={selectedElement}
            isDragging={isDragging}
            isResizing={false} // ✅ El hook existente no maneja resize
            onMouseMove={dragMouseMove}
            onMouseUp={dragMouseUp}
            onCanvasClick={handleCanvasClick}
            onElementMouseDown={handleElementMouseDown}
            onResizeStart={() => {}} // ✅ Placeholder hasta implementar resize
            onTextChange={handleTextChange}
            onElementDoubleClick={handleElementDoubleClick}
            availableVariables={processedVariables}
            showVariableValues={showVariableValues}
          />

          {/* Properties Panel */}
          <PropertiesPanel
            selectedElement={selectedElement}
            onElementUpdate={updateSelectedElement}
            availableVariables={processedVariables}
          />
        </div>

        {/* Footer */}
        <div style={layoutDesignerStyles.footer}>
          <div style={layoutDesignerStyles.footerInfo}>
            📊 {stats.totalElements} elementos en página actual
            {stats.hasMultiplePages && ` • ${stats.totalPages} páginas • ${stats.totalElements} elementos totales`}
            {selectedElement && ` • ${selectedElement.type} seleccionado`}
            {isDragging && ` • Moviendo elemento`}
          </div>

          <div style={layoutDesignerStyles.footerButtons}>
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
                fontWeight: '500'
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