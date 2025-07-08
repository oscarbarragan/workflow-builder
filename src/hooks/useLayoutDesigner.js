// src/components/layoutDesigner/hooks/useLayoutDesigner.js - CORREGIDO
import { useState, useCallback, useRef } from 'react';
import { ELEMENT_TYPES, DEFAULT_ELEMENT_PROPS } from '../utils/constants';
import { usePageManager } from './usePageManager';

export const useLayoutDesigner = (initialData = null) => {
  // ✅ Integrar Page Manager - CORREGIDO: pasar solo las páginas
  const initialPages = initialData?.pages || null;
  
  const {
    pages,
    currentPageIndex,
    currentPage,
    addPage,
    duplicatePage,
    deletePage,
    goToPage,
    reorderPages,
    updatePageConfig,
    updatePageElements,
    applyPageSizePreset,
    togglePageOrientation,
    getPageDimensionsInPixels,
    getPageSizePresets,
    exportPages,
    importPages,
    getStatistics: getPageStatistics
  } = usePageManager(initialPages);

  // ✅ Estados principales (ahora basados en página actual)
  const [selectedElement, setSelectedElement] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // ✅ Referencias
  const nextIdRef = useRef(1);
  const maxHistorySize = 50;

  // ✅ Obtener elementos de la página actual
  const elements = currentPage?.elements || [];

  // ✅ Función para generar IDs únicos
  const generateElementId = useCallback(() => {
    return `element_${Date.now()}_${nextIdRef.current++}`;
  }, []);

  // ✅ Función para guardar estado en historial
  const saveToHistory = useCallback((elementsState) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(elementsState)));
      
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
      } else {
        setHistoryIndex(prev => prev + 1);
      }
      
      return newHistory;
    });
  }, [historyIndex]);

  // ✅ Agregar nuevo elemento (a la página actual)
  const addElement = useCallback((type, position = null) => {
    if (!Object.values(ELEMENT_TYPES).includes(type)) {
      console.warn('⚠️ Invalid element type:', type);
      return null;
    }

    console.log('➕ Adding new element to page:', currentPageIndex, type);
    
    const defaultProps = DEFAULT_ELEMENT_PROPS[type] || {};
    const newElement = {
      id: generateElementId(),
      type,
      x: position?.x || Math.random() * 300 + 50,
      y: position?.y || Math.random() * 200 + 50,
      zIndex: 100,
      ...defaultProps
    };

    const newElements = [...elements, newElement];
    updatePageElements(currentPageIndex, newElements);
    saveToHistory(newElements);

    // Seleccionar automáticamente el nuevo elemento
    setSelectedElement(newElement);
    
    console.log('✅ Element added to page:', newElement.id);
    return newElement;
  }, [currentPageIndex, elements, generateElementId, updatePageElements, saveToHistory]);

  // ✅ Actualizar elemento seleccionado
  const updateSelectedElement = useCallback((field, value) => {
    if (!selectedElement) {
      console.warn('⚠️ No element selected for update');
      return;
    }

    console.log('📝 Updating selected element field:', field, 'value:', value);

    const newElements = elements.map(element => 
      element.id === selectedElement.id 
        ? { ...element, [field]: value }
        : element
    );
    
    // Actualizar también el elemento seleccionado
    setSelectedElement(prev => ({
      ...prev,
      [field]: value
    }));
    
    updatePageElements(currentPageIndex, newElements);
    saveToHistory(newElements);
  }, [selectedElement, elements, currentPageIndex, updatePageElements, saveToHistory]);

  // ✅ Actualizar elemento por ID
  const updateElement = useCallback((elementId, updates) => {
    console.log('📝 Updating element:', elementId, 'updates:', updates);

    const newElements = elements.map(element => 
      element.id === elementId 
        ? { ...element, ...updates }
        : element
    );
    
    // Si es el elemento seleccionado, actualizar también
    if (selectedElement?.id === elementId) {
      setSelectedElement(prev => ({
        ...prev,
        ...updates
      }));
    }
    
    updatePageElements(currentPageIndex, newElements);
    saveToHistory(newElements);
  }, [selectedElement, elements, currentPageIndex, updatePageElements, saveToHistory]);

  // ✅ Mover elemento
  const moveElement = useCallback((elementId, x, y) => {
    updateElement(elementId, { x, y });
  }, [updateElement]);

  // ✅ Seleccionar elemento
  const selectElement = useCallback((element) => {
    console.log('🎯 Selecting element:', element?.id);
    setSelectedElement(element);
  }, []);

  // ✅ Limpiar selección
  const clearSelection = useCallback(() => {
    console.log('🔄 Clearing selection');
    setSelectedElement(null);
  }, []);

  // ✅ Eliminar elemento seleccionado
  const deleteSelected = useCallback(() => {
    if (!selectedElement) {
      console.warn('⚠️ No element selected for deletion');
      return;
    }

    console.log('🗑️ Deleting selected element:', selectedElement.id);

    const newElements = elements.filter(element => element.id !== selectedElement.id);
    updatePageElements(currentPageIndex, newElements);
    saveToHistory(newElements);
    setSelectedElement(null);
  }, [selectedElement, elements, currentPageIndex, updatePageElements, saveToHistory]);

  // ✅ Duplicar elemento
  const duplicateElement = useCallback((elementId) => {
    const elementToDuplicate = elements.find(el => el.id === elementId);
    if (!elementToDuplicate) {
      console.warn('⚠️ Element not found for duplication:', elementId);
      return;
    }

    console.log('📋 Duplicating element:', elementId);

    const duplicatedElement = {
      ...elementToDuplicate,
      id: generateElementId(),
      x: elementToDuplicate.x + 20,
      y: elementToDuplicate.y + 20
    };

    const newElements = [...elements, duplicatedElement];
    updatePageElements(currentPageIndex, newElements);
    saveToHistory(newElements);
    setSelectedElement(duplicatedElement);
    
    return duplicatedElement;
  }, [elements, currentPageIndex, generateElementId, updatePageElements, saveToHistory]);

  // ✅ Limpiar página actual
  const clearLayout = useCallback(() => {
    console.log('🧹 Clearing current page layout');
    
    updatePageElements(currentPageIndex, []);
    setSelectedElement(null);
    saveToHistory([]);
  }, [currentPageIndex, updatePageElements, saveToHistory]);

  // ✅ Obtener datos del layout completo (todas las páginas)
  const getLayoutData = useCallback(() => {
    const pagesData = exportPages();
    
    return {
      ...pagesData,
      selectedElementId: selectedElement?.id || null,
      version: '2.0', // Incrementar versión para indicar soporte de páginas múltiples
      createdAt: new Date().toISOString()
    };
  }, [exportPages, selectedElement]);

  // ✅ Cargar datos del layout
  const loadLayoutData = useCallback((layoutData) => {
    console.log('📂 Loading layout data:', layoutData);
    
    try {
      if (layoutData?.pages) {
        // Nuevo formato con páginas múltiples
        importPages(layoutData);
        
        // Seleccionar elemento si se especifica
        if (layoutData.selectedElementId && layoutData.currentPageIndex !== undefined) {
          const targetPage = layoutData.pages[layoutData.currentPageIndex];
          if (targetPage) {
            const elementToSelect = targetPage.elements.find(
              el => el.id === layoutData.selectedElementId
            );
            setSelectedElement(elementToSelect || null);
          }
        }
      } else if (layoutData?.elements) {
        // Formato legacy con una sola página
        console.log('📂 Converting legacy single-page layout to multi-page');
        
        const legacyPage = {
          id: `page_${Date.now()}_1`,
          name: 'Página Principal',
          size: { width: 210, height: 297, unit: 'mm', preset: 'A4' },
          orientation: 'portrait',
          elements: layoutData.elements,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        importPages({
          pages: [legacyPage],
          currentPageIndex: 0,
          totalPages: 1
        });
        
        // Seleccionar elemento legacy
        if (layoutData.selectedElementId) {
          const elementToSelect = layoutData.elements.find(
            el => el.id === layoutData.selectedElementId
          );
          setSelectedElement(elementToSelect || null);
        }
      }
      
      // Actualizar referencia de ID para evitar conflictos
      let maxId = 0;
      pages.forEach(page => {
        if (page.elements) {
          page.elements.forEach(el => {
            const match = el.id.match(/element_\d+_(\d+)/);
            if (match) {
              maxId = Math.max(maxId, parseInt(match[1]));
            }
          });
        }
      });
      nextIdRef.current = maxId + 1;
      
      console.log('✅ Layout data loaded successfully');
    } catch (error) {
      console.error('❌ Error loading layout data:', error);
    }
  }, [importPages, pages]);

  // ✅ Cambiar página y limpiar selección
  const handlePageChange = useCallback((pageIndex) => {
    console.log('📄 Changing to page:', pageIndex);
    setSelectedElement(null); // Limpiar selección al cambiar página
    goToPage(pageIndex);
  }, [goToPage]);

  // ✅ Historial - Deshacer
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const previousState = history[newIndex];
      
      updatePageElements(currentPageIndex, previousState);
      setHistoryIndex(newIndex);
      setSelectedElement(null); // Limpiar selección al deshacer
      
      console.log('↶ Undo performed for page:', currentPageIndex, 'index:', newIndex);
    }
  }, [history, historyIndex, currentPageIndex, updatePageElements]);

  // ✅ Historial - Rehacer
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      
      updatePageElements(currentPageIndex, nextState);
      setHistoryIndex(newIndex);
      setSelectedElement(null); // Limpiar selección al rehacer
      
      console.log('↷ Redo performed for page:', currentPageIndex, 'index:', newIndex);
    }
  }, [history, historyIndex, currentPageIndex, updatePageElements]);

  // ✅ Obtener elemento por ID
  const getElementById = useCallback((elementId) => {
    return elements.find(element => element.id === elementId);
  }, [elements]);

  // ✅ Verificar si se puede deshacer/rehacer
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // ✅ Estadísticas del layout completo
  const stats = {
    // Estadísticas de elementos (página actual)
    totalElements: elements.length,
    selectedElement: selectedElement,
    canUndo,
    canRedo,
    historySize: history.length,
    
    // Estadísticas de páginas
    ...getPageStatistics(),
    
    // Información de página actual
    currentPageName: currentPage?.name,
    currentPageSize: currentPage?.size,
    currentPageDimensions: getPageDimensionsInPixels()
  };

  // ✅ Funciones específicas de páginas (reexportar para facilidad de uso)
  const pageOperations = {
    addPage,
    duplicatePage,
    deletePage,
    goToPage: handlePageChange,
    reorderPages,
    updatePageConfig,
    applyPageSizePreset,
    togglePageOrientation,
    getPageSizePresets,
    getPageDimensionsInPixels
  };

  return {
    // Estado de elementos (página actual)
    elements,
    selectedElement,
    stats,
    
    // Estado de páginas
    pages,
    currentPageIndex,
    currentPage,
    
    // Operaciones de elementos
    addElement,
    updateSelectedElement,
    updateElement,
    moveElement,
    deleteSelected,
    duplicateElement,
    
    // Selección
    selectElement,
    clearSelection,
    
    // Layout completo
    clearLayout,
    getLayoutData,
    loadLayoutData,
    
    // Historial
    undo,
    redo,
    canUndo,
    canRedo,
    
    // Operaciones de páginas
    ...pageOperations,
    
    // Utilidades
    getElementById
  };
};