// src/components/workflow/nodes/NodeTooltip/NodeTooltip.jsx - CON PORTAL
import React from 'react';
import { createPortal } from 'react-dom';

const NodeTooltip = ({ 
  nodeId, 
  isVisible, 
  position, 
  isAnchored = false,
  onAnchor, 
  onDelete, 
  onDuplicate 
}) => {
  if (!isVisible) return null;

  // FIXED: Use fixed positioning for precise control
  const tooltipStyle = {
    position: 'fixed',
    left: position.x,
    top: position.y,
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(8px)',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
    zIndex: 10000,
    fontSize: '12px',
    fontWeight: '500',
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    padding: '4px',
    transition: 'all 0.2s ease',
    userSelect: 'none',
    pointerEvents: 'auto'
  };

  const buttonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
    color: '#6b7280',
    fontSize: '14px',
    width: '26px',
    height: '26px'
  };

  const getButtonHoverStyle = (color) => ({
    background: color,
    color: 'white',
    transform: 'scale(1.1)'
  });

  const tooltip = (
    <div 
      style={tooltipStyle}
      onMouseEnter={() => {
        // Keep tooltip open when hovering over it
      }}
      onMouseLeave={() => {
        // Don't close immediately, let the node handle it
      }}
    >
      {/* Botón Anclar/Desanclar */}
      <button
        style={{
          ...buttonStyle,
          background: isAnchored ? '#dcfce7' : 'transparent',
          color: isAnchored ? '#166534' : '#6b7280',
          border: isAnchored ? '1px solid #bbf7d0' : '1px solid transparent'
        }}
        onClick={() => onAnchor(nodeId, !isAnchored)}
        onMouseEnter={(e) => {
          if (!isAnchored) {
            Object.assign(e.target.style, getButtonHoverStyle('#16a34a'));
          }
        }}
        onMouseLeave={(e) => {
          if (!isAnchored) {
            Object.assign(e.target.style, {
              ...buttonStyle,
              background: 'transparent',
              color: '#6b7280'
            });
          }
        }}
        title={isAnchored ? 'Desanclar nodo' : 'Anclar nodo'}
      >
        {isAnchored ? '●' : '○'}
      </button>

      {/* Separador */}
      <div style={{
        width: '1px',
        height: '16px',
        background: '#e5e7eb',
        margin: '0 1px'
      }} />

      {/* Botón Duplicar */}
      <button
        style={buttonStyle}
        onClick={() => onDuplicate(nodeId)}
        onMouseEnter={(e) => Object.assign(e.target.style, getButtonHoverStyle('#3b82f6'))}
        onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle)}
        title="Duplicar nodo"
      >
        ⧉
      </button>

      {/* Botón Eliminar */}
      <button
        style={buttonStyle}
        onClick={() => onDelete(nodeId)}
        onMouseEnter={(e) => Object.assign(e.target.style, getButtonHoverStyle('#dc2626'))}
        onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle)}
        title="Eliminar nodo"
      >
        ✕
      </button>
    </div>
  );

  // Render tooltip in document body using portal for better positioning
  return createPortal(tooltip, document.body);
};

export default NodeTooltip;