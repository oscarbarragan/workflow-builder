import { useState, useCallback } from 'react';
import { ELEMENT_TYPES, DEFAULT_ELEMENT_PROPS } from '../utils/constants';

export const useLayoutDesigner = (initialData) => {
  const [elements, setElements] = useState(initialData?.elements || []);
  const [selectedElement, setSelectedElement] = useState(null);

  // Add new element to layout
  const addElement = useCallback((type) => {
    const newElement = {
      id: Date.now(),
      type,
      x: Math.random() * 400 + 50,
      y: Math.random() * 200 + 50,
      ...DEFAULT_ELEMENT_PROPS[type]
    };
    
    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement);
  }, []);

  // Update element properties
  const updateElement = useCallback((elementId, updates) => {
    setElements(prev => prev.map(el =>
      el.id === elementId ? { ...el, ...updates } : el
    ));
    
    if (selectedElement && selectedElement.id === elementId) {
      setSelectedElement(prev => ({ ...prev, ...updates }));
    }
  }, [selectedElement]);

  // Update selected element
  const updateSelectedElement = useCallback((field, value) => {
    if (!selectedElement) return;
    
    const updates = { [field]: value };
    updateElement(selectedElement.id, updates);
  }, [selectedElement, updateElement]);

  // Delete element
  const deleteElement = useCallback((elementId) => {
    setElements(prev => prev.filter(el => el.id !== elementId));
    
    if (selectedElement && selectedElement.id === elementId) {
      setSelectedElement(null);
    }
  }, [selectedElement]);

  // Delete selected element
  const deleteSelected = useCallback(() => {
    if (!selectedElement) return;
    deleteElement(selectedElement.id);
  }, [selectedElement, deleteElement]);

  // Select element
  const selectElement = useCallback((element) => {
    setSelectedElement(element);
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedElement(null);
  }, []);

  // Move element
  const moveElement = useCallback((elementId, x, y) => {
    updateElement(elementId, { x, y });
  }, [updateElement]);

  // Get layout data for export
  const getLayoutData = useCallback(() => {
    return { elements };
  }, [elements]);

  // Load layout data
  const loadLayoutData = useCallback((data) => {
    setElements(data?.elements || []);
    setSelectedElement(null);
  }, []);

  // Clear layout
  const clearLayout = useCallback(() => {
    setElements([]);
    setSelectedElement(null);
  }, []);

  // Duplicate element
  const duplicateElement = useCallback((elementId) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const duplicatedElement = {
      ...element,
      id: Date.now(),
      x: element.x + 20,
      y: element.y + 20
    };

    setElements(prev => [...prev, duplicatedElement]);
    setSelectedElement(duplicatedElement);
  }, [elements]);

  return {
    // State
    elements,
    selectedElement,
    
    // Actions
    addElement,
    updateElement,
    updateSelectedElement,
    deleteElement,
    deleteSelected,
    selectElement,
    clearSelection,
    moveElement,
    duplicateElement,
    
    // Data management
    getLayoutData,
    loadLayoutData,
    clearLayout
  };
};