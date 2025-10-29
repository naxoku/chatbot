import { lazy, Suspense } from "react";

/**
 * Code Splitting para MindMapModal
 * Este componente solo se carga cuando el usuario genera o ve un mapa mental
 */
const MindMapModalLazy = lazy(() => 
  import("../MindMapModal").then(module => ({
    default: module.default
  }))
);

/**
 * Componente wrapper con Suspense para MindMapModal
 */
const MindMapModalWithSuspense = (props) => {
  return (
    <Suspense fallback={<MindMapModalSkeleton {...props} />}>
      <MindMapModalLazy {...props} />
    </Suspense>
  );
};

/**
 * Skeleton loader para MindMapModal mientras se carga
 */
const MindMapModalSkeleton = ({ isDarkMode }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal Skeleton */}
      <div className={`relative w-full max-w-6xl max-h-[90vh] rounded-2xl shadow-2xl border ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}>
        
        {/* Header Skeleton */}
        <div className={`flex items-center justify-between p-6 border-b ${
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
        
        {/* Content Skeleton - Mapa Mental */}
        <div className="p-6 max-h-[70vh] overflow-hidden">
          <div className="h-96 bg-gray-600 rounded-xl animate-pulse flex items-center justify-center">
            <div className="text-gray-400 animate-pulse">Generando mapa mental...</div>
          </div>
        </div>
        
        {/* Footer Skeleton */}
        <div className={`p-6 border-t ${
          isDarkMode ? "border-gray-700" : "border-gray-200"
        }`}>
          <div className="flex justify-between">
            <div className="h-8 bg-gray-600 rounded-lg w-24 animate-pulse"></div>
            <div className="flex space-x-3">
              <div className="h-8 bg-gray-600 rounded-lg w-20 animate-pulse"></div>
              <div className="h-8 bg-gray-600 rounded-lg w-16 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MindMapModalWithSuspense;