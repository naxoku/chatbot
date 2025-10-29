import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useSessionManager } from "../../../hooks/useSessionManager";
import { useBackendStatus } from "../../../hooks/useBackendStatus";

// Contextos especializados
import { AuthContext } from "../providers/AuthContext";
import { ChatDataContext } from "../providers/ChatDataContext";
import { UIStateContext } from "../providers/UIStateContext";
import { DocumentContext } from "../providers/DocumentContext";

// Componentes
import Sidebar from "../Sidebar";
import ChatHeader from "../ChatHeader";
import ChatMessages from "../ChatMessages";
import ChatInput from "../ChatInput";
import DocumentsModal from "../../DocumentsModal/DocumentsModal";
import MindMapModal from "../../MindMapModal";
import ArtifactsModal from "../../ArtifactsModal";
import HelpPanel from "../../HelpPanel";
import LoadingIndicator from "../../LoadingIndicator";

const LoadingSpinner = ({ isDarkMode }) => (
  <div
    className={`h-screen flex items-center justify-center ${
      isDarkMode ? "bg-gray-900" : "bg-gray-50"
    }`}
  >
    <div className="text-center">
      <i className="fas fa-spinner fa-spin text-4xl text-blue-600 mb-4"></i>
      <p
        className={`text-lg ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}
      >
        Iniciando asistente DDPER...
      </p>
    </div>
  </div>
);

export const ChatContainer = () => {
  const navigate = useNavigate();
  
  // Usar contextos especializados en lugar del monolítico
  const { user, isLoading: authIsLoading } = useContext(AuthContext);
  const chatData = useContext(ChatDataContext);
  const uiState = useContext(UIStateContext);
  const documentData = useContext(DocumentContext);

  // Hooks adicionales
  const { isLoading: isLoadingSession } = useSessionManager(() => {}, () => {});
  const backendStatus = useBackendStatus();

  // Manejar logout
  const handleLogout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        localStorage.clear();
        navigate("/login", { replace: true });
      }
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      localStorage.clear();
      navigate("/login", { replace: true });
    }
  };

  // Calcular estado del bot
  const botStatus = uiState.isTyping
    ? "processing"
    : backendStatus.status === "online"
    ? "online"
    : backendStatus.status === "degraded"
    ? "processing"
    : "offline";

  // Mostrar loading mientras se verifica la sesión
  if (!user || isLoadingSession || authIsLoading) {
    return <LoadingSpinner isDarkMode={uiState.isDarkMode} />
  }

  return (
    <div
      className={`h-screen flex ${
        uiState.isDarkMode ? "dark bg-[#1a1a1a]" : "bg-white"
      }`}
    >
      {/* Overlay para cerrar modales en móvil */}
      {(uiState.isSidebarOpen ||
        uiState.isArtifactsOpen ||
        uiState.isDocumentsModalOpen ||
        uiState.isMindMapModalOpen ||
        uiState.isHelpPanelOpen) &&
        uiState.isMobile && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={uiState.closeAll}
          />
        )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 z-40 transform transition-transform duration-300 ease-in-out ${
          uiState.isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Sidebar
          documents={documentData.documentsList}
          chats={chatData.chats}
          onNewChat={chatData.handleNewChat}
          onDocumentSelect={() => {}}
          onSelectChat={chatData.handleSelectChat}
          onDeleteChat={chatData.handleDeleteChat}
          onRenameChat={chatData.handleRenameChat}
          onLogout={handleLogout}
          botStatus={botStatus}
          isDarkMode={uiState.isDarkMode}
          isOpen={true}
          backendStatus={backendStatus}
          onClose={() => uiState.setIsSidebarOpen(false)}
          onModalOpen={() => uiState.setIsDocumentsModalOpen(true)}
          onArtifactsModalOpen={() => uiState.setIsArtifactsOpen(true)}
          LogoUCT={documentData.LogoUCT}
          toggleDarkMode={uiState.toggleDarkMode}
          onViewMapas={chatData.handleViewMindMap}
          currentChatId={chatData.currentChat?.conversacionId}
        />
      </div>

      {/* Área principal del chat */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          !uiState.isMobile && uiState.isSidebarOpen ? "lg:ml-80" : ""
        }`}
      >
        {/* Header */}
        <ChatHeader
          isSidebarOpen={uiState.isSidebarOpen}
          setIsSidebarOpen={uiState.setIsSidebarOpen}
          botStatus={botStatus}
          currentChat={chatData.currentChat}
          isDarkMode={uiState.isDarkMode}
          artifacts={documentData.artifacts}
          isArtifactsOpen={uiState.isArtifactsOpen}
          setIsArtifactsOpen={uiState.setIsArtifactsOpen}
          messages={chatData.messages}
          generarMapaMental={() => {
            const convId = chatData.currentChat?.conversacionId;
            if (convId) {
              chatData.generarMapaMental(chatData.messages, convId);
            }
          }}
          isTyping={uiState.isTyping}
          onOpenHelp={() => uiState.setIsHelpPanelOpen(true)}
        />

        {/* Área de mensajes */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto w-full px-4 py-6">
            {uiState.isTyping && (
              <div className="mb-4">
                <LoadingIndicator
                  message=""
                  type="processing"
                  isDarkMode={uiState.isDarkMode}
                />
              </div>
            )}
            <ChatMessages
              messages={chatData.messages}
              isTyping={uiState.isTyping}
              isLoadingMessages={chatData.isLoadingMessages}
              onFeedback={chatData.handleFeedback}
              isDarkMode={uiState.isDarkMode}
              onViewMindMap={chatData.handleViewMindMap}
              onQuickAction={() => {}}
              onQuoteMessage={chatData.setQuotedMessage}
            />
          </div>
        </div>

        {/* Área de input */}
        <div
          className={`border-t ${
            uiState.isDarkMode ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <div className="max-w-3xl mx-auto w-full">
            <ChatInput
              input={uiState.input}
              onInputChange={uiState.setInput}
              onSendMessage={chatData.sendMessage}
              isTyping={uiState.isTyping}
              isDarkMode={uiState.isDarkMode}
              quotedMessage={chatData.quotedMessage}
              setQuotedMessage={chatData.setQuotedMessage}
            />
          </div>
        </div>
      </div>

      {/* Modales */}
      {uiState.isArtifactsOpen && (
        <ArtifactsModal
          isOpen={uiState.isArtifactsOpen}
          onClose={() => uiState.setIsArtifactsOpen(false)}
          artifacts={documentData.artifacts}
          onOpenArtifact={documentData.handleOpenArtifact}
          onDeleteArtifact={documentData.removeArtifact}
          isDarkMode={uiState.isDarkMode}
          onGenerateArtifact={(prompt) => uiState.setInput(prompt)}
        />
      )}

      {uiState.isDocumentsModalOpen && (
        <DocumentsModal
          isOpen={uiState.isDocumentsModalOpen}
          onClose={() => uiState.setIsDocumentsModalOpen(false)}
          onDocumentSelect={() => {}}
          isDarkMode={uiState.isDarkMode}
        />
      )}

      {uiState.isMindMapModalOpen && (
        <MindMapModal
          isOpen={uiState.isMindMapModalOpen}
          onClose={() => uiState.setIsMindMapModalOpen(false)}
          artifact={uiState.selectedArtifact}
          isDarkMode={uiState.isDarkMode}
        />
      )}

      {uiState.isHelpPanelOpen && (
        <HelpPanel
          isDarkMode={uiState.isDarkMode}
          onClose={() => uiState.setIsHelpPanelOpen(false)}
        />
      )}
    </div>
  );
};