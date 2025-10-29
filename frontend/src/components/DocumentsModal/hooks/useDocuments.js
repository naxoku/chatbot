import { useState, useEffect, useCallback } from "react";
import { documentService } from "../services/documentService";

export const useDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await documentService.fetchDocuments();
      setDocuments(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const getCategories = useCallback(() => {
    // Garantizar que getCategories siempre retorne un array válido
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return ["all"];
    }
    
    const result = documentService.getDocumentCategories(documents);
    
    // Asegurar que el resultado sea un array
    return Array.isArray(result) ? result : ["all"];
  }, [documents]);

  const filterDocuments = useCallback((searchTerm, selectedCategory) => {
    return documentService.filterDocuments(documents, searchTerm, selectedCategory);
  }, [documents]);

  return {
    documents,
    loading,
    error,
    reloadDocuments: loadDocuments,
    getCategories,
    filterDocuments
  };
};