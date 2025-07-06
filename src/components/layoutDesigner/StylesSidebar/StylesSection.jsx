// src/components/layoutDesigner/StylesSidebar/StylesSection.jsx - MEJORADO
import React from 'react';

const StylesSection = ({
  type,
  title,
  icon,
  styles,
  selectedElement,
  isExpanded,
  onToggleExpanded,
  onApplyStyle,
  onCreateNewStyle,
  onEditStyle,
  onDeleteStyle,
  onDuplicateStyle // ✅ NUEVO
}) => {
  const getCurrentStyleId = () => {
    if (!selectedElement) return null;
    return selectedElement[`${type}Id`];
  };

  const renderSectionHeader = () => (
    <div
      onClick={onToggleExpanded}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 12px',
        background: '#e2e8f0',
        borderBottom: '1px solid #cbd5e1',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '600',
        color: '#475569'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>{icon}</span>
        {title}
        <span style={{ 
          fontSize: '10px', 
          background: '#64748b', 
          color: 'white', 
          padding: '1px 4px', 
          borderRadius: '8px',
          minWidth: '16px',
          textAlign: 'center'
        }}>
          {styles.length}
        </span>
      </div>
      <span>
        {isExpanded ? '🔽' : '▶️'}
      </span>
    </div>
  );

  const renderStyleItem = (style) => {
    const isApplied = getCurrentStyleId() === style.id;

    return (
      <div
        key={style.id}
        style={{
          padding: '8px 12px',
          borderBottom: '1px solid #f1f5f9',
          background: isApplied ? '#eff6ff' : 'transparent',
          borderLeft: isApplied ? '3px solid #3b82f6' : '3px solid transparent',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12px',
          // ✅ MEJORADO: Hover solo si no está aplicado
          transition: 'all 0.2s'
        }}
        onMouseOver={(e) => {
          if (!isApplied) e.currentTarget.style.background = '#f8fafc';
        }}
        onMouseOut={(e) => {
          if (!isApplied) e.currentTarget.style.background = 'transparent';
        }}
      >
        <div 
          style={{ 
            flex: 1, 
            cursor: 'pointer',
            minWidth: 0,
            marginRight: '8px'
          }}
          onClick={() => onApplyStyle(type, style.id)}
        >
          <div style={{ 
            fontWeight: '500', 
            color: '#374151',
            marginBottom: '2px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            {style.name}
            {style.isCustom && (
              <span style={{
                fontSize: '8px',
                background: '#fbbf24',
                color: 'white',
                padding: '1px 3px',
                borderRadius: '2px'
              }}>
                Custom
              </span>
            )}
            {isApplied && (
              <span style={{
                fontSize: '8px',
                background: '#16a34a',
                color: 'white',
                padding: '1px 3px',
                borderRadius: '2px'
              }}>
                Aplicado
              </span>
            )}
          </div>
          
          {renderStylePreview(style)}
        </div>
        
        {/* ✅ MEJORADO: Botones de acción más organizados */}
        <div style={{ 
          display: 'flex', 
          gap: '2px',
          flexShrink: 0
        }}>
          {/* Botón Editar - Disponible para todos los estilos */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEditStyle(type, style.id);
            }}
            style={{
              background: 'none',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              padding: '3px 5px',
              color: '#3b82f6',
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              fontSize: '10px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#eff6ff';
              e.target.style.borderColor = '#3b82f6';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'none';
              e.target.style.borderColor = '#d1d5db';
            }}
            title="Editar estilo"
          >
            ✏️
          </button>

          {/* Botón Duplicar - Para todos los estilos */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicateStyle && onDuplicateStyle(type, style.id, style.name);
            }}
            style={{
              background: 'none',
              border: '1px solid #d1d5db',
              cursor: 'pointer',
              padding: '3px 5px',
              color: '#059669',
              borderRadius: '3px',
              display: 'flex',
              alignItems: 'center',
              fontSize: '10px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#f0fdf4';
              e.target.style.borderColor = '#059669';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'none';
              e.target.style.borderColor = '#d1d5db';
            }}
            title="Duplicar estilo"
          >
            📋
          </button>
          
          {/* Botón Eliminar - Solo para estilos personalizados */}
          {style.isCustom && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteStyle(type, style.id, style.name);
              }}
              style={{
                background: 'none',
                border: '1px solid #fecaca',
                cursor: 'pointer',
                padding: '3px 5px',
                color: '#dc2626',
                borderRadius: '3px',
                display: 'flex',
                alignItems: 'center',
                fontSize: '10px',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#fef2f2';
                e.target.style.borderColor = '#dc2626';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'none';
                e.target.style.borderColor = '#fecaca';
              }}
              title="Eliminar estilo personalizado"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderStylePreview = (style) => {
    switch (type) {
      case 'textStyle':
        return (
          <div style={{
            fontSize: '10px',
            color: '#6b7280',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {style.fontFamily?.split(',')[0]} • {style.fontSize}px
            {style.bold && ' • Bold'}
            {style.italic && ' • Italic'}
            {style.color && (
              <span style={{
                marginLeft: '4px',
                display: 'inline-block',
                width: '8px',
                height: '8px',
                backgroundColor: style.color,
                borderRadius: '2px',
                border: '1px solid #e5e7eb'
              }}></span>
            )}
          </div>
        );
      
      case 'paragraphStyle':
        return (
          <div style={{
            fontSize: '10px',
            color: '#6b7280'
          }}>
            {style.alignment} • LH: {style.lineHeight}
            {style.letterSpacing && ` • LS: ${style.letterSpacing}px`}
          </div>
        );
      
      case 'borderStyle':
        return (
          <div style={{
            fontSize: '10px',
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <div style={{
              width: '16px',
              height: '3px',
              border: `${style.width || 1}px ${style.style || 'solid'} ${style.color || '#000'}`,
              borderRadius: `${(style.radius || 0) / 2}px`
            }}></div>
            {style.width}px {style.style}
          </div>
        );
      
      case 'fillStyle':
        return (
          <div style={{
            fontSize: '10px',
            color: '#6b7280',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <div style={{
              width: '12px',
              height: '12px',
              backgroundColor: style.backgroundColor || 'transparent',
              border: '1px solid #e5e7eb',
              borderRadius: '2px',
              opacity: style.opacity || 1
            }}></div>
            {Math.round((style.opacity || 1) * 100)}%
          </div>
        );
      
      default:
        return null;
    }
  };

  if (!isExpanded) {
    return renderSectionHeader();
  }

  return (
    <div>
      {renderSectionHeader()}
      
      <div>
        {/* ✅ MEJORADO: Botón crear con mejor diseño */}
        <div style={{ 
          padding: '8px 12px',
          borderBottom: '1px solid #f1f5f9',
          background: '#f8fafc'
        }}>
          <button
            onClick={() => onCreateNewStyle(type)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '2px dashed #3b82f6',
              borderRadius: '6px',
              background: 'white',
              color: '#3b82f6',
              fontSize: '11px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#eff6ff';
              e.target.style.borderStyle = 'solid';
            }}
            onMouseOut={(e) => {
              e.target.style.background = 'white';
              e.target.style.borderStyle = 'dashed';
            }}
          >
            ➕ Crear {title.replace('Estilos de ', '')}
          </button>
        </div>
        
        {/* Lista de estilos */}
        {styles.length === 0 ? (
          <div style={{
            padding: '20px 12px',
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: '11px',
            fontStyle: 'italic'
          }}>
            No hay estilos de este tipo.
            <br />
            Crea uno usando el botón de arriba.
          </div>
        ) : (
          styles.map(style => renderStyleItem(style))
        )}
      </div>
    </div>
  );
};

export default StylesSection;