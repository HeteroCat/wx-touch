/**
 * @file Layout.tsx
 * @description
 * 定义了应用的通用布局结构，包含一个固定的顶部导航栏和主内容区域。
 * 该组件旨在为所有页面提供一致的外观和导航体验。
 */
import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Layout.css'

interface LayoutProps {
  children: ReactNode
}

/**
 * @component Layout
 * @description
 * 一个函数式组件，提供了应用的通用页面布局。
 * 它包含一个导航栏，其中链接到应用的不同部分，并渲染其子组件作为主内容。
 * @param {LayoutProps} props - 组件属性，包含要渲染的子元素。
 * @param {ReactNode} props.children - 将被渲染在主内容区域的React节点。
 * @returns {JSX.Element} - 渲染后的布局组件。
 */
const Layout = ({ children }: LayoutProps) => {
  const location = useLocation()

  const isActive = (path: string): boolean => {
    return location.pathname === path
  }

  const navItems = [
    { path: '/', label: '首页' },
    { path: '/search-account', label: '搜索公众号' },
    { path: '/latest-articles', label: '最新文章' },
    { path: '/extract-markdown', label: 'Markdown提取' },
    { path: '/keyword-search', label: '关键词搜索' }
  ]

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <h1>WX Touch</h1>
            <span className="nav-subtitle">微信公众号触手</span>
          </div>
          <ul className="nav-menu">
            {navItems.map((item) => (
              <li key={item.path} className="nav-item">
                <Link
                  to={item.path}
                  className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default Layout