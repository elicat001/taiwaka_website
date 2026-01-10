import React from 'react';
import type { Product, ProductCategory } from './types';

// 品牌色彩系统
export const COLORS = {
  brand: '#3B2182',
  deep: '#280071',
  cream: '#F9F7F2',
  white: '#FFFFFF',
  text: '#1A1A1A',
  muted: '#8E8E93',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
} as const;

// 产品分类配置
export const PRODUCT_CATEGORIES: { key: ProductCategory; label: string; labelEn: string }[] = [
  { key: 'coffee', label: '精品咖啡', labelEn: 'Coffee' },
  { key: 'equipment', label: '冲煮器具', labelEn: 'Equipment' },
  { key: 'merchandise', label: '周边商品', labelEn: 'Merchandise' },
];

// 初始产品数据（开发/演示用）
export const INITIAL_PRODUCTS: Omit<Product, 'createdAt' | 'updatedAt'>[] = [
  {
    id: 1,
    name: '太哇卡甄选 (Taiwaka Reserve)',
    price: '188.00',
    category: 'coffee',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=1200&auto=format&fit=crop',
    description: '黑巧克力、核果、火山灰。源自海拔2100米的火山阶地。',
    specifications: {
      origin: '东非火山带',
      roastLevel: '中深烘焙',
      flavor: '黑巧克力、核果、火山灰',
      altitude: '2100m',
      process: '水洗处理',
      weight: '200g',
    },
    stock: 50,
    featured: 1,
    tag: 'LIMITED',
    isActive: 1,
  },
  {
    id: 2,
    name: '山雾拼配 (Mountain Mist)',
    price: '168.00',
    category: 'coffee',
    image: 'https://images.unsplash.com/photo-1580915411954-282cb1b0d780?q=80&w=1200&auto=format&fit=crop',
    description: '茉莉花香、野生蜂蜜、柑橘。在清晨的第一缕阳光中绽放。',
    specifications: {
      origin: '云南高山',
      roastLevel: '中度烘焙',
      flavor: '茉莉花香、野生蜂蜜、柑橘',
      altitude: '1800m',
      process: '日晒处理',
      weight: '200g',
    },
    stock: 80,
    featured: 1,
    tag: 'SEASONAL',
    isActive: 1,
  },
  {
    id: 3,
    name: '火山深烘 (Volcanic Dark)',
    price: '198.00',
    category: 'coffee',
    image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=1200&auto=format&fit=crop',
    description: '浓郁可可、烟熏木质、深邃矿物感。火山土壤的终极表达。',
    specifications: {
      origin: '印尼苏门答腊',
      roastLevel: '深度烘焙',
      flavor: '浓郁可可、烟熏木质、矿物',
      altitude: '1600m',
      process: '湿刨处理',
      weight: '200g',
    },
    stock: 30,
    featured: 0,
    tag: 'BESTSELLER',
    isActive: 1,
  },
  {
    id: 4,
    name: '陶瓷手冲壶 (Taiwaka Ceramic)',
    price: '450.00',
    category: 'equipment',
    image: 'https://images.unsplash.com/photo-1544787210-282713df82ef?q=80&w=1200&auto=format&fit=crop',
    description: '极致极简主义设计，精准控流。手工陶瓷工艺，每一件都是独特的艺术品。',
    specifications: {
      material: '高温陶瓷',
      capacity: '600ml',
      weight: '380g',
    },
    stock: 20,
    featured: 1,
    tag: null,
    isActive: 1,
  },
  {
    id: 5,
    name: '精准测量杯 (Precision Glass)',
    price: '128.00',
    category: 'equipment',
    image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=1200&auto=format&fit=crop',
    description: '耐热玻璃材质，精准刻度，专业级萃取伙伴。',
    specifications: {
      material: '高硼硅玻璃',
      capacity: '500ml',
      weight: '220g',
    },
    stock: 45,
    featured: 0,
    tag: null,
    isActive: 1,
  },
  {
    id: 6,
    name: '极简随行杯 (Travel Tumbler)',
    price: '228.00',
    category: 'merchandise',
    image: 'https://images.unsplash.com/photo-1577931957312-58f826df18a7?q=80&w=1200&auto=format&fit=crop',
    description: '时刻锁住火山的高温记忆。双层真空保温，12小时恒温体验。',
    specifications: {
      material: '304不锈钢',
      capacity: '350ml',
      insulation: '12小时保温',
    },
    stock: 60,
    featured: 1,
    tag: 'NEW',
    isActive: 1,
  },
];

