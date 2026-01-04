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

interface FormData {
  name: string;
  description: string;
  price: string;
  image: string;
  specifications: Record<string, string>;
  stock: number;
}

export default function AdminPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    image: '',
    specifications: {},
    stock: 0,
  });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // 获取产品列表
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
      setMessage('获取产品列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSpecChange = (key: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [key]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `/api/products/${editingId}` : '/api/products';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setMessage(editingId ? '产品更新成功' : '产品创建成功');
        setFormData({
          name: '',
          description: '',
          price: '',
          image: '',
          specifications: {},
          stock: 0,
        });
        setEditingId(null);
        fetchProducts();
      } else {
        setMessage('操作失败');
      }
    } catch (error) {
      console.error('Failed to submit form:', error);
      setMessage('提交失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      specifications: product.specifications || {},
      stock: product.stock,
    });
    setEditingId(product.id);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个产品吗？')) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('产品删除成功');
        fetchProducts();
      } else {
        setMessage('删除失败');
      }
    } catch (error) {
      console.error('Failed to delete product:', error);
      setMessage('删除失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-primary)', padding: '2rem' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '2rem', color: 'var(--coffee-dark)' }}>产品管理后台</h1>

        {message && (
          <div style={{
            padding: '1rem',
            marginBottom: '1rem',
            backgroundColor: '#d4edda',
            color: '#155724',
            borderRadius: '0.5rem',
          }}>
            {message}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* 表单区域 */}
          <div style={{
            backgroundColor: 'var(--bg-secondary)',
            padding: '1.5rem',
            borderRadius: '1rem',
            border: '1px solid var(--border-color)',
          }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>
              {editingId ? '编辑产品' : '添加新产品'}
            </h2>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  产品名称
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="输入产品名称"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  描述
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="输入产品描述"
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                    fontFamily: 'inherit',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  价格 (¥)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="输入价格"
                  step="0.01"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  图片 URL
                </label>
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="输入图片 URL"
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  库存
                </label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  placeholder="输入库存数量"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.5rem',
                    fontSize: '1rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                  规格 (JSON)
                </label>
                <textarea
                  value={JSON.stringify(formData.specifications, null, 2)}
                  onChange={(e) => {
                    try {
                      setFormData(prev => ({
                        ...prev,
                        specifications: JSON.parse(e.target.value),
                      }));
                    } catch (err) {
                      // 忽略 JSON 解析错误
                    }
                  }}
                  placeholder='{"origin": "埃塞俄比亚", "roastLevel": "中度烘焙"}'
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.5rem',
                    fontSize: '0.875rem',
                    fontFamily: 'monospace',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-coffee"
                style={{
                  opacity: loading ? 0.6 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? '处理中...' : editingId ? '更新产品' : '创建产品'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null);
                    setFormData({
                      name: '',
                      description: '',
                      price: '',
                      image: '',
                      specifications: {},
                      stock: 0,
                    });
                  }}
                  style={{
                    padding: '0.75rem 1.5rem',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                  }}
                >
                  取消编辑
                </button>
              )}
            </form>
          </div>

          {/* 产品列表区域 */}
          <div>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.25rem' }}>产品列表</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '600px', overflowY: 'auto' }}>
              {loading && products.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>加载中...</p>
              ) : products.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>暂无产品</p>
              ) : (
                products.map(product => (
                  <div
                    key={product.id}
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      padding: '1rem',
                      borderRadius: '0.5rem',
                      border: '1px solid var(--border-color)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1rem' }}>{product.name}</h3>
                        <p style={{ margin: '0 0 0.5rem 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          ¥{product.price}
                        </p>
                        <p style={{ margin: '0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                          库存: {product.stock}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleEdit(product)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: 'var(--coffee-accent)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                          }}
                        >
                          编辑
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.375rem',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                          }}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
