// src/components/layout-designer/StyleEditor/StyleEditorModal.jsx
import React, { useState, useEffect } from 'react';
import { X, Save, Palette, Type, Frame, Square } from 'lucide-react';
import Modal from '../../common/Modal/Modal';
import { styleManager } from '../../../utils/StyleManager';

const StyleEditorModal = ({ 
  isOpen, 
  onClose, 
  styleType, 
  editingStyleId = null,
  onStyleSaved 
}) => {
  const [styleName, setStyleName] = useState('');
  const [styleCategory, setStyleCategory] = useState('custom');
  const [styleProperties, setStyleProperties] = useState({});
  const [previewText, setPreviewText] = useState('Texto de ejemplo para vista previa');

  // Inicializar cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      if (editingStyleId) {
        // Modo edición
        const existingStyle = getExistingStyle(editingStyleId);
        if (existingStyle) {
          setStyleName(existingStyle.name);
          setStyleCategory(existingStyle.category || 'custom');
          setStyleProperties(extractStyleProperties(existingStyle));
        }
      } else {
        // Modo creación
        resetForm();
        setDefaultProperties();
      }
    }
  }, [isOpen, editingStyleId, styleType]);

  const getExistingStyle = (styleId) => {
    switch (styleType) {
      case 'textStyle':
        return styleManager.getTextStyle(styleId);
      case 'paragraphStyle':
        return styleManager.getParagraphStyle(styleId);
      case 'borderStyle':
        return styleManager.getBorderStyle(styleId);
      case 'fillStyle':
        return styleManager.getFillStyle(styleId);
      default:
        return null;
    }
  };

  const extractStyleProperties = (style) => {
    const { id, name, category, createdAt, updatedAt, isCustom, ...properties } = style;
    return properties;
  };

  const resetForm = () => {
    setStyleName('');
    setStyleCategory('custom');
    setStyleProperties({});
  };

  const setDefaultProperties = () => {
    switch (styleType) {
      case 'textStyle':
        setStyleProperties({
          fontFamily: 'Arial, sans-serif',
          fontSize: 14,
          bold: false,
          italic: false,
          underline: false,
          strikethrough: false,
          color: '#000000'
        });
        break;
      case 'paragraphStyle':
        setStyleProperties({
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
        break;
      case 'borderStyle':
        setStyleProperties({
          width: 1,
          style: 'solid',
          color: '#d1d5db',
          radius: 4
        });
        break;
      case 'fillStyle':
        setStyleProperties({
          backgroundColor: '#f9fafb',
          opacity: 1,
          gradient: null
        });
        break;
    }
  };

  const updateProperty = (property, value) => {
    setStyleProperties(prev => ({
      ...prev,
      [property]: value
    }));
  };

  const handleSave = () => {
    if (!styleName.trim()) {
      alert('Por favor ingresa un nombre para el estilo');
      return;
    }

    const styleData = {
      name: styleName.trim(),
      category: styleCategory,
      ...styleProperties
    };

    const styleId = editingStyleId || styleManager.generateStyleId(styleType);

    try {
      switch (styleType) {
        case 'textStyle':
          if (editingStyleId) {
            styleManager.updateTextStyle(styleId, styleData);
          } else {
            styleManager.addTextStyle(styleId, styleData);
          }
          break;
        case 'paragraphStyle':
          styleManager.addParagraphStyle(styleId, styleData);
          break;
        case 'borderStyle':
          styleManager.addBorderStyle(styleId, styleData);
          break;
        case 'fillStyle':
          styleManager.addFillStyle(styleId, styleData);
          break;
      }

      console.log(`✅ ${editingStyleId ? 'Updated' : 'Created'} ${styleType}:`, styleData);
      
      if (onStyleSaved) {
        onStyleSaved(styleId, styleData);
      }
      
      onClose();
    } catch (error) {
      console.error('❌ Error saving style:', error);
      alert('Error al guardar el estilo');
    }
  };

  const getModalTitle = () => {
    const action = editingStyleId ? 'Editar' : 'Crear';
    switch (styleType) {
      case 'textStyle':
        return `${action} Estilo de Texto`;
      case 'paragraphStyle':
        return `${action} Estilo de Párrafo`;
      case 'borderStyle':
        return `${action} Estilo de Borde`;
      case 'fillStyle':
        return `${action} Estilo de Relleno`;
      default:
        return `${action} Estilo`;
    }
  };

  const getModalIcon = () => {
    switch (styleType) {
      case 'textStyle':
        return <Type size={20} />;
      case 'paragraphStyle':
        return <Type size={20} />;
      case 'borderStyle':
        return <Frame size={20} />;
      case 'fillStyle':
        return <Palette size={20} />;
      default:
        return <Square size={20} />;
    }
  };

  const renderTextStyleEditor = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Font Family */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '6px',
          color: '#374151'
        }}>
          Fuente
        </label>
        <select
          value={styleProperties.fontFamily || 'Arial, sans-serif'}
          onChange={(e) => updateProperty('fontFamily', e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        >
          {styleManager.getAvailableFonts().map(font => (
            <option key={font} value={font}>
              {font.split(',')[0]}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '6px',
          color: '#374151'
        }}>
          Tamaño (px)
        </label>
        <input
          type="number"
          value={styleProperties.fontSize || 14}
          onChange={(e) => updateProperty('fontSize', parseInt(e.target.value) || 14)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
          min="8"
          max="72"
        />
      </div>

      {/* Font Styles */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '8px',
          color: '#374151'
        }}>
          Estilos
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {['bold', 'italic', 'underline', 'strikethrough'].map(style => (
            <label 
              key={style}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#374151',
                padding: '8px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                background: styleProperties[style] ? '#eff6ff' : 'white'
              }}
            >
              <input
                type="checkbox"
                checked={styleProperties[style] || false}
                onChange={(e) => updateProperty(style, e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              {style.charAt(0).toUpperCase() + style.slice(1)}
            </label>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '6px',
          color: '#374151'
        }}>
          Color
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="color"
            value={styleProperties.color || '#000000'}
            onChange={(e) => updateProperty('color', e.target.value)}
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
            value={styleProperties.color || '#000000'}
            onChange={(e) => updateProperty('color', e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
            placeholder="#000000"
          />
        </div>
      </div>
    </div>
  );

  const renderParagraphStyleEditor = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Alignment */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '8px',
          color: '#374151'
        }}>
          Alineación
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
          {[
            { value: 'left', label: 'Izquierda' },
            { value: 'center', label: 'Centro' },
            { value: 'right', label: 'Derecha' },
            { value: 'justify', label: 'Justificado' }
          ].map(option => (
            <button
              key={option.value}
              onClick={() => updateProperty('alignment', option.value)}
              style={{
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: styleProperties.alignment === option.value ? '#eff6ff' : 'white',
                borderColor: styleProperties.alignment === option.value ? '#3b82f6' : '#d1d5db',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Line Height */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '6px',
          color: '#374151'
        }}>
          Interlineado
        </label>
        <input
          type="number"
          value={styleProperties.lineHeight || 1.4}
          onChange={(e) => updateProperty('lineHeight', parseFloat(e.target.value) || 1.4)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
          min="1.0"
          max="3.0"
          step="0.1"
        />
      </div>

      {/* Letter Spacing */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '6px',
          color: '#374151'
        }}>
          Espaciado de Letras (px)
        </label>
        <input
          type="number"
          value={styleProperties.letterSpacing || 0}
          onChange={(e) => updateProperty('letterSpacing', parseFloat(e.target.value) || 0)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
          min="-2"
          max="10"
          step="0.1"
        />
      </div>

      {/* Spacing */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '8px',
          color: '#374151'
        }}>
          Espaciado
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <div>
            <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
              Sangría
            </label>
            <input
              type="number"
              value={styleProperties.indent || 0}
              onChange={(e) => updateProperty('indent', parseInt(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '12px'
              }}
              min="0"
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
              Antes
            </label>
            <input
              type="number"
              value={styleProperties.spaceBefore || 0}
              onChange={(e) => updateProperty('spaceBefore', parseInt(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '12px'
              }}
              min="0"
            />
          </div>
          <div>
            <label style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px', display: 'block' }}>
              Después
            </label>
            <input
              type="number"
              value={styleProperties.spaceAfter || 0}
              onChange={(e) => updateProperty('spaceAfter', parseInt(e.target.value) || 0)}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '12px'
              }}
              min="0"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderBorderStyleEditor = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Border Width */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '6px',
          color: '#374151'
        }}>
          Grosor (px)
        </label>
        <input
          type="number"
          value={styleProperties.width || 1}
          onChange={(e) => updateProperty('width', parseInt(e.target.value) || 0)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
          min="0"
          max="20"
        />
      </div>

      {/* Border Style */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '6px',
          color: '#374151'
        }}>
          Estilo
        </label>
        <select
          value={styleProperties.style || 'solid'}
          onChange={(e) => updateProperty('style', e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        >
          <option value="none">Sin borde</option>
          <option value="solid">Sólido</option>
          <option value="dashed">Punteado</option>
          <option value="dotted">Puntos</option>
          <option value="double">Doble</option>
        </select>
      </div>

      {/* Border Color */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '6px',
          color: '#374151'
        }}>
          Color
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="color"
            value={styleProperties.color || '#d1d5db'}
            onChange={(e) => updateProperty('color', e.target.value)}
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
            value={styleProperties.color || '#d1d5db'}
            onChange={(e) => updateProperty('color', e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
            placeholder="#d1d5db"
          />
        </div>
      </div>

      {/* Border Radius */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '6px',
          color: '#374151'
        }}>
          Radio de Esquinas (px)
        </label>
        <input
          type="number"
          value={styleProperties.radius || 0}
          onChange={(e) => updateProperty('radius', parseInt(e.target.value) || 0)}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
          min="0"
          max="50"
        />
      </div>
    </div>
  );

  const renderFillStyleEditor = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Background Color */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '6px',
          color: '#374151'
        }}>
          Color de Fondo
        </label>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="color"
            value={styleProperties.backgroundColor || '#f9fafb'}
            onChange={(e) => updateProperty('backgroundColor', e.target.value)}
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
            value={styleProperties.backgroundColor || '#f9fafb'}
            onChange={(e) => updateProperty('backgroundColor', e.target.value)}
            style={{
              flex: 1,
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
            placeholder="#f9fafb"
          />
        </div>
      </div>

      {/* Opacity */}
      <div>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '6px',
          color: '#374151'
        }}>
          Opacidad
        </label>
        <input
          type="range"
          value={styleProperties.opacity || 1}
          onChange={(e) => updateProperty('opacity', parseFloat(e.target.value))}
          style={{
            width: '100%',
            marginBottom: '8px'
          }}
          min="0"
          max="1"
          step="0.1"
        />
        <div style={{ textAlign: 'center', fontSize: '12px', color: '#6b7280' }}>
          {Math.round((styleProperties.opacity || 1) * 100)}%
        </div>
      </div>
    </div>
  );

  const renderPreview = () => {
    const previewStyles = {
      padding: '12px',
      border: '1px solid #e5e7eb',
      borderRadius: '6px',
      background: '#f9fafb',
      marginTop: '16px'
    };

    const previewElementStyle = {
      padding: '8px 12px',
      background: 'white',
      borderRadius: '4px',
      ...getPreviewStyles()
    };

    return (
      <div style={previewStyles}>
        <label style={{ 
          display: 'block', 
          fontSize: '14px', 
          fontWeight: '500', 
          marginBottom: '8px',
          color: '#374151'
        }}>
          Vista Previa
        </label>
        
        <div style={previewElementStyle}>
          {styleType === 'textStyle' || styleType === 'paragraphStyle' ? previewText : 'Elemento de ejemplo'}
        </div>
        
        {(styleType === 'textStyle' || styleType === 'paragraphStyle') && (
          <input
            type="text"
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder="Texto para vista previa"
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '12px',
              marginTop: '8px'
            }}
          />
        )}
      </div>
    );
  };

  const getPreviewStyles = () => {
    const styles = {};

    if (styleType === 'textStyle') {
      return {
        fontFamily: styleProperties.fontFamily || 'Arial, sans-serif',
        fontSize: `${styleProperties.fontSize || 14}px`,
        fontWeight: styleProperties.bold ? 'bold' : 'normal',
        fontStyle: styleProperties.italic ? 'italic' : 'normal',
        textDecoration: [
          styleProperties.underline ? 'underline' : '',
          styleProperties.strikethrough ? 'line-through' : ''
        ].filter(Boolean).join(' ') || 'none',
        color: styleProperties.color || '#000000'
      };
    }

    if (styleType === 'paragraphStyle') {
      return {
        textAlign: styleProperties.alignment || 'left',
        lineHeight: styleProperties.lineHeight || 1.4,
        letterSpacing: `${styleProperties.letterSpacing || 0}px`,
        textIndent: `${styleProperties.indent || 0}px`,
        marginTop: `${styleProperties.spaceBefore || 0}px`,
        marginBottom: `${styleProperties.spaceAfter || 0}px`
      };
    }

    if (styleType === 'borderStyle') {
      return {
        borderWidth: `${styleProperties.width || 1}px`,
        borderStyle: styleProperties.style || 'solid',
        borderColor: styleProperties.color || '#d1d5db',
        borderRadius: `${styleProperties.radius || 0}px`
      };
    }

    if (styleType === 'fillStyle') {
      return {
        backgroundColor: styleProperties.backgroundColor || '#f9fafb',
        opacity: styleProperties.opacity || 1
      };
    }

    return styles;
  };

  const renderStyleEditor = () => {
    switch (styleType) {
      case 'textStyle':
        return renderTextStyleEditor();
      case 'paragraphStyle':
        return renderParagraphStyleEditor();
      case 'borderStyle':
        return renderBorderStyleEditor();
      case 'fillStyle':
        return renderFillStyleEditor();
      default:
        return <div>Tipo de estilo no soportado</div>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {getModalIcon()}
          {getModalTitle()}
        </div>
      }
      size="medium"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Información básica */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              marginBottom: '6px',
              color: '#374151'
            }}>
              Nombre del Estilo *
            </label>
            <input
              type="text"
              value={styleName}
              onChange={(e) => setStyleName(e.target.value)}
              placeholder="Ej: Mi estilo personalizado"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          <div>
            <label style={{ 
              display: 'block', 
              fontSize: '14px', 
              fontWeight: '500', 
              marginBottom: '6px',
              color: '#374151'
            }}>
              Categoría
            </label>
            <select
              value={styleCategory}
              onChange={(e) => setStyleCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="custom">Personalizado</option>
              <option value="headings">Títulos</option>
              <option value="body">Cuerpo</option>
              <option value="decorative">Decorativo</option>
              <option value="utility">Utilidad</option>
            </select>
          </div>
        </div>

        {/* Editor específico del tipo de estilo */}
        {renderStyleEditor()}

        {/* Vista previa */}
        {renderPreview()}

        {/* Botones de acción */}
        <div style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
          paddingTop: '16px',
          borderTop: '1px solid #e5e7eb'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: 'white',
              color: '#374151',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Cancelar
          </button>
          
          <button
            onClick={handleSave}
            style={{
              padding: '8px 16px',
              border: 'none',
              borderRadius: '6px',
              background: '#3b82f6',
              color: 'white',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Save size={16} />
            {editingStyleId ? 'Actualizar' : 'Crear'} Estilo
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default StyleEditorModal;