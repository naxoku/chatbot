import React, { lazy, Suspense } from "react";

/**
 * Sistema centralizado de Code Splitting para Chatbot UCT
 * Reduce el bundle inicial cargando componentes bajo demanda
 */

// Lazy components para modales y features no críticas
export const LazyDocumentsModal = lazy(() =>
  import("../DocumentsModal/DocumentsModal").then(module => ({ default: module.default }))
);

export const LazyMindMapModal = lazy(() =>
  import("../MindMapModal").then(module => ({ default: module.default }))
);

export const LazyArtifactsModal = lazy(() => 
  import("../ArtifactsModal").then(module => ({ default: module.default }))
);

export const LazyHelpPanel = lazy(() => 
  import("../HelpPanel").then(module => ({ default: module.default }))
);

/**
 * Componente genérico para renderizar componentes lazy
 */
export const LazyRender = (props) => {
  const { 
    component: Component, 
    fallback = null,
    onLoad = null,
    ...componentProps 
  } = props;
  
  const handleLoad = React.useCallback(() => {
    onLoad?.();
  }, [onLoad]);
  
  const handleError = React.useCallback((err) => {
    console.error(`Error loading lazy component:`, err);
  }, []);
  
  if (!Component) {
    return null;
  }
  
  return (
    <React.Suspense fallback={fallback || <LoadingSpinner />}>
      <Component {...componentProps} onLoad={handleLoad} onError={handleError} />
    </React.Suspense>
  );
};

/**
 * Spinner de carga genérico
 */
export const LoadingSpinner = ({ isDarkMode, message = "Cargando..." }) => (
  <div className={`fixed inset-0 z-50 flex items-center justify-center ${
    isDarkMode ? "bg-gray-900 bg-opacity-75" : "bg-white bg-opacity-75"
  }`}>
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center animate-pulse">
        <i className="fas fa-brain text-white text-2xl animate-spin"></i>
      </div>
      <div className="flex items-center justify-center space-x-2">
        <i className="fas fa-spinner fa-spin text-2xl text-blue-600"></i>
        <p className={`text-lg ${
          isDarkMode ? "text-gray-300" : "text-gray-700"
        }`}>
          {message}
        </p>
      </div>
    </div>
  </div>
);

/**
 * Error Boundary para componentes lazy
 */
export class LazyErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Lazy component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-center">
          <i className="fas fa-exclamation-triangle text-4xl text-red-500 mb-4"></i>
          <h3 className="text-lg font-semibold text-red-500 mb-2">
            Error al cargar el componente
          </h3>
          <p className="text-gray-600 mb-4">
            No se pudo cargar esta funcionalidad. Por favor, recarga la página.
          </p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Recargar página
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default LazyRender;