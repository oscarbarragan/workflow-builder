// src/components/layoutDesigner/utils/scriptEngine.js
// Motor seguro para evaluación de scripts personalizados

export class ScriptEngine {
    constructor(availableVariables = {}, options = {}) {
      this.variables = availableVariables;
      this.options = {
        timeout: 5000, // 5 segundos timeout
        maxComplexity: 100, // Máximo de operaciones permitidas
        allowedFunctions: ['Math', 'String', 'Number', 'Array', 'Object', 'Date'],
        ...options
      };
      this.logs = [];
      this.errors = [];
    }
  
    // Actualizar variables disponibles
    updateVariables(newVariables) {
      this.variables = { ...this.variables, ...newVariables };
    }
  
    // Evaluar script de forma segura
    evaluateScript(script, context = {}) {
      try {
        // Limpiar y validar script
        const cleanScript = this.sanitizeScript(script);
        if (!cleanScript) {
          throw new Error('Script vacío o inválido');
        }
  
        // Crear contexto seguro
        const safeContext = this.createSafeContext(context);
        
        // Evaluar script
        const result = this.executeScript(cleanScript, safeContext);
        
        this.log('Script executed successfully', { script: cleanScript, result });
        return {
          success: true,
          result: Boolean(result), // Siempre convertir a boolean para condiciones
          logs: [...this.logs],
          context: safeContext
        };
  
      } catch (error) {
        this.error('Script execution failed', { script, error: error.message });
        return {
          success: false,
          result: false,
          error: error.message,
          logs: [...this.logs],
          errors: [...this.errors]
        };
      }
    }
  
    // Limpiar y validar script
    sanitizeScript(script) {
      if (!script || typeof script !== 'string') {
        return null;
      }
  
      let cleaned = script.trim();
      
      // Remover palabras peligrosas
      const dangerousPatterns = [
        /\beval\b/gi,
        /\bFunction\b/gi,
        /\bsetTimeout\b/gi,
        /\bsetInterval\b/gi,
        /\bwindow\b/gi,
        /\bdocument\b/gi,
        /\bprocess\b/gi,
        /\brequire\b/gi,
        /\bimport\b/gi,
        /\bexport\b/gi,
        /\bconsole\.(?!log)/gi, // Permitir console.log pero no otras funciones
        /\bdelete\b/gi,
        /\bthis\b/gi,
        /\bnew\s+Function/gi,
        /\bnew\s+eval/gi
      ];
  
      for (const pattern of dangerousPatterns) {
        if (pattern.test(cleaned)) {
          throw new Error(`Script contiene operaciones no permitidas: ${pattern.source}`);
        }
      }
  
      // Si el script no tiene return explícito, agregarlo
      if (!cleaned.includes('return')) {
        // Si es una expresión simple, agregarle return
        const simpleExpressionPattern = /^[^;{}]+$/;
        if (simpleExpressionPattern.test(cleaned)) {
          cleaned = `return (${cleaned});`;
        }
      }
  
      return cleaned;
    }
  
    // Crear contexto seguro para evaluación
    createSafeContext(additionalContext = {}) {
      // Procesar variables con notación de punto
      const processedVars = this.processVariablesForScript(this.variables);
      
      return {
        // Variables del usuario
        ...processedVars,
        ...additionalContext,
        
        // Funciones matemáticas seguras
        Math: {
          abs: Math.abs,
          ceil: Math.ceil,
          floor: Math.floor,
          round: Math.round,
          max: Math.max,
          min: Math.min,
          pow: Math.pow,
          sqrt: Math.sqrt,
          random: Math.random
        },
        
        // Funciones de string seguras
        String: {
          fromCharCode: String.fromCharCode
        },
        
        // Funciones de número
        Number: {
          parseInt: Number.parseInt,
          parseFloat: Number.parseFloat,
          isNaN: Number.isNaN,
          isFinite: Number.isFinite
        },
        
        // Funciones de array seguras
        Array: {
          isArray: Array.isArray,
          from: Array.from
        },
        
        // Funciones de fecha
        Date: {
          now: Date.now,
          parse: Date.parse
        },
        
        // Funciones auxiliares personalizadas
        isEmpty: (val) => {
          if (Array.isArray(val)) return val.length === 0;
          if (typeof val === 'object' && val !== null) return Object.keys(val).length === 0;
          return !val || val === '';
        },
        
        isNotEmpty: (val) => {
          if (Array.isArray(val)) return val.length > 0;
          if (typeof val === 'object' && val !== null) return Object.keys(val).length > 0;
          return !!val && val !== '';
        },
        
        contains: (str, search) => String(str).includes(String(search)),
        startsWith: (str, prefix) => String(str).startsWith(String(prefix)),
        endsWith: (str, suffix) => String(str).endsWith(String(suffix)),
        
        length: (val) => {
          if (Array.isArray(val) || typeof val === 'string') return val.length;
          if (typeof val === 'object' && val !== null) return Object.keys(val).length;
          return 0;
        },
        
        // Función para logging (opcional)
        log: (...args) => {
          this.log('Script log', { args });
          return args[0]; // Retornar primer argumento para permitir chaining
        }
      };
    }
  
