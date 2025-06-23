import { useState, useCallback, useRef } from 'react';

export const useResize = (onResize) => {
  const [isResizing, setIsResizing] = useState(false);
  const [resizeData, setResizeData] = useState(null);
  const lastUpdateRef = useRef(0);
  const initialElementRef = useRef(null);

  const handleResizeStart = useCallback((e, elementId, corner, element) => {
    console.log('🔧 Starting resize:', elementId, corner);
    
    e.preventDefault();
    e.stopPropagation();
    
    // CRÍTICO: Guardar el elemento inicial completo
    initialElementRef.current = {
      id: elementId,
      width: element.width || (element.type === 'text' ? 200 : 100),
      height: element.height || (element.type === 'text' ? 100 : 50),
      x: element.x,
      y: element.y,
      type: element.type
    };
    
    setIsResizing(true);
    setResizeData({
      elementId,
      corner,
      startX: e.clientX,
      startY: e.clientY
    });
    
    // Prevenir selección durante resize
    document.body.style.userSelect = 'none';
    document.body.style.cursor = e.target.style.cursor;
    
    console.log('📏 Initial element state:', initialElementRef.current);
    
  }, []);

  const handleResizeMove = useCallback((e) => {
    if (!isResizing || !resizeData || !initialElementRef.current) return;
    
    e.preventDefault();
    
    // THROTTLING AGRESIVO: Solo actualizar cada 32ms (~30fps)
    const now = Date.now();
    if (now - lastUpdateRef.current < 32) return;
    lastUpdateRef.current = now;
    
    // Calcular movimiento del mouse desde el inicio
    const deltaX = e.clientX - resizeData.startX;
    const deltaY = e.clientY - resizeData.startY;
    
    // FACTOR DE REDUCCIÓN para hacer el resize menos sensible
    const sensitivityFactor = 0.5; // Reducir sensibilidad a la mitad
    const adjustedDeltaX = deltaX * sensitivityFactor;
    const adjustedDeltaY = deltaY * sensitivityFactor;
    
    console.log('🖱️ Mouse delta:', { deltaX, deltaY, adjusted: { adjustedDeltaX, adjustedDeltaY } });
    
    if (onResize) {
      onResize(
        resizeData.elementId, 
        resizeData.corner, 
        adjustedDeltaX, 
        adjustedDeltaY, 
        initialElementRef.current
      );
    }
    
  }, [isResizing, resizeData, onResize]);

  const handleResizeEnd = useCallback((e) => {
    if (!isResizing) return;
    
    console.log('🔧 Resize ended');
    
    e.preventDefault();
    
    // Restaurar estilos
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    
    // Limpiar referencias
    setIsResizing(false);
    setResizeData(null);
    lastUpdateRef.current = 0;
    initialElementRef.current = null;
    
  }, [isResizing]);

  const resetResize = useCallback(() => {
    setIsResizing(false);
    setResizeData(null);
    lastUpdateRef.current = 0;
    initialElementRef.current = null;
    
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
  }, []);

  return {
    isResizing,
    resizeData,
    handleResizeStart,
    handleResizeMove,
    handleResizeEnd,
    resetResize
  };
};