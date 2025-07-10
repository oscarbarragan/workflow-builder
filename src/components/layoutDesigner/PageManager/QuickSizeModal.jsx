// src/components/layoutDesigner/PageManager/QuickSizeModal.jsx
import React from 'react';
import Modal from '../../common/Modal/Modal';
import Button from '../../common/Button/Button';

const QuickSizeModal = ({
  isOpen,
  onClose,
  currentPage,
  currentPageIndex,
  onApplyPreset,
  onEditAdvanced,
  getPageSizePresets
}) => {
  if (!currentPage) return null;

  const sizePresets = getPageSizePresets ? getPageSizePresets() : {
    iso: [],
    northAmerica: [],
    custom: []
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="📐 Cambio Rápido de Tamaño"
      size="small"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Información de página actual */}
        <div style={{
          padding: '12px',
          background: '#f0f9ff',
          borderRadius: '8px',
          border: '1px solid #0ea5e9'
        }}>
          <div style={{ 
            fontSize: '13px', 
            color: '#0c4a6e', 
            fontWeight: '600',
            marginBottom: '4px'
          }}>
            📄 {currentPage.name || `Página ${currentPageIndex + 1}`}
          </div>
          <div style={{ fontSize: '12px', color: '#0c4a6e' }}>
            <strong>Actual:</strong> {currentPage.size?.width || 210} × {currentPage.size?.height || 297} {currentPage.size?.unit || 'mm'}
          </div>
          <div style={{ fontSize: '11px', color: '#0369a1', marginTop: '2px' }}>
            {currentPage.size?.preset || 'Personalizado'} • {currentPage.orientation === 'portrait' ? 'Vertical' : 'Horizontal'}
          </div>
        </div>

        {/* Presets más comunes */}
        <div>
          <h4 style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>
            📏 Tamaños Más Usados
          </h4>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '8px'
          }}>
            {(() => {
              // Combinar los presets más comunes
              const commonPresets = [];
              
              // Agregar A4, A3, A5 desde ISO
              if (sizePresets.iso && Array.isArray(sizePresets.iso)) {
                const isoCommon = sizePresets.iso.filter(p => 
                  ['A3', 'A4', 'A5'].includes(p.name)
                );
                commonPresets.push(...isoCommon);
              }
              
              // Agregar Letter y Legal desde Norte América
              if (sizePresets.northAmerica && Array.isArray(sizePresets.northAmerica)) {
                const naCommon = sizePresets.northAmerica.filter(p => 
                  ['Letter', 'Legal'].includes(p.name)
                );
                commonPresets.push(...naCommon);
              }
              
              // Agregar algunos personalizados
              if (sizePresets.custom && Array.isArray(sizePresets.custom)) {
                commonPresets.push(...sizePresets.custom.slice(0, 2));
              }
              
              return commonPresets.slice(0, 6).map(preset => (
                <button
                  key={preset.name}
                  onClick={() => onApplyPreset && onApplyPreset(preset.name)}
                  style={{
                    padding: '12px 8px',
                    border: currentPage.size?.preset === preset.name ? 
                      '2px solid #3b82f6' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    background: currentPage.size?.preset === preset.name ? 
                      '#eff6ff' : 'white',
                    fontSize: '11px',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage.size?.preset !== preset.name) {
                      e.target.style.background = '#f9fafb';
                      e.target.style.borderColor = '#9ca3af';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage.size?.preset !== preset.name) {
                      e.target.style.background = 'white';
                      e.target.style.borderColor = '#d1d5db';
                    }
                  }}
                >
                  <div style={{ 
                    fontWeight: '600', 
                    marginBottom: '3px',
                    color: currentPage.size?.preset === preset.name ? '#1e40af' : '#1f2937'
                  }}>
                    {preset.name}
                  </div>
                  <div style={{ 
                    color: '#6b7280', 
                    fontSize: '9px',
                    lineHeight: '1.2'
                  }}>
                    {preset.width} × {preset.height}
                    <br />
                    {preset.unit}
                  </div>
                </button>
              ));
            })()}
          </div>
        </div>

        {/* Todos los presets por categoría */}
        <div>
          <h4 style={{
            fontSize: '12px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '8px'
          }}>
            📋 Todos los Tamaños
          </h4>
          
          <div style={{
            maxHeight: '200px',
            overflowY: 'auto',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            background: '#fafafa'
          }}>
            {Object.entries(sizePresets).map(([category, presets]) => (
              <div key={category} style={{ marginBottom: '8px' }}>
                <div style={{
                  fontSize: '10px',
                  fontWeight: '600',
                  color: '#374151',
                  padding: '6px 8px',
                  background: '#e5e7eb',
                  textTransform: 'uppercase',
                  borderBottom: '1px solid #d1d5db'
                }}>
                  {category === 'iso' ? '📏 ISO' :
                   category === 'northAmerica' ? '🇺🇸 Norte América' : 
                   '⚙️ Personalizado'}
                </div>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '4px',
                  padding: '6px'
                }}>
                  {Array.isArray(presets) && presets.map(preset => (
                    <button
                      key={preset.name}
                      onClick={() => onApplyPreset && onApplyPreset(preset.name)}
                      style={{
                        padding: '6px 4px',
                        border: currentPage.size?.preset === preset.name ? 
                          '1px solid #3b82f6' : '1px solid #d1d5db',
                        borderRadius: '3px',
                        background: currentPage.size?.preset === preset.name ? 
                          '#eff6ff' : 'white',
                        fontSize: '9px',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ 
                        fontWeight: '600',
                        color: currentPage.size?.preset === preset.name ? '#1e40af' : '#1f2937',
                        marginBottom: '1px'
                      }}>
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
        </div>

        {/* Información sobre orientación */}
        <div style={{
          padding: '8px 12px',
          background: '#fefce8',
          borderRadius: '6px',
          border: '1px solid #fbbf24'
        }}>
          <div style={{
            fontSize: '11px',
            color: '#92400e',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>💡</span>
            <span>
              Los tamaños se aplicarán respetando la orientación actual 
              ({currentPage.orientation === 'portrait' ? 'vertical' : 'horizontal'})
            </span>
          </div>
        </div>

        {/* Botones de acción */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px',
          paddingTop: '8px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <Button
            onClick={onClose}
            variant="secondary"
            size="small"
          >
            Cancelar
          </Button>
          
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button
              onClick={onEditAdvanced}
              variant="outline"
              size="small"
              style={{
                fontSize: '11px',
                color: '#6b7280',
                borderColor: '#d1d5db'
              }}
            >
              ⚙️ Configuración Avanzada
            </Button>
            
            <Button
              onClick={onClose}
              variant="primary"
              size="small"
            >
              ✅ Aplicar
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default QuickSizeModal;