
export enum Fragility {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export interface PackingItem {
  id: string;
  name: string;
  category: string;
  fragility: Fragility;
  timestamp: number;
}

export interface DetectedItem {
  name: string;
  category: string;
  fragility: Fragility;
}
