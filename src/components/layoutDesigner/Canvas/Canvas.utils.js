// src/components/layoutDesigner/Canvas/Canvas.utils.js
export const canvasUtils = {
    preventSelect: (e) => {
      e.preventDefault();
      return false;
    },
  
    preventDrag: (e) => {
      e.preventDefault();
      return false;
    },
  
    preventContext: (e) => {
      e.preventDefault();
      return false;
    },
  
    isCanvasElement: (target) => {
      return target.getAttribute('data-canvas') === 'true';
    },
  
    getElementKey: (element) => {
      return element?.id || `element-${Math.random().toString(36).substr(2, 9)}`;
    },
  
    validateElement: (element) => {
      if (!element || !element.id) {
        console.warn('Invalid element found:', element);
        return false;
      }
      return true;
    },
  
    getCanvasInfo: (elements, selectedElement) => {
      return {
        totalElements: elements.length,
        selectedType: selectedElement?.type,
        selectedPosition: selectedElement ? 
          { x: Math.round(selectedElement.x), y: Math.round(selectedElement.y) } : 
          null
      };
    }
  };