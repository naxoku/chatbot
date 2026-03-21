import React from "react";
import { parameterLabels } from "../config/quickActions";

/**
 * Componente para mostrar parámetros del mensaje
 * Renderiza badges con iconos para cada parámetro aplicado
 */
interface MessageParametersProps {
  parameters?: string[];
  isUser: boolean;
}

export const MessageParameters: React.FC<MessageParametersProps> = ({
  parameters = [],
  isUser,
}) => {
  if (!parameters || parameters.length === 0) {
    return null;
  }

  return (
     <div className="mb-2 pb-2 border-b border-muted dark:border-muted/80">
      <div className="flex flex-wrap gap-1.5">
        {parameters.map((param) => {
          const paramInfo = parameterLabels[param] || {
            label: param,
            icon: "fas fa-tag",
          };

           return (
             <span
               key={param}
               className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs ${
                 isUser
                   ? "bg-muted/10 text-muted-foreground"
                   : "bg-muted/10 text-muted-foreground dark:bg-muted/20 dark:text-muted-foreground/80"
               }`}
             >
               <i className={`${paramInfo.icon} text-xs`}></i>
               <span>{paramInfo.label}</span>
             </span>
           );
        })}
      </div>
    </div>
  );
};

export default MessageParameters;
