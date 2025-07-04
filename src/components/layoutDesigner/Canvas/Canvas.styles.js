// src/components/layoutDesigner/Canvas/Canvas.styles.js
export const canvasStyles = {
    container: {
      flex: '1',
      minWidth: '500px',
      border: '3px solid #3b82f6',
      borderRadius: '12px',
      background: 'white',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.2)',
      backgroundImage: `
        repeating-linear-gradient(0deg, transparent, transparent 19px, #e5e7eb 20px),
        repeating-linear-gradient(90deg, transparent, transparent 19px, #e5e7eb 20px)
      `,
      backgroundSize: '20px 20px'
    },
  
    wrapper: (isDragging, isResizing) => ({
      width: '100%',
      height: '100%',
      position: 'relative',
      cursor: isDragging ? 'grabbing' : isResizing ? 'auto' : 'default',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none',
      msUserSelect: 'none'
    }),
  
    elementsLayer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      pointerEvents: 'auto',
      zIndex: 10
    },
  
    emptyState: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      color: '#9ca3af',
      pointerEvents: 'none',
      zIndex: 2
    },
  
    emptyStateIcon: {
      fontSize: '64px',
      marginBottom: '16px'
    },
  
    emptyStateTitle: {
      fontSize: '18px',
      fontWeight: '600',
      marginBottom: '8px',
      color: '#6b7280'
    },
  
    emptyStateDescription: {
      fontSize: '14px',
      color: '#9ca3af',
      marginBottom: '8px'
    },
  
    emptyStateBrand: {
      fontSize: '12px',
      color: '#3b82f6',
      fontWeight: '500'
    },
  
    statsOverlay: {
      position: 'absolute',
      bottom: '12px',
      right: '12px',
      background: 'rgba(255, 255, 255, 0.95)',
      padding: '6px 12px',
      borderRadius: '8px',
      fontSize: '11px',
      color: '#6b7280',
      pointerEvents: 'none',
      zIndex: 5,
      fontWeight: '500',
      border: '1px solid #e5e7eb'
    },
  
    selectedElementInfo: {
      marginLeft: '12px',
      color: '#3b82f6'
    },
  
    operationOverlay: (isDragging) => ({
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: isDragging 
        ? 'rgba(59, 130, 246, 0.03)' 
        : 'rgba(220, 38, 38, 0.03)',
      zIndex: 8,
      pointerEvents: 'none',
      border: `2px dashed ${isDragging ? '#3b82f6' : '#dc2626'}`,
      borderRadius: '8px'
    }),
  
    featuresIndicator: {
      position: 'absolute',
      bottom: '12px',
      left: '12px',
      background: 'rgba(59, 130, 246, 0.1)',
      border: '1px solid rgba(59, 130, 246, 0.3)',
      borderRadius: '6px',
      padding: '6px 10px',
      fontSize: '10px',
      color: '#3b82f6',
      pointerEvents: 'none',
      zIndex: 5,
      fontWeight: '500'
    }
  };