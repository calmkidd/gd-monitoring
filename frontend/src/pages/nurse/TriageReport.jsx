import { useEffect, useState } from "react";
import "../../styles/nurse.css";

export default function TriageReport() {
  const [reports, setReports] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const headers = { "Authorization": `Bearer ${token}` };

        // Ambil data petugas medis untuk tanda tangan
        const userRes = await fetch("http://127.0.0.1:8000/auth/me", { headers });
        const userData = await userRes.json();
        setUser(userData);

        // Ambil data pasien triage
        const reportRes = await fetch("http://127.0.0.1:8000/nurse/patients-summary", { headers });
        const reportData = await reportRes.json();
        if (Array.isArray(reportData)) setReports(reportData);
      } catch (err) {
        console.error("Gagal memuat data:", err);
      }
    };
    loadData();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="triage-report-page">
      {/* TAMPILAN DASHBOARD - OTOMATIS HILANG SAAT PRINT */}
      <div className="section-header-premium no-print">
        <div className="header-info">
          <h2>Laporan Triage Pasien</h2>
          <p>Rekapitulasi status risiko pasien untuk dokumentasi medis.</p>
        </div>
        <button className="btn-print-medical" onClick={handlePrint}>
          <span className="icon">🖨️</span> Cetak Laporan PDF
        </button>
      </div>

      <div className="triage-cards-container no-print">
        {reports.map((d, i) => (
          <div key={i} className={`triage-report-card ${d.status?.toLowerCase()}`}>
            <div className="report-main">
              <h4>{d.name}</h4>
              <p className="rm-sub">No. RM: {d.rm}</p>
              <div className="glucose-info">
                Gula Darah Terakhir: <strong>{d.glucose} mg/dL</strong>
              </div>
            </div>
            <div className="status-badge-container">
              <span className={`status-badge-premium ${d.status?.toLowerCase()}`}>
                {d.status}
              </span>
              <small>Update: {d.last_update}</small>
            </div>
          </div>
        ))}
      </div>

      {/* AREA DOKUMEN RESMI - HANYA MUNCUL SAAT PRINT */}
      <div className="print-area-document">
        <div className="print-kop-surat">
          <div className="kop-header">
            <img src="/Logo_pgm.png" alt="Logo PGM" className="print-logo-img" />
            <div className="hospital-details">
              <h1>RS PETROKIMIA GRESIK</h1>
              <p>Jl. Jenderal Ahmad Yani No.80, Gresik | Telp: (031) 3987000</p>
              <p>Email: info@rspg.it | Website: www.rspg.it</p>
            </div>
          </div>
          <hr className="kop-divider-double" />
          <h2 className="document-title">LAPORAN PEMANTAUAN TRIAGE DIABETES</h2>
          <p className="document-subtitle">Data Real-time Sistem Informasi Gula Darah</p>
        </div>

        <table className="medical-print-table">
          <thead>
            <tr>
              <th>No. RM</th>
              <th>Nama Pasien</th>
              <th>Gula Darah</th>
              <th>Status Triage</th>
              <th>Waktu Update</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((d, i) => (
              <tr key={i}>
                <td>{d.rm}</td>
                <td>{d.name}</td>
                <td style={{ textAlign: 'center' }}>{d.glucose} mg/dL</td>
                <td className={`status-cell-${d.status?.toLowerCase()}`} style={{ textAlign: 'center' }}>
                  {d.status}
                </td>
                <td>{d.last_update}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="print-footer-signature">
          <div className="signature-wrapper">
            <p className="print-date">
              Gresik, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
            <p className="job-title">Petugas Medis,</p>
            <div className="signature-gap"></div>
            <p className="officer-name-signed">
              <strong>( {user?.display_name || 'Ns. Siti'} )</strong>
            </p>
            <p className="nip-detail">NIP: {user?.id_karyawan || 'NIP-RSPG-2024'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}