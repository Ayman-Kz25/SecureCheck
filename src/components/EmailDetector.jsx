import React, { useState } from "react";

const suspiciousPatterns = [
  { id: 1, label: "Contains urgent phrases", regex: /(urgent|immediately|asap|verify now|act fast)/i },
  { id: 2, label: "Contains password or OTP requests", regex: /(password|otp|one time code|pin|credential)/i },
  { id: 3, label: "Suspicious links detected", regex: /(bit\.ly|tinyurl\.|http:\/\/|https:\/\/(?!www\.|mail\.|accounts\.))/i },
  { id: 4, label: "Requests personal info", regex: /(ssn|credit card|bank account|security number)/i },
  { id: 5, label: "Sender mentions account suspension or restriction", regex: /(account (suspended|restricted|locked|deactivated))/i },
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
