// src/components/layoutDesigner/PageManager/CustomSizeDialog.jsx - CON INPUTS MANUALES
import React, { useState, useEffect } from 'react';

const CustomSizeDialog = ({ isOpen, onClose, onSave, currentSize }) => {
  const [sizeName, setSizeName] = useState('');
  const [sizeDescription, setSizeDescription] = useState('');
  const [customWidth, setCustomWidth] = useState('');
  const [customHeight, setCustomHeight] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('mm');
  const [errors, setErrors] = useState({});

  // Unidades disponibles
  const availableUnits = [
    { value: 'mm', label: 'mm - Milímetros' },
    { value: 'cm', label: 'cm - Centímetros' },
    { value: 'in', label: 'in - Pulgadas' },
    { value: 'pt', label: 'pt - Puntos' }
  ];

  // Reset cuando se abre/cierra el diálogo
  useEffect(() => {
    if (isOpen) {
      setSizeName('');
      setSizeDescription('');
      setCustomWidth('');
      setCustomHeight('');
      setSelectedUnit(currentSize?.unit || 'mm');
      setErrors({});
    }
  }, [isOpen, currentSize]);

  const handleSave = () => {
    const newErrors = {};

    if (!sizeName.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    const width = parseFloat(customWidth);
    const height = parseFloat(customHeight);

    if (!customWidth || isNaN(width) || width <= 0) {
      newErrors.width = 'El ancho debe ser un número mayor a 0';
    }

    if (!customHeight || isNaN(height) || height <= 0) {
      newErrors.height = 'La altura debe ser un número mayor a 0';
    }

    if (width > 0 && height > 0) {
      // Validaciones de rango según la unidad
      const maxValues = {
        'mm': { max: 2000, name: '2000mm' },
        'cm': { max: 200, name: '200cm' },
        'in': { max: 78, name: '78in' },
        'pt': { max: 5670, name: '5670pt' }
      };

      if (width > maxValues[selectedUnit].max) {
        newErrors.width = `El ancho no puede ser mayor a ${maxValues[selectedUnit].name}`;
      }

      if (height > maxValues[selectedUnit].max) {
        newErrors.height = `La altura no puede ser mayor a ${maxValues[selectedUnit].name}`;
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      const newCustomSize = {
        name: sizeName.trim(),
        width: parseFloat(customWidth),
        height: parseFloat(customHeight),
        unit: selectedUnit,
        category: 'Personalizado',
        description: sizeDescription.trim() || `Tamaño personalizado ${customWidth}×${customHeight} ${selectedUnit}`,
        createdAt: new Date().toISOString(),
        isUserCreated: true
      };

      onSave(newCustomSize);
      onClose();
    }
  };

  // Calcular conversiones para mostrar equivalencias
  const getConversions = () => {
    const width = parseFloat(customWidth);
    const height = parseFloat(customHeight);
    
    if (!width || !height || isNaN(width) || isNaN(height)) return null;

    const conversions = {
      'mm': { mm: 1, cm: 0.1, in: 0.0393701, pt: 2.83465 },
      'cm': { mm: 10, cm: 1, in: 0.393701, pt: 28.3465 },
      'in': { mm: 25.4, cm: 2.54, in: 1, pt: 72 },
      'pt': { mm: 0.352778, cm: 0.0352778, in: 0.0138889, pt: 1 }
    };

    const factor = conversions[selectedUnit];
    
    return {
      mm: { width: (width * factor.mm).toFixed(1), height: (height * factor.mm).toFixed(1) },
      cm: { width: (width * factor.cm).toFixed(2), height: (height * factor.cm).toFixed(2) },
      in: { width: (width * factor.in).toFixed(3), height: (height * factor.in).toFixed(3) },
      pt: { width: (width * factor.pt).toFixed(0), height: (height * factor.pt).toFixed(0) }
    };
  };

  const conversions = getConversions();

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        background: 'white',
        padding: '28px',
        borderRadius: '12px',
        border: '2px solid #e5e7eb',
        minWidth: '480px',
        maxWidth: '580px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        maxHeight: '85vh',
        overflowY: 'auto',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '600',
            color: '#374151'
          }}>
            💾 Crear Tamaño Personalizado
          </h3>
          
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px',
              borderRadius: '4px',
              lineHeight: 1
            }}
            title="Cerrar"
          >
            ✕
          </button>
        </div>
        
        {/* Formulario de dimensiones personalizadas */}
        <div style={{
          padding: '20px',
          background: '#f0f9ff',
          borderRadius: '8px',
          border: '2px solid #0ea5e9',
          marginBottom: '20px'
        }}>
          <div style={{ 
            fontSize: '14px', 
            color: '#0c4a6e', 
            fontWeight: '600',
            marginBottom: '16px',
            textAlign: 'center'
          }}>
            📐 Definir Dimensiones Personalizadas
          </div>
          
          {/* Unidad de medida */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              marginBottom: '6px',
              color: '#0c4a6e'
            }}>
              📏 Unidad de Medida
            </label>
            <select
              value={selectedUnit}
              onChange={(e) => setSelectedUnit(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #0ea5e9',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white',
                color: '#0c4a6e',
                fontWeight: '500'
              }}
            >
              {availableUnits.map(unit => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Ancho personalizado */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                marginBottom: '6px',
                color: '#0c4a6e'
              }}>
                📏 Ancho ({selectedUnit})
              </label>
              <input
                type="number"
                value={customWidth}
                onChange={(e) => setCustomWidth(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: errors.width ? '2px solid #ef4444' : '2px solid #0ea5e9',
                  borderRadius: '6px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  background: 'white',
                  fontWeight: '500',
                  textAlign: 'center'
                }}
                min="1"
                step="0.1"
                placeholder={`Ej: ${selectedUnit === 'mm' ? '210' : selectedUnit === 'cm' ? '21.0' : selectedUnit === 'in' ? '8.27' : '595'}`}
                autoFocus
              />
              {errors.width && (
                <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>
                  {errors.width}
                </div>
              )}
            </div>
            
            {/* Alto personalizado */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                marginBottom: '6px',
                color: '#0c4a6e'
              }}>
                📏 Alto ({selectedUnit})
              </label>
              <input
                type="number"
                value={customHeight}
                onChange={(e) => setCustomHeight(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: errors.height ? '2px solid #ef4444' : '2px solid #0ea5e9',
                  borderRadius: '6px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  background: 'white',
                  fontWeight: '500',
                  textAlign: 'center'
                }}
                min="1"
                step="0.1"
                placeholder={`Ej: ${selectedUnit === 'mm' ? '297' : selectedUnit === 'cm' ? '29.7' : selectedUnit === 'in' ? '11.69' : '842'}`}
              />
              {errors.height && (
                <div style={{ color: '#ef4444', fontSize: '10px', marginTop: '4px' }}>
                  {errors.height}
                </div>
              )}
            </div>
          </div>
          
          {/* Vista previa del tamaño */}
          {customWidth && customHeight && !isNaN(parseFloat(customWidth)) && !isNaN(parseFloat(customHeight)) && (
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '6px',
              textAlign: 'center',
              border: '1px solid #3b82f6'
            }}>
              <div style={{ fontSize: '13px', color: '#1e40af', fontWeight: '600', marginBottom: '4px' }}>
                📊 Tamaño: {customWidth} × {customHeight} {selectedUnit}
              </div>
              <div style={{ fontSize: '11px', color: '#1e40af' }}>
                Proporción: {(parseFloat(customWidth) / parseFloat(customHeight)).toFixed(2)}:1 • 
                {parseFloat(customWidth) > parseFloat(customHeight) ? ' Apaisado' : ' Vertical'}
              </div>
            </div>
          )}
        </div>

        {/* Conversiones automáticas */}
        {conversions && (
          <div style={{
            padding: '16px',
            background: '#fefce8',
            borderRadius: '6px',
            border: '1px solid #fbbf24',
            marginBottom: '20px'
          }}>
            <div style={{ 
              fontSize: '12px', 
              fontWeight: '600', 
              color: '#92400e', 
              marginBottom: '8px',
              textAlign: 'center'
            }}>
              🔄 Equivalencias en Otras Unidades
            </div>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
              fontSize: '10px',
              color: '#92400e'
            }}>
              <div><strong>Milímetros:</strong> {conversions.mm.width} × {conversions.mm.height} mm</div>
              <div><strong>Centímetros:</strong> {conversions.cm.width} × {conversions.cm.height} cm</div>
              <div><strong>Pulgadas:</strong> {conversions.in.width} × {conversions.in.height} in</div>
              <div><strong>Puntos:</strong> {conversions.pt.width} × {conversions.pt.height} pt</div>
            </div>
          </div>
        )}
        
        {/* Nombre del tamaño */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            marginBottom: '6px',
            color: '#374151'
          }}>
            📝 Nombre del Tamaño *
          </label>
          <input
            type="text"
            value={sizeName}
            onChange={(e) => setSizeName(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              border: errors.name ? '2px solid #ef4444' : '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
            placeholder="Ej: Mi Tamaño Especial, Póster Personalizado..."
          />
          {errors.name && (
            <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>
              {errors.name}
            </div>
          )}
        </div>

        {/* Descripción del tamaño */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            marginBottom: '6px',
            color: '#374151'
          }}>
            📄 Descripción (Opcional)
          </label>
          <input
            type="text"
            value={sizeDescription}
            onChange={(e) => setSizeDescription(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
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
          background: '#f0fdf4',
          borderRadius: '6px',
          border: '1px solid #bbf7d0',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '11px', color: '#166534', lineHeight: '1.4' }}>
            💡 <strong>Consejo:</strong> Los tamaños personalizados se guardarán en tu navegador y 
            estarán disponibles para crear nuevas páginas en el futuro.
          </div>
        </div>

        {/* Botones */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: 'white',
              fontSize: '14px',
              cursor: 'pointer',
              color: '#374151',
              fontWeight: '500'
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!customWidth || !customHeight || !sizeName.trim()}
            style={{
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              background: customWidth && customHeight && sizeName.trim() ? '#16a34a' : '#94a3b8',
              color: 'white',
              fontSize: '14px',
              cursor: customWidth && customHeight && sizeName.trim() ? 'pointer' : 'not-allowed',
              fontWeight: '600',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              if (customWidth && customHeight && sizeName.trim()) {
                e.target.style.background = '#15803d';
              }
            }}
            onMouseLeave={(e) => {
              if (customWidth && customHeight && sizeName.trim()) {
                e.target.style.background = '#16a34a';
              }
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