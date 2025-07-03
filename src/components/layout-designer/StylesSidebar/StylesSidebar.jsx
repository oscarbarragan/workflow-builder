// src/components/layout-designer/StylesSidebar/StylesSidebar.jsx - CORREGIDO notación de punto
import React, { useState, useRef, useEffect } from 'react';
import { 
  Type, 
  Square, 
  Plus, 
  Edit3, 
  Trash2, 
  Upload, 
  Download,
  ChevronDown,
  ChevronRight,
  Palette,
  Frame,
  FileText,
  Link2,
  Eye,
  EyeOff
} from 'lucide-react';
import { styleManager } from '../../../utils/StyleManager';

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
    variables: true,
    textStyles: true,
    paragraphStyles: true,
    borderStyles: false,
    fillStyles: false
  });
  const [activeTab, setActiveTab] = useState('styles');
  const fontInputRef = useRef(null);
  
  const [cachedStyles, setCachedStyles] = useState({
    textStyles: [],
    paragraphStyles: [],
    borderStyles: [],
    fillStyles: []
  });

  // ✅ FUNCIÓN NUEVA: Convertir variables a notación de punto
  const convertVariablesToDotNotation = (variables) => {
    const convertedVariables = {};
    
    Object.entries(variables).forEach(([key, value]) => {
      // Convertir guiones bajos a puntos
      const dotNotationKey = key.replace(/_/g, '.');
      convertedVariables[dotNotationKey] = value;
    });
    
    return convertedVariables;
  };

  // ✅ FUNCIÓN NUEVA: Procesar estructura JSON anidada para generar variables con notación de punto
  const flattenObjectToDotNotation = (obj, prefix = '') => {
    const flattened = {};
    
    Object.entries(obj).forEach(([key, value]) => {
      const newKey = prefix ? `${prefix}.${key}` : key;
      
      if (value && typeof value === 'object' && !Array.isArray(value) && value.constructor === Object) {
        // Es un objeto anidado, seguir aplanando
        Object.assign(flattened, flattenObjectToDotNotation(value, newKey));
      } else if (Array.isArray(value) && value.length > 0) {
        // Es un array, mostrar el primer elemento y longitud
        flattened[newKey] = {
          displayValue: `Array[${value.length}]`,
          type: 'array',
          actualValue: value
        };
        
        // Si el primer elemento es un objeto, mostrar sus propiedades
        if (value[0] && typeof value[0] === 'object') {
          Object.assign(flattened, flattenObjectToDotNotation(value[0], `${newKey}[0]`));
        }
      } else {
        // Es un valor primitivo
        flattened[newKey] = {
          displayValue: value,
          type: typeof value,
          actualValue: value
        };
      }
    });
    
    return flattened;
  };

  // ✅ NUEVO: Procesar variables disponibles
  const processedVariables = React.useMemo(() => {
    console.log('🔄 Processing variables with dot notation:', availableVariables);
    
    // Si ya están en formato correcto, procesarlas
    if (Object.keys(availableVariables).some(key => key.includes('.'))) {
      return availableVariables;
    }
    
    // Si es un objeto plano con guiones bajos, convertir
    if (Object.keys(availableVariables).some(key => key.includes('_'))) {
      return convertVariablesToDotNotation(availableVariables);
    }
    
    // Si es una estructura JSON anidada, aplanar
    return flattenObjectToDotNotation(availableVariables);
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

  const sidebarStyle = {
    width: '280px',
    background: '#f8fafc',
    borderRight: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflow: 'hidden'
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
    console.log('📂 Toggled section:', section, 'to:', !expandedSections[section]);
  };

  const handleApplyStyle = (styleType, styleId) => {
    console.log('🎨 Applying style:', styleType, styleId, 'to element:', selectedElement?.id);
    if (onApplyStyle && selectedElement) {
      onApplyStyle(selectedElement.id, styleType, styleId);
    }
  };

  const handleCreateNewStyle = (styleType) => {
    console.log('✨ Creating new style:', styleType);
    if (onCreateNewStyle) {
      onCreateNewStyle(styleType);
    }
  };

  const handleEditStyle = (styleType, styleId) => {
    console.log('📝 Editing style:', styleType, styleId);
    if (onEditStyle) {
      onEditStyle(styleType, styleId);
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
        console.log('✅ Style deleted:', styleId);
        
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
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        background: '#e2e8f0',
        borderBottom: '1px solid #cbd5e1',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '600',
        color: '#475569'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {icon}
        {title}
      </div>
      {expandedSections[section] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
    </div>
  );

  // ✅ MEJORADO: Renderizado de variables con notación de punto
  const renderVariablesSection = () => (
    <div>
      {renderSectionHeader(
        `Variables (${Object.keys(processedVariables).length})`, 
        'variables', 
        <Link2 size={14} />
      )}
      {expandedSections.variables && (
        <div>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid #f1f5f9' }}>
            <button
              onClick={onToggleVariableValues}
              style={{
                width: '100%',
                padding: '6px 8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                background: showVariableValues ? '#eff6ff' : 'white',
                color: showVariableValues ? '#1e40af' : '#374151',
                fontSize: '11px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              {showVariableValues ? <Eye size={12} /> : <EyeOff size={12} />}
              {showVariableValues ? 'Mostrar Variables' : 'Mostrar Valores'}
            </button>
          </div>
          
          {Object.keys(processedVariables).length === 0 ? (
            <div style={{
              padding: '20px 12px',
              textAlign: 'center',
              color: '#9ca3af',
              fontSize: '12px'
            }}>
              <Link2 size={24} style={{ marginBottom: '8px', opacity: 0.5 }} />
              <div>No hay variables disponibles</div>
              <div style={{ fontSize: '11px', marginTop: '4px' }}>
                Conecta nodos para obtener variables
              </div>
            </div>
          ) : (
            <div style={{
              maxHeight: '250px',
              overflowY: 'auto'
            }}>
              {Object.entries(processedVariables).map(([key, varData]) => {
                let displayValue, typeInfo;
                
                // ✅ MEJORADO: Manejo de estructura de datos con notación de punto
                if (typeof varData === 'object' && varData !== null && varData.displayValue !== undefined) {
                  displayValue = String(varData.displayValue || '');
                  typeInfo = varData.type || 'unknown';
                } else {
                  displayValue = typeof varData === 'string' ? varData : String(varData || '');
                  typeInfo = typeof varData;
                }
                
                const truncatedValue = displayValue.length > 30 
                  ? `${displayValue.substring(0, 30)}...` 
                  : displayValue;

                // ✅ NUEVO: Indicador visual para estructura anidada
                const isNestedPath = key.includes('.');
                const pathParts = key.split('.');
                const lastPart = pathParts[pathParts.length - 1];
                const parentPath = pathParts.slice(0, -1).join('.');

                return (
                  <div
                    key={`variable-${key}`}
                    style={{
                      padding: '8px 12px',
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                      paddingLeft: isNestedPath ? `${12 + (pathParts.length - 1) * 8}px` : '12px',
                      borderLeft: isNestedPath ? '2px solid #e5e7eb' : 'none'
                    }}
                    onMouseOver={(e) => e.target.style.backgroundColor = '#f8fafc'}
                    onMouseOut={(e) => e.target.style.backgroundColor = 'transparent'}
                    title={`Usar variable: {{${key}}}\nTipo: ${typeInfo}\nValor: ${displayValue}`}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '4px'
                    }}>
                      <div style={{
                        fontWeight: '600',
                        color: '#374151',
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {/* ✅ NUEVO: Indicador visual según tipo y anidamiento */}
                        <span style={{ 
                          color: typeInfo === 'string' ? '#16a34a' : 
                                typeInfo === 'number' ? '#3b82f6' : 
                                typeInfo === 'boolean' ? '#f59e0b' : 
                                typeInfo === 'array' ? '#7c3aed' : 
                                typeInfo === 'object' ? '#dc2626' : '#6b7280',
                          fontSize: '10px'
                        }}>
                          {isNestedPath ? '└' : '🔗'}
                        </span>
                        
                        {/* ✅ MEJORADO: Mostrar path completo o solo la parte final */}
                        <span style={{ 
                          fontFamily: 'monospace',
                          fontSize: isNestedPath ? '11px' : '12px'
                        }}>
                          {showVariableValues && isNestedPath ? (
                            <>
                              <span style={{ color: '#9ca3af', fontSize: '10px' }}>{parentPath}.</span>
                              <span style={{ color: '#374151' }}>{lastPart}</span>
                            </>
                          ) : (
                            `{{${key}}}`
                          )}
                        </span>
                      </div>
                      
                      <span style={{
                        fontSize: '9px',
                        padding: '1px 4px',
                        background: typeInfo === 'string' ? '#dcfce7' : 
                                  typeInfo === 'number' ? '#dbeafe' : 
                                  typeInfo === 'boolean' ? '#fef3c7' : 
                                  typeInfo === 'array' ? '#f3e8ff' : 
                                  typeInfo === 'object' ? '#fef2f2' : '#f3f4f6',
                        borderRadius: '3px',
                        color: typeInfo === 'string' ? '#16a34a' : 
                               typeInfo === 'number' ? '#2563eb' : 
                               typeInfo === 'boolean' ? '#d97706' : 
                               typeInfo === 'array' ? '#7c3aed' : 
                               typeInfo === 'object' ? '#dc2626' : '#6b7280',
                        fontWeight: '500'
                      }}>
                        {String(typeInfo)}
                      </span>
                    </div>
                    
                    <div style={{
                      color: '#6b7280',
                      fontSize: '11px',
                      fontFamily: showVariableValues ? 'inherit' : 'monospace',
                      paddingLeft: isNestedPath ? '14px' : '0'
                    }}>
                      {showVariableValues ? truncatedValue : `{{${key}}}`}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          <div style={{
            padding: '8px 12px',
            fontSize: '10px',
            color: '#9ca3af',
            fontStyle: 'italic',
            textAlign: 'center',
            borderTop: '1px solid #f1f5f9'
          }}>
            💡 Usa Ctrl+Espacio en texto para insertar variables
          </div>
        </div>
      )}
    </div>
  );

  const renderStyleItem = (style, styleType, isApplied = false) => (
    <div
      key={style.id}
      style={{
        padding: '8px 12px',
        borderBottom: '1px solid #f1f5f9',
        background: isApplied ? '#eff6ff' : 'transparent',
        borderLeft: isApplied ? '3px solid #3b82f6' : '3px solid transparent',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '12px'
      }}
    >
      <div 
        style={{ 
          flex: 1, 
          cursor: 'pointer',
          minWidth: 0
        }}
        onClick={() => handleApplyStyle(styleType, style.id)}
        onMouseOver={(e) => {
          if (!isApplied) e.currentTarget.style.background = '#f8fafc';
        }}
        onMouseOut={(e) => {
          if (!isApplied) e.currentTarget.style.background = 'transparent';
        }}
      >
        <div style={{ 
          fontWeight: '500', 
          color: '#374151',
          marginBottom: '2px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {style.name}
          {style.isCustom && (
            <span style={{
              fontSize: '9px',
              background: '#fbbf24',
              color: 'white',
              padding: '1px 4px',
              borderRadius: '2px',
              marginLeft: '4px'
            }}>
              Custom
            </span>
          )}
        </div>
        
        {styleType === 'textStyle' && (
          <div style={{
            fontSize: '10px',
            color: '#6b7280',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {style.fontFamily?.split(',')[0]} • {style.fontSize}px
            {style.bold && ' • Bold'}
            {style.italic && ' • Italic'}
          </div>
        )}
        {styleType === 'paragraphStyle' && (
          <div style={{
            fontSize: '10px',
            color: '#6b7280'
          }}>
            {style.alignment} • {style.lineHeight}
            {style.letterSpacing && ` • ${style.letterSpacing}px`}
          </div>
        )}
        {styleType === 'borderStyle' && (
          <div style={{
            fontSize: '10px',
            color: '#6b7280'
          }}>
            {style.width}px {style.style} • {style.color}
            {style.radius && ` • ${style.radius}px radius`}
          </div>
        )}
        {styleType === 'fillStyle' && (
          <div style={{
            fontSize: '10px',
            color: '#6b7280'
          }}>
            {style.backgroundColor} • {Math.round((style.opacity || 1) * 100)}%
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
        {style.isCustom && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEditStyle(styleType, style.id);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: '#6b7280',
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#e5e7eb';
              e.target.style.color = '#374151';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'none';
              e.target.style.color = '#6b7280';
            }}
            title="Editar estilo"
          >
            <Edit3 size={12} />
          </button>
        )}
        
        {style.isCustom && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteStyle(styleType, style.id, style.name);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              color: '#dc2626',
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#fef2f2';
              e.target.style.color = '#991b1b';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'none';
              e.target.style.color = '#dc2626';
            }}
            title="Eliminar estilo"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  );

  const renderTextStyles = () => {
    const currentTextStyleId = selectedElement?.textStyleId;

    return (
      <div>
        {renderSectionHeader('Estilos de Texto', 'textStyles', <Type size={14} />)}
        {expandedSections.textStyles && (
          <div>
            <div style={{ padding: '8px 12px' }}>
              <button
                onClick={() => handleCreateNewStyle('textStyle')}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px dashed #3b82f6',
                  borderRadius: '4px',
                  background: 'white',
                  color: '#3b82f6',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <Plus size={12} />
                Nuevo Estilo de Texto
              </button>
            </div>
            
            {cachedStyles.textStyles.map(style => 
              renderStyleItem(style, 'textStyle', style.id === currentTextStyleId)
            )}
          </div>
        )}
      </div>
    );
  };

  const renderParagraphStyles = () => {
    const currentParagraphStyleId = selectedElement?.paragraphStyleId;

    return (
      <div>
        {renderSectionHeader('Estilos de Párrafo', 'paragraphStyles', <FileText size={14} />)}
        {expandedSections.paragraphStyles && (
          <div>
            <div style={{ padding: '8px 12px' }}>
              <button
                onClick={() => handleCreateNewStyle('paragraphStyle')}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px dashed #3b82f6',
                  borderRadius: '4px',
                  background: 'white',
                  color: '#3b82f6',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <Plus size={12} />
                Nuevo Estilo de Párrafo
              </button>
            </div>
            
            {cachedStyles.paragraphStyles.map(style => 
              renderStyleItem(style, 'paragraphStyle', style.id === currentParagraphStyleId)
            )}
          </div>
        )}
      </div>
    );
  };

  const renderBorderStyles = () => {
    const currentBorderStyleId = selectedElement?.borderStyleId;

    return (
      <div>
        {renderSectionHeader('Estilos de Borde', 'borderStyles', <Frame size={14} />)}
        {expandedSections.borderStyles && (
          <div>
            <div style={{ padding: '8px 12px' }}>
              <button
                onClick={() => handleCreateNewStyle('borderStyle')}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px dashed #3b82f6',
                  borderRadius: '4px',
                  background: 'white',
                  color: '#3b82f6',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <Plus size={12} />
                Nuevo Estilo de Borde
              </button>
            </div>
            
            {cachedStyles.borderStyles.map(style => 
              renderStyleItem(style, 'borderStyle', style.id === currentBorderStyleId)
            )}
          </div>
        )}
      </div>
    );
  };

  const renderFillStyles = () => {
    const currentFillStyleId = selectedElement?.fillStyleId;

    return (
      <div>
        {renderSectionHeader('Estilos de Relleno', 'fillStyles', <Palette size={14} />)}
        {expandedSections.fillStyles && (
          <div>
            <div style={{ padding: '8px 12px' }}>
              <button
                onClick={() => handleCreateNewStyle('fillStyle')}
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  border: '1px dashed #3b82f6',
                  borderRadius: '4px',
                  background: 'white',
                  color: '#3b82f6',
                  fontSize: '11px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
              >
                <Plus size={12} />
                Nuevo Estilo de Relleno
              </button>
            </div>
            
            {cachedStyles.fillStyles.map(style => 
              renderStyleItem(style, 'fillStyle', style.id === currentFillStyleId)
            )}
          </div>
        )}
      </div>
    );
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
          <Upload size={10} />
          Importar
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
    <div style={sidebarStyle}>
      {/* Header con tabs */}
      <div style={{
        borderBottom: '1px solid #e2e8f0',
        background: 'white'
      }}>
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <button
            onClick={() => setActiveTab('styles')}
            style={{
              flex: 1,
              padding: '10px 12px',
              border: 'none',
              background: activeTab === 'styles' ? '#eff6ff' : 'transparent',
              color: activeTab === 'styles' ? '#3b82f6' : '#6b7280',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              borderBottom: activeTab === 'styles' ? '2px solid #3b82f6' : '2px solid transparent'
            }}
          >
            Estilos
          </button>
          
          <button
            onClick={() => setActiveTab('elements')}
            style={{
              flex: 1,
              padding: '10px 12px',
              border: 'none',
              background: activeTab === 'elements' ? '#eff6ff' : 'transparent',
              color: activeTab === 'elements' ? '#3b82f6' : '#6b7280',
              fontSize: '12px',
              fontWeight: '500',
              cursor: 'pointer',
              borderBottom: activeTab === 'elements' ? '2px solid #3b82f6' : '2px solid transparent'
            }}
          >
            Elementos
          </button>
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'styles' && (
          <div>
            {renderVariablesSection()}
            {renderTextStyles()}
            {renderParagraphStyles()}
            {renderBorderStyles()}
            {renderFillStyles()}
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
      <div style={{
        padding: '12px',
        borderTop: '1px solid #e2e8f0',
        background: 'white'
      }}>
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
            style={{
              flex: 1,
              padding: '6px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              background: 'white',
              fontSize: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
            title="Exportar estilos"
          >
            <Download size={10} />
            Exportar
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
                      console.log('✅ Styles imported successfully');
                      
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
            style={{
              flex: 1,
              padding: '6px 8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              background: 'white',
              fontSize: '10px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
            title="Importar estilos"
          >
            <Upload size={10} />
            Importar
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