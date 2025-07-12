// src/components/layoutDesigner/PageManager/PageFlow/PageFlowTypeTab.jsx
// ✅ ACTUALIZADO: Con selección de página de inicio para todos los tipos
import React from 'react';
import { PAGE_FLOW_TYPES } from '../../utils/pageFlow.constants';

const PageFlowTypeTab = ({ flowConfig, updateFlowConfig, pages = [] }) => {
  // ✅ NUEVA: Función para obtener opciones de páginas de inicio
  const getStartPageOptions = () => {
    return pages.map((page, index) => ({
      value: index,
      label: `${index + 1}. ${page.name || `Página ${index + 1}`}`,
      id: page.id
    }));
  };

  // ✅ NUEVA: Función para actualizar página de inicio según el tipo de flujo
  const handleStartPageChange = (startPageIndex) => {
    const startPageId = pages[startPageIndex]?.id || null;
    
    switch (flowConfig.type) {
      case PAGE_FLOW_TYPES.SIMPLE:
        updateFlowConfig('simple.startPageIndex', startPageIndex);
        updateFlowConfig('simple.startPageId', startPageId);
        break;
      case PAGE_FLOW_TYPES.CONDITIONAL:
        updateFlowConfig('conditional.defaultStartPageIndex', startPageIndex);
        updateFlowConfig('conditional.defaultStartPageId', startPageId);
        break;
      case PAGE_FLOW_TYPES.REPEATED:
        updateFlowConfig('repeated.startPageIndex', startPageIndex);
        updateFlowConfig('repeated.startPageId', startPageId);
        break;
    }
  };

  // ✅ NUEVA: Función para obtener la página de inicio actual según el tipo
  const getCurrentStartPageIndex = () => {
    switch (flowConfig.type) {
      case PAGE_FLOW_TYPES.SIMPLE:
        return flowConfig.simple?.startPageIndex ?? 0;
      case PAGE_FLOW_TYPES.REPEATED:
        return flowConfig.repeated?.startPageIndex ?? 0;
      case PAGE_FLOW_TYPES.CONDITIONAL:
        // ✅ CORREGIDO: Las condicionales no tienen página de inicio general
        return null;
      default:
        return 0;
    }
  };

  // ✅ ACTUALIZADA: Solo mostrar selector para Simple únicamente
  const shouldShowStartPageSelector = () => {
    return flowConfig.type === PAGE_FLOW_TYPES.SIMPLE;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px' }}>
          🎯 Seleccionar Tipo de Página
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          {Object.entries(PAGE_FLOW_TYPES).map(([key, value]) => {
            const configs = {
              [PAGE_FLOW_TYPES.SIMPLE]: {
                title: '📄 Página Simple',
                description: 'Inicia en una página específica, sin condiciones especiales',
                color: '#10b981'
              },
              [PAGE_FLOW_TYPES.CONDITIONAL]: {
                title: '🔀 Página Condicional',
                description: 'La página de inicio se determina según condiciones de datos',
                color: '#f59e0b'
              },
              [PAGE_FLOW_TYPES.REPEATED]: {
                title: '🔁 Página Repetida',
                description: 'Se repite por cada elemento de un array, iniciando en una página específica',
                color: '#8b5cf6'
              }
            };
            
            const config = configs[value];
            const isSelected = flowConfig.type === value;
            
            return (
              <button
                key={value}
                onClick={() => updateFlowConfig('type', value)}
                style={{
                  padding: '20px',
                  border: isSelected ? `2px solid ${config.color}` : '2px solid #e5e7eb',
                  borderRadius: '12px',
                  background: isSelected ? `${config.color}15` : 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  marginBottom: '8px',
                  color: isSelected ? config.color : '#374151'
                }}>
                  {config.title}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#6b7280',
                  lineHeight: '1.4'
                }}>
                  {config.description}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ✅ ACTUALIZADA: Sección de selección de página de inicio (solo para Simple) */}
      {shouldShowStartPageSelector() && (
        <div style={{
          padding: '20px',
          background: '#f8fafc',
          borderRadius: '12px',
          border: '2px solid #e2e8f0'
        }}>
          <h4 style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#374151', 
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🏁 Página de Inicio
            <span style={{
              fontSize: '10px',
              background: '#eff6ff',
              color: '#2563eb',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: '500'
            }}>
              Requerido
            </span>
          </h4>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              marginBottom: '6px',
              color: '#374151'
            }}>
              Página que se mostrará directamente
            </label>
            
            <select
              value={getCurrentStartPageIndex() ?? 0}
              onChange={(e) => handleStartPageChange(parseInt(e.target.value))}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '2px solid #3b82f6',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white',
                fontWeight: '500'
              }}
            >
              {pages.length === 0 ? (
                <option value={0}>No hay páginas disponibles</option>
              ) : (
                getStartPageOptions().map(page => (
                  <option key={page.value} value={page.value}>
                    {page.label}
                  </option>
                ))
              )}
            </select>
            
            {pages.length === 0 && (
              <div style={{
                fontSize: '11px',
                color: '#ef4444',
                marginTop: '4px',
                fontWeight: '500'
              }}>
                ⚠️ Necesitas crear al menos una página para configurar el flujo
              </div>
            )}
          </div>

          {/* ✅ ACTUALIZADA: Vista previa solo para Simple */}
          {pages.length > 0 && getCurrentStartPageIndex() !== null && (
            <div style={{
              padding: '12px',
              background: '#f0f9ff',
              borderRadius: '6px',
              border: '1px solid #0ea5e9'
            }}>
              <div style={{ fontSize: '11px', color: '#0c4a6e', fontWeight: '600', marginBottom: '4px' }}>
                📋 Configuración Actual:
              </div>
              <div style={{ fontSize: '11px', color: '#0c4a6e' }}>
                {(() => {
                  const currentIndex = getCurrentStartPageIndex();
                  const currentPage = pages[currentIndex];
                  return `Página simple que iniciará en: "${currentPage?.name || `Página ${currentIndex + 1}`}"`;
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ✅ NUEVA: Explicación especial para páginas condicionales */}
      {flowConfig.type === PAGE_FLOW_TYPES.CONDITIONAL && (
        <div style={{
          padding: '20px',
          background: '#fffbeb',
          borderRadius: '12px',
          border: '2px solid #fbbf24'
        }}>
          <h4 style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#d97706', 
            marginBottom: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🔀 Páginas de Inicio Condicionales
          </h4>
          
          <div style={{ fontSize: '13px', color: '#d97706', lineHeight: '1.5' }}>
            En las páginas condicionales, <strong>cada condición define su propia página de inicio</strong>.
            <br />
            <br />
            📋 <strong>Cómo funciona:</strong>
            <br />
            • Cada condición especifica a qué página ir si se cumple
            <br />
            • Puedes configurar una página por defecto si ninguna condición se cumple
            <br />
            • No hay una "página de inicio" general - depende de las condiciones
          </div>
          
          <div style={{
            marginTop: '12px',
            padding: '12px',
            background: '#fef3c7',
            borderRadius: '6px',
            border: '1px solid #f59e0b'
          }}>
            <div style={{ fontSize: '12px', color: '#92400e', fontWeight: '600', marginBottom: '4px' }}>
              🔧 Siguiente paso:
            </div>
            <div style={{ fontSize: '12px', color: '#92400e' }}>
              Ve a la pestaña <strong>"Condiciones"</strong> para definir las reglas y páginas de destino.
            </div>
          </div>
        </div>
      )}

      {/* Configuración específica según tipo (actualizada) */}
      {flowConfig.type === PAGE_FLOW_TYPES.SIMPLE && (
        <div style={{
          padding: '20px',
          background: '#f0fdf4',
          borderRadius: '8px',
          border: '1px solid #bbf7d0'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#166534', marginBottom: '12px' }}>
            📄 Configuración de Página Simple
          </h4>
          <div style={{ fontSize: '13px', color: '#166534', lineHeight: '1.5' }}>
            Esta página se mostrará directamente iniciando en la página seleccionada arriba.
            <br />
            💡 <strong>Ideal para:</strong> Documentos lineales, informes simples, formularios básicos.
          </div>
        </div>
      )}

      {flowConfig.type === PAGE_FLOW_TYPES.CONDITIONAL && (
        <div style={{
          padding: '20px',
          background: '#fffbeb',
          borderRadius: '8px',
          border: '1px solid #fbbf24'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#92400e', marginBottom: '12px' }}>
            🔀 Configuración de Página Condicional
          </h4>
          <div style={{ fontSize: '13px', color: '#92400e', marginBottom: '12px', lineHeight: '1.5' }}>
            Esta página evaluará condiciones para determinar en qué página interna comenzar.
            <strong> Cada condición define su propia página de destino.</strong>
          </div>
          <div style={{ fontSize: '12px', color: '#a16207' }}>
            💡 <strong>Ideal para:</strong> Contratos con cláusulas variables, facturas con diferentes formatos según cliente, 
            documentos personalizados por tipo de usuario.
            <br />
            🔧 <strong>Siguiente paso:</strong> Ve a la pestaña "Condiciones" para configurar las reglas y páginas de destino.
          </div>
        </div>
      )}

      {flowConfig.type === PAGE_FLOW_TYPES.REPEATED && (
        <div style={{
          padding: '20px',
          background: '#faf5ff',
          borderRadius: '8px',
          border: '1px solid #c084fc'
        }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#7c3aed', marginBottom: '12px' }}>
            🔁 Configuración de Página Repetida
          </h4>
          <div style={{ fontSize: '13px', color: '#7c3aed', marginBottom: '12px', lineHeight: '1.5' }}>
            Esta página se repetirá por cada elemento de un array de datos, usando la página seleccionada arriba como plantilla.
            Cada repetición tendrá acceso a los datos del elemento actual.
          </div>
          <div style={{ fontSize: '12px', color: '#8b5cf6' }}>
            💡 <strong>Ideal para:</strong> Facturas con líneas de productos, listas de empleados, 
            catálogos de productos, informes por departamento.
            <br />
            🔧 <strong>Siguiente paso:</strong> Ve a la pestaña "Repetición" para configurar el origen de datos.
          </div>
        </div>
      )}

      {/* ✅ NUEVA: Información adicional sobre el concepto de Page vs Páginas internas */}
      <div style={{
        padding: '16px',
        background: '#f0f9ff',
        borderRadius: '8px',
        border: '1px solid #0ea5e9'
      }}>
        <h4 style={{ fontSize: '13px', fontWeight: '600', color: '#0369a1', marginBottom: '8px' }}>
          📚 ¿Cómo funciona el flujo de páginas?
        </h4>
        <div style={{ fontSize: '12px', color: '#0369a1', lineHeight: '1.4' }}>
          • <strong>Page (Documento):</strong> Es el contenedor principal que tienes aquí
          <br />
          • <strong>Páginas internas:</strong> Son las páginas individuales dentro del documento
          <br />
          • <strong>Página de inicio:</strong> Determina cuál página interna se muestra primero cuando se renderiza el documento
          <br />
          • <strong>Flujo:</strong> Controla la lógica de cuál página interna mostrar según los datos
        </div>
      </div>
    </div>
  );
};

export default PageFlowTypeTab;