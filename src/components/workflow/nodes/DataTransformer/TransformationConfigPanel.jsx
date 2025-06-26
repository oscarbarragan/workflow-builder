// src/components/workflow/nodes/DataTransformer/TransformationConfigPanel.jsx
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, RotateCcw } from 'lucide-react';
import { getDefaultConfig } from './TransformationTypes';
import { validateTransformationConfig } from './TransformationEngine';

const TransformationConfigPanel = ({
  transformationId,
  transformation,
  onClose,
  onConfigChange
}) => {
  const [config, setConfig] = useState(transformation.transformationConfig || {});
  const [validation, setValidation] = useState({ isValid: true, errors: [] });

  useEffect(() => {
    setConfig(transformation.transformationConfig || {});
  }, [transformation.transformationConfig]);

  // Validate config whenever it changes
  useEffect(() => {
    const validationResult = validateTransformationConfig(
      transformation.transformationType,
      config,
      transformation.dataType
    );
    setValidation(validationResult);
  }, [config, transformation.transformationType, transformation.dataType]);

  const handleConfigChange = (key, value) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
  };

  const handleSave = () => {
    if (validation.isValid) {
      onConfigChange(config);
      onClose();
    }
  };

  const handleReset = () => {
    const defaultConfig = getDefaultConfig(transformation.transformationType, transformation.dataType);
    setConfig(defaultConfig);
  };

  // Render different config inputs based on transformation type
  const renderConfigInputs = () => {
    const { transformationType } = transformation;

    switch (transformationType) {
      case 'replace_spaces':
        return (
          <div>
            <label style={labelStyle}>Carácter de reemplazo:</label>
            <input
              type="text"
              value={config.replacement || '_'}
              onChange={(e) => handleConfigChange('replacement', e.target.value)}
              style={inputStyle}
              placeholder="_"
              maxLength="5"
            />
          </div>
        );

      case 'substring':
        return (
          <>
            <div>
              <label style={labelStyle}>Posición inicial:</label>
              <input
                type="number"
                value={config.start || 0}
                onChange={(e) => handleConfigChange('start', parseInt(e.target.value) || 0)}
                style={inputStyle}
                min="0"
              />
            </div>
            <div>
              <label style={labelStyle}>Longitud:</label>
              <input
                type="number"
                value={config.length || 10}
                onChange={(e) => handleConfigChange('length', parseInt(e.target.value) || 10)}
                style={inputStyle}
                min="1"
              />
            </div>
          </>
        );

      case 'pad_left':
      case 'pad_right':
        return (
          <>
            <div>
              <label style={labelStyle}>Longitud total:</label>
              <input
                type="number"
                value={config.length || 10}
                onChange={(e) => handleConfigChange('length', parseInt(e.target.value) || 10)}
                style={inputStyle}
                min="1"
              />
            </div>
            <div>
              <label style={labelStyle}>Carácter de relleno:</label>
              <input
                type="text"
                value={config.character || (transformationType === 'pad_left' ? '0' : ' ')}
                onChange={(e) => handleConfigChange('character', e.target.value)}
                style={inputStyle}
                maxLength="1"
                placeholder={transformationType === 'pad_left' ? '0' : ' '}
              />
            </div>
          </>
        );

      case 'replace_text':
        return (
          <>
            <div>
              <label style={labelStyle}>Texto a buscar:</label>
              <input
                type="text"
                value={config.search || ''}
                onChange={(e) => handleConfigChange('search', e.target.value)}
                style={inputStyle}
                placeholder="texto a buscar"
              />
            </div>
            <div>
              <label style={labelStyle}>Texto de reemplazo:</label>
              <input
                type="text"
                value={config.replace || ''}
                onChange={(e) => handleConfigChange('replace', e.target.value)}
                style={inputStyle}
                placeholder="texto de reemplazo"
              />
            </div>
          </>
        );

      case 'round':
        return (
          <div>
            <label style={labelStyle}>Decimales:</label>
            <input
              type="number"
              value={config.decimals || 0}
              onChange={(e) => handleConfigChange('decimals', parseInt(e.target.value) || 0)}
              style={inputStyle}
              min="0"
              max="10"
            />
          </div>
        );

      case 'add':
      case 'subtract':
      case 'multiply':
      case 'divide':
        return (
          <div>
            <label style={labelStyle}>
              Valor {transformationType === 'add' ? 'a sumar' : 
                    transformationType === 'subtract' ? 'a restar' :
                    transformationType === 'multiply' ? 'multiplicador' : 'divisor'}:
            </label>
            <input
              type="number"
              value={config.value || (transformationType === 'multiply' ? 1 : 0)}
              onChange={(e) => handleConfigChange('value', parseFloat(e.target.value) || 0)}
              style={inputStyle}
              step="any"
            />
          </div>
        );

      case 'percentage':
        return (
          <div>
            <label style={labelStyle}>Total (100%):</label>
            <input
              type="number"
              value={config.total || 100}
              onChange={(e) => handleConfigChange('total', parseFloat(e.target.value) || 100)}
              style={inputStyle}
              min="1"
              step="any"
            />
          </div>
        );

      case 'format_currency':
        return (
          <>
            <div>
              <label style={labelStyle}>Moneda:</label>
              <select
                value={config.currency || 'COP'}
                onChange={(e) => handleConfigChange('currency', e.target.value)}
                style={inputStyle}
              >
                <option value="COP">COP - Peso Colombiano</option>
                <option value="USD">USD - Dólar Americano</option>
                <option value="EUR">EUR - Euro</option>
                <option value="MXN">MXN - Peso Mexicano</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Localización:</label>
              <select
                value={config.locale || 'es-CO'}
                onChange={(e) => handleConfigChange('locale', e.target.value)}
                style={inputStyle}
              >
                <option value="es-CO">es-CO - Colombia</option>
                <option value="es-ES">es-ES - España</option>
                <option value="en-US">en-US - Estados Unidos</option>
                <option value="es-MX">es-MX - México</option>
              </select>
            </div>
          </>
        );

      case 'power':
        return (
          <div>
            <label style={labelStyle}>Exponente:</label>
            <input
              type="number"
              value={config.exponent || 2}
              onChange={(e) => handleConfigChange('exponent', parseFloat(e.target.value) || 2)}
              style={inputStyle}
              step="any"
            />
          </div>
        );

      case 'min_max':
        return (
          <>
            <div>
              <label style={labelStyle}>Valor mínimo:</label>
              <input
                type="number"
                value={config.min || 0}
                onChange={(e) => handleConfigChange('min', parseFloat(e.target.value) || 0)}
                style={inputStyle}
                step="any"
              />
            </div>
            <div>
              <label style={labelStyle}>Valor máximo:</label>
              <input
                type="number"
                value={config.max || 100}
                onChange={(e) => handleConfigChange('max', parseFloat(e.target.value) || 100)}
                style={inputStyle}
                step="any"
              />
            </div>
          </>
        );

      case 'format_date':
      case 'format_datetime':
        return (
          <div>
            <label style={labelStyle}>Formato:</label>
            <select
              value={config.format || 'DD/MM/YYYY'}
              onChange={(e) => handleConfigChange('format', e.target.value)}
              style={inputStyle}
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="DD/MM/YYYY HH:mm">DD/MM/YYYY HH:mm</option>
              <option value="YYYY-MM-DD HH:mm:ss">YYYY-MM-DD HH:mm:ss</option>
            </select>
          </div>
        );

      case 'add_days':
      case 'subtract_days':
        return (
          <div>
            <label style={labelStyle}>
              Días {transformationType === 'add_days' ? 'a agregar' : 'a restar'}:
            </label>
            <input
              type="number"
              value={config.days || 0}
              onChange={(e) => handleConfigChange('days', parseInt(e.target.value) || 0)}
              style={inputStyle}
              min="0"
            />
          </div>
        );

      case 'days_until':
        return (
          <div>
            <label style={labelStyle}>Fecha objetivo:</label>
            <input
              type="date"
              value={config.targetDate || new Date().toISOString().split('T')[0]}
              onChange={(e) => handleConfigChange('targetDate', e.target.value)}
              style={inputStyle}
            />
          </div>
        );

      case 'to_text':
        return (
          <>
            <div>
              <label style={labelStyle}>Texto para verdadero:</label>
              <input
                type="text"
                value={config.trueText || 'Sí'}
                onChange={(e) => handleConfigChange('trueText', e.target.value)}
                style={inputStyle}
                placeholder="Sí"
              />
            </div>
            <div>
              <label style={labelStyle}>Texto para falso:</label>
              <input
                type="text"
                value={config.falseText || 'No'}
                onChange={(e) => handleConfigChange('falseText', e.target.value)}
                style={inputStyle}
                placeholder="No"
              />
            </div>
          </>
        );

      case 'join':
        return (
          <div>
            <label style={labelStyle}>Separador:</label>
            <input
              type="text"
              value={config.separator || ', '}
              onChange={(e) => handleConfigChange('separator', e.target.value)}
              style={inputStyle}
              placeholder=", "
            />
          </div>
        );

      case 'obfuscate':
        return (
          <div>
            <label style={labelStyle}>Método de ofuscación:</label>
            <select
              value={config.method || 'middle'}
              onChange={(e) => handleConfigChange('method', e.target.value)}
              style={inputStyle}
            >
              <option value="middle">Medio (u***r@domain.com)</option>
              <option value="start">Inicio (***er@domain.com)</option>
            </select>
          </div>
        );

      case 'add_protocol':
        return (
          <div>
            <label style={labelStyle}>Protocolo:</label>
            <select
              value={config.protocol || 'https'}
              onChange={(e) => handleConfigChange('protocol', e.target.value)}
              style={inputStyle}
            >
              <option value="https">https</option>
              <option value="http">http</option>
            </select>
          </div>
        );

      default:
        return (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: '#6b7280',
            fontStyle: 'italic'
          }}>
            Esta transformación no requiere configuración adicional.
          </div>
        );
    }
  };

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999999
  };

  const modalContentStyle = {
    background: 'white',
    borderRadius: '8px',
    width: '90vw',
    maxWidth: '500px',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '4px'
  };

  const inputStyle = {
    width: '100%',
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '12px',
    boxSizing: 'border-box'
  };

  return createPortal(
    <div style={modalOverlayStyle} onClick={onClose}>
      <div style={modalContentStyle} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{
          padding: '20px 20px 0 20px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px'
          }}>
            <h3 style={{
              margin: 0,
              fontSize: '18px',
              fontWeight: '600',
              color: '#374151'
            }}>
              ⚙️ Configurar Transformación
            </h3>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                color: '#6b7280'
              }}
            >
              <X size={20} />
            </button>
          </div>

          <div style={{
            fontSize: '12px',
            color: '#6b7280',
            marginBottom: '16px'
          }}>
            <strong>Variable:</strong> {transformation.inputVariable} → {transformation.outputVariable}<br/>
            <strong>Tipo:</strong> {transformation.transformationType}<br/>
            <strong>Tipo de dato:</strong> {transformation.dataType}
          </div>
        </div>

        {/* Configuration Form */}
        <div style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {renderConfigInputs()}

          {/* Validation Errors */}
          {!validation.isValid && validation.errors.length > 0 && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '6px',
              padding: '12px'
            }}>
              <div style={{
                fontSize: '12px',
                fontWeight: '600',
                color: '#dc2626',
                marginBottom: '4px'
              }}>
                Errores de configuración:
              </div>
              {validation.errors.map((error, index) => (
                <div key={index} style={{
                  fontSize: '11px',
                  color: '#dc2626'
                }}>
                  • {error}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <button
            onClick={handleReset}
            style={{
              padding: '8px 16px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: 'white',
              color: '#374151',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RotateCcw size={14} />
            Restablecer
          </button>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                background: 'white',
                color: '#374151',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: '500'
              }}
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!validation.isValid}
              style={{
                padding: '8px 16px',
                border: 'none',
                borderRadius: '6px',
                background: validation.isValid ? '#3b82f6' : '#9ca3af',
                color: 'white',
                cursor: validation.isValid ? 'pointer' : 'not-allowed',
                fontSize: '12px',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <Save size={14} />
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default TransformationConfigPanel;