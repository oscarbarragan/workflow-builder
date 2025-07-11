// src/components/layoutDesigner/PageManager/PageFlowRepetitionTab.jsx - CORREGIDO
import React from 'react';
import { textBoxUtils } from '../components/TextBox/textbox.utils.js'; // ✅ IMPORTAR UTILS

const PageFlowRepetitionTab = ({ 
  flowConfig, 
  updateFlowConfig, 
  errors,
  availableVariables
}) => {

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
          { id: 1, product: "Producto A", total: 100.50 },
          { id: 2, product: "Producto B", total: 250.75 }
        ],
        company: {
          name: "Mi Empresa",
          employees: [
            { name: "Ana García", position: "Gerente" },
            { name: "Carlos López", position: "Desarrollador" }
          ],
          address: {
            city: "Bogotá"
          }
        },
        invoice: {
          lines: [
            { description: "Servicio A", quantity: 2, price: 50.00 },
            { description: "Servicio B", quantity: 1, price: 150.75 }
          ]
        }
      };
    }
    
    // ✅ Usar el mismo procesamiento que TextBox
    const processedVariables = textBoxUtils.processVariablesWithDotNotation(dataToProcess);
    
    // ✅ Separar arrays de primitivos
    const arrayVariables = [];
    const primitiveVariables = [];
    
    Object.entries(processedVariables).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        arrayVariables.push({
          value: key,
          label: key,
          type: 'array',
          displayValue: `Array con ${value.length} elemento${value.length !== 1 ? 's' : ''}`,
          actualValue: value
        });
      } else {
        primitiveVariables.push({
          value: key,
          label: key,
          type: typeof value,
          displayValue: String(value),
          actualValue: value
        });
      }
    });

    // Ordenar por nombre
    arrayVariables.sort((a, b) => a.label.localeCompare(b.label));
    primitiveVariables.sort((a, b) => a.label.localeCompare(b.label));

    return { arrayVariables, primitiveVariables, allVariables: [...arrayVariables, ...primitiveVariables] };
  };

  const { arrayVariables, primitiveVariables, allVariables } = getVariableOptions();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: '600' }}>
        🔁 Configuración de Repetición
      </h3>

      {/* ✅ Información sobre variables disponibles */}
      <div style={{
        padding: '12px',
        background: '#f0fdf4',
        borderRadius: '6px',
        border: '1px solid #bbf7d0'
      }}>
        <div style={{ fontSize: '12px', color: '#15803d', fontWeight: '600', marginBottom: '4px' }}>
          📊 Variables Detectadas: {allVariables.length} total
        </div>
        <div style={{ fontSize: '11px', color: '#15803d' }}>
          • Arrays disponibles: {arrayVariables.length}
          <br />
          • Variables primitivas: {primitiveVariables.length}
          <br />
          • Procesamiento automático con notación de punto
        </div>
      </div>

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
          {/* ✅ CORREGIDO: Variable de Array con opciones filtradas */}
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
              <option value="">Seleccionar array...</option>
              
              {/* Mostrar arrays disponibles */}
              {arrayVariables.length > 0 && (
                <optgroup label="📋 Arrays Disponibles">
                  {arrayVariables.map(variable => (
                    <option key={variable.value} value={variable.value} title={variable.displayValue}>
                      {variable.label} ({variable.displayValue})
                    </option>
                  ))}
                </optgroup>
              )}
              
              {/* Mostrar variables primitivas también (por si hay casos especiales) */}
              {primitiveVariables.length > 0 && (
                <optgroup label="🔗 Otras Variables">
                  {primitiveVariables.slice(0, 10).map(variable => (
                    <option key={variable.value} value={variable.value} title={variable.displayValue}>
                      {variable.label} ({variable.type})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
            
            {errors.dataSource && (
              <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>
                {errors.dataSource}
              </div>
            )}
            
            {/* ✅ Mostrar información del array seleccionado */}
            {flowConfig.repeated?.dataSource?.variableName && (
              <div style={{
                marginTop: '8px',
                padding: '8px 12px',
                background: '#f0f9ff',
                borderRadius: '4px',
                border: '1px solid #0ea5e9'
              }}>
                <div style={{ fontSize: '11px', color: '#0c4a6e', fontWeight: '600', marginBottom: '4px' }}>
                  📋 Información del Array Seleccionado:
                </div>
                {(() => {
                  const selectedVar = arrayVariables.find(v => v.value === flowConfig.repeated.dataSource.variableName);
                  if (selectedVar) {
                    return (
                      <div style={{ fontSize: '10px', color: '#0c4a6e' }}>
                        <div><strong>Nombre:</strong> {selectedVar.label}</div>
                        <div><strong>Tipo:</strong> {selectedVar.type}</div>
                        <div><strong>Elementos:</strong> {selectedVar.displayValue}</div>
                        {selectedVar.actualValue && selectedVar.actualValue.length > 0 && (
                          <div style={{ marginTop: '4px' }}>
                            <strong>Primer elemento:</strong>
                            <div style={{ 
                              fontFamily: 'monospace', 
                              background: '#ffffff', 
                              padding: '4px', 
                              borderRadius: '2px',
                              marginTop: '2px',
                              fontSize: '9px'
                            }}>
                              {JSON.stringify(selectedVar.actualValue[0], null, 2)}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  } else {
                    return (
                      <div style={{ fontSize: '10px', color: '#dc2626' }}>
                        ⚠️ Variable no encontrada o no es un array
                      </div>
                    );
                  }
                })()}
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
            <div style={{ fontSize: '10px', color: '#6b7280', marginTop: '4px' }}>
              Límite de seguridad para evitar bucles infinitos
            </div>
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

      {/* ✅ Ejemplo de uso dinámico */}
      {flowConfig.repeated?.dataSource?.variableName && (
        <div style={{
          padding: '16px',
          background: '#f0fdf4',
          borderRadius: '8px',
          border: '1px solid #bbf7d0'
        }}>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#166534', marginBottom: '8px' }}>
            💡 Ejemplo de Uso con Variables Seleccionadas
          </h4>
          <div style={{ fontSize: '12px', color: '#166534', lineHeight: '1.4' }}>
            {(() => {
              const arrayVar = flowConfig.repeated.dataSource.variableName;
              const itemVar = flowConfig.repeated.itemVariableName || 'item';
              const indexVar = flowConfig.repeated.indexVariableName || 'index';
              
              const selectedArray = arrayVariables.find(v => v.value === arrayVar);
              
              if (selectedArray && selectedArray.actualValue && selectedArray.actualValue.length > 0) {
                const firstElement = selectedArray.actualValue[0];
                const elementKeys = typeof firstElement === 'object' && firstElement !== null 
                  ? Object.keys(firstElement) 
                  : [];
                
                return (
                  <div>
                    <div style={{ marginBottom: '8px' }}>
                      <strong>Array seleccionado:</strong> <code>{arrayVar}</code> con {selectedArray.actualValue.length} elementos
                    </div>
                    
                    <div style={{ marginBottom: '8px' }}>
                      <strong>En cada iteración podrás usar:</strong>
                    </div>
                    
                    <div style={{ 
                      background: '#ffffff', 
                      padding: '8px', 
                      borderRadius: '4px',
                      fontFamily: 'monospace',
                      fontSize: '11px',
                      border: '1px solid #bbf7d0'
                    }}>
                      <div>• <code>{`{{${indexVar}}}`}</code> → Índice actual (0, 1, 2...)</div>
                      <div>• <code>{`{{${itemVar}}}`}</code> → Elemento completo</div>
                      
                      {elementKeys.length > 0 && (
                        <div style={{ marginTop: '4px' }}>
                          <div style={{ color: '#15803d', marginBottom: '2px' }}>Propiedades del elemento:</div>
                          {elementKeys.slice(0, 5).map(key => (
                            <div key={key}>
                              • <code>{`{{${itemVar}.${key}}}`}</code> → {
                                typeof firstElement[key] === 'string' 
                                  ? `"${firstElement[key]}"` 
                                  : String(firstElement[key])
                              }
                            </div>
                          ))}
                          {elementKeys.length > 5 && (
                            <div>• ... y {elementKeys.length - 5} propiedades más</div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div style={{ marginTop: '8px', fontSize: '11px', fontStyle: 'italic' }}>
                      💡 Estas variables estarán disponibles en los elementos de texto de esta página durante la repetición
                    </div>
                  </div>
                );
              } else {
                return (
                  <div>
                    <div><strong>Array:</strong> <code>{arrayVar}</code></div>
                    <div><strong>Variable del elemento:</strong> <code>{`{{${itemVar}}}`}</code></div>
                    <div><strong>Variable del índice:</strong> <code>{`{{${indexVar}}}`}</code></div>
                    <div style={{ marginTop: '4px', fontSize: '11px', fontStyle: 'italic' }}>
                      Puedes usar <code>{`{{${itemVar}.propiedad}}`}</code> para acceder a propiedades del elemento
                    </div>
                  </div>
                );
              }
            })()}
          </div>
        </div>
      )}

      {/* ✅ Información general cuando no hay array seleccionado */}
      {!flowConfig.repeated?.dataSource?.variableName && (
        <div style={{
          padding: '16px',
          background: '#fefce8',
          borderRadius: '8px',
          border: '1px solid #fbbf24'
        }}>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
            💡 ¿Cómo funciona la repetición de páginas?
          </h4>
          <div style={{ fontSize: '12px', color: '#92400e', lineHeight: '1.4' }}>
            <div style={{ marginBottom: '8px' }}>
              1. <strong>Selecciona un array</strong> de datos (ej: <code>orders</code>, <code>invoice.lines</code>)
            </div>
            <div style={{ marginBottom: '8px' }}>
              2. <strong>Define nombres de variables</strong> para el elemento actual e índice
            </div>
            <div style={{ marginBottom: '8px' }}>
              3. <strong>En los elementos de texto</strong> de esta página podrás usar:
              <div style={{ 
                marginTop: '4px', 
                padding: '4px 8px', 
                background: '#ffffff',
                borderRadius: '3px',
                fontFamily: 'monospace',
                fontSize: '11px'
              }}>
                • <code>{`{{item.propiedad}}`}</code> → Datos del elemento actual<br />
                • <code>{`{{index}}`}</code> → Número de iteración (0, 1, 2...)
              </div>
            </div>
            <div>
              4. <strong>La página se generará</strong> una vez por cada elemento del array
            </div>
          </div>
        </div>
      )}

      {/* ✅ Lista de arrays disponibles si hay muchos */}
      {arrayVariables.length > 0 && (
        <div style={{
          padding: '16px',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
            📋 Arrays Disponibles para Repetición ({arrayVariables.length})
          </h4>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '8px' 
          }}>
            {arrayVariables.map(variable => (
              <div 
                key={variable.value}
                style={{
                  padding: '8px',
                  background: variable.value === flowConfig.repeated?.dataSource?.variableName 
                    ? '#eff6ff' : 'white',
                  border: variable.value === flowConfig.repeated?.dataSource?.variableName 
                    ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
                onClick={() => updateFlowConfig('repeated.dataSource.variableName', variable.value)}
              >
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: '#374151',
                  fontFamily: 'monospace'
                }}>
                  {variable.label}
                </div>
                <div style={{ 
                  fontSize: '10px', 
                  color: '#6b7280',
                  marginTop: '2px'
                }}>
                  {variable.displayValue}
                </div>
                {variable.actualValue && variable.actualValue.length > 0 && 
                 typeof variable.actualValue[0] === 'object' && variable.actualValue[0] !== null && (
                  <div style={{ 
                    fontSize: '9px', 
                    color: '#8b5cf6',
                    marginTop: '4px',
                    fontFamily: 'monospace'
                  }}>
                    Propiedades: {Object.keys(variable.actualValue[0]).join(', ')}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ✅ Advertencia si no hay arrays */}
      {arrayVariables.length === 0 && (
        <div style={{
          padding: '16px',
          background: '#fef2f2',
          borderRadius: '8px',
          border: '1px solid #fecaca'
        }}>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#dc2626', marginBottom: '8px' }}>
            ⚠️ No se encontraron arrays en las variables disponibles
          </h4>
          <div style={{ fontSize: '12px', color: '#dc2626', lineHeight: '1.4' }}>
            Para usar repetición de páginas necesitas tener al menos un array en tus datos.
            <br />
            <strong>Ejemplos de estructura esperada:</strong>
            <div style={{ 
              marginTop: '8px', 
              padding: '8px', 
              background: '#ffffff',
              borderRadius: '4px',
              fontFamily: 'monospace',
              fontSize: '11px',
              color: '#374151'
            }}>
              {JSON.stringify({
                orders: [
                  { id: 1, product: "Producto A", total: 100 },
                  { id: 2, product: "Producto B", total: 200 }
                ],
                "invoice.lines": [
                  { description: "Servicio", quantity: 2, price: 50 }
                ]
              }, null, 2)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PageFlowRepetitionTab;