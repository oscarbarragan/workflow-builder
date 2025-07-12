// src/components/layoutDesigner/PageManager/PageFlow/PageFlowPreviewTab.jsx - SIN NEXT PAGE
import React from 'react';
import { PAGE_FLOW_TYPES } from '../../utils/pageFlow.constants';

const PageFlowPreviewTab = ({ flowConfig, pages = [] }) => {
  // ✅ NUEVA: Función para obtener nombre de página por índice
  const getPageName = (pageIndex) => {
    if (pageIndex === null || pageIndex === undefined) return 'No definida';
    const page = pages[pageIndex];
    return page ? `${pageIndex + 1}. ${page.name}` : `Página ${pageIndex + 1}`;
  };

  // ✅ NUEVA: Función para obtener página de inicio según tipo
  const getStartPageInfo = () => {
    switch (flowConfig.type) {
      case PAGE_FLOW_TYPES.SIMPLE:
        return {
          type: 'Simple',
          startPageIndex: flowConfig.simple?.startPageIndex ?? 0,
          description: 'Página fija de inicio'
        };
      case PAGE_FLOW_TYPES.CONDITIONAL:
        return {
          type: 'Condicional',
          startPageIndex: flowConfig.conditional?.defaultStartPageIndex ?? 0,
          description: 'Página de inicio determinada por condiciones'
        };
      case PAGE_FLOW_TYPES.REPEATED:
        return {
          type: 'Repetida',
          startPageIndex: flowConfig.repeated?.startPageIndex ?? 0,
          description: 'Página que se repite como plantilla'
        };
      default:
        return {
          type: 'Desconocido',
          startPageIndex: 0,
          description: 'Tipo no reconocido'
        };
    }
  };

  const startPageInfo = getStartPageInfo();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: '600' }}>
        👁️ Vista Previa de Configuración
      </h3>

      {/* ✅ ACTUALIZADO: Resumen del tipo con página de inicio */}
      <div style={{
        padding: '20px',
        background: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px' }}>
          📋 Resumen de Configuración
        </h4>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '13px' }}>
          <div>
            <strong>Tipo de Página:</strong>
            <div style={{ color: '#6b7280', marginTop: '4px' }}>
              {flowConfig.type === PAGE_FLOW_TYPES.SIMPLE && '📄 Simple'}
              {flowConfig.type === PAGE_FLOW_TYPES.CONDITIONAL && '🔀 Condicional'}
              {flowConfig.type === PAGE_FLOW_TYPES.REPEATED && '🔁 Repetida'}
            </div>
          </div>
          
          <div>
            <strong>🏁 Página de Inicio:</strong>
            <div style={{ color: '#6b7280', marginTop: '4px' }}>
              {getPageName(startPageInfo.startPageIndex)}
            </div>
          </div>
        </div>

        {/* ✅ NUEVA: Descripción del comportamiento */}
        <div style={{
          marginTop: '12px',
          padding: '12px',
          background: '#f0f9ff',
          borderRadius: '6px',
          border: '1px solid #0ea5e9'
        }}>
          <div style={{ fontSize: '12px', color: '#0c4a6e', fontWeight: '600', marginBottom: '4px' }}>
            📝 Comportamiento:
          </div>
          <div style={{ fontSize: '12px', color: '#0c4a6e' }}>
            {startPageInfo.description}
          </div>
        </div>
      </div>

      {/* Detalles según tipo */}
      {flowConfig.type === PAGE_FLOW_TYPES.CONDITIONAL && (
        <div style={{
          padding: '16px',
          background: '#fffbeb',
          borderRadius: '8px',
          border: '1px solid #fbbf24'
        }}>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#92400e', marginBottom: '8px' }}>
            🔀 Condiciones Configuradas
          </h4>
          {flowConfig.conditional?.conditions?.length > 0 ? (
            <div style={{ fontSize: '12px', color: '#92400e' }}>
              {flowConfig.conditional.conditions.map((condition, index) => (
                <div key={index} style={{ marginBottom: '4px' }}>
                  • {condition.type === 'script' ? (
                      <>
                        <span style={{
                          background: '#fef3c7',
                          padding: '1px 4px',
                          borderRadius: '2px',
                          fontSize: '10px',
                          marginRight: '4px'
                        }}>
                          SCRIPT
                        </span>
                        Script personalizado → 🏁 Iniciar en {getPageName(condition.startPageIndex)}
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
                        {condition.variable || 'Sin variable'} {condition.operator} "{condition.value}" 
                        → 🏁 Iniciar en {getPageName(condition.startPageIndex)}
                      </>
                    )
                  }
                </div>
              ))}
              {flowConfig.conditional.defaultStartPageIndex !== null && flowConfig.conditional.defaultStartPageIndex !== undefined && (
                <div style={{ marginTop: '8px', fontStyle: 'italic' }}>
                  🏁 Por defecto: Iniciar en {getPageName(flowConfig.conditional.defaultStartPageIndex)}
                </div>
              )}
            </div>
          ) : (
            <div style={{ fontSize: '12px', color: '#ef4444' }}>
              ⚠️ No hay condiciones configuradas
            </div>
          )}
        </div>
      )}

      {flowConfig.type === PAGE_FLOW_TYPES.REPEATED && (
        <div style={{
          padding: '16px',
          background: '#faf5ff',
          borderRadius: '8px',
          border: '1px solid #c084fc'
        }}>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#7c3aed', marginBottom: '8px' }}>
            🔁 Configuración de Repetición
          </h4>
          <div style={{ fontSize: '12px', color: '#7c3aed' }}>
            <div>• Variable de datos: {flowConfig.repeated?.dataSource?.variableName || 'No configurada'}</div>
            <div>• Variable del elemento: {flowConfig.repeated?.itemVariableName || 'item'}</div>
            <div>• Variable del índice: {flowConfig.repeated?.indexVariableName || 'index'}</div>
            <div>• Máximo iteraciones: {flowConfig.repeated?.maxIterations || 100}</div>
            <div>• 🏁 Página plantilla: {getPageName(flowConfig.repeated?.startPageIndex)}</div>
          </div>
        </div>
      )}

      {flowConfig.type === PAGE_FLOW_TYPES.SIMPLE && (
        <div style={{
          padding: '16px',
          background: '#f0fdf4',
          borderRadius: '8px',
          border: '1px solid #bbf7d0'
        }}>
          <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#166534', marginBottom: '8px' }}>
            📄 Configuración Simple
          </h4>
          <div style={{ fontSize: '12px', color: '#166534' }}>
            El documento iniciará directamente en: <strong>{getPageName(flowConfig.simple?.startPageIndex)}</strong>
          </div>
        </div>
      )}

      {/* ✅ NUEVA: Información sobre páginas disponibles */}
      <div style={{
        padding: '16px',
        background: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
          📄 Páginas Disponibles en este Documento
        </h4>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          {pages.length === 0 ? (
            <div style={{ color: '#ef4444' }}>⚠️ No hay páginas disponibles</div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '8px',
              marginTop: '8px'
            }}>
              {pages.map((page, index) => (
                <div
                  key={page.id || index}
                  style={{
                    padding: '8px',
                    background: index === startPageInfo.startPageIndex ? '#eff6ff' : 'white',
                    border: index === startPageInfo.startPageIndex ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                    borderRadius: '4px',
                    fontSize: '11px'
                  }}
                >
                  <div style={{ 
                    fontWeight: '600', 
                    color: index === startPageInfo.startPageIndex ? '#1e40af' : '#374151' 
                  }}>
                    {index + 1}. {page.name || `Página ${index + 1}`}
                    {index === startPageInfo.startPageIndex && (
                      <span style={{
                        marginLeft: '4px',
                        background: '#3b82f6',
                        color: 'white',
                        padding: '1px 4px',
                        borderRadius: '2px',
                        fontSize: '9px'
                      }}>
                        🏁 INICIO
                      </span>
                    )}
                  </div>
                  <div style={{ color: '#6b7280', marginTop: '2px' }}>
                    {page.elements?.length || 0} elementos • {page.size?.preset || 'Custom'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ✅ ACTUALIZADO: JSON de configuración sin nextPage */}
      <div>
        <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
          🔧 Configuración JSON
        </h4>
        <pre style={{
          background: '#f3f4f6',
          padding: '16px',
          borderRadius: '6px',
          fontSize: '11px',
          overflow: 'auto',
          maxHeight: '200px',
          border: '1px solid #d1d5db'
        }}>
          {JSON.stringify(flowConfig, null, 2)}
        </pre>
      </div>

      {/* ✅ NUEVA: Resumen ejecutivo */}
      <div style={{
        padding: '16px',
        background: '#f0f9ff',
        borderRadius: '8px',
        border: '2px solid #0ea5e9'
      }}>
        <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#0369a1', marginBottom: '8px' }}>
          🎯 Resumen Ejecutivo
        </h4>
        <div style={{ fontSize: '12px', color: '#0369a1', lineHeight: '1.5' }}>
          <strong>Comportamiento del Documento:</strong>
          <br />
          {(() => {
            switch (flowConfig.type) {
              case PAGE_FLOW_TYPES.SIMPLE:
                return `El documento siempre iniciará en "${getPageName(flowConfig.simple?.startPageIndex)}" sin evaluaciones adicionales.`;
              case PAGE_FLOW_TYPES.CONDITIONAL:
                const conditionsCount = flowConfig.conditional?.conditions?.length || 0;
                return `El documento evaluará ${conditionsCount} condición${conditionsCount !== 1 ? 'es' : ''} para determinar la página de inicio. Si ninguna se cumple, iniciará en "${getPageName(flowConfig.conditional?.defaultStartPageIndex)}".`;
              case PAGE_FLOW_TYPES.REPEATED:
                const arrayVar = flowConfig.repeated?.dataSource?.variableName;
                return `El documento se repetirá por cada elemento del array "${arrayVar || '(no configurado)'}", usando "${getPageName(flowConfig.repeated?.startPageIndex)}" como plantilla.`;
              default:
                return 'Configuración no reconocida.';
            }
          })()}
          <br />
          <br />
          <strong>📝 Nota:</strong> Este flujo determina únicamente la página de inicio del documento, 
          no maneja navegación entre páginas durante la visualización.
        </div>
      </div>
    </div>
  );
};

export default PageFlowPreviewTab;