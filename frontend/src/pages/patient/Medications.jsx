import { useEffect, useState } from "react";
import { addMedication, getMedications } from "../../api";
import "../../styles/medications.css";

// FUNGSI PERBAIKAN JAM (SELISIH 7 JAM)
function formatDate(dateString) {
  if (!dateString) return "-";
  try {
    // Mengubah spasi menjadi 'T' agar sesuai standar ISO
    const iso = dateString.includes(" ") ? dateString.replace(" ", "T") : dateString;
    
    // TAMBAHKAN "Z" agar dianggap UTC, lalu otomatis ditambah 7 jam oleh timeZone Jakarta
    const d = new Date(iso + "Z");
    
    if (isNaN(d.getTime())) return dateString;

    return d.toLocaleString("id-ID", {
      day: "2-digit", 
      month: "short", 
      year: "numeric",
      hour: "2-digit", 
      minute: "2-digit",
      timeZone: "Asia/Jakarta" // Menambah 7 jam secara otomatis
    }).replace(/\./g, ':');
  } catch (e) {
    return dateString;
  }
}

export default function Medications() {
  const [name, setName] = useState("");
  const [dose, setDose] = useState("");
  const [schedule, setSchedule] = useState("Pagi"); 
  const [records, setRecords] = useState([]);

  async function loadData() {
    try {
      const data = await getMedications();
      if (Array.isArray(data)) {
        // Urutkan data terbaru di paling atas
        const sorted = [...data].sort((a, b) => 
          (b.taken_at || b.created_at).localeCompare(a.taken_at || a.created_at)
        );
        setRecords(sorted);
      }
    } catch (err) {
      console.error("Load error:", err);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await addMedication({
        medication_name: name,
        dosage: dose,
        time_of_day: schedule,
      });
      
      setName("");
      setDose("");
      setSchedule("Pagi");
      await loadData();
    } catch (err) {
      console.error("Gagal simpan:", err);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="medication-container">
      <div className="premium-card">
        <div className="premium-header">
          <h2>Monitoring Obat</h2>
          <p>Data tersinkronisasi dengan standar waktu Indonesia Barat (WIB).</p>
        </div>

        <form className="medication-form-premium" onSubmit={handleSubmit}>
          <div className="input-field flex-grow-3">
            <label>Nama Obat</label>
            <input
              type="text"
              placeholder="Metformin / Insulin"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="input-field flex-grow-1">
            <label>Dosis</label>
            <input
              type="text"
              placeholder="500 mg"
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              required
            />
          </div>
          <div className="input-field flex-grow-1">
            <label>Jadwal Minum</label>
            <select value={schedule} onChange={(e) => setSchedule(e.target.value)}>
              <option value="Pagi">Pagi</option>
              <option value="Siang">Siang</option>
              <option value="Malam">Malam</option>
            </select>
          </div>
          <button className="btn-save-enterprise">Simpan</button>
        </form>
      </div>

      <div className="history-wrapper">
        <h3>Riwayat Konsumsi Obat</h3>
        <div className="medication-list-modern">
          {records.length === 0 && <p className="empty-state">Belum ada data tercatat.</p>}
          {records.map((r, i) => (
            <div key={i} className="medication-item-row">
              <div className="item-main">
                <div className={`schedule-badge ${(r.time_of_day || r.schedule || "Pagi").toLowerCase()}`}>
                  {r.time_of_day || r.schedule || "Pagi"}
                </div>
                <div className="item-info">
                  <strong>{r.medication_name}</strong>
                  <span>{r.dosage}</span>
                </div>
              </div>
              <div className="item-meta">
                <span className="timestamp-label">Waktu Pencatatan</span>
                <span className="timestamp-val">{formatDate(r.taken_at || r.created_at)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}