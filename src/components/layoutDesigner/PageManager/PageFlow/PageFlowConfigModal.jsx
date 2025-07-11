// src/components/layoutDesigner/PageManager/PageFlowConfigModal.jsx - MODAL MÁS GRANDE
import React, { useState, useEffect, useCallback } from 'react';
import { 
  PAGE_FLOW_TYPES, 
  CONDITION_TYPES, 
  OPERATORS,
  CONDITION_TEMPLATES,
  DEFAULT_PAGE_FLOW_CONFIG
} from '../../utils/pageFlow.constants';

// Importar componentes de pestañas
import PageFlowTypeTab from './PageFlowTypeTab';
import PageFlowConditionsTab from './PageFlowConditionsTab';
import PageFlowRepetitionTab from './PageFlowRepetitionTab';
import PageFlowNextPageTab from './PageFlowNextPageTab';
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
        });
        break;
        
      case PAGE_FLOW_TYPES.REPEATED:
        if (!flowConfig.repeated?.dataSource?.variableName) {
          newErrors.dataSource = 'Variable de datos requerida';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [flowConfig]);

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
      variable: '',
      operator: OPERATORS.EQUALS,
      value: '',
      script: '',
      targetPageId: null,
      targetPageIndex: null,
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

  // Definir pestañas disponibles
  const availableTabs = [
    { id: 'type', label: '🎯 Tipo de Página', component: PageFlowTypeTab },
    { 
      id: 'conditions', 
      label: '📋 Condiciones', 
      component: PageFlowConditionsTab,
      show: flowConfig.type === PAGE_FLOW_TYPES.CONDITIONAL 
    },
    { 
      id: 'repetition', 
      label: '🔁 Repetición', 
      component: PageFlowRepetitionTab,
      show: flowConfig.type === PAGE_FLOW_TYPES.REPEATED 
    },
    { id: 'nextPage', label: '➡️ Página Siguiente', component: PageFlowNextPageTab },
    { id: 'preview', label: '👁️ Vista Previa', component: PageFlowPreviewTab }
  ].filter(tab => tab.show !== false);

  // Obtener componente de pestaña activa
  const ActiveTabComponent = availableTabs.find(tab => tab.id === activeTab)?.component || PageFlowTypeTab;

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
        width: '1200px',        // ✅ CAMBIADO: Era 900px
        height: '850px',        // ✅ CAMBIADO: Era 700px, ahora 850px
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
            🔄 Configuración de Flujo de Página
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
        </div>

        {/* Pestañas */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb',
          flexShrink: 0
        }}>
          {availableTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '16px 20px',
                border: 'none',
                borderBottom: activeTab === tab.id ? '3px solid #3b82f6' : '3px solid transparent',
                background: activeTab === tab.id ? '#eff6ff' : 'transparent',
                color: activeTab === tab.id ? '#1e40af' : '#6b7280',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenido principal - MÁS ESPACIO */}
        <div style={{ 
          flex: 1,
          padding: '32px',
          overflowY: 'auto',
          minHeight: 0,
          // ✅ NUEVO: Más espacio para Monaco Editor
          maxHeight: 'calc(850px - 200px)' // Ajustar según altura del modal
        }}>
          <ActiveTabComponent
            flowConfig={flowConfig}
            updateFlowConfig={updateFlowConfig}
            errors={errors}
            pages={pages}
            availableVariables={availableVariables}
            addCondition={addCondition}
            removeCondition={removeCondition}
            applyConditionTemplate={applyConditionTemplate}
          />
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
            Configurando flujo para: <strong>{pageData?.name || 'Página sin nombre'}</strong>
            {Object.keys(errors).length > 0 && (
              <span style={{ color: '#ef4444', marginLeft: '12px' }}>
                • {Object.keys(errors).length} error{Object.keys(errors).length !== 1 ? 'es' : ''}
              </span>
            )}
            {/* ✅ NUEVO: Información adicional en footer */}
            <span style={{ marginLeft: '16px', color: '#16a34a' }}>
              • Monaco Editor habilitado para scripts avanzados
            </span>
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