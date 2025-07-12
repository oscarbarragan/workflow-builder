// src/components/layoutDesigner/PageManager/PageFlow/PageFlowIndicator.jsx - SIN NEXT PAGE
import React from 'react';
import { PAGE_FLOW_TYPES } from '../../utils/pageFlow.constants';
// ✅ ELIMINADO: NEXT_PAGE_TYPES - ya no se usa

const PageFlowIndicator = ({ 
  page, 
  size = 'normal', // 'small' | 'normal' | 'large'
  showDetails = true,
  onClick = null,
  style = {}
}) => {
  if (!page?.flowConfig) {
    return null;
  }

  const flowConfig = page.flowConfig;
  
  // Configuración de tamaños
  const sizeConfigs = {
    small: {
      containerPadding: '4px 6px',
      fontSize: '9px',
      iconSize: '10px',
      gap: '2px'
    },
    normal: {
      containerPadding: '6px 8px',
      fontSize: '11px',
      iconSize: '12px',
      gap: '4px'
    },
    large: {
      containerPadding: '8px 12px',
      fontSize: '12px',
      iconSize: '14px',
      gap: '6px'
    }
  };

  const sizeConfig = sizeConfigs[size];

  // Obtener información del tipo de flujo
  const getFlowTypeInfo = () => {
    switch (flowConfig.type) {
      case PAGE_FLOW_TYPES.SIMPLE:
        return {
          icon: '📄',
          label: 'Simple',
          color: '#10b981',
          bgColor: '#f0fdf4',
          borderColor: '#bbf7d0'
        };
      case PAGE_FLOW_TYPES.CONDITIONAL:
        return {
          icon: '🔀',
          label: 'Condicional',
          color: '#f59e0b',
          bgColor: '#fffbeb',
          borderColor: '#fbbf24'
        };
      case PAGE_FLOW_TYPES.REPEATED:
        return {
          icon: '🔁',
          label: 'Repetida',
          color: '#8b5cf6',
          bgColor: '#faf5ff',
          borderColor: '#c084fc'
        };
      default:
        return {
          icon: '📄',
          label: 'Simple',
          color: '#6b7280',
          bgColor: '#f9fafb',
          borderColor: '#e5e7eb'
        };
    }
  };

  // ✅ ACTUALIZADO: Obtener información de página de inicio (en lugar de página siguiente)
  const getStartPageInfo = () => {
    switch (flowConfig.type) {
      case PAGE_FLOW_TYPES.SIMPLE:
        return { 
          icon: '🏁', 
          label: `Página ${(flowConfig.simple?.startPageIndex ?? 0) + 1}` 
        };
      case PAGE_FLOW_TYPES.CONDITIONAL:
        return { 
          icon: '🔀', 
          label: 'Condicional' 
        };
      case PAGE_FLOW_TYPES.REPEATED:
        return { 
          icon: '🔁', 
          label: `Página ${(flowConfig.repeated?.startPageIndex ?? 0) + 1}` 
        };
      default:
        return { 
          icon: '🏁', 
          label: 'Auto' 
        };
    }
  };

  // Contar condiciones/configuraciones
  const getConfigCounts = () => {
    const counts = {};
    
    if (flowConfig.type === PAGE_FLOW_TYPES.CONDITIONAL) {
      counts.conditions = flowConfig.conditional?.conditions?.length || 0;
    }
    
    if (flowConfig.type === PAGE_FLOW_TYPES.REPEATED) {
      counts.dataSource = flowConfig.repeated?.dataSource?.variableName ? 1 : 0;
      counts.maxIterations = flowConfig.repeated?.maxIterations || 100;
    }

    return counts;
  };

  const flowTypeInfo = getFlowTypeInfo();
  const startPageInfo = getStartPageInfo(); // ✅ CAMBIADO: de nextPageInfo a startPageInfo
  const configCounts = getConfigCounts();

  return (
    <div
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: sizeConfig.gap,
        padding: sizeConfig.containerPadding,
        background: flowTypeInfo.bgColor,
        border: `1px solid ${flowTypeInfo.borderColor}`,
        borderRadius: '6px',
        fontSize: sizeConfig.fontSize,
        fontWeight: '500',
        color: flowTypeInfo.color,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        userSelect: 'none',
        ...style
      }}
      title={onClick ? 'Click para configurar flujo' : undefined}
      onMouseEnter={(e) => {
        if (onClick) {
          e.target.style.transform = 'scale(1.02)';
          e.target.style.boxShadow = `0 2px 8px ${flowTypeInfo.color}25`;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = 'none';
        }
      }}
    >
      {/* Icono principal */}
      <span style={{ fontSize: sizeConfig.iconSize }}>
        {flowTypeInfo.icon}
      </span>

      {/* Label del tipo */}
      {size !== 'small' && (
        <span>{flowTypeInfo.label}</span>
      )}

      {/* Detalles adicionales */}
      {showDetails && size === 'large' && (
        <>
          {/* Contadores de configuración */}
          {flowConfig.type === PAGE_FLOW_TYPES.CONDITIONAL && (
            <span style={{
              background: flowTypeInfo.color,
              color: 'white',
              padding: '1px 4px',
              borderRadius: '3px',
              fontSize: sizeConfig.fontSize === '12px' ? '10px' : '9px',
              fontWeight: '600'
            }}>
              {configCounts.conditions}
            </span>
          )}

          {flowConfig.type === PAGE_FLOW_TYPES.REPEATED && (
            <span style={{
              background: flowTypeInfo.color,
              color: 'white',
              padding: '1px 4px',
              borderRadius: '3px',
              fontSize: sizeConfig.fontSize === '12px' ? '10px' : '9px',
              fontWeight: '600'
            }}>
              {configCounts.dataSource ? '✓' : '✗'}
            </span>
          )}

          {/* Separador */}
          <span style={{
            width: '1px',
            height: '12px',
            background: flowTypeInfo.borderColor,
            margin: '0 2px'
          }} />

          {/* ✅ ACTUALIZADO: Información de página de inicio */}
          <span style={{ fontSize: sizeConfig.iconSize }}>
            {startPageInfo.icon}
          </span>
          <span style={{ fontSize: sizeConfig.fontSize === '12px' ? '10px' : '9px' }}>
            {startPageInfo.label}
          </span>
        </>
      )}

      {/* Indicador de problemas */}
      {showDetails && (
        <>
          {flowConfig.type === PAGE_FLOW_TYPES.CONDITIONAL && 
           (!flowConfig.conditional?.conditions?.length) && (
            <span style={{
              color: '#ef4444',
              fontSize: sizeConfig.iconSize,
              marginLeft: '2px'
            }}>
              ⚠️
            </span>
          )}

          {flowConfig.type === PAGE_FLOW_TYPES.REPEATED && 
           (!flowConfig.repeated?.dataSource?.variableName) && (
            <span style={{
              color: '#ef4444',
              fontSize: sizeConfig.iconSize,
              marginLeft: '2px'
            }}>
              ⚠️
            </span>
          )}
        </>
      )}
    </div>
  );
};

