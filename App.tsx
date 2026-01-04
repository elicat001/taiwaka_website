
import React, { useState, useEffect, useRef } from 'react';
import { Icons, COLORS, INITIAL_PRODUCTS } from './constants';
import { Product, CartItem, Page } from './types';
import { getCoffeeRecommendation } from './services/geminiService';

const API_URL = './api/products.php';

// --- Shared Components ---

const Navbar: React.FC<{ 
  page: Page, 
  setPage: (p: Page) => void, 
  cartCount: number,
  isScrolled: boolean 
}> = ({ page, setPage, cartCount, isScrolled }) => {
  const isLightPage = page === 'home';
  const textColor = isScrolled || !isLightPage ? 'text-gray-900' : 'text-white';
  const navBg = isScrolled ? 'bg-white shadow-sm' : 'bg-transparent';

  return (
    <nav 
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-700 py-6 px-10 ${navBg}`}
      role="navigation"
      aria-label="主导航"
    >
      <div className="max-w-[1440px] mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-12">
          <button 
            onClick={() => setPage('home')} 
            className="hover:opacity-70 transition-opacity"
            aria-label="返回首页"
          >
            <Icons.Logo size={isScrolled ? 34 : 42} />
          </button>
          <div className={`hidden lg:flex space-x-10 text-[10px] font-bold uppercase tracking-[0.4em] ${textColor}`}>
            <button 
              onClick={() => setPage('shop')} 
              className={`hover:opacity-50 ${page === 'shop' ? 'border-b border-current pb-1' : ''}`}
              aria-current={page === 'shop' ? 'page' : undefined}
            >
              精选商城
            </button>
            <button 
              onClick={() => setPage('story')} 
              className={`hover:opacity-50 ${page === 'story' ? 'border-b border-current pb-1' : ''}`}
              aria-current={page === 'story' ? 'page' : undefined}
            >
              品牌故事
            </button>
          </div>
        </div>
        
        <div className={`flex items-center space-x-8 ${textColor}`}>
          <button className="hover:opacity-50" aria-label="搜索">
            <Icons.Search />
          </button>
          <button 
            onClick={() => setPage('cart')} 
            className="relative hover:opacity-50"
            aria-label={`购物车，${cartCount} 件商品`}
          >
            <Icons.Cart />
            {cartCount > 0 && (
              <span 
                className="absolute -top-2 -right-2 bg-[#3B2182] text-white text-[8px] w-4 h-4 rounded-full flex items-center justify-center font-black animate-pulse"
                aria-hidden="true"
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

// --- Page: Home ---
const HomePage: React.FC<{ setPage: (p: Page) => void }> = ({ setPage }) => {
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => e.isIntersecting && e.target.classList.add('active'));
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal-up').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <main className="bg-white">
      <section 
        className="relative h-screen flex flex-col items-center justify-center text-center overflow-hidden"
        aria-label="英雄区域"
      >
        <div className="absolute inset-0 bg-black/40 z-10" aria-hidden="true" />
        <img 
          src="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=2000&auto=format&fit=crop" 
          className="absolute inset-0 w-full h-full object-cover scale-105 animate-[subtle-zoom_20s_infinite_alternate]"
          alt="精品咖啡豆特写，展示咖啡的质感与品质"
          loading="eager"
        />
        <div className="relative z-20 space-y-12 max-w-4xl px-8">
          <div className="reveal-up" aria-hidden="true">
            <Icons.FullIdentity size={100} />
          </div>
          <h1 className="reveal-up delay-200 serif-title text-5xl md:text-8xl text-white font-extralight leading-tight">
            猎寻于<br/><span className="italic font-normal">火山之巅</span>
          </h1>
          <button 
            onClick={() => setPage('shop')}
            className="reveal-up delay-500 btn-premium bg-white text-gray-900 px-16 py-6 text-[10px] font-bold uppercase tracking-widest-plus hover:bg-black hover:text-white transition-all shadow-2xl"
            aria-label="浏览商品"
          >
            开启品鉴之旅
          </button>
        </div>
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 text-white/30 animate-bounce" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5"/>
          </svg>
        </div>
      </section>

      <section className="py-40 px-10" aria-label="品牌介绍">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-32 items-center">
          <div className="reveal-up relative aspect-[4/5] overflow-hidden bg-gray-50">
            <img 
              src="https://images.unsplash.com/photo-1511537190424-bbbab87ac5eb?q=80&w=1200&auto=format&fit=crop" 
              className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-1000"
              alt="咖啡豆采摘过程，展示我们对品质的追求"
              loading="lazy"
            />
          </div>
          <div className="reveal-up space-y-10">
            <p className="text-[#3B2182] text-[10px] font-black uppercase tracking-widest-plus">The Hunt</p>
            <h2 className="serif-title text-5xl leading-tight font-light italic">拒绝平庸的采摘，<br/>只为极致的共鸣。</h2>
            <p className="text-gray-500 font-light leading-loose text-lg">
              Taiwäka 坚持与东非小农直接贸易。在海拔 2000 米以上的裂谷带，我们如鹰般敏锐地捕捉每一颗咖啡豆在风味巅峰的瞬间。这不仅是饮品，更是对大自然风土 (Terroir) 的精准复刻。
            </p>
            <button 
              onClick={() => setPage('story')}
              className="text-[10px] font-bold uppercase tracking-[0.4em] border-b border-gray-900 pb-2 hover:text-[#3B2182] hover:border-[#3B2182] transition-colors"
              aria-label="了解更多品牌故事"
            >
              了解品牌哲学
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

// --- Page: Shop ---
const ShopPage: React.FC<{ products: Product[], onAdd: (p: Product) => void, loading: boolean }> = ({ products, onAdd, loading }) => {
  const [filter, setFilter] = useState('all');
  const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);

  return (
    <main className="pt-48 pb-40 bg-white px-10 min-h-screen">
      <div className="max-w-[1440px] mx-auto">
        <header className="mb-24 flex flex-col lg:flex-row justify-between items-baseline gap-10">
          <div className="reveal-up active">
            <h1 className="serif-title text-7xl font-light italic text-[#3B2182] mb-4">Collection</h1>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest-plus">甄选火山豆种与专业手冲器具</p>
          </div>
          <nav 
            className="flex flex-wrap gap-12 text-[10px] font-bold uppercase tracking-[0.4em] text-gray-300"
            aria-label="产品分类筛选"
          >
            {['all', 'coffee', 'equipment', 'merchandise'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`transition-colors hover:text-black ${filter === f ? 'text-black border-b border-black pb-1' : ''}`}
                aria-pressed={filter === f}
              >
                {f === 'all' ? '全部' : f === 'coffee' ? '豆子' : f === 'equipment' ? '器具' : '周边'}
              </button>
            ))}
          </nav>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-32" role="status" aria-label="加载中">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-gray-200 mb-8"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-32">
            {filtered.map((p, idx) => (
              <article 
                key={p.id} 
                className="product-card group cursor-pointer reveal-up active" 
                style={{ transitionDelay: `${idx * 100}ms` }}
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-[#FBFBFB] mb-8">
                  <img 
                    src={p.image} 
                    className="w-full h-full object-cover" 
                    alt={`${p.name} - ${p.description}`}
                    loading="lazy"
                  />
                  {p.tag && (
                    <span 
                      className="absolute top-6 left-6 bg-white px-4 py-1.5 text-[8px] font-bold tracking-widest uppercase shadow-sm"
                      aria-label={`标签: ${p.tag}`}
                    >
                      {p.tag}
                    </span>
                  )}
                  <button 
                    onClick={() => onAdd(p)}
                    className="absolute inset-x-10 bottom-10 bg-white text-gray-900 py-5 text-[9px] font-bold uppercase tracking-widest opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 shadow-xl hover:bg-[#3B2182] hover:text-white"
                    aria-label={`将 ${p.name} 加入购物车`}
                  >
                    Quick Add to Bag
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-baseline">
                    <h2 className="text-lg font-light tracking-tight uppercase text-gray-900">{p.name}</h2>
                    <p className="text-[#3B2182] font-black" aria-label={`价格 ${p.price} 元`}>¥{p.price}</p>
                  </div>
                  <p className="text-gray-400 text-xs font-light leading-relaxed pr-8 line-clamp-2">{p.description}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

// --- Page: Cart ---
const CartPage: React.FC<{ items: CartItem[], update: (id: string, d: number) => void, remove: (id: string) => void }> = ({ items, update, remove }) => {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <main className="pt-48 pb-40 px-10 bg-white min-h-screen">
      <div className="max-w-3xl mx-auto reveal-up active">
        <h1 className="serif-title text-5xl font-light italic mb-16 text-[#3B2182]">My Shopping Bag</h1>
        
        {items.length === 0 ? (
          <div className="text-center py-32 border-2 border-dashed border-gray-100" role="status">
            <p className="text-gray-300 font-bold uppercase tracking-widest text-[10px]">您的清单空空如也</p>
          </div>
        ) : (
          <div className="space-y-16">
            {items.map(item => (
              <article key={item.id} className="flex gap-10 items-center border-b border-gray-50 pb-12">
                <div className="w-24 aspect-[3/4] bg-gray-50 overflow-hidden">
                  <img 
                    src={item.image} 
                    className="w-full h-full object-cover" 
                    alt={item.name}
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <h2 className="font-bold uppercase tracking-tight text-xl">{item.name}</h2>
                  <p className="text-[#3B2182] font-black text-sm" aria-label={`单价 ${item.price} 元`}>¥{item.price}</p>
                </div>
                <div 
                  className="flex items-center space-x-6 border border-gray-200 px-5 py-3 rounded-full"
                  role="group"
                  aria-label={`${item.name} 数量控制`}
                >
                  <button 
                    onClick={() => update(item.id, -1)} 
                    className="hover:text-[#3B2182]"
                    aria-label="减少数量"
                  >
                    -
                  </button>
                  <span className="text-sm font-bold w-4 text-center" aria-label={`数量 ${item.quantity}`}>
                    {item.quantity}
                  </span>
                  <button 
                    onClick={() => update(item.id, 1)} 
                    className="hover:text-[#3B2182]"
                    aria-label="增加数量"
                  >
                    +
                  </button>
                </div>
                <button 
                  onClick={() => remove(item.id)} 
                  className="text-gray-300 hover:text-red-500 transition-colors"
                  aria-label={`移除 ${item.name}`}
                >
                  <Icons.Close />
                </button>
              </article>
            ))}
            
            <div className="flex flex-col md:flex-row justify-between items-end md:items-center pt-10 gap-8">
              <div>
                <p className="text-gray-400 text-[9px] font-bold uppercase tracking-widest mb-2">订单预估总计</p>
                <p className="text-6xl font-black text-gray-900" aria-label={`总计 ${subtotal} 元`}>¥{subtotal}</p>
              </div>
              <button 
                className="bg-[#3B2182] text-white px-20 py-6 text-[10px] font-bold uppercase tracking-widest-plus shadow-2xl hover:bg-black transition-all"
                aria-label="前往结账"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

// --- Page: Story ---
const StoryPage: React.FC = () => (
  <main className="bg-[#F9F7F2] min-h-screen pt-48 pb-40">
    <div className="max-w-4xl mx-auto px-10 space-y-40">
      <header className="text-center space-y-10 reveal-up active">
        <h1 className="serif-title text-7xl font-light italic text-[#3B2182]">The Hunt</h1>
        <p className="text-xl text-gray-600 font-light leading-loose max-w-2xl mx-auto">
          Taiwäka 诞生于对"原生味觉"的执念。我们相信，最好的咖啡不应被过度设计，而是被耐心地"狩猎"出来。
        </p>
      </header>

      <article className="grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        <div className="reveal-up active">
          <img 
            src="https://images.unsplash.com/photo-1524350303359-2e8ae15adad5?q=80&w=1200" 
            className="w-full shadow-2xl" 
            alt="火山地貌，展示咖啡生长的独特环境"
            loading="lazy"
          />
        </div>
        <div className="space-y-6 reveal-up active delay-300">
          <h2 className="text-[10px] font-black uppercase tracking-widest-plus text-[#3B2182]">Volcanic Soil</h2>
          <p className="text-gray-500 font-light leading-loose italic text-lg">
            "火山灰赋予了豆子如丝绒般的深度。"
          </p>
          <p className="text-gray-500 font-light leading-loose">
            我们专注于东非大裂谷边缘的产地。那里的土壤富含矿物质，海拔常年维持在 1800-2400 米，正是这种极致的生存压力，压榨出了咖啡豆内敛而丰富的酸质与甜感。
          </p>
        </div>
      </article>
    </div>
  </main>
);

// --- AI Guide Component ---
const AICoffeeGuide: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [resp, setResp] = useState('');
  const [loading, setLoading] = useState(false);

  const consult = async () => {
    if (!msg.trim()) return;
    setLoading(true);
    try {
      const res = await getCoffeeRecommendation(msg);
      setResp(res);
    } catch (error) {
      setResp('抱歉，AI 导师暂时无法响应。请稍后再试。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <aside 
      className="fixed bottom-12 right-12 z-[150]"
      aria-label="AI 咖啡风味导师"
    >
      {!open ? (
        <button 
          onClick={() => setOpen(true)}
          className="bg-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center border border-gray-50 hover:scale-110 transition-transform group"
          aria-label="打开 AI 风味导师"
        >
          <div 
            className="absolute -top-14 right-0 bg-black text-white text-[8px] font-bold px-4 py-2 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest whitespace-nowrap"
            aria-hidden="true"
          >
            AI 风味导师
          </div>
          <Icons.Settings />
        </button>
      ) : (
        <div 
          className="bg-white w-[360px] p-10 shadow-2xl rounded-sm border border-gray-50 animate-in slide-in-from-bottom-5 duration-500"
          role="dialog"
          aria-labelledby="ai-guide-title"
        >
          <div className="flex justify-between items-center mb-8">
            <h2 id="ai-guide-title" className="text-[10px] font-bold uppercase tracking-widest-plus text-gray-400">
              Cup Mentor
            </h2>
            <button 
              onClick={() => setOpen(false)} 
              className="hover:rotate-90 transition-transform"
              aria-label="关闭"
            >
              <Icons.Close />
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-8 font-light leading-relaxed pr-6">
            描述您此刻的心情、天气或理想的风味词，让我为您猎寻专属那一杯。
          </p>
          <label htmlFor="ai-input" className="sr-only">输入您的需求</label>
          <textarea 
            id="ai-input"
            className="w-full bg-gray-50 p-5 text-xs outline-none focus:ring-1 focus:ring-[#3B2182] transition-all resize-none mb-6 font-light"
            rows={2}
            value={msg}
            onChange={e => setMsg(e.target.value)}
            placeholder="例如：雨后的宁静，想要温润的巧克力感..."
            aria-describedby="ai-description"
          />
          <button 
            onClick={consult}
            disabled={loading || !msg.trim()}
            className="w-full bg-[#3B2182] text-white py-5 text-[9px] font-bold uppercase tracking-widest-plus hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label={loading ? '正在获取建议' : '获取专家建议'}
          >
            {loading ? 'HUNTING...' : '获取专家建议'}
          </button>
          {resp && (
            <div 
              className="mt-8 pt-8 border-t border-gray-50 text-[11px] font-light leading-loose text-gray-700 italic animate-in fade-in duration-1000"
              role="status"
              aria-live="polite"
            >
              {resp}
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

// --- Error Boundary ---
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="text-center space-y-6 max-w-md">
            <h1 className="text-4xl font-bold text-gray-900">出错了</h1>
            <p className="text-gray-600">抱歉，页面遇到了一些问题。请刷新页面重试。</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#3B2182] text-white px-8 py-3 rounded-sm hover:bg-black transition-colors"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// --- App Controller ---
export default function App() {
  const [page, setPage] = useState<Page>('home');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Failed to fetch products');
      const text = await res.text();
      const data = text ? JSON.parse(text) : INITIAL_PRODUCTS;
      setProducts(data.length > 0 ? data : INITIAL_PRODUCTS);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts(INITIAL_PRODUCTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    const scrollHandler = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', scrollHandler, { passive: true });
    return () => window.removeEventListener('scroll', scrollHandler);
  }, []);

  const addToCart = (p: Product) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id ? { ...i, quantity: i.quantity + 1 } : i);
      return [...prev, { ...p, quantity: 1 }];
    });
    setPage('cart');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPage = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // 更新页面标题以提升 SEO
    const titles: Record<Page, string> = {
      home: '太哇卡咖啡 Taiwaka Coffee | 猎寻原生之味',
      shop: '精选商城 - 太哇卡咖啡',
      story: '品牌故事 - 太哇卡咖啡',
      cart: '购物车 - 太哇卡咖啡',
    };
    document.title = titles[p];
  };

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar 
          page={page} 
          setPage={navigateToPage} 
          cartCount={cart.reduce((s,i) => s + i.quantity, 0)} 
          isScrolled={scrolled} 
        />
        
        {page === 'home' && <HomePage setPage={navigateToPage} />}
        {page === 'shop' && <ShopPage products={products} onAdd={addToCart} loading={loading} />}
        {page === 'story' && <StoryPage />}
        {page === 'cart' && (
          <CartPage 
            items={cart} 
            update={(id, d) => setCart(p => p.map(i => i.id === id ? { ...i, quantity: Math.max(1, i.quantity + d) } : i))} 
            remove={id => setCart(p => p.filter(i => i.id !== id))} 
          />
        )}

        <AICoffeeGuide />

        <footer className="bg-[#0A0A0A] pt-40 pb-20 px-10 text-white/20 text-[9px] font-bold uppercase tracking-widest-plus">
          <div className="max-w-[1440px] mx-auto grid grid-cols-1 md:grid-cols-4 gap-20">
            <div className="col-span-1 md:col-span-2">
              <Icons.FullIdentity size={80} color="rgba(255,255,255,0.05)" />
              <p className="mt-10 text-xs font-light max-w-sm leading-relaxed lowercase italic tracking-normal normal-case opacity-40">
                Taiwäka (Swahili for "Eagle's Precision"). dedicated to hunting the purest flavors in volcanic soil across the East African Rift.
              </p>
            </div>
            <nav className="space-y-6 flex flex-col" aria-label="页脚导航">
              <h3 className="text-white mb-2">Navigation</h3>
              <button onClick={() => navigateToPage('shop')} className="hover:text-white transition-colors text-left">
                The Shop
              </button>
              <button onClick={() => navigateToPage('story')} className="hover:text-white transition-colors text-left">
                Our Heritage
              </button>
              <a href="#" className="hover:text-white transition-colors">Locations</a>
            </nav>
            <div className="space-y-6 flex flex-col">
              <h3 className="text-white mb-2">Support</h3>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
              <a href="#" className="hover:text-white transition-colors">Shipping</a>
              <p className="mt-auto opacity-30 tracking-widest">© 2025 Taiwäka Coffee. 蜀ICP备2021008888号</p>
            </div>
          </div>
        </footer>
      </div>
    </ErrorBoundary>
  );
}
