import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import './Layout.css'

interface LayoutProps {
  children: ReactNode
}

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