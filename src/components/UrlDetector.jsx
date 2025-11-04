import React, { useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'

library.add(fas, far, fab)

function isIPv4(host) {
  return /^\d{1,3}(?:\.\d{1,3}){3}$/.test(host);
}

const SUSPICIOUS_KEYWORDS = [
  "login",
  "signin",
  "verify",
  "secure",
  "update",
  "confirm",
  "bank",
  "ebay",
  "paypal",
];

const SAFE_DOMAINS = [
  "google.com",
  "linkedin.com",
  "microsoft.com",
  "github.com",
  "chatgpt.com",
  "pinterest.com",
  "youtube.com",
];

export default function UrlDetector() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);

  function analyze(urlStr) {
    let target = urlStr.trim();
    if (!target) return null;
    if (!/^https?:\/\//i.test(target)) target = "http://" + target;

    try {
      const u = new URL(target);
      const hostname = u.hostname.toLowerCase();
      const path = u.pathname + u.search;
      const flags = [];

      const suspiciousCharsRegex = /[^a-z0-9.-]/;
      const suspiciousPathRegex = /[^a-z0-9\/._?=&-]/i;

      //General Checks
      if (u.protocol !== "https:") flags.push("Not using HTTPS");
      if (target.includes("@")) flags.push("Contains @ Symbol");
      if (isIPv4(hostname)) flags.push("Uses IP address instead of domain");
      if (hostname.split(".").length >= 4) flags.push("Many subdomains");
      if (target.length > 75) flags.push("Long URL (>75 chars)");
      if (suspiciousCharsRegex.test(hostname))
        flags.push("Contains unusual/suspicious characters in link");
      if (suspiciousPathRegex.test(path))
        flags.push("Contains unusual/suspicious characters in Query");

      //Key-word based checks
      if (
        SUSPICIOUS_KEYWORDS.some(
          (k) => hostname.includes(k) || path.includes(k)
        )
      ) {
        flags.push("Contain Suspicious keywords");
      }

      // Check for exact safe domains (main domain or subdomains)
      const isSafeDomain = SAFE_DOMAINS.some(
        (d) => hostname === d || hostname.endsWith("." + d)
      );

      if (isSafeDomain && flags.length === 0) {
        setResult({ url: u.href, flags: [], verdict: "Likely Safe" });
        return;
      } else if(isSafeDomain && flags.length > 0){
        flags.push("Suspicious use of a trusted domain (possible phishing)");
      }

      const verdict =
      flags.length >= 2
        ? "Suspicious"
        : flags.length === 1
          ? "Maybe Suspicious"
          : "Likely Safe";

    setResult({ url: u.href, flags, verdict });
  } catch {
    setResult({ error: "Invalid URL" });
  }
}

return (
  <div className="page">
    <div className="card">
      <div className="card-header">
        <h2>Malicious URL Detector</h2>
        <a href="/SecureCheck/">Back To Home</a>
      </div>

      <div className="input-grp">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="https://example.com/login"
        />
        <button onClick={() => analyze(input)}>Analyze</button>
      </div>

      {result &&
        (result.error ? (
          <p className="error">{result.error}</p>
        ) : (
          <div className="result">
            <p>
              <strong>Verdict: </strong>
              <span className="result-text">{result.verdict}</span>
            </p>
            <p>
              <strong>URL: </strong>
              <span className="result-text">{result.url}</span>
            </p>
            {result.flags.length > 0 ? (
              <ul>
                {result.flags.map((f, i) => (
                  <li key={i}>
                    <FontAwesomeIcon icon="fa-solid fa-triangle-exclamation" />
                    {f}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No suspicious flags detected.</p>
            )}
          </div>
        ))}
    </div>
  </div>
);
}
