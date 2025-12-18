
export interface Product {
  id: string;
  name: string;
  price: number;
  category: 'coffee' | 'merchandise' | 'equipment';
  image: string;
  images?: string[];
  description: string;
  tag?: string;
}

export interface Review {
  id: string;
  productId: string;
  rating: number;
  comment: string;
  author: string;
  date: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  coordinates: { lat: number; lng: number };
  image: string;
}

export type Page = 'home' | 'shop' | 'locations' | 'story' | 'cart';
