import { useNavigate } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import "./WelcomePage.css";

export default function WelcomePage() {
  const navigate = useNavigate();   

  return (
    <div className="welcome-page-container">
      <nav className="welcome-nav">
        <div className="logo-container">
          <Leaf className="leaf-icon" />
          <div className="logo">Plant Disease Detector</div>
        </div>
        <div className="nav-links">
          <button className="nav-link" onClick={() => navigate("/aboutus")}>About Us</button>
          <button className="nav-link" onClick={() => navigate("/faq")}>FAQ</button>
        </div>
      </nav>

      <main className="welcome-content">
        <div className="hero-section">
          <div className="hero-text">
            <h2 className="tagline">The First AI Plant Disease Detector</h2>
            <h1 className="main-heading">
              Plant<br />
              Disease<br />
              Detection
            </h1>
            <p className="subtitle">Powered by two advanced AI models</p>
            <button className="start-button" onClick={() => navigate("/signUp")}>
              Get Started
            </button>
          </div>
          <div className="hero-visual">
            <div className="circle-decoration"></div>
            <div className="leaf-decoration">
              <Leaf className="big-leaf" />
            </div>
          </div>
        </div>
      </main>

      <div className="background-decoration top-right"></div>
      <div className="background-decoration bottom-left"></div>
    </div>
  );
}
