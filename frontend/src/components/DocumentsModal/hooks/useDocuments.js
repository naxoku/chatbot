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
    return documentService.getDocumentCategories(documents);
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