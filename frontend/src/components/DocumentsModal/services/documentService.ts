import axios from "axios";
import { API_BASE } from "@/config";

interface Document {
  id: string;
  title: string;
  description: string;
  category: string;
  type: string;
  url: string;
  keywords?: string[];
}

export const documentService = {
  async fetchDocuments(): Promise<Document[]> {
    try {
      const response = await axios.get(`${API_BASE}/api/documentos`);
      return response.data;
    } catch (error) {
      console.error("Error fetching documents:", error);
      throw error;
    }
  },

  getDocumentCategories(documents: Document[]): string[] {
    if (!documents || documents.length === 0) return ["all"];

    const categories = documents.map((doc) => doc.category);
    return ["all", ...new Set(categories)];
  },

  filterDocuments(
    documents: Document[],
    searchTerm: string,
    selectedCategory: string
  ): Document[] {
    if (!documents) return [];

    const searchTermLower = searchTerm.toLowerCase();

    return documents.filter((doc) => {
      const titleMatch =
        doc.title?.toLowerCase().includes(searchTermLower) || false;
      const descriptionMatch =
        doc.description?.toLowerCase().includes(searchTermLower) || false;
      const keywordsMatch =
        Array.isArray(doc.keywords) &&
        doc.keywords.some((keyword) =>
          keyword.toLowerCase().includes(searchTermLower)
        );

      const matchesSearch = titleMatch || descriptionMatch || keywordsMatch;
      const matchesCategory =
        selectedCategory === "all" || doc.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  },
};