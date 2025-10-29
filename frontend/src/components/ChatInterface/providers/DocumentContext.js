import { createContext } from "react";

export const DocumentContext = createContext({
  documentsList: [],
  artifacts: [],
  LogoUCT: null,
  setDocumentsList: () => {},
  setArtifacts: () => {},
  addArtifact: () => {},
  removeArtifact: () => {},
  handleOpenArtifact: () => {},
});