import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error | null;
}

export class ErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: {}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Optional: send error to telemetry here
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReload = () => {
    // Unregister service workers first (if any) to avoid serving stale cached assets
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      try {
        void navigator.serviceWorker.getRegistrations().then((regs) => {
          regs.forEach((r) => r.unregister());
          // Reload to fetch latest assets
          window.location.reload();
        });
      } catch (err) {
        // If unregister fails, still reload
        window.location.reload();
      }
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen flex items-center justify-center bg-background">
          <div className="text-center p-6">
            <h2 className="text-lg font-bold mb-2">Se ha producido un error cargando la aplicación</h2>
            <p className="mb-4 text-sm">Esto puede suceder cuando el navegador tiene una versión en caché del front que ya no coincide con la versión del servidor.</p>
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={this.handleReload}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/80"
              >
                Recargar ahora
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children as React.ReactElement;
  }
}

export default ErrorBoundary;
