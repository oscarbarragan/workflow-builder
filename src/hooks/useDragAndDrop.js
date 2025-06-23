import { useState, useCallback, useRef } from 'react';

export const useDragAndDrop = (onMove) => {
  const [isDragging, setIsDragging] = useState(false);
  const [draggedElement, setDraggedElement] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Start dragging
  const handleMouseDown = useCallback((e, element) => {
    console.log('🖱️ useDragAndDrop: handleMouseDown called for', element.id);
    
    // CORREGIDO: Solo usar stopPropagation (NO stopImmediatePropagation)
    e.preventDefault();
    e.stopPropagation();
    
    setDraggedElement(element);
    setIsDragging(true);
    
    // Buscar el canvas más cercano
    const canvas = e.currentTarget.closest('[data-canvas="true"]') || 
                  document.querySelector('[data-canvas="true"]');
    
    if (!canvas) {
      console.warn('⚠️ Canvas no encontrado');
      return;
    }
    
    const canvasRect = canvas.getBoundingClientRect();
    
    // Calcular offset desde el punto de click hasta la esquina del elemento
    const offsetX = e.clientX - canvasRect.left - element.x;
    const offsetY = e.clientY - canvasRect.top - element.y;
    
    setDragOffset({ x: offsetX, y: offsetY });
    
    // Guardar posición inicial
    dragStartPos.current = { x: element.x, y: element.y };
    
    // Prevenir selección de texto durante el drag
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';
    
    console.log('✅ Drag started successfully for', element.id);
    
  }, []);

  // Handle mouse move during drag
  const handleMouseMove = useCallback((e) => {
    if (!isDragging || !draggedElement) return;
    
    console.log('🖱️ useDragAndDrop: handleMouseMove during drag');
    
    // Prevenir comportamientos por defecto
    e.preventDefault();
    e.stopPropagation();
    
    // Buscar el canvas
    const canvas = document.querySelector('[data-canvas="true"]');
    if (!canvas) return;
    
    const canvasRect = canvas.getBoundingClientRect();
    
    // Calcular nueva posición
    const newX = Math.max(0, Math.min(
      canvasRect.width - (draggedElement.width || 100), 
      e.clientX - canvasRect.left - dragOffset.x
    ));
    
    const newY = Math.max(0, Math.min(
      canvasRect.height - (draggedElement.height || 50), 
      e.clientY - canvasRect.top - dragOffset.y
    ));
    
    // Snap to grid (opcional)
    const snapSize = 10;
    const snappedX = Math.round(newX / snapSize) * snapSize;
    const snappedY = Math.round(newY / snapSize) * snapSize;
    
    // Llamar al callback de movimiento
    if (onMove) {
      onMove(draggedElement.id, snappedX, snappedY);
    }
  }, [isDragging, draggedElement, dragOffset, onMove]);

  // End dragging
  const handleMouseUp = useCallback((e) => {
    if (!isDragging) return;
    
    console.log('🖱️ useDragAndDrop: handleMouseUp - ending drag');
    
    // CORREGIDO: Solo usar stopPropagation
    e.preventDefault();
    e.stopPropagation();
    
    // Restaurar estilos del body
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
    
    // Limpiar estado
    setIsDragging(false);
    setDraggedElement(null);
    setDragOffset({ x: 0, y: 0 });
    
    console.log('✅ Drag ended successfully');
    
  }, [isDragging]);

  // Reset drag state (útil para casos de error)
  const resetDrag = useCallback(() => {
    console.log('🔄 Resetting drag state');
    setIsDragging(false);
    setDraggedElement(null);
    setDragOffset({ x: 0, y: 0 });
    
    // Restaurar estilos del body
    document.body.style.userSelect = '';
    document.body.style.webkitUserSelect = '';
  }, []);

  // Cancelar drag (volver a posición original)
  const cancelDrag = useCallback(() => {
    console.log('❌ Cancelling drag');
    if (isDragging && draggedElement && onMove) {
      onMove(draggedElement.id, dragStartPos.current.x, dragStartPos.current.y);
    }
    resetDrag();
  }, [isDragging, draggedElement, onMove, resetDrag]);

  return {
    // State
    isDragging,
    draggedElement,
    dragOffset,
    
    // Handlers
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    
    // Utils
    resetDrag,
    cancelDrag
  };
};