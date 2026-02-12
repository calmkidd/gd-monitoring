import { useEffect, useState } from "react";
import { addBloodGlucose, getBloodGlucose } from "../../api";
import "../../styles/blood-glucose.css";

function formatDate(dateString) {
  if (!dateString) return "-";
  
  try {
    // 1. Ubah format "YYYY-MM-DD HH:MM:SS" menjadi standar ISO agar bisa diproses Date
    const iso = dateString.includes(" ") ? dateString.replace(" ", "T") : dateString;
    
    // 2. Karena ada selisih 7 jam (22.44 - 15.44), kita asumsikan input adalah UTC
    // Kita tambahkan "Z" untuk menandai bahwa ini waktu UTC
    const d = new Date(iso + "Z"); 
    
    if (isNaN(d.getTime())) return dateString;

    // 3. Gunakan toLocaleString dengan timeZone Jakarta untuk menambah 7 jam otomatis
    return d.toLocaleString("id-ID", {
      day: "2-digit", 
      month: "short", 
      year: "numeric",
      hour: "2-digit", 
      minute: "2-digit",
      timeZone: "Asia/Jakarta" // Ini akan menambah 7 jam dari UTC secara otomatis
    }).replace(/\./g, ':'); // Mengubah pemisah titik menjadi titik dua (15.44 -> 15:44)
  } catch (e) {
    return dateString;
  }
}

export default function BloodGlucose() {
  const [value, setValue] = useState("");
  const [records, setRecords] = useState([]);
  const [latest, setLatest] = useState(null);

  async function loadData() {
    try {
      const data = await getBloodGlucose();
      if (Array.isArray(data)) {
        // Urutkan data berdasarkan waktu terbaru di paling atas
        const sorted = [...data].sort((a, b) => b.recorded_at.localeCompare(a.recorded_at));
        setRecords(sorted);
        setLatest(sorted[0]); 
      }
    } catch (err) {
      console.error("Gagal memuat data:", err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!value) return;
    
    try {
      await addBloodGlucose(parseInt(value));
      
      // RESET INPUT: Menghilangkan angka yang 'stuck' di kotak input
      setValue(""); 
      
      // REFRESH: Langsung ambil data terbaru agar riwayat langsung update
      await loadData(); 
    } catch (err) {
      console.error("Gagal simpan:", err);
    }
  }

  const getStatus = (val) => {
    if (val < 70) return { label: "Rendah (Hipoglikemia)", color: "risk-low" };
    if (val > 200) return { label: "Sangat Tinggi", color: "risk-high" };
    if (val > 140) return { label: "Tinggi (Prediabetes)", color: "risk-warn" };
    return { label: "Normal", color: "risk-normal" };
  };

  useEffect(() => { loadData(); }, []);

  return (
    <div className="glucose-container">
      <div className="premium-hero">
        <div className="hero-content">
          <div className="hero-text">
            <h2>Monitoring Gula Darah</h2>
            <p>Data tersinkronisasi otomatis dengan standar waktu Indonesia Barat.</p>
          </div>
          {latest && (
            <div className={`latest-badge ${getStatus(latest.value).color}`}>
              <div className="badge-val">
                <span>{latest.value}</span> <small>mg/dL</small>
              </div>
              <div className="badge-status">{getStatus(latest.value).label}</div>
            </div>
          )}
        </div>
      </div>

      <div className="glucose-grid">
        <div className="card input-card">
          <h3>Input Data Baru</h3>
          <form className="inline-form-premium" onSubmit={handleSubmit}>
            <div className="input-with-unit">
              <input 
                type="number" 
                placeholder="000" 
                value={value} 
                onChange={(e) => setValue(e.target.value)} 
                required 
              />
              <span className="unit-label">mg/dL</span>
            </div>
            <button type="submit" className="btn-save-premium">Simpan Data</button>
          </form>
          <p className="hint-text">Waktu akan disesuaikan otomatis dengan zona waktu laptop Anda.</p>
        </div>

        <div className="card history-card">
          <h3>Riwayat Terakhir</h3>
          <div className="modern-table">
            <div className="table-header">
              <span>Nilai</span>
              <span>Status</span>
              <span>Waktu (WIB)</span>
            </div>
            <div className="table-body">
              {records.length === 0 && <p className="empty-state">Belum ada data tercatat.</p>}
              {records.map((r, i) => {
                const status = getStatus(r.value);
                return (
                  <div key={i} className="table-row">
                    <span className="row-val"><strong>{r.value}</strong> mg/dL</span>
                    <span className={`row-status ${status.color}`}>{status.label}</span>
                    <span className="row-date">{formatDate(r.recorded_at)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}