// src/components/layoutDesigner/utils/units.config.js

export const unitsConfig = {
    // Definición de unidades con factores de conversión a píxeles
    units: [
      { 
        value: 'px', 
        label: 'px', 
        name: 'Píxeles',
        factor: 1,
        precision: 0,
        description: 'Unidad base para pantalla'
      },
      { 
        value: 'mm', 
        label: 'mm', 
        name: 'Milímetros',
        factor: 3.779527559,
        precision: 2,
        description: 'Milímetros (sistema métrico)'
      },
      { 
        value: 'cm', 
        label: 'cm', 
        name: 'Centímetros',
        factor: 37.79527559,
        precision: 2,
        description: 'Centímetros (sistema métrico)'
      },
      { 
        value: 'in', 
        label: 'in', 
        name: 'Pulgadas',
        factor: 96,
        precision: 3,
        description: 'Pulgadas (sistema imperial)'
      },
      { 
        value: 'pt', 
        label: 'pt', 
        name: 'Puntos',
        factor: 1.333333333,
        precision: 1,
        description: 'Puntos tipográficos (1/72 pulgada)'
      },
      { 
        value: 'pc', 
        label: 'pc', 
        name: 'Picas',
        factor: 16,
        precision: 1,
        description: 'Picas tipográficas (12 puntos)'
      }
    ],
  
    // Tamaños de página estándar para PDF
    pageSizes: {
      iso: [
        { name: 'A0', width: 841, height: 1189, unit: 'mm', category: 'ISO A' },
        { name: 'A1', width: 594, height: 841, unit: 'mm', category: 'ISO A' },
        { name: 'A2', width: 420, height: 594, unit: 'mm', category: 'ISO A' },
        { name: 'A3', width: 297, height: 420, unit: 'mm', category: 'ISO A' },
        { name: 'A4', width: 210, height: 297, unit: 'mm', category: 'ISO A' },
        { name: 'A5', width: 148, height: 210, unit: 'mm', category: 'ISO A' },
        { name: 'A6', width: 105, height: 148, unit: 'mm', category: 'ISO A' },
        
        { name: 'B0', width: 1000, height: 1414, unit: 'mm', category: 'ISO B' },
        { name: 'B1', width: 707, height: 1000, unit: 'mm', category: 'ISO B' },
        { name: 'B2', width: 500, height: 707, unit: 'mm', category: 'ISO B' },
        { name: 'B3', width: 353, height: 500, unit: 'mm', category: 'ISO B' },
        { name: 'B4', width: 250, height: 353, unit: 'mm', category: 'ISO B' },
        { name: 'B5', width: 176, height: 250, unit: 'mm', category: 'ISO B' },
        
        { name: 'C4', width: 229, height: 324, unit: 'mm', category: 'ISO C (Sobres)' },
        { name: 'C5', width: 162, height: 229, unit: 'mm', category: 'ISO C (Sobres)' },
        { name: 'C6', width: 114, height: 162, unit: 'mm', category: 'ISO C (Sobres)' }
      ],
      
      north_american: [
        { name: 'Letter', width: 8.5, height: 11, unit: 'in', category: 'Norte América' },
        { name: 'Legal', width: 8.5, height: 14, unit: 'in', category: 'Norte América' },
        { name: 'Tabloid', width: 11, height: 17, unit: 'in', category: 'Norte América' },
        { name: 'Ledger', width: 17, height: 11, unit: 'in', category: 'Norte América' },
        { name: 'Executive', width: 7.25, height: 10.5, unit: 'in', category: 'Norte América' },
        { name: 'Folio', width: 8.5, height: 13, unit: 'in', category: 'Norte América' }
      ],
      
      custom: [
        { name: 'Tarjeta de Visita', width: 85, height: 55, unit: 'mm', category: 'Personalizado' },
        { name: 'Postal', width: 148, height: 105, unit: 'mm', category: 'Personalizado' },
        { name: 'Flyer A6', width: 105, height: 148, unit: 'mm', category: 'Personalizado' },
        { name: 'Flyer A5', width: 148, height: 210, unit: 'mm', category: 'Personalizado' },
        { name: 'Banner Web', width: 728, height: 90, unit: 'px', category: 'Personalizado' },
        { name: 'Póster A2', width: 420, height: 594, unit: 'mm', category: 'Personalizado' }
      ]
    },
  
    // Configuraciones predefinidas de elementos comunes
    elementPresets: {
      text: [
        { name: 'Título Principal', fontSize: 24, unit: 'pt' },
        { name: 'Subtítulo', fontSize: 18, unit: 'pt' },
        { name: 'Cuerpo', fontSize: 12, unit: 'pt' },
        { name: 'Pie de página', fontSize: 9, unit: 'pt' },
        { name: 'Nota', fontSize: 8, unit: 'pt' }
      ],
      
      spacing: [
        { name: 'Mínimo', value: 2, unit: 'mm' },
        { name: 'Pequeño', value: 5, unit: 'mm' },
        { name: 'Normal', value: 10, unit: 'mm' },
        { name: 'Grande', value: 20, unit: 'mm' },
        { name: 'Extra Grande', value: 30, unit: 'mm' }
      ],
      
      margins: [
        { name: 'Sin margen', top: 0, right: 0, bottom: 0, left: 0, unit: 'mm' },
        { name: 'Mínimo', top: 5, right: 5, bottom: 5, left: 5, unit: 'mm' },
        { name: 'Estándar', top: 10, right: 10, bottom: 10, left: 10, unit: 'mm' },
        { name: 'Amplio', top: 20, right: 15, bottom: 20, left: 15, unit: 'mm' },
        { name: 'Libro', top: 25, right: 20, bottom: 25, left: 30, unit: 'mm' }
      ]
    },
  
    // DPI comunes para diferentes tipos de salida
    dpiPresets: [
      { name: 'Pantalla', dpi: 72, description: 'Para visualización en pantalla' },
      { name: 'Web', dpi: 96, description: 'Estándar web moderno' },
      { name: 'Impresión Básica', dpi: 150, description: 'Impresión doméstica' },
      { name: 'Impresión Calidad', dpi: 300, description: 'Impresión profesional' },
      { name: 'Alta Calidad', dpi: 600, description: 'Impresión de alta calidad' },
      { name: 'Imprenta', dpi: 1200, description: 'Impresión comercial' }
    ],
  
    // Utilidades para conversión
    utils: {
      // Convertir de una unidad a otra
      convert: (value, fromUnit, toUnit, units) => {
        if (!value || fromUnit === toUnit) return value;
        
        const fromFactor = units.find(u => u.value === fromUnit)?.factor || 1;
        const toFactor = units.find(u => u.value === toUnit)?.factor || 1;
        const precision = units.find(u => u.value === toUnit)?.precision || 2;
        
        const pxValue = value * fromFactor;
        const result = pxValue / toFactor;
        
        return Number(result.toFixed(precision));
      },
  
      // Formatear valor con unidad
      formatValue: (value, unit, precision = null) => {
        const unitConfig = unitsConfig.units.find(u => u.value === unit);
        const decimals = precision !== null ? precision : unitConfig?.precision || 2;
        
        if (value === null || value === undefined) return '';
        
        return `${Number(value).toFixed(decimals)} ${unit}`;
      },
  
      // Obtener factor de conversión
      getFactor: (unit) => {
        return unitsConfig.units.find(u => u.value === unit)?.factor || 1;
      },
  
      // Obtener precisión para una unidad
      getPrecision: (unit) => {
        return unitsConfig.units.find(u => u.value === unit)?.precision || 2;
      },
  
      // Validar si una unidad es válida
      isValidUnit: (unit) => {
        return unitsConfig.units.some(u => u.value === unit);
      },
  
      // Obtener unidad recomendada según el tipo de medida
      getRecommendedUnit: (context) => {
        const recommendations = {
          'pdf-print': 'mm',
          'pdf-digital': 'px',
          'web': 'px',
          'print': 'mm',
          'typography': 'pt',
          'large-format': 'cm'
        };
        
        return recommendations[context] || 'mm';
      },
  
      // Convertir tamaño de página a píxeles
      getPageSizeInPixels: (pageName) => {
        const allSizes = [
          ...unitsConfig.pageSizes.iso,
          ...unitsConfig.pageSizes.north_american,
          ...unitsConfig.pageSizes.custom
        ];
        
        const pageSize = allSizes.find(size => size.name === pageName);
        if (!pageSize) return null;
        
        const factor = unitsConfig.utils.getFactor(pageSize.unit);
        
        return {
          width: pageSize.width * factor,
          height: pageSize.height * factor,
          original: pageSize
        };
      },
  
      // Snapear valor a una cuadrícula
      snapToGrid: (value, gridSize, unit = 'mm') => {
        const factor = unitsConfig.utils.getFactor(unit);
        const gridSizeInPx = gridSize * factor;
        const snappedPx = Math.round(value / gridSizeInPx) * gridSizeInPx;
        
        return unitsConfig.utils.convert(snappedPx, 'px', unit, unitsConfig.units);
      },
  
      // Validar rango de valores para una unidad
      validateRange: (value, unit, min = null, max = null) => {
        const minPx = min !== null ? min * unitsConfig.utils.getFactor(unit) : null;
        const maxPx = max !== null ? max * unitsConfig.utils.getFactor(unit) : null;
        const valuePx = value * unitsConfig.utils.getFactor(unit);
        
        return {
          isValid: (minPx === null || valuePx >= minPx) && (maxPx === null || valuePx <= maxPx),
          min: minPx !== null ? unitsConfig.utils.convert(minPx, 'px', unit, unitsConfig.units) : null,
          max: maxPx !== null ? unitsConfig.utils.convert(maxPx, 'px', unit, unitsConfig.units) : null
        };
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
      margins: { top: 10, right: 10, bottom: 10, left: 10 }
    },
  
    // Tooltips y ayuda
    help: {
      units: {
        px: 'Píxeles - Unidad base para pantallas digitales',
        mm: 'Milímetros - Ideal para impresión y diseño preciso',
        cm: 'Centímetros - Para medidas más grandes',
        in: 'Pulgadas - Sistema imperial, común en Norte América',
        pt: 'Puntos - Unidad tipográfica estándar (1/72")',
        pc: 'Picas - 12 puntos tipográficos'
      },
      
      conversions: [
        '1 pulgada = 25.4 mm = 72 pt = 96 px',
        '1 cm = 10 mm ≈ 37.8 px',
        '1 pt = 1/72" ≈ 1.33 px',
        '1 pc = 12 pt = 1/6" ≈ 16 px'
      ],
      
      recommendations: {
        print: 'Para impresión use mm o cm para mayor precisión',
        web: 'Para web use px como unidad principal',
        typography: 'Para texto use pt para consistencia tipográfica',
        layout: 'Para layouts complejos, mantenga una unidad consistente'
      }
    }
  };