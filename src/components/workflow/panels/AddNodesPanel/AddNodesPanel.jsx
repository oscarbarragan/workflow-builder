// src/components/workflow/panels/AddNodesPanel/AddNodesPanel.jsx
import React, { useState } from 'react';
import { User, MapPin, FileText, Play, Download, Save, Upload } from 'lucide-react';
import Button from '../../../common/Button/Button';
import ImportWorkflow from '../../../common/ImportWorkflow/ImportWorkflow';
import { NODE_TYPES, STYLES } from '../../../../utils/constants';

const AddNodesPanel = ({ 
  onAddNode, 
  onExecuteWorkflow, 
  onExportWorkflow,
  onSaveWorkflow,
  onImportWorkflow,
  workflowStats = {} 
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

  const nodeButtons = [
    {
      type: NODE_TYPES.USER_FORM,
      label: 'Usuario',
      icon: <User size={16} />,
      variant: 'primary',
      description: 'Formulario de datos de usuario'
    },
    {
      type: NODE_TYPES.LOCATION_FORM,
      label: 'Ubicación',
      icon: <MapPin size={16} />,
      variant: 'success',
      description: 'Formulario de datos de ubicación'
    },
    {
      type: NODE_TYPES.LAYOUT_DESIGNER,
      label: 'Layout',
      icon: <FileText size={16} />,
      variant: 'purple',
      description: 'Diseñador de layout de documentos'
    }
  ];

  const handleSaveWorkflow = async () => {
    if (!onSaveWorkflow) return;
    
    setIsSaving(true);
    try {
      await onSaveWorkflow();
    } catch (error) {
      console.error('Error saving workflow:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImportWorkflow = (workflowData) => {
    if (onImportWorkflow) {
      onImportWorkflow(workflowData);
    }
  };

  const actionButtons = [
    {
      label: 'Ejecutar',
      icon: <Play size={16} />,
      variant: 'success',
      onClick: onExecuteWorkflow,
      description: 'Ejecutar el workflow completo'
    },
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

  const getButtonStyle = (variant) => {
    const variantStyles = {
      purple: {
        backgroundColor: '#7c3aed',
        color: 'white'
      }
    };
    
    return variantStyles[variant] || {};
  };

  return (
    <>
      <div style={{
        ...STYLES.panel,
        minWidth: '220px',
        maxWidth: '280px'
      }}>
        <h3 style={{
          margin: '0 0 16px 0',
          fontSize: '16px',
          fontWeight: '600',
          color: '#374151'
        }}>
          Workflow Builder
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
              <strong>Nodos:</strong> {workflowStats.totalNodes}
            </div>
            <div style={{ fontSize: '12px', color: '#374151', marginBottom: '4px' }}>
              <strong>Conexiones:</strong> {workflowStats.totalEdges || 0}
            </div>
            {workflowStats.nodeTypes && (
              <div style={{ fontSize: '11px', color: '#6b7280' }}>
                {Object.entries(workflowStats.nodeTypes).map(([type, count]) => (
                  <div key={type}>
                    {type}: {count}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Add Nodes Section */}
        <div style={{ marginBottom: '20px' }}>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151'
          }}>
            Agregar Nodos
          </h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {nodeButtons.map((button) => (
              <Button
                key={button.type}
                variant={button.variant}
                onClick={() => onAddNode(button.type)}
                icon={button.icon}
                iconPosition="left"
                fullWidth
                style={getButtonStyle(button.variant)}
                title={button.description}
              >
                {button.label}
              </Button>
            ))}
          </div>
        </div>

        <hr style={{
          margin: '16px 0',
          border: 'none',
          borderTop: '1px solid #e5e7eb'
        }} />

        {/* Actions Section */}
        <div>
          <h4 style={{
            margin: '0 0 12px 0',
            fontSize: '14px',
            fontWeight: '500',
            color: '#374151'
          }}>
            Acciones
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
                style={getButtonStyle(button.variant)}
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
            💡 Cómo usar:
          </div>
          <ul style={{
            fontSize: '11px',
            color: '#1e40af',
            margin: 0,
            paddingLeft: '16px'
          }}>
            <li>Agrega nodos desde los botones</li>
            <li>Conecta nodos arrastrando desde los círculos</li>
            <li>Haz clic en los nodos para configurarlos</li>
            <li><strong>Importa</strong> workflows desde JSON</li>
            <li>Ejecuta para procesar el workflow</li>
            <li><strong>Guarda</strong> para persistir en servidor</li>
          </ul>
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