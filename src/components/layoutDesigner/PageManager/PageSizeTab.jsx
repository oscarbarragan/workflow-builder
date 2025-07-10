// src/components/layoutDesigner/PageManager/PageSizeTab.jsx
import React, { useState, useCallback } from 'react';
import { unitsConfig } from '../utils/units.config';
import CustomSizeDialog from './CustomSizeDialog';

const PageSizeTab = ({
  config,
  errors,
  updateConfig,
  handleApplyPreset,
  handleOrientationChange,
  handleCustomSizeToggle,
  handleWorkingUnitChange,
  convertValue,
  enhancedSizePresets,
  onSaveCustomSize,
  onDeleteCustomSize
}) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  // Render del selector de presets
  const renderPresetSelector = () => (
    <div style={{ padding: '8px' }}>
      {Object.entries(enhancedSizePresets).map(([category, presets]) => (
        <div key={category} style={{ marginBottom: '12px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px'
          }}>
            <h4 style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#374151',
              textTransform: 'uppercase',
              background: '#e5e7eb',
              padding: '4px 8px',
              borderRadius: '4px',
              margin: 0
            }}>
              {category === 'iso' ? '📏 ISO' :
               category === 'northAmerica' ? '🇺🇸 Norte América' : 
               '⚙️ Personalizado'}
            </h4>
            
            {/* Botón para agregar tamaño personalizado */}
            {category === 'custom' && (
              <button
                onClick={() => setShowSaveDialog(true)}
                style={{
                  padding: '2px 6px',
                  border: '1px solid #3b82f6',
                  borderRadius: '3px',
                  background: '#eff6ff',
                  color: '#1e40af',
                  fontSize: '9px',
                  cursor: 'pointer',
                  fontWeight: '500'
                }}
                title="Agregar tamaño personalizado"
              >
                ➕ Nuevo
              </button>
            )}
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))',
            gap: '6px'
          }}>
            {Array.isArray(presets) && presets.map(preset => (
              <div key={preset.name} style={{ position: 'relative' }}>
                <button
                  onClick={() => handleApplyPreset(preset)}
                  disabled={config.customSize}
                  style={{
                    width: '100%',
                    padding: '6px 4px',
                    border: config.size.preset === preset.name && !config.customSize ? 
                      '2px solid #3b82f6' : '1px solid #d1d5db',
                    borderRadius: '4px',
                    background: config.size.preset === preset.name && !config.customSize ? 
                      '#eff6ff' : 'white',
                    fontSize: '10px',
                    cursor: config.customSize ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s',
                    textAlign: 'center',
                    opacity: config.customSize ? 0.5 : 1
                  }}
                >
                  <div style={{ fontWeight: '600', marginBottom: '2px', color: '#1f2937' }}>
                    {preset.name}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '8px', lineHeight: '1.2' }}>
                    {preset.width} × {preset.height}
                    <br />
                    {preset.unit}
                  </div>
                </button>
                
                {/* Botón para eliminar tamaños personalizados */}
                {preset.isUserCreated && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`¿Eliminar "${preset.name}"?`)) {
                        onDeleteCustomSize(preset);
                      }
                    }}
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      width: '16px',
                      height: '16px',
                      border: 'none',
                      borderRadius: '50%',
                      background: '#ef4444',
                      color: 'white',
                      fontSize: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title="Eliminar tamaño personalizado"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '12px',
      height: '100%',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Primera fila: Nombre y Unidad */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '16px'
      }}>
        {/* Nombre de página */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            marginBottom: '6px',
            color: '#374151'
          }}>
            📄 Nombre de la Página
          </label>
          <input
            type="text"
            value={config.name}
            onChange={(e) => updateConfig('name', e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: errors.name ? '2px solid #ef4444' : '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
            placeholder="Ej: Portada, Página principal..."
          />
          {errors.name && (
            <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>
              {errors.name}
            </div>
          )}
        </div>

        {/* Unidad de trabajo */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            marginBottom: '6px',
            color: '#374151'
          }}>
            📐 Unidad de Trabajo
          </label>
          <select
            value={config.workingUnit}
            onChange={(e) => handleWorkingUnitChange(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white'
            }}
          >
            {unitsConfig.units.map(unit => (
              <option key={unit.value} value={unit.value}>
                {unit.label} - {unit.name}
              </option>
            ))}
          </select>
          <div style={{ fontSize: '9px', color: '#6b7280', marginTop: '2px' }}>
            {unitsConfig.help.units[config.workingUnit]?.split('.')[0] || 'Unidad de medida'}
          </div>
        </div>
      </div>

      {/* Orientación compacta */}
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
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { value: 'portrait', label: 'Vertical', icon: '📄' },
            { value: 'landscape', label: 'Horizontal', icon: '📃' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => handleOrientationChange(option.value)}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: config.orientation === option.value ? 
                  '2px solid #3b82f6' : '1px solid #d1d5db',
                borderRadius: '6px',
                background: config.orientation === option.value ? 
                  '#eff6ff' : 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '12px',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '16px' }}>{option.icon}</span>
              <div>
                <div style={{ fontWeight: '500' }}>{option.label}</div>
                <div style={{ fontSize: '10px', color: '#6b7280' }}>
                  {config.orientation === option.value ? 
                    `${config.size.width} × ${config.size.height} ${config.size.unit}` : ''}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Toggle para tamaño personalizado - SIN BOTÓN EXTRA */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 12px',
        background: '#f9fafb',
        borderRadius: '6px',
        border: '1px solid #e5e7eb'
      }}>
        <input
          type="checkbox"
          id="customSize"
          checked={config.customSize}
          onChange={handleCustomSizeToggle}
          style={{ transform: 'scale(1.2)' }}
        />
        <label htmlFor="customSize" style={{
          fontSize: '12px',
          fontWeight: '500',
          color: '#374151',
          cursor: 'pointer',
          flex: 1
        }}>
          ⚙️ Usar tamaño personalizado
        </label>
        
        {/* Información visual cuando está activado */}
        {config.customSize && (
          <div style={{
            fontSize: '10px',
            color: '#16a34a',
            fontWeight: '500',
            background: '#f0fdf4',
            padding: '2px 6px',
            borderRadius: '4px',
            border: '1px solid #bbf7d0'
          }}>
            ✓ Activo
          </div>
        )}
      </div>

      {/* Presets o tamaño personalizado */}
      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {config.customSize ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <h4 style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
              flexShrink: 0
            }}>
              ⚙️ Dimensiones Personalizadas
            </h4>
            
            {/* ✅ SECCIÓN PRINCIPAL para definir tamaño personalizado */}
            <div style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              {/* Inputs para dimensiones */}
              <div style={{
                padding: '16px',
                background: '#f0f9ff',
                borderRadius: '8px',
                border: '2px solid #0ea5e9'
              }}>
                <div style={{ 
                  fontSize: '13px', 
                  fontWeight: '600', 
                  color: '#0c4a6e', 
                  marginBottom: '12px',
                  textAlign: 'center'
                }}>
                  📐 Definir Tamaño Personalizado
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '600',
                      marginBottom: '6px',
                      color: '#0c4a6e'
                    }}>
                      📏 Ancho ({config.size.unit})
                    </label>
                    <input
                      type="number"
                      value={config.size.width}
                      onChange={(e) => updateConfig('size.width', parseFloat(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: errors.width ? '2px solid #ef4444' : '2px solid #0ea5e9',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        background: 'white',
                        fontWeight: '500'
                      }}
                      min="1"
                      step="any"
                      placeholder="Ej: 210"
                    />
                    {errors.width && (
                      <div style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px' }}>
                        {errors.width}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: '600',
                      marginBottom: '6px',
                      color: '#0c4a6e'
                    }}>
                      📏 Alto ({config.size.unit})
                    </label>
                    <input
                      type="number"
                      value={config.size.height}
                      onChange={(e) => updateConfig('size.height', parseFloat(e.target.value) || 0)}
                      style={{
                        width: '100%',
                        padding: '12px',
                        border: errors.height ? '2px solid #ef4444' : '2px solid #0ea5e9',
                        borderRadius: '6px',
                        fontSize: '14px',
                        boxSizing: 'border-box',
                        background: 'white',
                        fontWeight: '500'
                      }}
                      min="1"
                      step="any"
                      placeholder="Ej: 297"
                    />
                    {errors.height && (
                      <div style={{ color: '#ef4444', fontSize: '10px', marginTop: '4px' }}>
                        {errors.height}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Vista previa del tamaño */}
                <div style={{
                  marginTop: '12px',
                  padding: '8px 12px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '4px',
                  textAlign: 'center',
                  border: '1px solid #3b82f6'
                }}>
                  <div style={{ fontSize: '11px', color: '#1e40af', fontWeight: '500' }}>
                    📊 Tamaño: {config.size.width} × {config.size.height} {config.size.unit}
                  </div>
                  <div style={{ fontSize: '10px', color: '#1e40af', marginTop: '2px' }}>
                    Proporción: {(config.size.width / config.size.height).toFixed(2)}:1 • 
                    {config.size.width > config.size.height ? ' Apaisado' : ' Vertical'}
                  </div>
                </div>
              </div>
              
              {/* Información adicional y botón para guardar */}
              <div style={{
                padding: '16px',
                background: '#f8fafc',
                borderRadius: '6px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: '600', 
                  color: '#374151', 
                  marginBottom: '8px',
                  textAlign: 'center'
                }}>
                  💾 ¿Guardar este tamaño para uso futuro?
                </div>
                
                <div style={{ fontSize: '11px', color: '#6b7280', marginBottom: '12px', textAlign: 'center' }}>
                  Los tamaños guardados aparecerán en la sección "Personalizado" para crear nuevas páginas
                </div>
                
                {/* Botón prominente para guardar tamaño - MOVIDO AQUÍ */}
                <button
                  onClick={() => setShowSaveDialog(true)}
                  disabled={!config.size.width || !config.size.height || config.size.width <= 0 || config.size.height <= 0}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    background: config.size.width > 0 && config.size.height > 0 ? '#16a34a' : '#94a3b8',
                    color: 'white',
                    fontSize: '13px',
                    cursor: config.size.width > 0 && config.size.height > 0 ? 'pointer' : 'not-allowed',
                    fontWeight: '600',
                    transition: 'all 0.2s',
                    boxShadow: config.size.width > 0 && config.size.height > 0 ? '0 2px 4px rgba(22, 163, 74, 0.2)' : 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (config.size.width > 0 && config.size.height > 0) {
                      e.target.style.background = '#15803d';
                      e.target.style.transform = 'translateY(-1px)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (config.size.width > 0 && config.size.height > 0) {
                      e.target.style.background = '#16a34a';
                      e.target.style.transform = 'translateY(0)';
                    }
                  }}
                >
                  💾 Guardar como Tamaño Personalizado
                </button>
              </div>
              
              {/* Información de píxeles */}
              <div style={{
                padding: '12px',
                background: '#fffbeb',
                borderRadius: '6px',
                border: '1px solid #fbbf24'
              }}>
                <div style={{ fontSize: '11px', color: '#92400e', textAlign: 'center' }}>
                  📊 <strong>En píxeles:</strong> {Math.round(convertValue(config.size.width, config.size.unit, 'px'))} × {Math.round(convertValue(config.size.height, config.size.unit, 'px'))} px
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
            <h4 style={{
              fontSize: '12px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px',
              flexShrink: 0
            }}>
              📐 Tamaños Predefinidos
            </h4>
            <div style={{ 
              flex: 1,
              overflowY: 'auto',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              background: '#fafafa',
              minHeight: 0
            }}>
              {renderPresetSelector()}
            </div>
          </div>
        )}
      </div>

      {/* Diálogo para guardar tamaño personalizado */}
      <CustomSizeDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={onSaveCustomSize}
        currentSize={{
          width: config.size.width,
          height: config.size.height,
          unit: config.size.unit
        }}
      />
    </div>
  );
};

export default PageSizeTab;