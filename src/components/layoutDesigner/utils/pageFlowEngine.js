// src/components/layoutDesigner/utils/pageFlowEngine.js
// Motor de evaluación para el flujo avanzado de páginas

import {
    PAGE_FLOW_TYPES,
    CONDITION_TYPES,
    NEXT_PAGE_TYPES,
    DATA_SOURCE_TYPES,
    OPERATORS,
    EXPRESSION_FUNCTIONS,
    VALIDATION_RULES
  } from './pageFlow.constants.js';
  
  /**
   * Clase principal para evaluar el flujo de páginas
   */
  export class PageFlowEngine {
    constructor(availableVariables = {}, pages = [], options = {}) {
      this.variables = availableVariables;
      this.pages = pages;
      this.options = {
        debugMode: false,
        maxIterations: 1000,
        allowUnsafeExpressions: false,
        ...options
      };
      this.executionLog = [];
      this.errors = [];
    }
  
    /**
     * Actualizar variables disponibles
     */
    updateVariables(newVariables) {
      this.variables = { ...this.variables, ...newVariables };
      this.log('Variables updated', { count: Object.keys(this.variables).length });
    }
  
    /**
     * Actualizar páginas disponibles
     */
    updatePages(newPages) {
      this.pages = newPages;
      this.log('Pages updated', { count: this.pages.length });
    }
  
    /**
     * Evaluar flujo de una página específica
     */
    evaluatePageFlow(pageIndex, contextData = {}) {
      const page = this.pages[pageIndex];
      if (!page) {
        this.error(`Page not found at index ${pageIndex}`);
        return null;
      }
  
      const flowConfig = page.flowConfig || { type: PAGE_FLOW_TYPES.SIMPLE };
      const context = { ...this.variables, ...contextData };
  
      this.log(`Evaluating page flow for page ${pageIndex}`, { 
        type: flowConfig.type, 
        pageName: page.name 
      });
  
      switch (flowConfig.type) {
        case PAGE_FLOW_TYPES.SIMPLE:
          return this.evaluateSimplePage(flowConfig, context);
        
        case PAGE_FLOW_TYPES.CONDITIONAL:
          return this.evaluateConditionalPage(flowConfig, context);
        
        case PAGE_FLOW_TYPES.REPEATED:
          return this.evaluateRepeatedPage(flowConfig, context);
        
        default:
          this.error(`Unknown page flow type: ${flowConfig.type}`);
          return null;
      }
    }
  
    /**
     * Evaluar página simple
     */
    evaluateSimplePage(flowConfig, context) {
      const result = {
        type: PAGE_FLOW_TYPES.SIMPLE,
        shouldRender: true,
        targetPageIndex: flowConfig.simple?.targetPageIndex ?? null,
        targetPageId: flowConfig.simple?.targetPageId ?? null,
        context,
        iterations: 1
      };
  
      this.log('Simple page evaluated', result);
      return result;
    }
  
    /**
     * Evaluar página condicional
     */
    evaluateConditionalPage(flowConfig, context) {
      const conditions = flowConfig.conditional?.conditions || [];
      
      for (const condition of conditions) {
        if (this.evaluateCondition(condition, context)) {
          const result = {
            type: PAGE_FLOW_TYPES.CONDITIONAL,
            shouldRender: true,
            targetPageIndex: condition.targetPageIndex,
            targetPageId: condition.targetPageId,
            context,
            matchedCondition: condition,
            iterations: 1
          };
  
          this.log('Conditional page evaluated - condition matched', {
            conditionId: condition.id,
            result
          });
          return result;
        }
      }
  
      // Si ninguna condición se cumple, usar default
      const defaultTarget = flowConfig.conditional?.defaultTargetPageIndex ?? 
                           flowConfig.conditional?.defaultTargetPageId ?? null;
      
      const result = {
        type: PAGE_FLOW_TYPES.CONDITIONAL,
        shouldRender: !!defaultTarget,
        targetPageIndex: flowConfig.conditional?.defaultTargetPageIndex ?? null,
        targetPageId: flowConfig.conditional?.defaultTargetPageId ?? null,
        context,
        matchedCondition: null,
        iterations: defaultTarget ? 1 : 0
      };
  
      this.log('Conditional page evaluated - no conditions matched, using default', result);
      return result;
    }
  
    /**
     * Evaluar página repetida
     */
    evaluateRepeatedPage(flowConfig, context) {
      const repeatedConfig = flowConfig.repeated;
      if (!repeatedConfig) {
        this.error('Repeated page configuration not found');
        return null;
      }
  
      // Obtener datos para iteración
      const iterationData = this.getIterationData(repeatedConfig.dataSource, context);
      
      if (!Array.isArray(iterationData)) {
        this.error('Iteration data is not an array', { data: iterationData });
        return {
          type: PAGE_FLOW_TYPES.REPEATED,
          shouldRender: false,
          iterations: 0,
          context
        };
      }
  
      const maxIterations = Math.min(
        iterationData.length, 
        repeatedConfig.maxIterations || this.options.maxIterations
      );
  
      const result = {
        type: PAGE_FLOW_TYPES.REPEATED,
        shouldRender: iterationData.length > 0,
        targetPageIndex: repeatedConfig.templatePageIndex,
        targetPageId: repeatedConfig.templatePageId,
        context,
        iterations: maxIterations,
        iterationData: iterationData.slice(0, maxIterations),
        itemVariableName: repeatedConfig.itemVariableName || 'item',
        indexVariableName: repeatedConfig.indexVariableName || 'index'
      };
  
      this.log('Repeated page evaluated', {
        dataLength: iterationData.length,
        iterations: maxIterations,
        result
      });
  
      return result;
    }
  
    /**
     * Evaluar una condición específica
     */
    evaluateCondition(condition, context) {
      try {
        switch (condition.type || CONDITION_TYPES.VARIABLE) {
          case CONDITION_TYPES.VARIABLE:
            return this.evaluateVariableCondition(condition, context);
          
          case CONDITION_TYPES.SCRIPT:
            return this.evaluateScriptCondition(condition, context);
          
          case CONDITION_TYPES.EXISTS:
            return this.evaluateExistsCondition(condition, context);
          
          default:
            this.error(`Unknown condition type: ${condition.type}`);
            return false;
        }
      } catch (error) {
        this.error('Error evaluating condition', { condition, error: error.message });
        return false;
      }
    }
  
    /**
     * Evaluar condición basada en variable
     */
    evaluateVariableCondition(condition, context) {
      const variable = condition.variable;
      const operator = condition.operator;
      const expectedValue = condition.value;
      
      const actualValue = this.getVariableValue(variable, context);
      
      return this.compareValues(actualValue, operator, expectedValue);
    }
  
    /**
     * Evaluar condición basada en script/expresión
     */
    evaluateScriptCondition(condition, context) {
      if (!condition.script) {
        return false;
      }
  
      // Validar script por seguridad
      if (!this.validateScript(condition.script)) {
        this.error('Invalid or unsafe script', { script: condition.script });
        return false;
      }
  
      try {
        // Crear contexto seguro para evaluación
        const safeContext = this.createSafeContext(context);
        const result = this.evaluateExpression(condition.script, safeContext);
        
        this.log('Script condition evaluated', {
          script: condition.script,
          result,
          context: safeContext
        });
  
        return !!result;
      } catch (error) {
        this.error('Script evaluation failed', {
          script: condition.script,
          error: error.message
        });
        return false;
      }
    }
  
    /**
     * Evaluar condición de existencia
     */
    evaluateExistsCondition(condition, context) {
      const variable = condition.variable;
      const value = this.getVariableValue(variable, context);
      
      return value !== null && value !== undefined && value !== '';
    }
  
    /**
     * Comparar valores usando operador específico
     */
    compareValues(actual, operator, expected) {
      switch (operator) {
        case OPERATORS.EQUALS:
          return actual == expected;
        
        case OPERATORS.NOT_EQUALS:
          return actual != expected;
        
        case OPERATORS.GREATER_THAN:
          return Number(actual) > Number(expected);
        
        case OPERATORS.LESS_THAN:
          return Number(actual) < Number(expected);
        
        case OPERATORS.GREATER_EQUAL:
          return Number(actual) >= Number(expected);
        
        case OPERATORS.LESS_EQUAL:
          return Number(actual) <= Number(expected);
        
        case OPERATORS.CONTAINS:
          return String(actual).includes(String(expected));
        
        case OPERATORS.NOT_CONTAINS:
          return !String(actual).includes(String(expected));
        
        case OPERATORS.STARTS_WITH:
          return String(actual).startsWith(String(expected));
        
        case OPERATORS.ENDS_WITH:
          return String(actual).endsWith(String(expected));
        
        case OPERATORS.IS_EMPTY:
          return !actual || actual === '' || 
                 (Array.isArray(actual) && actual.length === 0) ||
                 (typeof actual === 'object' && Object.keys(actual).length === 0);
        
        case OPERATORS.IS_NOT_EMPTY:
          return !!actual && actual !== '' && 
                 (!Array.isArray(actual) || actual.length > 0) &&
                 (typeof actual !== 'object' || Object.keys(actual).length > 0);
        
        case OPERATORS.IN_ARRAY:
          return Array.isArray(expected) && expected.includes(actual);
        
        case OPERATORS.NOT_IN_ARRAY:
          return !Array.isArray(expected) || !expected.includes(actual);
        
        default:
          this.error(`Unknown operator: ${operator}`);
          return false;
      }
    }
  
    /**
     * Obtener valor de variable usando path con notación de punto
     */
    getVariableValue(variablePath, context) {
      if (!variablePath) return null;
      
      const parts = variablePath.split('.');
      let value = context;
      
      for (const part of parts) {
        if (value === null || value === undefined) {
          return null;
        }
        value = value[part];
      }
      
      return value;
    }
  
    /**
     * Obtener datos para iteración en páginas repetidas
     */
    getIterationData(dataSource, context) {
      switch (dataSource.type) {
        case DATA_SOURCE_TYPES.VARIABLE:
          const varData = this.getVariableValue(dataSource.variableName, context);
          return Array.isArray(varData) ? varData : [];
        
        case DATA_SOURCE_TYPES.ARRAY:
          const arrayData = this.getVariableValue(dataSource.arrayPath, context);
          return Array.isArray(arrayData) ? arrayData : [];
        
        case DATA_SOURCE_TYPES.OBJECT:
          const objectData = this.getVariableValue(dataSource.arrayPath, context);
          return objectData ? Object.values(objectData) : [];
        
        default:
          this.error(`Unknown data source type: ${dataSource.type}`);
          return [];
      }
    }
  
    /**
     * Evaluar próxima página basada en configuración
     */
    evaluateNextPage(pageIndex, contextData = {}) {
      const page = this.pages[pageIndex];
      if (!page?.flowConfig?.nextPage) {
        return { type: NEXT_PAGE_TYPES.AUTO, targetPageIndex: pageIndex + 1 };
      }
  
      const nextPageConfig = page.flowConfig.nextPage;
      const context = { ...this.variables, ...contextData };
  
      switch (nextPageConfig.type) {
        case NEXT_PAGE_TYPES.SIMPLE:
          return {
            type: NEXT_PAGE_TYPES.SIMPLE,
            targetPageIndex: nextPageConfig.targetPageIndex,
            targetPageId: nextPageConfig.targetPageId
          };
        
        case NEXT_PAGE_TYPES.CONDITIONAL:
          const conditions = nextPageConfig.conditions || [];
          for (const condition of conditions) {
            if (this.evaluateCondition(condition, context)) {
              return {
                type: NEXT_PAGE_TYPES.CONDITIONAL,
                targetPageIndex: condition.targetPageIndex,
                targetPageId: condition.targetPageId,
                matchedCondition: condition
              };
            }
          }
          return { type: NEXT_PAGE_TYPES.AUTO, targetPageIndex: pageIndex + 1 };
        
        case NEXT_PAGE_TYPES.NONE:
          return { type: NEXT_PAGE_TYPES.NONE, targetPageIndex: null };
        
        case NEXT_PAGE_TYPES.AUTO:
        default:
          return { type: NEXT_PAGE_TYPES.AUTO, targetPageIndex: pageIndex + 1 };
      }
    }
  
    /**
     * Validar script por seguridad
     */
    validateScript(script) {
      if (!this.options.allowUnsafeExpressions) {
        // Verificar palabras reservadas peligrosas
        for (const word of VALIDATION_RULES.reservedWords) {
          if (script.includes(word)) {
            return false;
          }
        }
      }
      
      return true;
    }
  
    /**
     * Crear contexto seguro para evaluación
     */
    createSafeContext(context) {
      return {
        ...context,
        ...EXPRESSION_FUNCTIONS,
        Math,
        String,
        Number,
        Array,
        Object,
        Date
      };
    }
  
    /**
     * Evaluar expresión de forma segura
     */
    evaluateExpression(expression, context) {
      // Implementación básica - en producción usar librerías como expr-eval
      // Para propósitos de demo, evaluación simple
      try {
        // Reemplazar variables en la expresión
        let processedExpression = expression;
        
        // Buscar patrones de variables {variable}
        processedExpression = processedExpression.replace(/\{([^}]+)\}/g, (match, varName) => {
          const value = this.getVariableValue(varName, context);
          return JSON.stringify(value);
        });
        
        // Reemplazar funciones conocidas
        for (const [funcName, funcImpl] of Object.entries(EXPRESSION_FUNCTIONS)) {
          const pattern = new RegExp(`\\b${funcName}\\(([^)]+)\\)`, 'g');
          processedExpression = processedExpression.replace(pattern, (match, args) => {
            try {
              const argValues = args.split(',').map(arg => {
                const trimmed = arg.trim();
                const value = this.getVariableValue(trimmed, context);
                return value !== undefined ? value : trimmed;
              });
              return JSON.stringify(funcImpl(...argValues));
            } catch (e) {
              return 'false';
            }
          });
        }
        
        // Evaluación simple (solo para demo - usar librerías seguras en producción)
        return eval(processedExpression);
      } catch (error) {
        this.error('Expression evaluation failed', { expression, error: error.message });
        return false;
      }
    }
  
    /**
     * Generar secuencia completa de páginas para renderizado
     */
    generatePageSequence(startPageIndex = 0, contextData = {}) {
      const sequence = [];
      const visited = new Set();
      let currentPageIndex = startPageIndex;
      let iterations = 0;
      const maxIterations = this.options.maxIterations;
  
      while (currentPageIndex !== null && 
             currentPageIndex < this.pages.length && 
             iterations < maxIterations) {
        
        if (visited.has(currentPageIndex)) {
          this.error('Circular reference detected in page flow', { 
            pageIndex: currentPageIndex 
          });
          break;
        }
  
        visited.add(currentPageIndex);
        iterations++;
  
        const pageFlow = this.evaluatePageFlow(currentPageIndex, contextData);
        
        if (pageFlow && pageFlow.shouldRender) {
          if (pageFlow.type === PAGE_FLOW_TYPES.REPEATED) {
            // Para páginas repetidas, agregar múltiples entradas
            for (let i = 0; i < pageFlow.iterations; i++) {
              const itemContext = {
                ...contextData,
                [pageFlow.itemVariableName]: pageFlow.iterationData[i],
                [pageFlow.indexVariableName]: i
              };
              
              sequence.push({
                pageIndex: currentPageIndex,
                context: itemContext,
                flowResult: pageFlow,
                iterationIndex: i
              });
            }
          } else {
            sequence.push({
              pageIndex: currentPageIndex,
              context: contextData,
              flowResult: pageFlow,
              iterationIndex: 0
            });
          }
        }
  
        // Determinar próxima página
        const nextPage = this.evaluateNextPage(currentPageIndex, contextData);
        currentPageIndex = nextPage.targetPageIndex;
      }
  
      this.log('Page sequence generated', {
        totalPages: sequence.length,
        iterations,
        startPageIndex
      });
  
      return sequence;
    }
  
    /**
     * Logging interno
     */
    log(message, data = {}) {
      if (this.options.debugMode) {
        const logEntry = {
          timestamp: new Date().toISOString(),
          level: 'info',
          message,
          data
        };
        this.executionLog.push(logEntry);
        console.log(`[PageFlowEngine] ${message}`, data);
      }
    }
  
    /**
     * Error logging
     */
    error(message, data = {}) {
      const errorEntry = {
        timestamp: new Date().toISOString(),
        level: 'error',
        message,
        data
      };
      this.errors.push(errorEntry);
      
      if (this.options.debugMode) {
        console.error(`[PageFlowEngine] ${message}`, data);
      }
    }
  
    /**
     * Obtener logs de ejecución
     */
    getExecutionLog() {
      return this.executionLog;
    }
  
    /**
     * Obtener errores
     */
    getErrors() {
      return this.errors;
    }
  
    /**
     * Limpiar logs
     */
    clearLogs() {
      this.executionLog = [];
      this.errors = [];
    }
  }
  
  export default PageFlowEngine;