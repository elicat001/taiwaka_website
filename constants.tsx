
import React from 'react';

// 为了实现极致的视觉清晰度和全分辨率兼容性，我们将徽标从 PNG 转换为优化的矢量 SVG。
// 这不仅减少了文件体积，还确保了在任何 Retina 或 4K 屏幕下都能保持绝对锐利。

export const COLORS = {
  brand: '#3B2182',
  deep: '#280071',
  cream: '#F9F7F2',
  white: '#FFFFFF',
  text: '#1A1A1A',
};

export const INITIAL_PRODUCTS: any[] = [
  {
    id: '1',
    name: '太哇卡甄选 (Taiwaka Reserve)',
    price: 188,
    category: 'coffee',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=1200&auto=format&fit=crop',
    description: '黑巧克力、核果、火山灰。源自海拔2100米的火山阶地。',
    tag: 'LIMITED'
  },
  {
    id: '2',
    name: '山雾拼配 (Mountain Mist)',
    price: 168,
    category: 'coffee',
    image: 'https://images.unsplash.com/photo-1580915411954-282cb1b0d780?q=80&w=1200&auto=format&fit=crop',
    description: '茉莉花香、野生蜂蜜、柑橘。在清晨的第一缕阳光中绽放。',
    tag: 'SEASONAL'
  },
  {
    id: '3',
    name: '陶瓷手冲壶 (Taiwaka Ceramic)',
    price: 450,
    category: 'equipment',
    image: 'https://images.unsplash.com/photo-1544787210-282713df82ef?q=80&w=1200&auto=format&fit=crop',
    description: '极致极简主义设计，精准控流。'
  },
  {
    id: '4',
    name: '极简随行杯 (Travel Tumbler)',
    price: 228,
    category: 'merchandise',
    image: 'https://images.unsplash.com/photo-1577931957312-58f826df18a7?q=80&w=1200&auto=format&fit=crop',
    description: '时刻锁住火山的高温记忆。'
  }
];

export const Icons = {
  Logo: (props: { size?: number, className?: string, color?: string }) => (
    <svg 
      width={props.size || 40} 
      height={props.size || 40} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={props.className}
    >
      {/* 优化的极简主义鹰形徽标 (Eagle of Precision) */}
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
    <div style={{ color: props.color || 'white', fontFamily: "'Inter', sans-serif" }} className="font-[900] tracking-[-0.04em] flex items-baseline">
      <span className="text-2xl uppercase italic">Taiw</span>
      <span className="text-2xl uppercase italic relative mx-[2px]">ä<span className="absolute -top-[3px] left-1/2 -translate-x-1/2 flex space-x-[3px]"><span className="w-1.5 h-1.5 rounded-full bg-current"></span><span className="w-1.5 h-1.5 rounded-full bg-current"></span></span></span>
      <span className="text-2xl uppercase italic">ka</span>
    </div>
  ),
  FullIdentity: (props: { color?: string, size?: number }) => (
    <div className="flex flex-col items-center space-y-4">
      <Icons.Logo size={props.size || 80} color={props.color} />
      <div className="text-center">
        <h2 className="text-3xl font-[900] tracking-[-0.06em] uppercase italic flex items-baseline justify-center" style={{ color: props.color || 'white' }}>
          Taiw<span className="relative mx-[3px]">ä<span className="absolute -top-1 left-1/2 -translate-x-1/2 flex space-x-[4px]"><span className="w-1.2 h-1.2 rounded-full bg-current"></span><span className="w-1.2 h-1.2 rounded-full bg-current"></span></span></span>ka
        </h2>
        <p className="text-[9px] font-bold tracking-[0.8em] uppercase mt-1 opacity-50" style={{ color: props.color || 'white' }}>HUNT PURE COFFEE</p>
      </div>
    </div>
  ),
  Cart: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  Search: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Menu: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>,
  Close: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  ChevronRight: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="m9 18 6-6-6-6"/></svg>,
  Settings: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
};
