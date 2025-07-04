// src/components/layoutDesigner/hooks/useStyleManager.js - Hook para gestión de estilos
import { useState, useCallback, useEffect } from 'react';
import { styleManager } from '../utils/StyleManager';

export const useStyleManager = () => {
  // ✅ Estados para cache de estilos
  const [textStyles, setTextStyles] = useState([]);
  const [paragraphStyles, setParagraphStyles] = useState([]);
  const [borderStyles, setBorderStyles] = useState([]);
  const [fillStyles, setFillStyles] = useState([]);
  const [customFonts, setCustomFonts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  // ✅ Cargar todos los estilos al inicializar
  const loadAllStyles = useCallback(() => {
    console.log('🎨 Loading all styles from StyleManager');
    
    setTextStyles(styleManager.getAllTextStyles());
    setParagraphStyles(styleManager.getAllParagraphStyles());
    setBorderStyles(styleManager.getAllBorderStyles());
    setFillStyles(styleManager.getAllFillStyles());
    setCustomFonts(styleManager.getAvailableFonts());
    setLastUpdated(Date.now());
  }, []);

  // ✅ Cargar estilos al montar el componente
  useEffect(() => {
    loadAllStyles();
  }, [loadAllStyles]);

  // ✅ Crear nuevo estilo de texto
  const createTextStyle = useCallback((styleData) => {
    console.log('✨ Creating new text style:', styleData.name);
    
    const styleId = styleManager.generateStyleId('text');
    const fullStyleData = {
      ...styleData,
      isCustom: true,
      createdAt: new Date().toISOString()
    };
    
    try {
      styleManager.addTextStyle(styleId, fullStyleData);
      setTextStyles(styleManager.getAllTextStyles());
      setLastUpdated(Date.now());
      
      console.log('✅ Text style created:', styleId);
      return { success: true, styleId, data: fullStyleData };
    } catch (error) {
      console.error('❌ Error creating text style:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // ✅ Actualizar estilo de texto
  const updateTextStyle = useCallback((styleId, updates) => {
    console.log('📝 Updating text style:', styleId);
    
    try {
      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      styleManager.updateTextStyle(styleId, updatedData);
      setTextStyles(styleManager.getAllTextStyles());
      setLastUpdated(Date.now());
      
      console.log('✅ Text style updated:', styleId);
      return { success: true, styleId, data: updatedData };
    } catch (error) {
      console.error('❌ Error updating text style:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // ✅ Eliminar estilo de texto
  const deleteTextStyle = useCallback((styleId) => {
    console.log('🗑️ Deleting text style:', styleId);
    
    try {
      const deleted = styleManager.deleteTextStyle(styleId);
      if (deleted) {
        setTextStyles(styleManager.getAllTextStyles());
        setLastUpdated(Date.now());
        console.log('✅ Text style deleted:', styleId);
        return { success: true };
      } else {
        console.warn('⚠️ Text style not found:', styleId);
        return { success: false, error: 'Style not found' };
      }
    } catch (error) {
      console.error('❌ Error deleting text style:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // ✅ Crear nuevo estilo de párrafo
  const createParagraphStyle = useCallback((styleData) => {
    console.log('✨ Creating new paragraph style:', styleData.name);
    
    const styleId = styleManager.generateStyleId('paragraph');
    const fullStyleData = {
      ...styleData,
      isCustom: true,
      createdAt: new Date().toISOString()
    };
    
    try {
      styleManager.addParagraphStyle(styleId, fullStyleData);
      setParagraphStyles(styleManager.getAllParagraphStyles());
      setLastUpdated(Date.now());
      
      console.log('✅ Paragraph style created:', styleId);
      return { success: true, styleId, data: fullStyleData };
    } catch (error) {
      console.error('❌ Error creating paragraph style:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // ✅ Crear nuevo estilo de borde
  const createBorderStyle = useCallback((styleData) => {
    console.log('✨ Creating new border style:', styleData.name);
    
    const styleId = styleManager.generateStyleId('border');
    const fullStyleData = {
      ...styleData,
      isCustom: true,
      createdAt: new Date().toISOString()
    };
    
    try {
      styleManager.addBorderStyle(styleId, fullStyleData);
      setBorderStyles(styleManager.getAllBorderStyles());
      setLastUpdated(Date.now());
      
      console.log('✅ Border style created:', styleId);
      return { success: true, styleId, data: fullStyleData };
    } catch (error) {
      console.error('❌ Error creating border style:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // ✅ Crear nuevo estilo de relleno
  const createFillStyle = useCallback((styleData) => {
    console.log('✨ Creating new fill style:', styleData.name);
    
    const styleId = styleManager.generateStyleId('fill');
    const fullStyleData = {
      ...styleData,
      isCustom: true,
      createdAt: new Date().toISOString()
    };
    
    try {
      styleManager.addFillStyle(styleId, fullStyleData);
      setFillStyles(styleManager.getAllFillStyles());
      setLastUpdated(Date.now());
      
      console.log('✅ Fill style created:', styleId);
      return { success: true, styleId, data: fullStyleData };
    } catch (error) {
      console.error('❌ Error creating fill style:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // ✅ Aplicar estilos a elemento
  const applyStylesToElement = useCallback((element, styleIds) => {
    console.log('🎨 Applying styles to element:', element.id, styleIds);
    
    try {
      const appliedStyles = styleManager.applyStylesToElement(element, styleIds);
      console.log('✅ Styles applied successfully');
      return { success: true, appliedStyles };
    } catch (error) {
      console.error('❌ Error applying styles:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // ✅ Importar fuente personalizada
  const importCustomFont = useCallback(async (fontFile, fontName) => {
    console.log('📎 Importing custom font:', fontName);
    setIsLoading(true);
    
    try {
      const success = await styleManager.addCustomFont(fontFile, fontName);
      if (success) {
        setCustomFonts(styleManager.getAvailableFonts());
        setLastUpdated(Date.now());
        console.log('✅ Custom font imported:', fontName);
        return { success: true, fontName };
      } else {
        console.warn('⚠️ Font import failed');
        return { success: false, error: 'Font import failed' };
      }
    } catch (error) {
      console.error('❌ Error importing font:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ✅ Exportar todos los estilos
  const exportAllStyles = useCallback(() => {
    console.log('📤 Exporting all styles');
    
    try {
      const exportData = styleManager.exportStyles();
      
      // Crear archivo para descarga
      const blob = new Blob([JSON.stringify(exportData, null, 2)], 
        { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `layout-designer-styles-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log('✅ Styles exported successfully');
      return { success: true, data: exportData };
    } catch (error) {
      console.error('❌ Error exporting styles:', error);
      return { success: false, error: error.message };
    }
  }, []);

  // ✅ Importar estilos
  const importStyles = useCallback((stylesData) => {
    console.log('📥 Importing styles');
    
    try {
      styleManager.importStyles(stylesData);
      loadAllStyles(); // Recargar todos los estilos
      
      console.log('✅ Styles imported successfully');
      return { success: true };
    } catch (error) {
      console.error('❌ Error importing styles:', error);
      return { success: false, error: error.message };
    }
  }, [loadAllStyles]);

  // ✅ Obtener estilos por categoría
  const getStylesByCategory = useCallback((styleType, category) => {
    switch (styleType) {
      case 'text':
        return styleManager.getTextStylesByCategory(category);
      case 'paragraph':
        return styleManager.getParagraphStylesByCategory(category);
      default:
        return [];
    }
  }, []);

  // ✅ Obtener estilo específico por ID
  const getStyleById = useCallback((styleType, styleId) => {
    switch (styleType) {
      case 'text':
        return styleManager.getTextStyle(styleId);
      case 'paragraph':
        return styleManager.getParagraphStyle(styleId);
      case 'border':
        return styleManager.getBorderStyle(styleId);
      case 'fill':
        return styleManager.getFillStyle(styleId);
      default:
        return null;
    }
  }, []);

  // ✅ Crear múltiples estilos en lote
  const createStylesBatch = useCallback((stylesArray) => {
    console.log('🔄 Creating styles in batch:', stylesArray.length);
    
    const results = [];
    
    stylesArray.forEach(({ type, data }) => {
      try {
        let result;
        switch (type) {
          case 'text':
            result = createTextStyle(data);
            break;
          case 'paragraph':
            result = createParagraphStyle(data);
            break;
          case 'border':
            result = createBorderStyle(data);
            break;
          case 'fill':
            result = createFillStyle(data);
            break;
          default:
            result = { success: false, error: 'Unknown style type' };
        }
        results.push({ type, ...result });
      } catch (error) {
        results.push({ type, success: false, error: error.message });
      }
    });
    
    console.log('✅ Batch creation completed');
    return results;
  }, [createTextStyle, createParagraphStyle, createBorderStyle, createFillStyle]);

  // ✅ Refrescar cache de estilos
  const refreshStyles = useCallback(() => {
    console.log('🔄 Refreshing styles cache');
    loadAllStyles();
  }, [loadAllStyles]);

  // ✅ Estadísticas de estilos
  const getStylesStats = useCallback(() => {
    return {
      textStyles: {
        total: textStyles.length,
        custom: textStyles.filter(s => s.isCustom).length,
        default: textStyles.filter(s => !s.isCustom).length
      },
      paragraphStyles: {
        total: paragraphStyles.length,
        custom: paragraphStyles.filter(s => s.isCustom).length,
        default: paragraphStyles.filter(s => !s.isCustom).length
      },
      borderStyles: {
        total: borderStyles.length,
        custom: borderStyles.filter(s => s.isCustom).length,
        default: borderStyles.filter(s => !s.isCustom).length
      },
      fillStyles: {
        total: fillStyles.length,
        custom: fillStyles.filter(s => s.isCustom).length,
        default: fillStyles.filter(s => !s.isCustom).length
      },
      customFonts: customFonts.length,
      lastUpdated
    };
  }, [textStyles, paragraphStyles, borderStyles, fillStyles, customFonts, lastUpdated]);

  return {
    // Estado de estilos
    textStyles,
    paragraphStyles,
    borderStyles,
    fillStyles,
    customFonts,
    isLoading,
    lastUpdated,
    
    // Operaciones CRUD
    createTextStyle,
    updateTextStyle,
    deleteTextStyle,
    createParagraphStyle,
    createBorderStyle,
    createFillStyle,
    
    // Aplicación de estilos
    applyStylesToElement,
    
    // Gestión de fuentes
    importCustomFont,
    
    // Import/Export
    exportAllStyles,
    importStyles,
    
    // Utilidades
    getStylesByCategory,
    getStyleById,
    createStylesBatch,
    refreshStyles,
    loadAllStyles,
    
    // Estadísticas
    getStylesStats
  };
};