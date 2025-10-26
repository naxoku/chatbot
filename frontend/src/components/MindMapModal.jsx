import ReactFlowMindMap from "../utils/renderMindMap.jsx";

const MindMapModal = ({ isOpen, onClose, artifact, isDarkMode }) => {
  if (!isOpen || !artifact || !artifact.name) {
    console.warn("MindMapModal: Artifact is missing required properties.");
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-in fade-in duration-200">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className={`
        relative w-[96vw] h-[92vh] max-w-[1600px] rounded-2xl shadow-2xl overflow-hidden
        ${
          isDarkMode
            ? "bg-[#1a1a1a] border border-gray-800"
            : "bg-white border border-gray-200"
        }
      `}
      >
        <div
          className={`
          flex items-center justify-between px-5 py-4 border-b
          ${isDarkMode ? "border-gray-800" : "border-gray-200"}
        `}
        >
          <div className="flex items-center space-x-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                isDarkMode
                  ? "bg-purple-900/30 text-purple-400"
                  : "bg-purple-100 text-purple-600"
              }`}
            >
              <i className="fas fa-project-diagram text-sm"></i>
            </div>

            <div>
              <h2
                className={`text-base font-semibold ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                {artifact.name}
              </h2>
              {artifact.description && (
                <p
                  className={`text-xs mt-0.5 ${
                    isDarkMode ? "text-gray-500" : "text-gray-500"
                  }`}
                >
                  {artifact.description}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            className={`
              p-2 rounded-lg transition-colors
              ${
                isDarkMode
                  ? "text-gray-500 hover:text-white hover:bg-gray-800"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
              }
            `}
            title="Cerrar (Esc)"
          >
            <i className="fas fa-times text-lg"></i>
          </button>
        </div>

        <div
          className={`
          px-5 py-2.5 border-b text-xs flex items-center justify-between
          ${
            isDarkMode
              ? "border-gray-800 bg-gray-900/30 text-gray-500"
              : "border-gray-200 bg-gray-50 text-gray-600"
          }
        `}
        >
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <i className="fas fa-mouse text-xs"></i>
              <span>Clic para expandir/colapsar</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <i className="fas fa-hand-pointer text-xs"></i>
              <span>Arrastra para mover</span>
            </span>
          </div>

          {artifact.createdAt && (
            <span className="flex items-center space-x-1.5">
              <i className="fas fa-clock text-xs"></i>
              <span>
                {new Date(artifact.createdAt).toLocaleDateString("es-ES", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </span>
          )}
        </div>

        <div className="h-[calc(100%-120px)] w-full">
          <ReactFlowMindMap data={artifact.data} isDarkMode={isDarkMode} />
        </div>
      </div>
    </div>
  );
};

export default MindMapModal;
