// src/components/layoutDesigner/PageManager/PageFlow/PageFlowConfigModal.jsx - SIN NEXT PAGE TAB
import React, { useState, useEffect, useCallback } from 'react';
import { 
  PAGE_FLOW_TYPES, 
  CONDITION_TYPES, 
  OPERATORS,
  CONDITION_TEMPLATES,
  DEFAULT_PAGE_FLOW_CONFIG
} from '../../utils/pageFlow.constants';

// Importar componentes de pestañas (sin NextPageTab)
import PageFlowTypeTab from './PageFlowTypeTab';
import PageFlowConditionsTab from './PageFlowConditionsTab';
import PageFlowRepetitionTab from './PageFlowRepetitionTab';
import PageFlowPreviewTab from './PageFlowPreviewTab';

const PageFlowConfigModal = ({
  isOpen,
  onClose,
  onSave,
  pageData,
  pageIndex,
  pages = [],
  availableVariables = {},
  mode = 'edit'
}) => {
  // Estados locales
  const [flowConfig, setFlowConfig] = useState(DEFAULT_PAGE_FLOW_CONFIG);
  const [activeTab, setActiveTab] = useState('type');
  const [errors, setErrors] = useState({});

  // Inicializar configuración
  useEffect(() => {
    if (isOpen && pageData) {
      setFlowConfig(pageData.flowConfig || DEFAULT_PAGE_FLOW_CONFIG);
      setActiveTab('type');
      setErrors({});
    }
  }, [isOpen, pageData]);

  // Actualizar configuración
  const updateFlowConfig = useCallback((path, value) => {
    setFlowConfig(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current = newConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  }, []);

  // Validar configuración
  const validateConfig = useCallback(() => {
    const newErrors = {};
    
    switch (flowConfig.type) {
      case PAGE_FLOW_TYPES.CONDITIONAL:
        if (!flowConfig.conditional?.conditions?.length) {
          newErrors.conditions = 'Al menos una condición es requerida';
        }
        flowConfig.conditional?.conditions?.forEach((condition, index) => {
          if (!condition.variable && !condition.script) {
            newErrors[`condition_${index}`] = 'Variable o script requerido';
          }
          // ✅ ACTUALIZADO: Validar startPageIndex en lugar de targetPageIndex
          if (condition.startPageIndex >= pages.length) {
            newErrors[`condition_${index}`] = 'Página de inicio seleccionada no válida';
          }
        });
        break;
        
      case PAGE_FLOW_TYPES.REPEATED:
        if (!flowConfig.repeated?.dataSource?.variableName) {
          newErrors.dataSource = 'Variable de datos requerida';
        }
        // ✅ ACTUALIZADO: Validar startPageIndex en lugar de templatePageIndex
        if (flowConfig.repeated?.startPageIndex >= pages.length) {
          newErrors.startPage = 'Página de inicio seleccionada no válida';
        }
        break;
        
      case PAGE_FLOW_TYPES.SIMPLE:
        // ✅ ACTUALIZADO: Validar startPageIndex para páginas simples también
        if (flowConfig.simple?.startPageIndex >= pages.length) {
          newErrors.startPage = 'Página de inicio seleccionada no válida';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [flowConfig, pages.length]);

  // Guardar configuración
  const handleSave = useCallback(() => {
    if (!validateConfig()) {
      return;
    }

    const finalConfig = {
      ...flowConfig,
      updatedAt: new Date().toISOString()
    };

    onSave(finalConfig);
    onClose();
  }, [flowConfig, validateConfig, onSave, onClose]);

  // Funciones para condiciones
  const addCondition = useCallback(() => {
    const newCondition = {
      id: `condition_${Date.now()}`,
      type: CONDITION_TYPES.VARIABLE, // ✅ Agregar tipo por defecto
      variable: '',
      operator: OPERATORS.EQUALS,
      value: '',
      script: '',
      startPageId: null,     // ✅ CAMBIADO: de targetPageId a startPageId
      startPageIndex: 0,     // ✅ CAMBIADO: de targetPageIndex a startPageIndex, default primera página
      description: ''
    };

    setFlowConfig(prev => ({
      ...prev,
      conditional: {
        ...prev.conditional,
        conditions: [...(prev.conditional?.conditions || []), newCondition]
      }
    }));
  }, []);

  const removeCondition = useCallback((index) => {
    setFlowConfig(prev => ({
      ...prev,
      conditional: {
        ...prev.conditional,
        conditions: prev.conditional?.conditions?.filter((_, i) => i !== index) || []
      }
    }));
  }, []);

  const applyConditionTemplate = useCallback((templateName, conditionIndex) => {
    const template = CONDITION_TEMPLATES[templateName];
    if (!template) return;

    setFlowConfig(prev => {
      const newConditions = [...(prev.conditional?.conditions || [])];
      newConditions[conditionIndex] = {
        ...newConditions[conditionIndex],
        ...template,
        description: template.description
      };

      return {
        ...prev,
        conditional: {
          ...prev.conditional,
          conditions: newConditions
        }
      };
    });
  }, []);

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1001,
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        width: '1000px',        // ✅ REDUCIDO: Era 1200px
        height: '700px',        // ✅ REDUCIDO: Era 850px
        maxWidth: '95vw',
        maxHeight: '95vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 32px',
          borderBottom: '1px solid #e5e7eb',
          flexShrink: 0
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: '600',
            color: '#1f2937'
          }}>
            🏁 Configuración de Flujo de Página (Página de Inicio)
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              color: '#6b7280',
              padding: '4px',
              borderRadius: '4px'
            }}
          >
            ✕
          </button>
        </div>

        {/* Información de página */}
        <div style={{
          padding: '16px 32px',
          background: '#f8fafc',
          borderBottom: '1px solid #e5e7eb',
          flexShrink: 0
        }}>
          <div style={{ fontSize: '14px', color: '#374151' }}>
            <strong>📄 Página:</strong> {(pageIndex || 0) + 1}. {pageData?.name || 'Sin nombre'}
            <span style={{ marginLeft: '16px', color: '#6b7280' }}>
              <strong>Elementos:</strong> {pageData?.elements?.length || 0}
            </span>
            <span style={{ marginLeft: '16px', color: '#6b7280' }}>
              <strong>Tamaño:</strong> {pageData?.size?.preset || 'Personalizado'}
            </span>
            {/* ✅ NUEVO: Indicador de variables disponibles */}
            <span style={{ marginLeft: '16px', color: '#16a34a' }}>
              <strong>Variables:</strong> {Object.keys(availableVariables).length} disponibles
            </span>
          </div>
          
          {/* ✅ NUEVA: Explicación del concepto */}
          <div style={{ 
            marginTop: '8px', 
            fontSize: '12px', 
            color: '#6b7280',
            fontStyle: 'italic'
          }}>
            💡 <strong>Configurar página de inicio:</strong> Determina en cuál página interna comenzará este documento cuando se renderice
          </div>
        </div>

        {/* Contenido principal - REDISEÑADO MÁS COMPACTO */}
        <div style={{ 
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: 0
        }}>
          {/* ✅ NUEVO: Selector de tipo en la parte superior */}
          <div style={{
            padding: '24px 32px 16px 32px',
            borderBottom: '1px solid #e5e7eb',
            flexShrink: 0
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', margin: 0 }}>
              🎯 Tipo de Página
            </h3>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              {Object.entries(PAGE_FLOW_TYPES).map(([key, value]) => {
                const configs = {
                  [PAGE_FLOW_TYPES.SIMPLE]: {
                    title: '📄 Simple',
                    description: 'Inicia en página específica',
                    color: '#10b981'
                  },
                  [PAGE_FLOW_TYPES.CONDITIONAL]: {
                    title: '🔀 Condicional',
                    description: 'Según condiciones de datos',
                    color: '#f59e0b'
                  },
                  [PAGE_FLOW_TYPES.REPEATED]: {
                    title: '🔁 Repetida',
                    description: 'Por cada elemento del array',
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
                      flex: 1,
                      padding: '16px',
                      border: isSelected ? `2px solid ${config.color}` : '2px solid #e5e7eb',
                      borderRadius: '8px',
                      background: isSelected ? `${config.color}15` : 'white',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      marginBottom: '4px',
                      color: isSelected ? config.color : '#374151'
                    }}>
                      {config.title}
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#6b7280',
                      lineHeight: '1.3'
                    }}>
                      {config.description}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ✅ NUEVO: Selector de página de inicio para Simple */}
            {flowConfig.type === PAGE_FLOW_TYPES.SIMPLE && (
              <div style={{ 
                marginTop: '16px',
                padding: '12px',
                background: '#f0fdf4',
                borderRadius: '6px',
                border: '1px solid #bbf7d0'
              }}>
                <label style={{
                  display: 'block',
                  fontSize: '12px',
                  fontWeight: '500',
                  marginBottom: '6px',
                  color: '#166534'
                }}>
                  🏁 Página de inicio:
                </label>
                <select
                  value={flowConfig.simple?.startPageIndex ?? 0}
                  onChange={(e) => {
                    const pageIndex = parseInt(e.target.value);
                    const pageId = pages[pageIndex]?.id || null;
                    updateFlowConfig('simple.startPageIndex', pageIndex);
                    updateFlowConfig('simple.startPageId', pageId);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #bbf7d0',
                    borderRadius: '4px',
                    fontSize: '13px',
                    backgroundColor: 'white'
                  }}
                >
                  {pages.map((page, index) => (
                    <option key={index} value={index}>
                      {index + 1}. {page.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* ✅ NUEVO: Configuración específica según tipo */}
          <div style={{
            flex: 1,
            padding: '24px 32px',
            overflowY: 'auto',
            minHeight: 0
          }}>
            {/* Solo mostrar configuración adicional para Condicional y Repetida */}
            {flowConfig.type === PAGE_FLOW_TYPES.CONDITIONAL && (
              <PageFlowConditionsTab
                flowConfig={flowConfig}
                updateFlowConfig={updateFlowConfig}
                errors={errors}
                pages={pages}
                availableVariables={availableVariables}
                addCondition={addCondition}
                removeCondition={removeCondition}
                applyConditionTemplate={applyConditionTemplate}
              />
            )}
            
            {flowConfig.type === PAGE_FLOW_TYPES.REPEATED && (
              <PageFlowRepetitionTab
                flowConfig={flowConfig}
                updateFlowConfig={updateFlowConfig}
                errors={errors}
                pages={pages}
                availableVariables={availableVariables}
              />
            )}

            {flowConfig.type === PAGE_FLOW_TYPES.SIMPLE && (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
                <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                  Configuración Completa
                </div>
                <div style={{ fontSize: '14px' }}>
                  La página simple está configurada para iniciar en la página seleccionada arriba.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '24px 32px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: '#f8fafc',
          flexShrink: 0
        }}>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            <strong>Configurando flujo para:</strong> {pageData?.name || 'Página sin nombre'}
            {Object.keys(errors).length > 0 && (
              <span style={{ color: '#ef4444', marginLeft: '12px' }}>
                • {Object.keys(errors).length} error{Object.keys(errors).length !== 1 ? 'es' : ''}
              </span>
            )}
            {/* ✅ NUEVA: Información sobre el concepto */}
            <div style={{ marginTop: '4px', fontSize: '11px', color: '#8b5cf6' }}>
              🏁 Sin Next Page: Solo página de inicio • Monaco Editor habilitado para scripts avanzados
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '12px 24px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: 'white',
                color: '#374151',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            
            <button
              onClick={handleSave}
              disabled={Object.keys(errors).length > 0}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '6px',
                background: Object.keys(errors).length > 0 ? '#94a3b8' : '#3b82f6',
                color: 'white',
                fontSize: '14px',
                fontWeight: '600',
                cursor: Object.keys(errors).length > 0 ? 'not-allowed' : 'pointer'
              }}
            >
              💾 Guardar Configuración
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageFlowConfigModal;