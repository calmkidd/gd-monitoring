import { useState } from "react";
import { useAuth } from "../auth/AuthContext";
import logo from "../assets/Logo_pgm.png";
import hero from "../assets/login-illustration.png";
import "../styles/login.css";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState("login"); // login | forgot | activate

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (mode === "login") {
      const result = await login(email, password);
      if (result) {
        window.location.href = result.role === "nurse" ? "/nurse" : "/patient/dashboard";
      } else {
        setError("Email atau password salah");
      }
    } else {
      // Simulasi pengiriman instruksi untuk Forgot/Activate
      alert(`Instruksi telah dikirimkan ke ${email}`);
      setMode("login");
    }
  };

  return (
    <div className="login-page">
      <div className="login-left">
        <img src={logo} className="login-logo" alt="Logo" />
        <div className="login-left-content">
          <h1>Selamat Datang</h1>
          <p>Sistem Informasi Pantau Gula Darah Sehat</p>
          <img src={hero} className="login-hero" alt="Hero" />
        </div>
      </div>
      
      <div className="login-right">
        <form className="login-card" onSubmit={submit}>
          {/* Judul Dinamis */}
          <h2>
            {mode === "login" && "Login"}
            {mode === "forgot" && "Lupa Password"}
            {mode === "activate" && "Aktivasi Akun"}
          </h2>

          {error && <div className="login-error">{error}</div>}
          
          <label>{mode === "activate" ? "Nomor Rekam Medis / Email" : "Email"}</label>
          <input 
            type="text" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder={mode === "activate" ? "Contoh: RSPG-12345" : "email@example.com"}
            required 
          />

          {mode === "login" && (
            <>
              <label>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="••••••••"
                required 
              />
            </>
          )}

          <button type="submit" className="btn-primary-login">
            {mode === "login" && "Masuk"}
            {mode === "forgot" && "Kirim Tautan Reset"}
            {mode === "activate" && "Aktifkan Sekarang"}
          </button>

          {/* Navigasi Antar Mode */}
          <div className="login-footer-links">
            {mode === "login" ? (
              <>
                <span onClick={() => setMode("forgot")}>Lupa password?</span>
                <span onClick={() => setMode("activate")}>Aktivasi Akun Baru</span>
              </>
            ) : (
              <span onClick={() => setMode("login")} className="back-link">
                ← Kembali ke Login
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}