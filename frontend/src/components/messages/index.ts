// Exportaciones principales - Solo lo que realmente se usa
export { BotMessage } from "./BotMessage";
export { UserMessage } from "./UserMessage";

// Exportaciones de componentes auxiliares que se usan dentro de BotMessage/UserMessage
export { default as MarkdownRenderer } from "./MarkdownRenderer";
export { default as MessageActions } from "./MessageActions";
export { default as MessageArtifacts } from "./MessageArtifacts";
export { default as MessageParameters } from "./MessageParameters";
export { default as MessageQuickActions } from "./MessageQuickActions";

// Exportaciones de configuración
export * from "../config/quickActions";
