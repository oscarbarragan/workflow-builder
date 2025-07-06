// src/components/layoutDesigner/PropertiesPanel/SmartEditingUI.jsx
import React, { useState } from 'react';
import useSmartEditing from '../hooks/useSmartEditing';

// ✅ Componente principal de interfaz para Smart Editing
export const SmartEditingStatusPanel = ({ selectedElement, onUpdateSelectedElement }) => {
  const {
    hasAppliedStyles,
    getAppliedStylesInfo,
    getContextualHelp,
    getElementStats,
    unlinkAllStyles
  } = useSmartEditing(selectedElement, onUpdateSelectedElement);

  const [showDetails, setShowDetails] = useState(false);
  const contextualHelp = getContextualHelp();
  const elementStats = getElementStats();
  const appliedStylesInfo = getAppliedStylesInfo();

  if (!hasAppliedStyles) {
    return (
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
          Todas las propiedades se editan directamente. Aplica estilos desde el sidebar izquierdo.
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: contextualHelp.type === 'warning' ? '#fef3c7' : 
                 contextualHelp.type === 'info' ? '#eff6ff' : '#f3f4f6',
      padding: '12px',
      borderRadius: '6px',
      marginBottom: '16px',
      border: `1px solid ${contextualHelp.type === 'warning' ? '#f59e0b' : 
                           contextualHelp.type === 'info' ? '#3b82f6' : '#9ca3af'}`
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '8px'
      }}>
        <div style={{
          fontSize: '12px',
          color: contextualHelp.type === 'warning' ? '#92400e' : 
                 contextualHelp.type === 'info' ? '#1e40af' : '#374151',
          fontWeight: '600'
        }}>
          {contextualHelp.title}
        </div>
        
        <button
          onClick={() => setShowDetails(!showDetails)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            color: contextualHelp.type === 'warning' ? '#92400e' : 
                   contextualHelp.type === 'info' ? '#1e40af' : '#374151'
          }}
        >
          {showDetails ? '🔼' : '🔽'}
        </button>
      </div>

      {/* Descripción */}
      <div style={{
        fontSize: '11px',
        color: contextualHelp.type === 'warning' ? '#92400e' : 
               contextualHelp.type === 'info' ? '#1e40af' : '#374151',
        marginBottom: showDetails ? '12px' : '8px',
        lineHeight: '1.4'
      }}>
        {contextualHelp.message}
      </div>

      {/* Estilos aplicados */}
      <div style={{
        display: 'flex',
        gap: '4px',
        flexWrap: 'wrap',
        marginBottom: showDetails ? '12px' : '8px'
      }}>
        {appliedStylesInfo.map(style => (
          <span
            key={style.type}
            style={{
              background: style.data?.isCustom ? '#16a34a' : '#3b82f6',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '4px',
              fontSize: '10px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '2px'
            }}
            title={`${style.name} (${style.data?.isCustom ? 'Personalizado' : 'Predefinido'})`}
          >
            {style.type === 'textStyle' ? '🔤' : 
             style.type === 'paragraphStyle' ? '📄' :
             style.type === 'borderStyle' ? '🔲' : '🎨'}
            {style.name}
          </span>
        ))}
      </div>

      {/* Detalles expandibles */}
      {showDetails && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.5)',
          padding: '8px',
          borderRadius: '4px',
          marginBottom: '8px'
        }}>
          <div style={{
            fontSize: '11px',
            color: '#374151',
            marginBottom: '8px'
          }}>
            <strong>📊 Estadísticas:</strong>
            <br />• {elementStats.appliedStylesCount} estilos aplicados
            <br />• {elementStats.conflictingProperties.length} propiedades vinculadas
            <br />• Modo: {elementStats.editingMode}
          </div>
          
          {elementStats.conflictingProperties.length > 0 && (
            <div style={{
              fontSize: '10px',
              color: '#6b7280',
              marginBottom: '8px'
            }}>
              <strong>🔗 Propiedades vinculadas:</strong> {elementStats.conflictingProperties.join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Botones de acción */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => {
            const confirmed = window.confirm(
              'Esto desvinculará TODOS los estilos aplicados.\n\n' +
              'Después podrás editar todas las propiedades manualmente.\n\n' +
              '¿Continuar?'
            );
            
            if (confirmed) {
              unlinkAllStyles();
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
            const message = 
              '🎨 Sistema de Edición Inteligente:\n\n' +
              '✅ MANUAL: Sin estilos aplicados, edición directa\n' +
              '⚠️ INTELIGENTE: Con estilos aplicados, detecta conflictos\n' +
              '🛡️ PROTEGIDO: Estilos predefinidos, recomenda duplicar\n\n' +
              '🔗 Propiedades Vinculadas:\n' +
              '• Al editar, se detectan conflictos automáticamente\n' +
              '• Se te pregunta si quieres desvincular el estilo\n' +
              '• Las transformaciones (rotación, escala) nunca conflictúan\n\n' +
              '💡 Consejos:\n' +
              '• Usa el sidebar para crear y aplicar estilos\n' +
              '• Duplica estilos predefinidos antes de modificar\n' +
              '• Desvincular permite edición manual completa';
            
            alert(message);
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
  );
};

// ✅ Componente para mostrar indicadores de propiedades
export const PropertyConflictIndicator = ({ 
  property, 
  hasConflict, 
  conflictInfo, 
  onShowDetails 
}) => {
  if (!hasConflict) return null;

  return (
    <div
      onClick={onShowDetails}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        marginLeft: '6px',
        fontSize: '9px',
        color: '#f59e0b',
        background: '#fef3c7',
        padding: '2px 6px',
        borderRadius: '3px',
        cursor: 'pointer',
        border: '1px solid #f59e0b'
      }}
      title={`Vinculado a: ${conflictInfo?.styleName}`}
    >
      🔗 {conflictInfo?.styleType}
    </div>
  );
};

// ✅ Componente para input inteligente con detección de conflictos
export const SmartPropertyInput = ({ 
  label,
  property,
  value,
  onChange,
  selectedElement,
  onUpdateSelectedElement,
  type = 'number',
  min,
  max,
  step,
  placeholder,
  icon,
  unit,
  ...inputProps
}) => {
  const {
    smartEdit,
    hasPropertyConflict,
    getPropertyConflictInfo
  } = useSmartEditing(selectedElement, onUpdateSelectedElement);

  const hasConflict = hasPropertyConflict(property);
  const conflictInfo = hasConflict ? getPropertyConflictInfo(property) : null;

  const handleChange = (newValue) => {
    if (onChange) {
      // Si hay función onChange personalizada, usarla
      onChange(newValue);
    } else {
      // Usar smart edit por defecto
      smartEdit(property, newValue);
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
        <PropertyConflictIndicator
          property={property}
          hasConflict={hasConflict}
          conflictInfo={conflictInfo}
          onShowDetails={() => {
            if (conflictInfo) {
              alert(
                `Propiedad: ${property}\n` +
                `Controlada por: ${conflictInfo.styleName}\n` +
                `Tipo de estilo: ${conflictInfo.styleType}\n\n` +
                `Al editar esta propiedad se te preguntará si quieres desvincular el estilo.`
              );
            }
          }}
        />
      </label>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        background: 'white',
        border: hasConflict ? '2px solid #f59e0b' : '1px solid #d1d5db',
        borderRadius: '4px',
        overflow: 'hidden',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <input
          type={type}
          value={value}
          onChange={(e) => {
            const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
            handleChange(newValue);
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
          {...inputProps}
        />
        
        {unit && (
          <div style={{
            padding: '4px 6px',
            background: hasConflict ? '#fef3c7' : '#f3f4f6',
            borderLeft: hasConflict ? '1px solid #f59e0b' : '1px solid #d1d5db',
            fontSize: '10px',
            color: hasConflict ? '#92400e' : '#6b7280',
            fontWeight: '500',
            minWidth: '30px',
            textAlign: 'center',
            flexShrink: 0
          }}>
            {unit}
          </div>
        )}
      </div>
    </div>
  );
};

// ✅ Hook para usar con cualquier campo de propiedades
export const useSmartPropertyField = (property, selectedElement, onUpdateSelectedElement) => {
  const { smartEdit, hasPropertyConflict, getPropertyConflictInfo } = useSmartEditing(
    selectedElement, 
    onUpdateSelectedElement
  );

  const hasConflict = hasPropertyConflict(property);
  const conflictInfo = hasConflict ? getPropertyConflictInfo(property) : null;

  const handleChange = (value, options = {}) => {
    return smartEdit(property, value, options);
  };

  return {
    hasConflict,
    conflictInfo,
    handleChange,
    smartEdit: (value, options) => smartEdit(property, value, options)
  };
};

export default {
  SmartEditingStatusPanel,
  PropertyConflictIndicator,
  SmartPropertyInput,
  useSmartPropertyField
};