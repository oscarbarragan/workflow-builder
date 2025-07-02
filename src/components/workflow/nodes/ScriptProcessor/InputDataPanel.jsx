// src/components/workflow/nodes/ScriptProcessor/InputDataPanel.jsx - CON SCROLL INTERNO
import React from 'react';
import { Database, Copy, ChevronRight, ChevronDown } from 'lucide-react';

const InputDataPanel = ({ 
  expandedData, 
  expandedNodes, 
  onExpandedNodesChange 
}) => {
  const [viewMode, setViewMode] = React.useState('tree'); // 'tree' o 'json'

  const copyInputToClipboard = () => {
    navigator.clipboard.writeText(JSON.stringify(transformedData, null, 2));
  };

  // ✅ NUEVA: Función para transformar datos planos a estructura jerárquica
  const transformToNestedStructure = (data) => {
    const result = {};
    
    Object.entries(data).forEach(([key, value]) => {
      try {
        // ✅ FILTRO: Solo procesar claves que realmente tienen underscore Y valores válidos
        if (key.includes('_') && key.length > 2) { // Mínimo 3 caracteres para tener sentido
          const parts = key.split('_').filter(part => part.length > 0); // Filtrar partes vacías
          
          // ✅ VALIDACIÓN: Solo proceder si tenemos al menos 2 partes válidas
          if (parts.length < 2) {
            result[key] = value; // Mantener como está si no se puede dividir apropiadamente
            return;
          }
          
          let current = result;
          
          // Navegar/crear la estructura anidada
          for (let i = 0; i < parts.length - 1; i++) {
            const part = parts[i];
            
            // ✅ VALIDACIÓN: Verificar que part sea una string válida
            if (!part || typeof part !== 'string' || part.length === 0) {
              console.warn(`Invalid part "${part}" in key "${key}"`);
              result[key] = value; // Fallback: mantener clave original
              return;
            }
            
            // ✅ SEGURIDAD: Verificar que current sea un objeto antes de crear propiedades
            if (!current || typeof current !== 'object' || Array.isArray(current)) {
              console.warn(`Cannot create nested structure at ${key}: current is not an object`);
              result[key] = value; // Fallback: mantener clave original
              return;
            }
            
            // ✅ Crear objeto solo si no existe o si existe pero no es objeto
            if (!current[part] || typeof current[part] !== 'object' || Array.isArray(current[part])) {
              current[part] = {};
            }
            
            current = current[part];
            
            // ✅ VERIFICACIÓN: Asegurar que current siga siendo un objeto válido
            if (!current || typeof current !== 'object' || Array.isArray(current)) {
              console.warn(`Lost object reference at ${parts.slice(0, i + 1).join('.')} in key "${key}"`);
              result[key] = value; // Fallback: mantener clave original
              return;
            }
          }
          
          // ✅ ASIGNACIÓN FINAL: Solo si current es un objeto válido
          const finalKey = parts[parts.length - 1];
          if (current && typeof current === 'object' && !Array.isArray(current) && finalKey) {
            current[finalKey] = value;
          } else {
            console.warn(`Cannot assign final value for key "${key}"`);
            result[key] = value; // Fallback: mantener clave original
          }
        } else {
          // Mantener campos sin underscore o con underscore inválido como están
          result[key] = value;
        }
      } catch (error) {
        console.warn(`Error processing key "${key}":`, error);
        result[key] = value; // Fallback: mantener clave original en caso de error
      }
    });
    
    return result;
  };

  // ✅ Datos transformados para mostrar estructura jerárquica real
  const transformedData = transformToNestedStructure(expandedData);

  const renderJsonTree = (obj, path = '', level = 0) => {
    // ✅ VALIDACIÓN: Manejar valores null, undefined o problemáticos
    if (obj === null || obj === undefined) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: '#6b7280', fontStyle: 'italic' }}>null</span>
          <span style={{ 
            fontSize: '8px', 
            background: '#f3f4f6', 
            color: '#6b7280', 
            padding: '1px 3px', 
            borderRadius: '2px',
            fontWeight: '500'
          }}>
            null
          </span>
        </span>
      );
    }

    // ✅ VALIDACIÓN: Verificar tipos problemáticos
    if (typeof obj === 'string' && (obj === 'Object' || obj === 'Array' || obj === '[object Object]')) {
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: '#dc2626', fontStyle: 'italic' }}>"{obj}" (invalid)</span>
          <span style={{ 
            fontSize: '8px', 
            background: '#fef2f2', 
            color: '#dc2626', 
            padding: '1px 3px', 
            borderRadius: '2px',
            fontWeight: '500'
          }}>
            invalid
          </span>
        </span>
      );
    }

    if (typeof obj !== 'object') {
      const getTypeInfo = (value) => {
        if (typeof value === 'string') {
          // Detectar tipos especiales de string
          if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
            return { type: 'datetime', color: '#7c3aed' };
          }
          if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
            return { type: 'date', color: '#7c3aed' };
          }
          if (/@/.test(value)) {
            return { type: 'email', color: '#059669' };
          }
          if (/^https?:\/\//.test(value)) {
            return { type: 'url', color: '#0284c7' };
          }
          return { type: 'string', color: '#16a34a' };
        }
        if (typeof value === 'number') {
          return Number.isInteger(value) 
            ? { type: 'int', color: '#2563eb' }
            : { type: 'float', color: '#2563eb' };
        }
        if (typeof value === 'boolean') {
          return { type: 'bool', color: '#dc2626' };
        }
        return { type: typeof value, color: '#6b7280' };
      };

      const typeInfo = getTypeInfo(obj);
      
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
          {/* ✅ Valor con su color */}
          <span style={{ color: typeInfo.color, fontWeight: '500' }}>
            {typeof obj === 'string' ? `"${obj}"` : String(obj)}
          </span>
          {/* ✅ Tipo compacto */}
          <span style={{ 
            fontSize: '8px', 
            background: '#f1f5f9', 
            color: '#475569', 
            padding: '1px 4px', 
            borderRadius: '2px',
            fontWeight: '500',
            fontFamily: 'monospace'
          }}>
            {typeInfo.type}
          </span>
        </span>
      );
    }

    if (Array.isArray(obj)) {
      const nodeKey = `array-${path}`;
      const isExpanded = expandedNodes.has(nodeKey);
      
      return (
        <div style={{ marginLeft: level * 16 }}>
          <div 
            style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              cursor: 'pointer',
              padding: '2px 0',
              gap: '4px'
            }}
            onClick={() => {
              const newExpanded = new Set(expandedNodes);
              if (isExpanded) {
                newExpanded.delete(nodeKey);
              } else {
                newExpanded.add(nodeKey);
              }
              onExpandedNodesChange(newExpanded);
            }}
          >
            {obj.length > 0 && (
              isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />
            )}
            <span style={{ color: '#7c3aed', fontWeight: '500' }}>
              Array[{obj.length}]
            </span>
            <span style={{ 
              fontSize: '8px', 
              background: '#f1f5f9', 
              color: '#475569', 
              padding: '1px 4px', 
              borderRadius: '2px',
              fontWeight: '500',
              fontFamily: 'monospace'
            }}>
              array
            </span>
          </div>
          {isExpanded && obj.map((item, index) => (
            <div key={index} style={{ marginLeft: 16, marginTop: '2px' }}>
              <span style={{ color: '#6b7280', fontSize: '10px' }}>[{index}]: </span>
              {renderJsonTree(item, `${path}[${index}]`, level + 1)}
            </div>
          ))}
        </div>
      );
    }

    // ✅ VALIDACIÓN EXTRA: Verificar que obj sea realmente un objeto
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
      return (
        <span style={{ color: '#dc2626', fontStyle: 'italic' }}>
          Invalid object: {String(obj)}
        </span>
      );
    }

    const keys = Object.keys(obj);
    const nodeKey = `object-${path}`;
    const isExpanded = expandedNodes.has(nodeKey);

    return (
      <div style={{ marginLeft: level * 16 }}>
        <div 
          style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            cursor: 'pointer',
            padding: '2px 0',
            gap: '4px'
          }}
          onClick={() => {
            const newExpanded = new Set(expandedNodes);
            if (isExpanded) {
              newExpanded.delete(nodeKey);
            } else {
              newExpanded.add(nodeKey);
            }
            onExpandedNodesChange(newExpanded);
          }}
        >
          {keys.length > 0 && (
            isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />
          )}
          <span style={{ color: '#f59e0b', fontWeight: '500' }}>
            Object{keys.length > 0 ? `{${keys.length}}` : '{}'}
          </span>
          <span style={{ 
            fontSize: '8px', 
            background: '#f1f5f9', 
            color: '#475569', 
            padding: '1px 4px', 
            borderRadius: '2px',
            fontWeight: '500',
            fontFamily: 'monospace'
          }}>
            object
          </span>
        </div>
        {isExpanded && keys.map(key => (
          <div key={key} style={{ marginLeft: 16, padding: '1px 0' }}>
            {/* ✅ Estructura mejorada: nombre, valor, tipo en línea */}
            <span style={{ 
              color: '#1f2937', 
              fontWeight: '600',
              marginRight: '4px'
            }}>
              {key}:
            </span>
            {renderJsonTree(obj[key], `${path}.${key}`, level + 1)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{
      height: '100%', // ✅ Altura completa del contenedor
      border: '2px solid #e5e7eb',
      borderRadius: '12px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      background: 'white'
    }}>
      {/* ✅ Header fijo con opciones de vista */}
      <div style={{
        background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
        padding: '12px 16px',
        color: 'white',
        fontSize: '13px',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0 // ✅ No se reduce
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={16} />
          Input Data ({Object.keys(transformedData).length}) {/* ✅ Usar datos transformados para el conteo */}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {/* ✅ Toggle para cambiar vista */}
          <button
            onClick={() => setViewMode(viewMode === 'tree' ? 'json' : 'tree')}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '4px',
              padding: '4px 6px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '10px'
            }}
          >
            {viewMode === 'tree' ? '📄 JSON' : '🌳 Tree'}
          </button>
          <button
            onClick={copyInputToClipboard}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '11px'
            }}
          >
            <Copy size={12} />
          </button>
        </div>
      </div>

      {/* ✅ Contenido con scroll */}
      <div style={{
        padding: '12px',
        background: '#f8fafc',
        flex: 1, // ✅ Toma el espacio restante
        overflow: 'auto', // ✅ Scroll cuando sea necesario
        fontSize: '12px',
        fontFamily: '"Fira Code", "SF Mono", "Monaco", monospace',
        minHeight: 0 // ✅ Permite que el contenido se reduzca
      }}>
        {Object.keys(transformedData).length > 0 ? (
          viewMode === 'tree' ? (
            // ✅ Vista en árbol con estructura jerárquica real
            Object.entries(transformedData).map(([key, value]) => (
              <div key={key} style={{ marginBottom: '8px' }}>
                <span style={{ 
                  color: '#1f2937', 
                  fontWeight: '600',
                  marginRight: '4px'
                }}>
                  {key}:
                </span>
                {renderJsonTree(value, key, 0)}
              </div>
            ))
          ) : (
            // ✅ Vista JSON con estructura jerárquica real
            <pre style={{ 
              margin: 0, 
              whiteSpace: 'pre-wrap',
              color: '#1f2937',
              wordBreak: 'break-word',
              fontSize: '11px',
              lineHeight: '1.4'
            }}>
              {JSON.stringify(transformedData, null, 2)}
            </pre>
          )
        ) : (
          <div style={{
            color: '#6b7280',
            fontStyle: 'italic',
            textAlign: 'center',
            padding: '20px'
          }}>
            No input data available
          </div>
        )}
      </div>
    </div>
  );
};

export default InputDataPanel;