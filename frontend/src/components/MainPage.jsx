 "use client"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Home, Plus, Clock, X, Leaf } from 'lucide-react'
import "./MainPage.css"

export default function WelcomeScreen() {
  const [userName, setUserName] = useState("")
  const [showSaved, setShowSaved] = useState(false)
  const [savedPredictions, setSavedPredictions] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);
  

  const toggleSavedView = async () => {
    const newShowSaved = !showSaved
    setShowSaved(newShowSaved)

    if (newShowSaved) {
      try {
        const user_id = localStorage.getItem("user_id")
        const res = await fetch(`http://127.0.0.1:8000/user-predictions/${user_id}`)
        const data = await res.json()
        setSavedPredictions(data)
      } catch (err) {
        console.error("Failed to fetch predictions:", err)
        setSavedPredictions([])
      }
    }
  }

  const handleFileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedImage(file)
      handleUpload(file)
    }
  }

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
  
    try {
      const response = await fetch("http://127.0.0.1:8000/upload/", {
        method: "POST",
        body: formData,
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Prediction result:", data);
        const user_id = localStorage.getItem("user_id");
  
        // Save prediction
        await fetch("http://127.0.0.1:8000/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id,
            prediction: data.disease,
            accuracy: data.confidence,
          }),
        });
  
        // Navigate to results page with prediction data
        navigate("/results", { state: { data, userId: user_id } });
  
      } else {
        console.error("Prediction failed");
      }
    } catch (error) {
      console.error("Upload or prediction error:", error);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content">
          <div className="logo-container">
            <Leaf className="leaf-icon" />
            <div className="logo">Plant Disease Detector</div>
          </div>
          <div className="nav-actions">
            <button 
              className={`nav-button ${showSaved ? 'active' : ''}`} 
              onClick={toggleSavedView} 
              aria-label="Saved predictions"
            >
              <Clock className="nav-icon" />
              <span className="nav-label">History</span>
            </button>
            <button 
              className="nav-button" 
              onClick={() => navigate("/")} 
              aria-label="Home"
            >
              <Home className="nav-icon" />
              <span className="nav-label">Home</span>
            </button>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="welcome-section">
          <h1 className="welcome-message">Welcome, {userName}</h1>
          
          <div className="upload-container">
            <p className="upload-instruction">Upload a plant image to detect diseases</p>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              style={{ display: "none" }} 
              id="fileInput" 
            />
            <label htmlFor="fileInput" className="upload-button">
              <span className="upload-text" >Upload an image</span>
              <div className="plus-icon-container">
                <Plus className="plus-icon" />
              </div>
            </label>
          </div>
        </div>
      </main>

      {showSaved && (
        <div className="modal-overlay">
          <div className="saved-predictions-modal">
            <div className="saved-header">
              <h2 className="saved-title"> Predictions history</h2>
              <button className="close-button" onClick={toggleSavedView}>
                <X className="close-icon" />
              </button>
            </div>

            {savedPredictions.length > 0 ? (
              <div className="predictions-list">
                {savedPredictions.map((prediction) => (
                  <div key={prediction.id} className="prediction-card">
                    <div className="prediction-info">
                      <h3 className="disease-name">{prediction.disease}</h3>
                      <p className="prediction-date">Detected on {prediction.date}</p>
                    </div>
                    <div className="accuracy-badge">
                      <span className="accuracy-value">{prediction.accuracy}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-predictions">No saved predictions found</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
