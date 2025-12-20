
import React, { useState, useEffect } from 'react';
import { Icons, COLORS } from './constants';
import { Product, CartItem, Page } from './types';

// API 基础路径 (指向您的 PHP 后端)
const API_URL = './api/products.php';

// --- Shared Layout Components ---

const Navbar: React.FC<{ 
  currentPage: Page, 
  setPage: (p: Page) => void, 
  cartCount: number,
  isScrolled: boolean
}> = ({ currentPage, setPage, cartCount, isScrolled }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-[#280071] shadow-2xl py-3' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
        <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden text-white"><Icons.Menu /></button>
        
        <div className="hidden lg:flex space-x-12 text-[11px] font-bold uppercase tracking-[0.25em] text-white/60">
          <button onClick={() => setPage('shop')} className={`hover:text-white transition-all ${currentPage === 'shop' ? 'text-white border-b border-white' : ''}`}>精选商城</button>
          <button onClick={() => setPage('story')} className={`hover:text-white transition-all ${currentPage === 'story' ? 'text-white border-b border-white' : ''}`}>品牌故事</button>
        </div>
        
        <div className="flex items-center space-x-4 cursor-pointer" onClick={() => setPage('home')}>
          <Icons.Logo size={40} />
          <div className="hidden md:block"><Icons.Wordmark /></div>
        </div>

        <div className="flex items-center space-x-8">
          <button className="text-white/60 hover:text-white"><Icons.Search /></button>
          <button onClick={() => setPage('cart')} className="relative text-white/60 hover:text-white">
            <Icons.Cart />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-[#3B2182] text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-in zoom-in">{cartCount}</span>
            )}
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-[#3B2182] z-[60] p-12 flex flex-col items-center justify-center space-y-12 animate-in fade-in duration-300">
          <button onClick={() => setMobileMenuOpen(false)} className="absolute top-8 right-8 text-white"><Icons.Close /></button>
          <Icons.FullIdentity color="#FFFFFF" size={120} />
          <div className="flex flex-col items-center space-y-8 text-xl font-bold tracking-[0.2em] text-white uppercase">
            <button onClick={() => { setPage('shop'); setMobileMenuOpen(false); }}>精选商城</button>
            <button onClick={() => { setPage('story'); setMobileMenuOpen(false); }}>品牌故事</button>
          </div>
        </div>
      )}
    </nav>
  );
};

// --- Page Components ---

const Home: React.FC<{ setPage: (p: Page) => void }> = ({ setPage }) => (
  <div className="fade-in">
    <section className="relative h-screen flex flex-col items-center justify-center text-center px-8">
      <div className="absolute inset-0 bg-black/40 z-10"></div>
      <img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover" alt="Hero" />
      <div className="relative z-20 space-y-12 max-w-4xl">
        <Icons.FullIdentity size={160} />
        <h1 className="text-5xl md:text-8xl font-light tracking-tight text-white leading-tight">好咖啡<br/>你我轻松拥有</h1>
        <button onClick={() => setPage('shop')} className="mt-8 bg-white text-[#3B2182] px-16 py-5 text-[12px] font-bold uppercase tracking-[0.4em] hover:bg-[#280071] hover:text-white transition-all shadow-xl">立即开启探索</button>
      </div>
    </section>
  </div>
);

const Shop: React.FC<{ products: Product[], onAddToCart: (p: Product) => void, isLoading: boolean }> = ({ products, onAddToCart, isLoading }) => {
  const [filter, setFilter] = useState<'all' | 'coffee' | 'equipment' | 'merchandise'>('all');
  const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);

  return (
    <div className="pt-40 pb-20 bg-white min-h-screen px-6 fade-in">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap gap-8 mb-20 border-b border-gray-100 pb-8 text-[11px] font-bold uppercase tracking-[0.3em] text-gray-400">
          <button onClick={() => setFilter('all')} className={filter === 'all' ? 'text-[#3B2182]' : ''}>全部商品</button>
          <button onClick={() => setFilter('coffee')} className={filter === 'coffee' ? 'text-[#3B2182]' : ''}>精品咖啡豆</button>
          <button onClick={() => setFilter('equipment')} className={filter === 'equipment' ? 'text-[#3B2182]' : ''}>冲煮器具</button>
          <button onClick={() => setFilter('merchandise')} className={filter === 'merchandise' ? 'text-[#3B2182]' : ''}>生活周边</button>
        </div>

        {isLoading ? (
          <div className="py-40 text-center animate-pulse text-gray-300 font-bold uppercase tracking-widest">正在为您甄选好物...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-x-12 gap-y-20">
            {filtered.map(p => (
              <div key={p.id} className="group flex flex-col items-center text-center">
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-gray-50 mb-8">
                  <img src={p.image || 'https://via.placeholder.com/600x800'} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" alt={p.name} />
                  <button 
                    onClick={() => onAddToCart(p)}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-[#3B2182] text-white px-8 py-3 text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0"
                  >加入购物车</button>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2 uppercase">{p.name}</h3>
                <p className="text-gray-400 text-sm mb-4 h-10 overflow-hidden px-4">{p.description}</p>
                <p className="text-[#3B2182] font-black">¥{p.price}</p>
              </div>
            ))}
            {filtered.length === 0 && <div className="col-span-3 py-40 text-center text-gray-300 font-bold uppercase tracking-widest">暂无相关产品</div>}
          </div>
        )}
      </div>
    </div>
  );
};

