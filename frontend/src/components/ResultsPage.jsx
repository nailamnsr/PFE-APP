"use client"
import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import { BookOpen, Leaf, ArrowLeft } from "lucide-react"
import "./ResultsPage.css"

export default function ResultsPage( { onBack }) {
  const location = useLocation();
  const { data, userId } = location.state || {};
  const [info, setInfo] = useState(data || null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (data) {
      setInfo(data)
    } else {
      console.error("No data received")
    }
  }, [])

  const savePrediction = (data) => {
    if (!userId) {
      setError("User not logged in.")
      return
    }

    setIsSaving(true)
    fetch("http://localhost:8000/save-prediction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
        prediction: data.disease,
        accuracy: data.confidence,
      }),
    })
      .then((res) => res.json())
      .then((response) => {
        console.log("Prediction saved:", response)
        setIsSaving(false)
      })
      .catch((err) => {
        console.error("Error saving prediction:", err)
        setError("Failed to save prediction.")
        setIsSaving(false)
      })
  }

  const handleLearnMore = () => {
    console.log("Learn more about", info.disease)
    // Add your logic for learning more
  }

  if (!info) {
    return (
      <div className="app-container">
        <div className="main-content">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Analyzing your plant image...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-content">
          <div className="logo-container">
            <Leaf className="leaf-icon" />
            <div className="logo">Plant Disease Detector</div>
          </div>
          <div className="nav-actions">
            {onBack && (
              <button className="nav-button" onClick={onBack} aria-label="Go back">
                <ArrowLeft className="nav-icon" />
                <span className="nav-label">Back</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="results-container">
          <h1 className="results-heading">Your Results</h1>

          <div className="result-card">
            <div className="result-header">
              <div className="confidence-indicator">
                <div className={`confidence-circle ${getConfidenceClass(info.confidence)}`}>
                  <span className="confidence-value">{Math.round(info.confidence * 100)}%</span>
                </div>
                <span className="confidence-label">Confidence</span>
              </div>

              <div className="disease-details">
                <p className="detection-label">Disease detected is</p>
                <h2 className="disease-name">{info.disease}</h2>
                <p className="detection-date">Detected on {new Date().toLocaleDateString()}</p>
              </div>
            </div>

            <div className="save-status">
              {isSaving && (
                <p className="status-saving">
                  <span className="status-dot pulsing"></span>
                  Saving to your records...
                </p>
              )}
              {error && <p className="status-error">{error}</p>}
            </div>

            <div className="action-buttons">
              <button className="action-button learn-button" onClick={handleLearnMore}>
                <span className="button-text">Learn More</span>
                <div className="button-icon-container">
                  <BookOpen className="button-icon" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

// Helper function to determine confidence class
function getConfidenceClass(confidence) {
  const percent = confidence * 100
  if (percent >= 80) return "high-confidence"
  if (percent >= 50) return "medium-confidence"
  return "low-confidence"
}

