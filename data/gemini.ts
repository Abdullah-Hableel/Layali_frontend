export type SuggestionItem = { _id: string; reason?: string };

export type VendorLite = {
  _id: string;
  business_name: string;
  logo?: string | null;
};

export type SuggestedItem = {
  _id: string;
  name?: string;
  price?: number;
  reason?: string;
  image?: string | null;
  type?: string | null;
  categories?: string[];
  vendor?: VendorLite | null;
};

export type SuggestionsResponse =
  | {
      strategy: "gemini";
      budget: number | null;
      selection: SuggestionItem[];
      totalPrice: number;
      rationale?: string;
      notes?: string;
      items?: SuggestedItem[];
    }
  | {
      strategy: "fallback";
      budget: number | null;
      items?: SuggestedItem[];
      selection?: SuggestionItem[];
      totalPrice?: number;
      rationale?: string;
      notes?: string;
    };

export type SuggestionRequest = {
  requiredCategories?: string[];
};
