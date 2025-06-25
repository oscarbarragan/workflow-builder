// src/components/workflow/nodes/NodeTooltip/NodeTooltip.jsx
import React, { useState } from 'react';
import { Anchor, Trash2, Copy, MoreVertical, Lock, Unlock } from 'lucide-react';

const NodeTooltip = ({ 
  nodeId, 
  isVisible, 
  position, 
  isAnchored = false,
  onAnchor, 
  onDelete, 
  onDuplicate 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible) return null;

  const tooltipStyle = {
    position: 'absolute',
    left: position.x + 10,
    top: position.y - 40,
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(8px)',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    zIndex: 10000,
    fontSize: '12px',
    fontWeight: '500',
    color: '#374151',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: isExpanded ? '8px' : '6px 8px',
    transition: 'all 0.2s ease',
    userSelect: 'none',
    pointerEvents: 'auto'
  };

  const buttonStyle = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease',
    color: '#6b7280'
  };

  const getButtonHoverStyle = (color) => ({
    background: color,
    color: 'white',
    transform: 'scale(1.1)'
  });

  if (!isExpanded) {
    return (
      <div style={tooltipStyle}>
        <span style={{ fontSize: '11px', marginRight: '4px' }}>Opciones del nodo</span>
        <button
          style={buttonStyle}
          onClick={() => setIsExpanded(true)}
          onMouseEnter={(e) => Object.assign(e.target.style, getButtonHoverStyle('#3b82f6'))}
          onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle)}
          title="Mostrar opciones"
        >
          <MoreVertical size={14} />
        </button>
      </div>
    );
  }

  return (
    <div style={tooltipStyle}>
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
            Object.assign(e.target.style, buttonStyle);
          }
        }}
        title={isAnchored ? 'Desanclar nodo' : 'Anclar nodo en posición'}
      >
        {isAnchored ? <Lock size={14} /> : <Unlock size={14} />}
      </button>

      {/* Separador */}
      <div style={{
        width: '1px',
        height: '16px',
        background: '#e5e7eb',
        margin: '0 2px'
      }} />

      {/* Botón Duplicar */}
      <button
        style={buttonStyle}
        onClick={() => onDuplicate(nodeId)}
        onMouseEnter={(e) => Object.assign(e.target.style, getButtonHoverStyle('#3b82f6'))}
        onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle)}
        title="Duplicar nodo"
      >
        <Copy size={14} />
      </button>

      {/* Botón Eliminar */}
      <button
        style={buttonStyle}
        onClick={() => onDelete(nodeId)}
        onMouseEnter={(e) => Object.assign(e.target.style, getButtonHoverStyle('#dc2626'))}
        onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle)}
        title="Eliminar nodo"
      >
        <Trash2 size={14} />
      </button>

      {/* Separador */}
      <div style={{
        width: '1px',
        height: '16px',
        background: '#e5e7eb',
        margin: '0 2px'
      }} />

      {/* Botón Cerrar */}
      <button
        style={buttonStyle}
        onClick={() => setIsExpanded(false)}
        onMouseEnter={(e) => Object.assign(e.target.style, getButtonHoverStyle('#6b7280'))}
        onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle)}
        title="Cerrar menú"
      >
        ✕
      </button>
    </div>
  );
};

export default NodeTooltip;