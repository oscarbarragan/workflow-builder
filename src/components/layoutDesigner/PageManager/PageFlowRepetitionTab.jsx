// src/components/layoutDesigner/PageManager/PageFlowRepetitionTab.jsx
import React from 'react';

const PageFlowRepetitionTab = ({ 
  flowConfig, 
  updateFlowConfig, 
  errors,
  availableVariables
}) => {

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
      <h3 style={{ fontSize: '16px', fontWeight: '600' }}>
        🔁 Configuración de Repetición
      </h3>

      {/* Origen de datos */}
      <div style={{
        padding: '20px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        background: '#fafafa'
      }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>
          📊 Origen de Datos
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
              Variable de Array
            </label>
            <select
              value={flowConfig.repeated?.dataSource?.variableName || ''}
              onChange={(e) => updateFlowConfig('repeated.dataSource.variableName', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: errors.dataSource ? '1px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '13px'
              }}
            >
              <option value="">Seleccionar variable...</option>
              {getVariableOptions().filter(v => v.type === 'array').map(variable => (
                <option key={variable.value} value={variable.value}>
                  {variable.label} (array)
                </option>
              ))}
            </select>
            {errors.dataSource && (
              <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>
                {errors.dataSource}
              </div>
            )}
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
              Máximo de Iteraciones
            </label>
            <input
              type="number"
              value={flowConfig.repeated?.maxIterations || 100}
              onChange={(e) => updateFlowConfig('repeated.maxIterations', parseInt(e.target.value) || 100)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
              min="1"
              max="1000"
            />
          </div>
        </div>
      </div>

      {/* Variables de iteración */}
      <div style={{
        padding: '20px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        background: '#fafafa'
      }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '16px' }}>
          🔗 Variables de Iteración
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
              Nombre Variable del Elemento
            </label>
            <input
              type="text"
              value={flowConfig.repeated?.itemVariableName || 'item'}
              onChange={(e) => updateFlowConfig('repeated.itemVariableName', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
              placeholder="item"
            />
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
              Variable que contendrá cada elemento del array
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>
              Nombre Variable del Índice
            </label>
            <input
              type="text"
              value={flowConfig.repeated?.indexVariableName || 'index'}
              onChange={(e) => updateFlowConfig('repeated.indexVariableName', e.target.value)}
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
              placeholder="index"
            />
            <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '4px' }}>
              Variable que contendrá el índice de iteración (0, 1, 2...)
            </div>
          </div>
        </div>
      </div>

      {/* Ejemplo de uso */}
      <div style={{
        padding: '16px',
        background: '#f0fdf4',
        borderRadius: '8px',
        border: '1px solid #bbf7d0'
      }}>
        <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#166534', marginBottom: '8px' }}>
          💡 Ejemplo de Uso
        </h4>
        <div style={{ fontSize: '12px', color: '#166534', lineHeight: '1.4' }}>
          Si tienes un array <code>factura.lineas</code> con elementos como <code>[{'{producto: "Item A", cantidad: 2}'}, ...]</code>,
          puedes usar <code>item.producto</code> y <code>item.cantidad</code> en los elementos de esta página.
          La variable <code>index</code> contendrá 0, 1, 2... para cada iteración.
        </div>
      </div>
    </div>
  );
};

export default PageFlowRepetitionTab;