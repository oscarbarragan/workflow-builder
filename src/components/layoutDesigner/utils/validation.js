// src/components/layoutDesigner/utils/validation.js
export const validation = {
    // Validar elemento completo
    validateElement: (element) => {
      const errors = [];
  
      if (!element.id) {
        errors.push('Element must have an ID');
      }
  
      if (!element.type) {
        errors.push('Element must have a type');
      }
  
      if (typeof element.x !== 'number' || typeof element.y !== 'number') {
        errors.push('Element must have valid x and y coordinates');
      }
  
      if (element.x < 0 || element.y < 0) {
        errors.push('Element coordinates must be non-negative');
      }
  
      // Validaciones específicas por tipo
      switch (element.type) {
        case 'text':
          errors.push(...validation.validateTextElement(element));
          break;
        case 'rectangle':
          errors.push(...validation.validateRectangleElement(element));
          break;
        case 'variable':
          errors.push(...validation.validateVariableElement(element));
          break;
      }
  
      return {
        isValid: errors.length === 0,
        errors
      };
    },
  
    // Validar elemento de texto
    validateTextElement: (element) => {
      const errors = [];
  
      if (element.width && (element.width < 50 || element.width > 1000)) {
        errors.push('Text width must be between 50 and 1000 pixels');
      }
  
      if (element.height && (element.height < 30 || element.height > 1000)) {
        errors.push('Text height must be between 30 and 1000 pixels');
      }
  
      if (element.textStyle) {
        errors.push(...validation.validateTextStyle(element.textStyle));
      }
  
      if (element.paragraphStyle) {
        errors.push(...validation.validateParagraphStyle(element.paragraphStyle));
      }
  
      return errors;
    },
  
    // Validar elemento rectángulo
    validateRectangleElement: (element) => {
      const errors = [];
  
      if (!element.width || element.width < 10 || element.width > 1000) {
        errors.push('Rectangle width must be between 10 and 1000 pixels');
      }
  
      if (!element.height || element.height < 10 || element.height > 1000) {
        errors.push('Rectangle height must be between 10 and 1000 pixels');
      }
  
      if (element.borderWidth && (element.borderWidth < 0 || element.borderWidth > 20)) {
        errors.push('Border width must be between 0 and 20 pixels');
      }
  
      if (element.borderRadius && (element.borderRadius < 0 || element.borderRadius > 50)) {
        errors.push('Border radius must be between 0 and 50 pixels');
      }
  
      if (element.fillColor && !validation.isValidColor(element.fillColor)) {
        errors.push('Invalid fill color format');
      }
  
      if (element.borderColor && !validation.isValidColor(element.borderColor)) {
        errors.push('Invalid border color format');
      }
  
      return errors;
    },
  
    // Validar elemento variable
    validateVariableElement: (element) => {
      const errors = [];
  
      if (!element.variable || element.variable.trim() === '') {
        errors.push('Variable element must have a variable name');
      }
  
      if (element.variable && !validation.isValidVariableName(element.variable)) {
        errors.push('Invalid variable name format');
      }
  
      if (element.fontSize && (element.fontSize < 8 || element.fontSize > 72)) {
        errors.push('Font size must be between 8 and 72 pixels');
      }
  
      return errors;
    },
  
    // Validar estilo de texto
    validateTextStyle: (textStyle) => {
      const errors = [];
  
      if (textStyle.fontSize && (textStyle.fontSize < 8 || textStyle.fontSize > 72)) {
        errors.push('Font size must be between 8 and 72 pixels');
      }
  
      if (textStyle.color && !validation.isValidColor(textStyle.color)) {
        errors.push('Invalid text color format');
      }
  
      if (textStyle.fontFamily && typeof textStyle.fontFamily !== 'string') {
        errors.push('Font family must be a string');
      }
  
      return errors;
    },
  
    // Validar estilo de párrafo
    validateParagraphStyle: (paragraphStyle) => {
      const errors = [];
  
      if (paragraphStyle.lineHeight && (paragraphStyle.lineHeight < 1.0 || paragraphStyle.lineHeight > 3.0)) {
        errors.push('Line height must be between 1.0 and 3.0');
      }
  
      if (paragraphStyle.letterSpacing && (paragraphStyle.letterSpacing < -2 || paragraphStyle.letterSpacing > 10)) {
        errors.push('Letter spacing must be between -2 and 10 pixels');
      }
  
      if (paragraphStyle.indent && (paragraphStyle.indent < 0 || paragraphStyle.indent > 100)) {
        errors.push('Text indent must be between 0 and 100 pixels');
      }
  
      if (paragraphStyle.alignment && !['left', 'center', 'right', 'justify'].includes(paragraphStyle.alignment)) {
        errors.push('Invalid text alignment value');
      }
  
      return errors;
    },
  
    // Validar nombre de variable
    isValidVariableName: (name) => {
      if (!name || typeof name !== 'string') return false;
      
      // Permitir letras, números, puntos, guiones bajos y corchetes
      const pattern = /^[a-zA-Z][a-zA-Z0-9_.[\]]*$/;
      return pattern.test(name);
    },
  
    // Validar formato de color
    isValidColor: (color) => {
      if (!color || typeof color !== 'string') return false;
      
      // Formatos válidos: hex, rgb, rgba, hsl, hsla, nombres de colores CSS
      const colorPatterns = [
        /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, // Hex
        /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/, // RGB
        /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([01]|0?\.\d+)\s*\)$/, // RGBA
        /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/, // HSL
        /^hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*([01]|0?\.\d+)\s*\)$/, // HSLA
        /^transparent$/, // Transparent
      ];
  
      return colorPatterns.some(pattern => pattern.test(color)) || 
             validation.isValidCSSColorName(color);
    },
  
    // Validar nombres de colores CSS
    isValidCSSColorName: (color) => {
      const cssColors = [
        'black', 'white', 'red', 'green', 'blue', 'yellow', 'cyan', 'magenta',
        'gray', 'grey', 'darkred', 'darkgreen', 'darkblue', 'orange', 'purple',
        'pink', 'brown', 'lime', 'navy', 'olive', 'teal', 'silver', 'maroon'
      ];
      
      return cssColors.includes(color.toLowerCase());
    },
  
    // Validar dimensiones
    validateDimensions: (width, height) => {
      const errors = [];
  
      if (width !== undefined && (typeof width !== 'number' || width < 0)) {
        errors.push('Width must be a non-negative number');
      }
  
      if (height !== undefined && (typeof height !== 'number' || height < 0)) {
        errors.push('Height must be a non-negative number');
      }
  
      return {
        isValid: errors.length === 0,
        errors
      };
    },
  
    // Validar posición
    validatePosition: (x, y) => {
      const errors = [];
  
      if (typeof x !== 'number' || x < 0) {
        errors.push('X coordinate must be a non-negative number');
      }
  
      if (typeof y !== 'number' || y < 0) {
        errors.push('Y coordinate must be a non-negative number');
      }
  
      return {
        isValid: errors.length === 0,
        errors
      };
    },
  
    // Validar array de elementos
    validateElements: (elements) => {
      if (!Array.isArray(elements)) {
        return {
          isValid: false,
          errors: ['Elements must be an array'],
          elementErrors: []
        };
      }
  
      const elementErrors = elements.map((element, index) => {
        const validation = validation.validateElement(element);
        return {
          index,
          elementId: element.id,
          ...validation
        };
      });
  
      const hasErrors = elementErrors.some(result => !result.isValid);
  
      return {
        isValid: !hasErrors,
        errors: hasErrors ? ['One or more elements have validation errors'] : [],
        elementErrors: elementErrors.filter(result => !result.isValid)
      };
    },
  
    // Validar datos de layout
    validateLayoutData: (layoutData) => {
      const errors = [];
  
      if (!layoutData || typeof layoutData !== 'object') {
        return {
          isValid: false,
          errors: ['Layout data must be an object']
        };
      }
  
      if (!layoutData.elements) {
        errors.push('Layout data must contain elements array');
      } else {
        const elementsValidation = validation.validateElements(layoutData.elements);
        if (!elementsValidation.isValid) {
          errors.push(...elementsValidation.errors);
        }
      }
  
      return {
        isValid: errors.length === 0,
        errors
      };
    },
  
    // Sanitizar entrada de usuario
    sanitizeInput: (input, type = 'string') => {
      if (input === null || input === undefined) {
        return type === 'number' ? 0 : '';
      }
  
      switch (type) {
        case 'number':
          const num = parseFloat(input);
          return isNaN(num) ? 0 : num;
        
        case 'integer':
          const int = parseInt(input);
          return isNaN(int) ? 0 : int;
        
        case 'string':
          return String(input).trim();
        
        case 'boolean':
          return Boolean(input);
        
        case 'color':
          const colorStr = String(input).trim();
          return validation.isValidColor(colorStr) ? colorStr : '#000000';
        
        default:
          return input;
      }
    },
  
    // Limpiar propiedades del elemento
    cleanElementProperties: (element) => {
      const cleaned = { ...element };
  
      // Sanitizar propiedades básicas
      cleaned.x = validation.sanitizeInput(cleaned.x, 'number');
      cleaned.y = validation.sanitizeInput(cleaned.y, 'number');
      cleaned.type = validation.sanitizeInput(cleaned.type, 'string');
  
      // Sanitizar según el tipo
      switch (cleaned.type) {
        case 'text':
          if (cleaned.width) cleaned.width = validation.sanitizeInput(cleaned.width, 'integer');
          if (cleaned.height) cleaned.height = validation.sanitizeInput(cleaned.height, 'integer');
          if (cleaned.text) cleaned.text = validation.sanitizeInput(cleaned.text, 'string');
          break;
        
        case 'rectangle':
          cleaned.width = validation.sanitizeInput(cleaned.width, 'integer');
          cleaned.height = validation.sanitizeInput(cleaned.height, 'integer');
          if (cleaned.fillColor) cleaned.fillColor = validation.sanitizeInput(cleaned.fillColor, 'color');
          if (cleaned.borderColor) cleaned.borderColor = validation.sanitizeInput(cleaned.borderColor, 'color');
          break;
        
        case 'variable':
          if (cleaned.variable) cleaned.variable = validation.sanitizeInput(cleaned.variable, 'string');
          if (cleaned.fontSize) cleaned.fontSize = validation.sanitizeInput(cleaned.fontSize, 'integer');
          break;
      }
  
      return cleaned;
    }
  };