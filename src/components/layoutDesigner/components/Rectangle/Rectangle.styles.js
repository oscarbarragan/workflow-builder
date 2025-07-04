// src/components/layoutDesigner/components/Rectangle/Rectangle.styles.js
export const rectangleStyles = {
    container: (element, isSelected, isDragging) => ({
      position: 'absolute',
      left: element.x,
      top: element.y,
      width: element.width || 100,
      height: element.height || 50,
      background: element.fillColor || (isSelected ? 'rgba(59, 130, 246, 0.1)' : 'rgba(156, 163, 175, 0.1)'),
      border: `${element.borderWidth || 2}px ${element.borderStyle || 'solid'} ${element.borderColor || (isSelected ? '#3b82f6' : '#6b7280')}`,
      borderRadius: `${element.borderRadius || 4}px`,
      cursor: isDragging && isSelected ? 'grabbing' : 'grab',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none',
      transition: isDragging ? 'none' : 'all 0.15s ease',
      zIndex: isSelected ? 1000 : 100,
      pointerEvents: 'auto',
      touchAction: 'none',
      boxSizing: 'border-box',
      boxShadow: isSelected 
        ? '0 0 0 2px rgba(59, 130, 246, 0.2)' 
        : '0 2px 4px rgba(0, 0, 0, 0.1)',
      opacity: element.opacity !== undefined ? element.opacity : 1
    }),
  
    content: {
      width: '100%',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      color: '#9ca3af',
      fontWeight: '500',
      pointerEvents: 'none'
    },
  
    tooltip: (x, y) => ({
      position: 'absolute',
      left: x,
      top: y - 30,
      background: '#1f2937',
      color: 'white',
      padding: '4px 8px',
      borderRadius: '4px',
      fontSize: '10px',
      fontWeight: '600',
      whiteSpace: 'nowrap',
      pointerEvents: 'none',
      zIndex: 2000,
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
    }),
  
    resizeHandle: (x, y, cursor) => ({
      position: 'absolute',
      left: x,
      top: y,
      width: 8,
      height: 8,
      background: '#3b82f6',
      border: '1px solid white',
      borderRadius: '2px',
      cursor,
      zIndex: 2000,
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
      pointerEvents: 'auto'
    }),
  
    selectionBorder: (element) => ({
      position: 'absolute',
      left: element.x - 1,
      top: element.y - 1,
      width: (element.width || 100) + 2,
      height: (element.height || 50) + 2,
      border: '1px dashed #3b82f6',
      borderRadius: `${(element.borderRadius || 4) + 1}px`,
      pointerEvents: 'none',
      zIndex: 1500,
      opacity: 0.7
    })
  };