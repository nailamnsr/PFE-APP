"use client"
import { useNavigate } from 'react-router-dom';
import { useState } from "react"
import { ArrowRight } from "lucide-react"
import "./SignUpPage.css"

export default function SignUpPage() {
  const navigate = useNavigate();  // Get the navigate function
  const [formData, setFormData] = useState({
    name: "",
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
      const response = await fetch("http://127.0.0.1:8000/signup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Signup successful:", data);
  
        localStorage.setItem("userName", data.name); // <-- set with clearer key

        localStorage.setItem("token", data.token); 
        localStorage.setItem("UserEmail",data.email);
        localStorage.setItem("password",data.password)
         
        // Redirect to the main page
        navigate("/main");
      } else {
        console.error("Signup failed");
      }
    } catch (error) {
      console.error("Error during signup:", error);
    }
  };
  
  
  return (
    <div className="signup-container">
      {/* Logo or Brand */}
      <div className="brand-logo">
        <div className="logo-circle"></div>
      </div>

      {/* Signup Form */}
      <div className="signup-form-container">
        <h1 className="signup-heading">Create Account</h1>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your name"
              required
            />
          </div>

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
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              required
            />
          </div>

          <button type="submit" className="signup-button">
            <span className="button-text">Sign Up</span>
            <div className="icon-container" >
              <ArrowRight className="arrow-icon" />
            </div>
          </button>
        </form>

        <p className="login-link">
          Already have an account? <span onClick={()=>navigate("/login")}
      >
       <a>Log in</a> 
      </span>
        </p>
      </div>
    </div>
  )
}

