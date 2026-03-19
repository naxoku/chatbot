import React from "react";
import { MessageCircle, FileText, Lightbulb, Share2, Zap } from "lucide-react";

interface EmptyChatStateProps {
  conversationTitle: string;
}

export const EmptyChatState: React.FC<EmptyChatStateProps> = () => {
  const features = [
    {
      icon: Lightbulb,
      title: "Preguntas y respuestas",
      description: "Haz consultas detalladas y obtén respuestas precisas",
    },
    {
      icon: FileText,
      title: "Buscar documentos",
      description: "Busca y descarga documentos específicos",
    },
    {
      icon: Share2,
      title: "Mapas mentales",
      description: "Visualiza conceptos de forma gráfica",
    },
  ];

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-2xl mx-auto p-6">
        <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
          <MessageCircle className="h-8 w-8 text-muted-foreground" />
        </div>

        <h3 className="text-2xl font-semibold text-foreground mb-2">
          Escribe cualquier pregunta o consulta
        </h3>

        <p className="text-sm text-muted-foreground mb-8">
          Estoy aquí para ayudarte con preguntas, crear documentos y más.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="p-4 rounded-lg border border-border/50 hover:border-border hover:bg-muted/30 transition-colors"
              >
                <Icon className="h-6 w-6 text-muted-foreground mb-2 mx-auto" />
                <h4 className="font-medium text-foreground text-sm mb-1">
                  {feature.title}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="bg-muted/50 rounded-lg p-4 text-left">
          <div className="flex items-start gap-3">
            <Zap className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Consejo:</strong> Sé
              específico en tus preguntas para obtener mejores resultados
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyChatState;
