// src/components/layoutDesigner/index.js
// Exportaciones principales del Layout Designer modular

// Componente principal
export { default as LayoutDesigner } from './LayoutDesigner';

// Componentes de UI
export { default as Canvas } from './Canvas';
export { default as Toolbar } from './Toolbar';
export { default as PropertiesPanel } from './PropertiesPanel';
export { default as StylesSidebar } from './StylesSidebar';
export { default as StyleEditorModal } from './StyleEditor';

// Componentes de elementos
export * from './components';

// Hooks
export { useLayoutDesigner } from './hooks/useLayoutDesigner';
export { useDragAndDrop } from './hooks/useDragAndDrop';
export { useResize } from './hooks/useResize';
export { useStyleManager } from './hooks/useStyleManager';
export { useVariables } from './hooks/useVariables';

// Utilidades
export { styleManager } from './utils/StyleManager';
export * from './utils/constants';
export { elementFactory } from './utils/elementFactory';
export { variableProcessor } from './utils/variableProcessor';