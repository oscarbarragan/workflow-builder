// src/utils/StyleManager.js - Gestor de estilos como Inspire Designer

// ✅ NUEVO: Gestor de estilos personalizados
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
        category: 'basic'
      });
  
      this.addBorderStyle('simple', {
        name: 'Borde Simple',
        width: 1,
        style: 'solid',
        color: '#d1d5db',
        radius: 4,
        category: 'basic'
      });
  
      this.addBorderStyle('rounded', {
        name: 'Redondeado',
        width: 2,
        style: 'solid',
        color: '#3b82f6',
        radius: 8,
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
  
    // ✅ Text Styles
    addTextStyle(id, style) {
      this.textStyles.set(id, {
        id,
        ...style,
        createdAt: new Date().toISOString(),
        isCustom: !style.category
      });
    }
  
    getTextStyle(id) {
      return this.textStyles.get(id);
    }
  
    getAllTextStyles() {
      return Array.from(this.textStyles.values());
    }
  
    getTextStylesByCategory(category) {
      return this.getAllTextStyles().filter(style => style.category === category);
    }
  
    updateTextStyle(id, updates) {
      const style = this.textStyles.get(id);
      if (style) {
        this.textStyles.set(id, { ...style, ...updates, updatedAt: new Date().toISOString() });
      }
    }
  
    deleteTextStyle(id) {
      return this.textStyles.delete(id);
    }
  
    // ✅ Paragraph Styles
    addParagraphStyle(id, style) {
      this.paragraphStyles.set(id, {
        id,
        ...style,
        createdAt: new Date().toISOString(),
        isCustom: !style.category
      });
    }
  
    getParagraphStyle(id) {
      return this.paragraphStyles.get(id);
    }
  
    getAllParagraphStyles() {
      return Array.from(this.paragraphStyles.values());
    }
  
    getParagraphStylesByCategory(category) {
      return this.getAllParagraphStyles().filter(style => style.category === category);
    }
  
    // ✅ Border Styles
    addBorderStyle(id, style) {
      this.borderStyles.set(id, {
        id,
        ...style,
        createdAt: new Date().toISOString(),
        isCustom: !style.category
      });
    }
  
    getBorderStyle(id) {
      return this.borderStyles.get(id);
    }
  
    getAllBorderStyles() {
      return Array.from(this.borderStyles.values());
    }
  
    // ✅ Fill Styles
    addFillStyle(id, style) {
      this.fillStyles.set(id, {
        id,
        ...style,
        createdAt: new Date().toISOString(),
        isCustom: !style.category
      });
    }
  
    getFillStyle(id) {
      return this.fillStyles.get(id);
    }
  
    getAllFillStyles() {
      return Array.from(this.fillStyles.values());
    }
  
    // ✅ Custom Fonts
    async addCustomFont(fontFile, fontName) {
      try {
        const fontFace = new FontFace(fontName, `url(${URL.createObjectURL(fontFile)})`);
        await fontFace.load();
        document.fonts.add(fontFace);
        this.customFonts.add(fontName);
        return true;
      } catch (error) {
        console.error('Error loading custom font:', error);
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
  
    // ✅ Export/Import
    exportStyles() {
      return {
        textStyles: Object.fromEntries(this.textStyles),
        paragraphStyles: Object.fromEntries(this.paragraphStyles),
        borderStyles: Object.fromEntries(this.borderStyles),
        fillStyles: Object.fromEntries(this.fillStyles),
        customFonts: Array.from(this.customFonts),
        exportedAt: new Date().toISOString()
      };
    }
  
    importStyles(stylesData) {
      if (stylesData.textStyles) {
        Object.entries(stylesData.textStyles).forEach(([id, style]) => {
          this.textStyles.set(id, style);
        });
      }
  
      if (stylesData.paragraphStyles) {
        Object.entries(stylesData.paragraphStyles).forEach(([id, style]) => {
          this.paragraphStyles.set(id, style);
        });
      }
  
      if (stylesData.borderStyles) {
        Object.entries(stylesData.borderStyles).forEach(([id, style]) => {
          this.borderStyles.set(id, style);
        });
      }
  
      if (stylesData.fillStyles) {
        Object.entries(stylesData.fillStyles).forEach(([id, style]) => {
          this.fillStyles.set(id, style);
        });
      }
  
      if (stylesData.customFonts) {
        stylesData.customFonts.forEach(font => {
          this.customFonts.add(font);
        });
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
  
    // ✅ Generate unique ID
    generateStyleId(prefix = 'style') {
      return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }
  
  // ✅ Singleton instance
  export const styleManager = new StyleManager();
  
  // ✅ Element Type Extensions
  export const EXTENDED_ELEMENT_TYPES = {
    TEXT: 'text',
    VARIABLE: 'variable',
    RECTANGLE: 'rectangle',
    TABLE: 'table',
    CHART: 'chart',
    IMAGE: 'image',
    LINE: 'line',
    SHAPE: 'shape'
  };
  
  // ✅ Chart Types
  export const CHART_TYPES = {
    BAR: 'bar',
    LINE: 'line',
    PIE: 'pie',
    AREA: 'area',
    SCATTER: 'scatter'
  };
  
  // ✅ Table Properties
  export const TABLE_PROPERTIES = {
    rows: 3,
    columns: 3,
    cellPadding: 8,
    borderCollapse: true,
    headerRow: true,
    alternateRowColors: true,
    headerBackgroundColor: '#f3f4f6',
    alternateRowColor: '#f9fafb',
    borderColor: '#d1d5db',
    borderWidth: 1
  };
  
  // ✅ Extended Default Properties
  export const EXTENDED_DEFAULT_PROPS = {
    [EXTENDED_ELEMENT_TYPES.TEXT]: {
      text: 'Nuevo Texto',
      width: 200,
      height: 40,
      padding: '8px 12px',
      textStyle: null,
      paragraphStyle: null,
      borderStyle: null,
      fillStyle: null,
      textStyleId: 'body',
      paragraphStyleId: 'normal',
      borderStyleId: 'none',
      fillStyleId: 'transparent'
    },
    
    [EXTENDED_ELEMENT_TYPES.TABLE]: {
      ...TABLE_PROPERTIES,
      width: 400,
      height: 200,
      data: Array(3).fill().map(() => Array(3).fill('Celda')),
      borderStyleId: 'simple',
      fillStyleId: 'light'
    },
    
    [EXTENDED_ELEMENT_TYPES.CHART]: {
      chartType: CHART_TYPES.BAR,
      width: 300,
      height: 200,
      data: [
        { name: 'A', value: 10 },
        { name: 'B', value: 20 },
        { name: 'C', value: 15 }
      ],
      title: 'Gráfico',
      showLegend: true,
      borderStyleId: 'simple',
      fillStyleId: 'light'
    }
  };