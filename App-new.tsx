import React, { useState } from 'react';
import HomePage from './HomePage';
import AdminPanel from './AdminPanel';
import './styles-enhanced.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'admin'>('home');

  // 简单的路由切换
  const handleNavigation = (page: 'home' | 'admin') => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // 检查是否在管理员路由
  React.useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path === '/admin') {
        setCurrentPage('admin');
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 处理 URL 变化
  React.useEffect(() => {
    const handleUrlChange = () => {
      const path = window.location.pathname;
      if (path === '/admin') {
        setCurrentPage('admin');
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('hashchange', handleUrlChange);
    return () => window.removeEventListener('hashchange', handleUrlChange);
  }, []);

  return (
    <>
      {currentPage === 'home' ? (
        <HomePage />
      ) : (
        <AdminPanel />
      )}

      {/* 隐藏的管理员入口 - 按 Ctrl+Shift+A 进入管理后台 */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            document.addEventListener('keydown', (e) => {
              if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                window.location.href = '/admin';
              }
            });
          `,
        }}
      />
    </>
  );
}
