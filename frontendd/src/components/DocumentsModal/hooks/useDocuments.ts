import { useState, useEffect, useCallback } from "react";
import { documentService } from "../services/documentService";

interface Document {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  url: string;
  keywords?: string[];
}

export const useDocuments = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await documentService.fetchDocuments();
      setDocuments(data);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  const getCategories = useCallback(() => {
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return ["all"];
    }

    const result = documentService.getDocumentCategories(documents);
    return Array.isArray(result) ? result : ["all"];
  }, [documents]);

  const filterDocuments = useCallback(
    (searchTerm: string, selectedCategory: string) => {
      return documentService.filterDocuments(
        documents,
        searchTerm,
        selectedCategory
      );
    },
    [documents]
  );

  return {
    documents,
    loading,
    error,
    reloadDocuments: loadDocuments,
    getCategories,
    filterDocuments,
  };
};