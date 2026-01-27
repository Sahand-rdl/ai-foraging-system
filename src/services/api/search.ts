import { apiRequest } from "./client";

export interface SearchQuery {
  query: string;
  search_type: "keyword" | "semantic";
}

export interface SearchResultItem {
  filename: string;
  snippet: string;
  type: string;
  score?: number;
}

export interface SearchResponse {
  results: SearchResultItem[];
}

export const searchApi = {
  search: (data: SearchQuery) => 
    apiRequest<SearchResponse>("/search/", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};