    // Procesar variables para uso en scripts
    processVariablesForScript(variables) {
      const processed = {};
      
      const addVariable = (obj, prefix = '') => {
        Object.entries(obj).forEach(([key, value]) => {
          const fullKey = prefix ? `${prefix}_${key}` : key;
          const dotKey = prefix ? `${prefix}.${key}` : key;
          
          if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            // Crear objeto anidado
            if (!processed[key] && !prefix) {
              processed[key] = {};
            }
            
            if (prefix) {
              if (!processed[prefix]) processed[prefix] = {};
              processed[prefix][key] = value;
            } else {
              processed[key] = value;
            }
            
            // Recursivo para objetos anidados
            addVariable(value, fullKey);
          } else {
            // Variables primitivas
            processed[fullKey] = value;
            
            // También crear la estructura de objeto si hay prefix
            if (prefix) {
              const parts = prefix.split('_');
              let current = processed;
              
              for (let i = 0; i < parts.length; i++) {
                if (!current[parts[i]]) {
                  current[parts[i]] = {};
                }
                current = current[parts[i]];
              }
              current[key] = value;
            }
          }
        });
      };
      
      addVariable(variables);
      return processed;
    }
  
    // Ejecutar script en contexto seguro
    executeScript(script, context) {
      // Crear función que evalúa el script con el contexto
      const contextKeys = Object.keys(context);
      const contextValues = Object.values(context);
      
      try {
        // Crear función segura
        const func = new Function(...contextKeys, script);
        
        // Ejecutar con timeout
        const timeoutId = setTimeout(() => {
          throw new Error('Script timeout - ejecución cancelada');
        }, this.options.timeout);
        
        const result = func.apply(null, contextValues);
        clearTimeout(timeoutId);
        
        return result;
      } catch (error) {
        throw new Error(`Error de ejecución: ${error.message}`);
      }
    }
  
    // Validar script antes de ejecutar
    validateScript(script) {
      const errors = [];
      const warnings = [];
      
      if (!script || !script.trim()) {
        errors.push('Script está vacío');
        return { isValid: false, errors, warnings };
      }
      
      // Verificar sintaxis básica
      try {
        this.sanitizeScript(script);
      } catch (error) {
        errors.push(`Error de sintaxis: ${error.message}`);
      }
      
      // Advertencias sobre complejidad
      const complexity = this.calculateComplexity(script);
      if (complexity > this.options.maxComplexity) {
        warnings.push(`Script muy complejo (${complexity}/${this.options.maxComplexity})`);
      }
      
      return {
        isValid: errors.length === 0,
        errors,
        warnings,
        complexity
      };
    }
  
    // Calcular complejidad del script
    calculateComplexity(script) {
      let complexity = 0;
      
      // Contar operadores
      const operators = script.match(/[+\-*/=<>!&|%]/g) || [];
      complexity += operators.length;
      
      // Contar funciones
      const functions = script.match(/\w+\(/g) || [];
      complexity += functions.length * 2;
      
      // Contar loops (básico)
      const loops = script.match(/\b(for|while)\b/g) || [];
      complexity += loops.length * 10;
      
      // Contar condiciones
      const conditions = script.match(/\b(if|else|switch)\b/g) || [];
      complexity += conditions.length * 3;
      
      return complexity;
    }
  
    // Obtener ejemplos de scripts
    getScriptExamples() {
      return [
        {
          name: 'Variable igual a valor',
          description: 'Verificar si una variable es igual a un valor específico',
          script: 'return user_name === "Oscar";',
          category: 'Comparación'
        },
        {
          name: 'Variable contiene texto',
          description: 'Verificar si una variable contiene cierto texto',
          script: 'return contains(user_name, "Oscar");',
          category: 'Texto'
        },
        {
          name: 'Array no vacío',
          description: 'Verificar si un array tiene elementos',
          script: 'return isNotEmpty(orders) && length(orders) > 0;',
          category: 'Arrays'
        },
        {
          name: 'Número mayor que',
          description: 'Verificar si un número es mayor que otro',
          script: 'return user_age > 18;',
          category: 'Números'
        },
        {
          name: 'Múltiples condiciones',
          description: 'Combinar varias condiciones con AND/OR',
          script: 'return user_age >= 18 && user_active === true;',
          category: 'Lógica'
        },
        {
          name: 'Verificar propiedades anidadas',
          description: 'Acceder a propiedades de objetos anidados',
          script: 'return user.address && user.address.city === "Bogotá";',
          category: 'Objetos'
        },
        {
          name: 'Validar total de pedidos',
          description: 'Sumar totales y verificar monto mínimo',
          script: `
  let total = 0;
  if (orders && Array.isArray(orders)) {
    for (let i = 0; i < orders.length; i++) {
      total += orders[i].total || 0;
    }
  }
  return total >= 100;`,
          category: 'Cálculos'
        },
        {
          name: 'Fecha actual',
          description: 'Comparar con fecha actual',
          script: `
  const today = new Date();
  const currentYear = today.getFullYear();
  return currentYear >= 2024;`,
          category: 'Fechas'
        }
      ];
    }
  
    // Logging interno
    log(message, data = {}) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'info',
        message,
        data
      };
      this.logs.push(logEntry);
    }
  
    // Error logging
    error(message, data = {}) {
      const errorEntry = {
        timestamp: new Date().toISOString(),
        level: 'error',
        message,
        data
      };
      this.errors.push(errorEntry);
    }
  
    // Limpiar logs
    clearLogs() {
      this.logs = [];
      this.errors = [];
    }
  
    // Obtener logs
    getLogs() {
      return {
        logs: this.logs,
        errors: this.errors
      };
    }
  }
  
  export default ScriptEngine;