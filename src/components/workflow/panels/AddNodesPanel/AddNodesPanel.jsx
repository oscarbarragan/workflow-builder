// src/components/workflow/panels/AddNodesPanel/AddNodesPanel.jsx - LIMPIO
import React, { useState } from 'react';
import { 
  FileText, 
  Globe, 
  Database, 
  Code,
  Download, 
  Save, 
  Upload 
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

  // Organizar nodos por categorías - SIN FORMULARIOS, TODAS EXPANDIDAS
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

  // ACCIONES SIN EJECUTAR
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

        {/* Node Categories - TODAS EXPANDIDAS - FIXED OVERFLOW */}
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
              {/* Category Header - SIN CLICK - FIXED OVERFLOW */}
              <div style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-start',
                padding: '8px 12px',
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#1e40af',
                marginBottom: '8px',
                boxSizing: 'border-box',
                overflow: 'hidden'
              }}>
                <span style={{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  width: '100%'
                }}>
                  {category.title}
                </span>
              </div>
              
              {/* Category Nodes - SIEMPRE VISIBLES - FIXED OVERFLOW */}
              <div style={{
                padding: '8px',
                background: '#f8fafc',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                width: '100%',
                boxSizing: 'border-box'
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
            </div>
          ))}
        </div>

        <hr style={{
          margin: '16px 0',
          border: 'none',
          borderTop: '1px solid #e5e7eb'
        }} />

        {/* Actions Section - SIN EJECUTAR - FIXED OVERFLOW */}
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
            <li><strong>Script Processor:</strong> Procesa datos con JavaScript</li>
            <li><strong>Layout Designer:</strong> Diseña la salida visual</li>
            <li>Conecta nodos arrastrando desde los círculos</li>
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
          Workflow Builder v2.1 - HTTP Input & Data Mapper
        </div>
      </div>

      {/* Import Modal */}
      <ImportWorkflow
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportWorkflow}
      />
    </>
  );
};

export default AddNodesPanel;