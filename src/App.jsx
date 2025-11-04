import React from "react";
import PasswordAnalyzer from "/components/PasswordAnalyzer";
import UrlDetector from "/components/UrlDetector";
import EmailDetector from "/components/EmailDetector";
import "/App.css";
import { Route, Routes, Link } from "react-router-dom";

function Home() {
  return (
    <div className="HomePage">
      <div className="content">
        <h1 className="title">SecureCheck</h1>
        <p className="subtitle">
          Analyze passwords & detect suspicious links and emails
        </p>
      </div>
      <div className="nav-buttons">
        <Link to="/password" className="btn">
          <i className="fa-solid fa-key"></i> Password Strength Checker
        </Link>
        <Link to="/url" className="btn">
          <i className="fa-solid fa-link"></i> Malicious URL Detector
        </Link>
        <Link to="/email" className="btn">
          <i className="fa-solid fa-envelope"></i> Phishing Email Detector
        </Link>
      </div>

      <footer>
        <p>
          &copy; {new Date().getFullYear()} SecureCheck - By{" "}
          <strong>Ayman Kz</strong>
        </p>
      </footer>
    </div>
  );
}

function App(){
    return(
        <Routes>
            <Route path="/" element={< Home />}/>
            <Route path="/password" element={<PasswordAnalyzer/>} />
            <Route path="/url" element={<UrlDetector/>}/>
            <Route path="/email" element={<EmailDetector/>}/>
        </Routes>
    )
}

export default App;
