
import React from 'react';

/**
 * 💡 核心说明：使用您上传的本地图片
 * 请确保您的 Logo 文件保存在项目根目录，并命名为 logo.png
 * 如果文件名不同，请修改下方的 LOGO_PATH 变量。
 */
const LOGO_PATH = './logo.png'; 

export const COLORS = {
  brand: '#3B2182',      // Taiwäka 主紫色
  deep: '#280071',       // 深紫色
  white: '#FFFFFF',
  aux: {
    coffee: '#ca3604',
    equip: '#2c5234',
    merch: '#f65275',
    lab: '#280071',
    mist: '#009cde'
  },
  dark: '#1A1A1A',
};

export const PRODUCTS: any[] = [
  {
    id: '1',
    name: '太哇卡甄选 (Taiwaka Reserve)',
    price: 188,
    category: 'coffee',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?q=80&w=800&auto=format&fit=crop'
    ],
    description: '黑巧克力、核果、火山灰。我们的标志性中深烘焙咖啡豆。产自非洲东部高海拔地区，经过严格的猎寻筛选，为您呈现咖啡原生风味的深邃层次感。',
    tag: '原生猎寻',
    color: COLORS.aux.coffee
  },
  {
    id: '2',
    name: '山雾拼配 (Mountain Mist)',
    price: 168,
    category: 'coffee',
    image: 'https://images.unsplash.com/photo-1580915411954-282cb1b0d780?q=80&w=800&auto=format&fit=crop',
    description: '茉莉花香、野生蜂蜜、柑橘余韵。感受高海拔带来的复杂层次。如清晨山雾般清新且充满变幻，是每一个清晨最轻盈的唤醒。',
    color: COLORS.aux.mist
  },
  {
    id: '3',
    name: '溪谷日出 (Valley Sunrise)',
    price: 148,
    category: 'coffee',
    image: 'https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?q=80&w=800&auto=format&fit=crop',
    description: '烤杏仁、红糖、低酸度。平衡温润的清晨之选。这款豆子在日晒处理中获得了极佳的甜度平衡。',
    color: COLORS.aux.coffee
  }
];

export const LOCATIONS: any[] = [
  {
    id: 'L0',
    name: '一带一路商务中心 (总部)',
    city: '重庆',
    address: '江北区金渝大道 2 号楼 13 层',
    image: 'https://images.unsplash.com/photo-1577412647305-991150c7d163?q=80&w=800&auto=format&fit=crop'
  }
];

export const Icons = {
  /** 
   * 使用本地图片路径的 Logo 组件
   */
  Logo: (props: { size?: number, className?: string }) => (
    <div style={{ width: props.size || 40, height: props.size || 40 }} className={`relative flex items-center justify-center ${props.className || ''}`}>
      <img 
        src={LOGO_PATH} 
        alt="Taiwaka Logo" 
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        onError={(e) => {
          // 如果图片加载失败，显示一个带有品牌色的圆形占位符，避免空白
          e.currentTarget.style.display = 'none';
          const parent = e.currentTarget.parentElement;
          if (parent) parent.innerHTML = `<div style="width:100%; height:100%; border-radius:50%; background:white; display:flex; align-items:center; justify-center; color:#3B2182; font-weight:900; font-size:10px;">AAA</div>`;
        }}
      />
    </div>
  ),
  
  /** 品牌字标：保持 CSS 渲染以确保在不同缩放下的清晰度 */
  Wordmark: (props: { color?: string, scale?: number }) => (
    <div 
      style={{ 
        color: props.color || 'white', 
        transform: `scale(${props.scale || 1})`, 
        transformOrigin: 'left center',
        fontFamily: "'Inter', sans-serif" 
      }} 
      className="font-[900] tracking-[-0.04em] flex items-baseline"
    >
      <span className="text-2xl uppercase italic">Taiw</span>
      <span className="text-2xl uppercase italic relative mx-[2px]">
        ä
        <span className="absolute -top-[3px] left-1/2 -translate-x-1/2 flex space-x-[3px]">
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
        </span>
      </span>
      <span className="text-2xl uppercase italic">ka</span>
      <span className="ml-4 font-light text-[9px] tracking-[0.6em] opacity-40 uppercase hidden sm:inline-block">Specialty Roasters</span>
    </div>
  ),

  /** 完整身份标识：组合图片 Logo 和字标 */
  FullIdentity: (props: { color?: string, size?: number }) => (
    <div className="flex flex-col items-center space-y-8">
      {/* Fix: use props.size instead of size which was undefined */}
      <Icons.Logo size={props.size || 100} />
      <div className="text-center">
        <h2 className="text-5xl font-[900] tracking-[-0.06em] uppercase italic flex items-baseline justify-center" style={{ color: props.color || 'white' }}>
          Taiw
          <span className="relative mx-[3px]">
            ä
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 flex space-x-[4px]">
              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
              <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
            </span>
          </span>
          ka
        </h2>
        <p className="text-[12px] font-bold tracking-[1em] uppercase mt-4 opacity-40" style={{ color: props.color || 'white' }}>Hunt Pure Coffee</p>
      </div>
    </div>
  ),

  Cart: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
    </svg>
  ),
  Search: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
    </svg>
  ),
  Menu: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
    </svg>
  ),
  Close: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  ),
  ChevronLeft: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 18-6-6 6-6"/>
    </svg>
  ),
  ChevronRight: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6"/>
    </svg>
  )
};
