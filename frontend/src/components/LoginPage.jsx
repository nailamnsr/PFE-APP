"use client"
import { useNavigate } from 'react-router-dom';
import { useState } from "react"
import { ArrowRight } from "lucide-react"
import "./LoginPage.css"

export default function LoginPage() {
  const navigate = useNavigate();  // Get the navigate function
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const response = await fetch("http://127.0.0.1:8000/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Login successful:", data);
  
         
        localStorage.setItem("userName", data.name);
        localStorage.setItem("UserEmail",data.email);
        localStorage.setItem("UserPassword",data.password);
         
        navigate("/main");
      } else {
        setErrorMessage("Invalid email or password.");  // Affichage du message d'erreur
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMessage("An error occurred. Please try again later.");
    }
  }
  

  return (
    <div className="login-container">
      {/* Logo or Brand */}
      <div className="brand-logo">
        <div className="logo-circle"></div>
      </div>

      {/* Login Form */}
      <div className="login-form-container">
        <h1 className="login-heading">Welcome Back</h1>
        <p className="login-subheading">Please enter your details to sign in</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <div className="password-header">
              <label htmlFor="password" className="form-label">
                Password
              </label>
               
            </div>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />
          </div>
          {errorMessage && <p className="error-message">{errorMessage}</p>}

          <button type="submit" className="login-button">
            <span className="button-text"     >Log In</span>
            <div className="icon-container" >
              <ArrowRight className="arrow-icon" />
            </div>
          </button>
        </form>

        <p className="signup-link">
          Don't have an account?  <span
        onClick={() => navigate("/signUp")}  
      >
        <a>Sign up</a>
      </span>
        </p>
      </div>
    </div>
  )
}

