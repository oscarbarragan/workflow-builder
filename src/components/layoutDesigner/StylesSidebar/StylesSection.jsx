// src/components/layoutDesigner/StylesSidebar/StylesSection.jsx
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
  onDeleteStyle
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
          fontSize: '12px'
        }}
      >
        <div 
          style={{ 
            flex: 1, 
            cursor: 'pointer',
            minWidth: 0
          }}
          onClick={() => onApplyStyle(type, style.id)}
          onMouseOver={(e) => {
            if (!isApplied) e.currentTarget.style.background = '#f8fafc';
          }}
          onMouseOut={(e) => {
            if (!isApplied) e.currentTarget.style.background = 'transparent';
          }}
        >
          <div style={{ 
            fontWeight: '500', 
            color: '#374151',
            marginBottom: '2px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {style.name}
            {style.isCustom && (
              <span style={{
                fontSize: '9px',
                background: '#fbbf24',
                color: 'white',
                padding: '1px 4px',
                borderRadius: '2px',
                marginLeft: '4px'
              }}>
                Custom
              </span>
            )}
          </div>
          
          {renderStylePreview(style)}
        </div>
        
        <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
          {style.isCustom && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEditStyle(type, style.id);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: '#6b7280',
                borderRadius: '3px',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#e5e7eb';
                e.target.style.color = '#374151';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'none';
                e.target.style.color = '#6b7280';
              }}
              title="Editar estilo"
            >
              ✏️
            </button>
          )}
          
          {style.isCustom && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteStyle(type, style.id, style.name);
              }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: '#dc2626',
                borderRadius: '3px',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => {
                e.target.style.background = '#fef2f2';
                e.target.style.color = '#991b1b';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'none';
                e.target.style.color = '#dc2626';
              }}
              title="Eliminar estilo"
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
          </div>
        );
      
      case 'paragraphStyle':
        return (
          <div style={{
            fontSize: '10px',
            color: '#6b7280'
          }}>
            {style.alignment} • {style.lineHeight}
            {style.letterSpacing && ` • ${style.letterSpacing}px`}
          </div>
        );
      
      case 'borderStyle':
        return (
          <div style={{
            fontSize: '10px',
            color: '#6b7280'
          }}>
            {style.width}px {style.style} • {style.color}
            {style.radius && ` • ${style.radius}px radius`}
          </div>
        );
      
      case 'fillStyle':
        return (
          <div style={{
            fontSize: '10px',
            color: '#6b7280'
          }}>
            {style.backgroundColor} • {Math.round((style.opacity || 1) * 100)}%
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
        <div style={{ padding: '8px 12px' }}>
          <button
            onClick={() => onCreateNewStyle(type)}
            style={{
              width: '100%',
              padding: '6px 8px',
              border: '1px dashed #3b82f6',
              borderRadius: '4px',
              background: 'white',
              color: '#3b82f6',
              fontSize: '11px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px'
            }}
          >
            ➕ Nuevo {title.replace('Estilos de ', '')}
          </button>
        </div>
        
        {styles.map(style => renderStyleItem(style))}
      </div>
    </div>
  );
};

export default StylesSection;