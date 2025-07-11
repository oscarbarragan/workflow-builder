// src/components/layoutDesigner/PageManager/PageFlowPreviewTab.jsx
import React from 'react';
import { PAGE_FLOW_TYPES, NEXT_PAGE_TYPES } from '../../utils/pageFlow.constants';

const PageFlowPreviewTab = ({ flowConfig }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: '600' }}>
        👁️ Vista Previa de Configuración
      </h3>

      {/* Resumen del tipo */}
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
            <strong>Página Siguiente:</strong>
            <div style={{ color: '#6b7280', marginTop: '4px' }}>
              {(flowConfig.nextPage?.type || NEXT_PAGE_TYPES.AUTO) === NEXT_PAGE_TYPES.AUTO && '🔄 Automática'}
              {flowConfig.nextPage?.type === NEXT_PAGE_TYPES.SIMPLE && '📄 Específica'}
              {flowConfig.nextPage?.type === NEXT_PAGE_TYPES.CONDITIONAL && '🔀 Condicional'}
              {flowConfig.nextPage?.type === NEXT_PAGE_TYPES.NONE && '🛑 Finalizar'}
            </div>
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
                  • {condition.variable || 'Sin variable'} {condition.operator} "{condition.value}" 
                  → Página {(condition.targetPageIndex || 0) + 1}
                </div>
              ))}
              {flowConfig.conditional.defaultTargetPageIndex !== null && (
                <div style={{ marginTop: '8px', fontStyle: 'italic' }}>
                  Por defecto: Página {(flowConfig.conditional.defaultTargetPageIndex || 0) + 1}
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
          </div>
        </div>
      )}

      {/* JSON de configuración */}
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
    </div>
  );
};

export default PageFlowPreviewTab;