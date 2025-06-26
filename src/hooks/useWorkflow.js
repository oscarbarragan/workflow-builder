// src/hooks/useWorkflow.js - CORREGIDO
import { useState, useCallback, useEffect } from 'react';
import { addEdge, useNodesState, useEdgesState } from 'reactflow';
import { generateNodeId } from '../utils/nodeHelpers';

export const useWorkflow = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  // CORREGIDO: Cambiar onEdgesState por onEdgesChange
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

  // Remove node from workflow - DECLARACIÓN ÚNICA
  const removeNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter(node => node.id !== nodeId));
    setEdges((eds) => eds.filter(edge => 
      edge.source !== nodeId && edge.target !== nodeId
    ));
    console.log('✅ Node removed:', nodeId);
  }, [setNodes, setEdges]);

  // Duplicate node - OPTIMIZED: Use functional updates
  const duplicateNode = useCallback((nodeId) => {
    setNodes((prevNodes) => {
      const nodeToClone = prevNodes.find(node => node.id === nodeId);
      if (!nodeToClone) return prevNodes;

      const newNodeId = generateNodeId();
      const newNode = {
        ...nodeToClone,
        id: newNodeId,
        position: {
          x: nodeToClone.position.x + 50,
          y: nodeToClone.position.y + 50
        },
        data: {
          ...nodeToClone.data,
          properties: {
            ...nodeToClone.data.properties,
            isAnchored: false
          }
        }
      };

      console.log('✅ Node duplicated:', newNodeId);
      return [...prevNodes, newNode];
    });
  }, [setNodes]);

  // Add new node to workflow - FIXED: Include callbacks immediately
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
        // CRITICAL: Add callbacks immediately so tooltip works
        onPropertiesChange: handlePropertiesChange,
        onDelete: removeNode,
        onDuplicate: duplicateNode,
        allNodes: [],
        allEdges: []
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes, handlePropertiesChange, removeNode, duplicateNode]);

  // Handle edge connections
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Import workflow from JSON data - OPTIMIZED
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

      // Import nodes - SIMPLIFIED: Don't add circular references in initial data
      const importedNodes = workflowData.nodes.map(nodeData => ({
        id: nodeData.id,
        type: 'customNode',
        position: nodeData.position || { x: 100, y: 100 },
        data: {
          type: nodeData.type,
          properties: nodeData.properties || {}
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
  }, [setNodes, setEdges]);

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
        version: '2.1',
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

  // Update nodes with current data - FIXED: Ensure callbacks are always present
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          // ALWAYS pass the callback functions
          onPropertiesChange: handlePropertiesChange,
          onDelete: removeNode,
          onDuplicate: duplicateNode,
          allNodes: nds,
          allEdges: edges
        }
      }))
    );
    // Only depend on edges to avoid infinite loop, but ensure callbacks are fresh
  }, [edges]);

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
    duplicateNode,
    exportWorkflow,
    importWorkflow,
    loadWorkflow,
    clearWorkflow,
    
    // ReactFlow handlers - CORREGIDO: onEdgesChange en lugar de onEdgesState
    onNodesChange,
    onEdgesChange,
    onConnect,
    handlePropertiesChange
  };
};