// API 端点配置
export const API_ENDPOINTS = {
  products: '/api/products',
  cart: '/api/cart',
  orders: '/api/orders',
  customers: '/api/customers',
  stock: '/api/stock',
  stats: '/api/stats/dashboard',
} as const;

// 订单状态配置
export const ORDER_STATUS_CONFIG = {
  pending: { label: '待处理', color: COLORS.warning },
  confirmed: { label: '已确认', color: COLORS.brand },
  processing: { label: '处理中', color: COLORS.brand },
  shipped: { label: '已发货', color: COLORS.success },
  completed: { label: '已完成', color: COLORS.success },
  cancelled: { label: '已取消', color: COLORS.error },
} as const;

// 图标组件
export const Icons = {
  Logo: (props: { size?: number; className?: string; color?: string }) => (
    <svg
      width={props.size || 40}
      height={props.size || 40}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={props.className}
    >
      <circle cx="50" cy="50" r="48" stroke={props.color || 'currentColor'} strokeWidth="2" />
      <path
        d="M30 50C30 38.9543 38.9543 30 50 30L70 45L50 60C38.9543 60 30 51.0457 30 50Z"
        fill={props.color || 'currentColor'}
      />
      <path
        d="M50 30L65 30L70 45L65 60L50 60"
        stroke={props.color || 'currentColor'}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <circle cx="48" cy="45" r="3" fill="white" />
    </svg>
  ),

  Wordmark: (props: { color?: string }) => (
    <div
      style={{ color: props.color || 'white', fontFamily: "'Inter', sans-serif" }}
      className="font-[900] tracking-[-0.04em] flex items-baseline"
    >
      <span className="text-2xl uppercase italic">Taiw</span>
      <span className="text-2xl uppercase italic relative mx-[2px]">
        a
        <span className="absolute -top-[3px] left-1/2 -translate-x-1/2 flex space-x-[3px]">
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
        </span>
      </span>
      <span className="text-2xl uppercase italic">ka</span>
    </div>
  ),

  FullIdentity: (props: { color?: string; size?: number }) => (
    <div className="flex flex-col items-center space-y-4">
      <Icons.Logo size={props.size || 80} color={props.color} />
      <div className="text-center">
        <h2
          className="text-3xl font-[900] tracking-[-0.06em] uppercase italic flex items-baseline justify-center"
          style={{ color: props.color || 'white' }}
        >
          Taiw
          <span className="relative mx-[3px]">
            a
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 flex space-x-[4px]">
              <span className="w-1.2 h-1.2 rounded-full bg-current"></span>
              <span className="w-1.2 h-1.2 rounded-full bg-current"></span>
            </span>
          </span>
          ka
        </h2>
        <p
          className="text-[9px] font-bold tracking-[0.8em] uppercase mt-1 opacity-50"
          style={{ color: props.color || 'white' }}
        >
          HUNT PURE COFFEE
        </p>
      </div>
    </div>
  ),

  Cart: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),

  Search: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  ),

  Menu: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  ),

  Close: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  ),

  ChevronRight: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="m9 18 6-6-6-6" />
    </svg>
  ),

  ChevronLeft: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="m15 18-6-6 6-6" />
    </svg>
  ),

  Settings: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),

  Plus: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),

  Minus: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14" />
    </svg>
  ),

  Trash: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),

  Check: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),

  AlertCircle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),

  Package: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="m16.5 9.4-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.29 7 12 12 20.71 7" />
      <line x1="12" y1="22" x2="12" y2="12" />
    </svg>
  ),

  Users: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),

  ShoppingBag: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" />
    </svg>
  ),

  TrendingUp: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  ),

  Coffee: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4zM6 2v2M10 2v2M14 2v2" />
    </svg>
  ),
};

// 工具函数：格式化价格
export function formatPrice(price: string | number): string {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  return `¥${numPrice.toFixed(2)}`;
}

// 工具函数：生成会话ID
export function generateSessionId(): string {
  return `sess_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

// 工具函数：获取或创建会话ID
export function getSessionId(): string {
  const key = 'taiwaka_session_id';
  let sessionId = localStorage.getItem(key);
  if (!sessionId) {
    sessionId = generateSessionId();
    localStorage.setItem(key, sessionId);
  }
  return sessionId;
}
