import { useCallback, useContext } from "react";
import { ChatContext } from "../providers/ChatContext";
import { chatService } from "../services/chatService";
import { createMessage } from "../services/chatService";

export const useArtifactManager = () => {
  const { setMessages, setSelectedArtifact, chatState } = useContext(ChatContext);

  const generarMapaMental = useCallback(async (messages, conversacionId) => {
    const lastBotMsg = [...messages].reverse().find((m) => m.sender === "bot");
    if (!lastBotMsg || !lastBotMsg.content.trim()) {
      alert("No hay contexto válido para generar un mapa mental.");
      return;
    }

    if (!conversacionId) {
      alert("La conversación debe guardarse antes de generar un mapa mental.");
      console.error("ID de conversación para asociar mapa:", conversacionId);
      return;
    }

    const mapMsg = createMessage("bot", "Generando mapa mental...", {
      artifact: true,
    });
    setMessages((prev) => [...prev, mapMsg]);

    try {
      console.log(
        "Intentando generar mapa mental. conversacionId:",
        conversacionId
      );
      const mapGenResponse = await chatService.generateMindMap({
        contexto: lastBotMsg.content,
        conversacionId,
      });

      const { mapaMental, mensaje } = mapGenResponse;
      let jsonData = mapaMental || {};
      if (typeof jsonData === "string") {
        jsonData = JSON.parse(jsonData);
      }

      const nuevoMapa = {
        id: jsonData.id,
        titulo: jsonData.titulo || `Mapa Mental`,
        fecha_creacion: new Date(jsonData.fecha_creacion),
      };
      
      // Actualizar el chat actual con el nuevo mapa
      if (chatState?.currentChat?.mapasAsociados) {
        const updatedMapasMentalesIds = [
          ...chatState.currentChat.mapasAsociados,
          nuevoMapa,
        ];

        chatState.setCurrentChat((prev) => ({
          ...prev,
          mapasAsociados: updatedMapasMentalesIds,
        }));
      }

      const artifactData = {
        id: jsonData.id,
        name: (jsonData.titulo || "Mapa Mental") + ` - ${new Date().toLocaleDateString()}`,
        type: "mindmap",
        icon: "fas fa-project-diagram",
        color: "purple",
        data: jsonData.estructura_json?.respuesta?.datos || jsonData.respuesta?.datos || jsonData.datos,
        createdAt: new Date(jsonData.fecha_creacion),
        description: "Mapa mental guardado en la base de datos",
      };

      setSelectedArtifact(artifactData);
      chatState.setIsMindMapModalOpen(true);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === mapMsg.id
            ? {
                ...m,
                content: mensaje || "Se ha generado un mapa mental.",
                artifact: true,
                artifactData: artifactData,
              }
            : m
        )
      );
    } catch (err) {
      console.error("❌ Error al generar mapa mental:", err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === mapMsg.id
            ? {
                ...m,
                content: `Error al generar mapa: ${
                  err.response?.data?.error || err.message
                }`,
              }
            : m
        )
      );
    }
  }, [setMessages, setSelectedArtifact, chatState]);

  const handleViewMindMap = useCallback(async (mapa) => {
    try {
      // Si el objeto ya tiene los datos completos, usarlos directamente
      if (mapa.data && mapa.name) {
        setSelectedArtifact(mapa);
        chatState.setIsMindMapModalOpen(true);
        return;
      }

      // Si no, cargar los datos desde el backend
      const mapaId = mapa.id || mapa.conversacionId;
      if (!mapaId) {
        console.error("ID de mapa mental no válido:", mapa);
        alert("No se pudo identificar el mapa mental.");
        return;
      }

      const response = await chatService.getMindMap(mapaId);

      if (response.success) {
        const fullMindMapData = response.mapa;

        const artifactData = {
          id: fullMindMapData.id,
          name: fullMindMapData.titulo || "Mapa Mental sin título",
          type: "mindmap",
          icon: "fas fa-project-diagram",
          color: "purple",
          data: fullMindMapData.estructura_json?.respuesta?.datos || fullMindMapData.estructura_json || fullMindMapData.respuesta?.datos || {},
          createdAt: fullMindMapData.fecha_creacion,
          description: fullMindMapData.contexto || "Sin descripción disponible",
        };

        setSelectedArtifact(artifactData);
        chatState.setIsMindMapModalOpen(true);
      }
    } catch (error) {
      console.error("Error al cargar el mapa mental:", error);
      alert("No se pudo cargar el mapa mental.");
    }
  }, [setSelectedArtifact, chatState]);

  return {
    generarMapaMental,
    handleViewMindMap,
  };
};