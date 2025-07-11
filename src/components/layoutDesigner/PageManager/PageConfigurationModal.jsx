// src/components/layoutDesigner/PageManager/PageConfigurationModal.jsx - FOOTER CORREGIDO
import React, { useState, useEffect, useCallback } from 'react';
import Modal from '../../common/Modal/Modal';
import Button from '../../common/Button/Button';
import { unitsConfig } from '../utils/units.config';
import PageSizeTab from './PageSizeTab';
import PageMarginsTab from './PageMarginsTab';
import PageAdvancedTab from './PageAdvancedTab';

const PageConfigurationModal = ({
  isOpen,
  onClose,
  onSave,
  pageData = null,
  mode = 'create',
  getPageSizePresets
}) => {
  // Estado principal simplificado
  const [config, setConfig] = useState({
    name: '',
    size: {
      preset: 'A4',
      width: 210,
      height: 297,
      unit: 'mm'
    },
    orientation: 'portrait',
    margins: {
      top: 0,     // ✅ CAMBIADO: Era 10, ahora 0
      right: 0,   // ✅ CAMBIADO: Era 10, ahora 0
      bottom: 0,  // ✅ CAMBIADO: Era 10, ahora 0
      left: 0,    // ✅ CAMBIADO: Era 10, ahora 0
      unit: 'mm'
    },
    customSize: false,
    workingUnit: 'mm',
    dpi: 300
  });

  const [customSizes, setCustomSizes] = useState([]);
  const [activeTab, setActiveTab] = useState('size');
  const [errors, setErrors] = useState({});

  // Cargar tamaños personalizados del localStorage
  useEffect(() => {
    try {
      const savedSizes = localStorage.getItem('layoutDesigner_customPageSizes');
      if (savedSizes) {
        const parsedSizes = JSON.parse(savedSizes);
        setCustomSizes(parsedSizes);
        console.log('✅ Custom sizes loaded:', parsedSizes.length);
      }
    } catch (error) {
      console.warn('Error loading custom page sizes:', error);
    }
  }, []);

  // Cargar datos de página existente o crear nueva
  useEffect(() => {
    if (pageData && mode === 'edit') {
      console.log('📝 Loading page data for edit:', pageData);
      setConfig({
        name: pageData.name || `Página ${Date.now()}`,
        size: pageData.size || { preset: 'A4', width: 210, height: 297, unit: 'mm' },
        orientation: pageData.orientation || 'portrait',
        margins: pageData.margins || { top: 0, right: 0, bottom: 0, left: 0, unit: 'mm' }, // ✅ FALLBACK CON MÁRGENES CERO
        customSize: pageData.size?.preset === 'Custom' || false,
        workingUnit: pageData.workingUnit || pageData.size?.unit || 'mm',
        dpi: pageData.dpi || 300
      });
    } else if (mode === 'create') {
      const defaultName = `Página ${Date.now()}`;
      console.log('➕ Creating new page with name:', defaultName);
      setConfig({
        name: defaultName,
        size: { preset: 'A4', width: 210, height: 297, unit: 'mm' },
        orientation: 'portrait',
        margins: { top: 0, right: 0, bottom: 0, left: 0, unit: 'mm' }, // ✅ MÁRGENES CERO
        customSize: false,
        workingUnit: 'mm',
        dpi: 300
      });
    }
    
    setErrors({});
    setActiveTab('size');
  }, [pageData, mode, isOpen]);

  // Obtener presets incluyendo personalizados
  const enhancedSizePresets = {
    ...(getPageSizePresets ? getPageSizePresets() : { iso: [], northAmerica: [], custom: [] }),
    custom: [
      ...(getPageSizePresets ? getPageSizePresets().custom : []),
      ...customSizes
    ]
  };

  // Guardar tamaño personalizado
  const handleSaveCustomSize = useCallback((customSize) => {
    try {
      const updatedSizes = [...customSizes, customSize];
      localStorage.setItem('layoutDesigner_customPageSizes', JSON.stringify(updatedSizes));
      setCustomSizes(updatedSizes);
      console.log('✅ Custom size saved:', customSize);
    } catch (error) {
      console.error('❌ Error saving custom size:', error);
    }
  }, [customSizes]);

  // Eliminar tamaño personalizado
  const handleDeleteCustomSize = useCallback((sizeToDelete) => {
    try {
      const updatedSizes = customSizes.filter(
        size => size.name !== sizeToDelete.name || size.createdAt !== sizeToDelete.createdAt
      );
      localStorage.setItem('layoutDesigner_customPageSizes', JSON.stringify(updatedSizes));
      setCustomSizes(updatedSizes);
      console.log('🗑️ Custom size deleted:', sizeToDelete.name);
    } catch (error) {
      console.error('❌ Error deleting custom size:', error);
    }
  }, [customSizes]);

  // Validaciones
  const validateConfig = useCallback(() => {
    const newErrors = {};

    if (!config.name || !config.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (config.customSize) {
      if (!config.size.width || config.size.width <= 0) {
        newErrors.width = 'El ancho debe ser mayor a 0';
      }
      if (!config.size.height || config.size.height <= 0) {
        newErrors.height = 'La altura debe ser mayor a 0';
      }
    }

    ['top', 'right', 'bottom', 'left'].forEach(side => {
      if (config.margins[side] < 0) {
        newErrors[`margin_${side}`] = `El margen ${side} no puede ser negativo`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [config]);

  // Actualizar configuración
  const updateConfig = useCallback((path, value) => {
    setConfig(prev => {
      const newConfig = { ...prev };
      const keys = path.split('.');
      let current = newConfig;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newConfig;
    });
  }, []);

  // Aplicar preset de tamaño
  const handleApplyPreset = useCallback((preset) => {
    setConfig(prev => ({
      ...prev,
      size: {
        preset: preset.name,
        width: preset.width,
        height: preset.height,
        unit: preset.unit
      },
      customSize: false
    }));
  }, []);

  // Cambiar orientación
  const handleOrientationChange = useCallback((newOrientation) => {
    setConfig(prev => {
      if (prev.orientation === newOrientation) return prev;
      
      const newSize = {
        ...prev.size,
        width: prev.size.height,
        height: prev.size.width
      };

      return {
        ...prev,
        orientation: newOrientation,
        size: newSize
      };
    });
  }, []);

  // Toggle tamaño personalizado
  const handleCustomSizeToggle = useCallback(() => {
    setConfig(prev => ({
      ...prev,
      customSize: !prev.customSize,
      size: {
        ...prev.size,
        preset: !prev.customSize ? 'Custom' : 'A4'
      }
    }));
  }, []);

  // Convertir unidades
  const convertValue = useCallback((value, fromUnit, toUnit) => {
    return unitsConfig.utils.convert(value, fromUnit, toUnit, unitsConfig.units);
  }, []);

  // Cambiar unidad de trabajo
  const handleWorkingUnitChange = useCallback((newUnit) => {
    setConfig(prev => {
      const newSize = {
        ...prev.size,
        width: convertValue(prev.size.width, prev.size.unit, newUnit),
        height: convertValue(prev.size.height, prev.size.unit, newUnit),
        unit: newUnit
      };

      const newMargins = {
        top: convertValue(prev.margins.top, prev.margins.unit, newUnit),
        right: convertValue(prev.margins.right, prev.margins.unit, newUnit),
        bottom: convertValue(prev.margins.bottom, prev.margins.unit, newUnit),
        left: convertValue(prev.margins.left, prev.margins.unit, newUnit),
        unit: newUnit
      };

      return {
        ...prev,
        workingUnit: newUnit,
        size: newSize,
        margins: newMargins
      };
    });
  }, [convertValue]);

  // Guardar configuración
  const handleSave = useCallback(() => {
    if (!validateConfig()) {
      return;
    }

    const finalName = config.name?.trim() || `Página ${Date.now()}`;
    
    const finalConfig = {
      ...config,
      name: finalName,
      createdAt: mode === 'create' ? new Date().toISOString() : pageData?.createdAt,
      updatedAt: new Date().toISOString()
    };

    console.log('💾 Saving page config:', finalConfig);
    onSave(finalConfig);
    onClose();
  }, [config, validateConfig, mode, pageData, onSave, onClose]);

  if (!isOpen) return null;

  // ✅ RENDERIZACIÓN DIRECTA SIN COMPONENTE MODAL PARA CONTROL TOTAL
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      boxSizing: 'border-box'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '8px',
        width: '1200px',
        height: '850px',
        maxWidth: '95vw',
        maxHeight: '95vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden'
      }}>
        {/* ✅ HEADER FIJO */}
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
            {mode === 'edit' ? '✏️ Editar Página' : '➕ Nueva Página'}
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

        {/* ✅ PESTAÑAS FIJAS */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb',
          flexShrink: 0
        }}>
          {[
            { id: 'size', label: '📐 Tamaño' },
            { id: 'margins', label: '📏 Márgenes' },
            { id: 'advanced', label: '⚙️ Avanzado' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: '18px 24px',
                border: 'none',
                borderBottom: activeTab === tab.id ? '3px solid #3b82f6' : '3px solid transparent',
                background: activeTab === tab.id ? '#eff6ff' : 'transparent',
                color: activeTab === tab.id ? '#1e40af' : '#6b7280',
                fontSize: '15px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ✅ CONTENIDO PRINCIPAL - FLEX 1 PARA OCUPAR ESPACIO */}
        <div style={{ 
          flex: 1,
          padding: '32px',
          overflowY: 'auto',
          minHeight: 0
        }}>
          {activeTab === 'size' && (
            <PageSizeTab
              config={config}
              errors={errors}
              updateConfig={updateConfig}
              handleApplyPreset={handleApplyPreset}
              handleOrientationChange={handleOrientationChange}
              handleCustomSizeToggle={handleCustomSizeToggle}
              handleWorkingUnitChange={handleWorkingUnitChange}
              convertValue={convertValue}
              enhancedSizePresets={enhancedSizePresets}
              onSaveCustomSize={handleSaveCustomSize}
              onDeleteCustomSize={handleDeleteCustomSize}
            />
          )}
          
          {activeTab === 'margins' && (
            <PageMarginsTab
              config={config}
              errors={errors}
              updateConfig={updateConfig}
              convertValue={convertValue}
            />
          )}
          
          {activeTab === 'advanced' && (
            <PageAdvancedTab
              config={config}
              updateConfig={updateConfig}
              convertValue={convertValue}
              customSizes={customSizes}
            />
          )}
        </div>

        {/* ✅ FOOTER FIJO EN LA PARTE INFERIOR */}
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
            {mode === 'edit' ? 'Editando página existente' : 'Creando nueva página'}
            {customSizes.length > 0 && (
              <span style={{ marginLeft: '12px', color: '#16a34a' }}>
                • {customSizes.length} tamaño{customSizes.length !== 1 ? 's' : ''} personalizado{customSizes.length !== 1 ? 's' : ''}
              </span>
            )}
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
                fontSize: '15px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              style={{
                padding: '12px 24px',
                border: 'none',
                borderRadius: '6px',
                background: '#3b82f6',
                color: 'white',
                fontSize: '15px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {mode === 'edit' ? '💾 Actualizar' : '➕ Crear Página'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PageConfigurationModal;