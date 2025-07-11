// src/components/layoutDesigner/PageManager/PageFlowConditionsTab.jsx
import React from 'react';
import { OPERATORS, CONDITION_TEMPLATES } from '../utils/pageFlow.constants.js';

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
  
  // Obtener lista de páginas para seleccionar
  const getPageOptions = () => {
    return pages.map((page, index) => ({
      value: index,
      label: `${index + 1}. ${page.name}`,
      id: page.id
    }));
  };

  // Obtener lista de variables disponibles
  const getVariableOptions = () => {
    const variables = [];
    
    const addVariables = (obj, prefix = '') => {
      Object.keys(obj).forEach(key => {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          addVariables(obj[key], fullKey);
        } else {
          variables.push({
            value: fullKey,
            label: fullKey,
            type: Array.isArray(obj[key]) ? 'array' : typeof obj[key]
          });
        }
      });
    };

    addVariables(availableVariables);
    return variables;
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
                    <option key={variable.value} value={variable.value}>
                      {variable.label} ({variable.type})
                    </option>
                  ))}
                </select>
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
    </div>
  );
};

export default PageFlowConditionsTab;