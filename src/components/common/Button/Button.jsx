import React from 'react';
import { STYLES } from '../../../utils/constants';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  onClick,
  type = 'button',
  style = {},
  ...props 
}) => {
  const getVariantStyle = () => {
    const baseStyle = STYLES.button[variant] || STYLES.button.primary;
    
    if (disabled || loading) {
      return {
        ...baseStyle,
        opacity: 0.6,
        cursor: 'not-allowed'
      };
    }
    
    return baseStyle;
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return { padding: '6px 12px', fontSize: '12px' };
      case 'large':
        return { padding: '12px 24px', fontSize: '16px' };
      default:
        return { padding: '8px 16px', fontSize: '14px' };
    }
  };

  const buttonStyle = {
    ...getVariantStyle(),
    ...getSizeStyle(),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: fullWidth ? '100%' : 'auto',
    transition: 'all 0.2s ease',
    ...style
  };

  const handleClick = (e) => {
    if (disabled || loading) return;
    onClick && onClick(e);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <>
          <div style={{
            width: '16px',
            height: '16px',
            border: '2px solid transparent',
            borderTop: '2px solid currentColor',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          {children && <span>Cargando...</span>}
        </>
      );
    }

    return (
      <>
        {icon && iconPosition === 'left' && (
          <span style={{ display: 'flex', alignItems: 'center' }}>
            {icon}
          </span>
        )}
        
        {children && <span>{children}</span>}
        
        {icon && iconPosition === 'right' && (
          <span style={{ display: 'flex', alignItems: 'center' }}>
            {icon}
          </span>
        )}
      </>
    );
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <button
        type={type}
        style={buttonStyle}
        onClick={handleClick}
        disabled={disabled || loading}
        {...props}
      >
        {renderContent()}
      </button>
    </>
  );
};

export default Button;