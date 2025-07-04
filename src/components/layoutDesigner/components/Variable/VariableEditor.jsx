// src/components/layoutDesigner/components/Variable/VariableEditor.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { variableUtils } from './variable.utils';

const VariableEditor = ({ element, onFinish, onCancel }) => {
  const [editValue, setEditValue] = useState(element.variable || '');
  const [isValid, setIsValid] = useState(true);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, []);

  const validateInput = useCallback((value) => {
    const valid = variableUtils.validateVariableName(value);
    setIsValid(valid);
    return valid;
  }, []);

  const handleInputChange = useCallback((e) => {
    const value = e.target.value;
    setEditValue(value);
    validateInput(value);
  }, [validateInput]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isValid && editValue.trim()) {
        onFinish(editValue.trim());
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  }, [isValid, editValue, onFinish, onCancel]);

  const handleBlur = useCallback(() => {
    if (isValid && editValue.trim()) {
      onFinish(editValue.trim());
    } else {
      onCancel();
    }
  }, [isValid, editValue, onFinish, onCancel]);

  const editorStyle = {
    position: 'absolute',
    left: element.x,
    top: element.y,
    background: 'white',
    border: '2px solid #3b82f6',
    borderRadius: '6px',
    padding: '8px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 3000,
    minWidth: '200px'
  };

  const inputStyle = {
    width: '100%',
    padding: '6px 8px',
    border: `1px solid ${isValid ? '#d1d5db' : '#dc2626'}`,
    borderRadius: '4px',
    fontSize: '14px',
    fontFamily: 'monospace',
    outline: 'none',
    boxSizing: 'border-box'
  };

  const helpStyle = {
    fontSize: '11px',
    color: isValid ? '#6b7280' : '#dc2626',
    marginTop: '4px',
    lineHeight: '1.3'
  };

  return (
    <div style={editorStyle}>
      <div style={{
        fontSize: '12px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '6px'
      }}>
        🔗 Editar Variable
      </div>
      
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        style={inputStyle}
        placeholder="nombre.de.variable"
      />
      
      <div style={helpStyle}>
        {isValid ? (
          '💡 Usa notación de punto (ej: user.name)'
        ) : (
          '❌ Nombre inválido. Debe empezar con letra y contener solo letras, números, puntos y guiones bajos'
        )}
      </div>
      
      <div style={{
        fontSize: '10px',
        color: '#9ca3af',
        marginTop: '6px'
      }}>
        Enter para guardar • Esc para cancelar
      </div>
    </div>
  );
};

export default VariableEditor;