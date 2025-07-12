// src/components/layoutDesigner/hooks/usePageManager.js - SIN NEXT PAGE TYPES
import { useState, useCallback, useRef, useMemo } from 'react';
import { PageFlowEngine } from '../utils/pageFlowEngine.js';
import { 
  PAGE_FLOW_TYPES, 
  DEFAULT_PAGE_FLOW_CONFIG
} from '../utils/pageFlow.constants.js';

export const usePageManager = (initialPages = null, initialAvailableVariables = {}) => {
  const nextPageIdRef = useRef(1);
  const maxHistorySize = 50;

  const createDefaultPage = useCallback(() => {
    return {
      id: `page_${Date.now()}_${nextPageIdRef.current++}`,
      name: 'Página 1',
      size: {
        width: 210,
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
      flowConfig: {
        ...DEFAULT_PAGE_FLOW_CONFIG,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }, []);

  const [pages, setPages] = useState(() => {
    if (initialPages && Array.isArray(initialPages) && initialPages.length > 0) {
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
  
  const [availableVariablesState, setAvailableVariablesState] = useState(() => {
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

  const pageFlowEngine = useMemo(() => {
    return new PageFlowEngine(availableVariablesState, pages, flowEngineOptions);
  }, [availableVariablesState, pages, flowEngineOptions]);

  const generatePageId = useCallback(() => {
    return `page_${Date.now()}_${nextPageIdRef.current++}`;
  }, []);

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

  const getCurrentPage = useCallback(() => {
    return pages[currentPageIndex] || null;
  }, [pages, currentPageIndex]);

  const updateAvailableVariables = useCallback((newVariables) => {
    console.log('🔄 Updating available variables:', newVariables);
    setAvailableVariablesState(prev => ({
      ...prev,
      ...newVariables
    }));
  }, []);

  const setFlowEngineConfig = useCallback((options) => {
    setFlowEngineOptions(prev => ({
      ...prev,
      ...options
    }));
  }, []);

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

  const goToPage = useCallback((pageIndex) => {
    if (pageIndex >= 0 && pageIndex < pages.length && pageIndex !== currentPageIndex) {
      console.log('📄 Switching to page:', pageIndex);
      setCurrentPageIndex(pageIndex);
    }
  }, [pages.length, currentPageIndex]);

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

  const evaluatePageFlow = useCallback((pageIndex, contextData = {}) => {
    try {
      return pageFlowEngine.evaluatePageFlow(pageIndex, contextData);
    } catch (error) {
      console.error('Error evaluating page flow:', error);
      return null;
    }
  }, [pageFlowEngine]);

  const getStartPage = useCallback((pageIndex, contextData = {}) => {
    try {
      return pageFlowEngine.getStartPage(pageIndex, contextData);
    } catch (error) {
      console.error('Error getting start page:', error);
      return { startPageIndex: 0, startPageId: null };
    }
  }, [pageFlowEngine]);

  const generateRenderSequence = useCallback((pageIndex = 0, contextData = {}) => {
    try {
      return pageFlowEngine.generateRenderSequence(pageIndex, contextData);
    } catch (error) {
      console.error('Error generating render sequence:', error);
      return [];
    }
  }, [pageFlowEngine]);

  const getPageReferences = useCallback((targetPageIndex) => {
    const references = [];
    
    pages.forEach((page, index) => {
      if (!page.flowConfig) return;
      
      if (page.flowConfig.simple?.startPageIndex === targetPageIndex) {
        references.push({
          pageIndex: index,
          type: 'simple',
          pageName: page.name
        });
      }
      
      if (page.flowConfig.conditional?.conditions) {
        page.flowConfig.conditional.conditions.forEach((condition, condIndex) => {
          if (condition.startPageIndex === targetPageIndex) {
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
      
      if (page.flowConfig.repeated?.startPageIndex === targetPageIndex) {
        references.push({
          pageIndex: index,
          type: 'repeated',
          pageName: page.name
        });
      }
    });
    
    return references;
  }, [pages]);

  const validatePageFlowConfig = useCallback((pageIndex = currentPageIndex) => {
    const page = pages[pageIndex];
    if (!page?.flowConfig) {
      return { isValid: false, errors: ['No flow configuration found'] };
    }
    
    const errors = [];
    const warnings = [];
    const config = page.flowConfig;
    
    switch (config.type) {
      case PAGE_FLOW_TYPES.SIMPLE:
        if (config.simple?.startPageIndex >= pages.length) {
          errors.push('Start page index is out of bounds');
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
          if (condition.startPageIndex >= pages.length) {
            errors.push(`Condition ${index + 1}: Start page index is out of bounds`);
          }
        });
        break;
        
      case PAGE_FLOW_TYPES.REPEATED:
        if (!config.repeated?.dataSource?.variableName) {
          errors.push('No data source variable defined for repeated page');
        }
        if (config.repeated?.startPageIndex >= pages.length) {
          errors.push('Start page index is out of bounds');
        }
        break;
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }, [pages, currentPageIndex]);

  const getFlowExecutionLogs = useCallback(() => {
    return {
      logs: pageFlowEngine.getExecutionLog(),
      errors: pageFlowEngine.getErrors()
    };
  }, [pageFlowEngine]);

  const clearFlowLogs = useCallback(() => {
    pageFlowEngine.clearLogs();
  }, [pageFlowEngine]);

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
      version: '2.1'
    };
  }, [pages, currentPageIndex, flowEngineOptions, availableVariablesState]);

  const importPages = useCallback((pagesData) => {
    console.log('📥 Importing pages with flow config:', pagesData);
    
    if (pagesData?.pages && Array.isArray(pagesData.pages) && pagesData.pages.length > 0) {
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
      
      if (pagesData.flowEngineOptions) {
        setFlowEngineOptions(pagesData.flowEngineOptions);
      }
      
      if (pagesData.availableVariables) {
        setAvailableVariablesState(pagesData.availableVariables);
      }
      
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

  const getStatistics = useCallback(() => {
    const totalElements = pages.reduce((sum, page) => sum + page.elements.length, 0);
    const avgElementsPerPage = pages.length > 0 ? totalElements / pages.length : 0;
    
    const sizeDistribution = pages.reduce((acc, page) => {
      const preset = page.size.preset || 'Custom';
      acc[preset] = (acc[preset] || 0) + 1;
      return acc;
    }, {});
    
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
      flowTypeDistribution,
      pagesWithConditions,
      pagesWithRepeating,
      hasAdvancedFlow: pagesWithConditions > 0 || pagesWithRepeating > 0,
      pagesWithCustomStartPage: pages.filter(page => {
        const config = page.flowConfig;
        if (!config) return false;
        
        switch (config.type) {
          case PAGE_FLOW_TYPES.SIMPLE:
            return config.simple?.startPageIndex !== 0;
          case PAGE_FLOW_TYPES.CONDITIONAL:
            return config.conditional?.defaultStartPageIndex !== 0;
          case PAGE_FLOW_TYPES.REPEATED:
            return config.repeated?.startPageIndex !== 0;
          default:
            return false;
        }
      }).length
    };
  }, [pages, currentPageIndex]);

  return {
    pages,
    currentPageIndex,
    currentPage: getCurrentPage(),
    addPage,
    duplicatePage,
    deletePage,
    goToPage,
    reorderPages,
    updatePageConfig,
    updatePageElements,
    applyPageSizePreset,
    togglePageOrientation,
    updatePageFlowConfig,
    evaluatePageFlow,
    getStartPage,
    generateRenderSequence,
    getPageReferences,
    validatePageFlowConfig,
    updateAvailableVariables,
    availableVariables: availableVariablesState,
    setFlowEngineConfig,
    flowEngineOptions,
    getFlowExecutionLogs,
    clearFlowLogs,
    getPageDimensionsInPixels,
    getPageSizePresets,
    exportPages,
    importPages,
    getStatistics,
    canGoToNextPage: currentPageIndex < pages.length - 1,
    canGoToPrevPage: currentPageIndex > 0,
    nextPage: () => goToPage(currentPageIndex + 1),
    prevPage: () => goToPage(currentPageIndex - 1),
    PAGE_FLOW_TYPES,
    DEFAULT_PAGE_FLOW_CONFIG
  };
};