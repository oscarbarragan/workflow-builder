// src/hooks/useWorkflow.js - CON ELIMINACIÓN DE EDGES HABILITADA
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

  // Remove node from workflow
  const removeNode = useCallback((nodeId) => {
    setNodes((nds) => nds.filter(node => node.id !== nodeId));
    setEdges((eds) => eds.filter(edge => 
      edge.source !== nodeId && edge.target !== nodeId
    ));
    console.log('✅ Node removed:', nodeId);
  }, [setNodes, setEdges]);

  // Duplicate node
  const duplicateNode = useCallback((nodeId) => {
    setNodes((prevNodes) => {
      const nodeToClone = prevNodes.find(node => node.id === nodeId);
      if (!nodeToClone) return prevNodes;

      if (nodeToClone.data.type === 'http-input') {
        console.log('❌ Cannot duplicate HTTP Input node - only one allowed per workflow');
        return prevNodes;
      }

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

  const hasHttpInput = useCallback((currentNodes) => {
    return currentNodes.some(node => node.data.type === 'http-input');
  }, []);

  const addNode = useCallback((type) => {
    if (type === 'http-input') {
      setNodes((currentNodes) => {
        if (hasHttpInput(currentNodes)) {
          console.log('❌ Cannot add HTTP Input - only one HTTP Input allowed per workflow');
          return currentNodes;
        }

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
            onDelete: removeNode,
            onDuplicate: duplicateNode,
            allNodes: [],
            allEdges: []
          },
        };

        console.log('✅ HTTP Input node added:', nodeId);
        return [...currentNodes, newNode];
      });
      return;
    }

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
        onDelete: removeNode,
        onDuplicate: duplicateNode,
        allNodes: [],
        allEdges: []
      },
    };
    
    setNodes((nds) => [...nds, newNode]);
    console.log('✅ Node added:', nodeId, 'Type:', type);
  }, [setNodes, handlePropertiesChange, removeNode, duplicateNode, hasHttpInput]);

  // Validar conexión antes de crearla
  const canConnect = useCallback((connection, existingEdges) => {
    const { source, target } = connection;
    
    if (source === target) {
      console.log('❌ Cannot connect node to itself');
      return false;
    }
    
    const targetNode = nodes.find(node => node.id === target);
    if (targetNode && targetNode.data.type === 'http-input') {
      console.log(`❌ HTTP Input nodes cannot receive connections. They are entry points only.`);
      return false;
    }
    
    const hasExistingConnection = existingEdges.some(edge => edge.target === target);
    
    if (hasExistingConnection) {
      console.log(`❌ Node ${target} already has an incoming connection. Only one connection per node is allowed.`);
      return false;
    }
    
    const connectionExists = existingEdges.some(edge => 
      edge.source === source && edge.target === target
    );
    
    if (connectionExists) {
      console.log('❌ Connection already exists');
      return false;
    }
    
    console.log('✅ Connection allowed');
    return true;
  }, [nodes]);

  // ✅ MODIFICADO: Handle edge connections con eliminación habilitada
  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => {
        if (!canConnect(params, eds)) {
          return eds;
        }
        
        console.log('✅ Creating new connection:', params);
        
        // ✅ EDGE CON ELIMINACIÓN HABILITADA
        const newEdge = {
          id: `edge-${params.source}-${params.target}`,
          source: params.source,
          target: params.target,
          animated: true,
          deletable: true, // ✅ PERMITE ELIMINACIÓN CON DELETE/BACKSPACE
          style: {
            stroke: '#3b82f6',
            strokeWidth: 2,
          },
          markerEnd: {
            type: 'arrowclosed',
            color: '#3b82f6',
          }
        };
        
        return addEdge(newEdge, eds);
      });
    },
    [setEdges, canConnect]
  );

  // ✅ NUEVO: Función para eliminar edge con click
  const onEdgeClick = useCallback((event, edge) => {
    if (event.ctrlKey || event.altKey) {
      if (window.confirm('¿Eliminar esta conexión?')) {
        setEdges((eds) => eds.filter((e) => e.id !== edge.id));
        console.log('🗑️ Edge deleted:', edge.id);
      }
    }
  }, [setEdges]);

  const importWorkflow = useCallback((workflowData) => {
    try {
      setNodes([]);
      setEdges([]);

      if (!workflowData.nodes || !Array.isArray(workflowData.nodes)) {
        throw new Error('Datos de workflow inválidos: falta el array de nodos');
      }

      if (!workflowData.edges || !Array.isArray(workflowData.edges)) {
        throw new Error('Datos de workflow inválidos: falta el array de conexiones');
      }

      const httpInputNodes = workflowData.nodes.filter(node => node.type === 'http-input');
      if (httpInputNodes.length > 1) {
        console.log(`⚠️ Workflow contains ${httpInputNodes.length} HTTP Input nodes, only the first one will be imported`);
        
        const firstHttpInput = httpInputNodes[0];
        workflowData.nodes = workflowData.nodes.filter(node => 
          node.type !== 'http-input' || node.id === firstHttpInput.id
        );
        
        const removedHttpInputIds = httpInputNodes.slice(1).map(node => node.id);
        workflowData.edges = workflowData.edges.filter(edge => 
          !removedHttpInputIds.includes(edge.source) && !removedHttpInputIds.includes(edge.target)
        );
      }

      const importedNodes = workflowData.nodes.map(nodeData => ({
        id: nodeData.id,
        type: 'customNode',
        position: nodeData.position || { x: 100, y: 100 },
        data: {
          type: nodeData.type,
          properties: nodeData.properties || {}
        }
      }));

      // ✅ MODIFICADO: Edges importados con eliminación habilitada
      const validEdges = [];
      const usedTargets = new Set();
      
      workflowData.edges.forEach(edgeData => {
        const targetNode = importedNodes.find(n => n.id === edgeData.target);
        if (targetNode && targetNode.data.type === 'http-input') {
          console.log(`⚠️ Skipping edge to ${edgeData.target} - HTTP Input nodes cannot receive connections`);
          return;
        }
        
        if (!usedTargets.has(edgeData.target)) {
          // ✅ EDGE IMPORTADO CON ELIMINACIÓN HABILITADA
          const importedEdge = {
            id: edgeData.id || `edge-${edgeData.source}-${edgeData.target}`,
            source: edgeData.source,
            target: edgeData.target,
            animated: true,
            deletable: true, // ✅ PERMITE ELIMINACIÓN
            style: {
              stroke: '#3b82f6',
              strokeWidth: 2,
            },
            markerEnd: {
              type: 'arrowclosed',
              color: '#3b82f6',
            }
          };
          
          validEdges.push(importedEdge);
          usedTargets.add(edgeData.target);
        } else {
          console.log(`⚠️ Skipping edge to ${edgeData.target} - node already has an incoming connection`);
        }
      });

      setNodes(importedNodes);
      setEdges(validEdges);

      const importMessage = `Workflow importado: ${importedNodes.length} nodos, ${validEdges.length} conexiones`;
      const skippedMessage = workflowData.edges.length - validEdges.length > 0 
        ? ` (${workflowData.edges.length - validEdges.length} conexiones saltadas por restricción)`
        : '';
      const httpInputMessage = httpInputNodes.length > 1 
        ? ` • ${httpInputNodes.length - 1} HTTP Input(s) adicional(es) removido(s)`
        : '';

      console.log('✅ Workflow importado exitosamente:', {
        nodes: importedNodes.length,
        edges: validEdges.length,
        skippedEdges: workflowData.edges.length - validEdges.length,
        httpInputsRemoved: Math.max(0, httpInputNodes.length - 1)
      });

      return {
        success: true,
        message: importMessage + skippedMessage + httpInputMessage
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
        version: '2.3',
        createdAt: new Date().toISOString(),
        totalNodes: nodes.length,
        totalEdges: edges.length,
        connectionPolicy: 'single-input-single-entry',
        httpInputCount: nodes.filter(n => n.data.type === 'http-input').length,
        restrictions: [
          'Only one HTTP Input allowed per workflow',
          'Only one incoming connection per node',
          'No circular dependencies'
        ]
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
    console.log('✅ Workflow cleared');
  }, [setNodes, setEdges]);

  // Load workflow from data
  const loadWorkflow = useCallback((workflowData) => {
    try {
      const result = importWorkflow(workflowData);
      if (result.success) {
        console.log('✅ Workflow cargado exitosamente');
      }
      return result;
    } catch (error) {
      console.error('❌ Error loading workflow:', error);
      return {
        success: false,
        message: `Error al cargar: ${error.message}`
      };
    }
  }, [importWorkflow]);

  const getWorkflowRestrictions = useCallback(() => {
    const currentHttpInputs = nodes.filter(n => n.data.type === 'http-input').length;
    
    return {
      httpInput: {
        current: currentHttpInputs,
        maximum: 1,
        canAddMore: currentHttpInputs === 0,
        restriction: 'Only one HTTP Input allowed per workflow'
      },
      connections: {
        policy: 'single-input',
        description: 'Each node can only receive one incoming connection'
      },
      entryPoints: {
        policy: 'single-entry',
        description: 'Workflow should have exactly one entry point (HTTP Input)'
      }
    };
  }, [nodes]);

  // Update nodes with current data
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onPropertiesChange: handlePropertiesChange,
          onDelete: removeNode,
          onDuplicate: duplicateNode,
          allNodes: nds,
          allEdges: edges
        }
      }))
    );
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
    
    // ReactFlow handlers
    onNodesChange,
    onEdgesChange,
    onConnect,
    onEdgeClick, // ✅ NUEVO: Handler para click en edges
    handlePropertiesChange,
    
    // Utilities
    canConnect,
    hasHttpInput: () => hasHttpInput(nodes),
    getWorkflowRestrictions
  };
};