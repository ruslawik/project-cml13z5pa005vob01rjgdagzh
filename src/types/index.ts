export type RootStackParamList = {
  Home: undefined;
  Scan: undefined;
};

export type TabParamList = {
  Scanner: undefined;
  History: undefined;
};

export interface ScannedItem {
  id: string;
  barcode: string;
  productName: string;
  brand: string;
  timestamp: Date;
  qualityScore: number;
}

export interface NutrientValue {
  value: number;
  unit: string;
  per: string;
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