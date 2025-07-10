// src/components/layoutDesigner/Toolbar/Toolbar.jsx - VERSIÓN COMPACTA
import React from 'react';
import { ELEMENT_TYPES } from '../utils/constants';

const Toolbar = ({
  onAddElement,
  onDeleteSelected,
  onDuplicateSelected,
  onClearAll,
  selectedElement,
  elementsCount = 0
}) => {
  
  const toolbarStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 16px', // Reducido de 12px
    background: '#f8fafc',
    borderBottom: '1px solid #e5e7eb',
    gap: '8px',
    minHeight: '44px' // Altura fija más pequeña
  };

  const sectionStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px' // Reducido
  };

  const buttonStyle = (variant = 'default', disabled = false) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '4px', // Reducido
    padding: '6px 10px', // Reducido
    border: variant === 'primary' ? 'none' : '1px solid #d1d5db',
    borderRadius: '4px',
    background: disabled ? '#f3f4f6' : 
                variant === 'primary' ? '#3b82f6' : 
                variant === 'success' ? '#059669' :
                variant === 'danger' ? '#dc2626' : 'white',
    color: disabled ? '#9ca3af' :
           variant === 'primary' || variant === 'success' || variant === 'danger' ? 'white' : '#374151',
    fontSize: '11px', // Reducido
    fontWeight: '500',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s',
    opacity: disabled ? 0.6 : 1
  });

  const separatorStyle = {
    width: '1px',
    height: '20px', // Reducido
    background: '#e5e7eb',
    margin: '0 4px' // Reducido
  };

  const labelStyle = {
    fontSize: '11px', // Reducido
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  };

  const elements = [
    {
      type: ELEMENT_TYPES.TEXT,
      label: 'Texto',
      icon: '📝',
      shortcut: 'T'
    },
    {
      type: ELEMENT_TYPES.VARIABLE,
      label: 'Variable',
      icon: '🔗',
      shortcut: 'V'
    },
    {
      type: ELEMENT_TYPES.RECTANGLE,
      label: 'Rectángulo',
      icon: '⬜',
      shortcut: 'R'
    }
  ];

  return (
    <div style={toolbarStyle}>
      {/* Sección de elementos */}
      <div style={sectionStyle}>
        <span style={labelStyle}>Elementos:</span>
        
        {elements.map(element => (
          <button
            key={element.type}
            onClick={() => onAddElement(element.type)}
            style={buttonStyle('primary')}
            title={`Agregar ${element.label} (${element.shortcut})`}
          >
            <span style={{ fontSize: '12px' }}>{element.icon}</span>
            <span>{element.label}</span>
          </button>
        ))}
      </div>

      <div style={separatorStyle} />

      {/* Sección de acciones del elemento seleccionado */}
      <div style={sectionStyle}>
        <span style={labelStyle}>Elemento:</span>
        
        <button
          onClick={onDuplicateSelected}
          disabled={!selectedElement}
          style={buttonStyle('success', !selectedElement)}
          title="Duplicar elemento seleccionado (Ctrl+D)"
        >
          <span>📋</span>
          <span>Duplicar</span>
        </button>

        <button
          onClick={onDeleteSelected}
          disabled={!selectedElement}
          style={buttonStyle('danger', !selectedElement)}
          title="Eliminar elemento seleccionado (Delete)"
        >
          <span>🗑️</span>
          <span>Eliminar</span>
        </button>
      </div>

      <div style={separatorStyle} />

      {/* Sección de acciones generales */}
      <div style={sectionStyle}>
        <span style={labelStyle}>Layout:</span>
        
        <button
          onClick={() => {
            if (window.confirm('¿Limpiar todos los elementos de la página actual?')) {
              onClearAll();
            }
          }}
          disabled={elementsCount === 0}
          style={buttonStyle('default', elementsCount === 0)}
          title="Limpiar página actual"
        >
          <span>🧹</span>
          <span>Limpiar</span>
        </button>
      </div>

      <div style={separatorStyle} />

      {/* Información de estado compacta */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px', // Reducido
        fontSize: '11px', // Reducido
        color: '#6b7280',
        fontWeight: '500'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <span>📊</span>
          <span>{elementsCount} elem.</span>
        </div>
        
        {selectedElement && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: '#3b82f6'
          }}>
            <span>🎯</span>
            <span>{selectedElement.type}</span>
          </div>
        )}

        {/* Indicador de atajos */}
        <div style={{
          fontSize: '10px',
          color: '#9ca3af',
          fontStyle: 'italic'
        }}>
          💡 T=Texto, V=Variable, R=Rect
        </div>
      </div>
    </div>
  );
};

export default Toolbar;