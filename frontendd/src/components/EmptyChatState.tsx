import React from "react";
import { MessageCircle } from "lucide-react";

interface EmptyChatStateProps {
  conversationTitle: string;
}

export const EmptyChatState: React.FC<EmptyChatStateProps> = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
          <MessageCircle className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium text-foreground mb-2">
          Nueva conversación
        </h3>

        <div className="mt-4 text-sm text-muted-foreground/80">
          <p>Escribe cualquier pregunta o consulta</p>
        </div>
      </div>
    </div>
  );
};

export default EmptyChatState;
