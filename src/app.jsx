// src/App.jsx - SIN EJECUTAR
import React from 'react';
import WorkflowCanvas from './components/workflow/WorkflowCanvas/WorkflowCanvas';
import { useWorkflow } from './hooks/useWorkflow';

function App() {
  const {
    nodes,
    edges,
    workflowData,
    addNode,
    exportWorkflow,
    importWorkflow,
    onNodesChange,
    onEdgesChange,
    onConnect
  } = useWorkflow();

  const handleImportWorkflow = (workflowData) => {
    console.log('📥 Importing workflow from UI...');
    console.log('🔍 Workflow data to import:', workflowData);
    
    const result = importWorkflow(workflowData);
    
    if (result.success) {
      alert(`✅ ${result.message}`);
      console.log('✅ Workflow imported successfully');
    } else {
      alert(`❌ ${result.message}`);
      console.error('❌ Failed to import workflow');
    }
  };

  const handleSaveWorkflow = async () => {
    try {
      console.log('💾 Saving workflow to server...');
      console.log('🔍 Current nodes:', nodes);
      console.log('🔍 Current workflowData:', workflowData);
      
      // Preparar el JSON completo del workflow incluyendo layouts
      const completeWorkflowData = {
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.data.type,
          position: node.position,
          properties: node.data.properties || {}
        })),
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target
        })),
        metadata: {
          version: '2.1',
          createdAt: new Date().toISOString(),
          totalNodes: nodes.length,
          totalEdges: edges.length
        },
        timestamp: new Date().toISOString()
      };

      console.log('📤 Sending complete workflow data:', completeWorkflowData);

      const response = await fetch('http://localhost/api/saveworkflow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(completeWorkflowData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Workflow saved successfully:', result);
      
      // Mostrar mensaje de éxito
      alert(`✅ Workflow guardado exitosamente!\n\nNodos: ${completeWorkflowData.nodes.length}\nConexiones: ${completeWorkflowData.edges.length}\nFecha: ${new Date().toLocaleString()}`);
      
    } catch (error) {
      console.error('❌ Error saving workflow:', error);
      
      // Mostrar error al usuario
      alert(`❌ Error al guardar workflow:\n\n${error.message}\n\nVerifica que el servidor esté ejecutándose en http://localhost/api/saveworkflow`);
    }
  };

  return (
    <WorkflowCanvas
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      onAddNode={addNode}
      onExportWorkflow={exportWorkflow}
      onImportWorkflow={handleImportWorkflow}
      onSaveWorkflow={handleSaveWorkflow}
      workflowData={workflowData}
    />
  );
}

export default App;