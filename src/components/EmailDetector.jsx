import React, { useState } from "react";

/* --- Suspicious keyword / pattern rules --- */
const suspiciousPatterns = [
  {
    id: "urgency",
    label: "Uses urgency or threats",
    weight: 1.5,
    regex:
      /(urgent|immediately|act now|final warning|limited time|verify your identity|security alert|unusual activity|attention required|suspend|deactivate|expire|expired)/i,
  },
  {
    id: "credentials",
    label: "Requests password / credentials",
    weight: 1.5,
    regex:
      /(password|login|sign in|account verification|update your info|confirm details|reset your password|provide your credentials)/i,
  },
  {
    id: "links",
    label: "Contains suspicious or shortened links",
    weight: 1.5,
    regex:
      /(https?:\/\/|bit\.ly|tinyurl|ow\.ly|t\.co|redirect|verify-link|tracking\.)/i,
  },
  {
    id: "personal_info",
    label: "Requests personal/financial info",
    weight: 1.8,
    regex:
      /(ssn|social security|credit card|debit card|bank account|cvv|pin|account number|billing information)/i,
  },
  {
    id: "suspicious_offer",
    label: "Mentions prize/reward or account action",
    weight: 1.2,
    regex:
      /(win|prize|reward|lottery|gift card|bonus|account (locked|suspended|deactivated|restricted))/i,
  },
  {
    id: "brand_spoof",
    label: "Mentions popular brand or fake support",
    weight: 1.2,
    regex:
      /(paypal|microsoft|apple|amazon|google|facebook|instagram|outlook|netflix|bank of|support team|customer service)/i,
  },
];

/* A small set of common English words for a lightweight "dictionary" heuristic */
const commonWords = new Set(
  `the be to of and a in that have i it for not on with he as you do at this but his by from
  we say her she or an will my one all would there their what so up out if about who get which go me
  when make can like time no just him know take people into year your good some could them see other
  than then now look only come its over think also back after use two how our work first well way even
  new want because any these give day most us`.split(/\s+/)
);

/* suspicious TLDs / country codes often abused (heuristic) */
const suspiciousTLDs = ["ru", "cn", "tk", "xyz", "top", "gq", "ml", "cf"];

