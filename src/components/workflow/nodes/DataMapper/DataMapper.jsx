// src/components/workflow/nodes/DataMapper/DataMapper.jsx - REFACTORIZADO
import React from 'react';
import DataMapperCore from './DataMapperCore';

// Este es ahora solo un wrapper que importa el componente principal
const DataMapper = (props) => {
  return <DataMapperCore {...props} />;
};

export default DataMapper;