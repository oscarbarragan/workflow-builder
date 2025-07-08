// src/components/layoutDesigner/PageManager/PageManager.jsx - MEJORADO
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

  // ✅ Renderizar selector de preset mejorado
  const renderPresetSelector = useCallback(() => (
    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
      {Object.entries(sizePresets).map(([category, presets]) => (
        <div key={category} style={{ marginBottom: '16px' }}>
          <h4 style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
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
                  textAlign: 'center',
                  boxShadow: newPageConfig.size.preset === preset.name ? 
                    '0 2px 4px rgba(59, 130, 246, 0.2)' : 'none'
                }}
                onMouseOver={(e) => {
                  if (newPageConfig.size.preset !== preset.name) {
                    e.target.style.background = '#f8fafc';
                    e.target.style.borderColor = '#9ca3af';
                  }
                }}
                onMouseOut={(e) => {
              e.target.style.background = 'white';
              e.target.style.borderColor = '#d1d5db';
            }}
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
              color: '#059669',
              transition: 'all 0.2s'
            }}
            title="Duplicar página"
            onMouseOver={(e) => {
              e.target.style.background = '#ecfdf5';
              e.target.style.borderColor = '#059669';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'white';
              e.target.style.borderColor = '#d1d5db';
            }}
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
                color: '#dc2626',
                transition: 'all 0.2s'
              }}
              title="Eliminar página"
              onMouseOver={(e) => {
                e.target.style.background = '#fef2f2';
                e.target.style.borderColor = '#dc2626';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'white';
                e.target.style.borderColor = '#fecaca';
              }}
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    );
  }, [currentPageIndex, safePages.length, onGoToPage, onDuplicatePage, onDeletePage, handleEditPage]);

  // Renderizado principal
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '12px',
      background: '#f8fafc',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
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
                gap: '6px',
                transition: 'all 0.2s'
              }}
              title="Cambiar orientación"
              onMouseOver={(e) => {
                e.target.style.background = '#f8fafc';
                e.target.style.borderColor = '#9ca3af';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'white';
                e.target.style.borderColor = '#d1d5db';
              }}
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
              autoFocus
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
                    fontSize: '12px',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    if (newPageConfig.orientation !== option.value) {
                      e.target.style.background = '#f8fafc';
                    }
                  }}
                  onMouseOut={(e) => {
                    if (newPageConfig.orientation !== option.value) {
                      e.target.style.background = 'white';
                    }
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

          {/* Tamaño personalizado */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              marginBottom: '8px',
              color: '#374151'
            }}>
              ⚙️ Tamaño Personalizado
            </label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr 100px', 
              gap: '10px', 
              alignItems: 'end' 
            }}>
              <div>
                <label style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                  Ancho
                </label>
                <input
                  type="number"
                  value={newPageConfig.size.width || ''}
                  onChange={(e) => setNewPageConfig(prev => ({
                    ...prev,
                    size: { 
                      ...prev.size, 
                      width: parseFloat(e.target.value) || 0, 
                      preset: 'Personalizado' 
                    }
                  }))}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '12px',
                    boxSizing: 'border-box'
                  }}
                  min="1"
                  step="0.1"
                />
              </div>
              
              <div>
                <label style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                  Alto
                </label>
                <input
                  type="number"
                  value={newPageConfig.size.height || ''}
                  onChange={(e) => setNewPageConfig(prev => ({
                    ...prev,
                    size: { 
                      ...prev.size, 
                      height: parseFloat(e.target.value) || 0, 
                      preset: 'Personalizado' 
                    }
                  }))}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '12px',
                    boxSizing: 'border-box'
                  }}
                  min="1"
                  step="0.1"
                />
              </div>
              
              <div>
                <label style={{ fontSize: '11px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
                  Unidad
                </label>
                <select
                  value={newPageConfig.size.unit || 'mm'}
                  onChange={(e) => setNewPageConfig(prev => ({
                    ...prev,
                    size: { ...prev.size, unit: e.target.value }
                  }))}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '12px',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="mm">mm</option>
                  <option value="cm">cm</option>
                  <option value="in">in</option>
                  <option value="pt">pt</option>
                  <option value="px">px</option>
                </select>
              </div>
            </div>
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
              {[
                ...sizePresets.iso.slice(0, 4),
                ...sizePresets.custom.slice(0, 2)
              ].map(preset => (
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
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = '#f8fafc';
                    e.target.style.borderColor = '#3b82f6';
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = 'white';
                    e.target.style.borderColor = '#d1d5db';
                  }}
                >
                  <div style={{ fontWeight: '600' }}>{preset.name}</div>
                  <div style={{ color: '#6b7280', fontSize: '10px' }}>
                    {preset.width} × {preset.height} {preset.unit}
                  </div>
                </button>
              ))}
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
                  if (newPageConfig.size.preset !== preset.name) {
                    e.target.style.background = 'white';
                    e.target.style.borderColor = '#d1d5db';
                  }
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
  ), [sizePresets, newPageConfig.size.preset, handleApplyPreset]);

  // ✅ Renderizar miniatura de página mejorada
  const renderPageThumbnail = useCallback((page, index) => {
    const isActive = index === currentPageIndex;
    const aspectRatio = page.size ? (page.size.width / page.size.height) : 0.707; // A4 ratio por defecto
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
          minWidth: '110px',
          boxShadow: isActive ? '0 4px 8px rgba(59, 130, 246, 0.15)' : '0 1px 3px rgba(0,0,0,0.1)'
        }}
        onClick={() => onGoToPage && onGoToPage(index)}
        onMouseOver={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = '#f8fafc';
            e.currentTarget.style.borderColor = '#9ca3af';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseOut={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.borderColor = '#d1d5db';
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        {/* Miniatura */}
        <div style={{
          width: thumbnailWidth,
          height: thumbnailHeight,
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '3px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          {/* Representación visual de elementos */}
          {Array.isArray(page.elements) && page.elements.slice(0, 8).map((element, idx) => {
            const elementX = Math.max(0, Math.min((element.x / 500) * thumbnailWidth, thumbnailWidth - 2));
            const elementY = Math.max(0, Math.min((element.y / 700) * thumbnailHeight, thumbnailHeight - 2));
            const elementW = Math.max(2, Math.min((element.width || 20) / 500 * thumbnailWidth, thumbnailWidth));
            const elementH = Math.max(2, Math.min((element.height || 20) / 700 * thumbnailHeight, thumbnailHeight));
            
            return (
              <div
                key={element.id || idx}
                style={{
                  position: 'absolute',
                  left: elementX,
                  top: elementY,
                  width: elementW,
                  height: elementH,
                  background: element.type === 'text' ? '#3b82f6' : 
                             element.type === 'rectangle' ? '#10b981' : '#f59e0b',
                  borderRadius: '1px',
                  opacity: 0.7
                }}
              />
            );
          })}
          
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
              borderRadius: '2px',
              fontWeight: '600'
            }}>
              +{page.elements.length - 8}
            </div>
          )}

          {/* Indicador de orientación */}
          <div style={{
            position: 'absolute',
            top: '2px',
            left: '2px',
            fontSize: '8px',
            color: '#6b7280'
          }}>
            {page.orientation === 'landscape' ? '📄' : '📃'}
          </div>
        </div>

        {/* Información de página */}
        <div style={{ textAlign: 'center', width: '100%' }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '600',
            color: isActive ? '#1e40af' : '#374151',
            marginBottom: '2px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
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
              color: '#3b82f6',
              transition: 'all 0.2s'
            }}
            title="Editar página"
            onMouseOver={(e) => {
              e.target.style.background = '#eff6ff';
              e.target.style.borderColor = '#3b82f6';
            }}
            onMouseOut={(e) => {