import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Home.css'

const Home = () => {
  const [isHovered, setIsHovered] = useState(false)

  const features = [
    {
      path: '/search-account',
      title: '搜索公众号',
      description: '快速搜索并找到您感兴趣的微信公众号',
      icon: '🔍'
    },
    {
      path: '/latest-articles',
      title: '最新文章',
      description: '获取指定公众号的最新文章列表',
      icon: '📰'
    },
    {
      path: '/extract-markdown',
      title: '文章Markdown提取',
      description: '将微信公众号文章转换为Markdown格式',
      icon: '📝'
    },
    {
      path: '/keyword-search',
      title: '关键词搜索',
      description: '在公众号文章中搜索特定关键词',
      icon: '🎯'
    }
  ]

  return (
    <div className="home-container">
      {/* 背景渐变效果 */}
      <div className="background-gradient">
        <div className="gradient-top"></div>
        <div className="gradient-bottom"></div>
      </div>

      {/* 主要内容区域 */}
      <div className="hero-section">
        {/* 手掌和正方体艺术展示 */}
        <div className="art-container">
          <div
            className={`hand-cube-container ${isHovered ? 'hovered' : ''}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            

            {/* 正方体3D效果 */}
            <div className="cube-wrapper">
              <div className="cube">
                <div className="cube-face cube-front">
                  <div className="cube-content">
                    <span className="cube-text">WX Touch</span>
                  </div>
                </div>
                <div className="cube-face cube-back">
                  <div className="cube-content">
                    <span className="cube-text"></span>
                  </div>
                </div>
                <div className="cube-face cube-top"></div>
                <div className="cube-face cube-bottom"></div>
                <div className="cube-face cube-left"></div>
                <div className="cube-face cube-right"></div>
              </div>
            </div>
          </div>
        </div>

        {/* 标题和描述 */}
        <div className="hero-content">
          <h1 className="hero-title">
            WX Touch
            <span className="title-gradient"></span>
          </h1>
          <p className="hero-subtitle">
            微信公众号触手
          </p>
          <p className="hero-description">
            提供公众号搜索、文章获取、内容提取等功能，
            让您更便捷地获取和管理微信公众号内容。
          </p>
        </div>
      </div>

      {/* 功能卡片区域 */}
      <div className="features-section">
        <div className="features-grid">
          {features.map((feature, index) => (
            <Link
              key={feature.path}
              to={feature.path}
              className="feature-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
              <div className="feature-arrow">→</div>
            </Link>
          ))}
        </div>
      </div>

      {/* 底部装饰 */}
      <div className="bottom-decoration">
        <div className="decoration-line"></div>
        <div className="decoration-text">探索微信公众号的无限可能</div>
      </div>
    </div>
  )
}

export default Home