// Componente para mostrar múltiples indicadores en línea
export const PageFlowIndicatorGroup = ({ 
  pages = [], 
  currentPageIndex = 0,
  onPageFlowClick = null,
  size = 'normal',
  maxVisible = 5
}) => {
  if (!pages.length) return null;

  // Determinar qué páginas mostrar
  const visiblePages = pages.slice(0, maxVisible);
  const hasMore = pages.length > maxVisible;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      flexWrap: 'wrap'
    }}>
      {visiblePages.map((page, index) => (
        <div
          key={page.id || index}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            opacity: index === currentPageIndex ? 1 : 0.7
          }}
        >
          <span style={{
            fontSize: size === 'small' ? '9px' : '11px',
            color: index === currentPageIndex ? '#3b82f6' : '#6b7280',
            fontWeight: index === currentPageIndex ? '600' : '400'
          }}>
            {index + 1}.
          </span>
          
          <PageFlowIndicator
            page={page}
            size={size}
            showDetails={size !== 'small'}
            onClick={onPageFlowClick ? () => onPageFlowClick(index) : null}
            style={{
              opacity: index === currentPageIndex ? 1 : 0.8,
              transform: index === currentPageIndex ? 'scale(1.02)' : 'scale(1)'
            }}
          />
        </div>
      ))}

      {hasMore && (
        <span style={{
          fontSize: size === 'small' ? '9px' : '11px',
          color: '#6b7280',
          fontStyle: 'italic'
        }}>
          +{pages.length - maxVisible} más...
        </span>
      )}
    </div>
  );
};

// ✅ ACTUALIZADO: Componente para tooltip con información detallada (sin next page)
export const PageFlowTooltip = ({ page, isVisible = false, position = { x: 0, y: 0 } }) => {
  if (!isVisible || !page?.flowConfig) return null;

  const flowConfig = page.flowConfig;

  // ✅ NUEVA: Función para obtener información de página de inicio
  const getStartPageInfo = () => {
    switch (flowConfig.type) {
      case PAGE_FLOW_TYPES.SIMPLE:
        return `Página ${(flowConfig.simple?.startPageIndex ?? 0) + 1}`;
      case PAGE_FLOW_TYPES.CONDITIONAL:
        const defaultIndex = flowConfig.conditional?.defaultStartPageIndex ?? 0;
        return `Por defecto: Página ${defaultIndex + 1}`;
      case PAGE_FLOW_TYPES.REPEATED:
        return `Plantilla: Página ${(flowConfig.repeated?.startPageIndex ?? 0) + 1}`;
      default:
        return 'Página 1';
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: position.y + 10,
      left: position.x + 10,
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      padding: '12px',
      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 9999,
      pointerEvents: 'none'
    }}>
      <div style={{ fontWeight: '600', marginBottom: '8px' }}>
        🔄 Configuración de Flujo
      </div>

      <div style={{ marginBottom: '6px' }}>
        <strong>Tipo:</strong> {flowConfig.type}
      </div>

      {/* ✅ ACTUALIZADO: Mostrar página de inicio en lugar de next page */}
      <div style={{ marginBottom: '6px' }}>
        <strong>🏁 Página de inicio:</strong> {getStartPageInfo()}
      </div>

      {flowConfig.type === PAGE_FLOW_TYPES.CONDITIONAL && (
        <div style={{ marginBottom: '6px' }}>
          <strong>Condiciones:</strong> {flowConfig.conditional?.conditions?.length || 0}
        </div>
      )}

      {flowConfig.type === PAGE_FLOW_TYPES.REPEATED && (
        <div style={{ marginBottom: '6px' }}>
          <strong>Variable:</strong> {flowConfig.repeated?.dataSource?.variableName || 'No configurada'}
        </div>
      )}

      {flowConfig.description && (
        <div style={{ 
          marginTop: '8px', 
          paddingTop: '8px', 
          borderTop: '1px solid #e5e7eb',
          fontStyle: 'italic',
          color: '#6b7280'
        }}>
          {flowConfig.description}
        </div>
      )}
    </div>
  );
};

export default PageFlowIndicator;