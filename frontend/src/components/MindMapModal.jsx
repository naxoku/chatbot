import ReactFlowMindMap from "../utils/renderMindMap.jsx";

const MindMapModal = ({ isOpen, onClose, artifact, isDarkMode }) => {
  if (!isOpen || !artifact) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`
        relative w-[95vw] h-[90vh] max-w-7xl rounded-2xl shadow-2xl overflow-hidden
        ${
          isDarkMode
            ? "bg-gray-800 border border-gray-700"
            : "bg-white border border-gray-200"
        }
      `}
      >
        {/* Header */}
        <div
          className={`
          flex items-center justify-between p-4 border-b
          ${
            isDarkMode
              ? "border-gray-700 bg-gray-800/95"
              : "border-gray-200 bg-white/95"
          }
        `}
        >
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
              <i className="fas fa-project-diagram text-white text-sm"></i>
            </div>
            <div>
              <h2
                className={`font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {artifact.name}
              </h2>
              <p
                className={`text-sm ${
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {artifact.description}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className={`
                p-2 rounded-lg transition-colors
                ${
                  isDarkMode
                    ? "text-gray-400 hover:text-gray-200 hover:bg-gray-700"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }
              `}
              title="Cerrar"
            >
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="h-[calc(100%-80px)] w-full">
          <ReactFlowMindMap data={artifact.data} isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
  );
};

export default MindMapModal;
