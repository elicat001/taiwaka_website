
export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'coffee' | 'merchandise' | 'equipment';
  image: string;
  description: string;
  tag?: string;
  color?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export type Page = 'home' | 'shop' | 'story' | 'cart';
