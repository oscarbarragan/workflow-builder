// src/components/layoutDesigner/PageManager/PageFlow/PageFlowConditionsTab.jsx - CON START PAGE
import React, { useState } from 'react';

// ✅ CAMBIAR ESTAS RUTAS (agregar un nivel más):
import { OPERATORS, CONDITION_TEMPLATES, CONDITION_TYPES } from "../../utils/pageflow.constants.js";
import { textBoxUtils } from '../../components/TextBox/textbox.utils.js';

// ✅ ESTA RUTA ESTÁ CORRECTA (mismo directorio):
import MonacoConditionWrapper from './MonacoConditionWrapper.jsx';

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
  // ✅ Estados para manejo de scripts
  const [scriptValidation, setScriptValidation] = useState({});
  const [showVariableList, setShowVariableList] = useState({});

  // ✅ ACTUALIZADO: Obtener lista de páginas para página de inicio
  const getStartPageOptions = () => {
    return pages.map((page, index) => ({
      value: index,
      label: `${index + 1}. ${page.name}`,
      id: page.id
    }));
  };

  // ✅ Obtener lista de variables disponibles
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

  // ✅ Manejar validación del Monaco Editor
  const handleMonacoValidation = (validation, conditionIndex) => {
    setScriptValidation(prev => ({
      ...prev,
      [conditionIndex]: validation
    }));
  };

  // ✅ Manejar prueba del script
  const handleScriptTest = (script, result, conditionIndex) => {
    console.log(`🧪 Script test for condition ${conditionIndex}:`, { script, result });
    // El wrapper ya maneja la visualización del resultado
  };

  // ✅ Toggle lista de variables para scripts simples
  const toggleVariableList = (conditionIndex) => {
    setShowVariableList(prev => ({
      ...prev,
      [conditionIndex]: !prev[conditionIndex]
    }));
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

      {/* ✅ Información sobre variables disponibles */}
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
          • <strong>Scripts avanzados con Monaco Editor VS Code</strong> para lógica compleja
          <br />
          • Autocompletado inteligente y validación en tiempo real
          <br />
          • <strong>🏁 Cada condición determina la página de inicio del documento</strong>
        </div>
        
        {/* Variables más comunes */}
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
                {/* Indicador de tipo mejorado */}
                <span style={{
                  marginLeft: '8px',
                  padding: '2px 6px',
                  fontSize: '10px',
                  borderRadius: '3px',
                  background: condition.type === 'script' ? '#fef3c7' : '#e0f2fe',
                  color: condition.type === 'script' ? '#d97706' : '#0369a1',
                  fontWeight: '500'
                }}>
                  {condition.type === 'script' ? '📜 Monaco Editor' : '🔗 Variable Simple'}
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

            {/* Selector de tipo de condición */}
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
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  🔗 Variable Simple
                  <span style={{ fontSize: '10px', opacity: 0.7 }}>
                    (Fácil)
                  </span>
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
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  📜 Monaco Editor
                  <span style={{ fontSize: '10px', opacity: 0.7 }}>
                    (VS Code)
                  </span>
                </button>
              </div>
            </div>

            {/* Configuración según tipo */}
            {condition.type === 'script' ? (
              // ✅ NUEVO: Monaco Editor Wrapper (reutiliza tu editor existente)
              <div style={{ marginBottom: '16px' }}>
                <MonacoConditionWrapper
                  value={condition.script || ''}
                  onChange={(script) => updateFlowConfig(`conditional.conditions.${index}.script`, script)}
                  onValidationChange={(validation) => handleMonacoValidation(validation, index)}
                  onTest={(script, result) => handleScriptTest(script, result, index)}
                  availableVariables={availableVariables}
                  height="300px"
                />
              </div>
            ) : (
              // Configuración de variable simple (modo original)
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Variable */}
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
                  
                  {/* Mostrar valor actual de la variable seleccionada */}
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
                  
                  {/* Botón para ver variables (modo simple) */}
                  <button
                    onClick={() => toggleVariableList(index)}
                    style={{
                      marginTop: '6px',
                      padding: '4px 8px',
                      border: '1px solid #3b82f6',
                      borderRadius: '4px',
                      background: showVariableList[index] ? '#eff6ff' : 'white',
                      color: '#3b82f6',
                      fontSize: '10px',
                      cursor: 'pointer',
                      fontWeight: '500'
                    }}
                  >
                    {showVariableList[index] ? '🔼 Ocultar' : '🔽 Ver'} Variables ({getVariableOptions().length})
                  </button>
                  
                  {/* Lista de variables simple */}
                  {showVariableList[index] && (
                    <div style={{
                      marginTop: '8px',
                      maxHeight: '150px',
                      overflowY: 'auto',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      background: 'white'
                    }}>
                      {getVariableOptions().map(variable => (
                        <button
                          key={variable.value}
                          onClick={() => {
                            updateFlowConfig(`conditional.conditions.${index}.variable`, variable.value);
                            toggleVariableList(index);
                          }}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            border: 'none',
                            background: 'white',
                            textAlign: 'left',
                            cursor: 'pointer',
                            borderBottom: '1px solid #f3f4f6',
                            fontSize: '10px'
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.background = '#f3f4f6';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.background = 'white';
                          }}
                        >
                          <div style={{ 
                            fontSize: '9px', 
                            color: '#6b7280',
                            marginTop: '1px'
                          }}>
                            {variable.type} - {variable.displayValue.length > 40 
                              ? variable.displayValue.substring(0, 40) + '...' 
                              : variable.displayValue}
                          </div>
                        </button>
                      ))}
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
                  
                  {/* Ayuda contextual según el operador */}
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

                {/* ✅ ACTUALIZADO: Página de inicio en lugar de página objetivo */}
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
                    🏁 Página de Inicio (si se cumple)
                  </label>
                  <select
                    value={condition.startPageIndex ?? ''}
                    onChange={(e) => {
                      const pageIndex = e.target.value ? parseInt(e.target.value) : null;
                      updateFlowConfig(`conditional.conditions.${index}.startPageIndex`, pageIndex);
                      if (pageIndex !== null) {
                        updateFlowConfig(`conditional.conditions.${index}.startPageId`, pages[pageIndex]?.id);
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
                    <option value="">Seleccionar página de inicio...</option>
                    {getStartPageOptions().map(page => (
                      <option key={page.value} value={page.value}>
                        {page.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* ✅ ACTUALIZADO: Página de inicio para scripts (fuera del grid) */}
            {condition.type === 'script' && (
              <div style={{ marginTop: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
                  🏁 Página de Inicio (si el script retorna true)
                </label>
                <select
                  value={condition.startPageIndex ?? ''}
                  onChange={(e) => {
                    const pageIndex = e.target.value ? parseInt(e.target.value) : null;
                    updateFlowConfig(`conditional.conditions.${index}.startPageIndex`, pageIndex);
                    if (pageIndex !== null) {
                      updateFlowConfig(`conditional.conditions.${index}.startPageId`, pages[pageIndex]?.id);
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
                  <option value="">Seleccionar página de inicio...</option>
                  {getStartPageOptions().map(page => (
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

            {/* ✅ ACTUALIZADO: Vista previa de la condición con página de inicio */}
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
                      Si <strong>script Monaco</strong> retorna <strong>true</strong> → 🏁 Iniciar en página {(condition.startPageIndex ?? 0) + 1}
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
                      } → 🏁 Iniciar en página {(condition.startPageIndex ?? 0) + 1}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Mostrar estado de validación para scripts */}
            {condition.type === 'script' && scriptValidation[index] && (
              <div style={{ marginTop: '8px' }}>
                {scriptValidation[index].isValid ? (
                  <div style={{
                    padding: '6px 8px',
                    background: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: '#15803d'
                  }}>
                    ✅ Script válido y listo para usar
                  </div>
                ) : (
                  <div style={{
                    padding: '6px 8px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: '#dc2626'
                  }}>
                    ❌ Script con errores - revisa el editor Monaco arriba
                  </div>
                )}
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

      {/* ✅ ACTUALIZADO: Página por defecto como página de inicio */}
      <div style={{
        padding: '16px',
        background: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
          🏁 Página de Inicio por Defecto
        </h4>
        <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>
          Se iniciará en esta página si ninguna condición se cumple
        </div>
        <select
          value={flowConfig.conditional?.defaultStartPageIndex ?? ''}
          onChange={(e) => {
            const pageIndex = e.target.value ? parseInt(e.target.value) : null;
            updateFlowConfig('conditional.defaultStartPageIndex', pageIndex);
            if (pageIndex !== null) {
              updateFlowConfig('conditional.defaultStartPageId', pages[pageIndex]?.id);
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
          {getStartPageOptions().map(page => (
            <option key={page.value} value={page.value}>
              {page.label}
            </option>
          ))}
        </select>
      </div>

      {/* ✅ ACTUALIZADO: Resumen de condiciones con páginas de inicio */}
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
                      <span style={{
                        background: '#fef3c7',
                        padding: '1px 4px',
                        borderRadius: '2px',
                        fontSize: '10px',
                        marginRight: '4px'
                      }}>
                        MONACO
                      </span>
                      Script Monaco → 🏁 Iniciar en página {(condition.startPageIndex ?? 0) + 1}
                      {condition.script && (
                        <div style={{ fontSize: '10px', fontFamily: 'monospace', marginLeft: '20px', color: '#6b7280' }}>
                          {condition.script.substring(0, 60)}{condition.script.length > 60 ? '...' : ''}
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      <span style={{
                        background: '#e0f2fe',
                        padding: '1px 4px',
                        borderRadius: '2px',
                        fontSize: '10px',
                        marginRight: '4px'
                      }}>
                        VAR
                      </span>
                      {condition.variable || 'Sin variable'} {condition.operator} {condition.value || '(vacío)'} 
                      → 🏁 Iniciar en página {(condition.startPageIndex ?? 0) + 1}
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

      {/* Información sobre Monaco Editor vs Variables Simples */}
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
            ✨ Flujo de Páginas Condicional: Tu Editor Monaco Reutilizado
          </h4>
          <div style={{
            fontSize: '10px',
            background: '#fef3c7',
            color: '#92400e',
            padding: '2px 6px',
            borderRadius: '3px',
            border: '1px solid #fbbf24'
          }}>
            Igual que workflow
          </div>
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
            <div><strong>🔗 Variables Simples:</strong></div>
            <div>• Configuración visual rápida</div>
            <div>• Ideal para comparaciones básicas</div>
            <div>• Sin código necesario</div>
            <div>• <strong>🏁 Determina página de inicio</strong></div>
          </div>
          <div>
            <div><strong>📜 Monaco Editor:</strong></div>
            <div>• <strong>Reutiliza tu editor existente</strong></div>
            <div>• IntelliSense con tus variables</div>
            <div>• Validación en tiempo real</div>
            <div>• <strong>🏁 Lógica compleja para página inicial</strong></div>
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
            🏁 Concepto Clave - Página de Inicio:
          </div>
          <div style={{ fontSize: '10px', color: '#0369a1' }}>
            Las condiciones determinan en cuál página interna empezará el documento cuando se renderice.
            <strong> No navega entre páginas</strong> - simplemente decide el punto de partida del Page.
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageFlowConditionsTab;