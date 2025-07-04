// src/components/layoutDesigner/utils/elementFactory.js
import { ELEMENT_TYPES, DEFAULT_ELEMENT_PROPS } from './constants';

export const elementFactory = {
  // Generar ID único para elementos
  generateId: (type) => {
    return `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Crear nuevo elemento
  createElement: (type, overrides = {}) => {
    const baseElement = {
      id: elementFactory.generateId(type),
      type,
      x: Math.random() * 400 + 50,
      y: Math.random() * 200 + 50,
      ...DEFAULT_ELEMENT_PROPS[type],
      ...overrides
    };

    console.log('🏭 Creating element:', baseElement);
    return baseElement;
  },

  // Duplicar elemento existente
  duplicateElement: (element) => {
    const duplicated = {
      ...element,
      id: elementFactory.generateId(element.type),
      x: element.x + 20,
      y: element.y + 20,
      // Clonar estilos profundamente
      textStyle: element.textStyle ? { ...element.textStyle } : undefined,
      paragraphStyle: element.paragraphStyle ? { ...element.paragraphStyle } : undefined
    };

    console.log('📋 Duplicating element:', duplicated);
    return duplicated;
  },

  // Procesar elemento cargado desde archivo
  processLoadedElement: (element) => {
    const processed = {
      ...element,
      // Asegurar que los elementos de texto tengan estilos por defecto
      textStyle: element.type === ELEMENT_TYPES.TEXT && !element.textStyle 
        ? DEFAULT_ELEMENT_PROPS[ELEMENT_TYPES.TEXT].textStyle 
        : element.textStyle,
      paragraphStyle: element.type === ELEMENT_TYPES.TEXT && !element.paragraphStyle 
        ? DEFAULT_ELEMENT_PROPS[ELEMENT_TYPES.TEXT].paragraphStyle 
        : element.paragraphStyle
    };

    console.log('📂 Processing loaded element:', processed);
    return processed;
  },

  // Validar elemento
  validateElement: (element) => {
    const errors = [];

    if (!element.id) {
      errors.push('Element must have an ID');
    }

    if (!element.type || !Object.values(ELEMENT_TYPES).includes(element.type)) {
      errors.push('Element must have a valid type');
    }

    if (typeof element.x !== 'number' || typeof element.y !== 'number') {
      errors.push('Element must have valid x and y coordinates');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  },

  // Crear elemento desde configuración
  createFromConfig: (config) => {
    return elementFactory.createElement(config.type, config.defaultProps);
  },

  // Obtener propiedades por defecto de un tipo
  getDefaultProps: (type) => {
    return { ...DEFAULT_ELEMENT_PROPS[type] };
  },

  // Resetear elemento a valores por defecto
  resetToDefaults: (element) => {
    const defaults = elementFactory.getDefaultProps(element.type);
    return {
      ...element,
      ...defaults,
      // Mantener posición e ID
      id: element.id,
      x: element.x,
      y: element.y
    };
  }
};