export interface FridgeItem {
  id: string;
  group_id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  photo_url?: string;
  production_date?: string;
  expire_date: string;
  source: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface FridgeItemUI {
  id: string;
  name: string;
  quantity: string;
  image: string;
  bgClass: string;
  emoji: string;
  statusType: 'success' | 'warning' | 'error';
  statusText: string;
  statusIcon: string;
  customImageStyle?: string;
  customImageClass?: string;
  customCardClass?: string;
  selected: boolean;
}

export interface RecognizedFridgeData {
  name: string;
  category: string;
  quantity: number;
  unit: string;
  production_date?: string;
  expire_date?: string;
}
