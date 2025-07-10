// src/components/layoutDesigner/PageManager/PageManager.jsx - VERSIÓN COMPACTA OPTIMIZADA
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
          <div key={category} style={{ marginBottom: '12px' }}>
            <h4 style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '6px',
              textTransform: 'uppercase'
            }}>
              {category === 'iso' ? '📏 ISO' :
               category === 'northAmerica' ? '🇺🇸 N.América' : 
               '⚙️ Custom'}
            </h4>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))',
              gap: '6px'
            }}>
              {Array.isArray(presets) && presets.map(preset => (
                <button
                  key={preset.name}
                  onClick={() => handleApplyPreset(preset)}
                  style={{
                    padding: '6px 4px',
                    border: newPageConfig.size.preset === preset.name ? 
                      '2px solid #3b82f6' : '1px solid #d1d5db',
                    borderRadius: '4px',
                    background: newPageConfig.size.preset === preset.name ? 
                      '#eff6ff' : 'white',
                    fontSize: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center'
                  }}
                >
                  <div style={{ fontWeight: '600', marginBottom: '2px', color: '#1f2937' }}>
                    {preset.name}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '8px' }}>
                    {preset.width}×{preset.height}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ✅ NUEVO: Renderizar miniatura de página compacta
  const renderCompactPageThumbnail = (page, index) => {
    const isActive = index === currentPageIndex;
    const aspectRatio = page.size ? (page.size.width / page.size.height) : 0.707;
    const thumbnailHeight = 32; // Reducido de 60 a 32
    const thumbnailWidth = Math.min(thumbnailHeight * aspectRatio, 45); // Reducido

    return (
      <div
        key={page.id || `page-${index}`}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 8px', // Reducido padding
          border: isActive ? '2px solid #3b82f6' : '1px solid #d1d5db',
          borderRadius: '6px',
          background: isActive ? '#eff6ff' : 'white',
          cursor: 'pointer',
          transition: 'all 0.2s',
          minWidth: '120px', // Ancho fijo más pequeño
          fontSize: '11px'
        }}
        onClick={() => onGoToPage && onGoToPage(index)}
      >
        {/* Miniatura más pequeña */}
        <div style={{
          width: thumbnailWidth,
          height: thumbnailHeight,
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '2px',
          position: 'relative',
          overflow: 'hidden',
          flexShrink: 0
        }}>
          {/* Elementos en miniatura */}
          {Array.isArray(page.elements) && page.elements.slice(0, 6).map((element, idx) => (
            <div
              key={element.id || idx}
              style={{
                position: 'absolute',
                left: Math.max(0, (element.x / 500) * thumbnailWidth),
                top: Math.max(0, (element.y / 700) * thumbnailHeight),
                width: Math.max(1, (element.width || 20) / 500 * thumbnailWidth),
                height: Math.max(1, (element.height || 20) / 700 * thumbnailHeight),
                background: element.type === 'text' ? '#3b82f6' : 
                           element.type === 'rectangle' ? '#10b981' : '#f59e0b',
                borderRadius: '1px',
                opacity: 0.8
              }}
            />
          ))}
          
          {/* Indicador de más elementos */}
          {Array.isArray(page.elements) && page.elements.length > 6 && (
            <div style={{
              position: 'absolute',
              bottom: '1px',
              right: '1px',
              background: '#6b7280',
              color: 'white',
              fontSize: '6px',
              padding: '1px 2px',
              borderRadius: '1px'
            }}>
              +{page.elements.length - 6}
            </div>
          )}
        </div>

        {/* Información compacta */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '600',
            color: isActive ? '#1e40af' : '#374151',
            marginBottom: '1px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {index + 1}. {page.name || `Página ${index + 1}`}
          </div>
          
          <div style={{
            fontSize: '9px',
            color: '#6b7280',
            display: 'flex',
            justifyContent: 'space-between'
          }}>
            <span>{page.size?.preset || 'Custom'}</span>
            <span>{Array.isArray(page.elements) ? page.elements.length : 0}el</span>
          </div>
        </div>

        {/* Botones de acción compactos */}
        <div style={{
          display: 'flex',
          gap: '2px',
          opacity: isActive ? 1 : 0.5
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditPage(index);
            }}
            style={{
              padding: '2px 4px',
              border: 'none',
              borderRadius: '3px',
              background: '#f3f4f6',
              fontSize: '10px',
              cursor: 'pointer',
              color: '#3b82f6'
            }}
            title="Editar"
          >
            ✏️
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicatePage && onDuplicatePage(index);
            }}
            style={{
              padding: '2px 4px',
              border: 'none',
              borderRadius: '3px',
              background: '#f3f4f6',
              fontSize: '10px',
              cursor: 'pointer',
              color: '#059669'
            }}
            title="Duplicar"
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
                padding: '2px 4px',
                border: 'none',
                borderRadius: '3px',
                background: '#fef2f2',
                fontSize: '10px',
                cursor: 'pointer',
                color: '#dc2626'
              }}
              title="Eliminar"
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
      alignItems: 'center',
      gap: '8px',
      padding: '6px 12px', // Reducido de 12px
      background: '#f8fafc',
      borderRadius: '6px',
      border: '1px solid #e2e8f0',
      fontSize: '12px'
    }}>
      {/* Header compacto con controles principales */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        flexShrink: 0
      }}>
        {/* Título e indicador */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <span style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151'
          }}>
            📄 {safePages.length} pág{safePages.length !== 1 ? 's' : ''}
          </span>
          
          {safePages.length > 1 && (
            <span style={{
              fontSize: '10px',
              color: '#6b7280',
              background: '#e5e7eb',
              padding: '1px 4px',
              borderRadius: '8px'
            }}>
              {currentPageIndex + 1}/{safePages.length}
            </span>
          )}
        </div>

        {/* Controles principales */}
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={() => {
              resetNewPageConfig();
              setShowPageModal(true);
            }}
            style={{
              padding: '4px 8px',
              border: '1px solid #3b82f6',
              borderRadius: '4px',
              background: '#eff6ff',
              color: '#1e40af',
              fontSize: '10px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}
            title="Agregar nueva página"
          >
            ➕ Nueva
          </button>
          
          {currentPage && (
            <>
              <button
                onClick={() => setShowSizeModal(true)}
                style={{
                  padding: '4px 6px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  background: 'white',
                  fontSize: '10px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
                title="Cambiar tamaño"
              >
                📐
              </button>
              
              <button
                onClick={() => onToggleOrientation && onToggleOrientation(currentPageIndex)}
                style={{
                  padding: '4px 6px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  background: 'white',
                  fontSize: '10px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
                title={`Cambiar a ${currentPage.orientation === 'portrait' ? 'horizontal' : 'vertical'}`}
              >
                🔄
              </button>
            </>
          )}
        </div>
      </div>

      {/* Separador */}
      <div style={{
        width: '1px',
        height: '20px',
        background: '#e5e7eb',
        flexShrink: 0
      }} />

      {/* Lista horizontal de páginas */}
      <div style={{
        flex: 1,
        display: 'flex',
        gap: '6px',
        overflowX: 'auto',
        overflowY: 'hidden',
        minHeight: '44px', // Altura fija reducida
        alignItems: 'center',
        paddingRight: '4px'
      }}>
        {safePages.length === 0 ? (
          <div style={{
            color: '#9ca3af',
            fontSize: '11px',
            fontStyle: 'italic'
          }}>
            No hay páginas
          </div>
        ) : (
          safePages.map((page, index) => renderCompactPageThumbnail(page, index))
        )}
      </div>

      {/* Información de página actual compacta */}
      {currentPage && (
        <div style={{
          flexShrink: 0,
          fontSize: '10px',
          color: '#6b7280',
          textAlign: 'right',
          minWidth: '80px'
        }}>
          <div style={{ fontWeight: '600', color: '#374151' }}>
            {currentPage.size?.preset || 'Custom'}
          </div>
          <div>
            {currentPage.size?.width || 210}×{currentPage.size?.height || 297}{currentPage.size?.unit || 'mm'}
          </div>
        </div>
      )}

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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Nombre */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              marginBottom: '4px',
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
                padding: '8px 12px',
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
              marginBottom: '6px',
              color: '#374151'
            }}>
              🔄 Orientación
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { value: 'portrait', label: 'Vertical', icon: '📄' },
                { value: 'landscape', label: 'Horizontal', icon: '📃' }
              ].map(option => (
                <button
                  key={option.value}
                  onClick={() => setNewPageConfig(prev => ({ ...prev, orientation: option.value }))}
                  style={{
                    flex: 1,
                    padding: '12px',
                    border: newPageConfig.orientation === option.value ? 
                      '2px solid #3b82f6' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    background: newPageConfig.orientation === option.value ? 
                      '#eff6ff' : 'white',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '12px'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{option.icon}</span>
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
              marginBottom: '8px',
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
            paddingTop: '16px',
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {currentPage && (
            <div style={{
              padding: '10px',
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
              marginBottom: '6px'
            }}>
              Tamaños Comunes
            </h4>
            
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '6px'
            }}>
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
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
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