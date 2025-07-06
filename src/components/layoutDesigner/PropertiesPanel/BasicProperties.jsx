// src/components/layoutDesigner/PropertiesPanel/BasicProperties.jsx
import React, { useState } from 'react';
import { ELEMENT_TYPES } from '../utils/constants';
import { styleManager } from '../utils/StyleManager';
import { variableProcessor } from '../utils/variableProcessor';
import { unitsConfig } from '../utils/units.config';

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

  // Funciones de conversión usando la configuración
  const convertValue = (value, fromUnit, toUnit) => {
    return unitsConfig.utils.convert(value, fromUnit, toUnit, units);
  };

  const formatValue = (value, unit) => {
    return unitsConfig.utils.formatValue(value, unit);
  };

  // Función para obtener valor en la unidad actual
  const getValueInUnit = (pixelValue) => {
    return convertValue(pixelValue || 0, 'px', currentUnit);
  };

  // Función para convertir valor de la unidad actual a píxeles
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

  // Manejar cambio de estilo
  const handleStyleChange = (styleType, styleId) => {
    onUpdateSelectedElement(`${styleType}Id`, styleId);
    
    if (styleId && styleManager) {
      let style = null;
      switch (styleType) {
        case 'textStyle':
          style = styleManager.getTextStyle(styleId);
          break;
        case 'paragraphStyle':
          style = styleManager.getParagraphStyle(styleId);
          break;
        case 'borderStyle':
          style = styleManager.getBorderStyle(styleId);
          break;
        case 'fillStyle':
          style = styleManager.getFillStyle(styleId);
          break;
      }
      
      if (style) {
        onUpdateSelectedElement(styleType, { ...style });
        if (onStyleChanged) {
          onStyleChanged(styleType, style);
        }
      }
    }
  };

  // Componente de input numérico con unidades
  const NumericInput = ({ 
    label, 
    value, 
    onChange, 
    min, 
    max, 
    step = 0.1, 
    showUnit = true,
    icon,
    placeholder = "0"
  }) => {
    // Asegurar que el valor se muestre correctamente
    const displayValue = showUnit ? getValueInUnit(value) : (value || 0);
    
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
              const inputValue = parseFloat(e.target.value) || 0;
              const finalValue = showUnit ? setValueFromUnit(inputValue) : inputValue;
              onChange(finalValue);
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
          {showUnit && (
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
      </div>

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
          />
          <NumericInput
            label="Y"
            value={selectedElement.y}
            onChange={(value) => onUpdateSelectedElement('y', value)}
            icon="↕️"
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
          />
        </div>
      </div>

      {/* Rotación y Escala */}
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
            label="Rotación (°)"
            value={selectedElement.rotation || 0}
            onChange={(value) => onUpdateSelectedElement('rotation', parseFloat(value) || 0)}
            min={-360}
            max={360}
            step={1}
            showUnit={false}
            icon="🔄"
          />
          <NumericInput
            label="Escala (x)"
            value={selectedElement.scale || 1}
            onChange={(value) => onUpdateSelectedElement('scale', parseFloat(value) || 1)}
            min={0.1}
            max={5}
            step={0.1}
            showUnit={false}
            icon="🔍"
          />
        </div>

        {/* Botones de rotación rápida */}
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
                onClick={() => onUpdateSelectedElement('rotation', angle)}
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

        {/* Botones de escala rápida */}
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
                onClick={() => onUpdateSelectedElement('scale', scale)}
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
      </div>

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

      {/* Contenido específico para elementos de texto */}
      {selectedElement.type === ELEMENT_TYPES.TEXT && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151',
            textTransform: 'uppercase',
            letterSpacing: '0.025em'
          }}>
            📝 Contenido de Texto
          </h4>
          
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
              Texto
            </label>
            <textarea
              value={selectedElement.text || ''}
              onChange={(e) => onUpdateSelectedElement('text', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '12px',
                minHeight: '60px',
                resize: 'vertical',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
              placeholder="Ingresa el texto a mostrar"
            />
          </div>
        </div>
      )}

      {/* Variables para elementos de variable */}
      {selectedElement.type === ELEMENT_TYPES.VARIABLE && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151',
            textTransform: 'uppercase',
            letterSpacing: '0.025em'
          }}>
            🔗 Variable
          </h4>
          
          {processedVariables.length === 0 ? (
            <div style={{
              padding: '12px',
              border: '1px dashed #d1d5db',
              borderRadius: '6px',
              textAlign: 'center',
              color: '#6b7280',
              fontSize: '12px'
            }}>
              <div style={{ marginBottom: '4px' }}>🔗 No hay variables disponibles</div>
              <div style={{ fontSize: '11px' }}>
                Conecta nodos para obtener variables
              </div>
            </div>
          ) : (
            <select
              value={selectedElement.variable || ''}
              onChange={(e) => onUpdateSelectedElement('variable', e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '12px',
                boxSizing: 'border-box',
                fontFamily: 'monospace'
              }}
            >
              <option value="">Selecciona una variable del workflow</option>
              {processedVariables.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Propiedades para Rectangle */}
      {selectedElement.type === ELEMENT_TYPES.RECTANGLE && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151',
            textTransform: 'uppercase',
            letterSpacing: '0.025em'
          }}>
            ⬜ Propiedades del Rectángulo
          </h4>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '12px' }}>
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
                Color Relleno
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="color"
                  value={selectedElement.fillColor || 'rgba(156, 163, 175, 0.1)'}
                  onChange={(e) => onUpdateSelectedElement('fillColor', e.target.value)}
                  style={{
                    width: '40px',
                    height: '32px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                />
                <input
                  type="text"
                  value={selectedElement.fillColor || 'rgba(156, 163, 175, 0.1)'}
                  onChange={(e) => onUpdateSelectedElement('fillColor', e.target.value)}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                  placeholder="rgba(156, 163, 175, 0.1)"
                />
              </div>
            </div>
            
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
                Color Borde
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="color"
                  value={selectedElement.borderColor || '#6b7280'}
                  onChange={(e) => onUpdateSelectedElement('borderColor', e.target.value)}
                  style={{
                    width: '40px',
                    height: '32px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                />
                <input
                  type="text"
                  value={selectedElement.borderColor || '#6b7280'}
                  onChange={(e) => onUpdateSelectedElement('borderColor', e.target.value)}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                  placeholder="#6b7280"
                />
              </div>
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            <NumericInput
              label="Grosor Borde"
              value={selectedElement.borderWidth || 2}
              onChange={(value) => onUpdateSelectedElement('borderWidth', value)}
              min={0}
              max={20}
              step={1}
              showUnit={false}
              icon="🔲"
            />
            <NumericInput
              label="Radio Borde"
              value={selectedElement.borderRadius || 4}
              onChange={(value) => onUpdateSelectedElement('borderRadius', value)}
              min={0}
              max={50}
              step={1}
              showUnit={false}
              icon="🔲"
            />
          </div>
        </div>
      )}

      {/* Enlaces para elementos de texto */}
      {(selectedElement.type === ELEMENT_TYPES.TEXT || selectedElement.type === ELEMENT_TYPES.VARIABLE) && (
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151',
            textTransform: 'uppercase',
            letterSpacing: '0.025em'
          }}>
            🔗 Configuración de Enlace
          </h4>

          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            marginBottom: '12px',
            padding: '6px 8px',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            background: selectedElement.linkEnabled ? '#f0fdf4' : 'white'
          }}>
            <input
              type="checkbox"
              checked={selectedElement.linkEnabled || false}
              onChange={(e) => onUpdateSelectedElement('linkEnabled', e.target.checked)}
              style={{ width: '14px', height: '14px' }}
            />
            Habilitar como enlace
          </label>

          {selectedElement.linkEnabled && (
            <div style={{ paddingLeft: '8px' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="linkType"
                      value="static"
                      checked={selectedElement.linkType !== 'variable'}
                      onChange={() => onUpdateSelectedElement('linkType', 'static')}
                    />
                    URL estática
                  </label>
                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}>
                    <input
                      type="radio"
                      name="linkType"
                      value="variable"
                      checked={selectedElement.linkType === 'variable'}
                      onChange={() => onUpdateSelectedElement('linkType', 'variable')}
                    />
                    Variable
                  </label>
                </div>
              </div>

              {selectedElement.linkType !== 'variable' ? (
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
                    URL del Enlace
                  </label>
                  <input
                    type="text"
                    value={selectedElement.linkUrl || ''}
                    onChange={(e) => onUpdateSelectedElement('linkUrl', e.target.value)}
                    placeholder="https://ejemplo.com"
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '12px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              ) : (
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
                    Variable de Enlace
                  </label>
                  <select
                    value={selectedElement.linkVariable || ''}
                    onChange={(e) => onUpdateSelectedElement('linkVariable', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '12px',
                      boxSizing: 'border-box',
                      fontFamily: 'monospace'
                    }}
                  >
                    <option value="">Selecciona una variable</option>
                    {processedVariables
                      .filter(v => v.type === 'string')
                      .map(option => (
                        <option key={option.value} value={option.value}>
                          {option.value}
                        </option>
                      ))}
                  </select>
                </div>
              )}

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
                  Abrir enlace
                </label>
                <select
                  value={selectedElement.linkTarget || '_self'}
                  onChange={(e) => onUpdateSelectedElement('linkTarget', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '12px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="_self">Misma ventana</option>
                  <option value="_blank">Nueva ventana</option>
                </select>
              </div>
            </div>
          )}
        </div>
      )}

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
              const snapSize = setValueFromUnit(5); // 5 unidades de la unidad actual
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