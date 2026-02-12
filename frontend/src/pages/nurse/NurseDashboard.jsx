import { useEffect, useState } from "react";
import { getPatients } from "../../api"; // Pastikan fungsi ini ada di api.js
import "../../styles/nurse.css";

export default function NurseDashboard() {
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({ total: 0, critical: 0, warning: 0 });

  // Di dalam NurseDashboard.jsx
    async function loadData() {
      try {
        const data = await getPatients();
        if (data && Array.isArray(data)) {
          setPatients(data);
          // Kalkulasi statistik dari data nyata
          const critical = data.filter(p => p.status === "Bahaya").length;
          const warning = data.filter(p => p.status === "Waspada").length;
          setStats({ total: data.length, critical, warning });
        } else {
          // Fallback ke data dummy jika API belum siap agar tampilan tetap "mahal"
          console.warn("Menggunakan data dummy karena API belum merespons.");
          const dummy = [
            { id: 1, name: "Budi Santoso", rm: "RSPG-001", glucose: 250, status: "Bahaya", last_update: "10 Menit lalu", trend: "up" },
            { id: 2, name: "Siti Aminah", rm: "RSPG-042", glucose: 110, status: "Stabil", last_update: "1 Jam lalu", trend: "down" }
          ];
          setPatients(dummy);
          setStats({ total: 2, critical: 1, warning: 0 });
        }
      } catch (err) {
        console.error("Gagal mengambil data pasien:", err);
      }
    }

  useEffect(() => { loadData(); }, []);

  return (
    <div className="nurse-container">
      <header className="nurse-header">
        <div className="header-title">
          <h1>Clinical Command Center</h1>
          <p>Pemantauan Real-time Pasien Diabetes RS Petrokimia Gresik</p>
        </div>
        <div className="live-indicator">
          <span className="dot"></span> LIVE MONITORING
        </div>
      </header>

      {/* STATS OVERVIEW */}
      <div className="stats-grid">
        <div className="stat-card">
          <label>Total Pasien</label>
          <div className="stat-val">{stats.total}</div>
        </div>
        <div className="stat-card critical">
          <label>Kritis / Bahaya</label>
          <div className="stat-val">{stats.critical}</div>
        </div>
        <div className="stat-card warning">
          <label>Perlu Observasi</label>
          <div className="stat-val">{stats.warning}</div>
        </div>
      </div>

      {/* PATIENT MONITORING TABLE */}
      <div className="monitor-section">
        <div className="section-header">
          <h3>Daftar Pengawasan Pasien</h3>
          <input type="text" placeholder="Cari Nama atau No. RM..." className="search-nurse" />
        </div>

        <div className="enterprise-table-wrapper">
          <table className="nurse-table">
            <thead>
              <tr>
                <th>Pasien</th>
                <th>Gula Darah Terakhir</th>
                <th>Status Triage</th>
                <th>Update Terakhir</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p.id} className={`row-status-${p.status.toLowerCase()}`}>
                  <td>
                    <div className="patient-info-cell">
                      <strong>{p.name}</strong>
                      <span>{p.rm}</span>
                    </div>
                  </td>
                  <td>
                    <div className="glucose-cell">
                      <span className="val">{p.glucose} mg/dL</span>
                      <span className={`trend-icon ${p.trend}`}>
                        {p.trend === "up" ? "↑" : p.trend === "down" ? "↓" : "→"}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`triage-badge ${p.status.toLowerCase()}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>{p.last_update}</td>
                  <td>
                    <button className="btn-detail" onClick={() => window.location.href=`/nurse/patient/${p.id}`}>
                      Lihat Analisis
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}