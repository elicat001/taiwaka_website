
import React from 'react';

const logoUrl = './Taiwaka logo_0.png'; 

export const COLORS = {
  brand: '#3B2182',
  deep: '#280071',
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

export const INITIAL_PRODUCTS: any[] = [
  {
    id: '1',
    name: '太哇卡甄选 (Taiwaka Reserve)',
    price: 188,
    category: 'coffee',
    image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?q=80&w=800&auto=format&fit=crop',
    description: '黑巧克力、核果、火山灰。我们的标志性中深烘焙咖啡豆。',
    tag: '原生猎寻',
    color: COLORS.aux.coffee
  },
  {
    id: '2',
    name: '山雾拼配 (Mountain Mist)',
    price: 168,
    category: 'coffee',
    image: 'https://images.unsplash.com/photo-1580915411954-282cb1b0d780?q=80&w=800&auto=format&fit=crop',
    description: '茉莉花香、野生蜂蜜、柑橘余韵。感受高海拔带来的复杂层次。',
    color: COLORS.aux.mist
  }
];

export const Icons = {
  Logo: (props: { size?: number, className?: string }) => (
    <div style={{ width: props.size || 40, height: props.size || 40 }} className={`relative flex items-center justify-center overflow-hidden ${props.className || ''}`}>
      <img src={logoUrl} alt="Taiwaka Logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={(e) => { e.currentTarget.style.opacity = '0'; }} />
    </div>
  ),
  Wordmark: (props: { color?: string, scale?: number }) => (
    <div style={{ color: props.color || 'white', transform: `scale(${props.scale || 1})`, transformOrigin: 'left center', fontFamily: "'Inter', sans-serif" }} className="font-[900] tracking-[-0.04em] flex items-baseline">
      <span className="text-2xl uppercase italic">Taiw</span>
      <span className="text-2xl uppercase italic relative mx-[2px]">ä<span className="absolute -top-[3px] left-1/2 -translate-x-1/2 flex space-x-[3px]"><span className="w-1.5 h-1.5 rounded-full bg-current"></span><span className="w-1.5 h-1.5 rounded-full bg-current"></span></span></span>
      <span className="text-2xl uppercase italic">ka</span>
    </div>
  ),
  FullIdentity: (props: { color?: string, size?: number }) => (
    <div className="flex flex-col items-center space-y-6">
      <Icons.Logo size={props.size || 100} />
      <div className="text-center">
        <h2 className="text-4xl font-[900] tracking-[-0.06em] uppercase italic flex items-baseline justify-center" style={{ color: props.color || 'white' }}>
          Taiw<span className="relative mx-[3px]">ä<span className="absolute -top-1 left-1/2 -translate-x-1/2 flex space-x-[4px]"><span className="w-1.5 h-1.5 rounded-full bg-current"></span><span className="w-1.5 h-1.5 rounded-full bg-current"></span></span></span>ka
        </h2>
        <p className="text-[10px] font-bold tracking-[1em] uppercase mt-2 opacity-60" style={{ color: props.color || 'white' }}>Hunt Pure Coffee</p>
      </div>
    </div>
  ),
  Cart: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  Search: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>,
  Menu: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>,
  Close: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>,
  Plus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>,
  Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>,
  Settings: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
};
