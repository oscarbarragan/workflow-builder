// src/components/layoutDesigner/components/Variable/Variable.jsx
import React, { useState, useCallback, useRef, useEffect } from 'react';
import { variableStyles } from './Variable.styles';
import { variableUtils } from './variable.utils';
import { variableConfig } from './Variable.config';
import VariableEditor from './VariableEditor';

const Variable = ({ 
  element, 
  isSelected, 
  isDragging,
  onMouseDown,
  onDoubleClick,
  availableVariables = {},
  showVariableValues = false
}) => {
  const [showSelector, setShowSelector] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const elementRef = useRef(null);
  const selectorRef = useRef(null);

  // Effect para cerrar selector al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectorRef.current && !selectorRef.current.contains(event.target) && 
          elementRef.current && !elementRef.current.contains(event.target)) {
        setShowSelector(false);
      }
    };

    if (showSelector) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSelector]);

  // Event handlers
  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onMouseDown(e, element);
  }, [element, onMouseDown]);

  const handleDoubleClick = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (Object.keys(availableVariables).length > 0) {
      setShowSelector(true);
    } else {
      setIsEditing(true);
    }
    
    onDoubleClick && onDoubleClick(element);
  }, [element, onDoubleClick, availableVariables]);

  const handleVariableSelect = useCallback((variableKey) => {
    // Aquí necesitarías una función para actualizar el elemento
    // Como no está disponible directamente, usamos onDoubleClick para notificar
    setShowSelector(false);
    console.log('Variable selected:', variableKey);
  }, []);

  const handleEditFinish = useCallback((newVariable) => {
    setIsEditing(false);
    console.log('Variable edited:', newVariable);
  }, []);

  const handleEditCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  // Procesar variables disponibles
  const processedVariables = variableUtils.processAvailableVariables(availableVariables);
  
  // Obtener contenido a mostrar
  const displayContent = variableUtils.getDisplayContent(element, availableVariables, showVariableValues);
  
  // Verificar si la variable existe
  const variableExists = variableUtils.variableExists(element.variable, availableVariables);

  return (
    <>
      {/* Elemento principal */}
      <div
        ref={elementRef}
        style={variableStyles.container(element, isSelected, isDragging)}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        onDragStart={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
        title={`Variable: ${element.variable || 'variable'} - Doble click para cambiar`}
        data-element-id={element.id}
        data-element-type={element.type}
      >
        <div style={variableStyles.content}>
          <span style={variableStyles.icon}>
            {variableExists ? '🔗' : '⚠️'}
          </span>
          <span style={variableStyles.variableName(showVariableValues)}>
            {displayContent}
          </span>
        </div>
      </div>

      {/* Selector de variables */}
      {showSelector && !isEditing && (
        <div 
          ref={selectorRef}
          style={{
            ...variableStyles.selector,
            left: element.x,
            top: element.y + 40
          }}
        >
          <div style={variableStyles.selectorHeader}>
            🔗 Seleccionar Variable ({processedVariables.length})
          </div>
          
          {processedVariables.length === 0 ? (
            <div style={{
              padding: '16px',
              textAlign: 'center',
              color: '#9ca3af',
              fontSize: '12px'
            }}>
              No hay variables disponibles
            </div>
          ) : (
            processedVariables.map((variable) => (
              <div
                key={variable.key}
                style={variableStyles.selectorItem(element.variable === variable.key)}
                onClick={() => handleVariableSelect(variable.key)}
                onMouseOver={(e) => {
                  if (element.variable !== variable.key) {
                    e.target.style.backgroundColor = '#f8fafc';
                  }
                }}
                onMouseOut={(e) => {
                  if (element.variable !== variable.key) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <div style={variableStyles.selectorItemName}>
                  {variable.key}
                </div>
                <div style={variableStyles.selectorItemValue}>
                  {variable.type}: {variable.displayValue}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Editor de variable */}
      {isEditing && (
        <VariableEditor
          element={element}
          onFinish={handleEditFinish}
          onCancel={handleEditCancel}
        />
      )}

      {/* Tooltip de información */}
      {isSelected && !showSelector && !isEditing && (
        <div style={variableStyles.tooltip(element.x, element.y)}>
          {element.type} | Variable: {element.variable || 'variable'}
          {!variableExists && ' | ⚠️ No encontrada'}
          <span style={{ marginLeft: '8px', color: showVariableValues ? '#16a34a' : '#f59e0b' }}>
            | {showVariableValues ? 'Valor' : 'Variable'}
          </span>
        </div>
      )}
    </>
  );
};

export default Variable;