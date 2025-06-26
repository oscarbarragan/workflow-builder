// src/components/workflow/panels/AddNodesPanel/AddNodesPanel.jsx - CON GRUPOS COLAPSABLES
import React, { useState } from 'react';
import { 
  FileText, 
  Globe, 
  Database, 
  Code,
  Zap,
  Download, 
  Save, 
  Upload,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import Button from '../../../common/Button/Button';
import ImportWorkflow from '../../../common/ImportWorkflow/ImportWorkflow';
import { NODE_TYPES, STYLES, NODE_CATEGORIES } from '../../../../utils/constants';

const AddNodesPanel = ({ 
  onAddNode, 
  onExportWorkflow,
  onSaveWorkflow,
  onImportWorkflow,
  workflowStats = {} 
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  
  // ✅ NUEVO: Estado para controlar qué grupos están expandidos
  const [expandedCategories, setExpandedCategories] = useState({
    input: true,      // Por defecto expandido
    processing: true, // Por defecto expandido
    output: true      // Por defecto expandido
  });

  // ✅ NUEVA FUNCIÓN: Toggle expansión de categorías
  const toggleCategory = (categoryKey) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }));
  };

  // ✅ NUEVA FUNCIÓN: Expandir/colapsar todas las categorías
  const toggleAllCategories = (expanded) => {
    setExpandedCategories({
      input: expanded,
      processing: expanded,
      output: expanded
    });
  };

  // Organizar nodos por categorías
  const nodeCategories = {
    input: {
      title: '📥 Entrada de Datos',
      nodes: [
        {
          type: NODE_TYPES.HTTP_INPUT,
          label: 'HTTP Input',
          icon: <Globe size={16} />,
          variant: 'warning',
          description: 'Configura un endpoint HTTP para recibir datos'
        }
      ]
    },
    processing: {
      title: '⚙️ Procesamiento',
      nodes: [
        {
          type: NODE_TYPES.DATA_MAPPER,
          label: 'Data Mapper',
          icon: <Database size={16} />,
          variant: 'info',
          description: 'Mapea estructura JSON a variables internas'
        },
        {
          type: NODE_TYPES.DATA_TRANSFORMER,
          label: 'Data Transformer',
          icon: <Zap size={16} />,
          variant: 'purple',
          description: 'Aplica transformaciones basadas en tipos de datos'
        },
        {
          type: NODE_TYPES.SCRIPT_PROCESSOR,
          label: 'Script Processor',
          icon: <Code size={16} />,
          variant: 'purple',
          description: 'Ejecuta scripts JavaScript sobre los datos'
        }
      ]
    },
    output: {
      title: '📤 Salida',
      nodes: [
        {
          type: NODE_TYPES.LAYOUT_DESIGNER,
          label: 'Layout Designer',
          icon: <FileText size={16} />,
          variant: 'purple',
          description: 'Diseñador de layout de documentos'
        }
      ]
    }
  };

  // Acciones del workflow
  const actionButtons = [
    {
      label: 'Importar',
      icon: <Upload size={16} />,
      variant: 'secondary',
      onClick: () => setIsImportModalOpen(true),
      description: 'Importar workflow desde JSON'
    },
    {
      label: 'Exportar',
      icon: <Download size={16} />,
      variant: 'danger',
      onClick: onExportWorkflow,
      description: 'Exportar workflow como JSON'
    },
    {
      label: 'Guardar',
      icon: <Save size={16} />,
      variant: 'primary',
      onClick: handleSaveWorkflow,
      loading: isSaving,
      disabled: isSaving,
      description: 'Guardar workflow en servidor'
    }
  ];

  async function handleSaveWorkflow() {
    if (!onSaveWorkflow) return;
    
    setIsSaving(true);
    try {
      await onSaveWorkflow();
    } catch (error) {
      console.error('Error saving workflow:', error);
    } finally {
      setIsSaving(false);
    }
  }

  const handleImportWorkflow = (workflowData) => {
    if (onImportWorkflow) {
      onImportWorkflow(workflowData);
    }
  };

  const getButtonStyle = (variant) => {
    const variantStyles = {
      purple: {
        backgroundColor: '#7c3aed',
        color: 'white'
      },
      info: {
        backgroundColor: '#14b8a6',
        color: 'white'
      },
      warning: {
        backgroundColor: '#f59e0b',
        color: 'white'
      }
    };
    
    return variantStyles[variant] || {};
  };

  // ✅ NUEVA FUNCIÓN: Contar categorías expandidas
  const expandedCount = Object.values(expandedCategories).filter(Boolean).length;
  const totalCategories = Object.keys(expandedCategories).length;

  return (
    <>
      <div style={{
        ...STYLES.panel,
        minWidth: '240px',
        maxWidth: '300px',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '16px',
          fontWeight: '600',
          color: '#374151',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          🚀 Workflow Builder
        </h3>

        {/* ✅ NUEVO: Controles de expansión */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px',
          padding: '6px 8px',
          background: '#f8fafc',
          borderRadius: '6px',
          border: '1px solid #e2e8f0'
        }}>
          <span style={{
            fontSize: '12px',
            color: '#64748b',
            fontWeight: '500'
          }}>
            Categorías ({expandedCount}/{totalCategories})
          </span>
          
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              onClick={() => toggleAllCategories(true)}
              disabled={expandedCount === totalCategories}
              style={{
                background: 'none',
                border: 'none',
                cursor: expandedCount === totalCategories ? 'not-allowed' : 'pointer',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '10px',
                color: expandedCount === totalCategories ? '#9ca3af' : '#3b82f6',
                fontWeight: '500'
              }}
              title="Expandir todas"
            >
              Expandir
            </button>
            
            <button
              onClick={() => toggleAllCategories(false)}
              disabled={expandedCount === 0}
              style={{
                background: 'none',
                border: 'none',
                cursor: expandedCount === 0 ? 'not-allowed' : 'pointer',
                padding: '2px 6px',
                borderRadius: '4px',
                fontSize: '10px',
                color: expandedCount === 0 ? '#9ca3af' : '#3b82f6',
                fontWeight: '500'
              }}
              title="Colapsar todas"
            >
              Colapsar
            </button>
          </div>
        </div>

        {/* Statistics */}
        {workflowStats.totalNodes > 0 && (
          <div style={{
            background: '#f3f4f6',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '12px', color: '#374151', marginBottom: '4px' }}>
              <strong>📊 Estadísticas:</strong>
            </div>
            <div style={{ fontSize: '12px', color: '#374151', marginBottom: '4px' }}>
              <strong>Nodos:</strong> {workflowStats.totalNodes}
            </div>
            <div style={{ fontSize: '12px', color: '#374151', marginBottom: '4px' }}>
              <strong>Conexiones:</strong> {workflowStats.totalEdges || 0}
            </div>
            {workflowStats.nodeTypes && (
              <div style={{ fontSize: '11px', color: '#6b7280', marginTop: '8px' }}>
                <strong>Por tipo:</strong>
                {Object.entries(workflowStats.nodeTypes).map(([type, count]) => (
                  <div key={type} style={{ marginLeft: '8px' }}>
                    • {type}: {count}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ✅ MODIFICADO: Node Categories con función de colapso */}
        <div style={{ 
          marginBottom: '20px',
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            Agregar Nodos
          </h4>
          
          {Object.entries(nodeCategories).map(([categoryKey, category]) => (
            <div key={categoryKey} style={{ 
              marginBottom: '12px',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              {/* ✅ MODIFICADO: Category Header CON CLICK para colapsar */}
              <button
                onClick={() => toggleCategory(categoryKey)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '600',
                  color: '#1e40af',
                  marginBottom: '8px',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#dbeafe';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#eff6ff';
                }}
              >
                <span style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  flex: 1,
                  textAlign: 'left'
                }}>
                  {category.title}
                </span>
                
                {/* ✅ NUEVO: Icono de expansión */}
                {expandedCategories[categoryKey] ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
              
              {/* ✅ MODIFICADO: Category Nodes - CONDICIONAL basado en expansión */}
              {expandedCategories[categoryKey] && (
                <div style={{
                  padding: '8px',
                  background: '#f8fafc',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  width: '100%',
                  boxSizing: 'border-box',
                  // ✅ NUEVO: Animación suave de entrada
                  animation: 'slideDown 0.2s ease-out',
                  overflow: 'hidden'
                }}>
                  {category.nodes.map((node) => (
                    <Button
                      key={node.type}
                      variant={node.variant}
                      onClick={() => onAddNode(node.type)}
                      icon={node.icon}
                      iconPosition="left"
                      fullWidth
                      style={{
                        ...getButtonStyle(node.variant),
                        marginBottom: '6px',
                        fontSize: '13px',
                        width: '100%',
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                      title={node.description}
                    >
                      {node.label}
                    </Button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <hr style={{
          margin: '16px 0',
          border: 'none',
          borderTop: '1px solid #e5e7eb'
        }} />

        {/* Actions Section */}
        <div style={{
          width: '100%',
          boxSizing: 'border-box'
        }}>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            ⚡ Acciones
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {actionButtons.map((button, index) => (
              <Button
                key={index}
                variant={button.variant}
                onClick={button.onClick}
                icon={button.icon}
                iconPosition="left"
                fullWidth
                loading={button.loading}
                disabled={button.disabled}
                title={button.description}
                style={{
                  ...getButtonStyle(button.variant),
                  width: '100%',
                  boxSizing: 'border-box',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {button.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Status de guardado */}
        {isSaving && (
          <div style={{
            marginTop: '12px',
            padding: '8px 12px',
            background: '#eff6ff',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#1e40af',
            textAlign: 'center',
            border: '1px solid #bfdbfe'
          }}>
            💾 Guardando workflow...
          </div>
        )}

        {/* Quick Stats */}
        {workflowStats.totalNodes > 0 && (
          <div style={{
            marginTop: '16px',
            padding: '10px',
            background: '#f0fdf4',
            borderRadius: '6px',
            border: '1px solid #bbf7d0'
          }}>
            <div style={{
              fontSize: '11px',
              color: '#15803d',
              fontWeight: '500',
              marginBottom: '4px'
            }}>
              🎯 Estado del Workflow:
            </div>
            <div style={{ fontSize: '10px', color: '#166534' }}>
              • Puntos de entrada: {workflowStats.entryNodes || 0}
            </div>
            <div style={{ fontSize: '10px', color: '#166534' }}>
              • Puntos de salida: {workflowStats.exitNodes || 0}
            </div>
            <div style={{ fontSize: '10px', color: '#166534' }}>
              • Profundidad máxima: {workflowStats.maxDepth || 0}
            </div>
          </div>
        )}

        {/* Help Section */}
        <div style={{
          marginTop: '20px',
          padding: '12px',
          background: '#eff6ff',
          borderRadius: '6px',
          border: '1px solid #bfdbfe'
        }}>
          <div style={{
            fontSize: '12px',
            color: '#1e40af',
            fontWeight: '500',
            marginBottom: '6px'
          }}>
            💡 Guía rápida:
          </div>
          <ul style={{
            fontSize: '11px',
            color: '#1e40af',
            margin: 0,
            paddingLeft: '16px'
          }}>
            <li><strong>HTTP Input:</strong> Crea endpoints para recibir datos</li>
            <li><strong>Data Mapper:</strong> Mapea JSON a variables internas</li>
            <li><strong>Data Transformer:</strong> Transforma datos por tipo</li>
            <li><strong>Script Processor:</strong> Procesa datos con JavaScript</li>
            <li><strong>Layout Designer:</strong> Diseña la salida visual</li>
            <li>🔗 <strong>Conexiones:</strong> Solo UNA entrada por nodo</li>
            <li>Haz clic en los nodos para configurarlos</li>
          </ul>
        </div>

        {/* Version Info */}
        <div style={{
          marginTop: '12px',
          textAlign: 'center',
          fontSize: '10px',
          color: '#9ca3af'
        }}>
          Workflow Builder v2.3 - Single Connection Edition
        </div>
      </div>

      {/* Import Modal */}
      <ImportWorkflow
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportWorkflow}
      />

      {/* ✅ NUEVO: CSS para animaciones suaves */}
      <style>
        {`
          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
              max-height: 0;
            }
            to {
              opacity: 1;
              transform: translateY(0);
              max-height: 200px;
            }
          }
        `}
      </style>
    </>
  );
};

export default AddNodesPanel;