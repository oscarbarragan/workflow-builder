// src/components/layoutDesigner/PageManager/PageFlowNextPageTab.jsx
import React from 'react';
import { NEXT_PAGE_TYPES } from '../../utils/pageFlow.constants';

const PageFlowNextPageTab = ({ flowConfig, updateFlowConfig, pages }) => {
  // Obtener lista de páginas para seleccionar
  const getPageOptions = () => {
    return pages.map((page, index) => ({
      value: index,
      label: `${index + 1}. ${page.name}`,
      id: page.id
    }));
  };

  const configs = {
    [NEXT_PAGE_TYPES.AUTO]: {
      title: '🔄 Automática',
      description: 'Ir a la siguiente página en secuencia'
    },
    [NEXT_PAGE_TYPES.SIMPLE]: {
      title: '📄 Página Específica',
      description: 'Ir a una página específica'
    },
    [NEXT_PAGE_TYPES.CONDITIONAL]: {
      title: '🔀 Condicional',
      description: 'Ir a diferentes páginas según condiciones'
    },
    [NEXT_PAGE_TYPES.NONE]: {
      title: '🛑 Finalizar',
      description: 'No continuar a ninguna página'
    }
  };

  const selectedType = flowConfig.nextPage?.type || NEXT_PAGE_TYPES.AUTO;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: '600' }}>
        ➡️ Configuración de Página Siguiente
      </h3>

      {/* Tipo de página siguiente */}
      <div>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '12px' }}>
          Tipo de Navegación
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {Object.entries(NEXT_PAGE_TYPES).map(([key, value]) => {
            const config = configs[value];
            const isSelected = selectedType === value;

            return (
              <button
                key={value}
                onClick={() => updateFlowConfig('nextPage.type', value)}
                style={{
                  padding: '16px',
                  border: isSelected ? '2px solid #3b82f6' : '2px solid #e5e7eb',
                  borderRadius: '8px',
                  background: isSelected ? '#eff6ff' : 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  marginBottom: '4px',
                  color: isSelected ? '#1e40af' : '#374151'
                }}>
                  {config.title}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {config.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Configuración específica según el tipo */}
      {selectedType === NEXT_PAGE_TYPES.SIMPLE && (
        <div style={{
          padding: '16px',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '8px' }}>
            Página Destino
          </label>
          <select
            value={flowConfig.nextPage?.targetPageIndex ?? ''}
            onChange={(e) => {
              const pageIndex = e.target.value ? parseInt(e.target.value) : null;
              updateFlowConfig('nextPage.targetPageIndex', pageIndex);
              if (pageIndex !== null) {
                updateFlowConfig('nextPage.targetPageId', pages[pageIndex]?.id);
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

      {selectedType === NEXT_PAGE_TYPES.CONDITIONAL && (
        <div style={{
          padding: '16px',
          background: '#fffbeb',
          borderRadius: '8px',
          border: '1px solid #fbbf24'
        }}>
          <div style={{ fontSize: '13px', color: '#92400e', marginBottom: '12px' }}>
            🔀 Navegación condicional: Se evaluarán las condiciones para determinar la próxima página
          </div>
          <div style={{ fontSize: '12px', color: '#a16207' }}>
            💡 Similar a las condiciones de página, pero para navegación
          </div>
        </div>
      )}

      {selectedType === NEXT_PAGE_TYPES.NONE && (
        <div style={{
          padding: '16px',
          background: '#fef2f2',
          borderRadius: '8px',
          border: '1px solid #fecaca'
        }}>
          <div style={{ fontSize: '13px', color: '#dc2626', marginBottom: '8px' }}>
            🛑 Finalizar Documento
          </div>
          <div style={{ fontSize: '12px', color: '#b91c1c' }}>
            El flujo de páginas terminará aquí. No se continuará a ninguna página adicional.
          </div>
        </div>
      )}
    </div>
  );
};

export default PageFlowNextPageTab;
