export type RootStackParamList = {
  Main: undefined;
  ProductDetails: { item: ScannedItem };
  Paywall: undefined;
};

export type TabParamList = {
  HomeTab: undefined;
  HistoryTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  Scan: undefined;
  Paywall: undefined;
};

export type HistoryStackParamList = {
  History: undefined;
};

export interface NutrientValue {
  value: number;
  unit: string;
  per: string;
}

export interface ScannedItem {
  id: string;
  barcode: string;
  productName: string;
  brand: string;
  timestamp: Date;
  qualityScore: number;
  nutrients?: {
    calories: NutrientValue;
    protein: NutrientValue;
    carbs: NutrientValue;
    fat: NutrientValue;
    fiber: NutrientValue;
    sugar: NutrientValue;
    sodium: NutrientValue;
  };
}

export interface ProductInfo {
  name: string;
  brand: string;
  barcode: string;
  qualityScore: number;
  nutrients: {
    calories: NutrientValue;
    protein: NutrientValue;
    carbs: NutrientValue;
    fat: NutrientValue;
    fiber: NutrientValue;
    sugar: NutrientValue;
    sodium: NutrientValue;
  };
  healthWarnings: string[];
  benefits: string[];
}