import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fetchLatestGlucose, fetchLatestMedication, fetchLatestSymptom, getHealthSummary, getBloodGlucose } from "../../api";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";

export default function PatientDashboard() {
  const [glucose, setGlucose] = useState(null);
  const [medication, setMedication] = useState(null);
  const [symptom, setSymptom] = useState(null);
  const [summary, setSummary] = useState({ score: 0, level: "Stabil", recommendations: [] });
  const [glucoseHistory, setGlucoseHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate();
  const [eduContent, setEduContent] = useState(null);

  // ==========================================
  // STATE UNTUK AI CHATBOT
  // ==========================================
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", text: "Halo! Saya Asisten AI RSPG. Ada yang bisa saya bantu terkait kondisi kesehatan Anda hari ini?" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // ==========================================
  // FUNGSI FORMAT WAKTU (SINKRONISASI)
  // ==========================================
  const formatUTCtoWIB = (dateString) => {
    if (!dateString) return "-";
    try {
      const iso = dateString.includes(" ") ? dateString.replace(" ", "T") : dateString;
      const d = new Date(iso + "Z"); 
      return d.toLocaleString("id-ID", { 
        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
        timeZone: "Asia/Jakarta" 
      }).replace(/\./g, ':');
    } catch (e) { return dateString; }
  };

  const formatLocalOnly = (dateString) => {
    if (!dateString) return "-";
    try {
      const iso = dateString.includes(" ") ? dateString.replace(" ", "T") : dateString;
      const d = new Date(iso); 
      return d.toLocaleString("id-ID", { 
        day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
      }).replace(/\./g, ':');
    } catch (e) { return dateString; }
  };

  const formatXAxis = (tickItem) => {
    if (!tickItem) return "";
    try {
      const iso = tickItem.includes(" ") ? tickItem.replace(" ", "T") : tickItem;
      const d = new Date(iso + "Z");
      return isNaN(d) ? "" : d.toLocaleTimeString("id-ID", { 
        hour: '2-digit', minute: '2-digit', timeZone: "Asia/Jakarta" 
      });
    } catch (e) { return ""; }
  };

  // ==========================================
  // LOGIKA PENGAMBILAN DATA
  // ==========================================
  useEffect(() => {
    const load = async () => {
      try {
        const [gRes, mRes, sRes, sum, hist] = await Promise.all([
          fetchLatestGlucose().catch(() => null),
          fetchLatestMedication().catch(() => null),
          fetchLatestSymptom().catch(() => null),
          getHealthSummary().catch(() => null),
          getBloodGlucose().catch(() => [])
        ]);

        if (Array.isArray(hist) && hist.length > 0) {
          const sorted = [...hist].sort((a, b) => b.recorded_at.localeCompare(a.recorded_at));
          setGlucose(sorted[0]);
          setGlucoseHistory([...sorted].reverse().slice(-7));
        } else {
          setGlucose(gRes);
        }

        setMedication(mRes); 
        setSymptom(sRes);
        if (sum) setSummary(sum);

        if (sum) {
          if (sum.level === "Kritis" || (gRes?.value > 200)) {
            setEduContent({
              title: "Tindakan Darurat 🚨",
              text: "Kondisi Anda memerlukan perhatian segera. Pelajari langkah penanganan darurat.",
              color: "edu-danger",
              targetId: "emergency-handling"
            });
          } else if (gRes?.value > 140) {
            setEduContent({
              title: "Tips Kontrol Gula 🥗",
              text: "Gula darah Anda tinggi. Pelajari daftar makanan indeks glikemik rendah.",
              color: "edu-warning",
              targetId: "low-gi-foods"
            });
          } else {
            setEduContent({
              title: "Info Kesehatan harian ✨",
              text: "Kondisi stabil! Pelajari tips menjaga kesehatan diabetes mandiri.",
              color: "edu-success",
              targetId: "lifestyle-tips"
            });
          }
        }
      } catch (e) { 
        console.error("Dashboard error:", e); 
      } finally { 
        setLoading(false); 
      }
    };
    load();
  }, []);

  const handleReadMore = (id) => {
    navigate("/patient/education", { state: { scrollTo: id } });
  };

  // ==========================================
  // LOGIKA KIRIM PESAN CHAT (REAL INTEGRATION)
  // ==========================================
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    
    const userMsg = { role: "user", text: chatInput };
    setMessages(prev => [...prev, userMsg]);
    const currentInput = chatInput;
    setChatInput("");
    setIsTyping(true);
    
    try {
      // Menghubungkan ke API Backend yang menggunakan Gemini
      const response = await fetch("http://127.0.0.1:5000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentInput,
          context: {
            glucose: glucose?.value || "Tidak ada data",
            medication: medication?.medication_name || "Tidak ada data",
            summary_level: summary?.level || "Stabil"
          }
        })
      });
      
      if (!response.ok) throw new Error("Gagal terhubung ke server");

      const data = await response.json();
      
      // Menampilkan jawaban asli dari AI
      setMessages(prev => [...prev, { role: "ai", text: data.reply }]);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [...prev, { 
        role: "ai", 
        text: "Maaf, terjadi kendala koneksi ke server AI RSPG. Pastikan backend Anda sudah berjalan." 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (loading) return <div style={{padding: "50px", textAlign: "center"}}>Memuat Dashboard...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-titles">
          <h1>Ringkasan Kesehatan</h1>
          <p>Sistem Monitoring Terpadu RS Petrokimia Gresik</p>
        </div>
        <div className={`status-score-card ${summary?.level?.toLowerCase().replace(/\s+/g, '-')}`}>
          <span className="score-num">{summary?.score || 0}%</span>
          <span className="score-text">{summary?.level || "Stabil"}</span>
        </div>
      </header>

      {eduContent && (
        <div className={`edu-smart-card ${eduContent.color}`} style={{marginBottom: '20px'}}>
          <div className="edu-icon">💡</div>
          <div className="edu-body">
            <h4>{eduContent.title}</h4>
            <p>{eduContent.text}</p>
          </div>
          <button className="btn-edu-more" onClick={() => handleReadMore(eduContent.targetId)}>
            Baca Edukasi
          </button>
        </div>
      )}

      <div className="grid-dashboard">
        <div className="card chart-card">
          <h3>Tren Gula Darah</h3>
          <div style={{ width: '100%', height: '220px', minHeight: '220px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={glucoseHistory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis dataKey="recorded_at" tickFormatter={formatXAxis} />
                <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
                <Tooltip labelFormatter={(l) => `Waktu: ${formatUTCtoWIB(l)}`} />
                <Line type="monotone" dataKey="value" stroke="#008744" strokeWidth={4} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card urgent-card">
          <h3>Rekomendasi Tindakan</h3>
          <ul style={{paddingLeft: "20px"}}>
            {summary?.recommendations?.map((r, i) => (
              <li key={i} className={r.includes("IGD") ? "call-rs" : ""}>{r}</li>
            )) || <li>Tetap pantau kondisi secara berkala.</li>}
          </ul>
        </div>

        <div className="card">
          <h3>Gula Darah Terakhir</h3>
          <div className="stat-value"><span className="number">{glucose?.value || "-"}</span> mg/dL</div>
          <p className="timestamp">Tercatat: {formatUTCtoWIB(glucose?.recorded_at)}</p>
        </div>

        <div className="card">
          <h3>Obat Terakhir</h3>
          <div className="med-info">
            <strong>{medication?.medication_name || "Tidak ada data"}</strong>
            <p>{medication ? `${medication.dosage} • ${medication.schedule}` : "-"}</p>
          </div>
          <p className="timestamp">Diminum: {formatUTCtoWIB(medication?.created_at)}</p>
        </div>

        <div className="card">
          <h3>Keluhan Terakhir</h3>
          {symptom ? (
            <div className="symptom-info">
              <span className={`badge-risk ${symptom.risk_label?.toLowerCase()}`}>{symptom.risk_label}</span>
              <p><strong>{symptom.conditions}</strong></p>
              <p className="timestamp">Dilaporkan: {formatLocalOnly(symptom.created_at || symptom.recorded_at)}</p>
            </div>
          ) : <p>Tidak ada keluhan</p>}
        </div>
      </div>

      {/* FLOATING AI CHAT WIDGET */}
      <div className={`ai-chat-widget ${isChatOpen ? 'open' : ''}`}>
        {!isChatOpen ? (
          <button className="chat-trigger-btn" onClick={() => setIsChatOpen(true)}>
            <div className="btn-icon">🤖</div>
            <span>Tanya AI Asisten</span>
          </button>
        ) : (
          <div className="chat-window premium-glass">
            <div className="chat-header">
              <div className="header-info">
                <span className="status-dot"></span>
                <strong>RSPG Medical AI</strong>
              </div>
              <button className="close-btn" onClick={() => setIsChatOpen(false)}>×</button>
            </div>
            
            <div className="chat-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`msg-bubble ${msg.role}`}>
                  {msg.text}
                </div>
              ))}
              {isTyping && <div className="msg-bubble ai">AI sedang mengetik...</div>}
            </div>

            <form className="chat-input-area" onSubmit={handleSendMessage}>
              <input 
                type="text" 
                placeholder="Tanyakan kesehatan Anda..." 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button type="submit">➤</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}