const Story: React.FC = () => (
  <div className="pt-40 pb-20 bg-white min-h-screen fade-in">
    <div className="max-w-4xl mx-auto px-8 space-y-24 text-center">
      <h2 className="text-6xl font-black italic uppercase text-[#3B2182]">猎寻原生之味</h2>
      <p className="text-xl text-gray-600 font-light leading-loose">
        Taiwäka，源自东非斯瓦希里语，意为“鹰的敏锐”。我们不仅仅是烘焙商，更是咖啡猎寻者。在海拔 2000 米以上的火山土壤，我们追踪每一颗原生态咖啡豆的足迹。
      </p>
      <img src="https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?q=80&w=1200&auto=format&fit=crop" className="w-full grayscale shadow-2xl" alt="Brewing" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 text-left text-gray-600 font-light leading-loose">
        <p>我们的团队常年驻扎产地，与庄园主直接贸易。我们剔除中间环节，只为确保每一分收益都能回流到辛勤的咖农手中，并保证每一袋豆子都拥有可追溯的纯净灵魂。</p>
        <p>从微气候的观测到精准烘焙曲线的打磨，Taiwäka 致力于打破精品咖啡的壁垒。我们相信：好咖啡，应当是你我都能轻松拥有的生活艺术。</p>
      </div>
    </div>
  </div>
);

const Cart: React.FC<{ items: CartItem[], updateQty: (id: string, d: number) => void, removeItem: (id: string) => void }> = ({ items, updateQty, removeItem }) => {
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="pt-40 pb-20 bg-white min-h-screen px-6 fade-in">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-4xl font-black italic mb-12 uppercase text-[#3B2182]">您的选购清单</h2>
        {items.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-gray-100">
            <p className="text-gray-400 font-bold uppercase tracking-widest">购物车还是空的</p>
          </div>
        ) : (
          <div className="space-y-12">
            {items.map(item => (
              <div key={item.id} className="flex gap-8 items-center border-b border-gray-50 pb-8">
                <img src={item.image || 'https://via.placeholder.com/150'} className="w-24 h-32 object-cover bg-gray-50" alt={item.name} />
                <div className="flex-1">
                  <h3 className="font-bold text-xl uppercase">{item.name}</h3>
                  <p className="text-[#3B2182] font-black">¥{item.price}</p>
                </div>
                <div className="flex items-center space-x-4 border border-gray-200 px-4 py-2">
                  <button onClick={() => updateQty(item.id, -1)} className="font-bold">-</button>
                  <span className="w-8 text-center">{item.quantity}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="font-bold">+</button>
                </div>
                <button onClick={() => removeItem(item.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Icons.Close /></button>
              </div>
            ))}
            <div className="flex justify-between items-end pt-8">
              <div>
                <p className="text-gray-400 text-xs uppercase mb-2">订单总计</p>
                <p className="text-5xl font-black text-[#3B2182]">¥{total}</p>
              </div>
              <button className="bg-[#3B2182] text-white px-12 py-5 text-sm font-bold uppercase tracking-widest hover:bg-[#280071] transition-all">前往结算</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- App Root ---

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
      
      const rawText = await res.text();
      // 如果后端返回空，设为空数组，防止 JSON.parse 报错
      if (!rawText.trim()) {
        setProducts([]);
        return;
      }

      const data = JSON.parse(rawText);
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Fetch error:', err);
      // 如果出现错误（如 JSON 解析失败），优雅降级为空数组
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...product, quantity: 1 }];
    });
    setPage('cart');
  };

  const renderPage = () => {
    switch (page) {
      case 'home': return <Home setPage={setPage} />;
      case 'shop': return <Shop products={products} onAddToCart={addToCart} isLoading={isLoading} />;
      case 'story': return <Story />;
      case 'cart': return <Cart items={cart} updateQty={(id, d) => setCart(p => p.map(i => i.id === id ? {...i, quantity: Math.max(1, i.quantity + d)} : i))} removeItem={id => setCart(p => p.filter(i => i.id !== id))} />;
      default: return <Home setPage={setPage} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar currentPage={page} setPage={p => { setPage(p); window.scrollTo(0,0); }} cartCount={cart.reduce((s,i)=>s+i.quantity, 0)} isScrolled={isScrolled} />
      <main className="flex-1">{renderPage()}</main>
      <footer className="bg-[#1A1A1A] py-20 px-8 text-white/40 text-[10px] uppercase tracking-[0.3em]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
          <Icons.FullIdentity size={80} color="rgba(255,255,255,0.2)" />
          <div className="flex space-x-12">
            <a href="#" className="hover:text-white transition-colors">隐私政策</a>
            <a href="#" className="hover:text-white transition-colors">服务条款</a>
            <a href="#" className="hover:text-white transition-colors">关于我们</a>
          </div>
          <p>© 2025 Taiwäka Specialty Roasters. 蜀ICP备2021008888号</p>
        </div>
      </footer>
    </div>
  );
}
