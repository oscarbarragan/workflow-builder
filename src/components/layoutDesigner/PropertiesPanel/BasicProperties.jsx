// src/components/layoutDesigner/PropertiesPanel/BasicProperties.jsx - FIX INPUT NUMÉRICO
import React, { useState, useEffect } from 'react';
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

  const { units } = unitsConfig;
  const [currentUnit, setCurrentUnit] = useState(unitsConfig.defaults.unit);

  // ✅ State para valores actuales combinados (estilos + elemento)
  const [resolvedValues, setResolvedValues] = useState({});

  // ✅ NUEVO: State para valores temporales de inputs (permite edición libre)
  const [tempInputValues, setTempInputValues] = useState({});

  // ✅ Resolver valores cada vez que cambie el elemento o sus estilos aplicados
  useEffect(() => {
    if (!selectedElement) return;

    const resolved = { ...selectedElement };

    // Resolver Text Style aplicado
    if (selectedElement.textStyleId) {
      const textStyle = styleManager.getTextStyle(selectedElement.textStyleId);
      if (textStyle) {
        resolved.fontSize = textStyle.fontSize;
        resolved.fontFamily = textStyle.fontFamily;
        resolved.color = textStyle.color;
        resolved.bold = textStyle.bold;
        resolved.italic = textStyle.italic;
        resolved.underline = textStyle.underline;
        resolved.strikethrough = textStyle.strikethrough;
      }
    }

    // Resolver Paragraph Style aplicado
    if (selectedElement.paragraphStyleId) {
      const paragraphStyle = styleManager.getParagraphStyle(selectedElement.paragraphStyleId);
      if (paragraphStyle) {
        resolved.alignment = paragraphStyle.alignment;
        resolved.lineHeight = paragraphStyle.lineHeight;
        resolved.letterSpacing = paragraphStyle.letterSpacing;
      }
    }

    // Resolver Border Style aplicado
    if (selectedElement.borderStyleId) {
      const borderStyle = styleManager.getBorderStyle(selectedElement.borderStyleId);
      if (borderStyle) {
        resolved.borderWidth = borderStyle.width;
        resolved.borderStyle = borderStyle.style;
        resolved.borderColor = borderStyle.color;
        resolved.borderRadius = borderStyle.radius;
      }
    }

    // Resolver Fill Style aplicado
    if (selectedElement.fillStyleId) {
      const fillStyle = styleManager.getFillStyle(selectedElement.fillStyleId);
      if (fillStyle) {
        resolved.backgroundColor = fillStyle.backgroundColor;
        resolved.opacity = fillStyle.opacity;
      }
    }

    // Los valores locales del elemento siempre tienen prioridad sobre los estilos aplicados
    if (selectedElement.textStyle) {
      Object.assign(resolved, selectedElement.textStyle);
    }
    if (selectedElement.paragraphStyle) {
      Object.assign(resolved, selectedElement.paragraphStyle);
    }
    if (selectedElement.borderStyle) {
      Object.assign(resolved, selectedElement.borderStyle);
    }
    if (selectedElement.fillStyle) {
      Object.assign(resolved, selectedElement.fillStyle);
    }

    setResolvedValues(resolved);
    
    // ✅ NUEVO: Limpiar valores temporales cuando cambie el elemento
    setTempInputValues({});
    
    console.log('🔄 Values resolved:', resolved);
  }, [
    selectedElement, 
    selectedElement?.textStyleId, 
    selectedElement?.paragraphStyleId, 
    selectedElement?.borderStyleId, 
    selectedElement?.fillStyleId
  ]);

  // ✅ Función simple para actualizar propiedades
  const updateProperty = (property, value) => {
    console.log('🎯 Updating property:', property, '=', value);
    
    // Mapeo de propiedades a tipos de estilo
    const propertyToStyleType = {
      fontSize: 'textStyle',
      fontFamily: 'textStyle', 
      color: 'textStyle',
      bold: 'textStyle',
      italic: 'textStyle',
      underline: 'textStyle',
      strikethrough: 'textStyle',
      alignment: 'paragraphStyle',
      lineHeight: 'paragraphStyle',
      letterSpacing: 'paragraphStyle',
      borderWidth: 'borderStyle',
      borderColor: 'borderStyle',
      borderRadius: 'borderStyle',
      backgroundColor: 'fillStyle',
      opacity: 'fillStyle'
    };

    const styleType = propertyToStyleType[property];
    const styleIdField = styleType ? `${styleType}Id` : null;
    const hasAppliedStyle = styleIdField && selectedElement[styleIdField];

    if (hasAppliedStyle) {
      // Si hay estilo aplicado, actualizar el objeto de estilo local
      const currentStyleObject = selectedElement[styleType] || {};
      const updatedStyleObject = {
        ...currentStyleObject,
        [property]: value
      };
      onUpdateSelectedElement(styleType, updatedStyleObject);
      console.log(`✅ Updated ${styleType} object:`, updatedStyleObject);
    } else {
      // Si no hay estilo aplicado, actualizar la propiedad directa
      if (styleType) {
        const currentStyleObject = selectedElement[styleType] || {};
        const updatedStyleObject = {
          ...currentStyleObject,
          [property]: value
        };
        onUpdateSelectedElement(styleType, updatedStyleObject);
      } else {
        onUpdateSelectedElement(property, value);
      }
      console.log(`✅ Updated property directly:`, property, value);
    }

    // ✅ NUEVO: Limpiar valor temporal después de aplicar
    setTempInputValues(prev => {
      const updated = { ...prev };
      delete updated[property];
      return updated;
    });
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

  // Funciones de conversión
  const convertValue = (value, fromUnit, toUnit) => {
    return unitsConfig.utils.convert(value, fromUnit, toUnit, units);
  };

  const getValueInUnit = (pixelValue) => {
    return convertValue(pixelValue || 0, 'px', currentUnit);
  };

  const setValueFromUnit = (value) => {
    return convertValue(value || 0, currentUnit, 'px');
  };

  // ✅ CORREGIDO: Componente NumericInput que permite edición libre
  const NumericInput = ({ 
    label, 
    property,
    min, 
    max, 
    step = 0.1, 
    showUnit = true,
    icon,
    placeholder = "0",
    isTransform = false
  }) => {
    // ✅ CORREGIDO: Obtener valor - priorizar temporal, luego resuelto
    const getCurrentValue = () => {
      // Si hay un valor temporal (usuario está escribiendo), usarlo
      if (tempInputValues[property] !== undefined) {
        return tempInputValues[property];
      }
      
      // Sino, usar el valor resuelto
      const resolvedValue = resolvedValues[property];
      if (resolvedValue !== undefined && resolvedValue !== null) {
        return resolvedValue;
      }
      
      return '';
    };

    const currentValue = getCurrentValue();
    const displayValue = showUnit && !isTransform && currentValue !== '' ? getValueInUnit(currentValue) : currentValue;
    
    // ✅ CORREGIDO: Manejar cambio de input (permite escritura libre)
    const handleInputChange = (inputValue) => {
      console.log('📝 Input change:', property, inputValue);
      
      // ✅ Guardar valor temporal para permitir edición libre
      setTempInputValues(prev => ({
        ...prev,
        [property]: inputValue
      }));
    };

    // ✅ CORREGIDO: Manejar blur (aplicar valor final)
    const handleInputBlur = (inputValue) => {
      console.log('🔚 Input blur:', property, inputValue);
      
      if (inputValue === '' || inputValue === null || inputValue === undefined) {
        // Si está vacío, usar valor por defecto
        const defaultValue = parseFloat(placeholder) || 0;
        const finalValue = showUnit && !isTransform ? setValueFromUnit(defaultValue) : defaultValue;
        updateProperty(property, finalValue);
      } else {
        // Convertir y aplicar valor
        const numValue = parseFloat(inputValue);
        if (!isNaN(numValue)) {
          const finalValue = showUnit && !isTransform ? setValueFromUnit(numValue) : numValue;
          updateProperty(property, finalValue);
        } else {
          // Si no es un número válido, restaurar valor anterior
          setTempInputValues(prev => {
            const updated = { ...prev };
            delete updated[property];
            return updated;
          });
        }
      }
    };

    // ✅ CORREGIDO: Manejar Enter (aplicar inmediatamente)
    const handleKeyPress = (e, inputValue) => {
      if (e.key === 'Enter') {
        e.target.blur(); // Trigger blur para aplicar valor
      }
    };
    
    const handleUpdate = (newValue) => {
      if (isTransform) {
        handleTransformChange(property, newValue);
      } else {
        updateProperty(property, newValue);
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
            onChange={(e) => handleInputChange(e.target.value)}
            onBlur={(e) => handleInputBlur(e.target.value)}
            onKeyPress={(e) => handleKeyPress(e, e.target.value)}
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
        <h4 style={{
          margin: '0 0 12px 0',
          fontSize: '12px',
          fontWeight: '600',
          color: '#374151',
          textTransform: 'uppercase',
          letterSpacing: '0.025em'
        }}>
          📍 Posición
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <NumericInput
            label="X"
            property="x"
            icon="↔️"
          />
          <NumericInput
            label="Y"
            property="y"
            icon="↕️"
          />
        </div>
      </div>

      {/* Dimensiones */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{
          margin: '0 0 12px 0',
          fontSize: '12px',
          fontWeight: '600',
          color: '#374151',
          textTransform: 'uppercase',
          letterSpacing: '0.025em'
        }}>
          📐 Dimensiones
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <NumericInput
            label="Ancho"
            property="width"
            min={0}
            icon="↔️"
          />
          <NumericInput
            label="Alto"
            property="height"
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
          🔄 Transformaciones
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          <NumericInput
            label="Rotación"
            property="rotation"
            min={-360}
            max={360}
            step={1}
            showUnit={false}
            icon="🔄"
            isTransform={true}
          />
          <NumericInput
            label="Escala"
            property="scale"
            min={0.1}
            max={5}
            step={0.1}
            showUnit={false}
            icon="🔍"
            isTransform={true}
          />
        </div>
      </div>

      {/* Propiedades específicas de texto */}
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
            🔤 Texto
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '12px' }}>
            <NumericInput
              label="Tamaño"
              property="fontSize"
              min={8}
              max={72}
              step={1}
              showUnit={false}
              icon="🔤"
              placeholder="14"
            />
            <NumericInput
              label="Opacidad (%)"
              property="opacity"
              min={0}
              max={100}
              step={1}
              showUnit={false}
              icon="👁️"
              placeholder="100"
            />
          </div>

          {/* Checkbox styles */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
            {[
              { property: 'bold', label: 'Negrita', icon: '𝐁' },
              { property: 'italic', label: 'Cursiva', icon: '𝐼' },
              { property: 'underline', label: 'Subrayado', icon: 'U̲' },
              { property: 'strikethrough', label: 'Tachado', icon: 'S̶' }
            ].map(style => (
              <label 
                key={style.property}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#374151',
                  padding: '6px 8px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '4px',
                  background: resolvedValues[style.property] ? '#eff6ff' : 'white'
                }}
              >
                <input
                  type="checkbox"
                  checked={resolvedValues[style.property] || false}
                  onChange={(e) => updateProperty(style.property, e.target.checked)}
                  style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                />
                <span style={{ marginRight: '4px' }}>{style.icon}</span>
                {style.label}
              </label>
            ))}
          </div>
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
              handleTransformChange('rotation', 0);
              handleTransformChange('scale', 1);
            }}
            style={{
              padding: '8px 12px',
              border: '1px solid #f59e0b',
              borderRadius: '4px',
              background: 'white',
              color: '#f59e0b',
              fontSize: '11px',
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
    </div>
  );
};

export default BasicProperties;