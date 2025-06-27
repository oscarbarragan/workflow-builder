// src/components/layout-designer/LayoutDesigner/PropertiesPanel.jsx - CON ESTILOS DE INSPIRE DESIGNER
import React, { useState } from 'react';
import { ELEMENT_TYPES, TEXT_STYLE_PROPERTIES, PARAGRAPH_STYLE_PROPERTIES, TEXT_STYLE_PRESETS } from '../../../utils/constants';
import { Type, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

const PropertiesPanel = ({ 
  selectedElement, 
  onUpdateSelectedElement, 
  availableData = {} 
}) => {
  const [activeTab, setActiveTab] = useState('properties');
  
  const panelStyle = {
    flex: '0 0 320px', // Más ancho para acomodar los controles de estilo
    width: '320px',
    background: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '16px',
    overflowY: 'auto',
    maxHeight: '100%'
  };

  const renderFormField = (label, field, type = 'text', options = {}) => {
    const fieldStyle = {
      width: '100%',
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '14px',
      boxSizing: 'border-box',
      transition: 'border-color 0.2s'
    };

    const labelStyle = {
      display: 'block',
      fontSize: '14px',
      fontWeight: '500',
      marginBottom: '6px',
      color: '#374151'
    };

    return (
      <div style={{ marginBottom: '16px' }}>
        <label style={labelStyle}>
          {label}
        </label>
        
        {type === 'select' ? (
          <select
            value={selectedElement[field] || options.default || ''}
            onChange={(e) => onUpdateSelectedElement(field, e.target.value)}
            style={fieldStyle}
          >
            {options.placeholder && (
              <option value="">{options.placeholder}</option>
            )}
            {options.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            value={selectedElement[field] || ''}
            onChange={(e) => onUpdateSelectedElement(field, e.target.value)}
            style={{
              ...fieldStyle,
              minHeight: '80px',
              resize: 'vertical',
              fontFamily: 'inherit'
            }}
            placeholder={options.placeholder}
          />
        ) : type === 'color' ? (
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="color"
              value={selectedElement[field] || options.default || '#000000'}
              onChange={(e) => onUpdateSelectedElement(field, e.target.value)}
              style={{
                width: '50px',
                height: '40px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            />
            <input
              type="text"
              value={selectedElement[field] || options.default || '#000000'}
              onChange={(e) => onUpdateSelectedElement(field, e.target.value)}
              style={{
                ...fieldStyle,
                flex: 1
              }}
              placeholder="#000000"
            />
          </div>
        ) : type === 'boolean' ? (
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#374151'
          }}>
            <input
              type="checkbox"
              checked={selectedElement[field] || false}
              onChange={(e) => onUpdateSelectedElement(field, e.target.checked)}
              style={{
                width: '16px',
                height: '16px',
                cursor: 'pointer'
              }}
            />
            {options.label || label}
          </label>
        ) : (
          <input
            type={type}
            value={selectedElement[field] || (type === 'number' ? (options.default || 0) : '')}
            onChange={(e) => {
              const value = type === 'number' 
                ? parseFloat(e.target.value) || options.default || 0
                : e.target.value;
              onUpdateSelectedElement(field, value);
            }}
            style={fieldStyle}
            placeholder={options.placeholder}
            min={options.min}
            max={options.max}
            step={options.step}
          />
        )}
        
        {options.unit && type === 'number' && (
          <span style={{ 
            fontSize: '12px', 
            color: '#6b7280', 
            marginTop: '4px', 
            display: 'block' 
          }}>
            Unidad: {options.unit}
          </span>
        )}
      </div>
    );
  };

  // ✅ NUEVO: Render Text Style controls
  const renderTextStyleControls = () => {
    const textStyle = selectedElement.textStyle || {};
    
    const updateTextStyle = (property, value) => {
      const newTextStyle = { ...textStyle, [property]: value };
      onUpdateSelectedElement('textStyle', newTextStyle);
    };

    return (
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{
          margin: '0 0 12px 0',
          fontSize: '14px',
          color: '#374151',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <Type size={16} />
          Estilo de Texto
        </h4>

        {/* Preset Selector */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            marginBottom: '6px',
            color: '#374151'
          }}>
            Presets
          </label>
          <select
            onChange={(e) => {
              if (e.target.value) {
                const preset = TEXT_STYLE_PRESETS[e.target.value];
                onUpdateSelectedElement('textStyle', preset.textStyle);
                onUpdateSelectedElement('paragraphStyle', preset.paragraphStyle);
              }
            }}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            <option value="">Aplicar preset...</option>
            {Object.entries(TEXT_STYLE_PRESETS).map(([key, preset]) => (
              <option key={key} value={key}>{preset.name}</option>
            ))}
          </select>
        </div>

        {/* Font Family */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            marginBottom: '4px',
            color: '#374151'
          }}>
            Fuente
          </label>
          <select
            value={textStyle.fontFamily || TEXT_STYLE_PROPERTIES.fontFamily.default}
            onChange={(e) => updateTextStyle('fontFamily', e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            {TEXT_STYLE_PROPERTIES.fontFamily.options.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Font Size */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            marginBottom: '4px',
            color: '#374151'
          }}>
            Tamaño
          </label>
          <input
            type="number"
            value={textStyle.fontSize || TEXT_STYLE_PROPERTIES.fontSize.default}
            onChange={(e) => updateTextStyle('fontSize', parseInt(e.target.value) || 14)}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '12px'
            }}
            min={TEXT_STYLE_PROPERTIES.fontSize.min}
            max={TEXT_STYLE_PROPERTIES.fontSize.max}
          />
        </div>

        {/* Text Color */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            marginBottom: '4px',
            color: '#374151'
          }}>
            Color
          </label>
          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              type="color"
              value={textStyle.color || TEXT_STYLE_PROPERTIES.color.default}
              onChange={(e) => updateTextStyle('color', e.target.value)}
              style={{
                width: '40px',
                height: '32px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            />
            <input
              type="text"
              value={textStyle.color || TEXT_STYLE_PROPERTIES.color.default}
              onChange={(e) => updateTextStyle('color', e.target.value)}
              style={{
                flex: 1,
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '12px'
              }}
              placeholder="#000000"
            />
          </div>
        </div>

        {/* Text Style Toggles */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '8px',
          marginBottom: '12px'
        }}>
          {['bold', 'italic', 'underline', 'strikethrough'].map(style => (
            <label 
              key={style}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                cursor: 'pointer',
                fontSize: '12px',
                color: '#374151',
                padding: '4px 8px',
                border: '1px solid #e5e7eb',
                borderRadius: '4px',
                background: textStyle[style] ? '#eff6ff' : 'white'
              }}
            >
              <input
                type="checkbox"
                checked={textStyle[style] || false}
                onChange={(e) => updateTextStyle(style, e.target.checked)}
                style={{
                  width: '14px',
                  height: '14px',
                  cursor: 'pointer'
                }}
              />
              {TEXT_STYLE_PROPERTIES[style].label}
            </label>
          ))}
        </div>
      </div>
    );
  };

  // ✅ NUEVO: Render Paragraph Style controls
  const renderParagraphStyleControls = () => {
    const paragraphStyle = selectedElement.paragraphStyle || {};
    
    const updateParagraphStyle = (property, value) => {
      const newParagraphStyle = { ...paragraphStyle, [property]: value };
      onUpdateSelectedElement('paragraphStyle', newParagraphStyle);
    };

    const getAlignmentIcon = (alignment) => {
      switch (alignment) {
        case 'center': return <AlignCenter size={16} />;
        case 'right': return <AlignRight size={16} />;
        case 'justify': return <AlignJustify size={16} />;
        default: return <AlignLeft size={16} />;
      }
    };

    return (
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{
          margin: '0 0 12px 0',
          fontSize: '14px',
          color: '#374151',
          fontWeight: '600'
        }}>
          Estilo de Párrafo
        </h4>

        {/* Text Alignment */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            marginBottom: '6px',
            color: '#374151'
          }}>
            Alineación
          </label>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(4, 1fr)', 
            gap: '4px' 
          }}>
            {PARAGRAPH_STYLE_PROPERTIES.alignment.options.map(option => (
              <button
                key={option.value}
                onClick={() => updateParagraphStyle('alignment', option.value)}
                style={{
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  background: paragraphStyle.alignment === option.value ? '#eff6ff' : 'white',
                  borderColor: paragraphStyle.alignment === option.value ? '#3b82f6' : '#d1d5db',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
                title={option.label}
              >
                {getAlignmentIcon(option.value)}
              </button>
            ))}
          </div>
        </div>

        {/* Vertical Alignment */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            marginBottom: '4px',
            color: '#374151'
          }}>
            Alineación Vertical
          </label>
          <select
            value={paragraphStyle.verticalAlign || PARAGRAPH_STYLE_PROPERTIES.verticalAlign.default}
            onChange={(e) => updateParagraphStyle('verticalAlign', e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            {PARAGRAPH_STYLE_PROPERTIES.verticalAlign.options.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        {/* Line Height */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            marginBottom: '4px',
            color: '#374151'
          }}>
            Interlineado
          </label>
          <input
            type="number"
            value={paragraphStyle.lineHeight || PARAGRAPH_STYLE_PROPERTIES.lineHeight.default}
            onChange={(e) => updateParagraphStyle('lineHeight', parseFloat(e.target.value) || 1.4)}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '12px'
            }}
            min={PARAGRAPH_STYLE_PROPERTIES.lineHeight.min}
            max={PARAGRAPH_STYLE_PROPERTIES.lineHeight.max}
            step={PARAGRAPH_STYLE_PROPERTIES.lineHeight.step}
          />
        </div>

        {/* Letter Spacing */}
        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            marginBottom: '4px',
            color: '#374151'
          }}>
            Espaciado de Letras (px)
          </label>
          <input
            type="number"
            value={paragraphStyle.letterSpacing || PARAGRAPH_STYLE_PROPERTIES.letterSpacing.default}
            onChange={(e) => updateParagraphStyle('letterSpacing', parseFloat(e.target.value) || 0)}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '12px'
            }}
            min={PARAGRAPH_STYLE_PROPERTIES.letterSpacing.min}
            max={PARAGRAPH_STYLE_PROPERTIES.letterSpacing.max}
            step={PARAGRAPH_STYLE_PROPERTIES.letterSpacing.step}
          />
        </div>

        {/* Spacing Controls */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr 1fr', 
          gap: '8px',
          marginBottom: '12px'
        }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: '500',
              marginBottom: '4px',
              color: '#374151'
            }}>
              Sangría
            </label>
            <input
              type="number"
              value={paragraphStyle.indent || PARAGRAPH_STYLE_PROPERTIES.indent.default}
              onChange={(e) => updateParagraphStyle('indent', parseInt(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: '4px 6px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '11px'
              }}
              min={PARAGRAPH_STYLE_PROPERTIES.indent.min}
              max={PARAGRAPH_STYLE_PROPERTIES.indent.max}
            />
          </div>
          
          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: '500',
              marginBottom: '4px',
              color: '#374151'
            }}>
              Antes
            </label>
            <input
              type="number"
              value={paragraphStyle.spaceBefore || PARAGRAPH_STYLE_PROPERTIES.spaceBefore.default}
              onChange={(e) => updateParagraphStyle('spaceBefore', parseInt(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: '4px 6px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '11px'
              }}
              min={PARAGRAPH_STYLE_PROPERTIES.spaceBefore.min}
              max={PARAGRAPH_STYLE_PROPERTIES.spaceBefore.max}
            />
          </div>
          
          <div>
            <label style={{
              display: 'block',
              fontSize: '11px',
              fontWeight: '500',
              marginBottom: '4px',
              color: '#374151'
            }}>
              Después
            </label>
            <input
              type="number"
              value={paragraphStyle.spaceAfter || PARAGRAPH_STYLE_PROPERTIES.spaceAfter.default}
              onChange={(e) => updateParagraphStyle('spaceAfter', parseInt(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: '4px 6px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '11px'
              }}
              min={PARAGRAPH_STYLE_PROPERTIES.spaceAfter.min}
              max={PARAGRAPH_STYLE_PROPERTIES.spaceAfter.max}
            />
          </div>
        </div>

        {/* Word Wrap and Break */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '8px',
          marginBottom: '12px'
        }}>
          <label style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            color: '#374151',
            padding: '6px 8px',
            border: '1px solid #e5e7eb',
            borderRadius: '4px',
            background: paragraphStyle.wordWrap !== false ? '#eff6ff' : 'white'
          }}>
            <input
              type="checkbox"
              checked={paragraphStyle.wordWrap !== false}
              onChange={(e) => updateParagraphStyle('wordWrap', e.target.checked)}
              style={{
                width: '14px',
                height: '14px',
                cursor: 'pointer'
              }}
            />
            Ajuste de línea
          </label>
          
          <div>
            <select
              value={paragraphStyle.wordBreak || PARAGRAPH_STYLE_PROPERTIES.wordBreak.default}
              onChange={(e) => updateParagraphStyle('wordBreak', e.target.value)}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '11px'
              }}
            >
              {PARAGRAPH_STYLE_PROPERTIES.wordBreak.options.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  };

  const renderElementProperties = () => {
    if (!selectedElement) return null;

    // CORREGIDO: Crear opciones de variables de forma segura
    const variableOptions = Object.entries(availableData).map(([key, varData]) => {
      // Manejar tanto el formato nuevo como el viejo
      let displayLabel;
      if (typeof varData === 'object' && varData.displayValue !== undefined) {
        // Nuevo formato con metadatos
        displayLabel = `${key} (${varData.type}) - ${varData.displayValue}`;
      } else {
        // Formato viejo o string simple
        const value = typeof varData === 'string' ? varData : String(varData);
        displayLabel = `${key} - ${value.length > 30 ? value.substring(0, 30) + '...' : value}`;
      }
      
      return {
        value: key,
        label: displayLabel
      };
    });

    switch (selectedElement.type) {
      case ELEMENT_TYPES.TEXT:
        return (
          <>
            {renderFormField('Texto', 'text', 'textarea', {
              placeholder: 'Ingresa el texto a mostrar'
            })}
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                {renderFormField('Ancho', 'width', 'number', {
                  min: 50,
                  max: 1000,
                  step: 1
                })}
              </div>
              <div style={{ flex: 1 }}>
                {renderFormField('Alto', 'height', 'number', {
                  min: 30,
                  max: 1000,
                  step: 1
                })}
              </div>
            </div>
          </>
        );

      case ELEMENT_TYPES.VARIABLE:
        return (
          <>
            {renderFormField('Variable', 'variable', 'select', {
              placeholder: 'Selecciona una variable del workflow',
              options: variableOptions
            })}
            {renderFormField('Tamaño de Fuente', 'fontSize', 'number', {
              min: 8,
              max: 72,
              step: 1
            })}
          </>
        );

      case ELEMENT_TYPES.RECTANGLE:
        return (
          <>
            {renderFormField('Ancho', 'width', 'number', {
              min: 10,
              max: 1000,
              step: 1
            })}
            {renderFormField('Alto', 'height', 'number', {
              min: 10,
              max: 1000,
              step: 1
            })}
            {renderFormField('Color de Relleno', 'fillColor', 'color', {
              default: 'rgba(156, 163, 175, 0.1)'
            })}
            {renderFormField('Color de Borde', 'borderColor', 'color', {
              default: '#6b7280'
            })}
            <div style={{ display: 'flex', gap: '8px' }}>
              <div style={{ flex: 1 }}>
                {renderFormField('Grosor', 'borderWidth', 'number', {
                  min: 0,
                  max: 10,
                  step: 1,
                  default: 2
                })}
              </div>
              <div style={{ flex: 1 }}>
                {renderFormField('Radio', 'borderRadius', 'number', {
                  min: 0,
                  max: 50,
                  step: 1,
                  default: 4
                })}
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div style={panelStyle}>
      <h3 style={{
        margin: '0 0 16px 0',
        fontSize: '16px',
        color: '#374151',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '8px'
      }}>
        Propiedades
      </h3>
      
      {selectedElement ? (
        <div>
          {/* ✅ NUEVO: Tabs para organizar propiedades */}
          <div style={{
            display: 'flex',
            marginBottom: '16px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            <button
              onClick={() => setActiveTab('properties')}
              style={{
                flex: 1,
                padding: '8px 12px',
                border: 'none',
                background: activeTab === 'properties' ? '#eff6ff' : 'transparent',
                color: activeTab === 'properties' ? '#3b82f6' : '#6b7280',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer',
                borderBottom: activeTab === 'properties' ? '2px solid #3b82f6' : '2px solid transparent'
              }}
            >
              Básicas
            </button>
            
            {selectedElement.type === ELEMENT_TYPES.TEXT && (
              <>
                <button
                  onClick={() => setActiveTab('textStyle')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: 'none',
                    background: activeTab === 'textStyle' ? '#eff6ff' : 'transparent',
                    color: activeTab === 'textStyle' ? '#3b82f6' : '#6b7280',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    borderBottom: activeTab === 'textStyle' ? '2px solid #3b82f6' : '2px solid transparent'
                  }}
                >
                  Texto
                </button>
                
                <button
                  onClick={() => setActiveTab('paragraphStyle')}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: 'none',
                    background: activeTab === 'paragraphStyle' ? '#eff6ff' : 'transparent',
                    color: activeTab === 'paragraphStyle' ? '#3b82f6' : '#6b7280',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    borderBottom: activeTab === 'paragraphStyle' ? '2px solid #3b82f6' : '2px solid transparent'
                  }}
                >
                  Párrafo
                </button>
              </>
            )}
          </div>

          {/* Element Info */}
          <div style={{
            background: '#eff6ff',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '16px',
            border: '1px solid #bfdbfe'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#1e40af',
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              📝 Elemento seleccionado
            </div>
            <div style={{
              fontSize: '14px',
              color: '#1e40af',
              marginBottom: '4px'
            }}>
              <strong>Tipo:</strong> {selectedElement.type}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#3730a3'
            }}>
              <strong>ID:</strong> {selectedElement.id}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'properties' && (
            <>
              {/* Position */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{
                  margin: '0 0 8px 0',
                  fontSize: '14px',
                  color: '#374151',
                  fontWeight: '600'
                }}>
                  📍 Posición
                </h4>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    {renderFormField('X', 'x', 'number', { min: 0 })}
                  </div>
                  <div style={{ flex: 1 }}>
                    {renderFormField('Y', 'y', 'number', { min: 0 })}
                  </div>
                </div>
              </div>

              {/* Element-specific properties */}
              <div style={{ marginBottom: '16px' }}>
                <h4 style={{
                  margin: '0 0 8px 0',
                  fontSize: '14px',
                  color: '#374151',
                  fontWeight: '600'
                }}>
                  ⚙️ Configuración
                </h4>
                
                {renderElementProperties()}
              </div>

              {/* Actions */}
              <div style={{
                paddingTop: '12px',
                borderTop: '1px solid #e5e7eb'
              }}>
                <h4 style={{
                  margin: '0 0 8px 0',
                  fontSize: '14px',
                  color: '#374151',
                  fontWeight: '600'
                }}>
                  ⚡ Acciones rápidas
                </h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={() => {
                      onUpdateSelectedElement('x', 0);
                      onUpdateSelectedElement('y', 0);
                    }}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      background: 'white',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#f3f4f6'}
                    onMouseOut={(e) => e.target.style.background = 'white'}
                  >
                    📍 Mover a origen (0,0)
                  </button>
                  
                  <button
                    onClick={() => {
                      const snapSize = 20;
                      onUpdateSelectedElement('x', Math.round(selectedElement.x / snapSize) * snapSize);
                      onUpdateSelectedElement('y', Math.round(selectedElement.y / snapSize) * snapSize);
                    }}
                    style={{
                      padding: '8px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      background: 'white',
                      fontSize: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#f3f4f6'}
                    onMouseOut={(e) => e.target.style.background = 'white'}
                  >
                    🧲 Ajustar a cuadrícula
                  </button>

                  {/* ✅ NUEVO: Reset styles para elementos de texto */}
                  {selectedElement.type === ELEMENT_TYPES.TEXT && (
                    <button
                      onClick={() => {
                        onUpdateSelectedElement('textStyle', {
                          fontFamily: 'Arial, sans-serif',
                          fontSize: 14,
                          bold: false,
                          italic: false,
                          underline: false,
                          strikethrough: false,
                          color: '#000000'
                        });
                        onUpdateSelectedElement('paragraphStyle', {
                          alignment: 'left',
                          verticalAlign: 'flex-start',
                          lineHeight: 1.4,
                          letterSpacing: 0,
                          indent: 0,
                          spaceBefore: 0,
                          spaceAfter: 0,
                          wordWrap: true,
                          wordBreak: 'normal'
                        });
                      }}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '6px',
                        background: 'white',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.background = '#f3f4f6'}
                      onMouseOut={(e) => e.target.style.background = 'white'}
                    >
                      🎨 Restablecer estilos
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* ✅ NUEVO: Text Style Tab */}
          {activeTab === 'textStyle' && selectedElement.type === ELEMENT_TYPES.TEXT && (
            <div>
              {renderTextStyleControls()}
            </div>
          )}

          {/* ✅ NUEVO: Paragraph Style Tab */}
          {activeTab === 'paragraphStyle' && selectedElement.type === ELEMENT_TYPES.TEXT && (
            <div>
              {renderParagraphStyleControls()}
            </div>
          )}
        </div>
      ) : (
        <div style={{
          textAlign: 'center',
          color: '#6b7280',
          padding: '40px 20px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>🎯</div>
          <div style={{ fontSize: '16px', marginBottom: '6px', fontWeight: '500' }}>
            Ningún elemento seleccionado
          </div>
          <div style={{ fontSize: '14px' }}>
            Haz clic en un elemento para editarlo
          </div>
        </div>
      )}

      {/* Available Variables - CORREGIDO */}
      {availableData && Object.keys(availableData).length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            color: '#374151',
            fontWeight: '600'
          }}>
            🔗 Variables del Workflow
          </h4>
          
          <div style={{
            maxHeight: '200px',
            overflowY: 'auto',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            background: 'white'
          }}>
            {Object.entries(availableData).map(([key, varData]) => {
              // CORREGIDO: Manejar tanto formato nuevo como viejo de forma segura
              let displayValue, typeInfo;
              
              if (typeof varData === 'object' && varData !== null && varData.displayValue !== undefined) {
                // Nuevo formato con metadatos
                displayValue = varData.displayValue;
                typeInfo = varData.type || 'unknown';
              } else {
                // Formato viejo o valor simple
                displayValue = typeof varData === 'string' ? varData : String(varData);
                typeInfo = 'string';
              }
              
              // Truncar valores largos
              const truncatedValue = displayValue.length > 40 
                ? `${displayValue.substring(0, 40)}...` 
                : displayValue;

              return (
                <div
                  key={key}
                  style={{
                    fontSize: '12px',
                    padding: '8px 12px',
                    borderBottom: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onClick={() => {
                    if (selectedElement?.type === ELEMENT_TYPES.VARIABLE) {
                      onUpdateSelectedElement('variable', key);
                    }
                  }}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#f8fafc'}
                  onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                  title={`Click para usar en elemento variable\nTipo: ${typeInfo}\nValor: ${displayValue}`}
                >
                  <div style={{
                    fontWeight: '600',
                    color: '#374151',
                    marginBottom: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span style={{ 
                      color: typeInfo === 'string' ? '#16a34a' : 
                            typeInfo === 'number' ? '#3b82f6' : 
                            typeInfo === 'boolean' ? '#f59e0b' : 
                            typeInfo === 'array' ? '#7c3aed' : 
                            typeInfo === 'object' ? '#dc2626' : '#6b7280'
                    }}>
                      🔗
                    </span>
                    {key}
                    <span style={{
                      fontSize: '10px',
                      padding: '1px 4px',
                      background: '#e5e7eb',
                      borderRadius: '3px',
                      color: '#6b7280'
                    }}>
                      {typeInfo}
                    </span>
                  </div>
                  <div style={{
                    color: '#6b7280',
                    wordBreak: 'break-word',
                    fontSize: '11px'
                  }}>
                    {truncatedValue}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div style={{
            fontSize: '11px',
            color: '#9ca3af',
            marginTop: '8px',
            fontStyle: 'italic',
            textAlign: 'center'
          }}>
            💡 Haz clic en una variable para usarla en elementos de tipo "Variable"
          </div>
        </div>
      )}

      {/* Help */}
      <div style={{
        marginTop: '20px',
        padding: '12px',
        background: '#f0fdf4',
        borderRadius: '6px',
        border: '1px solid #bbf7d0'
      }}>
        <div style={{
          fontSize: '12px',
          color: '#15803d',
          fontWeight: '600',
          marginBottom: '6px'
        }}>
          💡 Consejos:
        </div>
        <ul style={{
          fontSize: '11px',
          color: '#15803d',
          margin: 0,
          paddingLeft: '16px'
        }}>
          <li><strong>Doble clic</strong> en texto para editar inline</li>
          <li><strong>Arrastra</strong> elementos para moverlos</li>
          <li><strong>Redimensiona</strong> desde las esquinas</li>
          <li><strong>Usa las pestañas</strong> para acceder a estilos de texto</li>
          <li><strong>Presets</strong> para aplicar estilos rápidamente</li>
          <li><strong>Variables</strong> se conectan automáticamente al workflow</li>
        </ul>
      </div>
    </div>
  );
};

export default PropertiesPanel;