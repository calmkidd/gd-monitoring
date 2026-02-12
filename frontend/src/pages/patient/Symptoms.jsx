import { useEffect, useState } from "react";
import { addSymptom, getSymptoms } from "../../api";
import "../../styles/symptoms.css";

function formatDate(dateString) {
  if (!dateString) return "-";
  const iso = dateString.includes(" ") ? dateString.replace(" ", "T") : dateString;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("id-ID", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZone: "Asia/Jakarta"
  });
}

export default function Symptoms() {
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [note, setNote] = useState("");
  const [records, setRecords] = useState([]);
  const [showToast, setShowToast] = useState(false);

  // Daftar gejala dipisahkan agar sinkron dengan Triage di main.py
  const symptomList = [
    { id: "lemas", label: "Badan Terasa Lemas", type: "hypo" },
    { id: "gemetar", label: "Tangan Gemetar", type: "hypo" },
    { id: "keringat", label: "Keringat Dingin", type: "hypo" },
    { id: "pusing", label: "Pusing / Sakit Kepala", type: "hypo" },
    { id: "haus", label: "Sering Merasa Haus", type: "hyper" },
    { id: "kencing", label: "Sering Buang Air Kecil", type: "hyper" },
    { id: "kabur", label: "Penglihatan Kabur", type: "hyper" },
    { id: "mual", label: "Mual / Muntah", type: "hyper" },
    { id: "sesak", label: "Sesak Napas", type: "hyper" },
    { id: "kesemutan", label: "Kesemutan", type: "hyper" },
  ];

  async function loadData() {
    try {
      const data = await getSymptoms();
      if (Array.isArray(data)) {
        const sorted = [...data].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setRecords(sorted);
      }
    } catch (err) {
      console.error("Gagal memuat riwayat:", err);
    }
  }

  useEffect(() => { loadData(); }, []);

  const toggleSymptom = (id) => {
    setSelectedSymptoms(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Pisahkan gejala menjadi hypo dan hyper sesuai permintaan main.py
    const hypo = symptomList
      .filter(s => selectedSymptoms.includes(s.id) && s.type === "hypo")
      .map(s => s.label).join(",");
    
    const hyper = symptomList
      .filter(s => selectedSymptoms.includes(s.id) && s.type === "hyper")
      .map(s => s.label).join(",");

    try {
      // DATA INI WAJIB SAMA DENGAN SymptomCreate DI main.py
      const result = await addSymptom({
        hypo_symptoms: hypo || "",
        hyper_symptoms: hyper || "",
        severity: selectedSymptoms.length > 3 ? "Berat" : "Sedang",
        conditions: selectedSymptoms.includes("sesak") ? "Darurat" : "Stabil",
        note: note
      });

      if (result) {
        setShowToast(true);
        setSelectedSymptoms([]);
        setNote("");
        setTimeout(async () => {
          await loadData();
          setShowToast(false);
        }, 500);
      }
    } catch (err) {
      console.error("Detail Error 422:", err);
      alert("Gagal kirim. Pastikan semua field wajib terisi.");
    }
  };

  return (
    <div className="symptoms-page-container">
      {showToast && <div className="toast-notification">Laporan berhasil terkirim ke sistem medik</div>}
      
      <div className="premium-card">
        <div className="premium-header">
          <h2>Assessment Gejala Harian</h2>
          <p>Laporan ini dianalisis otomatis oleh sistem Triage RS Petrokimia Gresik.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="symptom-grid">
            {symptomList.map((s) => (
              <div 
                key={s.id} 
                className={`symptom-box ${selectedSymptoms.includes(s.id) ? "active" : ""}`}
                onClick={() => toggleSymptom(s.id)}
              >
                <div className="checkbox-custom">
                  {selectedSymptoms.includes(s.id) && <span className="check-mark">✓</span>}
                </div>
                <span>{s.label}</span>
              </div>
            ))}
          </div>

          <div className="input-group-premium">
            <label>Catatan Tambahan</label>
            <textarea 
              placeholder="Jelaskan kondisi Anda lebih mendalam jika perlu..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-submit-premium" disabled={selectedSymptoms.length === 0}>
            Kirim Laporan Assessment
          </button>
        </form>
      </div>

      <div className="history-wrapper">
        <div className="history-header">
          <h3>Log Laporan Gejala</h3>
          <span className="badge-count">{records.length} Laporan</span>
        </div>
        
        <div className="symptom-history-list">
          {records.length === 0 && <p className="empty-state">Belum ada riwayat laporan keluhan.</p>}
          {records.map((r, i) => (
            <div key={i} className="history-item-card">
              <div className="history-main">
                <div className={`risk-indicator ${(r.risk_label || "Stabil").toLowerCase()}`}>
                  <span className="risk-text">{r.risk_label || "Stabil"}</span>
                  <span className="condition-text">{r.conditions || "Terpantau"}</span>
                </div>
                <div className="history-content">
                  <div className="symptoms-tags">
                    {/* Menggabungkan hypo dan hyper untuk ditampilkan kembali */}
                    {[r.hypo_symptoms, r.hyper_symptoms].filter(Boolean).join(", ").split(",").map((tag, idx) => (
                      tag.trim() && <span key={idx} className="tag">{tag}</span>
                    ))}
                  </div>
                  {r.note && <p className="history-note">"{r.note}"</p>}
                </div>
              </div>
              <div className="history-date">
                <span className="date-val">{formatDate(r.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}