const API_URL = "http://127.0.0.1:5000";

/* =====================
   HELPER: AUTH HEADER & FETCH
===================== */
function authHeader() {
  const token = localStorage.getItem("access_token");
  return token ? { 
    "Authorization": `Bearer ${token}`, 
    "Content-Type": "application/json" 
  } : { "Content-Type": "application/json" };
}

// Handler terpusat (Exported agar tidak error Syntax)
export async function handleFetch(url, options = {}) {
  const res = await fetch(url, { 
    ...options, 
    headers: { ...authHeader(), ...options.headers } 
  });
  
  if (res.status === 401) {
    localStorage.clear();
    window.location.href = "/login";
    return null;
  }
  
  return res.json();
}

/* =====================
   AUTHENTICATION & PROFILE
===================== */
export const login = async (email, password) => {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  return res.json();
};

// Fungsi ini yang tadi menyebabkan error di NurseProfile.jsx
export const getProfile = async () => {
  return await handleFetch(`${API_URL}/auth/me`);
};

/* =====================
   SMART AI CHATBOT
===================== */
export const chatWithAI = async (message, context) => {
  return await handleFetch(`${API_URL}/api/chat`, {
    method: "POST",
    body: JSON.stringify({ message, context })
  });
};

/* =====================
   DASHBOARD DATA PERAWAT
===================== */
export const getPatients = async () => {
  return await handleFetch(`${API_URL}/nurse/patients-summary`);
};

export const getDetailedPatients = async () => {
  return await handleFetch(`${API_URL}/nurse/patients-detailed`);
};

export const getPatientDetail = async (patientId) => {
  return await handleFetch(`${API_URL}/nurse/patient/${patientId}`);
};

export const getAllPatients = async () => {
  return await handleFetch(`${API_URL}/nurse/patients-summary`);
};

/* =====================
   DASHBOARD DATA PASIEN
===================== */
export const fetchLatestGlucose = async () => {
  const data = await handleFetch(`${API_URL}/patient/blood-glucose`);
  return data && data.length ? data[0] : null;
};

export const fetchLatestMedication = async () => {
  const data = await handleFetch(`${API_URL}/patient/medications`);
  return data && data.length ? data[0] : null;
};

export const fetchLatestSymptom = async () => {
  const data = await handleFetch(`${API_URL}/patient/symptoms`);
  return data && data.length ? data[0] : null;
};

export const getHealthSummary = async () => {
  return await handleFetch(`${API_URL}/patient/health-summary`);
};

/* =====================
   INPUT DATA (CRUD)
===================== */
export const addBloodGlucose = async (value) => {
  return await handleFetch(`${API_URL}/patient/blood-glucose`, { 
    method: "POST", 
    body: JSON.stringify({ value }) 
  });
};

export const getBloodGlucose = async () => {
  return await handleFetch(`${API_URL}/patient/blood-glucose`);
};

export const addMedication = async (payload) => {
  return await handleFetch(`${API_URL}/patient/medications`, { 
    method: "POST", 
    body: JSON.stringify(payload) 
  });
};

export const getMedications = async () => {
  return await handleFetch(`${API_URL}/patient/medications`);
};

export const addSymptom = async (payload) => {
  return await handleFetch(`${API_URL}/patient/symptoms`, { 
    method: "POST", 
    body: JSON.stringify(payload) 
  });
};

export const getSymptoms = async () => {
  return await handleFetch(`${API_URL}/patient/symptoms`);
};