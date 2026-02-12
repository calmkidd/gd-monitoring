import React, { useEffect, useState } from "react";
import { getProfile } from "../../api";
import "../../styles/nurse.css";

export default function NurseProfile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      const data = await getProfile();
      setUser(data);
    };
    loadProfile();
  }, []);

  if (!user) return <div className="loading-state">Memuat Profil...</div>;

  return (
    <div className="nurse-profile-wrapper">
      <div className="premium-header">
        <h1>Profil Petugas Medis</h1>
        <p>Informasi kredensial dan akses sistem pemantauan real-time.</p>
      </div>

      <div className="profile-grid">
        {/* KARTU UTAMA: IDENTITAS */}
        <div className="profile-card identity-highlight">
          <div className="avatar-container">
            <span className="avatar-icon">🩺</span>
            <div className="status-indicator">Online</div>
          </div>
          <div className="identity-text">
            <label>Nama Lengkap</label>
            <h2>{user.display_name || "Ns. Siti (Internal Medicine)"}</h2>
            <span className="badge-nurse">{user.role.toUpperCase()}</span>
          </div>
        </div>

        {/* KARTU DETAIL: DATA PEGAWAI */}
        <div className="profile-card info-details">
          <h3>Detail Kepegawaian</h3>
          <div className="detail-item">
            <label>Email Akses</label>
            <p>{user.email}</p>
          </div>
          <div className="detail-item">
            <label>Nomor Induk Pegawai (NIP)</label>
            <p>{user.id_karyawan || "NIP-2026-RSPG-001"}</p>
          </div>
          <div className="detail-item">
            <label>Unit Departemen</label>
            <p>Diabetes Center - RS Petrokimia Gresik</p>
          </div>
          <div className="detail-item">
            <label>Spesialisasi Akses</label>
            <p>Internal Medicine Monitoring</p>
          </div>
        </div>

        {/* KARTU KEAMANAN & SISTEM */}
        <div className="profile-card security-box">
          <h3>Keamanan & Sistem</h3>
          <div className="security-status">
            <div className="status-item">
              <span className="icon">🔒</span>
              <div>
                <strong>Enkripsi Sesi</strong>
                <p>HS256 - Aktif</p>
              </div>
            </div>
            <div className="status-item">
              <span className="icon">🛡️</span>
              <div>
                <strong>Izin Akses</strong>
                <p>Level: Administrator Medis</p>
              </div>
            </div>
          </div>
          <button className="btn-edit-premium">Ubah Kata Sandi</button>
        </div>
      </div>
    </div>
  );
}