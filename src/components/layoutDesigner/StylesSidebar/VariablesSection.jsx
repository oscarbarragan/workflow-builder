// src/components/layoutDesigner/StylesSidebar/VariablesSection.jsx - COMPLETADO
import React from 'react';
import { Eye, EyeOff, Link2 } from 'lucide-react';

const VariablesSection = ({
  variables,
  showVariableValues,
  onToggleVariableValues,
  isExpanded,
  onToggleExpanded
}) => {
  const renderSectionHeader = () => (
    <div
      onClick={onToggleExpanded}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        background: '#e2e8f0',
        borderBottom: '1px solid #cbd5e1',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '600',
        color: '#475569'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Link2 size={14} />
        Variables ({Object.keys(variables).length})
      </div>
      <span>
        {isExpanded ? '🔽' : '▶️'}
      </span>
    </div>
  );

  if (!isExpanded) {
    return renderSectionHeader();
  }

  return (
    <div>
      {renderSectionHeader()}
      
      <div>
        <div style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>
          <button
            onClick={onToggleVariableValues}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              background: showVariableValues ? '#eff6ff' : 'white',
              color: showVariableValues ? '#1e40af' : '#374151',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            {showVariableValues ? <Eye size={12} /> : <EyeOff size={12} />}
            {showVariableValues ? 'Mostrar Variables' : 'Mostrar Valores'}
          </button>
        </div>
        
        {Object.keys(variables).length === 0 ? (
          <div style={{
            padding: '20px 12px',
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '12px'
          }}>
            <Link2 size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
            <div>No hay variables disponibles</div>
            <div style={{ fontSize: '11px', marginTop: '4px' }}>
              Conecta nodos para obtener variables
            </div>
          </div>
        ) : (
          <div style={{
            maxHeight: '250px',
            overflowY: 'auto'
          }}>
            {Object.entries(variables).map(([key, varData]) => {
              let displayValue, typeInfo;
              
              // ✅ MEJORADO: Manejo de estructura de datos con notación de punto
              if (typeof varData === 'object' && varData !== null && varData.displayValue !== undefined) {
                displayValue = String(varData.displayValue || '');
                typeInfo = varData.type || 'unknown';
              } else {
                displayValue = typeof varData === 'string' ? varData : String(varData || '');
                typeInfo = typeof varData;
              }
              
              const truncatedValue = displayValue.length > 30 
                ? `${displayValue.substring(0, 30)}...` 
                : displayValue;

              // ✅ NUEVO: Indicador visual para estructura anidada
              const isNestedPath = key.includes('.');
              const pathParts = key.split('.');
              const lastPart = pathParts[pathParts.length - 1];
              const parentPath = pathParts.slice(0, -1).join('.');

              return (
                <div
                  key={`variable-${key}`}
                  style={{
                    padding: '8px 12px',
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    paddingLeft: isNestedPath ? `${12 + (pathParts.length - 1) * 8}px` : '12px',
                    borderLeft: isNestedPath ? '2px solid #e5e7eb' : 'none'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  title={`Usar variable: {{${key}}}\nTipo: ${typeInfo}\nValor: ${displayValue}`}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '4px'
                  }}>
                    <div style={{
                      fontWeight: '600',
                      color: '#374151',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      {/* ✅ NUEVO: Iconos específicos para tipos y anidamiento */}
                      <span style={{ 
                        color: typeInfo === 'string' ? '#16a34a' : 
                              typeInfo === 'number' ? '#3b82f6' : 
                              typeInfo === 'boolean' ? '#f59e0b' : 
                              typeInfo === 'array' ? '#7c3aed' : 
                              typeInfo === 'object' ? '#dc2626' : '#6b7280',
                        fontSize: '10px'
                      }}>
                        {/* ✅ MEJORADO: Iconos específicos para tipos primitivos */}
                        {typeInfo === 'string' ? '📝' : 
                         typeInfo === 'number' ? '🔢' : 
                         typeInfo === 'boolean' ? '✅' : 
                         typeInfo === 'array' ? '📊' : 
                         typeInfo === 'object' ? '📋' : 
                         isNestedPath ? '└' : '🔗'}
                      </span>
                      
                      {/* ✅ MEJORADO: Mostrar path completo o solo la parte final */}
                      <span style={{ 
                        fontFamily: 'monospace',
                        fontSize: isNestedPath ? '11px' : '12px'
                      }}>
                        {showVariableValues && isNestedPath ? (
                          <>
                            <span style={{ color: '#9ca3af', fontSize: '10px' }}>{parentPath}.</span>
                            <span style={{ color: '#374151' }}>{lastPart}</span>
                          </>
                        ) : (
                          `{{${key}}}`
                        )}
                      </span>
                    </div>
                    
                    {/* ✅ COMPLETADO: Badge de tipo de variable */}
                    <span style={{
                      fontSize: '9px',
                      padding: '1px 4px',
                      background: typeInfo === 'string' ? '#dcfce7' : 
                                typeInfo === 'number' ? '#dbeafe' : 
                                typeInfo === 'boolean' ? '#fef3c7' : 
                                typeInfo === 'array' ? '#f3e8ff' : 
                                typeInfo === 'object' ? '#fef2f2' : '#f3f4f6',
                      borderRadius: '3px',
                      color: typeInfo === 'string' ? '#16a34a' : 
                             typeInfo === 'number' ? '#2563eb' : 
                             typeInfo === 'boolean' ? '#d97706' : 
                             typeInfo === 'array' ? '#7c3aed' : 
                             typeInfo === 'object' ? '#dc2626' : '#6b7280',
                      fontWeight: '500',
                      border: '1px solid',
                      borderColor: typeInfo === 'string' ? '#16a34a' : 
                                  typeInfo === 'number' ? '#2563eb' : 
                                  typeInfo === 'boolean' ? '#d97706' : 
                                  typeInfo === 'array' ? '#7c3aed' : 
                                  typeInfo === 'object' ? '#dc2626' : '#6b7280'
                    }}>
                      {String(typeInfo).toUpperCase()}
                    </span>
                  </div>
                  
                  {/* ✅ NUEVO: Valor de la variable con formato mejorado */}
                  <div style={{
                    color: '#6b7280',
                    fontSize: '11px',
                    fontFamily: showVariableValues ? 'inherit' : 'monospace',
                    paddingLeft: isNestedPath ? '14px' : '0',
                    lineHeight: '1.3'
                  }}>
                    {showVariableValues ? truncatedValue : `{{${key}}}`}
                  </div>
                  
                  {/* ✅ NUEVO: Información adicional para arrays y objetos */}
                  {typeInfo === 'array' && varData.arrayInfo && (
                    <div style={{
                      fontSize: '10px',
                      color: '#7c3aed',
                      paddingLeft: isNestedPath ? '14px' : '0',
                      marginTop: '2px',
                      fontStyle: 'italic'
                    }}>
                      {varData.arrayInfo.length} elementos
                      {varData.arrayInfo.hasObjects && ' • Objetos'}
                      {varData.arrayInfo.hasPrimitives && ' • Primitivos'}
                    </div>
                  )}
                  
                  {/* ✅ NUEVO: Vista previa de template de variable */}
                  <div style={{
                    color: '#3b82f6',
                    fontSize: '10px',
                    fontFamily: 'monospace',
                    paddingLeft: isNestedPath ? '14px' : '0',
                    background: '#f8fafc',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    marginTop: '2px',
                    border: '1px solid #e2e8f0'
                  }}>
                    {`{{${key}}}`}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* ✅ NUEVO: Footer con información útil */}
        <div style={{
          padding: '8px 12px',
          fontSize: '10px',
          color: '#9ca3af',
          fontStyle: 'italic',
          textAlign: 'center',
          borderTop: '1px solid #f1f5f9',
          background: '#fafafa'
        }}>
          💡 Usa Ctrl+Espacio en texto para insertar variables
          {Object.keys(variables).length > 0 && (
            <>
              <br />
              🔗 {Object.keys(variables).filter(key => !key.includes('.')).length} raíz
              • {Object.keys(variables).filter(key => key.includes('.')).length} anidadas
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VariablesSection;