import { useEffect, useState } from "react";
import "../../styles/nurse.css";

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch("http://127.0.0.1:8000/nurse/activity-log", {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        });
        const data = await response.json();
        if (Array.isArray(data)) setLogs(data);
      } catch (err) {
        console.error("Fetch Error:", err);
      }
    };
    fetchLogs();
  }, []);

  return (
    <div className="activity-log-page">
      <div className="section-header-premium" style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', color: '#1e293b', fontWeight: '800' }}>Log Aktivitas Real-time</h2>
        <p style={{ color: '#64748b' }}>Memantau setiap riwayat input medis pasien secara otomatis.</p>
      </div>

      <div className="timeline-container-premium">
        {logs.map((log, i) => (
          <div key={i} className="timeline-card-premium">
            <div className="time-tag">{log.time}</div>
            <div className="log-content-premium">
              <div className="log-user-name">{log.user}</div>
              <div className="log-action-detail">
                {log.action} — <span className="status-highlight-green">{log.status}</span>
              </div>
            </div>
            <div className="live-status-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}