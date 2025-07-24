// umair-auth/index.js (Frontend SDK - stateless version)

const BASE_URL = "https://umair-auth-production.up.railway.app";

// 🚀 Called once to register a new project (tenant)
export async function initProject({ name, dbUrl, jwtSecret }) {
  const res = await fetch(`${BASE_URL}/initProject`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, dbUrl, jwtSecret })
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Project init failed");
  return data;
}

async function getProjectIdByName(projectName) {
  const res = await fetch(`${BASE_URL}/auth/get-project-id?name=${encodeURIComponent(projectName)}`);
  console.log("🚀 ~ getProjectIdByName ~ res:", res)
  const data = await res.json();
  console.log("🚀 ~ getProjectIdByName ~ data:", data)
  if (!res.ok || !data.projectId) throw new Error("Failed to retrieve projectId");
  return data.projectId;
}

export async function registerUser({ name, email, password, projectName }) {
  const projectId = await getProjectIdByName(projectName);
  console.log("🚀 ~ registerUser ~ projectId:", projectId)
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

export async function loginUser({ email, password, projectName }) {
  const projectId = await getProjectIdByName(projectName);
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

export async function verifySignupOtp({ email, otp, projectName }) {
  const projectId = await getProjectIdByName(projectName);
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

export async function resendSignupOtp({ email, projectName }) {
  const projectId = await getProjectIdByName(projectName);
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
