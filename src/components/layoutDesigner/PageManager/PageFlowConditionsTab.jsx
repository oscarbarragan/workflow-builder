// src/components/layoutDesigner/PageManager/PageFlowConditionsTab.jsx - CON SOPORTE PARA SCRIPTS
import React, { useState } from 'react';
import { OPERATORS, CONDITION_TEMPLATES, CONDITION_TYPES } from '../utils/pageFlow.constants.js';
import { textBoxUtils } from '../components/TextBox/textbox.utils.js';
import ScriptEngine from '../utils/scriptEngine.js'; // ✅ NUEVO

const PageFlowConditionsTab = ({ 
  flowConfig, 
  updateFlowConfig, 
  errors,
  pages,
  availableVariables,
  addCondition,
  removeCondition,
  applyConditionTemplate
}) => {
  // ✅ NUEVO: Estados para editor de scripts
  const [expandedScripts, setExpandedScripts] = useState({});
  const [scriptValidation, setScriptValidation] = useState({});
  const [showVariableList, setShowVariableList] = useState({});
  const [scriptCursorPosition, setScriptCursorPosition] = useState({});
  
  // ✅ NUEVO: Motor de scripts
  const scriptEngine = React.useMemo(() => {
    return new ScriptEngine(availableVariables);
  }, [availableVariables]);

  // Obtener lista de páginas para seleccionar
  const getPageOptions = () => {
    return pages.map((page, index) => ({
      value: index,
      label: `${index + 1}. ${page.name}`,
      id: page.id
    }));
  };

  // ✅ CORREGIDO: Obtener lista de variables disponibles usando el mismo procesamiento que TextBox
  const getVariableOptions = () => {
    const variables = [];
    
    // Si no hay variables disponibles, usar datos de ejemplo
    let dataToProcess = availableVariables;
    if (!availableVariables || Object.keys(availableVariables).length === 0) {
      dataToProcess = {
        user_name: "Juan Pérez",
        user_age: 30,
        user: {
          id: 123,
          email: "juan@email.com",
          active: true
        },
        orders: [
          { id: 1, total: 100.50 },
          { id: 2, total: 250.75 }
        ],
        company: {
          name: "Mi Empresa",
          address: {
            city: "Bogotá"
          }
        }
      };
    }
    
    // ✅ Usar el mismo procesamiento que TextBox
    const processedVariables = textBoxUtils.processVariablesWithDotNotation(dataToProcess);
    
    // Convertir a formato para select
    Object.entries(processedVariables).forEach(([key, value]) => {
      variables.push({
        value: key,
        label: key,
        type: Array.isArray(value) ? 'array' : typeof value,
        displayValue: typeof value === 'object' && value !== null 
          ? JSON.stringify(value).substring(0, 50) + '...'
          : String(value)
      });
    });

    // Ordenar variables por nombre
    return variables.sort((a, b) => a.label.localeCompare(b.label));
  };

  // ✅ NUEVO: Validar script en tiempo real
  const validateScript = (script, conditionIndex) => {
    if (!script || !script.trim()) {
      setScriptValidation(prev => ({
        ...prev,
        [conditionIndex]: null
      }));
      return;
    }

    const validation = scriptEngine.validateScript(script);
    setScriptValidation(prev => ({
      ...prev,
      [conditionIndex]: validation
    }));
  };

  // ✅ NUEVO: Probar script
  const testScript = (script, conditionIndex) => {
    const result = scriptEngine.evaluateScript(script);
    console.log('🧪 Script test result:', result);
    
    // Mostrar resultado al usuario
    alert(
      `Resultado del script: ${result.success ? result.result : 'Error'}\n` +
      (result.error ? `Error: ${result.error}` : `Resultado: ${result.result}`)
    );
  };

  // ✅ NUEVO: Toggle expanded script editor
  const toggleScriptEditor = (conditionIndex) => {
    setExpandedScripts(prev => ({
      ...prev,
      [conditionIndex]: !prev[conditionIndex]
    }));
  };

  // ✅ NUEVO: Insertar variable en script
  const insertVariableInScript = (conditionIndex, variableName) => {
    const condition = flowConfig.conditional?.conditions?.[conditionIndex];
    if (!condition) return;

    const textareaId = `script-textarea-${conditionIndex}`;
    const textarea = document.getElementById(textareaId);
    
    if (textarea) {
      const cursorPos = scriptCursorPosition[conditionIndex] || 0;
      const currentScript = condition.script || '';
      
      const beforeCursor = currentScript.substring(0, cursorPos);
      const afterCursor = currentScript.substring(cursorPos);
      const newScript = beforeCursor + variableName + afterCursor;
      
      updateFlowConfig(`conditional.conditions.${conditionIndex}.script`, newScript);
      
      // Mover cursor después de la variable insertada
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = cursorPos + variableName.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
        setScriptCursorPosition(prev => ({
          ...prev,
          [conditionIndex]: newCursorPos
        }));
      }, 0);
    }
  };

  // ✅ NUEVO: Manejar teclas en textarea
  const handleScriptKeyDown = (e, conditionIndex) => {
    // Ctrl + Espacio para mostrar lista de variables
    if ((e.ctrlKey || e.metaKey) && e.code === 'Space') {
      e.preventDefault();
      setShowVariableList(prev => ({
        ...prev,
        [conditionIndex]: !prev[conditionIndex]
      }));
    }
    
    // Actualizar posición del cursor
    setTimeout(() => {
      setScriptCursorPosition(prev => ({
        ...prev,
        [conditionIndex]: e.target.selectionStart
      }));
    }, 0);
  };

  // ✅ NUEVO: Obtener variables procesadas para scripts
  const getProcessedVariablesForScript = () => {
    const variables = getVariableOptions();
    const functions = [
      { name: 'isEmpty(valor)', description: 'Verificar si está vacío', example: 'isEmpty(user_name)' },
      { name: 'isNotEmpty(valor)', description: 'Verificar si no está vacío', example: 'isNotEmpty(orders)' },
      { name: 'contains(texto, buscar)', description: 'Verificar si contiene texto', example: 'contains(user_name, "Oscar")' },
      { name: 'length(valor)', description: 'Obtener longitud', example: 'length(orders) > 0' },
      { name: 'Math.max(a, b)', description: 'Máximo de dos números', example: 'Math.max(user_age, 18)' },
      { name: 'Math.min(a, b)', description: 'Mínimo de dos números', example: 'Math.min(price, 100)' },
      { name: 'Array.isArray(valor)', description: 'Verificar si es array', example: 'Array.isArray(orders)' }
    ];
    
    return { variables, functions };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
          📋 Condiciones de la Página
        </h3>
        <button
          onClick={addCondition}
          style={{
            padding: '8px 16px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          ➕ Agregar Condición
        </button>
      </div>

      {/* ✅ MEJORADO: Información sobre variables disponibles */}
      <div style={{
        padding: '16px',
        background: '#f0fdf4',
        borderRadius: '8px',
        border: '1px solid #bbf7d0'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '8px' 
        }}>
          <div style={{ fontSize: '12px', color: '#15803d', fontWeight: '600' }}>
            📊 Variables Detectadas: {getVariableOptions().length} total
          </div>
          <button
            onClick={() => {
              const variablesList = getVariableOptions()
                .map(v => `${v.label} (${v.type}): ${v.displayValue}`)
                .join('\n');
              alert(`Variables disponibles:\n\n${variablesList}`);
            }}
            style={{
              padding: '4px 8px',
              border: '1px solid #15803d',
              borderRadius: '4px',
              background: 'white',
              color: '#15803d',
              fontSize: '10px',
              cursor: 'pointer'
            }}
          >
            👁️ Ver Todas
          </button>
        </div>
        
        <div style={{ fontSize: '11px', color: '#15803d', marginBottom: '8px' }}>
          • Variables simples para comparaciones básicas
          <br />
          • Scripts personalizados para lógica compleja
          <br />
          • <strong>Ctrl+Espacio</strong> en scripts para autocompletado
        </div>
        
        {/* ✅ NUEVO: Ejemplos rápidos de variables más comunes */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
          gap: '6px',
          marginTop: '8px'
        }}>
          {getVariableOptions().slice(0, 6).map(variable => (
            <div
              key={variable.value}
              style={{
                padding: '4px 6px',
                background: 'white',
                border: '1px solid #bbf7d0',
                borderRadius: '3px',
                fontSize: '9px'
              }}
            >
              <div style={{ fontWeight: '600', fontFamily: 'monospace' }}>
                {variable.label}
              </div>
              <div style={{ color: '#6b7280' }}>
                {variable.displayValue.length > 15 
                  ? variable.displayValue.substring(0, 15) + '...' 
                  : variable.displayValue}
              </div>
            </div>
          ))}
          {getVariableOptions().length > 6 && (
            <div style={{
              padding: '4px 6px',
              background: '#e5e7eb',
              borderRadius: '3px',
              fontSize: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280',
              fontWeight: '500'
            }}>
              +{getVariableOptions().length - 6} más...
            </div>
          )}
        </div>
      </div>

      {errors.conditions && (
        <div style={{
          padding: '12px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '6px',
          color: '#dc2626',
          fontSize: '13px'
        }}>
          {errors.conditions}
        </div>
      )}

      {/* Lista de condiciones */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {flowConfig.conditional?.conditions?.map((condition, index) => (
          <div key={condition.id || index} style={{
            padding: '20px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            background: '#fafafa'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>
                Condición {index + 1}
                {/* ✅ NUEVO: Indicador de tipo */}
                <span style={{
                  marginLeft: '8px',
                  padding: '2px 6px',
                  fontSize: '10px',
                  borderRadius: '3px',
                  background: condition.type === 'script' ? '#fef3c7' : '#e0f2fe',
                  color: condition.type === 'script' ? '#d97706' : '#0369a1',
                  fontWeight: '500'
                }}>
                  {condition.type === 'script' ? '📜 Script' : '🔗 Variable'}
                </span>
              </h4>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value=""
                  onChange={(e) => e.target.value && applyConditionTemplate(e.target.value, index)}
                  style={{
                    padding: '4px 8px',
                    fontSize: '11px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px'
                  }}
                >
                  <option value="">📋 Plantillas</option>
                  {Object.keys(CONDITION_TEMPLATES).map(template => (
                    <option key={template} value={template}>{template}</option>
                  ))}
                </select>
                <button
                  onClick={() => removeCondition(index)}
                  style={{
                    padding: '4px 8px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '11px',
                    cursor: 'pointer'
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>

            {/* ✅ NUEVO: Selector de tipo de condición */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '8px' }}>
                Tipo de Condición
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => updateFlowConfig(`conditional.conditions.${index}.type`, 'variable')}
                  style={{
                    padding: '8px 16px',
                    border: condition.type !== 'script' ? '2px solid #3b82f6' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    background: condition.type !== 'script' ? '#eff6ff' : 'white',
                    color: condition.type !== 'script' ? '#1e40af' : '#6b7280',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  🔗 Variable Simple
                </button>
                <button
                  onClick={() => updateFlowConfig(`conditional.conditions.${index}.type`, 'script')}
                  style={{
                    padding: '8px 16px',
                    border: condition.type === 'script' ? '2px solid #f59e0b' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    background: condition.type === 'script' ? '#fef3c7' : 'white',
                    color: condition.type === 'script' ? '#d97706' : '#6b7280',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  📜 Script Personalizado
                </button>
              </div>
            </div>

            {/* ✅ Configuración según tipo */}
            {condition.type === 'script' ? (
              // ✅ NUEVO: Editor de scripts
              <div style={{
                padding: '16px',
                background: '#fef3c7',
                borderRadius: '8px',
                border: '2px solid #f59e0b'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <h5 style={{ fontSize: '13px', fontWeight: '600', color: '#d97706', margin: 0 }}>
                    📜 Script Personalizado
                  </h5>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => toggleScriptEditor(index)}
                      style={{
                        padding: '4px 8px',
                        border: '1px solid #d97706',
                        borderRadius: '4px',
                        background: 'white',
                        color: '#d97706',
                        fontSize: '10px',
                        cursor: 'pointer'
                      }}
                    >
                      {expandedScripts[index] ? '🔼 Contraer' : '🔽 Expandir'}
                    </button>
                    <button
                      onClick={() => testScript(condition.script, index)}
                      disabled={!condition.script}
                      style={{
                        padding: '4px 8px',
                        border: '1px solid #16a34a',
                        borderRadius: '4px',
                        background: condition.script ? '#16a34a' : '#9ca3af',
                        color: 'white',
                        fontSize: '10px',
                        cursor: condition.script ? 'pointer' : 'not-allowed'
                      }}
                    >
                      🧪 Probar
                    </button>
                  </div>
                </div>
                
                <textarea
                  id={`script-textarea-${index}`}
                  value={condition.script || ''}
                  onChange={(e) => {
                    updateFlowConfig(`conditional.conditions.${index}.script`, e.target.value);
                    validateScript(e.target.value, index);
                  }}
                  onKeyDown={(e) => handleScriptKeyDown(e, index)}
                  onSelect={(e) => {
                    setScriptCursorPosition(prev => ({
                      ...prev,
                      [index]: e.target.selectionStart
                    }));
                  }}
                  placeholder={`// Presiona Ctrl+Espacio para ver variables disponibles
// Ejemplo: return user_age >= 18 && user_active === true;

return user_name === "Oscar";`}
                  style={{
                    width: '100%',
                    height: expandedScripts[index] ? '200px' : '100px',
                    padding: '12px',
                    border: scriptValidation[index]?.isValid === false ? '2px solid #ef4444' : '1px solid #d97706',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
                    boxSizing: 'border-box',
                    background: 'white',
                    resize: 'vertical'
                  }}
                />
                {/* ✅ NUEVO: Lista de variables disponibles */}
                {showVariableList[index] && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    maxHeight: '300px',
                    background: 'white',
                    border: '2px solid #d97706',
                    borderRadius: '6px',
                    boxShadow: '0 8px 25px -5px rgba(0, 0, 0, 0.25)',
                    zIndex: 1000,
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      display: 'flex',
                      borderBottom: '1px solid #fbbf24'
                    }}>
                      <div style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: '#fef3c7',
                        borderRight: '1px solid #fbbf24'
                      }}>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: '#d97706' }}>
                          🔗 Variables ({getVariableOptions().length})
                        </div>
                      </div>
                      <div style={{
                        flex: 1,
                        padding: '8px 12px',
                        background: '#fef3c7'
                      }}>
                        <div style={{ fontSize: '11px', fontWeight: '600', color: '#d97706' }}>
                          ⚙️ Funciones (7)
                        </div>
                      </div>
                      <button
                        onClick={() => setShowVariableList(prev => ({
                          ...prev,
                          [index]: false
                        }))}
                        style={{
                          padding: '4px 8px',
                          border: 'none',
                          background: '#d97706',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div style={{ display: 'flex', maxHeight: '250px' }}>
                      {/* Variables */}
                      <div style={{
                        flex: 1,
                        overflowY: 'auto',
                        borderRight: '1px solid #fbbf24'
                      }}>
                        {getVariableOptions().map(variable => (
                          <button
                            key={variable.value}
                            onClick={() => {
                              insertVariableInScript(index, variable.label);
                              setShowVariableList(prev => ({
                                ...prev,
                                [index]: false
                              }));
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: 'none',
                              background: 'white',
                              textAlign: 'left',
                              cursor: 'pointer',
                              borderBottom: '1px solid #f3f4f6',
                              fontSize: '11px'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = '#fef3c7';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'white';
                            }}
                          >
                            <div style={{ fontWeight: '600', fontFamily: 'monospace' }}>
                              {variable.label}
                            </div>
                            <div style={{ 
                              fontSize: '9px', 
                              color: '#6b7280',
                              marginTop: '2px'
                            }}>
                              {variable.type} - {variable.displayValue.length > 30 
                                ? variable.displayValue.substring(0, 30) + '...' 
                                : variable.displayValue}
                            </div>
                          </button>
                        ))}
                      </div>
                      
                      {/* Funciones */}
                      <div style={{
                        flex: 1,
                        overflowY: 'auto'
                      }}>
                        {getProcessedVariablesForScript().functions.map((func, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              insertVariableInScript(index, func.name);
                              setShowVariableList(prev => ({
                                ...prev,
                                [index]: false
                              }));
                            }}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: 'none',
                              background: 'white',
                              textAlign: 'left',
                              cursor: 'pointer',
                              borderBottom: '1px solid #f3f4f6',
                              fontSize: '11px'
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.background = '#fef3c7';
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.background = 'white';
                            }}
                          >
                            <div style={{ fontWeight: '600', fontFamily: 'monospace' }}>
                              {func.name}
                            </div>
                            <div style={{ 
                              fontSize: '9px', 
                              color: '#6b7280',
                              marginTop: '2px'
                            }}>
                              {func.description}
                            </div>
                            <div style={{ 
                              fontSize: '9px', 
                              color: '#8b5cf6',
                              marginTop: '1px',
                              fontFamily: 'monospace'
                            }}>
                              {func.example}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div style={{
                      padding: '6px 12px',
                      background: '#fef3c7',
                      borderTop: '1px solid #fbbf24',
                      fontSize: '9px',
                      color: '#d97706',
                      textAlign: 'center'
                    }}>
                      💡 Ctrl+Espacio para mostrar/ocultar • Click para insertar
                    </div>
                  </div>
                )}

                {/* ✅ NUEVO: Botón para mostrar variables */}
                <div style={{ 
                  marginTop: '8px', 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <button
                    onClick={() => setShowVariableList(prev => ({
                      ...prev,
                      [index]: !prev[index]
                    }))}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #d97706',
                      borderRadius: '4px',
                      background: showVariableList[index] ? '#fef3c7' : 'white',
                      color: '#d97706',
                      fontSize: '11px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    {showVariableList[index] ? '🔼 Ocultar Variables' : '🔽 Mostrar Variables'} ({getVariableOptions().length})
                  </button>
                  
                  <div style={{ fontSize: '10px', color: '#d97706' }}>
                    Cursor en posición: {scriptCursorPosition[index] || 0}
                  </div>
                </div>
                
                {/* ✅ Validación de script */}
                {scriptValidation[index] && (
                  <div style={{ marginTop: '8px' }}>
                    {!scriptValidation[index].isValid && (
                      <div style={{
                        padding: '8px',
                        background: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '4px',
                        marginBottom: '8px'
                      }}>
                        {scriptValidation[index].errors.map((error, i) => (
                          <div key={i} style={{ fontSize: '11px', color: '#dc2626' }}>
                            ❌ {error}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {scriptValidation[index].warnings?.length > 0 && (
                      <div style={{
                        padding: '8px',
                        background: '#fffbeb',
                        border: '1px solid #fbbf24',
                        borderRadius: '4px',
                        marginBottom: '8px'
                      }}>
                        {scriptValidation[index].warnings.map((warning, i) => (
                          <div key={i} style={{ fontSize: '11px', color: '#d97706' }}>
                            ⚠️ {warning}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {scriptValidation[index].isValid && (
                      <div style={{
                        padding: '6px 8px',
                        background: '#f0fdf4',
                        border: '1px solid #bbf7d0',
                        borderRadius: '4px',
                        fontSize: '11px',
                        color: '#15803d'
                      }}>
                        ✅ Script válido (Complejidad: {scriptValidation[index].complexity || 0})
                      </div>
                    )}
                  </div>
                )}

                {/* ✅ Ejemplos de scripts */}
                {expandedScripts[index] && (
                  <div style={{ marginTop: '12px' }}>
                    <h6 style={{ fontSize: '11px', fontWeight: '600', color: '#d97706', marginBottom: '8px' }}>
                      💡 Ejemplos de Scripts:
                    </h6>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      {scriptEngine.getScriptExamples().slice(0, 4).map((example, i) => (
                        <button
                          key={i}
                          onClick={() => updateFlowConfig(`conditional.conditions.${index}.script`, example.script)}
                          style={{
                            padding: '8px',
                            border: '1px solid #d97706',
                            borderRadius: '4px',
                            background: 'white',
                            textAlign: 'left',
                            fontSize: '10px',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ fontWeight: '600', marginBottom: '2px' }}>{example.name}</div>
                          <div style={{ color: '#6b7280' }}>{example.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // ✅ Configuración de variable simple (modo original)
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* ✅ CORREGIDO: Variable con opciones procesadas */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
                    Variable
                  </label>
                  <select
                    value={condition.variable || ''}
                    onChange={(e) => updateFlowConfig(`conditional.conditions.${index}.variable`, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: errors[`condition_${index}`] ? '1px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '13px'
                    }}
                  >
                    <option value="">Seleccionar variable...</option>
                    {getVariableOptions().map(variable => (
                      <option key={variable.value} value={variable.value} title={variable.displayValue}>
                        {variable.label} ({variable.type})
                      </option>
                    ))}
                  </select>
                  
                  {/* ✅ Mostrar valor actual de la variable seleccionada */}
                  {condition.variable && (
                    <div style={{
                      marginTop: '4px',
                      padding: '4px 8px',
                      background: '#f8fafc',
                      borderRadius: '3px',
                      fontSize: '10px',
                      color: '#6b7280'
                    }}>
                      <strong>Valor actual:</strong> {
                        (() => {
                          const selectedVar = getVariableOptions().find(v => v.value === condition.variable);
                          return selectedVar ? selectedVar.displayValue : 'Variable no encontrada';
                        })()
                      }
                    </div>
                  )}
                </div>

                {/* Operador */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
                    Operador
                  </label>
                  <select
                    value={condition.operator || OPERATORS.EQUALS}
                    onChange={(e) => updateFlowConfig(`conditional.conditions.${index}.operator`, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '13px'
                    }}
                  >
                    {Object.entries(OPERATORS).map(([key, value]) => (
                      <option key={value} value={value}>
                        {value} ({key.replace(/_/g, ' ')})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Valor */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
                    Valor de Comparación
                  </label>
                  <input
                    type="text"
                    value={condition.value || ''}
                    onChange={(e) => updateFlowConfig(`conditional.conditions.${index}.value`, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Valor a comparar..."
                  />
                  
                  {/* ✅ Ayuda contextual según el operador */}
                  {condition.operator && (
                    <div style={{
                      marginTop: '4px',
                      padding: '4px 8px',
                      background: '#fffbeb',
                      borderRadius: '3px',
                      fontSize: '10px',
                      color: '#92400e'
                    }}>
                      {(() => {
                        switch (condition.operator) {
                          case OPERATORS.EQUALS:
                          case OPERATORS.NOT_EQUALS:
                            return '💡 Ej: "texto", 123, true/false';
                          case OPERATORS.GREATER_THAN:
                          case OPERATORS.LESS_THAN:
                          case OPERATORS.GREATER_EQUAL:
                          case OPERATORS.LESS_EQUAL:
                            return '💡 Ej: números como 100, 0, -5';
                          case OPERATORS.CONTAINS:
                          case OPERATORS.NOT_CONTAINS:
                            return '💡 Ej: texto que debe contener';
                          case OPERATORS.IS_EMPTY:
                          case OPERATORS.IS_NOT_EMPTY:
                            return '💡 Deje vacío - solo verifica si la variable está vacía';
                          default:
                            return '💡 Ingrese el valor según el operador seleccionado';
                        }
                      })()}
                    </div>
                  )}
                </div>

                {/* Página objetivo */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
                    Ir a Página
                  </label>
                  <select
                    value={condition.targetPageIndex ?? ''}
                    onChange={(e) => {
                      const pageIndex = e.target.value ? parseInt(e.target.value) : null;
                      updateFlowConfig(`conditional.conditions.${index}.targetPageIndex`, pageIndex);
                      if (pageIndex !== null) {
                        updateFlowConfig(`conditional.conditions.${index}.targetPageId`, pages[pageIndex]?.id);
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '13px'
                    }}
                  >
                    <option value="">Seleccionar página...</option>
                    {getPageOptions().map(page => (
                      <option key={page.value} value={page.value}>
                        {page.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* ✅ Página objetivo para scripts (fuera del grid) */}
            {condition.type === 'script' && (
              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
                  Ir a Página (si el script retorna true)
                </label>
                <select
                  value={condition.targetPageIndex ?? ''}
                  onChange={(e) => {
                    const pageIndex = e.target.value ? parseInt(e.target.value) : null;
                    updateFlowConfig(`conditional.conditions.${index}.targetPageIndex`, pageIndex);
                    if (pageIndex !== null) {
                      updateFlowConfig(`conditional.conditions.${index}.targetPageId`, pages[pageIndex]?.id);
                    }
                  }}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '13px'
                  }}
                >
                  <option value="">Seleccionar página...</option>
                  {getPageOptions().map(page => (
                    <option key={page.value} value={page.value}>
                      {page.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Descripción */}
            <div style={{ marginTop: '12px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
                Descripción (opcional)
              </label>
              <input
                type="text"
                value={condition.description || ''}
                onChange={(e) => updateFlowConfig(`conditional.conditions.${index}.description`, e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '13px',
                  boxSizing: 'border-box'
                }}
                placeholder="Descripción de la condición..."
              />
            </div>

            {/* ✅ Vista previa de la condición */}
            {((condition.type === 'script' && condition.script) || (condition.type !== 'script' && condition.variable && condition.operator)) && (
              <div style={{
                marginTop: '12px',
                padding: '8px 12px',
                background: '#f0f9ff',
                borderRadius: '4px',
                border: '1px solid #0ea5e9'
              }}>
                <div style={{ fontSize: '11px', color: '#0c4a6e', fontWeight: '600', marginBottom: '2px' }}>
                  📝 Vista Previa de Condición:
                </div>
                <div style={{ fontSize: '11px', color: '#0c4a6e', fontFamily: 'monospace' }}>
                  {condition.type === 'script' ? (
                    <>
                      Si <strong>script personalizado</strong> retorna <strong>true</strong> → Ir a página {(condition.targetPageIndex ?? 0) + 1}
                      <div style={{ marginTop: '4px', fontSize: '10px', color: '#6b7280' }}>
                        Script: {condition.script.substring(0, 50)}{condition.script.length > 50 ? '...' : ''}
                      </div>
                    </>
                  ) : (
                    <>
                      Si <strong>{condition.variable}</strong> {condition.operator} {
                        condition.operator === OPERATORS.IS_EMPTY || condition.operator === OPERATORS.IS_NOT_EMPTY 
                          ? '(vacío)' 
                          : `"${condition.value || '(sin valor)'}"`
                      } → Ir a página {(condition.targetPageIndex ?? 0) + 1}
                    </>
                  )}
                </div>
              </div>
            )}

            {errors[`condition_${index}`] && (
              <div style={{
                marginTop: '8px',
                color: '#ef4444',
                fontSize: '12px'
              }}>
                {errors[`condition_${index}`]}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Página por defecto */}
      <div style={{
        padding: '16px',
        background: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
          📄 Página por Defecto
        </h4>
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
          Se mostrará si ninguna condición se cumple
        </div>
        <select
          value={flowConfig.conditional?.defaultTargetPageIndex ?? ''}
          onChange={(e) => {
            const pageIndex = e.target.value ? parseInt(e.target.value) : null;
            updateFlowConfig('conditional.defaultTargetPageIndex', pageIndex);
            if (pageIndex !== null) {
              updateFlowConfig('conditional.defaultTargetPageId', pages[pageIndex]?.id);
            }
          }}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '13px'
          }}
        >
          <option value="">Sin página por defecto</option>
          {getPageOptions().map(page => (
            <option key={page.value} value={page.value}>
              {page.label}
            </option>
          ))}
        </select>
      </div>

      {/* ✅ Resumen de condiciones */}
      {flowConfig.conditional?.conditions?.length > 0 && (
        <div style={{
          padding: '16px',
          background: '#fefce8',
          borderRadius: '8px',
          border: '1px solid #fbbf24'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#92400e' }}>
            📊 Resumen de Condiciones ({flowConfig.conditional.conditions.length})
          </h4>
          <div style={{ fontSize: '12px', color: '#92400e' }}>
            {flowConfig.conditional.conditions.map((condition, index) => (
              <div key={index} style={{ marginBottom: '4px' }}>
                <strong>{index + 1}.</strong> {
                  condition.type === 'script' ? (
                    <>
                      Script personalizado → Página {(condition.targetPageIndex ?? 0) + 1}
                      {condition.script && (
                        <div style={{ fontSize: '10px', fontFamily: 'monospace', marginLeft: '20px', color: '#6b7280' }}>
                          {condition.script.substring(0, 60)}{condition.script.length > 60 ? '...' : ''}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {condition.variable || 'Sin variable'} {condition.operator} {condition.value || '(vacío)'} 
                      → Página {(condition.targetPageIndex ?? 0) + 1}
                    </>
                  )
                }
                {condition.description && (
                  <span style={{ fontStyle: 'italic', marginLeft: '8px' }}>
                    ({condition.description})
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ MEJORADO: Información sobre scripts con ejemplos prácticos */}
      <div style={{
        padding: '16px',
        background: '#f0f9ff',
        borderRadius: '8px',
        border: '1px solid #0ea5e9'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#0369a1', margin: 0 }}>
            💡 Guía Rápida para Scripts Personalizados
          </h4>
          <button
            onClick={() => {
              const examples = [
                'return user_age >= 18;',
                'return user_name === "Oscar";',
                'return isNotEmpty(orders) && length(orders) > 2;',
                'return user_age >= 18 && user_active === true;',
                'return contains(user_email, "@gmail.com");'
              ];
              alert(`Ejemplos de scripts:\n\n${examples.join('\n\n')}`);
            }}
            style={{
              padding: '4px 8px',
              border: '1px solid #0369a1',
              borderRadius: '4px',
              background: 'white',
              color: '#0369a1',
              fontSize: '10px',
              cursor: 'pointer'
            }}
          >
            📜 Ver Ejemplos
          </button>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '12px',
          fontSize: '11px', 
          color: '#0369a1', 
          lineHeight: '1.4' 
        }}>
          <div>
            <div><strong>📋 Básico:</strong></div>
            <div>• <code>Ctrl+Espacio</code> para autocompletado</div>
            <div>• <code>return</code> obligatorio</div>
            <div>• Resultado: <code>true</code> o <code>false</code></div>
            <div>• Variables: <code>user_name</code>, <code>user_age</code></div>
          </div>
          <div>
            <div><strong>⚙️ Funciones:</strong></div>
            <div>• <code>isEmpty(valor)</code></div>
            <div>• <code>isNotEmpty(valor)</code></div>
            <div>• <code>contains(texto, buscar)</code></div>
            <div>• <code>length(array)</code></div>
          </div>
        </div>
        
        <div style={{ 
          marginTop: '12px',
          padding: '8px',
          background: 'white',
          borderRadius: '4px',
          border: '1px solid #0ea5e9'
        }}>
          <div style={{ fontSize: '10px', color: '#0369a1', fontWeight: '600', marginBottom: '4px' }}>
            🚀 Ejemplo Rápido:
          </div>
          <code style={{ fontSize: '10px', color: '#1e40af', fontFamily: 'monospace' }}>
            return user_age &gt;= 18 &amp;&amp; isNotEmpty(user_name);
          </code>
        </div>
      </div>
    </div>
  );
};

export default PageFlowConditionsTab;