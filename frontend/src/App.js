import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import WelcomePage from "./components/WelcomePage";   
import MainPage from "./components/MainPage"; 
import SignUpPage from"./components/SingUpPage";
import LoginPage from "./components/LoginPage";
import ResultsPage  from "./components/ResultsPage";
import AboutUsPage from "./components/AboutUs";
import FAQPage from "./components/Faq";

function App() {
  const [setMessage] = useState("");

  useEffect(() => {
    fetch("http://127.0.0.1:8000/")
      .then((response) => response.json())
      .then((data) => setMessage(data.message))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/signUp" element ={<SignUpPage/>} />
        <Route path="/main" element={<MainPage/>} />
        <Route path="/login" element ={<LoginPage/>}/>
        <Route path="/results" element={<ResultsPage/>}/>
        <Route path="/aboutus" element={<AboutUsPage/>}/>
        <Route path= "/faq" element={<FAQPage/>}/>
      </Routes>
    </Router>
  );
}

export default App;

