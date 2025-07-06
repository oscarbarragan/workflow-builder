// src/utils/StyleManager.js - MEJORADO con funciones de actualización

// ✅ MEJORADO: Gestor de estilos con funcionalidades completas
export class StyleManager {
  constructor() {
    this.textStyles = new Map();
    this.paragraphStyles = new Map();
    this.borderStyles = new Map();
    this.fillStyles = new Map();
    this.customFonts = new Set();
    
    // Inicializar con estilos por defecto
    this.initializeDefaultStyles();
  }

  initializeDefaultStyles() {
    // Text Styles por defecto
    this.addTextStyle('heading1', {
      name: 'Título 1',
      fontFamily: 'Arial, sans-serif',
      fontSize: 24,
      bold: true,
      italic: false,
      underline: false,
      strikethrough: false,
      color: '#1f2937',
      category: 'headings'
    });

    this.addTextStyle('heading2', {
      name: 'Título 2',
      fontFamily: 'Arial, sans-serif',
      fontSize: 18,
      bold: true,
      italic: false,
      underline: false,
      strikethrough: false,
      color: '#374151',
      category: 'headings'
    });

    this.addTextStyle('body', {
      name: 'Cuerpo',
      fontFamily: 'Arial, sans-serif',
      fontSize: 14,
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      color: '#4b5563',
      category: 'body'
    });

    // Paragraph Styles por defecto
    this.addParagraphStyle('normal', {
      name: 'Normal',
      alignment: 'left',
      verticalAlign: 'flex-start',
      lineHeight: 1.4,
      letterSpacing: 0,
      indent: 0,
      spaceBefore: 0,
      spaceAfter: 4,
      wordWrap: true,
      wordBreak: 'normal',
      category: 'basic'
    });

    this.addParagraphStyle('centered', {
      name: 'Centrado',
      alignment: 'center',
      verticalAlign: 'center',
      lineHeight: 1.4,
      letterSpacing: 0,
      indent: 0,
      spaceBefore: 8,
      spaceAfter: 8,
      wordWrap: true,
      wordBreak: 'normal',
      category: 'alignment'
    });

    // Border Styles por defecto
    this.addBorderStyle('none', {
      name: 'Sin Borde',
      width: 0,
      style: 'none',
      color: 'transparent',
      radius: 0,
      sides: ['top', 'right', 'bottom', 'left'],
      category: 'basic'
    });

    this.addBorderStyle('simple', {
      name: 'Borde Simple',
      width: 1,
      style: 'solid',
      color: '#d1d5db',
      radius: 4,
      sides: ['top', 'right', 'bottom', 'left'],
      category: 'basic'
    });

    this.addBorderStyle('rounded', {
      name: 'Redondeado',
      width: 2,
      style: 'solid',
      color: '#3b82f6',
      radius: 8,
      sides: ['top', 'right', 'bottom', 'left'],
      category: 'decorative'
    });

    // Fill Styles por defecto
    this.addFillStyle('transparent', {
      name: 'Transparente',
      backgroundColor: 'transparent',
      opacity: 1,
      gradient: null,
      category: 'basic'
    });

    this.addFillStyle('light', {
      name: 'Fondo Claro',
      backgroundColor: '#f9fafb',
      opacity: 1,
      gradient: null,
      category: 'basic'
    });

    this.addFillStyle('primary', {
      name: 'Primario',
      backgroundColor: '#eff6ff',
      opacity: 0.8,
      gradient: null,
      category: 'colors'
    });
  }

  // ✅ Text Styles - MEJORADO
  addTextStyle(id, style) {
    this.textStyles.set(id, {
      id,
      ...style,
      createdAt: style.createdAt || new Date().toISOString(),
      isCustom: style.isCustom !== undefined ? style.isCustom : !style.category
    });
  }

  getTextStyle(id) {
    return this.textStyles.get(id);
  }

  getAllTextStyles() {
    return Array.from(this.textStyles.values()).sort((a, b) => {
      // Ordenar: predefinidos primero, luego personalizados por fecha
      if (a.isCustom !== b.isCustom) {
        return a.isCustom ? 1 : -1;
      }
      return b.createdAt.localeCompare(a.createdAt);
    });
  }

  getTextStylesByCategory(category) {
    return this.getAllTextStyles().filter(style => style.category === category);
  }

  // ✅ NUEVO: Actualizar estilo de texto
  updateTextStyle(id, updates) {
    const style = this.textStyles.get(id);
    if (style) {
      this.textStyles.set(id, { 
        ...style, 
        ...updates, 
        updatedAt: new Date().toISOString() 
      });
      console.log('✅ TextStyle updated:', id);
      return true;
    }
    console.warn('⚠️ TextStyle not found for update:', id);
    return false;
  }

