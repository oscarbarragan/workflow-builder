// src/components/workflow/nodes/DataTransformer/TransformationEngine.js
// Motor que aplica las transformaciones a los datos

export const applyTransformation = (value, transformationType, config = {}) => {
    if (transformationType === 'none' || !transformationType) {
      return value;
    }
  
    try {
      return executeTransformation(value, transformationType, config);
    } catch (error) {
      console.error(`Error applying transformation ${transformationType}:`, error);
      return value; // Return original value on error
    }
  };
  
  const executeTransformation = (value, type, config) => {
    // Handle null/undefined values
    if (value === null || value === undefined) {
      return value;
    }
  
    switch (type) {
      // STRING TRANSFORMATIONS
      case 'uppercase':
        return String(value).toUpperCase();
      
      case 'lowercase':
        return String(value).toLowerCase();
      
      case 'capitalize':
        return String(value).charAt(0).toUpperCase() + String(value).slice(1).toLowerCase();
      
      case 'title_case':
        return String(value).replace(/\w\S*/g, (txt) => 
          txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
      
      case 'trim':
        return String(value).trim();
      
      case 'remove_spaces':
        return String(value).replace(/\s+/g, '');
      
      case 'replace_spaces':
        return String(value).replace(/\s+/g, config.replacement || '_');
      
      case 'substring':
        const start = config.start || 0;
        const length = config.length || String(value).length;
        return String(value).substr(start, length);
      
      case 'pad_left':
        return String(value).padStart(config.length || 10, config.character || '0');
      
      case 'pad_right':
        return String(value).padEnd(config.length || 10, config.character || ' ');
      
      case 'reverse':
        return String(value).split('').reverse().join('');
      
      case 'replace_text':
        return String(value).replace(new RegExp(config.search || '', 'g'), config.replace || '');
      
      case 'remove_accents':
        return String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      
      case 'slug':
        return String(value)
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim('-');
      
      case 'extract_numbers':
        return String(value).replace(/[^0-9]/g, '');
      
      case 'extract_letters':
        return String(value).replace(/[^a-zA-ZáéíóúüñÁÉÍÓÚÜÑ]/g, '');
  
      // NUMBER TRANSFORMATIONS
      case 'round':
        const decimals = config.decimals || 0;
        return Math.round(Number(value) * Math.pow(10, decimals)) / Math.pow(10, decimals);
      
      case 'floor':
        return Math.floor(Number(value));
      
      case 'ceil':
        return Math.ceil(Number(value));
      
      case 'abs':
        return Math.abs(Number(value));
      
      case 'add':
        return Number(value) + (config.value || 0);
      
      case 'subtract':
        return Number(value) - (config.value || 0);
      
      case 'multiply':
        return Number(value) * (config.value || 1);
      
      case 'divide':
        const divisor = config.value || 1;
        return divisor !== 0 ? Number(value) / divisor : value;
      
      case 'percentage':
        return (Number(value) / (config.total || 100)) * 100;
      
      case 'format_currency':
        return new Intl.NumberFormat(config.locale || 'es-CO', {
          style: 'currency',
          currency: config.currency || 'COP'
        }).format(Number(value));
      
      case 'format_number':
        return new Intl.NumberFormat(config.locale || 'es-CO').format(Number(value));
      
      case 'to_string':
        return String(value);
      
      case 'power':
        return Math.pow(Number(value), config.exponent || 2);
      
      case 'sqrt':
        return Math.sqrt(Number(value));
      
      case 'min_max':
        const numValue = Number(value);
        const min = config.min !== undefined ? config.min : numValue;
        const max = config.max !== undefined ? config.max : numValue;
        return Math.max(min, Math.min(max, numValue));
  
      // DATE TRANSFORMATIONS
      case 'format_date':
        return formatDate(new Date(value), config.format || 'DD/MM/YYYY');
      
      case 'format_datetime':
        return formatDate(new Date(value), config.format || 'DD/MM/YYYY HH:mm');
      
      case 'add_days':
        const addDate = new Date(value);
        addDate.setDate(addDate.getDate() + (config.days || 0));
        return addDate.toISOString().split('T')[0];
      
      case 'subtract_days':
        const subDate = new Date(value);
        subDate.setDate(subDate.getDate() - (config.days || 0));
        return subDate.toISOString().split('T')[0];
      
      case 'get_year':
        return new Date(value).getFullYear();
      
      case 'get_month':
        return new Date(value).getMonth() + 1;
      
      case 'get_day':
        return new Date(value).getDate();
      
      case 'get_weekday':
        const weekdays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        return weekdays[new Date(value).getDay()];
      
      case 'age_from_date':
        const birthDate = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        return age;
      
      case 'days_until':
        const targetDate = new Date(config.targetDate || new Date());
        const currentDate = new Date(value);
        const diffTime = targetDate - currentDate;
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      case 'is_weekend':
        const dayOfWeek = new Date(value).getDay();
        return dayOfWeek === 0 || dayOfWeek === 6;
      
      case 'quarter':
        const month = new Date(value).getMonth();
        return `Q${Math.floor(month / 3) + 1}`;
  
      // BOOLEAN TRANSFORMATIONS
      case 'negate':
        return !Boolean(value);
      
      case 'to_text':
        return Boolean(value) ? (config.trueText || 'Sí') : (config.falseText || 'No');
      
      case 'to_number':
        return Boolean(value) ? 1 : 0;
      
      case 'to_spanish':
        return Boolean(value) ? 'Verdadero' : 'Falso';
      
      case 'to_english':
        return Boolean(value) ? 'True' : 'False';
  
      // ARRAY TRANSFORMATIONS
      case 'length':
        return Array.isArray(value) ? value.length : 0;
      
      case 'first':
        return Array.isArray(value) && value.length > 0 ? value[0] : null;
      
      case 'last':
        return Array.isArray(value) && value.length > 0 ? value[value.length - 1] : null;
      
      case 'join':
        return Array.isArray(value) ? value.join(config.separator || ', ') : String(value);
      
      case 'sort':
        return Array.isArray(value) ? [...value].sort() : value;
      
      case 'reverse':
        return Array.isArray(value) ? [...value].reverse() : value;
      
      case 'unique':
        return Array.isArray(value) ? [...new Set(value)] : value;
      
      case 'sum':
        if (!Array.isArray(value)) return value;
        return value.filter(item => typeof item === 'number').reduce((sum, num) => sum + num, 0);
      
      case 'average':
        if (!Array.isArray(value)) return value;
        const numbers = value.filter(item => typeof item === 'number');
        return numbers.length > 0 ? numbers.reduce((sum, num) => sum + num, 0) / numbers.length : 0;
  
      // EMAIL TRANSFORMATIONS
      case 'extract_username':
        const emailString = String(value);
        return emailString.includes('@') ? emailString.split('@')[0] : emailString;
      
      case 'extract_domain':
        const emailStr = String(value);
        return emailStr.includes('@') ? emailStr.split('@')[1] : '';
      
      case 'validate':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(String(value));
      
      case 'obfuscate':
        const email = String(value);
        if (!email.includes('@')) return email;
        const [username, domain] = email.split('@');
        const method = config.method || 'middle';
        let obfuscatedUsername = username;
        
        if (method === 'middle' && username.length > 3) {
          obfuscatedUsername = username[0] + '*'.repeat(username.length - 2) + username[username.length - 1];
        } else if (method === 'start') {
          obfuscatedUsername = '*'.repeat(Math.floor(username.length / 2)) + username.slice(Math.floor(username.length / 2));
        }
        
        return `${obfuscatedUsername}@${domain}`;
  
      // URL TRANSFORMATIONS
      case 'extract_domain':
        try {
          const url = new URL(String(value));
          return url.hostname;
        } catch {
          return String(value);
        }
      
      case 'extract_path':
        try {
          const url = new URL(String(value));
          return url.pathname;
        } catch {
          return '';
        }
      
      case 'extract_params':
        try {
          const url = new URL(String(value));
          return url.search;
        } catch {
          return '';
        }
      
      case 'validate':
        try {
          new URL(String(value));
          return true;
        } catch {
          return false;
        }
      
      case 'add_protocol':
        const urlString = String(value);
        const protocol = config.protocol || 'https';
        if (urlString.startsWith('http://') || urlString.startsWith('https://')) {
          return urlString;
        }
        return `${protocol}://${urlString}`;
  
      // OBJECT TRANSFORMATIONS
      case 'to_json':
        return JSON.stringify(value);
      
      case 'keys':
        return typeof value === 'object' && value !== null ? Object.keys(value) : [];
      
      case 'values':
        return typeof value === 'object' && value !== null ? Object.values(value) : [];
      
      case 'flatten':
        return flattenObject(value);
  
      default:
        console.warn(`Unknown transformation type: ${type}`);
        return value;
    }
  };
  
  // Helper function to format dates
  const formatDate = (date, format) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
  
    return format
      .replace('DD', day)
      .replace('MM', month)
      .replace('YYYY', year)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  };
  
  // Helper function to flatten nested objects
  const flattenObject = (obj, prefix = '') => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
  
    const flattened = {};
    
    Object.keys(obj).forEach(key => {
      const newKey = prefix ? `${prefix}.${key}` : key;
      const value = obj[key];
      
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        Object.assign(flattened, flattenObject(value, newKey));
      } else {
        flattened[newKey] = value;
      }
    });
    
    return flattened;
  };
  
  // Function to preview transformation result
  export const previewTransformation = (value, transformationType, config = {}) => {
    try {
      const result = applyTransformation(value, transformationType, config);
      return {
        success: true,
        result,
        originalValue: value,
        transformationType,
        config
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        originalValue: value,
        transformationType,
        config
      };
    }
  };
  
  // Function to validate transformation configuration
  export const validateTransformationConfig = (transformationType, config, dataType) => {
    const errors = [];
    
    switch (transformationType) {
      case 'substring':
        if (config.start < 0) errors.push('Start position cannot be negative');
        if (config.length < 0) errors.push('Length cannot be negative');
        break;
        
      case 'pad_left':
      case 'pad_right':
        if (config.length <= 0) errors.push('Length must be positive');
        break;
        
      case 'divide':
        if (config.value === 0) errors.push('Cannot divide by zero');
        break;
        
      case 'min_max':
        if (config.min > config.max) errors.push('Min value cannot be greater than max value');
        break;
        
      case 'add_days':
      case 'subtract_days':
        if (isNaN(config.days)) errors.push('Days must be a number');
        break;
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };