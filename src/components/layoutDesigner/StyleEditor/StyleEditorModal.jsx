// src/components/layoutDesigner/StyleEditor/StyleEditorModal.jsx - FIX INPUT MODAL
import React, { useState, useEffect } from 'react';
import Modal from '../../common/Modal/Modal';
import { styleManager } from '../utils/StyleManager';
import { editorConfig } from './editor.config';
import TextStyleEditor from './TextStyleEditor';
import ParagraphStyleEditor from './ParagraphStyleEditor';
import BorderStyleEditor from './BorderStyleEditor';
import FillStyleEditor from './FillStyleEditor';

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
  const [previewText, setPreviewText] = useState('');

  // Inicializar cuando se abre el modal
  useEffect(() => {
    if (isOpen && styleType) {
      const config = editorConfig.styleTypes[styleType];
      setPreviewText(editorConfig.previewTexts[styleType] || 'Vista previa');
      
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
        setStyleProperties({ ...config.defaultProps });
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

  // ✅ CORREGIDO: Función de actualización que permite edición libre
  const updateProperty = (property, value) => {
    console.log('🎨 Modal: Updating property:', property, 'to:', value);
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
      isCustom: true,
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
          if (editingStyleId) {
            styleManager.updateParagraphStyle(styleId, styleData);
          } else {
            styleManager.addParagraphStyle(styleId, styleData);
          }
          break;
        case 'borderStyle':
          if (editingStyleId) {
            styleManager.updateBorderStyle(styleId, styleData);
          } else {
            styleManager.addBorderStyle(styleId, styleData);
          }
          break;
        case 'fillStyle':
          if (editingStyleId) {
            styleManager.updateFillStyle(styleId, styleData);
          } else {
            styleManager.addFillStyle(styleId, styleData);
          }
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
    if (!styleType) return 'Editor de Estilos';
    
    const config = editorConfig.styleTypes[styleType];
    const action = editingStyleId ? 'Editar' : 'Crear';
    return `${action} ${config.name}`;
  };

  const getModalIcon = () => {
    if (!styleType) return '🎨';
    return editorConfig.styleTypes[styleType].icon;
  };

  const renderStyleEditor = () => {
    const commonProps = {
      styleProperties,
      updateProperty
    };

    switch (styleType) {
      case 'textStyle':
        return <TextStyleEditorFixed {...commonProps} />;
      case 'paragraphStyle':
        return <ParagraphStyleEditor {...commonProps} />;
      case 'borderStyle':
        return <BorderStyleEditor {...commonProps} />;
      case 'fillStyle':
        return <FillStyleEditor {...commonProps} />;
      default:
        return <div>Tipo de estilo no soportado</div>;
    }
  };

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
          {previewText}
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
        letterSpacing: `${styleProperties.letterSpacing || 0}px`
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

    return {};
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{getModalIcon()}</span>
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
              {editorConfig.categories.map(category => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
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
            💾 {editingStyleId ? 'Actualizar' : 'Crear'} Estilo
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ✅ CORREGIDO: TextStyleEditor con inputs que permiten edición libre
const TextStyleEditorFixed = ({ styleProperties, updateProperty }) => {
  // ✅ State para valores temporales durante edición
  const [tempValues, setTempValues] = useState({});

  // ✅ Función para manejar cambio de input numérico
  const handleNumericChange = (property, value, config) => {
    // Guardar valor temporal
    setTempValues(prev => ({ ...prev, [property]: value }));
  };

  // ✅ Función para aplicar valor al perder foco
  const handleNumericBlur = (property, value, config) => {
    // Limpiar valor temporal
    setTempValues(prev => {
      const updated = { ...prev };
      delete updated[property];
      return updated;
    });

    // Aplicar valor final
    if (value === '' || value === null || value === undefined) {
      updateProperty(property, config.default || 0);
    } else {
      const numValue = parseFloat(value);
      updateProperty(property, isNaN(numValue) ? config.default || 0 : numValue);
    }
  };

  // ✅ Función para obtener valor actual (temporal o real)
  const getCurrentValue = (property, config) => {
    if (tempValues[property] !== undefined) {
      return tempValues[property];
    }
    const value = styleProperties[property];
    return value !== undefined && value !== null ? value : config.default;
  };

  return (
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
          value={getCurrentValue('fontSize', { default: 14 })}
          onChange={(e) => handleNumericChange('fontSize', e.target.value, { default: 14 })}
          onBlur={(e) => handleNumericBlur('fontSize', e.target.value, { default: 14 })}
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
          {[
            { key: 'bold', label: 'Negrita', icon: '𝐁' },
            { key: 'italic', label: 'Cursiva', icon: '𝐼' },
            { key: 'underline', label: 'Subrayado', icon: 'U̲' },
            { key: 'strikethrough', label: 'Tachado', icon: 'S̶' }
          ].map(style => (
            <label 
              key={style.key}
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
                background: styleProperties[style.key] ? '#eff6ff' : 'white'
              }}
            >
              <input
                type="checkbox"
                checked={styleProperties[style.key] || false}
                onChange={(e) => updateProperty(style.key, e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span style={{ marginRight: '4px' }}>{style.icon}</span>
              {style.label}
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
};

export default StyleEditorModal;