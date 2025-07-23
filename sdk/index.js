// umair-auth/index.js (Frontend SDK)

const BASE_URL = "https://umair-auth-production.up.railway.app"; // ✅ Your hosted backend URL
let cachedProjectId = null;

// 🚀 Called once to register a new project (tenant)
export async function initProject({ name, dbUrl, jwtSecret }) {
  const res = await fetch(`${BASE_URL}/initProject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, dbUrl, jwtSecret })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Project init failed");

  // Save projectId to localStorage and cache
  localStorage.setItem("umair_auth_project_id", data.projectId);
  cachedProjectId = data.projectId;

  return data;
}

function getProjectId() {
  if (cachedProjectId) return cachedProjectId;
  const pid = localStorage.getItem("umair_auth_project_id");
  if (!pid) throw new Error("Project not initialized. Call initProject() first.");
  return pid;
}

export async function registerUser({ name, email, password }) {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "projectid": getProjectId()
    },
    body: JSON.stringify({ name, email, password })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Registration failed");
  return data;
}

export async function loginUser({ email, password }) {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "projectid": getProjectId()
    },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");

  // Optionally store token for later usage
  localStorage.setItem("umair_auth_token", data.token);

  return data;
}

export async function verifySignupOtp({ email, otp }) {
  const res = await fetch(`${BASE_URL}/auth/verify-signup-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "projectid": getProjectId()
    },
    body: JSON.stringify({ email, otp })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "OTP verification failed");
  return data;
}

export async function resendSignupOtp({ email }) {
  const res = await fetch(`${BASE_URL}/auth/resend-signup-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "projectid": getProjectId()
    },
    body: JSON.stringify({ email })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Resend OTP failed");
  return data;
}
