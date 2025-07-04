// src/components/layoutDesigner/components/TextBox/TextBoxEditor.jsx
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { textBoxStyles } from './TextBox.styles';
import { textBoxUtils } from './textbox.utils';

const TextBoxEditor = ({
  initialValue,
  element,
  elementStyle,
  finalStyles,
  availableVariables,
  onFinish,
  onCancel
}) => {
  const [editValue, setEditValue] = useState(initialValue);
  const [showVariableMenu, setShowVariableMenu] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [variableMenuPosition, setVariableMenuPosition] = useState({ x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const textareaRef = useRef(null);
  const variableMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  // Variables filtradas
  const filteredVariables = useMemo(() => {
    if (!searchTerm.trim()) {
      return availableVariables;
    }
    
    const filtered = {};
    const searchLower = searchTerm.toLowerCase();
    
    Object.entries(availableVariables).forEach(([key, value]) => {
      if (key.toLowerCase().includes(searchLower)) {
        filtered[key] = value;
      }
    });
    
    return filtered;
  }, [availableVariables, searchTerm]);

  // Effects
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(cursorPosition, cursorPosition);
    }
  }, [cursorPosition]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (variableMenuRef.current && !variableMenuRef.current.contains(event.target)) {
        setShowVariableMenu(false);
      }
    };

    if (showVariableMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showVariableMenu]);

  // Event handlers
  const handleTextareaBlur = useCallback((e) => {
    if (showVariableMenu && variableMenuRef.current) {
      const clickedElement = e.relatedTarget;
      
      if (clickedElement && (
        variableMenuRef.current.contains(clickedElement) ||
        clickedElement === searchInputRef.current
      )) {
        setTimeout(() => {
          if (textareaRef.current && !document.activeElement.matches('input')) {
            textareaRef.current.focus();
          }
        }, 0);
        return;
      }
    }
    
    onFinish(editValue);
  }, [showVariableMenu, editValue, onFinish]);

  const insertVariable = useCallback((variableName) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const { newText, newCursorPosition } = textBoxUtils.insertVariableInText(
      editValue, 
      cursorPosition, 
      variableName
    );
    
    setShowVariableMenu(false);
    setEditValue(newText);
    
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPosition, newCursorPosition);
        setCursorPosition(newCursorPosition);
      }
    }, 10);
  }, [cursorPosition, editValue]);

  const showVariableMenuAt = useCallback((event) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const textareaRect = textarea.getBoundingClientRect();
    const currentCursorPos = textarea.selectionStart;
    
    setCursorPosition(currentCursorPos);
    
    const menuX = Math.min(
      event.clientX - textareaRect.left + 10,
      textareaRect.width - 320
    );
    
    const menuY = event.clientY - textareaRect.top + 25;
    
    setVariableMenuPosition({
      x: Math.max(0, menuX),
      y: Math.max(0, menuY)
    });
    
    setSearchTerm('');
    setShowVariableMenu(true);
    
    setTimeout(() => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, 100);
  }, []);

  const handleTextareaKeyDown = useCallback((e) => {
    if ((e.ctrlKey && e.code === 'Space') || (e.ctrlKey && e.key === ' ')) {
      e.preventDefault();
      e.stopPropagation();
      
      if (Object.keys(availableVariables).length === 0) {
        return;
      }
      
      const textarea = textareaRef.current;
      if (textarea) {
        const currentCursorPos = textarea.selectionStart;
        setCursorPosition(currentCursorPos);
        
        const syntheticEvent = {
          clientX: textarea.getBoundingClientRect().left + 50,
          clientY: textarea.getBoundingClientRect().top + 30,
          preventDefault: () => {},
          stopPropagation: () => {}
        };
        
        showVariableMenuAt(syntheticEvent);
      }
      return;
    }

    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      onFinish(editValue);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newText = editValue.substring(0, start) + '    ' + editValue.substring(end);
      setEditValue(newText);
      
      setTimeout(() => {
        e.target.setSelectionRange(start + 4, start + 4);
        setCursorPosition(start + 4);
      }, 0);
    }
  }, [editValue, availableVariables, onFinish, onCancel, showVariableMenuAt]);

  // Render variable menu
  const renderVariableMenu = () => {
    if (!showVariableMenu) return null;

    const totalVariables = Object.keys(availableVariables).length;
    const filteredCount = Object.keys(filteredVariables).length;

    const menuStyle = {
      position: 'absolute',
      left: variableMenuPosition.x,
      top: variableMenuPosition.y,
      background: 'white',
      border: '2px solid #3b82f6',
      borderRadius: '8px',
      boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.25)',
      zIndex: 3000,
      maxHeight: '300px',
      minWidth: '320px',
      maxWidth: '450px',
      display: 'flex',
      flexDirection: 'column'
    };

    return (
      <div 
        ref={variableMenuRef} 
        style={menuStyle}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con búsqueda */}
        <div style={{
          padding: '12px 16px 8px 16px',
          borderBottom: '1px solid #e5e7eb',
          background: '#f8fafc',
          borderRadius: '6px 6px 0 0'
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>
            📋 Variables insertables ({filteredCount}{filteredCount !== totalVariables ? ` de ${totalVariables}` : ''})
          </div>
          
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 Buscar variable..."
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '12px',
              outline: 'none',
              boxSizing: 'border-box'
            }}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              e.stopPropagation();
              
              if (e.key === 'Escape') {
                setSearchTerm('');
                if (textareaRef.current) {
                  textareaRef.current.focus();
                  setShowVariableMenu(false);
                }
              } else if (e.key === 'Enter') {
                const firstVariable = Object.keys(filteredVariables)[0];
                if (firstVariable) {
                  insertVariable(firstVariable);
                }
              }
            }}
          />
          
          <div style={{
            fontSize: '10px',
            color: '#6b7280',
            fontWeight: '400',
            marginTop: '4px'
          }}>
            Solo valores primitivos (string, number, boolean)
          </div>
        </div>

        {/* Lista de variables */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {Object.keys(filteredVariables).length === 0 ? (
            <div style={{
              padding: '20px',
              textAlign: 'center',
              color: '#9ca3af',
              fontSize: '12px'
            }}>
              {searchTerm ? (
                <>
                  🔍 No se encontraron variables con "{searchTerm}"
                  <br />
                  <button
                    onClick={() => setSearchTerm('')}
                    style={{
                      marginTop: '8px',
                      padding: '4px 8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      background: 'white',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    Limpiar búsqueda
                  </button>
                </>
              ) : (
                'No hay variables insertables disponibles'
              )}
            </div>
          ) : (
            Object.entries(filteredVariables).map(([key, value]) => {
              let displayValue, typeInfo;
              
              if (typeof value === 'object' && value !== null && value.displayValue !== undefined) {
                displayValue = String(value.displayValue || '');
                typeInfo = value.type || 'unknown';
              } else {
                displayValue = typeof value === 'string' ? value : String(value || '');
                typeInfo = typeof value;
              }
              
              const truncatedValue = displayValue.length > 40 
                ? displayValue.substring(0, 40) + '...' 
                : displayValue;

              const isNestedPath = key.includes('.');
              const pathParts = key.split('.');
              const indentLevel = Math.max(0, pathParts.length - 1);

              return (
                <div
                  key={key}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    insertVariable(key);
                  }}
                  style={{
                    padding: '12px 16px',
                    paddingLeft: `${16 + (indentLevel * 12)}px`,
                    cursor: 'pointer',
                    borderBottom: '1px solid #f3f4f6',
                    fontSize: '13px',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    borderLeft: isNestedPath ? '3px solid #e5e7eb' : 'none'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#eff6ff';
                    e.currentTarget.style.borderLeft = isNestedPath ? '3px solid #3b82f6' : '3px solid #3b82f6';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderLeft = isNestedPath ? '3px solid #e5e7eb' : 'none';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    <div style={{
                      fontWeight: '600',
                      color: '#374151',
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span style={{ 
                        color: typeInfo === 'string' ? '#16a34a' : 
                              typeInfo === 'number' ? '#3b82f6' : 
                              typeInfo === 'boolean' ? '#f59e0b' : '#6b7280',
                        fontSize: '10px'
                      }}>
                        {typeInfo === 'string' ? '📝' : 
                         typeInfo === 'number' ? '🔢' : 
                         typeInfo === 'boolean' ? '✅' : 
                         isNestedPath ? '└' : '🔗'}
                      </span>
                      
                      <span style={{ color: '#374151' }}>
                        {key.split('.').map((part, index, array) => (
                          <span key={index}>
                            {index > 0 && <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>.</span>}
                            <span style={{ 
                              color: index === array.length - 1 ? '#374151' : '#6b7280',
                              fontWeight: index === array.length - 1 ? '600' : '400'
                            }}>
                              {part}
                            </span>
                          </span>
                        ))}
                      </span>
                    </div>
                    
                    <span style={{
                      fontSize: '9px',
                      padding: '2px 6px',
                      background: typeInfo === 'string' ? '#dcfce7' : 
                                typeInfo === 'number' ? '#dbeafe' : 
                                typeInfo === 'boolean' ? '#fef3c7' : '#f3f4f6',
                      color: typeInfo === 'string' ? '#16a34a' : 
                             typeInfo === 'number' ? '#2563eb' : 
                             typeInfo === 'boolean' ? '#d97706' : '#6b7280',
                      borderRadius: '4px',
                      fontWeight: '500',
                      border: '1px solid',
                      borderColor: typeInfo === 'string' ? '#16a34a' : 
                                  typeInfo === 'number' ? '#2563eb' : 
                                  typeInfo === 'boolean' ? '#d97706' : '#6b7280'
                    }}>
                      {String(typeInfo).toUpperCase()}
                    </span>
                  </div>
                  
                  <div style={{
                    color: '#6b7280',
                    fontSize: '11px',
                    lineHeight: '1.3',
                    paddingLeft: '18px',
                    fontStyle: 'italic'
                  }}>
                    {truncatedValue || 'Sin valor'}
                  </div>
                  
                  <div style={{
                    color: '#3b82f6',
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    paddingLeft: '18px',
                    background: '#f8fafc',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    marginTop: '2px'
                  }}>
                    {`{{${key}}}`}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '8px 16px',
          fontSize: '10px',
          color: '#9ca3af',
          fontStyle: 'italic',
          textAlign: 'center',
          borderTop: '1px solid #f1f5f9',
          background: '#fafafa'
        }}>
          💡 Enter para insertar primera variable • Esc para limpiar búsqueda
          <br />
          🚫 Objetos y arrays completos están filtrados
        </div>
      </div>
    );
  };

  return (
    <>
      <textarea
        ref={textareaRef}
        value={editValue}
        onChange={(e) => {
          const newValue = e.target.value;
          const cursorPos = e.target.selectionStart;
          setEditValue(newValue);
          setCursorPosition(cursorPos);
        }}
        onBlur={handleTextareaBlur}
        onKeyDown={handleTextareaKeyDown}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation();
          const cursorPos = e.target.selectionStart;
          setCursorPosition(cursorPos);
        }}
        onSelect={(e) => {
          const cursorPos = e.target.selectionStart;
          setCursorPosition(cursorPos);
        }}
        style={textBoxStyles.textarea(finalStyles, element)}
        placeholder="Escribe tu texto aquí... (Ctrl+Espacio para variables con notación de punto)"
        autoFocus
      />
      
      {renderVariableMenu()}
    </>
  );
};

export default TextBoxEditor;