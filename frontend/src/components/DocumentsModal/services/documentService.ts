import axios from "axios";
import { API_BASE, API_MINIO_BASE } from "@/config";

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
      // Fetch list of objects from MinIO through backend
      const response = await axios.get(`${API_MINIO_BASE}/list`);
      const files: string[] = response.data?.files || [];

      // Map MinIO keys to frontend Document shape
      const documents: Document[] = files.map((key) => {
        const segments = key.split("/");
        const filename = segments[segments.length - 1] || key;
        const category = segments.length > 1 ? segments[0] : "Archivos";
        const extMatch = filename.match(/\.([0-9a-z]+)$/i);

        const type = extMatch ? extMatch[1].toLowerCase() : "file";
        const id = `minio-${encodeURIComponent(key)}`;
        const url = `${API_MINIO_BASE}/download?key=${encodeURIComponent(key)}`;

        return {
          id,
          title: filename,
          description: filename,
          category,
          type,
          url,
          keywords: [],
        };
      });

      return documents;
    } catch (error) {
      console.error("Error fetching documents from MinIO:", error);
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