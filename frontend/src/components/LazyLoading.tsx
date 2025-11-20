import React from 'react';

interface LazyLoadingProps {
  children: string;
}

// Componente de loading skeleton para diferentes tipos de páginas
const LoadingSkeleton: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'chat':
      return (
        <div className="h-screen bg-background flex">
          {/* Sidebar skeleton */}
          <div className="w-80 bg-sidebar border-r border-sidebar-border p-4">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-sidebar-accent rounded-full animate-pulse"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 bg-sidebar-accent rounded animate-pulse"></div>
                <div className="h-3 w-2/3 bg-sidebar-accent rounded animate-pulse"></div>
              </div>
            </div>
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-12 bg-sidebar-accent rounded animate-pulse"></div>
              ))}
            </div>
          </div>
          
          {/* Chat area skeleton */}
          <div className="flex-1 flex flex-col">
            <div className="h-16 border-b border-border flex items-center px-6">
              <div className="h-6 w-48 bg-muted rounded animate-pulse"></div>
            </div>
            <div className="flex-1 p-6 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className={`${i % 2 === 0 ? 'pr-24' : 'pl-24'} space-y-2`}>
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
                </div>
              ))}
            </div>
            <div className="h-20 border-t border-border p-4">
              <div className="h-12 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      );
    
    case 'home':
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-primary rounded-full flex items-center justify-center animate-pulse">
              <i className="fas fa-brain text-primary-foreground text-3xl"></i>
            </div>
            <div className="space-y-2">
              <div className="h-8 w-64 mx-auto bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-48 mx-auto bg-muted rounded animate-pulse"></div>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <i className="fas fa-spinner fa-spin text-2xl text-primary"></i>
              <p className="text-lg text-muted-foreground">Cargando...</p>
            </div>
          </div>
        </div>
      );
    
    case 'login':
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="w-full max-w-md p-6">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto bg-primary rounded-full flex items-center justify-center animate-pulse">
                <i className="fas fa-user text-primary-foreground text-2xl"></i>
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-12 bg-muted rounded animate-pulse"></div>
              <div className="h-12 bg-muted rounded animate-pulse"></div>
              <div className="h-12 bg-primary rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      );
    
    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-primary rounded-full flex items-center justify-center animate-pulse">
              <i className="fas fa-spinner fa-spin text-primary-foreground text-2xl"></i>
            </div>
            <p className="text-lg text-foreground">Cargando...</p>
          </div>
        </div>
      );
  }
};

export const LazyLoading: React.FC<LazyLoadingProps> = ({ children }) => {
  return <LoadingSkeleton type={children.toLowerCase()} />;
};

export default LazyLoading;