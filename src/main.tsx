/**
 * @file main.tsx
 * @description
 * 应用的入口文件。
 *
 * - 使用`ReactDOM.createRoot`来初始化React应用的根节点。
 * - 通过`BrowserRouter`包裹主组件`App`，为整个应用提供路由功能。
 * - 引入全局样式文件`index.css`。
 * - 在`React.StrictMode`下渲染应用，以开启额外的开发时检查。
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)