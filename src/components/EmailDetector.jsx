import React, { useState } from "react";

const suspiciousPatterns = [
  { id: 1, label: "Uses urgency or threats", regex: /(urgent|immediately|act now|final warning|limited time|verify your identity|security alert|unusual activity|attention required|suspend|deactivate)/i },
  
  { id: 2, label: "Requests password or credentials", regex: /(password|login|account verification|update your info|confirm details|reset your password|sign in)/i },
  
  { id: 3, label: "Contains suspicious or shortened links", regex: /(http:\/\/|https:\/\/(?!www\.|mail\.|accounts\.)|bit\.ly|tinyurl|redirect|verify-link|tracking\.|go\.|securelogin)/i },
  
  { id: 4, label: "Requests personal or financial information", regex: /(ssn|social security|credit card|debit card|bank|cvv|pin|account number|personal details|billing)/i },
  
  { id: 5, label: "Mentions account suspension, restriction, or prize", regex: /(account (locked|deactivated|suspended|restricted|expired)|win|prize|reward|lottery|gift card|bonus)/i },
  
  { id: 6, label: "Spoofed brand names or fake support", regex: /(paypal|microsoft|apple|amazon|facebook|instagram|google|outlook|netflix|delivery|support team)/i },
  
  { id: 7, label: "Contains mixed languages or random text patterns", regex: /([a-zA-Z]+\d+[a-zA-Z]+|[а-яА-ЯёЁ]+|[#@$%^&*]{3,})/i },
];

export default function EmailPhishingDetector() {
  const [emailText, setEmailText] = useState("");
  const [results, setResults] = useState([]);
  const [risk, setRisk] = useState(null);

  const analyzeEmail = () => {
    if (!emailText.trim()) {
      alert("Please paste or type an email to analyze.");
      return;
    }

    const findings = suspiciousPatterns.filter((p) => p.regex.test(emailText));
    setResults(findings);

    const score = findings.length;
    let level = "";
    if (score === 0) level = "Low";
    else if (score <= 2) level = "Medium";
    else level = "High";
    setRisk(level);
  };

  const getRiskColor = (level) => {
    if (level === "High") return "#f87171"; // red
    if (level === "Medium") return "#fb923c"; // orange
    return "#4ade80"; // green
  };

  return (
    <div className="page">
      <div className="card">
        <div className="card-header">
          <h2>Phishing Email Detector</h2>
          <a href="/SecureCheck/">Back To Home</a>
        </div>

      <div className="mailText-grp">
        <textarea
          value={emailText}
          onChange={(e) => setEmailText(e.target.value)}
          placeholder="Paste suspicious email content here..."
          rows={7}
        />

        <button onClick={analyzeEmail}>Analyze Email</button>
      </div>

      {risk && (
          <div className="risk-level">
            <h3>Risk Level: <span style={{ color: getRiskColor(risk) }}>{risk}</span></h3>
            <div
              className="risk-bar"
              style={{
                backgroundColor: getRiskColor(risk),
                width: risk === "Low" ? "33%" : risk === "Medium" ? "66%" : "100%",
              }}
            ></div>
          </div>
        )}

        {results.length > 0 ? (
          <ul className="result-list">
            {results.map((r) => (
              <li key={r.id} className="warning">
                <i className="fa-solid fa-triangle-exclamation"></i> {r.label}
              </li>
            ))}
          </ul>
        ) : (
          risk && <p className="safe">No suspicious content detected.</p>
        )}
      </div>
    </div>
  );
}
