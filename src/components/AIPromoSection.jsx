import { Link } from 'react-router-dom'

function AIPromoSection() {
  return (
    <section className="ai-promo-section">
      <div className="container">
        <div className="ai-promo-content">
          <span className="ai-promo-badge">🚀 New Technology</span>
          <h2>AI-Powered Fitness Revolution</h2>
          <p>
            Experience the future of fitness training with our cutting-edge AI features.
            Get personalized coaching, real-time form analysis, and smart meal planning powered by artificial intelligence.
          </p>
          
          <div className="ai-features-preview">
            <div className="ai-feature-mini">
              <div className="feature-icon">��</div>
              <h4>AI Chatbot</h4>
              <p>24/7 fitness assistant</p>
            </div>
            <div className="ai-feature-mini">
              <div className="feature-icon">🍽️</div>
              <h4>Meal Planner</h4>
              <p>Personalized nutrition</p>
            </div>
            <div className="ai-feature-mini">
              <div className="feature-icon">📹</div>
              <h4>Form Analyzer</h4>
              <p>Real-time corrections</p>
            </div>
            <div className="ai-feature-mini">
              <div className="feature-icon">📊</div>
              <h4>Progress Tracker</h4>
              <p>Smart analytics</p>
            </div>
          </div>

          <Link to="/ai-features" className="ai-cta-button">
            Explore AI Features →
          </Link>
        </div>
      </div>
    </section>
  )
}

export default AIPromoSection
