//AI usage: over 50%
export type PropertyPricingColumn = {
  code: string;
  label: string;
};

export type PropertyPricingRow = {
  id: string; // GameProperty id
  clusterName: string;
  name: string;
  prices: Record<string, string>; // missing key = not offered
};

export type PropertyPricingTable = {
  columns: PropertyPricingColumn[];
  rows: PropertyPricingRow[];
};