function extractEmailAndName(fromText) {
  // Accept formats: "Name <user@domain.com>" OR "user@domain.com (Name)" OR plain email or plain name
  if (!fromText) return { email: null, name: null };

  const angleMatch = fromText.match(/<?([^<>]+@[^<>]+)>?/);
  let email = angleMatch ? angleMatch[1].trim() : null;

  // If not found inside <>, try a simple email regex somewhere in the text
  if (!email) {
    const simple = fromText.match(
      /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/
    );
    email = simple ? simple[1] : null;
  }

  // Name = what's left after removing email and angle brackets
  const name =
    fromText
      .replace(/<?([^<>]+@[^<>]+)>?/g, "")
      .replace(/[()"'<>]/g, "")
      .trim() || null;

  return { email, name };
}

function domainFromEmail(email) {
  if (!email) return null;
  const parts = email.split("@");
  return parts.length === 2 ? parts[1].toLowerCase() : null;
}

function isSuspiciousTLD(domain) {
  if (!domain) return false;
  const tld = domain.split(".").slice(-1)[0];
  return suspiciousTLDs.includes(tld);
}

function analyzeTextIrregularities(text) {
  const result = {
    nonAlphaRatio: 0,
    unknownWordRate: 0,
    allCapsRatio: 0,
    repeatedPunctSeq: false,
    shortWordRatio: 0,
  };

  const clean = text.replace(/\r\n/g, " ").replace(/\n/g, " ").trim();
  if (!clean) return result;

  // character-level metrics
  const totalChars = clean.length;
  const nonAlpha = (clean.match(/[^A-Za-z\s]/g) || []).length;
  result.nonAlphaRatio = nonAlpha / totalChars;

  // word-level metrics
  const tokens = clean.split(/\s+/).filter(Boolean);
  const totalWords = tokens.length;
  const alphaWords = tokens.map((w) => w.replace(/[^A-Za-z']/g, ""));
  const allCapsCount = alphaWords.filter(
    (w) => w.length >= 2 && /^[A-Z']+$/.test(w)
  ).length;
  result.allCapsRatio = allCapsCount / Math.max(1, totalWords);

  // unknown/common word heuristic
  let known = 0;
  let short = 0;
  alphaWords.forEach((w) => {
    const lw = w.toLowerCase();
    if (commonWords.has(lw)) known++;
    if (lw.length <= 2) short++;
  });
  result.unknownWordRate = 1 - known / Math.max(1, totalWords);
  result.shortWordRatio = short / Math.max(1, totalWords);

  // repeated punctuation sequences like "!!!" or "???" or "— ---"
  result.repeatedPunctSeq = /([!?]{2,}|\.{3,}|[-_]{3,})/.test(clean);

  return result;
}

export default function EmailPhishingDetector() {
  const [fromText, setFromText] = useState("");
  const [emailText, setEmailText] = useState("");
  const [results, setResults] = useState([]);
  const [risk, setRisk] = useState(null);
  const [scoreDetails, setScoreDetails] = useState([]);

  const analyzeEmail = () => {
    if (!emailText.trim()) {
      alert("Please paste or type an email body to analyze.");
      return;
    }

    const findings = [];
    let baseScore = 0;

    // 1) Pattern matches
    suspiciousPatterns.forEach((p) => {
      if (p.regex.test(emailText)) {
        findings.push({
          kind: "pattern",
          label: p.label,
          id: p.id,
          weight: p.weight,
        });
        baseScore += p.weight;
      }
    });

    // 2) Link and domain heuristics
    const linkMatches = emailText.match(/([a-zA-Z0-9._-]+:\/\/[^\s]+)/g) || [];
    const httpCount = (emailText.match(/https?:\/\//g) || []).length;
    if (httpCount > 0) {
      findings.push({
        kind: "meta",
        label: `${httpCount} link(s) detected`,
        id: "link_count",
        weight: Math.min(1.5, httpCount * 0.6),
      });
      baseScore += Math.min(1.5, httpCount * 0.6);
    }

    // suspicious TLD occurrences inside text
    const suspiciousDomainMatches = (
      emailText.match(/\b[A-Za-z0-9.-]+\.(ru|cn|tk|xyz|top|gq|ml|cf)\b/gi) || []
    ).length;
    if (suspiciousDomainMatches > 0) {
      findings.push({
        kind: "meta",
        label: `Suspicious TLDs found (${suspiciousDomainMatches})`,
        id: "susp_tld",
        weight: 1,
      });
      baseScore += 1;
    }

    // 3) Sender checks
    const { email: senderEmail, name: senderName } =
      extractEmailAndName(fromText);
    if (senderEmail) {
      const domain = domainFromEmail(senderEmail);
      // local part oddities (many digits or long random-looking string)
      const local = senderEmail.split("@")[0];
      if (
        /\d{4,}/.test(local) ||
        /[_-]{3,}/.test(local) ||
        /^[0-9a-f]{8,}$/i.test(local)
      ) {
        findings.push({
          kind: "sender",
          label: `Suspicious sender local-part: ${local}`,
          id: "sender_local",
          weight: 1,
        });
        baseScore += 1;
      }
      // suspicious TLD on sender domain
      if (isSuspiciousTLD(domain)) {
        findings.push({
          kind: "sender",
          label: `Sender domain uses suspicious TLD: ${domain}`,
          id: "sender_tld",
          weight: 1.5,
        });
        baseScore += 1.5;
      }
      // display name / domain mismatch heuristic: display contains brand but email domain not matching brand
      if (
        senderName &&
        /paypal|microsoft|apple|amazon|google|netflix|bank|support/i.test(
          senderName
        ) &&
        domain &&
        !new RegExp(
          "(paypal|microsoft|apple|amazon|google|netflix|bank|outlook|paypal)",
          "i"
        ).test(domain)
      ) {
        findings.push({
          kind: "sender",
          label: `Display name mentions brand but sender domain (${domain}) doesn't match`,
          id: "display_domain_mismatch",
          weight: 1.5,
        });
        baseScore += 1.5;
      }
    } else {
      // No sender email found in header text — suspicious if empty and inline instruction present
      if (/from:|sender:|reply-to:/i.test(fromText) || fromText.trim() !== "") {
        // If user typed something poorly formatted
        findings.push({
          kind: "sender",
          label: "Unable to parse sender email; check header format",
          id: "sender_unparsed",
          weight: 0.8,
        });
        baseScore += 0.8;
      }
    }

    // 4) Text irregularities
    const irr = analyzeTextIrregularities(emailText);
    const irrFindings = [];
    if (irr.nonAlphaRatio > 0.25) {
      irrFindings.push({
        label: `High non-alpha character ratio (${(
          irr.nonAlphaRatio * 100
        ).toFixed(0)}%)`,
        id: "nonalpha",
        weight: 1,
      });
      baseScore += 1;
    }
    if (irr.unknownWordRate > 0.45) {
      irrFindings.push({
        label: `High unknown-word rate (${(irr.unknownWordRate * 100).toFixed(
          0
        )}%) — many uncommon or misspelled words`,
        id: "unknownwords",
        weight: 1.5,
      });
      baseScore += 1.5;
    }
    if (irr.allCapsRatio > 0.1) {
      irrFindings.push({
        label: `Many ALL-CAPS words (${(irr.allCapsRatio * 100).toFixed(0)}%)`,
        id: "allcaps",
        weight: 0.8,
      });
      baseScore += 0.8;
    }
    if (irr.repeatedPunctSeq) {
      irrFindings.push({
        label: "Repeated punctuation sequences detected (e.g. !!! or ...)",
        id: "reppunct",
        weight: 0.6,
      });
      baseScore += 0.6;
    }
    if (irr.shortWordRatio > 0.45 && irr.unknownWordRate > 0.6) {
      irrFindings.push({
        label: "Many short or token-like words — text may be obfuscated",
        id: "shorttokens",
        weight: 1,
      });
      baseScore += 1;
    }

    // add irrFindings to findings
    irrFindings.forEach((f) =>
      findings.push({
        kind: "irregular",
        label: f.label,
        id: f.id,
        weight: f.weight,
      })
    );

    // 5) Final scoring / thresholds
    // baseScore now sums weighted signals. Apply final adjustments:
    // - heavy link presence already added
    // - scale
    let finalScore = baseScore;

    // optional: penalize very short emails with a link (common phishing style)
    if (
      emailText.trim().length < 80 &&
      (emailText.match(/https?:\/\//g) || []).length >= 1
    ) {
      finalScore += 1.2;
      findings.push({
        kind: "meta",
        label: "Short message with link — suspicious",
        id: "short_with_link",
        weight: 1.2,
      });
    }

    // save details
    setResults(findings);
    setScoreDetails([{ label: "Raw score", value: finalScore.toFixed(2) }]);

    // Risk thresholds (tunable)
    let level = "low";
    if (finalScore >= 2.5 && finalScore < 5) level = "Medium";
    else if (finalScore >= 5) level = "High";

    setRisk(level);
  };

  const getRiskColor = (level) => {
    if (level === "High") return "#ef4444";
    if (level === "Medium") return "#f59e0b";
    return "#10b981";
  };

  return (
    <div className="page">
      <div className="card">
        <div className="card-header">
          <h2>Phishing Email Detector</h2>
          <a href="/SecureCheck/">Back To Home</a>
        </div>

        <label>Sender (From header or sender string):</label>
        <input
          value={fromText}
          onChange={(e) => setFromText(e.target.value)}
          placeholder='e.g. "PayPal Support <no-reply@paypal.com>"'
        />

        <label>Email body / full message:</label>
        <textarea
          value={emailText}
          onChange={(e) => setEmailText(e.target.value)}
          placeholder="Paste the email contents here..."
          rows={10}
        />

        <div className="btn-row">
          <button onClick={analyzeEmail} className="primary-btn">
            Analyze
          </button>
          <button
            onClick={() => {
              setEmailText("");
              setFromText("");
              setResults([]);
              setRisk(null);
              setScoreDetails([]);
            }}
            className="secondary-btn"
          >
            Clear
          </button>
        </div>

        {risk && (
          <div className="risk-section">
            <h3>
              Risk Level:{" "}
              <span className={`risk-text ${getRiskColor(risk)}`}>{risk}</span>
            </h3>
            <div className="risk-bar">
              <div
                className="risk-bar-fill"
                style={{ backgroundColor: getRiskColor(risk) }}
              ></div>
            </div>

            <div className="score-details">
              {scoreDetails.map((s, i) => (
                <div key={i}>
                  {s.label}: {s.value}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="results-section">
          {results.length > 0 ? (
            <ul className="results-list">
              {results.map((r, idx) => (
                <li key={idx}>
                  <strong>[{r.kind}]</strong> {r.label}
                </li>
              ))}
            </ul>
          ) : (
            risk && (
              <p className="no-indicators">
                No strong phishing indicators detected.
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
}
