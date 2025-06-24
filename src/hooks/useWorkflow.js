// src/hooks/useWorkflow.js
import { useState, useCallback, useEffect } from 'react';
import { addEdge, useNodesState, useEdgesState } from 'reactflow';
import { generateNodeId } from '../utils/nodeHelpers';

export const useWorkflow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflowData, setWorkflowData] = useState({});

  // Handle node properties change
  const handlePropertiesChange = useCallback((nodeId, properties) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, properties } }
          : node
      )
    );
  }, [setNodes]);

  // Add new node to workflow
  const addNode = useCallback((type) => {
    const nodeId = generateNodeId();
    const newNode = {
      id: nodeId,
      type: 'customNode',
      position: { 
        x: Math.random() * 400 + 100, 
        y: Math.random() * 300 + 100 
      },
      data: { 
        type: type,
        properties: {},
        onPropertiesChange: handlePropertiesChange,
        allNodes: nodes,
        allEdges: edges
      },
    };
    setNodes((nds) => nds.concat(newNode));
  }, [setNodes, handlePropertiesChange, nodes, edges]);

  // Handle edge connections
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Remove node from workflow
  const removeNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter(node => node.id !== nodeId));
    setEdges((eds) => eds.filter(edge => 
      edge.source !== nodeId && edge.target !== nodeId
    ));
  }, [setNodes, setEdges]);

  // Execute workflow
  const executeWorkflow = useCallback(() => {
    const processedData = {};
    nodes.forEach(node => {
      if (node.data.properties && Object.keys(node.data.properties).length > 0) {
        processedData[node.id] = node.data.properties;
      }
    });
    
    return processedData;
  }, [nodes]);

  // Import workflow from JSON data
  const importWorkflow = useCallback((workflowData) => {
    try {
      // Clear current workflow
      setNodes([]);
      setEdges([]);

      // Validate imported data structure
      if (!workflowData.nodes || !Array.isArray(workflowData.nodes)) {
        throw new Error('Datos de workflow inválidos: falta el array de nodos');
      }

      if (!workflowData.edges || !Array.isArray(workflowData.edges)) {
        throw new Error('Datos de workflow inválidos: falta el array de conexiones');
      }

      // Import nodes
      const importedNodes = workflowData.nodes.map(nodeData => ({
        id: nodeData.id,
        type: 'customNode',
        position: nodeData.position || { x: 100, y: 100 },
        data: {
          type: nodeData.type,
          properties: nodeData.properties || {},
          onPropertiesChange: handlePropertiesChange,
          allNodes: [],
          allEdges: []
        }
      }));

      // Import edges
      const importedEdges = workflowData.edges.map(edgeData => ({
        id: edgeData.id,
        source: edgeData.source,
        target: edgeData.target,
        type: 'smoothstep',
        animated: true,
        style: {
          stroke: '#3b82f6',
          strokeWidth: 2,
        }
      }));

      // Set imported data
      setNodes(importedNodes);
      setEdges(importedEdges);

      console.log('✅ Workflow importado exitosamente:', {
        nodes: importedNodes.length,
        edges: importedEdges.length
      });

      return {
        success: true,
        message: `Workflow importado: ${importedNodes.length} nodos, ${importedEdges.length} conexiones`
      };

    } catch (error) {
      console.error('❌ Error importing workflow:', error);
      return {
        success: false,
        message: `Error al importar: ${error.message}`
      };
    }
  }, [setNodes, setEdges, handlePropertiesChange]);

  // Update workflow data for export
  const updateWorkflowData = useCallback(() => {
    const workflowJson = {
      nodes: nodes.map(node => ({
        id: node.id,
        type: node.data.type,
        position: node.position,
        properties: node.data.properties
      })),
      edges: edges.map(edge => ({
        id: edge.id,
        source: edge.source,
        target: edge.target
      })),
      metadata: {
        version: '1.0',
        createdAt: new Date().toISOString(),
        totalNodes: nodes.length,
        totalEdges: edges.length
      },
      timestamp: new Date().toISOString()
    };
    setWorkflowData(workflowJson);
  }, [nodes, edges]);

  // Export workflow as JSON
  const exportWorkflow = useCallback(() => {
    const dataStr = JSON.stringify(workflowData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', `workflow-${Date.now()}.json`);
    linkElement.click();
  }, [workflowData]);

  // Clear workflow
  const clearWorkflow = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setWorkflowData({});
  }, [setNodes, setEdges]);

  // Load workflow from data (alternative to import for internal use)
  const loadWorkflow = useCallback((workflowData) => {
    try {
      const result = importWorkflow(workflowData);
      if (result.success) {
        console.log('Workflow cargado exitosamente');
      }
      return result;
    } catch (error) {
      console.error('Error loading workflow:', error);
      return {
        success: false,
        message: `Error al cargar: ${error.message}`
      };
    }
  }, [importWorkflow]);

  // Update nodes with current edges and nodes data
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          allNodes: nds,
          allEdges: edges
        }
      }))
    );
  }, [edges, setNodes]);

  // Update workflow data when nodes or edges change
  useEffect(() => {
    updateWorkflowData();
  }, [updateWorkflowData]);

  return {
    // State
    nodes,
    edges,
    workflowData,
    
    // Actions
    addNode,
    removeNode,
    executeWorkflow,
    exportWorkflow,
    importWorkflow,
    loadWorkflow,
    clearWorkflow,
    
    // ReactFlow handlers
    onNodesChange,
    onEdgesChange,
    onConnect,
    handlePropertiesChange
  };
};