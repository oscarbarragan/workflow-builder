import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { STYLES } from '../../../utils/constants';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium',
  showCloseButton = true,
  closeOnOverlayClick = true,
  style = {}
}) => {
  // Handle ESC key
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.keyCode === 27 && isOpen) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      // Prevenir scroll del body
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { width: '400px', maxWidth: '90vw' };
      case 'large':
        return { 
          width: '95vw', 
          height: '90vh', 
          maxWidth: '1400px',
          position: 'fixed', // Hacer el modal fijo en pantalla
          top: '5vh',
          left: '50%',
          transform: 'translateX(-50%)'
        };
      case 'full':
        return { 
          width: '100vw', 
          height: '100vh',
          position: 'fixed',
          top: 0,
          left: 0,
          transform: 'none'
        };
      default:
        return { width: '500px', maxWidth: '90vw' };
    }
  };

  const modalOverlayStyle = {
    ...STYLES.modal,
    zIndex: 10000, // Z-index muy alto para estar sobre ReactFlow
    position: 'fixed',
    ...style
  };

  const modalContentStyle = {
    background: 'white',
    borderRadius: size === 'full' ? '0' : '8px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    ...getSizeStyles()
  };

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleModalContentClick = (e) => {
    // Prevenir que los clicks en el contenido del modal se propaguen
    e.stopPropagation();
  };

  const handleModalContentMouseDown = (e) => {
    // Prevenir que los eventos de mouse se propaguen a ReactFlow
    e.stopPropagation();
  };

  return (
    <div 
      style={modalOverlayStyle} 
      onClick={handleOverlayClick}
      onMouseDown={(e) => e.stopPropagation()} // Prevenir propagación
    >
      <div 
        style={modalContentStyle}
        onClick={handleModalContentClick}
        onMouseDown={handleModalContentMouseDown}
        onDragStart={(e) => e.preventDefault()} // Prevenir drag del modal
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            borderBottom: '1px solid #e5e7eb',
            paddingBottom: '12px'
          }}>
            {title && (
              <h2 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '600',
                color: '#374151'
              }}>
                {title}
              </h2>
            )}
            
            {showCloseButton && (
              <button 
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  color: '#6b7280',
                  transition: 'color 0.2s'
                }}
                onMouseOver={(e) => e.target.style.color = '#374151'}
                onMouseOut={(e) => e.target.style.color = '#6b7280'}
                onMouseDown={(e) => e.stopPropagation()} // Prevenir propagación
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div style={{ 
          flex: 1, 
          overflow: 'auto',
          position: 'relative' // Para el contexto de posicionamiento
        }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;