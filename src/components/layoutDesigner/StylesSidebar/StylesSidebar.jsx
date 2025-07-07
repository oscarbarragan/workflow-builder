// src/components/layoutDesigner/StylesSidebar/StylesSidebar.jsx - SOLUCIÓN DEFINITIVA
import React, { useState, useRef, useEffect } from 'react';
import { styleManager } from '../utils/StyleManager';
import { variableProcessor } from '../utils/variableProcessor';
import { sidebarConfig } from './sidebar.config';
import VariablesSection from './VariablesSection';
import StylesSection from './StylesSection';

const StylesSidebar = ({ 
  selectedElement, 
  onApplyStyle,
  onCreateNewStyle,
  onEditStyle,
  availableVariables = {},
  showVariableValues = false,
  onToggleVariableValues,
  updateTrigger = 0 // ✅ Recibir trigger
}) => {
  const [expandedSections, setExpandedSections] = useState({
    variables: sidebarConfig.sections.variables.expandedByDefault,
    textStyles: sidebarConfig.sections.textStyles.expandedByDefault,
    paragraphStyles: sidebarConfig.sections.paragraphStyles.expandedByDefault,
    borderStyles: sidebarConfig.sections.borderStyles.expandedByDefault,
    fillStyles: sidebarConfig.sections.fillStyles.expandedByDefault
  });
  const [activeTab, setActiveTab] = useState('styles');
  const fontInputRef = useRef(null);
  
  const [cachedStyles, setCachedStyles] = useState({
    textStyles: [],
    paragraphStyles: [],
    borderStyles: [],
    fillStyles: []
  });

  // Procesar variables disponibles
  const processedVariables = React.useMemo(() => {
    return variableProcessor.processAvailableVariables(availableVariables);
  }, [availableVariables]);

  // ✅ SOLUCIÓN: Actualizar cache cuando cambie el trigger
  useEffect(() => {
    console.log('🔄 StylesSidebar: Updating cached styles due to trigger:', updateTrigger);
    
    setCachedStyles({
      textStyles: styleManager.getAllTextStyles(),
      paragraphStyles: styleManager.getAllParagraphStyles(),
      borderStyles: styleManager.getAllBorderStyles(),
      fillStyles: styleManager.getAllFillStyles()
    });
  }, [updateTrigger]);

  useEffect(() => {
    setCachedStyles({
      textStyles: styleManager.getAllTextStyles(),
      paragraphStyles: styleManager.getAllParagraphStyles(),
      borderStyles: styleManager.getAllBorderStyles(),
      fillStyles: styleManager.getAllFillStyles()
    });
  }, []);

  const { tabs, sections, styles } = sidebarConfig;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // ✅ SOLUCIÓN: Aplicar estilo y forzar actualización inmediata
  const handleApplyStyle = (styleType, styleId) => {
    if (onApplyStyle && selectedElement) {
      console.log('🎨 Applying style from sidebar:', styleType, styleId);
      onApplyStyle(selectedElement.id, styleType, styleId);
      
      // ✅ Forzar re-render inmediato actualizando el cache
      setTimeout(() => {
        setCachedStyles({
          textStyles: styleManager.getAllTextStyles(),
          paragraphStyles: styleManager.getAllParagraphStyles(),
          borderStyles: styleManager.getAllBorderStyles(),
          fillStyles: styleManager.getAllFillStyles()
        });
      }, 50);
    }
  };

  // Manejar duplicación de estilos
  const handleDuplicateStyle = (styleType, styleId, styleName) => {
    try {
      let originalStyle = null;
      let newStyleId = null;

      // Obtener el estilo original
      switch(styleType) {
        case 'textStyle':
          originalStyle = styleManager.getTextStyle(styleId);
          newStyleId = styleManager.generateStyleId('textStyle');
          break;
        case 'paragraphStyle':
          originalStyle = styleManager.getParagraphStyle(styleId);
          newStyleId = styleManager.generateStyleId('paragraphStyle');
          break;
        case 'borderStyle':
          originalStyle = styleManager.getBorderStyle(styleId);
          newStyleId = styleManager.generateStyleId('borderStyle');
          break;
        case 'fillStyle':
          originalStyle = styleManager.getFillStyle(styleId);
          newStyleId = styleManager.generateStyleId('fillStyle');
          break;
      }

      if (!originalStyle) {
        console.error('❌ Original style not found:', styleId);
        return;
      }

      // Crear el estilo duplicado
      const duplicatedStyle = {
        ...originalStyle,
        id: newStyleId,
        name: `${styleName} (Copia)`,
        isCustom: true,
        createdAt: new Date().toISOString(),
        duplicatedFrom: styleId
      };

      // Agregar el nuevo estilo
      switch(styleType) {
        case 'textStyle':
          styleManager.addTextStyle(newStyleId, duplicatedStyle);
          break;
        case 'paragraphStyle':
          styleManager.addParagraphStyle(newStyleId, duplicatedStyle);
          break;
        case 'borderStyle':
          styleManager.addBorderStyle(newStyleId, duplicatedStyle);
          break;
        case 'fillStyle':
          styleManager.addFillStyle(newStyleId, duplicatedStyle);
          break;
      }

      // Actualizar cache
      setCachedStyles({
        textStyles: styleManager.getAllTextStyles(),
        paragraphStyles: styleManager.getAllParagraphStyles(),
        borderStyles: styleManager.getAllBorderStyles(),
        fillStyles: styleManager.getAllFillStyles()
      });

      console.log('✅ Style duplicated successfully:', newStyleId);
      alert(`Estilo "${duplicatedStyle.name}" creado como copia de "${styleName}"`);

    } catch (error) {
      console.error('❌ Error duplicating style:', error);
      alert('Error al duplicar el estilo');
    }
  };

  const handleDeleteStyle = (styleType, styleId, styleName) => {
    // Verificar si el estilo está en uso
    const isStyleInUse = () => {
      if (!selectedElement) return false;
      
      switch(styleType) {
        case 'textStyle':
          return selectedElement.textStyleId === styleId;
        case 'paragraphStyle':
          return selectedElement.paragraphStyleId === styleId;
        case 'borderStyle':
          return selectedElement.borderStyleId === styleId;
        case 'fillStyle':
          return selectedElement.fillStyleId === styleId;
        default:
          return false;
      }
    };

    const inUseWarning = isStyleInUse() 
      ? '\n\n⚠️ ATENCIÓN: Este estilo está aplicado al elemento seleccionado.' 
      : '';

    if (window.confirm(`¿Eliminar el estilo "${styleName}"?${inUseWarning}`)) {
      try {
        switch(styleType) {
          case 'textStyle':
            styleManager.deleteTextStyle(styleId);
            break;
          case 'paragraphStyle':
            styleManager.deleteParagraphStyle(styleId);
            break;
          case 'borderStyle':
            styleManager.deleteBorderStyle(styleId);
            break;
          case 'fillStyle':
            styleManager.deleteFillStyle(styleId);
            break;
        }
        
        setCachedStyles({
          textStyles: styleManager.getAllTextStyles(),
          paragraphStyles: styleManager.getAllParagraphStyles(),
          borderStyles: styleManager.getAllBorderStyles(),
          fillStyles: styleManager.getAllFillStyles()
        });
        
        console.log('✅ Style deleted:', styleId);
      } catch (error) {
        console.error('❌ Error deleting style:', error);
        alert('Error al eliminar el estilo');
      }
    }
  };

  const handleFontUpload = async (event) => {
    const file = event.target.files[0];
    if (file && file.type.includes('font')) {
      const fontName = file.name.replace(/\.(ttf|otf|woff|woff2)$/i, '');
      const success = await styleManager.addCustomFont(file, fontName);
      if (success) {
        console.log('✅ Font uploaded successfully:', fontName);
        alert(`Fuente "${fontName}" cargada correctamente`);
      } else {
        console.error('❌ Failed to upload font');
        alert('Error al cargar la fuente');
      }
    }
  };

  const renderElementsTree = () => (
    <div style={{ padding: '12px' }}>
      <h4 style={{
        margin: '0 0 12px 0',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151'
      }}>
        🌳 Elementos
      </h4>
      
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        padding: '8px'
      }}>
        <div style={{
          fontSize: '12px',
          color: '#6b7280',
          textAlign: 'center',
          padding: '20px'
        }}>
          Árbol de elementos (próximamente)
        </div>
      </div>
    </div>
  );

  const renderFontsSection = () => (
    <div style={{ padding: '12px' }}>
      <h4 style={{
        margin: '0 0 12px 0',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        🔤 Fuentes
        <button
          onClick={() => fontInputRef.current?.click()}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title="Importar fuente personalizada"
        >
          📁 Importar
        </button>
      </h4>

      <input
        ref={fontInputRef}
        type="file"
        accept=".ttf,.otf,.woff,.woff2"
        onChange={handleFontUpload}
        style={{ display: 'none' }}
      />
      
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        maxHeight: '200px',
        overflowY: 'auto'
      }}>
        {styleManager.getAvailableFonts().map((font, index) => (
          <div
            key={index}
            style={{
              padding: '6px 10px',
              borderBottom: '1px solid #f3f4f6',
              fontSize: '12px',
              fontFamily: font,
              cursor: 'pointer'
            }}
            onMouseOver={(e) => e.target.style.background = '#f8fafc'}
            onMouseOut={(e) => e.target.style.background = 'transparent'}
            title={`Fuente: ${font}`}
          >
            {font.split(',')[0]} - Ejemplo de texto
          </div>
        ))}
      </div>
    </div>
  );

  // Renderizar estadísticas de estilos
  const renderStylesStats = () => {
    const stats = {
      total: cachedStyles.textStyles.length + 
             cachedStyles.paragraphStyles.length + 
             cachedStyles.borderStyles.length + 
             cachedStyles.fillStyles.length,
      custom: [
        ...cachedStyles.textStyles,
        ...cachedStyles.paragraphStyles,
        ...cachedStyles.borderStyles,
        ...cachedStyles.fillStyles
      ].filter(style => style.isCustom).length
    };

    return (
      <div style={{
        margin: '12px',
        padding: '8px 12px',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '6px'
      }}>
        <div style={{
          fontSize: '11px',
          color: '#64748b',
          fontWeight: '600',
          marginBottom: '4px'
        }}>
          📊 Estadísticas de Estilos
        </div>
        <div style={{
          fontSize: '10px',
          color: '#64748b',
          lineHeight: '1.3'
        }}>
          <strong>Total:</strong> {stats.total} estilos
          <br />
          <strong>Personalizados:</strong> {stats.custom}
          <br />
          <strong>Predefinidos:</strong> {stats.total - stats.custom}
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Header con tabs */}
      <div style={styles.header}>
        <div style={styles.tabContainer}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={styles.tab(activeTab === tab.id)}
            >
              <span style={{ marginRight: '4px' }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {activeTab === 'styles' && (
          <div>
            <VariablesSection
              variables={processedVariables}
              showVariableValues={showVariableValues}
              onToggleVariableValues={onToggleVariableValues}
              isExpanded={expandedSections.variables}
              onToggleExpanded={() => toggleSection('variables')}
            />
            
            <StylesSection
              type="textStyle"
              title="Estilos de Texto"
              icon="📝"
              styles={cachedStyles.textStyles}
              selectedElement={selectedElement}
              isExpanded={expandedSections.textStyles}
              onToggleExpanded={() => toggleSection('textStyles')}
              onApplyStyle={handleApplyStyle}
              onCreateNewStyle={onCreateNewStyle}
              onEditStyle={onEditStyle}
              onDeleteStyle={handleDeleteStyle}
              onDuplicateStyle={handleDuplicateStyle}
            />
            
            <StylesSection
              type="paragraphStyle"
              title="Estilos de Párrafo"
              icon="📄"
              styles={cachedStyles.paragraphStyles}
              selectedElement={selectedElement}
              isExpanded={expandedSections.paragraphStyles}
              onToggleExpanded={() => toggleSection('paragraphStyles')}
              onApplyStyle={handleApplyStyle}
              onCreateNewStyle={onCreateNewStyle}
              onEditStyle={onEditStyle}
              onDeleteStyle={handleDeleteStyle}
              onDuplicateStyle={handleDuplicateStyle}
            />
            
            <StylesSection
              type="borderStyle"
              title="Estilos de Borde"
              icon="🔲"
              styles={cachedStyles.borderStyles}
              selectedElement={selectedElement}
              isExpanded={expandedSections.borderStyles}
              onToggleExpanded={() => toggleSection('borderStyles')}
              onApplyStyle={handleApplyStyle}
              onCreateNewStyle={onCreateNewStyle}
              onEditStyle={onEditStyle}
              onDeleteStyle={handleDeleteStyle}
              onDuplicateStyle={handleDuplicateStyle}
            />
            
            <StylesSection
              type="fillStyle"
              title="Estilos de Relleno"
              icon="🎨"
              styles={cachedStyles.fillStyles}
              selectedElement={selectedElement}
              isExpanded={expandedSections.fillStyles}
              onToggleExpanded={() => toggleSection('fillStyles')}
              onApplyStyle={handleApplyStyle}
              onCreateNewStyle={onCreateNewStyle}
              onEditStyle={onEditStyle}
              onDeleteStyle={handleDeleteStyle}
              onDuplicateStyle={handleDuplicateStyle}
            />
            
            {renderFontsSection()}
            {renderStylesStats()}
          </div>
        )}
        
        {activeTab === 'elements' && (
          <div>
            {renderElementsTree()}
          </div>
        )}
      </div>

      {/* Footer con acciones */}
      <div style={styles.footer}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => {
              const styles = styleManager.exportStyles();
              const blob = new Blob([JSON.stringify(styles, null, 2)], 
                { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `styles-${Date.now()}.json`;
              a.click();
              URL.revokeObjectURL(url);
              
              alert('Estilos exportados correctamente');
            }}
            style={styles.actionButton}
            title="Exportar estilos"
          >
            📥 Exportar
          </button>
          
          <button
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.json';
              input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    try {
                      const styles = JSON.parse(e.target.result);
                      styleManager.importStyles(styles);
                      
                      setCachedStyles({
                        textStyles: styleManager.getAllTextStyles(),
                        paragraphStyles: styleManager.getAllParagraphStyles(),
                        borderStyles: styleManager.getAllBorderStyles(),
                        fillStyles: styleManager.getAllFillStyles()
                      });
                      
                      alert('Estilos importados correctamente');
                    } catch (error) {
                      console.error('❌ Error importing styles:', error);
                      alert('Error al importar estilos. Verifica que el archivo sea válido.');
                    }
                  };
                  reader.readAsText(file);
                }
              };
              input.click();
            }}
            style={styles.actionButton}
            title="Importar estilos"
          >
            📤 Importar
          </button>
        </div>
        
        {selectedElement && (
          <div style={{
            marginTop: '8px',
            padding: '6px 8px',
            background: '#eff6ff',
            borderRadius: '4px',
            fontSize: '10px',
            color: '#1e40af',
            textAlign: 'center'
          }}>
            📝 {selectedElement.type} seleccionado
            <br />
            {[
              selectedElement.textStyleId && '🔤',
              selectedElement.paragraphStyleId && '📄', 
              selectedElement.borderStyleId && '🔲',
              selectedElement.fillStyleId && '🎨'
            ].filter(Boolean).length > 0 ? (
              <>
                Estilos: {[
                  selectedElement.textStyleId && '🔤',
                  selectedElement.paragraphStyleId && '📄', 
                  selectedElement.borderStyleId && '🔲',
                  selectedElement.fillStyleId && '🎨'
                ].filter(Boolean).join(' ')}
              </>
            ) : (
              'Haz clic en un estilo para aplicarlo'
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StylesSidebar;