import { useEffect, useRef } from 'react';
import MindElixir from 'mind-elixir';
import 'mind-elixir/style.css';

interface MindElixirNode {
  topic: string;
  id: string;
  direction?: number;
  expanded?: boolean;
  children?: MindElixirNode[];
}

interface MindElixirMapProps {
  data: {
    name: string;
    children?: Array<{
      name: string;
      children?: Array<{
        name: string;
        children?: Array<{
          name: string;
          children?: unknown[];
        }>;
      }>;
    }>;
  };
}

const convertToMindElixirFormat = (
  data: MindElixirMapProps['data']
): MindElixirNode => {
  const convertNode = (
    node: { name: string; children?: unknown[] },
    parentId = 'root',
    index = 0
  ): MindElixirNode => {
    const id = parentId === 'root' ? 'root' : `${parentId}-${index}`;
    
    return {
      topic: node.name,
      id,
      expanded: true,
      children: Array.isArray(node.children)
        ? node.children
            .filter((child): child is { name: string; children?: unknown[] } => 
              typeof child === 'object' && child !== null && 'name' in child
            )
            .map((child, i) => convertNode(child, id, i))
        : undefined,
    };
  };

  return convertNode(data);
};

const MindElixirMap: React.FC<MindElixirMapProps> = ({ data }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mindRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || !data) {
      console.warn('⚠️ [MindElixir] Container o data no disponibles');
      return;
    }

    console.log('🧠 [MindElixir] Inicializando con datos:', data);

    const nodeData = convertToMindElixirFormat(data);
    console.log('🔄 [MindElixir] Datos convertidos:', nodeData);

    try {
      mindRef.current = new MindElixir({
        el: containerRef.current,
        direction: MindElixir.SIDE,
        draggable: true,
        contextMenu: true,
        toolBar: true,
        locale: 'es',
      });

      mindRef.current.init({
        nodeData,
        linkData: {},
      });

      console.log('✅ [MindElixir] Inicializado correctamente');
    } catch (error) {
      console.error('❌ [MindElixir] Error al inicializar:', error);
    }

    return () => {
      if (mindRef.current) {
        console.log('🧹 [MindElixir] Limpiando instancia');
        if (typeof mindRef.current.destroy === 'function') {
          mindRef.current.destroy();
        }
        mindRef.current = null;
      }
    };
  }, [data]);

  return (
    <div
      ref={containerRef}
      style={{ height: '100%', width: '100%' }}
    />
  );
};

export default MindElixirMap;
