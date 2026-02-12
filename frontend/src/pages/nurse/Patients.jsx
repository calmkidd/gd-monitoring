import { useEffect, useState } from "react";
import { getDetailedPatients, handleFetch } from "../../api";
import "../../styles/nurse.css";

export default function Patients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null); // State untuk Modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadPatients = async () => {
      const data = await getDetailedPatients();
      if (data) setPatients(data);
    };
    loadPatients();
  }, []);

  // Fungsi untuk membuka detail pasien
  const handleManageClick = (patient) => {
    setSelectedPatient(patient);
    setIsModalOpen(true);
  };

  return (
    <div className="patients-container-premium">
      <div className="header-glass-premium">
        <div className="header-info">
          <h2>Database Pasien Terdaftar</h2>
          <p>Kelola data medis dan pantau perkembangan pasien secara terpusat.</p>
        </div>
        
        {/* PENCARIAN ELEGAN */}
        <div className="search-wrapper-premium">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Cari berdasarkan Nama atau No. RM..." 
            className="input-search-premium"
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="patient-grid-premium">
        {patients
          .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.rm.toLowerCase().includes(search.toLowerCase()))
          .map((p) => (
            <div key={p.id} className="patient-card-glass">
              <div className="card-top">
                <div className="avatar-letter">{p.name.charAt(0)}</div>
                <div className="basic-info">
                  <h4>{p.name}</h4>
                  <p>{p.rm} • <span className="age-tag">Dewasa</span></p>
                </div>
              </div>
              <div className="card-middle">
                <div className="info-row">
                  <span className="label">Kunjungan Terakhir</span>
                  <span className="value">{p.last_visit.split(' ')[0]}</span>
                </div>
                <div className="info-row">
                  <span className="label">Status</span>
                  <span className="status-indicator-mini">Aktif</span>
                </div>
              </div>
              <button className="btn-manage-premium" onClick={() => handleManageClick(p)}>
                Kelola Pasien
                <span className="btn-arrow">→</span>
              </button>
            </div>
          ))}
      </div>

      {/* MODAL DETAIL MEDIS */}
      {/* MODAL DETAIL MEDIS */}
{isModalOpen && selectedPatient && (
  <div className="modal-overlay-premium" onClick={() => setIsModalOpen(false)}>
    <div className="modal-content-premium" onClick={(e) => e.stopPropagation()}>
      
      {/* TOMBOL SILANG MEWAH */}
      <button className="btn-close-modal-premium" onClick={() => setIsModalOpen(false)}>
        <span>×</span>
      </button>

      <div className="modal-header-premium">
        <h3>Detail Medis: <span>{selectedPatient.name}</span></h3>
        <p className="rm-tag-modal">{selectedPatient.rm}</p>
      </div>

      <div className="modal-body-premium">
        <div className="quick-stats-grid">
          <div className="stat-card-modal">
            <label>Gula Darah Rata-rata</label>
            <p>145 <span>mg/dL</span></p>
          </div>
          <div className="stat-card-modal">
            <label>Kepatuhan Obat</label>
            <p>85<span>%</span></p>
          </div>
        </div>

        {/* BUTTON ACTIONS MEWAH */}
        <div className="action-stack-premium">
            <button className="btn-modal-action action-view">
                <span className="icon">📊</span> Lihat Grafik Historis
                  </button>
                  
                  <div className="action-row-split">
                    <button className="btn-modal-action action-wa">
                      <span className="icon">💬</span> Kirim WhatsApp
                    </button>
                    <button className="btn-modal-action action-emergency">
                      <span className="icon">🚨</span> Kondisi Darurat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}