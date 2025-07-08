// src/components/layoutDesigner/hooks/usePageManager.js - CORREGIDO
import { useState, useCallback, useRef } from 'react';

export const usePageManager = (initialPages = null) => {
  // ✅ CORREGIDO: Inicializar refs ANTES de usarlos
  const nextPageIdRef = useRef(1);
  const maxHistorySize = 50;

  // ✅ Función para crear página por defecto (movida después de refs)
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
      orientation: 'portrait', // 'portrait' | 'landscape'
      margins: {
        top: 10,
        right: 10,
        bottom: 10,
        left: 10,
        unit: 'mm'
      },
      background: {
        color: '#ffffff',
        image: null,
        opacity: 1
      },
      elements: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }, []);

  // ✅ Estados principales de páginas (ahora usando la función callback)
  const [pages, setPages] = useState(() => {
    if (initialPages && Array.isArray(initialPages) && initialPages.length > 0) {
      return initialPages;
    }
    return [createDefaultPage()];
  });
  
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [pageHistory, setPageHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

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

  // ✅ Agregar nueva página
  const addPage = useCallback((position = null, pageConfig = {}) => {
    console.log('➕ Adding new page');
    
    const newPage = {
      ...createDefaultPage(),
      id: generatePageId(),
      name: pageConfig.name || `Página ${pages.length + 1}`,
      ...pageConfig,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setPages(prev => {
      let newPages;
      
      if (position === null || position >= prev.length) {
        // Agregar al final
        newPages = [...prev, newPage];
        setCurrentPageIndex(newPages.length - 1);
      } else {
        // Insertar en posición específica
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

    console.log('✅ Page added:', newPage.id);
    return newPage;
  }, [pages, generatePageId, saveToHistory, createDefaultPage]);

  // ✅ Duplicar página
  const duplicatePage = useCallback((pageIndex = currentPageIndex) => {
    const pageToClone = pages[pageIndex];
    if (!pageToClone) return null;

    console.log('📋 Duplicating page:', pageToClone.id);

    const duplicatedPage = {
      ...pageToClone,
      id: generatePageId(),
      name: `${pageToClone.name} (Copia)`,
      elements: pageToClone.elements.map(element => ({
        ...element,
        id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      })),
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
      
      // Ajustar índice actual si es necesario
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
      
      // Ajustar índice actual
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
    if (!page) return { width: 794, height: 1123 }; // A4 default en px

    const { width, height, unit } = page.size;
    
    // Factores de conversión a píxeles (96 DPI)
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

  // ✅ Presets de tamaños de página mejorados para PDF
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

  // ✅ Exportar todas las páginas
  const exportPages = useCallback(() => {
    return {
      pages: pages.map(page => ({
        ...page,
        exportedAt: new Date().toISOString()
      })),
      currentPageIndex,
      totalPages: pages.length,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };
  }, [pages, currentPageIndex]);

  // ✅ Importar páginas
  const importPages = useCallback((pagesData) => {
    console.log('📥 Importing pages:', pagesData);
    
    if (pagesData?.pages && Array.isArray(pagesData.pages) && pagesData.pages.length > 0) {
      setPages(pagesData.pages);
      setCurrentPageIndex(
        Math.min(pagesData.currentPageIndex || 0, pagesData.pages.length - 1)
      );
      
      // Actualizar referencia de ID
      const maxId = pagesData.pages.reduce((max, page) => {
        const match = page.id.match(/page_\d+_(\d+)/);
        return match ? Math.max(max, parseInt(match[1])) : max;
      }, 0);
      nextPageIdRef.current = maxId + 1;
      
      saveToHistory(pagesData.pages);
      console.log('✅ Pages imported successfully');
    } else {
      console.warn('⚠️ Invalid pages data for import');
    }
  }, [saveToHistory]);

  // ✅ Estadísticas
  const getStatistics = useCallback(() => {
    const totalElements = pages.reduce((sum, page) => sum + page.elements.length, 0);
    const avgElementsPerPage = pages.length > 0 ? totalElements / pages.length : 0;
    
    const sizeDistribution = pages.reduce((acc, page) => {
      const preset = page.size.preset || 'Custom';
      acc[preset] = (acc[preset] || 0) + 1;
      return acc;
    }, {});

    return {
      totalPages: pages.length,
      currentPage: currentPageIndex + 1,
      totalElements,
      avgElementsPerPage: Math.round(avgElementsPerPage * 10) / 10,
      sizeDistribution,
      hasMultiplePages: pages.length > 1
    };
  }, [pages, currentPageIndex]);

  return {
    // Estado
    pages,
    currentPageIndex,
    currentPage: getCurrentPage(),
    
    // Operaciones de páginas
    addPage,
    duplicatePage,
    deletePage,
    goToPage,
    reorderPages,
    
    // Configuración
    updatePageConfig,
    updatePageElements,
    applyPageSizePreset,
    togglePageOrientation,
    
    // Utilidades
    getPageDimensionsInPixels,
    getPageSizePresets,
    
    // Import/Export
    exportPages,
    importPages,
    
    // Estadísticas
    getStatistics,
    
    // Navegación
    canGoToNextPage: currentPageIndex < pages.length - 1,
    canGoToPrevPage: currentPageIndex > 0,
    nextPage: () => goToPage(currentPageIndex + 1),
    prevPage: () => goToPage(currentPageIndex - 1)
  };
};