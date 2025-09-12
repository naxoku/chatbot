// markdownRenderer.js - Configuración y utilidades para renderizado de Markdown

class MarkdownRenderer {
  constructor() {
    this.initializeMarked();
  }

  // Inicializar y configurar marked.js
  initializeMarked() {
    if (typeof marked === 'undefined') {
      console.error('marked.js no está cargado');
      return;
    }

    marked.setOptions({
      breaks: true, // Convertir saltos de línea en <br>
      gfm: true,    // GitHub Flavored Markdown
      sanitize: false, // Permitir HTML (considera DOMPurify en producción)
      highlight: function(code, lang) {
        // Opcional: resaltado de código si tienes highlight.js
        return code;
      }
    });
  }

  // Renderizar texto Markdown a HTML
  render(markdownText) {
    if (!markdownText) return '';
    
    try {
      return marked.parse(markdownText);
    } catch (error) {
      console.error('Error renderizando Markdown:', error);
      return markdownText; // Devolver texto original si hay error
    }
  }

  // Crear elemento DOM con contenido Markdown renderizado
  createMarkdownElement(markdownText, className = '') {
    const element = document.createElement('div');
    element.className = `markdown-content ${className}`;
    element.innerHTML = this.render(markdownText);
    this.applyStyles(element);
    return element;
  }

  // Aplicar estilos específicos al contenido Markdown
  applyStyles(element) {
    // Estilos para encabezados
    this.styleHeadings(element);
    
    // Estilos para párrafos
    this.styleParagraphs(element);
    
    // Estilos para listas
    this.styleLists(element);
    
    // Estilos para código
    this.styleCode(element);
    
    // Estilos para texto formateado
    this.styleTextFormatting(element);
    
    // Estilos para enlaces
    this.styleLinks(element);
    
    // Estilos para citas
    this.styleBlockquotes(element);
    
    // Estilos para tablas
    this.styleTables(element);
  }

  // Aplicar estilos a encabezados
  styleHeadings(element) {
    const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
    headings.forEach(heading => {
      heading.className = 'font-bold mb-2 mt-2';
      switch (heading.tagName) {
        case 'H1':
          heading.classList.add('text-xl');
          break;
        case 'H2':
          heading.classList.add('text-lg');
          break;
        case 'H3':
          heading.classList.add('text-base');
          break;
        default:
          heading.classList.add('text-sm');
      }
    });
  }

  // Aplicar estilos a párrafos
  styleParagraphs(element) {
    const paragraphs = element.querySelectorAll('p');
    paragraphs.forEach(p => {
      p.className = 'mb-2';
    });
  }

  // Aplicar estilos a listas
  styleLists(element) {
    const lists = element.querySelectorAll('ul, ol');
    lists.forEach(list => {
      list.className = 'mb-2 pl-4';
      if (list.tagName === 'UL') {
        list.classList.add('list-disc');
      } else {
        list.classList.add('list-decimal');
      }
    });

    const listItems = element.querySelectorAll('li');
    listItems.forEach(li => {
      li.className = 'mb-1';
    });
  }

  // Aplicar estilos a código
  styleCode(element) {
    // Código en línea
    const inlineCode = element.querySelectorAll('code:not(pre code)');
    inlineCode.forEach(code => {
      code.className = 'bg-gray-700 bg-opacity-50 px-1 py-0.5 rounded text-sm font-mono';
    });

    // Bloques de código
    const codeBlocks = element.querySelectorAll('pre');
    codeBlocks.forEach(pre => {
      pre.className = 'bg-gray-800 bg-opacity-50 p-3 rounded-lg mb-2 overflow-x-auto';
      const code = pre.querySelector('code');
      if (code) {
        code.className = 'text-sm font-mono text-gray-200';
      }
    });
  }

  // Aplicar estilos a texto formateado
  styleTextFormatting(element) {
    // Texto en negrita
    const bold = element.querySelectorAll('strong, b');
    bold.forEach(b => {
      b.className = 'font-bold';
    });

    // Texto en cursiva
    const italic = element.querySelectorAll('em, i');
    italic.forEach(i => {
      i.className = 'italic';
    });
  }

  // Aplicar estilos a enlaces
  styleLinks(element) {
    const links = element.querySelectorAll('a');
    links.forEach(link => {
      link.className = 'text-blue-300 hover:text-blue-200 underline transition-colors';
      link.target = '_blank'; // Abrir enlaces en nueva pestaña
      link.rel = 'noopener noreferrer'; // Seguridad
    });
  }

  // Aplicar estilos a citas
  styleBlockquotes(element) {
    const blockquotes = element.querySelectorAll('blockquote');
    blockquotes.forEach(quote => {
      quote.className = 'border-l-4 border-gray-400 pl-4 italic mb-2';
    });
  }

  // Aplicar estilos a tablas
  styleTables(element) {
    const tables = element.querySelectorAll('table');
    tables.forEach(table => {
      table.className = 'border-collapse border border-gray-400 mb-2 w-full';
      
      const cells = table.querySelectorAll('td, th');
      cells.forEach(cell => {
        cell.className = 'border border-gray-400 px-2 py-1 text-sm';
      });
      
      const headers = table.querySelectorAll('th');
      headers.forEach(th => {
        th.classList.add('font-bold', 'bg-gray-700', 'bg-opacity-30');
      });
    });
  }

  // Sanitizar HTML si es necesario (función de utilidad)
  sanitizeHtml(html) {
    // Esta es una implementación básica
    // En producción, considera usar DOMPurify
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }

  // Verificar si marked.js está disponible
  isMarkdownAvailable() {
    return typeof marked !== 'undefined';
  }

  // Función de utilidad para escapar HTML
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Crear instancia global del renderizador
const markdownRenderer = new MarkdownRenderer();

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MarkdownRenderer;
}