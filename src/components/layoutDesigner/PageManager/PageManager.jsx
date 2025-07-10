// src/components/layoutDesigner/PageManager/PageManager.jsx - CORREGIDO
import React, { useState, useCallback } from 'react';
import Button from '../../common/Button/Button';
import PageThumbnail from './PageThumbnail';
import PageConfigurationModal from './PageConfigurationModal';
import QuickSizeModal from './QuickSizeModal';

const PageManager = ({ 
  pages = [],
  currentPageIndex = 0,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  onGoToPage,
  onUpdatePageConfig,
  onToggleOrientation,
  onApplyPreset,
  getPageSizePresets = () => ({ iso: [], northAmerica: [], custom: [] }),
  compact = false
}) => {
  // Estados locales
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showQuickSizeModal, setShowQuickSizeModal] = useState(false);
  const [editingPageIndex, setEditingPageIndex] = useState(null);

  // Protección contra datos vacíos
  const safePages = Array.isArray(pages) ? pages : [];
  const currentPage = safePages[currentPageIndex] || null;

  // ✅ Crear nueva página
  const handleCreatePage = useCallback(() => {
    setEditingPageIndex(null);
    setShowConfigModal(true);
  }, []);

  // ✅ Editar página existente
  const handleEditPage = useCallback((pageIndex) => {
    setEditingPageIndex(pageIndex);
    setShowConfigModal(true);
  }, []);

  // ✅ CORREGIDO: Guardar configuración de página usando el hook
  const handleSavePageConfig = useCallback((config) => {
    console.log('💾 Saving page config:', config);
    
    if (editingPageIndex !== null) {
      // Editar página existente
      console.log('✏️ Editing existing page at index:', editingPageIndex);
      onUpdatePageConfig && onUpdatePageConfig(editingPageIndex, config);
    } else {
      // ✅ CORREGIDO: Crear nueva página - pasar config completo
      console.log('➕ Creating new page with config:', config);
      // El hook usePageManager espera (position, pageConfig), así que pasamos null como position
      onAddPage && onAddPage(null, config);
    }
    
    setShowConfigModal(false);
    setEditingPageIndex(null);
  }, [editingPageIndex, onUpdatePageConfig, onAddPage]);

  // ✅ Cerrar modales
  const handleCloseModals = useCallback(() => {
    setShowConfigModal(false);
    setShowQuickSizeModal(false);
    setEditingPageIndex(null);
  }, []);

  // ✅ Aplicar preset rápido
  const handleQuickApplyPreset = useCallback((presetName) => {
    if (onApplyPreset && currentPageIndex !== null) {
      onApplyPreset(presetName, currentPageIndex);
    }
    setShowQuickSizeModal(false);
  }, [onApplyPreset, currentPageIndex]);

  // ✅ Renderizado compacto (para uso en header)
  if (compact) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '4px 8px',
        background: '#f8fafc',
        borderRadius: '4px',
        border: '1px solid #e2e8f0',
        fontSize: '11px'
      }}>
        {/* Información básica */}
        <span style={{ color: '#374151', fontWeight: '500' }}>
          📄 {safePages.length} pág{safePages.length !== 1 ? 's' : ''}
        </span>
        
        {safePages.length > 1 && (
          <span style={{
            color: '#6b7280',
            background: '#e5e7eb',
            padding: '1px 4px',
            borderRadius: '6px',
            fontSize: '9px'
          }}>
            {currentPageIndex + 1}/{safePages.length}
          </span>
        )}

        {/* Botón nueva página */}
        <button
          onClick={handleCreatePage}
          style={{
            padding: '3px 6px',
            border: '1px solid #3b82f6',
            borderRadius: '3px',
            background: '#eff6ff',
            color: '#1e40af',
            fontSize: '9px',
            cursor: 'pointer'
          }}
        >
          ➕
        </button>

        {/* Modal */}
        <PageConfigurationModal
          isOpen={showConfigModal}
          onClose={handleCloseModals}
          onSave={handleSavePageConfig}
          pageData={editingPageIndex !== null ? safePages[editingPageIndex] : null}
          mode={editingPageIndex !== null ? 'edit' : 'create'}
          getPageSizePresets={getPageSizePresets}
        />
      </div>
    );
  }

  // ✅ Renderizado completo
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '8px 16px',
      background: '#f8fafc',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      fontSize: '12px'
    }}>
      {/* Header con controles principales */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexShrink: 0
      }}>
        {/* Información de páginas */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#374151'
          }}>
            📄 Páginas
          </span>
          
          <div style={{
            background: '#e5e7eb',
            padding: '2px 8px',
            borderRadius: '12px',
            fontSize: '11px',
            color: '#374151',
            fontWeight: '500'
          }}>
            {safePages.length} total{safePages.length > 1 ? ` • ${currentPageIndex + 1} activa` : ''}
          </div>
        </div>

        {/* Controles principales */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <Button
            onClick={handleCreatePage}
            variant="primary"
            size="small"
            style={{
              fontSize: '11px',
              padding: '6px 12px',
              background: '#3b82f6',
              border: '1px solid #3b82f6'
            }}
          >
            ➕ Nueva Página
          </Button>
          
          {currentPage && (
            <>
              <button
                onClick={() => setShowQuickSizeModal(true)}
                style={{
                  padding: '6px 8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  background: 'white',
                  fontSize: '11px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  transition: 'all 0.2s'
                }}
                title="Cambiar tamaño rápido"
                onMouseEnter={(e) => {
                  e.target.style.background = '#f3f4f6';
                  e.target.style.borderColor = '#9ca3af';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.borderColor = '#d1d5db';
                }}
              >
                📐 Tamaño
              </button>
              
              <button
                onClick={() => onToggleOrientation && onToggleOrientation(currentPageIndex)}
                style={{
                  padding: '6px 8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  background: 'white',
                  fontSize: '11px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  transition: 'all 0.2s'
                }}
                title={`Cambiar a ${currentPage.orientation === 'portrait' ? 'horizontal' : 'vertical'}`}
                onMouseEnter={(e) => {
                  e.target.style.background = '#f3f4f6';
                  e.target.style.borderColor = '#9ca3af';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.borderColor = '#d1d5db';
                }}
              >
                🔄 {currentPage.orientation === 'portrait' ? '📄→📃' : '📃→📄'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Separador */}
      <div style={{
        width: '1px',
        height: '24px',
        background: '#e5e7eb',
        flexShrink: 0
      }} />

      {/* Lista de páginas */}
      <div style={{
        flex: 1,
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        overflowY: 'hidden',
        minHeight: '48px',
        alignItems: 'center',
        paddingRight: '8px'
      }}>
        {safePages.length === 0 ? (
          <div style={{
            color: '#9ca3af',
            fontSize: '12px',
            fontStyle: 'italic',
            padding: '8px 16px',
            textAlign: 'center',
            border: '1px dashed #d1d5db',
            borderRadius: '6px',
            background: '#fafafa'
          }}>
            📄 No hay páginas - Crea la primera página
          </div>
        ) : (
          safePages.map((page, index) => (
            <PageThumbnail
              key={page.id || `page-${index}`}
              page={page}
              index={index}
              isActive={index === currentPageIndex}
              totalPages={safePages.length}
              onSelect={onGoToPage}
              onEdit={handleEditPage}
              onDuplicate={onDuplicatePage}
              onDelete={onDeletePage}
              thumbnailSize="normal"
            />
          ))
        )}
      </div>

      {/* Información de página actual */}
      {currentPage && (
        <div style={{
          flexShrink: 0,
          fontSize: '10px',
          color: '#6b7280',
          textAlign: 'right',
          minWidth: '100px',
          padding: '8px 12px',
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '6px'
        }}>
          <div style={{ 
            fontWeight: '600', 
            color: '#374151',
            marginBottom: '2px' 
          }}>
            {currentPage.size?.preset || 'Custom'}
          </div>
          <div style={{ marginBottom: '2px' }}>
            {currentPage.size?.width || 210} × {currentPage.size?.height || 297} {currentPage.size?.unit || 'mm'}
          </div>
          <div style={{ color: '#8b5cf6', fontSize: '9px' }}>
            {currentPage.orientation === 'portrait' ? '📄 Vertical' : '📃 Horizontal'}
          </div>
          {currentPage.margins && (
            <div style={{ 
              color: '#059669', 
              fontSize: '9px',
              marginTop: '2px' 
            }}>
              📏 M: {currentPage.margins.top}×{currentPage.margins.right}×{currentPage.margins.bottom}×{currentPage.margins.left}
            </div>
          )}
        </div>
      )}

      {/* Modales */}
      <PageConfigurationModal
        isOpen={showConfigModal}
        onClose={handleCloseModals}
        onSave={handleSavePageConfig}
        pageData={editingPageIndex !== null ? safePages[editingPageIndex] : null}
        mode={editingPageIndex !== null ? 'edit' : 'create'}
        getPageSizePresets={getPageSizePresets}
      />

      <QuickSizeModal
        isOpen={showQuickSizeModal}
        onClose={() => setShowQuickSizeModal(false)}
        currentPage={currentPage}
        currentPageIndex={currentPageIndex}
        onApplyPreset={handleQuickApplyPreset}
        onEditAdvanced={() => {
          setShowQuickSizeModal(false);
          handleEditPage(currentPageIndex);
        }}
        getPageSizePresets={getPageSizePresets}
      />
    </div>
  );
};

export default PageManager;