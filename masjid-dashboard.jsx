import { useState, useReducer, useRef, useEffect } from "react";

const INITIAL_DONATIONS = [
  { id: 1, donorName: "Mahamed Husen", isAnonymous: false, amount: 100, method: "Cash", campaignId: 1, date: "2025-05-28", note: "" },
  { id: 2, donorName: "Mohamed Abulahi", isAnonymous: false, amount: 200, method: "Bank Transfer", campaignId: 1, date: "2025-05-29", note: "" },
  { id: 3, donorName: "", isAnonymous: true, amount: 50, method: "Mobile Money", campaignId: 1, date: "2025-05-29", note: "" },
  { id: 4, donorName: "Omar Farah", isAnonymous: false, amount: 25, method: "Cash", campaignId: 1, date: "2025-05-30", note: "" },
  { id: 5, donorName: "Faiza Muse", isAnonymous: false, amount: 10, method: "Card", campaignId: 1, date: "2025-05-30", note: "" },
  { id: 6, donorName: "Mohamed Abulahi", isAnonymous: false, amount: 30, method: "Cash", campaignId: 1, date: "2025-05-31", note: "" },
];

const CAMPAIGN = { id: 1, name: "Ururinayo Sadaqo", goalAmount: 500, startDate: "2025-05-01", endDate: "2025-06-30", status: "Active" };

function initials(name) {
  if (!name) return "?";
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}

const METHOD_COLORS = {
  "Cash": "#10b981",
  "Bank Transfer": "#3b82f6",
  "Mobile Money": "#f59e0b",
  "Card": "#8b5cf6",
};

const AVATAR_COLORS = ["#0f2d4a","#1e4d7b","#0e6b55","#92400e","#7c2d12","#1d4ed8","#6d28d9"];
function avatarColor(name) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

