import React, { useState, useEffect } from 'react';
import './styles-enhanced.css';

interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  image: string;
  specifications: Record<string, string>;
  stock: number;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{ productId: number; quantity: number }[]>([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (productId: number) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === productId);
      if (existing) {
        return prev.map(item =>
          item.productId === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { productId, quantity: 1 }];
    });
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? parseFloat(product.price) * item.quantity : 0);
    }, 0);
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* 导航栏 */}
      <nav className="navbar-premium" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: 'var(--coffee-dark)',
          fontFamily: "'Playfair Display', serif",
        }}>
          ☕ Taiwaka Coffee
        </h1>
        <button
          onClick={() => setShowCart(!showCart)}
          className="btn-coffee"
          style={{ position: 'relative' }}
        >
          🛒 购物车 {cart.length > 0 && `(${cart.length})`}
        </button>
      </nav>

      {/* 英雄区域 */}
      <section className="hero-section">
        <div className="hero-background"></div>
        <div className="hero-content">
          <h1 style={{
            fontSize: '3.5rem',
            fontFamily: "'Playfair Display', serif",
            color: 'var(--coffee-dark)',
            marginBottom: '1rem',
            letterSpacing: '-0.02em',
          }}>
            精选咖啡豆
          </h1>
          <p style={{
            fontSize: '1.25rem',
            color: 'var(--text-secondary)',
            marginBottom: '2rem',
          }}>
            来自世界各地的优质咖啡，为您带来最纯正的咖啡体验
          </p>
          <button className="btn-coffee" style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}>
            立即探索
          </button>
        </div>
      </section>

      {/* 购物车面板 */}
      {showCart && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '400px',
          height: '100vh',
          backgroundColor: 'var(--bg-secondary)',
          boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          padding: '2rem',
          overflowY: 'auto',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h2>购物车</h2>
            <button
              onClick={() => setShowCart(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>

          {cart.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>购物车为空</p>
          ) : (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
                {cart.map(item => {
                  const product = products.find(p => p.id === item.productId);
                  return product ? (
                    <div key={item.productId} style={{
                      padding: '1rem',
                      backgroundColor: 'var(--bg-primary)',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--border-color)',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <h4 style={{ margin: 0 }}>{product.name}</h4>
                        <span style={{ fontWeight: '700', color: 'var(--coffee-medium)' }}>
                          ¥{(parseFloat(product.price) * item.quantity).toFixed(2)}
                        </span>
                      </div>
                      <p style={{ margin: '0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        数量: {item.quantity}
                      </p>
                      <button
                        onClick={() => {
                          setCart(prev => prev.filter(i => i.productId !== item.productId));
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#dc3545',
                          cursor: 'pointer',
                          fontSize: '0.875rem',
                          textDecoration: 'underline',
                        }}
                      >
                        移除
                      </button>
                    </div>
                  ) : null;
                })}
              </div>

              <div style={{
                borderTop: '1px solid var(--border-color)',
                paddingTop: '1rem',
                marginBottom: '1rem',
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '1rem',
                  fontSize: '1.25rem',
                  fontWeight: '700',
                }}>
                  <span>总计:</span>
                  <span style={{ color: 'var(--coffee-medium)' }}>
                    ¥{getTotalPrice().toFixed(2)}
                  </span>
                </div>
                <button className="btn-coffee" style={{ width: '100%' }}>
                  结账
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* 产品网格 */}
      <section style={{ padding: '3rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{
          fontSize: '2.5rem',
          fontFamily: "'Playfair Display', serif",
          color: 'var(--coffee-dark)',
          marginBottom: '3rem',
          textAlign: 'center',
        }}>
          我们的产品
        </h2>

        {loading ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>加载中...</p>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '2rem',
          }}>
            {products.map((product, index) => (
              <div
                key={product.id}
                className="product-card-premium stagger-item"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="product-image-container">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="product-image"
                      loading="lazy"
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: 'var(--coffee-cream)',
                      color: 'var(--coffee-dark)',
                      fontSize: '3rem',
                    }}>
                      ☕
                    </div>
                  )}
                </div>

                <div style={{ padding: '1.5rem' }}>
                  <h3 style={{
                    fontSize: '1.25rem',
                    fontFamily: "'Playfair Display', serif",
                    color: 'var(--coffee-dark)',
                    marginBottom: '0.5rem',
                  }}>
                    {product.name}
                  </h3>

                  <p style={{
                    fontSize: '0.875rem',
                    color: 'var(--text-secondary)',
                    marginBottom: '1rem',
                    minHeight: '2.5rem',
                  }}>
                    {product.description}
                  </p>

                  {product.specifications && Object.keys(product.specifications).length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      {Object.entries(product.specifications).map(([key, value]) => (
                        <div key={key} style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                          marginBottom: '0.25rem',
                        }}>
                          <span style={{ fontWeight: '600' }}>{key}:</span>
                          <span>{value}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                  }}>
                    <span style={{
                      fontSize: '1.5rem',
                      fontWeight: '700',
                      color: 'var(--coffee-medium)',
                    }}>
                      ¥{product.price}
                    </span>
                    <span style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                    }}>
                      库存: {product.stock}
                    </span>
                  </div>

                  <button
                    onClick={() => addToCart(product.id)}
                    className="btn-coffee"
                    style={{ width: '100%' }}
                    disabled={product.stock === 0}
                  >
                    {product.stock === 0 ? '缺货' : '加入购物车'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 页脚 */}
      <footer style={{
        backgroundColor: 'var(--coffee-dark)',
        color: 'white',
        padding: '3rem 2rem',
        textAlign: 'center',
        marginTop: '3rem',
      }}>
        <p style={{ marginBottom: '0.5rem' }}>© 2024 Taiwaka Coffee. 保留所有权利。</p>
        <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
          品质咖啡 · 精心烘焙 · 用心服务
        </p>
      </footer>
    </div>
  );
}
