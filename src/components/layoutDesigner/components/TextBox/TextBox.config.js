// src/components/layoutDesigner/components/TextBox/TextBox.config.js
export const textBoxConfig = {
    name: 'TextBox',
    type: 'text',
    category: 'content',
    icon: '📝',
    
    defaultProps: {
      text: 'Nuevo Texto',
      width: 200,
      height: 40,
      padding: '8px 12px',
      textStyle: {
        fontFamily: 'Arial, sans-serif',
        fontSize: 14,
        bold: false,
        italic: false,
        underline: false,
        strikethrough: false,
        color: '#000000'
      },
      paragraphStyle: {
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
  
    editableProperties: [
      'text',
      'width',
      'height',
      'padding',
      'textStyle',
      'paragraphStyle',
      'textStyleId',
      'paragraphStyleId',
      'borderStyleId',
      'fillStyleId'
    ],
  
    resizable: true,
    draggable: true,
    editable: true,
  
    shortcuts: {
      edit: 'DoubleClick',
      variables: 'Ctrl+Space',
      save: 'Ctrl+Enter',
      cancel: 'Escape'
    },
  
    validation: {
      text: {
        maxLength: 5000,
        allowEmpty: true
      },
      width: {
        min: 50,
        max: 1000
      },
      height: {
        min: 30,
        max: 1000
      }
    }
  };