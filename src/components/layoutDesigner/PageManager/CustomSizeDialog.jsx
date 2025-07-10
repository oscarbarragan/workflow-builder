// src/components/layoutDesigner/PageManager/CustomSizeDialog.jsx
import React, { useState, useEffect } from 'react';

const CustomSizeDialog = ({ isOpen, onClose, onSave, currentSize }) => {
  const [sizeName, setSizeName] = useState('');
  const [sizeDescription, setSizeDescription] = useState('');
  const [errors, setErrors] = useState({});

  // Reset cuando se abre/cierra el diálogo
  useEffect(() => {
    if (isOpen) {
      setSizeName('');
      setSizeDescription('');
      setErrors({});
    }
  }, [isOpen]);

  const handleSave = () => {
    const newErrors = {};

    if (!sizeName.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!currentSize || !currentSize.width || !currentSize.height) {
      newErrors.size = 'Las dimensiones son requeridas';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const newCustomSize = {
        name: sizeName.trim(),
        width: currentSize.width,
        height: currentSize.height,
        unit: currentSize.unit,
        category: 'Personalizado',
        description: sizeDescription.trim() || 'Tamaño personalizado',
        createdAt: new Date().toISOString(),
        isUserCreated: true
      };

      onSave(newCustomSize);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        padding: '24px',
        borderRadius: '8px',
        border: '1px solid #d1d5db',
        minWidth: '350px',
        maxWidth: '450px',
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '16px',
          fontWeight: '600',
          color: '#374151'
        }}>
          💾 Crear Tamaño Personalizado
        </h3>
        
        {/* Información del tamaño actual */}
        <div style={{
          padding: '12px',
          background: '#f0f9ff',
          borderRadius: '6px',
          border: '1px solid #0ea5e9',
          marginBottom: '16px'
        }}>
          <div style={{ 
            fontSize: '12px', 
            color: '#0c4a6e', 
            fontWeight: '600',
            marginBottom: '4px'
          }}>
            📐 Tamaño a Guardar:
          </div>
          <div style={{ fontSize: '14px', color: '#0c4a6e', fontWeight: '500' }}>
            {currentSize?.width} × {currentSize?.height} {currentSize?.unit}
          </div>
        </div>
        
        {/* Nombre del tamaño */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            marginBottom: '6px',
            color: '#374151'
          }}>
            Nombre del Tamaño *
          </label>
          <input
            type="text"
            value={sizeName}
            onChange={(e) => setSizeName(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: errors.name ? '2px solid #ef4444' : '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
            placeholder="Ej: Mi Tamaño Especial, Póster Personalizado..."
            autoFocus
          />
          {errors.name && (
            <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>
              {errors.name}
            </div>
          )}
        </div>

        {/* Descripción del tamaño */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            marginBottom: '6px',
            color: '#374151'
          }}>
            Descripción (Opcional)
          </label>
          <input
            type="text"
            value={sizeDescription}
            onChange={(e) => setSizeDescription(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
            placeholder="Ej: Para documentos especiales, Diseño de portada..."
          />
        </div>

        {/* Información adicional */}
        <div style={{
          padding: '12px',
          background: '#fefce8',
          borderRadius: '6px',
          border: '1px solid #fbbf24',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '11px', color: '#92400e', lineHeight: '1.4' }}>
            💡 <strong>Consejo:</strong> Los tamaños personalizados se guardarán en tu navegador y 
            estarán disponibles para crear nuevas páginas en el futuro.
          </div>
        </div>

        {/* Error de tamaño */}
        {errors.size && (
          <div style={{
            padding: '8px 12px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '4px',
            color: '#dc2626',
            fontSize: '11px',
            marginBottom: '16px'
          }}>
            {errors.size}
          </div>
        )}

        {/* Botones */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: 'white',
              fontSize: '13px',
              cursor: 'pointer',
              color: '#374151',
              fontWeight: '500'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              background: '#16a34a',
              color: 'white',
              fontSize: '13px',
              cursor: 'pointer',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#15803d';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#16a34a';
            }}
          >
            💾 Guardar Tamaño
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomSizeDialog;