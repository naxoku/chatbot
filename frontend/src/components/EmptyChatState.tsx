import React from "react";
import { MessageCircle, FileText, Brain } from "lucide-react";

interface EmptyChatStateProps {
  conversationTitle: string;
}

export const EmptyChatState: React.FC<EmptyChatStateProps> = () => {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md md:max-w-2xl mx-auto p-6 md:p-8">
        <div className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 bg-muted rounded-full flex items-center justify-center">
          <MessageCircle className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground" aria-hidden="true" />
        </div>
        <h3 className="text-lg md:text-2xl font-medium md:font-semibold text-foreground mb-2 md:mb-4">
          Asistente Virtual VRAE
        </h3>

        <div className="mt-4 md:mt-6 space-y-4">
          <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-lg bg-muted/30">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <FileText className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm md:text-base font-medium text-foreground">1. Selecciona documentos</p>
              <p className="text-xs md:text-sm text-muted-foreground">Elige documentos relevantes para contexto específico</p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-lg bg-muted/30">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <MessageCircle className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm md:text-base font-medium text-foreground">2. Escribe tu consulta</p>
              <p className="text-xs md:text-sm text-muted-foreground">Pregunta sobre reglamentos, formularios o procedimientos</p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-lg bg-muted/30">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Brain className="w-4 h-4 md:w-5 md:h-5 text-primary" />
            </div>
            <div className="text-left">
              <p className="text-sm md:text-base font-medium text-foreground">3. Obtén respuesta precisa</p>
              <p className="text-xs md:text-sm text-muted-foreground">El asistente analiza los documentos seleccionados</p>
            </div>
          </div>

          <div className="mt-4 md:mt-6 p-3 md:p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs md:text-sm text-center text-muted-foreground">
              💡 <strong>Ejemplo:</strong> Selecciona documentos de becas y pregunta<br />
              <em>"¿Cuáles son los requisitos para solicitar una beca?"</em>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyChatState;
