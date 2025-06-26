// src/components/workflow/WorkflowCanvas/WorkflowCanvas.jsx - CON RESTRICCIÓN DE UNA CONEXIÓN
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

// Define nodeTypes fuera del componente para evitar recreación
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

  // ✅ NUEVO: Calcular estadísticas de conexión
  const connectionStats = useMemo(() => {
    const connectedNodes = new Set();
    const availableForConnection = new Set();
    
    // Marcar nodos que ya tienen conexiones de entrada
    edges.forEach(edge => {
      connectedNodes.add(edge.target);
    });
    
    // Contar nodos disponibles para recibir conexiones
    nodes.forEach(node => {
      if (!connectedNodes.has(node.id)) {
        availableForConnection.add(node.id);
      }
    });
    
    return {
      totalNodes: nodes.length,
      connectedNodes: connectedNodes.size,
      availableForConnection: availableForConnection.size,
      connectionUtilization: nodes.length > 0 ? Math.round((connectedNodes.size / nodes.length) * 100) : 0
    };
  }, [nodes, edges]);

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

  // ✅ NUEVA FUNCIÓN: Validar conexión antes de crear (complemento visual)
  const isValidConnection = useMemo(() => {
    return (connection) => {
      if (!connection) return false;
      
      // No permitir auto-conexión
      if (connection.source === connection.target) {
        return false;
      }
      
      // Verificar si el target ya tiene una conexión
      const hasIncomingConnection = edges.some(edge => edge.target === connection.target);
      
      return !hasIncomingConnection;
    };
  }, [edges]);

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
        onConnect={onConnect} // ✅ Ya incluye la validación del hook
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
        // ✅ NUEVO: Configuración adicional para mejor UX con restricción de conexión
        connectionMode="loose" // Permite mejor control de conexiones
      >
        {/* Background */}
        <Background 
          color="#e2e8f0" 
          gap={20} 
          size={1}
          variant="dots"
        />
        
        {/* Controls - ✅ MOVIDOS A BOTTOM-RIGHT */}
        <Controls 
          position="bottom-right"
          style={{
            button: {
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              color: '#374151'
            }
          }}
        />
        
        {/* MiniMap - ✅ MOVIDO A BOTTOM-LEFT */}
        <MiniMap 
          position="bottom-left"
          style={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb'
          }}
          nodeColor={(node) => {
            // ✅ NUEVO: Colores diferentes para nodos conectados vs disponibles
            const hasIncomingConnection = edges.some(edge => edge.target === node.id);
            
            switch (node.data.type) {
              case 'layout-designer': 
                return hasIncomingConnection ? '#5b21b6' : '#7c3aed'; // Más oscuro si está conectado
              case 'http-input': 
                return hasIncomingConnection ? '#d97706' : '#f59e0b';
              case 'data-mapper': 
                return hasIncomingConnection ? '#0f766e' : '#14b8a6';
              case 'script-processor': 
                return hasIncomingConnection ? '#6d28d9' : '#8b5cf6';
              case 'data-transformer':
                return hasIncomingConnection ? '#7c2d12' : '#ea580c';
              default: 
                return hasIncomingConnection ? '#4b5563' : '#6b7280';
            }
          }}
        />
        
        {/* Add Nodes Panel */}
        <Panel position="top-left">
          <AddNodesPanel
            onAddNode={onAddNode}
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

        {/* ✅ NUEVO: Panel de información de conexiones */}
        <Panel position="bottom-center">
          <div style={{
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '8px 16px',
            borderRadius: '20px',
            fontSize: '12px',
            color: '#6b7280',
            border: '1px solid #e5e7eb',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              🔗 <strong>Conexiones:</strong> {edges.length}/{nodes.length}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              📊 <strong>Disponibles:</strong> {connectionStats.availableForConnection}
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              ⚡ <strong>Política:</strong> 1 entrada por nodo
            </div>
            
            {connectionStats.connectionUtilization > 0 && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '4px',
                color: connectionStats.connectionUtilization >= 80 ? '#dc2626' : '#16a34a'
              }}>
                📈 <strong>Uso:</strong> {connectionStats.connectionUtilization}%
              </div>
            )}
          </div>
        </Panel>

        {/* Status Panel para workflow vacío */}
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
                margin: '0 0 8px 0',
                fontSize: '14px',
                color: '#6b7280',
                lineHeight: '1.5'
              }}>
                Comienza agregando nodos desde el panel izquierdo o importa un workflow existente.
              </p>
              <div style={{
                fontSize: '12px',
                color: '#9ca3af',
                background: '#f3f4f6',
                padding: '8px',
                borderRadius: '4px',
                marginTop: '8px'
              }}>
                🔗 <strong>Nueva política:</strong> Cada nodo solo puede recibir una conexión de entrada
              </div>
            </div>
          </Panel>
        )}

        {/* ✅ NUEVO: Panel de ayuda para política de conexión */}
        {nodes.length > 1 && edges.length === 0 && (
          <Panel position="top-center" style={{ zIndex: 1000 }}>
            <div style={{
              background: 'rgba(59, 130, 246, 0.95)',
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
              <span>🔗</span>
              <span>Conecta los nodos: cada nodo solo puede recibir una conexión</span>
            </div>
          </Panel>
        )}

        {/* Import Success Panel mejorado */}
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
              <span>
                Workflow activo: {nodes.length} nodos, {edges.length} conexiones
                {connectionStats.availableForConnection > 0 && 
                  ` • ${connectionStats.availableForConnection} disponibles`
                }
              </span>
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  );
};

export default WorkflowCanvas;