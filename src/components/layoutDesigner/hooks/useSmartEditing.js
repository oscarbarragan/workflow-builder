// src/components/layoutDesigner/hooks/useSmartEditing.js
import { useCallback, useMemo } from 'react';
import { styleManager } from '../utils/StyleManager';

/**
 * Hook para gestión inteligente de edición de estilos
 * Maneja automáticamente los conflictos entre estilos aplicados y edición manual
 */
export const useSmartEditing = (selectedElement, onUpdateSelectedElement) => {
  
  // ✅ Detectar estilos aplicados
  const appliedStyles = useMemo(() => {
    if (!selectedElement) return {};
    
    return {
      textStyleId: selectedElement.textStyleId,
      paragraphStyleId: selectedElement.paragraphStyleId,
      borderStyleId: selectedElement.borderStyleId,
      fillStyleId: selectedElement.fillStyleId
    };
  }, [selectedElement]);

  // ✅ Verificar si hay estilos aplicados
  const hasAppliedStyles = useMemo(() => {
    return Object.values(appliedStyles).some(Boolean);
  }, [appliedStyles]);

  // ✅ Obtener información detallada de estilos aplicados
  const getAppliedStylesInfo = useCallback(() => {
    const styles = [];
    
    if (appliedStyles.textStyleId) {
      const style = styleManager.getTextStyle(appliedStyles.textStyleId);
      styles.push({ 
        type: 'textStyle', 
        id: appliedStyles.textStyleId, 
        name: style?.name || 'Desconocido',
        data: style
      });
    }
    
    if (appliedStyles.paragraphStyleId) {
      const style = styleManager.getParagraphStyle(appliedStyles.paragraphStyleId);
      styles.push({ 
        type: 'paragraphStyle', 
        id: appliedStyles.paragraphStyleId, 
        name: style?.name || 'Desconocido',
        data: style
      });
    }
    
    if (appliedStyles.borderStyleId) {
      const style = styleManager.getBorderStyle(appliedStyles.borderStyleId);
      styles.push({ 
        type: 'borderStyle', 
        id: appliedStyles.borderStyleId, 
        name: style?.name || 'Desconocido',
        data: style
      });
    }
    
    if (appliedStyles.fillStyleId) {
      const style = styleManager.getFillStyle(appliedStyles.fillStyleId);
      styles.push({ 
        type: 'fillStyle', 
        id: appliedStyles.fillStyleId, 
        name: style?.name || 'Desconocido',
        data: style
      });
    }
    
    return styles;
  }, [appliedStyles]);

  // ✅ Mapeo de propiedades a tipos de estilo
  const propertyStyleMap = useMemo(() => ({
    // Text Style properties
    'fontSize': 'textStyle',
    'fontFamily': 'textStyle',
    'color': 'textStyle',
    'bold': 'textStyle',
    'italic': 'textStyle',
    'underline': 'textStyle',
    'strikethrough': 'textStyle',
    'scale': 'textStyle',
    
    // Paragraph Style properties
    'alignment': 'paragraphStyle',
    'lineHeight': 'paragraphStyle',
    'letterSpacing': 'paragraphStyle',
    'indent': 'paragraphStyle',
    'spaceBefore': 'paragraphStyle',
    'spaceAfter': 'paragraphStyle',
    'leftSpacing': 'paragraphStyle',
    'rightSpacing': 'paragraphStyle',
    'firstLineIndent': 'paragraphStyle',
    'wordWrap': 'paragraphStyle',
    
    // Border Style properties
    'borderWidth': 'borderStyle',
    'borderStyle': 'borderStyle',
    'borderColor': 'borderStyle',
    'borderRadius': 'borderStyle',
    
    // Fill Style properties
    'backgroundColor': 'fillStyle',
    'fillColor': 'fillStyle',
    'opacity': 'fillStyle'
  }), []);

  // ✅ Detectar si una propiedad tiene conflicto con un estilo aplicado
  const hasPropertyConflict = useCallback((property) => {
    const affectedStyleType = propertyStyleMap[property];
    if (!affectedStyleType) return false;
    
    const styleIdField = `${affectedStyleType}Id`;
    return !!appliedStyles[styleIdField];
  }, [propertyStyleMap, appliedStyles]);

  // ✅ Obtener información del conflicto de una propiedad
  const getPropertyConflictInfo = useCallback((property) => {
    const affectedStyleType = propertyStyleMap[property];
    if (!affectedStyleType) return null;
    
    const styleIdField = `${affectedStyleType}Id`;
    const styleId = appliedStyles[styleIdField];
    if (!styleId) return null;
    
    let styleInfo = null;
    switch (affectedStyleType) {
      case 'textStyle':
        styleInfo = styleManager.getTextStyle(styleId);
        break;
      case 'paragraphStyle':
        styleInfo = styleManager.getParagraphStyle(styleId);
        break;
      case 'borderStyle':
        styleInfo = styleManager.getBorderStyle(styleId);
        break;
      case 'fillStyle':
        styleInfo = styleManager.getFillStyle(styleId);
        break;
    }
    
    return {
      styleType: affectedStyleType,
      styleId,
      styleName: styleInfo?.name || 'Estilo aplicado',
      styleData: styleInfo
    };
  }, [propertyStyleMap, appliedStyles]);

  // ✅ Desvincular un estilo específico
  const unlinkStyle = useCallback((styleType) => {
    const styleIdField = `${styleType}Id`;
    onUpdateSelectedElement(styleIdField, null);
    console.log(`🔓 Unlinked ${styleType}`);
  }, [onUpdateSelectedElement]);

  // ✅ Desvincular todos los estilos
  const unlinkAllStyles = useCallback(() => {
    Object.keys(appliedStyles).forEach(styleField => {
      if (appliedStyles[styleField]) {
        onUpdateSelectedElement(styleField, null);
      }
    });
    console.log('🔓 All styles unlinked');
  }, [appliedStyles, onUpdateSelectedElement]);

  // ✅ Función principal de edición inteligente
  const smartEdit = useCallback((property, value, options = {}) => {
    console.log('🎯 Smart edit:', property, '=', value);
    
    const conflictInfo = getPropertyConflictInfo(property);
    
    if (!conflictInfo) {
      // No hay conflicto, edición directa
      console.log(`✏️ Direct edit for property "${property}" (no style conflict)`);
      onUpdateSelectedElement(property, value);
      return { success: true, action: 'direct' };
    }
    
    // Hay conflicto con un estilo aplicado
    console.log(`⚠️ Property "${property}" conflicts with ${conflictInfo.styleType}: ${conflictInfo.styleName}`);
    
    // Verificar si hay opciones predefinidas
    if (options.autoUnlink) {
      // Desvincular automáticamente
      unlinkStyle(conflictInfo.styleType);
      onUpdateSelectedElement(property, value);
      return { success: true, action: 'auto_unlink', unlinkedStyle: conflictInfo };
    }
    
    if (options.silent) {
      // No mostrar diálogo, solo reportar el conflicto
      return { success: false, action: 'conflict_detected', conflictInfo };
    }
    
    // Mostrar diálogo de confirmación al usuario
    const userChoice = window.confirm(
      `La propiedad "${property}" está controlada por el estilo "${conflictInfo.styleName}".\n\n` +
      `¿Qué deseas hacer?\n\n` +
      `✅ OK = Desvincular estilo y editar manualmente\n` +
      `❌ Cancelar = Mantener estilo (no realizar cambios)`
    );
    
    if (userChoice) {
      console.log(`🔓 User chose to unlink ${conflictInfo.styleType} and edit manually`);
      
      // Desvincular el estilo y aplicar el cambio manual
      unlinkStyle(conflictInfo.styleType);
      
      // Actualizar la propiedad en el objeto de estilo correspondiente si es necesario
      if (conflictInfo.styleType === 'textStyle') {
        const currentTextStyle = selectedElement.textStyle || {};
        onUpdateSelectedElement('textStyle', { ...currentTextStyle, [property]: value });
      } else if (conflictInfo.styleType === 'paragraphStyle') {
        const currentParagraphStyle = selectedElement.paragraphStyle || {};
        onUpdateSelectedElement('paragraphStyle', { ...currentParagraphStyle, [property]: value });
      } else if (conflictInfo.styleType === 'borderStyle') {
        const currentBorderStyle = selectedElement.borderStyle || {};
        onUpdateSelectedElement('borderStyle', { ...currentBorderStyle, [property]: value });
      } else if (conflictInfo.styleType === 'fillStyle') {
        const currentFillStyle = selectedElement.fillStyle || {};
        onUpdateSelectedElement('fillStyle', { ...currentFillStyle, [property]: value });
      } else {
        // Para propiedades directas
        onUpdateSelectedElement(property, value);
      }
      
      return { success: true, action: 'user_unlink', unlinkedStyle: conflictInfo };
    } else {
      console.log('❌ User cancelled edit to preserve applied style');
      return { success: false, action: 'user_cancelled', conflictInfo };
    }
  }, [getPropertyConflictInfo, unlinkStyle, onUpdateSelectedElement, selectedElement]);

  // ✅ Actualizar estilo aplicado con nuevos valores
  const updateAppliedStyle = useCallback((styleType, updates) => {
    const styleIdField = `${styleType}Id`;
    const styleId = appliedStyles[styleIdField];
    
    if (!styleId) {
      console.warn(`No ${styleType} applied to update`);
      return { success: false, error: 'No style applied' };
    }
    
    try {
      const currentStyleData = (() => {
        switch (styleType) {
          case 'textStyle': return styleManager.getTextStyle(styleId);
          case 'paragraphStyle': return styleManager.getParagraphStyle(styleId);
          case 'borderStyle': return styleManager.getBorderStyle(styleId);
          case 'fillStyle': return styleManager.getFillStyle(styleId);
          default: return null;
        }
      })();
      
      if (!currentStyleData) {
        console.error(`Style data not found for ${styleId}`);
        return { success: false, error: 'Style data not found' };
      }
      
      const updatedStyleData = {
        ...currentStyleData,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      // Actualizar en el StyleManager
      switch (styleType) {
        case 'textStyle':
          styleManager.updateTextStyle(styleId, updatedStyleData);
          break;
        case 'paragraphStyle':
          styleManager.updateParagraphStyle(styleId, updatedStyleData);
          break;
        case 'borderStyle':
          styleManager.updateBorderStyle(styleId, updatedStyleData);
          break;
        case 'fillStyle':
          styleManager.updateFillStyle(styleId, updatedStyleData);
          break;
      }
      
      console.log(`✅ ${styleType} updated:`, styleId);
      return { success: true, styleId, updatedData: updatedStyleData };
    } catch (error) {
      console.error(`❌ Error updating ${styleType}:`, error);
      return { success: false, error: error.message };
    }
  }, [appliedStyles]);

  // ✅ Edición en modo "actualizar estilo"
  const updateStyleMode = useCallback((property, value) => {
    const conflictInfo = getPropertyConflictInfo(property);
    
    if (!conflictInfo) {
      // No hay estilo que actualizar, edición directa
      onUpdateSelectedElement(property, value);
      return { success: true, action: 'direct' };
    }
    
    // Actualizar el estilo aplicado con el nuevo valor
    const result = updateAppliedStyle(conflictInfo.styleType, { [property]: value });
    
    if (result.success) {
      // También actualizar el elemento para reflejar el cambio inmediatamente
      const styleObjectProperty = conflictInfo.styleType === 'textStyle' ? 'textStyle' :
                                  conflictInfo.styleType === 'paragraphStyle' ? 'paragraphStyle' :
                                  conflictInfo.styleType === 'borderStyle' ? 'borderStyle' :
                                  conflictInfo.styleType === 'fillStyle' ? 'fillStyle' : null;
      
      if (styleObjectProperty) {
        const currentStyleObject = selectedElement[styleObjectProperty] || {};
        onUpdateSelectedElement(styleObjectProperty, { ...currentStyleObject, [property]: value });
      }
      
      return { success: true, action: 'style_updated', updatedStyle: result };
    }
    
    return result;
  }, [getPropertyConflictInfo, updateAppliedStyle, onUpdateSelectedElement, selectedElement]);

  // ✅ Obtener modo de edición recomendado
  const getEditingMode = useCallback(() => {
    if (!hasAppliedStyles) {
      return 'manual'; // Sin estilos aplicados, edición manual
    }
    
    const stylesInfo = getAppliedStylesInfo();
    const hasCustomStyles = stylesInfo.some(style => style.data?.isCustom);
    
    if (hasCustomStyles) {
      return 'smart'; // Tiene estilos personalizados, usar modo inteligente
    }
    
    return 'protected'; // Solo estilos predefinidos, proteger más
  }, [hasAppliedStyles, getAppliedStylesInfo]);

  // ✅ Generar mensaje de ayuda contextual
  const getContextualHelp = useCallback(() => {
    const mode = getEditingMode();
    
    switch (mode) {
      case 'manual':
        return {
          title: '✏️ Modo Manual',
          message: 'Todas las propiedades se editan directamente. Puedes aplicar estilos desde el sidebar izquierdo.',
          type: 'success'
        };
      
      case 'smart':
        return {
          title: '🎨 Modo Inteligente',
          message: 'Hay estilos aplicados. Al editar propiedades vinculadas, se te preguntará si quieres desvincular el estilo.',
          type: 'warning'
        };
      
      case 'protected':
        return {
          title: '🛡️ Modo Protegido',
          message: 'Hay estilos predefinidos aplicados. Recomendamos duplicar el estilo antes de editarlo.',
          type: 'info'
        };
      
      default:
        return {
          title: '❓ Modo Desconocido',
          message: 'Estado de edición no reconocido.',
          type: 'neutral'
        };
    }
  }, [getEditingMode]);

  // ✅ Obtener estadísticas del elemento
  const getElementStats = useCallback(() => {
    const stylesInfo = getAppliedStylesInfo();
    
    return {
      appliedStylesCount: stylesInfo.length,
      hasCustomStyles: stylesInfo.some(style => style.data?.isCustom),
      hasPredefinedStyles: stylesInfo.some(style => !style.data?.isCustom),
      editingMode: getEditingMode(),
      conflictingProperties: Object.keys(propertyStyleMap).filter(hasPropertyConflict)
    };
  }, [getAppliedStylesInfo, getEditingMode, propertyStyleMap, hasPropertyConflict]);

  return {
    // Estado
    appliedStyles,
    hasAppliedStyles,
    
    // Información
    getAppliedStylesInfo,
    getPropertyConflictInfo,
    hasPropertyConflict,
    getEditingMode,
    getContextualHelp,
    getElementStats,
    
    // Acciones
    smartEdit,
    updateStyleMode,
    unlinkStyle,
    unlinkAllStyles,
    updateAppliedStyle,
    
    // Utilidades
    propertyStyleMap
  };
};

export default useSmartEditing;