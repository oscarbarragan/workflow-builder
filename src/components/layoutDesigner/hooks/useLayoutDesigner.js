// src/hooks/useLayoutDesigner.js - Hook principal para el Layout Designer
import { useState, useCallback, useRef } from 'react';
import { ELEMENT_TYPES, DEFAULT_ELEMENT_PROPS } from '../utils/constants';

export const useLayoutDesigner = (initialData = null) => {
  // ✅ Estados principales
  const [elements, setElements] = useState(initialData?.elements || []);
  const [selectedElement, setSelectedElement] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // ✅ Referencias
  const nextIdRef = useRef(1);
  const maxHistorySize = 50;

  // ✅ Función para generar IDs únicos
  const generateElementId = useCallback(() => {
    return `element_${Date.now()}_${nextIdRef.current++}`;
  }, []);

  // ✅ Función para guardar estado en historial
  const saveToHistory = useCallback((elementsState) => {
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(elementsState)));
      
      // Limitar tamaño del historial
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
      } else {
        setHistoryIndex(prev => prev + 1);
      }
      
      return newHistory;
    });
  }, [historyIndex]);

  // ✅ Agregar nuevo elemento
  const addElement = useCallback((type, position = null) => {
    console.log('➕ Adding new element:', type);
    
    const defaultProps = DEFAULT_ELEMENT_PROPS[type] || {};
    const newElement = {
      id: generateElementId(),
      type,
      x: position?.x || 50,
      y: position?.y || 50,
      zIndex: 100,
      ...defaultProps
    };

    setElements(prev => {
      const newElements = [...prev, newElement];
      saveToHistory(newElements);
      return newElements;
    });

    // Seleccionar automáticamente el nuevo elemento
    setSelectedElement(newElement);
    
    console.log('✅ Element added:', newElement.id);
    return newElement;
  }, [generateElementId, saveToHistory]);

  // ✅ Actualizar elemento seleccionado
  const updateSelectedElement = useCallback((field, value) => {
    if (!selectedElement) {
      console.warn('⚠️ No element selected for update');
      return;
    }

    console.log('📝 Updating selected element field:', field, 'value:', value);

    setElements(prev => {
      const newElements = prev.map(element => 
        element.id === selectedElement.id 
          ? { ...element, [field]: value }
          : element
      );
      
      // Actualizar también el elemento seleccionado
      setSelectedElement(prev => ({
        ...prev,
        [field]: value
      }));
      
      saveToHistory(newElements);
      return newElements;
    });
  }, [selectedElement, saveToHistory]);

  // ✅ Actualizar elemento por ID
  const updateElement = useCallback((elementId, updates) => {
    console.log('📝 Updating element:', elementId, 'updates:', updates);

    setElements(prev => {
      const newElements = prev.map(element => 
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
      
      saveToHistory(newElements);
      return newElements;
    });
  }, [selectedElement, saveToHistory]);

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

    setElements(prev => {
      const newElements = prev.filter(element => element.id !== selectedElement.id);
      saveToHistory(newElements);
      return newElements;
    });

    setSelectedElement(null);
  }, [selectedElement, saveToHistory]);

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

    setElements(prev => {
      const newElements = [...prev, duplicatedElement];
      saveToHistory(newElements);
      return newElements;
    });

    setSelectedElement(duplicatedElement);
    return duplicatedElement;
  }, [elements, generateElementId, saveToHistory]);

  // ✅ Limpiar layout
  const clearLayout = useCallback(() => {
    console.log('🧹 Clearing entire layout');
    
    setElements([]);
    setSelectedElement(null);
    saveToHistory([]);
  }, [saveToHistory]);

  // ✅ Obtener datos del layout
  const getLayoutData = useCallback(() => {
    return {
      elements: elements.map(element => ({
        ...element,
        // Limpiar referencias temporales si las hay
        isSelected: undefined,
        isDragging: undefined,
        isResizing: undefined
      })),
      selectedElementId: selectedElement?.id || null,
      createdAt: new Date().toISOString(),
      version: '1.0'
    };
  }, [elements, selectedElement]);

  // ✅ Cargar datos del layout
  const loadLayoutData = useCallback((layoutData) => {
    console.log('📂 Loading layout data:', layoutData);
    
    if (layoutData?.elements && Array.isArray(layoutData.elements)) {
      setElements(layoutData.elements);
      
      // Seleccionar elemento si se especifica
      if (layoutData.selectedElementId) {
        const elementToSelect = layoutData.elements.find(
          el => el.id === layoutData.selectedElementId
        );
        setSelectedElement(elementToSelect || null);
      } else {
        setSelectedElement(null);
      }
      
      // Actualizar referencia de ID para evitar conflictos
      const maxId = layoutData.elements.reduce((max, el) => {
        const match = el.id.match(/element_\d+_(\d+)/);
        return match ? Math.max(max, parseInt(match[1])) : max;
      }, 0);
      nextIdRef.current = maxId + 1;
      
      saveToHistory(layoutData.elements);
      console.log('✅ Layout data loaded successfully');
    } else {
      console.warn('⚠️ Invalid layout data provided');
    }
  }, [saveToHistory]);

  // ✅ Historial - Deshacer
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const previousState = history[newIndex];
      
      setElements(previousState);
      setHistoryIndex(newIndex);
      setSelectedElement(null); // Limpiar selección al deshacer
      
      console.log('↶ Undo performed, index:', newIndex);
    }
  }, [history, historyIndex]);

  // ✅ Historial - Rehacer
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const nextState = history[newIndex];
      
      setElements(nextState);
      setHistoryIndex(newIndex);
      setSelectedElement(null); // Limpiar selección al rehacer
      
      console.log('↷ Redo performed, index:', newIndex);
    }
  }, [history, historyIndex]);

  // ✅ Obtener elemento por ID
  const getElementById = useCallback((elementId) => {
    return elements.find(element => element.id === elementId);
  }, [elements]);

  // ✅ Verificar si se puede deshacer/rehacer
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // ✅ Estadísticas del layout
  const stats = {
    totalElements: elements.length,
    selectedElement: selectedElement,
    canUndo,
    canRedo,
    historySize: history.length
  };

  return {
    // Estado
    elements,
    selectedElement,
    stats,
    
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
    
    // Utilidades
    getElementById
  };
};