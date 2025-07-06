// src/components/layoutDesigner/hooks/useElementTransforms.js
import { useCallback, useEffect, useRef } from 'react';
import { elementTransforms } from '../utils/elementTransforms';

export const useElementTransforms = (element, isSelected = false) => {
  const elementRef = useRef(null);
  const lastTransformRef = useRef('');

  /**
   * ✅ Aplica transformaciones al elemento DOM
   */
  const applyTransforms = useCallback((domElement, elementData) => {
    if (!domElement || !elementData) return;

    const transform = elementTransforms.generateElementTransform(elementData);
    
    // Solo aplicar si ha cambiado
    if (lastTransformRef.current !== transform) {
      console.log('🎯 Applying transform:', elementData.id, transform);
      
      domElement.style.transform = transform;
      domElement.style.transformOrigin = 'center center';
      
      lastTransformRef.current = transform;
    }
  }, []);

  /**
   * ✅ Efecto para aplicar transformaciones cuando cambie el elemento
   */
  useEffect(() => {
    if (elementRef.current && element) {
      applyTransforms(elementRef.current, element);
    }
  }, [element, element?.rotation, element?.scale, applyTransforms]);

  /**
   * ✅ Callback para configurar la referencia del elemento
   */
  const setElementRef = useCallback((domElement) => {
    elementRef.current = domElement;
    
    if (domElement && element) {
      // Aplicar transformaciones inmediatamente
      applyTransforms(domElement, element);
    }
  }, [element, applyTransforms]);

  /**
   * ✅ Obtener estilos con transformaciones aplicadas
   */
  const getTransformStyles = useCallback(() => {
    const transform = elementTransforms.generateElementTransform(element);
    
    return {
      transform,
      transformOrigin: 'center center',
      transition: 'transform 0.2s ease'
    };
  }, [element]);

  /**
   * ✅ Obtener handles de resize considerando rotación
   */
  const getResizeHandles = useCallback(() => {
    if (!element || !isSelected) return [];
    
    return elementTransforms.getTransformedResizeHandles(element);
  }, [element, isSelected]);

  /**
   * ✅ Verificar si el elemento tiene transformaciones
   */
  const hasTransformations = useCallback(() => {
    return elementTransforms.hasTransformations(element);
  }, [element]);

  /**
   * ✅ Forzar actualización de transformaciones
   */
  const forceUpdate = useCallback(() => {
    if (elementRef.current && element) {
      lastTransformRef.current = ''; // Reset para forzar actualización
      applyTransforms(elementRef.current, element);
    }
  }, [element, applyTransforms]);

  return {
    // Referencias
    setElementRef,
    elementRef: elementRef.current,
    
    // Funciones
    applyTransforms,
    getTransformStyles,
    getResizeHandles,
    hasTransformations,
    forceUpdate,
    
    // Estado
    hasTransforms: hasTransformations()
  };
};