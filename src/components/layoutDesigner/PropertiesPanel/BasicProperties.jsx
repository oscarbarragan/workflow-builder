// src/components/layoutDesigner/PropertiesPanel/BasicProperties.jsx - CORREGIDO
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

  // ✅ NUEVO: Función para obtener información de estilos aplicados
  const getAppliedStylesInfo = () => {
    const styles = [];
    if (selectedElement.textStyleId) {
      const style = styleManager.getTextStyle(selectedElement.textStyleId);
      styles.push({ type: 'textStyle', id: selectedElement.textStyleId, name: style?.name || 'Desconocido' });
    }
    if (selectedElement.paragraphStyleId) {
      const style = styleManager.getParagraphStyle(selectedElement.paragraphStyleId);
      styles.push({ type: 'paragraphStyle', id: selectedElement.paragraphStyleId, name: style?.name || 'Desconocido' });
    }
    if (selectedElement.borderStyleId) {
      const style = styleManager.getBorderStyle(selectedElement.borderStyleId);
      styles.push({ type: 'borderStyle', id: selectedElement.borderStyleId, name: style?.name || 'Desconocido' });
    }
    if (selectedElement.fillStyleId) {
      const style = styleManager.getFillStyle(selectedElement.fillStyleId);
      styles.push({ type: 'fillStyle', id: selectedElement.fillStyleId, name: style?.name || 'Desconocido' });
    }
    return styles;
  };

  // ✅ NUEVO: Función mejorada para manejar edición inteligente
  const handleSmartEdit = (property, value) => {
    console.log('🎯 Smart edit:', property, '=', value);
    
    // Mapeo de propiedades a tipos de estilo
    const propertyStyleMap = {
      // Text Style properties
      'fontSize': 'textStyle',
      'fontFamily': 'textStyle',
      'color': 'textStyle',
      'bold': 'textStyle',
      'italic': 'textStyle',
      'underline': 'textStyle',
      'strikethrough': 'textStyle',
      
      // Paragraph Style properties
      'alignment': 'paragraphStyle',
      'lineHeight': 'paragraphStyle',
      'letterSpacing': 'paragraphStyle',
      'indent': 'paragraphStyle',
      'spaceBefore': 'paragraphStyle',
      'spaceAfter': 'paragraphStyle',
      
      // Border Style properties
      'borderWidth': 'borderStyle',
      'borderStyle': 'borderStyle',
      'borderColor': 'borderStyle',
      'borderRadius': 'borderStyle',
      
      // Fill Style properties
      'backgroundColor': 'fillStyle',
      'fillColor': 'fillStyle',
      'opacity': 'fillStyle'
    };
    
    const affectedStyleType = propertyStyleMap[property];
    const styleIdField = affectedStyleType ? `${affectedStyleType}Id` : null;
    const currentStyleId = styleIdField ? selectedElement[styleIdField] : null;
    
    if (currentStyleId && affectedStyleType) {
      // Hay un estilo aplicado que se vería afectado
      console.log(`⚠️ Property "${property}" affects applied ${affectedStyleType}: ${currentStyleId}`);
      
      const styleInfo = (() => {
        switch (affectedStyleType) {
          case 'textStyle': return styleManager.getTextStyle(currentStyleId);
          case 'paragraphStyle': return styleManager.getParagraphStyle(currentStyleId);
          case 'borderStyle': return styleManager.getBorderStyle(currentStyleId);
          case 'fillStyle': return styleManager.getFillStyle(currentStyleId);
          default: return null;
        }
      })();
      
      const styleName = styleInfo?.name || 'Estilo aplicado';
      
      // Mostrar opciones al usuario
      const userChoice = window.confirm(
        `La propiedad "${property}" está controlada por el estilo "${styleName}".\n\n` +
        `¿Qué deseas hacer?\n\n` +
        `✅ OK = Desvincular estilo y editar manualmente\n` +
        `❌ Cancelar = Mantener estilo (no realizar cambios)`
      );
      
      if (userChoice) {
        console.log(`🔓 User chose to unlink ${affectedStyleType} and edit manually`);
        
        // Desvincular el estilo y aplicar el cambio manual
        const updates = {
          [styleIdField]: null, // Desvincular estilo
          [property]: value     // Aplicar cambio manual
        };
        
        // Si es una propiedad de estilo complejo, actualizar el objeto correspondiente
        if (affectedStyleType === 'textStyle') {
          const currentTextStyle = selectedElement.textStyle || {};
          updates.textStyle = { ...currentTextStyle, [property]: value };
        } else if (affectedStyleType === 'paragraphStyle') {
          const currentParagraphStyle = selectedElement.paragraphStyle || {};
          updates.paragraphStyle = { ...currentParagraphStyle, [property]: value };
        } else if (affectedStyleType === 'borderStyle') {
          const currentBorderStyle = selectedElement.borderStyle || {};
          updates.borderStyle = { ...currentBorderStyle, [property]: value };
        } else if (affectedStyleType === 'fillStyle') {
          const currentFillStyle = selectedElement.fillStyle || {};
          updates.fillStyle = { ...currentFillStyle, [property]: value };
        }
        
        // Aplicar todas las actualizaciones
        Object.entries(updates).forEach(([key, val]) => {
          onUpdateSelectedElement(key, val);
        });
        
        console.log('✅ Style unlinked and manual edit applied');
        
        // Notificar al usuario con un mensaje temporal
        setTimeout(() => {
          console.log(`🎉 Estilo "${styleName}" desvinculado. Ahora puedes editar manualmente.`);
        }, 100);
        
      } else {
        console.log('❌ User cancelled edit to preserve applied style');
        return; // Usuario canceló, no hacer nada
      }
    } else {
      // No hay estilo aplicado que se vea afectado, edición directa
      console.log(`✏️ Direct edit for property "${property}" (no style conflict)`);
      onUpdateSelectedElement(property, value);
    }
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

  // Función para manejar cambios de transformación (estas no se ven afectadas por estilos)
  const handleTransformChange = (property, value) => {
    console.log('🔄 Transform change:', property, value);
    onUpdateSelectedElement(property, value);
  };

  // ✅ MEJORADO: Componente NumericInput con detección de conflictos de estilo
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
    property = null // ✅ NUEVO: Nombre de la propiedad para detección de conflictos
  }) => {
    const currentValue = value !== undefined && value !== null ? value : '';
    const displayValue = showUnit && !isTransform && currentValue !== '' ? getValueInUnit(currentValue) : currentValue;
    
    // ✅ NUEVO: Detectar si esta propiedad tiene conflicto con estilo aplicado
    const hasStyleConflict = () => {
      if (!property || !hasAppliedStyles()) return false;
      
      const conflictMap = {
        'width': false,          // Las dimensiones básicas no conflictúan
        'height': false,
        'x': false,
        'y': false,
        'fontSize': selectedElement.textStyleId,
        'borderWidth': selectedElement.borderStyleId,
        'opacity': selectedElement.fillStyleId
      };
      
      return !!conflictMap[property];
    };
    
    // ✅ NUEVO: Función de actualización con lógica inteligente
    const handleUpdate = (newValue) => {
      if (isTransform) {
        handleTransformChange(onChange.name, newValue);
      } else if (property && hasStyleConflict()) {
        handleSmartEdit(property, newValue);
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
          {/* ✅ NUEVO: Indicador de conflicto de estilo */}
          {property && hasStyleConflict() && (
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
          border: hasStyleConflict() ? '1px solid #f59e0b' : '1px solid #d1d5db',
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
      </div>

      {/* ✅ NUEVO: Indicador de estilos aplicados con controles */}
      {hasAppliedStyles() && (
        <div style={{
          background: '#fef3c7',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '16px',
          border: '1px solid #f59e0b'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#92400e',
            fontWeight: '600',
            marginBottom: '8px'
          }}>
            🎨 Estilos Aplicados del Sidebar
          </div>
          
          <div style={{
            fontSize: '11px',
            color: '#92400e',
            marginBottom: '12px',
            lineHeight: '1.4'
          }}>
            {getAppliedStylesInfo().map(style => (
              <div key={style.type} style={{ marginBottom: '4px' }}>
                <strong>{style.type === 'textStyle' ? '🔤 Texto' : 
                         style.type === 'paragraphStyle' ? '📄 Párrafo' :
                         style.type === 'borderStyle' ? '🔲 Borde' : '🎨 Relleno'}:</strong> {style.name}
              </div>
            ))}
          </div>
          
          <div style={{
            fontSize: '10px',
            color: '#92400e',
            marginBottom: '12px',
            background: '#fef3c7',
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #f59e0b'
          }}>
            💡 <strong>Modo Inteligente Activo:</strong> Al editar propiedades que estén vinculadas a estilos, 
            se te preguntará si quieres desvincular el estilo para edición manual.
          </div>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                const confirmed = window.confirm(
                  'Esto desvinculará TODOS los estilos aplicados y permitirá edición manual completa.\n\n' +
                  '¿Continuar?'
                );
                
                if (confirmed) {
                  // Desvincular todos los estilos
                  onUpdateSelectedElement('textStyleId', null);
                  onUpdateSelectedElement('paragraphStyleId', null);
                  onUpdateSelectedElement('borderStyleId', null);
                  onUpdateSelectedElement('fillStyleId', null);
                  console.log('🔓 All styles unlinked for manual editing');
                }
              }}
              style={{
                padding: '6px 12px',
                border: '1px solid #f59e0b',
                borderRadius: '4px',
                background: 'white',
                color: '#f59e0b',
                fontSize: '11px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              🔓 Desvincular Todos
            </button>
            
            <button
              onClick={() => {
                alert(
                  'Modo Inteligente:\n\n' +
                  '• Al editar una propiedad vinculada a un estilo, se te preguntará qué hacer\n' +
                  '• Puedes desvincular el estilo para edición manual\n' +
                  '• O cancelar para mantener el estilo aplicado\n' +
                  '• Las propiedades no vinculadas (posición, dimensiones, rotación) se editan normalmente'
                );
              }}
              style={{
                padding: '6px 12px',
                border: '1px solid #3b82f6',
                borderRadius: '4px',
                background: 'white',
                color: '#3b82f6',
                fontSize: '11px',
                cursor: 'pointer',
                fontWeight: '600'
              }}
            >
              ℹ️ Ayuda
            </button>
          </div>
        </div>
      )}

      {/* ✅ NUEVO: Modo manual activo */}
      {!hasAppliedStyles() && (
        <div style={{
          background: '#f0fdf4',
          padding: '12px',
          borderRadius: '6px',
          marginBottom: '16px',
          border: '1px solid #bbf7d0'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#15803d',
            fontWeight: '600',
            marginBottom: '4px'
          }}>
            ✏️ Modo de Edición Manual
          </div>
          <div style={{
            fontSize: '11px',
            color: '#15803d'
          }}>
            Todas las propiedades se editan directamente en el elemento. 
            Puedes aplicar estilos desde el sidebar izquierdo.
          </div>
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

      {/* Rotación y Escala - NO vinculadas a estilos */}
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

        {/* Controles rápidos de rotación */}
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

        {/* Controles rápidos de escala */}
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

      {/* Visibilidad y Estado */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{
          margin: '0 0 12px 0',
          fontSize: '12px',
          fontWeight: '600',
          color: '#374151',
          textTransform: 'uppercase',
          letterSpacing: '0.025em'
        }}>
          👁️ Visibilidad y Estado
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
            onChange={(value) => handleSmartEdit('opacity', (value || 0) / 100)}
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
        </div>
      </div>

      {/* ✅ NUEVO: Información de debug (opcional, para desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          marginTop: '20px',
          padding: '8px',
          background: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '4px',
          fontSize: '10px',
          color: '#64748b'
        }}>
          <strong>🔧 Debug Info:</strong><br/>
          Applied Styles: {getAppliedStylesInfo().map(s => s.type).join(', ') || 'None'}<br/>
          Smart Edit Mode: {hasAppliedStyles() ? 'Active' : 'Manual'}
        </div>
      )}
    </div>
  );
};

export default BasicProperties;