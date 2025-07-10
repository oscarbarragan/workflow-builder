// src/components/layoutDesigner/utils/units.config.js - MEJORADO
export const unitsConfig = {
  // Definición de unidades con factores de conversión a píxeles (96 DPI)
  units: [
    { 
      value: 'px', 
      label: 'px', 
      name: 'Píxeles',
      factor: 1,
      precision: 0,
      description: 'Unidad base para pantalla',
      category: 'digital'
    },
    { 
      value: 'mm', 
      label: 'mm', 
      name: 'Milímetros',
      factor: 3.779527559,
      precision: 2,
      description: 'Milímetros (sistema métrico)',
      category: 'metric'
    },
    { 
      value: 'cm', 
      label: 'cm', 
      name: 'Centímetros',
      factor: 37.79527559,
      precision: 2,
      description: 'Centímetros (sistema métrico)',
      category: 'metric'
    },
    { 
      value: 'in', 
      label: 'in', 
      name: 'Pulgadas',
      factor: 96,
      precision: 3,
      description: 'Pulgadas (sistema imperial)',
      category: 'imperial'
    },
    { 
      value: 'pt', 
      label: 'pt', 
      name: 'Puntos',
      factor: 1.333333333,
      precision: 1,
      description: 'Puntos tipográficos (1/72 pulgada)',
      category: 'typography'
    },
    { 
      value: 'pc', 
      label: 'pc', 
      name: 'Picas',
      factor: 16,
      precision: 1,
      description: 'Picas tipográficas (12 puntos)',
      category: 'typography'
    }
  ],

  // Tamaños de página estándar organizados por categoría
  pageSizes: {
    iso: [
      // Serie A (más comunes)
      { name: 'A0', width: 841, height: 1189, unit: 'mm', category: 'ISO A', description: 'Póster grande' },
      { name: 'A1', width: 594, height: 841, unit: 'mm', category: 'ISO A', description: 'Póster mediano' },
      { name: 'A2', width: 420, height: 594, unit: 'mm', category: 'ISO A', description: 'Póster pequeño' },
      { name: 'A3', width: 297, height: 420, unit: 'mm', category: 'ISO A', description: 'Documento grande' },
      { name: 'A4', width: 210, height: 297, unit: 'mm', category: 'ISO A', description: 'Documento estándar' },
      { name: 'A5', width: 148, height: 210, unit: 'mm', category: 'ISO A', description: 'Folleto pequeño' },
      { name: 'A6', width: 105, height: 148, unit: 'mm', category: 'ISO A', description: 'Postal' },
      
      // Serie B (menos comunes pero útiles)
      { name: 'B4', width: 250, height: 353, unit: 'mm', category: 'ISO B', description: 'Documento B4' },
      { name: 'B5', width: 176, height: 250, unit: 'mm', category: 'ISO B', description: 'Libro pequeño' },
      
      // Serie C (sobres)
      { name: 'C4', width: 229, height: 324, unit: 'mm', category: 'ISO C', description: 'Sobre C4' },
      { name: 'C5', width: 162, height: 229, unit: 'mm', category: 'ISO C', description: 'Sobre C5' },
      { name: 'C6', width: 114, height: 162, unit: 'mm', category: 'ISO C', description: 'Sobre C6' }
    ],
    
    northAmerica: [
      { name: 'Letter', width: 8.5, height: 11, unit: 'in', category: 'Norte América', description: 'Carta estándar US' },
      { name: 'Legal', width: 8.5, height: 14, unit: 'in', category: 'Norte América', description: 'Documento legal US' },
      { name: 'Tabloid', width: 11, height: 17, unit: 'in', category: 'Norte América', description: 'Tabloid/A3 US' },
      { name: 'Ledger', width: 17, height: 11, unit: 'in', category: 'Norte América', description: 'Ledger horizontal' },
      { name: 'Executive', width: 7.25, height: 10.5, unit: 'in', category: 'Norte América', description: 'Ejecutivo' },
      { name: 'Folio', width: 8.5, height: 13, unit: 'in', category: 'Norte América', description: 'Folio US' }
    ],
    
    custom: [
      // Formatos publicitarios
      { name: 'Tarjeta de Visita', width: 85, height: 55, unit: 'mm', category: 'Publicitario', description: 'Business card estándar' },
      { name: 'Tarjeta de Visita US', width: 3.5, height: 2, unit: 'in', category: 'Publicitario', description: 'Business card US' },
      { name: 'Postal', width: 148, height: 105, unit: 'mm', category: 'Publicitario', description: 'Postal estándar' },
      { name: 'Flyer A6', width: 105, height: 148, unit: 'mm', category: 'Publicitario', description: 'Flyer pequeño' },
      { name: 'Flyer A5', width: 148, height: 210, unit: 'mm', category: 'Publicitario', description: 'Flyer mediano' },
      { name: 'Flyer A4', width: 210, height: 297, unit: 'mm', category: 'Publicitario', description: 'Flyer grande' },
      
      // Formatos digitales comunes
      { name: 'Banner Web', width: 728, height: 90, unit: 'px', category: 'Digital', description: 'Banner web horizontal' },
      { name: 'Banner Móvil', width: 320, height: 50, unit: 'px', category: 'Digital', description: 'Banner móvil' },
      { name: 'Cuadrado Social', width: 1080, height: 1080, unit: 'px', category: 'Digital', description: 'Post Instagram cuadrado' },
      { name: 'Historia Instagram', width: 1080, height: 1920, unit: 'px', category: 'Digital', description: 'Instagram Stories' },
      { name: 'Cover Facebook', width: 1200, height: 630, unit: 'px', category: 'Digital', description: 'Portada Facebook' },
      
      // Formatos de libro
      { name: 'Libro Trade', width: 6, height: 9, unit: 'in', category: 'Editorial', description: 'Libro comercial' },
      { name: 'Libro Pocket', width: 4.25, height: 6.87, unit: 'in', category: 'Editorial', description: 'Libro de bolsillo' },
      { name: 'Revista', width: 8.5, height: 11, unit: 'in', category: 'Editorial', description: 'Revista estándar' }
    ]
  },

  // Configuraciones predefinidas para elementos
  elementPresets: {
    text: [
      { name: 'Título Principal', fontSize: 32, unit: 'pt', description: 'Título de portada' },
      { name: 'Título Sección', fontSize: 24, unit: 'pt', description: 'Título de sección' },
      { name: 'Subtítulo', fontSize: 18, unit: 'pt', description: 'Subtítulo' },
      { name: 'Cuerpo', fontSize: 12, unit: 'pt', description: 'Texto normal' },
      { name: 'Cuerpo Pequeño', fontSize: 10, unit: 'pt', description: 'Texto secundario' },
      { name: 'Pie de página', fontSize: 9, unit: 'pt', description: 'Pie de página' },
      { name: 'Nota', fontSize: 8, unit: 'pt', description: 'Notas y aclaraciones' }
    ],
    
    spacing: [
      { name: 'Mínimo', value: 2, unit: 'mm', description: 'Espaciado mínimo' },
      { name: 'Pequeño', value: 5, unit: 'mm', description: 'Espaciado pequeño' },
      { name: 'Normal', value: 10, unit: 'mm', description: 'Espaciado estándar' },
      { name: 'Grande', value: 20, unit: 'mm', description: 'Espaciado amplio' },
      { name: 'Extra Grande', value: 30, unit: 'mm', description: 'Espaciado muy amplio' }
    ],
    
    margins: [
      { name: 'Sin margen', top: 0, right: 0, bottom: 0, left: 0, unit: 'mm', description: 'Sin márgenes' },
      { name: 'Mínimo', top: 5, right: 5, bottom: 5, left: 5, unit: 'mm', description: 'Márgenes mínimos' },
      { name: 'Estándar', top: 10, right: 10, bottom: 10, left: 10, unit: 'mm', description: 'Márgenes estándar' },
      { name: 'Cómodo', top: 15, right: 15, bottom: 15, left: 15, unit: 'mm', description: 'Márgenes cómodos' },
      { name: 'Amplio', top: 20, right: 15, bottom: 20, left: 15, unit: 'mm', description: 'Márgenes amplios' },
      { name: 'Libro', top: 25, right: 20, bottom: 25, left: 30, unit: 'mm', description: 'Márgenes para libro' },
      { name: 'Revista', top: 12, right: 8, bottom: 15, left: 8, unit: 'mm', description: 'Márgenes para revista' }
    ],

    borders: [
      { name: 'Sin borde', width: 0, unit: 'px', description: 'Sin borde' },
      { name: 'Fino', width: 1, unit: 'px', description: 'Borde fino' },
      { name: 'Normal', width: 2, unit: 'px', description: 'Borde normal' },
      { name: 'Grueso', width: 4, unit: 'px', description: 'Borde grueso' },
      { name: 'Muy Grueso', width: 8, unit: 'px', description: 'Borde muy grueso' }
    ]
  },

  // DPI comunes para diferentes tipos de salida
  dpiPresets: [
    { name: 'Pantalla Básica', dpi: 72, description: 'Para visualización básica en pantalla', usage: 'web-preview' },
    { name: 'Web Estándar', dpi: 96, description: 'Estándar web moderno', usage: 'web' },
    { name: 'Retina/HiDPI', dpi: 144, description: 'Pantallas de alta densidad', usage: 'web-retina' },
    { name: 'Impresión Básica', dpi: 150, description: 'Impresión doméstica', usage: 'print-draft' },
    { name: 'Impresión Calidad', dpi: 300, description: 'Impresión profesional estándar', usage: 'print-standard' },
    { name: 'Alta Calidad', dpi: 600, description: 'Impresión de alta calidad', usage: 'print-high' },
    { name: 'Imprenta Profesional', dpi: 1200, description: 'Impresión comercial profesional', usage: 'print-commercial' }
  ],

  // Configuraciones recomendadas por contexto
  contextRecommendations: {
    'pdf-print': {
      unit: 'mm',
      dpi: 300,
      margins: 'Estándar',
      description: 'Optimizado para impresión en PDF'
    },
    'pdf-digital': {
      unit: 'px',
      dpi: 96,
      margins: 'Mínimo',
      description: 'Optimizado para visualización digital'
    },
    'web': {
      unit: 'px',
      dpi: 96,
      margins: 'Sin margen',
      description: 'Para uso en web'
    },
    'print-professional': {
      unit: 'mm',
      dpi: 300,
      margins: 'Amplio',
      description: 'Para impresión profesional'
    },
    'typography': {
      unit: 'pt',
      dpi: 300,
      margins: 'Libro',
      description: 'Para trabajos tipográficos'
    },
    'large-format': {
      unit: 'cm',
      dpi: 150,
      margins: 'Amplio',
      description: 'Para formato grande'
    }
  },

  // Utilidades mejoradas para conversión
  utils: {
    // Convertir de una unidad a otra
    convert: (value, fromUnit, toUnit, dpi = 96) => {
      if (!value || fromUnit === toUnit) return value;
      
      const units = unitsConfig.units;
      const fromConfig = units.find(u => u.value === fromUnit);
      const toConfig = units.find(u => u.value === toUnit);
      
      if (!fromConfig || !toConfig) {
        console.warn('Unidad no encontrada:', fromUnit, toUnit);
        return value;
      }
      
      // Ajustar factor por DPI si es necesario
      const dpiRatio = dpi / 96;
      const fromFactor = fromConfig.factor * (fromConfig.category === 'digital' ? dpiRatio : 1);
      const toFactor = toConfig.factor * (toConfig.category === 'digital' ? dpiRatio : 1);
      
      const pxValue = value * fromFactor;
      const result = pxValue / toFactor;
      
      return Number(result.toFixed(toConfig.precision));
    },

    // Formatear valor con unidad
    formatValue: (value, unit, precision = null) => {
      const unitConfig = unitsConfig.units.find(u => u.value === unit);
      const decimals = precision !== null ? precision : unitConfig?.precision || 2;
      
      if (value === null || value === undefined) return '';
      
      return `${Number(value).toFixed(decimals)} ${unit}`;
    },

    // Obtener factor de conversión
    getFactor: (unit, dpi = 96) => {
      const unitConfig = unitsConfig.units.find(u => u.value === unit);
      if (!unitConfig) return 1;
      
      const dpiRatio = dpi / 96;
      return unitConfig.factor * (unitConfig.category === 'digital' ? dpiRatio : 1);
    },

    // Obtener precisión para una unidad
    getPrecision: (unit) => {
      return unitsConfig.units.find(u => u.value === unit)?.precision || 2;
    },

    // Validar si una unidad es válida
    isValidUnit: (unit) => {
      return unitsConfig.units.some(u => u.value === unit);
    },

    // Obtener unidad recomendada según el contexto
    getRecommendedUnit: (context) => {
      const recommendation = unitsConfig.contextRecommendations[context];
      return recommendation?.unit || 'mm';
    },

    // Obtener configuración recomendada completa
    getRecommendedConfig: (context) => {
      return unitsConfig.contextRecommendations[context] || unitsConfig.defaults;
    },

    // Convertir tamaño de página a píxeles
    getPageSizeInPixels: (pageName, dpi = 96) => {
      const allSizes = [
        ...unitsConfig.pageSizes.iso,
        ...unitsConfig.pageSizes.northAmerica,
        ...unitsConfig.pageSizes.custom
      ];
      
      const pageSize = allSizes.find(size => size.name === pageName);
      if (!pageSize) return null;
      
      const widthPx = unitsConfig.utils.convert(pageSize.width, pageSize.unit, 'px', dpi);
      const heightPx = unitsConfig.utils.convert(pageSize.height, pageSize.unit, 'px', dpi);
      
      return {
        width: widthPx,
        height: heightPx,
        original: pageSize
      };
    },

    // Obtener dimensiones de área imprimible
    getPrintableArea: (pageSize, margins) => {
      const printableWidth = pageSize.width - margins.left - margins.right;
      const printableHeight = pageSize.height - margins.top - margins.bottom;
      
      return {
        width: Math.max(0, printableWidth),
        height: Math.max(0, printableHeight),
        unit: pageSize.unit
      };
    },

    // Snapear valor a una cuadrícula
    snapToGrid: (value, gridSize, unit = 'mm') => {
      const factor = unitsConfig.utils.getFactor(unit);
      const gridSizeInPx = gridSize * factor;
      const snappedPx = Math.round(value / gridSizeInPx) * gridSizeInPx;
      
      return unitsConfig.utils.convert(snappedPx, 'px', unit);
    },

    // Validar rango de valores para una unidad
    validateRange: (value, unit, min = null, max = null) => {
      const factor = unitsConfig.utils.getFactor(unit);
      const minPx = min !== null ? min * factor : null;
      const maxPx = max !== null ? max * factor : null;
      const valuePx = value * factor;
      
      return {
        isValid: (minPx === null || valuePx >= minPx) && (maxPx === null || valuePx <= maxPx),
        min: minPx !== null ? unitsConfig.utils.convert(minPx, 'px', unit) : null,
        max: maxPx !== null ? unitsConfig.utils.convert(maxPx, 'px', unit) : null
      };
    },

    // Calcular mejor unidad para un valor
    getBestUnit: (valueInPx, context = 'general') => {
      const contextConfig = unitsConfig.contextRecommendations[context];
      if (contextConfig) {
        return contextConfig.unit;
      }
      
      // Lógica automática
      if (valueInPx < 50) return 'px';
      if (valueInPx < 200) return 'mm';
      if (valueInPx < 1000) return 'cm';
      return 'in';
    },

    // Obtener texto de ayuda para una unidad
    getUnitHelp: (unit) => {
      const unitConfig = unitsConfig.units.find(u => u.value === unit);
      return unitConfig?.description || 'Unidad de medida';
    }
  },

  // Configuración por defecto
  defaults: {
    unit: 'mm',
    precision: 2,
    gridSize: 1,
    snapToGrid: true,
    pageSize: 'A4',
    dpi: 300,
    margins: { top: 10, right: 10, bottom: 10, left: 10, unit: 'mm' },
    context: 'pdf-print'
  },

  // Tooltips y ayuda expandida
  help: {
    units: {
      px: 'Píxeles - Unidad base para pantallas digitales. Ideal para web y visualización.',
      mm: 'Milímetros - Precisión métrica. Ideal para impresión y diseño profesional.',
      cm: 'Centímetros - Para medidas más grandes. Útil en formatos grandes.',
      in: 'Pulgadas - Sistema imperial. Común en Norte América y algunos estándares.',
      pt: 'Puntos - Unidad tipográfica estándar (1/72"). Ideal para texto.',
      pc: 'Picas - 12 puntos tipográficos. Usada en diseño editorial tradicional.'
    },
    
    conversions: [
      '1 pulgada = 25.4 mm = 72 pt = 96 px (96 DPI)',
      '1 cm = 10 mm ≈ 37.8 px (96 DPI)',
      '1 pt = 1/72" ≈ 1.33 px (96 DPI)',
      '1 pc = 12 pt = 1/6" ≈ 16 px (96 DPI)',
      'A4 = 210 × 297 mm = 8.27 × 11.69"'
    ],
    
    recommendations: {
      print: 'Para impresión use mm o cm para mayor precisión dimensional',
      web: 'Para web use px como unidad principal para mayor control',
      typography: 'Para texto use pt para consistencia tipográfica profesional',
      layout: 'Para layouts complejos, mantenga una unidad consistente en todo el proyecto',
      responsive: 'Para diseños responsivos, considere usar unidades relativas',
      margins: 'Los márgenes definen el área de seguridad. Use márgenes generosos para impresión',
      dpi: 'Use 300 DPI para impresión profesional, 96 DPI para pantalla',
      bleed: 'Para impresión profesional, añada 3-5mm de sangrado fuera de los márgenes'
    },

    bestPractices: [
      'Mantenga consistencia en las unidades de medida a lo largo del proyecto',
      'Use márgenes apropiados para el medio final (pantalla vs impresión)',
      'Considere el DPI target desde el inicio del diseño',
      'Para impresión, use siempre unidades físicas (mm, cm, in)',
      'Para web, use píxeles para control preciso',
      'Los puntos son ideales para especificar tamaños de fuente',
      'Verifique las dimensiones finales antes de la producción'
    ],

    troubleshooting: {
      'medidas-incorrectas': 'Verifique que el DPI sea correcto para su contexto',
      'texto-pequeno': 'Use puntos (pt) para especificar tamaños de fuente',
      'margenes-estrechos': 'Para impresión use al menos 10mm de margen',
      'resolucion-baja': 'Use 300 DPI para impresión, 96 DPI para pantalla'
    }
  },

  // Validaciones y límites
  validation: {
    minValues: {
      px: 1,
      mm: 0.1,
      cm: 0.01,
      in: 0.001,
      pt: 0.5,
      pc: 0.05
    },
    
    maxValues: {
      px: 10000,
      mm: 2000,
      cm: 200,
      in: 78,
      pt: 7200,
      pc: 600
    },

    recommendedRanges: {
      fontSize: { min: 8, max: 72, unit: 'pt' },
      lineHeight: { min: 1.0, max: 3.0, unit: '' },
      margins: { min: 0, max: 50, unit: 'mm' },
      pageWidth: { min: 50, max: 1000, unit: 'mm' },
      pageHeight: { min: 50, max: 1500, unit: 'mm' }
    }
  },

  // Templates de configuración rápida
  quickTemplates: {
    'document-a4': {
      name: 'Documento A4 Estándar',
      pageSize: 'A4',
      orientation: 'portrait',
      margins: { top: 20, right: 15, bottom: 20, left: 15, unit: 'mm' },
      unit: 'mm',
      dpi: 300,
      description: 'Configuración estándar para documentos A4'
    },
    
    'letter-us': {
      name: 'Carta US Estándar',
      pageSize: 'Letter',
      orientation: 'portrait',
      margins: { top: 1, right: 0.75, bottom: 1, left: 0.75, unit: 'in' },
      unit: 'in',
      dpi: 300,
      description: 'Configuración estándar para cartas US'
    },
    
    'business-card': {
      name: 'Tarjeta de Presentación',
      pageSize: 'Tarjeta de Visita',
      orientation: 'landscape',
      margins: { top: 2, right: 2, bottom: 2, left: 2, unit: 'mm' },
      unit: 'mm',
      dpi: 300,
      description: 'Tarjeta de presentación estándar'
    },
    
    'web-banner': {
      name: 'Banner Web',
      pageSize: 'Banner Web',
      orientation: 'landscape',
      margins: { top: 0, right: 0, bottom: 0, left: 0, unit: 'px' },
      unit: 'px',
      dpi: 96,
      description: 'Banner para web'
    },
    
    'flyer-a5': {
      name: 'Flyer A5',
      pageSize: 'A5',
      orientation: 'portrait',
      margins: { top: 10, right: 8, bottom: 10, left: 8, unit: 'mm' },
      unit: 'mm',
      dpi: 300,
      description: 'Flyer tamaño A5'
    },
    
    'poster-a3': {
      name: 'Póster A3',
      pageSize: 'A3',
      orientation: 'portrait',
      margins: { top: 15, right: 10, bottom: 15, left: 10, unit: 'mm' },
      unit: 'mm',
      dpi: 300,
      description: 'Póster tamaño A3'
    }
  }
};