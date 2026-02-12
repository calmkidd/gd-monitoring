import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);
const API_URL = "http://127.0.0.1:5000";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("role");
    const patient_id = localStorage.getItem("patient_id");

    if (token && role) {
      setUser({ role, patient_id });
    }
    setLoading(false);
  }, []);

  async function login(email, password) {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.access_token) return false;

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("role", data.role);
      if (data.patient_id) localStorage.setItem("patient_id", data.patient_id);

      setUser({ role: data.role, patient_id: data.patient_id });
      return data; 
    } catch (err) {
      return false;
    }
  }

  function logout() {
    localStorage.clear();
    setUser(null);
    navigate("/login");
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}