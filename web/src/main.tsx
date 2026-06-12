/**
 * 应用入口文件
 *
 * 职责：
 * 1. 挂载 React 根节点到 DOM
 * 2. 引入全局样式（reset、variables、animations、global）
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// 引入全局样式（按顺序加载：重置 -> 变量 -> 动画 -> 全局样式）
import '@/styles/reset.css';
import '@/styles/variables.css';
import '@/styles/animations.css';
import '@/styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
