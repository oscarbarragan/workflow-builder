// src/components/layoutDesigner/hooks/usePageManager.js - VERSIÓN COMPLETA CORREGIDA
import { useState, useCallback, useRef, useMemo } from 'react';
import { PageFlowEngine } from '../utils/pageFlowEngine.js';
import { 
  PAGE_FLOW_TYPES, 
  DEFAULT_PAGE_FLOW_CONFIG,
  NEXT_PAGE_TYPES 
} from '../utils/pageFlow.constants.js';

export const usePageManager = (initialPages = null, initialAvailableVariables = {}) => {
  // ✅ Refs inicializados ANTES de uso
  const nextPageIdRef = useRef(1);
  const maxHistorySize = 50;

  // ✅ Función para crear página por defecto - MÁRGENES CERO + FLOW CONFIG
  const createDefaultPage = useCallback(() => {
    return {
      id: `page_${Date.now()}_${nextPageIdRef.current++}`,
      name: 'Página 1',
      size: {
        width: 210,  // A4 en mm
        height: 297,
        unit: 'mm',
        preset: 'A4'
      },
      orientation: 'portrait',
      margins: {
        top: 0,      
        right: 0,    
        bottom: 0,   
        left: 0,     
        unit: 'mm'
      },
      background: {
        color: '#ffffff',
        image: null,
        opacity: 1
      },
      elements: [],
      
      // ✅ NUEVA: Configuración de flujo de página
      flowConfig: {
        ...DEFAULT_PAGE_FLOW_CONFIG,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }, []);

  // ✅ Estados principales
  const [pages, setPages] = useState(() => {
    if (initialPages && Array.isArray(initialPages) && initialPages.length > 0) {
      // Asegurar que todas las páginas tengan flowConfig
      return initialPages.map(page => ({
        ...page,
        flowConfig: page.flowConfig || {
          ...DEFAULT_PAGE_FLOW_CONFIG,
          createdAt: page.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }));
    }
    return [createDefaultPage()];
  });
  
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pageHistory, setPageHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // ✅ NUEVO: Estados para flujo de páginas CON VARIABLES INICIALES
  const [availableVariablesState, setAvailableVariablesState] = useState(() => {
    // Si no se proporcionan variables, usar datos de ejemplo
    if (!initialAvailableVariables || Object.keys(initialAvailableVariables).length === 0) {
      return {
        user_name: "Juan Pérez",
        user_age: 30,
        user: {
          id: 123,
          email: "juan@email.com", 
          active: true
        },
        orders: [
          { id: 1, product: "Producto A", total: 100.50 },
          { id: 2, product: "Producto B", total: 250.75 }
        ],
        company: {
          name: "Mi Empresa",
          employees: [
            { name: "Ana García", position: "Gerente" },
            { name: "Carlos López", position: "Desarrollador" }
          ],
          address: {
            city: "Bogotá"
          }
        },
        invoice: {
          number: "FAC-001",
          date: "2024-01-15",
          lines: [
            { description: "Servicio A", quantity: 2, price: 50.00 },
            { description: "Servicio B", quantity: 1, price: 150.75 }
          ]
        }
      };
    }
    return initialAvailableVariables;
  });

  const [flowEngineOptions, setFlowEngineOptions] = useState({
    debugMode: false,
    maxIterations: 1000,
    allowUnsafeExpressions: false
  });

  // ✅ NUEVO: Motor de flujo de páginas (memoizado)
  const pageFlowEngine = useMemo(() => {
    return new PageFlowEngine(availableVariablesState, pages, flowEngineOptions);
  }, [availableVariablesState, pages, flowEngineOptions]);

  // ✅ Generar ID único para páginas
  const generatePageId = useCallback(() => {
    return `page_${Date.now()}_${nextPageIdRef.current++}`;
  }, []);

  // ✅ Guardar estado en historial
  const saveToHistory = useCallback((pagesState) => {
    setPageHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(pagesState)));
      
      if (newHistory.length > maxHistorySize) {
        newHistory.shift();
      } else {
        setHistoryIndex(prev => prev + 1);
      }
      
      return newHistory;
    });
  }, [historyIndex]);

  // ✅ Obtener página actual
  const getCurrentPage = useCallback(() => {
    return pages[currentPageIndex] || null;
  }, [pages, currentPageIndex]);

  // ✅ NUEVO: Actualizar variables disponibles
  const updateAvailableVariables = useCallback((newVariables) => {
    console.log('🔄 Updating available variables:', newVariables);
    setAvailableVariablesState(prev => ({
      ...prev,
      ...newVariables
    }));
  }, []);

  // ✅ NUEVO: Configurar opciones del motor de flujo
  const setFlowEngineConfig = useCallback((options) => {
    setFlowEngineOptions(prev => ({
      ...prev,
      ...options
    }));
  }, []);

  // ✅ Agregar nueva página - CON CONFIGURACIÓN DE FLUJO
  const addPage = useCallback((position = null, pageConfig = {}) => {
    console.log('➕ Adding new page with flow config');
    
    const newPage = {
      ...createDefaultPage(),
      id: generatePageId(),
      name: pageConfig.name || `Página ${pages.length + 1}`,
      ...pageConfig,
      margins: pageConfig.margins || {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        unit: pageConfig.size?.unit || 'mm'
      },
      // ✅ NUEVO: Configuración de flujo
      flowConfig: {
        ...DEFAULT_PAGE_FLOW_CONFIG,
        ...pageConfig.flowConfig,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setPages(prev => {
      let newPages;
      
      if (position === null || position >= prev.length) {
        newPages = [...prev, newPage];
        setCurrentPageIndex(newPages.length - 1);
      } else {
        newPages = [
          ...prev.slice(0, position),
          newPage,
          ...prev.slice(position)
        ];
        setCurrentPageIndex(position);
      }
      
      saveToHistory(newPages);
      return newPages;
    });

    console.log('✅ Page added with flow config:', newPage.id);
    return newPage;
  }, [pages, generatePageId, saveToHistory, createDefaultPage]);

  // ✅ Duplicar página (manteniendo configuración de flujo)
  const duplicatePage = useCallback((pageIndex = currentPageIndex) => {
    const pageToClone = pages[pageIndex];
    if (!pageToClone) return null;

    console.log('📋 Duplicating page with flow config:', pageToClone.id);

    const duplicatedPage = {
      ...pageToClone,
      id: generatePageId(),
      name: `${pageToClone.name} (Copia)`,
      elements: pageToClone.elements.map(element => ({
        ...element,
        id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      })),
      // ✅ Duplicar configuración de flujo
      flowConfig: {
        ...pageToClone.flowConfig,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setPages(prev => {
      const newPages = [
        ...prev.slice(0, pageIndex + 1),
        duplicatedPage,
        ...prev.slice(pageIndex + 1)
      ];
      
      setCurrentPageIndex(pageIndex + 1);
      saveToHistory(newPages);
      return newPages;
    });

    return duplicatedPage;
  }, [pages, currentPageIndex, generatePageId, saveToHistory]);

  // ✅ Eliminar página
  const deletePage = useCallback((pageIndex = currentPageIndex) => {
    if (pages.length <= 1) {
      console.warn('⚠️ Cannot delete the last page');
      return false;
    }

    console.log('🗑️ Deleting page at index:', pageIndex);

    setPages(prev => {
      const newPages = prev.filter((_, index) => index !== pageIndex);
      
      let newCurrentIndex = currentPageIndex;
      if (pageIndex <= currentPageIndex) {
        newCurrentIndex = Math.max(0, currentPageIndex - 1);
      }
      if (newCurrentIndex >= newPages.length) {
        newCurrentIndex = newPages.length - 1;
      }
      
      setCurrentPageIndex(newCurrentIndex);
      saveToHistory(newPages);
      return newPages;
    });

    return true;
  }, [pages, currentPageIndex, saveToHistory]);

  // ✅ Cambiar a página específica
  const goToPage = useCallback((pageIndex) => {
    if (pageIndex >= 0 && pageIndex < pages.length && pageIndex !== currentPageIndex) {
      console.log('📄 Switching to page:', pageIndex);
      setCurrentPageIndex(pageIndex);
    }
  }, [pages.length, currentPageIndex]);

  // ✅ Actualizar configuración de página
  const updatePageConfig = useCallback((pageIndex = currentPageIndex, updates) => {
    console.log('📝 Updating page config:', pageIndex, updates);

    setPages(prev => {
      const newPages = prev.map((page, index) => 
        index === pageIndex 
          ? { 
              ...page, 
              ...updates, 
              updatedAt: new Date().toISOString() 
            }
          : page
      );
      
      saveToHistory(newPages);
      return newPages;
    });
  }, [currentPageIndex, saveToHistory]);

  // ✅ NUEVO: Actualizar configuración de flujo de página específica
  const updatePageFlowConfig = useCallback((pageIndex = currentPageIndex, flowUpdates) => {
    console.log('🔄 Updating page flow config:', pageIndex, flowUpdates);

    setPages(prev => {
      const newPages = prev.map((page, index) => 
        index === pageIndex 
          ? { 
              ...page, 
              flowConfig: {
                ...page.flowConfig,
                ...flowUpdates,
                updatedAt: new Date().toISOString()
              },
              updatedAt: new Date().toISOString() 
            }
          : page
      );
      
      saveToHistory(newPages);
      return newPages;
    });
  }, [currentPageIndex, saveToHistory]);

  // ✅ Actualizar elementos de página
  const updatePageElements = useCallback((pageIndex = currentPageIndex, elements) => {
    setPages(prev => {
      const newPages = prev.map((page, index) => 
        index === pageIndex 
          ? { 
              ...page, 
              elements: elements,
              updatedAt: new Date().toISOString() 
            }
          : page
      );
      
      saveToHistory(newPages);
      return newPages;
    });
  }, [currentPageIndex, saveToHistory]);

  // ✅ Reordenar páginas
  const reorderPages = useCallback((fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;

    console.log('🔄 Reordering pages:', fromIndex, '→', toIndex);

    setPages(prev => {
      const newPages = [...prev];
      const [movedPage] = newPages.splice(fromIndex, 1);
      newPages.splice(toIndex, 0, movedPage);
      
      let newCurrentIndex = currentPageIndex;
      if (fromIndex === currentPageIndex) {
        newCurrentIndex = toIndex;
      } else if (fromIndex < currentPageIndex && toIndex >= currentPageIndex) {
        newCurrentIndex = currentPageIndex - 1;
      } else if (fromIndex > currentPageIndex && toIndex <= currentPageIndex) {
        newCurrentIndex = currentPageIndex + 1;
      }
      
      setCurrentPageIndex(newCurrentIndex);
      saveToHistory(newPages);
      return newPages;
    });
  }, [currentPageIndex, saveToHistory]);

  // ✅ Obtener dimensiones de página en píxeles
  const getPageDimensionsInPixels = useCallback((pageIndex = currentPageIndex) => {
    const page = pages[pageIndex];
    if (!page) return { width: 794, height: 1123 };

    const { width, height, unit } = page.size;
    
    const conversionFactors = {
      'mm': 3.779527559,
      'cm': 37.79527559,
      'in': 96,
      'pt': 1.333333333,
      'px': 1
    };

    const factor = conversionFactors[unit] || conversionFactors.mm;
    
    return {
      width: Math.round(width * factor),
      height: Math.round(height * factor)
    };
  }, [pages, currentPageIndex]);

  // ✅ Presets de tamaños de página
  const getPageSizePresets = useCallback(() => {
    return {
      iso: [
        { name: 'A3', width: 297, height: 420, unit: 'mm' },
        { name: 'A4', width: 210, height: 297, unit: 'mm' },
        { name: 'A5', width: 148, height: 210, unit: 'mm' },
        { name: 'B4', width: 250, height: 353, unit: 'mm' },
        { name: 'B5', width: 176, height: 250, unit: 'mm' }
      ],
      northAmerica: [
        { name: 'Letter', width: 8.5, height: 11, unit: 'in' },
        { name: 'Legal', width: 8.5, height: 14, unit: 'in' },
        { name: 'Tabloid', width: 11, height: 17, unit: 'in' }
      ],
      custom: [
        { name: 'Carta', width: 216, height: 279, unit: 'mm' },
        { name: 'Oficio', width: 216, height: 330, unit: 'mm' },
        { name: 'Media Carta', width: 140, height: 216, unit: 'mm' },
        { name: 'Personalizado', width: 210, height: 297, unit: 'mm' }
      ]
    };
  }, []);

  // ✅ Aplicar preset de tamaño
  const applyPageSizePreset = useCallback((presetName, pageIndex = currentPageIndex) => {
    const allPresets = getPageSizePresets();
    const preset = [
      ...allPresets.iso,
      ...allPresets.northAmerica,
      ...allPresets.custom
    ].find(p => p.name === presetName);

    if (preset) {
      updatePageConfig(pageIndex, {
        size: {
          ...preset,
          preset: presetName
        }
      });
      console.log('✅ Applied preset:', presetName, 'to page:', pageIndex);
    } else {
      console.warn('⚠️ Preset not found:', presetName);
    }
  }, [currentPageIndex, getPageSizePresets, updatePageConfig]);

  // ✅ Alternar orientación
  const togglePageOrientation = useCallback((pageIndex = currentPageIndex) => {
    const page = pages[pageIndex];
    if (!page) return;

    const newOrientation = page.orientation === 'portrait' ? 'landscape' : 'portrait';
    const { width, height } = page.size;
    
    updatePageConfig(pageIndex, {
      orientation: newOrientation,
      size: {
        ...page.size,
        width: height,
        height: width
      }
    });
    
    console.log('🔄 Toggled orientation for page:', pageIndex, 'to:', newOrientation);
  }, [pages, currentPageIndex, updatePageConfig]);

  // ✅ NUEVO: Evaluar flujo de página específica
  const evaluatePageFlow = useCallback((pageIndex, contextData = {}) => {
    try {
      return pageFlowEngine.evaluatePageFlow(pageIndex, contextData);
    } catch (error) {
      console.error('Error evaluating page flow:', error);
      return null;
    }
  }, [pageFlowEngine]);

  // ✅ NUEVO: Evaluar próxima página
  const evaluateNextPage = useCallback((pageIndex, contextData = {}) => {
    try {
      return pageFlowEngine.evaluateNextPage(pageIndex, contextData);
    } catch (error) {
      console.error('Error evaluating next page:', error);
      return { type: NEXT_PAGE_TYPES.AUTO, targetPageIndex: pageIndex + 1 };
    }
  }, [pageFlowEngine]);

  // ✅ NUEVO: Generar secuencia completa de páginas
  const generatePageSequence = useCallback((startPageIndex = 0, contextData = {}) => {
    try {
      return pageFlowEngine.generatePageSequence(startPageIndex, contextData);
    } catch (error) {
      console.error('Error generating page sequence:', error);
      return [];
    }
  }, [pageFlowEngine]);

  // ✅ NUEVO: Obtener páginas que referencian a una página específica
  const getPageReferences = useCallback((targetPageIndex) => {
    const references = [];
    
    pages.forEach((page, index) => {
      if (!page.flowConfig) return;
      
      // Verificar referencias en configuración simple
      if (page.flowConfig.simple?.targetPageIndex === targetPageIndex) {
        references.push({
          pageIndex: index,
          type: 'simple',
          pageName: page.name
        });
      }
      
      // Verificar referencias en condiciones
      if (page.flowConfig.conditional?.conditions) {
        page.flowConfig.conditional.conditions.forEach((condition, condIndex) => {
          if (condition.targetPageIndex === targetPageIndex) {
            references.push({
              pageIndex: index,
              type: 'conditional',
              conditionIndex: condIndex,
              pageName: page.name,
              conditionDescription: condition.description
            });
          }
        });
      }
      
      // Verificar referencias en páginas repetidas
      if (page.flowConfig.repeated?.templatePageIndex === targetPageIndex) {
        references.push({
          pageIndex: index,
          type: 'repeated',
          pageName: page.name
        });
      }
      
      // Verificar referencias en nextPage
      if (page.flowConfig.nextPage?.targetPageIndex === targetPageIndex) {
        references.push({
          pageIndex: index,
          type: 'nextPage',
          pageName: page.name
        });
      }
    });
    
    return references;
  }, [pages]);

  // ✅ NUEVO: Validar configuración de flujo
  const validatePageFlowConfig = useCallback((pageIndex = currentPageIndex) => {
    const page = pages[pageIndex];
    if (!page?.flowConfig) {
      return { isValid: false, errors: ['No flow configuration found'] };
    }
    
    const errors = [];
    const warnings = [];
    const config = page.flowConfig;
    
    // Validar configuración según tipo
    switch (config.type) {
      case PAGE_FLOW_TYPES.SIMPLE:
        if (config.simple?.targetPageIndex >= pages.length) {
          errors.push('Target page index is out of bounds');
        }
        break;
        
      case PAGE_FLOW_TYPES.CONDITIONAL:
        if (!config.conditional?.conditions?.length) {
          warnings.push('No conditions defined for conditional page');
        }
        config.conditional?.conditions?.forEach((condition, index) => {
          if (!condition.variable && !condition.script) {
            errors.push(`Condition ${index + 1}: No variable or script defined`);
          }
          if (condition.targetPageIndex >= pages.length) {
            errors.push(`Condition ${index + 1}: Target page index is out of bounds`);
          }
        });
        break;
        
      case PAGE_FLOW_TYPES.REPEATED:
        if (!config.repeated?.dataSource?.variableName) {
          errors.push('No data source variable defined for repeated page');
        }
        if (config.repeated?.templatePageIndex >= pages.length) {
          errors.push('Template page index is out of bounds');
        }
        break;
    }
    
    // Validar nextPage
    if (config.nextPage?.targetPageIndex >= pages.length) {
      errors.push('Next page index is out of bounds');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [pages, currentPageIndex]);

  // ✅ NUEVO: Obtener logs del motor de flujo
  const getFlowExecutionLogs = useCallback(() => {
    return {
      logs: pageFlowEngine.getExecutionLog(),
      errors: pageFlowEngine.getErrors()
    };
  }, [pageFlowEngine]);

  // ✅ NUEVO: Limpiar logs del motor de flujo
  const clearFlowLogs = useCallback(() => {
    pageFlowEngine.clearLogs();
  }, [pageFlowEngine]);

  // ✅ Exportar todas las páginas (incluyendo configuración de flujo)
  const exportPages = useCallback(() => {
    return {
      pages: pages.map(page => ({
        ...page,
        exportedAt: new Date().toISOString()
      })),
      currentPageIndex,
      totalPages: pages.length,
      flowEngineOptions,
      availableVariables: availableVariablesState,
      exportedAt: new Date().toISOString(),
      version: '2.0' // Incrementar versión para flujo
    };
  }, [pages, currentPageIndex, flowEngineOptions, availableVariablesState]);

  // ✅ Importar páginas (incluyendo configuración de flujo)
  const importPages = useCallback((pagesData) => {
    console.log('📥 Importing pages with flow config:', pagesData);
    
    if (pagesData?.pages && Array.isArray(pagesData.pages) && pagesData.pages.length > 0) {
      // Asegurar que todas las páginas tengan flowConfig
      const pagesWithFlow = pagesData.pages.map(page => ({
        ...page,
        flowConfig: page.flowConfig || {
          ...DEFAULT_PAGE_FLOW_CONFIG,
          createdAt: page.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }));
      
      setPages(pagesWithFlow);
      setCurrentPageIndex(
        Math.min(pagesData.currentPageIndex || 0, pagesWithFlow.length - 1)
      );
      
      // Importar configuración del motor de flujo
      if (pagesData.flowEngineOptions) {
        setFlowEngineOptions(pagesData.flowEngineOptions);
      }
      
      // Importar variables disponibles
      if (pagesData.availableVariables) {
        setAvailableVariablesState(pagesData.availableVariables);
      }
      
      // Actualizar referencia de ID
      const maxId = pagesWithFlow.reduce((max, page) => {
        const match = page.id.match(/page_\d+_(\d+)/);
        return match ? Math.max(max, parseInt(match[1])) : max;
      }, 0);
      nextPageIdRef.current = maxId + 1;
      
      saveToHistory(pagesWithFlow);
      console.log('✅ Pages with flow config imported successfully');
    } else {
      console.warn('⚠️ Invalid pages data for import');
    }
  }, [saveToHistory]);

  // ✅ Estadísticas (incluyendo información de flujo)
  const getStatistics = useCallback(() => {
    const totalElements = pages.reduce((sum, page) => sum + page.elements.length, 0);
    const avgElementsPerPage = pages.length > 0 ? totalElements / pages.length : 0;
    
    const sizeDistribution = pages.reduce((acc, page) => {
      const preset = page.size.preset || 'Custom';
      acc[preset] = (acc[preset] || 0) + 1;
      return acc;
    }, {});
    
    // Estadísticas de flujo
    const flowTypeDistribution = pages.reduce((acc, page) => {
      const flowType = page.flowConfig?.type || PAGE_FLOW_TYPES.SIMPLE;
      acc[flowType] = (acc[flowType] || 0) + 1;
      return acc;
    }, {});
    
    const pagesWithConditions = pages.filter(page => 
      page.flowConfig?.type === PAGE_FLOW_TYPES.CONDITIONAL &&
      page.flowConfig.conditional?.conditions?.length > 0
    ).length;
    
    const pagesWithRepeating = pages.filter(page => 
      page.flowConfig?.type === PAGE_FLOW_TYPES.REPEATED
    ).length;

    return {
      totalPages: pages.length,
      currentPage: currentPageIndex + 1,
      totalElements,
      avgElementsPerPage: Math.round(avgElementsPerPage * 10) / 10,
      sizeDistribution,
      hasMultiplePages: pages.length > 1,
      
      // Estadísticas de flujo
      flowTypeDistribution,
      pagesWithConditions,
      pagesWithRepeating,
      hasAdvancedFlow: pagesWithConditions > 0 || pagesWithRepeating > 0
    };
  }, [pages, currentPageIndex]);

  return {
    // Estado básico
    pages,
    currentPageIndex,
    currentPage: getCurrentPage(),
    
    // Operaciones básicas de páginas
    addPage,
    duplicatePage,
    deletePage,
    goToPage,
    reorderPages,
    
    // Configuración básica
    updatePageConfig,
    updatePageElements,
    applyPageSizePreset,
    togglePageOrientation,
    
    // ✅ NUEVO: Operaciones de flujo de páginas
    updatePageFlowConfig,
    evaluatePageFlow,
    evaluateNextPage,
    generatePageSequence,
    getPageReferences,
    validatePageFlowConfig,
    
    // ✅ NUEVO: Manejo de variables
    updateAvailableVariables,
    availableVariables: availableVariablesState,
    
    // ✅ NUEVO: Configuración del motor
    setFlowEngineConfig,
    flowEngineOptions,
    
    // ✅ NUEVO: Logs y debugging
    getFlowExecutionLogs,
    clearFlowLogs,
    
    // Utilidades básicas
    getPageDimensionsInPixels,
    getPageSizePresets,
    
    // Import/Export (actualizado)
    exportPages,
    importPages,
    
    // Estadísticas (actualizado)
    getStatistics,
    
    // Navegación básica
    canGoToNextPage: currentPageIndex < pages.length - 1,
    canGoToPrevPage: currentPageIndex > 0,
    nextPage: () => goToPage(currentPageIndex + 1),
    prevPage: () => goToPage(currentPageIndex - 1),
    
    // ✅ NUEVO: Constantes de flujo
    PAGE_FLOW_TYPES,
    NEXT_PAGE_TYPES,
    DEFAULT_PAGE_FLOW_CONFIG
  };
};