import { useRef } from "react";

// Hooks personalizados
import { useChatInterfaceConfig } from "./ChatInterface/hooks/useChatInterfaceConfig.js";

// Componentes
import Sidebar from "./ChatInterface/Sidebar.jsx";
import ChatHeader from "./ChatInterface/ChatHeader.jsx";
import ChatMessages from "./ChatInterface/ChatMessages/";
import ChatInput from "./ChatInterface/ChatInput.jsx";
import { LazyDocumentsModal, LazyMindMapModal, LazyArtifactsModal, LazyHelpPanel, LazyRender } from "./lazy/LazyComponents.jsx";
import LoadingIndicator from "./LoadingIndicator.jsx";
import LogoUCT from "../assets/logouct.png";

// Componente de carga
const LoadingSpinner = ({ isDarkMode }) => (
  <div className={`h-screen flex items-center justify-center ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}>
    <div className="text-center">
      <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
      <p className={`text-lg ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
        Iniciando asistente DDPER...
      </p>
    </div>
  </div>
);

const ChatInterface = () => {
  const conversationIdRef = useRef(null);
  
  // CONFIGURACIÓN EXTRAÍDA A HOOK SEPARADO
  const config = useChatInterfaceConfig();
  
  // Si no debe renderizar (loading), mostrar componente de carga
  if (!config.shouldRender) {
    return <LoadingSpinner isDarkMode={config.isDarkMode} isLoading={config.isLoadingSession} />;
  }

  // DESESTRUCTURAR CONFIGURACIÓN PARA USO EN JSX
  const {
    // Estado y contexto
    artifacts, removeArtifact,
    messages, documentsList, isHelpPanelOpen, quotedMessage,
    setIsHelpPanelOpen, setQuotedMessage,
    
    // Estado del chat
    input, isSidebarOpen, isArtifactsOpen, currentChat, chats, isMobile,
    isDocumentsModalOpen, selectedArtifact, isMindMapModalOpen, isDarkMode,
    setInput, setIsSidebarOpen, setIsArtifactsOpen,
    setIsDocumentsModalOpen, closeAll, handleInputChange,
    handleDocumentSelect, handleOpenArtifact, handleCloseMindMapModal,
    toggleDarkMode,
    
    // Handlers extraídos
    handlers,
    
    // Estados calculados
    botStatus, isTyping, handleFeedback, generarMapaMental,
    
    // Props adicionales
    backendStatus,
  } = config;

  // RENDERIZADO PRINCIPAL
  return (
    <div className={`h-screen flex ${isDarkMode ? "dark bg-[#1a1a1a]" : "bg-white"}`}>
      {/* Overlay para cerrar modales en móvil */}
      {(isSidebarOpen || isArtifactsOpen || isDocumentsModalOpen || isMindMapModalOpen || isHelpPanelOpen) && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={closeAll} 
        />
      )}

      {/* Sidebar */}
      <div className={`fixed top-0 left-0 h-full w-80 z-40 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <Sidebar
          documents={documentsList}
          chats={chats}
          onNewChat={handlers.handleNewChatClick}
          onDocumentSelect={handleDocumentSelect}
          onSelectChat={handlers.handleSelectChat}
          onDeleteChat={handlers.handleDeleteChat}
          onRenameChat={handlers.handleRenameChat}
          onLogout={handlers.handleLogout}
          botStatus={botStatus}
          isDarkMode={isDarkMode}
          isOpen={true}
          backendStatus={backendStatus}
          onClose={() => setIsSidebarOpen(false)}
          onModalOpen={() => setIsDocumentsModalOpen(true)}
          onArtifactsModalOpen={() => setIsArtifactsOpen(true)}
          LogoUCT={LogoUCT}
          toggleDarkMode={toggleDarkMode}
          onViewMapas={handlers.handleViewMindMap}
          currentChatId={currentChat?.conversacionId || currentChat?.id}
        />
      </div>

      {/* Área principal del chat */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${!isMobile && isSidebarOpen ? "lg:ml-80" : ""}`}>
        {/* Header */}
        <ChatHeader
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          botStatus={botStatus}
          currentChat={currentChat}
          isDarkMode={isDarkMode}
          artifacts={artifacts}
          isArtifactsOpen={isArtifactsOpen}
          setIsArtifactsOpen={setIsArtifactsOpen}
          messages={messages}
          generarMapaMental={() => {
            const convId = conversationIdRef.current || currentChat.conversacionId;
            generarMapaMental(messages, convId);
          }}
          isTyping={isTyping}
          onOpenHelp={() => setIsHelpPanelOpen(true)}
        />

        {/* Área de mensajes */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto w-full px-4 py-6">
            {isTyping && (
              <div className="mb-4">
                <LoadingIndicator
                  message=""
                  type="processing"
                  isDarkMode={isDarkMode}
                />
              </div>
            )}
            <ChatMessages
              messages={messages}
              isTyping={isTyping}
              isLoadingMessages={false}
              onFeedback={handleFeedback}
              isDarkMode={isDarkMode}
              onViewMindMap={handlers.handleViewMindMap}
              onQuickAction={handlers.handleQuickActionSelect}
              onQuoteMessage={setQuotedMessage}
            />
          </div>
        </div>

        {/* Área de input */}
        <div className={`border-t ${isDarkMode ? "border-gray-800" : "border-gray-200"}`}>
          <div className="max-w-3xl mx-auto w-full">
            <ChatInput
              input={input}
              onInputChange={handleInputChange}
              onSendMessage={() => handlers.handleSendMessage(input)}
              isTyping={isTyping}
              isDarkMode={isDarkMode}
              quotedMessage={quotedMessage}
              setQuotedMessage={setQuotedMessage}
            />
          </div>
        </div>
      </div>

      {/* Modales Lazy */}
      {isArtifactsOpen && (
        <LazyRender
          component={LazyArtifactsModal}
          isOpen={isArtifactsOpen}
          onClose={() => setIsArtifactsOpen(false)}
          artifacts={artifacts}
          onOpenArtifact={handleOpenArtifact}
          onDeleteArtifact={removeArtifact}
          isDarkMode={isDarkMode}
          onGenerateArtifact={(prompt) => setInput(prompt)}
        />
      )}

      {isDocumentsModalOpen && (
        <LazyRender
          component={LazyDocumentsModal}
          isOpen={isDocumentsModalOpen}
          onClose={() => setIsDocumentsModalOpen(false)}
          onDocumentSelect={handleDocumentSelect}
          isDarkMode={isDarkMode}
        />
      )}

      {isMindMapModalOpen && (
        <LazyRender
          component={LazyMindMapModal}
          isOpen={isMindMapModalOpen}
          onClose={handleCloseMindMapModal}
          artifact={selectedArtifact}
          isDarkMode={isDarkMode}
        />
      )}

      {isHelpPanelOpen && (
        <LazyRender
          component={LazyHelpPanel}
          isDarkMode={isDarkMode}
          onClose={() => setIsHelpPanelOpen(false)}
        />
      )}
    </div>
  );
};

export default ChatInterface;
