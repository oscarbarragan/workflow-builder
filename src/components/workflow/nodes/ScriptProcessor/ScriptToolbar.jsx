// src/components/workflow/nodes/ScriptProcessor/ScriptToolbar.jsx
import React from 'react';
import { 
  Play, 
  RotateCcw,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  Settings
} from 'lucide-react';
import Button from '../../../common/Button/Button';

const ScriptToolbar = ({
  isExecuting,
  showInputData,
  showOutputPanel,
  onExecute,
  onAutoDetect,
  onAddVariable,
  onReset,
  onTemplateSelect,
  onToggleInput,
  onToggleSchema
}) => {
  return (
    <div style={{
      display: 'flex',
      gap: '12px',
      marginBottom: '24px',
      flexWrap: 'wrap',
      padding: '16px',
      background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
      borderRadius: '12px',
      border: '1px solid #e2e8f0'
    }}>
      <Button
        variant="success"
        icon={<Play size={16} />}
        onClick={onExecute}
        disabled={isExecuting}
        loading={isExecuting}
        size="large"
      >
        {isExecuting ? 'Ejecutando...' : '▶️ Ejecutar & Test'}
      </Button>
      
      <Button
        variant="secondary"
        icon={<RefreshCw size={16} />}
        onClick={onAutoDetect}
      >
        🔍 Auto-detectar
      </Button>
      
      <Button
        variant="secondary"
        icon={<Plus size={16} />}
        onClick={onAddVariable}
      >
        ➕ Variable
      </Button>
      
      <Button
        variant="secondary"
        icon={<RotateCcw size={16} />}
        onClick={onReset}
      >
        🔄 Limpiar
      </Button>
      
      <select
        onChange={(e) => {
          if (e.target.value) {
            onTemplateSelect(e.target.value);
            e.target.value = ''; // Reset select
          }
        }}
        style={{
          padding: '8px 12px',
          border: '1px solid #d1d5db',
          borderRadius: '8px',
          fontSize: '13px',
          background: 'white',
          cursor: 'pointer'
        }}
      >
        <option value="">📄 Templates...</option>
        <option value="basic">🚀 Básico</option>
        <option value="dataMapper">🗂️ Data Mapper</option>
        <option value="workflowData">🔄 Workflow</option>
        <option value="dataTransform">⚡ Transformación</option>
        <option value="validation">✅ Validación</option>
        <option value="calculations">🧮 Cálculos</option>
      </select>
      
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <Button
          variant="secondary"
          icon={showInputData ? <EyeOff size={16} /> : <Eye size={16} />}
          onClick={onToggleInput}
        >
          {showInputData ? '👁️‍🗨️ Input' : '👁️ Input'}
        </Button>
        
        <Button
          variant="secondary"
          icon={showOutputPanel ? <EyeOff size={16} /> : <Settings size={16} />}
          onClick={onToggleSchema}
        >
          {showOutputPanel ? '📋 Schema' : '📋 Schema'}
        </Button>
      </div>
    </div>
  );
};

export default ScriptToolbar;