// src/components/workflow/WorkflowCanvas/WorkflowCanvas.jsx - CORREGIDO
import React, { useMemo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import CustomNode from '../nodes/CustomNode/CustomNode';
import AddNodesPanel from '../panels/AddNodesPanel/AddNodesPanel';
import PreviewPanel from '../panels/PreviewPanel/PreviewPanel';
import { getWorkflowStats } from '../../../utils/nodeHelpers';

// CORREGIDO: Definir nodeTypes fuera del componente para evitar recreación
const nodeTypes = {
  customNode: CustomNode,
};

const WorkflowCanvas = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onAddNode,
  onExecuteWorkflow,
  onExportWorkflow,
  onImportWorkflow,
  onSaveWorkflow,
  workflowData
}) => {
  // Get workflow statistics
  const workflowStats = useMemo(() => 
    getWorkflowStats(nodes, edges), 
    [nodes, edges]
  );

  // ReactFlow configuration
  const defaultEdgeOptions = useMemo(() => ({
    type: 'smoothstep',
    animated: true,
    style: {
      stroke: '#3b82f6',
      strokeWidth: 2,
    },
  }), []);

  const connectionLineStyle = useMemo(() => ({
    stroke: '#3b82f6',
    strokeWidth: 2,
  }), []);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      background: '#f8fafc'
    }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        connectionLineStyle={connectionLineStyle}
        fitView
        fitViewOptions={{
          padding: 0.2,
          minZoom: 0.5,
          maxZoom: 1.5,
        }}
        style={{ width: '100%', height: '100%' }}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode={['Meta', 'Ctrl']}
        panOnScroll={true}
        panOnScrollSpeed={0.5}
        zoomOnScroll={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={false}
        selectNodesOnDrag={false}
        snapToGrid={true}
        snapGrid={[15, 15]}
      >
        {/* Background */}
        <Background 
          color="#e2e8f0" 
          gap={20} 
          size={1}
          variant="dots"
        />
        
        {/* Controls */}
        <Controls 
          position="bottom-left"
          style={{
            button: {
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              color: '#374151'
            }
          }}
        />
        
        {/* MiniMap */}
        <MiniMap 
          position="bottom-right"
          style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb'
          }}
          nodeColor={(node) => {
            switch (node.data.type) {
              case 'user-form': return '#3b82f6';
              case 'location-form': return '#16a34a';
              case 'layout-designer': return '#7c3aed';
              case 'http-input': return '#f59e0b';
              case 'data-mapper': return '#14b8a6';
              default: return '#6b7280';
            }
          }}
        />
        
        {/* Add Nodes Panel */}
        <Panel position="top-left">
          <AddNodesPanel
            onAddNode={onAddNode}
            onExecuteWorkflow={onExecuteWorkflow}
            onExportWorkflow={onExportWorkflow}
            onImportWorkflow={onImportWorkflow}
            onSaveWorkflow={onSaveWorkflow}
            workflowStats={workflowStats}
          />
        </Panel>

        {/* Preview Panel */}
        <Panel position="top-right">
          <PreviewPanel workflowData={workflowData} />
        </Panel>

        {/* Status Panel */}
        {nodes.length === 0 && (
          <Panel position="top-center">
            <div style={{
              background: 'white',
              padding: '16px 24px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              border: '1px solid #e5e7eb',
              textAlign: 'center',
              maxWidth: '400px'
            }}>
              <div style={{
                fontSize: '24px',
                marginBottom: '8px'
              }}>
                🚀
              </div>
              <h3 style={{
                margin: '0 0 8px 0',
                fontSize: '16px',
                fontWeight: '600',
                color: '#374151'
              }}>
                ¡Bienvenido al Workflow Builder!
              </h3>
              <p style={{
                margin: 0,
                fontSize: '14px',
                color: '#6b7280',
                lineHeight: '1.5'
              }}>
                Comienza agregando nodos desde el panel izquierdo o importa un workflow existente.
              </p>
            </div>
          </Panel>
        )}

        {/* Help Panel */}
        <Panel position="bottom-center">
          <div style={{
            background: 'rgba(255, 255, 255, 0.9)',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            color: '#6b7280',
            border: '1px solid #e5e7eb',
            backdropFilter: 'blur(4px)'
          }}>
            💡 <strong>Atajos:</strong> Seleccionar múltiple (Ctrl/Cmd), Eliminar (Del/Backspace), Zoom (rueda del mouse)
          </div>
        </Panel>

        {/* Import Success Panel */}
        {nodes.length > 0 && edges.length > 0 && (
          <Panel position="top-center" style={{ zIndex: 1000 }}>
            <div style={{
              background: 'rgba(34, 197, 94, 0.95)',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <span>✅</span>
              <span>Workflow activo: {nodes.length} nodos, {edges.length} conexiones</span>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;