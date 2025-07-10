// src/components/layoutDesigner/PageManager/PageThumbnail.jsx
import React from 'react';

const PageThumbnail = ({
  page,
  index,
  isActive,
  totalPages,
  onSelect,
  onEdit,
  onDuplicate,
  onDelete,
  thumbnailSize = 'normal' // 'small' | 'normal' | 'large'
}) => {
  // Calcular dimensiones de miniatura
  const getSizeConfig = () => {
    switch (thumbnailSize) {
      case 'small':
        return { height: 24, maxWidth: 35 };
      case 'large':
        return { height: 48, maxWidth: 68 };
      default:
        return { height: 32, maxWidth: 45 };
    }
  };

  const sizeConfig = getSizeConfig();
  const aspectRatio = page.size ? (page.size.width / page.size.height) : 0.707;
  const thumbnailWidth = Math.min(sizeConfig.height * aspectRatio, sizeConfig.maxWidth);

  // Verificar si hay elementos
  const hasElements = Array.isArray(page.elements) && page.elements.length > 0;
  const elementCount = hasElements ? page.elements.length : 0;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: thumbnailSize === 'small' ? '4px' : '6px',
        padding: thumbnailSize === 'small' ? '3px 6px' : '4px 8px',
        border: isActive ? '2px solid #3b82f6' : '1px solid #d1d5db',
        borderRadius: '6px',
        background: isActive ? '#eff6ff' : 'white',
        cursor: 'pointer',
        transition: 'all 0.2s',
        minWidth: thumbnailSize === 'small' ? '100px' : '120px',
        fontSize: thumbnailSize === 'small' ? '10px' : '11px',
        position: 'relative'
      }}
      onClick={() => onSelect && onSelect(index)}
      title={`${page.name || `Página ${index + 1}`} - ${elementCount} elementos`}
    >
      {/* Miniatura de página */}
      <div style={{
        width: thumbnailWidth,
        height: sizeConfig.height,
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '2px',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
        boxShadow: isActive ? '0 2px 4px rgba(59, 130, 246, 0.2)' : '0 1px 2px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Márgenes visuales */}
        {page.margins && (
          <div style={{
            position: 'absolute',
            top: `${(page.margins.top / page.size.height) * 100}%`,
            left: `${(page.margins.left / page.size.width) * 100}%`,
            right: `${(page.margins.right / page.size.width) * 100}%`,
            bottom: `${(page.margins.bottom / page.size.height) * 100}%`,
            border: '1px solid rgba(16, 185, 129, 0.3)',
            background: 'rgba(16, 185, 129, 0.05)'
          }} />
        )}

        {/* Elementos en miniatura */}
        {hasElements && page.elements.slice(0, 8).map((element, idx) => {
          // Calcular posición proporcional
          const elementX = Math.max(0, (element.x / (page.size?.width || 500)) * thumbnailWidth);
          const elementY = Math.max(0, (element.y / (page.size?.height || 700)) * sizeConfig.height);
          const elementWidth = Math.max(1, ((element.width || 20) / (page.size?.width || 500)) * thumbnailWidth);
          const elementHeight = Math.max(1, ((element.height || 20) / (page.size?.height || 700)) * sizeConfig.height);

          // Color según tipo de elemento
          const getElementColor = (type) => {
            switch (type) {
              case 'text': return '#3b82f6';
              case 'rectangle': return '#10b981';
              case 'variable': return '#f59e0b';
              case 'image': return '#8b5cf6';
              default: return '#6b7280';
            }
          };

          return (
            <div
              key={element.id || idx}
              style={{
                position: 'absolute',
                left: elementX,
                top: elementY,
                width: Math.min(elementWidth, thumbnailWidth - elementX),
                height: Math.min(elementHeight, sizeConfig.height - elementY),
                background: getElementColor(element.type),
                borderRadius: '1px',
                opacity: 0.8,
                transform: element.rotation ? `rotate(${element.rotation}deg)` : 'none',
                transformOrigin: 'center center'
              }}
            />
          );
        })}
        
        {/* Indicador de más elementos */}
        {elementCount > 8 && (
          <div style={{
            position: 'absolute',
            bottom: '1px',
            right: '1px',
            background: '#6b7280',
            color: 'white',
            fontSize: thumbnailSize === 'small' ? '5px' : '6px',
            padding: '1px 2px',
            borderRadius: '1px',
            lineHeight: 1
          }}>
            +{elementCount - 8}
          </div>
        )}

        {/* Indicador de página vacía */}
        {!hasElements && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#9ca3af',
            fontSize: thumbnailSize === 'small' ? '6px' : '8px',
            textAlign: 'center'
          }}>
            📄
          </div>
        )}
      </div>

      {/* Información de página */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: thumbnailSize === 'small' ? '10px' : '11px',
          fontWeight: '600',
          color: isActive ? '#1e40af' : '#374151',
          marginBottom: '1px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {index + 1}. {page.name || `Página ${index + 1}`}
        </div>
        
        <div style={{
          fontSize: thumbnailSize === 'small' ? '8px' : '9px',
          color: '#6b7280',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span title={`${page.size?.width || 210} × ${page.size?.height || 297} ${page.size?.unit || 'mm'}`}>
            {page.size?.preset || 'Custom'}
          </span>
          <span>{elementCount}el</span>
        </div>
      </div>

      {/* Botones de acción */}
      {thumbnailSize !== 'small' && (
        <div style={{
          display: 'flex',
          gap: '2px',
          opacity: isActive ? 1 : 0.6,
          transition: 'opacity 0.2s'
        }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit && onEdit(index);
            }}
            style={{
              padding: '2px 4px',
              border: 'none',
              borderRadius: '3px',
              background: '#f3f4f6',
              fontSize: '10px',
              cursor: 'pointer',
              color: '#3b82f6',
              transition: 'all 0.2s'
            }}
            title="Editar página"
            onMouseEnter={(e) => {
              e.target.style.background = '#e5e7eb';
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#f3f4f6';
              e.target.style.transform = 'scale(1)';
            }}
          >
            ✏️
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate && onDuplicate(index);
            }}
            style={{
              padding: '2px 4px',
              border: 'none',
              borderRadius: '3px',
              background: '#f3f4f6',
              fontSize: '10px',
              cursor: 'pointer',
              color: '#059669',
              transition: 'all 0.2s'
            }}
            title="Duplicar página"
            onMouseEnter={(e) => {
              e.target.style.background = '#e5e7eb';
              e.target.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#f3f4f6';
              e.target.style.transform = 'scale(1)';
            }}
          >
            📋
          </button>
          
          {totalPages > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (window.confirm(`¿Eliminar "${page.name || `Página ${index + 1}`}"?`)) {
                  onDelete && onDelete(index);
                }
              }}
              style={{
                padding: '2px 4px',
                border: 'none',
                borderRadius: '3px',
                background: '#fef2f2',
                fontSize: '10px',
                cursor: 'pointer',
                color: '#dc2626',
                transition: 'all 0.2s'
              }}
              title="Eliminar página"
              onMouseEnter={(e) => {
                e.target.style.background = '#fee2e2';
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#fef2f2';
                e.target.style.transform = 'scale(1)';
              }}
            >
              🗑️
            </button>
          )}
        </div>
      )}

      {/* Indicador de página activa */}
      {isActive && (
        <div style={{
          position: 'absolute',
          top: '-2px',
          left: '-2px',
          width: '8px',
          height: '8px',
          background: '#3b82f6',
          borderRadius: '50%',
          border: '2px solid white',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
        }} />
      )}
    </div>
  );
};

export default PageThumbnail;