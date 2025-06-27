// src/components/layout-designer/LayoutDesigner/ManualStyles.jsx
import React from 'react';
import { Type, AlignLeft, AlignCenter, AlignRight, AlignJustify, Save } from 'lucide-react';
import { TEXT_STYLE_PROPERTIES, PARAGRAPH_STYLE_PROPERTIES } from '../../../utils/constants';
import { styleManager } from '../../../utils/StyleManager';

const ManualStyles = ({ 
  selectedElement, 
  onUpdateSelectedElement,
  onStyleCreated 
}) => {
  // Función para crear estilo desde propiedades actuales
  const createStyleFromCurrent = (styleType) => {
    if (!selectedElement) return;

    let styleData = {};
    let styleName = '';

    switch (styleType) {
      case 'textStyle':
        styleData = selectedElement.textStyle || {};
        styleName = `Texto ${Date.now()}`;
        break;
      case 'paragraphStyle':
        styleData = selectedElement.paragraphStyle || {};
        styleName = `Párrafo ${Date.now()}`;
        break;
      case 'borderStyle':
        styleData = {
          width: selectedElement.borderWidth || 1,
          style: selectedElement.borderStyle || 'solid',
          color: selectedElement.borderColor || '#d1d5db',
          radius: selectedElement.borderRadius || 0
        };
        styleName = `Borde ${Date.now()}`;
        break;
      case 'fillStyle':
        styleData = {
          backgroundColor: selectedElement.backgroundColor || selectedElement.fillColor || 'transparent',
          opacity: selectedElement.opacity || 1
        };
        styleName = `Relleno ${Date.now()}`;
        break;
    }

    const styleId = styleManager.generateStyleId(styleType);
    
    try {
      switch (styleType) {
        case 'textStyle':
          styleManager.addTextStyle(styleId, { name: styleName, ...styleData, isCustom: true });
          onUpdateSelectedElement('textStyleId', styleId);
          break;
        case 'paragraphStyle':
          styleManager.addParagraphStyle(styleId, { name: styleName, ...styleData, isCustom: true });
          onUpdateSelectedElement('paragraphStyleId', styleId);
          break;
        case 'borderStyle':
          styleManager.addBorderStyle(styleId, { name: styleName, ...styleData, isCustom: true });
          onUpdateSelectedElement('borderStyleId', styleId);
          break;
        case 'fillStyle':
          styleManager.addFillStyle(styleId, { name: styleName, ...styleData, isCustom: true });
          onUpdateSelectedElement('fillStyleId', styleId);
          break;
      }
      
      console.log(`✅ Created ${styleType}:`, styleName);
      if (onStyleCreated) {
        onStyleCreated(styleType, styleId);
      }
    } catch (error) {
      console.error(`❌ Error creating ${styleType}:`, error);
    }
  };

  // Render manual text style controls
  const renderManualTextStyleControls = () => {
    const textStyle = selectedElement.textStyle || {};
    
    const updateTextStyle = (property, value) => {
      const newTextStyle = { ...textStyle, [property]: value };
      onUpdateSelectedElement('textStyle', newTextStyle);
    };

    return (
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <h4 style={{
            margin: 0,
            fontSize: '14px',
            color: '#374151',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Type size={16} />
            Estilo de Texto Manual
          </h4>
          
          <button
            onClick={() => createStyleFromCurrent('textStyle')}
            style={{
              background: '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Crear estilo reutilizable desde configuración actual"
          >
            <Save size={10} />
            Crear Estilo
          </button>
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

  // Render manual paragraph style controls
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
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <h4 style={{
            margin: 0,
            fontSize: '14px',
            color: '#374151',
            fontWeight: '600'
          }}>
            Estilo de Párrafo Manual
          </h4>
          
          <button
            onClick={() => createStyleFromCurrent('paragraphStyle')}
            style={{
              background: '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Crear estilo de párrafo reutilizable"
          >
            <Save size={10} />
            Crear Estilo
          </button>
        </div>

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
      </div>
    );
  };

  // Render manual border style controls
  const renderManualBorderStyleControls = () => {
    return (
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <h4 style={{
            margin: 0,
            fontSize: '14px',
            color: '#374151',
            fontWeight: '600'
          }}>
            Borde Manual
          </h4>
          
          <button
            onClick={() => createStyleFromCurrent('borderStyle')}
            style={{
              background: '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Crear estilo de borde reutilizable"
          >
            <Save size={10} />
            Crear Estilo
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          <div style={{ flex: 1 }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              marginBottom: '4px',
              color: '#374151'
            }}>
              Grosor
            </label>
            <input
              type="number"
              value={selectedElement.borderWidth || 0}
              onChange={(e) => onUpdateSelectedElement('borderWidth', parseInt(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '12px'
              }}
              min="0"
              max="10"
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{
              display: 'block',
              fontSize: '12px',
              fontWeight: '500',
              marginBottom: '4px',
              color: '#374151'
            }}>
              Radio
            </label>
            <input
              type="number"
              value={selectedElement.borderRadius || 0}
              onChange={(e) => onUpdateSelectedElement('borderRadius', parseInt(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '12px'
              }}
              min="0"
              max="50"
            />
          </div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            marginBottom: '4px',
            color: '#374151'
          }}>
            Estilo
          </label>
          <select
            value={selectedElement.borderStyle || 'solid'}
            onChange={(e) => onUpdateSelectedElement('borderStyle', e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '12px'
            }}
          >
            <option value="none">Sin borde</option>
            <option value="solid">Sólido</option>
            <option value="dashed">Punteado</option>
            <option value="dotted">Puntos</option>
            <option value="double">Doble</option>
          </select>
        </div>

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
              value={selectedElement.borderColor || '#d1d5db'}
              onChange={(e) => onUpdateSelectedElement('borderColor', e.target.value)}
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
              value={selectedElement.borderColor || '#d1d5db'}
              onChange={(e) => onUpdateSelectedElement('borderColor', e.target.value)}
              style={{
                flex: 1,
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '12px'
              }}
              placeholder="#d1d5db"
            />
          </div>
        </div>
      </div>
    );
  };

  // Render manual fill style controls
  const renderManualFillStyleControls = () => {
    return (
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px'
        }}>
          <h4 style={{
            margin: 0,
            fontSize: '14px',
            color: '#374151',
            fontWeight: '600'
          }}>
            Relleno Manual
          </h4>
          
          <button
            onClick={() => createStyleFromCurrent('fillStyle')}
            style={{
              background: '#16a34a',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            title="Crear estilo de relleno reutilizable"
          >
            <Save size={10} />
            Crear Estilo
          </button>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            marginBottom: '4px',
            color: '#374151'
          }}>
            Color de Fondo
          </label>
          <div style={{ display: 'flex', gap: '6px' }}>
            <input
              type="color"
              value={selectedElement.fillColor || selectedElement.backgroundColor || '#ffffff'}
              onChange={(e) => onUpdateSelectedElement('fillColor', e.target.value)}
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
              value={selectedElement.fillColor || selectedElement.backgroundColor || '#ffffff'}
              onChange={(e) => onUpdateSelectedElement('fillColor', e.target.value)}
              style={{
                flex: 1,
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '12px'
              }}
              placeholder="#ffffff"
            />
          </div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <label style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '500',
            marginBottom: '4px',
            color: '#374151'
          }}>
            Opacidad
          </label>
          <input
            type="range"
            value={selectedElement.opacity || 1}
            onChange={(e) => onUpdateSelectedElement('opacity', parseFloat(e.target.value))}
            style={{
              width: '100%',
              marginBottom: '8px'
            }}
            min="0"
            max="1"
            step="0.1"
          />
          <div style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
            {Math.round((selectedElement.opacity || 1) * 100)}%
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <div style={{
        background: '#f0fdf4',
        padding: '8px 12px',
        borderRadius: '6px',
        marginBottom: '16px',
        border: '1px solid #bbf7d0'
      }}>
        <div style={{
          fontSize: '12px',
          color: '#15803d',
          fontWeight: '600',
          marginBottom: '4px'
        }}>
          💡 Estilos Manuales
        </div>
        <div style={{
          fontSize: '11px',
          color: '#15803d'
        }}>
          Configura estilos directamente y créalos como componentes reutilizables
        </div>
      </div>

      {renderManualTextStyleControls()}
      {renderParagraphStyleControls()}
      {renderManualBorderStyleControls()}
      {renderManualFillStyleControls()}
    </div>
  );
};

export default ManualStyles;