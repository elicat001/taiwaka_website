/**
 * 统一类型定义 - 前后端共享
 * 与 drizzle/schema.ts 保持同步
 */

// ============ 产品相关类型 ============

export type ProductCategory = 'coffee' | 'merchandise' | 'equipment';

export type ProductTag = 'LIMITED' | 'SEASONAL' | 'NEW' | 'BESTSELLER';

export interface ProductSpecifications {
  origin?: string;
  roastLevel?: string;
  flavor?: string;
  altitude?: string;
  process?: string;
  weight?: string;
  [key: string]: string | undefined;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: string; // decimal 类型从数据库返回为字符串
  category: ProductCategory;
  image: string | null;
  specifications: ProductSpecifications | null;
  stock: number;
  featured: number;
  tag: ProductTag | string | null;
  isActive: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductInput {
  name: string;
  description?: string;
  price: string | number;
  category?: ProductCategory;
  image?: string;
  specifications?: ProductSpecifications;
  stock?: number;
  featured?: number;
  tag?: string;
  isActive?: number;
}

// ============ 购物车相关类型 ============

export interface CartItem {
  id: number;
  sessionId: string;
  productId: number;
  quantity: number;
  createdAt: Date;
  // 关联的产品信息（JOIN 查询时填充）
  product?: Product;
}

export interface CartItemInput {
  sessionId: string;
  productId: number;
  quantity?: number;
}

// 前端购物车显示用（包含产品详情）
export interface CartDisplayItem extends Product {
  cartItemId: number;
  quantity: number;
}

// ============ 客户相关类型 ============

export interface Customer {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  address: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerInput {
  email: string;
  name: string;
  phone?: string;
  address?: string;
}

// ============ 订单相关类型 ============

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'completed' | 'cancelled';

export interface Order {
  id: number;
  orderNumber: string;
  customerId: number | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  shippingAddress: string | null;
  totalPrice: string;
  status: OrderStatus;
  note: string | null;
  createdAt: Date;
  updatedAt: Date;
  // 关联数据
  items?: OrderItem[];
  customer?: Customer;
}

export interface OrderInput {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: string;
  items: OrderItemInput[];
  note?: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  productImage: string | null;
  price: string;
  quantity: number;
  subtotal: string;
  createdAt: Date;
}

export interface OrderItemInput {
  productId: number;
  quantity: number;
}

// ============ 库存相关类型 ============

export type StockChangeReason = 'order' | 'adjustment' | 'return' | 'initial';

export interface StockLog {
  id: number;
  productId: number;
  changeAmount: number;
  reason: StockChangeReason;
  referenceId: number | null;
  previousStock: number;
  newStock: number;
  createdAt: Date;
}

// ============ 页面路由类型 ============

export type Page = 'home' | 'shop' | 'story' | 'cart' | 'checkout' | 'admin';

// ============ API 响应类型 ============

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============ 搜索和过滤类型 ============

export interface ProductSearchParams {
  q?: string;           // 搜索关键词
  category?: ProductCategory;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  sortBy?: 'price' | 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface OrderSearchParams {
  status?: OrderStatus;
  customerEmail?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'createdAt' | 'totalPrice';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// ============ 工具类型 ============

// 将 Product 转换为前端显示格式
export function formatProductPrice(product: Product): number {
  return parseFloat(product.price);
}

// 计算购物车总价
export function calculateCartTotal(items: CartDisplayItem[]): number {
  return items.reduce((total, item) => {
    return total + parseFloat(item.price) * item.quantity;
  }, 0);
}
