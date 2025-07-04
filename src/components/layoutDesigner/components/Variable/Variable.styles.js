// src/components/layoutDesigner/components/Variable/Variable.styles.js
export const variableStyles = {
    container: (element, isSelected, isDragging) => ({
      position: 'absolute',
      left: element.x,
      top: element.y,
      padding: '6px 10px',
      background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'rgba(14, 165, 233, 0.05)',
      border: isSelected ? '2px solid #3b82f6' : '1px dashed #0ea5e9',
      borderRadius: '4px',
      fontSize: element.fontSize || 14,
      color: '#1e40af',
      fontFamily: 'monospace',
      fontWeight: '600',
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
        : '0 1px 3px rgba(14, 165, 233, 0.2)',
      minWidth: 'auto',
      minHeight: 'auto',
      maxWidth: '250px',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis'
    }),
  
    content: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    },
  
    icon: {
      fontSize: '12px',
      opacity: 0.8
    },
  
    variableName: (showVariableValues) => ({
      fontFamily: 'monospace',
      fontSize: 'inherit',
      fontWeight: '600',
      color: showVariableValues ? '#059669' : '#1e40af'
    }),
  
    value: {
      fontFamily: 'inherit',
      fontSize: 'inherit',
      fontWeight: '500',
      color: '#059669',
      fontStyle: 'italic'
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
  
    selector: {
      position: 'absolute',
      top: '100%',
      left: 0,
      marginTop: '4px',
      background: 'white',
      border: '2px solid #3b82f6',
      borderRadius: '8px',
      boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.25)',
      zIndex: 3000,
      minWidth: '200px',
      maxWidth: '300px',
      maxHeight: '200px',
      overflowY: 'auto'
    },
  
    selectorHeader: {
      padding: '8px 12px',
      borderBottom: '1px solid #e5e7eb',
      background: '#f8fafc',
      fontSize: '12px',
      fontWeight: '600',
      color: '#374151'
    },
  
    selectorItem: (isSelected) => ({
      padding: '8px 12px',
      cursor: 'pointer',
      fontSize: '12px',
      borderBottom: '1px solid #f3f4f6',
      background: isSelected ? '#eff6ff' : 'transparent',
      transition: 'all 0.2s'
    }),
  
    selectorItemName: {
      fontFamily: 'monospace',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '2px'
    },
  
    selectorItemValue: {
      fontSize: '11px',
      color: '#6b7280',
      fontStyle: 'italic'
    }
  };