// src/components/layoutDesigner/StylesSidebar/StylesSidebar.jsx
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
  updateTrigger = 0
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

  const handleApplyStyle = (styleType, styleId) => {
    if (onApplyStyle && selectedElement) {
      onApplyStyle(selectedElement.id, styleType, styleId);
    }
  };

  const handleDeleteStyle = (styleType, styleId, styleName) => {
    if (window.confirm(`¿Eliminar el estilo "${styleName}"?`)) {
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
        
      } catch (error) {
        console.error('❌ Error deleting style:', error);
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
      } else {
        console.error('❌ Failed to upload font');
      }
    }
  };

  const renderSectionHeader = (title, section, icon) => (
    <div
      onClick={() => toggleSection(section)}
      style={styles.sectionHeader(expandedSections[section])}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>{icon}</span>
        {title}
      </div>
      <span>
        {expandedSections[section] ? '🔽' : '▶️'}
      </span>
    </div>
  );

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
            />
            
            {renderFontsSection()}
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
                    } catch (error) {
                      console.error('❌ Error importing styles:', error);
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
            Haz clic en un estilo para aplicarlo
          </div>
        )}
      </div>
    </div>
  );
};

export default StylesSidebar;