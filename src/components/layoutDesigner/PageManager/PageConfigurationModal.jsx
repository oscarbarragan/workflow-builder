// src/components/layoutDesigner/PageManager/PageConfigurationModal.jsx - USANDO COMPONENTES SEPARADOS
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
      top: 10,
      right: 10,
      bottom: 10,
      left: 10,
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
        margins: pageData.margins || { top: 10, right: 10, bottom: 10, left: 10, unit: 'mm' },
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
        margins: { top: 10, right: 10, bottom: 10, left: 10, unit: 'mm' },
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'edit' ? '✏️ Editar Página' : '➕ Nueva Página'}
      size="large"
    >
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        height: '600px',
        maxHeight: '70vh'
      }}>
        {/* Pestañas */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb',
          marginBottom: '20px'
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
                padding: '12px 16px',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                background: activeTab === tab.id ? '#eff6ff' : 'transparent',
                color: activeTab === tab.id ? '#1e40af' : '#6b7280',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Contenido de pestañas */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto',
          padding: '0 20px',
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

        {/* Botones de acción */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderTop: '1px solid #e5e7eb',
          backgroundColor: 'white',
          marginTop: 'auto',
          flexShrink: 0
        }}>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>
            {mode === 'edit' ? 'Editando página existente' : 'Creando nueva página'}
            {customSizes.length > 0 && (
              <span style={{ marginLeft: '12px', color: '#16a34a' }}>
                • {customSizes.length} tamaño{customSizes.length !== 1 ? 's' : ''} personalizado{customSizes.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button onClick={onClose} variant="secondary">
              Cancelar
            </Button>
            <Button onClick={handleSave} variant="primary">
              {mode === 'edit' ? '💾 Actualizar' : '➕ Crear Página'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PageConfigurationModal;