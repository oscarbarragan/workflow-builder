// src/components/layoutDesigner/styles/theme.js
export const layoutDesignerStyles = {
    // Modal principal
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 999999,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif'
    },
  
    modalContent: {
      background: 'white',
      borderRadius: '12px',
      width: '98vw',
      height: '95vh',
      maxWidth: '1600px',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      padding: '20px',
      position: 'relative'
    },
  
    // Header
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '16px',
      borderBottom: '2px solid #e5e7eb',
      paddingBottom: '12px'
    },
  
    title: {
      margin: 0,
      fontSize: '22px',
      fontWeight: '700',
      color: '#1f2937'
    },
  
    headerControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
  
    toggleButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      padding: '6px 12px',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      fontSize: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
  
    closeButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '6px',
      color: '#6b7280',
      fontSize: '20px',
      fontWeight: 'bold',
      transition: 'all 0.2s'
    },
  
    // Main content
    mainContent: {
      display: 'flex',
      flex: 1,
      gap: '16px',
      minHeight: 0
    },
  
    // Footer
    footer: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: '16px',
      paddingTop: '12px',
      borderTop: '2px solid #e5e7eb'
    },
  
    footerInfo: {
      fontSize: '12px',
      color: '#6b7280',
      fontWeight: '500'
    },
  
    footerButtons: {
      display: 'flex',
      gap: '12px'
    }
  };
  
  // Colores del tema
  export const colors = {
    primary: '#3b82f6',
    secondary: '#6b7280',
    success: '#16a34a',
    danger: '#dc2626',
    warning: '#f59e0b',
    info: '#0ea5e9',
    
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827'
    },
  
    blue: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a'
    }
  };
  
  // Espaciado
  export const spacing = {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    '2xl': '24px',
    '3xl': '32px'
  };
  
  // Tipografía
  export const typography = {
    fontFamily: {
      sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", sans-serif',
      mono: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace'
    },
    
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px'
    },
  
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  };
  
  // Sombras
  export const shadows = {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
  };
  
  // Transiciones
  export const transitions = {
    fast: 'all 0.15s ease',
    normal: 'all 0.2s ease',
    slow: 'all 0.3s ease'
  };
  
  // Breakpoints
  export const breakpoints = {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  };