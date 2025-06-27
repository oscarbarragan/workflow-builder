import { useState, useCallback } from 'react';
import { ELEMENT_TYPES, DEFAULT_ELEMENT_PROPS } from '../utils/constants';

export const useLayoutDesigner = (initialData) => {
  const [elements, setElements] = useState(initialData?.elements || []);
  const [selectedElement, setSelectedElement] = useState(null);

  // Add new element to layout
  const addElement = useCallback((type) => {
    const newElement = {
      id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      x: Math.random() * 400 + 50,
      y: Math.random() * 200 + 50,
      ...DEFAULT_ELEMENT_PROPS[type]
    };
    
    console.log('🆕 Adding new element:', newElement);
    
    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement);
  }, []);

  // Update element properties - ✅ MEJORADO para manejar estilos anidados
  const updateElement = useCallback((elementId, updates) => {
    console.log('📝 Updating element:', elementId, updates);
    
    setElements(prev => prev.map(el => {
      if (el.id === elementId) {
        const updatedElement = { ...el };
        
        // Manejar actualizaciones de propiedades anidadas como textStyle y paragraphStyle
        Object.entries(updates).forEach(([key, value]) => {
          if (key === 'textStyle' && el.textStyle) {
            // Merge con textStyle existente
            updatedElement.textStyle = { ...el.textStyle, ...value };
          } else if (key === 'paragraphStyle' && el.paragraphStyle) {
            // Merge con paragraphStyle existente
            updatedElement.paragraphStyle = { ...el.paragraphStyle, ...value };
          } else {
            // Actualización directa de propiedad
            updatedElement[key] = value;
          }
        });
        
        console.log('✅ Element updated:', updatedElement);
        return updatedElement;
      }
      return el;
    }));
    
    // Actualizar elemento seleccionado si es el que se está editando
    if (selectedElement && selectedElement.id === elementId) {
      setSelectedElement(prev => {
        const updated = { ...prev };
        Object.entries(updates).forEach(([key, value]) => {
          if (key === 'textStyle' && prev.textStyle) {
            updated.textStyle = { ...prev.textStyle, ...value };
          } else if (key === 'paragraphStyle' && prev.paragraphStyle) {
            updated.paragraphStyle = { ...prev.paragraphStyle, ...value };
          } else {
            updated[key] = value;
          }
        });
        return updated;
      });
    }
  }, [selectedElement]);

  // Update selected element - ✅ MEJORADO para manejar estilos anidados
  const updateSelectedElement = useCallback((field, value) => {
    if (!selectedElement) return;
    
    console.log('🎯 Updating selected element field:', field, value);
    
    // Si el campo es textStyle o paragraphStyle, hacer merge
    if (field === 'textStyle' || field === 'paragraphStyle') {
      const currentStyle = selectedElement[field] || {};
      const updatedStyle = typeof value === 'object' ? value : { [field]: value };
      updateElement(selectedElement.id, { [field]: updatedStyle });
    } else {
      // Actualización normal
      updateElement(selectedElement.id, { [field]: value });
    }
  }, [selectedElement, updateElement]);

  // ✅ NUEVA: Función para aplicar preset de estilo
  const applyStylePreset = useCallback((elementId, preset) => {
    if (!preset) return;
    
    console.log('🎨 Applying style preset:', preset.name, 'to element:', elementId);
    
    updateElement(elementId, {
      textStyle: preset.textStyle,
      paragraphStyle: preset.paragraphStyle
    });
  }, [updateElement]);

  // Delete element
  const deleteElement = useCallback((elementId) => {
    console.log('🗑️ Deleting element:', elementId);
    
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
    console.log('🎯 Selecting element:', element.id, element.type);
    setSelectedElement(element);
  }, []);

  // Clear selection
  const clearSelection = useCallback(() => {
    console.log('❌ Clearing selection');
    setSelectedElement(null);
  }, []);

  // Move element
  const moveElement = useCallback((elementId, x, y) => {
    updateElement(elementId, { x, y });
  }, [updateElement]);

  // ✅ NUEVA: Función para duplicar elemento con estilos
  const duplicateElement = useCallback((elementId) => {
    const element = elements.find(el => el.id === elementId);
    if (!element) return;

    const duplicatedElement = {
      ...element,
      id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      x: element.x + 20,
      y: element.y + 20,
      // ✅ Clonar estilos profundamente
      textStyle: element.textStyle ? { ...element.textStyle } : undefined,
      paragraphStyle: element.paragraphStyle ? { ...element.paragraphStyle } : undefined
    };

    console.log('📋 Duplicating element with styles:', duplicatedElement);

    setElements(prev => [...prev, duplicatedElement]);
    setSelectedElement(duplicatedElement);
  }, [elements]);

  // ✅ MEJORADA: Get layout data con soporte para estilos
  const getLayoutData = useCallback(() => {
    const layoutData = {
      elements: elements.map(element => ({
        ...element,
        // Asegurar que los estilos se incluyan en la exportación
        textStyle: element.textStyle || undefined,
        paragraphStyle: element.paragraphStyle || undefined
      })),
      metadata: {
        version: '2.0',
        createdAt: new Date().toISOString(),
        totalElements: elements.length,
        textElements: elements.filter(el => el.type === ELEMENT_TYPES.TEXT).length,
        variableElements: elements.filter(el => el.type === ELEMENT_TYPES.VARIABLE).length,
        rectangleElements: elements.filter(el => el.type === ELEMENT_TYPES.RECTANGLE).length,
        hasCustomStyles: elements.some(el => el.textStyle || el.paragraphStyle)
      }
    };
    
    console.log('💾 Getting layout data with styles:', layoutData);
    return layoutData;
  }, [elements]);

  // ✅ MEJORADA: Load layout data con soporte para estilos
  const loadLayoutData = useCallback((data) => {
    if (!data || !data.elements) {
      console.warn('⚠️ Invalid layout data provided');
      return;
    }

    console.log('📂 Loading layout data with styles:', data);

    // Asegurar que los elementos tengan las propiedades de estilo necesarias
    const processedElements = data.elements.map(element => ({
      ...element,
      // Asegurar que los elementos de texto tengan estilos por defecto si no los tienen
      textStyle: element.type === ELEMENT_TYPES.TEXT && !element.textStyle 
        ? DEFAULT_ELEMENT_PROPS[ELEMENT_TYPES.TEXT].textStyle 
        : element.textStyle,
      paragraphStyle: element.type === ELEMENT_TYPES.TEXT && !element.paragraphStyle 
        ? DEFAULT_ELEMENT_PROPS[ELEMENT_TYPES.TEXT].paragraphStyle 
        : element.paragraphStyle
    }));

    setElements(processedElements);
    setSelectedElement(null);
  }, []);

  // Clear layout
  const clearLayout = useCallback(() => {
    console.log('🧹 Clearing layout');
    setElements([]);
    setSelectedElement(null);
  }, []);

  // ✅ NUEVA: Función para obtener estadísticas de estilos
  const getStyleStatistics = useCallback(() => {
    const stats = {
      totalElements: elements.length,
      elementsWithCustomTextStyle: 0,
      elementsWithCustomParagraphStyle: 0,
      fontFamiliesUsed: new Set(),
      fontSizesUsed: new Set(),
      colorsUsed: new Set(),
      alignmentsUsed: new Set()
    };

    elements.forEach(element => {
      if (element.textStyle) {
        stats.elementsWithCustomTextStyle++;
        if (element.textStyle.fontFamily) stats.fontFamiliesUsed.add(element.textStyle.fontFamily);
        if (element.textStyle.fontSize) stats.fontSizesUsed.add(element.textStyle.fontSize);
        if (element.textStyle.color) stats.colorsUsed.add(element.textStyle.color);
      }

      if (element.paragraphStyle) {
        stats.elementsWithCustomParagraphStyle++;
        if (element.paragraphStyle.alignment) stats.alignmentsUsed.add(element.paragraphStyle.alignment);
      }
    });

    // Convertir Sets a arrays para serialización
    stats.fontFamiliesUsed = Array.from(stats.fontFamiliesUsed);
    stats.fontSizesUsed = Array.from(stats.fontSizesUsed);
    stats.colorsUsed = Array.from(stats.colorsUsed);
    stats.alignmentsUsed = Array.from(stats.alignmentsUsed);

    return stats;
  }, [elements]);

  // ✅ NUEVA: Función para aplicar estilo en lote
  const applyStyleToMultipleElements = useCallback((elementIds, styleType, styleValues) => {
    console.log('🎨 Applying bulk style:', styleType, 'to elements:', elementIds);

    elementIds.forEach(elementId => {
      updateElement(elementId, { [styleType]: styleValues });
    });
  }, [updateElement]);

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
    
    // Style functions - ✅ NUEVAS
    applyStylePreset,
    applyStyleToMultipleElements,
    
    // Data management
    getLayoutData,
    loadLayoutData,
    clearLayout,
    
    // Statistics - ✅ NUEVA
    getStyleStatistics
  };
};