// src/components/layoutDesigner/PageManager/PageManager.jsx - VERSIÓN COMPLETA
import React, { useState, useCallback } from 'react';
import Button from '../../common/Button/Button';
import Modal from '../../common/Modal/Modal';

const PageManager = ({ 
  pages = [],
  currentPageIndex = 0,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  onGoToPage,
  onReorderPages,
  onUpdatePageConfig,
  onToggleOrientation,
  onApplyPreset,
  getPageSizePresets = () => ({ iso: [], northAmerica: [], custom: [] })
}) => {
  // Estados locales
  const [showPageModal, setShowPageModal] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [editingPageIndex, setEditingPageIndex] = useState(null);
  const [newPageConfig, setNewPageConfig] = useState({
    name: '',
    size: { preset: 'A4', width: 210, height: 297, unit: 'mm' },
    orientation: 'portrait'
  });

  // Protección contra datos vacíos
  const safePages = Array.isArray(pages) ? pages : [];
  const currentPage = safePages[currentPageIndex] || null;
  const sizePresets = getPageSizePresets();

  // ✅ Resetear configuración
  const resetNewPageConfig = useCallback(() => {
    setNewPageConfig({
      name: '',
      size: { preset: 'A4', width: 210, height: 297, unit: 'mm' },
      orientation: 'portrait'
    });
  }, []);

  // ✅ Manejar creación de página
  const handleCreatePage = useCallback(() => {
    if (!onAddPage) {
      console.warn('⚠️ onAddPage not provided');
      return;
    }

    const config = {
      name: newPageConfig.name || `Página ${safePages.length + 1}`,
      size: { ...newPageConfig.size },
      orientation: newPageConfig.orientation
    };
    
    onAddPage(null, config);
    setShowPageModal(false);
    resetNewPageConfig();
    console.log('✅ Page created:', config);
  }, [newPageConfig, safePages.length, onAddPage, resetNewPageConfig]);

  // ✅ Manejar edición de página
  const handleEditPage = useCallback((pageIndex) => {
    const page = safePages[pageIndex];
    if (!page) {
      console.warn('⚠️ Page not found for editing:', pageIndex);
      return;
    }

    setEditingPageIndex(pageIndex);
    setNewPageConfig({
      name: page.name || `Página ${pageIndex + 1}`,
      size: { ...page.size },
      orientation: page.orientation || 'portrait'
    });
    setShowPageModal(true);
  }, [safePages]);

  // ✅ Manejar actualización de página
  const handleUpdatePage = useCallback(() => {
    if (editingPageIndex === null || !onUpdatePageConfig) {
      console.warn('⚠️ Invalid state for page update');
      return;
    }

    onUpdatePageConfig(editingPageIndex, {
      name: newPageConfig.name,
      size: { ...newPageConfig.size },
      orientation: newPageConfig.orientation
    });
    
    setShowPageModal(false);
    setEditingPageIndex(null);
    resetNewPageConfig();
    console.log('✅ Page updated:', editingPageIndex);
  }, [editingPageIndex, newPageConfig, onUpdatePageConfig, resetNewPageConfig]);

  // ✅ Aplicar preset de tamaño
  const handleApplyPreset = useCallback((preset) => {
    setNewPageConfig(prev => ({
      ...prev,
      size: {
        ...preset,
        preset: preset.name
      }
    }));
  }, []);

  // ✅ Manejar aplicación rápida de preset
  const handleQuickApplyPreset = useCallback((presetName) => {
    if (!onApplyPreset) {
      console.warn('⚠️ onApplyPreset not provided');
      return;
    }

    onApplyPreset(presetName, currentPageIndex);
    setShowSizeModal(false);
  }, [onApplyPreset, currentPageIndex]);

  // ✅ Renderizar selector de preset
  const renderPresetSelector = () => {
    return (
      <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {Object.entries(sizePresets).map(([category, presets]) => (
          <div key={category} style={{ marginBottom: '16px' }}>
            <h4 style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
              textTransform: 'uppercase'
            }}>
              {category === 'iso' ? '📏 ISO (A4, A3, etc.)' :
               category === 'northAmerica' ? '🇺🇸 Norte América' : 
               category === 'custom' ? '⚙️ Personalizado' : category}
            </h4>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
              gap: '8px'
            }}>
              {Array.isArray(presets) && presets.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => handleApplyPreset(preset)}
                  style={{
                    padding: '10px 8px',
                    border: newPageConfig.size.preset === preset.name ? 
                      '2px solid #3b82f6' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    background: newPageConfig.size.preset === preset.name ? 
                      '#eff6ff' : 'white',
                    fontSize: '11px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontWeight: '600', marginBottom: '3px', color: '#1f2937' }}>
                    {preset.name}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '9px' }}>
                    {preset.width} × {preset.height} {preset.unit}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ✅ Renderizar miniatura de página
  const renderPageThumbnail = (page, index) => {
    const isActive = index === currentPageIndex;
    const aspectRatio = page.size ? (page.size.width / page.size.height) : 0.707;
    const thumbnailHeight = 60;
    const thumbnailWidth = Math.min(thumbnailHeight * aspectRatio, 80);

    return (
      <div
        key={page.id || `page-${index}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          padding: '10px',
          border: isActive ? '2px solid #3b82f6' : '1px solid #d1d5db',
          borderRadius: '8px',
          background: isActive ? '#eff6ff' : 'white',
          cursor: 'pointer',
          transition: 'all 0.2s',
          minWidth: '110px'
        }}
        onClick={() => onGoToPage && onGoToPage(index)}
      >
        {/* Miniatura */}
        <div style={{
          width: thumbnailWidth,
          height: thumbnailHeight,
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '3px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Elementos en miniatura */}
          {Array.isArray(page.elements) && page.elements.slice(0, 8).map((element, idx) => (
            <div
              key={element.id || idx}
              style={{
                position: 'absolute',
                left: Math.max(0, (element.x / 500) * thumbnailWidth),
                top: Math.max(0, (element.y / 700) * thumbnailHeight),
                width: Math.max(2, (element.width || 20) / 500 * thumbnailWidth),
                height: Math.max(2, (element.height || 20) / 700 * thumbnailHeight),
                background: element.type === 'text' ? '#3b82f6' : 
                           element.type === 'rectangle' ? '#10b981' : '#f59e0b',
                borderRadius: '1px',
                opacity: 0.7
              }}
            />
          ))}
          
          {/* Indicador de más elementos */}
          {Array.isArray(page.elements) && page.elements.length > 8 && (
            <div style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              background: '#6b7280',
              color: 'white',
              fontSize: '7px',
              padding: '1px 3px',
              borderRadius: '2px'
            }}>
              +{page.elements.length - 8}
            </div>
          )}
        </div>

        {/* Información de página */}
        <div style={{ textAlign: 'center', width: '100%' }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '600',
            color: isActive ? '#1e40af' : '#374151',
            marginBottom: '2px'
          }}>
            {index + 1}. {page.name || `Página ${index + 1}`}
          </div>
          
          <div style={{
            fontSize: '9px',
            color: '#6b7280'
          }}>
            {page.size?.preset || 'Custom'} • {Array.isArray(page.elements) ? page.elements.length : 0} elem.
          </div>
        </div>

        {/* Botones de acción */}
        <div style={{
          display: 'flex',
          gap: '4px',
          marginTop: '2px'
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditPage(index);
            }}
            style={{
              padding: '3px 6px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              background: 'white',
              fontSize: '10px',
              cursor: 'pointer',
              color: '#3b82f6'
            }}
            title="Editar página"
          >
            ✏️
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicatePage && onDuplicatePage(index);
            }}
            style={{
              padding: '3px 6px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              background: 'white',
              fontSize: '10px',
              cursor: 'pointer',
              color: '#059669'
            }}
            title="Duplicar página"
          >
            📋
          </button>
          
          {safePages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`¿Eliminar "${page.name || `Página ${index + 1}`}"?`)) {
                  onDeletePage && onDeletePage(index);
                }
              }}
              style={{
                padding: '3px 6px',
                border: '1px solid #fecaca',
                borderRadius: '4px',
                background: 'white',
                fontSize: '10px',
                cursor: 'pointer',
                color: '#dc2626'
              }}
              title="Eliminar página"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '12px',
      background: '#f8fafc',
      borderRadius: '8px',
      border: '1px solid #e2e8f0'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '14px',
          fontWeight: '600',
          color: '#374151',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📄 Páginas ({safePages.length})
          {safePages.length > 1 && (
            <span style={{
              fontSize: '11px',
              fontWeight: '400',
              color: '#6b7280',
              background: '#e5e7eb',
              padding: '2px 6px',
              borderRadius: '10px'
            }}>
              {currentPageIndex + 1} de {safePages.length}
            </span>
          )}
        </h3>

        <div style={{ display: 'flex', gap: '6px' }}>
          <Button
            onClick={() => {
              resetNewPageConfig();
              setShowPageModal(true);
            }}
            size="small"
            variant="primary"
            title="Agregar nueva página"
          >
            ➕ Nueva
          </Button>
          
          {currentPage && (
            <Button
              onClick={() => setShowSizeModal(true)}
              size="small"
              variant="secondary"
              title="Cambiar tamaño de página actual"
            >
              📐 Tamaño
            </Button>
          )}
        </div>
      </div>

      {/* Información de página actual */}
      {currentPage && (
        <div style={{
          background: 'white',
          padding: '10px 12px',
          borderRadius: '6px',
          border: '1px solid #e5e7eb',
          fontSize: '12px'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <div style={{ flex: 1, minWidth: '200px' }}>
              <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                {currentPage.name || `Página ${currentPageIndex + 1}`}
              </div>
              <div style={{ color: '#6b7280', fontSize: '11px' }}>
                {currentPage.size?.preset || 'Custom'} 
                ({currentPage.size?.width || 210} × {currentPage.size?.height || 297} {currentPage.size?.unit || 'mm'})
                • {Array.isArray(currentPage.elements) ? currentPage.elements.length : 0} elementos
              </div>
            </div>
            
            <button
              onClick={() => onToggleOrientation && onToggleOrientation(currentPageIndex)}
              style={{
                padding: '6px 10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: 'white',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
              title="Cambiar orientación"
            >
              🔄 {currentPage.orientation === 'portrait' ? 'Vertical' : 'Horizontal'}
            </button>
          </div>
        </div>
      )}

      {/* Lista de páginas */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        padding: '8px',
        background: 'white',
        borderRadius: '6px',
        border: '1px solid #e5e7eb',
        minHeight: '120px'
      }}>
        {safePages.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            color: '#6b7280',
            fontSize: '12px'
          }}>
            No hay páginas disponibles
          </div>
        ) : (
          safePages.map((page, index) => renderPageThumbnail(page, index))
        )}
      </div>

      {/* Modal para crear/editar página */}
      <Modal
        isOpen={showPageModal}
        onClose={() => {
          setShowPageModal(false);
          setEditingPageIndex(null);
          resetNewPageConfig();
        }}
        title={editingPageIndex !== null ? '✏️ Editar Página' : '➕ Nueva Página'}
        size="medium"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Nombre */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              marginBottom: '6px',
              color: '#374151'
            }}>
              📝 Nombre de la Página
            </label>
            <input
              type="text"
              value={newPageConfig.name}
              onChange={(e) => setNewPageConfig(prev => ({ ...prev, name: e.target.value }))}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px',
                boxSizing: 'border-box'
              }}
              placeholder="Ej: Portada, Página principal..."
            />
          </div>

          {/* Orientación */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              marginBottom: '8px',
              color: '#374151'
            }}>
              🔄 Orientación
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { value: 'portrait', label: 'Vertical', icon: '📄' },
                { value: 'landscape', label: 'Horizontal', icon: '📃' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setNewPageConfig(prev => ({ ...prev, orientation: option.value }))}
                  style={{
                    flex: 1,
                    padding: '14px',
                    border: newPageConfig.orientation === option.value ? 
                      '2px solid #3b82f6' : '1px solid #d1d5db',
                    borderRadius: '8px',
                    background: newPageConfig.orientation === option.value ? 
                      '#eff6ff' : 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px'
                  }}
                >
                  <span style={{ fontSize: '18px' }}>{option.icon}</span>
                  <span style={{ fontWeight: '500' }}>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Presets de tamaño */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              marginBottom: '10px',
              color: '#374151'
            }}>
              📐 Tamaño de Página
            </label>
            {renderPresetSelector()}
          </div>

          {/* Botones */}
          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <Button
              onClick={() => {
                setShowPageModal(false);
                setEditingPageIndex(null);
                resetNewPageConfig();
              }}
              variant="secondary"
            >
              Cancelar
            </Button>
            
            <Button
              onClick={editingPageIndex !== null ? handleUpdatePage : handleCreatePage}
              variant="primary"
            >
              {editingPageIndex !== null ? '💾 Actualizar' : '➕ Crear Página'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal rápido para cambio de tamaño */}
      <Modal
        isOpen={showSizeModal}
        onClose={() => setShowSizeModal(false)}
        title="📐 Cambiar Tamaño de Página"
        size="small"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {currentPage && (
            <div style={{
              padding: '12px',
              background: '#f0f9ff',
              borderRadius: '6px',
              border: '1px solid #0ea5e9'
            }}>
              <div style={{ fontSize: '12px', color: '#0c4a6e', fontWeight: '600' }}>
                Página Actual: {currentPage.name || `Página ${currentPageIndex + 1}`}
              </div>
              <div style={{ fontSize: '11px', color: '#0c4a6e' }}>
                {currentPage.size?.width || 210} × {currentPage.size?.height || 297} {currentPage.size?.unit || 'mm'}
              </div>
            </div>
          )}

          {/* Presets rápidos */}
          <div>
            <h4 style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Tamaños Comunes
            </h4>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px'
            }}>
              {/* Usar presets seguros con validación */}
              {(() => {
                const commonPresets = [];
                if (sizePresets.iso && Array.isArray(sizePresets.iso)) {
                  commonPresets.push(...sizePresets.iso.slice(0, 4));
                }
                if (sizePresets.custom && Array.isArray(sizePresets.custom)) {
                  commonPresets.push(...sizePresets.custom.slice(0, 2));
                }
                return commonPresets.map(preset => (
                  <button
                    key={preset.name}
                    onClick={() => handleQuickApplyPreset(preset.name)}
                    style={{
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      background: 'white',
                      fontSize: '11px',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontWeight: '600' }}>{preset.name}</div>
                    <div style={{ color: '#6b7280', fontSize: '10px' }}>
                      {preset.width} × {preset.height} {preset.unit}
                    </div>
                  </button>
                ));
              })()}
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '8px'
          }}>
            <Button
              onClick={() => setShowSizeModal(false)}
              variant="secondary"
              size="small"
            >
              Cerrar
            </Button>
            
            <Button
              onClick={() => {
                handleEditPage(currentPageIndex);
                setShowSizeModal(false);
              }}
              variant="primary"
              size="small"
            >
              ✏️ Editar Avanzado
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PageManager;