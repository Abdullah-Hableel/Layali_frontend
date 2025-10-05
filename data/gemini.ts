export type SuggestionItem = { _id: string; reason?: string };

export type SuggestionsResponse =
  | {
      strategy: "gemini";
      budget: number | null;
      selection: SuggestionItem[];
      totalPrice: number;
      rationale?: string;
      notes?: string;
      items?: Array<{
        _id: string;
        name?: string;
        price?: number;
        reason?: string;
      }>;
    }
  | {
      strategy: "fallback";
      budget: number | null;
      items?: Array<{
        _id: string;
        name?: string;
        price?: number;
        reason?: string;
      }>;
      selection?: SuggestionItem[];
      totalPrice?: number;
      rationale?: string;
      notes?: string;
    };
export type SuggestionRequest = {
  requiredCategories?: string[];
};