  deleteTextStyle(id) {
    const deleted = this.textStyles.delete(id);
    if (deleted) {
      console.log('🗑️ TextStyle deleted:', id);
    }
    return deleted;
  }

  // ✅ Paragraph Styles - MEJORADO
  addParagraphStyle(id, style) {
    this.paragraphStyles.set(id, {
      id,
      ...style,
      createdAt: style.createdAt || new Date().toISOString(),
      isCustom: style.isCustom !== undefined ? style.isCustom : !style.category
    });
  }

  getParagraphStyle(id) {
    return this.paragraphStyles.get(id);
  }

  getAllParagraphStyles() {
    return Array.from(this.paragraphStyles.values()).sort((a, b) => {
      if (a.isCustom !== b.isCustom) {
        return a.isCustom ? 1 : -1;
      }
      return b.createdAt.localeCompare(a.createdAt);
    });
  }

  getParagraphStylesByCategory(category) {
    return this.getAllParagraphStyles().filter(style => style.category === category);
  }

  // ✅ NUEVO: Actualizar estilo de párrafo
  updateParagraphStyle(id, updates) {
    const style = this.paragraphStyles.get(id);
    if (style) {
      this.paragraphStyles.set(id, { 
        ...style, 
        ...updates, 
        updatedAt: new Date().toISOString() 
      });
      console.log('✅ ParagraphStyle updated:', id);
      return true;
    }
    console.warn('⚠️ ParagraphStyle not found for update:', id);
    return false;
  }

  deleteParagraphStyle(id) {
    const deleted = this.paragraphStyles.delete(id);
    if (deleted) {
      console.log('🗑️ ParagraphStyle deleted:', id);
    }
    return deleted;
  }

  // ✅ Border Styles - MEJORADO
  addBorderStyle(id, style) {
    this.borderStyles.set(id, {
      id,
      ...style,
      createdAt: style.createdAt || new Date().toISOString(),
      isCustom: style.isCustom !== undefined ? style.isCustom : !style.category
    });
  }

  getBorderStyle(id) {
    return this.borderStyles.get(id);
  }

  getAllBorderStyles() {
    return Array.from(this.borderStyles.values()).sort((a, b) => {
      if (a.isCustom !== b.isCustom) {
        return a.isCustom ? 1 : -1;
      }
      return b.createdAt.localeCompare(a.createdAt);
    });
  }

  // ✅ NUEVO: Actualizar estilo de borde
  updateBorderStyle(id, updates) {
    const style = this.borderStyles.get(id);
    if (style) {
      this.borderStyles.set(id, { 
        ...style, 
        ...updates, 
        updatedAt: new Date().toISOString() 
      });
      console.log('✅ BorderStyle updated:', id);
      return true;
    }
    console.warn('⚠️ BorderStyle not found for update:', id);
    return false;
  }

  deleteBorderStyle(id) {
    const deleted = this.borderStyles.delete(id);
    if (deleted) {
      console.log('🗑️ BorderStyle deleted:', id);
    }
    return deleted;
  }

  // ✅ Fill Styles - MEJORADO
  addFillStyle(id, style) {
    this.fillStyles.set(id, {
      id,
      ...style,
      createdAt: style.createdAt || new Date().toISOString(),
      isCustom: style.isCustom !== undefined ? style.isCustom : !style.category
    });
  }

  getFillStyle(id) {
    return this.fillStyles.get(id);
  }

  getAllFillStyles() {
    return Array.from(this.fillStyles.values()).sort((a, b) => {
      if (a.isCustom !== b.isCustom) {
        return a.isCustom ? 1 : -1;
      }
      return b.createdAt.localeCompare(a.createdAt);
    });
  }

  // ✅ NUEVO: Actualizar estilo de relleno
  updateFillStyle(id, updates) {
    const style = this.fillStyles.get(id);
    if (style) {
      this.fillStyles.set(id, { 
        ...style, 
        ...updates, 
        updatedAt: new Date().toISOString() 
      });
      console.log('✅ FillStyle updated:', id);
      return true;
    }
    console.warn('⚠️ FillStyle not found for update:', id);
    return false;
  }

  deleteFillStyle(id) {
    const deleted = this.fillStyles.delete(id);
    if (deleted) {
      console.log('🗑️ FillStyle deleted:', id);
    }
    return deleted;
  }

  // ✅ NUEVO: Buscar estilos por nombre
  findStylesByName(searchTerm, styleType = null) {
    const searchLower = searchTerm.toLowerCase();
    const results = {
      textStyles: [],
      paragraphStyles: [],
      borderStyles: [],
      fillStyles: []
    };

    if (!styleType || styleType === 'textStyle') {
      results.textStyles = this.getAllTextStyles().filter(style => 
        style.name.toLowerCase().includes(searchLower)
      );
    }

    if (!styleType || styleType === 'paragraphStyle') {
      results.paragraphStyles = this.getAllParagraphStyles().filter(style => 
        style.name.toLowerCase().includes(searchLower)
      );
    }

    if (!styleType || styleType === 'borderStyle') {
      results.borderStyles = this.getAllBorderStyles().filter(style => 
        style.name.toLowerCase().includes(searchLower)
      );
    }

    if (!styleType || styleType === 'fillStyle') {
      results.fillStyles = this.getAllFillStyles().filter(style => 
        style.name.toLowerCase().includes(searchLower)
      );
    }

    return results;
  }

