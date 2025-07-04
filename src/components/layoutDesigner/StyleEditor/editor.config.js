// src/components/layoutDesigner/StyleEditor/editor.config.js
export const editorConfig = {
    styleTypes: {
      textStyle: {
        name: 'Estilo de Texto',
        icon: '📝',
        defaultProps: {
          fontFamily: 'Arial, sans-serif',
          fontSize: 14,
          bold: false,
          italic: false,
          underline: false,
          strikethrough: false,
          color: '#000000'
        }
      },
      paragraphStyle: {
        name: 'Estilo de Párrafo',
        icon: '📄',
        defaultProps: {
          alignment: 'left',
          verticalAlign: 'flex-start',
          lineHeight: 1.4,
          letterSpacing: 0,
          indent: 0,
          spaceBefore: 0,
          spaceAfter: 0,
          wordWrap: true,
          wordBreak: 'normal'
        }
      },
      borderStyle: {
        name: 'Estilo de Borde',
        icon: '🔲',
        defaultProps: {
          width: 1,
          style: 'solid',
          color: '#d1d5db',
          radius: 4
        }
      },
      fillStyle: {
        name: 'Estilo de Relleno',
        icon: '🎨',
        defaultProps: {
          backgroundColor: '#f9fafb',
          opacity: 1,
          gradient: null
        }
      }
    },
  
    categories: [
      { value: 'custom', label: 'Personalizado' },
      { value: 'headings', label: 'Títulos' },
      { value: 'body', label: 'Cuerpo' },
      { value: 'decorative', label: 'Decorativo' },
      { value: 'utility', label: 'Utilidad' }
    ],
  
    previewTexts: {
      textStyle: 'Texto de ejemplo para vista previa',
      paragraphStyle: 'Este es un párrafo de ejemplo que muestra cómo se verá el estilo aplicado con diferentes configuraciones de alineación y espaciado.',
      borderStyle: 'Elemento de ejemplo',
      fillStyle: 'Elemento de ejemplo'
    }
  };