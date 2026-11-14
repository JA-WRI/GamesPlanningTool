//AI usage: over 50%
export type PropertyPricingColumn = {
  code: string;
  label: string;
};

export type PropertyPricingRow = {
  id: string;
  clusterName: string;
  name: string;
  prices: Record<string, string>;
};

export type PropertyPricingTable = {
  columns: PropertyPricingColumn[];
  rows: PropertyPricingRow[];
};
