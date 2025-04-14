"use client"
import { Home } from "lucide-react"
import "./AboutUs.css"
import { useNavigate } from "react-router-dom"
export default function AboutUsPage() {
const navigate = useNavigate(); 
   
  const aboutUsContent = {
    paragraph:
      "Plant Disease Detector, as its name suggests, is an app that detects plant diseases from images. It uses AI to analyze the uploaded images and predict the disease. The app utilizes two AI models: Prototypical Networks and Matching Networks. When you upload an image, both models process it, and you receive the prediction with the highest accuracy, helping you take the necessary action for your plants."
  }
  return (
    <div className="about-us-container">
      {/* Navigation */}
      <div className="navigation">
        <button className="home-button" onClick={()=>navigate("/")}>
          <Home className="home-icon" />
        </button>
        <div className="profile-avatar">
          <div className="avatar-circle"></div>
        </div>
      </div>

      {/* About Us Content */}
      <div className="about-content">
        <h1 className="about-heading">About Us</h1>

        <div className="about-card">
          <p className="about-paragraph">{aboutUsContent.paragraph}</p>
        </div>
      </div>
    </div>
  )
}

