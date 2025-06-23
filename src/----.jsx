import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, {
  addEdge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Panel,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { User, MapPin, Download, X, FileText, Play } from 'lucide-react';

// Layout Designer Mejorado con arrastre
const LayoutDesigner = ({ isOpen, onClose, onSave, initialData, availableData }) => {
  const [elements, setElements] = useState(initialData?.elements || []);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const addElement = (type) => {
    const newElement = {
      id: Date.now(),
      type,
      x: Math.random() * 400 + 50,
      y: Math.random() * 200 + 50,
      text: type === 'text' ? 'Nuevo Texto' : '',
      variable: type === 'variable' ? Object.keys(availableData || {})[0] || 'variable' : '',
      width: type === 'rectangle' ? 100 : 0,
      height: type === 'rectangle' ? 50 : 0,
      fontSize: 14
    };
    setElements(prev => [...prev, newElement]);
    setSelectedElement(newElement);
  };


  const handleMouseDown = (e, element) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedElement(element);
    setIsDragging(true);
    
    // Obtener la posición relativa al canvas directamente
    const canvas = e.currentTarget.closest('[data-canvas="true"]');
    const canvasRect = canvas.getBoundingClientRect();
    
    setDragOffset({
      x: e.clientX - canvasRect.left - element.x,
      y: e.clientY - canvasRect.top - element.y
    });
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDragging || !selectedElement) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const canvasRect = e.currentTarget.getBoundingClientRect();
    const newX = Math.max(0, Math.min(canvasRect.width - 100, e.clientX - canvasRect.left - dragOffset.x));
    const newY = Math.max(0, Math.min(canvasRect.height - 50, e.clientY - canvasRect.top - dragOffset.y));
    
    setElements(prev => prev.map(el =>
      el.id === selectedElement.id ? { ...el, x: newX, y: newY } : el
    ));
    setSelectedElement(prev => ({ ...prev, x: newX, y: newY }));
  };

  const handleCanvasMouseUp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };


  // Eliminar los manejadores de mouse antiguos
  const handleMouseMove = () => {};
  const handleMouseUp = () => {};

  const updateSelectedElement = (field, value) => {
    if (!selectedElement) return;
    
    setElements(prev => prev.map(el =>
      el.id === selectedElement.id 
        ? { ...el, [field]: value }
        : el
    ));
    
    setSelectedElement(prev => ({ ...prev, [field]: value }));
  };

  const deleteSelected = () => {
    if (!selectedElement) return;
    setElements(prev => prev.filter(el => el.id !== selectedElement.id));
    setSelectedElement(null);
  };

  const handleSave = () => {
    onSave({ elements });
    onClose();
  };

  if (!isOpen) return null;

  const modalStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  };

  const designerStyle = {
    background: 'white',
    borderRadius: '8px',
    padding: '20px',
    width: '95vw',
    height: '90vh',
    maxWidth: '1400px',
    display: 'flex',
    flexDirection: 'column'
  };

  return (
    <div style={modalStyle}>
      <div 
        style={designerStyle}
        onMouseDown={(e) => e.stopPropagation()}
        onDragStart={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
          <h2 style={{margin: 0, fontSize: '20px'}}>Diseñador de Layout</h2>
          <button onClick={onClose} style={{background: 'none', border: 'none', cursor: 'pointer'}}>
            <X size={24} />
          </button>
        </div>

        {/* Toolbar */}
        <div style={{display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap'}}>
          <button 
            onClick={() => addElement('text')}
            style={{
              padding: '10px 16px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              background: '#3b82f6',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            📝 Agregar Texto
          </button>
          <button 
            onClick={() => addElement('rectangle')}
            style={{
              padding: '10px 16px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              background: '#16a34a',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            ▭ Agregar Rectángulo
          </button>
          <button 
            onClick={() => addElement('variable')}
            style={{
              padding: '10px 16px',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              background: '#7c3aed',
              color: 'white',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            🔗 Agregar Variable
          </button>
          {selectedElement && (
            <button 
              onClick={deleteSelected}
              style={{
                padding: '10px 16px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                background: '#dc2626',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500'
              }}
            >
              🗑️ Eliminar Seleccionado
            </button>
          )}
        </div>

        {/* Content Area */}
        <div style={{display: 'flex', flex: 1, gap: '24px', minHeight: 0}}>
          {/* Canvas - Área principal más grande */}
          <div style={{
            flex: '1 1 70%',
            minWidth: '500px',
            border: '3px solid #3b82f6',
            borderRadius: '8px',
            background: 'white',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          }}>
            <div 
              data-canvas="true"
              style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                background: 'repeating-linear-gradient(0deg, transparent, transparent 19px, #e5e7eb 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, #e5e7eb 20px)',
                backgroundSize: '20px 20px'
              }}
              onMouseMove={handleCanvasMouseMove}
              onMouseUp={handleCanvasMouseUp}
              onClick={(e) => {
                e.stopPropagation();
                if (e.target === e.currentTarget) {
                  setSelectedElement(null);
                }
              }}
            >
              {/* Indicador del área de trabajo */}
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px dashed #3b82f6',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '12px',
                color: '#3b82f6',
                fontWeight: '500',
                pointerEvents: 'none'
              }}>
                📄 Área de Diseño - Haz clic y arrastra elementos aquí
              </div>
              {elements.map(element => (
                <div
                  key={element.id}
                  onMouseDown={(e) => handleMouseDown(e, element)}
                  style={{
                    position: 'absolute',
                    left: element.x,
                    top: element.y,
                    padding: element.type === 'rectangle' ? '0' : '4px 8px',
                    background: element.type === 'variable' ? '#e0f2fe' : 
                               element.type === 'rectangle' ? 'transparent' : 
                               selectedElement?.id === element.id ? '#fef3c7' : 'transparent',
                    border: element.type === 'rectangle' ? '2px solid #000' : 
                           selectedElement?.id === element.id ? '2px dashed #3b82f6' : '1px solid transparent',
                    width: element.type === 'rectangle' ? element.width : 'auto',
                    height: element.type === 'rectangle' ? element.height : 'auto',
                    minWidth: element.type === 'rectangle' ? element.width : 'auto',
                    minHeight: element.type === 'rectangle' ? element.height : 'auto',
                    color: element.type === 'variable' ? '#2563eb' : '#000',
                    fontSize: element.fontSize || 14,
                    cursor: isDragging && selectedElement?.id === element.id ? 'grabbing' : 'grab',
                    userSelect: 'none',
                    borderRadius: element.type === 'variable' ? '4px' : '0',
                    boxShadow: selectedElement?.id === element.id ? '0 4px 8px rgba(59, 130, 246, 0.3)' : 'none',
                    zIndex: selectedElement?.id === element.id ? 10 : 1
                  }}
                >
                  {element.type === 'text' && (element.text || 'Nuevo Texto')}
                  {element.type === 'variable' && `{{${element.variable || 'variable'}}}`}
                  {element.type === 'rectangle' && ''}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar de propiedades - Más compacto */}
          <div style={{
            flex: '0 0 280px',
            width: '280px',
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            padding: '16px',
            overflowY: 'auto'
          }}>
            <h3 style={{margin: '0 0 16px 0', fontSize: '16px', color: '#374151'}}>
              Propiedades
            </h3>
            
            {selectedElement ? (
              <div>
                <div style={{marginBottom: '12px'}}>
                  <label style={{display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px', color: '#374151'}}>
                    Tipo: {selectedElement.type}
                  </label>
                </div>
                
                <div style={{marginBottom: '12px'}}>
                  <label style={{display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px', color: '#374151'}}>
                    Posición X
                  </label>
                  <input
                    type="number"
                    value={Math.round(selectedElement.x)}
                    onChange={(e) => updateSelectedElement('x', parseInt(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '12px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                
                <div style={{marginBottom: '12px'}}>
                  <label style={{display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px', color: '#374151'}}>
                    Posición Y
                  </label>
                  <input
                    type="number"
                    value={Math.round(selectedElement.y)}
                    onChange={(e) => updateSelectedElement('y', parseInt(e.target.value) || 0)}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '12px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {selectedElement.type === 'text' && (
                  <>
                    <div style={{marginBottom: '12px'}}>
                      <label style={{display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px', color: '#374151'}}>
                        Texto
                      </label>
                      <input
                        type="text"
                        value={selectedElement.text || ''}
                        onChange={(e) => updateSelectedElement('text', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '12px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div style={{marginBottom: '12px'}}>
                      <label style={{display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px', color: '#374151'}}>
                        Tamaño de Fuente
                      </label>
                      <input
                        type="number"
                        value={selectedElement.fontSize || 14}
                        onChange={(e) => updateSelectedElement('fontSize', parseInt(e.target.value) || 14)}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '12px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </>
                )}
                
                {selectedElement.type === 'variable' && (
                  <div style={{marginBottom: '12px'}}>
                    <label style={{display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px', color: '#374151'}}>
                      Variable
                    </label>
                    <select
                      value={selectedElement.variable || ''}
                      onChange={(e) => updateSelectedElement('variable', e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                    >
                      {Object.keys(availableData || {}).map(key => (
                        <option key={key} value={key}>{key}</option>
                      ))}
                    </select>
                  </div>
                )}

                {selectedElement.type === 'rectangle' && (
                  <>
                    <div style={{marginBottom: '12px'}}>
                      <label style={{display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px', color: '#374151'}}>
                        Ancho
                      </label>
                      <input
                        type="number"
                        value={selectedElement.width || 100}
                        onChange={(e) => updateSelectedElement('width', parseInt(e.target.value) || 100)}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '12px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                    <div style={{marginBottom: '12px'}}>
                      <label style={{display: 'block', fontSize: '12px', fontWeight: '500', marginBottom: '4px', color: '#374151'}}>
                        Alto
                      </label>
                      <input
                        type="number"
                        value={selectedElement.height || 50}
                        onChange={(e) => updateSelectedElement('height', parseInt(e.target.value) || 50)}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '12px',
                          boxSizing: 'border-box'
                        }}
                      />
                    </div>
                  </>
                )}
              </div>
            ) : (
              <p style={{fontSize: '12px', color: '#6b7280'}}>
                Haz clic en un elemento para editarlo
              </p>
            )}

            {/* Variables disponibles */}
            {availableData && Object.keys(availableData).length > 0 && (
              <div style={{marginTop: '24px'}}>
                <h4 style={{margin: '0 0 12px 0', fontSize: '14px', color: '#374151'}}>
                  Variables Disponibles
                </h4>
                {Object.entries(availableData).map(([key, value]) => (
                  <div key={key} style={{
                    fontSize: '11px',
                    padding: '4px 8px',
                    background: '#e0f2fe',
                    marginBottom: '4px',
                    borderRadius: '4px',
                    border: '1px solid #b3e5fc'
                  }}>
                    <strong>{key}:</strong> {value}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px'}}>
          <div style={{fontSize: '14px', color: '#6b7280'}}>
            <strong>Elementos:</strong> {elements.length}
            {selectedElement && (
              <span style={{marginLeft: '20px', color: '#3b82f6'}}>
                Seleccionado: {selectedElement.type}
              </span>
            )}
          </div>
          <div style={{display: 'flex', gap: '10px'}}>
            <button 
              onClick={onClose}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: '#e5e7eb',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancelar
            </button>
            <button 
              onClick={handleSave}
              style={{
                padding: '10px 20px',
                border: 'none',
                background: '#3b82f6',
                color: 'white',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Guardar Layout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para mostrar datos disponibles
const DataFlow = ({ nodeId, nodes, edges }) => {
  const getAvailableData = () => {
    const availableData = {};
    const incomingEdges = edges.filter(edge => edge.target === nodeId);
    
    incomingEdges.forEach(edge => {
      const sourceNode = nodes.find(node => node.id === edge.source);
      if (sourceNode && sourceNode.data.properties) {
        Object.keys(sourceNode.data.properties).forEach(key => {
          availableData[`${sourceNode.data.type}.${key}`] = sourceNode.data.properties[key];
        });
      }
    });
    
    return availableData;
  };

  const availableData = getAvailableData();
  
  if (Object.keys(availableData).length === 0) {
    return (
      <div style={{fontSize: '11px', color: '#6b7280', marginTop: '8px'}}>
        Sin datos de entrada
      </div>
    );
  }

  return (
    <div style={{marginTop: '8px'}}>
      <div style={{fontSize: '11px', fontWeight: '500', color: '#374151', marginBottom: '4px'}}>
        Datos disponibles:
      </div>
      {Object.entries(availableData).map(([key, value]) => (
        <div key={key} style={{fontSize: '10px', color: '#16a34a', padding: '2px 0'}}>
          {key}: {value}
        </div>
      ))}
    </div>
  );
};

// Componente de nodo personalizado
const CustomNode = ({ id, data, selected }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLayoutDesignerOpen, setIsLayoutDesignerOpen] = useState(false);
  const [formData, setFormData] = useState(data.properties || {});

  const handleNodeClick = () => {
    if (data.type === 'layout-designer') {
      setIsLayoutDesignerOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleSave = () => {
    data.onPropertiesChange(id, formData);
    setIsModalOpen(false);
  };

  const handleLayoutSave = (layoutData) => {
    data.onPropertiesChange(id, { ...formData, layout: layoutData });
  };

  const getAvailableDataForLayout = () => {
    const availableData = {};
    const incomingEdges = (data.allEdges || []).filter(edge => edge.target === id);
    
    incomingEdges.forEach(edge => {
      const sourceNode = (data.allNodes || []).find(node => node.id === edge.source);
      if (sourceNode && sourceNode.data.properties) {
        Object.keys(sourceNode.data.properties).forEach(key => {
          availableData[`${sourceNode.data.type}.${key}`] = sourceNode.data.properties[key];
        });
      }
    });
    
    return availableData;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getIcon = () => {
    switch (data.type) {
      case 'user-form':
        return <User size={16} color="#2563eb" />;
      case 'location-form':
        return <MapPin size={16} color="#16a34a" />;
      case 'layout-designer':
        return <FileText size={16} color="#7c3aed" />;
      default:
        return <div style={{width: 16, height: 16, background: '#ccc', borderRadius: '4px'}} />;
    }
  };

  const getTitle = () => {
    switch (data.type) {
      case 'user-form':
        return 'Formulario Usuario';
      case 'location-form':
        return 'Formulario Ubicación';
      case 'layout-designer':
        return 'Diseñador Layout';
      default:
        return 'Nodo';
    }
  };

  const nodeStyle = {
    background: 'white',
    border: `2px solid ${selected ? '#3b82f6' : '#e5e7eb'}`,
    borderRadius: '6px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
    minWidth: '100px',
    padding: '8px',
    transition: 'all 0.2s'
  };

  const contentStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px'
  };

  const iconStyle = {
    padding: '4px',
    background: 'white',
    borderRadius: '50%',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };

  const titleStyle = {
    fontWeight: '600',
    color: '#374151',
    fontSize: '10px',
    textAlign: 'center',
    lineHeight: '1.2'
  };

  const statusStyle = {
    fontSize: '8px',
    color: '#16a34a',
    marginTop: '1px'
  };

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        style={{
          width: '8px',
          height: '8px',
          background: '#6b7280',
          border: '1px solid white'
        }}
      />
      
      <div onClick={handleNodeClick} style={nodeStyle}>
        <div style={contentStyle}>
          <div style={iconStyle}>
            {getIcon()}
          </div>
          <div>
            <div style={titleStyle}>
              {getTitle()}
            </div>
            {data.properties && Object.keys(data.properties).length > 0 && (
              <div style={statusStyle}>
                ✓ Configurado
              </div>
            )}
          </div>
          
          <DataFlow nodeId={id} nodes={data.allNodes || []} edges={data.allEdges || []} />
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{
          width: '8px',
          height: '8px',
          background: '#6b7280',
          border: '1px solid white'
        }}
      />

      {/* Modal de configuración */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '6px',
            padding: '16px',
            width: '280px',
            maxWidth: '90vw',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
              <h3 style={{margin: 0, fontSize: '14px', fontWeight: '600', color: '#374151'}}>
                Configurar {getTitle()}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                style={{background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', padding: '4px'}}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{marginBottom: '16px'}}>
              {data.type === 'user-form' && (
                <div style={{marginBottom: '12px'}}>
                  <label style={{display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151', fontSize: '12px'}}>
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.nombre || ''}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    placeholder="Ingresa el nombre"
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '4px',
                      fontSize: '12px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              )}

              {data.type === 'location-form' && (
                <>
                  <div style={{marginBottom: '12px'}}>
                    <label style={{display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151', fontSize: '12px'}}>
                      Apellido
                    </label>
                    <input
                      type="text"
                      value={formData.apellido || ''}
                      onChange={(e) => handleInputChange('apellido', e.target.value)}
                      placeholder="Ingresa el apellido"
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                  <div style={{marginBottom: '12px'}}>
                    <label style={{display: 'block', marginBottom: '4px', fontWeight: '500', color: '#374151', fontSize: '12px'}}>
                      Ciudad
                    </label>
                    <input
                      type="text"
                      value={formData.ciudad || ''}
                      onChange={(e) => handleInputChange('ciudad', e.target.value)}
                      placeholder="Ingresa la ciudad"
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '12px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </>
              )}
            </div>

            <div style={{display: 'flex', justifyContent: 'flex-end'}}>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  marginRight: '6px',
                  background: '#e5e7eb',
                  color: '#374151'
                }}
              >
                Cancelar
              </button>
              <button 
                onClick={handleSave}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  background: '#3b82f6',
                  color: 'white'
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Layout Designer */}
      <LayoutDesigner
        isOpen={isLayoutDesignerOpen}
        onClose={() => setIsLayoutDesignerOpen(false)}
        onSave={handleLayoutSave}
        initialData={data.properties?.layout}
        availableData={getAvailableDataForLayout()}
      />
    </>
  );
};

// Componente principal
function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [workflowData, setWorkflowData] = useState({});

  const handlePropertiesChange = useCallback((nodeId, properties) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, properties } }
          : node
      )
    );
  }, [setNodes]);

  const nodeTypes = useMemo(() => ({
    customNode: CustomNode,
  }), []);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNode = useCallback((type) => {
    const nodeId = `node_${Date.now()}`;
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
      timestamp: new Date().toISOString()
    };
    setWorkflowData(workflowJson);
  }, [nodes, edges]);

  const executeWorkflow = useCallback(() => {
    const processedData = {};
    nodes.forEach(node => {
      if (node.data.properties && Object.keys(node.data.properties).length > 0) {
        processedData[node.id] = node.data.properties;
      }
    });
    
    alert(`Workflow ejecutado!\n\nDatos procesados:\n${JSON.stringify(processedData, null, 2)}`);
  }, [nodes]);

  React.useEffect(() => {
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

  React.useEffect(() => {
    updateWorkflowData();
  }, [updateWorkflowData]);

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
    }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        style={{ width: '100%', height: '100%' }}
      >
        <Background color="#aaa" gap={16} />
        <Controls />
        <MiniMap />
        
        <Panel position="top-left">
          <div style={{
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '16px',
            minWidth: '200px'
          }}>
            <h3 style={{margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#374151'}}>
              Agregar Nodos
            </h3>
            
            <button
              onClick={() => addNode('user-form')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '10px 12px',
                marginBottom: '8px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: '#3b82f6',
                color: 'white'
              }}
            >
              <User size={16} />
              <span>Usuario</span>
            </button>
            
            <button
              onClick={() => addNode('location-form')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '10px 12px',
                marginBottom: '8px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: '#16a34a',
                color: 'white'
              }}
            >
              <MapPin size={16} />
              <span>Ubicación</span>
            </button>
            
            <button
              onClick={() => addNode('layout-designer')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '10px 12px',
                marginBottom: '8px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: '#7c3aed',
                color: 'white'
              }}
            >
              <FileText size={16} />
              <span>Layout</span>
            </button>

            <hr style={{margin: '12px 0', border: 'none', borderTop: '1px solid #e5e7eb'}} />
            
            <button
              onClick={executeWorkflow}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '10px 12px',
                marginBottom: '8px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: '#059669',
                color: 'white'
              }}
            >
              <Play size={16} />
              <span>Ejecutar</span>
            </button>
            
            <button
              onClick={() => {
                const dataStr = JSON.stringify(workflowData, null, 2);
                const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
                const linkElement = document.createElement('a');
                linkElement.setAttribute('href', dataUri);
                linkElement.setAttribute('download', 'workflow.json');
                linkElement.click();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '10px 12px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                backgroundColor: '#dc2626',
                color: 'white'
              }}
            >
              <Download size={16} />
              <span>Descargar</span>
            </button>
          </div>
        </Panel>

        <Panel position="top-right">
          <div style={{
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            padding: '16px',
            maxWidth: '300px'
          }}>
            <h3 style={{margin: '0 0 12px 0', fontSize: '14px', fontWeight: '600', color: '#374151'}}>
              Vista Previa JSON
            </h3>
            <pre style={{
              fontSize: '11px',
              background: '#f3f4f6',
              padding: '12px',
              borderRadius: '4px',
              maxHeight: '200px',
              overflow: 'auto',
              whiteSpace: 'pre-wrap',
              margin: 0
            }}>
              {JSON.stringify(workflowData, null, 2)}
            </pre>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

export default App;