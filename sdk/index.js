const BASE_URL = "https://umair-auth-production.up.railway.app"; // or localhost during dev

// 🚀 Called once to register a new project (tenant)
export async function initProject({ name, dbUrl, jwtSecret }) {
  const res = await fetch(`${BASE_URL}/initProject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, dbUrl, jwtSecret })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Project init failed");

  console.log("✅ Project initialized with ID:", data.projectId);
  return data; // { projectId, ... }
}

// ✅ Register User (requires projectId from frontend)
export async function registerUser({ name, email, password, projectId }) {
  if (!projectId) throw new Error("Project ID is required.");
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-project-id": projectId
    },
    body: JSON.stringify({ name, email, password })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Registration failed");
  return data;
}

// ✅ Login User (requires projectId from frontend)
export async function loginUser({ email, password, projectId }) {
  if (!projectId) throw new Error("Project ID is required.");
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-project-id": projectId
    },
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Login failed");
  return data;
}

// ✅ Verify OTP (requires projectId from frontend)
export async function verifySignupOtp({ email, otp, projectId }) {
  if (!projectId) throw new Error("Project ID is required.");
  const res = await fetch(`${BASE_URL}/auth/verify-signup-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-project-id": projectId
    },
    body: JSON.stringify({ email, otp })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "OTP verification failed");
  return data;
}

// ✅ Resend OTP (requires projectId from frontend)
export async function resendSignupOtp({ email, projectId }) {
  if (!projectId) throw new Error("Project ID is required.");
  const res = await fetch(`${BASE_URL}/auth/resend-signup-otp`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-project-id": projectId
    },
    body: JSON.stringify({ email })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Resend OTP failed");
  return data;
}