  // ✅ NUEVO: Verificar si un estilo está en uso
  isStyleInUse(styleId, styleType, elements = []) {
    const styleIdField = `${styleType}Id`;
    return elements.some(element => element[styleIdField] === styleId);
  }

  // ✅ NUEVO: Obtener elementos que usan un estilo
  getElementsUsingStyle(styleId, styleType, elements = []) {
    const styleIdField = `${styleType}Id`;
    return elements.filter(element => element[styleIdField] === styleId);
  }

  // ✅ NUEVO: Duplicar estilo
  duplicateStyle(styleId, styleType, newName = null) {
    let originalStyle = null;
    let newStyleId = this.generateStyleId(styleType);

    // Obtener el estilo original
    switch(styleType) {
      case 'textStyle':
        originalStyle = this.getTextStyle(styleId);
        break;
      case 'paragraphStyle':
        originalStyle = this.getParagraphStyle(styleId);
        break;
      case 'borderStyle':
        originalStyle = this.getBorderStyle(styleId);
        break;
      case 'fillStyle':
        originalStyle = this.getFillStyle(styleId);
        break;
      default:
        console.error('❌ Invalid style type:', styleType);
        return null;
    }

    if (!originalStyle) {
      console.error('❌ Original style not found:', styleId);
      return null;
    }

    // Crear el estilo duplicado
    const duplicatedStyle = {
      ...originalStyle,
      id: newStyleId,
      name: newName || `${originalStyle.name} (Copia)`,
      isCustom: true,
      createdAt: new Date().toISOString(),
      duplicatedFrom: styleId
    };

    // Agregar el nuevo estilo
    switch(styleType) {
      case 'textStyle':
        this.addTextStyle(newStyleId, duplicatedStyle);
        break;
      case 'paragraphStyle':
        this.addParagraphStyle(newStyleId, duplicatedStyle);
        break;
      case 'borderStyle':
        this.addBorderStyle(newStyleId, duplicatedStyle);
        break;
      case 'fillStyle':
        this.addFillStyle(newStyleId, duplicatedStyle);
        break;
    }

    console.log('✅ Style duplicated:', newStyleId);
    return newStyleId;
  }

  // ✅ Custom Fonts
  async addCustomFont(fontFile, fontName) {
    try {
      const fontFace = new FontFace(fontName, `url(${URL.createObjectURL(fontFile)})`);
      await fontFace.load();
      document.fonts.add(fontFace);
      this.customFonts.add(fontName);
      console.log('✅ Custom font added:', fontName);
      return true;
    } catch (error) {
      console.error('❌ Error loading custom font:', error);
      return false;
    }
  }

  getAvailableFonts() {
    const systemFonts = [
      'Arial, sans-serif',
      'Times, serif',
      'Courier, monospace',
      'Georgia, serif',
      'Verdana, sans-serif',
      'Helvetica, sans-serif',
      'Tahoma, sans-serif',
      'Trebuchet MS, sans-serif'
    ];

    const customFonts = Array.from(this.customFonts).map(font => `${font}, sans-serif`);
    
    return [...systemFonts, ...customFonts];
  }

  // ✅ MEJORADO: Export/Import con metadatos
  exportStyles() {
    const exportData = {
      textStyles: Object.fromEntries(this.textStyles),
      paragraphStyles: Object.fromEntries(this.paragraphStyles),
      borderStyles: Object.fromEntries(this.borderStyles),
      fillStyles: Object.fromEntries(this.fillStyles),
      customFonts: Array.from(this.customFonts),
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        totalStyles: this.textStyles.size + this.paragraphStyles.size + 
                    this.borderStyles.size + this.fillStyles.size,
        customStylesCount: [
          ...this.textStyles.values(),
          ...this.paragraphStyles.values(),
          ...this.borderStyles.values(),
          ...this.fillStyles.values()
        ].filter(style => style.isCustom).length
      }
    };

