import { lazy, Suspense } from "react";

/**
 * Code Splitting para DocumentsModal
 * Este componente solo se carga cuando el usuario abre el modal de documentos
 */
const DocumentsModalLazy = lazy(() => 
  import("../DocumentsModal/DocumentsModal").then(module => ({
    default: module.default
  }))
);

/**
 * Componente wrapper con Suspense para DocumentsModal
 * Proporciona un loading state elegante mientras se carga el componente
 */
const DocumentsModalWithSuspense = (props) => {
  return (
    <Suspense fallback={<DocumentsModalSkeleton {...props} />}>
      <DocumentsModalLazy {...props} />
    </Suspense>
  );
};

/**
 * Skeleton loader para DocumentsModal mientras se carga
 */
const DocumentsModalSkeleton = ({ isDarkMode }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal Skeleton */}
      <div className={`relative w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border transition-all duration-300 ${
        isDarkMode
          ? "bg-gray-800 border-gray-700"
          : "bg-white border-gray-200"
      }`}>
        
        {/* Header Skeleton */}
        <div className={`flex items-center justify-between p-6 border-b animate-pulse ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        }`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-600 rounded-xl animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-6 bg-gray-600 rounded w-48 animate-pulse"></div>
              <div className="h-4 bg-gray-600 rounded w-32 animate-pulse"></div>
            </div>
          </div>
          <div className="w-8 h-8 bg-gray-600 rounded-lg animate-pulse"></div>
        </div>
        
        {/* Filters Skeleton */}
        <div className={`p-6 border-b space-y-4 ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        }`}>
          <div className="h-12 bg-gray-600 rounded-xl animate-pulse"></div>
          <div className="flex space-x-2">
            <div className="h-8 bg-gray-600 rounded-lg w-16 animate-pulse"></div>
            <div className="h-8 bg-gray-600 rounded-lg w-20 animate-pulse"></div>
            <div className="h-8 bg-gray-600 rounded-lg w-24 animate-pulse"></div>
          </div>
        </div>
        
        {/* Content Skeleton */}
        <div className="p-6 max-h-96 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-4 border border-gray-600 rounded-xl animate-pulse">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-gray-600 rounded-lg animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-600 rounded animate-pulse"></div>
                    <div className="h-3 bg-gray-600 rounded w-3/4 animate-pulse"></div>
                    <div className="h-3 bg-gray-600 rounded w-1/2 animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Footer Skeleton */}
        <div className={`p-6 border-t ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        }`}>
          <div className="flex items-center justify-between">
            <div className="h-4 bg-gray-600 rounded w-64 animate-pulse"></div>
            <div className="h-8 bg-gray-600 rounded-lg w-20 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsModalWithSuspense;