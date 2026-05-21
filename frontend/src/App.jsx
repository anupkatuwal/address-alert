import { useState } from "react";
import { MapPin, Mail, Search, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:8000";

function isValidEmail(val) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim());
}

export default function App() {
  const [address, setAddress] = useState("");
  const [recipientInput, setRecipientInput] = useState("");
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function addRecipient() {
    const val = recipientInput.trim();
    if (!val) return;
    if (!isValidEmail(val)) { setError("Invalid email: " + val); return; }
    if (!recipients.includes(val)) setRecipients((p) => [...p, val]);
    setRecipientInput("");
    setError(null);
  }

  function handleRecipientKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addRecipient(); }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setResult(null);

    const trimmed = address.trim();
    if (trimmed.length < 3) { setError("Enter a full address (at least 3 characters)."); return; }

    const allRecipients = [...recipients];
    if (recipientInput.trim()) {
      if (!isValidEmail(recipientInput.trim())) { setError("Invalid email: " + recipientInput.trim()); return; }
      if (!allRecipients.includes(recipientInput.trim())) allRecipients.push(recipientInput.trim());
    }
    if (allRecipients.length === 0) { setError("Add at least one recipient email."); return; }

    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: trimmed, recipients: allRecipients }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.detail ?? `Error ${resp.status}`);
      setResult({ ...data, recipientCount: allRecipients.length });
    } catch (err) {
      setError(err.message || "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="card">
        {/* Header */}
        <div className="card-header">
          <div className="logo">
            <MapPin size={28} strokeWidth={2.5} />
          </div>
          <h1>Address Alert</h1>
          <p>Verify any US address and instantly notify your team.</p>
        </div>

        <form onSubmit={handleSubmit} className="card-body">
          {/* Address field */}
          <div className="field">
            <label htmlFor="address">Street Address</label>
            <div className="input-wrap">
              <Search size={16} className="input-icon" />
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="1600 Pennsylvania Ave NW, Washington, DC 20500"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Recipients field */}
          <div className="field">
            <label>Alert Recipients</label>
            <div className="tag-box">
              <Mail size={16} className="input-icon" style={{ flexShrink: 0, marginTop: 2 }} />
              <div className="tag-inner">
                {recipients.map((r) => (
                  <span key={r} className="chip">
                    {r}
                    <button type="button" onClick={() => setRecipients((p) => p.filter((x) => x !== r))} aria-label={`Remove ${r}`}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={recipientInput}
                  onChange={(e) => setRecipientInput(e.target.value)}
                  onKeyDown={handleRecipientKeyDown}
                  onBlur={addRecipient}
                  placeholder={recipients.length === 0 ? "you@example.com" : "add another…"}
                />
              </div>
            </div>
            <span className="hint">Press Enter or comma to add multiple recipients.</span>
          </div>

          {/* Error */}
          {error && (
            <div className="banner banner-error">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? <><Loader2 size={18} className="spin" /> Searching…</> : "Search & Send Alert"}
          </button>
        </form>

        {/* Result */}
        {result && (
          <div className={`result ${result.found ? "result-found" : "result-notfound"}`}>
            {result.found ? (
              <>
                <div className="result-header">
                  <CheckCircle size={20} />
                  <strong>Address Verified</strong>
                </div>
                <div className="result-rows">
                  <div className="result-row">
                    <span className="result-label">Matched</span>
                    <span>{result.matched_address}</span>
                  </div>
                  {result.coordinates && (
                    <div className="result-row">
                      <span className="result-label">Coordinates</span>
                      <span>{result.coordinates.y.toFixed(6)}, {result.coordinates.x.toFixed(6)}</span>
                    </div>
                  )}
                  <div className="result-row">
                    <span className="result-label">Email</span>
                    <span className={result.email_sent ? "ok" : "warn"}>
                      {result.email_sent
                        ? `Sent to ${result.recipientCount} recipient${result.recipientCount !== 1 ? "s" : ""}`
                        : result.email_error}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="result-header">
                <AlertCircle size={20} />
                <strong>No match found for that address.</strong>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="footer">Powered by US Census Geocoding API</p>
    </div>
  );
}
