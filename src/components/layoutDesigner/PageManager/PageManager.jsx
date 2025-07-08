// src/components/layoutDesigner/PageManager/PageManager.jsx
import React, { useState } from 'react';
import Button from '../../common/Button/Button';
import Modal from '../../common/Modal/Modal';

const PageManager = ({ 
  pages,
  currentPageIndex,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  onGoToPage,
  onReorderPages,
  onUpdatePageConfig,
  onToggleOrientation,
  onApplyPreset,
  getPageSizePresets
}) => {
  const [showPageModal, setShowPageModal] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [editingPageIndex, setEditingPageIndex] = useState(null);
  const [newPageConfig, setNewPageConfig] = useState({
    name: '',
    size: { preset: 'A4', width: 210, height: 297, unit: 'mm' },
    orientation: 'portrait'
  });

  const currentPage = pages[currentPageIndex];
  const sizePresets = getPageSizePresets();

  // ✅ Manejar creación de página
  const handleCreatePage = () => {
    const config = {
      name: newPageConfig.name || `Página ${pages.length + 1}`,
      size: { ...newPageConfig.size },
      orientation: newPageConfig.orientation
    };
    
    onAddPage(null, config);
    setShowPageModal(false);
    setNewPageConfig({
      name: '',
      size: { preset: 'A4', width: 210, height: 297, unit: 'mm' },
      orientation: 'portrait'
    });
  };

  // ✅ Manejar edición de página
  const handleEditPage = (pageIndex) => {
    setEditingPageIndex(pageIndex);
    const page = pages[pageIndex];
    setNewPageConfig({
      name: page.name,
      size: { ...page.size },
      orientation: page.orientation
    });
    setShowPageModal(true);
  };

  // ✅ Manejar actualización de página
  const handleUpdatePage = () => {
    if (editingPageIndex !== null) {
      onUpdatePageConfig(editingPageIndex, {
        name: newPageConfig.name,
        size: { ...newPageConfig.size },
        orientation: newPageConfig.orientation
      });
    }
    
    setShowPageModal(false);
    setEditingPageIndex(null);
  };

  // ✅ Aplicar preset de tamaño
  const handleApplyPreset = (preset) => {
    setNewPageConfig(prev => ({
      ...prev,
      size: {
        ...preset,
        preset: preset.name
      }
    }));
  };

  // ✅ Renderizar selector de preset
  const renderPresetSelector = () => (
    <div>
      {Object.entries(sizePresets).map(([category, presets]) => (
        <div key={category} style={{ marginBottom: '16px' }}>
          <h4 style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px',
            textTransform: 'uppercase'
          }}>
            {category === 'iso' ? 'ISO (A4, A3, etc.)' :
             category === 'northAmerica' ? 'Norte América' : 'Personalizado'}
          </h4>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
            gap: '8px'
          }}>
            {presets.map(preset => (
              <button
                key={preset.name}
                onClick={() => handleApplyPreset(preset)}
                style={{
                  padding: '8px',
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
                onMouseOver={(e) => {
                  if (newPageConfig.size.preset !== preset.name) {
                    e.target.style.background = '#f8fafc';
                  }
                }}
                onMouseOut={(e) => {
                  if (newPageConfig.size.preset !== preset.name) {
                    e.target.style.background = 'white';
                  }
                }}
              >
                <div style={{ fontWeight: '600', marginBottom: '2px' }}>
                  {preset.name}
                </div>
                <div style={{ color: '#6b7280', fontSize: '10px' }}>
                  {preset.width} × {preset.height} {preset.unit}
                </div>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  // ✅ Renderizar miniatura de página
  const renderPageThumbnail = (page, index) => {
    const isActive = index === currentPageIndex;
    const aspectRatio = page.size.width / page.size.height;
    const thumbnailHeight = 60;
    const thumbnailWidth = Math.min(thumbnailHeight * aspectRatio, 80);

    return (
      <div
        key={page.id}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '4px',
          padding: '8px',
          border: isActive ? '2px solid #3b82f6' : '1px solid #d1d5db',
          borderRadius: '6px',
          background: isActive ? '#eff6ff' : 'white',
          cursor: 'pointer',
          transition: 'all 0.2s',
          minWidth: '100px'
        }}
        onClick={() => onGoToPage(index)}
        onMouseOver={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = '#f8fafc';
            e.currentTarget.style.borderColor = '#9ca3af';
          }
        }}
        onMouseOut={(e) => {
          if (!isActive) {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.borderColor = '#d1d5db';
          }
        }}
      >
        {/* Miniatura */}
        <div style={{
          width: thumbnailWidth,
          height: thumbnailHeight,
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '2px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          {/* Representación visual de elementos */}
          {page.elements.slice(0, 8).map((element, idx) => {
            const elementX = (element.x / 500) * thumbnailWidth;
            const elementY = (element.y / 700) * thumbnailHeight;
            const elementW = Math.max(2, (element.width || 20) / 500 * thumbnailWidth);
            const elementH = Math.max(2, (element.height || 20) / 700 * thumbnailHeight);
            
            return (
              <div
                key={idx}
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
          {page.elements.length > 8 && (
            <div style={{
              position: 'absolute',
              bottom: '2px',
              right: '2px',
              background: '#6b7280',
              color: 'white',
              fontSize: '8px',
              padding: '1px 3px',
              borderRadius: '2px'
            }}>
              +{page.elements.length - 8}
            </div>
          )}
        </div>

        {/* Información de página */}
        <div style={{ textAlign: 'center' }}>
          <div style={{
            fontSize: '11px',
            fontWeight: '600',
            color: isActive ? '#1e40af' : '#374151',
            marginBottom: '2px'
          }}>
            {index + 1}. {page.name}
          </div>
          
          <div style={{
            fontSize: '9px',
            color: '#6b7280'
          }}>
            {page.size.preset || 'Custom'} • {page.elements.length} elem.
          </div>
        </div>

        {/* Botones de acción */}
        <div style={{
          display: 'flex',
          gap: '4px',
          marginTop: '4px'
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditPage(index);
            }}
            style={{
              padding: '2px 4px',
              border: '1px solid #d1d5db',
              borderRadius: '3px',
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
              onDuplicatePage(index);
            }}
            style={{
              padding: '2px 4px',
              border: '1px solid #d1d5db',
              borderRadius: '3px',
              background: 'white',
              fontSize: '10px',
              cursor: 'pointer',
              color: '#059669'
            }}
            title="Duplicar página"
          >
            📋
          </button>
          
          {pages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`¿Eliminar "${page.name}"?`)) {
                  onDeletePage(index);
                }
              }}
              style={{
                padding: '2px 4px',
                border: '1px solid #fecaca',
                borderRadius: '3px',
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
          gap: '6px'
        }}>
          📄 Páginas ({pages.length})
        </h3>

        <div style={{ display: 'flex', gap: '6px' }}>
          <Button
            onClick={() => setShowPageModal(true)}
            size="small"
            variant="primary"
            title="Agregar nueva página"
          >
            ➕ Nueva
          </Button>
          
          <Button
            onClick={() => setShowSizeModal(true)}
            size="small"
            variant="secondary"
            title="Cambiar tamaño de página actual"
          >
            📐 Tamaño
          </Button>
        </div>
      </div>

      {/* Información de página actual */}
      <div style={{
        background: 'white',
        padding: '8px 12px',
        borderRadius: '6px',
        border: '1px solid #e5e7eb',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>{currentPage?.name}</strong> • {currentPage?.size.preset} 
            ({currentPage?.size.width} × {currentPage?.size.height} {currentPage?.size.unit})
          </div>
          
          <button
            onClick={() => onToggleOrientation(currentPageIndex)}
            style={{
              padding: '4px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              background: 'white',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Cambiar orientación"
          >
            🔄 {currentPage?.orientation === 'portrait' ? 'Vertical' : 'Horizontal'}
          </button>
        </div>
      </div>

      {/* Lista de páginas */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        padding: '8px',
        background: 'white',
        borderRadius: '6px',
        border: '1px solid #e5e7eb'
      }}>
        {pages.map((page, index) => renderPageThumbnail(page, index))}
      </div>

      {/* Modal para crear/editar página */}
      <Modal
        isOpen={showPageModal}
        onClose={() => {
          setShowPageModal(false);
          setEditingPageIndex(null);
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
              Nombre de la Página
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
                fontSize: '14px'
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
              Orientación
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
                  {option.label}
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
              Tamaño de Página
            </label>
            {renderPresetSelector()}
          </div>

          {/* Tamaño personalizado */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              marginBottom: '6px',
              color: '#374151'
            }}>
              Tamaño Personalizado
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: '8px', alignItems: 'end' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#6b7280' }}>Ancho</label>
                <input
                  type="number"
                  value={newPageConfig.size.width}
                  onChange={(e) => setNewPageConfig(prev => ({
                    ...prev,
                    size: { ...prev.size, width: parseFloat(e.target.value) || 0, preset: 'Custom' }
                  }))}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                  min="1"
                  step="0.1"
                />
              </div>
              
              <div>
                <label style={{ fontSize: '11px', color: '#6b7280' }}>Alto</label>
                <input
                  type="number"
                  value={newPageConfig.size.height}
                  onChange={(e) => setNewPageConfig(prev => ({
                    ...prev,
                    size: { ...prev.size, height: parseFloat(e.target.value) || 0, preset: 'Custom' }
                  }))}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                  min="1"
                  step="0.1"
                />
              </div>
              
              <div>
                <label style={{ fontSize: '11px', color: '#6b7280' }}>Unidad</label>
                <select
                  value={newPageConfig.size.unit}
                  onChange={(e) => setNewPageConfig(prev => ({
                    ...prev,
                    size: { ...prev.size, unit: e.target.value }
                  }))}
                  style={{
                    width: '100%',
                    padding: '6px 8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '12px'
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
            paddingTop: '16px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <Button
              onClick={() => {
                setShowPageModal(false);
                setEditingPageIndex(null);
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
          <div style={{
            padding: '12px',
            background: '#f0f9ff',
            borderRadius: '6px',
            border: '1px solid #0ea5e9'
          }}>
            <div style={{ fontSize: '12px', color: '#0c4a6e', fontWeight: '600' }}>
              Página Actual: {currentPage?.name}
            </div>
            <div style={{ fontSize: '11px', color: '#0c4a6e' }}>
              {currentPage?.size.width} × {currentPage?.size.height} {currentPage?.size.unit}
            </div>
          </div>

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
                  onClick={() => {
                    onApplyPreset(preset.name, currentPageIndex);
                    setShowSizeModal(false);
                  }}
                  style={{
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    background: 'white',
                    fontSize: '11px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseOver={(e) => e.target.style.background = '#f8fafc'}
                  onMouseOut={(e) => e.target.style.background = 'white'}
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

//asas