    console.log('📤 Styles exported:', exportData.metadata);
    return exportData;
  }

  importStyles(stylesData) {
    let importedCount = 0;
    
    try {
      if (stylesData.textStyles) {
        Object.entries(stylesData.textStyles).forEach(([id, style]) => {
          this.textStyles.set(id, {
            ...style,
            importedAt: new Date().toISOString()
          });
          importedCount++;
        });
      }

      if (stylesData.paragraphStyles) {
        Object.entries(stylesData.paragraphStyles).forEach(([id, style]) => {
          this.paragraphStyles.set(id, {
            ...style,
            importedAt: new Date().toISOString()
          });
          importedCount++;
        });
      }

      if (stylesData.borderStyles) {
        Object.entries(stylesData.borderStyles).forEach(([id, style]) => {
          this.borderStyles.set(id, {
            ...style,
            importedAt: new Date().toISOString()
          });
          importedCount++;
        });
      }

      if (stylesData.fillStyles) {
        Object.entries(stylesData.fillStyles).forEach(([id, style]) => {
          this.fillStyles.set(id, {
            ...style,
            importedAt: new Date().toISOString()
          });
          importedCount++;
        });
      }

      if (stylesData.customFonts) {
        stylesData.customFonts.forEach(font => {
          this.customFonts.add(font);
        });
      }

      console.log('📥 Styles imported:', importedCount, 'styles');
      return { success: true, importedCount };
    } catch (error) {
      console.error('❌ Error importing styles:', error);
      return { success: false, error: error.message };
    }
  }

  // ✅ Style Application Helper
  applyStylesToElement(element, styleIds) {
    const appliedStyles = {};

    if (styleIds.textStyleId) {
      const textStyle = this.getTextStyle(styleIds.textStyleId);
      if (textStyle) {
        appliedStyles.textStyle = { ...textStyle };
      }
    }

    if (styleIds.paragraphStyleId) {
      const paragraphStyle = this.getParagraphStyle(styleIds.paragraphStyleId);
      if (paragraphStyle) {
        appliedStyles.paragraphStyle = { ...paragraphStyle };
      }
    }

    if (styleIds.borderStyleId) {
      const borderStyle = this.getBorderStyle(styleIds.borderStyleId);
      if (borderStyle) {
        appliedStyles.borderStyle = { ...borderStyle };
      }
    }

    if (styleIds.fillStyleId) {
      const fillStyle = this.getFillStyle(styleIds.fillStyleId);
      if (fillStyle) {
        appliedStyles.fillStyle = { ...fillStyle };
      }
    }

    return appliedStyles;
  }

  // ✅ NUEVO: Obtener estadísticas detalladas
  getDetailedStats() {
    const allStyles = [
      ...this.textStyles.values(),
      ...this.paragraphStyles.values(),
      ...this.borderStyles.values(),
      ...this.fillStyles.values()
    ];

    return {
      total: allStyles.length,
      byType: {
        textStyles: this.textStyles.size,
        paragraphStyles: this.paragraphStyles.size,
        borderStyles: this.borderStyles.size,
        fillStyles: this.fillStyles.size
      },
      byCustomStatus: {
        custom: allStyles.filter(s => s.isCustom).length,
        predefined: allStyles.filter(s => !s.isCustom).length
      },
      byCategory: allStyles.reduce((acc, style) => {
        const category = style.category || 'uncategorized';
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {}),
      recentlyModified: allStyles
        .filter(s => s.updatedAt)
        .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
        .slice(0, 5),
      customFonts: this.customFonts.size
    };
  }

  // ✅ Generate unique ID
  generateStyleId(prefix = 'style') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // ✅ NUEVO: Limpiar estilos no utilizados
  cleanupUnusedStyles(elements = []) {
    const usedStyleIds = new Set();
    
    // Recopilar todos los IDs de estilos en uso
    elements.forEach(element => {
      if (element.textStyleId) usedStyleIds.add(element.textStyleId);
      if (element.paragraphStyleId) usedStyleIds.add(element.paragraphStyleId);
      if (element.borderStyleId) usedStyleIds.add(element.borderStyleId);
      if (element.fillStyleId) usedStyleIds.add(element.fillStyleId);
    });

    let deletedCount = 0;

    // Eliminar estilos no utilizados (solo personalizados)
    for (const [id, style] of this.textStyles) {
      if (style.isCustom && !usedStyleIds.has(id)) {
        this.textStyles.delete(id);
        deletedCount++;
      }
    }

    for (const [id, style] of this.paragraphStyles) {
      if (style.isCustom && !usedStyleIds.has(id)) {
        this.paragraphStyles.delete(id);
        deletedCount++;
      }
    }

    for (const [id, style] of this.borderStyles) {
      if (style.isCustom && !usedStyleIds.has(id)) {
        this.borderStyles.delete(id);
        deletedCount++;
      }
    }

    for (const [id, style] of this.fillStyles) {
      if (style.isCustom && !usedStyleIds.has(id)) {
        this.fillStyles.delete(id);
        deletedCount++;
      }
    }

    console.log('🧹 Cleanup completed:', deletedCount, 'unused styles deleted');
    return deletedCount;
  }
}

// ✅ Singleton instance
export const styleManager = new StyleManager();