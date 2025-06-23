import React, { useState } from 'react';
import Modal from '../../../common/Modal/Modal';
import Button from '../../../common/Button/Button';
import { getNodeConfig } from '../../../../utils/nodeHelpers';
import { NODE_TYPES } from '../../../../utils/constants';

const NodeModal = ({ 
  isOpen, 
  onClose, 
  nodeType, 
  initialData = {}, 
  onSave 
}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  
  const nodeConfig = getNodeConfig(nodeType);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    nodeConfig.fields.forEach(field => {
      if (!formData[field] || formData[field].toString().trim() === '') {
        newErrors[field] = `El campo ${field} es requerido`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  const handleClose = () => {
    setFormData(initialData);
    setErrors({});
    onClose();
  };

  const renderFormField = (field) => {
    const fieldConfig = getFieldConfig(field, nodeType);
    
    return (
      <div key={field} style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block',
          marginBottom: '6px',
          fontWeight: '500',
          color: '#374151',
          fontSize: '14px'
        }}>
          {fieldConfig.label}
          {fieldConfig.required && <span style={{ color: '#dc2626' }}>*</span>}
        </label>
        
        {fieldConfig.type === 'select' ? (
          <select
            value={formData[field] || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `1px solid ${errors[field] ? '#dc2626' : '#d1d5db'}`,
              borderRadius: '6px',
              fontSize: '14px',
              boxSizing: 'border-box',
              background: 'white'
            }}
          >
            <option value="">Seleccionar...</option>
            {fieldConfig.options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : fieldConfig.type === 'textarea' ? (
          <textarea
            value={formData[field] || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={fieldConfig.placeholder}
            rows={fieldConfig.rows || 3}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `1px solid ${errors[field] ? '#dc2626' : '#d1d5db'}`,
              borderRadius: '6px',
              fontSize: '14px',
              boxSizing: 'border-box',
              resize: 'vertical'
            }}
          />
        ) : (
          <input
            type={fieldConfig.type || 'text'}
            value={formData[field] || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            placeholder={fieldConfig.placeholder}
            style={{
              width: '100%',
              padding: '8px 12px',
              border: `1px solid ${errors[field] ? '#dc2626' : '#d1d5db'}`,
              borderRadius: '6px',
              fontSize: '14px',
              boxSizing: 'border-box'
            }}
          />
        )}
        
        {errors[field] && (
          <div style={{
            color: '#dc2626',
            fontSize: '12px',
            marginTop: '4px'
          }}>
            {errors[field]}
          </div>
        )}
        
        {fieldConfig.help && (
          <div style={{
            color: '#6b7280',
            fontSize: '12px',
            marginTop: '4px'
          }}>
            {fieldConfig.help}
          </div>
        )}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Configurar ${nodeConfig.title}`}
      size="medium"
    >
      <div style={{ marginBottom: '24px' }}>
        {nodeConfig.fields.map(renderFormField)}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '12px',
        paddingTop: '16px',
        borderTop: '1px solid #e5e7eb'
      }}>
        <Button
          variant="secondary"
          onClick={handleClose}
        >
          Cancelar
        </Button>
        
        <Button
          variant="primary"
          onClick={handleSave}
        >
          Guardar
        </Button>
      </div>
    </Modal>
  );
};

// Helper function to get field configuration
const getFieldConfig = (field, nodeType) => {
  const fieldConfigs = {
    [NODE_TYPES.USER_FORM]: {
      nombre: {
        label: 'Nombre',
        type: 'text',
        placeholder: 'Ingresa el nombre',
        required: true,
        help: 'Nombre del usuario'
      }
    },
    [NODE_TYPES.LOCATION_FORM]: {
      apellido: {
        label: 'Apellido',
        type: 'text',
        placeholder: 'Ingresa el apellido',
        required: true,
        help: 'Apellido del usuario'
      },
      ciudad: {
        label: 'Ciudad',
        type: 'text',
        placeholder: 'Ingresa la ciudad',
        required: true,
        help: 'Ciudad de residencia'
      }
    }
  };

  return fieldConfigs[nodeType]?.[field] || {
    label: field.charAt(0).toUpperCase() + field.slice(1),
    type: 'text',
    placeholder: `Ingresa ${field}`,
    required: true
  };
};

export default NodeModal;