// src/hooks/useWorkflow.js - CORREGIDO CON RESTRICCIÓN DE UNA CONEXIÓN
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
        onDelete: removeNode,
        onDuplicate: duplicateNode,
        allNodes: [],
        allEdges: []
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes, handlePropertiesChange, removeNode, duplicateNode]);

  // ✅ NUEVA FUNCIÓN: Validar conexión antes de crearla
  const canConnect = useCallback((connection, existingEdges) => {
    const { source, target } = connection;
    
    // No permitir auto-conexión
    if (source === target) {
      console.log('❌ Cannot connect node to itself');
      return false;
    }
    
    // ✅ NUEVA RESTRICCIÓN: Los nodos HTTP Input no pueden recibir conexiones (solo enviar)
    const targetNode = nodes.find(node => node.id === target);
    if (targetNode && targetNode.data.type === 'http-input') {
      console.log(`❌ HTTP Input nodes cannot receive connections. They are entry points only.`);
      return false;
    }
    
    // ✅ RESTRICCIÓN PRINCIPAL: Verificar si el nodo target ya tiene una conexión de entrada
    const hasExistingConnection = existingEdges.some(edge => edge.target === target);
    
    if (hasExistingConnection) {
      console.log(`❌ Node ${target} already has an incoming connection. Only one connection per node is allowed.`);
      return false;
    }
    
    // Verificar si ya existe esta conexión específica
    const connectionExists = existingEdges.some(edge => 
      edge.source === source && edge.target === target
    );
    
    if (connectionExists) {
      console.log('❌ Connection already exists');
      return false;
    }
    
    console.log('✅ Connection allowed');
    return true;
  }, [nodes]); // ✅ Agregar nodes como dependencia

  // ✅ FUNCIÓN MODIFICADA: Handle edge connections con validación
  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => {
        // Validar la conexión antes de crearla
        if (!canConnect(params, eds)) {
          return eds; // No agregar la conexión si no es válida
        }
        
        console.log('✅ Creating new connection:', params);
        return addEdge(params, eds);
      });
    },
    [setEdges, canConnect]
  );

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
          properties: nodeData.properties || {}
        }
      }));

      // ✅ VALIDACIÓN DE EDGES: Filtrar edges que violen las reglas de conexión
      const validEdges = [];
      const usedTargets = new Set();
      
      workflowData.edges.forEach(edgeData => {
        // Verificar que el target no sea un HTTP Input
        const targetNode = importedNodes.find(n => n.id === edgeData.target);
        if (targetNode && targetNode.data.type === 'http-input') {
          console.log(`⚠️ Skipping edge to ${edgeData.target} - HTTP Input nodes cannot receive connections`);
          return;
        }
        
        // Solo agregar el edge si el target no ha sido usado
        if (!usedTargets.has(edgeData.target)) {
          validEdges.push({
            id: edgeData.id,
            source: edgeData.source,
            target: edgeData.target,
            type: 'smoothstep',
            animated: true,
            style: {
              stroke: '#3b82f6',
              strokeWidth: 2,
            }
          });
          usedTargets.add(edgeData.target);
        } else {
          console.log(`⚠️ Skipping edge to ${edgeData.target} - node already has an incoming connection`);
        }
      });

      // Set imported data
      setNodes(importedNodes);
      setEdges(validEdges);

      console.log('✅ Workflow importado exitosamente:', {
        nodes: importedNodes.length,
        edges: validEdges.length,
        skippedEdges: workflowData.edges.length - validEdges.length
      });

      return {
        success: true,
        message: `Workflow importado: ${importedNodes.length} nodos, ${validEdges.length} conexiones${workflowData.edges.length - validEdges.length > 0 ? ` (${workflowData.edges.length - validEdges.length} conexiones saltadas por restricción)` : ''}`
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
        version: '2.2', // Incrementar versión para indicar soporte de una conexión
        createdAt: new Date().toISOString(),
        totalNodes: nodes.length,
        totalEdges: edges.length,
        connectionPolicy: 'single-input-no-cycles' // ✅ ACTUALIZADO: Documentar política anti-ciclos
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

  // Load workflow from data
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

  // Update nodes with current data - Ensure callbacks are always present
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
    onConnect, // ✅ Ya incluye la validación de una conexión
    handlePropertiesChange,
    
    // ✅ NUEVA UTILIDAD: Exponer función de validación para uso externo si es necesario
    canConnect
  };
};