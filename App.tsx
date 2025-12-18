
import React, { useState, useEffect, useMemo } from 'react';
import { Icons, PRODUCTS, LOCATIONS, COLORS } from './constants';
import { Product, CartItem, Page, Review } from './types';
import { getCoffeeRecommendation } from './services/geminiService';

// --- Shared Components ---

const Navbar: React.FC<{ 
  currentPage: Page, 
  setPage: (p: Page) => void, 
  cartCount: number,
  isScrolled: boolean
}> = ({ currentPage, setPage, cartCount, isScrolled }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${isScrolled ? 'bg-[#280071] shadow-2xl py-3' : 'bg-transparent py-6'}`}>
      <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
        <button onClick={() => setMobileMenuOpen(true)} className="lg:hidden text-white"><Icons.Menu /></button>
        <div className="hidden lg:flex space-x-10 text-[11px] font-bold uppercase tracking-[0.25em] text-white/60">
          <button onClick={() => setPage('shop')} className={`hover:text-white transition-all ${currentPage === 'shop' ? 'text-white border-b border-white' : ''}`}>精选商城</button>
          <button onClick={() => setPage('locations')} className={`hover:text-white transition-all ${currentPage === 'locations' ? 'text-white border-b border-white' : ''}`}>门店分布</button>
          <button onClick={() => setPage('story')} className={`hover:text-white transition-all ${currentPage === 'story' ? 'text-white border-b border-white' : ''}`}>品牌故事</button>
        </div>
        
        <div className="flex items-center space-x-4 cursor-pointer transition-transform duration-500 hover:scale-105" onClick={() => setPage('home')}>
          <Icons.Logo size={36} />
          <div className="hidden md:block">
            <Icons.Wordmark color="#FFFFFF" scale={0.85} />
          </div>
        </div>

        <div className="flex items-center space-x-8">
          <button className="hidden sm:block text-white/60 hover:text-white"><Icons.Search /></button>
          <button onClick={() => setPage('cart')} className="relative text-white/60 hover:text-white">
            <Icons.Cart />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-white text-[#3B2182] text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold shadow-lg">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-[#3B2182] z-[60] p-12 flex flex-col items-center justify-center space-y-12 animate-in fade-in duration-300">
          <button onClick={() => setMobileMenuOpen(false)} className="absolute top-8 right-8 text-white"><Icons.Close /></button>
          <Icons.FullIdentity color="#FFFFFF" size={120} />
          <div className="flex flex-col items-center space-y-8 text-xl font-medium tracking-[0.2em] text-white">
            <button onClick={() => { setPage('shop'); setMobileMenuOpen(false); }}>精选商城</button>
            <button onClick={() => { setPage('locations'); setMobileMenuOpen(false); }}>门店分布</button>
            <button onClick={() => { setPage('story'); setMobileMenuOpen(false); }}>品牌故事</button>
          </div>
        </div>
      )}
    </nav>
  );
};

// --- Home Page ---

const Home: React.FC<{ setPage: (p: Page) => void, onAddToCart: (p: Product) => void, onProductClick: (p: Product) => void }> = ({ setPage, onAddToCart, onProductClick }) => {
  const [aiRec, setAiRec] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [prefInput, setPrefInput] = useState("");

  const handleAiConsult = async () => {
    if (!prefInput.trim()) return;
    setLoadingAi(true);
    const rec = await getCoffeeRecommendation(prefInput);
    setAiRec(rec);
    setLoadingAi(false);
  };

  return (
    <div className="fade-in">
      <section className="relative h-screen w-full flex flex-col items-center justify-center text-center px-8">
        <img src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2000&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-50" />
        <div className="absolute inset-0 bg-[#3B2182]/50"></div>
        <div className="relative z-10 space-y-12 max-w-4xl flex flex-col items-center">
          <Icons.FullIdentity color="#FFFFFF" size={140} />
          <h1 className="text-5xl md:text-8xl font-light tracking-tight text-white leading-tight">好咖啡<br/>你我轻松拥有</h1>
          <button onClick={() => setPage('shop')} className="mt-8 bg-white text-[#3B2182] px-16 py-5 text-[12px] font-bold uppercase tracking-[0.4em] hover:bg-[#280071] hover:text-white transition-all shadow-2xl">立即开启探索</button>
        </div>
      </section>

      {/* Other sections remain similar... */}
      <section className="py-32 bg-white text-[#1A1A1A] px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20">
          <div className="flex-1 space-y-8">
            <h2 className="text-[12px] font-bold uppercase tracking-[0.5em] text-[#3B2182]">PROFESSIONAL ROASTING</h2>
            <h3 className="text-5xl font-extrabold tracking-tighter italic">Taiwäka<br/>专业烘焙研究室</h3>
            <p className="text-base text-gray-600 font-light leading-loose max-w-lg">
              Q Grader 认证咖啡品鉴师与 SCA 认证高级烘焙师联手，定制专属烘焙曲线，充分释放每一颗非洲原产地生豆的风味潜力。
            </p>
          </div>
          <div className="flex-1 shadow-2xl overflow-hidden rounded-sm">
            <img src="https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?q=80&w=800&auto=format&fit=crop" className="w-full grayscale transition-all duration-700 hover:grayscale-0 hover:scale-105" alt="Roasting" />
          </div>
        </div>
      </section>

      <section className="py-40 bg-white text-[#1A1A1A] px-8">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-4xl font-extrabold tracking-tighter italic mb-20 text-center uppercase">Taiwäka 猎寻系列</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {PRODUCTS.slice(0, 3).map(p => (
              <div key={p.id} className="group cursor-pointer text-center" onClick={() => onProductClick(p)}>
                <div className="relative aspect-[3/4] overflow-hidden mb-6 bg-gray-100 shadow-xl rounded-sm">
                  <img src={p.image} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                </div>
                <h4 className="text-[15px] font-extrabold uppercase tracking-tighter">{p.name}</h4>
                <p className="text-[12px] text-[#3B2182] font-semibold mt-2">¥{p.price}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

// --- App Root ---
// Rest of the App.tsx logic continues below...
// (Assuming standard export default function App as before)

export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
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
  };

  const renderPage = () => {
    switch (page) {
      case 'home': return <Home setPage={setPage} onAddToCart={addToCart} onProductClick={setSelectedProduct} />;
      default: return <div className="pt-40 text-center text-white">页面开发中...</div>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#3B2182]">
      <Navbar currentPage={page} setPage={p => { setPage(p); window.scrollTo(0,0); }} cartCount={cart.reduce((s,i)=>s+i.quantity, 0)} isScrolled={isScrolled} />
      <main className="flex-1">{renderPage()}</main>
    </div>
  );
}
