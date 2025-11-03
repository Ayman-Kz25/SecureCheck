import React, { useState, useMemo } from "react";
import '../App.css'

const RULES = [
  {
    id: "length",
    label: "At least 8 characters",
    test: (pwd) => pwd.length >= 8,
  },
  {
    id: "uppercase",
    label: "Uppercase letter (A-Z)",
    test: (pwd) => /[A-Z]/.test(pwd),
  },
  {
    id: "lowercase",
    label: "Lowercase letter (a-z)",
    test: (pwd) => /[a-z]/.test(pwd),
  },
  { id: "number", label: "Number (0-9)", test: (pwd) => /[0-9]/.test(pwd) },
  {
    id: "special",
    label: "Special character (!@#$...)",
    test: (pwd) => /[^A-Za-z0-9]/.test(pwd),
  },
];

function PasswordAnalyzer() {
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);

  const passed = useMemo(
    () => RULES.map((r) => ({ ...r, ok: r.test(password) })),
    [password]
  );
  const score = passed.reduce((s, r) => s + (r.ok ? 1 : 0), 0);
  const pct = Math.round((score / RULES.length) * 100);

  const strengthLabel =
    score <= 1
      ? "Very Weak"
      : score === 2
      ? "Weak"
      : score === 3
      ? "Medium"
      : score === 4
      ? "Strong"
      : "Very Strong";

  const colors = ["#f87171", "#fb923c", "#facc15", "#4ade80", "#059669"];
  const barColor = colors[score - 1] || "#d1d5db";

  const barStyle =
    score === 5
      ? {
          width: `${pct}%`,
          background:
            "linear-gradient(90deg, red, orange, yellow, green, cyan, blue, violet)",
          backgroundSize: "400% 100%",
        }
      : { width: `${pct}%`, backgroundColor: barColor };

  return (
    <div className="page">
      <div className="card">
        <div className="card-header">
          <h2>Password Analyzer</h2>
          <a href="/SecureCheck/">Back To Home</a>
        </div>

        <div className="input-grp">
          <input
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Type a password to analyze..."
          />
          <button onClick={() => setShow((s) => !s)}>
            {show ? "Hide" : "Show"}
          </button>
        </div>

        <div className="progress">
          <div
            className={`bar ${score === 5 ? 'rainbow' : ''}`} style={barStyle}
          ></div>
        </div>

        <p className="label">
          {strengthLabel} ({pct}%)
        </p>

        <ul className="checklist">
          {passed.map((r) => (
            <li key={r.id} className={r.ok ? "ok" : ""}>
              {r.ok ? <i class="fa-solid fa-check"></i> : ""}
              {r.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default PasswordAnalyzer