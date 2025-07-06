// src/components/layoutDesigner/PropertiesPanel/BasicProperties.jsx - SOLUCIONADO
import React, { useState } from 'react';
import { ELEMENT_TYPES } from '../utils/constants';
import { styleManager } from '../utils/StyleManager';
import { variableProcessor } from '../utils/variableProcessor';
import { unitsConfig } from '../utils/units.config';
import { elementTransforms } from '../utils/elementTransforms';

const BasicProperties = ({ 
  selectedElement, 
  onUpdateSelectedElement, 
  availableData = {},
  onStyleChanged 
}) => {
  const [linkSettings, setLinkSettings] = useState({
    positionLinked: false,
    sizeLinked: false
  });

  // Configuración de unidades desde config
  const { units } = unitsConfig;
  const [currentUnit, setCurrentUnit] = useState(unitsConfig.defaults.unit);

  // ✅ NUEVO: Función para detectar si un elemento tiene estilos aplicados del sidebar
  const hasAppliedStyles = () => {
    return !!(
      selectedElement.textStyleId || 
      selectedElement.paragraphStyleId || 
      selectedElement.borderStyleId || 
      selectedElement.fillStyleId
    );
  };

  // ✅ NUEVO: Función para desvincular estilos del sidebar antes de editar manualmente
  const unlinkStylesAndUpdate = (property, value) => {
    console.log('🔓 Unlinking styles and updating:', property, value);
    
    // Primero, desvincular los estilos del sidebar relacionados
    const updates = { [property]: value };
    
    // Determinar qué estilos desvincular según la propiedad
    if (['fontSize', 'fontFamily', 'color', 'bold', 'italic', 'underline', 'strikethrough'].includes(property)) {
      if (selectedElement.textStyleId) {
        updates.textStyleId = null;
        console.log('🔓 Unlinked textStyleId for manual text editing');
      }
    }
    
    if (['alignment', 'lineHeight', 'letterSpacing', 'indent'].includes(property)) {
      if (selectedElement.paragraphStyleId) {
        updates.paragraphStyleId = null;
        console.log('🔓 Unlinked paragraphStyleId for manual paragraph editing');
      }
    }
    
    if (['borderWidth', 'borderStyle', 'borderColor', 'borderRadius'].includes(property)) {
      if (selectedElement.borderStyleId) {
        updates.borderStyleId = null;
        console.log('🔓 Unlinked borderStyleId for manual border editing');
      }
    }
    
    if (['backgroundColor', 'fillColor', 'opacity'].includes(property)) {
      if (selectedElement.fillStyleId) {
        updates.fillStyleId = null;
        console.log('🔓 Unlinked fillStyleId for manual fill editing');
      }
    }
    
    // Aplicar todas las actualizaciones de una vez
    Object.entries(updates).forEach(([key, val]) => {
      onUpdateSelectedElement(key, val);
    });
  };

  // ✅ MEJORADO: Funciones de conversión
  const convertValue = (value, fromUnit, toUnit) => {
    return unitsConfig.utils.convert(value, fromUnit, toUnit, units);
  };

  const getValueInUnit = (pixelValue) => {
    return convertValue(pixelValue || 0, 'px', currentUnit);
  };

  const setValueFromUnit = (value) => {
    return convertValue(value || 0, currentUnit, 'px');
  };

  // Procesar variables para opciones
  const processedVariables = React.useMemo(() => {
    const processed = variableProcessor.processAvailableVariables(availableData);
    return Object.entries(processed).map(([key, value]) => ({
      value: key,
      label: `${key} (${value.type}) - ${value.displayValue.length > 30 ? value.displayValue.substring(0, 30) + '...' : value.displayValue}`,
      type: value.type,
      displayValue: value.displayValue
    })).sort((a, b) => a.value.localeCompare(b.value));
  }, [availableData]);

  // Función para manejar cambios de transformación
  const handleTransformChange = (property, value) => {
    console.log('🔄 Transform change:', property, value);
    onUpdateSelectedElement(property, value);
  };

  // ✅ CORREGIDO: Componente NumericInput con desvinculación automática
  const NumericInput = ({ 
    label, 
    value, 
    onChange, 
    min, 
    max, 
    step = 0.1, 
    showUnit = true,
    icon,
    placeholder = "0",
    isTransform = false,
    property = null // ✅ NUEVO: Nombre de la propiedad para desvinculación
  }) => {
    const currentValue = value !== undefined && value !== null ? value : '';
    const displayValue = showUnit && !isTransform && currentValue !== '' ? getValueInUnit(currentValue) : currentValue;
    
    // ✅ NUEVO: Función de actualización con desvinculación
    const handleUpdate = (newValue) => {
      if (isTransform) {
        handleTransformChange(onChange.name, newValue);
      } else if (property && hasAppliedStyles()) {
        // Si hay estilos aplicados y estamos editando manualmente, desvincular primero
        unlinkStylesAndUpdate(property, newValue);
      } else {
        onChange(newValue);
      }
    };
    
    return (
      <div style={{ marginBottom: '12px' }}>
        <label style={{
          display: 'block',
          fontSize: '11px',
          fontWeight: '500',
          marginBottom: '4px',
          color: '#374151',
          textTransform: 'uppercase',
          letterSpacing: '0.025em'
        }}>
          {icon && <span style={{ marginRight: '4px' }}>{icon}</span>}
          {label}
          {/* ✅ NUEVO: Indicador de estilo aplicado */}
          {property && hasAppliedStyles() && (
            <span style={{ 
              marginLeft: '4px', 
              fontSize: '9px', 
              color: '#f59e0b',
              background: '#fef3c7',
              padding: '1px 4px',
              borderRadius: '2px'
            }}>
              🔗 Vinculado
            </span>
          )}
        </label>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          background: 'white',
          border: '1px solid #d1d5db',
          borderRadius: '4px',
          overflow: 'hidden',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <input
            type="number"
            value={displayValue}
            onChange={(e) => {
              const inputValue = e.target.value;
              
              if (inputValue === '') {
                handleUpdate('');
                return;
              }
              
              const numValue = parseFloat(inputValue);
              if (!isNaN(numValue)) {
                const finalValue = showUnit && !isTransform ? setValueFromUnit(numValue) : numValue;
                handleUpdate(finalValue);
              }
            }}
            onBlur={(e) => {
              const inputValue = e.target.value;
              if (inputValue === '' || inputValue === null || inputValue === undefined) {
                const defaultValue = placeholder === "0" ? 0 : parseFloat(placeholder) || 0;
                const finalValue = showUnit && !isTransform ? setValueFromUnit(defaultValue) : defaultValue;
                handleUpdate(finalValue);
              }
            }}
            style={{
              flex: 1,
              padding: '6px 8px',
              border: 'none',
              fontSize: '12px',
              background: 'transparent',
              outline: 'none',
              width: 0,
              minWidth: 0,
              boxSizing: 'border-box'
            }}
            min={min}
            max={max}
            step={step}
            placeholder={placeholder}
          />
          {showUnit && !isTransform && (
            <div style={{
              padding: '4px 6px',
              background: '#f3f4f6',
              borderLeft: '1px solid #d1d5db',
              fontSize: '10px',
              color: '#6b7280',
              fontWeight: '500',
              minWidth: '30px',
              textAlign: 'center',
              flexShrink: 0
            }}>
              {currentUnit}
            </div>
          )}
          {isTransform && (
            <div style={{
              padding: '4px 6px',
              background: '#fef3c7',
              borderLeft: '1px solid #f59e0b',
              fontSize: '10px',
              color: '#92400e',
              fontWeight: '500',
              minWidth: '30px',
              textAlign: 'center',
              flexShrink: 0
            }}>
              {label.includes('Rotación') ? '°' : 'x'}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      maxHeight: '100%', 
      overflowY: 'auto',
      paddingRight: '8px'
    }}>
      {/* Header con información del elemento */}
      <div style={{
        background: '#f0f9ff',
        padding: '12px',
        borderRadius: '6px',
        marginBottom: '16px',
        border: '1px solid #0ea5e9'
      }}>
        <div style={{
          fontSize: '12px',
          color: '#0c4a6e',
          fontWeight: '600',
          marginBottom: '4px'
        }}>
          📝 {selectedElement.type.toUpperCase()}
        </div>
        <div style={{
          fontSize: '11px',
          color: '#0c4a6e',
          fontFamily: 'monospace'
        }}>
          ID: {selectedElement.id}
        </div>
        
        {/* ✅ NUEVO: Mostrar estilos aplicados */}
        {hasAppliedStyles() && (
          <div style={{
            fontSize: '10px',
            color: '#f59e0b',
            marginTop: '4px',
            display: 'flex',
            gap: '4px',
            flexWrap: 'wrap'
          }}>
            {selectedElement.textStyleId && <span>🔤 TextStyle</span>}
            {selectedElement.paragraphStyleId && <span>📄 Paragraph</span>}
            {selectedElement.borderStyleId && <span>🔲 Border</span>}
            {selectedElement.fillStyleId && <span>🎨 Fill</span>}
          </div>
        )}
        
        {/* Mostrar transformaciones activas */}
        {elementTransforms.hasTransformations(selectedElement) && (
          <div style={{
            fontSize: '10px',
            color: '#7c3aed',
            marginTop: '4px',
            display: 'flex',
            gap: '8px'
          }}>
            {selectedElement.rotation !== 0 && <span>🔄 {selectedElement.rotation}°</span>}
            {selectedElement.scale !== 1 && <span>🔍 {selectedElement.scale}x</span>}
          </div>
        )}
      </div>

      {/* ✅ NUEVO: Advertencia sobre estilos aplicados */}
      {hasAppliedStyles() && (
        <div style={{
          background: '#fef3c7',
          padding: '8px 12px',
          borderRadius: '6px',
          marginBottom: '16px',
          border: '1px solid #f59e0b'
        }}>
          <div style={{
            fontSize: '11px',
            color: '#92400e',
            fontWeight: '600',
            marginBottom: '4px'
          }}>
            ⚠️ Estilos Vinculados Detectados
          </div>
          <div style={{
            fontSize: '10px',
            color: '#92400e',
            marginBottom: '8px'
          }}>
            Este elemento tiene estilos del sidebar aplicados. Al editar manualmente se desvinculará automáticamente.
          </div>
          <button
            onClick={() => {
              // Desvincular todos los estilos manualmente
              onUpdateSelectedElement('textStyleId', null);
              onUpdateSelectedElement('paragraphStyleId', null);
              onUpdateSelectedElement('borderStyleId', null);
              onUpdateSelectedElement('fillStyleId', null);
            }}
            style={{
              padding: '4px 8px',
              border: '1px solid #f59e0b',
              borderRadius: '4px',
              background: 'white',
              color: '#f59e0b',
              fontSize: '10px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            🔓 Desvincular Todos los Estilos
          </button>
        </div>
      )}

      {/* Selector de unidades */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          fontSize: '11px',
          fontWeight: '500',
          marginBottom: '6px',
          color: '#374151',
          textTransform: 'uppercase',
          letterSpacing: '0.025em'
        }}>
          📏 Unidad de Medida
        </label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '4px',
          background: '#f3f4f6',
          padding: '4px',
          borderRadius: '6px'
        }}>
          {units.map(unit => (
            <button
              key={unit.value}
              onClick={() => setCurrentUnit(unit.value)}
              style={{
                padding: '6px 4px',
                border: 'none',
                borderRadius: '4px',
                background: currentUnit === unit.value ? '#3b82f6' : 'transparent',
                color: currentUnit === unit.value ? 'white' : '#6b7280',
                fontSize: '10px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {unit.label}
            </button>
          ))}
        </div>
      </div>

      {/* Posición */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <h4 style={{
            margin: 0,
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151',
            textTransform: 'uppercase',
            letterSpacing: '0.025em'
          }}>
            📍 Posición
          </h4>
          <button
            onClick={() => setLinkSettings(prev => ({ ...prev, positionLinked: !prev.positionLinked }))}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              color: linkSettings.positionLinked ? '#3b82f6' : '#9ca3af'
            }}
            title={linkSettings.positionLinked ? 'Desvincular X e Y' : 'Vincular X e Y'}
          >
            {linkSettings.positionLinked ? '🔗' : '🔓'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <NumericInput
            label="X"
            value={selectedElement.x}
            onChange={(value) => onUpdateSelectedElement('x', value)}
            icon="↔️"
            property="x"
          />
          <NumericInput
            label="Y"
            value={selectedElement.y}
            onChange={(value) => onUpdateSelectedElement('y', value)}
            icon="↕️"
            property="y"
          />
        </div>
      </div>

      {/* Dimensiones */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <h4 style={{
            margin: 0,
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151',
            textTransform: 'uppercase',
            letterSpacing: '0.025em'
          }}>
            📐 Dimensiones
          </h4>
          <button
            onClick={() => setLinkSettings(prev => ({ ...prev, sizeLinked: !prev.sizeLinked }))}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px',
              color: linkSettings.sizeLinked ? '#3b82f6' : '#9ca3af'
            }}
            title={linkSettings.sizeLinked ? 'Desvincular ancho y alto' : 'Vincular ancho y alto (proporcional)'}
          >
            {linkSettings.sizeLinked ? '🔗' : '🔓'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <NumericInput
            label="Ancho"
            value={selectedElement.width}
            onChange={(value) => {
              onUpdateSelectedElement('width', value);
              if (linkSettings.sizeLinked && selectedElement.width && selectedElement.height) {
                const ratio = selectedElement.height / selectedElement.width;
                onUpdateSelectedElement('height', value * ratio);
              }
            }}
            min={0}
            icon="↔️"
            property="width"
          />
          <NumericInput
            label="Alto"
            value={selectedElement.height}
            onChange={(value) => {
              onUpdateSelectedElement('height', value);
              if (linkSettings.sizeLinked && selectedElement.width && selectedElement.height) {
                const ratio = selectedElement.width / selectedElement.height;
                onUpdateSelectedElement('width', value * ratio);
              }
            }}
            min={0}
            icon="↕️"
            property="height"
          />
        </div>
      </div>

      {/* Rotación y Escala - SIN desvinculación porque son transformaciones separadas */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{
          margin: '0 0 12px 0',
          fontSize: '12px',
          fontWeight: '600',
          color: '#374151',
          textTransform: 'uppercase',
          letterSpacing: '0.025em'
        }}>
          🔄 Rotación y Escala
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <NumericInput
            label="Rotación"
            value={selectedElement.rotation || 0}
            onChange={{ name: 'rotation' }}
            min={-360}
            max={360}
            step={1}
            showUnit={false}
            icon="🔄"
            isTransform={true}
          />
          <NumericInput
            label="Escala"
            value={selectedElement.scale || 1}
            onChange={{ name: 'scale' }}
            min={0.1}
            max={5}
            step={0.1}
            showUnit={false}
            icon="🔍"
            isTransform={true}
          />
        </div>

        {/* Resto de los controles de rotación y escala igual que antes */}
        <div style={{ marginTop: '8px' }}>
          <label style={{
            display: 'block',
            fontSize: '10px',
            fontWeight: '500',
            marginBottom: '4px',
            color: '#6b7280',
            textTransform: 'uppercase'
          }}>
            Rotación Rápida
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '4px'
          }}>
            {[0, 90, 180, 270].map(angle => (
              <button
                key={angle}
                onClick={() => handleTransformChange('rotation', angle)}
                style={{
                  padding: '4px 2px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '3px',
                  background: (selectedElement.rotation || 0) === angle ? '#eff6ff' : 'white',
                  borderColor: (selectedElement.rotation || 0) === angle ? '#3b82f6' : '#e5e7eb',
                  fontSize: '9px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {angle}°
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '8px' }}>
          <label style={{
            display: 'block',
            fontSize: '10px',
            fontWeight: '500',
            marginBottom: '4px',
            color: '#6b7280',
            textTransform: 'uppercase'
          }}>
            Escala Rápida
          </label>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '4px'
          }}>
            {[0.5, 0.75, 1, 1.5, 2].map(scale => (
              <button
                key={scale}
                onClick={() => handleTransformChange('scale', scale)}
                style={{
                  padding: '4px 2px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '3px',
                  background: Math.abs((selectedElement.scale || 1) - scale) < 0.01 ? '#eff6ff' : 'white',
                  borderColor: Math.abs((selectedElement.scale || 1) - scale) < 0.01 ? '#3b82f6' : '#e5e7eb',
                  fontSize: '9px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {scale}x
              </button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '8px' }}>
          <button
            onClick={() => {
              handleTransformChange('rotation', 0);
              handleTransformChange('scale', 1);
            }}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid #f59e0b',
              borderRadius: '4px',
              background: 'white',
              color: '#f59e0b',
              fontSize: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
            onMouseOver={(e) => e.target.style.background = '#fef3c7'}
            onMouseOut={(e) => e.target.style.background = 'white'}
          >
            🔄 Resetear Transformaciones
          </button>
        </div>
      </div>

      {/* Resto del componente igual que antes... */}
      {/* Visibilidad y Orden */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{
          margin: '0 0 12px 0',
          fontSize: '12px',
          fontWeight: '600',
          color: '#374151',
          textTransform: 'uppercase',
          letterSpacing: '0.025em'
        }}>
          👁️ Visibilidad y Orden
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '12px' }}>
          <NumericInput
            label="Z-Index"
            value={selectedElement.zIndex || 100}
            onChange={(value) => onUpdateSelectedElement('zIndex', parseInt(value) || 100)}
            min={0}
            max={9999}
            step={1}
            showUnit={false}
            icon="📊"
            property="zIndex"
          />
          <NumericInput
            label="Opacidad (%)"
            value={(selectedElement.opacity || 1) * 100}
            onChange={(value) => onUpdateSelectedElement('opacity', (value || 0) / 100)}
            min={0}
            max={100}
            step={1}
            showUnit={false}
            icon="👁️"
            property="opacity"
          />
        </div>

        {/* Controles de estado */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            padding: '6px 8px',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            background: selectedElement.visible !== false ? '#f0fdf4' : 'white'
          }}>
            <input
              type="checkbox"
              checked={selectedElement.visible !== false}
              onChange={(e) => onUpdateSelectedElement('visible', e.target.checked)}
              style={{ width: '14px', height: '14px' }}
            />
            Visible
          </label>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            padding: '6px 8px',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            background: selectedElement.locked ? '#fef3c7' : 'white'
          }}>
            <input
              type="checkbox"
              checked={selectedElement.locked || false}
              onChange={(e) => onUpdateSelectedElement('locked', e.target.checked)}
              style={{ width: '14px', height: '14px' }}
            />
            Bloqueado
          </label>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{
          margin: '0 0 12px 0',
          fontSize: '12px',
          fontWeight: '600',
          color: '#374151',
          textTransform: 'uppercase',
          letterSpacing: '0.025em'
        }}>
          ⚡ Acciones Rápidas
        </h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button
            onClick={() => {
              onUpdateSelectedElement('x', 0);
              onUpdateSelectedElement('y', 0);
            }}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              background: 'white',
              fontSize: '11px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseOver={(e) => e.target.style.background = '#f3f4f6'}
            onMouseOut={(e) => e.target.style.background = 'white'}
          >
            📍 Mover a origen (0,0)
          </button>
          
          <button
            onClick={() => {
              const snapSize = setValueFromUnit(5);
              onUpdateSelectedElement('x', Math.round(selectedElement.x / snapSize) * snapSize);
              onUpdateSelectedElement('y', Math.round(selectedElement.y / snapSize) * snapSize);
            }}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              background: 'white',
              fontSize: '11px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseOver={(e) => e.target.style.background = '#f3f4f6'}
            onMouseOut={(e) => e.target.style.background = 'white'}
          >
            🧲 Ajustar a cuadrícula (5{currentUnit})
          </button>

          <button
            onClick={() => {
              // Limpiar referencias a estilos del sidebar
              onUpdateSelectedElement('textStyleId', null);
              onUpdateSelectedElement('paragraphStyleId', null);
              onUpdateSelectedElement('borderStyleId', null);
              onUpdateSelectedElement('fillStyleId', null);
            }}
            style={{
              padding: '8px 12px',
              border: '1px solid #dc2626',
              borderRadius: '4px',
              background: 'white',
              color: '#dc2626',
              fontSize: '11px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseOver={(e) => e.target.style.background = '#fef2f2'}
            onMouseOut={(e) => e.target.style.background = 'white'}
          >
            🗑️ Quitar estilos aplicados
          </button>
        </div>
      </div>
    </div>
  );
};

export default BasicProperties;