function CircularGauge({ percent }) {
  const r = 72;
  const cx = 90, cy = 90;
  const startAngle = -210;
  const endAngle = 30;
  const totalArc = endAngle - startAngle;
  const filled = (percent / 100) * totalArc;
  function polar(cx, cy, r, deg) {
    const rad = (deg * Math.PI) / 180;
    return [cx + r * Math.cos(rad), cy + r * Math.sin(rad)];
  }
  function arc(cx, cy, r, a1, a2) {
    const [x1, y1] = polar(cx, cy, r, a1);
    const [x2, y2] = polar(cx, cy, r, a2);
    const large = a2 - a1 > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`;
  }
  const [fillRef, setFillRef] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setFillRef(percent), 100);
    return () => clearTimeout(t);
  }, [percent]);
  const filledArc = (fillRef / 100) * totalArc;
  return (
    <svg width="180" height="160" viewBox="0 0 180 160">
      <path d={arc(cx, cy, r, startAngle, endAngle)} fill="none" stroke="#e2e8f0" strokeWidth="14" strokeLinecap="round" />
      <path
        d={arc(cx, cy, r, startAngle, startAngle + filledArc)}
        fill="none"
        stroke={fillRef >= 100 ? "#f59e0b" : "url(#gaugeGrad)"}
        strokeWidth="14"
        strokeLinecap="round"
        style={{ transition: "all 1s cubic-bezier(.4,0,.2,1)" }}
      />
      <defs>
        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0f2d4a" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>
      </defs>
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="28" fontWeight="700" fill="#0f2d4a">{Math.round(fillRef)}%</text>
      <text x={cx} y={cy + 18} textAnchor="middle" fontSize="11" fill="#64748b">of goal</text>
    </svg>
  );
}

function StatCard({ label, value, icon, accent }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e2e8f0",
      borderRadius: 12,
      padding: "14px 16px",
      display: "flex",
      flexDirection: "column",
      gap: 4,
      boxShadow: "0 1px 4px rgba(15,45,74,0.06)"
    }}>
      <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: accent || "#0f2d4a" }}>{value}</div>
    </div>
  );
}

function TopDonorBars({ donations }) {
  const totals = {};
  for (const d of donations) {
    const name = d.isAnonymous ? "Anonim" : d.donorName;
    totals[name] = (totals[name] || 0) + d.amount;
  }
  const ranked = Object.entries(totals).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const max = ranked[0]?.[1] || 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {ranked.map(([name, amt]) => (
        <div key={name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 90, fontSize: 12, color: "#1e293b", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</div>
          <div style={{ flex: 1, background: "#f1f5f9", borderRadius: 100, height: 8, overflow: "hidden" }}>
            <div style={{ width: `${(amt / max) * 100}%`, height: "100%", background: "linear-gradient(90deg,#0f2d4a,#f59e0b)", borderRadius: 100, transition: "width 0.8s ease" }} />
          </div>
          <div style={{ width: 44, fontSize: 12, color: "#64748b", textAlign: "right" }}>${amt}</div>
        </div>
      ))}
    </div>
  );
}

const EMPTY_FORM = { donorName: "", isAnonymous: false, amount: "", method: "Cash", note: "" };

export default function App() {
  const [donations, setDonations] = useState(INITIAL_DONATIONS);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [tab, setTab] = useState("list");
  const nextId = useRef(INITIAL_DONATIONS.length + 1);

  const total = donations.reduce((s, d) => s + d.amount, 0);
  const goal = CAMPAIGN.goalAmount;
  const percent = Math.min((total / goal) * 100, 100);
  const remaining = Math.max(goal - total, 0);
  const donorCount = new Set(donations.filter(d => !d.isAnonymous).map(d => d.donorName)).size;

  function validate() {
    const e = {};
    if (!form.isAnonymous && !form.donorName.trim()) e.donorName = "Name is required";
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) e.amount = "Enter a valid amount";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;
    const d = {
      id: nextId.current++,
      donorName: form.isAnonymous ? "" : form.donorName.trim(),
      isAnonymous: form.isAnonymous,
      amount: Number(form.amount),
      method: form.method,
      campaignId: 1,
      date: new Date().toISOString().split("T")[0],
      note: form.note,
    };
    setDonations(prev => [d, ...prev]);
    setForm(EMPTY_FORM);
    setErrors({});
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setTab("list");
  }

  const sorted = [...donations].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, sans-serif", background: "#f8fafc", minHeight: "100vh", color: "#1e293b" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg,#0f2d4a 0%,#1a4068 100%)", padding: "20px 24px 16px", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, background: "#f59e0b", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🕌</div>
              <div>
                <h1 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>Masjid Al Nour</h1>
                <p style={{ margin: 0, fontSize: 12, color: "#93c5fd" }}>Ururinayo Sadaqo — {CAMPAIGN.name}</p>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 6px #10b981" }}></div>
            <span style={{ fontSize: 12, color: "#a7f3d0", fontWeight: 500 }}>Campaign Active</span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 16px" }}>

        {/* Goal Dashboard */}
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: "20px 24px", marginBottom: 20, boxShadow: "0 2px 8px rgba(15,45,74,0.07)" }}>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <CircularGauge percent={percent} />
              <div style={{ marginTop: -8, fontSize: 13, fontWeight: 600, color: "#0f2d4a" }}>Campaign Progress</div>
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#64748b", marginBottom: 6 }}>
                  <span>Lacagta la aruriyay</span>
                  <span style={{ fontWeight: 600, color: "#0f2d4a" }}>${total} / ${goal}</span>
                </div>
                <div style={{ background: "#f1f5f9", borderRadius: 100, height: 10, overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${percent}%`,
                    borderRadius: 100,
                    background: percent >= 100 ? "#f59e0b" : "linear-gradient(90deg,#10b981,#f59e0b)",
                    transition: "width 1s cubic-bezier(.4,0,.2,1)"
                  }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <StatCard label="Total Collected" value={`$${total}`} accent="#10b981" />
                <StatCard label="No. of Donors" value={donorCount + donations.filter(d => d.isAnonymous).length} />
                <StatCard label="Goal Amount" value={`$${goal}`} accent="#0f2d4a" />
                <StatCard label="Remaining" value={`$${remaining}`} accent={remaining === 0 ? "#f59e0b" : "#ef4444"} />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 16, background: "#f1f5f9", padding: 4, borderRadius: 10, width: "fit-content" }}>
          {[["list","Recent Donations"],["form","Record Donation"],["top","Top Donors"]].map(([key, label]) => (
            <button key={key} onClick={() => setTab(key)} style={{
              padding: "7px 18px", borderRadius: 8, border: "none", cursor: "pointer",
              background: tab === key ? "#0f2d4a" : "transparent",
              color: tab === key ? "#fff" : "#64748b",
              fontSize: 13, fontWeight: 600, transition: "all 0.2s"
            }}>{label}</button>
          ))}
        </div>

        {/* Donations List */}
        {tab === "list" && (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 8px rgba(15,45,74,0.07)" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#0f2d4a" }}>Recent Donations</div>
                <div style={{ fontSize: 12, color: "#94a3b8" }}>Dhaq-dhaqaqyada Ugu Dambeeyay</div>
              </div>
              <div style={{ fontSize: 12, color: "#64748b" }}>{donations.length} entries</div>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    {["Donor","Amount","Method","Date","Note"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#94a3b8", letterSpacing: "0.05em", textTransform: "uppercase" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((d, i) => {
                    const name = d.isAnonymous ? "Anonim" : d.donorName;
                    const bg = d.isAnonymous ? "#64748b" : avatarColor(d.donorName);
                    return (
                      <tr key={d.id} style={{ borderTop: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                        <td style={{ padding: "11px 16px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <div style={{ width: 32, height: 32, borderRadius: "50%", background: bg, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, flexShrink: 0 }}>
                              {initials(name)}
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 500, color: "#1e293b" }}>{name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "11px 16px", fontWeight: 700, color: "#10b981", fontSize: 14 }}>${d.amount}</td>
                        <td style={{ padding: "11px 16px" }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 100, background: METHOD_COLORS[d.method] + "20", color: METHOD_COLORS[d.method] }}>{d.method}</span>
                        </td>
                        <td style={{ padding: "11px 16px", fontSize: 12, color: "#94a3b8" }}>{d.date}</td>
                        <td style={{ padding: "11px 16px", fontSize: 12, color: "#94a3b8", maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.note || "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background: "#f8fafc", borderTop: "2px solid #e2e8f0" }}>
                    <td style={{ padding: "12px 16px", fontWeight: 700, fontSize: 13, color: "#0f2d4a" }}>Total</td>
                    <td style={{ padding: "12px 16px", fontWeight: 800, fontSize: 15, color: "#0f2d4a" }}>${total}</td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* Registration Form */}
        {tab === "form" && (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 2px 8px rgba(15,45,74,0.07)" }}>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0f2d4a" }}>Record a Donation</div>
              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>Ku Diiwaangeli Sadaqo Cusub</div>
            </div>

            {showSuccess && (
              <div style={{ background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: 10, padding: "12px 16px", marginBottom: 16, color: "#065f46", fontSize: 13, fontWeight: 500 }}>
                ✓ Donation recorded successfully! The dashboard has been updated.
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {/* Donor Name */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>DONOR NAME</label>
                <input
                  disabled={form.isAnonymous}
                  value={form.donorName}
                  onChange={e => setForm(f => ({ ...f, donorName: e.target.value }))}
                  placeholder={form.isAnonymous ? "Anonymous donation" : "Enter full name"}
                  style={{
                    width: "100%", padding: "10px 14px", border: `1.5px solid ${errors.donorName ? "#ef4444" : "#e2e8f0"}`,
                    borderRadius: 10, fontSize: 14, color: "#1e293b", background: form.isAnonymous ? "#f8fafc" : "#fff",
                    boxSizing: "border-box", outline: "none", transition: "border 0.2s"
                  }}
                />
                {errors.donorName && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{errors.donorName}</div>}
              </div>

              {/* Anonymous toggle */}
              <div style={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 10 }}>
                <div
                  onClick={() => setForm(f => ({ ...f, isAnonymous: !f.isAnonymous, donorName: !f.isAnonymous ? "" : f.donorName }))}
                  style={{
                    width: 40, height: 22, borderRadius: 100, cursor: "pointer",
                    background: form.isAnonymous ? "#0f2d4a" : "#e2e8f0",
                    position: "relative", transition: "background 0.2s", flexShrink: 0
                  }}
                >
                  <div style={{
                    width: 16, height: 16, borderRadius: "50%", background: "#fff",
                    position: "absolute", top: 3, left: form.isAnonymous ? 21 : 3,
                    transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)"
                  }} />
                </div>
                <span style={{ fontSize: 13, color: "#64748b" }}>Record as anonymous donation</span>
              </div>

              {/* Amount */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>AMOUNT</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#94a3b8", fontWeight: 600 }}>$</span>
                  <input
                    type="number"
                    min="0"
                    value={form.amount}
                    onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    placeholder="0.00"
                    style={{
                      width: "100%", padding: "10px 14px 10px 28px", border: `1.5px solid ${errors.amount ? "#ef4444" : "#e2e8f0"}`,
                      borderRadius: 10, fontSize: 14, color: "#1e293b", boxSizing: "border-box", outline: "none"
                    }}
                  />
                </div>
                {errors.amount && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{errors.amount}</div>}
              </div>

              {/* Method */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>PAYMENT METHOD</label>
                <select
                  value={form.method}
                  onChange={e => setForm(f => ({ ...f, method: e.target.value }))}
                  style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, color: "#1e293b", background: "#fff", boxSizing: "border-box", outline: "none" }}
                >
                  {["Cash","Bank Transfer","Mobile Money","Card"].map(m => <option key={m}>{m}</option>)}
                </select>
              </div>

              {/* Campaign */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>CAMPAIGN</label>
                <select style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, color: "#1e293b", background: "#fff", boxSizing: "border-box" }}>
                  <option>Ururinayo Sadaqo</option>
                </select>
              </div>

              {/* Note */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: "#64748b", display: "block", marginBottom: 6 }}>NOTE (optional)</label>
                <input
                  value={form.note}
                  onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                  placeholder="Any additional notes..."
                  style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 14, color: "#1e293b", boxSizing: "border-box", outline: "none" }}
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              style={{
                marginTop: 20, width: "100%", padding: "13px",
                background: "linear-gradient(135deg,#0f2d4a,#1e4d7b)",
                color: "#fff", border: "none", borderRadius: 12,
                fontSize: 14, fontWeight: 700, cursor: "pointer", letterSpacing: "0.02em",
                transition: "opacity 0.2s"
              }}
            >
              ﷽ Record Donation
            </button>
          </div>
        )}

        {/* Top Donors */}
        {tab === "top" && (
          <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 2px 8px rgba(15,45,74,0.07)" }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: "#0f2d4a", marginBottom: 4 }}>Top Donors</div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 20 }}>Kuwa ugu bixiyay</div>
            <TopDonorBars donations={donations} />
            <div style={{ marginTop: 24, borderTop: "1px solid #f1f5f9", paddingTop: 20 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button
                  onClick={() => setTab("form")}
                  style={{ padding: "12px", background: "linear-gradient(135deg,#0f2d4a,#1e4d7b)", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  💚 Donate Now
                </button>
                <button
                  onClick={() => {
                    if (navigator.share) navigator.share({ title: "Masjid Al Nour Sadaqo", text: `Help us reach $${goal}! So far $${total} raised.` });
                    else alert(`Share this: Masjid Al Nour Sadaqo Campaign — $${total}/$${goal} raised. Help us reach the goal!`);
                  }}
                  style={{ padding: "12px", background: "#f8fafc", color: "#0f2d4a", border: "1.5px solid #e2e8f0", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                  🔗 Share Campaign
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
